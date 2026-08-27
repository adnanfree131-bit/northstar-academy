"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const demos: { role: Role; email: string; name: string }[] = [
  { role: "principal", email: "principal@northstar.edu", name: "Nadia Rahman" },
  { role: "teacher", email: "teacher@northstar.edu", name: "Farid Malik" },
  { role: "accountant", email: "accounts@northstar.edu", name: "Hina Qureshi" },
  { role: "parent", email: "parent@northstar.edu", name: "Imran Khan" },
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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-paper px-6 py-10">
      <p className="text-label font-medium tracking-tight text-faint">Northstar Academy</p>
      <h1 className="mt-2 text-display font-medium tracking-tight">Sign in</h1>
      <p className="mt-2 text-body text-muted">Campus operations for 2025–26. Demo password is northstar.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-caption font-medium text-muted">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-md bg-card px-3 text-body shadow-[var(--shadow-card)] outline-none ring-pine focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-caption font-medium text-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-md bg-card px-3 text-body shadow-[var(--shadow-card)] outline-none ring-pine focus:ring-2"
          />
        </label>
        {error ? <p className="text-label text-danger">{error}</p> : null}
        <Button type="submit" loading={loading} className="h-11 w-full rounded-md bg-pine text-pine-fg hover:bg-pine">
          Continue
        </Button>
      </form>

      <ul className="mt-8 overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
        {demos.map((d) => (
          <li key={d.role}>
            <button
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword("northstar");
              }}
              className={cn(
                "flex h-14 w-full items-center justify-between border-b border-line px-4 last:border-b-0",
                email === d.email && "bg-pine-soft",
              )}
            >
              <span>
                <span className="block text-body font-medium">{d.name}</span>
                <span className="text-caption capitalize text-muted">{d.role}</span>
              </span>
              <span className="text-caption text-faint">Use</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
