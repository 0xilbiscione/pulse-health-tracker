import {
  GoalMetric,
  MetricDef,
  METRIC_BY_KEY,
  METRICS,
} from "./metrics";

// A plain, serializable shape for an entry (subset of Prisma model, dates as ISO strings).
export interface EntryData {
  date: string; // YYYY-MM-DD
  steps: number | null;
  distanceKm: number | null;
  activeMinutes: number | null;
  workoutType: string | null;
  workoutMinutes: number | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  systolic: number | null;
  diastolic: number | null;
  restingHeartRate: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  waterMl: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
}

export interface GoalData {
  metric: GoalMetric;
  target: number;
  period: string;
  active: boolean;
}

/** Average of non-null values for a given field across entries. Returns null if no data. */
export function average(entries: EntryData[], field: keyof EntryData): number | null {
  const vals = entries
    .map((e) => e[field])
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Sum of non-null values for a field. */
export function sum(entries: EntryData[], field: keyof EntryData): number {
  return entries
    .map((e) => e[field])
    .filter((v): v is number => typeof v === "number")
    .reduce((a, b) => a + b, 0);
}

/** Most recent non-null value for a field (entries assumed sorted ascending by date). */
export function latest(entries: EntryData[], field: keyof EntryData): number | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    const v = entries[i][field];
    if (typeof v === "number") return v;
  }
  return null;
}

export interface TrendPoint {
  date: string;
  value: number | null;
}

/** Build a time series of a field for charting. */
export function series(entries: EntryData[], field: keyof EntryData): TrendPoint[] {
  return entries.map((e) => ({
    date: e.date,
    value: typeof e[field] === "number" ? (e[field] as number) : null,
  }));
}

export interface Trend {
  current: number | null;
  previous: number | null;
  deltaPct: number | null; // percent change vs previous window
  direction: "up" | "down" | "flat";
}

/**
 * Compare the average of the most recent `windowDays` to the prior `windowDays`.
 * `entries` should be sorted ascending by date.
 */
export function trend(
  entries: EntryData[],
  field: keyof EntryData,
  windowDays: number,
): Trend {
  const recent = entries.slice(-windowDays);
  const prior = entries.slice(-windowDays * 2, -windowDays);
  const current = average(recent, field);
  const previous = average(prior, field);
  let deltaPct: number | null = null;
  let direction: Trend["direction"] = "flat";
  if (current !== null && previous !== null && previous !== 0) {
    deltaPct = ((current - previous) / Math.abs(previous)) * 100;
    if (Math.abs(deltaPct) < 0.5) direction = "flat";
    else direction = deltaPct > 0 ? "up" : "down";
  }
  return { current, previous, deltaPct, direction };
}

/** Value of a metric's underlying field on a given ISO date, or null. */
function valueOn(entries: EntryData[], def: MetricDef, isoDate: string): number | null {
  const e = entries.find((x) => x.date === isoDate);
  if (!e) return null;
  const v = e[def.field];
  return typeof v === "number" ? v : null;
}

export interface GoalProgress {
  metric: GoalMetric;
  def: MetricDef;
  target: number;
  value: number | null;
  /** 0..1 (can exceed 1 for atLeast goals before clamping in UI) */
  ratio: number;
  met: boolean;
}

/** Progress toward a goal using today's value. */
export function goalProgress(
  goal: GoalData,
  todayValue: number | null,
): GoalProgress {
  const def = METRIC_BY_KEY[goal.metric];
  let ratio = 0;
  let met = false;
  if (todayValue !== null && goal.target > 0) {
    if (def.direction === "atLeast") {
      ratio = todayValue / goal.target;
      met = todayValue >= goal.target;
    } else {
      // atMost: full ring when at/under target, shrinking as you exceed it
      ratio = todayValue <= goal.target ? 1 : goal.target / todayValue;
      met = todayValue <= goal.target;
    }
  }
  return { metric: goal.metric, def, target: goal.target, value: todayValue, ratio, met };
}

/**
 * Longest current streak of consecutive days (ending today or yesterday) where the
 * user logged ANY entry. Used for the "logging streak" badge.
 */
export function loggingStreak(entries: EntryData[], todayIso: string): number {
  const logged = new Set(entries.map((e) => e.date));
  let streak = 0;
  const cursor = new Date(`${todayIso}T00:00:00.000Z`);
  // Allow the streak to count even if today isn't logged yet (start from yesterday).
  if (!logged.has(todayIso)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (logged.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Current streak of consecutive days meeting a specific goal (atLeast/atMost),
 * counting backward from today.
 */
export function goalStreak(
  entries: EntryData[],
  goal: GoalData,
  todayIso: string,
): number {
  const def = METRIC_BY_KEY[goal.metric];
  const byDate = new Map(entries.map((e) => [e.date, e]));
  let streak = 0;
  const cursor = new Date(`${todayIso}T00:00:00.000Z`);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    const e = byDate.get(key);
    const v = e ? e[def.field] : null;
    const num = typeof v === "number" ? v : null;
    if (num === null) break;
    const ok = def.direction === "atLeast" ? num >= goal.target : num <= goal.target;
    if (!ok) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export interface MetricSummary {
  metric: GoalMetric;
  def: MetricDef;
  weekAvg: number | null;
  prevWeekAvg: number | null;
  trend: Trend;
}

/** Weekly summary rows for the insights page across all defined metrics. */
export function weeklySummaries(entries: EntryData[]): MetricSummary[] {
  return METRICS.map((def) => {
    const t = trend(entries, def.field, 7);
    return {
      metric: def.metric,
      def,
      weekAvg: t.current,
      prevWeekAvg: t.previous,
      trend: t,
    };
  });
}

/** Human-readable weekly insight bullets derived from trends + goals. */
export function buildInsightMessages(
  entries: EntryData[],
  goals: GoalData[],
  todayIso: string,
): string[] {
  const msgs: string[] = [];
  if (entries.length === 0) return msgs;

  const stepTrend = trend(entries, "steps", 7);
  if (stepTrend.current !== null && stepTrend.deltaPct !== null) {
    if (stepTrend.direction === "up") {
      msgs.push(
        `Your steps are up ${Math.abs(stepTrend.deltaPct).toFixed(0)}% vs last week — averaging ${Math.round(stepTrend.current).toLocaleString()}/day.`,
      );
    } else if (stepTrend.direction === "down") {
      msgs.push(
        `Steps dipped ${Math.abs(stepTrend.deltaPct).toFixed(0)}% vs last week. A couple of walks could turn it around.`,
      );
    }
  }

  const sleepAvg = average(entries.slice(-7), "sleepHours");
  if (sleepAvg !== null) {
    if (sleepAvg >= 7.5) {
      msgs.push(`Great sleep this week — averaging ${sleepAvg.toFixed(1)} hrs/night.`);
    } else if (sleepAvg < 6.5) {
      msgs.push(
        `You're averaging only ${sleepAvg.toFixed(1)} hrs of sleep — aim for an earlier night.`,
      );
    }
  }

  const weightTrend = trend(entries, "weightKg", 7);
  if (
    weightTrend.current !== null &&
    weightTrend.previous !== null &&
    Math.abs(weightTrend.current - weightTrend.previous) >= 0.3
  ) {
    const diff = weightTrend.current - weightTrend.previous;
    msgs.push(
      `Weight ${diff < 0 ? "down" : "up"} ${Math.abs(diff).toFixed(1)} kg vs last week (now ${weightTrend.current.toFixed(1)} kg).`,
    );
  }

  // Goal streak highlight
  for (const g of goals.filter((x) => x.active)) {
    const s = goalStreak(entries, g, todayIso);
    if (s >= 3) {
      msgs.push(
        `You're on a ${s}-day streak hitting your ${METRIC_BY_KEY[g.metric].label.toLowerCase()} goal. Keep it going!`,
      );
      break;
    }
  }

  const water = average(entries.slice(-7), "waterMl");
  if (water !== null && water < 1500) {
    msgs.push(`Hydration is low (${Math.round(water)} ml/day avg) — try to drink more water.`);
  }

  return msgs.slice(0, 4);
}

export { valueOn };
