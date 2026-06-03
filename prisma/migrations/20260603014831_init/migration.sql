-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HealthEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "steps" INTEGER,
    "distanceKm" REAL,
    "activeMinutes" INTEGER,
    "workoutType" TEXT,
    "workoutMinutes" INTEGER,
    "weightKg" REAL,
    "bodyFatPct" REAL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "restingHeartRate" INTEGER,
    "calories" INTEGER,
    "proteinG" REAL,
    "carbsG" REAL,
    "fatG" REAL,
    "waterMl" INTEGER,
    "sleepHours" REAL,
    "sleepQuality" INTEGER,
    "mood" INTEGER,
    "energy" INTEGER,
    "stress" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target" REAL NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'DAILY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "HealthEntry_userId_date_idx" ON "HealthEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HealthEntry_userId_date_key" ON "HealthEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_metric_key" ON "Goal"("userId", "metric");
