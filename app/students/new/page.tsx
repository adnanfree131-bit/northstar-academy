"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiPost } from "@/lib/api";

export default function NewAdmissionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Female",
    dateOfBirth: "2012-01-01",
    className: "8",
    section: "A",
    rollNo: "",
    guardianName: "",
    guardianPhone: "",
    isHostel: false,
    specialNeeds: "",
    siblingId: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await apiPost<{ student: { id: string } }>("/api/students", form);
    setSaving(false);
    if (!res.data?.student) {
      setError(res.error || "Admission failed");
      return;
    }
    router.push(`/students/${res.data.student.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">New admission</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Duplicate roll numbers are blocked. SEN and hostel flags affect exams and fees.
        </p>
      </div>
      <Card>
        <CardHeader title="Student" description="Required for roster, invoices, and attendance" />
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="First name" value={form.firstName} onChange={(v) => set("firstName", v)} />
          <Input label="Last name" value={form.lastName} onChange={(v) => set("lastName", v)} />
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-zinc-500">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </label>
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
          <Input label="Class" value={form.className} onChange={(v) => set("className", v)} />
          <Input label="Section" value={form.section} onChange={(v) => set("section", v)} />
          <Input label="Roll no" value={form.rollNo} onChange={(v) => set("rollNo", v)} />
          <Input label="Sibling student id (optional)" value={form.siblingId} onChange={(v) => set("siblingId", v)} />
          <Input label="Guardian name" value={form.guardianName} onChange={(v) => set("guardianName", v)} />
          <Input label="Guardian phone" value={form.guardianPhone} onChange={(v) => set("guardianPhone", v)} />
          <label className="flex items-center gap-2 text-sm text-zinc-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isHostel}
              onChange={(e) => set("isHostel", e.target.checked)}
            />
            Hostel student (hostel fee component required)
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="mb-1.5 block text-xs text-zinc-500">Special needs / SEN</span>
            <textarea
              value={form.specialNeeds}
              onChange={(e) => set("specialNeeds", e.target.value)}
              className="min-h-20 w-full rounded-xl border border-zinc-200 p-3 text-sm"
              placeholder="Extra time, scribe, medical protocol..."
            />
          </label>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Admit student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-xs text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-300"
      />
    </label>
  );
}
