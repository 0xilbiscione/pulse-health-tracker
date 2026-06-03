"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { goalSchema } from "@/lib/validators";
import type { GoalData } from "@/lib/insights";
import type { GoalMetric } from "@/lib/metrics";
import type { ActionResult } from "./entries";

export async function getGoals(): Promise<GoalData[]> {
  const userId = await requireUserId();
  const rows = await prisma.goal.findMany({ where: { userId } });
  return rows.map((g) => ({
    metric: g.metric as GoalMetric,
    target: g.target,
    period: g.period,
    active: g.active,
  }));
}

/** Create or update a goal for a metric. */
export async function upsertGoal(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();

  const raw = {
    metric: formData.get("metric"),
    target: formData.get("target"),
    period: formData.get("period") ?? "DAILY",
    active: formData.get("active") ?? "true",
  };
  const parsed = goalSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid goal" };
  }

  const { metric, target, period, active } = parsed.data;
  await prisma.goal.upsert({
    where: { userId_metric: { userId, metric } },
    create: { userId, metric, target, period, active },
    update: { target, period, active },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteGoal(metric: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.goal.deleteMany({ where: { userId, metric } });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}
