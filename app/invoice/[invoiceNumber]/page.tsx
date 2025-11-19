"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";
import { loadStripe } from "@stripe/stripe-js";

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
  billingEmail: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  company: {
    name: string;
    email: string;
    website: string;
  };
  client: {
    name: string;
    email: string;
  };
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function InvoicePaymentPage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/public/invoice/${invoiceNumber}`);

      if (!response.ok) {
        throw new Error("Invoice not found");
      }

      const data = await response.json();
      setInvoice({
        ...data,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;

    setPaying(true);
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/public/invoice/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout  
      window.location.href = `/api/stripe/checkout?session_id=${sessionId}`;
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "open":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "overdue":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "draft":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const isOverdue = invoice && new Date() > invoice.dueDate && invoice.status === "open";

  if (loading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Invoice Not Found
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            {error || "The requested invoice could not be found."}
          </p>
          <Button variant="primary" onClick={() => window.location.href = "https://ownly.studio"}>
            Return to Ownly Studio
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--txt-primary)] mb-2">
            Invoice #{invoice.invoiceNumber}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
            >
              {invoice.status.toUpperCase()}
            </span>
            {isOverdue && (
              <span className="px-3 py-1 rounded-full text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20">
                OVERDUE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Client Info */}
            <div className="glass-strong rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--txt-secondary)] mb-3">
                    From
                  </h3>
                  <div className="text-[var(--txt-primary)]">
                    <p className="font-semibold text-lg">{invoice.company.name}</p>
                    <p className="text-sm text-[var(--txt-secondary)]">{invoice.company.email}</p>
                    <p className="text-sm text-[var(--txt-secondary)]">{invoice.company.website}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[var(--txt-secondary)] mb-3">
                    Bill To
                  </h3>
                  <div className="text-[var(--txt-primary)]">
                    <p className="font-medium">{invoice.client.name}</p>
                    <p className="text-sm text-[var(--txt-secondary)]">{invoice.client.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--txt-secondary)]">Issue Date:</span>
                    <p className="text-[var(--txt-primary)] font-medium">
                      {invoice.issueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--txt-secondary)]">Due Date:</span>
                    <p className={`font-medium ${isOverdue ? "text-red-400" : "text-[var(--txt-primary)]"}`}>
                      {invoice.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Invoice Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-sm font-medium text-[var(--txt-secondary)]">
                        Description
                      </th>
                      <th className="text-center py-3 text-sm font-medium text-[var(--txt-secondary)]">
                        Qty
                      </th>
                      <th className="text-right py-3 text-sm font-medium text-[var(--txt-secondary)]">
                        Rate
                      </th>
                      <th className="text-right py-3 text-sm font-medium text-[var(--txt-secondary)]">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-3 text-[var(--txt-primary)]">{item.description}</td>
                        <td className="py-3 text-center text-[var(--txt-primary)]">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-[var(--txt-primary)]">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium text-[var(--txt-primary)]">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            {/* Total */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Amount Due
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--txt-secondary)]">Subtotal:</span>
                  <span className="text-[var(--txt-primary)]">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--txt-secondary)]">Tax:</span>
                    <span className="text-[var(--txt-primary)]">${invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold pt-3 border-t border-white/10">
                  <span className="text-[var(--txt-primary)]">Total:</span>
                  <span className="text-blue-400">${invoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Button */}
              {invoice.status === "open" && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={paying}
                  >
                    {paying ? "Processing..." : `Pay $${invoice.total.toFixed(2)}`}
                  </Button>
                  <p className="text-xs text-[var(--txt-tertiary)] text-center mt-2">
                    Secure payment powered by Stripe
                  </p>
                </div>
              )}

              {invoice.status === "paid" && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <span className="text-green-400 font-medium">✓ Paid in Full</span>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Actions */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Invoice Actions
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Print Invoice
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Email Invoice
                </Button>
              </div>
            </div>

            {/* Contact */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Questions?
              </h3>
              <p className="text-sm text-[var(--txt-secondary)] mb-4">
                Contact us if you have any questions about this invoice.
              </p>
              <Button variant="ghost" size="sm" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}