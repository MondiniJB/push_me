'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, HeartPulse, Activity, X, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic, getLocalDateString, getWorkoutLogTotalReps } from '@/lib/utils';


export default function CalendarPage() {
  const router = useRouter();
  const { workoutLogs, cardioLogs, mobilityItems, nutrition, supplements, addQuickCardio, resetCardioForDate } = useAppStore();




  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const currentMonthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Number of days in selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // First day of month offset (0 = Monday, 6 = Sunday)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const paddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: paddingDays }, (_, i) => i);

  const todayStr = getLocalDateString(new Date());

  // Compute dynamic streak
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

  // Navigate months
  const handlePrevMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr(null);
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr(null);
  };

  // Selected date details
  const selectedWorkout = useMemo(() => {
    if (!selectedDateStr) return null;
    return workoutLogs.filter((l) => l.date === selectedDateStr);
  }, [selectedDateStr, workoutLogs]);

  const selectedCardio = useMemo(() => {
    if (!selectedDateStr) return null;
    return cardioLogs.filter((c) => c.date === selectedDateStr);
  }, [selectedDateStr, cardioLogs]);

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Calendario Mensual</h1>
          <p className="text-xs text-zinc-400">Historial dinámico de entrenamientos y actividades</p>
        </div>
      </div>

      {/* Calendar Card Container */}
      <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-black capitalize text-white">{currentMonthName}</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              🔥 Racha: {streakDays} {streakDays === 1 ? 'Día' : 'Días'}
            </span>

            <div className="flex items-center gap-1 bg-zinc-900/90 rounded-xl p-1 border border-zinc-800">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                aria-label="Mes Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                aria-label="Mes Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 border-y border-zinc-800/80 py-2.5 text-[10px] font-bold text-zinc-400">
          <span className="flex items-center gap-1 text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Entrené
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Cardio
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Movilidad
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-zinc-700" /> Descanso (0)
          </span>
        </div>

        {/* Days Grid (7 columns: Mon to Sun) */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <span key={d} className="text-[10px] font-bold text-zinc-500 uppercase">
              {d}
            </span>
          ))}

          {/* Padding empty slots from previous month */}
          {paddingArray.map((p) => (
            <div key={`pad-${p}`} className="h-14 rounded-xl bg-transparent" />
          ))}

          {/* Days of current month */}
          {daysArray.map((dayNum) => {
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${mStr}-${dStr}`;

            const workoutsOnDay = workoutLogs.filter((l) => l.date === dateStr && l.totalSetsCompleted > 0);
            const cardioOnDay = cardioLogs.filter((c) => c.date === dateStr);
            const mobilityOnDay = dateStr === todayStr && mobilityItems.some((m) => m.completed);

            const hasWorkout = workoutsOnDay.length > 0;
            const hasCardio = cardioOnDay.length > 0;
            const hasMobility = mobilityOnDay;

            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            return (
              <button
                key={dayNum}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedDateStr(isSelected ? null : dateStr);
                }}
                className={`glass-panel flex flex-col items-center justify-between rounded-xl p-2 h-14 border transition-all touch-press ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/20 ring-1 ring-orange-500'
                    : isToday
                    ? 'border-amber-500/60 bg-zinc-900'
                    : hasWorkout
                    ? 'border-orange-500/40 bg-orange-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <span
                  className={`text-xs font-black ${
                    isToday ? 'text-orange-400 font-extrabold underline decoration-orange-500 underline-offset-2' : 'text-zinc-300'
                  }`}
                >
                  {dayNum}
                </span>

                <div className="flex gap-0.5">
                  {hasWorkout && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
                  {hasCardio && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                  {hasMobility && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Date Activity Modal / Sheet */}
      {selectedDateStr && (
        <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5 transition-all shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">RESUMEN GENERAL DEL DÍA</span>
              <h4 className="text-sm font-black capitalize text-white">
                {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
            </div>
            <button
              onClick={() => setSelectedDateStr(null)}
              className="rounded-full bg-zinc-900 p-1.5 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              const firstWorkout = selectedWorkout && selectedWorkout[0];
              const targetDayId = firstWorkout ? firstWorkout.dayId : 'lunes';
              const logIdQuery = firstWorkout ? `&logId=${firstWorkout.id}` : '';
              router.push(`/workout/${targetDayId}?date=${selectedDateStr}${logIdQuery}`);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-xs font-black text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 touch-press"
          >
            Ver Informe Completo <ChevronRight className="h-4 w-4" />
          </button>

          {/* 1. Entrenamiento del Día */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Entrenamiento</span>
            {selectedWorkout && selectedWorkout.length > 0 ? (
              selectedWorkout.map((w) => (
                <div
                  key={w.id}
                  onClick={() => {
                    triggerHaptic('medium');
                    router.push(`/workout/${w.dayId}?date=${selectedDateStr}&logId=${w.id}`);
                  }}
                  className="glass-panel flex items-center justify-between rounded-2xl border border-orange-500/40 bg-orange-500/10 p-3 hover:bg-orange-500/20 transition-all cursor-pointer touch-press"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-zinc-950 font-black shrink-0">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">{w.title}</h5>
                      <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
                        {w.durationMinutes} min • {w.totalSetsCompleted} series • {getWorkoutLogTotalReps(w)} reps
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-black text-orange-400">
                    Ver <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl bg-zinc-900/60 p-3 border border-zinc-800/80 text-xs text-zinc-500 font-medium">
                <Dumbbell className="h-4 w-4 text-zinc-600" /> Sin entrenamiento de fuerza registrado
              </div>
            )}
          </div>

          {/* 2. Resumen Nutrición, Hidratación & Suplementos */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase">Nutrición & Agua</span>
              <p className="text-xs font-black text-white">💧 {nutrition.waterLiters}L / {nutrition.targetWaterLiters}L</p>
              <p className="text-[10px] text-zinc-400">🥩 {nutrition.protein}g proteína • {nutrition.calories} kcal</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Suplementos & Hábitos</span>
              <p className="text-xs font-black text-white">
                ⚡ {supplements.filter((s) => s.completed).length} / {supplements.length} tomados
              </p>
              <p className="text-[10px] text-zinc-400">Creatina: {supplements.find((s) => s.name.toLowerCase().includes('creatina'))?.completed ? '✓ Tomada' : 'Pendiente'}</p>
            </div>
          </div>

          {/* 3. Caminata & Cardio del Día + Registro Rápido */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Caminata & Cardio Diarios</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-400 font-mono">
                  👟 {selectedCardio.reduce((acc, c) => acc + c.durationMinutes, 0)} Min • {selectedCardio.reduce((acc, c) => acc + (c.distanceKm || 0), 0).toFixed(1)} Km
                </span>
                {selectedCardio.length > 0 && (
                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      resetCardioForDate(selectedDateStr);
                    }}
                    title="Poner en 0"
                    className="flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-all touch-press"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Poner en 0
                  </button>
                )}
              </div>
            </div>

            {selectedDateStr === todayStr && (
              <div className="grid grid-cols-4 gap-1.5 pt-1">
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
                      addQuickCardio(b.mins, b.km);
                    }}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-1.5 text-center text-[10px] font-black text-rose-400 hover:bg-rose-500/20 transition-all touch-press"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
