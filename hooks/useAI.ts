'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { AIRecommendation, AIMatch, AISentiment } from '@/types';
import toast from 'react-hot-toast';

export function useAIRecommendations() {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const res = await api.get('/ai/recommendations');
      const data = res.data.data || res.data;
      return (data.recommendations || data) as AIRecommendation[];
    },
    enabled: false,
    retry: false,
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: async (data: { message: string; context?: string }) => {
      const res = await api.post('/ai/chat', data);
      return (res.data.data || res.data) as { response: string };
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAIMatch() {
  return useMutation({
    mutationFn: async (data: { goal: string; budget?: number }) => {
      const res = await api.post('/ai/match', data);
      const d = res.data.data || res.data;
      return (d.matches || d) as AIMatch[];
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const res = await api.get('/ai/insights');
      return res.data.data || res.data;
    },
    enabled: false,
    retry: false,
  });
}

export function useAISentiment() {
  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const res = await api.post('/ai/sentiment', data);
      return (res.data.data || res.data) as AISentiment;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAISummary(bookingId: string) {
  return useQuery({
    queryKey: ['ai-summary', bookingId],
    queryFn: async () => {
      const res = await api.get(`/ai/summary/${bookingId}`);
      return res.data.data || res.data;
    },
    enabled: false,
  });
}
