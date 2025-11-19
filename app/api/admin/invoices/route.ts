import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createInvoice } from "@/lib/stripe/utils";
import type { CreateInvoiceRequest } from "@/lib/stripe/types";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { runQuery, addDocument, fs, getDocument } from "@/lib/server/firestoreRest";

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0), // in cents
  metadata: z.record(z.string(), z.any()).optional(),
});

const createInvoiceSchema = z.object({
  orgId: z.string(),
  projectId: z.string().optional(),
  description: z.string(),
  lineItems: z.array(lineItemSchema),
  dueDate: z.string().optional(), // ISO date string
  autoSend: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/admin/invoices - Create a new invoice
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceData = createInvoiceSchema.parse(body);
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Load org via REST (orgs/{orgId})
    const orgDoc = await getDocument(`orgs/${invoiceData.orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = f.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare invoice request for Stripe (line items already in cents)
    const invoiceRequest: CreateInvoiceRequest = {
      orgId: f.subscription?.mapValue?.fields?.stripeCustomerId?.stringValue || invoiceData.orgId,
      projectId: invoiceData.projectId,
      description: invoiceData.description,
      lineItems: invoiceData.lineItems.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
      autoSend: invoiceData.autoSend ?? true,
      metadata: invoiceData.metadata,
    };

    const stripeInvoice = await createInvoice(invoiceRequest);
    const subtotal = invoiceRequest.lineItems.reduce((s, li) => s + li.amount, 0);
    const tax = 0; // TODO: tax calculation hook
    const total = subtotal + tax;

    const billingEmail = f.subscription?.mapValue?.fields?.billingEmail?.stringValue || f.primaryContact?.mapValue?.fields?.email?.stringValue || '';

    const now = new Date();
    const invoiceFields: any = {
      orgId: fs.string(invoiceData.orgId),
      projectId: invoiceData.projectId ? fs.string(invoiceData.projectId) : undefined,
      invoiceNumber: fs.string(stripeInvoice.number || `INV-${Date.now()}`),
      description: fs.string(invoiceData.description),
      lineItems: {
        arrayValue: {
          values: invoiceRequest.lineItems.map(li => ({
            mapValue: {
              fields: {
                description: fs.string(li.description),
                quantity: fs.number(li.quantity),
                unitPrice: fs.number(li.unitPrice / 100), // store dollars
                total: fs.number(li.amount / 100),
              },
            },
          })),
        },
      },
      subtotal: fs.number(subtotal / 100),
      tax: fs.number(tax / 100),
      total: fs.number(total / 100),
      status: fs.string(stripeInvoice.status || 'draft'),
      issueDate: fs.timestamp(now),
      dueDate: fs.timestamp(invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      stripeInvoiceId: fs.string(stripeInvoice.id),
      billingEmail: fs.string(billingEmail),
      sentTo: fs.array([fs.string(billingEmail)]),
      createdBy: fs.string(decoded.uid),
      createdAt: fs.timestamp(now),
      updatedAt: fs.timestamp(now),
    };
    Object.keys(invoiceFields).forEach(k => invoiceFields[k] === undefined && delete invoiceFields[k]);

    const created = await addDocument(`orgs/${invoiceData.orgId}`, 'invoices', invoiceFields, idToken);
    const newId = created.name.split('/').pop();

    return NextResponse.json({ id: newId, url: stripeInvoice.hosted_invoice_url, pdf: stripeInvoice.invoice_pdf, status: stripeInvoice.status, total: total / 100 });
  } catch (e: any) {
    console.error('Invoice POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to create invoice' }, { status: 500 });
  }
}

/**
 * GET /api/admin/invoices - List invoices for organization
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId');
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = f.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const clientUids = f.clientUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid) && !clientUids.includes(decoded.uid)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const filters: any[] = [
      { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
    ];
    if (projectId) {
      filters.push({ fieldFilter: { field: { fieldPath: 'projectId' }, op: 'EQUAL', value: { stringValue: projectId } } });
    }
    if (status) {
      filters.push({ fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: status } } });
    }
    const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } };
    const structuredQuery: any = {
      from: [{ collectionGroup: 'invoices' }],
      where,
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit: 100,
    };
    const results = await runQuery(structuredQuery, idToken);
    const invoices = results.filter((r: any) => r.document).map((r: any) => {
      const doc = r.document;
      const invFields = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        orgId: invFields.orgId?.stringValue || orgId,
        projectId: invFields.projectId?.stringValue || null,
        invoiceNumber: invFields.invoiceNumber?.stringValue || '',
        description: invFields.description?.stringValue || '',
        subtotal: invFields.subtotal?.doubleValue || invFields.subtotal?.integerValue ? parseFloat(invFields.subtotal.doubleValue || invFields.subtotal.integerValue) : 0,
        total: invFields.total?.doubleValue || invFields.total?.integerValue ? parseFloat(invFields.total.doubleValue || invFields.total.integerValue) : 0,
        status: invFields.status?.stringValue || 'draft',
        stripeInvoiceId: invFields.stripeInvoiceId?.stringValue || '',
        billingEmail: invFields.billingEmail?.stringValue || '',
        dueDate: invFields.dueDate?.timestampValue || null,
        createdAt: invFields.createdAt?.timestampValue || null,
      };
    });
    return NextResponse.json({ invoices });
  } catch (e: any) {
    console.error('Invoice GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}