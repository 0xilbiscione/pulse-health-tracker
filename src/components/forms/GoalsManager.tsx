"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { upsertGoal } from "@/app/actions/goals";
import { METRICS, formatMetricValue } from "@/lib/metrics";
import type { GoalData } from "@/lib/insights";
import { goalProgress } from "@/lib/insights";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/lib/cn";

export function GoalsManager({
  goals,
  todayValues,
}: {
  goals: GoalData[];
  todayValues: Record<string, number | null>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedMetric, setSavedMetric] = useState<string | null>(null);

  const goalByMetric = new Map(goals.map((g) => [g.metric, g]));

  function save(metric: string, target: number, active: boolean) {
    const form = new FormData();
    form.set("metric", metric);
    form.set("target", String(target));
    form.set("period", "DAILY");
    form.set("active", active ? "true" : "");
    startTransition(async () => {
      await upsertGoal(form);
      setSavedMetric(metric);
      router.refresh();
      setTimeout(() => setSavedMetric((m) => (m === metric ? null : m)), 2000);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {METRICS.map((def) => {
        const existing = goalByMetric.get(def.metric);
        const target = existing?.target ?? def.defaultTarget;
        const active = existing?.active ?? false;
        const todayValue = todayValues[def.field] ?? null;
        const progress = goalProgress(
          { metric: def.metric, target, period: "DAILY", active },
          todayValue,
        );

        return (
          <GoalCard
            key={def.metric}
            metricLabel={def.label}
            unit={def.unit}
            color={def.color}
            step={def.step}
            target={target}
            active={active}
            ratio={progress.ratio}
            todayText={
              todayValue !== null
                ? `${formatMetricValue(def.metric, todayValue)} today`
                : "No data today"
            }
            saved={savedMetric === def.metric}
            disabled={pending}
            onSave={(t, a) => save(def.metric, t, a)}
          />
        );
      })}
    </div>
  );
}

function GoalCard({
  metricLabel,
  unit,
  color,
  step,
  target,
  active,
  ratio,
  todayText,
  saved,
  disabled,
  onSave,
}: {
  metricLabel: string;
  unit: string;
  color: string;
  step: number;
  target: number;
  active: boolean;
  ratio: number;
  todayText: string;
  saved: boolean;
  disabled: boolean;
  onSave: (target: number, active: boolean) => void;
}) {
  const [t, setT] = useState<string>(String(target));
  const [a, setA] = useState<boolean>(active);

  return (
    <Card>
      <CardBody className="flex items-center gap-5">
        <ProgressRing ratio={a ? ratio : 0} color={color} size={84} stroke={8} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{metricLabel}</h3>
            <button
              type="button"
              onClick={() => {
                const next = !a;
                setA(next);
                onSave(Number(t) || 0, next);
              }}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                a ? "bg-[var(--color-brand-600)]" : "bg-gray-300",
              )}
              aria-label={a ? "Deactivate goal" : "Activate goal"}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  a ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{todayText}</p>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              step={step}
              min="0"
              value={t}
              onChange={(e) => setT(e.target.value)}
              className={cn(inputClass, "h-9 w-28 text-sm")}
            />
            <span className="text-xs text-[var(--color-muted)]">{unit}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => onSave(Number(t) || 0, a)}
              className="ml-auto"
            >
              {saved ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check size={14} /> Saved
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
