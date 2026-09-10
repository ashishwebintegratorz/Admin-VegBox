import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useDashboardMetrics } from "../../hooks/useApiHooks";

export default function EcommerceMetrics() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const customerGrowth = parseFloat(metrics?.customerGrowth || "0");
  const orderGrowth = parseFloat(metrics?.orderGrowth || "0");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-500 rounded-xl dark:bg-gray-800 dark:text-white/90">
          <GroupIcon className="size-6" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading ? "..." : metrics?.totalCustomers?.toLocaleString() || 0}
            </h4>
          </div>
          <Badge color={customerGrowth >= 0 ? "success" : "error"}>
            {customerGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(customerGrowth)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-green-50 text-green-500 rounded-xl dark:bg-gray-800 dark:text-white/90">
          <BoxIconLine className="size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading ? "..." : metrics?.totalOrders?.toLocaleString() || 0}
            </h4>
          </div>

          <Badge color={orderGrowth >= 0 ? "success" : "error"}>
            {orderGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(orderGrowth)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
