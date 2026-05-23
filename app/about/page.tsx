import Link from 'next/link';

export const metadata = { title: 'About — MentorHub' };

export default function AboutPage() {
  return (
    <div className="pt-[68px] min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-24 px-4 text-center">
        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Our Story</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Built for ambitious learners</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          We believe everyone deserves access to world-class mentorship. MentorHub removes every barrier between learners and the experts who can transform their careers.
        </p>
      </div>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">Democratizing mentorship for everyone</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Founded in 2022, MentorHub connects learners with top industry professionals across every field. Our AI-powered platform makes finding the perfect mentor faster, smarter, and more effective than ever.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We partner with mentors from the world's leading companies — Google, Stripe, Shopify, Notion, and more — to bring real-world expertise directly to you.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[['2022', 'Founded'], ['150+', 'Countries'], ['500+', 'Expert Mentors'], ['$8M', 'Raised']].map(([v, l]) => (
                <div key={l} className="card p-4">
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">{v}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/20 dark:to-violet-900/20 rounded-3xl h-80 flex items-center justify-center text-8xl">🌍</div>
        </div>

        {/* Team */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">The team behind MentorHub</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { name: 'Aisha Khan', role: 'CEO & Co-founder', color: 'from-blue-500 to-cyan-500' },
            { name: 'David Reyes', role: 'CTO & Co-founder', color: 'from-green-500 to-emerald-500' },
            { name: 'Sophie Park', role: 'Head of Product', color: 'from-violet-500 to-purple-500' },
            { name: 'James Moore', role: 'Head of AI', color: 'from-amber-500 to-orange-500' },
          ].map((m) => (
            <div key={m.name} className="text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xl font-bold font-display mx-auto mb-3 shadow-lg`}>
                {m.name.split(' ').map(w => w[0]).join('')}
              </div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-sm">{m.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">Join us on our mission</h2>
        <p className="text-slate-500 mb-6">Start learning with the world's best mentors today.</p>
        <Link href="/auth/register" className="inline-flex px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors hover:shadow-xl">
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
