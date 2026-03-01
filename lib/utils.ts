import type { EventCategory, EventDomain, TaskStatus } from '@/types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  'Réunion': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Développement': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Formation': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Rendu': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Autre': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'À faire': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'En cours': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Terminé': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Annulé': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export const DOMAIN_COLORS: Record<EventDomain, string> = {
  'Technique': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Administratif': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Commercial': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Transversal': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

export const CATEGORY_CHART_COLORS: Record<string, string> = {
  'Réunion': '#3B82F6',
  'Développement': '#F97316',
  'Formation': '#22C55E',
  'Rendu': '#EF4444',
  'Autre': '#6B7280',
};

export const EVENT_CATEGORIES: EventCategory[] = ['Réunion', 'Développement', 'Formation', 'Rendu', 'Autre'];
export const EVENT_DOMAINS: EventDomain[] = ['Technique', 'Administratif', 'Commercial', 'Transversal'];
export const TASK_STATUSES: TaskStatus[] = ['À faire', 'En cours', 'Terminé', 'Annulé'];
export const REMINDER_DELAYS = ['15 min avant', '30 min avant', '1 heure avant', 'La veille'];

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}