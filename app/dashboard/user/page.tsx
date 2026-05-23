'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { useMyReviews } from '@/hooks/useReviews';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { useAIRecommendations, useAIMatch, useAISentiment } from '@/hooks/useAI';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReviewModal } from '@/components/booking/ReviewModal';
import { StatCard, Badge, Tabs, Empty, Spinner, Button, Input, Textarea, Stars, Skeleton } from '@/components/ui';
import { BarChartCard, PieChartCard } from '@/components/dashboard/StatsChart';
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

const NAV_ITEMS = [
  { href: '/dashboard/user', icon: '📊', label: 'Overview' },
  { href: '/dashboard/user#bookings', icon: '📅', label: 'My Bookings' },
  { href: '/dashboard/user#reviews', icon: '⭐', label: 'My Reviews' },
  { href: '/dashboard/user#notifications', icon: '🔔', label: 'Notifications' },
  { href: '/dashboard/user#ai', icon: '🤖', label: 'AI Tools' },
  { href: '/dashboard/user#profile', icon: '👤', label: 'Profile' },
  { href: '/dashboard/user#settings', icon: '⚙️', label: 'Settings' },
];

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  bio: z.string().optional(),
});

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('overview');
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; mentorName: string } | null>(null);
  const qc = useQueryClient();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const navWithActive = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.includes('#') ? '#' : item.href,
  }));

  return (
    <DashboardLayout navItems={NAV_ITEMS.map(n => ({ ...n, href: n.href.split('#')[0] }))} title="User Dashboard">
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        {['overview', 'bookings', 'reviews', 'notifications', 'ai', 'profile', 'settings'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {t === 'ai' ? '🤖 AI Tools' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'bookings' && <BookingsTab onReview={setReviewModal} />}
      {tab === 'reviews' && <ReviewsTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'ai' && <AIToolsTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'settings' && <SettingsTab />}

      {reviewModal && (
        <ReviewModal bookingId={reviewModal.bookingId} mentorName={reviewModal.mentorName}
          open={!!reviewModal} onClose={() => setReviewModal(null)} />
      )}
    </DashboardLayout>
  );
}

/* ── Overview ── */
function OverviewTab() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading } = useMyBookings();
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const totalSpent = completed.reduce((s, b) => s + (b.totalAmount ?? 0), 0);

  const monthlyData = bookings.reduce((acc: Record<string, number>, b) => {
    const m = new Date(b.date).toLocaleString('default', { month: 'short' });
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(monthlyData).slice(-6).map(([month, count]) => ({ month, count }));

  const statusDist = [
    { name: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length },
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length },
    { name: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'CANCELLED').length },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's your mentorship activity at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Bookings" value={isLoading ? '—' : bookings.length} icon="📅" />
        <StatCard label="Completed" value={isLoading ? '—' : completed.length} icon="✅" />
        <StatCard label="Total Spent" value={isLoading ? '—' : formatCurrency(totalSpent)} icon="💰" />
        <StatCard label="Mentors Worked With" value={isLoading ? '—' : new Set(bookings.map(b => b.mentorId)).size} icon="🎓" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <BarChartCard title="Sessions per Month" data={chartData} xKey="month" yKey="count" color="#3B82F6" />
        {statusDist.length > 0 ? <PieChartCard title="Booking Status" data={statusDist} /> :
          <div className="card p-5 flex items-center justify-center text-slate-400 text-sm">No booking data yet</div>}
      </div>

      {/* Recent bookings */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
          <Link href="#" onClick={() => document.querySelector('[data-tab="bookings"]')?.dispatchEvent(new Event('click'))}
            className="text-xs text-blue-600 font-semibold hover:text-blue-700">View all →</Link>
        </div>
        {isLoading ? <Spinner /> : bookings.length === 0 ? (
          <Empty icon="📅" title="No bookings yet"
            description="Find a mentor and book your first session!"
            action={<Link href="/mentors"><Button size="sm">Browse Mentors</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Mentor</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
              </tr></thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.mentor?.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(b.date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{b.duration} min</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-5 py-3.5"><Badge label={b.status} variant={statusColor(b.status) as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Bookings ── */
function BookingsTab({ onReview }: { onReview: (d: { bookingId: string; mentorName: string }) => void }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: bookings = [], isLoading } = useMyBookings();
  const { mutate: cancel } = useCancelBooking();

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);
  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length },
  ];

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      window.location.reload();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">My Bookings</h2>
      <Tabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <Empty icon="📅" title="No bookings found"
          action={<Link href="/mentors"><Button size="sm">Find a Mentor</Button></Link>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Mentor', 'Date & Time', 'Duration', 'Amount', 'Status', 'Actions'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(b.mentor?.user?.name ?? 'M')[0]}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{b.mentor?.user?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDateTime(b.date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{b.duration} min</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-5 py-3.5"><Badge label={b.status} variant={statusColor(b.status) as any} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {b.status === 'COMPLETED' && !b.review && (
                          <Button size="sm" variant="secondary" onClick={() => onReview({ bookingId: b.id, mentorName: b.mentor?.user?.name ?? 'Mentor' })}>
                            Review
                          </Button>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <Button size="sm" variant="danger" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                        )}
                        {b.meetingLink && (
                          <a href={b.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="primary">Join →</Button>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reviews ── */
function ReviewsTab() {
  const { data: reviews = [], isLoading } = useMyReviews();
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">My Reviews</h2>
      {isLoading ? <Spinner /> : reviews.length === 0 ? (
        <Empty icon="⭐" title="No reviews yet" description="Complete a session and leave your first review!" />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(r.mentor?.user?.name ?? 'M')[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-white">{r.mentor?.user?.name}</p>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{r.mentor?.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Notifications ── */
function NotificationsTab() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAll } = useMarkAllRead();
  const unread = notifications.filter(n => !n.isRead).length;

  const iconMap: Record<string, string> = {
    BOOKING_CONFIRMED: '✅', BOOKING_REMINDER: '⏰', BOOKING_CANCELLED: '❌',
    REVIEW_RECEIVED: '⭐', PAYMENT_RECEIVED: '💰', SYSTEM: '📢',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Notifications {unread > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm rounded-full">{unread}</span>}
        </h2>
        {unread > 0 && <Button variant="ghost" size="sm" onClick={() => markAll()}>Mark all read</Button>}
      </div>
      {isLoading ? <Spinner /> : notifications.length === 0 ? (
        <Empty icon="🔔" title="No notifications" description="We'll notify you about bookings, reviews, and more." />
      ) : (
        <div className="card overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''}`}>
              <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base">
                {iconMap[n.type] ?? '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── AI Tools ── */
function AIToolsTab() {
  const { refetch: fetchRecs, data: recs, isFetching: recsLoading } = useAIRecommendations();
  const { mutate: aiMatch, isPending: matchLoading, data: matches } = useAIMatch();
  const { mutate: aiSentiment, isPending: sentimentLoading, data: sentiment } = useAISentiment();
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [sentimentText, setSentimentText] = useState('');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">AI Tools</h2>
        <p className="text-sm text-slate-500">Powered by AI · Personal intelligence for your learning journey</p>
      </div>

      {/* Recommendations */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl">🎯</div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">AI Mentor Recommendations</h3>
            <p className="text-xs text-slate-400">Personalized picks based on your learning history</p>
          </div>
        </div>
        <Button onClick={() => fetchRecs()} loading={recsLoading} className="mb-4">Get Recommendations</Button>
        {recs && (
          <div className="space-y-2">
            {Array.isArray(recs) && recs.length > 0 ? recs.map((r, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">Mentor ID: {r.mentorId}</p>
                <p className="text-slate-500 mt-0.5">{r.reason}</p>
              </div>
            )) : <p className="text-sm text-slate-400">No specific recommendations yet. Book a few sessions first!</p>}
          </div>
        )}
      </div>

      {/* Smart Match */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-xl">🔍</div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Smart Mentor Match</h3>
            <p className="text-xs text-slate-400">Describe your goal, AI finds your best match</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <Input placeholder="Your learning goal (e.g. master React in 3 months)" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Input type="number" placeholder="Budget per hour (optional)" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <Button onClick={() => { if (goal) aiMatch({ goal, budget: budget ? parseFloat(budget) : undefined }); }} loading={matchLoading} disabled={!goal} className="mb-4">
          Find My Best Match
        </Button>
        {matches && (
          <div className="space-y-2">
            {Array.isArray(matches) && matches.length > 0 ? matches.map((m, i) => (
              <div key={i} className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-700 dark:text-green-400">Match Score: {((m.score ?? 0) * 100).toFixed(0)}%</span>
                  <Link href={`/mentors/${m.mentorId}`}><Button size="sm" variant="secondary">View →</Button></Link>
                </div>
                <p className="text-slate-500 mt-1">{m.reason}</p>
                {m.expectedImprovement && <p className="text-xs text-green-600 mt-0.5">Expected: {m.expectedImprovement}</p>}
              </div>
            )) : <p className="text-sm text-slate-400">No matches found. Try a different goal!</p>}
          </div>
        )}
      </div>

      {/* Sentiment Analysis */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-xl">💭</div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Sentiment Analysis</h3>
            <p className="text-xs text-slate-400">Analyze text sentiment with AI</p>
          </div>
        </div>
        <Textarea placeholder="Paste any text to analyze its sentiment…" value={sentimentText} onChange={(e) => setSentimentText(e.target.value)} className="mb-3" />
        <Button onClick={() => { if (sentimentText) aiSentiment({ text: sentimentText }); }} loading={sentimentLoading} disabled={!sentimentText} className="mb-4">
          Analyze Sentiment
        </Button>
        {sentiment && (
          <div className={`p-4 rounded-xl border ${sentiment.sentiment === 'positive' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : sentiment.sentiment === 'negative' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sentiment.sentiment === 'positive' ? '😊' : sentiment.sentiment === 'negative' ? '😟' : '😐'}</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white capitalize">{sentiment.sentiment}</p>
                <p className="text-xs text-slate-500">Score: {((sentiment.score ?? 0) * 100).toFixed(0)}% · Emotion: {sentiment.emotion}</p>
              </div>
            </div>
            {sentiment.keywords?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sentiment.keywords.map((k) => <span key={k} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">{k}</span>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Profile ── */
function ProfileTab() {
  const { user, setAuth, token } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', bio: user?.bio ?? '' },
  });

  const onSubmit = async (data: { name: string; bio?: string }) => {
    try {
      const res = await api.put('/users/profile', data);
      const updated = res.data.data || res.data;
      setAuth({ ...user!, ...updated }, token!, localStorage.getItem('mh_refresh') ?? '');
      toast.success('Profile updated!');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className="max-w-xl space-y-5">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold font-display">
          {(user?.name ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <Badge label={user?.role ?? 'USER'} variant={user?.role === 'ADMIN' ? 'red' : user?.role === 'MENTOR' ? 'green' : 'blue'} className="mt-1" />
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
            <textarea className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-y min-h-24 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Tell mentors about yourself…" {...register('bio')} />
          </div>
          <Button type="submit" loading={isSubmitting}>Save Changes</Button>
        </form>
      </div>
    </div>
  );
}

/* ── Settings ── */
function SettingsTab() {
  return (
    <div className="max-w-xl space-y-5">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
      <div className="card p-5">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Notifications</h3>
        <div className="space-y-3">
          {[['Booking confirmations', true], ['Session reminders', true], ['New messages', true], ['Platform updates', false]].map(([label, def]) => (
            <div key={label as string} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400">{label as string}</span>
              <button onClick={() => toast.success('Setting saved')}
                className={`w-11 h-6 rounded-full transition-colors ${def ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} relative`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${def ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-display font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-3">Permanently delete your account and all data.</p>
        <Button variant="danger" size="sm" onClick={() => toast('Contact support@mentorhub.io to delete your account', { icon: '⚠️' })}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
