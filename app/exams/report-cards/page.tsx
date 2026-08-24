"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import type { Student } from "@/lib/mock-data";

type Report = {
  student: { full_name: string; class_name: string; section: string; special_needs?: string };
  exam: { name: string };
  subjects: { subject: string; marks: number | null; max_marks: number; absent: number; grace: number }[];
  obtained: number;
  max: number;
  percent: number;
  grade: string;
};

export default function ReportCardsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("stu-002");
  const [examId, setExamId] = useState("ex-02");
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    apiGet<Student[]>("/api/students").then((rows) => {
      if (rows?.length) {
        setStudents(rows);
        setStudentId(rows[0].id);
      }
    });
  }, []);

  async function load() {
    const data = await apiGet<Report>(`/api/exams/${examId}/report/${studentId}`);
    setReport(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Report cards</h1>
        <p className="mt-1 text-sm text-zinc-500">Generated from D1 marks. Absent = 0. Grade band A+ to F.</p>
      </div>
      <Card padding="sm" bezel={false}>
        <div className="flex flex-wrap gap-2">
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="h-10 rounded-xl border px-3 text-sm">
            <option value="ex-02">Unit Test 3 – Class 10</option>
            <option value="ex-01">Mid-Term Examination 2026</option>
          </select>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-10 rounded-xl border px-3 text-sm">
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={load}>
            Generate
          </Button>
        </div>
      </Card>

      {report && (
        <div className="bezel">
          <div className="bezel-inner p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-400">Northstar Academy</p>
                <h2 className="mt-1 text-xl font-semibold">{report.exam?.name}</h2>
                <p className="text-sm text-zinc-500">
                  {report.student?.full_name} · {report.student?.class_name}-{report.student?.section}
                </p>
              </div>
              <Badge variant={report.grade === "F" ? "danger" : "success"}>{report.grade}</Badge>
            </div>
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-zinc-400">
                  <th className="py-2">Subject</th>
                  <th className="py-2 text-right">Marks</th>
                  <th className="py-2 text-right">Max</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((s) => (
                  <tr key={s.subject} className="border-b border-zinc-50">
                    <td className="py-2">{s.subject}</td>
                    <td className="py-2 text-right">
                      {s.absent ? "AB" : Number(s.marks || 0) + Number(s.grace || 0)}
                    </td>
                    <td className="py-2 text-right">{s.max_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between text-sm font-medium">
              <span>
                {report.obtained} / {report.max}
              </span>
              <span>{report.percent}%</span>
            </div>
            {report.student?.special_needs && (
              <p className="mt-4 text-xs text-amber-700">SEN: extra time applied during sitting. Marks are not inflated.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
