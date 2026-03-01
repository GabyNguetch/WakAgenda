'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CheckCircle2, Calendar, Bell, Settings, Users, FileText, BookAIcon, BookOpen } from 'lucide-react';

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{val}</>;
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCTA = () => {
    router.push(isAuthenticated ? '/dashboard' : '/auth');
  };

  return (
    <>
      <style>{`
        @keyframes float-a {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes float-c {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes float-d {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes hero-reveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-pop {
          from { opacity: 0; transform: scale(0.8) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes orb-breathe {
          0%,100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(1.06); }
        }
        @keyframes underline-draw {
          from { stroke-dashoffset: 240; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes pill-enter {
          from { opacity: 0; transform: translateY(16px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes dot-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }

        .c-badge   { animation: badge-pop  0.5s cubic-bezier(0.16,1,0.3,1) 0.1s  both; }
        .c-title   { animation: hero-reveal 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .c-sub     { animation: hero-reveal 0.75s cubic-bezier(0.16,1,0.3,1) 0.4s  both; }
        .c-cta     { animation: hero-reveal 0.75s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
        .c-stats   { animation: hero-reveal 0.75s cubic-bezier(0.16,1,0.3,1) 0.7s  both; }

        .c-pill-1  { animation: pill-enter 0.6s cubic-bezier(0.16,1,0.3,1) 1.0s both, float-a 7s ease-in-out 1.6s infinite; }
        .c-pill-2  { animation: pill-enter 0.6s cubic-bezier(0.16,1,0.3,1) 1.15s both, float-b 9s ease-in-out 1.75s infinite; }
        .c-pill-3  { animation: pill-enter 0.6s cubic-bezier(0.16,1,0.3,1) 1.3s both, float-c 8s ease-in-out 1.9s infinite; }
        .c-pill-4  { animation: pill-enter 0.6s cubic-bezier(0.16,1,0.3,1) 1.45s both, float-d 10s ease-in-out 2.05s infinite; }

        .c-orb-1   { animation: orb-breathe 8s ease-in-out infinite; }
        .c-orb-2   { animation: orb-breathe 11s ease-in-out 2s infinite; }
        .c-orb-3   { animation: orb-breathe 13s ease-in-out 5s infinite; }

        .c-dot     { animation: dot-blink 1.8s ease-in-out infinite; }

        .c-underline { animation: underline-draw 1s cubic-bezier(0.16,1,0.3,1) 0.95s both; }

        .cta-btn {
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 4px rgba(200,16,46,0.15), 0 12px 36px rgba(200,16,46,0.4);
        }
        .cta-btn:active { transform: scale(0.97); }

        .sec-btn {
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .sec-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .pill-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      <div className="relative w-screen h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#050508] flex flex-col select-none">

        {/* ── Dot grid background ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(200,16,46,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.7,
          }}
        />

        {/* ── Gradient orbs ─────────────────────────────────────────────── */}
        <div className="c-orb-1 absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.22) 0%, transparent 70%)' }} />
        <div className="c-orb-2 absolute -bottom-52 -right-32 w-[640px] h-[640px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,96,10,0.18) 0%, transparent 70%)' }} />
        <div className="c-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.06) 0%, transparent 70%)' }} />

        {/* ── Top nav ───────────────────────────────────────────────────── */}
        <nav className="relative z-20 flex items-center justify-between px-6 sm:px-12 pt-6 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-0">
            <div className="relative w-18 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-0 dark:border-0 bg-transparent p-0">
              <Image src="/images/logo.png" alt="WakAgenda" width={90} height={90} className="object-contain p-0" priority />
            </div>
            <div className="leading-none">
              <p className="text-[15px] font-black tracking-tight text-gray-900 dark:text-white">
                Wak<span className="text-sabc-red">Agenda</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium hidden sm:block">SABC · DSI</p>
            </div>
          </div>

          {/* Nav action */}
          <button
            onClick={handleCTA}
            className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-sabc-red dark:hover:text-sabc-red transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-sabc-red/6 flex items-center gap-1.5"
          >
            {isLoading ? '…' : isAuthenticated ? 'Tableau de bord' : 'Se connecter'}
            <ArrowRight size={13} className="opacity-60" />
          </button>
        </nav>

        {/* ── Hero center ───────────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-4 min-h-0">

          {/* Badge */}
          <div className="c-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12px] font-bold tracking-wide mb-7"
            style={{
              background: 'rgba(200,16,46,0.07)',
              borderColor: 'rgba(200,16,46,0.22)',
              color: '#C8102E',
            }}>
            <span className="c-dot w-1.5 h-1.5 rounded-full bg-sabc-red inline-block" />
            Agenda interactif des stagiaires · SABC
          </div>

          {/* Title */}
          <h1 className="c-title font-black leading-[1.04] tracking-tight text-gray-900 dark:text-white max-w-[720px]"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.2rem)' }}>
            Organisez votre stage
            <br />
            <span className="relative inline-block whitespace-nowrap">
              <span style={{ color: '#C8102E' }}>avec précision.</span>
              <svg
                className="c-underline absolute -bottom-1 left-0 w-full overflow-visible"
                height="6" viewBox="0 0 300 6" fill="none" preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 4.5 Q75 1 150 3.5 Q225 6 298 2.5"
                  stroke="#C8102E" strokeWidth="2.8" strokeLinecap="round"
                  fill="none" strokeDasharray="240"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="c-sub mt-6 text-gray-500 dark:text-gray-400 max-w-[480px] leading-relaxed"
            style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1.08rem)' }}>
            Planifiez vos tâches, suivez vos activités et générez vos rapports de stage — tout en un seul endroit.
          </p>

          {/* CTA buttons */}
          <div className="c-cta mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCTA}
              disabled={isLoading}
              className="cta-btn group flex items-center gap-2.5 px-8 py-3.5 text-[14px] font-bold text-white rounded-2xl disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #C8102E 0%, #a30d24 100%)',
                boxShadow: '0 4px 20px rgba(200,16,46,0.35)',
              }}
            >
              Commencer maintenant
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => router.push('/auth')}
                className="sec-btn flex items-center gap-2 px-6 py-3.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70"
              >
                Créer un compte
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="c-stats mt-10 flex items-center gap-5 sm:gap-10">
            {[
              { icon: CheckCircle2, value: 500, suffix: '+', label: 'Tâches créées' },
              { icon: Calendar,     value: 12,  suffix: '',  label: 'Mois de suivi' },
              { icon: Bell,         value: 98,  suffix: '%', label: 'Satisfaction' },
            ].map(({ icon: Icon, value, suffix, label }, i) => (
              <div key={label} className="flex items-center gap-2.5">
                {i > 0 && <span className="w-px h-7 bg-gray-200 dark:bg-gray-800 hidden sm:block" />}
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(200,16,46,0.09)', color: '#C8102E' }}>
                  <Icon size={13} />
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none">
                    {mounted ? <Counter to={value} /> : 0}{suffix}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-none hidden sm:block">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── Floating pills (desktop only) ─────────────────────────────── */}

        {/* Left top */}
        <div className="c-pill-1 pill-card absolute left-[3%] top-[26%] bg-white/88 dark:bg-gray-900/88 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/8 px-4 py-3 hidden lg:flex items-center gap-3 min-w-[215px] max-w-[240px]">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-base"><Settings size={14} className="text-orange-600 dark:text-orange-400" /></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate">Réaliser l'API REST</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">Développement</span>
              <span className="text-[10px] text-gray-400">09:00</span>
            </div>
          </div>
        </div>

        {/* Right top */}
        <div className="c-pill-2 pill-card absolute right-[3.5%] top-[20%] bg-white/88 dark:bg-gray-900/88 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/8 px-4 py-3 hidden lg:flex items-center gap-3 min-w-[220px] max-w-[248px]">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-base"><Users size={14} className="text-blue-600 dark:text-blue-400" /></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate">Réunion d'équipe DSI</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">Réunion</span>
              <span className="text-[10px] text-gray-400">14:00</span>
            </div>
          </div>
        </div>

        {/* Right bottom */}
        <div className="c-pill-3 pill-card absolute right-[5%] bottom-[18%] bg-white/88 dark:bg-gray-900/88 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/8 px-4 py-3 hidden lg:flex items-center gap-3 min-w-[215px] max-w-[240px]">
          <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-base"><FileText size={14} className="text-green-600 dark:text-green-400" /></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate">Rapport de stage</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Terminé</span>
              <span className="text-[10px] text-gray-400">Rendu</span>
            </div>
          </div>
        </div>

        {/* Left bottom */}
        <div className="c-pill-4 pill-card absolute left-[3%] bottom-[20%] bg-white/88 dark:bg-gray-900/88 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/8 px-4 py-3 hidden xl:flex items-center gap-3 min-w-[210px] max-w-[235px]">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-base"><BookOpen size={14} className="text-purple-600 dark:text-purple-400" /></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate">Formation Git avancé</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">Formation</span>
              <span className="text-[10px] text-gray-400">16:00</span>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="relative z-20 flex-shrink-0 flex items-center justify-center gap-3 pb-5 pt-2">
          <p className="text-[11px] text-gray-400 font-medium">
            © {new Date().getFullYear()} SABC – Direction des Systèmes d'Information
          </p>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
            Conçu pour les stagiaires
          </p>
        </footer>

      </div>
    </>
  );
}