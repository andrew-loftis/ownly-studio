// Pricing rules (edit constants as needed)
export const WEBSITE_SETUP = 4000;
export const WEBSITE_MONTHLY = 150;

export const WEBAPP_SETUP = 8000;
export const WEBAPP_MONTHLY = 350;

export const AI_SETUP = 2000;
export const AI_MONTHLY = 200;

export const AUTOMATIONS_SETUP = 1500;
export const AUTOMATIONS_MONTHLY = 150;

export const PAYMENTS_SETUP = 1500;
export const PAYMENTS_MONTHLY = 100;

export const CMS_SETUP = 1200;
export const CMS_MONTHLY = 120;

export const EMAIL_SETUP = 600;
export const EMAIL_MONTHLY = 40;

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

// Synergy: if webapp + ai, add +10% setup on those two lines only
const SYNERGY_PERCENT_WEBAPP_AI = 0.1; // 10%

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

	// Apply synergy only if both are on
	if (features.webapp && features.ai) {
		breakdown.webapp.setup = Math.round(breakdown.webapp.setup * (1 + SYNERGY_PERCENT_WEBAPP_AI));
		breakdown.ai.setup = Math.round(breakdown.ai.setup * (1 + SYNERGY_PERCENT_WEBAPP_AI));
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
