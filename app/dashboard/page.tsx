'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { StatCard, Card, EmptyState, LoadingSpinner } from '@/components/ui/Index';
import { StatsCharts } from '@/components/features/StatsCharts';
import { TaskCard } from '@/components/features/TaskCard';
import { TaskForm } from '@/components/features/TaskForm';
import { Modal } from '@/components/ui/Index';
import { Button } from '@/components/ui/Button';
import { taskService } from '@/services/taskService';
import { reportService } from '@/services/reportService';
import { downloadWeeklySchedule } from '@/services/updateService';
import type { TaskResponse, TaskStats } from '@/types/index';
import {
  CheckSquare, Clock, AlertTriangle, CheckCircle,
  Plus, FileDown, CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// ─── Helper : calcule le lundi de la semaine courante ─────────────────────────
function getCurrentWeekMonday(): string {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return monday.toISOString().split('T')[0];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats,        setStats]        = useState<TaskStats | null>(null);
  const [upcoming,     setUpcoming]     = useState<TaskResponse[]>([]);
  const [today,        setToday]        = useState<TaskResponse[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Rapport PDF état
  const [isPdfLoading,      setIsPdfLoading]      = useState(false);

  // Emploi du temps état
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError,     setScheduleError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, u, t] = await Promise.all([
        taskService.getStats(),
        taskService.getUpcomingTasks(5),
        taskService.getTodayTasks(),
      ]);
      setStats(s);
      setUpcoming(u);
      setToday(t);
    } catch {
      // handled silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
      return;
    }
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, authLoading, fetchData, router]);

  const handlePdf = async () => {
    setIsPdfLoading(true);
    try {
      await reportService.downloadPdf();
    } catch {} finally {
      setIsPdfLoading(false);
    }
  };

  const handleWeeklySchedule = async () => {
    setIsScheduleLoading(true);
    setScheduleError(null);
    try {
      const weekStart = getCurrentWeekMonday();
      await downloadWeeklySchedule(weekStart);
    } catch (err) {
      setScheduleError(
        err instanceof Error ? err.message : 'Impossible de générer l\'emploi du temps.',
      );
      // Auto-clear after 4s
      setTimeout(() => setScheduleError(null), 4000);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Top actions ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Vue d'ensemble
          </h2>

          <div className="flex gap-2 flex-wrap">
            {/* Rapport PDF */}
            <Button variant="outline" size="sm" onClick={handlePdf} isLoading={isPdfLoading}>
              <FileDown size={15} /> Rapport PDF
            </Button>

            {/* Emploi du temps de la semaine */}
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWeeklySchedule}
                isLoading={isScheduleLoading}
                className="border-2 border-sabc-red text-sabc-red hover:bg-sabc-red hover:text-white focus:ring-sabc-red"
              >
                <CalendarDays size={15} />
                {isScheduleLoading ? 'Génération en cours...' : 'Mon emploi du temps'}
              </Button>
              {scheduleError && (
                <p className="text-xs text-red-500 max-w-[220px] text-right animate-slide-up">
                  ⚠️ {scheduleError}
                </p>
              )}
            </div>

            {/* Nouvelle tâche */}
            <Button size="sm" onClick={() => setIsCreateOpen(true)} data-tour="create-task-btn">
              <Plus size={15} /> Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        {stats && (
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children"
            data-tour="dashboard-stats"
          >
            <StatCard
              label="Total des tâches"
              value={stats.total}
              icon={<CheckSquare size={20} />}
              colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Aujourd'hui"
              value={stats.today}
              icon={<CalendarDays size={20} />}
              colorClass="bg-sabc-orange/10 text-sabc-orange"
            />
            <StatCard
              label="En retard"
              value={stats.overdue}
              icon={<AlertTriangle size={20} />}
              colorClass="bg-red-50 dark:bg-red-900/20 text-red-500"
            />
            <StatCard
              label="Terminées"
              value={stats.completed}
              icon={<CheckCircle size={20} />}
              colorClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            />
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        {stats && <StatsCharts stats={stats} />}

        {/* ── Two columns: today + upcoming ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-sabc-red" /> Tâches du jour
              </h3>
              <span className="text-xs text-gray-400">
                {today.length} tâche{today.length > 1 ? 's' : ''}
              </span>
            </div>
            {today.length === 0 ? (
              <EmptyState
                icon={<Clock size={24} />}
                title="Aucune tâche aujourd'hui"
                description="Bonne journée !"
              />
            ) : (
              <div className="space-y-3 stagger-children">
                {today.map((t) => <TaskCard key={t.id} task={t} compact />)}
              </div>
            )}
          </Card>

          {/* Upcoming */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays size={16} className="text-sabc-orange" /> Prochaines tâches
              </h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
                Voir tout
              </Button>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState icon={<CalendarDays size={24} />} title="Aucune tâche à venir" />
            ) : (
              <div className="space-y-3 stagger-children">
                {upcoming.map((t) => <TaskCard key={t.id} task={t} compact />)}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Create modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouvelle tâche"
        size="2xl"
      >
        <TaskForm
          onSuccess={() => { setIsCreateOpen(false); fetchData(); }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  );
}