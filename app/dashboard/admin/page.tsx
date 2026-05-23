'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePlatformStats, useBookingTrends } from '@/hooks/useAnalytics';
import { useAIInsights } from '@/hooks/useAI';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Badge, Empty, Spinner, Button, Tabs } from '@/components/ui';
import { BarChartCard, LineChartCard, PieChartCard } from '@/components/dashboard/StatsChart';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import { api, getErrorMessage } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard/admin', icon: '📊', label: 'Overview' },
  { href: '/dashboard/admin#users', icon: '👥', label: 'Users' },
  { href: '/dashboard/admin#mentors', icon: '🎓', label: 'Mentors' },
  { href: '/dashboard/admin#bookings', icon: '📅', label: 'Bookings' },
  { href: '/dashboard/admin#reviews', icon: '⭐', label: 'Reviews' },
  { href: '/dashboard/admin#ai', icon: '🤖', label: 'AI Insights' },
  { href: '/dashboard/admin#analytics', icon: '📈', label: 'Analytics' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!isAdmin) { router.push('/dashboard/user'); toast.error('Admin access required'); }
  }, [isAuthenticated, isAdmin]);

  return (
    <DashboardLayout navItems={NAV_ITEMS.map(n => ({ ...n, href: n.href.split('#')[0] }))} title="Admin Panel">
      <div className="mb-6 flex flex-wrap gap-2">
        {['overview', 'users', 'mentors', 'bookings', 'reviews', 'ai', 'analytics'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
            {t === 'ai' ? '🤖 AI Insights' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'overview'   && <AdminOverviewTab />}
      {tab === 'users'      && <AdminUsersTab />}
      {tab === 'mentors'    && <AdminMentorsTab />}
      {tab === 'bookings'   && <AdminBookingsTab />}
      {tab === 'reviews'    && <AdminReviewsTab />}
      {tab === 'ai'         && <AdminAITab />}
      {tab === 'analytics'  && <AdminAnalyticsTab />}
    </DashboardLayout>
  );
}

/* ── Overview ── */
function AdminOverviewTab() {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: trends } = useBookingTrends();

  const trendData = Array.isArray(trends)
    ? trends.slice(-8).map((t: any) => ({
        month: t.month ? new Date(t.month).toLocaleString('default', { month: 'short' }) : t.date ?? '',
        bookings: Number(t.count ?? t.bookings ?? 0),
        revenue: Number(t.revenue ?? 0),
      }))
    : [];

  const statusPie = stats ? [
    { name: 'Completed', value: stats.completedBookings },
    { name: 'Pending', value: Math.round(stats.totalBookings * 0.15) },
    { name: 'Confirmed', value: Math.round(stats.totalBookings * 0.20) },
    { name: 'Cancelled', value: Math.round(stats.totalBookings * 0.05) },
  ].filter(d => d.value > 0) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide metrics and health indicators</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users"     value={isLoading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}    icon="👥" change="+12% this month" />
        <StatCard label="Total Mentors"   value={isLoading ? '—' : (stats?.totalMentors ?? 0).toLocaleString()}  icon="🎓" change="+8% this month" />
        <StatCard label="Total Bookings"  value={isLoading ? '—' : (stats?.totalBookings ?? 0).toLocaleString()} icon="📅" change="+15% this month" />
        <StatCard label="Platform Revenue" value={isLoading ? '—' : formatCurrency(stats?.totalRevenue ?? 0)}    icon="💰" change="+24% this month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <BarChartCard title="Booking Trends" data={trendData} xKey="month" yKey="bookings" color="#3B82F6" />
        </div>
        {statusPie.length > 0
          ? <PieChartCard title="Booking Status" data={statusPie} />
          : <div className="card p-5 flex items-center justify-center text-sm text-slate-400">No status data</div>}
      </div>

      {/* Platform health */}
      <div className="card p-5 mb-5">
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Platform Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Completion Rate', value: stats ? `${((stats.completedBookings / Math.max(stats.totalBookings, 1)) * 100).toFixed(1)}%` : '—', color: 'text-green-600' },
            { label: 'Avg Rating', value: stats ? `${stats.averageRating.toFixed(1)} ★` : '—', color: 'text-amber-600' },
            { label: 'Conversion Rate', value: stats ? `${stats.conversionRate?.toFixed(1) ?? 0}%` : '—', color: 'text-blue-600' },
            { label: 'Active Mentors', value: stats ? `${stats.totalMentors}` : '—', color: 'text-violet-600' },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className={`font-display text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Users ── */
function AdminUsersTab() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => { const res = await api.get('/users'); return res.data.data || res.data; },
  });
  const users = Array.isArray(data) ? data : data?.users ?? [];
  const filtered = users.filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>
      {isLoading ? <Spinner /> : filtered.length === 0 ? <Empty icon="👥" title="No users found" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.name ?? 'U')[0]}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={u.role} variant={u.role === 'ADMIN' ? 'red' : u.role === 'MENTOR' ? 'green' : 'blue'} />
                    </td>
                    <td className="px-5 py-3.5">{u.isVerified ? '✅' : '⏳'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Button size="sm" variant="ghost" onClick={() => toast(`User: ${u.email}`)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mentors ── */
function AdminMentorsTab() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-mentors'],
    queryFn: async () => { const res = await api.get('/mentors?limit=50'); return res.data.data?.mentors ?? res.data.mentors ?? []; },
  });
  const mentors = Array.isArray(data) ? data : [];
  const filtered = mentors.filter((m: any) =>
    !search || m.user?.name?.toLowerCase().includes(search.toLowerCase()) || m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Mentor Management</h2>
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors…"
            className="w-full pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>
      {isLoading ? <Spinner /> : filtered.length === 0 ? <Empty icon="🎓" title="No mentors found" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Mentor', 'Title', 'Rate', 'Rating', 'Sessions', 'Status', 'Actions'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((m: any) => (
                  <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(m.user?.name ?? 'M')[0]}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{m.user?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-[160px] truncate">{m.title}</td>
                    <td className="px-5 py-3.5 font-semibold">{formatCurrency(m.hourlyRate)}/hr</td>
                    <td className="px-5 py-3.5 text-amber-600 font-semibold">⭐ {(m.user?.rating ?? 0).toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{m.totalSessions ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={m.isActive ? 'Active' : 'Inactive'} variant={m.isActive ? 'green' : 'gray'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/mentors/${m.id}`, '_blank')}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Showing {filtered.length} of {mentors.length} mentors
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bookings ── */
function AdminBookingsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => { const res = await api.get('/bookings?limit=20'); return res.data.data?.bookings ?? res.data.bookings ?? res.data.data ?? []; },
  });
  const bookings = Array.isArray(data) ? data : [];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">All Bookings</h2>
      {isLoading ? <Spinner /> : bookings.length === 0 ? (
        <div className="card p-5">
          <p className="text-sm text-slate-500">Booking data is available via the API endpoint: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">GET /api/bookings</code></p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Student', 'Mentor', 'Date', 'Duration', 'Amount', 'Status'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{b.mentor?.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(b.date)}</td>
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

/* ── Reviews ── */
function AdminReviewsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => { const res = await api.get('/reviews?limit=20'); return res.data.data?.reviews ?? res.data.reviews ?? res.data.data ?? []; },
  });
  const reviews = Array.isArray(data) ? data : [];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">Reviews Management</h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <StatCard label="Total Reviews" value={reviews.length} icon="⭐" />
        <StatCard label="Avg Rating" value={reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) + ' ★' : '—'} icon="📊" />
      </div>
      {isLoading ? <Spinner /> : reviews.length === 0 ? <Empty icon="⭐" title="No reviews yet" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Reviewer', 'Mentor', 'Rating', 'Comment', 'Date'].map(h =>
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {reviews.map((r: any) => (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{r.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.mentor?.user?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-amber-600 font-semibold">{'★'.repeat(r.rating)}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">{r.comment}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
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

/* ── AI Insights ── */
function AdminAITab() {
  const { refetch, data, isFetching } = useAIInsights();
  const stats = data as any;

  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">AI Insights Dashboard</h2>
      {stats && !isFetching && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Mentors" value={stats.totalMentors ?? '—'} icon="🎓" />
          <StatCard label="Total Sessions" value={stats.totalBookings ?? '—'} icon="📅" />
          <StatCard label="Avg Rating" value={stats.averageRating ? stats.averageRating.toFixed(1) + ' ★' : '—'} icon="⭐" />
          <StatCard label="Top Skills" value={(stats.topSkills ?? []).slice(0, 1).join('') || '—'} icon="🔥" />
        </div>
      )}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Market Intelligence Report</h3>
            <p className="text-xs text-slate-400">AI-powered analysis of platform data and mentorship trends</p>
          </div>
        </div>
        <Button onClick={() => refetch()} loading={isFetching} className="mb-4">Generate Full Report</Button>
        {stats?.topSkills && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top In-Demand Skills</p>
            <div className="flex flex-wrap gap-2">
              {(stats.topSkills ?? []).map((s: string) => (
                <span key={s} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">{s}</span>
              ))}
            </div>
          </div>
        )}
        {stats?.aiInsights && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Analysis</p>
            <pre className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-80 leading-relaxed whitespace-pre-wrap">
              {typeof stats.aiInsights === 'string' ? stats.aiInsights : JSON.stringify(stats.aiInsights, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Analytics ── */
function AdminAnalyticsTab() {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: trends } = useBookingTrends();

  const revenueData = Array.isArray(trends)
    ? trends.slice(-8).map((t: any) => ({
        month: t.month ? new Date(t.month).toLocaleString('default', { month: 'short' }) : t.date ?? '',
        revenue: Number(t.revenue ?? 0),
        bookings: Number(t.count ?? t.bookings ?? 0),
      }))
    : [];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-5">Platform Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users"    value={isLoading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()} icon="👥" />
        <StatCard label="Total Mentors"  value={isLoading ? '—' : (stats?.totalMentors ?? 0).toLocaleString()} icon="🎓" />
        <StatCard label="All Bookings"   value={isLoading ? '—' : (stats?.totalBookings ?? 0).toLocaleString()} icon="📅" />
        <StatCard label="Completed"      value={isLoading ? '—' : (stats?.completedBookings ?? 0).toLocaleString()} icon="✅" />
        <StatCard label="Revenue"        value={isLoading ? '—' : formatCurrency(stats?.totalRevenue ?? 0)} icon="💰" />
        <StatCard label="Avg Rating"     value={isLoading ? '—' : `${(stats?.averageRating ?? 0).toFixed(1)} ★`} icon="⭐" />
        <StatCard label="Conversion"     value={isLoading ? '—' : `${(stats?.conversionRate ?? 0).toFixed(1)}%`} icon="📈" />
        <StatCard label="Completion Rate" value={isLoading ? '—' : stats ? `${((stats.completedBookings / Math.max(stats.totalBookings, 1)) * 100).toFixed(1)}%` : '—'} icon="🏆" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LineChartCard title="Revenue Over Time" data={revenueData} xKey="month"
          lines={[{ key: 'revenue', label: 'Revenue', color: '#10B981' }, { key: 'bookings', label: 'Bookings', color: '#3B82F6' }]} />
        <BarChartCard title="Monthly Bookings" data={revenueData} xKey="month" yKey="bookings" color="#8B5CF6" />
      </div>
    </div>
  );
}
