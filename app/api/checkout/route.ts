import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { price, FEATURE_LABELS, type Features, type FeatureKey } from "@/lib/pricing";

const featuresSchema = z.object({
  website: z.boolean(),
  webapp: z.boolean(),
  ai: z.boolean(),
  automations: z.boolean(),
  payments: z.boolean(),
  cms: z.boolean(),
  email: z.boolean(),
});

const bodySchema = z.object({
  features: featuresSchema,
  email: z.string().email().optional(),
});

function planFromFeatures(f: Features): string {
  const keys = (Object.keys(f) as FeatureKey[]).filter((k) => f[k]);
  if (keys.length === 0) return "Empty";
  return keys.map((k) => FEATURE_LABELS[k]).join(" + ");
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { features, email } = bodySchema.parse(json);

    const quote = price(features);
    if (quote.setup <= 0 && quote.monthly <= 0) {
      return NextResponse.json({ error: "No features selected" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        ...(quote.setup > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  product_data: { name: "Setup fee" },
                  unit_amount: quote.setup * 100,
                },
              } as any,
            ]
          : []),
        ...(quote.monthly > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  product_data: { name: "Subscription" },
                  unit_amount: quote.monthly * 100,
                  recurring: { interval: "month" },
                },
              } as any,
            ]
          : []),
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/build?checkout=cancel`,
      metadata: {
        plan: planFromFeatures(features),
        features: JSON.stringify(features),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Checkout error", err);
    return NextResponse.json({ error: err?.message ?? "Failed to create session" }, { status: 400 });
  }
}
