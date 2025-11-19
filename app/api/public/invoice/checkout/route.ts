import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/public/invoice/checkout - Create Stripe checkout session for invoice payment
 */
export async function POST(req: NextRequest) {
  try {
    const { invoiceNumber } = await req.json();
    
    if (!invoiceNumber) {
      return NextResponse.json({ error: "Invoice number is required" }, { status: 400 });
    }

    // Get invoice from Firestore
    const db = getAdminDb();
    const invoicesSnapshot = await db.collection("invoices")
      .where("invoiceNumber", "==", invoiceNumber)
      .limit(1)
      .get();
    
    if (invoicesSnapshot.empty) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoiceDoc = invoicesSnapshot.docs[0];
    const invoiceData = invoiceDoc.data();
    
    // Only allow payment for open invoices
    if (invoiceData.status !== "open") {
      return NextResponse.json({ 
        error: "Invoice is not available for payment" 
      }, { status: 400 });
    }

    // Get organization details
    const orgDoc = await db.collection("organizations").doc(invoiceData.orgId).get();
    const orgData = orgDoc.exists ? orgDoc.data() : null;

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: invoiceData.lineItems.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      customer_email: invoiceData.billingEmail,
      success_url: `${req.headers.get("origin")}/invoice/${invoiceNumber}/success`,
      cancel_url: `${req.headers.get("origin")}/invoice/${invoiceNumber}`,
      metadata: {
        invoiceId: invoiceDoc.id,
        invoiceNumber: invoiceData.invoiceNumber,
        orgId: invoiceData.orgId,
        paymentType: "invoice",
      },
      // Add invoice PDF as attachment if available
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Payment for Invoice ${invoiceData.invoiceNumber}`,
          custom_fields: [
            {
              name: "Invoice Number",
              value: invoiceData.invoiceNumber,
            },
          ],
          metadata: {
            invoiceId: invoiceDoc.id,
            orgId: invoiceData.orgId,
          },
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create payment session" 
    }, { status: 500 });
  }
}