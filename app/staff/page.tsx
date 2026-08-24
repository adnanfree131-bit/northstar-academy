"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  Envelope,
  Phone,
  Briefcase,
} from "@phosphor-icons/react";
import { staff as mockStaff, type StaffMember } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiGet, apiPost } from "@/lib/api";

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "Teacher",
    email: "",
    phone: "",
    department: "",
    subjects: "",
  });

  async function load() {
    const rows = await apiGet<StaffMember[]>("/api/staff");
    if (rows?.length) {
      setStaff(
        rows.map((s) => ({
          ...s,
          employeeId: (s as StaffMember).employeeId || (s as { employee_id?: string }).employee_id || "",
          joiningDate: (s as StaffMember).joiningDate || (s as { joining_date?: string }).joining_date || "",
          workloadHours: (s as StaffMember).workloadHours ?? (s as { workload_hours?: number }).workload_hours ?? 0,
          classesAssigned: s.classesAssigned || [],
          subjects: s.subjects || [],
        }))
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  const roles = useMemo(() => Array.from(new Set(staff.map((s) => s.role))), [staff]);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  async function addStaff() {
    setSaving(true);
    const res = await apiPost("/api/staff", form);
    setSaving(false);
    if (res.data) {
      setOpen(false);
      setForm({ name: "", role: "Teacher", email: "", phone: "", department: "", subjects: "" });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Staff</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Teachers, administration, and support staff with workload and leave tracking
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" weight="bold" />
          Add Staff Member
        </Button>
      </div>

      <Card padding="sm" bezel={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setRoleFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                roleFilter === "all" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              All
            </button>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  roleFilter === r ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <p className="py-12 text-center text-sm text-zinc-500">No staff members found.</p>
        </Card>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Add staff</h2>
            <div className="mt-4 space-y-2">
              {(["name", "email", "phone", "department", "subjects"] as const).map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
                />
              ))}
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              >
                <option>Teacher</option>
                <option>Accountant</option>
                <option>Admin</option>
                <option>Librarian</option>
                <option>Support</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={addStaff}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div className="bezel">
      <div className="bezel-inner p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200/50">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="font-medium text-zinc-900">{member.name}</p>
              <p className="text-xs text-zinc-400">{member.employeeId}</p>
            </div>
          </div>
          <Badge
            variant={
              member.status === "active"
                ? "success"
                : member.status === "on-leave"
                ? "warning"
                : "muted"
            }
            dot
          >
            {member.status.replace("-", " ")}
          </Badge>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-zinc-600">
            <Briefcase className="h-4 w-4 text-zinc-400" />
            {member.role}
            {member.department && ` · ${member.department}`}
          </p>
          <p className="flex items-center gap-2 text-zinc-600">
            <Envelope className="h-4 w-4 text-zinc-400" />
            {member.email}
          </p>
          <p className="flex items-center gap-2 text-zinc-600">
            <Phone className="h-4 w-4 text-zinc-400" />
            {member.phone}
          </p>
        </div>

        {member.subjects && member.subjects.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.subjects.map((sub) => (
              <span
                key={sub}
                className="rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-100"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-50 pt-3 text-xs text-zinc-500">
          <span>Joined {formatDate(member.joiningDate)}</span>
          <span className="font-medium text-zinc-700">{member.workloadHours}h / week</span>
        </div>

        {member.classesAssigned.length > 0 && (
          <p className="mt-2 text-xs text-zinc-400">
            Classes: {member.classesAssigned.join(", ")}
          </p>
        )}

        {member.status === "on-leave" && (
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
            Currently on leave — substitutions may be required for assigned periods.
          </div>
        )}
      </div>
    </div>
  );
}
