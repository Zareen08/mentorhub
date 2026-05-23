import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mh_token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('mh_refresh');
        if (refresh) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
          const { accessToken, refreshToken: newRefresh } = res.data.data || res.data;
          localStorage.setItem('mh_token', accessToken);
          if (newRefresh) localStorage.setItem('mh_refresh', newRefresh);
          if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('mh_token');
        localStorage.removeItem('mh_refresh');
        localStorage.removeItem('mh_user');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong';
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
