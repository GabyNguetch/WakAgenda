'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { TaskForm } from '@/components/features/TaskForm';
import { Button } from '@/components/ui/Button';
import { taskService } from '@/services/taskService';
import type { TaskResponse } from '@/types';
import { CATEGORY_COLORS, formatTime } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, Tag,
  Layers, Bell, FileText, Edit2, Trash2, MessageSquare,
  X, CheckCircle, AlertCircle, RotateCcw, XCircle, AlarmClock
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
type ViewMode = 'month' | 'week' | 'day';

// ── Constantes ─────────────────────────────────────────────────────────────────
const DAYS_FR   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'À faire':   { label: 'À faire',   color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: <RotateCcw size={13} /> },
  'En cours':  { label: 'En cours',  color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: <AlarmClock size={13} /> },
  'Terminé':   { label: 'Terminé',   color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: <CheckCircle size={13} /> },
  'Annulé':    { label: 'Annulé',    color: 'text-gray-500 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-800',     icon: <XCircle size={13} /> },
  'En retard': { label: 'En retard', color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',     icon: <AlertCircle size={13} /> },
  'Manquée':   { label: 'Manquée',   color: 'text-red-700 dark:text-red-500',     bg: 'bg-red-50 dark:bg-red-900/30',     icon: <X size={13} /> },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * ✅ FIX PRINCIPAL : Convertit une Date en "YYYY-MM-DD" en heure LOCALE
 * (et non UTC comme le ferait toISOString()).
 * Sans ce fix, un stagiaire à UTC+1 voit ses tâches décalées d'un jour.
 */
function toLocalDateStr(d: Date): string {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ✅ FIX : Crée une Date à partir d'une chaîne "YYYY-MM-DD" sans décalage UTC.
 * new Date('2025-06-15') → interprété comme UTC minuit → décalage à UTC+1.
 * new Date('2025-06-15T12:00:00') → interprété en heure locale → correct.
 */
function localDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function getWeekDays(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // Lundi = 0
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const clone = new Date(d);
    clone.setDate(clone.getDate() + i);
    return clone;
  });
}

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  return mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : ''}`
    : `${mins}min`;
}

// ── Composant badge statut ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['À faire'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Pill de tâche (vue mois) ────────────────────────────────────────────────────
function TaskPill({ task, onClick }: { task: TaskResponse; onClick: () => void }) {
  const colorClass = CATEGORY_COLORS[task.category] || 'bg-gray-100 text-gray-700';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md truncate font-semibold transition-all hover:scale-[1.02] hover:shadow-sm ${colorClass}`}
      title={task.title}
    >
      <span className="opacity-60 mr-1">{formatTime(task.start_time)}</span>
      {task.title}
    </button>
  );
}

// ── Modal détail tâche ─────────────────────────────────────────────────────────
function TaskDetailModal({
  task, onClose, onEdit, onDelete, onCommentOpen,
}: {
  task: TaskResponse;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCommentOpen: () => void;
}) {
  const duration  = formatDuration(task.start_time, task.end_time);
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG['À faire'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        {/* Drag bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header coloré */}
        <div className={`px-6 pt-4 pb-5 ${statusCfg.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <StatusBadge status={task.status} />
              <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors mt-0.5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: '55vh' }}>
          <div className="grid grid-cols-2 gap-3">

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Calendar size={15} className="text-sabc-red flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Date</p>
                {/* ✅ FIX : utilise localDate() pour éviter le décalage */}
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {localDate(task.task_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Clock size={15} className="text-sabc-red flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Horaire</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatTime(task.start_time)} – {formatTime(task.end_time)}
                  {duration && <span className="text-xs text-gray-400 ml-1">({duration})</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Tag size={15} className="text-sabc-red flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Catégorie</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{task.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Layers size={15} className="text-sabc-red flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Domaine</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {task.domain || <span className="text-gray-400 font-normal italic">Non défini</span>}
                </p>
              </div>
            </div>

            {task.reminder && (
              <div className="col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <Bell size={15} className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wide font-medium">Rappel</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{task.reminder}</p>
                </div>
              </div>
            )}
          </div>

          {task.description && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <FileText size={12} /> Notes
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <button
            onClick={onCommentOpen}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageSquare size={15} /> Commenter
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Edit2 size={15} /> Modifier
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal wrapper générique ────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | '2xl';
}) {
  if (!isOpen) return null;
  const maxW = size === '2xl' ? 'sm:max-w-2xl' : 'sm:max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative w-full ${maxW} bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(92vh - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Modal commentaire ──────────────────────────────────────────────────────────
function CommentModal({ task, onClose, onSaved }: {
  task: TaskResponse; onClose: () => void; onSaved: () => void;
}) {
  const [text, setText]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      onSaved();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen title={`Commenter — ${task.title}`} onClose={onClose}>
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Rédigez votre commentaire..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sabc-red/30 resize-none"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="px-5 py-2 rounded-xl bg-sabc-red text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════════
export default function CalendarPage() {
  const [tasks, setTasks]             = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode]       = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailTask, setDetailTask]     = useState<TaskResponse | null>(null);
  const [editTask, setEditTask]         = useState<TaskResponse | null>(null);
  const [commentTask, setCommentTask]   = useState<TaskResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskResponse | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ✅ FIX : date du jour calculée en heure locale
  const todayStr = toLocalDateStr(new Date());

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskService.listTasks({ limit: 500 });
      setTasks(data);
    } catch {
      // silencieux
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ✅ FIX : comparaison directe task_date (string "YYYY-MM-DD") avec toLocalDateStr
  const getTasksForDate = useCallback((dateStr: string): TaskResponse[] =>
    tasks
      .filter((t) => t.task_date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  [tasks]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const navigate = (dir: 1 | -1) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month')     d.setMonth(d.getMonth() + dir);
      else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
      else                          d.setDate(d.getDate() + dir);
      return d;
    });
  };

  const title = viewMode === 'month'
    ? `${MONTHS_FR[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : viewMode === 'week'
    ? (() => {
        const days = getWeekDays(currentDate);
        const sameMonth = days[0].getMonth() === days[6].getMonth();
        return sameMonth
          ? `${days[0].getDate()} – ${days[6].getDate()} ${MONTHS_FR[days[6].getMonth()]} ${days[6].getFullYear()}`
          : `${days[0].getDate()} ${MONTHS_FR[days[0].getMonth()]} – ${days[6].getDate()} ${MONTHS_FR[days[6].getMonth()]} ${days[6].getFullYear()}`;
      })()
    : localDate(toLocalDateStr(currentDate)).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

  // ── Grille mois (7 colonnes) ─────────────────────────────────────────────────
  const getMonthDays = (): (Date | null)[] => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    // getDay() : 0=Dim, 1=Lun … → on veut Lun=0
    let startDay = first.getDay() - 1;
    if (startDay === -1) startDay = 6;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDetailTask(null);
    } catch {} finally { setDeleting(false); }
  };

  const openDetail = (task: TaskResponse) => {
    setDetailTask(task);
    setEditTask(null);
  };

  const openCreate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsCreateOpen(true);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Calendrier">
      <div className="space-y-4 animate-fade-in">

        {/* ── Barre de contrôle ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Navigation + titre */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white min-w-[160px] sm:min-w-[220px] text-center capitalize">
              {title}
            </span>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ChevronRight size={18} />
            </button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Aujourd'hui
            </Button>
          </div>

          {/* Vue + Ajouter */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === v
                      ? 'bg-white dark:bg-gray-900 text-sabc-red shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => openCreate(todayStr)}>
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-sabc-red/30 border-t-sabc-red rounded-full animate-spin" />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* VUE MOIS                                                            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {!isLoading && viewMode === 'month' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* En-têtes jours */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
              {DAYS_FR.map((d) => (
                <div key={d} className="py-2.5 text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7 divide-x divide-gray-50 dark:divide-gray-800">
              {getMonthDays().map((day, i) => {
                // ✅ FIX : utilise toLocalDateStr au lieu de toISOString
                const dateStr  = day ? toLocalDateStr(day) : null;
                const dayTasks = dateStr ? getTasksForDate(dateStr) : [];
                const isToday  = dateStr === todayStr;
                const isWeekend = day ? (day.getDay() === 0 || day.getDay() === 6) : false;

                return (
                  <div
                    key={i}
                    onClick={() => day && openCreate(dateStr!)}
                    className={`min-h-[100px] p-1.5 border-b border-gray-50 dark:border-gray-800 transition-colors group relative ${
                      day
                        ? `cursor-pointer ${
                            isWeekend
                              ? 'bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/70 dark:hover:bg-gray-800/60'
                              : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/30'
                          }`
                        : 'bg-gray-50/30 dark:bg-gray-900/50'
                    }`}
                  >
                    {day && (
                      <>
                        {/* Numéro du jour */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full transition-colors ${
                              isToday
                                ? 'bg-sabc-red text-white'
                                : isWeekend
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {/* Compteur de tâches */}
                          {dayTasks.length > 0 && (
                            <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {dayTasks.length}
                            </span>
                          )}
                          {/* Bouton + au hover */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openCreate(dateStr!); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md text-gray-400 hover:text-sabc-red hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Tâches */}
                        <div className="space-y-0.5">
                          {dayTasks.slice(0, 3).map((t) => (
                            <TaskPill key={t.id} task={t} onClick={() => openDetail(t)} />
                          ))}
                          {dayTasks.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewMode('day');
                                setCurrentDate(day);
                              }}
                              className="w-full text-left text-[10px] px-1.5 py-0.5 text-gray-400 hover:text-sabc-red font-medium transition-colors"
                            >
                              +{dayTasks.length - 3} autre{dayTasks.length - 3 > 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* VUE SEMAINE                                                         */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {!isLoading && viewMode === 'week' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* En-têtes */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
              {getWeekDays(currentDate).map((day, i) => {
                // ✅ FIX
                const dateStr = toLocalDateStr(day);
                const isToday = dateStr === todayStr;
                return (
                  <div key={i} className="py-3 text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-sabc-red' : 'text-gray-400'}`}>
                      {DAYS_FR[i]}
                    </p>
                    <div className={`inline-flex items-center justify-center w-8 h-8 mx-auto mt-1 rounded-full text-sm font-bold transition-colors ${
                      isToday ? 'bg-sabc-red text-white' : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Corps */}
            <div className="grid grid-cols-7 divide-x divide-gray-50 dark:divide-gray-800 min-h-[200px]">
              {getWeekDays(currentDate).map((day, i) => {
                // ✅ FIX
                const dateStr  = toLocalDateStr(day);
                const dayTasks = getTasksForDate(dateStr);
                const isToday  = dateStr === todayStr;
                return (
                  <div
                    key={i}
                    onClick={() => openCreate(dateStr)}
                    className={`p-2 min-h-[160px] cursor-pointer transition-colors group ${
                      isToday ? 'bg-red-50/30 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="space-y-1">
                      {dayTasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); openDetail(t); }}
                          className={`w-full text-left rounded-lg px-2 py-1.5 border-l-2 transition-all hover:scale-[1.02] hover:shadow-sm ${CATEGORY_COLORS[t.category]}`}
                        >
                          <p className="text-[10px] opacity-70 font-mono">{formatTime(t.start_time)}</p>
                          <p className="text-xs font-semibold leading-tight mt-0.5 line-clamp-2">{t.title}</p>
                        </button>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-12 text-gray-300 dark:text-gray-600">
                          <Plus size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* VUE JOUR                                                            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {!isLoading && viewMode === 'day' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Header jour */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
              <div>
                {/* ✅ FIX : utilise toLocalDateStr */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest capitalize">
                  {DAYS_FULL[localDate(toLocalDateStr(currentDate)).getDay() === 0 ? 6 : localDate(toLocalDateStr(currentDate)).getDay() - 1]}
                </p>
                <p className={`text-2xl font-black ${toLocalDateStr(currentDate) === todayStr ? 'text-sabc-red' : 'text-gray-900 dark:text-white'}`}>
                  {currentDate.getDate()} {MONTHS_FR[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
              </div>
              <Button size="sm" onClick={() => openCreate(toLocalDateStr(currentDate))}>
                <Plus size={14} /> Ajouter
              </Button>
            </div>

            {/* Liste tâches */}
            {(() => {
              // ✅ FIX
              const dateStr  = toLocalDateStr(currentDate);
              const dayTasks = getTasksForDate(dateStr);

              if (dayTasks.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600 space-y-3">
                    <Calendar size={36} strokeWidth={1.5} />
                    <p className="text-sm font-medium">Aucune tâche ce jour</p>
                    <button
                      onClick={() => openCreate(dateStr)}
                      className="text-xs text-sabc-red font-semibold hover:underline"
                    >
                      + Créer une tâche
                    </button>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {dayTasks.map((t) => {
                    const duration  = formatDuration(t.start_time, t.end_time);
                    const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG['À faire'];
                    return (
                      <button
                        key={t.id}
                        onClick={() => openDetail(t)}
                        className="w-full flex items-stretch gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                      >
                        {/* Heure + durée */}
                        <div className="w-16 flex-shrink-0 text-right">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatTime(t.start_time)}</p>
                          <p className="text-xs text-gray-400">{formatTime(t.end_time)}</p>
                          {duration && <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{duration}</p>}
                        </div>

                        {/* Barre colorée */}
                        <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${CATEGORY_COLORS[t.category]?.split(' ')[0] || 'bg-gray-300'}`} />

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-sabc-red transition-colors truncate">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                              {statusCfg.icon} {statusCfg.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{t.category}</span>
                            {t.domain && <span className="text-[10px] text-gray-400">{t.domain}</span>}
                          </div>
                          {t.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{t.description}</p>
                          )}
                        </div>

                        {/* Chevron */}
                        <div className="flex-shrink-0 self-center text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Modal : créer une tâche ────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setSelectedDate(null); }}
        title="Nouvelle tâche"
        size="2xl"
      >
        <TaskForm
          task={selectedDate ? { task_date: selectedDate } as TaskResponse : undefined}
          onSuccess={(t) => {
            setIsCreateOpen(false);
            setSelectedDate(null);
            // ✅ Ajout direct dans le state local sans re-fetch complet
            setTasks((prev) => {
              const exists = prev.find((x) => x.id === t.id);
              return exists ? prev.map((x) => x.id === t.id ? t : x) : [t, ...prev];
            });
          }}
          onCancel={() => { setIsCreateOpen(false); setSelectedDate(null); }}
        />
      </Modal>

      {/* ── Modal : modifier une tâche ─────────────────────────────────────────── */}
      {editTask && (
        <Modal isOpen onClose={() => setEditTask(null)} title="Modifier la tâche" size="2xl">
          <TaskForm
            task={editTask}
            onSuccess={(updated) => {
              setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
              setEditTask(null);
              setDetailTask(updated);
            }}
            onCancel={() => setEditTask(null)}
          />
        </Modal>
      )}

      {/* ── Modal : détail d'une tâche ─────────────────────────────────────────── */}
      {detailTask && !editTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={() => { setEditTask(detailTask); setDetailTask(null); }}
          onDelete={() => setDeleteTarget(detailTask)}
          onCommentOpen={() => setCommentTask(detailTask)}
        />
      )}

      {/* ── Modal : commenter ──────────────────────────────────────────────────── */}
      {commentTask && (
        <CommentModal
          task={commentTask}
          onClose={() => setCommentTask(null)}
          onSaved={() => { fetchTasks(); setCommentTask(null); }}
        />
      )}

      {/* ── Modal : confirmer suppression ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Supprimer cette tâche ?</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{deleteTarget.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cette action est irréversible. La tâche et ses commentaires seront définitivement supprimés.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}