"use client";

import { useState, useMemo } from "react";
import {
  CalendarCheck,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { students } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";

type MarkStatus = "present" | "absent" | "late" | "leave" | "half-day";

const statusStyles: Record<MarkStatus, string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-red-500 text-white",
  late: "bg-amber-500 text-white",
  leave: "bg-blue-500 text-white",
  "half-day": "bg-violet-500 text-white",
};

const statusLabels: Record<MarkStatus, string> = {
  present: "P",
  absent: "A",
  late: "L",
  leave: "Lv",
  "half-day": "H",
};

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("8");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState("2026-08-24");
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [viewMode, setViewMode] = useState<"daily" | "period">("daily");

  const classStudents = useMemo(
    () =>
      students.filter(
        (s) => s.className === selectedClass && s.section === selectedSection && s.status === "active"
      ),
    [selectedClass, selectedSection]
  );

  const setMark = (studentId: string, status: MarkStatus) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const bulkMark = (status: MarkStatus) => {
    const next: Record<string, MarkStatus> = {};
    classStudents.forEach((s) => {
      next[s.id] = status;
    });
    setMarks(next);
  };

  const summary = useMemo(() => {
    const values = Object.values(marks);
    return {
      present: values.filter((v) => v === "present").length,
      absent: values.filter((v) => v === "absent").length,
      late: values.filter((v) => v === "late").length,
      leave: values.filter((v) => v === "leave").length,
      unmarked: classStudents.length - values.length,
    };
  }, [marks, classStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Attendance</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Daily and period-wise attendance with leave tracking and bulk actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Download Report
          </Button>
          <Button size="sm" disabled={summary.unmarked > 0 && Object.keys(marks).length === 0}>
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card padding="sm" bezel={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
            >
              {["7", "8", "9", "10"].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
            >
              {["A", "B", "C"].map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setViewMode("daily")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "daily" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode("period")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "period" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Period-wise
            </button>
          </div>
        </div>
      </Card>

      {/* Summary + bulk */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Present" value={summary.present} accent="emerald" icon={<CheckCircle className="h-5 w-5" weight="duotone" />} />
        <StatCard label="Absent" value={summary.absent} accent="red" icon={<XCircle className="h-5 w-5" weight="duotone" />} />
        <StatCard label="Late" value={summary.late} accent="amber" icon={<Clock className="h-5 w-5" weight="duotone" />} />
        <StatCard label="On Leave" value={summary.leave} accent="blue" icon={<CalendarCheck className="h-5 w-5" weight="duotone" />} />
        <StatCard label="Unmarked" value={summary.unmarked} accent="violet" icon={<Warning className="h-5 w-5" weight="duotone" />} />
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">Bulk mark all as:</span>
        {(["present", "absent", "late", "leave"] as MarkStatus[]).map((s) => (
          <Button key={s} variant="secondary" size="sm" onClick={() => bulkMark(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setMarks({})}>
          Clear
        </Button>
      </div>

      {/* Student list for marking */}
      <Card padding="none" bezel={false}>
        <div className="border-b border-zinc-100 px-5 py-3">
          <p className="text-sm font-medium text-zinc-900">
            Class {selectedClass}-{selectedSection} · {classStudents.length} students
          </p>
          <p className="text-xs text-zinc-500">
            Click status buttons to mark. Consecutive absences trigger guardian alerts.
          </p>
        </div>

        <div className="divide-y divide-zinc-50">
          {classStudents.map((s, idx) => {
            const current = marks[s.id];
            return (
              <div
                key={s.id}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs text-zinc-400">{idx + 1}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-600">
                    {s.firstName[0]}
                    {s.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{s.fullName}</p>
                    <p className="text-xs text-zinc-400">
                      Roll {s.rollNo}
                      {s.specialNeeds && " · SEN"}
                      {s.medicalNotes && " · Medical note"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {(["present", "absent", "late", "leave", "half-day"] as MarkStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setMark(s.id, status)}
                        className={`h-8 min-w-[36px] rounded-lg px-2 text-xs font-semibold transition-all duration-200 ${
                          current === status
                            ? statusStyles[status]
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                        title={status}
                      >
                        {statusLabels[status]}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {classStudents.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              No active students in this class/section.
            </div>
          )}
        </div>
      </Card>

      {/* Edge case notes */}
      <Card>
        <CardHeader title="Attendance Rules & Edge Cases" />
        <ul className="space-y-2 text-sm text-zinc-600">
          <li className="flex gap-2">
            <span className="text-zinc-400">•</span>
            3 consecutive absences automatically notify primary guardian via SMS/email.
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">•</span>
            Late arrival after 15 minutes is recorded as Late; after 45 minutes counts as Half-day.
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">•</span>
            Medical leave requires document upload within 3 working days or converts to Absent.
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">•</span>
            Students with SEN flags are highlighted so teachers can apply accommodations.
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">•</span>
            Period-wise mode supports subject-level attendance for senior classes.
          </li>
        </ul>
      </Card>
    </div>
  );
}
