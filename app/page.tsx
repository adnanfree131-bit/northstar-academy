"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { Avatar, Group, Row } from "@/components/ui/group";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import type { Exam, Student } from "@/lib/mock-data";

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
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    apiGet<Stats>("/api/stats").then((s) => s && setStats(s));
    apiGet<Array<Student & { full_name?: string; class_name?: string; admission_no?: string; fee_balance?: number; attendance_percent?: number }>>(
      "/api/students",
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
        })),
      );
    });
    apiGet<FeeRow[]>("/api/fees").then((rows) => rows && setFees(rows));
    apiGet<Exam[]>("/api/exams").then((rows) => rows && setExams(rows));
    apiGet<Slot[]>("/api/timetable?className=8-A").then((rows) => rows && setSlots(rows));
  }, []);

  const overdue = fees.filter((f) => f.status === "overdue");
  const todayName = DAYS[new Date().getDay()];
  const todaySlots = useMemo(
    () => slots.filter((s) => s.day === todayName).sort((a, b) => a.period - b.period).slice(0, 5),
    [slots, todayName],
  );
  const upcoming = exams.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <header className="mb-6">
        <p className="text-caption font-medium uppercase tracking-wider text-faint">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-display font-medium tracking-tight">
          {greet}, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-body text-muted">Northstar campus · live D1</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="On roll" value={String(stats.activeStudents || students.length)} />
        <Stat label="Attendance" value={`${Math.round(stats.averageAttendance || 0)}%`} />
        <Stat label="Collected" value={formatCurrency(stats.feeCollected)} />
        <Stat label="Outstanding" value={formatCurrency(stats.feeOutstanding)} tone={stats.feeOutstanding > 0 ? "warn" : undefined} />
      </div>

      <Group title="Needs you" className="mb-6">
        <Link href="/attendance">
          <Row>
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium">Mark attendance</p>
              <p className="text-caption text-muted">Open today’s class roll</p>
            </div>
            <CaretRight className="h-4 w-4 text-faint" />
          </Row>
        </Link>
        {overdue.map((inv) => (
          <Link key={inv.id} href="/fees">
            <Row>
              <Avatar name={inv.student_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium">{inv.student_name}</p>
                <p className="text-caption text-danger">
                  Overdue · {inv.class_name} · {inv.due_date}
                </p>
              </div>
              <span className="text-body tabular-nums">
                {formatCurrency(inv.total_amount - inv.paid_amount + (inv.late_fee || 0))}
              </span>
            </Row>
          </Link>
        ))}
        {overdue.length === 0 ? (
          <Row>
            <p className="text-body text-muted">No overdue invoices</p>
          </Row>
        ) : null}
      </Group>

      <Group title={`Today · ${todayName}`} className="mb-6">
        {todaySlots.length ? (
          todaySlots.map((s) => (
            <Link key={s.id} href="/timetable">
              <Row>
                <span className="w-8 shrink-0 text-caption text-muted">P{s.period}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium">{s.subject}</p>
                  <p className="text-caption text-muted">
                    {s.class_name} · {s.room} · {s.teacher}
                  </p>
                </div>
                <CaretRight className="h-4 w-4 text-faint" />
              </Row>
            </Link>
          ))
        ) : (
          <Row>
            <p className="text-body text-muted">No {todayName} periods for 8-A</p>
          </Row>
        )}
      </Group>

      <Group title="Exams">
        {upcoming.slice(0, 4).map((exam) => (
          <Link key={exam.id} href="/exams">
            <Row>
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium">{exam.name}</p>
                <p className="text-caption text-muted">
                  {exam.type} · {exam.startDate}
                </p>
              </div>
              <span className="rounded-full bg-pine-soft px-2 py-0.5 text-caption text-pine">{exam.status}</span>
            </Row>
          </Link>
        ))}
        {upcoming.length === 0 ? (
          <Row>
            <p className="text-body text-muted">No upcoming exams</p>
          </Row>
        ) : null}
      </Group>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-card)]">
      <p className="text-caption text-faint">{label}</p>
      <p className={`mt-1 text-title font-medium tabular-nums tracking-tight ${tone === "warn" ? "text-warn" : ""}`}>
        {value}
      </p>
    </div>
  );
}
