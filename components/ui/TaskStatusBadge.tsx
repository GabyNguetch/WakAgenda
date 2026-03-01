import { Badge } from '@/components/ui/Index';
import type { TaskStatus } from '@/types';

const STATUS_COLORS_EXTENDED: Record<TaskStatus, string> = {
  'À faire': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'En cours': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Terminé': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Annulé': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'En retard': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Manquée': 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <Badge className={`${STATUS_COLORS_EXTENDED[status]} uppercase text-xs tracking-wide`}>
      {status}
    </Badge>
  );
}