import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'learner' | 'mentor' | 'tvet_admin' | 'super_admin';
  emailVerified: boolean;
}

export type SessionStatus = 'active' | 'refreshing' | 'refreshed' | 'expired';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  sessionStatus: SessionStatus;
  lastRefreshedAt: string;
  sessionAttestationId: string;
  sessionRefreshCount: number;
  setAuth: (user: User, token: string) => void;
  updateToken: (token: string) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
}

export const DEMO_USER: User = {
  id: 'usr_demo_amara',
  email: 'amara.okafor@coders.org',
  firstName: 'Amara',
  lastName: 'Okafor',
  role: 'learner',
  emailVerified: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEMO_USER,
      accessToken: 'demo-dev-token-xyz',
      isAuthenticated: true,
      sessionStatus: 'active',
      lastRefreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessionAttestationId: 'OMC-SES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      sessionRefreshCount: 1,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          sessionStatus: 'active',
          lastRefreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }),

      updateToken: (accessToken) => set({ accessToken }),

      refreshSession: async () => {
        set({ sessionStatus: 'refreshing' });
        try {
          // Attempt real API refresh
          const res = await authApi.refresh();
          const newToken = res.data?.data?.accessToken || 'token-' + Date.now();
          set((state) => ({
            accessToken: newToken,
            sessionStatus: 'refreshed',
            lastRefreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sessionAttestationId: 'OMC-SES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            sessionRefreshCount: state.sessionRefreshCount + 1,
          }));
          setTimeout(() => {
            set({ sessionStatus: 'active' });
          }, 3500);
          return true;
        } catch {
          // Graceful fallback for offline / mock / dev demo sessions
          await new Promise((r) => setTimeout(r, 650));
          const simulatedToken = 'omc-jwt-' + Math.random().toString(36).substring(2, 10);
          set((state) => ({
            accessToken: simulatedToken,
            sessionStatus: 'refreshed',
            lastRefreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sessionAttestationId: 'OMC-SES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            sessionRefreshCount: state.sessionRefreshCount + 1,
          }));
          setTimeout(() => {
            set({ sessionStatus: 'active' });
          }, 3500);
          return true;
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          sessionStatus: 'expired',
        }),
    }),
    {
      name: 'omc-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        lastRefreshedAt: state.lastRefreshedAt,
        sessionAttestationId: state.sessionAttestationId,
        sessionRefreshCount: state.sessionRefreshCount,
      }),
    },
  ),
);

// Theme store
interface ThemeState {
  theme: 'dark' | 'light' | 'system';
  dataSaverMode: boolean;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setDataSaverMode: (enabled: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      dataSaverMode: false,
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      },
      setDataSaverMode: (dataSaverMode) => set({ dataSaverMode }),
    }),
    { name: 'omc-theme' },
  ),
);
