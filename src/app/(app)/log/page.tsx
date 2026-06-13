import { getEntryByDate } from "@/app/actions/entries";
import { EntryForm } from "@/components/forms/EntryForm";
import { DatePicker } from "@/components/forms/DatePicker";
import { todayIso } from "@/lib/dates";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const isoDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso();
  const entry = await getEntryByDate(isoDate);

  const prettyDate = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-[-0.02em]">Log entry</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{prettyDate}</p>
        </div>
        <DatePicker isoDate={isoDate} />
      </div>

      <EntryForm date={isoDate} entry={entry} />

      <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
        Fill in whatever you have — every field is optional. Activity &amp; nutrition
        values <strong>add to today&rsquo;s running total</strong>; body measurements and
        sleep/mood ratings replace the latest reading. Use <strong>Set total</strong>
        to edit a running total directly and fix a mistake.
      </p>
    </div>
  );
}
