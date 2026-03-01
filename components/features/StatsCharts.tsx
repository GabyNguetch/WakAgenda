'use client';

import { Card } from '@/components/ui/Index';
import { CATEGORY_CHART_COLORS } from '@/lib/utils';
import type { TaskStats } from '@/types';

interface StatsChartsProps {
  stats: TaskStats;
}

function DonutChart({ data, title }: { data: Record<string, number>; title: string }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <Card className="p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</p>
        <p className="text-center text-sm text-gray-400 py-8">Aucune donnée</p>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    'À faire': '#F59E0B',
    'En cours': '#3B82F6',
    'Terminé': '#22C55E',
    'Annulé': '#EF4444',
    'Technique': '#8B5CF6',
    'Administratif': '#6B7280',
    'Commercial': '#06B6D4',
    'Transversal': '#EC4899',
    ...CATEGORY_CHART_COLORS,
  };

  let cumulative = 0;
  const slices = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => {
      const pct = (value / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { key, value, pct, start };
    });

  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0 -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="16" className="text-gray-100 dark:text-gray-800" />
          {slices.map(({ key, pct, start }) => (
            <circle
              key={key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={statusColors[key] || '#94A3B8'}
              strokeWidth="16"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-((start / 100) * circumference)}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="flex-1 space-y-1.5 min-w-0">
          {slices.map(({ key, value, pct }) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[key] || '#94A3B8' }}
              />
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{key}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 flex-shrink-0">
                {value} ({pct.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function StatsCharts({ stats }: StatsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DonutChart data={stats.by_category} title="Par catégorie" />
      <DonutChart data={stats.by_status} title="Par statut" />
      <DonutChart data={stats.by_domain} title="Par domaine" />
    </div>
  );
}