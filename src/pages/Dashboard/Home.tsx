import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";

export default function Home() {
  const [selectedArea, setSelectedArea] = useState("All Indore");

  const indoreAreas = [
    "All Indore",
    "Laxmi Nagar",
    "Vijay Nagar",
    "Palasia",
    "Bhawarkua",
    "Rajwada",
    "Mahalakshmi Nagar"
  ];

  return (
    <>
      <PageMeta
        title="Dashboard | VegBox Admin"
        description="VegBox Admin Dashboard"
      />

      {/* Geofencing / Area Filter UI */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title-md2 font-bold text-slate-900 dark:text-white">
            Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor your business metrics and performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Delivery Zone:
          </label>
          <div className="relative z-20 bg-transparent dark:bg-slate-900">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="relative z-20 w-full appearance-none rounded-xl border border-slate-200 bg-white px-5 py-2.5 pr-12 outline-none transition focus:border-blue-500 active:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-blue-500"
            >
              {indoreAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.8"><path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="currentColor"></path></g>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
