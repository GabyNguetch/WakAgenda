'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import { formatDateTime } from '@/lib/utils';
import type { NotificationResponse } from '@/types';

export function NotificationBell() {
  const { unreadCount, fetchNotifications: refreshCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadList, setUnreadList] = useState<NotificationResponse[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setIsLoadingList(true);
      try {
        const data = await notificationService.getUnread();
        setUnreadList(data);
      } catch {
        setUnreadList([]);
      } finally {
        setIsLoadingList(false);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadList((prev) => prev.filter((n) => n.id !== id));
      // Refresh global count via the hook — refetch notifications
      refreshCount();
    } catch {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-sabc-red text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl z-50 animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold text-sabc-red">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-sabc-red/30 border-t-sabc-red rounded-full animate-spin" />
              </div>
            ) : unreadList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell size={24} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucune notification non lue</p>
              </div>
            ) : (
              <ul>
                {unreadList.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="flex-shrink-0 mt-0.5 text-xs font-semibold text-sabc-red hover:underline"
                      title="Marquer comme lu"
                    >
                      Lu
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-sabc-red hover:underline"
            >
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}