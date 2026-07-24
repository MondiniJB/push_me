'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Scale,
  Minus,
  Plus,
  Trash2,
  Calendar,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
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
import { triggerHaptic, triggerConfetti, getLocalDateString } from '@/lib/utils';
import { BodyMeasurements } from '@/lib/types';

export default function WeightTrackerPage() {
  const router = useRouter();
  const { bodyMeasurements, addMeasurement, deleteMeasurement } = useAppStore();

  // Date selection (default today)
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Current weight input
  const latestWeight = bodyMeasurements[0]?.weight || 78.5;
  const [weightVal, setWeightVal] = useState<number>(latestWeight);
  const [weightRange, setWeightRange] = useState<'1M' | '3M' | 'ALL'>('3M');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // Sorting measurements by date
  const sortedMeasurements = [...bodyMeasurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Weight chart dataset (sorted chronological ascending)
  const weightChartData = [...bodyMeasurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      date: new Date(m.date + 'T12:00:00').toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      peso: m.weight,
    }));

  const handleAdjustWeight = (delta: number) => {
    triggerHaptic('light');
    setWeightVal((prev) => parseFloat(Math.max(30, Math.min(250, prev + delta)).toFixed(1)));
  };

  const handleSaveWeight = () => {
    triggerHaptic('medium');
    triggerConfetti();

    const newRecord: BodyMeasurements = {
      id: `weight-${Date.now()}`,
      date: selectedDate,
      weight: parseFloat(weightVal.toFixed(1)),
      rightArm: bodyMeasurements[0]?.rightArm || 40,
      leftArm: bodyMeasurements[0]?.leftArm || 40,
      forearm: bodyMeasurements[0]?.forearm || 32,
      chest: bodyMeasurements[0]?.chest || 105,
      waist: bodyMeasurements[0]?.waist || 81,
      hips: bodyMeasurements[0]?.hips || 97,
      thigh: bodyMeasurements[0]?.thigh || 61,
      calf: bodyMeasurements[0]?.calf || 38,
      neck: bodyMeasurements[0]?.neck || 40,
      bodyFatPercentage: bodyMeasurements[0]?.bodyFatPercentage || 13.5,
    };

    addMeasurement(newRecord);

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            triggerHaptic('light');
            router.push('/');
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all touch-press"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Registro & Evolución de Peso
          </h1>
          <p className="text-xs text-zinc-400">Control de peso corporal en kg</p>
        </div>
      </div>

      {/* Main Interactive Weight Logger Card */}
      <section className="glass-panel space-y-4 rounded-3xl border border-orange-500/30 bg-orange-500/5 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-400" />
            <span className="text-xs font-black uppercase tracking-wider text-orange-400">
              Registrar Peso Corporal
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-zinc-900 px-2.5 py-1 border border-zinc-800 text-xs text-zinc-300 font-bold">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Big Weight Input Controls (- and + side buttons + type input) */}
        <div className="flex items-center justify-center gap-4 py-3">
          <button
            onClick={() => handleAdjustWeight(-0.5)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-800 hover:text-white transition-all touch-press shadow-md"
          >
            <Minus className="h-6 w-6 stroke-[3]" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weightVal}
                onChange={(e) => setWeightVal(parseFloat(e.target.value) || 0)}
                className="w-32 bg-transparent text-center text-4xl font-black text-white font-mono focus:outline-none focus:border-b-2 focus:border-orange-500"
              />
              <span className="text-xl font-black text-orange-400">kg</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">
              Escribe o usa los botones +/-
            </span>
          </div>

          <button
            onClick={() => handleAdjustWeight(0.5)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-orange-500/50 hover:bg-zinc-800 hover:text-white transition-all touch-press shadow-md"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Quick Increment Chips */}
        <div className="grid grid-cols-6 gap-1.5">
          {[
            { label: '-1.0', val: -1.0 },
            { label: '-0.5', val: -0.5 },
            { label: '-0.1', val: -0.1 },
            { label: '+0.1', val: 0.1 },
            { label: '+0.5', val: 0.5 },
            { label: '+1.0', val: 1.0 },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleAdjustWeight(chip.val)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 text-center text-xs font-mono font-bold text-zinc-300 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 transition-all touch-press"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveWeight}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-xs font-black text-zinc-950 shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all touch-press"
        >
          <CheckCircle2 className="h-4 w-4" />
          Guardar Peso Corporal ({weightVal} kg)
        </button>

        {saveSuccessMsg && (
          <p className="text-center text-xs font-bold text-emerald-400 animate-in fade-in">
            ✓ ¡Peso registrado correctamente!
          </p>
        )}
      </section>

      {/* Weight Chart Section */}
      <section className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Gráfico de Evolución</h3>
            <p className="text-[11px] text-zinc-400">Tendencia de peso corporal en kg</p>
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
                  weightRange === r
                    ? 'bg-orange-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#ff6b00' }}
              />
              <Area
                type="monotone"
                dataKey="peso"
                stroke="#ff6b00"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightGradModal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* History Log Table */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
          Historial de Mediciones
        </h3>

        <div className="space-y-2">
          {sortedMeasurements.map((m, idx) => {
            const nextM = sortedMeasurements[idx + 1];
            const diff = nextM ? m.weight - nextM.weight : 0;

            return (
              <div
                key={m.id}
                className="glass-panel flex items-center justify-between rounded-2xl border border-zinc-800 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-mono">{m.weight} kg</h4>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(m.date + 'T12:00:00').toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {diff !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
                        diff < 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {diff < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5" />
                      )}
                      {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg
                    </span>
                  )}

                  {sortedMeasurements.length > 1 && (
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        deleteMeasurement(m.id);
                      }}
                      title="Eliminar registro"
                      className="rounded-xl bg-zinc-900 p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all touch-press"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
