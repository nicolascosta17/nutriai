"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MacroDataPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroChartProps {
  data: MacroDataPoint[];
}

interface MetricConfig {
  key: keyof Omit<MacroDataPoint, "date">;
  label: string;
  color: string;
  gradientId: string;
}

const metrics: MetricConfig[] = [
  {
    key: "calories",
    label: "Calorias",
    color: "#10b981",
    gradientId: "colorCalories",
  },
  {
    key: "protein",
    label: "Proteína",
    color: "#3b82f6",
    gradientId: "colorProtein",
  },
  {
    key: "carbs",
    label: "Carboidratos",
    color: "#f97316",
    gradientId: "colorCarbs",
  },
  {
    key: "fat",
    label: "Gordura",
    color: "#ef4444",
    gradientId: "colorFat",
  },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-slate-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MacroChart({ data }: MacroChartProps) {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
  });

  const toggleMetric = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Histórico Nutricional
      </h3>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              visible[metric.key]
                ? "border-transparent text-white shadow-sm"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
            }`}
            style={
              visible[metric.key]
                ? { backgroundColor: metric.color }
                : undefined
            }
            aria-pressed={visible[metric.key]}
            aria-label={`${visible[metric.key] ? "Ocultar" : "Mostrar"} ${metric.label}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                visible[metric.key] ? "bg-white/60" : ""
              }`}
              style={
                !visible[metric.key]
                  ? { backgroundColor: metric.color }
                  : undefined
              }
            />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {metrics.map((metric) => (
                <linearGradient
                  key={metric.gradientId}
                  id={metric.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={metric.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={metric.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map(
              (metric) =>
                visible[metric.key] && (
                  <Area
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2}
                    fill={`url(#${metric.gradientId})`}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
