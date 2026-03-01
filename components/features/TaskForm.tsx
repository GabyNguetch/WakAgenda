'use client';

import { useState } from 'react';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DomainSelect } from '@/components/features/DomainSelect';
import { taskService } from '@/services/taskService';
import type { TaskCreate, TaskResponse, TaskUpdate } from '@/types';
import { EVENT_CATEGORIES, TASK_STATUSES, REMINDER_DELAYS } from '@/lib/utils';
import { CalendarDays, AlignLeft, Tag } from 'lucide-react';

interface TaskFormProps {
  task?: TaskResponse;
  onSuccess: (task: TaskResponse) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEdit = !!task;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: task?.title || '',
    task_date: task?.task_date || new Date().toISOString().split('T')[0],
    start_time: task?.start_time?.slice(0, 5) || '08:00',
    end_time: task?.end_time?.slice(0, 5) || '09:00',
    category: task?.category || 'Autre',
    domain: task?.domain || '',  // domain NAME (e.g. "Technique"), not UUID
    status: task?.status || 'À faire',
    reminder: task?.reminder || '',
    notification_enabled: task?.notification_enabled ?? true,
    description: task?.description || '',
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...form,
        start_time: `${form.start_time}:00`,
        end_time: `${form.end_time}:00`,
        reminder: form.reminder || null,
        description: form.description || null,
        domain: form.domain || undefined,
      };

      let result: TaskResponse;
      if (isEdit) {
        result = await taskService.updateTask(task.id, payload as TaskUpdate);
      } else {
        result = await taskService.createTask(payload as TaskCreate);
      }
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Two-column grid on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">

        {/* Title — full width */}
        <div className="lg:col-span-2">
          <Input
            label="Titre de la tâche"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            placeholder="Ex: Réunion d'équipe, Développement API..."
          />
        </div>

        {/* ── LEFT COLUMN: Classification ── */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Tag size={11} /> Classification
          </p>
          <Select
            label="Catégorie"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <DomainSelect
            label="Domaine"
            value={form.domain}
            onChange={(v) => set('domain', v)}
            required
          />
          <Select
            label="Statut"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={TASK_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {/* ── RIGHT COLUMN: Planning ── */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <CalendarDays size={11} /> Planning
          </p>
          <Input
            label="Date"
            type="date"
            value={form.task_date}
            onChange={(e) => set('task_date', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Heure de début"
              type="time"
              value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)}
              required
            />
            <Input
              label="Heure de fin"
              type="time"
              value={form.end_time}
              onChange={(e) => set('end_time', e.target.value)}
              required
            />
          </div>
          <Select
            label="Rappel"
            value={form.reminder}
            onChange={(e) => set('reminder', e.target.value)}
            options={[{ value: '', label: 'Aucun rappel' }, ...REMINDER_DELAYS.map((r) => ({ value: r, label: r }))]}
          />
        </div>

        {/* Description — full width */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <AlignLeft size={11} /> Description
          </p>
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Notes, détails complémentaires... (optionnel)"
          />
        </div>

        {/* Notification toggle — full width */}
        <div className="lg:col-span-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={form.notification_enabled}
              onChange={(e) => set('notification_enabled', e.target.checked)}
              className="w-4 h-4 accent-sabc-red rounded"
            />
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activer les notifications</p>
              <p className="text-xs text-gray-400">Recevoir un rappel avant la tâche</p>
            </div>
          </label>
        </div>

        {/* Actions — full width */}
        <div className="lg:col-span-2 flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEdit ? 'Enregistrer les modifications' : 'Créer la tâche'}
          </Button>
        </div>

      </div>
    </form>
  );
}