'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronRight,
  RotateCcw,
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
import { formatWeight, triggerHaptic, triggerConfetti, getLocalDateString, getWorkoutLogTotalReps } from '@/lib/utils';


export default function HomePage() {
  const router = useRouter();
  const {

    profile,
    routineDays,
    workoutLogs,
    bodyMeasurements,
    supplements,
    toggleSupplement,
    nutrition,
    mobilityItems,
    cardioLogs,
    addQuickCardio,
    resetCardioForDate,
    activeWorkout,
  } = useAppStore();


  const [weightRange, setWeightRange] = useState<'1M' | '3M' | 'ALL'>('3M');

  // Compute actual month metrics
  const now = new Date();
  const daysTrainedThisMonth = useMemo(() => {
    const monthLogs = workoutLogs.filter((l) => {
      const d = new Date(l.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return new Set(monthLogs.map((l) => l.date)).size;
  }, [workoutLogs, now]);

  // Compute actual current week training status per day (0=Monday, 6=Sunday)
  const currentWeekWorkoutDays = useMemo(() => {
    const current = new Date();
    const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const weekMap: Record<number, boolean> = {};
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(dayDate);
      weekMap[i] = workoutLogs.some((l) => l.date === dateStr && l.totalSetsCompleted > 0);
    }
    return weekMap;
  }, [workoutLogs]);

  // Compute real streak days
  const streakDays = useMemo(() => {
    const uniqueDates = Array.from(new Set(workoutLogs.map((l) => l.date))).sort().reverse();
    if (uniqueDates.length === 0) return 0;
    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = getLocalDateString(checkDate);
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [workoutLogs]);

  // Supplements status
  const creatineSup = supplements.find((s) => s.name.toLowerCase().includes('creatina'));

  // Today's Cardio / Caminata totals
  const todayStr = getLocalDateString();
  const todayCardioLogs = cardioLogs.filter((c) => c.date === todayStr);
  const todayCardioMins = todayCardioLogs.reduce((acc, c) => acc + c.durationMinutes, 0);
  const todayCardioKm = todayCardioLogs.reduce((acc, c) => acc + (c.distanceKm || 0), 0);

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

  // Today's suggested or completed routine
  const daysOfWeekMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const todayDayName = daysOfWeekMap[now.getDay()];
  const todayRoutine = routineDays.find((d) => d.id === todayDayName) || routineDays[0];
  const completedTodayLog = workoutLogs.find(
    (l) => l.date === todayStr || l.dayId === todayRoutine.id
  );
  const isTodayRoutineCompleted = Boolean(completedTodayLog);

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Main Today's Hero Workout Launcher / Completed Card */}
      {isTodayRoutineCompleted && completedTodayLog ? (
        <section className="glass-panel relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> RUTINA DEL DÍA REALIZADA
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {completedTodayLog.title || todayRoutine.title}
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">Entrenamiento completado y registrado hoy</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950 font-black border border-emerald-500/30 shrink-0">
              <Dumbbell className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-4">
            <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono font-bold">
              <span>⏱️ {completedTodayLog.durationMinutes} min</span>
              <span>💪 {completedTodayLog.totalSetsCompleted} series</span>
              <span className="text-orange-400">⚡ {getWorkoutLogTotalReps(completedTodayLog)} reps</span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('medium');
                router.push(`/workout/${completedTodayLog.dayId}?date=${todayStr}&logId=${completedTodayLog.id}`);
              }}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 touch-press"
            >
              Ver Informe <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : (
        <section className="glass-panel relative overflow-hidden rounded-3xl border border-zinc-800 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">RUTINA SUGERIDA HOY</span>
              <h2 className="text-xl font-black text-white">{todayRoutine.title}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{todayRoutine.subtitle}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-orange-400 border border-zinc-800 shrink-0">
              <Dumbbell className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-4">
            <div className="flex items-center gap-4 text-xs text-zinc-300 font-medium">
              <span className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-orange-400" /> {todayRoutine.exercises.length} Ejercicios
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-400" /> ~{todayRoutine.estMinutes || 60} min
              </span>
            </div>

            <Link
              href={activeWorkout ? `/workout/${activeWorkout.dayId}` : `/workout/${todayRoutine.id}`}
              onClick={() => triggerHaptic('medium')}
              className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 touch-press"
            >
              {activeWorkout ? 'Reanudar Entrenamiento' : 'Iniciar Entrenamiento'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Resumen de Rendimiento</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Peso Actual & Objetivo (Clickable -> /measurements) */}
          <div
            onClick={() => {
              triggerHaptic('medium');
              router.push('/measurements');
            }}
            className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800 hover:border-orange-500/50 transition-all cursor-pointer touch-press group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-orange-400 transition-colors">
                PESO CORPORAL
              </span>
              <div className="flex items-center gap-1">
                <Scale className="h-4 w-4 text-orange-400" />
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{formatWeight(profile.currentWeight)}</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Objetivo: {formatWeight(profile.targetWeight)}</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
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
                  className={`flex-1 text-center text-[9px] font-bold py-0.5 rounded-md transition-all ${
                    currentWeekWorkoutDays[i]
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900 text-zinc-600 border border-transparent'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Caminata & Cardio Hoy */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">CAMINATA / CARDIO</span>
              <HeartPulse className="h-4 w-4 text-rose-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{todayCardioMins} min</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Distancia: {todayCardioKm.toFixed(1)} km</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (todayCardioMins / 30) * 100)}%` }}
              />
            </div>
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
            <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.min(100, (nutrition.protein / nutrition.targetProtein) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Habits Row */}
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
              ? 'border-orange-500/50 bg-orange-500/10'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${creatineSup?.completed ? 'bg-orange-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400'}`}>
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Creatina Tomada</p>
              <p className="text-[10px] text-zinc-400">5g Monohidrato</p>
            </div>
          </div>
          {creatineSup?.completed ? (
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
          ) : (
            <Circle className="h-5 w-5 text-zinc-600" />
          )}
        </button>

        {/* Agua Log */}
        <div className="glass-panel flex items-center justify-between rounded-2xl p-3.5 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Agua Diaria</p>
              <p className="text-[10px] text-zinc-400">{nutrition.waterLiters}L / {nutrition.targetWaterLiters}L</p>
            </div>
          </div>
          <span className="text-xs font-bold text-cyan-400">
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
              <p className="text-[10px] text-zinc-400">{totalCardioMins} Minutos</p>
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
              <p className="text-[10px] text-zinc-400">{totalMobilityMins} Minutos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cardio / Caminata Tracker (matching Hydration tracker pattern) */}
      <section className="glass-panel rounded-3xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Registro de Caminata / Cardio</h3>
              <p className="text-[11px] text-zinc-400">Objetivo sugerido: 30 Minutos / 3.0 Km</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-rose-400 font-mono">
              {todayCardioMins} Min • {todayCardioKm.toFixed(1)} Km
            </span>
            {(todayCardioMins > 0 || todayCardioKm > 0) && (
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  resetCardioForDate();
                }}
                title="Poner en 0"
                className="flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-all touch-press"
              >
                <RotateCcw className="h-3 w-3" /> Poner en 0
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { mins: 10, km: 1.0, label: '+10m / 1k' },
            { mins: 20, km: 2.0, label: '+20m / 2k' },
            { mins: 30, km: 3.0, label: '+30m / 3k' },
            { mins: 45, km: 4.5, label: '+45m / 4.5k' },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => {
                triggerHaptic('medium');
                triggerConfetti();
                addQuickCardio(b.mins, b.km);
              }}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-center text-xs font-black text-rose-400 hover:bg-rose-500/20 transition-all touch-press"
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {/* Body Weight Evolution Chart */}
      <section className="glass-panel rounded-3xl border border-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              triggerHaptic('medium');
              router.push('/measurements');
            }}
            className="cursor-pointer group flex items-center gap-2 touch-press"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                  Evolución del Peso Corporal
                </h3>
                <ChevronRight className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-[11px] text-zinc-400">Toca para registrar o ver historial</p>
            </div>
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
                  weightRange === r ? 'bg-orange-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div
          onClick={() => {
            triggerHaptic('medium');
            router.push('/measurements');
          }}
          className="h-48 w-full pt-2 cursor-pointer"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#ff6b00' }}
              />
              <Area type="monotone" dataKey="peso" stroke="#ff6b00" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
