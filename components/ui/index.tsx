'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

/* ── Button ── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all font-display disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25',
    outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ── Input ── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
          <input ref={ref} id={inputId} className={cn('w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all',
            error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            icon && 'pl-9', className)} {...props} />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ── Textarea ── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
        <textarea ref={ref} id={inputId} className={cn('w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all resize-y min-h-24',
          error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className)} {...props} />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ── Select ── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
        <select ref={ref} id={inputId} className={cn('w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white outline-none transition-all cursor-pointer appearance-none',
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className)} {...props}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

/* ── Badge ── */
interface BadgeProps { label: string; variant?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray'; className?: string; }
export function Badge({ label, variant = 'blue', className }: BadgeProps) {
  const v = { blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold', v[variant], className)}>{label}</span>;
}

/* ── Skeleton ── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

/* ── Card ── */
export function Card({ children, className, hover }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return <div className={cn(hover ? 'card-hover' : 'card', 'p-6', className)}>{children}</div>;
}

/* ── Stat card ── */
export function StatCard({ label, value, change, icon, color = 'blue' }: { label: string; value: string | number; change?: string; icon: string; color?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {change && <p className={cn('text-xs font-semibold mt-1', change.startsWith('+') ? 'text-green-600' : 'text-slate-400')}>{change}</p>}
    </div>
  );
}

/* ── Stars ── */
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={cn('text-sm', i < Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700')}>★</span>
      ))}
    </div>
  );
}

/* ── Empty state ── */
export function Empty({ icon = '📭', title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={cn('animate-spin text-blue-600', s[size])} />
    </div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Tab ── */
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap flex items-center gap-2',
            active === t.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300')}>
          {t.label}
          {t.count !== undefined && (
            <span className={cn('px-1.5 py-0.5 rounded-full text-xs font-bold', active === t.key ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
