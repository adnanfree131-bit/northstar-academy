"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MagnifyingGlass,
  Plus,
  Funnel,
  DownloadSimple,
  CaretDown,
  Eye,
  PencilSimple,
  DotsThree,
} from "@phosphor-icons/react";
import { students as mockStudents, type Student, type StudentStatus } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const statusFilters: { label: string; value: StudentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Transferred", value: "transferred" },
  { label: "Alumni", value: "alumni" },
];

export default function StudentsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [live, setLive] = useState(false);

  useEffect(() => {
    apiGet<Student[]>("/api/students").then((rows) => {
      if (rows?.length) {
        setStudents(rows);
        setLive(true);
      }
    });
  }, []);

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.includes(search);
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesClass = classFilter === "all" || s.className === classFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [search, statusFilter, classFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Students</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage student records, admissions, and academic profiles
            {live ? " · live D1" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <DownloadSimple className="h-4 w-4" />
            Export
          </Button>
          {can("students.admit") && (
            <Link href="/students/new">
              <Button size="sm">
                <Plus className="h-4 w-4" weight="bold" />
                New Admission
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <Card padding="sm" bezel={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, admission no, or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === f.value
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-300"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-zinc-500">
        Showing <span className="font-medium text-zinc-900">{filtered.length}</span> of{" "}
        {students.length} students
      </p>

      {/* Table */}
      <Card padding="none" bezel={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3.5 font-medium">Student</th>
                <th className="px-5 py-3.5 font-medium">Class / Section</th>
                <th className="px-5 py-3.5 font-medium">Guardians</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Attendance</th>
                <th className="px-5 py-3.5 font-medium text-right">Fee Balance</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((s) => (
                <StudentRow key={s.id} student={s} />
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm font-medium text-zinc-900">No students found</p>
              <p className="mt-1 text-sm text-zinc-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StudentRow({ student: s }: { student: Student }) {
  const primaryGuardian = s.guardians.find((g) => g.isPrimary) || s.guardians[0];

  return (
    <tr className="group transition-colors hover:bg-zinc-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200/50">
            {s.firstName[0]}
            {s.lastName[0]}
          </div>
          <div>
            <Link
              href={`/students/profile?id=${s.id}`}
              className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
            >
              {s.fullName}
            </Link>
            <p className="text-xs text-zinc-400">{s.admissionNo}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="font-medium text-zinc-700">
          {s.className}-{s.section}
        </span>
        <p className="text-xs text-zinc-400">Roll {s.rollNo}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-zinc-700">{primaryGuardian?.name}</p>
        <p className="text-xs text-zinc-400">{primaryGuardian?.phone}</p>
      </td>
      <td className="px-5 py-4">
        <Badge
          variant={
            s.status === "active"
              ? "success"
              : s.status === "suspended"
              ? "danger"
              : s.status === "transferred"
              ? "warning"
              : "muted"
          }
          dot
        >
          {s.status}
        </Badge>
        {s.isHostel && (
          <Badge variant="info" className="ml-1.5">
            Hostel
          </Badge>
        )}
        {s.specialNeeds && (
          <Badge variant="warning" className="ml-1.5">
            SEN
          </Badge>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        <span
          className={
            s.attendancePercent >= 90
              ? "font-medium text-emerald-600"
              : s.attendancePercent >= 80
              ? "font-medium text-amber-600"
              : "font-medium text-red-600"
          }
        >
          {s.attendancePercent}%
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        {s.feeBalance > 0 ? (
          <span className="font-medium text-zinc-900">{formatCurrency(s.feeBalance)}</span>
        ) : (
          <span className="text-zinc-400">Clear</span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link href={`/students/profile?id=${s.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4 text-zinc-500" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PencilSimple className="h-4 w-4 text-zinc-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <DotsThree className="h-4 w-4 text-zinc-500" weight="bold" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
