'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePlatformStats } from '@/hooks/useAnalytics';
import { useTopMentors } from '@/hooks/useMentors';
import { useAIMatch } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';
import { MentorCard, MentorCardSkeleton } from '@/components/mentor/MentorCard';
import { Button } from '@/components/ui';
import { Search, ArrowRight, Star, Users, BookOpen, Zap, Brain, MessageSquare, TrendingUp, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [aiGoal, setAiGoal] = useState('');
  const [aiBudget, setAiBudget] = useState('');
  const [aiResults, setAiResults] = useState<string>('');
  const { data: stats } = usePlatformStats();
  const { data: topMentors, isLoading: mentorsLoading } = useTopMentors();
  const { mutate: aiMatch, isPending: aiLoading } = useAIMatch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/mentors?search=${encodeURIComponent(search)}`);
  };

  const handleAIMatch = () => {
    if (!aiGoal) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    aiMatch({ goal: aiGoal, budget: aiBudget ? parseFloat(aiBudget) : undefined }, {
      onSuccess: (data) => {
        const arr = Array.isArray(data) ? data : [];
        setAiResults(arr.length
          ? arr.map((m, i) => `${i + 1}. Score: ${((m.score ?? 0) * 100).toFixed(0)}%\n${m.reason ?? ''}\n${m.expectedImprovement ?? ''}`).join('\n\n')
          : 'Browse our mentor list to find your perfect match!');
      },
      onError: () => setAiResults('AI matching temporarily unavailable. Browse mentors to find your match!'),
    });
  };

  return (
    <div className="pt-[68px]">
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-blue-300 font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              AI-Powered · {stats?.totalMentors ?? 500}+ Expert Mentors
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Find the{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">right mentor</span>
              {' '}to<br />accelerate your growth
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed animate-fade-up-2">
              MentorHub connects ambitious learners with world-class experts. Our AI finds your perfect match in seconds.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-lg mb-6 animate-fade-up-3 backdrop-blur-sm">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by skill, topic, or name…"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none" />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-10 animate-fade-up-4">
              {['React', 'Product Management', 'Python', 'UI/UX', 'AWS', 'Data Science'].map((skill) => (
                <Link key={skill} href={`/mentors?skill=${skill}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:border-white/20 transition-colors">
                  {skill}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-8 animate-fade-up-4">
              {[
                { n: `${stats?.totalMentors ?? 500}+`, l: 'Expert Mentors' },
                { n: `${stats?.completedBookings ?? 12000}+`, l: 'Sessions Done' },
                { n: `${(stats?.averageRating ?? 4.9).toFixed(1)}★`, l: 'Avg Rating' },
                { n: `${stats?.totalUsers ?? 8000}+`, l: 'Happy Learners' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-white">{s.n}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="bg-blue-600 py-3.5 overflow-hidden">
        <div className="flex gap-12 animate-[ticker_25s_linear_infinite] whitespace-nowrap w-max">
          {Array(2).fill([
            `${stats?.totalMentors ?? 500}+ Expert Mentors`,
            '🌍 50+ Countries',
            '⚡ AI-Powered Matching',
            '⭐ 4.9/5 Satisfaction',
            '📅 Flexible Scheduling',
            '🔒 Secure Payments',
            '🚀 Career Acceleration',
          ]).flat().map((item, i) => (
            <span key={i} className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-300 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured Mentors ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label">Top Picks</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Featured Mentors</h2>
          </div>
          <Link href="/mentors" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Browse All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentorsLoading
            ? Array(3).fill(0).map((_, i) => <MentorCardSkeleton key={i} />)
            : (topMentors ?? []).slice(0, 3).map((m) => <MentorCard key={m.id} mentor={m} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="section-label">Simple Process</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">How MentorHub Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-400 to-violet-400" />
            {[
              { n: '01', icon: '🔍', title: 'Find Your Match', desc: 'Browse 500+ vetted mentors or let AI recommend the best ones for your specific goals and budget.' },
              { n: '02', icon: '📅', title: 'Book a Session', desc: 'Choose a time that works. All sessions include video call, screen sharing, and a shared workspace.' },
              { n: '03', icon: '🚀', title: 'Grow Your Career', desc: 'Attend sessions, get personalized guidance, and track progress with AI-generated summaries.' },
            ].map((step) => (
              <div key={step.n} className="relative text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-5 shadow-lg shadow-blue-500/25 relative z-10">
                  {step.n}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ── */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label text-blue-400">AI-Powered Platform</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-5">Smarter mentorship through AI</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Our AI analyzes your goals, learning style, and history to continuously improve your mentorship experience.</p>
              <div className="space-y-3">
                {[
                  { icon: <Brain size={20} />, title: 'Smart Mentor Matching', desc: 'AI scores mentors based on your specific goals, budget, and learning preferences.' },
                  { icon: <MessageSquare size={20} />, title: 'AI Chat Assistant', desc: '24/7 guidance on career questions, session prep, and platform features.' },
                  { icon: <TrendingUp size={20} />, title: 'Market Insights', desc: 'AI-powered analytics on skill demand, career trends, and platform health.' },
                  { icon: <FileText size={20} />, title: 'Session Summaries', desc: 'Auto-generated action items, resources, and next steps after every session.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors">
                    <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">{f.icon}</div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-0.5">{f.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">✨ Try AI Mentor Matcher</p>
              <div className="space-y-3 mb-4">
                <input value={aiGoal} onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="What's your learning goal? e.g. 'Master React in 3 months'"
                  className="w-full px-4 py-3 bg-slate-500 border border-white/15 rounded-xl text-white placeholder-slate-200 text-sm outline-none focus:border-blue-500 transition-colors" />
                <input value={aiBudget} onChange={(e) => setAiBudget(e.target.value)} type="number"
                  placeholder="Budget per hour (optional, e.g. 80)"
                  className="w-full px-4 py-3 bg-slate-500 border border-white/15 rounded-xl text-white placeholder-slate-200 text-sm outline-none focus:border-blue-500 transition-colors" />
                <button onClick={handleAIMatch} disabled={aiLoading || !aiGoal}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {aiLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding matches…</>
                  ) : (<><Zap size={16} />Find My Best Match</>)}
                </button>
              </div>
              <div className="min-h-[80px] p-4 bg-white/4 border border-white/8 rounded-xl">
                {aiResults ? (
                  <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiResults}</pre>
                ) : (
                  <p className="text-xs text-slate-500 text-center pt-4">Your AI-matched mentor recommendations will appear here…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Success Stories</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">What our learners say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { text: "MentorHub's AI matched me with the perfect React mentor. Within 8 weeks I landed my first dev job. The session summaries kept me on track.", name: 'Sarah Rahman', role: 'Software Engineer at Shopify', initials: 'SR', color: 'from-blue-500 to-cyan-500' },
            { text: "As a mentor, the platform is seamless. The AI insights help me understand what my mentees need before sessions even start.", name: 'Marcus Kim', role: 'Senior Engineer, Stripe', initials: 'MK', color: 'from-green-500 to-emerald-500' },
            { text: "I transitioned from marketing to product management in 4 months. My mentor's guidance and the AI summaries made all the difference.", name: 'Lena Park', role: 'Product Manager at Notion', initials: 'LP', color: 'from-amber-500 to-orange-500' },
          ].map((t) => (
            <div key={t.name} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-0.5 mb-4">
                {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-violet-700 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Ready to accelerate your growth?</h2>
          <p className="text-blue-100 mb-8">Join {stats?.totalUsers?.toLocaleString() ?? '8,000'}+ learners already growing with MentorHub.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard/user" className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5 text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/register" className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5 text-sm">
                Get Started Free
              </Link>
            )}
            <Link href="/mentors" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm">
              Browse Mentors
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-display font-bold text-white mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm">🎓</div>
                MentorHub
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">AI-powered mentorship connecting ambitious learners with world-class experts.</p>
            </div>
            {[
              { title: 'For Learners', links: [{ href: '/mentors', label: 'Find Mentors' }, { href: '/auth/register', label: 'Get Started' }, { href: '/bookings', label: 'My Sessions' }] },
              { title: 'For Mentors', links: [{ href: '/dashboard/mentor', label: 'Mentor Dashboard' }, { href: '/dashboard/mentor', label: 'Create Profile' }] },
              { title: 'Company', links: [{ href: '/about', label: 'About' }, { href: '/blog', label: 'Blog' }, { href: '/contact', label: 'Contact' }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">{col.title}</p>
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href} className="block text-xs text-slate-500 hover:text-slate-300 mb-2 transition-colors">{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-wrap justify-between gap-4 items-center">
            <p className="text-xs text-slate-600">© 2025 MentorHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
