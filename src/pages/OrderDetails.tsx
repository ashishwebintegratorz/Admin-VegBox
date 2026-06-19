import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useOrder, useDriversList, useAssignDriver, useUpdateOrderStatus } from "../hooks/useApiHooks";
import Avatar from "../components/ui/avatar/Avatar";
import Button from "../components/ui/button/Button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePdf } from "../layout/InvoicePdf";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(id || "");
  const { data: drivers, isLoading: isDriversLoading } = useDriversList();
  const assignDriverMutation = useAssignDriver();
  const updateStatusMutation = useUpdateOrderStatus();
  const mapOrderToInvoice = (ord: any) => {
    if (!ord) return {};
    return {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}-ORD-${ord.orderNumber || ord._id.substring(ord._id.length-6)}`,
      orderId: ord.orderNumber || ord._id,
      amount: ord.payableAmount,
      subtotal: ord.payableAmount,
      totals: {
        totalAmount: ord.payableAmount,
        subtotal: ord.payableAmount,
        cgst: 0,
        igst: 0
      },
      date: ord.createdAt,
      status: ord.status,
      paymentMethod: ord.paymentMethod || "cod",
      billingInfo: {
        firstName: ord.customer?.name || "Guest",
        lastName: "",
        fullAddress: ord.address?.fullAddress || ord.address?.street || "No Address Provided",
        town: ord.address?.city,
        state: ord.address?.state,
        postcode: ord.address?.zipCode || ord.address?.postalCode,
        phone: ord.customer?.phone || ord.address?.phone || "-",
      },
      customer: {
         ...ord.customer,
         email: ord.customer?.email || "-"
      },
      items: ord.items?.map((item: any) => ({
        name: item.product?.name || item.name || "Product",
        category: item.product?.category?.name || "Fresh Vegetable",
        qty: item.quantity || item.qty || 1,
        price: item.price || 0
      })) || []
    };
  };

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  useEffect(() => {
    if (order?.assignedDriver) {
      const driverId = typeof order.assignedDriver === "object" ? order.assignedDriver._id : order.assignedDriver;
      setSelectedDriverId(driverId);
    }
  }, [order]);

  const handleAssign = async () => {
    if (!id || !selectedDriverId) return;
    try {
      await assignDriverMutation.mutateAsync({ orderId: id, driverId: selectedDriverId });
      alert("Driver assigned successfully!");
      navigate("/drivers/assign");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to assign driver.");
    }
  };

  const handleStatusChange = async (type: "status" | "deliveryStatus", value: string) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({
        orderId: id,
        status: type === "status" ? value : undefined,
        deliveryStatus: type === "deliveryStatus" ? value : undefined,
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update status.");
    }
  };

  if (isOrderLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-500">Order Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
            {new Date(order.createdAt).toLocaleString()}
          </p>
          {(order.scheduleDate || order.timeSlot) && (
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-10 mt-1">
              Delivery: {order.scheduleDate === "Today" ? "Today" : order.scheduleDate} {order.timeSlot}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {order && (
              <PDFDownloadLink
                document={<InvoicePdf invoice={mapOrderToInvoice(order)} user={order.customer} />}
                fileName={`Invoice_${order.orderNumber || order._id}.pdf`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                {({ loading }) => (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {loading ? "Generating..." : "Download Invoice"}
                  </>
                )}
              </PDFDownloadLink>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange("status", e.target.value)}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 uppercase tracking-wider appearance-none cursor-pointer border-none outline-none ring-0 focus:ring-0 text-center"
            >
              <option value="pending">PENDING</option>
              <option value="confirmed">CONFIRMED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
            <select
              value={order.deliveryStatus}
              onChange={(e) => handleStatusChange("deliveryStatus", e.target.value)}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 uppercase tracking-wider appearance-none cursor-pointer border-none outline-none ring-0 focus:ring-0 text-center"
            >
              <option value="pending">PENDING</option>
              <option value="assigned">ASSIGNED</option>
              <option value="out_for_delivery">OUT FOR DELIVERY</option>
              <option value="delivered">DELIVERED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer & Order Details Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Customer Details</h2>
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                src={order.customer?.avatar}
                alt={order.customer?.name}
                nameForInitials={order.customer?.name}
                size={48}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{order.customer?.name || "Guest User"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{order.customer?.phone || order.address?.phone || "No phone"}</p>
              </div>
            </div>
            {order.address && (
              <div className="space-y-1 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Address</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {order.address.fullAddress || `${order.address.street || ""}, ${order.address.city || ""} ${order.address.zipCode || ""}`}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => {
                const imgUrl = item.product?.variants?.[item.variantIndex || 0]?.images?.[0] || item.product?.images?.[0];
                return (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">?</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name || item.product?.name || "Product"}</p>
                    <p className="text-slate-500 text-xs">Qty: {item.qty || item.quantity}</p>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-right">
                    ₹{(item.price * (item.qty || item.quantity)).toFixed(2)}
                  </div>
                </div>
              )})}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{order.payableAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rider Selection Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assign Rider</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select an available rider to assign this order.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {isDriversLoading ? (
                <div className="flex justify-center p-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" /></div>
              ) : drivers?.length > 0 ? (
                drivers.map((driver: any) => (
                  <label
                    key={driver._id}
                    className={`flex items-center justify-between cursor-pointer p-4 rounded-xl border transition-all ${
                      selectedDriverId === driver._id
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="driverSelection"
                        value={driver._id}
                        checked={selectedDriverId === driver._id}
                        onChange={() => setSelectedDriverId(driver._id)}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                        selectedDriverId === driver._id
                          ? "border-blue-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {selectedDriverId === driver._id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={driver.avatar}
                          alt={driver.name}
                          nameForInitials={driver.name}
                          size={40}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {driver.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {driver.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        driver.isOnline 
                          ? driver.isBusy 
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {driver.isOnline ? (driver.isBusy ? "Busy" : "Ready") : "Offline"}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-500">No riders available.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={handleAssign}
                disabled={!selectedDriverId || assignDriverMutation.isPending}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {assignDriverMutation.isPending ? "Assigning..." : "Proceed & Assign Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        {order && (
          <PDFDownloadLink
            document={<InvoicePdf invoice={mapOrderToInvoice(order)} user={order.customer} />}
            fileName={`Invoice_${order.orderNumber || order._id}.pdf`}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/30 transition"
          >
             {/* @ts-ignore */}
            {({ loading }) => (loading ? "Generating PDF..." : "Download Invoice (PDF)")}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}
