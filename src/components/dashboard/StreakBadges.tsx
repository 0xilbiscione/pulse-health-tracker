import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StreakCard({
  loggingStreak,
  bestGoal,
}: {
  loggingStreak: number;
  bestGoal: { label: string; streak: number; color: string } | null;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] bg-[#f5731f1a] text-[var(--color-activity)]">
          <Flame size={26} />
        </div>
        <div>
          <p className="font-display text-2xl font-bold tracking-[-0.01em]">
            {loggingStreak} {loggingStreak === 1 ? "day" : "days"}
          </p>
          <p className="text-sm text-[var(--color-muted)]">Logging streak</p>
        </div>
      </div>
      {bestGoal && bestGoal.streak > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-bg)] px-3 py-2.5">
          <span className="text-sm text-[var(--color-muted)]">
            {bestGoal.label} goal streak
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: bestGoal.color }}
          >
            {bestGoal.streak} {bestGoal.streak === 1 ? "day" : "days"} 🔥
          </span>
        </div>
      )}
    </Card>
  );
}
