'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { Mentor, MentorFilters } from '@/types';
import toast from 'react-hot-toast';

export function useMentors(filters: MentorFilters = {}) {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Map frontend field names → backend field names
      if (filters.search)   params.set('searchTerm', filters.search);
      if (filters.skill)    params.set('skill', filters.skill);
      if (filters.minRate)  params.set('minRate', String(filters.minRate));
      if (filters.maxRate)  params.set('maxRate', String(filters.maxRate));
      if (filters.page)     params.set('page', String(filters.page));
      if (filters.limit)    params.set('limit', String(filters.limit));

      // Map sort values: frontend 'rating' → backend 'averageRating'
      const sortMap: Record<string, string> = {
        rating:      'averageRating',
        price_asc:   'hourlyRate',
        price_desc:  'hourlyRate',
        experience:  'experience',
        createdAt:   'createdAt',
      };
      if (filters.sortBy) {
        params.set('sortBy', sortMap[filters.sortBy] ?? filters.sortBy);
        // price_asc = asc, everything else = desc
        params.set('sortOrder', filters.sortBy === 'price_asc' ? 'asc' : 'desc');
      }

      const res = await api.get(`/mentors?${params}`);
      // Backend returns { data: [], meta: {} } — normalise for MentorsContent
      const raw = res.data.data || res.data;
      if (raw && typeof raw === 'object' && 'data' in raw) {
        // { data: Mentor[], meta: { total, pages, ... } }
        return {
          mentors: raw.data,
          pagination: {
            total: raw.meta?.total ?? 0,
            pages: raw.meta?.totalPages ?? 1,
            page:  raw.meta?.page ?? 1,
          },
        };
      }
      // Fallback — plain array
      return { mentors: Array.isArray(raw) ? raw : [], pagination: null };
    },
    staleTime: 30_000,
  });
}

export function useMentor(id: string) {
  return useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      const res = await api.get(`/mentors/${id}`);
      return (res.data.data || res.data) as Mentor;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useTopMentors() {
  return useQuery({
    queryKey: ['top-mentors'],
    queryFn: async () => {
      const res = await api.get('/analytics/top-mentors');
      return (res.data.data || res.data) as Mentor[];
    },
    staleTime: 120_000,
  });
}

export function useCreateMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string; company?: string; experience: number;
      hourlyRate: number; skills: string[]; availability: string[];
    }) => {
      const res = await api.post('/mentors', data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      toast.success('Mentor profile created!');
      qc.invalidateQueries({ queryKey: ['mentors'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Mentor>) => {
      const res = await api.put(`/mentors/${id}`, data);
      return res.data.data || res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Mentor profile updated!');
      qc.invalidateQueries({ queryKey: ['mentor', vars.id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useMentorStats(mentorId: string) {
  return useQuery({
    queryKey: ['mentor-stats', mentorId],
    queryFn: async () => {
      const res = await api.get(`/mentors/${mentorId}/stats`);
      return res.data.data || res.data;
    },
    enabled: !!mentorId,
  });
}
