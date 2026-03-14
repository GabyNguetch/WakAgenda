'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, Calendar, Bell, FileText,
  User, Plus, ArrowRight, ArrowLeft, X, Sparkles,
  CheckCircle2, MousePointer, Zap, SkipForward,
  RefreshCw, Clock, FileDown, MessageSquare,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  spotlight?: boolean;
  // which route must be active for this step's spotlight/target to exist
  requiredPath?: string;
}

// ─── Steps (all red/amber palette, all lucide icons) ─────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur WakAgenda !',
    description: "Votre agenda intelligent de stage SABC. En quelques étapes rapides, vous serez 100% opérationnel. Prêt ? C'est parti !",
    icon: <Sparkles size={20} />,
    position: 'center',
  },
  {
    id: 'dashboard-stats',
    title: 'Tableau de bord',
    description: "Votre cockpit quotidien. Les 4 compteurs résument instantanément l'état de vos activités : total, du jour, en retard et terminées.",
    icon: <LayoutDashboard size={20} />,
    targetSelector: '[data-tour="dashboard-stats"]',
    position: 'bottom',
    action: 'Les chiffres se mettent à jour en temps réel',
    spotlight: true,
    requiredPath: '/dashboard',
  },
  {
    id: 'create-task',
    title: 'Créer une tâche',
    description: "Ce bouton est votre meilleur ami ! Titre, date, horaires, catégorie, domaine, rappel… Tout se remplit en 30 secondes.",
    icon: <Plus size={20} />,
    targetSelector: '[data-tour="create-task-btn"]',
    position: 'bottom',
    action: 'Cliquez pour planifier votre première activité',
    spotlight: true,
    requiredPath: '/dashboard',
  },
  {
    id: 'tasks-page',
    title: 'Page Tâches',
    description: "Toutes vos activités au même endroit. Filtrez par catégorie, domaine ou statut. Survolez une carte pour faire apparaître les actions Modifier / Supprimer.",
    icon: <CheckSquare size={20} />,
    targetSelector: '[href="/tasks"]',
    position: 'right',
    action: 'Naviguez vers "Tâches" dans le menu',
    spotlight: true,
  },
  {
    id: 'task-status',
    title: "Cycle de vie d'une tâche",
    description: "Une tâche passe par : À faire → En cours → Terminé. Passée la date sans action, elle bascule automatiquement en « En retard » ou « Manquée ».",
    icon: <RefreshCw size={20} />,
    position: 'center',
    action: 'Mettez à jour vos statuts chaque jour !',
  },
  {
    id: 'calendar',
    title: 'Vue Calendrier',
    description: "Mois, Semaine ou Jour — choisissez votre perspective. Cliquez sur n'importe quelle case pour créer une tâche à cette date précise.",
    icon: <Calendar size={20} />,
    targetSelector: '[href="/calendar"]',
    position: 'right',
    action: 'Explorez les vues Semaine et Jour',
    spotlight: true,
  },
  {
    id: 'notifications',
    title: 'Rappels & Notifications',
    description: "Activez un rappel sur chaque tâche (15 min, 30 min, 1h ou la veille). La cloche affiche un badge rouge dès qu'une notification est en attente.",
    icon: <Bell size={20} />,
    targetSelector: '[href="/notifications"]',
    position: 'right',
    action: 'Consultez vos notifications non lues ici',
    spotlight: true,
  },
  {
    id: 'reports',
    title: 'Rapport PDF en 1 clic',
    description: "Générez votre rapport d'activité professionnel instantanément. Page de garde SABC, statistiques, liste chronologique complète — parfait pour votre encadrant !",
    icon: <FileDown size={20} />,
    targetSelector: '[href="/reports"]',
    position: 'right',
    action: 'Générez un rapport dès que vous avez des tâches',
    spotlight: true,
  },
  {
    id: 'comments',
    title: 'Éditeur de compte-rendu',
    description: "Quand une tâche est « Terminé », une icône 💬 apparaît sur la carte. Elle ouvre un éditeur riche : texte formaté, titres, listes, images redimensionnables.",
    icon: <MessageSquare size={20} />,
    position: 'center',
    action: 'Marquez une tâche Terminée pour débloquer l\'éditeur',
  },
  {
    id: 'profile',
    title: 'Mon Profil',
    description: "Mettez à jour vos informations (département, encadrant, date de début), changez votre photo de profil, ou gérez votre compte depuis cette section.",
    icon: <User size={20} />,
    targetSelector: '[href="/profile"]',
    position: 'right',
    action: 'Complétez votre profil pour personnaliser vos rapports',
    spotlight: true,
  },
  {
    id: 'done',
    title: 'Vous maîtrisez WakAgenda !',
    description: "Félicitations ! Vous connaissez tout ce qu'il faut. Créez votre première tâche et organisez votre stage comme un pro. Bonne chance !",
    icon: <Zap size={20} />,
    position: 'center',
  },
];

const STORAGE_KEY = 'wakagenda_tour_v2';

// ─── Confetti ─────────────────────────────────────────────────────────────────

function ConfettiBurst() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Red & amber palette only
    const COLORS = ['#C8102E', '#a30d24', '#E8600A', '#f59e0b', '#fcd34d', '#fff'];

    type P = {
      x: number; y: number; vx: number; vy: number;
      color: string; w: number; h: number;
      rot: number; rs: number; life: number; circle: boolean;
    };

    const ps: P[] = Array.from({ length: 140 }, () => ({
      x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
      y: canvas.height * 0.38,
      vx: (Math.random() - 0.5) * 13,
      vy: Math.random() * -11 - 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 9 + 4,
      h: Math.random() * 5 + 3,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.18,
      life: 1,
      circle: Math.random() > 0.55,
    }));

    let id: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.32; p.vx *= 0.99;
        p.rot += p.rs; p.life -= 0.009;
        if (p.life > 0 && p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
          else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      if (alive) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{ zIndex: 97 }} />;
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

function Spotlight({ sel }: { sel?: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!sel) { setRect(null); return; }
    const go = () => { const el = document.querySelector(sel); if (el) setRect(el.getBoundingClientRect()); };
    go(); const t = setTimeout(go, 280);
    window.addEventListener('resize', go);
    return () => { clearTimeout(t); window.removeEventListener('resize', go); };
  }, [sel]);

  if (!sel || !rect) return null;

  const P = 10;
  const x = rect.left - P, y = rect.top - P;
  const w = rect.width + P * 2, h = rect.height + P * 2;

  return (
    <svg className="fixed inset-0 pointer-events-none" style={{ zIndex: 98, width: '100vw', height: '100vh' }}>
      <defs>
        <mask id="ot-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx="13" fill="black" />
        </mask>
        <filter id="ot-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#ot-mask)" />
      <rect x={x} y={y} width={w} height={h} rx="13"
        fill="none" stroke="#C8102E" strokeWidth="2.5"
        strokeDasharray="7 4" filter="url(#ot-glow)"
        style={{ animation: 'ot-dash .9s linear infinite' }}
      />
      {([[x,y],[x+w,y],[x,y+h],[x+w,y+h]] as [number,number][]).map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#C8102E"
          style={{ animation: `ot-pulse 1.5s ease-in-out ${i*.17}s infinite` }}
        />
      ))}
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  step: TourStep;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function Card({ step, stepIndex, total, onNext, onPrev, onSkip }: CardProps) {
  const isFirst = stepIndex === 0;
  const isLast  = stepIndex === total - 1;
  const pct     = Math.round(((stepIndex + 1) / total) * 100);
  const [k, setK] = useState(0);
  useEffect(() => { setK(p => p + 1); }, [stepIndex]);

  return (
    <div className="ot-card">
      {/* Animated top bar */}
      <div className="ot-bar" style={{ width: `${pct}%` }} />

      {/* Close */}
      <button className="ot-x" onClick={onSkip} aria-label="Passer">
        <X size={13} />
      </button>

      {/* Icon + title row */}
      <div className="ot-head">
        <div className="ot-icon-wrap" key={`ic-${k}`}>
          {step.icon}
        </div>
        <div className="ot-head-text">
          <span className="ot-label">{stepIndex + 1} / {total}</span>
          <h3 className="ot-title" key={`ti-${k}`}>{step.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="ot-desc" key={`de-${k}`}>{step.description}</p>

      {/* Hint */}
      {step.action && (
        <div className="ot-hint" key={`hi-${k}`}>
          <MousePointer size={12} className="ot-hint-ico" />
          <span>{step.action}</span>
        </div>
      )}

      {/* Progress */}
      <div className="ot-prog-row">
        <div className="ot-prog-track">
          <div className="ot-prog-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="ot-pct">{pct}%</span>
      </div>

      {/* Dots */}
      <div className="ot-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`ot-dot${i === stepIndex ? ' ot-dot-on' : i < stepIndex ? ' ot-dot-done' : ''}`} />
        ))}
      </div>

      {/* Nav */}
      <div className="ot-nav">
        {isFirst ? (
          <button className="ot-ghost" onClick={onSkip}><SkipForward size={13} /> Passer</button>
        ) : (
          <button className="ot-ghost" onClick={onPrev}><ArrowLeft size={13} /> Retour</button>
        )}
        <button className="ot-next" onClick={onNext}>
          {isLast
            ? <><CheckCircle2 size={14} /> C&apos;est parti !</>
            : <>Suivant <ArrowRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Positioned card ──────────────────────────────────────────────────────────

function PositionedCard(props: CardProps & { isCenter: boolean }) {
  const { step, isCenter } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [css, setCss] = useState<React.CSSProperties>(
    isCenter ? { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' } : {}
  );

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    if (isCenter) { setCss({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }); return; }
    if (mobile)   { setCss({ bottom: 86, left: 12, right: 12, width: 'auto', maxWidth: 'none' }); return; }
    if (!step.targetSelector) { setCss({ bottom: 80, left: '50%', transform: 'translateX(-50%)' }); return; }

    const place = () => {
      const el = document.querySelector(step.targetSelector!);
      if (!el || !ref.current) return;
      const r  = el.getBoundingClientRect();
      const tw = ref.current.offsetWidth  || 376;
      const th = ref.current.offsetHeight || 340;
      const G  = 18, vw = window.innerWidth, vh = window.innerHeight;
      let top = G, left = G;
      switch (step.position) {
        case 'right':
          top  = Math.max(G, Math.min(r.top + r.height / 2 - th / 2, vh - th - G));
          left = Math.min(r.right + 14, vw - tw - G);
          break;
        case 'left':
          top  = Math.max(G, Math.min(r.top + r.height / 2 - th / 2, vh - th - G));
          left = Math.max(G, r.left - tw - 14);
          break;
        case 'bottom':
          top  = Math.min(r.bottom + 14, vh - th - G);
          left = Math.max(G, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - G));
          break;
        default:
          top  = Math.max(G, r.top - th - 14);
          left = Math.max(G, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - G));
      }
      setCss({ top, left });
    };
    place();
    const t = setTimeout(place, 240);
    window.addEventListener('resize', place);
    return () => { clearTimeout(t); window.removeEventListener('resize', place); };
  }, [step, isCenter]);

  return (
    <div
      ref={ref}
      key={step.id}
      className="ot-wrap"
      style={{ ...css, position: 'fixed', zIndex: 99 }}
    >
      <Card {...props} />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function OnboardingTour() {
  const [active,   setActive]   = useState(false);
  const [step,     setStep]     = useState(0);
  const [mounted,  setMounted]  = useState(false);
  const [confetti, setConfetti] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setActive(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  const next = useCallback(() => {
    const last = step === TOUR_STEPS.length - 1;
    if (last) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4500);
      setTimeout(finish, 700);
      return;
    }

    const nextStep    = TOUR_STEPS[step + 1];
    const reqPath     = nextStep.requiredPath;

    // If next step needs a specific page and we're not there, navigate without
    // restarting the tour — just advance the step index
    if (reqPath && pathname !== reqPath) {
      setStep(s => s + 1);
      router.push(reqPath);
    } else {
      setStep(s => s + 1);
    }
  }, [step, pathname, router, finish]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  if (!mounted || !active) return null;

  const current  = TOUR_STEPS[step];
  const isCenter = current.position === 'center' || !current.targetSelector;

  // If this step requires a specific page but we're not there yet,
  // still show the card but skip the spotlight until the page loads
  const canSpotlight = current.spotlight &&
    (!current.requiredPath || pathname === current.requiredPath);

  return (
    <>
      <style>{`
        @keyframes ot-in    { from { opacity:0; transform:translateY(18px) scale(.93); } to { opacity:1; transform:none; } }
        @keyframes ot-dim   { from { opacity:0; } to { opacity:1; } }
        @keyframes ot-txt   { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:none; } }
        @keyframes ot-icon  { 0%,100% { transform:scale(1) rotate(0deg); } 50% { transform:scale(1.12) rotate(-6deg); } }
        @keyframes ot-bar   { from { opacity:.6; } to { opacity:1; } }
        @keyframes ot-dash  { to { stroke-dashoffset:-24; } }
        @keyframes ot-pulse { 0%,100%{r:4.5;opacity:1;} 50%{r:7;opacity:.35;} }

        /* Overlay */
        .ot-overlay { animation: ot-dim .22s ease both; }

        /* Wrapper */
        .ot-wrap { animation: ot-in .4s cubic-bezier(.16,1,.3,1) both; }

        /* Card shell */
        .ot-card {
          position: relative;
          width: min(376px, calc(100vw - 26px));
          background: #fff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(0,0,0,.05),
            0 14px 50px rgba(0,0,0,.14),
            0 4px 12px rgba(200,16,46,.07);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          .ot-card {
            background: #0d0d14;
            box-shadow:
              0 0 0 1px rgba(255,255,255,.06),
              0 14px 50px rgba(0,0,0,.55),
              0 4px 12px rgba(200,16,46,.12);
          }
        }

        /* Top progress bar */
        .ot-bar {
          height: 3.5px;
          background: linear-gradient(90deg, #C8102E, #E8600A 60%, #f59e0b);
          transition: width .5s cubic-bezier(.16,1,.3,1);
          animation: ot-bar .4s ease both;
        }

        /* Close */
        .ot-x {
          position: absolute; top: 13px; right: 13px;
          width: 27px; height: 27px; border-radius: 50%;
          border: none; background: rgba(0,0,0,.055);
          color: #9ca3af; cursor: pointer; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          transition: all .17s;
        }
        .ot-x:hover { background: rgba(200,16,46,.1); color: #C8102E; transform: rotate(90deg); }
        @media (prefers-color-scheme: dark) { .ot-x { background: rgba(255,255,255,.08); } }

        /* Header */
        .ot-head {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 1.1rem 1.25rem .65rem;
        }
        .ot-icon-wrap {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: rgba(200,16,46,.09);
          border: 1.5px solid rgba(200,16,46,.18);
          display: flex; align-items: center; justify-content: center;
          color: #C8102E;
          animation: ot-icon 3s ease-in-out 1s infinite;
        }
        @media (prefers-color-scheme: dark) {
          .ot-icon-wrap {
            background: rgba(200,16,46,.13);
            border-color: rgba(200,16,46,.25);
          }
        }

        .ot-head-text { flex: 1; min-width: 0; padding-right: 28px; }
        .ot-label {
          display: block;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .1em; margin-bottom: 3px;
          color: #C8102E; opacity: .85;
        }
        .ot-title {
          font-size: 15px; font-weight: 800; line-height: 1.25; margin: 0;
          color: #0f172a;
          animation: ot-txt .3s ease both;
        }
        @media (prefers-color-scheme: dark) { .ot-title { color: #f1f5f9; } }

        /* Description */
        .ot-desc {
          font-size: 13px; color: #475569; line-height: 1.68;
          margin: 0 0 .8rem; padding: 0 1.25rem;
          animation: ot-txt .3s .06s ease both;
        }
        @media (prefers-color-scheme: dark) { .ot-desc { color: #94a3b8; } }

        /* Hint */
        .ot-hint {
          display: flex; align-items: flex-start; gap: 7px;
          padding: 8px 11px; border-radius: 11px; margin: 0 1.25rem .9rem;
          background: rgba(200,16,46,.06);
          border: 1px solid rgba(200,16,46,.15);
          font-size: 12px; font-weight: 600; color: #C8102E;
          animation: ot-txt .3s .1s ease both;
        }
        .ot-hint-ico { flex-shrink: 0; margin-top: 1px; opacity: .75; }

        /* Progress row */
        .ot-prog-row {
          display: flex; align-items: center; gap: 8px;
          padding: 0 1.25rem; margin-bottom: 9px;
        }
        .ot-prog-track {
          flex: 1; height: 4px; border-radius: 99px;
          background: rgba(0,0,0,.06); overflow: hidden;
        }
        @media (prefers-color-scheme: dark) { .ot-prog-track { background: rgba(255,255,255,.07); } }
        .ot-prog-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #C8102E, #E8600A 55%, #f59e0b);
          transition: width .5s cubic-bezier(.16,1,.3,1);
        }
        .ot-pct {
          font-size: 11px; font-weight: 800; color: #C8102E;
          min-width: 32px; text-align: right; letter-spacing: -.02em;
        }

        /* Dots */
        .ot-dots {
          display: flex; justify-content: center; gap: 5px;
          padding: 0 1.25rem; margin-bottom: .95rem;
        }
        .ot-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #e2e8f0;
          transition: all .28s cubic-bezier(.16,1,.3,1);
          flex-shrink: 0;
        }
        .ot-dot-on  { width: 20px; border-radius: 4px; background: #C8102E; }
        .ot-dot-done { background: rgba(200,16,46,.3); }
        @media (prefers-color-scheme: dark) {
          .ot-dot { background: #334155; }
          .ot-dot-done { background: rgba(200,16,46,.35); }
        }

        /* Nav */
        .ot-nav {
          display: flex; gap: 8px;
          padding: 0 1.25rem 1.15rem;
        }
        .ot-ghost {
          display: flex; align-items: center; gap: 5px;
          padding: 9px 14px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: transparent;
          color: #64748b; font-size: 12.5px; font-weight: 600;
          font-family: inherit; cursor: pointer; transition: all .17s; white-space: nowrap;
        }
        .ot-ghost:hover { border-color: #C8102E; color: #C8102E; background: rgba(200,16,46,.04); }
        @media (prefers-color-scheme: dark) {
          .ot-ghost { border-color: #334155; color: #94a3b8; }
          .ot-ghost:hover { border-color: #C8102E; color: #ff4d6d; background: rgba(200,16,46,.08); }
        }
        .ot-next {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 10px 16px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #C8102E 0%, #a30d24 100%);
          color: #fff; font-size: 13px; font-weight: 700;
          font-family: inherit; cursor: pointer; letter-spacing: -.01em;
          box-shadow: 0 4px 16px rgba(200,16,46,.35);
          transition: all .17s;
        }
        .ot-next:hover { transform: translateY(-1.5px); box-shadow: 0 6px 22px rgba(200,16,46,.45); }
        .ot-next:active { transform: scale(.97); }
      `}</style>

      {confetti && <ConfettiBurst />}

      {/* Dim for center steps */}
      {isCenter && (
        <div
          className="ot-overlay fixed inset-0 bg-black/55 backdrop-blur-sm"
          style={{ zIndex: 98 }}
          onClick={finish}
        />
      )}

      {/* Spotlight */}
      {canSpotlight && (
        <Spotlight sel={current.targetSelector} />
      )}

      {/* Card */}
      <PositionedCard
        step={current}
        stepIndex={step}
        total={TOUR_STEPS.length}
        onNext={next}
        onPrev={prev}
        onSkip={finish}
        isCenter={isCenter}
      />
    </>
  );
}

// ─── Relaunch button ──────────────────────────────────────────────────────────

export function TourRelaunchButton() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!!localStorage.getItem(STORAGE_KEY)); }, []);
  if (!show) return null;

  return (
    <button
      onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}
      className="
        fixed bottom-[88px] right-4 md:bottom-7 md:right-6 z-30
        flex items-center gap-1.5 px-3.5 py-2 rounded-full
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        text-[11px] font-bold text-gray-500 dark:text-gray-400
        shadow-md hover:shadow-lg hover:border-sabc-red hover:text-sabc-red
        transition-all duration-200
      "
    >
      <Sparkles size={12} className="text-sabc-red" />
      Guide
    </button>
  );
}