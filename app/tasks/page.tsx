'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Card, EmptyState, LoadingSpinner, Modal } from '@/components/ui/Index';
import { TaskCard } from '@/components/features/TaskCard';
import { TaskForm } from '@/components/features/TaskForm';
import { taskService } from '@/services/taskService';
import { EVENT_CATEGORIES, EVENT_DOMAINS, TASK_STATUSES  } from '@/lib/utils';
import type { EventCategory, EventDomain, TaskFilters, TaskResponse, TaskStatus } from '@/types';
import { Plus, ListFilter, Trash2, CheckSquare } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskResponse | null>(null);
  const [deleteTask, setDeleteTask] = useState<TaskResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState<TaskFilters>({});

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskService.listTasks(filters);
      setTasks(data);
    } catch {} finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setFilter = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => setFilters({});

  const handleDelete = async () => {
    if (!deleteTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deleteTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTask.id));
      setDeleteTask(null);
    } catch {} finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <DashboardLayout title="Gestion des tâches">
      <div className="space-y-5 animate-fade-in">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tâche{tasks.length > 1 ? 's' : ''} {hasFilters ? '(filtré)' : ''}
          </p>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={15} /> Nouvelle tâche
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
            <ListFilter size={15} /> Filtres
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              value={filters.category || ''}
              onChange={(e) => setFilter('category', e.target.value)}
              options={[{ value: '', label: 'Toutes catégories' }, ...EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              value={filters.domain || ''}
              onChange={(e) => setFilter('domain', e.target.value)}
              options={[{ value: '', label: 'Tous domaines' }, ...EVENT_DOMAINS.map((d) => ({ value: d, label: d }))]}
            />
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilter('status', e.target.value)}
              options={[{ value: '', label: 'Tous statuts' }, ...TASK_STATUSES.map((s) => ({ value: s, label: s }))]}
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>
        </Card>

        {/* Tasks list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={32} />}
            title="Aucune tâche trouvée"
            description={hasFilters ? 'Essayez de modifier vos filtres.' : 'Créez votre première tâche !'}
            action={
              !hasFilters && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={15} /> Créer une tâche
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditTask}
                onDelete={setDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal — size="2xl" for 2-column TaskForm */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nouvelle tâche" size="2xl">
        <TaskForm
          onSuccess={(t) => { setIsCreateOpen(false); setTasks((prev) => [t, ...prev]); }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Modifier la tâche" size="2xl">
        {editTask && (
          <TaskForm
            task={editTask}
            onSuccess={(t) => {
              setEditTask(null);
              setTasks((prev) => prev.map((x) => x.id === t.id ? t : x));
            }}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteTask} onClose={() => setDeleteTask(null)} title="Supprimer la tâche" size="sm">
        {deleteTask && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-gray-900 dark:text-white">"{deleteTask.title}"</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteTask(null)} className="flex-1">
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
                <Trash2 size={15} /> Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}