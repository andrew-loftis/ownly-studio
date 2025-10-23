import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
	if (!stripeClient) {
		const key = process.env.STRIPE_SECRET_KEY ?? "";
			if (!key) {
				// Create a placeholder client that will throw if used without a key
				stripeClient = new Stripe("");
			} else {
				stripeClient = new Stripe(key);
			}
	}
	return stripeClient;
}
