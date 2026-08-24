"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

const demos: { role: Role; email: string; name: string }[] = [
  { role: "principal", email: "principal@northstar.edu", name: "Principal" },
  { role: "teacher", email: "teacher@northstar.edu", name: "Teacher" },
  { role: "accountant", email: "accounts@northstar.edu", name: "Accountant" },
  { role: "parent", email: "parent@northstar.edu", name: "Parent" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("principal@northstar.edu");
  const [password, setPassword] = useState("northstar");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace(email.startsWith("parent") ? "/portal" : "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            <span className="text-sm font-bold">NS</span>
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-zinc-900">Northstar Academy</p>
            <p className="text-xs text-zinc-400">School operating system · 2025-26</p>
          </div>
        </div>

        <div className="bezel">
          <form onSubmit={submit} className="bezel-inner space-y-4 p-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Sign in</h1>
              <p className="mt-1 text-sm text-zinc-500">Demo auth. Password for every role is <span className="font-medium text-zinc-700">northstar</span>.</p>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Continue
            </Button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {demos.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword("northstar");
                  }}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-50"
                >
                  <span className="block font-medium text-zinc-900">{d.name}</span>
                  {d.email}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
