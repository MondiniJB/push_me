-- ====================================================================
-- PUSH_ME PWA - Supabase Database Schema & Row Level Security (RLS)
-- ====================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  target_goal TEXT NOT NULL DEFAULT 'muscle_gain',
  current_weight NUMERIC(5, 2) NOT NULL DEFAULT 75.0,
  target_weight NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
  unit_system TEXT NOT NULL DEFAULT 'metric',
  accent_color TEXT NOT NULL DEFAULT '#10b981',
  theme_mode TEXT NOT NULL DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[],
  equipment TEXT DEFAULT 'Barra / Mancuernas',
  image_url TEXT,
  technical_notes TEXT,
  progression_type TEXT NOT NULL DEFAULT 'double',
  target_rir INT DEFAULT 2,
  target_rest_sec INT DEFAULT 120,
  target_reps_range TEXT DEFAULT '8-10',
  default_sets INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Workout Logs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  total_volume_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_sets_completed INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Workout Sets Log Table
CREATE TABLE IF NOT EXISTS public.workout_sets_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INT NOT NULL,
  set_type TEXT NOT NULL DEFAULT 'working',
  weight NUMERIC(6, 2) NOT NULL,
  reps INT NOT NULL,
  rpe NUMERIC(3, 1),
  rir INT,
  comment TEXT,
  rest_seconds INT DEFAULT 90,
  completed BOOLEAN DEFAULT TRUE,
  is_pr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Body Measurements Table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5, 2) NOT NULL,
  right_arm NUMERIC(5, 2),
  left_arm NUMERIC(5, 2),
  forearm NUMERIC(5, 2),
  chest NUMERIC(5, 2),
  waist NUMERIC(5, 2),
  hips NUMERIC(5, 2),
  thigh NUMERIC(5, 2),
  calf NUMERIC(5, 2),
  neck NUMERIC(5, 2),
  body_fat_percentage NUMERIC(4, 1),
  photo_front_url TEXT,
  photo_back_url TEXT,
  photo_side_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Supplements Daily Table
CREATE TABLE IF NOT EXISTS public.supplements_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'suplemento',
  icon_name TEXT DEFAULT 'Pill',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Nutrition Logs Table
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories INT NOT NULL DEFAULT 0,
  protein INT NOT NULL DEFAULT 0,
  carbs INT NOT NULL DEFAULT 0,
  fats INT NOT NULL DEFAULT 0,
  fiber INT NOT NULL DEFAULT 0,
  water_liters NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
  target_calories INT DEFAULT 2600,
  target_protein INT DEFAULT 180,
  target_carbs INT DEFAULT 280,
  target_fats INT DEFAULT 70,
  target_water_liters NUMERIC(4, 2) DEFAULT 3.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 8. Create Cardio Logs Table
CREATE TABLE IF NOT EXISTS public.cardio_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  hr_zone INT DEFAULT 2,
  calories INT DEFAULT 0,
  distance_km NUMERIC(6, 2) DEFAULT 0,
  pace TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Recovery Logs Table
CREATE TABLE IF NOT EXISTS public.recovery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(4, 1) NOT NULL,
  sleep_quality INT NOT NULL DEFAULT 4,
  muscle_soreness INT NOT NULL DEFAULT 2,
  energy_level INT NOT NULL DEFAULT 4,
  stress_level INT NOT NULL DEFAULT 2,
  ai_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;

-- Helper macro policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own exercises" ON public.exercises FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own exercises" ON public.exercises FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout sets" ON public.workout_sets_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own measurements" ON public.body_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own supplements" ON public.supplements_daily FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own nutrition" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cardio" ON public.cardio_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recovery" ON public.recovery_logs FOR ALL USING (auth.uid() = user_id);

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario PushMe'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
