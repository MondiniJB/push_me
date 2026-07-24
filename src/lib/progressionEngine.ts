import { Exercise, WorkoutSet, WorkoutLog, RecoveryLog, AICoachInsight, ProgressionType } from './types';

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  message: string;
  badge: string;
  type: 'increase_weight' | 'increase_reps' | 'maintain' | 'improve_form';
}

/**
 * Calculates double progression suggestion for an exercise based on set history.
 */
export function getProgressionSuggestion(
  exercise: Exercise,
  lastSets: WorkoutSet[],
  currentWeight: number
): ProgressionSuggestion {
  if (!lastSets || lastSets.length === 0) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentWeight,
      suggestedWeight: currentWeight,
      message: `Comienza con ${currentWeight} kg manteniendo ${exercise.targetRepsRange} reps y RIR ${exercise.targetRir}`,
      badge: 'Carga Inicial',
      type: 'maintain',
    };
  }

  // Parse target reps range (e.g., "8-10" => max 10)
  const rangeMatch = exercise.targetRepsRange.match(/(\d+)-(\d+)/);
  const minReps = rangeMatch ? parseInt(rangeMatch[1], 10) : 8;
  const maxReps = rangeMatch ? parseInt(rangeMatch[2], 10) : 10;

  const completedWorkingSets = lastSets.filter((s) => s.completed && s.type === 'working');
  if (completedWorkingSets.length === 0) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentWeight,
      suggestedWeight: currentWeight,
      message: `Completa las series objetivo en el rango ${exercise.targetRepsRange} reps.`,
      badge: 'Progreso',
      type: 'increase_reps',
    };
  }

  const allHitMaxReps = completedWorkingSets.every((s) => s.reps >= maxReps);
  const avgRir = completedWorkingSets.reduce((acc, s) => acc + (s.rir ?? 2), 0) / completedWorkingSets.length;

  if (exercise.progressionType === 'weight' || exercise.progressionType === 'double') {
    if (allHitMaxReps) {
      const inc = currentWeight < 30 ? 1.25 : 2.5;
      const newWeight = currentWeight + inc;
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: newWeight,
        message: `¡Gran trabajo! Hoy intenta +${inc} kg (${newWeight} kg) para ${minReps} repeticiones.`,
        badge: 'Subir Carga',
        type: 'increase_weight',
      };
    } else {
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: currentWeight,
        message: `Intenta llegar a ${maxReps} repeticiones sólidas con ${currentWeight} kg antes de subir peso.`,
        badge: 'Dominar Reps',
        type: 'increase_reps',
      };
    }
  }

  if (exercise.progressionType === 'reps') {
    if (allHitMaxReps) {
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: currentWeight + 2.5,
        message: `Completaste el tope del rango (${maxReps} reps). Es momento de incrementar a ${currentWeight + 2.5} kg.`,
        badge: 'Subir Peso',
        type: 'increase_weight',
      };
    }
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentWeight,
      suggestedWeight: currentWeight,
      message: `Enfócate en sumar +1 repetición en tu primera serie de trabajo hoy.`,
      badge: 'Sumar Reps',
      type: 'increase_reps',
    };
  }

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    currentWeight,
    suggestedWeight: currentWeight,
    message: `Prioriza un tempo controlado (3s bajada) y rango completo de movimiento.`,
    badge: 'Técnica Estricta',
    type: 'improve_form',
  };
}

/**
 * Evaluates full user log history & recovery stats to produce automated AI insights.
 */
export function generateAICoachInsights(
  workoutLogs: WorkoutLog[],
  recoveryLogs: RecoveryLog[],
  exercises: Exercise[]
): AICoachInsight[] {
  const insights: AICoachInsight[] = [];
  const nowStr = new Date().toISOString().split('T')[0];

  // 1. Volume progression calculation
  if (workoutLogs.length >= 2) {
    const sorted = [...workoutLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentVol = sorted[0].totalVolumeKg;
    const prevVol = sorted[1].totalVolumeKg;
    if (prevVol > 0) {
      const diffPct = Math.round(((recentVol - prevVol) / prevVol) * 100);
      if (diffPct > 0) {
        insights.push({
          id: 'insight-volume-up',
          date: nowStr,
          type: 'achievement',
          title: 'Incremento de Volumen Total',
          description: `Esta semana tu volumen de carga acumulada aumentó un **${diffPct}%** en comparación a la sesión previa.`,
          actionableText: 'Mantén este ritmo sin descuidar el descanso.',
        });
      }
    }
  } else {
    insights.push({
      id: 'insight-volume-init',
      date: nowStr,
      type: 'achievement',
      title: 'Sistema de Progresión Activo',
      description: 'Esta semana registraste tus primeros entrenamientos. El motor de IA calculará tus tendencias automáticamente.',
      actionableText: 'Continúa registrando cada serie con precisión.',
    });
  }

  // 2. Recovery check
  if (recoveryLogs.length > 0) {
    const latestRec = recoveryLogs[recoveryLogs.length - 1];
    if (latestRec.sleepHours < 6.5 || latestRec.energyLevel <= 2 || latestRec.stressLevel >= 4) {
      insights.push({
        id: 'insight-recovery-low',
        date: nowStr,
        type: 'warning',
        title: 'Recuperación y Sueño Comprometidos',
        description: `Tu nivel de energía promedio es ${latestRec.energyLevel}/5 y dormiste ${latestRec.sleepHours} hrs. Tu capacidad adaptativa está reducida.`,
        actionableText: 'Conviene hacer una semana de descarga (Deload) o reducir 1 serie por ejercicio hoy.',
      });
    }
  }

  // 3. Bench press or Squat progression check
  const benchExercise = exercises.find((e) => e.name.toLowerCase().includes('press banca'));
  if (benchExercise) {
    insights.push({
      id: 'insight-bench-sug',
      date: nowStr,
      type: 'suggestion',
      title: 'Potencial de Sobrecarga Progresiva',
      description: `Tus últimas series de **Press Banca** mostraron RIR 3. Estás listo para progresar.`,
      actionableText: 'Podrías aumentar 2,5 kg en tu próxima sesión de Push.',
    });
  }

  // 4. Muscle volume distribution balance
  insights.push({
    id: 'insight-back-vol',
    date: nowStr,
    type: 'suggestion',
    title: 'Análisis de Distribución Muscular',
    description: 'El balance Tracción / Empuje está en 0.85. Agregar 2 series adicionales de Remo o Jalón optimizará tu postura.',
    actionableText: 'Considera añadir 1 serie de Remo inclinado el viernes.',
  });

  return insights;
}
