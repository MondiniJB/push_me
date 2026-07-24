'use client';

import React from 'react';
import {
  Apple,
  Zap,
  Droplets,
  CheckCircle2,
  Circle,
  Pill,
  Clock,
  Heart,
  Moon,
  Sun,
  Milk,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic, triggerConfetti } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Zap: Zap,
  Milk: Milk,
  Heart: Heart,
  Moon: Moon,
  Sun: Sun,
  Pill: Pill,
};

export default function NutritionPage() {
  const { supplements, toggleSupplement, nutrition, updateNutrition } = useAppStore();

  const addWater = (liters: number) => {
    triggerHaptic('light');
    const newTotal = Math.min(6.0, Number((nutrition.waterLiters + liters).toFixed(2)));
    updateNutrition({ waterLiters: newTotal });
  };

  const macroList = [
    { label: 'Calorías', val: nutrition.calories, target: nutrition.targetCalories, unit: 'kcal', color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Proteína', val: nutrition.protein, target: nutrition.targetProtein, unit: 'g', color: 'bg-teal-400', text: 'text-teal-400' },
    { label: 'Carbohidratos', val: nutrition.carbs, target: nutrition.targetCarbs, unit: 'g', color: 'bg-amber-400', text: 'text-amber-400' },
    { label: 'Grasas', val: nutrition.fats, target: nutrition.targetFats, unit: 'g', color: 'bg-rose-400', text: 'text-rose-400' },
    { label: 'Fibra', val: nutrition.fiber, target: 35, unit: 'g', color: 'bg-violet-400', text: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Nutrición & Suplementos</h1>
        <p className="text-xs text-zinc-400">Control macro-nutricional y protocolo de suplementación</p>
      </div>

      {/* Daily Macros Target Progress Bars */}
      <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-black text-white">Objetivos de Macros Diarios</h3>
          </div>
          <span className="text-[11px] font-bold text-orange-400">
            {Math.round((nutrition.calories / nutrition.targetCalories) * 100)}% Alcanzado
          </span>
        </div>

        <div className="space-y-3.5">
          {macroList.map((macro) => {
            const pct = Math.min(100, Math.round((macro.val / macro.target) * 100));
            return (
              <div key={macro.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300">{macro.label}</span>
                  <span className="font-mono text-zinc-400">
                    <strong className="text-white">{macro.val}</strong> / {macro.target} {macro.unit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hydration Tracker */}
      <section className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-black text-white">Registro de Hidratación</h3>
              <p className="text-[11px] text-zinc-400">Objetivo: {nutrition.targetWaterLiters} Litros</p>
            </div>
          </div>
          <span className="text-xl font-black text-cyan-400">{nutrition.waterLiters} L</span>
        </div>

        {/* Quick Add Water Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {[0.25, 0.5, 0.75, 1.0].map((amount) => (
            <button
              key={amount}
              onClick={() => addWater(amount)}
              className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-800 py-2 text-xs font-bold text-cyan-400 hover:bg-zinc-800 hover:border-cyan-500/40 touch-press"
            >
              +{amount}L
            </button>
          ))}
        </div>
      </section>

      {/* Daily Supplement Checklist */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Checklist de Suplementos</h3>
          <span className="text-xs font-bold text-orange-400">
            {supplements.filter((s) => s.completed).length} / {supplements.length} Completados
          </span>
        </div>

        <div className="space-y-2.5">
          {supplements.map((item) => {
            const Icon = iconMap[item.iconName] || Pill;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('medium');
                  toggleSupplement(item.id);
                  if (!item.completed) triggerConfetti();
                }}
                className={`glass-panel flex w-full items-center justify-between rounded-2xl p-4 border transition-all text-left touch-press ${
                  item.completed
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.completed ? 'bg-orange-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span>Dosis: {item.dosage}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.scheduledTime}
                      </span>
                    </div>
                  </div>
                </div>

                {item.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-orange-400 shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-zinc-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
