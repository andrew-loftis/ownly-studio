import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { runQuery, getDocument, patchDocument, fs } from "@/lib/server/firestoreRest";

/**
 * GET /api/admin/invoices/[id] - Get invoice details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Find invoice by id across collectionGroup
    const results = await runQuery({ from: [{ collectionGroup: 'invoices' }], limit: 200 }, idToken);
    const match = results.find((r: any) => r.document && r.document.name.endsWith(`/invoices/${invoiceId}`));
    if (!match?.document) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const doc = match.document;
    const f = doc.fields || {};

    // Verify org access
    const orgId = f.orgId?.stringValue;
    if (!orgId) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    const of = orgDoc?.fields;
    const adminUids = of?.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = of?.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const clientUids = of?.clientUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid) && !clientUids.includes(decoded.uid)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Decode invoice
    const num = (x: any) => (x?.doubleValue ?? x?.integerValue ? parseFloat(x.doubleValue ?? x.integerValue) : 0);
    const invoice = {
      id: doc.name.split('/').pop(),
      orgId: f.orgId?.stringValue || '',
      projectId: f.projectId?.stringValue || null,
      invoiceNumber: f.invoiceNumber?.stringValue || '',
      description: f.description?.stringValue || '',
      subtotal: num(f.subtotal),
      tax: num(f.tax),
      total: num(f.total),
      status: f.status?.stringValue || 'draft',
      stripeInvoiceId: f.stripeInvoiceId?.stringValue || '',
      billingEmail: f.billingEmail?.stringValue || '',
      dueDate: f.dueDate?.timestampValue || null,
      issueDate: f.issueDate?.timestampValue || null,
      createdAt: f.createdAt?.timestampValue || null,
      updatedAt: f.updatedAt?.timestampValue || null,
      lineItems: (f.lineItems?.arrayValue?.values || []).map((v: any) => {
        const lf = v.mapValue?.fields || {};
        return {
          description: lf.description?.stringValue || '',
          quantity: num(lf.quantity),
          unitPrice: num(lf.unitPrice),
          total: num(lf.total),
        };
      }),
    } as any;

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch invoice" 
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/invoices/[id] - Update invoice
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;
    const updates = await req.json();

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Find invoice doc
    const results = await runQuery({ from: [{ collectionGroup: 'invoices' }], limit: 200 }, idToken);
    const match = results.find((r: any) => r.document && r.document.name.endsWith(`/invoices/${invoiceId}`));
    if (!match?.document) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const doc = match.document;
    const f = doc.fields || {};
    const orgId = f.orgId?.stringValue;
    if (!orgId) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Verify permissions (admin/editor)
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    const of = orgDoc?.fields;
    const adminUids = of?.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = of?.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build patch fields
    const patch: any = {};
    Object.entries(updates || {}).forEach(([k, v]) => {
      if (["id", "orgId", "createdAt", "issueDate", "stripeInvoiceId"].includes(k)) return;
      if (k === 'dueDate' && v) patch[k] = fs.timestamp(new Date(v as any));
      else if (typeof v === 'string') patch[k] = fs.string(v);
      else if (typeof v === 'number') patch[k] = fs.number(v);
      else if (typeof v === 'boolean') patch[k] = fs.bool(v);
    });
    patch.updatedAt = fs.timestamp(new Date());

    const docName = doc.name.split(`/documents/`)[1];
    await patchDocument(docName, patch, idToken);

    return NextResponse.json({ success: true, message: "Invoice updated successfully" });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update invoice" 
    }, { status: 500 });
  }
}