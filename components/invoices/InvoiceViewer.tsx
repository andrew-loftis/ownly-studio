"use client";

import React, { useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import Button from "@/components/ui/Button";
import { InvoicePDF, type InvoiceData } from "./InvoicePDF";

interface InvoiceViewerProps {
  invoice: InvoiceData;
  showPreview?: boolean;
  allowDownload?: boolean;
  allowSend?: boolean;
}

export function InvoiceViewer({ 
  invoice, 
  showPreview = true, 
  allowDownload = true,
  allowSend = true 
}: InvoiceViewerProps) {
  const [previewMode, setPreviewMode] = useState<"pdf" | "details">("details");
  const [sendingInvoice, setSendingInvoice] = useState(false);

  const handleSendInvoice = async () => {
    setSendingInvoice(true);
    try {
      // Implementation for sending invoice
      const response = await fetch(`/api/admin/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send invoice");
      }

      alert("Invoice sent successfully!");
    } catch (error: any) {
      alert(`Error sending invoice: ${error.message}`);
    } finally {
      setSendingInvoice(false);
    }
  };

  const getIdToken = async () => {
    // Implementation depends on your auth store
    return "";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--txt-primary)]">
            Invoice #{invoice.invoiceNumber}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
            >
              {invoice.status.toUpperCase()}
            </span>
            <span className="text-sm text-[var(--txt-secondary)]">
              Due {invoice.dueDate.toLocaleDateString()}
            </span>
            <span className="text-sm text-[var(--txt-secondary)]">
              ${invoice.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {showPreview && (
            <div className="flex bg-[var(--bg-3)] rounded-lg p-1">
              <button
                onClick={() => setPreviewMode("details")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === "details"
                    ? "bg-[var(--bg-4)] text-[var(--txt-primary)]"
                    : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setPreviewMode("pdf")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === "pdf"
                    ? "bg-[var(--bg-4)] text-[var(--txt-primary)]"
                    : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
                }`}
              >
                PDF Preview
              </button>
            </div>
          )}

          {allowSend && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendInvoice}
              disabled={sendingInvoice}
            >
              {sendingInvoice ? "Sending..." : "Send Invoice"}
            </Button>
          )}

          {allowDownload && (
            <PDFDownloadLink
              document={<InvoicePDF data={invoice} />}
              fileName={`invoice-${invoice.invoiceNumber}.pdf`}
            >
              {({ loading }) => (
                <Button variant="primary" size="sm" disabled={loading}>
                  {loading ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Content */}
      {previewMode === "pdf" ? (
        <div className="glass-strong rounded-2xl p-6">
          <div className="h-[800px] w-full">
            <PDFViewer width="100%" height="100%">
              <InvoicePDF data={invoice} />
            </PDFViewer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Project Info */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
                    Bill To
                  </h4>
                  <div className="text-[var(--txt-primary)]">
                    <p className="font-medium">{invoice.client.name}</p>
                    <p className="text-sm text-[var(--txt-secondary)]">{invoice.client.email}</p>
                    {invoice.client.address && (
                      <>
                        <p className="text-sm text-[var(--txt-secondary)]">{invoice.client.address}</p>
                        <p className="text-sm text-[var(--txt-secondary)]">
                          {invoice.client.city}, {invoice.client.state} {invoice.client.zip}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
                    Invoice Info
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--txt-secondary)]">Issue Date:</span>
                      <span className="text-[var(--txt-primary)]">
                        {invoice.issueDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--txt-secondary)]">Due Date:</span>
                      <span className="text-[var(--txt-primary)]">
                        {invoice.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--txt-secondary)]">Terms:</span>
                      <span className="text-[var(--txt-primary)]">{invoice.paymentTerms}</span>
                    </div>
                  </div>
                </div>
              </div>

              {invoice.project && (
                <div className="mt-6 p-4 bg-[var(--bg-4)] rounded-lg">
                  <h4 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
                    Project
                  </h4>
                  <p className="font-medium text-[var(--txt-primary)]">{invoice.project.name}</p>
                  <p className="text-sm text-[var(--txt-secondary)] mt-1">
                    {invoice.project.description}
                  </p>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Line Items
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

            {/* Notes */}
            {invoice.notes && (
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                  Notes
                </h3>
                <p className="text-[var(--txt-secondary)]">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Totals */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Summary
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
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-white/10">
                  <span className="text-[var(--txt-primary)]">Total:</span>
                  <span className="text-blue-400">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Payment Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--txt-secondary)]">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                {invoice.status === "open" && (
                  <div className="mt-4">
                    <Button variant="primary" size="sm" className="w-full">
                      View Payment Link
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Duplicate Invoice
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Edit Invoice
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Mark as Paid
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-400">
                  Void Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}