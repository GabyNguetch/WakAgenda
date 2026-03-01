'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Badge, Card, EmptyState, Modal } from '@/components/ui/Index';
import { TaskForm } from '@/components/features/TaskForm';
import { Button } from '@/components/ui/Button';
import { taskService } from '@/services/taskService';
import type { TaskResponse } from '@/types';
import { CATEGORY_COLORS, formatTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.listTasks({ limit: 500 });
      setTasks(data);
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const getTasksForDate = (dateStr: string) =>
    tasks.filter((t) => t.task_date === dateStr);

  const toDateStr = (d: Date) => d.toISOString().split('T')[0];

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

    return days;
  };

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const title = viewMode === 'month'
    ? `${MONTHS_FR[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : viewMode === 'week'
    ? `Semaine du ${toDateStr(currentDate)}`
    : toDateStr(currentDate);

  const todayStr = toDateStr(new Date());

  return (
    <DashboardLayout title="Calendrier">
      <div className="space-y-4 animate-fade-in">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <ChevronLeft size={18} />
            </button>
            <span className="text-base font-bold text-gray-900 dark:text-white min-w-[180px] text-center">{title}</span>
            <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <ChevronRight size={18} />
            </button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Aujourd'hui
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === v ? 'bg-white dark:bg-gray-900 text-sabc-red shadow-sm' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => { setSelectedDate(todayStr); setIsCreateOpen(true); }}>
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        </div>

        {/* Month view */}
        {viewMode === 'month' && (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
              {DAYS_FR.map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {getMonthDays().map((day, i) => {
                const dateStr = day ? toDateStr(day) : null;
                const dayTasks = dateStr ? getTasksForDate(dateStr) : [];
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={i}
                    onClick={() => day && (setSelectedDate(dateStr), setIsCreateOpen(dayTasks.length === 0))}
                    className={`min-h-[90px] p-2 border-r border-b border-gray-50 dark:border-gray-800/50 transition-colors ${
                      day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 transition-colors ${
                          isToday ? 'bg-sabc-red text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}>
                          {day.getDate()}
                        </span>
                        <div className="space-y-0.5">
                          {dayTasks.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedTask(t); }}
                              className={`text-xs px-1.5 py-0.5 rounded truncate font-medium cursor-pointer ${CATEGORY_COLORS[t.category]}`}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-400 px-1">+{dayTasks.length - 2} autre{dayTasks.length - 2 > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Day view */}
        {viewMode === 'day' && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {toDateStr(currentDate) === todayStr ? "Aujourd'hui" : toDateStr(currentDate)}
              </h3>
              <Button size="sm" onClick={() => { setSelectedDate(toDateStr(currentDate)); setIsCreateOpen(true); }}>
                <Plus size={14} /> Ajouter
              </Button>
            </div>
            {(() => {
              const dayTasks = getTasksForDate(toDateStr(currentDate));
              if (dayTasks.length === 0) return <EmptyState icon={<Calendar size={24} />} title="Aucune tâche ce jour" />;
              return (
                <div className="space-y-3">
                  {dayTasks.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((t) => (
                    <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setSelectedTask(t)}>
                      <div className="text-xs text-gray-500 font-mono w-16 flex-shrink-0 mt-0.5">
                        {formatTime(t.start_time)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                        <div className="flex gap-1.5 mt-1">
                          <Badge className={`text-xs ${CATEGORY_COLORS[t.category]}`}>{t.category}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        )}
      </div>

      {/* Create task modal — size="2xl" for 2-column TaskForm */}
      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setSelectedDate(null); }} title="Nouvelle tâche" size="2xl">
        <TaskForm
          task={selectedDate ? { task_date: selectedDate } as TaskResponse : undefined}
          onSuccess={(t) => { setIsCreateOpen(false); setTasks((prev) => [...prev, t]); }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Task detail modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Détails de la tâche" size="md">
        {selectedTask && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTask.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={CATEGORY_COLORS[selectedTask.category]}>{selectedTask.category}</Badge>
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{selectedTask.domain}</Badge>
            </div>
            {selectedTask.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">{selectedTask.description}</p>
            )}
            <div className="text-sm text-gray-500 space-y-1">
              <p>📅 {selectedTask.task_date}</p>
              <p>🕐 {formatTime(selectedTask.start_time)} – {formatTime(selectedTask.end_time)}</p>
              {selectedTask.reminder && <p>🔔 Rappel : {selectedTask.reminder}</p>}
            </div>
            <Button variant="ghost" onClick={() => setSelectedTask(null)} className="w-full">Fermer</Button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}