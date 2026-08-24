"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PencilSimple,
  Phone,
  Envelope,
  Warning,
  Heart,
  Bus,
  House,
  FileText,
  CurrencyCircleDollar,
  CalendarCheck,
  Users,
  IdentificationCard,
} from "@phosphor-icons/react";
import { students, feeInvoices, type Student, type FeeInvoice } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet } from "@/lib/api";

const tabs = [
  { id: "overview", label: "Overview", icon: IdentificationCard },
  { id: "guardians", label: "Guardians", icon: Users },
  { id: "medical", label: "Medical & SEN", icon: Heart },
  { id: "fees", label: "Fee History", icon: CurrencyCircleDollar },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "documents", label: "Documents", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function StudentDetail({ id }: { id: string }) {
  const fallback = students.find((s) => s.id === id);
  const [student, setStudent] = useState<Student | null>(fallback || null);
  const [studentInvoices, setStudentInvoices] = useState<FeeInvoice[]>(
    feeInvoices.filter((i) => i.studentId === id)
  );
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [live, setLive] = useState(false);

  useEffect(() => {
    apiGet<{
      student: Student;
      invoices: {
        id: string;
        student_id: string;
        student_name: string;
        class_name: string;
        academic_year: string;
        term: string;
        total_amount: number;
        paid_amount: number;
        due_date: string;
        status: FeeInvoice["status"];
        late_fee: number;
        discount: number;
        discount_reason?: string;
      }[];
    }>(`/api/students/${id}`).then((data) => {
      if (!data?.student) return;
      setStudent({
        ...data.student,
        siblingIds: data.student.siblingIds || [],
        guardians: data.student.guardians || [],
      });
      setStudentInvoices(
        (data.invoices || []).map((inv) => ({
          id: inv.id,
          studentId: inv.student_id,
          studentName: inv.student_name,
          className: inv.class_name,
          academicYear: inv.academic_year,
          term: inv.term,
          components: [],
          totalAmount: inv.total_amount,
          paidAmount: inv.paid_amount,
          dueDate: inv.due_date,
          status: inv.status,
          lateFee: inv.late_fee,
          discount: inv.discount,
          discountReason: inv.discount_reason,
        }))
      );
      setLive(true);
    });
  }, [id]);

  if (!student) {
    return <p className="text-sm text-zinc-500">Student not found.</p>;
  }

  const primaryGuardian = student.guardians.find((g) => g.isPrimary) || student.guardians[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <PencilSimple className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button size="sm">Collect Fee</Button>
        </div>
      </div>

      <div className="bezel">
        <div className="bezel-inner p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-2xl font-semibold text-zinc-600 ring-1 ring-zinc-200/60">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {student.fullName}
                </h1>
                <Badge
                  variant={
                    student.status === "active"
                      ? "success"
                      : student.status === "suspended"
                      ? "danger"
                      : "muted"
                  }
                  dot
                >
                  {student.status}
                </Badge>
                {student.isHostel && <Badge variant="info">Hostel</Badge>}
                {student.specialNeeds && <Badge variant="warning">SEN</Badge>}
                {student.siblingIds?.length > 0 && (
                  <Badge variant="accent">{student.siblingIds.length} Sibling(s)</Badge>
                )}
              </div>

              <p className="mt-1 text-sm text-zinc-500">
                {student.admissionNo} · Class {student.className}-{student.section} · Roll{" "}
                {student.rollNo}
                {live ? " · D1" : ""}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-zinc-400" />
                  Admitted {formatDate(student.admissionDate)}
                </span>
                {primaryGuardian && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    {primaryGuardian.phone}
                  </span>
                )}
                {student.transportRoute && (
                  <span className="inline-flex items-center gap-1.5">
                    <Bus className="h-4 w-4 text-zinc-400" />
                    {student.transportRoute}
                  </span>
                )}
                {student.isHostel && (
                  <span className="inline-flex items-center gap-1.5">
                    <House className="h-4 w-4 text-zinc-400" />
                    Hostel Resident
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 sm:flex-col sm:gap-3">
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-center ring-1 ring-zinc-100">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Attendance
                </p>
                <p
                  className={`mt-0.5 text-lg font-semibold ${
                    student.attendancePercent >= 90
                      ? "text-emerald-600"
                      : student.attendancePercent >= 80
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {student.attendancePercent}%
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-center ring-1 ring-zinc-100">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Fee Balance
                </p>
                <p className="mt-0.5 text-lg font-semibold text-zinc-900">
                  {student.feeBalance > 0 ? formatCurrency(student.feeBalance) : "Clear"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Personal Information" />
            <dl className="space-y-3 text-sm">
              {[
                { label: "Full Name", value: student.fullName },
                { label: "Gender", value: student.gender },
                { label: "Date of Birth", value: formatDate(student.dateOfBirth) },
                { label: "Blood Group", value: student.bloodGroup || "—" },
                { label: "Admission No", value: student.admissionNo },
                { label: "Admission Date", value: formatDate(student.admissionDate) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-zinc-50 pb-2.5 last:border-0">
                  <dt className="text-zinc-500">{row.label}</dt>
                  <dd className="font-medium text-zinc-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Academic & Logistics" />
            <dl className="space-y-3 text-sm">
              {[
                { label: "Class / Section", value: `${student.className}-${student.section}` },
                { label: "Roll Number", value: student.rollNo },
                { label: "Transport", value: student.transportRoute || "Self" },
                { label: "Residence", value: student.isHostel ? "Hostel" : "Day Scholar" },
                {
                  label: "Siblings in School",
                  value: student.siblingIds.length > 0 ? `${student.siblingIds.length} linked` : "None",
                },
                { label: "Status", value: student.status },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-zinc-50 pb-2.5 last:border-0">
                  <dt className="text-zinc-500">{row.label}</dt>
                  <dd className="font-medium capitalize text-zinc-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {student.status === "suspended" && (
            <Card className="lg:col-span-2">
              <div className="flex gap-3 rounded-xl bg-red-50 p-4">
                <Warning className="h-5 w-5 shrink-0 text-red-600" weight="fill" />
                <div>
                  <p className="text-sm font-medium text-red-900">Student Currently Suspended</p>
                  <p className="mt-1 text-sm text-red-700">
                    Fee default and low attendance. Contact primary guardian before any academic
                    action. Suspension review scheduled.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "guardians" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {student.guardians.map((g) => (
            <div key={g.id} className="bezel">
              <div className="bezel-inner p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{g.name}</p>
                    <p className="text-sm text-zinc-500">{g.relation}</p>
                  </div>
                  {g.isPrimary && <Badge variant="accent">Primary</Badge>}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-zinc-600">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    {g.phone}
                  </p>
                  {g.email && (
                    <p className="flex items-center gap-2 text-zinc-600">
                      <Envelope className="h-4 w-4 text-zinc-400" />
                      {g.email}
                    </p>
                  )}
                  {g.occupation && (
                    <p className="text-zinc-500">Occupation: {g.occupation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "medical" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Medical Profile" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-zinc-50 pb-2.5">
                <dt className="text-zinc-500">Blood Group</dt>
                <dd className="font-medium text-zinc-900">{student.bloodGroup || "Not recorded"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-2.5">
                <dt className="text-zinc-500">Allergies</dt>
                <dd className="font-medium text-zinc-900">
                  {student.allergies?.length ? student.allergies.join(", ") : "None recorded"}
                </dd>
              </div>
              <div className="pt-1">
                <dt className="text-zinc-500">Medical Notes</dt>
                <dd className="mt-1.5 rounded-xl bg-zinc-50 p-3 text-zinc-700 ring-1 ring-zinc-100">
                  {student.medicalNotes || "No special medical notes."}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Special Educational Needs" />
            {student.specialNeeds ? (
              <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
                <p className="text-sm font-medium text-amber-900">Active SEN Flag</p>
                <p className="mt-2 text-sm text-amber-800">{student.specialNeeds}</p>
                <p className="mt-3 text-xs text-amber-700">
                  Extra time on written exams is approved. Notify invigilators automatically.
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No special educational needs recorded.</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="space-y-4">
          {studentInvoices.length === 0 ? (
            <Card>
              <p className="py-10 text-center text-sm text-zinc-500">
                No fee invoices found for this student.
              </p>
            </Card>
          ) : (
            studentInvoices.map((inv) => {
              const balance = inv.totalAmount - inv.paidAmount + inv.lateFee;
              return (
                <div key={inv.id} className="bezel">
                  <div className="bezel-inner p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900">
                            {inv.term} · {inv.academicYear}
                          </p>
                          <Badge
                            variant={
                              inv.status === "paid"
                                ? "success"
                                : inv.status === "overdue"
                                ? "danger"
                                : inv.status === "partial"
                                ? "warning"
                                : "info"
                            }
                            dot
                          >
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          Invoice {inv.id} · Due {formatDate(inv.dueDate)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {inv.components.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-100"
                            >
                              {c.name}: {formatCurrency(c.amount)}
                            </span>
                          ))}
                          {inv.discount > 0 && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100">
                              Discount −{formatCurrency(inv.discount)}
                              {inv.discountReason ? ` (${inv.discountReason})` : ""}
                            </span>
                          )}
                          {inv.lateFee > 0 && (
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] text-red-700 ring-1 ring-red-100">
                              Late fee +{formatCurrency(inv.lateFee)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400">Balance</p>
                        <p className="text-lg font-semibold text-zinc-900">
                          {balance > 0 ? formatCurrency(balance) : "Paid"}
                        </p>
                        {inv.lastPaymentDate && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Last paid {formatDate(inv.lastPaymentDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader
            title="Attendance Summary"
            description="Current academic year"
            action={
              <span
                className={`text-2xl font-semibold ${
                  student.attendancePercent >= 90
                    ? "text-emerald-600"
                    : student.attendancePercent >= 80
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {student.attendancePercent}%
              </span>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Present", value: "168", color: "text-emerald-600" },
              { label: "Absent", value: "7", color: "text-red-600" },
              { label: "Late", value: "4", color: "text-amber-600" },
              { label: "Leave", value: "3", color: "text-blue-600" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-zinc-50 px-4 py-3 text-center ring-1 ring-zinc-100"
              >
                <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            Detailed daily / period-wise records available in the Attendance module. Low
            attendance triggers automatic guardian notification after 3 consecutive absences.
          </p>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardHeader title="Document Vault" description="Uploaded student documents" />
          <div className="space-y-2">
            {[
              { name: "Birth Certificate", status: "Verified", date: "2020-04-02" },
              { name: "Previous School TC", status: "Verified", date: "2020-03-28" },
              { name: "Medical Fitness Certificate", status: "Verified", date: "2025-03-15" },
              { name: "CNIC of Father (copy)", status: "Verified", date: "2020-04-02" },
              { name: "Passport-size Photograph", status: "Verified", date: "2025-08-01" },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{doc.name}</p>
                    <p className="text-xs text-zinc-400">Uploaded {formatDate(doc.date)}</p>
                  </div>
                </div>
                <Badge variant="success">{doc.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
