'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  PlayCircle,
  Clock,
  Layers,
  Dumbbell,
  RotateCcw,
  Trophy,
  Activity,
  Calendar,
  Moon,
  Droplets,
  HeartPulse,
  Zap,
  Check,
  Circle,
  Scale,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerConfetti, triggerHaptic, getWorkoutLogTotalReps } from '@/lib/utils';

import { getProgressionSuggestion } from '@/lib/progressionEngine';

function WorkoutDetailInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const dayId = (params?.id as string) || 'lunes';
  const dateParam = searchParams?.get('date');
  const logIdParam = searchParams?.get('logId');

  const {
    activeWorkout,
    startWorkout,
    updateWorkoutSet,
    toggleSetCompleted,
    addSetToExercise,
    finishWorkout,
    workoutLogs,
    routineDays,
    nutrition,
    supplements,
    cardioLogs,
    addQuickCardio,
    resetCardioForDate,
    mobilityItems,
  } = useAppStore();



  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [showExerciseBreakdown, setShowExerciseBreakdown] = useState<boolean>(false);


  const routineDay = routineDays.find((d) => d.id === dayId) || routineDays[0];
  const isWorkoutActiveForThisDay = activeWorkout && activeWorkout.dayId === dayId;

  // Find the exact target log by logId, or by date, or fallback to latest for this dayId
  const completedLog = useMemo(() => {
    if (logIdParam) {
      const found = workoutLogs.find((l) => l.id === logIdParam);
      if (found) return found;
    }
    if (dateParam) {
      const found = workoutLogs.find((l) => l.date === dateParam && l.dayId === dayId);
      if (found) return found;
      const dateAny = workoutLogs.find((l) => l.date === dateParam);
      if (dateAny) return dateAny;
    }
    return workoutLogs.find((l) => l.dayId === dayId && l.totalSetsCompleted > 0);
  }, [workoutLogs, dayId, dateParam, logIdParam]);

  const targetDateStr = completedLog?.date || dateParam || new Date().toISOString().split('T')[0];

  const formattedDateLabel = useMemo(() => {
    const d = new Date(targetDateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [targetDateStr]);

  const toggleTechnicalNotes = (exId: string) => {
    triggerHaptic('light');
    setExpandedNotes((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleFinish = () => {
    triggerHaptic('success');
    triggerConfetti();
    finishWorkout();
    router.push('/routines');
  };

  const handleStartWorkout = () => {
    triggerHaptic('medium');
    startWorkout(routineDay.id);
  };

  // Find cardio logged on this target date
  const cardioOnTargetDate = useMemo(() => {
    return cardioLogs.filter((c) => c.date === targetDateStr);
  }, [cardioLogs, targetDateStr]);

  // -------------------------------------------------------------
  // VIEW 1: COMPLETED WORKOUT & FULL DAILY REPORT PER DATE
  // Rendered when workout is not active, but HAS a completed log or date parameter
  // -------------------------------------------------------------
  if (!isWorkoutActiveForThisDay && completedLog) {
    return (
      <div className="space-y-6 pb-28 pt-2">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic('light');
                router.back();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> INFORME COMPLETO DEL DÍA
              </span>
              <h1 className="text-xl font-black text-white">{completedLog.title || routineDay.title}</h1>
            </div>
          </div>

          <button
            onClick={handleStartWorkout}
            className="flex items-center gap-1.5 rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-black text-zinc-950 shadow-md shadow-orange-500/20 hover:bg-orange-400 touch-press"
          >
            <RotateCcw className="h-4 w-4" /> Repetir
          </button>
        </div>

        {/* Hero Performance Summary Card */}
        <section className="glass-panel space-y-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200 capitalize">
                {formattedDateLabel}
              </span>
            </div>
            <span className="rounded-xl bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              ✓ Registrado
            </span>
          </div>

          {/* 4 Workout KPIs Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
              <span className="text-[10px] font-bold text-zinc-400">TIEMPO TOTAL</span>
              <p className="text-xl font-black text-white mt-1">{completedLog.durationMinutes} min</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
              <span className="text-[10px] font-bold text-zinc-400">REPETICIONES TOTALES</span>
              <p className="text-xl font-black text-orange-400 mt-1">{getWorkoutLogTotalReps(completedLog)} reps</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
              <span className="text-[10px] font-bold text-zinc-400">SERIES COMPLETADAS</span>
              <p className="text-xl font-black text-white mt-1">{completedLog.totalSetsCompleted} series</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
              <span className="text-[10px] font-bold text-zinc-400">EJERCICIOS</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{completedLog.exercises.length} ejercicios</p>
            </div>
          </div>

          {/* Ver Entrenamiento Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowExerciseBreakdown((prev) => !prev);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3 text-xs font-black text-orange-400 hover:bg-zinc-800 transition-all touch-press mt-2"
          >
            <Dumbbell className="h-4 w-4" />
            {showExerciseBreakdown ? 'Ocultar Desglose de Ejercicios' : 'Ver Entrenamiento'}
            {showExerciseBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </section>

        {/* Detailed Exercises Breakdown (Shown when 'Ver Entrenamiento' is tapped) */}
        {showExerciseBreakdown && (
          <section className="space-y-4 pt-1 border-t border-zinc-800/80 animate-in fade-in duration-300">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">1. Desglose de Ejercicios Realizados</h3>

            {completedLog.exercises.map((item, idx) => (
              <div key={item.exerciseId || idx} className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-xs font-black text-emerald-400 border border-zinc-800">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{item.exerciseName}</h4>
                      <span className="text-[10px] text-zinc-400">
                        {item.sets.filter((s) => s.completed).length} series completadas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table of Logged Sets */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-zinc-500 px-2">
                    <span className="col-span-3">SERIE</span>
                    <span className="col-span-3 text-center">PESO</span>
                    <span className="col-span-3 text-center">REPS</span>
                    <span className="col-span-3 text-right">ESTADO</span>
                  </div>

                  {item.sets.map((set, sIdx) => (
                    <div
                      key={set.id || sIdx}
                      className="grid grid-cols-12 items-center gap-1 rounded-2xl bg-zinc-900/60 p-2.5 border border-zinc-800/80 text-xs"
                    >
                      <div className="col-span-3 flex items-center gap-1.5 font-bold text-zinc-300">
                        <span>Serie {set.setNumber}</span>
                        {set.isPR && (
                          <span className="flex items-center gap-0.5 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30">
                            <Trophy className="h-2.5 w-2.5" /> PR
                          </span>
                        )}
                      </div>

                      <div className="col-span-3 text-center font-black text-white font-mono">
                        {set.weight} kg
                      </div>

                      <div className="col-span-3 text-center font-black text-white font-mono">
                        {set.reps} reps
                      </div>

                      <div className="col-span-3 flex justify-end">
                        {set.completed ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Listo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                            <Circle className="h-4 w-4 text-zinc-600" /> Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SECTION 2: NUTRICIÓN & HIDRATACIÓN DE LA FECHA */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">2. Nutrición & Hidratación de la Fecha</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Water card */}
            <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">AGUA DIARIA</span>
                <Droplets className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="my-2">
                <span className="text-xl font-black text-white">{nutrition.waterLiters}L</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Meta: {nutrition.targetWaterLiters}L</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, (nutrition.waterLiters / nutrition.targetWaterLiters) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein card */}
            <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">PROTEÍNA DIARIA</span>
                <Activity className="h-4 w-4 text-teal-400" />
              </div>
              <div className="my-2">
                <span className="text-xl font-black text-white">{nutrition.protein}g</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Meta: {nutrition.targetProtein}g</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${Math.min(100, (nutrition.protein / nutrition.targetProtein) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Caloric details row */}
          <div className="glass-panel rounded-2xl p-3.5 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Calorías Totales</span>
              <span className="font-extrabold text-white text-sm">{nutrition.calories} / {nutrition.targetCalories} kcal</span>
            </div>
            <div className="flex gap-3 text-[11px] text-zinc-400 font-mono">
              <span>Carbs: {nutrition.carbs}g</span>
              <span>Grasas: {nutrition.fats}g</span>
              <span>Fibra: {nutrition.fiber}g</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: SUPLEMENTOS & HÁBITOS DE LA FECHA */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">3. Suplementación & Hábitos</h3>
          <div className="glass-panel rounded-3xl border border-zinc-800 p-4 space-y-2">
            {supplements.map((sup) => (
              <div
                key={sup.id}
                className="flex items-center justify-between rounded-2xl bg-zinc-900/60 p-3 border border-zinc-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${sup.completed ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{sup.name}</h5>
                    <span className="text-[10px] text-zinc-400">{sup.dosage} • {sup.category}</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${sup.completed ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                  {sup.completed ? <><Check className="h-3 w-3" /> Registrado</> : <><Circle className="h-3 w-3" /> Pendiente</>}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: CAMINATA & CARDIO DE LA FECHA */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">4. Caminata & Cardio Diarios</h3>
          <div className="glass-panel rounded-3xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Registro de Caminata / Cardio</h4>
                  <span className="text-[10px] text-zinc-400">Sumar minutos y distancia fácilmente</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-rose-400 font-mono">
                  👟 {cardioOnTargetDate.reduce((acc, c) => acc + c.durationMinutes, 0)} Min • {cardioOnTargetDate.reduce((acc, c) => acc + (c.distanceKm || 0), 0).toFixed(1)} Km
                </span>
                {cardioOnTargetDate.length > 0 && (
                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      resetCardioForDate(targetDateStr);
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
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleStartWorkout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-xs font-black text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 touch-press"
          >
            <RotateCcw className="h-4 w-4" /> Repetir Este Entrenamiento
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              router.push('/calendar');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-bold text-zinc-400 hover:text-white touch-press"
          >
            Volver al Calendario Mensual
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: PRE-WORKOUT PREVIEW / LAUNCH SCREEN
  // Rendered when workout is not active and NOT yet completed
  // -------------------------------------------------------------
  if (!isWorkoutActiveForThisDay) {
    return (
      <div className="space-y-6 pb-28 pt-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              router.push('/routines');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              PREPARACIÓN DE SESIÓN
            </span>
            <h1 className="text-xl font-extrabold text-white">{routineDay.title}</h1>
          </div>
        </div>

        {/* Pre-workout Summary Card */}
        <div className="glass-panel rounded-3xl border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">{routineDay.subtitle}</p>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-orange-400" /> ~{routineDay.estMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-amber-400" /> {routineDay.exercises.length} ejercicios
                </span>
              </div>
            </div>

            <button
              onClick={handleStartWorkout}
              className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 touch-press"
            >
              <PlayCircle className="h-5 w-5" /> Iniciar Sesión
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
            {routineDay.targetMuscles.map((m) => (
              <span key={m} className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-300 border border-zinc-800">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Exercises Preview List */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Ejercicios de la Sesión</h3>
          {routineDay.exercises.map((ex, i) => (
            <div key={ex.id} className="glass-panel flex items-center justify-between rounded-2xl p-3.5 border border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-orange-400 border border-zinc-800">
                  {i + 1}
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{ex.name}</h4>
                  <p className="text-[11px] text-zinc-400">
                    {ex.defaultSets} series • Rango {ex.targetRepsRange} reps • RIR {ex.targetRir}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: LIVE ACTIVE WORKOUT EXECUTION LOGGER
  // Rendered when workout is active in store
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Active Workout Header */}
      <div className="sticky top-14 z-30 glass-panel rounded-2xl border border-orange-500/40 p-4 shadow-xl shadow-orange-500/10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              triggerHaptic('light');
              router.push('/routines');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 animate-pulse">
              ENTRENAMIENTO EN VIVO
            </span>
            <h1 className="text-base font-extrabold text-white">{activeWorkout.title}</h1>
          </div>
          <button
            onClick={handleFinish}
            className="rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-md shadow-orange-500/20 hover:bg-orange-400 touch-press"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Exercises Queue list */}
      <div className="space-y-6">
        {activeWorkout.exercises.map((item, exIndex) => {
          const { exercise, sets } = item;

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
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exercise.imageUrl} alt={exercise.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
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
              <div className="flex items-center gap-2 rounded-2xl bg-orange-500/10 p-2.5 border border-orange-500/20">
                <Sparkles className="h-4 w-4 shrink-0 text-orange-400" />
                <div className="text-[11px]">
                  <span className="font-bold text-orange-400">Sugerencia IA: </span>
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
                  <p className="mt-1.5 rounded-xl bg-zinc-900 p-2.5 text-xs text-zinc-300 border border-zinc-800 leading-relaxed">
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
                  <span className="col-span-2 text-center">RIR</span>
                  <span className="col-span-2 text-right">LISTO</span>
                </div>

                {sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 items-center gap-1.5 rounded-2xl p-2.5 transition-all border ${
                      set.completed
                        ? 'border-orange-500/40 bg-orange-500/10'
                        : 'border-zinc-800/80 bg-zinc-900/50'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 flex items-center gap-1">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                          set.completed ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
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
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-sm font-black text-white focus:border-orange-500 focus:outline-none"
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
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-sm font-black text-white focus:border-orange-500 focus:outline-none"
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
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-1.5 text-center text-xs font-bold text-zinc-300 focus:border-orange-500 focus:outline-none"
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
                            ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
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

export default function WorkoutDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Cargando informe...</div>}>
      <WorkoutDetailInner />
    </Suspense>
  );
}
