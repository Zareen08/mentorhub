'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn, getInitials } from '@/lib/utils';
import { Bell, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, BookOpen, GraduationCap, ShieldCheck, Moon, Sun } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isMentor, isAdmin, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDDOpen, setUserDDOpen] = useState(false);
  const [notifDDOpen, setNotifDDOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const isDashRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/auth');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDDOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifDDOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/mentors', label: 'Find Mentors' },
    { href: '/about', label: 'About' },
    // { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  if (isDashRoute) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-[68px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-slate-900 dark:text-white flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🎓</div>
          MentorHub
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white')}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <button onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifDDOpen(!notifDDOpen)}
                  className="relative w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifDDOpen && (
                  <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && <span className="text-xs text-blue-600 font-semibold">{unreadCount} unread</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications?.slice(0, 5).map((n) => (
                        <div key={n.id} onClick={() => { router.push('/notifications'); setNotifDDOpen(false); }}
                          className={cn('px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                            !n.isRead && 'bg-blue-50/50 dark:bg-blue-900/10')}>
                          <div className="flex items-start gap-2">
                            {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                            <div className={cn(!n.isRead ? '' : 'ml-4')}>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      )) ?? <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications</div>}
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                      <Link href="/notifications" onClick={() => setNotifDDOpen(false)}
                        className="block text-center text-sm text-blue-600 font-semibold py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar dropdown */}
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserDDOpen(!userDDOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user?.name ?? 'U')}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block max-w-24 truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {userDDOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { href: '/dashboard/user', icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
                      { href: '/profile', icon: <User size={14} />, label: 'Profile' },
                      { href: '/bookings', icon: <BookOpen size={14} />, label: 'My Bookings' },
                      ...(isMentor ? [{ href: '/dashboard/mentor', icon: <GraduationCap size={14} />, label: 'Mentor Dashboard' }] : []),
                      ...(isAdmin ? [{ href: '/dashboard/admin', icon: <ShieldCheck size={14} />, label: 'Admin Panel' }] : []),
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setUserDDOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                        {item.icon}{item.label}
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 p-2">
                      <button onClick={() => { logout(); router.push('/'); setUserDDOpen(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium">
                        <LogOut size={14} />Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Log in</Link>
              <Link href="/auth/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25">Get Started</Link>
            </div>
          )}

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[68px] left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl z-40 p-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === l.href ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50')}>
              {l.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-1">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl">Log in</Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-xl">Get Started</Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 mt-1 flex flex-col gap-1">
              <Link href="/dashboard/user" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Dashboard</Link>
              <Link href="/bookings" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">My Bookings</Link>
              <button onClick={() => { logout(); router.push('/'); setMobileOpen(false); }} className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl text-left">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
