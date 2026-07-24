import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Triggers light, medium, or heavy haptic feedback on mobile devices.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 30, 20]);
        break;
    }
  }
}

/**
 * Plays a pleasant Web Audio synth beep when timer finishes or set completes.
 */
export function playTimerBeep() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio context may be blocked by browser policy until gesture
  }
}

/**
 * Triggers celebratory confetti animation on PR or workout completion.
 */
export function triggerConfetti() {
  if (typeof window === 'undefined') return;
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
  });
}

/**
 * Converts kg to lbs if requested.
 */
export function formatWeight(kg: number, unitSystem: 'metric' | 'imperial' = 'metric'): string {
  if (unitSystem === 'imperial') {
    const lbs = kg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

/**
 * Formats seconds into MM:SS format.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Returns date in YYYY-MM-DD format using local time (prevents UTC timezone shift bugs).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates total completed reps across all exercises in a WorkoutLog.
 */
export function getWorkoutLogTotalReps(log?: {
  totalRepsCompleted?: number;
  exercises?: { sets?: { completed?: boolean; reps?: number }[] }[];
}): number {
  if (!log) return 0;
  if (log.totalRepsCompleted !== undefined && log.totalRepsCompleted > 0) {
    return log.totalRepsCompleted;
  }
  if (!log.exercises) return 0;
  return log.exercises.reduce((acc, ex) => {
    if (!ex.sets) return acc;
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (Number(s.reps) || 0), 0)
    );
  }, 0);
}


