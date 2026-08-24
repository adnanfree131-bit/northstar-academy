"use client";

import { useState } from "react";
import { Warning, ArrowsClockwise, UserSwitch } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  { num: 1, time: "08:00 – 08:45" },
  { num: 2, time: "08:50 – 09:35" },
  { num: 3, time: "09:40 – 10:25" },
  { num: 4, time: "10:45 – 11:30" },
  { num: 5, time: "11:35 – 12:20" },
  { num: 6, time: "12:25 – 13:10" },
  { num: 7, time: "13:50 – 14:35" },
  { num: 8, time: "14:40 – 15:25" },
];

// Sample timetable for Class 8-A
const timetableData: Record<string, Record<number, { subject: string; teacher: string; room: string; isSub?: boolean }>> = {
  Monday: {
    1: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    2: { subject: "Mathematics", teacher: "Ms. Hina Qureshi", room: "R-12" },
    3: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
    4: { subject: "Urdu", teacher: "Mr. Asif", room: "R-12" },
    5: { subject: "Islamiat", teacher: "Maulana Zafar", room: "R-12" },
    6: { subject: "Computer", teacher: "Ms. Sana", room: "Lab-2" },
    7: { subject: "Games", teacher: "Coach Bilal", room: "Ground" },
    8: { subject: "Art", teacher: "Ms. Ayesha", room: "Art Room" },
  },
  Tuesday: {
    1: { subject: "Mathematics", teacher: "Ms. Hina Qureshi", room: "R-12", isSub: true },
    2: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    3: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
    4: { subject: "Pakistan Studies", teacher: "Mr. Kamran", room: "R-12" },
    5: { subject: "Mathematics", teacher: "Ms. Hina Qureshi", room: "R-12", isSub: true },
    6: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    7: { subject: "Library", teacher: "Librarian", room: "Library" },
    8: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
  },
  Wednesday: {
    1: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
    2: { subject: "Mathematics", teacher: "Substitute", room: "R-12", isSub: true },
    3: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    4: { subject: "Urdu", teacher: "Mr. Asif", room: "R-12" },
    5: { subject: "Computer", teacher: "Ms. Sana", room: "Lab-2" },
    6: { subject: "Islamiat", teacher: "Maulana Zafar", room: "R-12" },
    7: { subject: "Mathematics", teacher: "Substitute", room: "R-12", isSub: true },
    8: { subject: "Games", teacher: "Coach Bilal", room: "Ground" },
  },
  Thursday: {
    1: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    2: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
    3: { subject: "Mathematics", teacher: "Ms. Hina Qureshi", room: "R-12" },
    4: { subject: "Pakistan Studies", teacher: "Mr. Kamran", room: "R-12" },
    5: { subject: "Urdu", teacher: "Mr. Asif", room: "R-12" },
    6: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    7: { subject: "Art", teacher: "Ms. Ayesha", room: "Art Room" },
    8: { subject: "Computer", teacher: "Ms. Sana", room: "Lab-2" },
  },
  Friday: {
    1: { subject: "Islamiat", teacher: "Maulana Zafar", room: "R-12" },
    2: { subject: "Mathematics", teacher: "Ms. Hina Qureshi", room: "R-12" },
    3: { subject: "English", teacher: "Ms. Fatima", room: "R-12" },
    4: { subject: "Science", teacher: "Mr. Usman Sheikh", room: "Lab-1" },
    5: { subject: "Assembly", teacher: "Principal", room: "Hall" },
    6: { subject: "Games", teacher: "Coach Bilal", room: "Ground" },
    7: { subject: "—", teacher: "—", room: "—" },
    8: { subject: "—", teacher: "—", room: "—" },
  },
};

export default function TimetablePage() {
  const [view, setView] = useState<"class" | "teacher">("class");
  const [selectedClass, setSelectedClass] = useState("8-A");

  const conflictCount = 2; // simulated

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Timetable</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Class & teacher views with conflict detection and substitution management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <UserSwitch className="h-4 w-4" />
            Manage Substitutions
          </Button>
          <Button size="sm">
            <ArrowsClockwise className="h-4 w-4" />
            Auto-Generate
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {conflictCount > 0 && (
        <div className="flex gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 ring-1 ring-amber-100">
          <Warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" weight="fill" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              {conflictCount} conflicts detected this week
            </p>
            <p className="mt-0.5 text-sm text-amber-700">
              Ms. Hina Qureshi is on leave. 4 periods currently assigned to substitutes. Teacher
              double-booking risk on Tuesday Period 5.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <Card padding="sm" bezel={false}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setView("class")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                view === "class" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Class View
            </button>
            <button
              onClick={() => setView("teacher")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                view === "teacher" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Teacher View
            </button>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none"
          >
            {["7-A", "7-B", "8-A", "8-B", "9-A", "9-B", "10-A"].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Timetable grid */}
      <Card padding="none" bezel={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="sticky left-0 z-10 bg-zinc-50/95 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Period
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-400"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.num} className="border-b border-zinc-50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5">
                    <p className="text-xs font-semibold text-zinc-900">P{period.num}</p>
                    <p className="text-[10px] text-zinc-400">{period.time}</p>
                  </td>
                  {days.map((day) => {
                    const slot = timetableData[day]?.[period.num];
                    if (!slot || slot.subject === "—") {
                      return (
                        <td key={day} className="px-2 py-2">
                          <div className="h-16 rounded-lg bg-zinc-50/50" />
                        </td>
                      );
                    }
                    return (
                      <td key={day} className="px-2 py-2">
                        <div
                          className={`h-16 rounded-lg border p-2 transition-colors hover:shadow-sm ${
                            slot.isSub
                              ? "border-amber-200 bg-amber-50/80"
                              : "border-zinc-100 bg-white"
                          }`}
                        >
                          <p className="truncate text-xs font-medium text-zinc-900">
                            {slot.subject}
                          </p>
                          <p className="truncate text-[10px] text-zinc-500">{slot.teacher}</p>
                          <div className="mt-0.5 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400">{slot.room}</span>
                            {slot.isSub && (
                              <Badge variant="warning" className="scale-90">
                                Sub
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Substitution Rules" />
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>• Auto-suggest free teachers with matching subject expertise</li>
            <li>• Preference for teachers already teaching the same class</li>
            <li>• Track substitution history for workload fairness</li>
            <li>• Notify affected class teachers and parents on long absences</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Conflict Detection" />
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>• Teacher double-booked across classes</li>
            <li>• Room already occupied</li>
            <li>• Subject overload in a single day</li>
            <li>• Lab capacity exceeded</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
