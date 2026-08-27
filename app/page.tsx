"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarBlank,
  CaretDown,
  CaretUp,
  CheckCircle,
  Pause,
  Play,
  Student as StudentIcon,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Exam, StaffMember, Student } from "@/lib/mock-data";

type Stats = {
  activeStudents: number;
  feeCollected: number;
  feeOutstanding: number;
  averageAttendance: number;
  overdueInvoices: number;
};

type FeeRow = {
  id: string;
  student_name: string;
  class_name: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  late_fee: number;
  status: string;
};

type Slot = {
  id: string;
  class_name: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  start_time?: string;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    activeStudents: 0,
    feeCollected: 0,
    feeOutstanding: 0,
    averageAttendance: 0,
    overdueInvoices: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [openPanel, setOpenPanel] = useState<"fees" | "students" | "exams" | null>("fees");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    apiGet<Stats>("/api/stats").then((s) => s && setStats(s));
    apiGet<Array<Student & { full_name?: string; class_name?: string; admission_no?: string; fee_balance?: number; attendance_percent?: number }>>(
      "/api/students"
    ).then((rows) => {
      if (!rows) return;
      setStudents(
        rows.map((s) => ({
          ...s,
          fullName: s.fullName || s.full_name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
          className: s.className || s.class_name || "",
          admissionNo: s.admissionNo || s.admission_no || "",
          feeBalance: s.feeBalance ?? s.fee_balance ?? 0,
          attendancePercent: s.attendancePercent ?? s.attendance_percent ?? 0,
          section: s.section || "",
        }))
      );
    });
    apiGet<FeeRow[]>("/api/fees").then((rows) => rows && setFees(rows));
    apiGet<Exam[]>("/api/exams").then((rows) => rows && setExams(rows));
    apiGet<StaffMember[]>("/api/staff").then((rows) => rows && setStaff(rows));
    apiGet<Slot[]>("/api/timetable?className=8-A").then((rows) => rows && setSlots(rows));
  }, []);

  const totalFees = Math.max(1, stats.feeCollected + stats.feeOutstanding);
  const feePct = Math.round((stats.feeCollected / totalFees) * 100);
  const attendPct = Math.round(stats.averageAttendance || 0);
  const examDone = exams.filter((e) => e.status === "completed" || e.status === "result-published").length;
  const examPct = exams.length ? Math.round((examDone / exams.length) * 100) : 0;
  const leftover = Math.max(0, 100 - feePct - attendPct - examPct);

  const featured = useMemo(() => {
    const withBal = [...students].sort((a, b) => (b.feeBalance || 0) - (a.feeBalance || 0));
    return withBal[0] || students[0] || null;
  }, [students]);

  const weekBars = useMemo(() => {
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const today = now.getDay();
    return labels.map((label, i) => {
      const base = attendPct || 80;
      const jitter = [4, -8, 2, -3, 6, 10, -12][i];
      const value = Math.min(100, Math.max(28, base + jitter));
      return { label, value, today: i === today };
    });
  }, [attendPct, now]);

  const dayStart = 8 * 60;
  const dayEnd = 15 * 60 + 25;
  const mins = now.getHours() * 60 + now.getMinutes();
  const schoolProgress = Math.min(100, Math.max(0, ((mins - dayStart) / (dayEnd - dayStart)) * 100));
  const remaining = Math.max(0, dayEnd - mins);
  const remH = String(Math.floor(remaining / 60)).padStart(2, "0");
  const remM = String(remaining % 60).padStart(2, "0");
  const inSession = mins >= dayStart && mins <= dayEnd;

  const todayName = DAYS[now.getDay()];
  const todaySlots = slots
    .filter((s) => s.day === todayName)
    .sort((a, b) => a.period - b.period)
    .slice(0, 4);

  const overdue = fees.filter((f) => f.status === "overdue");
  const upcomingExams = exams.filter((e) => e.status === "upcoming" || e.status === "ongoing");

  const tasks = [
    ...overdue.slice(0, 2).map((f) => ({
      id: f.id,
      title: `Collect ${f.student_name.split(" ")[0]} fee`,
      meta: `${f.class_name} · ${formatCurrency(f.total_amount - f.paid_amount + (f.late_fee || 0))}`,
      href: "/fees",
      done: false,
    })),
    ...upcomingExams.slice(0, 2).map((e) => ({
      id: e.id,
      title: e.name,
      meta: e.startDate || "Scheduled",
      href: "/exams",
      done: false,
    })),
    {
      id: "att",
      title: "Mark today's attendance",
      meta: `${attendPct}% week average`,
      href: "/attendance",
      done: attendPct >= 90,
    },
    {
      id: "tt",
      title: "Review Class 8-A timetable",
      meta: `${slots.length} periods loaded`,
      href: "/timetable",
      done: slots.length > 0,
    },
  ].slice(0, 5);

  const doneTasks = tasks.filter((t) => t.done).length;

  const weekDates = useMemo(() => {
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [now]);

  const greeting = firstName(user?.name || "Principal");

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[40px] font-semibold leading-none tracking-tight text-zinc-900 md:text-[48px]">
            Welcome in, {greeting}
          </h1>
          <div className="mt-6 flex max-w-[560px] overflow-hidden rounded-full bg-white/40 p-1">
            <Seg label="Fees" value={`${feePct}%`} tone="dark" width={feePct} />
            <Seg label="Attendance" value={`${attendPct}%`} tone="sun" width={Math.max(12, attendPct * 0.35)} />
            <div className="ns-stripe relative flex min-w-[28%] flex-1 items-center px-4 py-2">
              <span className="absolute left-4 top-1 text-[10px] text-zinc-500">Project year</span>
              <span className="ml-auto text-[11px] font-semibold text-zinc-700">{examPct}%</span>
            </div>
            <div className="flex items-center rounded-full px-4 py-2 text-[11px] font-medium text-zinc-500">
              Hold {leftover}%
            </div>
          </div>
        </div>

        <div className="flex items-end gap-8 pr-2 text-zinc-800">
          <Metric icon={<StudentIcon className="h-4 w-4" />} value={stats.activeStudents || students.length} label="Students" />
          <Metric icon={<UsersThree className="h-4 w-4" />} value={staff.length} label="Staff" />
          <Metric icon={<Wallet className="h-4 w-4" />} value={stats.overdueInvoices || overdue.length} label="Overdue" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article className="relative min-h-[280px] overflow-hidden rounded-[28px] bg-zinc-200 xl:col-span-3">
          {featured ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-stone-200 to-zinc-400" />
              <div className="absolute inset-0 flex items-center justify-center text-[88px] font-semibold text-white/35">
                {initials(featured.fullName)}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                <div>
                  <p className="text-lg font-semibold text-white drop-shadow">{featured.fullName}</p>
                  <p className="text-xs text-white/80">
                    {featured.className}-{featured.section} · {featured.admissionNo}
                  </p>
                </div>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900">
                  {featured.feeBalance > 0 ? formatCurrency(featured.feeBalance) : "Clear"}
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No students yet</div>
          )}
        </article>

        <article className="ns-card rounded-[28px] p-5 xl:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500">Attendance</p>
              <p className="mt-1 text-[34px] font-semibold leading-none tracking-tight">
                {attendPct || 0}
                <span className="text-lg font-medium text-zinc-400">%</span>
              </p>
              <p className="mt-1 text-xs text-zinc-400">School average</p>
            </div>
            <Link href="/attendance" className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-end justify-between gap-2">
            {weekBars.map((b, i) => (
              <div key={`${b.label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className={`w-[7px] rounded-full ${b.today ? "bg-[#f2c94c]" : "bg-zinc-900"}`}
                    style={{ height: `${b.value}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-400">{b.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="ns-card rounded-[28px] p-5 xl:col-span-3">
          <div className="flex items-start justify-between">
            <p className="text-sm text-zinc-500">School day</p>
            <Link href="/timetable" className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#f2c94c ${schoolProgress}%, #efe8d2 0)`,
              }}
            >
              <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-[#fffaf0]">
                <p className="text-[28px] font-semibold leading-none tracking-tight">
                  {inSession ? `${remH}:${remM}` : "\u2014"}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">{inSession ? "Time left" : "After hours"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                <Play className="h-3.5 w-3.5" weight="fill" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                <Pause className="h-3.5 w-3.5" weight="fill" />
              </span>
            </div>
          </div>
        </article>

        <article className="relative xl:col-span-3">
          <div className="ns-card rounded-[28px] p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm text-zinc-500">Term progress</p>
              <p className="text-2xl font-semibold">{feePct}%</p>
            </div>
            <div className="mt-5 flex h-10 overflow-hidden rounded-xl">
              <div className="flex items-center bg-[#f2c94c] px-3 text-[11px] font-semibold" style={{ width: `${Math.max(18, feePct)}%` }}>
                Fees
              </div>
              <div className="bg-zinc-900" style={{ width: `${Math.max(10, attendPct * 0.25)}%` }} />
              <div className="bg-zinc-300" style={{ width: `${Math.max(8, leftover * 0.4)}%` }} />
            </div>
          </div>

          <div className="relative z-10 -mt-3 rounded-[26px] bg-[#1c1c1c] p-5 text-white shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm">Action list</p>
              <p className="text-sm text-white/50">
                {doneTasks}/{tasks.length}
              </p>
            </div>
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px]">
                      {t.done ? <CheckCircle className="h-4 w-4 text-[#f2c94c]" weight="fill" /> : initials(t.title)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{t.title}</span>
                      <span className="block text-[11px] text-white/40">{t.meta}</span>
                    </span>
                    {t.done ? (
                      <CheckCircle className="h-5 w-5 text-[#f2c94c]" weight="fill" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-white/25" />
                    )}
                  </Link>
                </li>
              ))}
              {tasks.length === 0 && <li className="text-xs text-white/40">Nothing pending</li>}
            </ul>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <aside className="ns-card overflow-hidden rounded-[28px] xl:col-span-3">
          <Accordion
            title={`Overdue fees \u00b7 ${overdue.length}`}
            open={openPanel === "fees"}
            onToggle={() => setOpenPanel(openPanel === "fees" ? null : "fees")}
          >
            {overdue.slice(0, 4).map((f) => (
              <Link key={f.id} href="/fees" className="flex items-center justify-between py-2.5">
                <span>
                  <span className="block text-sm font-medium">{f.student_name}</span>
                  <span className="text-[11px] text-zinc-400">{f.class_name}</span>
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency(f.total_amount - f.paid_amount + (f.late_fee || 0))}
                </span>
              </Link>
            ))}
            {overdue.length === 0 && <p className="py-3 text-sm text-zinc-400">No overdue invoices</p>}
          </Accordion>
          <Accordion
            title={`Students \u00b7 ${students.length}`}
            open={openPanel === "students"}
            onToggle={() => setOpenPanel(openPanel === "students" ? null : "students")}
          >
            {students.slice(0, 5).map((s) => (
              <Link key={s.id} href={`/students/profile?id=${s.id}`} className="flex items-center justify-between py-2.5">
                <span>
                  <span className="block text-sm font-medium">{s.fullName}</span>
                  <span className="text-[11px] text-zinc-400">
                    {s.className}-{s.section}
                  </span>
                </span>
                <span className="text-xs text-zinc-500">{s.attendancePercent}%</span>
              </Link>
            ))}
          </Accordion>
          <Accordion
            title={`Exams \u00b7 ${exams.length}`}
            open={openPanel === "exams"}
            onToggle={() => setOpenPanel(openPanel === "exams" ? null : "exams")}
          >
            {exams.slice(0, 4).map((e) => (
              <Link key={e.id} href="/exams" className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium">{e.name}</span>
                <span className="text-[11px] capitalize text-zinc-400">{e.status}</span>
              </Link>
            ))}
          </Accordion>
        </aside>

        <section className="ns-card rounded-[28px] p-5 xl:col-span-9">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-400">This week</p>
            <p className="text-sm font-medium text-zinc-700">
              {weekDates[0].toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
            <CalendarBlank className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="grid grid-cols-6 gap-2 text-center text-[11px] text-zinc-400">
            {weekDates.map((d) => (
              <div key={d.toISOString()}>
                {d.toLocaleString("en-US", { weekday: "short" })}
                <div className="mt-1 text-sm font-semibold text-zinc-800">{d.getDate()}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {todaySlots.length ? (
              todaySlots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3 text-white"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {s.subject} · {s.class_name}
                    </p>
                    <p className="text-[11px] text-white/50">
                      P{s.period}
                      {s.start_time ? ` · ${s.start_time}` : ""} · {s.room} · {s.teacher}
                    </p>
                  </div>
                  <span className="flex -space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2c94c] text-[10px] font-semibold text-zinc-900">
                      {initials(s.teacher)}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-zinc-400">
                No {todayName} periods in D1 for Class 8-A
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Seg({
  label,
  value,
  tone,
  width,
}: {
  label: string;
  value: string;
  tone: "dark" | "sun";
  width: number;
}) {
  return (
    <div
      className={`relative flex min-w-[72px] items-end rounded-full px-4 py-2 ${
        tone === "dark" ? "bg-zinc-900 text-white" : "bg-[#f2c94c] text-zinc-900"
      }`}
      style={{ width: `${Math.max(16, Math.min(width, 40))}%` }}
    >
      <span className="absolute left-4 top-1 text-[10px] opacity-70">{label}</span>
      <span className="text-[11px] font-semibold">{value}</span>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="text-right">
      <div className="flex items-center justify-end gap-2 text-zinc-400">{icon}</div>
      <p className="text-[40px] font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium">
        {title}
        {open ? <CaretUp className="h-4 w-4 text-zinc-400" /> : <CaretDown className="h-4 w-4 text-zinc-400" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
