"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { motion } from "framer-motion";

interface MacroValue {
  current: number;
  target: number;
}

interface DailyProgressProps {
  calories: MacroValue;
  protein: MacroValue;
  carbs: MacroValue;
  fat: MacroValue;
}

function MacroBar({
  label,
  current,
  target,
  color,
  bgColor,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  bgColor: string;
}) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {current}g / {target}g
        </span>
      </div>
      <div
        className={`h-3 rounded-full ${bgColor} overflow-hidden`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${current}g de ${target}g`}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function DailyProgress({
  calories,
  protein,
  carbs,
  fat,
}: DailyProgressProps) {
  const caloriePercentage = Math.min(
    (calories.current / calories.target) * 100,
    100
  );
  const remaining = calories.target - calories.current;

  const chartData = [
    {
      name: "Calorias",
      value: caloriePercentage,
      fill: remaining >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">
        Progresso Diário
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Circular chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="75%"
              outerRadius="100%"
              barSize={12}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius={6}
                angleAxisId={0}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">
              {calories.current}
            </span>
            <span className="text-xs text-slate-500">
              de {calories.target} kcal
            </span>
          </div>
        </div>

        {/* Macro bars */}
        <div className="flex-1 w-full space-y-5">
          <MacroBar
            label="Proteína"
            current={protein.current}
            target={protein.target}
            color="bg-blue-500"
            bgColor="bg-blue-100"
          />
          <MacroBar
            label="Carboidratos"
            current={carbs.current}
            target={carbs.target}
            color="bg-orange-500"
            bgColor="bg-orange-100"
          />
          <MacroBar
            label="Gordura"
            current={fat.current}
            target={fat.target}
            color="bg-red-500"
            bgColor="bg-red-100"
          />
        </div>
      </div>

      {/* Remaining message */}
      <div className="mt-6 text-center">
        {remaining >= 0 ? (
          <p className="text-sm text-emerald-600 font-medium">
            Restam{" "}
            <span className="font-bold">{remaining} kcal</span>
          </p>
        ) : (
          <p className="text-sm text-red-600 font-medium">
            <span className="font-bold">{Math.abs(remaining)} kcal</span>{" "}
            acima da meta
          </p>
        )}
      </div>
    </div>
  );
}
