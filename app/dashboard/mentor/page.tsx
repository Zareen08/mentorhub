'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useMyBookings } from '@/hooks/useBookings';
import { useCreateMentor, useUpdateMentor } from '@/hooks/useMentors';
import { useMentorAnalytics } from '@/hooks/useAnalytics';
import { useAIInsights } from '@/hooks/useAI';
import { useMentorReviews } from '@/hooks/useReviews';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Badge, Empty, Spinner, Button, Input, Select, Tabs } from '@/components/ui';
import { BarChartCard, PieChartCard } from '@/components/dashboard/StatsChart';
import { formatCurrency, formatDateTime, statusColor, SKILLS, AVAILABILITY_OPTIONS, formatAvailability } from '@/lib/utils';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard/mentor', icon: '📊', label: 'Overview' },
  { href: '/dashboard/mentor#sessions', icon: '📅', label: 'Sessions' },
  { href: '/dashboard/mentor#earnings', icon: '💰', label: 'Earnings' },
  { href: '/dashboard/mentor#reviews', icon: '⭐', label: 'Reviews' },
  { href: '/dashboard/mentor#profile', icon: '🎓', label: 'Mentor Profile' },
  { href: '/dashboard/mentor#ai', icon: '🤖', label: 'AI Insights' },
];

const mentorSchema = z.object({
  title: z.string().min(3, 'Required'),
  company: z.string().optional(),
  experience: z.coerce.number().min(0).max(50),
  hourlyRate: z.coerce.number().min(10, 'Minimum $10/hr'),
  skills: z.string().min(1, 'Add at least one skill'),
});
type MentorForm = z.infer<typeof mentorSchema>;

export default function MentorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('overview');

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  return (
    <DashboardLayout navItems={NAV_ITEMS.map(n => ({ ...n, href: n.href.split('#')[0] }))} title="Mentor Dashboard">
      <div className="mb-6 flex flex-wrap gap-2">
        {['overview', 'sessions', 'earnings', 'reviews', 'profile', 'ai'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
            {t === 'ai' ? '🤖 AI Insights' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'overview' && <MentorOverviewTab />}
      {tab === 'sessions' && <MentorSessionsTab />}
      {tab === 'earnings' && <MentorEarningsTab />}
      {tab === 'reviews' && <MentorReviewsTab />}
      {tab === 'profile' && <MentorProfileTab />}
      {tab === 'ai' && <MentorAITab />}
    </DashboardLayout>
  );
}

function MentorOverviewTab() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useMentorAnalytics();
  const { data: bookings = [] } = useMyBookings();

  const monthlyData = analytics?.monthlyTrend?.map((t: any) => ({
    month: new Date(t.month).toLocaleString('default', { month: 'short' }),
    revenue: Number(t.revenue ?? 0),
    sessions: Number(t.bookings ?? 0),
  })) ?? [];

  const ratingDist = [
    { name: '5 Stars', value: Math.floor((analytics?.totalReviews ?? 0) * 0.72) },
    { name: '4 Stars', value: Math.floor((analytics?.totalReviews ?? 0) * 0.18) },
    { name: '3 & below', value: Math.floor((analytics?.totalReviews ?? 0) * 0.10) },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Mentor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sessions" value={isLoading ? '—' : analytics?.totalSessions ?? 0} icon="📅" />
        <StatCard label="Total Earned" value={isLoading ? '—' : formatCurrency(analytics?.totalEarnings ?? 0)} icon="💰" />
        <StatCard label="Avg Rating" value={isLoading ? '—' : `${(analytics?.averageRating ?? 0).toFixed(1)} ★`} icon="⭐" />
        <StatCard label="Total Reviews" value={isLoading ? '—' : analytics?.totalReviews ?? 0} icon="💬" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <BarChartCard title="Monthly Revenue" data={monthlyData} xKey="month" yKey="revenue" color="#10B981" />
        {ratingDist.length > 0 ? <PieChartCard title="Rating Distribution" data={ratingDist} /> :
          <BarChartCard title="Sessions per Month" data={monthlyData} xKey="month" yKey="sessions" color="#3B82F6" />}
      </div>
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
        </div>
        {bookings.length === 0 ? (
          <Empty icon="📅" title="No sessions yet" description="Your booked sessions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Student', 'Date', 'Duration', 'Amount', 'Status'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(b.date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{b.duration} min</td>
                    <td className="px-5 py-3.5 font-semibold">{formatCurrency(b.totalAmount)}</td>
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

function MentorSessionsTab() {
  const { data: bookings = [], isLoading } = useMyBookings();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">All Sessions</h2>
      <Tabs active={filter} onChange={setFilter} tabs={[
        { key: 'all', label: 'All', count: bookings.length },
        { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
        { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
        { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
      ]} />
      {isLoading ? <Spinner /> : filtered.length === 0 ? <Empty icon="📅" title="No sessions found" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Student', 'Date & Time', 'Duration', 'Amount', 'Status'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDateTime(b.date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{b.duration} min</td>
                    <td className="px-5 py-3.5 font-semibold">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-5 py-3.5"><Badge label={b.status} variant={statusColor(b.status) as any} /></td>
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

function MentorEarningsTab() {
  const { data: analytics } = useMentorAnalytics();
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">Earnings</h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <StatCard label="Total Earned" value={formatCurrency(analytics?.totalEarnings ?? 0)} icon="💰" />
        <StatCard label="Completed Sessions" value={analytics?.totalSessions ?? 0} icon="✅" />
      </div>
      <div className="card p-5">
        <p className="text-sm text-slate-500">💡 Detailed payout history and withdrawal options will be available with Stripe integration. Earnings are tracked per completed session.</p>
      </div>
    </div>
  );
}

function MentorReviewsTab() {
  const { user } = useAuth();
  const { data: reviewsData, isLoading } = useMentorReviews(user?.id ?? '');
  const reviews = reviewsData?.reviews ?? reviewsData?.data ?? (Array.isArray(reviewsData) ? reviewsData : []);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">My Reviews</h2>
      {isLoading ? <Spinner /> : reviews.length === 0 ? (
        <Empty icon="⭐" title="No reviews yet" description="Reviews from your students will appear here." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(r.user?.name ?? 'U')[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{r.user?.name}</p>
                    <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <span key={i} className={`text-sm ${i < r.rating ? 'text-amber-400' : 'text-slate-300'}`}>★</span>)}</div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MentorProfileTab() {
  const { mutate: create, isPending: creating } = useCreateMentor();
  const [availability, setAvailability] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<MentorForm>({ resolver: zodResolver(mentorSchema) });

  const onSubmit = (data: MentorForm) => {
    create({ ...data, skills: data.skills.split(',').map(s => s.trim()).filter(Boolean), availability });
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">Mentor Profile</h2>
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input label="Professional Title" placeholder="e.g. Senior Software Engineer" error={errors.title?.message} {...register('title')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company" placeholder="e.g. Google" {...register('company')} />
            <Input label="Years of Experience" type="number" placeholder="5" error={errors.experience?.message} {...register('experience')} />
          </div>
          <Input label="Hourly Rate ($)" type="number" placeholder="80" error={errors.hourlyRate?.message} {...register('hourlyRate')} />
          <Input label="Skills (comma-separated)" placeholder="React, Node.js, TypeScript" error={errors.skills?.message} {...register('skills')} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Availability</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {AVAILABILITY_OPTIONS.map((slot) => (
                <label key={slot} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={availability.includes(slot)} onChange={(e) => setAvailability(e.target.checked ? [...availability, slot] : availability.filter(s => s !== slot))} className="w-4 h-4 accent-blue-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{formatAvailability(slot)}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" loading={creating} className="w-full">Create / Update Mentor Profile</Button>
        </form>
      </div>
    </div>
  );
}

function MentorAITab() {
  const { refetch, data, isFetching } = useAIInsights();
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">AI Market Insights</h2>
      <div className="card p-6">
        <p className="text-sm text-slate-500 mb-4">Get AI-powered analysis of mentorship trends, in-demand skills, and platform performance insights.</p>
        <Button onClick={() => refetch()} loading={isFetching} className="mb-4">Generate AI Insights</Button>
        {data && (
          <pre className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-80 leading-relaxed">
            {JSON.stringify(data?.aiInsights ?? data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
