'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type PageState = 'loading' | 'success' | 'error';

function ActionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
      setState('error');
      setMessage('Lien invalide : paramètres manquants.');
      return;
    }

    const fetchAction = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/tasks/action/${action}/${token}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.detail || `Erreur HTTP ${res.status}`);
        }
        setMessage(data?.message || 'Action effectuée avec succès.');
        setState('success');
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
        setState('error');
      }
    };

    fetchAction();
  }, [searchParams]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .action-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          padding: 2rem;
        }

        .action-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: fadeUp 0.5s ease both;
        }

        .action-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .action-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .action-logo-name span { color: #C8102E; }

        .action-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(200,16,46,0.2);
          border-top-color: #C8102E;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .action-icon.success { background: rgba(34,197,94,0.15); }
        .action-icon.error   { background: rgba(200,16,46,0.12); }

        .action-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
        }

        .action-message {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          text-align: center;
          line-height: 1.6;
        }

        .action-btn {
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
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(200,16,46,0.3);
        }
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(200,16,46,0.45);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="action-root">
        <div className="action-card">
          {/* Logo */}
          <div className="action-logo">
            <Image src="/images/logo.png" alt="WakAgenda" width={52} height={52} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(200,16,46,0.4))' }} />
            <div className="action-logo-name">Wak<span>Agenda</span></div>
          </div>

          {/* Content */}
          {state === 'loading' && (
            <>
              <div className="action-spinner" />
              <p className="action-message">Traitement en cours…</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="action-icon success">✅</div>
              <p className="action-title">Action réussie</p>
              <p className="action-message">{message}</p>
              <button className="action-btn" onClick={() => router.push('/dashboard')}>
                Retour à l'application
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="action-icon error">⚠️</div>
              <p className="action-title">Une erreur est survenue</p>
              <p className="action-message">{message}</p>
              <button className="action-btn" onClick={() => router.push('/dashboard')}>
                Retour à l'application
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ActionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(200,16,46,0.2)', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <ActionPageContent />
    </Suspense>
  );
}