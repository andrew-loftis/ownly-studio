"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface Payment {
  id: string;
  eventType: string;
  amount: number;
  currency: string;
  timestamp: Date;
  method?: string;
  reference?: string;
  notes?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    description: string;
  };
}

interface PaymentTrackingProps {
  orgId: string;
}

export function PaymentTracking({ orgId }: PaymentTrackingProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "succeeded" | "failed">("all");
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [orgId, filter]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ orgId });
      if (filter !== "all") {
        params.append("status", filter === "succeeded" ? "invoice_payment_succeeded" : "invoice_payment_failed");
      }

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          "Authorization": `Bearer ${await getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    // Implementation depends on your auth store
    return "";
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "invoice_payment_succeeded":
        return "Payment Received";
      case "invoice_payment_failed":
        return "Payment Failed";
      case "manual_payment_recorded":
        return "Manual Payment";
      default:
        return eventType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "invoice_payment_succeeded":
      case "manual_payment_recorded":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "invoice_payment_failed":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const totalRevenue = payments
    .filter(p => p.eventType === "invoice_payment_succeeded" || p.eventType === "manual_payment_recorded")
    .reduce((sum, p) => sum + p.amount, 0);

  const thisMonthRevenue = payments
    .filter(p => {
      const isSuccessful = p.eventType === "invoice_payment_succeeded" || p.eventType === "manual_payment_recorded";
      const isThisMonth = p.timestamp.getMonth() === new Date().getMonth() && 
                         p.timestamp.getFullYear() === new Date().getFullYear();
      return isSuccessful && isThisMonth;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--txt-primary)]">
          Payment Tracking
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowRecordModal(true)}
        >
          Record Payment
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-4)] rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">
            Total Revenue
          </div>
        </div>
        <div className="bg-[var(--bg-4)] rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            ${thisMonthRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">
            This Month
          </div>
        </div>
        <div className="bg-[var(--bg-4)] rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {payments.length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">
            Total Transactions
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-3)] rounded-lg p-1">
        {["all", "succeeded", "failed"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === filterOption
                ? "bg-[var(--bg-4)] text-[var(--txt-primary)]"
                : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--txt-secondary)] mb-4">
            No payments found for this organization.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-[var(--bg-4)] rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(payment.eventType)}`}
                    >
                      {getEventTypeLabel(payment.eventType)}
                    </span>
                    <span className="text-lg font-semibold text-[var(--txt-primary)]">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  {payment.invoice && (
                    <p className="text-sm text-[var(--txt-secondary)]">
                      Invoice #{payment.invoice.invoiceNumber} - {payment.invoice.description}
                    </p>
                  )}
                  {payment.method && (
                    <p className="text-sm text-[var(--txt-secondary)]">
                      Method: {payment.method}
                    </p>
                  )}
                  {payment.reference && (
                    <p className="text-sm text-[var(--txt-secondary)]">
                      Reference: {payment.reference}
                    </p>
                  )}
                  {payment.notes && (
                    <p className="text-sm text-[var(--txt-secondary)] mt-1">
                      {payment.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--txt-secondary)]">
                    {payment.timestamp.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-[var(--txt-tertiary)]">
                    {payment.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal
          orgId={orgId}
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => {
            setShowRecordModal(false);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}

interface RecordPaymentModalProps {
  orgId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function RecordPaymentModal({ orgId, onClose, onSuccess }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    method: "check",
    reference: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getIdToken()}`,
        },
        body: JSON.stringify({
          orgId,
          amount: parseFloat(formData.amount),
          method: formData.method,
          reference: formData.reference,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--txt-primary)]">
            Record Manual Payment
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Payment Method
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
            >
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="wire_transfer">Wire Transfer</option>
              <option value="ach">ACH Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
              placeholder="Check number, transaction ID, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}