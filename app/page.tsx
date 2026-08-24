"use client";

import { useEffect, useState } from "react";
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
import {
  dashboardStats,
  feeInvoices,
  students as mockStudents,
  exams as mockExams,
  type Student as StudentType,
  type Exam as ExamType,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Stats = {
  activeStudents: number;
  feeCollected: number;
  feeOutstanding: number;
  averageAttendance: number;
  overdueInvoices: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    activeStudents: dashboardStats.activeStudents,
    feeCollected: dashboardStats.feeCollectedThisMonth,
    feeOutstanding: dashboardStats.feeOutstanding,
    averageAttendance: dashboardStats.averageAttendance,
    overdueInvoices: dashboardStats.overdueInvoices,
  });
  const [overdueInvoices, setOverdue] = useState(feeInvoices.filter((i) => i.status === "overdue"));
  const [recentStudents, setRecent] = useState<StudentType[]>(mockStudents.slice(0, 4));
  const [upcoming, setUpcoming] = useState<ExamType[]>(mockExams.filter((e) => e.status === "upcoming"));
  const [live, setLive] = useState(false);

  useEffect(() => {
    apiGet<Stats>("/api/stats").then((s) => {
      if (!s) return;
      setStats(s);
      setLive(true);
    });
    apiGet<StudentType[]>("/api/students").then((rows) => {
      if (rows?.length) setRecent(rows.slice(0, 4));
    });
    apiGet<
      {
        id: string;
        student_name: string;
        class_name: string;
        due_date: string;
        total_amount: number;
        paid_amount: number;
        late_fee: number;
        status: string;
      }[]
    >("/api/fees").then((rows) => {
      if (!rows) return;
      setOverdue(
        rows
          .filter((i) => i.status === "overdue")
          .map((inv) => ({
            id: inv.id,
            studentId: "",
            studentName: inv.student_name,
            className: inv.class_name,
            academicYear: "",
            term: "",
            components: [],
            totalAmount: inv.total_amount,
            paidAmount: inv.paid_amount,
            dueDate: inv.due_date,
            status: "overdue" as const,
            lateFee: inv.late_fee,
            discount: 0,
          }))
      );
    });
    apiGet<ExamType[]>("/api/exams").then((rows) => {
      if (rows?.length) setUpcoming(rows.filter((e) => e.status === "upcoming"));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of Northstar Academy · Academic Year 2025-26
            {live ? " · live D1" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Export Report
          </Button>
          <Link href="/students/new">
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              New Admission
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Students"
          value={stats.activeStudents.toLocaleString()}
          change={3.2}
          changeLabel="vs last month"
          icon={<Student className="h-5 w-5" weight="duotone" />}
          accent="blue"
        />
        <StatCard
          label="Fee Collected (Month)"
          value={formatCurrency(stats.feeCollected)}
          change={8.4}
          changeLabel="vs last month"
          icon={<CurrencyCircleDollar className="h-5 w-5" weight="duotone" />}
          accent="emerald"
        />
        <StatCard
          label="Avg. Attendance"
          value={`${stats.averageAttendance}%`}
          change={-1.1}
          changeLabel="vs last week"
          icon={<CalendarCheck className="h-5 w-5" weight="duotone" />}
          accent="violet"
        />
        <StatCard
          label="Overdue Invoices"
          value={stats.overdueInvoices}
          change={12}
          changeLabel="needs attention"
          icon={<Warning className="h-5 w-5" weight="duotone" />}
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
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
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
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
                        {inv.className} · Due {inv.dueDate ? formatDate(inv.dueDate) : "—"}
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

          <Card>
            <CardHeader
              title="Recent Students"
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
                    <tr key={s.id}>
                      <td className="px-4 py-3">
                        <Link href={`/students/profile?id=${s.id}`} className="font-medium text-zinc-900 hover:text-blue-600">
                          {s.fullName}
                        </Link>
                        <p className="text-xs text-zinc-400">{s.admissionNo}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {s.className}-{s.section}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === "active" ? "success" : s.status === "suspended" ? "danger" : "muted"} dot>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{s.attendancePercent}%</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {s.feeBalance > 0 ? formatCurrency(s.feeBalance) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
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
              {upcoming.map((exam) => (
                <div key={exam.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Exam className="h-4 w-4 text-blue-500" weight="duotone" />
                      <p className="text-sm font-medium text-zinc-900">{exam.name}</p>
                    </div>
                    <Badge variant="info">{exam.type}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {exam.startDate ? formatDate(exam.startDate) : ""} – {exam.endDate ? formatDate(exam.endDate) : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">{exam.subjects?.length || 0} subjects</p>
                </div>
              ))}
            </div>
          </Card>

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
                  <button className="flex h-16 w-full flex-col items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-700 hover:bg-white">
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="System Alerts" />
            <div className="space-y-2.5">
              <div className="flex gap-3 rounded-xl bg-amber-50/80 px-3.5 py-3">
                <Warning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-amber-900">Teacher substitutions pending</p>
                  <p className="mt-0.5 text-[11px] text-amber-700">Leave on the timetable still needs coverage</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl bg-red-50/80 px-3.5 py-3">
                <Warning className="mt-0.5 h-4 w-4 shrink-0 text-red-600" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-red-900">{stats.overdueInvoices} overdue fee invoices</p>
                  <p className="mt-0.5 text-[11px] text-red-700">
                    Total outstanding {formatCurrency(stats.feeOutstanding)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
