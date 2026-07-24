'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Dumbbell,
  Scale,
  Moon,
  Zap,
  Droplets,
  Activity,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Circle,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatWeight, triggerHaptic, triggerConfetti } from '@/lib/utils';
import { generateAICoachInsights } from '@/lib/progressionEngine';

export default function HomePage() {
  const {
    profile,
    routineDays,
    workoutLogs,
    bodyMeasurements,
    supplements,
    toggleSupplement,
    nutrition,
    recoveryLog,
    mobilityItems,
    cardioLogs,
    exercises,
    activeWorkout,
  } = useAppStore();

  const [weightRange, setWeightRange] = useState<'1M' | '3M' | 'ALL'>('3M');

  // Compute metrics
  const now = new Date();
  const currentMonthLogs = workoutLogs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const daysTrainedThisMonth = currentMonthLogs.length;
  const streakDays = Math.max(3, daysTrainedThisMonth); // mock streak

  // Supplements status
  const creatineSup = supplements.find((s) => s.name.toLowerCase().includes('creatina'));

  // Weekly Cardio Total Mins
  const totalCardioMins = cardioLogs.reduce((acc, c) => acc + c.durationMinutes, 0);

  // Weekly Mobility Mins
  const completedMobilityCount = mobilityItems.filter((m) => m.completed).length;
  const totalMobilityMins = completedMobilityCount * 10;

  // Weight chart dataset
  const weightChartData = bodyMeasurements
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      peso: m.weight,
    }))
    .reverse();

  // AI Coach Insights
  const insights = generateAICoachInsights(workoutLogs, [recoveryLog], exercises);

  // Today's suggested routine (e.g. Lunes -> Push, Martes -> Pull)
  const daysOfWeekMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const todayDayName = daysOfWeekMap[now.getDay()];
  const todayRoutine = routineDays.find((d) => d.id === todayDayName) || routineDays[0];

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Dynamic AI Coach Header Banner */}
      {insights.length > 0 && (
        <section className="glass-panel relative overflow-hidden rounded-3xl border border-emerald-500/30 p-4 shadow-xl shadow-emerald-500/10">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-bold shadow-md shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  AI Coach Insight • {insights[0].title}
                </span>
                <span className="text-[10px] text-zinc-400">Hoy</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {insights[0].description}
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" /> {insights[0].actionableText}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Today's Hero Workout Launcher */}
      <section className="glass-panel relative overflow-hidden rounded-3xl border border-zinc-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400">RUTINA SUGERIDA HOY</span>
            <h2 className="text-xl font-black text-white">{todayRoutine.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{todayRoutine.subtitle}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-emerald-400 border border-zinc-700">
            <Dumbbell className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-4">
          <div className="flex items-center gap-4 text-xs text-zinc-300 font-medium">
            <span className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-emerald-400" /> {todayRoutine.exercises.length} Ejercicios
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-amber-400" /> ~{todayRoutine.estMinutes || 60} min
            </span>
          </div>

          <Link
            href={activeWorkout ? `/workout/${activeWorkout.dayId}` : `/workout/${todayRoutine.id}`}
            onClick={() => triggerHaptic('medium')}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 touch-press"
          >
            {activeWorkout ? 'Reanudar Entrenamiento' : 'Iniciar Entrenamiento'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Primary KPI Grid (Apple Fitness Style) */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Resumen de Rendimiento</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Peso Actual & Objetivo */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">PESO CORPORAL</span>
              <Scale className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{formatWeight(profile.currentWeight)}</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Objetivo: {formatWeight(profile.targetWeight)}</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (profile.currentWeight / profile.targetWeight) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Días Entrenados & Racha */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">RACHA DE GIMNASIO</span>
              <Flame className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-amber-400">{streakDays} Días</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">{daysTrainedThisMonth} Entrenamientos este mes</p>
            </div>
            <div className="flex items-center gap-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span
                  key={i}
                  className={`flex-1 text-center text-[9px] font-bold py-0.5 rounded-md ${
                    i < daysTrainedThisMonth ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Sueño & Recuperación */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">SUEÑO PROMEDIO</span>
              <Moon className="h-4 w-4 text-violet-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{recoveryLog.sleepHours} hrs</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Calidad: {recoveryLog.sleepQuality}/5 • Excelente</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Regeneración SNC Alta</span>
          </div>

          {/* Card 4: Proteína Promedio */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">PROTEÍNA DIARIA</span>
              <Activity className="h-4 w-4 text-teal-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{nutrition.protein}g</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Objetivo: {nutrition.targetProtein}g</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.min(100, (nutrition.protein / nutrition.targetProtein) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Habits Row: Creatina, Agua, Cardio, Movilidad */}
      <section className="grid grid-cols-2 gap-3">
        {/* Creatina Checkbox */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            if (creatineSup) {
              toggleSupplement(creatineSup.id);
              if (!creatineSup.completed) triggerConfetti();
            }
          }}
          className={`glass-panel flex items-center justify-between rounded-2xl p-3.5 border transition-all touch-press ${
            creatineSup?.completed
              ? 'border-emerald-500/50 bg-emerald-500/10'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${creatineSup?.completed ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Creatina Tomada</p>
              <p className="text-[10px] text-zinc-400">5g Monohidrato</p>
            </div>
          </div>
          {creatineSup?.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Circle className="h-5 w-5 text-zinc-600" />
          )}
        </button>

        {/* Agua Log */}
        <div className="glass-panel flex items-center justify-between rounded-2xl p-3.5 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Agua Diaria</p>
              <p className="text-[10px] text-zinc-400">{nutrition.waterLiters}L / {nutrition.targetWaterLiters}L</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-400">
            {Math.round((nutrition.waterLiters / nutrition.targetWaterLiters) * 100)}%
          </span>
        </div>

        {/* Cardio Semanal */}
        <div className="glass-panel flex items-center justify-between rounded-2xl p-3.5 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cardio Semanal</p>
              <p className="text-[10px] text-zinc-400">{totalCardioMins} Minutos acumulados</p>
            </div>
          </div>
        </div>

        {/* Movilidad */}
        <div className="glass-panel flex items-center justify-between rounded-2xl p-3.5 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Movilidad</p>
              <p className="text-[10px] text-zinc-400">{totalMobilityMins} Minutos completados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body Weight Evolution Chart (Recharts) */}
      <section className="glass-panel rounded-3xl border border-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Evolución del Peso Corporal</h3>
            <p className="text-[11px] text-zinc-400">Tendencia histórica de peso en kg</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800">
            {(['1M', '3M', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  triggerHaptic('light');
                  setWeightRange(r);
                }}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  weightRange === r ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
