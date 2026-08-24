"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet } from "@/lib/api";

type Health = {
  ok: boolean;
  database?: string;
  r2?: boolean;
  tables?: string[];
  error?: string;
};

type Audit = {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [audit, setAudit] = useState<Audit[]>([]);

  useEffect(() => {
    apiGet<Health>("/api/health").then(setHealth);
    apiGet<Audit[]>("/api/audit").then((rows) => setAudit(rows || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Infrastructure, academic year, and audit trail</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cloudflare bindings" />
          <dl className="space-y-3 text-sm">
            <Row
              label="D1"
              value={health?.ok ? health.database || "connected" : health?.error || "not connected"}
              ok={Boolean(health?.ok)}
            />
            <Row label="R2 documents" value={health?.r2 ? "enabled" : "enable in dashboard"} ok={Boolean(health?.r2)} />
            <Row label="GitHub" value="adnanfree131-bit/northstar-academy" ok />
            <Row label="Pages" value="northstar-academy.pages.dev" ok />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Academic year" />
          <dl className="space-y-3 text-sm">
            <Row label="Current year" value="2025-26" ok />
            <Row label="Rollover" value="Locked until Term 2 results publish" ok={false} />
            <Row label="Promotion rules" value="Attendance ≥ 80% and no fee hold" ok />
            <Row label="SEN extra time" value="25% on written papers" ok />
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader title="D1 tables" description="Live schema from northstar-db" />
        <div className="flex flex-wrap gap-2">
          {(health?.tables || []).map((t) => (
            <Badge key={t} variant="muted">
              {t}
            </Badge>
          ))}
          {!health?.tables?.length && <p className="text-sm text-zinc-500">No tables yet — waiting for D1 bind.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Audit log" description="Last 50 critical actions" />
        <div className="overflow-hidden rounded-xl border border-zinc-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {audit.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 text-zinc-500">{row.created_at}</td>
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{row.action}</td>
                  <td className="px-4 py-2.5 text-zinc-600">
                    {row.entity}
                    {row.entity_id ? ` · ${row.entity_id}` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{row.detail}</td>
                </tr>
              ))}
              {audit.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-zinc-400" colSpan={4}>
                    No audit rows yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-50 pb-2.5 last:border-0">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-zinc-900">
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
        {value}
      </dd>
    </div>
  );
}
