'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Info,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatWeight, triggerConfetti, triggerHaptic } from '@/lib/utils';
import { getProgressionSuggestion } from '@/lib/progressionEngine';
import { Exercise, WorkoutSet } from '@/lib/types';

export default function ActiveWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const dayId = (params?.id as string) || 'lunes';

  const {
    activeWorkout,
    startWorkout,
    updateWorkoutSet,
    toggleSetCompleted,
    addSetToExercise,
    finishWorkout,
    cancelWorkout,
    workoutLogs,
    routineDays,
  } = useAppStore();

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Auto initialize workout if not active
  useEffect(() => {
    if (!activeWorkout || activeWorkout.dayId !== dayId) {
      startWorkout(dayId);
    }
  }, [dayId, activeWorkout, startWorkout]);

  if (!activeWorkout) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-zinc-400 font-medium">Cargando sesión de entrenamiento...</p>
      </div>
    );
  }

  const toggleTechnicalNotes = (exId: string) => {
    triggerHaptic('light');
    setExpandedNotes((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleFinish = () => {
    triggerHaptic('success');
    triggerConfetti();
    finishWorkout();
    router.push('/progress');
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Active Workout Header */}
      <div className="sticky top-14 z-30 glass-panel rounded-2xl border border-emerald-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              triggerHaptic('light');
              router.push('/routines');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              ENTRENAMIENTO EN VIVO
            </span>
            <h1 className="text-base font-extrabold text-white">{activeWorkout.title}</h1>
          </div>
          <button
            onClick={handleFinish}
            className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 touch-press"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Exercises Queue list */}
      <div className="space-y-6">
        {activeWorkout.exercises.map((item, exIndex) => {
          const { exercise, sets } = item;

          // Compute historical suggestion for this exercise
          const lastLog = workoutLogs
            .filter((l) => l.exercises.some((e) => e.exerciseId === exercise.id))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          const lastSets = lastLog?.exercises.find((e) => e.exerciseId === exercise.id)?.sets || [];
          const currentWeight = sets[0]?.weight || 50;
          const suggestion = getProgressionSuggestion(exercise, lastSets, currentWeight);

          return (
            <div
              key={exercise.id}
              className="glass-panel relative overflow-hidden rounded-3xl border border-zinc-800 p-4 shadow-lg space-y-4"
            >
              {/* Exercise Header & Media */}
              <div className="flex items-start gap-3">
                {/* Image / GIF preview */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exercise.imageUrl} alt={exercise.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                      {exercise.muscleGroup}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      RIR {exercise.targetRir} • Descanso {exercise.targetRestSec}s
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">{exercise.name}</h3>
                  <p className="text-[11px] text-zinc-400">
                    Objetivo: <strong className="text-zinc-200">{exercise.targetRepsRange} reps</strong> ({exercise.progressionType} focus)
                  </p>
                </div>
              </div>

              {/* AI Auto-Progression Recommendation Badge */}
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-2.5 border border-emerald-500/20">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="text-[11px]">
                  <span className="font-bold text-emerald-400">Sugerencia IA: </span>
                  <span className="text-zinc-200">{suggestion.message}</span>
                </div>
              </div>

              {/* Technical notes accordion */}
              <div>
                <button
                  onClick={() => toggleTechnicalNotes(exercise.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-zinc-200"
                >
                  <Info className="h-3.5 w-3.5 text-zinc-500" /> Notas Técnicas
                  {expandedNotes[exercise.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {expandedNotes[exercise.id] && (
                  <p className="mt-1.5 rounded-xl bg-zinc-900/90 p-2.5 text-xs text-zinc-300 border border-zinc-800 leading-relaxed">
                    {exercise.technicalNotes}
                  </p>
                )}
              </div>

              {/* Sets Table Logger */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-zinc-500 px-2">
                  <span className="col-span-2">SET</span>
                  <span className="col-span-3 text-center">KG</span>
                  <span className="col-span-3 text-center">REPS</span>
                  <span className="col-span-2 text-center">RPE/RIR</span>
                  <span className="col-span-2 text-right">LISTO</span>
                </div>

                {sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 items-center gap-1.5 rounded-2xl p-2.5 transition-all border ${
                      set.completed
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-zinc-800/80 bg-zinc-900/50'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 flex items-center gap-1">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                          set.completed ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {set.setNumber}
                      </span>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          updateWorkoutSet(exIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-sm font-black text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          updateWorkoutSet(exIndex, setIndex, { reps: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-sm font-black text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* RIR Input */}
                    <div className="col-span-2 text-center">
                      <input
                        type="number"
                        max="5"
                        min="0"
                        value={set.rir ?? 2}
                        onChange={(e) =>
                          updateWorkoutSet(exIndex, setIndex, { rir: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-xs font-bold text-zinc-300 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Complete Button */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => {
                          triggerHaptic('medium');
                          toggleSetCompleted(exIndex, setIndex);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all touch-press ${
                          set.completed
                            ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Set button */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    addSetToExercise(exIndex);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-zinc-800 py-2 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-white"
                >
                  <Plus className="h-4 w-4" /> Agregar Serie
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
