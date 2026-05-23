'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mentor } from '@/types';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';
import { useCreateBooking } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  duration: z.string(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface BookingModalProps { mentor: Mentor; open: boolean; onClose: () => void; }

export function BookingModal({ mentor, open, onClose }: BookingModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { mutate, isPending } = useCreateBooking();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration: '60' },
  });

  const duration = parseInt(watch('duration') || '60');
  const cost = (mentor.hourlyRate * duration) / 60;

  const onSubmit = (data: FormData) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    mutate({
      mentorId: mentor.id,
      // Backend expects `scheduledAt`, not `date`
      scheduledAt: new Date(data.date).toISOString(),
      duration: parseInt(data.duration),
      notes: data.notes,
    }, { onSuccess: onClose });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <Modal open={open} onClose={onClose} title="Book a Session">
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {(mentor.user?.name ?? 'M').split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-white">{mentor.user?.name}</p>
          <p className="text-xs text-slate-500">{mentor.title}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display font-bold text-lg text-slate-900 dark:text-white">{formatCurrency(mentor.hourlyRate)}</p>
          <p className="text-xs text-slate-400">per hour</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label="Date & Time" type="datetime-local" min={minDate} error={errors.date?.message} {...register('date')} />

        <Select label="Session Duration" options={[
          { value: '30', label: `30 min — ${formatCurrency(mentor.hourlyRate * 0.5)}` },
          { value: '60', label: `60 min — ${formatCurrency(mentor.hourlyRate)}` },
          { value: '90', label: `90 min — ${formatCurrency(mentor.hourlyRate * 1.5)}` },
          { value: '120', label: `120 min — ${formatCurrency(mentor.hourlyRate * 2)}` },
        ]} {...register('duration')} />

        <Textarea label="Notes for mentor (optional)" placeholder="What would you like to focus on?" {...register('notes')} />

        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Cost</span>
          <span className="font-display font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(cost)}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isPending}>
            {isAuthenticated ? 'Confirm Booking' : 'Log in to Book'}
          </Button>
        </div>
        <p className="text-center text-xs text-slate-400">🔒 Secure payment · Money-back guarantee</p>
      </form>
    </Modal>
  );
}
