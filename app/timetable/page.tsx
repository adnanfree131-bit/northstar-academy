"use client";

import { useEffect, useMemo, useState } from "react";
import { Warning, ArrowsClockwise, UserSwitch } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet, apiPost } from "@/lib/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  { num: 1, time: "08:00 – 08:45", start: "08:00", end: "08:45" },
  { num: 2, time: "08:50 – 09:35", start: "08:50", end: "09:35" },
  { num: 3, time: "09:40 – 10:25", start: "09:40", end: "10:25" },
  { num: 4, time: "10:45 – 11:30", start: "10:45", end: "11:30" },
  { num: 5, time: "11:35 – 12:20", start: "11:35", end: "12:20" },
  { num: 6, time: "12:25 – 13:10", start: "12:25", end: "13:10" },
  { num: 7, time: "13:50 – 14:35", start: "13:50", end: "14:35" },
  { num: 8, time: "14:40 – 15:25", start: "14:40", end: "15:25" },
];

type Slot = {
  id: string;
  class_name: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  is_substitution: number;
  original_teacher: string | null;
};

type Conflicts = {
  teacher: { day: string; period: number; teacher: string; classes: string; n: number }[];
  room: { day: string; period: number; room: string; classes: string; n: number }[];
  substitutions: number;
};

export default function TimetablePage() {
  const [view, setView] = useState<"class" | "teacher">("class");
  const [selectedClass, setSelectedClass] = useState("8-A");
  const [selectedTeacher, setSelectedTeacher] = useState("Ms. Hina Qureshi");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [conflicts, setConflicts] = useState<Conflicts | null>(null);
  const [editing, setEditing] = useState<{ day: string; period: number; slot?: Slot } | null>(null);
  const [form, setForm] = useState({ subject: "", teacher: "", room: "" });
  const [saving, setSaving] = useState(false);
  const [subFor, setSubFor] = useState<Slot | null>(null);
  const [subTeacher, setSubTeacher] = useState("Ms. Fatima Zahra");

  async function load() {
    const q =
      view === "teacher"
        ? `/api/timetable?teacher=${encodeURIComponent(selectedTeacher)}`
        : `/api/timetable?className=${encodeURIComponent(selectedClass)}`;
    const rows = await apiGet<Slot[]>(q);
    setSlots(rows || []);
    const c = await apiGet<Conflicts>("/api/timetable/conflicts");
    setConflicts(c);
  }

  useEffect(() => {
    load();
  }, [selectedClass, selectedTeacher, view]);

  const grid = useMemo(() => {
    const map: Record<string, Record<number, Slot>> = {};
    for (const s of slots) {
      (map[s.day] ||= {})[s.period] = s;
    }
    return map;
  }, [slots]);

  const teachers = useMemo(() => {
    const set = new Set(slots.map((s) => s.teacher).filter((t) => t && t !== "—"));
    ["Ms. Hina Qureshi", "Ms. Fatima Zahra", "Mr. Usman Sheikh", "Mr. Asif", "Ms. Sana"].forEach((t) =>
      set.add(t)
    );
    return Array.from(set);
  }, [slots]);

  const conflictCount = (conflicts?.teacher.length || 0) + (conflicts?.room.length || 0);

  async function saveSlot() {
    if (!editing) return;
    const period = periods.find((p) => p.num === editing.period);
    setSaving(true);
    const res = await apiPost("/api/timetable", {
      className: selectedClass,
      day: editing.day,
      period: editing.period,
      subject: form.subject,
      teacher: form.teacher,
      room: form.room,
      startTime: period?.start,
      endTime: period?.end,
    });
    setSaving(false);
    if (res.data) {
      setEditing(null);
      await load();
    }
  }

  async function assignSub() {
    if (!subFor) return;
    setSaving(true);
    const res = await apiPost(`/api/timetable/${subFor.id}/substitute`, { teacher: subTeacher });
    setSaving(false);
    if (res.data) {
      setSubFor(null);
      await load();
    }
  }

  async function copyToClass() {
    setSaving(true);
    const source = await apiGet<Slot[]>(`/api/timetable?class=8-A`);
    for (const s of source || []) {
      await apiPost("/api/timetable", {
        className: selectedClass,
        day: s.day,
        period: s.period,
        subject: s.subject,
        teacher: s.teacher,
        room: s.room,
      });
    }
    setSaving(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Timetable</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live D1 grid. Click a period to edit. Substitutions and conflicts are stored.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => slots[0] && setSubFor(slots.find((s) => !s.is_substitution) || slots[0])}>
            <UserSwitch className="h-4 w-4" />
            Manage substitutions
          </Button>
          <Button size="sm" loading={saving} onClick={copyToClass}>
            <ArrowsClockwise className="h-4 w-4" />
            Copy 8-A template
          </Button>
        </div>
      </div>

      {conflictCount > 0 && (
        <div className="flex gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 ring-1 ring-amber-100">
          <Warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" weight="fill" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              {conflictCount} conflict{conflictCount === 1 ? "" : "s"} · {conflicts?.substitutions || 0} substitutions
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-amber-700">
              {(conflicts?.teacher || []).map((c) => (
                <li key={`t-${c.day}-${c.period}-${c.teacher}`}>
                  Teacher {c.teacher} double-booked {c.day} P{c.period} ({c.classes})
                </li>
              ))}
              {(conflicts?.room || []).map((c) => (
                <li key={`r-${c.day}-${c.period}-${c.room}`}>
                  Room {c.room} clash {c.day} P{c.period} ({c.classes})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card padding="sm" bezel={false}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setView("class")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                view === "class" ? "bg-zinc-900 text-white" : "text-zinc-500"
              }`}
            >
              Class view
            </button>
            <button
              onClick={() => setView("teacher")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                view === "teacher" ? "bg-zinc-900 text-white" : "text-zinc-500"
              }`}
            >
              Teacher view
            </button>
          </div>
          {view === "class" ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {["7-A", "7-B", "8-A", "8-B", "9-A", "9-B", "10-A"].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {teachers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </Card>

      <Card padding="none" bezel={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="sticky left-0 z-10 bg-zinc-50/95 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Period
                </th>
                {days.map((day) => (
                  <th key={day} className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-400">
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
                    const slot = grid[day]?.[period.num];
                    return (
                      <td key={day} className="px-2 py-2">
                        <button
                          onClick={() => {
                            setEditing({ day, period: period.num, slot });
                            setForm({
                              subject: slot?.subject || "",
                              teacher: slot?.teacher || "",
                              room: slot?.room || "R-12",
                            });
                          }}
                          className={`h-16 w-full rounded-lg border p-2 text-left transition-colors hover:shadow-sm ${
                            slot?.is_substitution
                              ? "border-amber-200 bg-amber-50/80"
                              : slot
                              ? "border-zinc-100 bg-white"
                              : "border-dashed border-zinc-200 bg-zinc-50/50"
                          }`}
                        >
                          {slot ? (
                            <>
                              <p className="truncate text-xs font-medium text-zinc-900">{slot.subject}</p>
                              <p className="truncate text-[10px] text-zinc-500">{slot.teacher}</p>
                              <div className="mt-0.5 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400">{slot.room}</span>
                                {slot.is_substitution ? (
                                  <Badge variant="warning" className="scale-90">
                                    Sub
                                  </Badge>
                                ) : null}
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px] text-zinc-400">Empty</p>
                          )}
                        </button>
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
          <CardHeader title="Substitution rules" />
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>• Original teacher is kept so the period can revert after leave</li>
            <li>• Substitutions are flagged on the grid and counted in conflicts</li>
            <li>• Same teacher cannot cover two classes in one period</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Conflict detection" />
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>• Teacher double-booked across classes</li>
            <li>• Room already occupied (labs/classrooms)</li>
            <li>• Seeded clash: Usman in Lab-1 for 8-A and 9-A Monday P3 / Tuesday P5</li>
          </ul>
        </Card>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              {selectedClass} · {editing.day} P{editing.period}
            </h2>
            <div className="mt-4 space-y-2">
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
              <input
                placeholder="Teacher"
                value={form.teacher}
                onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
              <input
                placeholder="Room"
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {editing.slot && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSubFor(editing.slot!);
                    setEditing(null);
                  }}
                >
                  Substitute
                </Button>
              )}
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={saveSlot}>
                Save slot
              </Button>
            </div>
          </div>
        </div>
      )}

      {subFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Assign substitute</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {subFor.subject} · {subFor.day} P{subFor.period} · currently {subFor.teacher}
            </p>
            <select
              value={subTeacher}
              onChange={(e) => setSubTeacher(e.target.value)}
              className="mt-4 h-10 w-full rounded-xl border px-3 text-sm"
            >
              {teachers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSubFor(null)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={assignSub}>
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
