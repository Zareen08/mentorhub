'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PlatformStats } from '@/types';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/platform');
      return (res.data.data || res.data) as PlatformStats;
    },
    staleTime: 300_000,
  });
}

export function useBookingTrends() {
  return useQuery({
    queryKey: ['booking-trends'],
    queryFn: async () => {
      const res = await api.get('/analytics/booking-trends');
      return res.data.data || res.data;
    },
    staleTime: 300_000,
  });
}

export function useMentorAnalytics(mentorId?: string) {
  return useQuery({
    queryKey: ['mentor-analytics', mentorId],
    queryFn: async () => {
      const url = mentorId ? `/analytics/mentor/${mentorId}` : '/analytics/mentor';
      const res = await api.get(url);
      return res.data.data || res.data;
    },
    enabled: true,
  });
}
