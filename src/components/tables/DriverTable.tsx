import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import { useDriversList } from "../../hooks/useApiHooks";
import Button from "../ui/button/Button";
import OnboardDriverModal from "../form/OnboardDriverModal";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { useSocket } from "../../context/SocketContext";

type DriverRow = {
  _id: string;
  name: string;
  avatar?: string | null;
  phone: string;
  isOnline: boolean;
  isReturning: boolean;
  meta?: {
    isBusy?: boolean;
  };
  driverDetails?: {
    driverId?: string;
    upiId?: string;
  };
};

export default function DriverTable() {
  const { data: apiDrivers, isLoading, error } = useDriversList();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const driversPerPage = 10;
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleDriverStatus = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    };

    socket.on("driverStatusUpdated", handleDriverStatus);

    return () => {
      socket.off("driverStatusUpdated", handleDriverStatus);
    };
  }, [socket, queryClient]);

  const displayDrivers: DriverRow[] = Array.isArray(apiDrivers) ? apiDrivers : [];

  console.log("apiDrivers in DriverTable:", apiDrivers);

  const filtered = displayDrivers.filter(
    (driver: DriverRow) =>
      (driver.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (driver.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * driversPerPage;
  const indexOfFirst = indexOfLast - driversPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / driversPerPage) || 1;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/40 backdrop-blur-xl dark:bg-slate-900/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <p className="text-red-500">Error fetching drivers: {(error as any).message || String(error)}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      <div className="relative">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Fleet Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor active drivers and delivery performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="whitespace-nowrap"
            >
              + Onboard Driver
            </Button>
          </div>
        </div>


        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 font-semibold text-start text-[10px] tracking-widest">
                  Driver Info
                </TableCell>
                <TableCell isHeader className="px-6 py-3 font-semibold text-start text-[10px] tracking-widest">
                  Payment / ID
                </TableCell>
                <TableCell isHeader className="px-6 py-3 font-semibold text-start text-[10px] tracking-widest">
                  Availability
                </TableCell>
                <TableCell isHeader className="px-6 py-3 font-semibold text-start text-[10px] tracking-widest">
                  Busy Status
                </TableCell>
                <TableCell isHeader className="px-6 py-3 font-semibold text-start text-[10px] tracking-widest">
                   Returning
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-center font-semibold text-[10px] tracking-widest">
                  System Status
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-right font-semibold text-[10px] tracking-widest">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {current.length > 0 ? (
                current.map((driver) => (
                  <TableRow
                    key={driver._id}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl transition-all duration-200"
                  >
                    <TableCell className="px-6 py-4 text-start">
                      <Link to={`/drivers/${driver._id}`} className="flex items-center gap-4 hover:opacity-80 transition">
                        <div className="relative">
                          <Avatar
                            src={driver.avatar || undefined}
                            alt={driver.name}
                            nameForInitials={driver.name}
                            size={44}
                          />
                          <span className={`absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${driver.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            {driver.name || "Unnamed Driver"}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {driver.phone}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-start">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {driver.driverDetails?.upiId || "No UPI"}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          ID: {driver.driverDetails?.driverId || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-start">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          driver.isOnline
                            ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400"
                        }`}
                      >
                        {driver.isOnline ? "Online" : "Offline"}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-start">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          driver.meta?.isBusy
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        }`}
                      >
                        {driver.meta?.isBusy ? "Busy" : "Free"}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-start">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          driver.isReturning
                            ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                            : "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400"
                        }`}
                      >
                        {driver.isReturning ? "Returning" : "No"}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ring-1 ring-inset ${
                          driver.isOnline
                            ? driver.meta?.isBusy
                              ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                            : "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${driver.isOnline ? (driver.meta?.isBusy ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-400"}`} />
                        {driver.isOnline ? (driver.meta?.isBusy ? "On Delivery" : "Ready") : "Inactive"}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <Link to={`/drivers/${driver._id}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20">
                        View / Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <span className="text-4xl opacity-20">🚚</span>
                       <p className="text-sm italic text-slate-500 dark:text-slate-400 font-medium">
                        {search ? "No drivers found for this search." : "No registered drivers yet."}
                      </p>
                    </div>
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filtered.length > driversPerPage && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-bold">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <OnboardDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Invalidate React Query cache to refresh drivers list
          queryClient.invalidateQueries({ queryKey: ["drivers"] });
        }}
      />
    </div>
  );
}
