'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export function useMyBookings(status?: string) {
  return useQuery({
    queryKey: ['my-bookings', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const res = await api.get(`/bookings/my-bookings${params}`);
      return (res.data.data || res.data) as Booking[];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mentorId: string; scheduledAt: string; duration: number; notes?: string }) => {
      const res = await api.post('/bookings', data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      toast.success('Session booked successfully! 🎉');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/bookings/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking cancelled');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
