import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "../../services/invoiceService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import { useNavigate } from "react-router";
import { ChevronDown, Search } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

type InvoiceRow = {
  id: string;
  name: string;
  img?: string | null;
  customerId: string | null;
  invoiceNumber: string;
  orderId: string;
  createdDate: string;
  email: string;
  phonenumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
};

export default function InvoiceTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const { data: invoiceData, isLoading, isError, error } = useQuery({
    queryKey: ["invoices", page, limit, statusFilter],
    queryFn: () => invoiceService.getInvoices(page, limit, { 
      status: statusFilter === "all" ? undefined : statusFilter 
    }),
  });

  const invoices: InvoiceRow[] = useMemo(() => {
    // Handle both wrapped object { invoices: [] } and direct array []
    const rawList = Array.isArray(invoiceData) 
      ? invoiceData 
      : (invoiceData?.invoices || []);

    return rawList.map((inv: any) => {
      // Prioritize name from billingInfo, then user/customer object, then fallback
      const firstName = inv.billingInfo?.firstName ?? "";
      const lastName = inv.billingInfo?.lastName ?? "";
      
      const customerName = 
        `${firstName} ${lastName}`.trim() || 
        inv.customer?.firstName ||
        inv.user?.username || 
        inv.user?.email || 
        inv.customerName ||
        (inv.customer?._id ? `Cust-${inv.customer._id.slice(-6)}` : "Unknown");

      const createdDate = (inv.date || inv.created_at || inv.createdAt)
        ? new Date(inv.date || inv.created_at || inv.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";

      return {
        id: inv._id || inv.id,
        name: customerName,
        img: null,
        email: inv.userEmail ?? inv.user?.email ?? inv.customer?.email ?? "-",
        phonenumber: inv.billingInfo?.phone ?? inv.user?.phone ?? inv.customer?.phone ?? "-",
        customerId: inv.customer?._id || inv.user?.customerId || null,
        invoiceNumber: inv.invoiceNumber || inv.invoice_number || "-",
        orderId: inv.order?.orderNumber || inv.orderId || "-",
        createdDate,
        totalAmount: inv.amount ?? inv.totals?.totalAmount ?? 0,
        paymentMethod: inv.paymentMethod ?? "-",
        status: inv.status || "paid",
      };
    });
  }, [invoiceData]);

  const totalPages = invoiceData?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return invoices.filter((inv) => {
      return (
        !query ||
        inv.name.toLowerCase().includes(query) ||
        inv.email.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.orderId.toLowerCase().includes(query) ||
        (inv.customerId ?? "").toLowerCase().includes(query)
      );
    });
  }, [invoices, search]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      <div className="relative">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Invoices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage and view digital invoices for all orders.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-9 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/60 focus:border-green-500/70 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <span className="capitalize">{statusFilter === "all" ? "All Status" : statusFilter}</span>
                <ChevronDown size={16} />
              </button>
              <Dropdown
                isOpen={isStatusDropdownOpen}
                onClose={() => setIsStatusDropdownOpen(false)}
                className="w-40"
              >
                <DropdownItem onItemClick={() => { setStatusFilter("all"); setIsStatusDropdownOpen(false); }}>All Status</DropdownItem>
                <DropdownItem onItemClick={() => { setStatusFilter("paid"); setIsStatusDropdownOpen(false); }}>Paid</DropdownItem>
                <DropdownItem onItemClick={() => { setStatusFilter("pending"); setIsStatusDropdownOpen(false); }}>Pending</DropdownItem>
                <DropdownItem onItemClick={() => { setStatusFilter("failed"); setIsStatusDropdownOpen(false); }}>Failed</DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Error: {(error as any)?.message}</div>
        ) : (
          <>
            <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
              <Table>
                <TableHeader className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 text-left">Invoice / Customer</TableCell>
                    <TableCell isHeader className="px-4 py-3 text-left">Date</TableCell>
                    <TableCell isHeader className="px-4 py-3 text-left">Order ID</TableCell>
                    <TableCell isHeader className="px-4 py-3 text-right">Amount</TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center">Status</TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <TableRow 
                      key={inv.id} 
                      className="group border-b border-white/5 hover:bg-white/50 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar nameForInitials={inv.name} size={32} />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">#{inv.invoiceNumber}</span>
                            <span className="text-xs text-slate-500">{inv.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{inv.createdDate}</TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{inv.orderId}</TableCell>
                      <TableCell className="px-4 py-4 text-right text-sm font-bold text-slate-900 dark:text-slate-100">₹{inv.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          inv.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          inv.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <button 
                          onClick={() => navigate(`/invoice/${inv.id}`)}
                          className="rounded-lg bg-green-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-green-600 active:scale-95"
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-900 dark:text-slate-200">{page}</span> of {totalPages}
              </p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
