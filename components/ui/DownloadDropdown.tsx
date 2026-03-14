'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DownloadOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void>;
}

interface DownloadDropdownProps {
  options: DownloadOption[];
  buttonLabel: string;
  buttonClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DownloadDropdown({
  options,
  buttonLabel,
  buttonClassName,
}: DownloadDropdownProps) {
  const [isOpen, setIsOpen]           = useState(false);
  const [loadingIdx, setLoadingIdx]   = useState<number | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Auto-clear error
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const handleOption = async (option: DownloadOption, idx: number) => {
    if (loadingIdx !== null) return;
    setIsOpen(false);
    setErrorMsg(null);
    setLoadingIdx(idx);
    try {
      await option.onClick();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Une erreur est survenue lors du téléchargement.',
      );
    } finally {
      setLoadingIdx(null);
    }
  };

  const isAnyLoading = loadingIdx !== null;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Main trigger button */}
      <button
        onClick={() => !isAnyLoading && setIsOpen((o) => !o)}
        disabled={isAnyLoading}
        className={cn(
          'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabc-red',
          'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          'px-3 py-1.5 text-sm',
          buttonClassName ??
            'border-2 border-sabc-red text-sabc-red hover:bg-sabc-red hover:text-white',
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isAnyLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération en cours...
          </>
        ) : (
          <>
            {buttonLabel}
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50 min-w-[220px]',
            'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800',
            'shadow-xl shadow-black/10 dark:shadow-black/40',
            'animate-slide-up overflow-hidden',
          )}
        >
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOption(opt, idx)}
              disabled={isAnyLoading}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                idx < options.length - 1 &&
                  'border-b border-gray-50 dark:border-gray-800',
              )}
            >
              <span className="flex-shrink-0 text-sabc-red">{opt.icon}</span>
              <span>{opt.label}</span>
              {loadingIdx === idx && (
                <svg className="animate-spin h-3.5 w-3.5 ml-auto text-sabc-red" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[260px] p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs shadow-lg animate-slide-up">
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}