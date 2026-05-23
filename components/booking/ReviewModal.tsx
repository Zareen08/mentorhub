'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, Textarea } from '@/components/ui';
import { useCreateReview } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

const schema = z.object({ comment: z.string().min(10, 'Please write at least 10 characters') });
type FormData = z.infer<typeof schema>;

interface ReviewModalProps { bookingId: string; mentorName: string; open: boolean; onClose: () => void; }

export function ReviewModal({ bookingId, mentorName, open, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const { mutate, isPending } = useCreateReview();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    mutate({ bookingId, rating, comment: data.comment }, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Review session with ${mentorName}`}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}
                className={cn('text-3xl transition-transform hover:scale-110', s <= (hovered || rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700')}>
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</p>
        </div>
        <Textarea label="Your Review" placeholder="Share your experience with this mentor — what did you learn? What was most helpful?" error={errors.comment?.message} {...register('comment')} />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isPending}>Submit Review</Button>
        </div>
      </form>
    </Modal>
  );
}
