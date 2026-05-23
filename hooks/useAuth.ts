'use client';
import { useAuthStore } from '@/store/auth';

export function useAuth() {
  const { user, token, setAuth, logout, refreshUser, isLoading } = useAuthStore();
  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    isMentor: user?.role === 'MENTOR' || user?.role === 'ADMIN',
    setAuth,
    logout,
    refreshUser,
    isLoading,
  };
}
