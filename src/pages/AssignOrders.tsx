import { useNavigate } from "react-router";
import { useOrders, useUpdateOrderStatus } from "../hooks/useApiHooks";
import Avatar from "../components/ui/avatar/Avatar";

export default function AssignOrders() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const pendingOrders = orders?.filter((o: any) => o.deliveryStatus === "pending") || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Assign Orders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a pending order below to assign it to a driver.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOrders.length > 0 ? (
          pendingOrders.map((order: any) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="cursor-pointer group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-blue-500/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">#{order.orderNumber}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  {(order.scheduleDate || order.timeSlot) && (
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                      {order.scheduleDate === "Today" ? "Today" : order.scheduleDate} {order.timeSlot}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider dark:bg-amber-500/20 dark:text-amber-400">
                  {order.status || "Pending"}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Avatar
                  src={order.customer?.avatar}
                  alt={order.customer?.name}
                  nameForInitials={order.customer?.name}
                  size={36}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.customer?.name || "Guest"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{order.customer?.phone}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">₹{order.payableAmount}</span>
                <span className="text-sm font-semibold text-blue-600 group-hover:underline dark:text-blue-400">Assign Driver →</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Mark this order as Completed?")) {
                      updateStatusMutation.mutate({ orderId: order._id, status: "delivered", deliveryStatus: "delivered" });
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition"
                >
                  Complete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to Cancel this order?")) {
                      updateStatusMutation.mutate({ orderId: order._id, status: "cancelled", deliveryStatus: "cancelled" });
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-lg text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-lg font-medium text-slate-500">No pending orders to assign.</p>
          </div>
        )}
      </div>
    </div>
  );
}
