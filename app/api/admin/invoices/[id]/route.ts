import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get invoice from Firestore
    const db = getFirestore();
    const invoiceDoc = await db.collection("invoices").doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data()!;
    
    // Get organization and verify access
    const orgDoc = await db.collection("organizations").doc(invoiceData.orgId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgData = orgDoc.data()!;
    if (!orgData?.adminUids?.includes(userId) && 
        !orgData?.editorUids?.includes(userId) && 
        !orgData?.clientUids?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      id: invoiceDoc.id,
      ...invoiceData,
    });
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

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get invoice from Firestore
    const db = getFirestore();
    const invoiceDoc = await db.collection("invoices").doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data()!;
    
    // Get organization and verify access
    const orgDoc = await db.collection("organizations").doc(invoiceData.orgId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgData = orgDoc.data()!;
    if (!orgData?.adminUids?.includes(userId) && !orgData?.editorUids?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update invoice
    await invoiceDoc.ref.update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      message: "Invoice updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update invoice" 
    }, { status: 500 });
  }
}