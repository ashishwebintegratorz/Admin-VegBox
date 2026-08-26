/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { Modal } from "../components/ui/modal";
import { useUsersList, useBroadcastNotification, useBroadcastCoupon, useProducts, useCoupons, useUpdateCoupon, useDeleteCoupon, useNotifications, useUpdateNotification, useDeleteNotification } from "../hooks/useApiHooks";

export default function NotificationsCoupons() {
  const [activeTab, setActiveTab] = useState<"notification" | "coupon" | "manage_coupons" | "manage_notifications">("notification");
  
  // Coupon Management State
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Notification Management State
  const [editingNotif, setEditingNotif] = useState<any>(null);
  // Target State
  const [targetGroup, setTargetGroup] = useState<"ALL_USERS" | "ALL_DRIVERS" | "SPECIFIC_USERS" | "SPECIFIC_DRIVERS">("ALL_USERS");
  const [targetUsers, setTargetUsers] = useState<string[]>([]);

  // Notification State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [couponSubject, setCouponSubject] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponImageFile, setCouponImageFile] = useState<File | null>(null);
  const [applicableProducts, setApplicableProducts] = useState<string[]>([]);

  // Derived type for getUsersList
  const userFetchType = targetGroup === "SPECIFIC_USERS" ? "user" : targetGroup === "SPECIFIC_DRIVERS" ? "driver" : undefined;
  
  // Fetch Data
  const { data: usersData, isLoading: usersLoading } = useUsersList(userFetchType);
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 1000 });

  // Mutations
  const notifMutation = useBroadcastNotification();
  const couponMutation = useBroadcastCoupon();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  
  const { data: notifsData, isLoading: notifsLoading } = useNotifications();
  const updateNotifMutation = useUpdateNotification();
  const deleteNotifMutation = useDeleteNotification();

  const handleUserToggle = (id: string) => {
    setTargetUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleProductToggle = (id: string) => {
    setApplicableProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", subject);
    formData.append("message", message);
    
    // Convert targetGroup to backend enum (SPECIFIC_USERS/DRIVERS -> SPECIFIC)
    const backendTargetGroup = targetGroup.startsWith("SPECIFIC") ? "SPECIFIC" : targetGroup;
    formData.append("targetGroup", backendTargetGroup);
    
    if (backendTargetGroup === "SPECIFIC") {
      formData.append("targetUsers", JSON.stringify(targetUsers));
    }
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    notifMutation.mutate(formData, {
      onSuccess: () => {
        alert("Notification broadcasted successfully!");
        setSubject("");
        setMessage("");
        setImageFile(null);
        setTargetUsers([]);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || "Error broadcasting notification");
      },
    });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("code", couponCode);
    formData.append("discountType", discountType);
    formData.append("discountValue", discountValue.toString());
    formData.append("title", couponSubject);
    formData.append("message", couponMessage);
    
    const backendTargetGroup = targetGroup.startsWith("SPECIFIC") ? "SPECIFIC" : targetGroup;
    formData.append("targetGroup", backendTargetGroup);
    
    if (backendTargetGroup === "SPECIFIC") {
      formData.append("targetUsers", JSON.stringify(targetUsers));
    }
    
    if (applicableProducts.length > 0) {
      formData.append("applicableProducts", JSON.stringify(applicableProducts));
    }
    
    if (couponImageFile) {
      formData.append("image", couponImageFile);
    }

    couponMutation.mutate(formData, {
      onSuccess: () => {
        alert("Coupon created and broadcasted successfully!");
        setCouponCode("");
        setDiscountValue(0);
        setCouponSubject("");
        setCouponMessage("");
        setCouponImageFile(null);
        setApplicableProducts([]);
        setTargetUsers([]);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || "Error broadcasting coupon");
      },
    });
  };

  const renderUserSelection = () => {
    if (!targetGroup.startsWith("SPECIFIC")) return null;
    if (usersLoading) return <p className="text-sm text-gray-500">Loading list...</p>;

    const users = Array.isArray(usersData) ? usersData : [];
    
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Select {targetGroup === "SPECIFIC_USERS" ? "Users" : "Riders"}
        </label>
        <div className="h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((u: any) => (
            <label key={u._id} className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={targetUsers.includes(u._id)}
                onChange={() => handleUserToggle(u._id)}
                className="w-4 h-4 mt-1 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
              />
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-500">{u.phone}</div>
                </div>
                {targetGroup === "SPECIFIC_USERS" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="block text-gray-400">Total Orders</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{u.totalOrders || 0}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Cancelled</span>
                      <span className="font-semibold text-red-500">{u.cancelledOrders || 0}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Total Spent</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{u.totalSpent || 0}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Refund Amount</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">₹{u.refundAmount || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="block text-gray-400">Total Delivery</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{u.totalDelivery || 0}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Cancelled</span>
                      <span className="font-semibold text-red-500">{u.cancelledDelivery || 0}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Total Received</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{u.totalReceived || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          ))}
          {users.length === 0 && <p className="p-3 text-sm text-gray-500">No records found.</p>}
        </div>
        <p className="text-xs text-gray-500 mt-1">{targetUsers.length} selected</p>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Notifications & Coupons"
        description="Broadcast notifications and create coupons"
      />
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Notifications & Coupons
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send messages or promotional coupons to your users and riders.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("notification")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notification"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Send Notification
          </button>
          <button
            onClick={() => setActiveTab("coupon")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "coupon"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Create & Broadcast Coupon
          </button>
          <button
            onClick={() => setActiveTab("manage_coupons")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manage_coupons"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Manage Coupons
          </button>
          <button
            onClick={() => setActiveTab("manage_notifications")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manage_notifications"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Manage Notifications
          </button>
        </div>

        <div className="p-6">
          {activeTab === "manage_coupons" && (
            <div className="space-y-6 max-w-5xl">
              {couponsLoading ? (
                <p className="text-sm text-gray-500">Loading coupons...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Code</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Discount</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Usage</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {couponsData?.map((coupon: any) => (
                        <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-800 dark:text-gray-200">{coupon.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            {coupon.image ? (
                              <img src={coupon.image} alt="Coupon" className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {`${coupon.discountValue} ${coupon.discountType === 'percent' ? '%' : 'Fixed'}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {coupon.usedBy?.length || 0} times
                          </td>
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to ${coupon.active ? 'disable' : 'enable'} this coupon?`)) {
                                  updateCouponMutation.mutate({ id: coupon._id, data: { active: !coupon.active } });
                                }
                              }}
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {coupon.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm space-x-2">
    <button onClick={() => { setEditingCoupon(coupon); }} className="text-blue-600 hover:underline mr-2">Edit</button>
    <button onClick={() => {
      if (window.confirm("Delete this coupon permanently?")) {
        deleteCouponMutation.mutate(coupon._id);
      }
    }} className="text-red-600 hover:underline">Delete</button>
  </td>
                        </tr>
                      ))}
                      {(!couponsData || couponsData.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No coupons found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          
          {activeTab === "manage_notifications" && (
            <div className="space-y-6 max-w-5xl">
              {notifsLoading ? (
                <p className="text-sm text-gray-500">Loading notifications...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Title</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Message</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Audience</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifsData?.map((notif: any) => (
                        <tr key={notif._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            {notif.image ? (
                              <img src={notif.image} alt="Notification" className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                            {notif.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {notif.body}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {notif.targetGroup}
                          </td>
                          <td className="px-4 py-3 text-sm space-x-2">
                            <button onClick={() => { setEditingNotif(notif); }} className="text-blue-600 hover:underline mr-2">Edit</button>
                            <button onClick={() => {
                              if (window.confirm("Delete this notification permanently?")) {
                                deleteNotifMutation.mutate(notif._id);
                              }
                            }} className="text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {(!notifsData || notifsData.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No notifications found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Edit Notification Modal */}
          <Modal isOpen={!!editingNotif} onClose={() => setEditingNotif(null)} className="max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Notification</h2>
            {editingNotif && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateNotifMutation.mutate({ id: editingNotif._id, data: formData }, {
                  onSuccess: () => setEditingNotif(null)
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input name="title" defaultValue={editingNotif.title} className="w-full rounded border border-gray-300 p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea name="message" defaultValue={editingNotif.body} className="w-full rounded border border-gray-300 p-2" required rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image (leave empty to keep current)</label>
                  <input type="file" name="image" accept="image/*" className="w-full" />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setEditingNotif(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" disabled={updateNotifMutation.isPending} className="px-4 py-2 bg-emerald-500 text-white rounded">Save Changes</button>
                </div>
              </form>
            )}
          </Modal>

          {/* Edit Coupon Modal */}
          <Modal isOpen={!!editingCoupon} onClose={() => setEditingCoupon(null)} className="max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Coupon</h2>
            {editingCoupon && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateCouponMutation.mutate({ id: editingCoupon._id, data: formData }, {
                  onSuccess: () => setEditingCoupon(null)
                });
              }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <input name="code" defaultValue={editingCoupon.code} className="w-full rounded border border-gray-300 p-2" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                    <select name="discountType" defaultValue={editingCoupon.discountType} className="w-full rounded border border-gray-300 p-2">
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                    <input type="number" name="discountValue" defaultValue={editingCoupon.discountValue} className="w-full rounded border border-gray-300 p-2" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Title</label>
                  <input name="title" defaultValue={editingCoupon.title} className="w-full rounded border border-gray-300 p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Message</label>
                  <textarea name="message" defaultValue={editingCoupon.message} className="w-full rounded border border-gray-300 p-2" required rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image (leave empty to keep current)</label>
                  <input type="file" name="image" accept="image/*" className="w-full" />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" disabled={updateCouponMutation.isPending} className="px-4 py-2 bg-emerald-500 text-white rounded">Save Changes</button>
                </div>
              </form>
            )}
          </Modal>

          {activeTab === "notification" && (
            <form onSubmit={handleSendNotification} className="space-y-6 max-w-4xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Target Audience</label>
                <select
                  value={targetGroup}
                  onChange={(e) => {
                    setTargetGroup(e.target.value as any);
                    setTargetUsers([]);
                  }}
                  className="w-full md:w-1/2 rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                >
                  <option value="ALL_USERS">All Users</option>
                  <option value="ALL_DRIVERS">All Riders</option>
                  <option value="SPECIFIC_USERS">Specific Users</option>
                  <option value="SPECIFIC_DRIVERS">Specific Riders</option>
                </select>
                {renderUserSelection()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Welcome Back to Fresh Now!"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Message *</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Enter the notification content..."
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Image Upload (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setImageFile)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <button
                type="submit"
                disabled={notifMutation.isPending}
                className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {notifMutation.isPending ? "Broadcasting..." : "Send Notification"}
              </button>
            </form>
          )}
          {activeTab === "coupon" && (
            <form onSubmit={handleCreateCoupon} className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Target Audience</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => {
                      setTargetGroup(e.target.value as any);
                      setTargetUsers([]);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                  >
                    <option value="ALL_USERS">All Users</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g., FRESH20"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {renderUserSelection()}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Select Valid Vegetables / Fruits</label>
                {productsLoading ? (
                  <p className="text-sm text-gray-500">Loading products...</p>
                ) : (
                  <div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                    {productsData?.products?.map((p: any) => (
                      <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applicableProducts.includes(p._id)}
                          onChange={() => handleProductToggle(p._id)}
                          className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        {p.images && p.images[0] && (
                          <img src={p.images[0].url} alt={p.name} className="w-8 h-8 rounded-md object-cover" />
                        )}
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">₹{p.price}</span>
                      </label>
                    ))}
                    {(!productsData?.products || productsData.products.length === 0) && (
                      <p className="text-sm text-gray-500 p-2">No products found.</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{applicableProducts.length} products selected. (Leave empty if applicable to all)</p>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Notification Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={couponSubject}
                  onChange={(e) => setCouponSubject(e.target.value)}
                  placeholder="e.g., Flat 20% OFF on Fresh Veggies!"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Message *</label>
                <textarea
                  required
                  value={couponMessage}
                  onChange={(e) => setCouponMessage(e.target.value)}
                  rows={3}
                  placeholder="Describe the coupon offer..."
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Image Upload (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setCouponImageFile)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <button
                type="submit"
                disabled={couponMutation.isPending}
                className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {couponMutation.isPending ? "Broadcasting..." : "Create & Send Coupon"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
