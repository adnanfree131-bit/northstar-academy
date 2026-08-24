"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ChartBar, CurrencyCircleDollar, Student, CalendarCheck } from "@phosphor-icons/react";

type Stats = {
  totalStudents: number;
  activeStudents: number;
  totalStaff: number;
  overdueInvoices: number;
  feeCollected: number;
  feeOutstanding: number;
  averageAttendance: number;
  r2Enabled: boolean;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet<Stats>("/api/stats").then(setStats);
  }, []);

  const collected = stats?.feeCollected ?? 0;
  const outstanding = stats?.feeOutstanding ?? 0;
  const total = collected + outstanding || 1;
  const collectedPct = Math.round((collected / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Live D1 metrics {stats ? "· connected" : "· waiting for API"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active students"
          value={stats?.activeStudents ?? "—"}
          icon={<Student className="h-5 w-5" weight="duotone" />}
          accent="blue"
        />
        <StatCard
          label="Collected (invoices)"
          value={stats ? formatCurrency(stats.feeCollected) : "—"}
          icon={<CurrencyCircleDollar className="h-5 w-5" weight="duotone" />}
          accent="emerald"
        />
        <StatCard
          label="Outstanding"
          value={stats ? formatCurrency(stats.feeOutstanding) : "—"}
          icon={<ChartBar className="h-5 w-5" weight="duotone" />}
          accent="amber"
        />
        <StatCard
          label="Avg attendance"
          value={stats ? `${stats.averageAttendance}%` : "—"}
          icon={<CalendarCheck className="h-5 w-5" weight="duotone" />}
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fee collection mix" description="Paid vs outstanding on seeded invoices" />
          <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${collectedPct}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-sm text-zinc-600">
            <span>Collected {collectedPct}%</span>
            <span>Overdue invoices: {stats?.overdueInvoices ?? "—"}</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Operational risk" />
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>Suspended students stay in the roster but cannot be promoted.</li>
            <li>SEN flags must propagate to exam extra-time rooms.</li>
            <li>R2 document vault: {stats?.r2Enabled ? "enabled" : "not enabled yet (enable R2 in Cloudflare)."}</li>
            <li>Staff on leave creates timetable substitution pressure.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
