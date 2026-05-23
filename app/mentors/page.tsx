import { Suspense } from 'react';
import MentorsContent from './MentorsContent';

export default function MentorsPage() {
  return (
    <Suspense fallback={
      <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading mentors…</p>
        </div>
      </div>
    }>
      <MentorsContent />
    </Suspense>
  );
}
