"use client";

import { cn } from "@/lib/utils";
import {
  House,
  Students,
  CurrencyCircleDollar,
  CalendarCheck,
  Exam,
  CalendarBlank,
  UsersThree,
  ChartBar,
  Gear,
  Bell,
  SignOut,
  CaretRight,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: House },
      { href: "/analytics", label: "Analytics", icon: ChartBar },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/students", label: "Students", icon: Students },
      { href: "/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/exams", label: "Exams & Results", icon: Exam },
      { href: "/timetable", label: "Timetable", icon: CalendarBlank },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/fees", label: "Fees & Payments", icon: CurrencyCircleDollar },
      { href: "/staff", label: "Staff", icon: UsersThree },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-zinc-100 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-zinc-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <span className="text-sm font-bold tracking-tight">NS</span>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-900">Northstar Academy</p>
          <p className="text-[11px] text-zinc-400">Academic Year 2025-26</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        isActive
                          ? "bg-zinc-900 text-white shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      <Icon
                        weight={isActive ? "fill" : "regular"}
                        className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600")}
                      />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <CaretRight className="h-3.5 w-3.5 opacity-60" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Gear className="h-[18px] w-[18px] text-zinc-400" />
          Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
          <SignOut className="h-[18px] w-[18px] text-zinc-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
