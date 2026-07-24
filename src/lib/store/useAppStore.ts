'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserProfile,
  WorkoutDay,
  Exercise,
  BodyMeasurements,
  SupplementItem,
  NutritionLog,
  MobilityRoutineItem,
  CardioLog,
  RecoveryLog,
  WorkoutLog,
  WorkoutSet,
} from '../types';
import {
  initialProfile,
  defaultRoutineDays,
  defaultExercises,
  initialSupplements,
  initialNutrition,
  defaultMobilityItems,
  initialMeasurements,
  initialRecovery,
  initialCardioLogs,
  initialWorkoutLogs,
} from '../mockData';
import { generateAICoachInsights } from '../progressionEngine';

interface ActiveWorkoutState {
  dayId: string;
  title: string;
  startTime: number;
  exercises: {
    exercise: Exercise;
    sets: WorkoutSet[];
  }[];
  activeExerciseIndex: number;
  activeSetIndex: number;
  restTimerSeconds: number;
  isTimerRunning: boolean;
}

interface AppStore {
  // Profile
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Exercises & Routines
  exercises: Exercise[];
  routineDays: WorkoutDay[];
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updated: Partial<Exercise>) => void;

  // Active Workout Execution
  activeWorkout: ActiveWorkoutState | null;
  startWorkout: (dayId: string) => void;
  cancelWorkout: () => void;
  updateWorkoutSet: (exIndex: number, setIndex: number, updated: Partial<WorkoutSet>) => void;
  toggleSetCompleted: (exIndex: number, setIndex: number) => void;
  addSetToExercise: (exIndex: number) => void;
  finishWorkout: () => void;
  setActiveExerciseIndex: (idx: number) => void;

  // Timer Controls
  setRestTimer: (sec: number) => void;
  startRestTimer: (sec?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;

  // History & Logs
  workoutLogs: WorkoutLog[];
  bodyMeasurements: BodyMeasurements[];
  addMeasurement: (measurement: BodyMeasurements) => void;

  // Supplements & Nutrition
  supplements: SupplementItem[];
  toggleSupplement: (id: string) => void;
  nutrition: NutritionLog;
  updateNutrition: (updated: Partial<NutritionLog>) => void;

  // Mobility, Cardio, Recovery
  mobilityItems: MobilityRoutineItem[];
  toggleMobilityItem: (id: string) => void;
  cardioLogs: CardioLog[];
  addCardioLog: (log: CardioLog) => void;
  recoveryLog: RecoveryLog;
  updateRecoveryLog: (updated: Partial<RecoveryLog>) => void;

  // Export & Data Reset
  exportAllData: () => string;
  importAllData: (jsonData: string) => void;
  resetToDefaults: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      updateProfile: (updated) =>
        set((state) => ({ profile: { ...state.profile, ...updated } })),

      exercises: defaultExercises,
      routineDays: defaultRoutineDays,

      addExercise: (exercise) =>
        set((state) => ({ exercises: [...state.exercises, exercise] })),

      updateExercise: (id, updated) =>
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        })),

      activeWorkout: null,

      startWorkout: (dayId) => {
        const day = get().routineDays.find((d) => d.id === dayId);
        if (!day) return;

        const activeExercises = day.exercises.map((ex) => {
          // Find historical last sets for default filling
          const lastLog = get()
            .workoutLogs.filter((l) => l.exercises.some((e) => e.exerciseId === ex.id))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          const lastExSets = lastLog?.exercises.find((e) => e.exerciseId === ex.id)?.sets;
          const defaultSets: WorkoutSet[] = Array.from({ length: ex.defaultSets }).map((_, i) => {
            const prevSet = lastExSets && lastExSets[i];
            const weight = prevSet ? prevSet.weight : 40;
            const reps = prevSet ? prevSet.reps : 8;
            return {
              id: `set-${ex.id}-${i + 1}-${Date.now()}`,
              setNumber: i + 1,
              type: 'working',
              previousWeight: weight,
              previousReps: reps,
              weight,
              reps,
              rpe: 8,
              rir: ex.targetRir,
              comment: '',
              restSeconds: ex.targetRestSec,
              completed: false,
              isPR: false,
            };
          });

          return { exercise: ex, sets: defaultSets };
        });

        set({
          activeWorkout: {
            dayId,
            title: day.title,
            startTime: Date.now(),
            exercises: activeExercises,
            activeExerciseIndex: 0,
            activeSetIndex: 0,
            restTimerSeconds: 0,
            isTimerRunning: false,
          },
        });
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      setActiveExerciseIndex: (idx) =>
        set((state) =>
          state.activeWorkout
            ? { activeWorkout: { ...state.activeWorkout, activeExerciseIndex: idx } }
            : {}
        ),

      updateWorkoutSet: (exIndex, setIndex, updated) =>
        set((state) => {
          if (!state.activeWorkout) return {};
          const exercises = [...state.activeWorkout.exercises];
          const sets = [...exercises[exIndex].sets];
          sets[setIndex] = { ...sets[setIndex], ...updated };
          exercises[exIndex] = { ...exercises[exIndex], sets };
          return { activeWorkout: { ...state.activeWorkout, exercises } };
        }),

      toggleSetCompleted: (exIndex, setIndex) => {
        const state = get();
        if (!state.activeWorkout) return;
        const exercises = [...state.activeWorkout.exercises];
        const sets = [...exercises[exIndex].sets];
        const targetSet = sets[setIndex];
        const newCompleted = !targetSet.completed;

        sets[setIndex] = { ...targetSet, completed: newCompleted };
        exercises[exIndex] = { ...exercises[exIndex], sets };

        // Auto trigger rest timer if marked completed
        let isTimerRunning = state.activeWorkout.isTimerRunning;
        let restTimerSeconds = state.activeWorkout.restTimerSeconds;

        if (newCompleted) {
          isTimerRunning = true;
          restTimerSeconds = targetSet.restSeconds || 90;
        }

        // Auto advance set index
        let nextSetIndex = setIndex;
        let nextExIndex = exIndex;
        if (newCompleted && setIndex + 1 < sets.length) {
          nextSetIndex = setIndex + 1;
        } else if (newCompleted && exIndex + 1 < exercises.length) {
          nextExIndex = exIndex + 1;
          nextSetIndex = 0;
        }

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises,
            activeExerciseIndex: nextExIndex,
            activeSetIndex: nextSetIndex,
            isTimerRunning,
            restTimerSeconds,
          },
        });
      },

      addSetToExercise: (exIndex) =>
        set((state) => {
          if (!state.activeWorkout) return {};
          const exercises = [...state.activeWorkout.exercises];
          const currentSets = exercises[exIndex].sets;
          const lastSet = currentSets[currentSets.length - 1];
          const newSet: WorkoutSet = {
            id: `set-extra-${Date.now()}`,
            setNumber: currentSets.length + 1,
            type: 'working',
            weight: lastSet ? lastSet.weight : 40,
            reps: lastSet ? lastSet.reps : 8,
            rpe: 8,
            rir: 2,
            restSeconds: lastSet ? lastSet.restSeconds : 90,
            completed: false,
          };

          exercises[exIndex] = {
            ...exercises[exIndex],
            sets: [...currentSets, newSet],
          };
          return { activeWorkout: { ...state.activeWorkout, exercises } };
        }),

      finishWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return;

        const { dayId, title, startTime, exercises } = state.activeWorkout;
        const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

        let totalVolume = 0;
        let totalSets = 0;

        const loggedExercises = exercises.map((item) => {
          const completedSets = item.sets.filter((s) => s.completed);
          totalSets += completedSets.length;
          completedSets.forEach((s) => {
            totalVolume += s.weight * s.reps;
          });

          return {
            exerciseId: item.exercise.id,
            exerciseName: item.exercise.name,
            sets: item.sets,
          };
        });

        const newLog: WorkoutLog = {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          dayId: dayId as any,
          title,
          durationMinutes,
          totalVolumeKg: Math.round(totalVolume),
          totalSetsCompleted: totalSets,
          exercises: loggedExercises,
        };

        set((s) => ({
          workoutLogs: [newLog, ...s.workoutLogs],
          activeWorkout: null,
        }));
      },

      setRestTimer: (sec) =>
        set((state) =>
          state.activeWorkout
            ? { activeWorkout: { ...state.activeWorkout, restTimerSeconds: sec } }
            : {}
        ),

      startRestTimer: (sec) =>
        set((state) =>
          state.activeWorkout
            ? {
                activeWorkout: {
                  ...state.activeWorkout,
                  isTimerRunning: true,
                  restTimerSeconds: sec ?? state.activeWorkout.restTimerSeconds ?? 90,
                },
              }
            : {}
        ),

      stopRestTimer: () =>
        set((state) =>
          state.activeWorkout
            ? { activeWorkout: { ...state.activeWorkout, isTimerRunning: false, restTimerSeconds: 0 } }
            : {}
        ),

      tickRestTimer: () =>
        set((state) => {
          if (!state.activeWorkout || !state.activeWorkout.isTimerRunning) return {};
          const nextSec = state.activeWorkout.restTimerSeconds - 1;
          if (nextSec <= 0) {
            return {
              activeWorkout: {
                ...state.activeWorkout,
                restTimerSeconds: 0,
                isTimerRunning: false,
              },
            };
          }
          return {
            activeWorkout: {
              ...state.activeWorkout,
              restTimerSeconds: nextSec,
            },
          };
        }),

      workoutLogs: initialWorkoutLogs,

      bodyMeasurements: initialMeasurements,
      addMeasurement: (m) =>
        set((state) => ({ bodyMeasurements: [m, ...state.bodyMeasurements] })),

      supplements: initialSupplements,
      toggleSupplement: (id) =>
        set((state) => ({
          supplements: state.supplements.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
        })),

      nutrition: initialNutrition,
      updateNutrition: (updated) =>
        set((state) => ({ nutrition: { ...state.nutrition, ...updated } })),

      mobilityItems: defaultMobilityItems,
      toggleMobilityItem: (id) =>
        set((state) => ({
          mobilityItems: state.mobilityItems.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          ),
        })),

      cardioLogs: initialCardioLogs,
      addCardioLog: (log) =>
        set((state) => ({ cardioLogs: [log, ...state.cardioLogs] })),

      recoveryLog: initialRecovery,
      updateRecoveryLog: (updated) =>
        set((state) => ({ recoveryLog: { ...state.recoveryLog, ...updated } })),

      exportAllData: () => {
        const state = get();
        const exportObj = {
          profile: state.profile,
          workoutLogs: state.workoutLogs,
          bodyMeasurements: state.bodyMeasurements,
          supplements: state.supplements,
          nutrition: state.nutrition,
          cardioLogs: state.cardioLogs,
          recoveryLog: state.recoveryLog,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importAllData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          set({
            profile: parsed.profile || get().profile,
            workoutLogs: parsed.workoutLogs || get().workoutLogs,
            bodyMeasurements: parsed.bodyMeasurements || get().bodyMeasurements,
            supplements: parsed.supplements || get().supplements,
            nutrition: parsed.nutrition || get().nutrition,
            cardioLogs: parsed.cardioLogs || get().cardioLogs,
            recoveryLog: parsed.recoveryLog || get().recoveryLog,
          });
        } catch (e) {
          console.error('Error parsing JSON backup data:', e);
        }
      },

      resetToDefaults: () =>
        set({
          profile: initialProfile,
          exercises: defaultExercises,
          routineDays: defaultRoutineDays,
          workoutLogs: initialWorkoutLogs,
          bodyMeasurements: initialMeasurements,
          supplements: initialSupplements,
          nutrition: initialNutrition,
          mobilityItems: defaultMobilityItems,
          cardioLogs: initialCardioLogs,
          recoveryLog: initialRecovery,
          activeWorkout: null,
        }),
    }),
    {
      name: 'push_me_app_storage_v1',
    }
  )
);
