"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Apple,
  HeartPulse,
  Moon,
  Check,
  Trash2,
} from "lucide-react";
import { upsertEntry, deleteEntry } from "@/app/actions/entries";
import type { EntryData } from "@/lib/insights";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

type TabId = "activity" | "body" | "nutrition" | "sleep";

const TABS: { id: TabId; label: string; icon: typeof Activity; color: string }[] = [
  { id: "activity", label: "Activity", icon: Activity, color: "var(--color-activity)" },
  { id: "body", label: "Body", icon: HeartPulse, color: "var(--color-body)" },
  { id: "nutrition", label: "Nutrition", icon: Apple, color: "var(--color-nutrition)" },
  { id: "sleep", label: "Sleep & Mood", icon: Moon, color: "var(--color-sleep)" },
];

function val(v: number | string | null | undefined): string {
  return v === null || v === undefined ? "" : String(v);
}

export function EntryForm({
  date,
  entry,
}: {
  date: string;
  entry: EntryData | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("activity");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSaved(false);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await upsertEntry(form);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function onDelete() {
    if (!confirm("Delete this day's entry?")) return;
    startTransition(async () => {
      await deleteEntry(date);
      router.refresh();
      router.push("/dashboard");
    });
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <input type="hidden" name="date" value={date} />

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-3 pt-3">
          {TABS.map(({ id, label, icon: Icon, color }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
                )}
                style={
                  active
                    ? { borderBottom: `2px solid ${color}`, marginBottom: -1 }
                    : undefined
                }
              >
                <Icon size={16} style={{ color: active ? color : undefined }} />
                {label}
              </button>
            );
          })}
        </div>

        <CardBody>
          {tab === "activity" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Steps" htmlFor="steps" error={errors.steps}>
                <Input id="steps" name="steps" type="number" min="0" placeholder="8000" defaultValue={val(entry?.steps)} />
              </Field>
              <Field label="Distance (km)" htmlFor="distanceKm" error={errors.distanceKm}>
                <Input id="distanceKm" name="distanceKm" type="number" step="0.1" min="0" placeholder="5.2" defaultValue={val(entry?.distanceKm)} />
              </Field>
              <Field label="Active minutes" htmlFor="activeMinutes" error={errors.activeMinutes}>
                <Input id="activeMinutes" name="activeMinutes" type="number" min="0" placeholder="45" defaultValue={val(entry?.activeMinutes)} />
              </Field>
              <Field label="Workout type" htmlFor="workoutType" error={errors.workoutType}>
                <Input id="workoutType" name="workoutType" placeholder="Run, Strength…" defaultValue={val(entry?.workoutType)} />
              </Field>
              <Field label="Workout minutes" htmlFor="workoutMinutes" error={errors.workoutMinutes}>
                <Input id="workoutMinutes" name="workoutMinutes" type="number" min="0" placeholder="30" defaultValue={val(entry?.workoutMinutes)} />
              </Field>
            </div>
          )}

          {tab === "body" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Weight (kg)" htmlFor="weightKg" error={errors.weightKg}>
                <Input id="weightKg" name="weightKg" type="number" step="0.1" min="0" placeholder="72.5" defaultValue={val(entry?.weightKg)} />
              </Field>
              <Field label="Body fat (%)" htmlFor="bodyFatPct" error={errors.bodyFatPct}>
                <Input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" min="0" placeholder="18.5" defaultValue={val(entry?.bodyFatPct)} />
              </Field>
              <Field label="Systolic (mmHg)" htmlFor="systolic" error={errors.systolic}>
                <Input id="systolic" name="systolic" type="number" min="0" placeholder="120" defaultValue={val(entry?.systolic)} />
              </Field>
              <Field label="Diastolic (mmHg)" htmlFor="diastolic" error={errors.diastolic}>
                <Input id="diastolic" name="diastolic" type="number" min="0" placeholder="78" defaultValue={val(entry?.diastolic)} />
              </Field>
              <Field label="Resting heart rate (bpm)" htmlFor="restingHeartRate" error={errors.restingHeartRate}>
                <Input id="restingHeartRate" name="restingHeartRate" type="number" min="0" placeholder="60" defaultValue={val(entry?.restingHeartRate)} />
              </Field>
            </div>
          )}

          {tab === "nutrition" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Calories (kcal)" htmlFor="calories" error={errors.calories}>
                <Input id="calories" name="calories" type="number" min="0" placeholder="2100" defaultValue={val(entry?.calories)} />
              </Field>
              <Field label="Water (ml)" htmlFor="waterMl" error={errors.waterMl}>
                <Input id="waterMl" name="waterMl" type="number" min="0" placeholder="2000" defaultValue={val(entry?.waterMl)} />
              </Field>
              <Field label="Protein (g)" htmlFor="proteinG" error={errors.proteinG}>
                <Input id="proteinG" name="proteinG" type="number" step="0.1" min="0" placeholder="120" defaultValue={val(entry?.proteinG)} />
              </Field>
              <Field label="Carbs (g)" htmlFor="carbsG" error={errors.carbsG}>
                <Input id="carbsG" name="carbsG" type="number" step="0.1" min="0" placeholder="250" defaultValue={val(entry?.carbsG)} />
              </Field>
              <Field label="Fat (g)" htmlFor="fatG" error={errors.fatG}>
                <Input id="fatG" name="fatG" type="number" step="0.1" min="0" placeholder="70" defaultValue={val(entry?.fatG)} />
              </Field>
            </div>
          )}

          {tab === "sleep" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Sleep (hours)" htmlFor="sleepHours" error={errors.sleepHours}>
                <Input id="sleepHours" name="sleepHours" type="number" step="0.1" min="0" max="24" placeholder="7.5" defaultValue={val(entry?.sleepHours)} />
              </Field>
              <Field label="Sleep quality (1-5)" htmlFor="sleepQuality" error={errors.sleepQuality}>
                <Select id="sleepQuality" name="sleepQuality" defaultValue={val(entry?.sleepQuality)}>
                  <ScaleOptions />
                </Select>
              </Field>
              <Field label="Mood (1-5)" htmlFor="mood" error={errors.mood}>
                <Select id="mood" name="mood" defaultValue={val(entry?.mood)}>
                  <ScaleOptions />
                </Select>
              </Field>
              <Field label="Energy (1-5)" htmlFor="energy" error={errors.energy}>
                <Select id="energy" name="energy" defaultValue={val(entry?.energy)}>
                  <ScaleOptions />
                </Select>
              </Field>
              <Field label="Stress (1-5)" htmlFor="stress" error={errors.stress}>
                <Select id="stress" name="stress" defaultValue={val(entry?.stress)}>
                  <ScaleOptions />
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes" htmlFor="notes" error={errors.notes}>
                  <Textarea id="notes" name="notes" placeholder="How did today feel?" defaultValue={val(entry?.notes)} />
                </Field>
              </div>
            </div>
          )}
        </CardBody>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-3.5">
          <div className="text-sm">
            {saved && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <Check size={15} /> Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {entry && (
              <Button type="button" variant="danger" size="md" onClick={onDelete} disabled={pending}>
                <Trash2 size={15} /> Delete
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : entry ? "Update entry" : "Save entry"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

function ScaleOptions() {
  return (
    <>
      <option value="">—</option>
      <option value="1">1 · Low</option>
      <option value="2">2</option>
      <option value="3">3 · OK</option>
      <option value="4">4</option>
      <option value="5">5 · High</option>
    </>
  );
}
