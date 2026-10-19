import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest!.headers!.Authorization = `Bearer ${token}`;
          return api(originalRequest!);
        });
      }

      originalRequest!._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        useAuthStore.getState().updateToken(newToken);
        processQueue(null, newToken);
        originalRequest!.headers!.Authorization = `Bearer ${newToken}`;
        return api(originalRequest!);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── API Helpers ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string } | Record<string, any>) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string } | Record<string, any>) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
};

export const userApi = {
  me: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.patch('/users/me', data),
  onboarding: (data: Record<string, unknown>) => api.post('/users/me/onboarding', data),
  getUser: (id: string) => api.get(`/users/${id}`),
  exportData: () => api.get('/users/me/export', { responseType: 'blob' }),
  deleteAccount: () => api.delete('/users/me/delete'),
};

export const catalogApi = {
  list: (params: Record<string, unknown>) => api.get('/catalog', { params }),
  detail: (id: string) => api.get(`/catalog/${id}`),
  featured: () => api.get('/catalog/featured'),
  stats: () => api.get('/catalog/stats'),
};

export const pathsApi = {
  list: (params?: Record<string, unknown>) => api.get('/paths', { params }),
  recommend: () => api.get('/paths/recommend'),
  detail: (id: string) => api.get(`/paths/${id}`),
  create: (data: Record<string, unknown>) => api.post('/paths', data),
};

export const enrollmentApi = {
  list: () => api.get('/enrollments'),
  enroll: (data: { courseId: string; pathId?: string }) => api.post('/enrollments', data),
  detail: (id: string) => api.get(`/enrollments/${id}`),
  drop: (id: string) => api.delete(`/enrollments/${id}`),
};

export const progressApi = {
  log: (data: Record<string, unknown>) => api.post('/progress', data),
  dashboard: () => api.get('/progress/dashboard'),
};

export const credentialsApi = {
  list: () => api.get('/credentials'),
  detail: (id: string) => api.get(`/credentials/${id}`),
  verify: (code: string) => api.get(`/credentials/verify/${code}`),
};

export const cohortsApi = {
  list: () => api.get('/cohorts'),
  create: (data: Record<string, unknown>) => api.post('/cohorts', data),
  detail: (id: string) => api.get(`/cohorts/${id}`),
  join: (code: string) => api.post(`/cohorts/join/${code}`),
  leaderboard: (id: string) => api.get(`/cohorts/${id}/leaderboard`),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params: Record<string, unknown>) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  deactivateUser: (id: string) => api.patch(`/admin/users/${id}/deactivate`),
  providers: () => api.get('/admin/providers'),
  syncProvider: (name: string) => api.post(`/admin/sync/${name}`),
  syncLogs: () => api.get('/admin/sync-logs'),
  institutions: () => api.get('/admin/institutions'),
  createInstitution: (data: Record<string, unknown>) => api.post('/admin/institutions', data),
};
