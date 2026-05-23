'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { Input, Button, Badge } from '@/components/ui';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const profileSchema = z.object({ name: z.string().min(2), bio: z.string().optional() });
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, token } = useAuth();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? '', bio: user?.bio ?? '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: { name: string; bio?: string }) => {
    try {
      const res = await api.put('/users/profile', data);
      const updated = res.data.data || res.data;
      setAuth({ ...user!, ...updated }, token!, localStorage.getItem('mh_refresh') ?? '');
      toast.success('Profile updated!');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const onPasswordSubmit = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated!');
      passwordForm.reset();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  if (!user) return null;

  return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>

        {/* Avatar section */}
        <div className="card p-6 flex items-center gap-5 mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold font-display flex-shrink-0 shadow-lg">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-slate-400 text-sm mb-2">{user.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge label={user.role} variant={user.role === 'ADMIN' ? 'red' : user.role === 'MENTOR' ? 'green' : 'blue'} />
              {user.isVerified && <Badge label="✓ Verified" variant="green" />}
              <span className="text-xs text-slate-400">Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="card p-6 mb-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Personal Information</h3>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate className="space-y-4">
            <Input label="Full Name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input value={user.email} disabled className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
              <textarea className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-y min-h-24 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Tell mentors about yourself…" {...profileForm.register('bio')} />
            </div>
            <Button type="submit" loading={profileForm.formState.isSubmitting}>Save Changes</Button>
          </form>
        </div>

        {/* Password form */}
        <div className="card p-6 mb-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••"
              error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="New Password" type="password" placeholder="Min 6 characters"
                error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
              <Input label="Confirm New Password" type="password" placeholder="Repeat password"
                error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            </div>
            <Button type="submit" variant="secondary" loading={passwordForm.formState.isSubmitting}>Update Password</Button>
          </form>
        </div>

        {/* Stats */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Account Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Rating', value: user.rating ? `${user.rating.toFixed(1)} ★` : 'No rating yet' },
              { label: 'Total Reviews', value: user.totalReviews ?? 0 },
              { label: 'Account Status', value: user.isVerified ? '✅ Verified' : '⏳ Pending' },
              { label: 'Member Since', value: formatDate(user.createdAt) },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
