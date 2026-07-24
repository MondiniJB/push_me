export type GoalType = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength' | 'endurance';
export type UnitSystem = 'metric' | 'imperial';
export type ProgressionType = 'weight' | 'reps' | 'form' | 'double';
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  targetGoal: GoalType;
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  unitSystem: UnitSystem;
  accentColor: string; // e.g. '#10b981', '#6366f1', '#f59e0b', '#ec4899'
  themeMode: 'dark' | 'light';
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  previousWeight?: number;
  previousReps?: number;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  comment?: string;
  restSeconds: number;
  completed: boolean;
  isPR?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Core' | 'Cardio' | 'Movilidad';
  secondaryMuscles?: string[];
  equipment: string;
  imageUrl: string;
  technicalNotes: string;
  progressionType: ProgressionType;
  targetRir: number;
  targetRestSec: number;
  targetRepsRange: string; // e.g. "8-10"
  defaultSets: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutDay {
  id: DayOfWeek;
  title: string;
  subtitle: string;
  targetMuscles: string[];
  icon: string;
  estMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayId: DayOfWeek;
  title: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
  }[];
}

export interface BodyMeasurements {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  rightArm: number;
  leftArm: number;
  forearm: number;
  chest: number;
  waist: number;
  hips: number;
  thigh: number;
  calf: number;
  neck: number;
  bodyFatPercentage?: number;
  photoFrontUrl?: string;
  photoBackUrl?: string;
  photoSideUrl?: string;
}

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:00"
  completed: boolean;
  category: string;
  iconName: string;
}

export interface NutritionLog {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fats: number; // in g
  fiber: number; // in g
  waterLiters: number; // in L
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWaterLiters: number;
}

export interface MobilityRoutineItem {
  id: string;
  area: 'Hombros' | 'Cadera' | 'Tobillos' | 'Espalda' | 'Pectorales' | 'Isquiotibiales' | 'Glúteos';
  name: string;
  durationSec: number;
  completed: boolean;
  description: string;
  imageUrl?: string;
}

export interface CardioLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'Running' | 'Ciclismo' | 'Natación' | 'Remo' | 'Caminata' | 'HIIT';
  durationMinutes: number;
  hrZone: 1 | 2 | 3 | 4 | 5;
  calories: number;
  distanceKm: number;
  pace: string; // min/km
  notes?: string;
}

export interface RecoveryLog {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: number; // 1-5
  muscleSoreness: number; // 1-5
  energyLevel: number; // 1-5
  stressLevel: number; // 1-5
  aiRecommendation?: string;
}

export interface AICoachInsight {
  id: string;
  date: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'deload';
  title: string;
  description: string;
  actionableText: string;
}
