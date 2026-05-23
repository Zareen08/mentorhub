'use client';
import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your MentorHub AI assistant 👋 I can help you find the right mentor, answer questions about sessions, or give career advice. What's on your mind?" }
  ]);
  const { isAuthenticated } = useAuth();
  const { mutate, isPending } = useAIChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = () => {
    const msg = input.trim();
    if (!msg || isPending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    if (!isAuthenticated) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Please log in to use the AI assistant! 🔐' }]);
      return;
    }

    mutate({ message: msg }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      },
      onError: () => {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
      }
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🤖</div>
            <div>
              <p className="font-display font-bold text-white text-sm">MentorHub AI</p>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm')}>
                  {m.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              className="flex-1 px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all" />
            <button onClick={send} disabled={isPending || !input.trim()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
