'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { Review } from '@/types';
import toast from 'react-hot-toast';

export function useMentorReviews(mentorId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['mentor-reviews', mentorId, page],
    queryFn: async () => {
      const res = await api.get(`/reviews/mentor/${mentorId}?page=${page}&limit=${limit}`);
      return res.data.data || res.data;
    },
    enabled: !!mentorId,
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews/my-reviews');
      return (res.data.data || res.data) as Review[];
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bookingId: string; rating: number; comment: string }) => {
      const res = await api.post('/reviews', data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      toast.success('Review submitted! Thank you 🌟');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['mentor-reviews'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
