'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Button, Empty, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

const NOTIF_ICONS: Record<string, string> = {
  BOOKING_CONFIRMED: '✅', BOOKING_REMINDER: '⏰', BOOKING_CANCELLED: '❌',
  REVIEW_RECEIVED: '⭐', PAYMENT_RECEIVED: '💰', SYSTEM: '📢',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAll, isPending } = useMarkAllRead();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            {unread > 0 && <p className="text-sm text-blue-600 mt-0.5">{unread} unread</p>}
          </div>
          {unread > 0 && <Button variant="ghost" size="sm" loading={isPending} onClick={() => markAll()}>Mark all read</Button>}
        </div>
        {isLoading ? <Spinner /> : notifications.length === 0 ? (
          <Empty icon="🔔" title="No notifications" description="We'll notify you about bookings, session reminders, and reviews." />
        ) : (
          <div className="card overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={cn('flex items-start gap-4 p-5 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                  !n.isRead && 'bg-blue-50/60 dark:bg-blue-900/5')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                  !n.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800')}>
                  {NOTIF_ICONS[n.type] ?? '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', !n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
