import Link from 'next/link';
export const metadata = { title: 'Blog — MentorHub' };

const POSTS = [
  { emoji: '🤖', tag: 'AI & Technology', title: 'How AI is Revolutionizing the Mentorship Industry in 2025', date: 'May 15, 2025', read: '8 min' },
  { emoji: '💡', tag: 'Mentorship Tips', title: '10 Proven Strategies to Get the Most from Your Mentor', date: 'May 10, 2025', read: '12 min' },
  { emoji: '🎯', tag: 'Career Growth', title: 'How to Write a Project Brief That Attracts Top Mentors', date: 'May 8, 2025', read: '6 min' },
  { emoji: '🌐', tag: 'Remote Work', title: 'Best Practices for Effective Online Mentorship Sessions', date: 'Apr 28, 2025', read: '9 min' },
  { emoji: '📊', tag: 'Data & Trends', title: 'MentorHub 2025 Report: The State of Professional Mentorship', date: 'Apr 22, 2025', read: '15 min' },
  { emoji: '🚀', tag: 'Success Story', title: "From Bootcamp to Big Tech: One Developer's MentorHub Journey", date: 'Apr 18, 2025', read: '7 min' },
];

export default function BlogPage() {
  return (
    <div className="pt-[68px] min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-20 px-4 text-center">
        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">MentorHub Blog</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Insights & Resources</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">Career advice, mentorship tips, and platform updates from the MentorHub team.</p>
      </div>
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <div key={post.title} className="card-hover cursor-pointer group">
              <div className="p-6">
                <div className="text-4xl mb-4">{post.emoji}</div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{post.tag}</p>
                <h3 className="font-display font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="text-xs text-slate-400">{post.date} · {post.read} read</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
