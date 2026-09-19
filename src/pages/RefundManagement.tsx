import React, { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { refundService } from "../services/api";

export default function RefundManagement() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    try {
      const res = await refundService.getRefunds();
      setRefunds(res.data);
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleProcessRefund = async (id: string) => {
    if (!window.confirm("Are you sure you want to mark this refund as processed?")) return;
    try {
      await refundService.processRefund(id);
      fetchRefunds(); // refresh list
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund");
    }
  };

  return (
    <>
      <PageMeta
        title="Refunds | VegBox Admin"
        description="Manage order refunds for online payments"
      />
      <PageBreadcrumb pageTitle="Refunds" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Refund Requests (Online Payments Only)
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No refunds found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((refund) => (
                    <tr
                      key={refund._id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {refund.order?.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        {refund.customer?.name} ({refund.customer?.phone})
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-500">
                        ₹{refund.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            refund.status === "processed"
                              ? "bg-green-100 text-green-700"
                              : refund.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {refund.status === "pending" ? (
                          <button
                            onClick={() => handleProcessRefund(refund._id)}
                            className="rounded bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                          >
                            Process
                          </button>
                        ) : (
                          <span className="text-gray-400">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
