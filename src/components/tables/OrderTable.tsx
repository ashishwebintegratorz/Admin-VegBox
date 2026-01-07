import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import ModalWrapper from "../../layout/ModalWrapper.tsx";
import { useOrders, useFreeDriversList, useAssignDriver, useUpdateOrderStatus } from "../../hooks/useApiHooks";

type OrderRow = {
  _id: string;
  orderNumber: string;
  customer: {
    name?: string;
    phone?: string;
    avatar?: string;
  };
  createdAt: string;
  payableAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "cancelled" | "failed";
  deliveryStatus: "pending" | "assigned" | "out_for_delivery" | "delivered" | "cancelled" | "failed";
  assignedDriver?: string | { _id: string; name: string };
};

export default function OrderTable() {
  const { data: apiOrders, isLoading: isLoadingOrders } = useOrders();
  const { data: drivers } = useFreeDriversList();
  
  const assignDriverMutation = useAssignDriver();
  const updateStatusMutation = useUpdateOrderStatus();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  const [newDriverId, setNewDriverId] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");

  const ordersPerPage = 10;

  const displayOrders: OrderRow[] = Array.isArray(apiOrders) ? apiOrders : [];

  const filtered = displayOrders.filter(
    (order: OrderRow) =>
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ordersPerPage) || 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "ready":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]";
      case "pending":
      case "preparing":
      case "assigned":
      case "out_for_delivery":
        return "bg-blue-500/10 text-blue-400 ring-blue-500/40 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]";
      case "cancelled":
      case "failed":
        return "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]";
      default:
        return "bg-slate-500/10 text-slate-400 ring-slate-500/40";
    }
  };

  const handleOpenManage = (order: OrderRow) => {
    setSelectedOrder(order);
    const drId = typeof order.assignedDriver === 'object' ? order.assignedDriver._id : order.assignedDriver || "";
    setNewDriverId(drId);
    setNewOrderStatus(order.status);
    setNewDeliveryStatus(order.deliveryStatus);
    setIsManageModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      // Get the existing driver ID from the order object
      const currentDriverId = typeof selectedOrder.assignedDriver === 'object' 
        ? selectedOrder.assignedDriver._id 
        : selectedOrder.assignedDriver || "";

      // 1. Update Driver if changed
      if (newDriverId !== currentDriverId) {
        await assignDriverMutation.mutateAsync({ 
          orderId: selectedOrder._id, 
          driverId: newDriverId 
        });
      }

      // 2. Update Status if changed
      if (newOrderStatus !== selectedOrder.status || newDeliveryStatus !== selectedOrder.deliveryStatus) {
        await updateStatusMutation.mutateAsync({
          orderId: selectedOrder._id,
          status: newOrderStatus,
          deliveryStatus: newDeliveryStatus
        });
      }

      setIsManageModalOpen(false);
    } catch (error: any) {
      console.error("Failed to update order:", error);
      const errorMessage = error?.response?.data?.message || "Error updating order. Please try again.";
      alert(errorMessage);
    }
  };

  if (isLoadingOrders) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/40 backdrop-blur-xl dark:bg-slate-900/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      <div className="relative">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Orders Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time monitoring and routing for vegetable deliveries.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Order Number
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Created At
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Payable
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-start">
                  Delivery
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-center font-semibold">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {current.length > 0 ? (
                current.map((order: OrderRow) => (
                  <TableRow
                    key={order._id}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 transition-all duration-200"
                  >
                    <TableCell className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-50">
                      #{order.orderNumber}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={order.customer?.avatar}
                          alt={order.customer?.name}
                          nameForInitials={order.customer?.name}
                          size={36}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {order.customer?.name || "Guest"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {order.customer?.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                      ₹{order.payableAmount?.toLocaleString()}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-sm">
                       <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleOpenManage(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-[1px] hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95"
                      >
                        Manage
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-3xl opacity-20">🥬</span>
                       <p className="text-sm italic text-slate-500 dark:text-slate-400">
                        {search ? "No matches found." : "No active orders."}
                      </p>
                    </div>
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filtered.length > ordersPerPage && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Manage Order Modal */}
        <ModalWrapper isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)}>
           <div className="space-y-6">
             <div className="space-y-1">
               <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Order Control Center
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Handling #{selectedOrder?.orderNumber}
              </p>
             </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Current Status
                </label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:ring-4 focus:ring-blue-500/20 dark:bg-slate-900/50 dark:text-slate-100"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Delivery Flow
                </label>
                <select
                  value={newDeliveryStatus}
                  onChange={(e) => setNewDeliveryStatus(e.target.value)}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:ring-4 focus:ring-blue-500/20 dark:bg-slate-900/50 dark:text-slate-100"
                >
                  <option value="pending">Not Assigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Assign to Fleet
                </label>
                <select
                  value={newDriverId}
                  onChange={(e) => setNewDriverId(e.target.value)}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:ring-4 focus:ring-blue-500/20 dark:bg-slate-900/50 dark:text-slate-100"
                >
                  <option value="">Choose Driver...</option>
                  {drivers?.map((driver: any) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} • {driver.isOnline ? (driver.isBusy ? "Busy" : "Ready") : "Offline"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
               <button
                onClick={() => setIsManageModalOpen(false)}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={assignDriverMutation.isPending || updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/50 active:scale-95 disabled:opacity-50"
              >
                {(assignDriverMutation.isPending || updateStatusMutation.isPending) && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                Commit Updates
              </button>
            </div>
           </div>
        </ModalWrapper>
      </div>
    </div>
  );
}
