"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Student } from "@/lib/mock-data";

type Account = {
  id: string;
  email: string;
  name: string;
  role: "principal" | "teacher" | "accountant" | "parent";
  student_id: string | null;
  status: string;
};

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "teacher",
    password: "northstar",
    studentId: "",
  });

  async function load() {
    const rows = await apiGet<Account[]>("/api/users");
    if (rows) setAccounts(rows);
    const stu = await apiGet<Student[]>("/api/students");
    if (stu) setStudents(stu);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? accounts : accounts.filter((a) => a.role === filter)),
    [accounts, filter]
  );

  if (user && user.role !== "principal") {
    return <p className="text-sm text-zinc-500">Only the principal can manage login accounts.</p>;
  }

  async function create() {
    setSaving(true);
    const res = await apiPost<{ email: string; password: string }>("/api/users", {
      ...form,
      studentId: form.role === "parent" ? form.studentId : undefined,
    });
    setSaving(false);
    if (!res.data) {
      setMessage(res.error || "Could not create account");
      return;
    }
    setMessage(`Created ${res.data.email}. Password: ${res.data.password}`);
    setOpen(false);
    setForm({ name: "", email: "", role: "teacher", password: "northstar", studentId: "" });
    await load();
  }

  async function setStatus(id: string, status: string) {
    const res = await apiPost(`/api/users/${id}`, { status });
    setMessage(res.data ? `Account ${status}` : res.error || "Update failed");
    await load();
  }

  async function resetPassword(id: string, email: string) {
    const res = await apiPost<{ password: string }>(`/api/users/${id}/password`, { password: "northstar" });
    setMessage(res.data ? `Password for ${email} reset to northstar` : res.error || "Reset failed");
  }

  async function changeRole(id: string, role: string) {
    const res = await apiPost(`/api/users/${id}`, { role });
    setMessage(res.data ? "Role updated" : res.error || "Role update failed");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Principal manages every login. No email invite — you create the password and give it to staff or parents.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" weight="bold" />
          New account
        </Button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {["all", "principal", "teacher", "accountant", "parent"].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
              filter === r ? "bg-zinc-900 text-white" : "text-zinc-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Linked student</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-900">{a.name}</p>
                    <p className="text-xs text-zinc-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={a.role}
                      onChange={(e) => changeRole(a.id, e.target.value)}
                      className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs"
                    >
                      <option value="principal">principal</option>
                      <option value="teacher">teacher</option>
                      <option value="accountant">accountant</option>
                      <option value="parent">parent</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-zinc-600">
                    {a.student_id
                      ? students.find((s) => s.id === a.student_id)?.fullName || a.student_id
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={a.status === "active" ? "success" : "muted"}>{a.status || "active"}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => resetPassword(a.id, a.email)}>
                        Reset password
                      </Button>
                      {a.status === "disabled" ? (
                        <Button size="sm" onClick={() => setStatus(a.id, "active")}>
                          Restore
                        </Button>
                      ) : (
                        <Button size="sm" variant="danger" onClick={() => setStatus(a.id, "disabled")}>
                          Disable
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="How this works" />
        <ul className="space-y-2 text-sm text-zinc-600">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-zinc-400" />
            No email verification. You create the account and share email + password.
          </li>
          <li>Default password is <span className="font-medium">northstar</span> unless you set another.</li>
          <li>Parent accounts must be linked to a student or the portal will be empty.</li>
          <li>The last principal cannot be disabled or demoted.</li>
          <li>Reset password also signs that user out of existing sessions.</li>
        </ul>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">New login account</h2>
            <div className="mt-4 space-y-2">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
              <input
                placeholder="Email used to sign in"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              >
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="parent">Parent</option>
                <option value="principal">Principal</option>
              </select>
              {form.role === "parent" && (
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  className="h-10 w-full rounded-xl border px-3 text-sm"
                >
                  <option value="">Link to student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} · {s.className}-{s.section}
                    </option>
                  ))}
                </select>
              )}
              <input
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="h-10 w-full rounded-xl border px-3 text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={create}>
                Create account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
