import { z } from "zod";

const optionalNumber = (max: number, min = 0) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : null;
    })
    .refine((n) => n === null || (n >= min && n <= max), {
      message: `Must be between ${min} and ${max}`,
    });

const scale1to5 = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })
  .refine((n) => n === null || (n >= 1 && n <= 5), {
    message: "Must be 1-5",
  });

export const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),

  steps: optionalNumber(100000),
  distanceKm: optionalNumber(500),
  activeMinutes: optionalNumber(1440),
  workoutType: z
    .string()
    .max(60)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  workoutMinutes: optionalNumber(1440),

  weightKg: optionalNumber(500),
  bodyFatPct: optionalNumber(80),
  systolic: optionalNumber(300),
  diastolic: optionalNumber(200),
  restingHeartRate: optionalNumber(250),

  calories: optionalNumber(20000),
  proteinG: optionalNumber(2000),
  carbsG: optionalNumber(2000),
  fatG: optionalNumber(2000),
  waterMl: optionalNumber(20000),

  sleepHours: optionalNumber(24),
  sleepQuality: scale1to5,
  mood: scale1to5,
  energy: scale1to5,
  stress: scale1to5,

  notes: z
    .string()
    .max(1000)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export type EntryInput = z.input<typeof entrySchema>;
export type EntryParsed = z.output<typeof entrySchema>;

export const goalSchema = z.object({
  metric: z.enum([
    "STEPS",
    "WATER_ML",
    "WEIGHT_KG",
    "SLEEP_HOURS",
    "CALORIES",
    "ACTIVE_MINUTES",
  ]),
  target: z.coerce.number().positive("Target must be positive"),
  period: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
  active: z.coerce.boolean().default(true),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
