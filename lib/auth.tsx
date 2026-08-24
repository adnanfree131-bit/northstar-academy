"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "principal" | "teacher" | "accountant" | "parent";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string | null;
};

type AuthCtx = {
  user: SessionUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  can: (action: string) => boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

const PERMS: Record<Role, string[]> = {
  principal: ["*"],
  teacher: ["students.view", "attendance.mark", "exams.marks", "notes.write", "timetable.view"],
  accountant: ["students.view", "students.admit", "fees.collect", "notes.write", "analytics.view"],
  parent: ["portal.view"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ns_token");
    if (!stored) {
      setLoading(false);
      return;
    }
    fetch("/api/me", { headers: { authorization: `Bearer ${stored}` }, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("invalid");
        const data = (await res.json()) as SessionUser;
        setToken(stored);
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("ns_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      token,
      loading,
      async login(email, password) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as { token?: string; user?: SessionUser; error?: string };
        if (!res.ok || !data.token || !data.user) return data.error || "Login failed";
        localStorage.setItem("ns_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return null;
      },
      logout() {
        localStorage.removeItem("ns_token");
        setToken(null);
        setUser(null);
      },
      can(action) {
        if (!user) return false;
        const list = PERMS[user.role] || [];
        return list.includes("*") || list.includes(action);
      },
    }),
    [user, token, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("ns_token");
  return token ? { authorization: `Bearer ${token}` } : {};
}
