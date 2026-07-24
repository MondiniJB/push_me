import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { RestTimerModal } from '@/components/workout/RestTimerModal';
import { PWAInstallPrompt } from '@/components/layout/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'PUSH_ME • Gestor Inteligente de Gimnasio PWA',
  description: 'PWA moderna, minimalista y ultra rápida para gestionar tu entrenamiento de gimnasio, progresiones de carga y nutrición.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PUSH_ME',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950">
      <body className="min-h-full flex flex-col font-sans bg-zinc-950">
        <Header />
        <PWAInstallPrompt />
        <main className="flex-1 mx-auto w-full max-w-lg px-4">{children}</main>
        <RestTimerModal />
        <BottomNav />
      </body>
    </html>
  );
}
