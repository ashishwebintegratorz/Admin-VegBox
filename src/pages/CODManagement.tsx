import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { driverService } from "../services/api";

export default function CODManagement() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [driverDetails, setDriverDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const res = await driverService.getAllCODEstimates();
      setEstimates(res.data.data.filter((e: any) => e.netAmountToAdmin > 0));
    } catch (error) {
      console.error("Error fetching COD estimates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleViewDetails = async (driverId: string) => {
    try {
      setLoadingDetails(true);
      setSelectedDriver(driverId);
      const res = await driverService.getDriverCODEstimate(driverId);
      setDriverDetails(res.data);
    } catch (error) {
      console.error("Error fetching driver details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSettleCOD = async (driverId: string) => {
    if (!window.confirm("Are you sure you have received the cash from this rider?")) return;
    try {
      await driverService.settleDriverCOD(driverId);
      alert("COD Settled Successfully!");
      setSelectedDriver(null);
      setDriverDetails(null);
      fetchEstimates();
    } catch (error) {
      console.error("Error settling COD:", error);
      alert("Failed to settle COD.");
    }
  };

  return (
    <>
      <PageMeta
        title="COD Management | VegBox Admin"
        description="Manage COD settlements from drivers"
      />
      <PageBreadcrumb pageTitle="COD Management" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side: List of Drivers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Pending COD Settlements
          </h3>

          {loading ? (
            <p>Loading...</p>
          ) : estimates.length === 0 ? (
            <p className="text-gray-500">No pending COD to settle.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Rider</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3 text-right">Net Amount</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((est) => (
                    <tr
                      key={est.driver?._id}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        selectedDriver === est.driver?._id ? "bg-orange-50 dark:bg-orange-900/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {est.driver?.name}
                        </div>
                        <div className="text-xs">{est.driver?.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {est.pendingOrderCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-orange-500">
                        ₹{est.netAmountToAdmin}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(est.driver?._id)}
                          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Detailed View */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Settlement Details
          </h3>

          {!selectedDriver ? (
            <div className="flex h-40 items-center justify-center text-gray-400">
              Select a rider from the list to view details
            </div>
          ) : loadingDetails ? (
            <p>Loading details...</p>
          ) : driverDetails ? (
            <div>
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <div>
                  <p className="text-sm text-gray-500">Total COD Collected</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{driverDetails.totalCODCollected}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rider Earnings</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    - ₹{driverDetails.driverEarnings}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Net Amount to Receive</p>
                  <p className="text-3xl font-bold text-orange-500">
                    ₹{driverDetails.netAmountToAdmin}
                  </p>
                </div>
              </div>

              <h4 className="mb-3 font-medium text-gray-800 dark:text-gray-200">
                Order History ({driverDetails.orders?.length || 0})
              </h4>
              
              <div className="max-h-[300px] overflow-y-auto pr-2">
                {driverDetails.orders?.map((order: any) => (
                  <div key={order._id} className="mb-3 flex items-center justify-between rounded-lg border border-gray-100 p-3 shadow-sm dark:border-gray-800">
                    <div>
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹{order.payableAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => handleSettleCOD(selectedDriver)}
                  className="w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Settle Cash Amount (₹{driverDetails.netAmountToAdmin})
                </button>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load details.</p>
          )}
        </div>
      </div>
    </>
  );
}

