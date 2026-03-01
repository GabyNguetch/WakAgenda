'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState, LoadingSpinner } from '@/components/ui/Index';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Check, CheckCheck, Trash2, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-4 mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck size={14} /> Tout marquer lu
            </Button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff size={32} />}
            title="Aucune notification"
            description="Vous êtes à jour ! Les rappels de tâches apparaîtront ici."
          />
        ) : (
          <div className="space-y-2 stagger-children">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`p-4 transition-all duration-200 ${!n.is_read ? 'border-l-4 border-l-sabc-red' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    n.is_read
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      : 'bg-sabc-red/10 text-sabc-red'
                  }`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 transition-colors"
                        title="Marquer comme lu"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}