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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <Flame size={26} />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">
            {loggingStreak} {loggingStreak === 1 ? "day" : "days"}
          </p>
          <p className="text-sm text-[var(--color-muted)]">Logging streak</p>
        </div>
      </div>
      {bestGoal && bestGoal.streak > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--color-bg)] px-3 py-2.5">
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
