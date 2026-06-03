"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/insights";

function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({
  data,
  color,
  unit,
  height = 220,
}: {
  data: TrendPoint[];
  color: string;
  unit?: string;
  height?: number;
}) {
  const gradId = `grad-${color.replace("#", "")}`;
  const hasData = data.some((d) => d.value !== null);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--color-muted)]"
        style={{ height }}
      >
        No data yet — start logging to see your trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e8eaed",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(16,24,40,0.08)",
          }}
          labelFormatter={(l) => formatDay(String(l))}
          formatter={(v: number | string) => [
            `${v}${unit ? ` ${unit}` : ""}`,
            "",
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          connectNulls
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
