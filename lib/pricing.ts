// Pricing rules (edit constants as needed)
// Core baselines (more realistic ballparks)
export const WEBSITE_SETUP = 6000;
export const WEBSITE_MONTHLY = 150;

export const WEBAPP_SETUP = 12000;
export const WEBAPP_MONTHLY = 400;

export const AI_SETUP = 3000;
export const AI_MONTHLY = 150;

export const AUTOMATIONS_SETUP = 2000;
export const AUTOMATIONS_MONTHLY = 100;

export const PAYMENTS_SETUP = 2500;
export const PAYMENTS_MONTHLY = 120;

export const CMS_SETUP = 1500;
export const CMS_MONTHLY = 80;

export const EMAIL_SETUP = 300;
export const EMAIL_MONTHLY = 15;

export type FeatureKey =
	| "website"
	| "webapp"
	| "ai"
	| "automations"
	| "payments"
	| "cms"
	| "email";

export type Features = {
	website: boolean;
	webapp: boolean;
	ai: boolean;
	automations: boolean;
	payments: boolean;
	cms: boolean;
	email: boolean;
};

export type Line = { setup: number; monthly: number };
export type Quote = { setup: number; monthly: number; breakdown: Record<FeatureKey, Line> };

export const FEATURE_LABELS: Record<FeatureKey, string> = {
	website: "Website",
	webapp: "Web App",
	ai: "AI Assistant (OpenAI)",
	automations: "Automations (Zapier)",
	payments: "Payments (Stripe)",
	cms: "CMS (Sanity/Webflow CMS)",
	email: "Email (custom domain)",
};

export const BASE_PRICES: Record<FeatureKey, Line> = {
	website: { setup: WEBSITE_SETUP, monthly: WEBSITE_MONTHLY },
	webapp: { setup: WEBAPP_SETUP, monthly: WEBAPP_MONTHLY },
	ai: { setup: AI_SETUP, monthly: AI_MONTHLY },
	automations: { setup: AUTOMATIONS_SETUP, monthly: AUTOMATIONS_MONTHLY },
	payments: { setup: PAYMENTS_SETUP, monthly: PAYMENTS_MONTHLY },
	cms: { setup: CMS_SETUP, monthly: CMS_MONTHLY },
	email: { setup: EMAIL_SETUP, monthly: EMAIL_MONTHLY },
};

// Bundle adjustments (discounts that match typical scope overlaps)
const DISCOUNT_WEBSITE_PLUS_CMS = 0.1; // 10% off Website setup when CMS included
const DISCOUNT_WEBSITE_PLUS_PAYMENTS = 0.1; // 10% off Payments setup when Website included

export function price(features: Features): Quote {
	const breakdown: Record<FeatureKey, Line> = {
		website: { setup: 0, monthly: 0 },
		webapp: { setup: 0, monthly: 0 },
		ai: { setup: 0, monthly: 0 },
		automations: { setup: 0, monthly: 0 },
		payments: { setup: 0, monthly: 0 },
		cms: { setup: 0, monthly: 0 },
		email: { setup: 0, monthly: 0 },
	};

	// Add base lines for selected features
	(Object.keys(features) as FeatureKey[]).forEach((k) => {
			if (features[k]) {
			const base = BASE_PRICES[k];
			breakdown[k] = { setup: base.setup, monthly: base.monthly };
		}
	});

		// Bundle discounts
		if (features.website && features.cms) {
			breakdown.website.setup = Math.round(breakdown.website.setup * (1 - DISCOUNT_WEBSITE_PLUS_CMS));
		}
		if (features.website && features.payments) {
			breakdown.payments.setup = Math.round(breakdown.payments.setup * (1 - DISCOUNT_WEBSITE_PLUS_PAYMENTS));
		}

	// Sum totals
	const totals = (Object.keys(breakdown) as FeatureKey[]).reduce(
		(acc, k) => {
			acc.setup += breakdown[k].setup;
			acc.monthly += breakdown[k].monthly;
			return acc;
		},
		{ setup: 0, monthly: 0 }
	);

	return { setup: totals.setup, monthly: totals.monthly, breakdown };
}

export function formatUSD(value: number): string {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
