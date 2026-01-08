// d:\Admin-VegBox\src\layout\InvoicePdf.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type InvoicePdfProps = {
  invoice: any;
  user: any;
  logoUrl?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyBlock: {
    maxWidth: "60%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 9,
    marginRight: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  companyText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 180,
    marginBottom: 2,
  },
  metaKey: {
    color: "#6b7280",
    fontSize: 9,
  },
  metaValue: {
    fontWeight: "bold",
    fontSize: 9,
    color: "#111827",
  },
  section: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#9ca3af",
    marginBottom: 6,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
  },
  billToRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billToName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  th: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  thDescription: {
    flex: 3,
  },
  thQty: {
    flex: 1,
    textAlign: "center",
  },
  thPrice: {
    flex: 1.5,
    textAlign: "right",
  },
  thAmount: {
    flex: 1.5,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  td: {
    fontSize: 10,
    color: "#374151",
  },
  tdDescription: {
    flex: 3,
  },
  tdQty: {
    flex: 1,
    textAlign: "center",
  },
  tdPrice: {
    flex: 1.5,
    textAlign: "right",
  },
  tdAmount: {
    flex: 1.5,
    textAlign: "right",
    fontWeight: "bold",
    color: "#111827",
  },
  itemCategory: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  totalsContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsCard: {
    width: 220,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  totalsValue: {
    fontSize: 10,
    color: "#111827",
  },
  totalsGrandRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalsGrandLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  totalsGrandValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    color: "#9ca3af",
    lineHeight: 1.4,
  },
});

export const InvoicePdf: React.FC<InvoicePdfProps> = ({ invoice: rawInvoice, user: rawUser, logoUrl }) => {
  const invoice = rawInvoice.invoice || rawInvoice;
  const user = rawUser || invoice.customer || invoice.user || {};

  const invoiceNum = invoice.invoiceNumber || invoice.invoice_number || "N/A";
  const orderNum = invoice.order?.orderNumber || invoice.orderId || "N/A";
  const totalAmt = invoice.amount ?? invoice.totals?.totalAmount ?? 0;
  const subTotal = invoice.subtotal ?? invoice.totals?.subtotal ?? totalAmt;
  const items = invoice.order?.items || invoice.items || [];
  const billing = invoice.order?.address || invoice.billingInfo || {};

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const createdDate = formatDate(invoice.date || invoice.created_at || invoice.createdAt);
  const createdTime = formatTime(invoice.date || invoice.created_at || invoice.createdAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            <View style={styles.logoRow}>
              {logoUrl ? (
                <Image src={logoUrl} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoFallback}>FN</Text>
              )}
              <Text style={styles.companyName}>VegBox</Text>
            </View>
            <Text style={[styles.companyText, { fontStyle: "italic", fontWeight: "bold" }]}>
              Freshness Delivered To Your Door
            </Text>
            <Text style={styles.companyText}>123 Fresh Lane, Market Street</Text>
            <Text style={styles.companyText}>City Center, 110001, India</Text>
            <Text style={styles.companyText}>Phone: +91 98765 43210</Text>
            <Text style={styles.companyText}>Email: billing@vegbox.com</Text>
          </View>

          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNum}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Order #</Text>
              <Text style={styles.metaValue}>{orderNum}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Order Date</Text>
              <Text style={styles.metaValue}>{createdDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Order Time</Text>
              <Text style={styles.metaValue}>{createdTime}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Status</Text>
              <Text style={styles.metaValue}>{invoice.status || "Paid"}</Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.card}>
            <View style={styles.billToRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billToName}>
                  {billing.firstName || user?.firstName || "Customer"} {billing.lastName || user?.lastName || ""}
                </Text>
                <Text style={styles.companyText}>{billing.fullAddress || billing.address || "No address provided"}</Text>
                {billing.apartment && <Text style={styles.companyText}>{billing.apartment}</Text>}
                {billing.town && (
                  <Text style={styles.companyText}>
                    {billing.town}, {billing.state} {billing.postcode}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.companyText}>Phone: {billing.phone || user?.phone || "-"}</Text>
                <Text style={styles.companyText}>Email: {user?.email || "-"}</Text>
                <Text style={styles.companyText}>Payment: {invoice.paymentMethod || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.thDescription]}>Description</Text>
              <Text style={[styles.th, styles.thQty]}>Qty</Text>
              <Text style={[styles.th, styles.thPrice]}>Unit Price</Text>
              <Text style={[styles.th, styles.thAmount]}>Amount</Text>
            </View>

            {items.map((item: any, idx: number) => {
              const name = item.name || item.resolvedName || item.productName || "Product";
              const qty = item.qty || item.quantity || 1;
              const price = item.price || 0;
              const amount = qty * price;

              return (
                <View key={idx} style={styles.tableRow}>
                  <View style={styles.tdDescription}>
                    <Text style={styles.td}>{name}</Text>
                    <Text style={styles.itemCategory}>{item.category || "Fresh Vegetable"}</Text>
                  </View>
                  <Text style={[styles.td, styles.tdQty]}>{qty}</Text>
                  <Text style={[styles.td, styles.tdPrice]}>Rs.{price.toLocaleString("en-IN")}</Text>
                  <Text style={[styles.td, styles.tdAmount]}>Rs.{amount.toLocaleString("en-IN")}</Text>
                </View>
              );
            })}
            {items.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { fontStyle: "italic", flex: 1 }]}>No items listed.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>Rs.{subTotal.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST (0%)</Text>
              <Text style={styles.totalsValue}>
                Rs.{((invoice.totals?.cgst ?? 0) + (invoice.totals?.igst ?? 0)).toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.totalsGrandRow}>
              <Text style={styles.totalsGrandLabel}>Total Amount</Text>
              <Text style={styles.totalsGrandValue}>Rs.{totalAmt.toLocaleString("en-IN")}</Text>
            </View>
          </View>
        </View>

        {/* Terms & Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions about this invoice, please contact support@vegbox.com
          </Text>
          <Text style={styles.termsText}>
            This is a computer generated invoice and does not require a physical signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
