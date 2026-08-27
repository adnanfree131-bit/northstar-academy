import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Group({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title ? (
        <h2 className="mb-2 px-1 text-caption font-medium uppercase tracking-wider text-faint">{title}</h2>
      ) : null}
      <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">{children}</div>
    </section>
  );
}

export function Row({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-14 w-full items-center gap-3 border-b border-line px-4 py-3 last:border-b-0", className)}>
      {children}
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-pine-soft text-label font-medium text-pine",
        className,
      )}
    >
      {initials}
    </span>
  );
}
