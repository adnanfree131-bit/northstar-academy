"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bank, CalendarCheck, DotsThree, House, Student } from "@phosphor-icons/react";
import { useAuth, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: typeof House; roles: Role[] }[] = [
  { href: "/", label: "Home", icon: House, roles: ["principal", "teacher", "accountant"] },
  { href: "/students", label: "Students", icon: Student, roles: ["principal", "teacher", "accountant"] },
  { href: "/attendance", label: "Attend", icon: CalendarCheck, roles: ["principal", "teacher"] },
  { href: "/fees", label: "Fees", icon: Bank, roles: ["principal", "accountant"] },
  { href: "/more", label: "More", icon: DotsThree, roles: ["principal", "teacher", "accountant", "parent"] },
];

const rail: { href: string; label: string; roles: Role[] }[] = [
  { href: "/", label: "Home", roles: ["principal", "teacher", "accountant"] },
  { href: "/students", label: "Students", roles: ["principal", "teacher", "accountant"] },
  { href: "/attendance", label: "Attendance", roles: ["principal", "teacher"] },
  { href: "/fees", label: "Fees", roles: ["principal", "accountant"] },
  { href: "/exams", label: "Exams", roles: ["principal", "teacher"] },
  { href: "/timetable", label: "Timetable", roles: ["principal", "teacher"] },
  { href: "/staff", label: "Staff", roles: ["principal"] },
  { href: "/notes", label: "Notes", roles: ["principal", "teacher", "accountant"] },
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
      <div className="flex min-h-dvh items-center justify-center bg-paper text-body text-muted">
        Northstar
      </div>
    );
  }

  const visibleTabs = tabs.filter((t) => t.roles.includes(user.role));
  const visibleRail = rail.filter((t) => t.roles.includes(user.role));

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-line bg-card md:flex">
        <div className="px-5 pb-6 pt-8">
          <p className="text-label font-medium tracking-tight text-faint">Northstar</p>
          <p className="mt-1 text-title font-medium tracking-tight">Academy</p>
          <p className="mt-1 text-caption text-muted">2025–26</p>
        </div>
        <nav className="flex-1 px-3">
          {visibleRail.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center rounded-md px-3 text-body",
                  active ? "bg-pine text-pine-fg" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-body font-medium">{user.name}</p>
          <p className="text-caption capitalize text-muted">{user.role}</p>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-3 text-label text-muted"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-56">
        <main className="mx-auto min-h-dvh max-w-3xl px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] md:max-w-5xl md:px-8 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0,1fr))` }}>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-caption",
                    active ? "text-pine" : "text-faint",
                  )}
                >
                  <Icon className="h-5 w-5" weight={active ? "fill" : "regular"} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
