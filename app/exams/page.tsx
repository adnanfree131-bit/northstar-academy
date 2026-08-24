"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  CaretRight,
  CheckCircle,
  Clock,
  FileText,
} from "@phosphor-icons/react";
import { exams as mockExams } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type ExamRow = {
  id: string;
  name: string;
  type: string;
  class_name?: string;
  className?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status: "upcoming" | "ongoing" | "completed" | "result-published";
  subjects: { name: string; max_marks?: number; maxMarks?: number; date: string }[];
};

const statusVariant = {
  upcoming: "info" as const,
  ongoing: "warning" as const,
  completed: "muted" as const,
  "result-published": "success" as const,
};

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamRow[]>(mockExams as ExamRow[]);
  const [selectedExam, setSelectedExam] = useState(mockExams[0]?.id || "");

  useEffect(() => {
    apiGet<ExamRow[]>("/api/exams").then((rows) => {
      if (rows?.length) {
        setExams(
          rows.map((e) => ({
            ...e,
            className: e.className || e.class_name || "",
            startDate: e.startDate || e.start_date || "",
            endDate: e.endDate || e.end_date || "",
            subjects: (e.subjects || []).map((s) => ({
              name: s.name,
              maxMarks: s.maxMarks ?? s.max_marks ?? 0,
              date: s.date,
            })),
          }))
        );
        setSelectedExam(rows[0].id);
      }
    });
  }, []);

  const current = exams.find((e) => e.id === selectedExam) || exams[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Exams & Results</h1>
          <p className="mt-1 text-sm text-zinc-500">Marks entry, SEN extra time, and report cards now write to D1</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/exams/report-cards">
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4" />
              Report cards
            </Button>
          </Link>
          <Button size="sm">
            <Plus className="h-4 w-4" weight="bold" />
            Create Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">All Examinations</p>
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedExam === exam.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{exam.name}</p>
                <Badge variant={selectedExam === exam.id ? "muted" : statusVariant[exam.status]}>
                  {exam.status.replace("-", " ")}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {(exam.subjects || []).length} subjects · {exam.type}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {current && (
            <>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{current.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {current.type} · Class {current.className} · {current.startDate ? formatDate(current.startDate) : ""}
                    </p>
                  </div>
                  <Link href={`/exams/marks?exam=${current.id}`}>
                    <Button size="sm">
                      Enter marks
                      <CaretRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 overflow-hidden rounded-xl border border-zinc-100">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(current.subjects || []).map((sub) => (
                        <tr key={sub.name}>
                          <td className="px-4 py-3 font-medium">{sub.name}</td>
                          <td className="px-4 py-3 text-zinc-600">{sub.date ? formatDate(sub.date) : "—"}</td>
                          <td className="px-4 py-3 text-right">{sub.maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="Workflow" />
                  {[
                    { label: "Schedule published", done: true },
                    { label: "Marks entry", done: true },
                    { label: "Report cards", done: current.status !== "upcoming" },
                  ].map((step) => (
                    <div key={step.label} className="mb-2 flex items-center gap-3 text-sm">
                      {step.done ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" weight="fill" />
                      ) : (
                        <Clock className="h-5 w-5 text-zinc-300" />
                      )}
                      {step.label}
                    </div>
                  ))}
                </Card>
                <Card>
                  <CardHeader title="Edge cases" />
                  <ul className="space-y-2 text-sm text-zinc-600">
                    <li>• Marks + grace cannot exceed max</li>
                    <li>• Absent students score 0 and need improvement exam</li>
                    <li>• SEN extra time is a staff process, not extra marks</li>
                    <li>• Rank uses percent then English as tie-breaker</li>
                  </ul>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
