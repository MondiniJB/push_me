'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Layers,
  Flame,
  ArrowUpRight,
  Sliders,
  ChevronRight,
  BarChart3,
  Dumbbell,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatWeight, triggerHaptic } from '@/lib/utils';
import { getProgressionSuggestion, generateAICoachInsights } from '@/lib/progressionEngine';
import { ProgressionType } from '@/lib/types';

export default function ProgressPage() {
  const { exercises, workoutLogs, updateExercise, recoveryLog } = useAppStore();
  const [selectedExId, setSelectedExId] = useState<string>(exercises[0]?.id || 'ex-bench-press');

  const selectedExercise = exercises.find((e) => e.id === selectedExId) || exercises[0];

  // Calculate volume & PR stats
  let totalTonsLifted = 0;
  let totalSetsCompleted = 0;
  workoutLogs.forEach((log) => {
    totalTonsLifted += log.totalVolumeKg / 1000;
    totalSetsCompleted += log.totalSetsCompleted;
  });

  // Historical logs for selected exercise
  const exerciseLogs = workoutLogs
    .filter((l) => l.exercises.some((e) => e.exerciseId === selectedExercise.id))
    .map((l) => {
      const exData = l.exercises.find((e) => e.exerciseId === selectedExercise.id);
      const maxWeight = Math.max(...(exData?.sets.map((s) => s.weight) || [0]));
      return {
        date: new Date(l.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        pesoMax: maxWeight,
        volumen: exData?.sets.reduce((acc, s) => acc + s.weight * s.reps, 0) || 0,
      };
    })
    .reverse();

  // Historical PR
  const allTimePR = Math.max(
    ...workoutLogs.flatMap((l) =>
      l.exercises
        .filter((e) => e.exerciseId === selectedExercise.id)
        .flatMap((e) => e.sets.map((s) => s.weight))
    ),
    60
  );

  // Last log
  const lastLog = workoutLogs.find((l) => l.exercises.some((e) => e.exerciseId === selectedExercise.id));
  const lastWeight = lastLog?.exercises.find((e) => e.exerciseId === selectedExercise.id)?.sets[0]?.weight || 50;

  // Auto suggestion calculation
  const suggestion = getProgressionSuggestion(selectedExercise, lastLog?.exercises[0]?.sets || [], lastWeight);

  // AI Insights
  const insights = generateAICoachInsights(workoutLogs, [recoveryLog], exercises);

  // Chart data for weekly volume
  const weeklyVolumeData = workoutLogs.map((l) => ({
    dia: new Date(l.date).toLocaleDateString('es-ES', { weekday: 'short' }),
    volumen: Math.round(l.totalVolumeKg),
  }));

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Progresión & IA Coach</h1>
        <p className="text-xs text-zinc-400">Análisis inteligente de marcas, cargas y volumen</p>
      </div>

      {/* AI Assistant Insight Cards Feed */}
      <section className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Diagnóstico de IA en Vivo</h2>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`glass-panel relative overflow-hidden rounded-2xl p-4 border transition-all ${
                insight.type === 'warning'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : insight.type === 'achievement'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-violet-500/40 bg-violet-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                    insight.type === 'warning'
                      ? 'bg-amber-500 text-zinc-950'
                      : insight.type === 'achievement'
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-violet-500 text-zinc-950'
                  }`}
                >
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : insight.type === 'achievement' ? (
                    <Award className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white">{insight.title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{insight.description}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 pt-1">
                    <ArrowUpRight className="h-3 w-3" /> {insight.actionableText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High-level Stats Banner */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="glass-panel rounded-2xl p-3 text-center border border-zinc-800">
          <span className="text-[10px] font-bold text-zinc-400">TONELADAS</span>
          <p className="text-lg font-black text-emerald-400">{totalTonsLifted.toFixed(1)}t</p>
        </div>
        <div className="glass-panel rounded-2xl p-3 text-center border border-zinc-800">
          <span className="text-[10px] font-bold text-zinc-400">SERIES TOTALES</span>
          <p className="text-lg font-black text-amber-400">{totalSetsCompleted}</p>
        </div>
        <div className="glass-panel rounded-2xl p-3 text-center border border-zinc-800">
          <span className="text-[10px] font-bold text-zinc-400">RÉCORDS (PR)</span>
          <p className="text-lg font-black text-violet-400">12</p>
        </div>
      </section>

      {/* Exercise Detail Progression Picker */}
      <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white">Análisis por Ejercicio</h3>
          <select
            value={selectedExId}
            onChange={(e) => {
              triggerHaptic('light');
              setSelectedExId(e.target.value);
            }}
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Exercise Header Card */}
        <div className="flex items-center justify-between border-y border-zinc-800/80 py-3">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase">{selectedExercise.muscleGroup}</span>
            <h4 className="text-base font-extrabold text-white">{selectedExercise.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400">RÉCORD HISTÓRICO</span>
            <p className="text-base font-black text-amber-400">{allTimePR} kg</p>
          </div>
        </div>

        {/* Progression Strategy Configurator */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Estrategia de Progresión Configurada</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'double', label: 'Doble Progresión' },
                { id: 'weight', label: 'Priorizar Peso' },
                { id: 'reps', label: 'Priorizar Reps' },
                { id: 'form', label: 'Priorizar Técnica' },
              ] as const
            ).map((strat) => (
              <button
                key={strat.id}
                onClick={() => {
                  triggerHaptic('light');
                  updateExercise(selectedExercise.id, { progressionType: strat.id as ProgressionType });
                }}
                className={`rounded-xl p-2.5 text-xs font-bold text-left border transition-all ${
                  selectedExercise.progressionType === strat.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {strat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Weight Suggestion Banner */}
        <div className="glass-panel flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
          <Sparkles className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase">
              {suggestion.badge}
            </span>
            <p className="text-xs font-bold text-white mt-1">{suggestion.message}</p>
          </div>
        </div>

        {/* Exercise Progress Chart */}
        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={exerciseLogs.length > 0 ? exerciseLogs : [{ date: 'Hoy', pesoMax: lastWeight, volumen: 0 }]}>
              <XAxis dataKey="date" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="pesoMax" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Weekly Volume Distribution Chart */}
      <section className="glass-panel rounded-3xl border border-zinc-800 p-5 space-y-3">
        <h3 className="text-sm font-black text-white">Volumen de Carga por Sesión (kg)</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyVolumeData}>
              <XAxis dataKey="dia" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Bar dataKey="volumen" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
