import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

/**
 * GET /api/public/invoice/[invoiceNumber] - Get invoice by number (public access)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;
    
    // Get invoice from Firestore by invoice number
    const db = getFirestore();
    const invoicesSnapshot = await db.collection("invoices")
      .where("invoiceNumber", "==", invoiceNumber)
      .limit(1)
      .get();
    
    if (invoicesSnapshot.empty) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoiceDoc = invoicesSnapshot.docs[0];
    const invoiceData = invoiceDoc.data();
    
    // Only return invoices that are open or paid (not drafts)
    if (invoiceData.status === "draft") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get organization details for company info
    const orgDoc = await db.collection("organizations").doc(invoiceData.orgId).get();
    const orgData = orgDoc.exists ? orgDoc.data() : null;

    // Prepare public invoice data (exclude sensitive information)
    const publicInvoiceData = {
      id: invoiceDoc.id,
      invoiceNumber: invoiceData.invoiceNumber,
      description: invoiceData.description,
      lineItems: invoiceData.lineItems,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      status: invoiceData.status,
      issueDate: invoiceData.issueDate.toDate(),
      dueDate: invoiceData.dueDate.toDate(),
      billingEmail: invoiceData.billingEmail,
      
      // Company information
      company: {
        name: "Ownly Studio",
        email: "hello@ownly.studio",
        website: "https://ownly.studio",
      },
      
      // Client information (limited)
      client: {
        name: orgData?.primaryContact?.name || "Client",
        email: invoiceData.billingEmail,
      },
    };

    return NextResponse.json(publicInvoiceData);
  } catch (error: any) {
    console.error("Error fetching public invoice:", error);
    return NextResponse.json({ 
      error: "Failed to fetch invoice" 
    }, { status: 500 });
  }
}