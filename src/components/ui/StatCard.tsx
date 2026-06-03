import { cn } from "@/lib/cn";
import { Card } from "./Card";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = "var(--color-brand-600)",
  delta,
  goodDirection = "up",
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  delta?: { pct: number | null; direction: "up" | "down" | "flat" };
  goodDirection?: "up" | "down";
}) {
  let deltaEl: React.ReactNode = null;
  if (delta && delta.pct !== null && delta.direction !== "flat") {
    const isGood =
      (delta.direction === "up" && goodDirection === "up") ||
      (delta.direction === "down" && goodDirection === "down");
    const Icon = delta.direction === "up" ? ArrowUpRight : ArrowDownRight;
    deltaEl = (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium",
          isGood ? "text-emerald-600" : "text-red-500",
        )}
      >
        <Icon size={13} />
        {Math.abs(delta.pct).toFixed(0)}%
      </span>
    );
  } else if (delta && delta.direction === "flat") {
    deltaEl = (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--color-muted)]">
        <Minus size={13} />
      </span>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {icon}
        </div>
        {deltaEl}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {value}
          </span>
          {unit && (
            <span className="text-xs text-[var(--color-muted)]">{unit}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">{label}</p>
      </div>
    </Card>
  );
}
