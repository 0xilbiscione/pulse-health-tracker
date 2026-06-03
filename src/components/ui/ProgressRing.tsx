export function ProgressRing({
  ratio,
  color,
  size = 96,
  stroke = 9,
  label,
  sublabel,
}: {
  ratio: number; // 0..1+
  color: string;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);
  const pct = Math.round(ratio * 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold text-[var(--color-ink)]">
            {pct}%
          </span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-medium text-[var(--color-ink)]">{label}</p>
          {sublabel && (
            <p className="text-[11px] text-[var(--color-muted)]">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
