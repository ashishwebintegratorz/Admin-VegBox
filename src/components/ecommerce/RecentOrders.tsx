import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useDashboardMetrics } from "../../hooks/useApiHooks";
import { Link } from "react-router";
import Avatar from "../ui/avatar/Avatar";

export default function RecentOrders() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const recentOrders = metrics?.recentOrders || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Items
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Amount
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
               <TableRow>
                 <td className="py-8 text-center text-gray-500" colSpan={4}>Loading...</td>
               </TableRow>
            ) : recentOrders.length === 0 ? (
               <TableRow>
                 <td className="py-8 text-center text-gray-500" colSpan={4}>No recent orders</td>
               </TableRow>
            ) : (
              recentOrders.map((order: any) => {
                const firstItem = order.items?.[0];
                const itemImage = firstItem?.product?.images?.[0] || firstItem?.product?.variants?.[firstItem.variantIndex]?.images?.[0];
                const itemName = firstItem?.product?.name || "Product";
                const moreCount = Math.max(0, (order.items?.length || 0) - 1);

                return (
                  <TableRow key={order._id} className="">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                           src={order.customer?.avatar}
                           nameForInitials={order.customer?.name}
                           alt={order.customer?.name}
                           size={40}
                        />
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.customer?.name || "Unknown User"}
                          </p>
                          <p className="text-gray-500 text-xs dark:text-gray-400 truncate w-24">
                            #{order._id.substring(order._id.length - 6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {itemImage && (
                          <div className="h-8 w-8 overflow-hidden rounded bg-gray-100 flex-shrink-0">
                            <img src={itemImage} className="h-full w-full object-cover" alt="" />
                          </div>
                        )}
                        <span className="truncate max-w-[120px]">
                          {itemName} {moreCount > 0 && `+${moreCount} more`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-gray-400">
                      ₹{order.payableAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          order.status === "delivered"
                            ? "success"
                            : order.status === "cancelled"
                            ? "error"
                            : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
