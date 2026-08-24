"use client";

import {
  Student,
  CurrencyCircleDollar,
  CalendarCheck,
  Warning,
  Exam,
  UserPlus,
} from "@phosphor-icons/react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dashboardStats, feeInvoices, students, exams } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const overdueInvoices = feeInvoices.filter((i) => i.status === "overdue");
  const recentStudents = students.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of Northstar Academy · Academic Year 2025-26
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            New Admission
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Students"
          value={dashboardStats.activeStudents.toLocaleString()}
          change={3.2}
          changeLabel="vs last month"
          icon={<Student className="h-5 w-5" weight="duotone" />}
          accent="blue"
        />
        <StatCard
          label="Fee Collected (Month)"
          value={formatCurrency(dashboardStats.feeCollectedThisMonth)}
          change={8.4}
          changeLabel="vs last month"
          icon={<CurrencyCircleDollar className="h-5 w-5" weight="duotone" />}
          accent="emerald"
        />
        <StatCard
          label="Avg. Attendance"
          value={`${dashboardStats.averageAttendance}%`}
          change={-1.1}
          changeLabel="vs last week"
          icon={<CalendarCheck className="h-5 w-5" weight="duotone" />}
          accent="violet"
        />
        <StatCard
          label="Overdue Invoices"
          value={dashboardStats.overdueInvoices}
          change={12}
          changeLabel="needs attention"
          icon={<Warning className="h-5 w-5" weight="duotone" />}
          accent="red"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column - 2/3 */}
        <div className="space-y-6 xl:col-span-2">
          {/* Overdue Fees */}
          <Card>
            <CardHeader
              title="Overdue Fee Invoices"
              description="Requires immediate follow-up"
              action={
                <Link href="/fees">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              }
            />
            <div className="space-y-3">
              {overdueInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-xs font-semibold text-red-600">
                      {inv.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{inv.studentName}</p>
                      <p className="text-xs text-zinc-500">
                        {inv.className} · Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatCurrency(inv.totalAmount - inv.paidAmount + inv.lateFee)}
                    </p>
                    <Badge variant="danger" dot>
                      Overdue
                    </Badge>
                  </div>
                </div>
              ))}
              {overdueInvoices.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-400">No overdue invoices</p>
              )}
            </div>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader
              title="Recent Students"
              description="Latest activity in student records"
              action={
                <Link href="/students">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              }
            />
            <div className="overflow-hidden rounded-xl border border-zinc-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Attendance</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentStudents.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                            {s.firstName[0]}
                            {s.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">{s.fullName}</p>
                            <p className="text-xs text-zinc-400">{s.admissionNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {s.className}-{s.section}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            s.status === "active"
                              ? "success"
                              : s.status === "suspended"
                              ? "danger"
                              : "muted"
                          }
                          dot
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            s.attendancePercent >= 90
                              ? "text-emerald-600"
                              : s.attendancePercent >= 80
                              ? "text-amber-600"
                              : "text-red-600"
                          }
                        >
                          {s.attendancePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {s.feeBalance > 0 ? formatCurrency(s.feeBalance) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Exams */}
          <Card>
            <CardHeader
              title="Upcoming Exams"
              action={
                <Link href="/exams">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              }
            />
            <div className="space-y-3">
              {exams
                .filter((e) => e.status === "upcoming")
                .map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Exam className="h-4 w-4 text-blue-500" weight="duotone" />
                        <p className="text-sm font-medium text-zinc-900">{exam.name}</p>
                      </div>
                      <Badge variant="info">{exam.type}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{exam.subjects.length} subjects</p>
                  </div>
                ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Mark Attendance", href: "/attendance" },
                { label: "Collect Fee", href: "/fees" },
                { label: "Add Student", href: "/students/new" },
                { label: "View Timetable", href: "/timetable" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <button className="flex h-16 w-full flex-col items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-700 transition-all duration-300 hover:border-zinc-200 hover:bg-white hover:shadow-sm active:scale-[0.98]">
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader title="System Alerts" />
            <div className="space-y-2.5">
              <div className="flex gap-3 rounded-xl bg-amber-50/80 px-3.5 py-3">
                <Warning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-amber-900">2 teacher substitutions pending</p>
                  <p className="mt-0.5 text-[11px] text-amber-700">Ms. Hina Qureshi is on leave today</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl bg-red-50/80 px-3.5 py-3">
                <Warning className="mt-0.5 h-4 w-4 shrink-0 text-red-600" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-red-900">47 overdue fee invoices</p>
                  <p className="mt-0.5 text-[11px] text-red-700">Total outstanding {formatCurrency(1240000)}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl bg-blue-50/80 px-3.5 py-3">
                <Exam className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-blue-900">Mid-Term exams start in 18 days</p>
                  <p className="mt-0.5 text-[11px] text-blue-700">Schedule published for all classes</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
