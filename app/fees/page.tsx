"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  Plus,
  DownloadSimple,
  CurrencyCircleDollar,
  Warning,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { feeInvoices, type FeeStatus } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";

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

  const filtered = useMemo(() => {
    return feeInvoices.filter((inv) => {
      const matchesSearch =
        inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totals = useMemo(() => {
    const outstanding = feeInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount + inv.lateFee),
      0
    );
    const collected = feeInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const overdueCount = feeInvoices.filter((i) => i.status === "overdue").length;
    const overdueAmount = feeInvoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount + inv.lateFee), 0);
    return { outstanding, collected, overdueCount, overdueAmount };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Fees & Payments</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage fee structures, invoices, collections, and concessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <DownloadSimple className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" weight="bold" />
            Collect Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Collected"
          value={formatCurrency(totals.collected)}
          icon={<CheckCircle className="h-5 w-5" weight="duotone" />}
          accent="emerald"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totals.outstanding)}
          icon={<CurrencyCircleDollar className="h-5 w-5" weight="duotone" />}
          accent="blue"
        />
        <StatCard
          label="Overdue Invoices"
          value={totals.overdueCount}
          icon={<Warning className="h-5 w-5" weight="duotone" />}
          accent="red"
        />
        <StatCard
          label="Overdue Amount"
          value={formatCurrency(totals.overdueAmount)}
          icon={<Clock className="h-5 w-5" weight="duotone" />}
          accent="amber"
        />
      </div>

      {/* Filters */}
      <Card padding="sm" bezel={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name or invoice ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            {(["all", "paid", "partial", "overdue", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  statusFilter === s
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Invoice list */}
      <div className="space-y-3">
        {filtered.map((inv) => {
          const balance = inv.totalAmount - inv.paidAmount + inv.lateFee;
          const cfg = statusConfig[inv.status];
          return (
            <div key={inv.id} className="bezel">
              <div className="bezel-inner p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-600">
                      {inv.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
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
                          <span
                            key={c.id}
                            className="rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500 ring-1 ring-zinc-100"
                          >
                            {c.name}: {formatCurrency(c.amount)}
                          </span>
                        ))}
                        {inv.discount > 0 && (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-600 ring-1 ring-emerald-100">
                            Discount: -{formatCurrency(inv.discount)}
                            {inv.discountReason ? ` (${inv.discountReason})` : ""}
                          </span>
                        )}
                        {inv.lateFee > 0 && (
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] text-red-600 ring-1 ring-red-100">
                            Late fee: +{formatCurrency(inv.lateFee)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:text-right">
                    <div>
                      <p className="text-[11px] text-zinc-400">Due Date</p>
                      <p className="text-sm font-medium text-zinc-700">{formatDate(inv.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400">Paid</p>
                      <p className="text-sm font-medium text-emerald-600">
                        {formatCurrency(inv.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400">Balance</p>
                      <p className="text-sm font-semibold text-zinc-900">
                        {balance > 0 ? formatCurrency(balance) : "—"}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {inv.status !== "paid" && (
                        <Button size="sm">Collect</Button>
                      )}
                      <Button variant="secondary" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-zinc-900">No invoices found</p>
              <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
