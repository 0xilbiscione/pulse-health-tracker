import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@health.app";
const DEMO_PASSWORD = "demo1234";
const DAYS = 30;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.round(rand(min, max));
}
function jitter(base: number, spread: number): number {
  return base + rand(-spread, spread);
}

function storageDate(daysAgo: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

async function main() {
  console.log("Seeding demo data...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Reset the demo user so seeding is idempotent.
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo Tracker",
      passwordHash,
    },
  });

  // Goals
  await prisma.goal.createMany({
    data: [
      { userId: user.id, metric: "STEPS", target: 10000, period: "DAILY", active: true },
      { userId: user.id, metric: "WATER_ML", target: 2500, period: "DAILY", active: true },
      { userId: user.id, metric: "SLEEP_HOURS", target: 8, period: "DAILY", active: true },
      { userId: user.id, metric: "ACTIVE_MINUTES", target: 45, period: "DAILY", active: true },
      { userId: user.id, metric: "CALORIES", target: 2200, period: "DAILY", active: false },
      { userId: user.id, metric: "WEIGHT_KG", target: 72, period: "DAILY", active: false },
    ],
  });

  // A gentle downward weight trend over the month for a realistic chart.
  let weight = 75.5;
  const workouts = ["Run", "Strength", "Cycling", "Yoga", "Swim", "Walk"];

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = storageDate(i);
    const dow = date.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;

    weight -= rand(0.0, 0.15); // slow downward drift
    const didWorkout = Math.random() > (isWeekend ? 0.5 : 0.35);
    const steps = randInt(isWeekend ? 4000 : 6000, isWeekend ? 13000 : 14000);

    await prisma.healthEntry.create({
      data: {
        userId: user.id,
        date,

        steps,
        distanceKm: Math.round((steps / 1350) * 10) / 10,
        activeMinutes: didWorkout ? randInt(35, 80) : randInt(10, 35),
        workoutType: didWorkout ? workouts[randInt(0, workouts.length - 1)] : null,
        workoutMinutes: didWorkout ? randInt(30, 75) : null,

        weightKg: Math.round(jitter(weight, 0.3) * 10) / 10,
        bodyFatPct: Math.round(jitter(19, 0.8) * 10) / 10,
        systolic: randInt(112, 126),
        diastolic: randInt(72, 82),
        restingHeartRate: randInt(54, 66),

        calories: randInt(1850, 2500),
        proteinG: randInt(90, 160),
        carbsG: randInt(180, 320),
        fatG: randInt(50, 90),
        waterMl: randInt(1500, 3200),

        sleepHours: Math.round(jitter(7.4, 1.1) * 10) / 10,
        sleepQuality: randInt(2, 5),
        mood: randInt(3, 5),
        energy: randInt(2, 5),
        stress: randInt(1, 4),

        notes: didWorkout && Math.random() > 0.7 ? "Felt great today!" : null,
      },
    });
  }

  console.log(`Seeded ${DAYS} days for ${DEMO_EMAIL}`);
  console.log(`Login with:  ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
