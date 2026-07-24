'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Flame,
  Zap,
  Sparkles,
  Target,
  HeartPulse,
  Moon,
  Clock,
  Layers,
  PlayCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic } from '@/lib/utils';
import { DayOfWeek } from '@/lib/types';

const dayIcons: Record<string, any> = {
  lunes: Dumbbell,
  martes: Flame,
  miercoles: Zap,
  jueves: Sparkles,
  viernes: Target,
  sabado: HeartPulse,
  domingo: Moon,
};

const dayNamesSpanish: Record<DayOfWeek, string> = {
  lunes: 'LUNES',
  martes: 'MARTES',
  miercoles: 'MIÉRCOLES',
  jueves: 'JUEVES',
  viernes: 'VIERNES',
  sabado: 'SÁBADO',
  domingo: 'DOMINGO',
};

export default function RoutinesPage() {
  const { routineDays, activeWorkout } = useAppStore();

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Programa de Rutinas</h1>
          <p className="text-xs text-zinc-400">Estructura semanal de alto rendimiento</p>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="space-y-3.5">
        {routineDays.map((day) => {
          const IconComponent = dayIcons[day.id] || Dumbbell;
          const isRestDay = day.id === 'domingo';
          const isCurrentActive = activeWorkout?.dayId === day.id;

          return (
            <div
              key={day.id}
              className={`glass-panel relative overflow-hidden rounded-3xl border transition-all ${
                isCurrentActive
                  ? 'border-orange-500/60 bg-orange-500/10 shadow-xl shadow-orange-500/10'
                  : 'border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isCurrentActive
                          ? 'bg-orange-500 text-zinc-950 font-bold'
                          : isRestDay
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-zinc-900 text-orange-400 border border-zinc-800'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase">
                        {dayNamesSpanish[day.id]}
                      </span>
                      <h3 className="text-lg font-extrabold text-white">{day.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{day.subtitle}</p>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="rounded-full bg-orange-500/20 px-2.5 py-1 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                      En Curso
                    </span>
                  )}
                </div>

                {/* Target muscles pills */}
                {!isRestDay && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {day.targetMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="rounded-lg bg-zinc-900/90 px-2.5 py-1 text-[10px] font-semibold text-zinc-300 border border-zinc-800"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}

                {/* Exercise list preview */}
                {day.exercises.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-zinc-800/60 pt-3">
                    {day.exercises.slice(0, 4).map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between text-xs text-zinc-300">
                        <span className="font-medium text-zinc-200">{ex.name}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {ex.defaultSets} sets • {ex.targetRepsRange} reps
                        </span>
                      </div>
                    ))}
                    {day.exercises.length > 4 && (
                      <p className="text-[10px] text-zinc-500 font-medium pt-1">
                        + {day.exercises.length - 4} ejercicios adicionales
                      </p>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" /> ~{day.estMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-zinc-500" /> {day.exercises.length} ejercicios
                    </span>
                  </div>

                  {!isRestDay ? (
                    <Link
                      href={`/workout/${day.id}`}
                      onClick={() => triggerHaptic('medium')}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-orange-500/20 hover:bg-orange-400 touch-press"
                    >
                      <PlayCircle className="h-4 w-4" /> Iniciar Día
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-zinc-500">Recuperación Activa</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
