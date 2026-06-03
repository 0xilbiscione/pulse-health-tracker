import { getEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import { GoalsManager } from "@/components/forms/GoalsManager";
import { METRICS } from "@/lib/metrics";
import { todayIso } from "@/lib/dates";

export default async function GoalsPage() {
  const [entries, goals] = await Promise.all([getEntries(7), getGoals()]);
  const today = todayIso();
  const todayEntry = entries.find((e) => e.date === today);

  const todayValues: Record<string, number | null> = {};
  for (const def of METRICS) {
    const v = todayEntry ? todayEntry[def.field] : null;
    todayValues[def.field] = typeof v === "number" ? v : null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          Toggle goals on and set daily targets. Active goals show on your dashboard.
        </p>
      </div>

      <GoalsManager goals={goals} todayValues={todayValues} />
    </div>
  );
}
