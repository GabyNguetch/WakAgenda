'use client';

import { useAuth } from '@/hooks/useAuth';
import { getGreeting } from '@/lib/utils';
import { NotificationBell } from '@/components/features/NotificationBell';

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div>
          {title ? (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.first_name} 👋
              </h1>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}