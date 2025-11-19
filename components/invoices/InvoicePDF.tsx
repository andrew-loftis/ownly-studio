import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Invoice data interface
export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  
  // Company info
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email: string;
    website: string;
    logo?: string;
  };
  
  // Client info
  client: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  
  // Project info
  project?: {
    name: string;
    description: string;
  };
  
  // Line items
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  // Totals
  subtotal: number;
  tax: number;
  total: number;
  
  // Payment info
  paymentTerms: string;
  notes?: string;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 20,
  },
  
  logo: {
    width: 120,
    height: 40,
  },
  
  companyInfo: {
    textAlign: "right",
    fontSize: 10,
    color: "#6b7280",
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  
  // Invoice details
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  
  invoiceNumber: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  
  statusBadge: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  
  // Client info
  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  
  clientInfo: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  clientLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  
  // Project info
  projectSection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  
  projectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  
  // Table
  table: {
    marginBottom: 30,
  },
  
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: "4 4 0 0",
  },
  
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
  },
  
  tableCell: {
    fontSize: 10,
    color: "#111827",
  },
  
  tableCellDescription: {
    flex: 3,
  },
  
  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
  },
  
  tableCellPrice: {
    flex: 1,
    textAlign: "right",
  },
  
  tableCellTotal: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  
  // Totals
  totalsSection: {
    alignSelf: "flex-end",
    width: 200,
    marginBottom: 30,
  },
  
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 11,
  },
  
  totalLabel: {
    color: "#6b7280",
  },
  
  totalValue: {
    color: "#111827",
    fontWeight: "bold",
  },
  
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  
  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
  },
  
  paymentTerms: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 8,
  },
  
  notes: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },
  
  thankYou: {
    textAlign: "center",
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: 20,
  },
});

// Invoice PDF Component
export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "open":
        return "#3b82f6";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {data.company.logo && (
              <Image src={data.company.logo} style={styles.logo} />
            )}
            <Text style={styles.companyName}>{data.company.name}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>{data.company.address}</Text>
            <Text>{data.company.city}, {data.company.state} {data.company.zip}</Text>
            <Text>{data.company.email}</Text>
            <Text>{data.company.website}</Text>
          </View>
        </View>

        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>
              Issued: {data.issueDate.toLocaleDateString()}
            </Text>
            <Text style={styles.invoiceNumber}>
              Due: {data.dueDate.toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) }]}>
            <Text>{data.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.clientSection}>
          <View>
            <Text style={styles.clientLabel}>Bill To:</Text>
            <Text style={styles.clientName}>{data.client.name}</Text>
            <Text style={styles.clientInfo}>{data.client.email}</Text>
            {data.client.address && (
              <>
                <Text style={styles.clientInfo}>{data.client.address}</Text>
                <Text style={styles.clientInfo}>
                  {data.client.city}, {data.client.state} {data.client.zip}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Project Information */}
        {data.project && (
          <View style={styles.projectSection}>
            <Text style={styles.projectTitle}>Project: {data.project.name}</Text>
            <Text style={styles.clientInfo}>{data.project.description}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCellDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellQuantity]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellPrice]}>
              Rate
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellTotal]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice]}>
                ${item.unitPrice.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellTotal]}>
                ${item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
          </View>
          {data.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>${data.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>${data.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.paymentTerms}>
            Payment Terms: {data.paymentTerms}
          </Text>
          {data.notes && (
            <Text style={styles.notes}>Notes: {data.notes}</Text>
          )}
          <Text style={styles.thankYou}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
};