"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";

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

type Preview = {
  academicYear: string;
  rolledOver: boolean;
  eligible: number;
  blocked: number;
  students: { id: string; name: string; from: string; to: string; blocked: string[]; eligible: boolean }[];
};

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollMsg, setRollMsg] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Health>("/api/health").then(setHealth);
    apiGet<Audit[]>("/api/audit").then((rows) => setAudit(rows || []));
    apiGet<Preview>("/api/rollover/preview").then(setPreview);
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
          <CardHeader title="Academic year rollover" description="Promote eligible students. Holds stay back." />
          <p className="text-sm text-zinc-600">
            Year {preview?.academicYear || "2025-26"} · eligible {preview?.eligible ?? "—"} · blocked{" "}
            {preview?.blocked ?? "—"}
          </p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-sm">
            {(preview?.students || []).map((s) => (
              <li key={s.id} className="flex justify-between gap-3">
                <span>
                  {s.name} · {s.from} → {s.to}
                </span>
                <span className={s.eligible ? "text-emerald-600" : "text-amber-600"}>
                  {s.eligible ? "Promote" : s.blocked.join(", ")}
                </span>
              </li>
            ))}
          </ul>
          {rollMsg && <p className="mt-3 text-sm text-emerald-700">{rollMsg}</p>}
          <div className="mt-4">
            <Button
              size="sm"
              loading={rolling}
              disabled={preview?.rolledOver}
              onClick={async () => {
                setRolling(true);
                const res = await apiPost<{ promoted: number; held: number; academicYear: string }>("/api/rollover", {
                  confirm: true,
                });
                setRolling(false);
                if (res.data) {
                  setRollMsg(`Rolled to ${res.data.academicYear}. Promoted ${res.data.promoted}, held ${res.data.held}.`);
                  apiGet<Preview>("/api/rollover/preview").then(setPreview);
                  apiGet<Audit[]>("/api/audit").then((rows) => setAudit(rows || []));
                } else {
                  setRollMsg(res.error || "Rollover failed");
                }
              }}
            >
              {preview?.rolledOver ? "Already rolled over" : "Run rollover to 2026-27"}
            </Button>
          </div>
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
