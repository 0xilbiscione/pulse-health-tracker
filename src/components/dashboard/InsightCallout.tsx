import { Sparkles } from "lucide-react";

export function InsightCallout({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-5">
      <div className="mb-2 flex items-center gap-2 text-[var(--color-brand-700)]">
        <Sparkles size={16} />
        <h3 className="font-display text-sm font-semibold">This week’s insights</h3>
      </div>
      <ul className="space-y-1.5">
        {messages.map((m, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[var(--color-ink)]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-500)]" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
