'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, TrendingUp, Scale, Apple, Calendar } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';
import { useAppStore } from '@/lib/store/useAppStore';

const navItems = [
  { label: 'Inicio', href: '/', icon: LayoutDashboard },
  { label: 'Rutinas', href: '/routines', icon: Dumbbell },
  { label: 'Progresión', href: '/progress', icon: TrendingUp },
  { label: 'Medidas', href: '/measurements', icon: Scale },
  { label: 'Nutrición', href: '/nutrition', icon: Apple },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { activeWorkout } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-zinc-800/80 px-2 py-2 pb-safe">
      <div className="mx-auto grid grid-cols-6 w-full max-w-lg items-center text-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHaptic('light')}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1 px-0.5 transition-colors duration-150 touch-press w-full ${
                isActive ? 'text-orange-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-5 w-5 stroke-2" />
                {item.href === '/routines' && activeWorkout && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight text-center leading-tight truncate w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
