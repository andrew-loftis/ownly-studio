import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic"; // ensure edge caching doesn't interfere

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new NextResponse("Missing signature or secret", { status: 400 });
  }

  let event;
  try {
    const body = await req.text(); // raw body required
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Webhook signature verification failed.", err?.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email: string | undefined = session.customer_details?.email || session.customer_email || session.metadata?.email;
      const plan: string | undefined = session.metadata?.plan;
      const subscriptionId: string | undefined = session.subscription || session.metadata?.subscriptionId;

      let uid: string | undefined;
      if (email) {
        try {
          const adminAuth = getAdminAuth();
          const user = await adminAuth.getUserByEmail(email);
          uid = user.uid;
        } catch (e) {
          // user might not exist yet; leave uid undefined
        }
      }

      const payload = {
        uid: uid ?? null,
        email: email ?? null,
        plan: plan ?? "Unknown",
        setupPaid: true,
        subscriptionActive: true,
        subscriptionId: subscriptionId ?? null,
        sessionId: session.id,
        timestamp: Date.now(),
      };

  const docId = uid ?? session.id;
  const adminDb = getAdminDb();
  await adminDb.collection("subscriptions").doc(docId).set(payload, { merge: true });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Webhook handler failed", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
