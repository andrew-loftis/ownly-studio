import Stripe from "stripe";
import { getStripe } from "../stripe";
import type { 
  StripeCustomerMetadata, 
  StripeSubscriptionMetadata, 
  CreateInvoiceRequest,
  SubscriptionStatus,
  SubscriptionPlanConfig
} from "./types";
import type { Organization } from "../types/backend";
import { FEATURE_LABELS, price, type FeatureKey } from "../pricing";

/**
 * Enhanced Stripe utilities for organization-based billing
 */

// Subscription plan configurations
export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses',
    features: ['website'],
    setupPrice: 2500, // $25.00
    monthlyPrice: 99, // $9.99
    maxProjects: 1,
    maxTeamMembers: 2,
  },
  {
    id: 'professional',
    name: 'Professional', 
    description: 'For growing businesses',
    features: ['website', 'webapp', 'cms'],
    setupPrice: 5000, // $50.00
    monthlyPrice: 299, // $29.99
    maxProjects: 5,
    maxTeamMembers: 10,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    features: ['website', 'webapp', 'ai', 'automations', 'payments', 'cms', 'email'],
    setupPrice: 10000, // $100.00
    monthlyPrice: 799, // $79.99
    maxProjects: -1, // unlimited
    maxTeamMembers: -1, // unlimited
  },
];

/**
 * Create or update a Stripe customer for an organization
 */
export async function createOrUpdateCustomer(org: Organization): Promise<string> {
  const stripe = getStripe();
  
  const customerData: Stripe.CustomerCreateParams = {
    email: org.subscription.billingEmail,
    name: org.name,
    description: `Organization: ${org.name}`,
    metadata: {
      orgId: org.id,
      orgName: org.name,
      primaryContactEmail: org.primaryContact.email,
    } satisfies StripeCustomerMetadata,
    phone: org.primaryContact.phone,
  };

  // If customer already exists, update them
  if (org.subscription.stripeCustomerId) {
    try {
      const customer = await stripe.customers.update(org.subscription.stripeCustomerId, {
        ...customerData,
        email: customerData.email, // Stripe doesn't allow email updates via API
      });
      return customer.id;
    } catch (error) {
      console.error('Error updating customer:', error);
      // If update fails, create new customer
    }
  }

  // Create new customer
  const customer = await stripe.customers.create(customerData);
  return customer.id;
}

/**
 * Create a subscription for an organization
 */
export async function createSubscription(
  org: Organization,
  features: FeatureKey[],
  priceData?: { setupPrice: number; monthlyPrice: number }
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  
  // Ensure customer exists
  const customerId = await createOrUpdateCustomer(org);
  
  // Calculate pricing
  const pricing = priceData || price(features.reduce((acc, f) => ({ ...acc, [f]: true }), {} as any));
  
  const lineItems: Stripe.SubscriptionCreateParams.Item[] = [];
  
  // Add setup fee if applicable
  if ('setup' in pricing && pricing.setup > 0) {
    // Create one-time setup price
    const setupPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: pricing.setup * 100,
      product_data: {
        name: `${org.name} - Setup Fee`,
        metadata: {
          description: `One-time setup for: ${features.map(f => FEATURE_LABELS[f]).join(', ')}`
        },
      },
    });
    
    lineItems.push({
      price: setupPrice.id,
      quantity: 1,
    });
  }
  
  // Add monthly subscription if applicable
  if ('monthly' in pricing && pricing.monthly > 0) {
    // Create monthly subscription price
    const monthlyPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: pricing.monthly * 100,
      recurring: { interval: 'month' },
      product_data: {
        name: `${org.name} - Monthly Subscription`,
        metadata: {
          description: `Monthly subscription for: ${features.map(f => FEATURE_LABELS[f]).join(', ')}`
        },
      },
    });
    
    lineItems.push({
      price: monthlyPrice.id,
      quantity: 1,
    });
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: lineItems,
    metadata: {
      orgId: org.id,
      features: JSON.stringify(features),
      plan: features.map(f => FEATURE_LABELS[f]).join(' + '),
    } satisfies StripeSubscriptionMetadata,
    collection_method: 'charge_automatically',
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

/**
 * Create a one-time invoice for a project or service
 */
export async function createInvoice(request: CreateInvoiceRequest): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  
  // Get organization to ensure customer exists
  // Note: In practice, you'd fetch this from Firestore
  // For now, we'll assume the customer exists
  
  const invoice = await stripe.invoices.create({
    customer: request.orgId, // This should be the Stripe customer ID
    description: request.description,
    metadata: {
      orgId: request.orgId,
      projectId: request.projectId || '',
      invoiceType: 'one_time',
      description: request.description,
      ...request.metadata,
    },
    auto_advance: request.autoSend ?? true,
    due_date: request.dueDate ? Math.floor(request.dueDate.getTime() / 1000) : undefined,
  });

  // Add line items
  for (const item of request.lineItems) {
    await stripe.invoiceItems.create({
      customer: request.orgId,
      invoice: invoice.id,
      description: item.description,
      quantity: item.quantity,
      amount: item.unitPrice,
      currency: 'usd',
      metadata: item.metadata,
    });
  }

  // Finalize and send if requested
  if (request.autoSend) {
    await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);
  }

  return invoice;
}

/**
 * Get subscription status for an organization
 */
export async function getSubscriptionStatus(stripeSubscriptionId: string): Promise<SubscriptionStatus> {
  const stripe = getStripe();
  
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
    expand: ['items.data.price.product']
  });

  const features = subscription.metadata.features 
    ? JSON.parse(subscription.metadata.features) as FeatureKey[]
    : [];

  return {
    active: subscription.status === 'active',
    status: subscription.status as any,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : undefined,
    features,
    plan: subscription.metadata?.plan || 'Custom',
    setupPaid: true, // Determine this based on invoice history
    monthlyAmount: (subscription as any).items?.data?.reduce((sum: number, item: any) => 
      sum + (item.price.unit_amount || 0), 0) / 100 || 0,
    nextBillingDate: new Date((subscription as any).current_period_end * 1000),
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  stripeSubscriptionId: string, 
  immediately = false
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  
  if (immediately) {
    return await stripe.subscriptions.cancel(stripeSubscriptionId);
  } else {
    // Cancel at period end
    return await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update subscription features
 */
export async function updateSubscription(
  stripeSubscriptionId: string,
  newFeatures: FeatureKey[]
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  
  // Calculate new pricing
  const pricing = price(newFeatures.reduce((acc, f) => ({ ...acc, [f]: true }), {} as any));
  
  // Create new price for the updated features
  const newPrice = await stripe.prices.create({
    currency: 'usd',
    unit_amount: pricing.monthly * 100,
    recurring: { interval: 'month' },
    product_data: {
      name: 'Updated Subscription',
      metadata: {
        description: `Updated features: ${newFeatures.map(f => FEATURE_LABELS[f]).join(', ')}`
      },
    },
  });

  // Update subscription
  return await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPrice.id,
    }],
    metadata: {
      ...subscription.metadata,
      features: JSON.stringify(newFeatures),
      plan: newFeatures.map(f => FEATURE_LABELS[f]).join(' + '),
    },
    proration_behavior: 'create_prorations',
  });
}

/**
 * Create a checkout session for organization subscription
 */
export async function createCheckoutSession(
  org: Organization,
  features: FeatureKey[],
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  
  // Ensure customer exists
  const customerId = await createOrUpdateCustomer(org);
  
  // Calculate pricing
  const pricing = price(features.reduce((acc, f) => ({ ...acc, [f]: true }), {} as any));
  
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  
  // Add setup fee if applicable
  if (pricing.setup > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        product_data: { 
          name: 'Setup Fee',
          description: `One-time setup for ${org.name}`,
        },
        unit_amount: pricing.setup * 100,
      },
    });
  }
  
  // Add monthly subscription if applicable
  if (pricing.monthly > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        product_data: { 
          name: 'Monthly Subscription',
          description: `Monthly subscription for ${org.name}`,
        },
        unit_amount: pricing.monthly * 100,
        recurring: { interval: 'month' },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      orgId: org.id,
      features: JSON.stringify(features),
      plan: features.map(f => FEATURE_LABELS[f]).join(' + '),
    } satisfies StripeSubscriptionMetadata,
  });

  return session;
}