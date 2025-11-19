import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { WebhookHandler, SubscriptionStatus } from "@/lib/stripe/types";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebaseAdmin";

/**
 * POST /api/hooks/stripe - Handle Stripe webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
      }
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const db = getAdminDb();
    
    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, db);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription, db);
        break;
        
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, db);
        break;
        
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, db);
        break;
        
      case "customer.created":
      case "customer.updated":
        await handleCustomerUpdate(event.data.object as Stripe.Customer, db);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ 
      error: error.message || "Webhook processing failed" 
    }, { status: 500 });
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription, 
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const orgId = subscription.metadata.orgId;
  
  if (!orgId) {
    console.error("No orgId in subscription metadata");
    return;
  }

  const status = mapStripeStatus(subscription.status);
  
  const subscriptionData = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    priceId: subscription.items.data[0]?.price.id,
    quantity: subscription.items.data[0]?.quantity || 1,
    updatedAt: new Date(),
  };

  // Update organization subscription
  await db.collection("organizations").doc(orgId).update({
    subscription: subscriptionData,
  });

  // Log subscription event
  await db.collection("subscription_events").add({
    orgId,
    eventType: "subscription_updated",
    stripeEventId: subscription.id,
    data: subscriptionData,
    timestamp: new Date(),
  });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(
  subscription: Stripe.Subscription, 
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const orgId = subscription.metadata.orgId;
  
  if (!orgId) {
    console.error("No orgId in subscription metadata");
    return;
  }

  // Update organization subscription status
  await db.collection("organizations").doc(orgId).update({
    "subscription.status": "canceled",
    "subscription.canceledAt": new Date(subscription.canceled_at! * 1000),
    "subscription.updatedAt": new Date(),
  });

  // Log cancellation event
  await db.collection("subscription_events").add({
    orgId,
    eventType: "subscription_canceled",
    stripeEventId: subscription.id,
    data: {
      canceledAt: new Date(subscription.canceled_at! * 1000),
      cancelReason: subscription.metadata.cancelReason || "user_requested",
    },
    timestamp: new Date(),
  });
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice, 
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const orgId = invoice.metadata?.orgId;
  
  if (!orgId) {
    // Try to get orgId from subscription
    if ((invoice as any).subscription) {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
      const fallbackOrgId = subscription.metadata.orgId;
      if (!fallbackOrgId) {
        console.error("No orgId found in invoice or subscription metadata");
        return;
      }
    } else {
      console.error("No orgId in invoice metadata and no subscription");
      return;
    }
  }

  // Update invoice status in Firestore if it exists
  const invoicesSnapshot = await db.collection("invoices")
    .where("stripeInvoiceId", "==", invoice.id)
    .get();

  for (const doc of invoicesSnapshot.docs) {
    await doc.ref.update({
      status: "paid",
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      updatedAt: new Date(),
    });
  }

  // Log payment event
  await db.collection("payment_events").add({
    orgId: orgId || invoice.metadata?.orgId,
    eventType: "invoice_payment_succeeded",
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid / 100, // Convert to dollars
    currency: invoice.currency,
    timestamp: new Date(),
  });
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice, 
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const orgId = invoice.metadata?.orgId;
  
  if (!orgId) {
    console.error("No orgId in invoice metadata");
    return;
  }

  // Update invoice status in Firestore if it exists
  const invoicesSnapshot = await db.collection("invoices")
    .where("stripeInvoiceId", "==", invoice.id)
    .get();

  for (const doc of invoicesSnapshot.docs) {
    await doc.ref.update({
      status: "payment_failed",
      updatedAt: new Date(),
    });
  }

  // Log failed payment event
  await db.collection("payment_events").add({
    orgId,
    eventType: "invoice_payment_failed",
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due / 100, // Convert to dollars
    currency: invoice.currency,
    timestamp: new Date(),
  });

  // TODO: Send notification to organization admins about failed payment
}

/**
 * Handle customer creation/update
 */
async function handleCustomerUpdate(
  customer: Stripe.Customer, 
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const orgId = customer.metadata?.orgId;
  
  if (!orgId) {
    console.error("No orgId in customer metadata");
    return;
  }

  // Update organization with customer details
  await db.collection("organizations").doc(orgId).update({
    "subscription.stripeCustomerId": customer.id,
    "subscription.billingEmail": customer.email,
    "subscription.updatedAt": new Date(),
  });
}

/**
 * Map Stripe subscription status to our internal status
 */
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "past_due";
    case "trialing":
      return "trialing";
    case "paused":
      return "paused";
    default:
      return "inactive";
  }
}