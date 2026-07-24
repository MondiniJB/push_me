'use client';

import React, { useState } from 'react';
import {
  HeartPulse,
  Moon,
  CheckCircle2,
  Circle,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic, triggerConfetti } from '@/lib/utils';
import { CardioLog } from '@/lib/types';

export default function MobilityCardioPage() {
  const {
    mobilityItems,
    toggleMobilityItem,
    cardioLogs,
    addCardioLog,
    recoveryLog,
    updateRecoveryLog,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'mobility' | 'cardio' | 'recovery'>('mobility');
  const [showCardioModal, setShowCardioModal] = useState<boolean>(false);

  const [newCardio, setNewCardio] = useState<Partial<CardioLog>>({
    type: 'Running',
    durationMinutes: 30,
    hrZone: 2,
    calories: 300,
    distanceKm: 5.0,
    pace: '5:30',
  });

  const handleSaveCardio = () => {
    triggerHaptic('medium');
    const created: CardioLog = {
      id: `c-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: (newCardio.type as unknown as CardioLog['type']) || 'Running',
      durationMinutes: newCardio.durationMinutes || 30,
      hrZone: newCardio.hrZone || 2,
      calories: newCardio.calories || 300,
      distanceKm: newCardio.distanceKm || 5.0,
      pace: newCardio.pace || '5:30',
    };
    addCardioLog(created);
    setShowCardioModal(false);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Movilidad, Cardio & Recuperación</h1>
        <p className="text-xs text-zinc-400">Acondicionamiento aeróbico y regeneración del SNC</p>
      </div>

      {/* Navigation Pills */}
      <div className="flex rounded-2xl bg-zinc-900 p-1 border border-zinc-800">
        {(
          [
            { id: 'mobility', label: 'Movilidad' },
            { id: 'cardio', label: 'Cardio' },
            { id: 'recovery', label: 'Recuperación' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              triggerHaptic('light');
              setActiveTab(t.id);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-orange-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MOVILIDAD */}
      {activeTab === 'mobility' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Rutina Diaria de Movilidad</h3>
            <span className="text-xs font-bold text-orange-400">
              {mobilityItems.filter((m) => m.completed).length} / {mobilityItems.length} Completados
            </span>
          </div>

          <div className="space-y-2.5">
            {mobilityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('medium');
                  toggleMobilityItem(item.id);
                  if (!item.completed) triggerConfetti();
                }}
                className={`glass-panel flex w-full items-center justify-between rounded-2xl p-4 border transition-all text-left touch-press ${
                  item.completed ? 'border-orange-500/50 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                      {item.area}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">{item.durationSec}s</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>

                {item.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-orange-400 shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-zinc-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: CARDIO */}
      {activeTab === 'cardio' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Historial de Cardio</h3>
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowCardioModal(true);
              }}
              className="flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-md shadow-orange-500/20"
            >
              <Plus className="h-4 w-4" /> Registrar Cardio
            </button>
          </div>

          <div className="space-y-3">
            {cardioLogs.map((log) => (
              <div key={log.id} className="glass-panel rounded-2xl p-4 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-rose-400" />
                    <h4 className="text-sm font-extrabold text-white">{log.type}</h4>
                  </div>
                  <span className="text-[10px] text-zinc-400">{log.date}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-zinc-800/80">
                  <div>
                    <span className="text-[9px] text-zinc-500">DURACIÓN</span>
                    <p className="text-xs font-black text-white">{log.durationMinutes} min</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500">ZONA FC</span>
                    <p className="text-xs font-black text-amber-400">Z{log.hrZone}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500">CALORÍAS</span>
                    <p className="text-xs font-black text-rose-400">{log.calories} kcal</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500">DISTANCIA</span>
                    <p className="text-xs font-black text-orange-400">{log.distanceKm} km</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: RECUPERACIÓN */}
      {activeTab === 'recovery' && (
        <section className="space-y-4">
          <div className="glass-panel space-y-4 rounded-3xl border border-zinc-800 p-5">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-black text-white">Registro de Recuperación Diaria</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Horas de Sueño</span>
                  <span className="text-orange-400">{recoveryLog.sleepHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={recoveryLog.sleepHours}
                  onChange={(e) => updateRecoveryLog({ sleepHours: Number(e.target.value) })}
                  className="w-full text-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Calidad de Sueño (1-5)</span>
                  <span className="text-violet-400">{recoveryLog.sleepQuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={recoveryLog.sleepQuality}
                  onChange={(e) => updateRecoveryLog({ sleepQuality: Number(e.target.value) })}
                  className="w-full text-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Nivel de Energía (1-5)</span>
                  <span className="text-amber-400">{recoveryLog.energyLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={recoveryLog.energyLevel}
                  onChange={(e) => updateRecoveryLog({ energyLevel: Number(e.target.value) })}
                  className="w-full text-amber-500"
                />
              </div>
            </div>

            {/* AI Recommendation Output */}
            <div className="rounded-2xl bg-violet-500/10 p-3.5 border border-violet-500/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                Recomendación del Motor de IA
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{recoveryLog.aiRecommendation}</p>
            </div>
          </div>
        </section>
      )}

      {/* Modal for Cardio */}
      {showCardioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg space-y-4 rounded-3xl border border-zinc-700 bg-zinc-950 p-5">
            <h3 className="text-lg font-black text-white">Registrar Sesión de Cardio</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400">Tipo</label>
                <select
                  value={newCardio.type}
                  onChange={(e) => setNewCardio({ ...newCardio, type: e.target.value as unknown as CardioLog['type'] })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs font-bold text-white"
                >
                  <option value="Running">Running</option>
                  <option value="Ciclismo">Ciclismo</option>
                  <option value="Natación">Natación</option>
                  <option value="Remo">Remo</option>
                  <option value="Caminata">Caminata</option>
                  <option value="HIIT">HIIT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400">Duración (min)</label>
                <input
                  type="number"
                  value={newCardio.durationMinutes}
                  onChange={(e) => setNewCardio({ ...newCardio, durationMinutes: Number(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs font-bold text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCardioModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 py-3 text-xs font-bold text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCardio}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-black text-zinc-950"
              >
                Guardar Cardio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
