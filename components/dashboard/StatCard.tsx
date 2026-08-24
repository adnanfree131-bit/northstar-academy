import { cn } from "@/lib/utils";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "emerald" | "amber" | "red" | "violet";
}

const accentStyles = {
  blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
  emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
  amber: "from-amber-500/10 to-amber-500/5 text-amber-600",
  red: "from-red-500/10 to-red-500/5 text-red-600",
  violet: "from-violet-500/10 to-violet-500/5 text-violet-600",
};

export function StatCard({ label, value, change, changeLabel, icon, accent = "blue" }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bezel">
      <div className="bezel-inner p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-zinc-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                accentStyles[accent]
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {isPositive ? <TrendUp className="h-3.5 w-3.5" weight="bold" /> : <TrendDown className="h-3.5 w-3.5" weight="bold" />}
              {Math.abs(change)}%
            </span>
            {changeLabel && <span className="text-xs text-zinc-400">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
