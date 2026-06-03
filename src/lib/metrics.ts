// Central definition of the metrics that can have goals + appear in insights.
// Keeping this in one place lets the dashboard, goals page, and insights stay in sync.

export type GoalMetric =
  | "STEPS"
  | "WATER_ML"
  | "WEIGHT_KG"
  | "SLEEP_HOURS"
  | "CALORIES"
  | "ACTIVE_MINUTES";

export type EntryField =
  | "steps"
  | "waterMl"
  | "weightKg"
  | "sleepHours"
  | "calories"
  | "activeMinutes";

/**
 * Entry fields that ACCUMULATE across multiple saves in the same day — a newly
 * submitted value is added to the running total. Everything else is
 * replace/last-write (e.g. weight, blood pressure, sleep, mood ratings), where
 * summing would be meaningless.
 */
export const ADDITIVE_ENTRY_FIELDS = [
  "steps",
  "distanceKm",
  "activeMinutes",
  "workoutMinutes",
  "calories",
  "proteinG",
  "carbsG",
  "fatG",
  "waterMl",
] as const;

export type AdditiveField = (typeof ADDITIVE_ENTRY_FIELDS)[number];

export function isAdditiveField(field: string): boolean {
  return (ADDITIVE_ENTRY_FIELDS as readonly string[]).includes(field);
}

export type GoalDirection = "atLeast" | "atMost";

export interface MetricDef {
  metric: GoalMetric;
  field: EntryField;
  label: string;
  unit: string;
  /** atLeast = hit or exceed target (steps); atMost = stay at or under (weight target) */
  direction: GoalDirection;
  color: string;
  defaultTarget: number;
  step: number;
}

export const METRICS: MetricDef[] = [
  {
    metric: "STEPS",
    field: "steps",
    label: "Steps",
    unit: "steps",
    direction: "atLeast",
    color: "#f97316",
    defaultTarget: 10000,
    step: 500,
  },
  {
    metric: "ACTIVE_MINUTES",
    field: "activeMinutes",
    label: "Active minutes",
    unit: "min",
    direction: "atLeast",
    color: "#ef4444",
    defaultTarget: 30,
    step: 5,
  },
  {
    metric: "WATER_ML",
    field: "waterMl",
    label: "Water",
    unit: "ml",
    direction: "atLeast",
    color: "#06b6d4",
    defaultTarget: 2000,
    step: 100,
  },
  {
    metric: "CALORIES",
    field: "calories",
    label: "Calories",
    unit: "kcal",
    direction: "atMost",
    color: "#10b981",
    defaultTarget: 2200,
    step: 50,
  },
  {
    metric: "SLEEP_HOURS",
    field: "sleepHours",
    label: "Sleep",
    unit: "hrs",
    direction: "atLeast",
    color: "#6366f1",
    defaultTarget: 8,
    step: 0.5,
  },
  {
    metric: "WEIGHT_KG",
    field: "weightKg",
    label: "Weight",
    unit: "kg",
    direction: "atMost",
    color: "#8b5cf6",
    defaultTarget: 70,
    step: 0.5,
  },
];

export const METRIC_BY_KEY: Record<GoalMetric, MetricDef> = METRICS.reduce(
  (acc, m) => {
    acc[m.metric] = m;
    return acc;
  },
  {} as Record<GoalMetric, MetricDef>,
);

export function formatMetricValue(metric: GoalMetric, value: number): string {
  const def = METRIC_BY_KEY[metric];
  const rounded =
    def.unit === "hrs" || def.unit === "kg"
      ? Math.round(value * 10) / 10
      : Math.round(value);
  return `${rounded.toLocaleString()} ${def.unit}`;
}
