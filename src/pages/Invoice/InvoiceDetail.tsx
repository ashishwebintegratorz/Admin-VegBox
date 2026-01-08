import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "../../services/invoiceService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { pdf } from "@react-pdf/renderer";
import { InvoicePdf } from "../../layout/InvoicePdf";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoiceById(id!),
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      setDownloading(true);
      const doc = <InvoicePdf invoice={invoice} user={user} logoUrl="https://res.cloudinary.com/dlue6gvhz/image/upload/v1767858418/fresh_now_bksj4s.jpg" />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoiceNum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!invoice) return;
    try {
      const doc = <InvoicePdf invoice={invoice} user={user} logoUrl="https://res.cloudinary.com/dlue6gvhz/image/upload/v1767858418/fresh_now_bksj4s.jpg" />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (err) {
      console.error("Error printing PDF:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <PageBreadcrumb pageTitle="Invoice Detail" />
        <div className="h-[600px] w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Invoice Detail" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Failed to load invoice details. Please try again.
        </div>
      </div>
    );
  }

  // Handle both wrapped { invoice: {...}, user: {...} } and direct invoice object
  const invoice = data.invoice || data;
  const user = data.user || invoice.customer || invoice.user || {};

  const invoiceNum = invoice.invoiceNumber || invoice.invoice_number || "N/A";
  const orderNum = invoice.order?.orderNumber || invoice.orderId || "N/A";
  const totalAmt = invoice.amount ?? invoice.totals?.totalAmount ?? 0;
  const subTotal = invoice.subtotal ?? invoice.totals?.subtotal ?? totalAmt;
  const items = invoice.order?.items || invoice.items || [];
  const billing = invoice.order?.address || invoice.billingInfo || {};

  return (
    <>
      <PageMeta 
        title={`Invoice ${invoiceNum} | VegBox Admin`} 
        description={`View details for invoice ${invoiceNum}`}
      />
      <PageBreadcrumb pageTitle="Invoice Detail" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/invoice")}
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-600 dark:text-slate-400"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-600 active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Printer size={18} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src="https://res.cloudinary.com/dlue6gvhz/image/upload/v1767858418/fresh_now_bksj4s.jpg" alt="freshnow" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-green-600">Fresh Now</span>
            </div>
            <div className="text-sm text-slate-500 space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 italic">Freshness Delivered To Your Door</p>
              <p>123 Fresh Lane, Market Street</p>
              <p>City Center, 110001</p>
              <p>+91 98765 43210</p>
              <p>billing@freshnow.com</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400">Invoice</h1>
            <p className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-100">#{invoiceNum}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>Date: <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(invoice.date || invoice.created_at || invoice.createdAt || Date.now()).toLocaleDateString()}</span></p>
              <p>Order ID: <span className="font-medium text-slate-900 dark:text-slate-100">{orderNum}</span></p>
              <p>Status: <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">{invoice.status || "Paid"}</span></p>
            </div>
          </div>
        </div>

        <div className="my-10 grid gap-8 border-y border-slate-100 py-10 md:grid-cols-2 dark:border-slate-800">
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Bill To</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {billing.firstName || user?.firstName || "Customer"} {billing.lastName || user?.lastName || ""}
              </p>
              <p>{billing.fullAddress || billing.address || "Address not provided"}</p>
              {billing.apartment && <p>{billing.apartment}</p>}
              {billing.town && (
                <p>{billing.town}, {billing.state} - {billing.postcode}</p>
              )}
              <p>Phone: {billing.phone || user?.phone || "-"}</p>
              <p>Email: {user?.email || "-"}</p>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Payment Summary</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p>Method: <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">{invoice.paymentMethod}</span></p>
              <p>Transaction ID: <span className="font-bold text-slate-900 dark:text-slate-100">{invoice.paymentDetails?.transactionId || "N/A"}</span></p>
              <p>Time: <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(invoice.date || invoice.created_at || invoice.createdAt || Date.now()).toLocaleTimeString()}</span></p>
            </div>
          </div>
        </div>

        <div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
                <th className="pb-4">Description</th>
                <th className="pb-4 text-center">Qty</th>
                <th className="pb-4 text-right">Price</th>
                <th className="pb-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-6 min-w-[200px]">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.name || item.resolvedName || item.productName || "Product"}</p>
                    <p className="text-xs text-slate-400">{item.category || "Fresh Vegetable"}</p>
                  </td>
                  <td className="py-6 text-center text-sm text-slate-600 dark:text-slate-300">{item.qty || item.quantity || 1}</td>
                  <td className="py-6 text-right text-sm text-slate-600 dark:text-slate-300">₹{(item.price || 0).toLocaleString()}</td>
                  <td className="py-6 text-right font-bold text-slate-900 dark:text-slate-100">₹{((item.qty || item.quantity || 1) * (item.price || 0)).toLocaleString()}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="py-6 text-slate-500 italic" colSpan={4}>No items listed in this invoice.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col items-end gap-4">
          <div className="w-full max-w-[300px] space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">₹{subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (0%)</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">₹{((invoice.totals?.cgst ?? 0) + (invoice.totals?.igst ?? 0)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold dark:border-slate-800">
              <span className="text-slate-900 dark:text-slate-100">Total Amount</span>
              <span className="text-green-600">₹{totalAmt.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-xs font-medium text-slate-400">If you have any questions about this invoice, please contact support@freshnow.com</p>
          <div className="mt-4 flex justify-center gap-4">
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className="h-1 w-1 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </>
  );
}
