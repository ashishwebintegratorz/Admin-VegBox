import React from "react";
import PageMeta from "../components/common/PageMeta";
import { useAdminUsers, useBlockUser, useSettings, useUpdateSetting } from "../hooks/useApiHooks";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import Avatar from "../components/ui/avatar/Avatar";

export default function Users() {
  const { data: users, isLoading } = useAdminUsers();
  const blockUserMutation = useBlockUser();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettingMutation = useUpdateSetting();

  const isCodEnabled = settings?.COD_ENABLED !== false; // default true if undefined

  const handleToggleCod = () => {
    updateSettingMutation.mutate({ key: "COD_ENABLED", value: !isCodEnabled });
  };

  const handleBlockUser = (userId: string) => {
    if (window.confirm("Are you sure you want to change the block status of this user?")) {
      blockUserMutation.mutate(userId);
    }
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="User Management | VegBox Admin" description="Manage users, view stats, and toggle COD." />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View user stats and block malicious accounts.</p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Enable/Disable COD for all users</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isCodEnabled}
                onChange={handleToggleCod}
                disabled={updateSettingMutation.isPending}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">User</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Contact</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-center">Total Orders</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-center">Total Spent</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-center">Status</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-right">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow key={user._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} nameForInitials={user.name || "Guest"} size={36} />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name || "Guest"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {user._id.substring(user._id.length - 6)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.phone}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email || "No Email"}</p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-xs">
                        {user.totalOrders}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{user.totalSpent?.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.isBlocked 
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleBlockUser(user._id)}
                        disabled={blockUserMutation.isPending}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          user.isBlocked
                            ? "bg-emerald-600 text-white hover:bg-emerald-500"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block User"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
