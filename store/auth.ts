
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('mh_token', token);
        localStorage.setItem('mh_refresh', refreshToken);
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem('mh_token');
        localStorage.removeItem('mh_refresh');
        set({ user: null, token: null });
      },

      refreshUser: async () => {
        try {
          const res = await api.get('/auth/me');
          const user = res.data.data || res.data;
          set({ user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'mh_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
