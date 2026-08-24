import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bezel?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className, bezel = true, padding = "md" }: CardProps) {
  if (!bezel) {
    return (
      <div
        className={cn(
          "rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.04)]",
          paddings[padding],
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("bezel", className)}>
      <div className={cn("bezel-inner", paddings[padding])}>{children}</div>
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
