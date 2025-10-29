import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

// Secrets configured via: firebase functions:secrets:set NAME
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

let inited = false;
function initIfNeeded() {
  if (inited) return;
  try {
    admin.initializeApp();
  } catch {}
  inited = true;
}

export const stripeWebhook = onRequest({
  region: "us-central1",
  secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
  cors: ["*"]
}, async (req, res) => {
  initIfNeeded();

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const signature = req.header("stripe-signature");
  const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
  if (!signature || !webhookSecret) {
    return res.status(400).send("Missing signature or secret");
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value(), { apiVersion: "2024-06-20" });
    // rawBody is available in v2 onRequest
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err?.message);
    return res.status(400).send("Invalid signature");
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
          const user = await admin.auth().getUserByEmail(email);
          uid = user.uid;
        } catch {
          // user may not exist yet
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
      await admin.firestore().collection("subscriptions").doc(docId).set(payload, { merge: true });
    }
  } catch (err) {
    console.error("Webhook handler failed", err);
    return res.status(500).send("Webhook handler error");
  }

  return res.status(200).send("OK");
});
