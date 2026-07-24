'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Database,
  Target,
  Palette,
  Globe,
  RotateCcw,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  FileJson,
  User,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic } from '@/lib/utils';
import { GoalType, UnitSystem } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { profile, updateProfile, exportAllData, importAllData, resetToDefaults } = useAppStore();

  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const goalOptions: { id: GoalType; label: string; desc: string }[] = [
    { id: 'muscle_gain', label: 'Ganar Masa Muscular', desc: 'Volumen alto, sobrecarga progresiva en 6-10 reps.' },
    { id: 'fat_loss', label: 'Bajar Grasa', desc: 'Déficit calórico, preservación muscular y cardio Z2.' },
    { id: 'maintenance', label: 'Mantener Composición', desc: 'Equilibrio metabólico y salud articular.' },
    { id: 'strength', label: 'Mejorar Fuerza Max', desc: 'Reps bajas (3-5), descansos largos (3-5 min).' },
    { id: 'endurance', label: 'Mejorar Resistencia', desc: 'Reps altas (12-15) y descansos cortos (60s).' },
  ];

  const handleDownloadJSON = () => {
    triggerHaptic('medium');
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PUSH_ME_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleDownloadCSV = () => {
    triggerHaptic('medium');
    const csvContent = 'data:text/csv;charset=utf-8,Fecha,Ejercicio,Peso,Reps,RIR\n2026-07-20,Press Banca,90,8,2\n2026-07-21,Dominadas,10,8,1.5\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PUSH_ME_Entrenamientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Configuración & Cuenta</h1>
        <p className="text-xs text-zinc-400">Personalización de objetivos, métricas y copias de seguridad</p>
      </div>

      {/* Supabase Connection Status Badge */}
      <div className="glass-panel flex items-center justify-between rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {isSupabaseConfigured ? 'Base de Datos Supabase Conectada' : 'Modo Almacenamiento Local (PWA Persistent)'}
            </h4>
            <p className="text-[10px] text-zinc-400">
              {isSupabaseConfigured ? 'Sincronización en tiempo real activa' : 'Tus datos se guardan de forma segura en este dispositivo'}
            </p>
          </div>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      </div>

      {/* Primary Goal Selector */}
      <section className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-black text-white">Objetivo Principal de Entrenamiento</h3>
        </div>

        <div className="space-y-2">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                triggerHaptic('medium');
                updateProfile({ targetGoal: goal.id });
              }}
              className={`flex w-full items-start justify-between rounded-2xl p-3.5 border transition-all text-left touch-press ${
                profile.targetGoal === goal.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
            >
              <div>
                <h4 className="text-xs font-black text-white">{goal.label}</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">{goal.desc}</p>
              </div>
              {profile.targetGoal === goal.id && <Check className="h-5 w-5 text-emerald-400 shrink-0" />}
            </button>
          ))}
        </div>
      </section>

      {/* Metric / Imperial System Switcher */}
      <section className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-black text-white">Sistema de Unidades</h3>
          </div>
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
            {(['metric', 'imperial'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => {
                  triggerHaptic('light');
                  updateProfile({ unitSystem: unit });
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  profile.unitSystem === unit
                    ? 'bg-emerald-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {unit === 'metric' ? 'Métrico (kg/cm)' : 'Imperial (lbs/in)'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Backup & Export Data Section */}
      <section className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-violet-400" />
          <h3 className="text-sm font-black text-white">Exportación & Respaldos</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3 text-xs font-bold text-white hover:border-violet-500/40 touch-press"
          >
            <FileJson className="h-4 w-4 text-violet-400" /> Respaldar JSON
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3 text-xs font-bold text-white hover:border-emerald-500/40 touch-press"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Exportar CSV
          </button>
        </div>

        <button
          onClick={() => {
            triggerHaptic('heavy');
            if (confirm('¿Estás seguro de reiniciar todos los datos a la configuración inicial por defecto?')) {
              resetToDefaults();
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/20 touch-press"
        >
          <RotateCcw className="h-4 w-4" /> Restablecer Datos de Fabrica
        </button>
      </section>
    </div>
  );
}
