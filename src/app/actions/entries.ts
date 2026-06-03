"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { entrySchema } from "@/lib/validators";
import { toStorageDate, storageDateToIso } from "@/lib/dates";
import { mergeEntryData } from "@/lib/entryMerge";
import type { EntryData } from "@/lib/insights";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function serialize(e: {
  date: Date;
} & Record<string, unknown>): EntryData {
  return {
    date: storageDateToIso(e.date),
    steps: (e.steps as number) ?? null,
    distanceKm: (e.distanceKm as number) ?? null,
    activeMinutes: (e.activeMinutes as number) ?? null,
    workoutType: (e.workoutType as string) ?? null,
    workoutMinutes: (e.workoutMinutes as number) ?? null,
    weightKg: (e.weightKg as number) ?? null,
    bodyFatPct: (e.bodyFatPct as number) ?? null,
    systolic: (e.systolic as number) ?? null,
    diastolic: (e.diastolic as number) ?? null,
    restingHeartRate: (e.restingHeartRate as number) ?? null,
    calories: (e.calories as number) ?? null,
    proteinG: (e.proteinG as number) ?? null,
    carbsG: (e.carbsG as number) ?? null,
    fatG: (e.fatG as number) ?? null,
    waterMl: (e.waterMl as number) ?? null,
    sleepHours: (e.sleepHours as number) ?? null,
    sleepQuality: (e.sleepQuality as number) ?? null,
    mood: (e.mood as number) ?? null,
    energy: (e.energy as number) ?? null,
    stress: (e.stress as number) ?? null,
    notes: (e.notes as string) ?? null,
  };
}

/** Fetch the user's entries within the last `days` (inclusive), ascending by date. */
export async function getEntries(days = 30): Promise<EntryData[]> {
  const userId = await requireUserId();
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  const rows = await prisma.healthEntry.findMany({
    where: { userId, date: { gte: from } },
    orderBy: { date: "asc" },
  });
  return rows.map(serialize);
}

/** Fetch a single entry by ISO date (or null). */
export async function getEntryByDate(isoDate: string): Promise<EntryData | null> {
  const userId = await requireUserId();
  const row = await prisma.healthEntry.findUnique({
    where: { userId_date: { userId, date: toStorageDate(isoDate) } },
  });
  return row ? serialize(row) : null;
}

/** Create or update the entry for a given day (one entry per user per day). */
export async function upsertEntry(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();

  const raw = Object.fromEntries(formData.entries());
  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { date, ...data } = parsed.data;
  const storageDate = toStorageDate(date);

  // "add" (default) accumulates additive fields onto the day's running total;
  // "set" edits the totals directly (replace everything) to correct a mistake.
  const mode = formData.get("mode") === "set" ? "set" : "add";

  const existing = await prisma.healthEntry.findUnique({
    where: { userId_date: { userId, date: storageDate } },
  });
  const merged =
    mode === "set"
      ? data
      : mergeEntryData(existing as Record<string, unknown> | null, data);

  await prisma.healthEntry.upsert({
    where: { userId_date: { userId, date: storageDate } },
    create: { userId, date: storageDate, ...merged },
    update: { ...merged },
  });

  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/insights");
  return { ok: true };
}

/** Delete the entry for a given ISO date. */
export async function deleteEntry(isoDate: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.healthEntry.deleteMany({
    where: { userId, date: toStorageDate(isoDate) },
  });
  revalidatePath("/dashboard");
  revalidatePath("/log");
  return { ok: true };
}
