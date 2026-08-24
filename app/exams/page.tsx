"use client";

import { useState } from "react";
import {
  Exam,
  CalendarBlank,
  Plus,
  CaretRight,
  CheckCircle,
  Clock,
  FileText,
} from "@phosphor-icons/react";
import { exams } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

const statusVariant = {
  upcoming: "info" as const,
  ongoing: "warning" as const,
  completed: "muted" as const,
  "result-published": "success" as const,
};

export default function ExamsPage() {
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id || "");

  const current = exams.find((e) => e.id === selectedExam) || exams[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Exams & Results</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Exam schedules, marks entry, re-evaluation, and report cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <FileText className="h-4 w-4" />
            Generate Report Cards
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" weight="bold" />
            Create Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Exam list */}
        <div className="space-y-3 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            All Examinations
          </p>
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                selectedExam === exam.id
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      selectedExam === exam.id ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {exam.name}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      selectedExam === exam.id ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                  </p>
                </div>
                <Badge
                  variant={selectedExam === exam.id ? "muted" : statusVariant[exam.status]}
                  className={selectedExam === exam.id ? "bg-white/15 text-white" : ""}
                >
                  {exam.status.replace("-", " ")}
                </Badge>
              </div>
              <p
                className={`mt-2 text-xs ${
                  selectedExam === exam.id ? "text-zinc-400" : "text-zinc-400"
                }`}
              >
                {exam.subjects.length} subjects · {exam.type}
              </p>
            </button>
          ))}
        </div>

        {/* Exam detail */}
        <div className="space-y-6 lg:col-span-2">
          {current && (
            <>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                      {current.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {current.type} · Class {current.className} ·{" "}
                      {formatDate(current.startDate)} to {formatDate(current.endDate)}
                    </p>
                  </div>
                  <Badge variant={statusVariant[current.status]} dot>
                    {current.status.replace("-", " ")}
                  </Badge>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-zinc-100">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Max Marks</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {current.subjects.map((sub) => (
                        <tr key={sub.name} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-medium text-zinc-900">{sub.name}</td>
                          <td className="px-4 py-3 text-zinc-600">{formatDate(sub.date)}</td>
                          <td className="px-4 py-3 text-right text-zinc-600">{sub.maxMarks}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm">
                              Enter Marks
                              <CaretRight className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="Workflow Status" />
                  <div className="space-y-3">
                    {[
                      { label: "Schedule published", done: true },
                      { label: "Hall tickets generated", done: current.status !== "upcoming" },
                      { label: "Marks entry open", done: current.status === "ongoing" || current.status === "completed" },
                      { label: "Results published", done: current.status === "result-published" },
                    ].map((step) => (
                      <div key={step.label} className="flex items-center gap-3">
                        {step.done ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" weight="fill" />
                        ) : (
                          <Clock className="h-5 w-5 text-zinc-300" />
                        )}
                        <span
                          className={`text-sm ${
                            step.done ? "text-zinc-900" : "text-zinc-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Edge Cases Handled" />
                  <ul className="space-y-2 text-sm text-zinc-600">
                    <li>• Grace marks approval workflow</li>
                    <li>• Re-evaluation request + fee</li>
                    <li>• Absent student auto-flag for improvement exam</li>
                    <li>• SEN extra time automatically applied</li>
                    <li>• Rank calculation with proper tie-breakers</li>
                    <li>• Compartment / improvement exam linking</li>
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
