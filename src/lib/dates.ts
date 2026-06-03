// All entries are keyed by a "logical day". We normalize to UTC midnight so that
// the @@unique([userId, date]) constraint behaves predictably regardless of TZ.

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Parse a YYYY-MM-DD string into a UTC-midnight Date used for storage. */
export function toStorageDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

/** Today's date as YYYY-MM-DD (local). */
export function todayIso(): string {
  return dayKey(new Date());
}

/** Convert a stored Date back to its YYYY-MM-DD key (UTC). */
export function storageDateToIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
