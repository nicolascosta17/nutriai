"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface WeightDataPoint {
  date: string;
  weight_kg?: number;
  weight?: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-md p-2.5 text-xs text-white">
      <p className="text-zinc-400 text-[11px] font-mono mb-0.5">{label}</p>
      <p className="font-bold font-mono text-emerald-400">
        {payload[0].value.toFixed(1)} kg
      </p>
    </div>
  );
}

export default function WeightChart({ data, targetWeight }: WeightChartProps) {
  const normalizedData = data.map((d) => ({
    date: d.date,
    weight_kg: Number(d.weight_kg ?? d.weight ?? 0),
  }));

  const weights = normalizedData.map((d) => d.weight_kg).filter((w) => w > 0);
  const minWeight = Math.min(...weights, targetWeight ?? Infinity);
  const maxWeight = Math.max(...weights, targetWeight ?? -Infinity);
  const padding = (maxWeight - minWeight) * 0.2 || 2;

  return (
    <div className="w-full">
      <div className="h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={normalizedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              domain={[
                Math.floor(minWeight - padding),
                Math.ceil(maxWeight + padding),
              ]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
              unit="kg"
            />
            <Tooltip content={<CustomTooltip />} />

            {targetWeight && (
              <ReferenceLine
                y={targetWeight}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `Meta: ${targetWeight}kg`,
                  position: "insideTopRight",
                  fill: "#059669",
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="weight_kg"
              stroke="#18181b"
              strokeWidth={2.5}
              dot={{ fill: "#18181b", r: 3.5, strokeWidth: 0 }}
              activeDot={{ fill: "#10b981", r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
