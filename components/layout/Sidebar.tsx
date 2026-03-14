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
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-950',
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
            onClick={() => router.push('/auth')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200"
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAVBAR (visible only on small screens) ────────── */}
      <MobileBottomNav
        pathname={pathname}
        unreadCount={unreadCount}
        user={user}
        avatarUrl={avatarUrl}
        onLogout={() => router.push('/auth')}
      />
    </>
  );
}

// ── Mobile Bottom Navigation Bar ─────────────────────────────────────────────

interface MobileBottomNavProps {
  pathname: string;
  unreadCount: number;
  user: { first_name: string; last_name: string } | null;
  avatarUrl: string | null;
  onLogout: () => void;
}

function MobileBottomNav({ pathname, unreadCount, user, avatarUrl, onLogout }: MobileBottomNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const bottomItems = [
    { href: '/dashboard',     label: 'Accueil',  icon: LayoutDashboard },
    { href: '/tasks',         label: 'Tâches',   icon: CheckSquare },
    { href: '/calendar',      label: 'Calendrier', icon: Calendar },
    { href: '/notifications', label: 'Notifs',   icon: Bell, badge: true },
    { href: '/reports',       label: 'Rapports', icon: FileText },
  ];

  return (
    <>
      {/* Profile drawer overlay */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Profile slide-up drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl md:hidden',
          'border-t border-gray-100 dark:border-gray-800 transition-transform duration-300',
          profileOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sabc-red to-sabc-orange flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400">Stagiaire SABC</p>
            </div>
          </div>

          {/* Profile link */}
          <Link
            href="/profile"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <User size={18} className="text-sabc-red" />
            Mon profil
          </Link>

          {/* Logout */}
          <button
            onClick={() => { setProfileOpen(false); onLogout(); }}
            className="flex items-center gap-3 w-full p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>

          {/* Safe area spacer */}
          <div className="h-2" />
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl',
          'border-t border-gray-100 dark:border-gray-800',
          'shadow-[0_-4px_24px_rgba(0,0,0,0.08)]'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch h-16">
          {/* Nav items */}
          {bottomItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200',
                  isActive ? 'text-sabc-red' : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sabc-red rounded-full" />
                )}

                {/* Icon container */}
                <span
                  className={cn(
                    'relative flex items-center justify-center w-9 h-8 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-sabc-red/10 scale-110'
                      : 'scale-100'
                  )}
                >
                  <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 1.8} />

                  {/* Badge */}
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-sabc-red text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none transition-all duration-200',
                    isActive ? 'opacity-100 font-semibold' : 'opacity-60'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Profile button */}
          <button
            onClick={() => setProfileOpen(true)}
            className={cn(
              'relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200',
              pathname === '/profile' ? 'text-sabc-red' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            {pathname === '/profile' && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sabc-red rounded-full" />
            )}
            <span
              className={cn(
                'relative flex items-center justify-center w-9 h-8 rounded-xl transition-all duration-200',
                pathname === '/profile' ? 'bg-sabc-red/10 scale-110' : 'scale-100'
              )}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-sabc-red/30"
                />
              ) : (
                <User size={pathname === '/profile' ? 20 : 18} strokeWidth={pathname === '/profile' ? 2.5 : 1.8} />
              )}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium leading-none transition-all duration-200',
                pathname === '/profile' ? 'opacity-100 font-semibold' : 'opacity-60'
              )}
            >
              Profil
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom nav on mobile */}
      <div className="h-16 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}