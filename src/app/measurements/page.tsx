'use client';

import React, { useState } from 'react';
import { Camera, Plus, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { triggerHaptic } from '@/lib/utils';
import { BodyMeasurements } from '@/lib/types';

export default function MeasurementsPage() {
  const { bodyMeasurements, addMeasurement } = useAppStore();

  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurements>>({
    weight: 78.5,
    rightArm: 40.5,
    leftArm: 40.2,
    forearm: 32.4,
    chest: 107.0,
    waist: 81.0,
    hips: 97.0,
    thigh: 62.0,
    calf: 39.0,
    neck: 40.5,
    bodyFatPercentage: 13.2,
  });

  const latest = bodyMeasurements[0] || {
    weight: 78.5,
    rightArm: 40.5,
    leftArm: 40.2,
    forearm: 32.4,
    chest: 107.0,
    waist: 81.0,
    hips: 97.0,
    thigh: 62.0,
    calf: 39.0,
    neck: 40.5,
  };

  const prev = bodyMeasurements[1] || latest;

  const photoBefore = bodyMeasurements[bodyMeasurements.length - 1]?.photoFrontUrl || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80';
  const photoAfter = latest?.photoFrontUrl || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80';

  const handleSave = () => {
    triggerHaptic('medium');
    const created: BodyMeasurements = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: newMeasurement.weight || 78,
      rightArm: newMeasurement.rightArm || 40,
      leftArm: newMeasurement.leftArm || 40,
      forearm: newMeasurement.forearm || 32,
      chest: newMeasurement.chest || 105,
      waist: newMeasurement.waist || 81,
      hips: newMeasurement.hips || 97,
      thigh: newMeasurement.thigh || 61,
      calf: newMeasurement.calf || 38,
      neck: newMeasurement.neck || 40,
      bodyFatPercentage: newMeasurement.bodyFatPercentage || 13.5,
      photoFrontUrl: photoAfter,
    };
    addMeasurement(created);
    setShowModal(false);
  };

  const bodyPointList = [
    { label: 'Brazo Derecho', val: latest.rightArm, prevVal: prev.rightArm, unit: 'cm' },
    { label: 'Brazo Izquierdo', val: latest.leftArm, prevVal: prev.leftArm, unit: 'cm' },
    { label: 'Antebrazo', val: latest.forearm, prevVal: prev.forearm, unit: 'cm' },
    { label: 'Pecho', val: latest.chest, prevVal: prev.chest, unit: 'cm' },
    { label: 'Cintura', val: latest.waist, prevVal: prev.waist, unit: 'cm' },
    { label: 'Cadera', val: latest.hips, prevVal: prev.hips, unit: 'cm' },
    { label: 'Muslo', val: latest.thigh, prevVal: prev.thigh, unit: 'cm' },
    { label: 'Pantorrilla', val: latest.calf, prevVal: prev.calf, unit: 'cm' },
    { label: 'Cuello', val: latest.neck, prevVal: prev.neck, unit: 'cm' },
  ];

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Page Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Medidas Corporales</h1>
          <p className="text-xs text-zinc-400">Seguimiento antropométrico y galería de progreso</p>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowModal(true);
          }}
          className="flex items-center gap-1 rounded-2xl bg-orange-500 px-3 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-orange-500/20 hover:bg-orange-400 touch-press"
        >
          <Plus className="h-4 w-4" /> Registrar
        </button>
      </div>

      {/* Interactive Photo Comparison Slider */}
      <section className="glass-panel space-y-3 rounded-3xl border border-zinc-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-black text-white">Comparador de Fotos Mensuales</h3>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">Arrastra para comparar</span>
        </div>

        {/* Interactive Split Photo Container */}
        <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 touch-none">
          {/* Background Image (After / Current) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoAfter} alt="Actual" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-3 right-3 z-10 rounded-lg bg-zinc-950/80 px-2 py-1 text-[10px] font-extrabold text-orange-400 border border-zinc-800">
            Julio 2026 (Actual)
          </span>

          {/* Foreground Image (Before / Initial) Clipped */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoBefore}
              alt="Inicial"
              className="h-full w-full object-cover max-w-none"
              style={{ width: '100%' }}
            />
            <span className="absolute bottom-3 left-3 z-10 rounded-lg bg-zinc-950/80 px-2 py-1 text-[10px] font-extrabold text-amber-400 border border-zinc-800">
              Mayo 2026 (Antes)
            </span>
          </div>

          {/* Vertical Divider line */}
          <div
            className="absolute bottom-0 top-0 w-1 bg-white shadow-xl cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-zinc-950 shadow-lg">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
          </div>

          {/* Range input overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 h-full w-full opacity-0 cursor-ew-resize"
          />
        </div>
      </section>

      {/* Grid of Antropometric Points */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Puntos de Medición Corporales</h3>
        <div className="grid grid-cols-2 gap-3">
          {bodyPointList.map((item) => {
            const diff = item.val && item.prevVal ? item.val - item.prevVal : 0;
            const diffColor = diff > 0 ? 'text-orange-400' : diff < 0 ? 'text-cyan-400' : 'text-zinc-500';

            return (
              <div key={item.label} className="glass-panel rounded-2xl p-3.5 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-white">
                    {item.val || '--'} {item.unit}
                  </span>
                  {diff !== 0 && (
                    <span className={`text-[11px] font-bold ${diffColor}`}>
                      {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* New Measurement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg space-y-4 rounded-3xl border border-zinc-700 bg-zinc-950 p-5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white">Registrar Nuevas Medidas</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400">Brazo Der (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.rightArm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, rightArm: parseFloat(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400">Pecho (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.chest}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: parseFloat(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.waist}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: parseFloat(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-sm font-bold text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 py-3 text-xs font-bold text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-black text-zinc-950"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
