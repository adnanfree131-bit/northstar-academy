"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading || isLogin) return;
    if (!user) router.replace("/login");
    if (user?.role === "parent" && pathname === "/") router.replace("/portal");
  }, [loading, user, isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-sm text-zinc-500">
        Loading Northstar…
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="pl-[260px]">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] p-6">{children}</main>
      </div>
    </>
  );
}
