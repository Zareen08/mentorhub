'use client';
import Link from 'next/link';
import { Mentor } from '@/types';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { Stars, Badge } from '@/components/ui';
import { Clock, BookOpen } from 'lucide-react';

export function MentorCard({ mentor }: { mentor: Mentor }) {
  const user = mentor.user;
  const skills = mentor.skills?.slice(0, 4) ?? [];

  return (
    <Link href={`/mentors/${mentor.id}`}>
      <div className="card-hover cursor-pointer group h-full flex flex-col">
        {/* Top */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg font-display shadow-md group-hover:shadow-blue-500/25 transition-shadow">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : getInitials(user?.name ?? 'M')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {mentor.title}{mentor.company ? ` @ ${mentor.company}` : ''}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Stars rating={user?.rating ?? 0} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {(user?.rating ?? 0).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">({user?.totalReviews ?? 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="px-5 pb-4 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
                {skill}
              </span>
            ))}
            {mentor.skills?.length > 4 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-lg">
                +{mentor.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />{mentor.totalSessions ?? 0} sessions
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />{mentor.experience}y exp
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 dark:text-white">
            {formatCurrency(mentor.hourlyRate)}
            <span className="text-xs font-normal text-slate-400">/hr</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        {[60, 80, 50, 70].map((w, i) => <div key={i} className={`skeleton h-5 rounded-lg`} style={{ width: `${w}px` }} />)}
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    </div>
  );
}
