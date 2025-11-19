"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { fetchJsonWithAuth } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";

interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "open" | "paid" | "void" | "uncollectible" | "payment_failed";
  issueDate: Date;
  dueDate: Date;
  stripeInvoiceId?: string;
  billingEmail: string;
  projectId?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface InvoiceListProps {
  orgId: string;
  projectId?: string;
}

export function InvoiceList({ orgId, projectId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [orgId, projectId, user]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ orgId });
      if (projectId) params.append("projectId", projectId);

      const data = await fetchJsonWithAuth<{ invoices: any[] }>(`/api/admin/invoices?${params}`);
      const mapped = (data.invoices || []).map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.id,
        description: inv.description || '',
        subtotal: inv.subtotal || 0,
        tax: inv.tax || 0,
        total: inv.total || 0,
        status: inv.status || 'draft',
        issueDate: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date(Date.now() + 30*24*60*60*1000),
        stripeInvoiceId: inv.stripeInvoiceId,
        billingEmail: inv.billingEmail || '',
        projectId: inv.projectId || undefined,
        lineItems: inv.lineItems || [],
      }));
      setInvoices(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "open":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "draft":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      case "void":
      case "uncollectible":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "payment_failed":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Deprecated: using fetchJsonWithAuth now
  const getIdToken = async () => ""; 

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--txt-primary)]">
          Invoices
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          Create Invoice
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--txt-secondary)] mb-4">
            No invoices found for this organization.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            Create First Invoice
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-[var(--bg-4)] rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[var(--txt-primary)]">
                    {invoice.invoiceNumber}
                  </h4>
                  <p className="text-sm text-[var(--txt-secondary)] mt-1">
                    {invoice.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                >
                  {invoice.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--txt-tertiary)]">Total</span>
                  <p className="font-medium text-[var(--txt-primary)]">
                    ${invoice.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--txt-tertiary)]">Issue Date</span>
                  <p className="text-[var(--txt-secondary)]">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--txt-tertiary)]">Due Date</span>
                  <p className="text-[var(--txt-secondary)]">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--txt-tertiary)]">Sent To</span>
                  <p className="text-[var(--txt-secondary)] truncate">
                    {invoice.billingEmail}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
                {invoice.stripeInvoiceId && (
                  <>
                    <a
                      href={`https://dashboard.stripe.com/invoices/${invoice.stripeInvoiceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        View in Stripe
                      </Button>
                    </a>
                    <Button variant="ghost" size="sm">
                      Send Invoice
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateInvoiceModal
          orgId={orgId}
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}

interface CreateInvoiceModalProps {
  orgId: string;
  projectId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateInvoiceModal({ orgId, projectId, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    lineItems: [
      { description: "", quantity: 1, unitPrice: 0 }
    ],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    autoSend: true,
  });

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index: number, field: keyof typeof formData.lineItems[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchJsonWithAuth("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          projectId,
          description: formData.description,
          lineItems: formData.lineItems.map(item => ({
            ...item,
            unitPrice: Math.round(item.unitPrice * 100),
            quantity: item.quantity,
          })),
            dueDate: formData.dueDate,
            autoSend: formData.autoSend,
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => ""; // legacy placeholder

  const total = formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--txt-primary)]">
            Create Invoice
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
              placeholder="Invoice description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Line Items
            </label>
            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
                      placeholder="Description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="w-full px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              + Add Line Item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--txt-secondary)] mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-4)] border border-white/10 rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.autoSend}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoSend: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-[var(--bg-4)] border-white/10 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-[var(--txt-secondary)]">Auto-send to client</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-[var(--txt-primary)]">
                Total: ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
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
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}