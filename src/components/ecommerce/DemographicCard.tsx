import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useDashboardMetrics } from "../../hooks/useApiHooks";

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: metrics, isLoading } = useDashboardMetrics();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const ordersByArea = metrics?.ordersByArea || {};
  const totalOrders = metrics?.totalOrders || 1; // prevent div by zero
  
  // Convert object to array and sort by count
  const sortedAreas = Object.entries(ordersByArea)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 areas

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 transition-transform hover:scale-[1.02] duration-300">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Orders by Area
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of orders based on delivery area
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="space-y-5">
        {isLoading ? (
           <div className="animate-pulse space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>)}
           </div>
        ) : sortedAreas.length > 0 ? (
          sortedAreas.map((area, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-1/2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-xs uppercase">
                  {area.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 truncate max-w-[120px]">
                    {area.name}
                  </p>
                  <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                    {area.count} Orders
                  </p>
                </div>
              </div>

              <div className="flex items-center w-full max-w-[140px] gap-3">
                <div className="relative flex w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
                    style={{ width: `${(area.count / totalOrders) * 100}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {((area.count / totalOrders) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No area data available.</p>
        )}
      </div>
    </div>
  );
}
