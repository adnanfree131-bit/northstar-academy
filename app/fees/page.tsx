"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  DownloadSimple,
  CurrencyCircleDollar,
  Warning,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { feeInvoices as mockInvoices, type FeeStatus } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { apiGet, apiPost } from "@/lib/api";

type Invoice = {
  id: string;
  student_id?: string;
  studentId?: string;
  student_name?: string;
  studentName?: string;
  class_name?: string;
  className?: string;
  academic_year?: string;
  academicYear?: string;
  term: string;
  total_amount?: number;
  totalAmount?: number;
  paid_amount?: number;
  paidAmount?: number;
  due_date?: string;
  dueDate?: string;
  status: FeeStatus;
  late_fee?: number;
  lateFee?: number;
  discount?: number;
  discount_reason?: string;
  discountReason?: string;
  components: { id: string; name: string; amount: number; type: string }[];
};

function norm(inv: Invoice) {
  return {
    id: inv.id,
    studentName: inv.studentName || inv.student_name || "",
    className: inv.className || inv.class_name || "",
    academicYear: inv.academicYear || inv.academic_year || "",
    term: inv.term,
    totalAmount: inv.totalAmount ?? inv.total_amount ?? 0,
    paidAmount: inv.paidAmount ?? inv.paid_amount ?? 0,
    dueDate: inv.dueDate || inv.due_date || "",
    status: inv.status,
    lateFee: inv.lateFee ?? inv.late_fee ?? 0,
    discount: inv.discount ?? 0,
    discountReason: inv.discountReason || inv.discount_reason,
    components: inv.components || [],
  };
}

const statusConfig: Record<
  FeeStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" }
> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger" },
  pending: { label: "Pending", variant: "info" },
  waived: { label: "Waived", variant: "muted" },
};

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all");
  const [invoices, setInvoices] = useState(() => mockInvoices.map((i) => ({ ...i })));
  const [pay, setPay] = useState<{ id: string; balance: number; name: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [waiveLate, setWaiveLate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const rows = await apiGet<Invoice[]>("/api/fees");
    if (rows?.length) setInvoices(rows.map((r) => norm(r)) as typeof invoices);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totals = useMemo(() => {
    const outstanding = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount + inv.lateFee),
      0
    );
    const collected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    const overdueAmount = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount + inv.lateFee), 0);
    return { outstanding, collected, overdueCount, overdueAmount };
  }, [invoices]);

  async function collect() {
    if (!pay) return;
    setSaving(true);
    const res = await apiPost<{ receiptNo: string }>(`/api/fees/${pay.id}/pay`, {
      amount: Number(amount),
      method,
      waiveLate,
    });
    setSaving(false);
    if (!res.data) {
      setMessage(res.error || "Payment failed");
      return;
    }
    setMessage(`Receipt ${res.data.receiptNo}`);
    setPay(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Fees & Payments</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Collections write to D1. Overpay is rejected. Late fee can be waived.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <DownloadSimple className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => filtered[0] && setPay({ id: filtered[0].id, balance: filtered[0].totalAmount - filtered[0].paidAmount + filtered[0].lateFee, name: filtered[0].studentName })}>
            <Plus className="h-4 w-4" weight="bold" />
            Collect Payment
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Collected" value={formatCurrency(totals.collected)} icon={<CheckCircle className="h-5 w-5" weight="duotone" />} accent="emerald" />
        <StatCard label="Outstanding" value={formatCurrency(totals.outstanding)} icon={<CurrencyCircleDollar className="h-5 w-5" weight="duotone" />} accent="blue" />
        <StatCard label="Overdue Invoices" value={totals.overdueCount} icon={<Warning className="h-5 w-5" weight="duotone" />} accent="red" />
        <StatCard label="Overdue Amount" value={formatCurrency(totals.overdueAmount)} icon={<Clock className="h-5 w-5" weight="duotone" />} accent="amber" />
      </div>

      <Card padding="sm" bezel={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name or invoice ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            {(["all", "paid", "partial", "overdue", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                  statusFilter === s ? "bg-zinc-900 text-white" : "text-zinc-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((inv) => {
          const balance = inv.totalAmount - inv.paidAmount + inv.lateFee;
          const cfg = statusConfig[inv.status];
          return (
            <div key={inv.id} className="bezel">
              <div className="bezel-inner p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900">{inv.studentName}</p>
                      <Badge variant={cfg.variant} dot>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {inv.id} · {inv.className} · {inv.term} · {inv.academicYear}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {inv.components.map((c) => (
                        <span key={c.id} className="rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500 ring-1 ring-zinc-100">
                          {c.name}: {formatCurrency(c.amount)}
                        </span>
                      ))}
                      {inv.lateFee > 0 && (
                        <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] text-red-600 ring-1 ring-red-100">
                          Late fee: +{formatCurrency(inv.lateFee)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:text-right">
                    <div>
                      <p className="text-[11px] text-zinc-400">Due</p>
                      <p className="text-sm font-medium">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400">Paid</p>
                      <p className="text-sm font-medium text-emerald-600">{formatCurrency(inv.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400">Balance</p>
                      <p className="text-sm font-semibold">{balance > 0 ? formatCurrency(balance) : "—"}</p>
                    </div>
                    {inv.status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setPay({ id: inv.id, balance, name: inv.studentName });
                          setAmount(String(balance));
                          setMessage(null);
                        }}
                      >
                        Collect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Collect payment</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {pay.name} · outstanding {formatCurrency(pay.balance)}
            </p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-4 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank transfer</option>
              <option value="card">Card</option>
            </select>
            <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
              <input type="checkbox" checked={waiveLate} onChange={(e) => setWaiveLate(e.target.checked)} />
              Waive late fee
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPay(null)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={collect}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
