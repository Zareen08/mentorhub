'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button } from '@/components/ui';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const res = await api.post('/auth/login', data);
      const r = res.data.data || res.data;
      setAuth(r.user, r.accessToken, r.refreshToken);
      toast.success(`Welcome back, ${r.user.name}! 👋`);
      if (r.user.role === 'ADMIN' || r.user.role === 'SUPER_ADMIN') router.push('/dashboard/admin');
      else if (r.user.role === 'MENTOR') router.push('/dashboard/mentor');
      else router.push('/dashboard/user');
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  const fillUser = () => { setValue('email', 'user@mentorhub.com', { shouldValidate: true }); setValue('password', 'User123!', { shouldValidate: true }); toast('User credentials filled', { icon: '👤' }); };
  const fillMentor = () => { setValue('email', 'mentor@mentorhub.com', { shouldValidate: true }); setValue('password', 'Mentor123!', { shouldValidate: true }); toast('Mentor credentials filled', { icon: '🎓' }); };
  const fillAdmin = () => { setValue('email', 'admin@mentorhub.com', { shouldValidate: true }); setValue('password', 'Admin123!', { shouldValidate: true }); toast('Admin credentials filled', { icon: '🛡️' }); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-slate-900 dark:text-white">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">🎓</div>
            MentorHub
          </Link>
        </div>

        <div className="card p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to your MentorHub account</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <button type="button" onClick={fillUser} className="py-2 px-2 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">👤 User</button>
            <button type="button" onClick={fillMentor} className="py-2 px-2 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">🎓 Mentor</button>
            <button type="button" onClick={fillAdmin} className="py-2 px-2 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">🛡️ Admin</button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@example.com" icon={<Mail size={15} />} error={errors.email?.message} autoComplete="email" {...register('email')} />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}`}
                  {...register('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>
            {apiError && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"><span>⚠️</span>{apiError}</div>}
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>Sign In</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
