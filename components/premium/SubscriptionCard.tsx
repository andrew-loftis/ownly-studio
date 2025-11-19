"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import type { SubscriptionPlanConfig } from "@/lib/stripe/types";

type SubscriptionStatus = "active" | "inactive" | "pending" | "canceled" | "past_due" | "unpaid" | "trialing" | "paused" | "incomplete";

interface SubscriptionData {
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  priceId?: string;
  quantity?: number;
  planName?: string;
  monthlyPrice?: number;
  features?: string[];
}

interface SubscriptionCardProps {
  orgId: string;
  subscription?: SubscriptionData;
  onSubscriptionUpdate: () => void;
}

export function SubscriptionCard({ orgId, subscription, onSubscriptionUpdate }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    if (!subscription?.stripeSubscriptionId) return;
    
    const confirmed = confirm("Are you sure you want to cancel this subscription?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/subscription/${orgId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${await getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      onSubscriptionUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.stripeSubscriptionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/subscription/${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getIdToken()}`,
        },
        body: JSON.stringify({
          action: "reactivate",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      onSubscriptionUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "trialing":
        return "text-blue-400";
      case "past_due":
        return "text-yellow-400";
      case "canceled":
      case "incomplete":
        return "text-red-400";
      case "paused":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusLabel = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      case "incomplete":
        return "Incomplete";
      case "paused":
        return "Paused";
      default:
        return "Inactive";
    }
  };

  // Helper to get Firebase ID token (you'll need to implement this based on your auth setup)
  const getIdToken = async () => {
    // This should get the current user's ID token from Firebase Auth
    // Implementation depends on your auth store setup
    return ""; // Placeholder
  };

  if (!subscription) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
          Subscription
        </h3>
        <p className="text-[var(--txt-secondary)] mb-4">
          No active subscription found for this organization.
        </p>
        <Button variant="primary" size="sm">
          Create Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-[var(--txt-primary)]">
          Subscription
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
          {getStatusLabel(subscription.status)}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Plan Details */}
        <div>
          <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">Plan</h4>
          <p className="text-[var(--txt-primary)]">
            {subscription.planName || "Custom Plan"}
            {subscription.monthlyPrice && (
              <span className="text-[var(--txt-secondary)] ml-2">
                ${subscription.monthlyPrice}/month
              </span>
            )}
          </p>
        </div>

        {/* Billing Period */}
        {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
          <div>
            <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Current Period
            </h4>
            <p className="text-[var(--txt-primary)] text-sm">
              {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Trial Period */}
        {subscription.trialEnd && subscription.status === "trialing" && (
          <div>
            <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Trial Ends
            </h4>
            <p className="text-[var(--txt-primary)] text-sm">
              {new Date(subscription.trialEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Features */}
        {subscription.features && subscription.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {subscription.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[var(--bg-4)] rounded text-xs text-[var(--txt-secondary)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Warning */}
        {subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              This subscription will be canceled at the end of the current period
              ({subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString()})
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading ? "Canceling..." : "Cancel Subscription"}
            </Button>
          )}
          
          {subscription.cancelAtPeriodEnd && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleReactivateSubscription}
              disabled={loading}
            >
              {loading ? "Reactivating..." : "Reactivate"}
            </Button>
          )}

          {subscription.status === "past_due" && (
            <Button variant="primary" size="sm">
              Update Payment Method
            </Button>
          )}
        </div>

        {/* Stripe Links */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex gap-4 text-sm">
            {subscription.stripeCustomerId && (
              <a
                href={`https://dashboard.stripe.com/customers/${subscription.stripeCustomerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                View Customer
              </a>
            )}
            {subscription.stripeSubscriptionId && (
              <a
                href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                View Subscription
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}