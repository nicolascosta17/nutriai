"use client";

import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NutritionCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  target: number;
  unit: string;
  color?: string;
}

export default function NutritionCard({
  icon: Icon,
  label,
  value,
  target,
  unit,
  color = "text-emerald-600",
}: NutritionCardProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const ratio = value / target;

  const getBarColor = () => {
    if (ratio > 1) return "bg-red-500";
    if (ratio > 0.85) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getBarTrackColor = () => {
    if (ratio > 1) return "bg-red-100";
    if (ratio > 0.85) return "bg-yellow-100";
    return "bg-emerald-100";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>

      {/* Value */}
      <div className="mb-1">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-slate-800"
        >
          {value}
        </motion.span>
        <span className="text-lg text-slate-500 ml-0.5">{unit}</span>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-400 mb-3">
        de {target}
        {unit}
      </p>

      {/* Progress bar */}
      <div
        className={`h-2 rounded-full ${getBarTrackColor()} overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${value} de ${target}${unit}`}
      >
        <motion.div
          className={`h-full rounded-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
