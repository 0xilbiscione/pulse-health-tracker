import { ADDITIVE_ENTRY_FIELDS } from "./metrics";

type Row = Record<string, unknown>;

/**
 * Combine a submitted entry payload with the day's existing row.
 *
 * - Additive fields (steps, water, calories, …): the submitted value is ADDED to
 *   the existing total. A null/empty submission leaves the existing total
 *   untouched (it doesn't reset it to 0).
 * - All other fields: the submitted value replaces the existing one (last-write),
 *   which is what the prefilled form sends back unchanged.
 *
 * Pure and side-effect free so it can be unit-tested in isolation.
 */
export function mergeEntryData(existing: Row | null, submitted: Row): Row {
  const merged: Row = { ...submitted };

  for (const field of ADDITIVE_ENTRY_FIELDS) {
    const sub = submitted[field] as number | null | undefined;
    if (sub === null || sub === undefined) {
      // Nothing added this time — keep whatever the day already had.
      merged[field] = existing ? (existing[field] ?? null) : null;
    } else {
      const prev = existing ? ((existing[field] as number | null) ?? 0) : 0;
      merged[field] = prev + sub;
    }
  }

  return merged;
}
