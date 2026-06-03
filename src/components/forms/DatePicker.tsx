"use client";

import { useRouter } from "next/navigation";
import { todayIso } from "@/lib/dates";

export function DatePicker({ isoDate }: { isoDate: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      defaultValue={isoDate}
      max={todayIso()}
      onChange={(e) => {
        const v = e.target.value;
        if (v) router.push(`/log?date=${v}`);
      }}
      className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm"
      aria-label="Pick a date to log"
    />
  );
}
