import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import Avatar from "../components/ui/avatar/Avatar";
import { Modal } from "../components/ui/modal";

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [codInfo, setCodInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [editDriverId, setEditDriverId] = useState("");

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

  const fetchDriver = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      const codRes = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${id}/cod-estimate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const codData = await codRes.json();
      
      if (res.ok) {
        setDriver(data.driver);
        setStats(data.stats);
        if (codRes.ok) {
          setCodInfo(codData);
        }
        setEditName(data.driver.name);
        setEditPhone(data.driver.phone);
        setEditUpiId(data.driver.driverDetails?.upiId || "");
        setEditDriverId(data.driver.driverDetails?.driverId || "");
      } else {
        alert(data.message);
        navigate("/drivers");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, phone: editPhone, upiId: editUpiId, driverId: editDriverId }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchDriver();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        navigate("/drivers");
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleCOD = async () => {
    if (!window.confirm("Are you sure you want to settle the COD amount? This means you have received the cash from the driver.")) return;
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BASIC_API_URL}/drivers/${id}/settle-cod`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("COD Settled Successfully!");
        fetchDriver();
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!driver) return null;

  return (
    <>
      <PageMeta
        title={`Driver: ${driver.name} | Admin Panel`}
        description="View and manage driver details"
      />
      <PageBreadcrumb pageTitle="Driver Details" />

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header Profile Section */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={driver.avatar || undefined}
                alt={driver.name}
                nameForInitials={driver.name}
                size={80}
              />
              <span
                className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 ${
                  driver.isOnline ? "bg-emerald-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {driver.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {driver.driverDetails?.driverId || "No ID"} • {driver.phone}
              </p>
              <div className="mt-2 flex gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    driver.isOnline
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {driver.isOnline ? "Online" : "Offline"}
                </span>
                {driver.isReturning && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Returning
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              Edit Details
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Earnings
            </h3>
            <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{stats?.totalEarnings || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Completed Deliveries
            </h3>
            <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
              {stats?.totalOrders || 0}
            </p>
          </div>
        </div>

        {/* Driving License & Documents */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Documents & Verification
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">UPI ID</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {driver.driverDetails?.upiId || "Not Provided"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Driving License</p>
              {driver.driverDetails?.drivingLicense ? (
                <a 
                  href={driver.driverDetails.drivingLicense} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 inline-block hover:opacity-80 transition"
                >
                  <img
                    src={driver.driverDetails.drivingLicense}
                    alt="License"
                    className="h-32 w-48 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                </a>
              ) : (
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">No License Uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* COD Settlement Section */}
        {codInfo && codInfo.pendingOrderCount > 0 && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm dark:border-orange-900/30 dark:bg-orange-900/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-orange-800 dark:text-orange-500">
                COD Settlement Due
              </h2>
              <span className="inline-flex items-center rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-900">
                {codInfo.pendingOrderCount} Orders
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-sm border border-orange-100 dark:bg-gray-800 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total COD Collected</p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">₹{codInfo.totalCODCollected}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm border border-orange-100 dark:bg-gray-800 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver Earnings (Deducted)</p>
                <p className="mt-1 text-xl font-bold text-red-600">- ₹{codInfo.driverEarnings}</p>
              </div>
              <div className="rounded-xl bg-orange-100 p-4 shadow-sm border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                <p className="text-sm font-bold text-orange-900 dark:text-orange-400">Net Payable to Admin</p>
                <p className="mt-1 text-2xl font-black text-orange-600">₹{codInfo.netAmountToAdmin}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSettleCOD}
              >
                Mark as Settled
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-sm p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white text-center">Confirm Deletion</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete rider <strong>{driver.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            No, Cancel
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-md p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Edit Driver</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Driver ID</label>
            <input
              type="text"
              value={editDriverId}
              onChange={(e) => setEditDriverId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</label>
            <input
              type="text"
              value={editUpiId}
              onChange={(e) => setEditUpiId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate as any}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
