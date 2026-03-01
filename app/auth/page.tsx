'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import {
  Mail, Lock, User, Building2, UserCheck, Calendar,
  ChevronRight, ChevronLeft, Eye, EyeOff,
  CheckCircle2, BarChart2, Clock, Users,
  ArrowRight, Shield, Zap,
} from 'lucide-react';

type AuthMode = 'login' | 'register';
const STEPS = ['Identité', 'Stage', 'Sécurité'];

// ─── Typing animation hook ──────────────────────────────────────────────────

const MESSAGES = [
  'Bienvenue sur WakAgenda.',
  'Planifiez vos tâches de stage.',
  'Suivez vos activités au quotidien.',
  'Générez vos rapports en un clic.',
  'Votre stage, organisé avec soin.',
];

function useTypingEffect(messages: string[], typingSpeed = 60, pauseDuration = 2000, erasingSpeed = 35) {
  const [displayed, setDisplayed] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const msg = messages[msgIndex];

    if (isPaused) {
      const t = setTimeout(() => { setIsPaused(false); setIsErasing(true); }, pauseDuration);
      return () => clearTimeout(t);
    }

    if (!isErasing) {
      if (displayed.length < msg.length) {
        const t = setTimeout(() => setDisplayed(msg.slice(0, displayed.length + 1)), typingSpeed);
        return () => clearTimeout(t);
      } else {
        setIsPaused(true);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), erasingSpeed);
        return () => clearTimeout(t);
      } else {
        setIsErasing(false);
        setMsgIndex((i) => (i + 1) % messages.length);
      }
    }
  }, [displayed, isErasing, isPaused, msgIndex, messages, typingSpeed, pauseDuration, erasingSpeed]);

  return displayed;
}

// ─── Stats data ─────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users, value: '500+', label: 'Stagiaires actifs' },
  { icon: CheckCircle2, value: '12K+', label: 'Tâches complétées' },
  { icon: BarChart2, value: '98%', label: 'Satisfaction' },
  { icon: Clock, value: '24/7', label: 'Disponible' },
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();
  const typedText = useTypingEffect(MESSAGES);

  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    supervisor_name: '',
    internship_start_date: '',
    password: '',
    confirm_password: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.login({ email: form.email, password: form.password });
      authService.saveToken(res.access_token);
      setUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.register({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        department: form.department,
        supervisor_name: form.supervisor_name,
        internship_start_date: form.internship_start_date,
        password: form.password,
      });
      authService.saveToken(res.access_token);
      setUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleRegister();
  };
  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const stepValid = () => {
    if (step === 0) return form.first_name && form.last_name && form.email;
    if (step === 1) return form.department && form.supervisor_name && form.internship_start_date;
    if (step === 2) return form.password && form.confirm_password;
    return true;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .auth-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #0a0a0f;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          position: relative;
          width: 50%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @media (max-width: 900px) { .auth-left { display: none; } }

        .auth-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80');
          background-size: cover;
          background-position: center;
          filter: brightness(0.25) saturate(0.6);
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(200,16,46,0.18) 0%,
            rgba(10,10,15,0.7) 50%,
            rgba(10,10,15,0.95) 100%
          );
        }
        /* diagonal accent line */
        .auth-left::after {
          content: '';
          position: absolute;
          top: 0; right: -1px;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, transparent 0%, rgba(200,16,46,0.8) 40%, rgba(232,96,10,0.5) 70%, transparent 100%);
          z-index: 10;
        }

        .auth-left-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 3rem 3rem 2.5rem;
        }

        .auth-logo-block {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          animation: fadeUp 0.6s ease both;
        }
        .auth-logo-img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(200,16,46,0.6));
        }
        .auth-logo-text { display: flex; flex-direction: column; }
        .auth-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.375rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .auth-logo-name span { color: #C8102E; }
        .auth-logo-sub {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .auth-left-middle {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.5rem;
        }

        .auth-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C8102E;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .auth-eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          background: #C8102E;
          border-radius: 2px;
        }

        .auth-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.03em;
          animation: fadeUp 0.7s 0.15s ease both;
        }
        .auth-headline span { color: #C8102E; }

        .auth-typing-container {
          min-height: 2.2rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .auth-typing {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.65);
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        .auth-cursor {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: #C8102E;
          margin-left: 2px;
          vertical-align: middle;
          border-radius: 2px;
          animation: blink 1s step-end infinite;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: fadeUp 0.7s 0.25s ease both;
        }
        .auth-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
        }
        .auth-feature-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(200,16,46,0.12);
          border: 1px solid rgba(200,16,46,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C8102E;
          flex-shrink: 0;
        }

        /* Stats bar */
        .auth-stats {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 1.5rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .auth-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          text-align: center;
          padding: 0.75rem 0.25rem;
          border-radius: 10px;
          transition: background 0.2s;
        }
        .auth-stat:hover { background: rgba(255,255,255,0.04); }
        .auth-stat-icon {
          color: #C8102E;
          opacity: 0.8;
          margin-bottom: 2px;
        }
        .auth-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }
        .auth-stat-label {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
          line-height: 1.2;
          text-align: center;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: 50%;
          min-height: 100vh;
          background: #0f0f14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          overflow-y: auto;
        }
        @media (max-width: 900px) {
          .auth-right {
            width: 100%;
            background: #0a0a0f;
          }
        }

        .auth-form-shell {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.5s 0.05s ease both;
        }

        /* Mobile logo (hidden on desktop) */
        .auth-mobile-logo {
          display: none;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        @media (max-width: 900px) { .auth-mobile-logo { display: flex; } }

        .auth-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 0.375rem;
        }
        .auth-form-subtitle {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }

        /* Toggle tabs */
        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 1.75rem;
          gap: 4px;
        }
        .auth-tab {
          flex: 1;
          padding: 0.6rem 1rem;
          border-radius: 9px;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: rgba(255,255,255,0.35);
        }
        .auth-tab.active {
          background: linear-gradient(135deg, #C8102E, #a30d24);
          color: #fff;
          box-shadow: 0 4px 14px rgba(200,16,46,0.35);
        }
        .auth-tab:not(.active):hover { color: rgba(255,255,255,0.7); }

        /* Error */
        .auth-error {
          padding: 0.75rem 1rem;
          background: rgba(200,16,46,0.1);
          border: 1px solid rgba(200,16,46,0.3);
          border-radius: 10px;
          color: #ff6b81;
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Step progress */
        .auth-steps {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 0;
        }
        .auth-step-item {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .auth-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          transition: all 0.3s;
          flex-shrink: 0;
          border: 2px solid transparent;
        }
        .auth-step-dot.done {
          background: rgba(34,197,94,0.15);
          border-color: #22c55e;
          color: #22c55e;
        }
        .auth-step-dot.active {
          background: linear-gradient(135deg, #C8102E, #a30d24);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 0 0 3px rgba(200,16,46,0.2);
        }
        .auth-step-dot.pending {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
        }
        .auth-step-label {
          font-size: 0.68rem;
          margin-left: 6px;
          font-weight: 600;
          transition: color 0.3s;
        }
        .auth-step-label.active { color: #C8102E; }
        .auth-step-label.done { color: #22c55e; }
        .auth-step-label.pending { color: rgba(255,255,255,0.25); }
        .auth-step-line {
          flex: 1;
          height: 1.5px;
          margin: 0 8px;
          border-radius: 2px;
          transition: background 0.3s;
        }
        .auth-step-line.done { background: #22c55e; }
        .auth-step-line.pending { background: rgba(255,255,255,0.08); }

        /* Custom inputs for dark theme */
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .auth-field label svg { opacity: 0.6; }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          font-size: 0.9rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(200,16,46,0.6);
          background: rgba(200,16,46,0.04);
          box-shadow: 0 0 0 3px rgba(200,16,46,0.1);
        }
        .auth-input:hover:not(:focus) { border-color: rgba(255,255,255,0.15); }

        .auth-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

        /* eye toggle */
        .auth-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .auth-eye:hover { color: rgba(255,255,255,0.6); }

        .auth-space { display: flex; flex-direction: column; gap: 0.875rem; }

        /* CTA button */
        .auth-submit {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #C8102E 0%, #a30d24 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(200,16,46,0.3);
        }
        .auth-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(200,16,46,0.45);
        }
        .auth-submit:active { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .auth-btn-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .auth-back-btn {
          flex: 1;
          padding: 0.875rem;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .auth-back-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

        .auth-footer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .auth-footer span { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.15); }

        /* spinner */
        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* date input color fix */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>

      <div className="auth-root">
        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-overlay" />
          <div className="auth-left-content">

            {/* Logo */}
            <div className="auth-logo-block">
              <Image
                src="/images/logo.png"
                alt="WakAgenda"
                width={100}
                height={100}
                className="auth-logo-img"
              />
              <div className="auth-logo-text">
                <div className="auth-logo-name">Wak<span>Agenda</span></div>
                <div className="auth-logo-sub">SABC · Direction des SI</div>
              </div>
            </div>

            {/* Middle content */}
            <div className="auth-left-middle">
              <div className="auth-eyebrow">Agenda des stagiaires</div>

              <h2 className="auth-headline">
                Gérez votre stage<br />
                <span>intelligemment.</span>
              </h2>

              {/* Typing animation */}
              <div className="auth-typing-container">
                <span className="auth-typing">{typedText}</span>
                <span className="auth-cursor" />
              </div>

              {/* Feature list */}
              <div className="auth-features">
                {[
                  { icon: CheckCircle2, text: 'Planification des tâches quotidiennes' },
                  { icon: BarChart2,    text: 'Statistiques et rapports automatiques' },
                  { icon: Zap,         text: 'Rappels et notifications en temps réel' },
                  { icon: Shield,      text: 'Données sécurisées et confidentielles' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="auth-feature-item">
                    <div className="auth-feature-icon"><Icon size={14} /></div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="auth-stats">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="auth-stat">
                  <Icon size={16} className="auth-stat-icon" />
                  <div className="auth-stat-value">{value}</div>
                  <div className="auth-stat-label">{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-shell">

            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <Image src="/images/logo.png" alt="WakAgenda" width={38} height={38} style={{ objectFit: 'contain' }} />
              <div className="auth-logo-name" style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                Wak<span style={{ color: '#C8102E' }}>Agenda</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="auth-form-title">
              {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
            </h1>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Connectez-vous à votre espace stagiaire SABC.'
                : 'Rejoignez WakAgenda et organisez votre stage.'}
            </p>

            {/* Tabs */}
            <div className="auth-tabs">
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setStep(0); setError(''); }}
                  className={`auth-tab ${mode === m ? 'active' : ''}`}
                >
                  {m === 'login' ? 'Connexion' : "S'inscrire"}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error">
                <Shield size={14} style={{ flexShrink: 0, color: '#C8102E' }} />
                {error}
              </div>
            )}

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="auth-space">
                <div className="auth-field">
                  <label><Mail size={13} /> Adresse e-mail</label>
                  <input
                    className="auth-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label><Lock size={13} /> Mot de passe</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button type="button" className="auth-eye" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={isLoading}>
                  {isLoading ? <span className="auth-spinner" /> : <ArrowRight size={16} />}
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {mode === 'register' && (
              <div>
                {/* Steps */}
                <div className="auth-steps">
                  {STEPS.map((label, i) => (
                    <div key={i} className="auth-step-item">
                      <div className={`auth-step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className={`auth-step-label ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                        {label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <div className={`auth-step-line ${i < step ? 'done' : 'pending'}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="auth-space">
                  {/* Step 0 – Identité */}
                  {step === 0 && (
                    <>
                      <div className="auth-input-grid">
                        <div className="auth-field">
                          <label><User size={13} /> Prénom</label>
                          <input className="auth-input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="Jean" required />
                        </div>
                        <div className="auth-field">
                          <label><User size={13} /> Nom</label>
                          <input className="auth-input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Dupont" required />
                        </div>
                      </div>
                      <div className="auth-field">
                        <label><Mail size={13} /> Adresse e-mail</label>
                        <input className="auth-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@exemple.com" required />
                      </div>
                    </>
                  )}

                  {/* Step 1 – Stage */}
                  {step === 1 && (
                    <>
                      <div className="auth-field">
                        <label><Building2 size={13} /> Département</label>
                        <input className="auth-input" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Ex: DSI, Finance..." required />
                      </div>
                      <div className="auth-field">
                        <label><UserCheck size={13} /> Encadrant</label>
                        <input className="auth-input" value={form.supervisor_name} onChange={(e) => set('supervisor_name', e.target.value)} placeholder="Nom de votre encadrant" required />
                      </div>
                      <div className="auth-field">
                        <label><Calendar size={13} /> Début du stage</label>
                        <input className="auth-input" type="date" value={form.internship_start_date} onChange={(e) => set('internship_start_date', e.target.value)} required />
                      </div>
                    </>
                  )}

                  {/* Step 2 – Sécurité */}
                  {step === 2 && (
                    <>
                      <div className="auth-field">
                        <label><Lock size={13} /> Mot de passe</label>
                        <div className="auth-input-wrap">
                          <input
                            className="auth-input"
                            type={showPwd ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => set('password', e.target.value)}
                            placeholder="Minimum 8 caractères"
                            required
                            style={{ paddingRight: '2.5rem' }}
                          />
                          <button type="button" className="auth-eye" onClick={() => setShowPwd(!showPwd)}>
                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div className="auth-field">
                        <label><Lock size={13} /> Confirmer le mot de passe</label>
                        <input
                          className="auth-input"
                          type={showPwd ? 'text' : 'password'}
                          value={form.confirm_password}
                          onChange={(e) => set('confirm_password', e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="auth-btn-row">
                    {step > 0 && (
                      <button type="button" className="auth-back-btn" onClick={prevStep}>
                        <ChevronLeft size={15} /> Retour
                      </button>
                    )}
                    <button
                      type="button"
                      className="auth-submit"
                      style={{ flex: 1, marginTop: 0 }}
                      onClick={nextStep}
                      disabled={!stepValid() || (isLoading && step === STEPS.length - 1)}
                    >
                      {isLoading && step === STEPS.length - 1 ? (
                        <span className="auth-spinner" />
                      ) : step < STEPS.length - 1 ? (
                        <><span>Suivant</span><ChevronRight size={15} /></>
                      ) : (
                        <><span>Créer mon compte</span><ArrowRight size={15} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="auth-footer">
              © {new Date().getFullYear()} SABC
              <span />
              Direction des Systèmes d&apos;Information
            </div>

          </div>
        </div>
      </div>
    </>
  );
}