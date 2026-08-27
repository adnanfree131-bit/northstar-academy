"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bell, GearSix, SignOut, User } from "@phosphor-icons/react";
import { useAuth, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; roles: Role[] }[] = [
  { href: "/", label: "Dashboard", roles: ["principal", "teacher", "accountant"] },
  { href: "/students", label: "Students", roles: ["principal", "teacher", "accountant"] },
  { href: "/attendance", label: "Attendance", roles: ["principal", "teacher"] },
  { href: "/exams", label: "Exams", roles: ["principal", "teacher"] },
  { href: "/timetable", label: "Timetable", roles: ["principal", "teacher"] },
  { href: "/fees", label: "Fees", roles: ["principal", "accountant"] },
  { href: "/staff", label: "Staff", roles: ["principal"] },
  { href: "/notes", label: "Notes", roles: ["principal", "teacher", "accountant"] },
  { href: "/portal", label: "Portal", roles: ["parent"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading || isLogin) return;
    if (!user) router.replace("/login");
    if (user?.role === "parent" && pathname === "/") router.replace("/portal");
  }, [loading, user, isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="ns-shell flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading Northstar…
      </div>
    );
  }

  const items = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="ns-shell min-h-screen px-3 py-3 md:px-5 md:py-4">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-[32px] border border-white/70 bg-white/25 px-4 pb-8 pt-4 shadow-[0_30px_80px_rgba(90,70,20,0.12)] md:rounded-[40px] md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={user.role === "parent" ? "/portal" : "/"}
            className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white/80 px-5 text-[15px] font-semibold tracking-tight text-zinc-900"
          >
            Northstar
          </Link>

          <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/55 p-1 shadow-inner">
            {items.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user.role === "principal" && (
              <Link
                href="/settings"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/80 text-zinc-700"
              >
                <GearSix className="h-5 w-5" />
              </Link>
            )}
            <button
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/80 text-zinc-700"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </button>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white"
              title="Sign out"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="hidden h-11 items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 text-xs font-medium text-zinc-600 md:flex"
            >
              <SignOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
