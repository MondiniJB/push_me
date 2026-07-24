'use client';

import React, { useEffect } from 'react';
import { Timer, Plus, Minus, X, Play, Pause, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatTime, playTimerBeep, triggerHaptic } from '@/lib/utils';

export const RestTimerModal: React.FC = () => {
  const { activeWorkout, stopRestTimer, setRestTimer, startRestTimer, tickRestTimer } = useAppStore();

  const isRunning = activeWorkout?.isTimerRunning;
  const secondsLeft = activeWorkout?.restTimerSeconds ?? 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      playTimerBeep();
      triggerHaptic('success');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, tickRestTimer]);

  if (!activeWorkout || (!isRunning && secondsLeft === 0)) {
    return null;
  }

  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / 120) * 100));

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg">
      <div className="glass-panel relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/30 p-3 shadow-2xl shadow-emerald-500/10">
        {/* Progress bar background fill */}
        <div
          className="absolute inset-0 bg-emerald-500/10 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Timer className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Descanso en Progreso</p>
            <p className="text-2xl font-black tracking-tight text-white font-mono">{formatTime(secondsLeft)}</p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="relative z-10 flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              setRestTimer(Math.max(0, secondsLeft - 10));
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 touch-press"
            title="-10 segundos"
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setRestTimer(secondsLeft + 30);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 touch-press"
            title="+30 segundos"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('medium');
              stopRestTimer();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 touch-press"
            title="Saltar descanso"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
