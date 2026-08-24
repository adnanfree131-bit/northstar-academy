"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import type { Student } from "@/lib/mock-data";

type Detail = {
  student: Student;
  invoices: { id: string; status: string; total_amount: number; paid_amount: number; late_fee: number; term: string }[];
  notes: { id: string; title: string; body: string; confidential: number; category: string }[];
};

export default function PortalPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    const id = user?.studentId;
    if (!id) return;
    apiGet<Detail>(`/api/students/${id}`).then((d) => setData(d));
  }, [user]);

  const s = data?.student;
  const visibleNotes = (data?.notes || []).filter((n) => !n.confidential);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Parent portal</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Confidential staff notes are hidden. Fee holds still block report cards.
        </p>
      </div>

      {!s && <Card>No linked student on this parent account.</Card>}

      {s && (
        <>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-900">{s.fullName}</p>
                <p className="text-sm text-zinc-500">
                  Class {s.className}-{s.section} · {s.admissionNo}
                </p>
              </div>
              <Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Attendance</p>
                <p className="font-medium">{s.attendancePercent}%</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Fee balance</p>
                <p className="font-medium">{s.feeBalance ? formatCurrency(s.feeBalance) : "Clear"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">SEN</p>
                <p className="font-medium">{s.specialNeeds ? "Accommodations on file" : "None"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Invoices" />
            <div className="space-y-2">
              {(data?.invoices || []).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 text-sm">
                  <span>
                    {inv.id} · {inv.term}
                  </span>
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "warning"}>
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="School notes" description="Confidential items are not shown to parents" />
            {visibleNotes.length === 0 && <p className="text-sm text-zinc-500">No parent-visible notes.</p>}
            {visibleNotes.map((n) => (
              <div key={n.id} className="mb-3 rounded-xl bg-zinc-50 p-3 text-sm">
                <p className="font-medium text-zinc-900">{n.title}</p>
                <p className="mt-1 text-zinc-600">{n.body}</p>
              </div>
            ))}
          </Card>

          <Link href="/exams/report-cards" className="text-sm font-medium text-blue-600">
            Open report cards →
          </Link>
        </>
      )}
    </div>
  );
}
