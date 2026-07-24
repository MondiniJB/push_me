import { UserProfile, WorkoutDay, Exercise, BodyMeasurements, SupplementItem, NutritionLog, MobilityRoutineItem, RecoveryLog, CardioLog, WorkoutLog } from './types';

export const initialProfile: UserProfile = {
  id: 'user-default-1',
  name: 'Alex Vance',
  email: 'alex@pushme.fit',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetGoal: 'muscle_gain',
  currentWeight: 78.5,
  targetWeight: 83.0,
  unitSystem: 'metric',
  accentColor: '#10b981',
  themeMode: 'dark',
  createdAt: '2026-01-01',
};

export const defaultExercises: Exercise[] = [
  {
    id: 'ex-bench-press',
    name: 'Press Banca con Barra',
    muscleGroup: 'Pecho',
    secondaryMuscles: ['Hombro Anterior', 'Tríceps'],
    equipment: 'Barra Olímpica',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Mantén los escápulas retraídas y deprimidas. Retracción escapular firme. Trayectoria en arco suave.',
    progressionType: 'double',
    targetRir: 2,
    targetRestSec: 180,
    targetRepsRange: '6-8',
    defaultSets: 4,
  },
  {
    id: 'ex-incline-db-press',
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'Pecho',
    secondaryMuscles: ['Hombro Anterior'],
    equipment: 'Mancuernas + Banco 30°',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Ángulo de banco a 30 grados. Baja sintiendo el estiramiento en la porción clavicular del pectoral.',
    progressionType: 'weight',
    targetRir: 1,
    targetRestSec: 120,
    targetRepsRange: '8-10',
    defaultSets: 3,
  },
  {
    id: 'ex-overhead-press',
    name: 'Press Militar de Pie',
    muscleGroup: 'Hombros',
    secondaryMuscles: ['Tríceps', 'Core'],
    equipment: 'Barra Olímpica',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Glúteos y abdomen contraídos. Pasa la barra rozando el rostro y mete la cabeza al bloquear arriba.',
    progressionType: 'double',
    targetRir: 2,
    targetRestSec: 150,
    targetRepsRange: '6-8',
    defaultSets: 3,
  },
  {
    id: 'ex-lateral-raises',
    name: 'Elevaciones Laterales',
    muscleGroup: 'Hombros',
    secondaryMuscles: ['Trapecio'],
    equipment: 'Mancuernas / Polea',
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Lidera con los codos ligeramente flexionados. Imagina volcar una jarra de agua al tope.',
    progressionType: 'reps',
    targetRir: 0,
    targetRestSec: 90,
    targetRepsRange: '12-15',
    defaultSets: 4,
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Extensión de Tríceps en Polea',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polea Alta + Cuerda',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Codos pegados a los costados. Abre la cuerda al final del recorrido para máxima contracción.',
    progressionType: 'reps',
    targetRir: 1,
    targetRestSec: 90,
    targetRepsRange: '10-12',
    defaultSets: 3,
  },
  {
    id: 'ex-pullup',
    name: 'Dominadas Pronas',
    muscleGroup: 'Espalda',
    secondaryMuscles: ['Bíceps', 'Antebrazo'],
    equipment: 'Barra Dominadas',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Inicia el movimiento deprimiendo escápulas. Lleva el pecho a la barra, no solo la barbilla.',
    progressionType: 'double',
    targetRir: 1,
    targetRestSec: 150,
    targetRepsRange: '6-10',
    defaultSets: 4,
  },
  {
    id: 'ex-barbell-row',
    name: 'Remo con Barra Inclinado',
    muscleGroup: 'Espalda',
    secondaryMuscles: ['Bíceps', 'Zona Lumbar'],
    equipment: 'Barra Olímpica',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Torso a 45 grados. Lleva la barra hacia el ombligo apretando el dorsal al final.',
    progressionType: 'weight',
    targetRir: 2,
    targetRestSec: 120,
    targetRepsRange: '8-10',
    defaultSets: 4,
  },
  {
    id: 'ex-bicep-curl',
    name: 'Curl de Bíceps con Barra Z',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebrazo'],
    equipment: 'Barra Z',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Sin balanceo del torso. Mantén la tensión constante en la fase excéntrica.',
    progressionType: 'reps',
    targetRir: 1,
    targetRestSec: 90,
    targetRepsRange: '10-12',
    defaultSets: 3,
  },
  {
    id: 'ex-squat',
    name: 'Sentadilla Trasera con Barra',
    muscleGroup: 'Piernas',
    secondaryMuscles: ['Glúteos', 'Core', 'Isquiotibiales'],
    equipment: 'Rack + Barra Olímpica',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Profundidad pasando el paralelo. Empuja el suelo repartiendo el peso en todo el pie.',
    progressionType: 'double',
    targetRir: 2,
    targetRestSec: 180,
    targetRepsRange: '6-8',
    defaultSets: 4,
  },
  {
    id: 'ex-rdl',
    name: 'Peso Muerto Rumano',
    muscleGroup: 'Piernas',
    secondaryMuscles: ['Isquiotibiales', 'Glúteos', 'Erectores'],
    equipment: 'Barra / Mancuernas',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Bisagra de cadera pura. Flexión mínima de rodilla. Siente el estiramiento isquiotibial.',
    progressionType: 'weight',
    targetRir: 2,
    targetRestSec: 150,
    targetRepsRange: '8-10',
    defaultSets: 3,
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Elevaciones de Pierna en Barra',
    muscleGroup: 'Core',
    secondaryMuscles: ['Psoas'],
    equipment: 'Barra Dominadas',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&auto=format&fit=crop&q=80',
    technicalNotes: 'Evita la inercia. Eleva la pelvis enrollando el abdomen inferior al subir.',
    progressionType: 'reps',
    targetRir: 0,
    targetRestSec: 60,
    targetRepsRange: '12-15',
    defaultSets: 3,
  },
];

export const defaultRoutineDays: WorkoutDay[] = [
  {
    id: 'lunes',
    title: 'Push (Pecho - Hombro - Tríceps)',
    subtitle: 'Fuerza e hipertrofia de empuje primario',
    targetMuscles: ['Pecho', 'Hombros', 'Tríceps'],
    icon: 'Dumbbell',
    estMinutes: 65,
    exercises: [
      defaultExercises[0], // Press banca
      defaultExercises[1], // Press inclinado
      defaultExercises[2], // Press militar
      defaultExercises[3], // Elevaciones laterales
      defaultExercises[4], // Tríceps
    ],
  },
  {
    id: 'martes',
    title: 'Pull (Espalda - Bíceps)',
    subtitle: 'Desarrollo de tracción y densidad de espalda',
    targetMuscles: ['Espalda', 'Bíceps', 'Antebrazo'],
    icon: 'Flame',
    estMinutes: 60,
    exercises: [
      defaultExercises[5], // Dominadas
      defaultExercises[6], // Remo con barra
      defaultExercises[7], // Curl bíceps
    ],
  },
  {
    id: 'miercoles',
    title: 'Piernas + Core',
    subtitle: 'Fuerza de tren inferior y estabilidad central',
    targetMuscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Core'],
    icon: 'Zap',
    estMinutes: 70,
    exercises: [
      defaultExercises[8], // Sentadilla
      defaultExercises[9], // RDL
      defaultExercises[10], // Elevaciones pierna
    ],
  },
  {
    id: 'jueves',
    title: 'Push Hipertrofia',
    subtitle: 'Volumen acumulado y trabajo metabólico',
    targetMuscles: ['Pecho', 'Hombros Lateral', 'Tríceps'],
    icon: 'Sparkles',
    estMinutes: 55,
    exercises: [
      defaultExercises[1], // Press inclinado
      defaultExercises[3], // Elevaciones laterales
      defaultExercises[4], // Tríceps polea
    ],
  },
  {
    id: 'viernes',
    title: 'Pull + Piernas',
    subtitle: 'Estímulo completo y volumen semanal balanceado',
    targetMuscles: ['Espalda', 'Isquiotibiales', 'Bíceps'],
    icon: 'Target',
    estMinutes: 65,
    exercises: [
      defaultExercises[6], // Remo barra
      defaultExercises[9], // Peso muerto rumano
      defaultExercises[7], // Curl bíceps
    ],
  },
  {
    id: 'sabado',
    title: 'Cardio + Movilidad',
    subtitle: 'Acondicionamiento aeróbico y salud articular',
    targetMuscles: ['Cardio', 'Movilidad', 'Flexibilidad'],
    icon: 'HeartPulse',
    estMinutes: 45,
    exercises: [],
  },
  {
    id: 'domingo',
    title: 'Descanso Total',
    subtitle: 'Recuperación del sistema nervioso central',
    targetMuscles: ['Regeneración'],
    icon: 'Moon',
    estMinutes: 0,
    exercises: [],
  },
];

export const initialSupplements: SupplementItem[] = [
  { id: 'sup-1', name: 'Creatina Monohidratada', dosage: '5g', scheduledTime: '08:00', completed: false, category: 'Rendimiento', iconName: 'Zap' },
  { id: 'sup-2', name: 'Proteína Whey Isolate', dosage: '30g', scheduledTime: '11:00', completed: false, category: 'Nutrición', iconName: 'Milk' },
  { id: 'sup-3', name: 'Omega 3 (EPA/DHA)', dosage: '2000mg', scheduledTime: '13:00', completed: false, category: 'Salud', iconName: 'Heart' },
  { id: 'sup-4', name: 'Citrato de Magnesio', dosage: '400mg', scheduledTime: '21:30', completed: false, category: 'Sueño', iconName: 'Moon' },
  { id: 'sup-5', name: 'Vitamina D3 + K2', dosage: '5000 UI', scheduledTime: '08:30', completed: false, category: 'Inmunidad', iconName: 'Sun' },
  { id: 'sup-6', name: 'Multivitamínico', dosage: '1 cap', scheduledTime: '08:30', completed: false, category: 'Salud', iconName: 'Pill' },
];

export const initialNutrition: NutritionLog = {
  date: new Date().toISOString().split('T')[0],
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  waterLiters: 0,
  targetCalories: 2750,
  targetProtein: 185,
  targetCarbs: 290,
  targetFats: 70,
  targetWaterLiters: 3.8,
};

export const defaultMobilityItems: MobilityRoutineItem[] = [
  { id: 'mob-1', area: 'Hombros', name: 'Dislocaciones de hombro con banda', durationSec: 60, completed: false, description: '15 reps lentas manteniendo los brazos estirados.' },
  { id: 'mob-2', area: 'Cadera', name: '90/90 Hips Switch', durationSec: 90, completed: false, description: 'Rotación interna y externa de cadera sentado en el suelo.' },
  { id: 'mob-3', area: 'Tobillos', name: 'Movilización Ankle Wall Drive', durationSec: 60, completed: false, description: 'Empuja la rodilla hacia la pared manteniendo el talón firme.' },
  { id: 'mob-4', area: 'Espalda', name: 'Cat-Cow + Rotaciones torácicas', durationSec: 90, completed: false, description: 'Mobilidad de columna vertebral en cuadrupedia.' },
  { id: 'mob-5', area: 'Pectorales', name: 'Estiramiento Pectoral en Marco de Puerta', durationSec: 60, completed: false, description: 'Sostiene 30 segundos por lado sintiendo el estiramiento.' },
  { id: 'mob-6', area: 'Isquiotibiales', name: 'Elephant Walks', durationSec: 60, completed: false, description: 'Extensión alterna de rodillas inclinándote hacia adelante.' },
  { id: 'mob-7', area: 'Glúteos', name: 'Pigeon Pose Active Hold', durationSec: 90, completed: false, description: 'Estiramiento profundo de glúteo e iliopsoas.' },
];

export const initialMeasurements: BodyMeasurements[] = [];

export const initialRecovery: RecoveryLog = {
  id: 'rec-1',
  date: new Date().toISOString().split('T')[0],
  sleepHours: 8.0,
  sleepQuality: 5,
  muscleSoreness: 1,
  energyLevel: 5,
  stressLevel: 1,
  aiRecommendation: 'Estado de descanso inicial optimizado.',
};

export const initialCardioLogs: CardioLog[] = [];

export const initialWorkoutLogs: WorkoutLog[] = [];

