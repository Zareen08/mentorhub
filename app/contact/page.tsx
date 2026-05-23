'use client';
import toast from 'react-hot-toast';
export default function ContactPage() {
  return (
    <div className="pt-[68px] min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-20 px-4 text-center">
        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">We'd love to hear from you</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">Our team typically responds within a few hours on business days.</p>
      </div>
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Send a message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! We'll reply within 24 hours."); }}>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First name</label><input className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="John" required /></div>
                <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last name</label><input className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Smith" required /></div>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label><input type="email" className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="you@example.com" required /></div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                <select className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-all">
                  <option>General Inquiry</option><option>Technical Support</option><option>Billing</option><option>Partnership</option>
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label><textarea rows={5} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="How can we help?" required /></div>
              <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">Send Message</button>
            </form>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact details</h2>
            <div className="space-y-5">
              {[['📧','Email','support@mentorhub.io\npartnerships@mentorhub.io'],['📞','Phone','+1 (800) 555-MENTOR\nMon–Fri, 9am–6pm PST'],['📍','Office','340 Pine Street, Suite 800\nSan Francisco, CA 94104'],['💬','Live Chat','24/7 via the chat widget\n~5 minute response time']].map(([icon,label,value]) => (
                <div key={label as string} className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{label as string}</p>
                    <p className="text-sm text-slate-500 whitespace-pre-line">{value as string}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-slate-700 dark:text-slate-300">💡 For fastest support, use the <strong>AI Chat Assistant</strong> — resolves most issues instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
