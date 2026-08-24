"use client";

import { MagnifyingGlass, Bell, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search students, invoices, staff..."
          className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-zinc-500" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>

        <div className="ml-2 flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-zinc-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
            SM
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-zinc-900">Sara Malik</p>
            <p className="text-[10px] text-zinc-400">Principal</p>
          </div>
          <CaretDown className="h-3.5 w-3.5 text-zinc-400" />
        </div>
      </div>
    </header>
  );
}
