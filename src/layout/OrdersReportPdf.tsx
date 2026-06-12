import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  headerContainer: { borderBottomWidth: 2, borderBottomColor: "#1f2937", paddingBottom: 10, marginBottom: 15, flexDirection: "row", justifyContent: "space-between" },
  brandTitle: { fontSize: 24, fontWeight: "bold", color: "#059669", marginBottom: 4 },
  reportTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937", textTransform: "uppercase" },
  summaryText: { fontSize: 10, color: "#4b5563", marginBottom: 2 },
  summaryValue: { fontWeight: "bold", color: "#111827" },
  table: { width: "100%", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#f3f4f6", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 6, paddingHorizontal: 4 },
  th: { fontSize: 9, fontWeight: "bold", color: "#374151" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 4 },
  td: { fontSize: 9, color: "#374151" },
  colId: { flex: 1.5 },
  colCust: { flex: 2 },
  colLoc: { flex: 2 },
  colAmt: { flex: 1, textAlign: "right" },
  colStat: { flex: 1, textAlign: "center" },
  colDel: { flex: 1, textAlign: "center" },
  footer: { position: "absolute", bottom: 20, left: 24, right: 24, textAlign: "center", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10 },
  footerText: { fontSize: 8, color: "#6b7280" }
});

type OrdersReportPdfProps = {
  orders: any[];
  filterType: string;
  totalAmount: number;
};

export const OrdersReportPdf: React.FC<OrdersReportPdfProps> = ({ orders, filterType, totalAmount }) => {
  const deliveredCount = orders.filter((o) => o.deliveryStatus === "delivered").length;
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandTitle}>FRESHNOW</Text>
            <Text style={styles.reportTitle}>{filterType} ORDERS REPORT</Text>
            <Text style={styles.summaryText}>Generated: {new Date().toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.summaryText, { fontSize: 12, fontWeight: "bold", marginBottom: 6 }]}>VegBox Summary</Text>
            <Text style={styles.summaryText}>Total Orders: <Text style={styles.summaryValue}>{orders.length}</Text></Text>
            <Text style={styles.summaryText}>Total Revenue: <Text style={styles.summaryValue}>Rs.{totalAmount.toLocaleString("en-IN")}</Text></Text>
            <Text style={styles.summaryText}>Delivered: <Text style={styles.summaryValue}>{deliveredCount}</Text></Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colId]}>Order Info</Text>
            <Text style={[styles.th, styles.colCust]}>Customer Info</Text>
            <Text style={[styles.th, styles.colLoc]}>Location</Text>
            <Text style={[styles.th, styles.colAmt]}>Amount</Text>
            <Text style={[styles.th, styles.colStat]}>Status</Text>
            <Text style={[styles.th, styles.colDel]}>Delivery</Text>
          </View>

          {orders.map((order, idx) => {
            const customerName = order.customer?.name || "Guest";
            const customerPhone = order.customer?.phone || "-";
            const address = order.address?.fullAddress || order.address?.street || "No Address Provided";
            const date = new Date(order.createdAt).toLocaleDateString("en-IN");
            
            return (
              <View key={order._id || idx} style={styles.tableRow}>
                <View style={styles.colId}>
                  <Text style={[styles.td, { fontWeight: "bold" }]}>#{order.orderNumber}</Text>
                  <Text style={[styles.td, { color: "#6b7280", marginTop: 2 }]}>{date}</Text>
                </View>
                <View style={styles.colCust}>
                  <Text style={[styles.td, { fontWeight: "bold" }]}>{customerName}</Text>
                  <Text style={[styles.td, { color: "#6b7280", marginTop: 2 }]}>{customerPhone}</Text>
                </View>
                <View style={styles.colLoc}>
                  <Text style={styles.td}>{address}</Text>
                </View>
                <Text style={[styles.td, styles.colAmt, { fontWeight: "bold" }]}>Rs.{order.payableAmount?.toLocaleString("en-IN")}</Text>
                <Text style={[styles.td, styles.colStat]}>{order.status?.toUpperCase() || "PENDING"}</Text>
                <Text style={[styles.td, styles.colDel]}>{order.deliveryStatus?.toUpperCase() || "PENDING"}</Text>
              </View>
            );
          })}

          {orders.length === 0 && (
            <View style={[styles.tableRow, { justifyContent: "center", paddingVertical: 20 }]}>
              <Text style={[styles.td, { fontStyle: "italic" }]}>No orders found for this period.</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a computer-generated report. FreshNow Admin Panel.</Text>
        </View>
      </Page>
    </Document>
  );
};
