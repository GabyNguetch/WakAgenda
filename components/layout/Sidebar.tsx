'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/tasks',          label: 'Tâches',          icon: CheckSquare },
  { href: '/calendar',       label: 'Calendrier',      icon: Calendar },
  { href: '/notifications',  label: 'Notifications',   icon: Bell, badge: true },
  { href: '/reports',        label: 'Rapports',        icon: FileText },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const avatarUrl = resolveMediaUrl(user?.profile_picture_url);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-950',
        'border-r border-gray-100 dark:border-gray-800 transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex-shrink-0 w-20 h-20 relative">
          <Image src="/images/logo.png" alt="WakAgenda" fill className="object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sabc-red text-sm leading-tight">WakAgenda</p>
            <p className="text-xs text-gray-400 truncate">SABC – DSI</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'ml-auto p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            collapsed && 'ml-0 mx-auto'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-sabc-red text-white shadow-md shadow-sabc-red/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {badge && unreadCount > 0 && (
                <span
                  className={cn(
                    'ml-auto flex-shrink-0 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                    isActive ? 'bg-white text-sabc-red' : 'bg-sabc-red text-white',
                    collapsed && 'absolute -top-1 -right-1 ml-0'
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          title={collapsed ? 'Profil' : undefined}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user?.first_name ?? 'Profil'}
              width={20}
              height={20}
              className="rounded-full flex-shrink-0 w-5 h-5 object-cover"
              unoptimized
            />
          ) : (
            <User size={18} className="flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="truncate">{user?.first_name} {user?.last_name}</span>
          )}
        </Link>
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200"
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}