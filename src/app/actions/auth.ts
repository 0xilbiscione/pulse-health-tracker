"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";
import { signIn } from "@/lib/auth";
import { METRICS } from "@/lib/metrics";

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function signup(formData: FormData): Promise<SignupResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return {
      ok: false,
      error: "An account with that email already exists.",
      fieldErrors: { email: "Email already in use" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash },
  });

  // Seed sensible default goals so the dashboard isn't empty.
  await prisma.goal.createMany({
    data: METRICS.map((m) => ({
      userId: user.id,
      metric: m.metric,
      target: m.defaultTarget,
      period: "DAILY",
      active: m.metric === "STEPS" || m.metric === "WATER_ML" || m.metric === "SLEEP_HOURS",
    })),
  });

  return { ok: true };
}

/** Server action wrapper around NextAuth signIn for the login form. */
export async function login(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid email or password." };
  }
}
