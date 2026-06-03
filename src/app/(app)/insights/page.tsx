import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { getEntries } from "@/app/actions/entries";
import { getGoals } from "@/app/actions/goals";
import {
  average,
  buildInsightMessages,
  series,
  sum,
  weeklySummaries,
} from "@/lib/insights";
import { formatMetricValue } from "@/lib/metrics";
import { todayIso } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { MiniBarChart } from "@/components/charts/MiniBarChart";
import { InsightCallout } from "@/components/dashboard/InsightCallout";

export default async function InsightsPage() {
  const [entries, goals] = await Promise.all([getEntries(30), getGoals()]);
  const today = todayIso();
  const summaries = weeklySummaries(entries);
  const insights = buildInsightMessages(entries, goals, today);

  const last7 = entries.slice(-7);
  const daysLogged = entries.length;
  const totalSteps = sum(last7, "steps");
  const totalWater = sum(last7, "waterMl");
  const avgSleep = average(last7, "sleepHours");

  const goalTarget = new Map(goals.map((g) => [g.metric, g.target]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          Weekly summaries and trends across all your metrics.
        </p>
      </div>

      <InsightCallout messages={insights} />

      {/* Quick totals */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Totals label="Days logged" value={`${daysLogged}`} sub="last 30 days" />
        <Totals label="Steps" value={totalSteps.toLocaleString()} sub="last 7 days" />
        <Totals
          label="Water"
          value={`${(totalWater / 1000).toFixed(1)} L`}
          sub="last 7 days"
        />
        <Totals
          label="Avg sleep"
          value={avgSleep !== null ? `${avgSleep.toFixed(1)} h` : "—"}
          sub="last 7 days"
        />
      </div>

      {/* Weekly summary table */}
      <Card>
        <CardHeader
          title="Weekly averages"
          subtitle="This week vs the previous week"
        />
        <CardBody className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-muted)]">
                  <th className="pb-2 font-medium">Metric</th>
                  <th className="pb-2 font-medium">This week</th>
                  <th className="pb-2 font-medium">Last week</th>
                  <th className="pb-2 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr
                    key={s.metric}
                    className="border-t border-[var(--color-border)]"
                  >
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.def.color }}
                        />
                        {s.def.label}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium">
                      {s.weekAvg !== null
                        ? formatMetricValue(s.metric, s.weekAvg)
                        : "—"}
                    </td>
                    <td className="py-2.5 text-[var(--color-muted)]">
                      {s.prevWeekAvg !== null
                        ? formatMetricValue(s.metric, s.prevWeekAvg)
                        : "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      <TrendPill
                        direction={s.trend.direction}
                        pct={s.trend.deltaPct}
                        good={s.def.direction === "atLeast" ? "up" : "down"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Bar charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Daily steps" subtitle="Bars below your goal are faded" />
          <CardBody className="pt-2">
            <MiniBarChart
              data={series(entries, "steps")}
              color="#f97316"
              target={goalTarget.get("STEPS")}
              unit="steps"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Daily water" subtitle="ml per day" />
          <CardBody className="pt-2">
            <MiniBarChart
              data={series(entries, "waterMl")}
              color="#06b6d4"
              target={goalTarget.get("WATER_ML")}
              unit="ml"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Active minutes" subtitle="per day" />
          <CardBody className="pt-2">
            <MiniBarChart
              data={series(entries, "activeMinutes")}
              color="#ef4444"
              target={goalTarget.get("ACTIVE_MINUTES")}
              unit="min"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Calories" subtitle="per day" />
          <CardBody className="pt-2">
            <MiniBarChart
              data={series(entries, "calories")}
              color="#10b981"
              unit="kcal"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Totals({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      <p className="text-[11px] text-[var(--color-muted)]">{sub}</p>
    </Card>
  );
}

function TrendPill({
  direction,
  pct,
  good,
}: {
  direction: "up" | "down" | "flat";
  pct: number | null;
  good: "up" | "down";
}) {
  if (direction === "flat" || pct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-[var(--color-muted)]">
        <Minus size={13} /> —
      </span>
    );
  }
  const isGood = direction === good;
  const Icon = direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isGood ? "text-emerald-600" : "text-red-500"
      }`}
    >
      <Icon size={13} />
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}
