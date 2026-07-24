'use client';

import React, { useState } from 'react';
import { Dumbbell, ShieldCheck, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { triggerHaptic } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    triggerHaptic('medium');
    if (!isSupabaseConfigured || !supabase) {
      alert(`En modo demostración/local storage. Conecta las claves de Supabase para activar el OAuth real con ${provider}.`);
      router.push('/');
      return;
    }
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (!isSupabaseConfigured || !supabase) {
      router.push('/');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm space-y-6 rounded-3xl border border-zinc-800 p-6 text-center shadow-2xl">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-zinc-950 shadow-lg shadow-emerald-500/20">
          <Dumbbell className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">PUSH_ME</h1>
          <p className="text-xs text-zinc-400 mt-1">Gestión Inteligente de Entrenamiento PWA</p>
        </div>

        {/* OAuth Social Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-bold text-white shadow-md hover:bg-zinc-800 touch-press"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Continuar con Google
          </button>

          <button
            onClick={() => handleOAuthLogin('apple')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-200 touch-press"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.92-14.58-6.15-3.23-2.77-7.1-7.44-11.62-14.02-6.13-8.87-11.04-18.73-14.74-29.58-3.7-10.84-5.55-21.2-5.55-31.07 0-14.33 3.65-26.23 10.95-35.68 7.3-9.45 16.48-14.28 27.54-14.49 4.35 0 9.29 1.1 14.83 3.3 5.54 2.2 9.53 3.33 11.97 3.33 2.12 0 6.18-1.15 12.18-3.46 6.01-2.31 11.1-3.37 15.28-3.18 11.45.54 20.73 4.8 27.84 12.78-10.23 6.19-15.24 14.8-15.03 25.84.22 8.64 3.6 16.03 10.14 22.18 6.54 6.15 14.39 9.68 23.56 10.59-2.45 7.15-5.69 14.28-9.72 21.39z" />
            </svg>
            Continuar con Apple
          </button>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-2 text-[10px] uppercase font-bold text-zinc-500">O Email</span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-black text-zinc-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 touch-press"
          >
            Ingresar / Registrarse <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
