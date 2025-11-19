import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { runQuery, getDocument, fs, addDocument, patchDocument } from "@/lib/server/firestoreRest";

/**
 * GET /api/admin/payments - Get payments for organization
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId');
    const status = url.searchParams.get('status'); // eventType filter
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (!orgId) return NextResponse.json({ error: 'orgId is required' }, { status: 400 });

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify org access
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = f.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const clientUids = f.clientUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid) && !clientUids.includes(decoded.uid)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build where filters for collectionGroup payment_events
    const filters: any[] = [
      { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
    ];
    if (status) {
      filters.push({ fieldFilter: { field: { fieldPath: 'eventType' }, op: 'EQUAL', value: { stringValue: status } } });
    }
    if (startDate) {
      filters.push({ fieldFilter: { field: { fieldPath: 'timestamp' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: new Date(startDate).toISOString() } } });
    }
    if (endDate) {
      filters.push({ fieldFilter: { field: { fieldPath: 'timestamp' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: new Date(endDate).toISOString() } } });
    }
    const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } };
    const structuredQuery: any = {
      from: [{ collectionGroup: 'payment_events' }],
      where,
      orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
      limit: 100,
    };
    const results = await runQuery(structuredQuery, idToken);
    interface PaymentDoc {
      id: string;
      orgId: string;
      eventType: string;
      amount: number;
      currency: string;
      method: string;
      reference: string;
      notes: string;
      stripeInvoiceId: string;
      timestamp: string | null;
      recordedBy: string;
    }
    const payments: PaymentDoc[] = results.filter((r: any) => r.document).map((r: any) => {
      const doc = r.document;
      const pf = doc.fields || {};
      const num = (x: any) => (x?.doubleValue ?? x?.integerValue ? parseFloat(x.doubleValue ?? x.integerValue) : 0);
      return {
        id: doc.name.split('/').pop(),
        orgId: pf.orgId?.stringValue || orgId,
        eventType: pf.eventType?.stringValue || 'unknown',
        amount: num(pf.amount),
        currency: pf.currency?.stringValue || 'usd',
        method: pf.method?.stringValue || '',
        reference: pf.reference?.stringValue || '',
        notes: pf.notes?.stringValue || '',
        stripeInvoiceId: pf.stripeInvoiceId?.stringValue || '',
        timestamp: pf.timestamp?.timestampValue || null,
        recordedBy: pf.recordedBy?.stringValue || '',
      };
    });

    // Invoice context (limit slice for Firestore 'in' constraint is done client-side later if needed)
  const stripeInvoiceIds = payments.filter((p: PaymentDoc) => p.stripeInvoiceId).map((p: PaymentDoc) => p.stripeInvoiceId);
    let invoices: Record<string, any> = {};
    if (stripeInvoiceIds.length) {
      // Query invoices by orgId and stripeInvoiceId individually (avoid 'in' composite limitations with REST) limited to first 10
      const limited = stripeInvoiceIds.slice(0, 10);
  const invoiceQueries = await Promise.all(limited.map(async (id: string) => {
        const q: any = {
          from: [{ collectionGroup: 'invoices' }],
          where: { compositeFilter: { op: 'AND', filters: [
            { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
            { fieldFilter: { field: { fieldPath: 'stripeInvoiceId' }, op: 'EQUAL', value: { stringValue: id } } }
          ] } },
          limit: 1,
        };
        const res = await runQuery(q, idToken);
        const docEntry = res.find((r: any) => r.document);
        if (docEntry) {
          const doc = docEntry.document;
          const fInv = doc.fields || {};
          invoices[id] = {
            id: doc.name.split('/').pop(),
            invoiceNumber: fInv.invoiceNumber?.stringValue || '',
            description: fInv.description?.stringValue || '',
          };
        }
      }));
    }

  const enhanced = payments.map((p: PaymentDoc) => ({ ...p, invoice: p.stripeInvoiceId ? invoices[p.stripeInvoiceId] || null : null }));
    return NextResponse.json({ payments: enhanced });
  } catch (e: any) {
    console.error('Payments GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

/**
 * POST /api/admin/payments - Record manual payment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, invoiceId, amount, currency = 'usd', method, reference, notes } = body;
    if (!orgId || !amount || !method) {
      return NextResponse.json({ error: 'orgId, amount, and method are required' }, { status: 400 });
    }
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = f.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const now = new Date();
    const paymentFields: any = {
      orgId: fs.string(orgId),
      eventType: fs.string('manual_payment_recorded'),
      amount: fs.number(amount),
      currency: fs.string(currency),
      method: fs.string(method),
      reference: reference ? fs.string(reference) : undefined,
      notes: notes ? fs.string(notes) : undefined,
      recordedBy: fs.string(decoded.uid),
      timestamp: fs.timestamp(now),
      stripeInvoiceId: invoiceId ? fs.string(invoiceId) : undefined,
    };
    Object.keys(paymentFields).forEach(k => paymentFields[k] === undefined && delete paymentFields[k]);
    const created = await addDocument(`orgs/${orgId}`, 'payment_events', paymentFields, idToken);
    const newId = created.name.split('/').pop();

    // Patch invoice if provided (status paid)
    if (invoiceId) {
      // invoiceId here expects internal doc id not stripe invoice id; attempt patch if found
      try {
        await patchDocument(`orgs/${orgId}/invoices/${invoiceId}`, {
          status: fs.string('paid'),
          updatedAt: fs.timestamp(now),
          paidAt: fs.timestamp(now),
          paymentMethod: fs.string(method),
          paymentReference: reference ? fs.string(reference) : undefined,
        }, idToken);
      } catch (e) {
        console.warn('Invoice patch failed (may not exist):', e);
      }
    }
    return NextResponse.json({ id: newId, message: 'Payment recorded successfully' });
  } catch (e: any) {
    console.error('Payments POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to record payment' }, { status: 500 });
  }
}