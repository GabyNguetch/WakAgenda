'use client';

import { Badge, Card } from '@/components/ui/Index';
import { CATEGORY_COLORS, STATUS_COLORS, DOMAIN_COLORS, formatDate, formatTime } from '@/lib/utils';
import type { TaskResponse } from '@/types/index';
import { Clock, Calendar, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useTabContext } from '@/contexts/TabContext';

interface TaskCardProps {
  task: TaskResponse;
  onEdit?: (task: TaskResponse) => void;
  onDelete?: (task: TaskResponse) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, compact }: TaskCardProps) {
  const { openTab } = useTabContext();

  const statusColorClass = STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700';
  const domainColorClass = DOMAIN_COLORS[task.domain as keyof typeof DOMAIN_COLORS] ?? 'bg-gray-100 text-gray-700';

  return (
    <Card className={`p-4 hover:shadow-md transition-all duration-200 ${compact ? '' : 'group'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge className={CATEGORY_COLORS[task.category]}>{task.category}</Badge>
            <Badge className={statusColorClass}>{task.status}</Badge>
            {!compact && <Badge className={domainColorClass}>{task.domain}</Badge>}
          </div>
          <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {task.title}
          </h3>
          {!compact && task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(task.task_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTime(task.start_time)} – {formatTime(task.end_time)}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {task.status === 'Terminé' && (
              <button
                onClick={() => openTab(task.id, task.title)}
                className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors"
                title="Rédiger un commentaire"
              >
                <MessageSquare size={14} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}