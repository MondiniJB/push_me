'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic } from '@/lib/utils';

export default function CalendarPage() {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = 31;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Calendario Mensual</h1>
        <p className="text-xs text-zinc-400">Historial de entrenamientos, descansos y racha acumulada</p>
      </div>

      {/* Calendar Card */}
      <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-black capitalize text-white">{currentMonthName}</h3>
          </div>
          <span className="rounded-xl bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            🔥 Racha: 4 Días
          </span>
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
            <span className="h-2 w-2 rounded-full bg-zinc-700" /> Descanso
          </span>
        </div>

        {/* Days Grid (7 columns) */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <span key={d} className="text-[10px] font-bold text-zinc-500 uppercase">
              {d}
            </span>
          ))}

          {daysArray.map((dayNum) => {
            const hasWorkout = dayNum % 2 === 0 || dayNum === 24;
            const hasCardio = dayNum === 18 || dayNum === 21;
            const hasMobility = dayNum % 3 === 0;

            return (
              <div
                key={dayNum}
                onClick={() => triggerHaptic('light')}
                className={`glass-panel flex flex-col items-center justify-between rounded-xl p-2 h-14 border transition-all touch-press ${
                  hasWorkout
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/40'
                }`}
              >
                <span className={`text-xs font-black ${dayNum === 24 ? 'text-orange-400' : 'text-zinc-300'}`}>
                  {dayNum}
                </span>

                <div className="flex gap-0.5">
                  {hasWorkout && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
                  {hasCardio && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                  {hasMobility && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
