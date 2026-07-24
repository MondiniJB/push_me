'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Bell, Sparkles, User, Dumbbell } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic } from '@/lib/utils';

export const Header: React.FC = () => {
  const { profile, activeWorkout } = useAppStore();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {/* Brand logo & streak */}
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="flex items-center gap-2 touch-press"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-zinc-950 shadow-md shadow-emerald-500/20">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">PUSH_ME</span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                PRO PWA
              </span>
            </div>
            <p className="text-[10px] font-medium text-zinc-400">Apple Fitness × Linear</p>
          </div>
        </Link>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          {activeWorkout && (
            <Link
              href={`/workout/${activeWorkout.dayId}`}
              onClick={() => triggerHaptic('medium')}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 animate-pulse"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              En Sesión
            </Link>
          )}

          <Link
            href="/progress"
            onClick={() => triggerHaptic('light')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-800 touch-press"
          >
            <Sparkles className="h-4 w-4" />
          </Link>

          <Link
            href="/settings"
            onClick={() => triggerHaptic('light')}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-800 border border-zinc-700 touch-press"
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-zinc-300" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
