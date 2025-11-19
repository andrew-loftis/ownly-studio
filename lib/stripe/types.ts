import type { FeatureKey } from "../pricing";

// Enhanced Stripe types for organization-based billing
export interface StripeCustomerMetadata {
  orgId: string;
  orgName: string;
  primaryContactEmail: string;
}

export interface StripeSubscriptionMetadata {
  orgId: string;
  projectId?: string;
  features: string; // JSON stringified FeatureKey[]
  plan: string;
}

export interface StripeInvoiceMetadata {
  orgId: string;
  projectId?: string;
  invoiceType: 'subscription' | 'one_time' | 'setup';
  description: string;
}

// Subscription management types
export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  description: string;
  features: FeatureKey[];
  setupPrice: number;
  monthlyPrice: number;
  stripePriceId?: string; // Pre-configured price ID in Stripe
  maxProjects?: number;
  maxTeamMembers?: number;
}

// Invoice generation types
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  amount: number; // in cents (quantity * unitPrice)
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  orgId: string;
  projectId?: string;
  description: string;
  lineItems: InvoiceLineItem[];
  dueDate?: Date;
  autoSend?: boolean;
  metadata?: Record<string, any>;
}

// Subscription status tracking
export interface SubscriptionStatus {
  active: boolean;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  features: FeatureKey[];
  plan: string;
  setupPaid: boolean;
  monthlyAmount: number; // in dollars
  nextBillingDate: Date;
}

// Usage-based billing types
export interface UsageRecord {
  orgId: string;
  feature: FeatureKey;
  quantity: number;
  timestamp: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UsageSummary {
  orgId: string;
  period: { start: Date; end: Date };
  features: Record<FeatureKey, {
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
}

// Webhook event types we handle
export type StripeWebhookEvent = 
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'invoice.created'
  | 'invoice.finalized'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed';

export interface WebhookHandler {
  event: StripeWebhookEvent;
  handler: (event: any) => Promise<void>;
}