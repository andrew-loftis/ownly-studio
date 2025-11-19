import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDF, type InvoiceData } from "@/components/invoices/InvoicePDF";

/**
 * Generate PDF buffer from invoice data
 */
export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  // Simple fallback for now - return empty buffer
  // In production, implement proper PDF generation
  return Buffer.from("PDF generation not implemented", "utf-8");
}

/**
 * Create invoice data object for PDF generation
 */
export function createInvoiceData({
  invoiceDoc,
  orgData,
}: {
  invoiceDoc: any;
  orgData: any;
}): InvoiceData {
  const invoiceData = invoiceDoc.data();
  
  return {
    id: invoiceDoc.id,
    invoiceNumber: invoiceData.invoiceNumber,
    issueDate: invoiceData.issueDate.toDate(),
    dueDate: invoiceData.dueDate.toDate(),
    status: invoiceData.status,
    
    company: {
      name: "Ownly Studio",
      address: "123 Business Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      email: "hello@ownly.studio",
      website: "https://ownly.studio",
    },
    
    client: {
      name: orgData.primaryContact.name,
      email: invoiceData.billingEmail,
      address: orgData.primaryContact.address,
      city: orgData.primaryContact.city,
      state: orgData.primaryContact.state,
      zip: orgData.primaryContact.zip,
    },
    
    project: invoiceData.projectId ? {
      name: `Project for ${orgData.name}`,
      description: invoiceData.description,
    } : undefined,
    
    lineItems: invoiceData.lineItems,
    subtotal: invoiceData.subtotal,
    tax: invoiceData.tax,
    total: invoiceData.total,
    paymentTerms: "Net 30",
    notes: invoiceData.notes,
  };
}