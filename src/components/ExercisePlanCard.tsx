"use client";

import { useState } from "react";
import {
  Dumbbell,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Repeat,
} from "lucide-react";

interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: number | string;
  duration?: string;
  instructions?: string;
  type?: "strength" | "cardio" | "flexibility" | "other";
  difficulty?: 1 | 2 | 3;
}

interface ExercisePlanCardProps {
  exercise: Exercise;
  onComplete?: (exerciseId: string, completed: boolean) => void;
}

export default function ExercisePlanCard({
  exercise,
  onComplete,
}: ExercisePlanCardProps) {
  const [completed, setCompleted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    const next = !completed;
    setCompleted(next);
    if (exercise.id && onComplete) {
      onComplete(exercise.id, next);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-xs transition-all ${
        completed ? "border-emerald-200 bg-emerald-50/20" : "border-zinc-200/80 hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
            <Dumbbell className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                {exercise.sets || 3} séries × {exercise.reps || "10-12"} reps
              </span>
              {exercise.duration && (
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exercise.duration}
                </span>
              )}
            </div>

            <h4
              className={`text-sm font-semibold tracking-tight truncate ${
                completed ? "text-emerald-950 line-through" : "text-zinc-950"
              }`}
            >
              {exercise.name}
            </h4>

            {exercise.instructions && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {exercise.instructions}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
            completed
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-zinc-300 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400"
          }`}
          title={completed ? "Concluído" : "Marcar como feito"}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>

      {exercise.instructions && (
        <div className="mt-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[11px] font-medium text-zinc-500 hover:text-zinc-800"
          >
            <span>Ver prescrição biomecânica</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <p className="text-xs text-zinc-600 mt-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed">
              {exercise.instructions}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
