'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMentor } from '@/hooks/useMentors';
import { useMentorReviews } from '@/hooks/useReviews';
import { BookingModal } from '@/components/booking/BookingModal';
import { Button, Badge, Stars, Empty, Spinner, Skeleton } from '@/components/ui';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { MapPin, Clock, Star, BookOpen, CheckCircle, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: mentor, isLoading, error } = useMentor(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useMentorReviews(id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const reviews = reviewsData?.reviews ?? reviewsData?.data ?? (Array.isArray(reviewsData) ? reviewsData : []);
  const reviewPagination = reviewsData?.pagination;

  if (isLoading) return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 flex gap-5">
              <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div><Skeleton className="h-80 rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );

  if (error || !mentor) return (
    <div className="pt-[68px] min-h-screen flex items-center justify-center">
      <Empty icon="⚠️" title="Mentor not found" description="This mentor profile doesn't exist or has been removed."
        action={<Link href="/mentors"><Button variant="primary">Browse Mentors</Button></Link>} />
    </div>
  );

  const user = mentor.user;

  return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/mentors" className="hover:text-blue-600 transition-colors">Mentors</Link>
          <ChevronRight size={14} />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{user?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header */}
            <div className="card p-6">
              <div className="flex items-start gap-5 flex-wrap">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : getInitials(user?.name ?? 'M')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
                      <p className="text-slate-500 text-sm mt-0.5">
                        {mentor.title}{mentor.company ? ` @ ${mentor.company}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Stars rating={user?.rating ?? 0} />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{(user?.rating ?? 0).toFixed(1)}</span>
                      <span className="text-sm text-slate-400">({user?.totalReviews ?? 0} reviews)</span>
                    </div>
                    <Badge label="✓ Verified" variant="green" />
                    {mentor.experience >= 5 && <Badge label="Top Mentor" variant="purple" />}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><BookOpen size={13} />{mentor.totalSessions} sessions</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} />{mentor.experience}+ years experience</span>
                    {mentor.company && <span className="flex items-center gap-1.5"><MapPin size={13} />{mentor.company}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-3">About</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {user?.bio ?? 'Experienced mentor dedicated to helping others achieve their career goals through structured guidance and real-world insights.'}
              </p>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.skills?.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl">
                    {skill}
                  </span>
                ))}
              </div>
              {user?.expertise && user.expertise.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Additional Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((e) => (
                      <span key={e} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-xl">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Sessions', value: mentor.totalSessions, icon: '📅' },
                { label: 'Rating', value: `${(user?.rating ?? 0).toFixed(1)} ★`, icon: '⭐' },
                { label: 'Experience', value: `${mentor.experience}y`, icon: '💼' },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-display font-bold text-xl text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Flexible scheduling (book 24hrs ahead)',
                  'Video call with screen sharing',
                  'AI-generated session summary',
                  'Action items & resource list',
                  'Direct messaging access',
                  'Money-back guarantee',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Reviews <span className="text-slate-400 font-normal">({user?.totalReviews ?? 0})</span>
                </h2>
                {(user?.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{(user?.rating ?? 0).toFixed(1)}</span>
                  </div>
                )}
              </div>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : reviews.length === 0 ? (
                <Empty icon="⭐" title="No reviews yet" description="Be the first to review this mentor after your session!" />
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(review.user?.name ?? 'U')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{review.user?.name ?? 'Anonymous'}</span>
                            <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(review.createdAt)}</span>
                          </div>
                          <Stars rating={review.rating} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                  {reviewPagination && reviewPagination.pages > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {Array.from({ length: reviewPagination.pages }, (_, i) => (
                        <button key={i + 1} onClick={() => setReviewPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${reviewPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column — booking card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-5">
                <div className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(mentor.hourlyRate)}
                </div>
                <p className="text-slate-400 text-sm">per hour</p>
              </div>

              <div className="space-y-2.5 mb-5">
                {[
                  'Flexible scheduling',
                  'Video call + screen share',
                  'AI session summary',
                  'Money-back guarantee',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Button className="w-full mb-3" size="lg" onClick={() => setBookingOpen(true)}>
                Book a Session
              </Button>
              <Button variant="outline" className="w-full" size="lg" icon={<MessageCircle size={16} />}
                onClick={() => toast.success('Messaging — connect Socket.IO for real-time chat')}>
                Send Message
              </Button>

              <p className="text-center text-xs text-slate-400 mt-4">🔒 Secure payment · Cancel anytime</p>

              {/* Mentor quick stats */}
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Response time</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">~2 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sessions completed</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{mentor.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Member since</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(mentor.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mentor && <BookingModal mentor={mentor} open={bookingOpen} onClose={() => setBookingOpen(false)} />}
    </div>
  );
}
