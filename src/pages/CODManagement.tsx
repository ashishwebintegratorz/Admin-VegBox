import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Avatar from "../components/ui/avatar/Avatar";

export default function CODManagement() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      const userData = JSON.parse(userStr);
      return userData?.data?.accessToken || userData?.data?.token || userData?.accessToken || userData?.token;
    } catch {
      return null;
    }
  };

  const fetchEstimates = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/admin/cod-estimates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Only show drivers who have a netAmountToAdmin > 0
        const pending = data.data.filter((e: any) => e.netAmountToAdmin > 0);
        setEstimates(pending);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleSettleCOD = async (driverId: string) => {
    if (!window.confirm("Are you sure you want to settle the COD amount? This means you have received the cash from the driver.")) return;
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${driverId}/settle-cod`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("COD Settled Successfully!");
        fetchEstimates(); // refresh list
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="COD Management | Admin Panel"
        description="Manage cash on delivery settlements from drivers"
      />
      <PageBreadcrumb pageTitle="COD Management" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">COD Settlements</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drivers with pending cash on delivery amounts that need to be settled.
            </p>
          </div>
          <Button variant="outline" onClick={fetchEstimates}>
            Refresh List
          </Button>
        </div>

        {estimates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">All Settled Up!</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              There are no pending COD settlements right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estimates.map((estimate) => (
              <div key={estimate.driver._id} className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm dark:border-orange-900/30 dark:bg-orange-900/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Link to={`/driver/${estimate.driver._id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                      <Avatar src={estimate.driver.avatar} nameForInitials={estimate.driver.name} size={40} />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{estimate.driver.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{estimate.driver.phone}</p>
                      </div>
                    </Link>
                    <span className="inline-flex items-center rounded-full bg-orange-200 px-2.5 py-1 text-xs font-bold text-orange-900">
                      {estimate.pendingOrderCount} Orders
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Collected</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">₹{estimate.totalCODCollected}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Driver Earnings</span>
                      <span className="font-semibold text-red-600">- ₹{estimate.driverEarnings}</span>
                    </div>
                    <div className="pt-3 border-t border-orange-200 dark:border-orange-800 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Net Payable</span>
                      <span className="text-xl font-black text-orange-600">₹{estimate.netAmountToAdmin}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  onClick={() => handleSettleCOD(estimate.driver._id)}
                >
                  Settle Cash
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
