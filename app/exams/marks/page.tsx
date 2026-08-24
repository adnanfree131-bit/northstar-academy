"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet, apiPost } from "@/lib/api";
import type { Student } from "@/lib/mock-data";
import { Suspense } from "react";

type Exam = {
  id: string;
  name: string;
  subjects: { name: string; max_marks?: number; maxMarks?: number }[];
};
type Mark = { student_id: string; subject: string; marks: number | null; absent: number; grace: number };

function MarksInner() {
  const params = useSearchParams();
  const examId = params.get("exam") || "ex-02";
  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subject, setSubject] = useState("Mathematics");
  const [values, setValues] = useState<Record<string, string>>({});
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<Exam[]>("/api/exams").then((rows) => {
      const current = rows?.find((e) => e.id === examId) || rows?.[0];
      if (current) {
        setExam(current);
        const first = current.subjects?.[0]?.name;
        if (first) setSubject(first);
      }
    });
    apiGet<Student[]>("/api/students").then((rows) => {
      if (rows) setStudents(rows.filter((s) => s.status === "active"));
    });
    apiGet<Mark[]>(`/api/exams/${examId}/marks`).then((rows) => {
      if (!rows) return;
      const v: Record<string, string> = {};
      const a: Record<string, boolean> = {};
      rows.forEach((r) => {
        if (r.subject === subject || true) {
          v[`${r.student_id}:${r.subject}`] = r.marks == null ? "" : String(r.marks);
          a[`${r.student_id}:${r.subject}`] = Boolean(r.absent);
        }
      });
      setValues(v);
      setAbsent(a);
    });
  }, [examId]);

  const max = useMemo(() => {
    const sub = exam?.subjects?.find((s) => s.name === subject);
    return sub?.maxMarks ?? sub?.max_marks ?? 100;
  }, [exam, subject]);

  async function saveOne(studentId: string) {
    setSaving(true);
    const key = `${studentId}:${subject}`;
    const res = await apiPost(`/api/exams/${examId}/marks`, {
      studentId,
      subject,
      marks: absent[key] ? 0 : Number(values[key] || 0),
      maxMarks: max,
      absent: Boolean(absent[key]),
      grace: 0,
    });
    setSaving(false);
    setMsg(res.data ? "Saved" : res.error || "Failed");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marks entry</h1>
        <p className="mt-1 text-sm text-zinc-500">{exam?.name || examId} · max {max}. Over-max is rejected.</p>
      </div>
      <Card padding="sm" bezel={false}>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
        >
          {(exam?.subjects || [{ name: "Mathematics" }]).map((s) => (
            <option key={s.name}>{s.name}</option>
          ))}
        </select>
        {msg && <span className="ml-3 text-sm text-emerald-700">{msg}</span>}
      </Card>
      <Card padding="none">
        <CardHeader title={subject} />
        <div className="divide-y divide-zinc-50">
          {students.map((s) => {
            const key = `${s.id}:${subject}`;
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{s.fullName}</p>
                  <p className="text-xs text-zinc-400">
                    {s.className}-{s.section}
                    {s.specialNeeds ? " · SEN extra time" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={Boolean(absent[key])}
                      onChange={(e) => setAbsent((p) => ({ ...p, [key]: e.target.checked }))}
                    />
                    Absent
                  </label>
                  <input
                    type="number"
                    disabled={Boolean(absent[key])}
                    value={values[key] || ""}
                    onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                    className="h-9 w-20 rounded-lg border border-zinc-200 px-2 text-sm"
                  />
                  <Button size="sm" loading={saving} onClick={() => saveOne(s.id)}>
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default function MarksPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading marks…</p>}>
      <MarksInner />
    </Suspense>
  );
}
