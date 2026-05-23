'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { ReviewModal } from '@/components/booking/ReviewModal';
import { Badge, Empty, Spinner, Button, Tabs } from '@/components/ui';
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; mentorName: string } | null>(null);
  const { data: bookings = [], isLoading } = useMyBookings();
  const { mutate: cancel } = useCancelBooking();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);
  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length },
  ];

  return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Track all your mentorship sessions</p>
        </div>
        <Tabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="📅" title="No bookings found"
            action={<Button onClick={() => router.push('/mentors')}>Browse Mentors</Button>} />
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
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
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
                            <Button size="sm" variant="secondary" onClick={() => setReviewModal({ bookingId: b.id, mentorName: b.mentor?.user?.name ?? 'Mentor' })}>
                              Review
                            </Button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <Button size="sm" variant="danger" onClick={() => { if (confirm('Cancel?')) cancel(b.id); }}>
                              Cancel
                            </Button>
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
      {reviewModal && (
        <ReviewModal bookingId={reviewModal.bookingId} mentorName={reviewModal.mentorName}
          open={!!reviewModal} onClose={() => setReviewModal(null)} />
      )}
    </div>
  );
}
