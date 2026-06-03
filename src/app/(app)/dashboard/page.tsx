import Link from "next/link";
import {
  Footprints,
  Droplets,
  Moon,
  Flame,
  Scale,
  HeartPulse,
  PlusCircle,
} from "lucide-react";
import { getEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import {
  buildInsightMessages,
  goalProgress,
  goalStreak,
  latest,
  loggingStreak,
  series,
  trend,
} from "@/lib/insights";
import { EntryField, METRIC_BY_KEY, formatMetricValue } from "@/lib/metrics";
import { todayIso } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import { TrendChart } from "@/components/charts/TrendChart";
import { StreakCard } from "@/components/dashboard/StreakBadges";
import { InsightCallout } from "@/components/dashboard/InsightCallout";

export default async function DashboardPage() {
  const [entries, goals] = await Promise.all([getEntries(30), getGoals()]);
  const today = todayIso();
  const hasData = entries.length > 0;

  const todayVal = (field: EntryField) => {
    const e = entries.find((x) => x.date === today);
    if (!e) return null;
    const v = e[field];
    return typeof v === "number" ? v : null;
  };

  const stepsToday = todayVal("steps");
  const waterToday = todayVal("waterMl");
  const sleepLast = latest(entries, "sleepHours");
  const activeToday = todayVal("activeMinutes");
  const weightLast = latest(entries, "weightKg");
  const rhrLast = latest(entries, "restingHeartRate");

  const activeGoals = goals.filter((g) => g.active);
  const rings = activeGoals.map((g) => {
    const def = METRIC_BY_KEY[g.metric];
    const v = todayVal(def.field);
    return { goal: g, progress: goalProgress(g, v) };
  });

  // Best current goal streak for the streak card.
  let bestGoal: { label: string; streak: number; color: string } | null = null;
  for (const g of activeGoals) {
    const s = goalStreak(entries, g, today);
    const def = METRIC_BY_KEY[g.metric];
    if (!bestGoal || s > bestGoal.streak) {
      bestGoal = { label: def.label, streak: s, color: def.color };
    }
  }

  const insights = buildInsightMessages(entries, goals, today);

  const stepsTrend = trend(entries, "steps", 7);
  const sleepTrend = trend(entries, "sleepHours", 7);
  const waterTrend = trend(entries, "waterMl", 7);
  const weightTrend = trend(entries, "weightKg", 7);

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Here’s how you’re doing.
          </p>
        </div>
        <Link href="/log">
          <Button>
            <PlusCircle size={16} /> Log today
          </Button>
        </Link>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Steps today"
          value={stepsToday !== null ? stepsToday.toLocaleString() : "—"}
          icon={<Footprints size={18} />}
          color="var(--color-activity)"
          delta={{ pct: stepsTrend.deltaPct, direction: stepsTrend.direction }}
          goodDirection="up"
        />
        <StatCard
          label="Active minutes"
          value={activeToday !== null ? String(activeToday) : "—"}
          unit="min"
          icon={<Flame size={18} />}
          color="#ef4444"
        />
        <StatCard
          label="Water today"
          value={waterToday !== null ? waterToday.toLocaleString() : "—"}
          unit="ml"
          icon={<Droplets size={18} />}
          color="var(--color-water)"
          delta={{ pct: waterTrend.deltaPct, direction: waterTrend.direction }}
          goodDirection="up"
        />
        <StatCard
          label="Last sleep"
          value={sleepLast !== null ? sleepLast.toFixed(1) : "—"}
          unit="hrs"
          icon={<Moon size={18} />}
          color="var(--color-sleep)"
          delta={{ pct: sleepTrend.deltaPct, direction: sleepTrend.direction }}
          goodDirection="up"
        />
        <StatCard
          label="Weight"
          value={weightLast !== null ? weightLast.toFixed(1) : "—"}
          unit="kg"
          icon={<Scale size={18} />}
          color="var(--color-body)"
          delta={{ pct: weightTrend.deltaPct, direction: weightTrend.direction }}
          goodDirection="down"
        />
        <StatCard
          label="Resting HR"
          value={rhrLast !== null ? String(rhrLast) : "—"}
          unit="bpm"
          icon={<HeartPulse size={18} />}
          color="#e11d48"
        />
      </div>

      {/* Goal rings + streak */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today’s goals"
            subtitle="Progress toward your active targets"
            action={
              <Link
                href="/goals"
                className="text-xs font-medium text-[var(--color-brand-600)] hover:underline"
              >
                Manage
              </Link>
            }
          />
          <CardBody>
            {rings.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-muted)]">
                No active goals yet.{" "}
                <Link href="/goals" className="text-[var(--color-brand-600)] hover:underline">
                  Set one →
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap justify-around gap-5">
                {rings.map(({ goal, progress }) => (
                  <ProgressRing
                    key={goal.metric}
                    ratio={progress.ratio}
                    color={progress.def.color}
                    label={progress.def.label}
                    sublabel={
                      progress.value !== null
                        ? `${formatMetricValue(goal.metric, progress.value)} / ${formatMetricValue(goal.metric, goal.target)}`
                        : `Goal ${formatMetricValue(goal.metric, goal.target)}`
                    }
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <StreakCard loggingStreak={loggingStreak(entries, today)} bestGoal={bestGoal} />
      </div>

      <InsightCallout messages={insights} />

      {/* Trend charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Steps" subtitle="Last 30 days" color="var(--color-activity)">
          <TrendChart data={series(entries, "steps")} color="#f97316" unit="steps" />
        </ChartCard>
        <ChartCard title="Sleep" subtitle="Hours per night" color="var(--color-sleep)">
          <TrendChart data={series(entries, "sleepHours")} color="#6366f1" unit="hrs" />
        </ChartCard>
        <ChartCard title="Water intake" subtitle="ml per day" color="var(--color-water)">
          <TrendChart data={series(entries, "waterMl")} color="#06b6d4" unit="ml" />
        </ChartCard>
        <ChartCard title="Weight" subtitle="kg over time" color="var(--color-body)">
          <TrendChart data={series(entries, "weightKg")} color="#8b5cf6" unit="kg" />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="pt-2">{children}</CardBody>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
        <PlusCircle size={26} />
      </div>
      <h1 className="text-lg font-semibold">Welcome to Pulse 👋</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
        Log your first entry to start seeing your trends, goals, and insights here.
      </p>
      <Link href="/log" className="mt-5 inline-block">
        <Button>
          <PlusCircle size={16} /> Log your first entry
        </Button>
      </Link>
    </div>
  );
}
