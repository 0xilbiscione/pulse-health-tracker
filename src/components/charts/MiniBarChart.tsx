"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/insights";

function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MiniBarChart({
  data,
  color,
  target,
  unit,
  height = 220,
}: {
  data: TrendPoint[];
  color: string;
  target?: number;
  unit?: string;
  height?: number;
}) {
  const hasData = data.some((d) => d.value !== null);
  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--color-muted)]"
        style={{ height }}
      >
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          minTickGap={20}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e8eaed",
            fontSize: 12,
          }}
          labelFormatter={(l) => formatDay(String(l))}
          formatter={(v: number | string) => [`${v}${unit ? ` ${unit}` : ""}`, ""]}
        />
        <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={26}>
          {data.map((d, i) => {
            const met = target ? (d.value ?? 0) >= target : true;
            return (
              <Cell key={i} fill={met ? color : `${color}66`} />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
