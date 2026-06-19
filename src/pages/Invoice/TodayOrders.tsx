import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useOrders } from "../../hooks/useApiHooks";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrdersReportPdf } from "../../layout/OrdersReportPdf";

export default function TodayOrders() {
  const { data: allOrders, isLoading } = useOrders();
  const navigate = useNavigate();
  
  // Filter state
  const [filterType, setFilterType] = useState<"today" | "weekly" | "monthly">("today");

  // Filter orders based on selection
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    
    const now = new Date();
    
    return allOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      
      if (filterType === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      } else if (filterType === "weekly") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      } else if (filterType === "monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [allOrders, filterType]);

  const totalAmount = filteredOrders.reduce((sum: number, order: any) => sum + (order.payableAmount || 0), 0);

  return (
    <>
      <PageMeta
        title="Orders Report | VegBox Admin"
        description="Daily, Weekly, Monthly Orders Report"
      />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders Report</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and download PDF reports for your orders.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-5 py-2.5 outline-none transition focus:border-blue-500 active:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="today">Today's Orders</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
            </select>
            
            <PDFDownloadLink
              document={<OrdersReportPdf orders={filteredOrders} filterType={filterType} totalAmount={totalAmount} />}
              fileName={`VegBox_Orders_Report_${filterType}.pdf`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {({ loading }) => (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {loading ? "Preparing PDF..." : "Download PDF Report"}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{filteredOrders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Delivered Orders</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {filteredOrders.filter((o: any) => o.deliveryStatus === 'delivered').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Order Number</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Date & Time</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Location</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Rider Info</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Amount</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-start">Delivery</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  <TableRow>
                    <td colSpan={7} className="py-8 text-center text-slate-500">Loading orders...</td>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No orders found for this period.</td>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => {
                    const orderAddress = order.address?.fullAddress || order.address?.city || order.address?.street || 'No Address Provided';
                    
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "confirmed":
                        case "ready":
                        case "delivered":
                          return "bg-emerald-500/10 text-emerald-600 ring-emerald-500/40 dark:text-emerald-400";
                        case "pending":
                        case "preparing":
                        case "assigned":
                        case "out_for_delivery":
                          return "bg-blue-500/10 text-blue-600 ring-blue-500/40 dark:text-blue-400";
                        case "cancelled":
                        case "failed":
                          return "bg-rose-500/10 text-rose-600 ring-rose-500/40 dark:text-rose-400";
                        default:
                          return "bg-slate-500/10 text-slate-600 ring-slate-500/40 dark:text-slate-400";
                      }
                    };

                    return (
                    <TableRow 
                      key={order._id} 
                      className="group border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <TableCell className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-50">
                        #{order.orderNumber || order._id.substring(order._id.length - 6)}
                      </TableCell>
                      
                      <TableCell className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {order.customer?.name || "Guest"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {order.customer?.phone || order.address?.phone || ''}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">
                            ID: {order.customer?._id?.substring(order.customer._id.length - 6) || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px]">
                        <p className="truncate" title={orderAddress}>{orderAddress}</p>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        {order.assignedDriver ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-50">{order.assignedDriver?.name || 'Assigned'}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{order.assignedDriver?.phone || ''}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">ID: {order.assignedDriver?._id?.substring(order.assignedDriver._id.length - 6) || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
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
                         <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getStatusColor(order.deliveryStatus || 'pending')}`}>
                          {order.deliveryStatus || 'pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
