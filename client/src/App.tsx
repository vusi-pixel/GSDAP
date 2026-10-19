import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from './store';
import { useTranslation } from 'react-i18next';

import { SmoothScrollProvider } from './lib/lenis';

// Layout
import RootLayout from './components/layout/RootLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth guard
import ProtectedRoute from './components/auth/ProtectedRoute';

// Eagerly loaded critical pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy loaded pages
const OnboardingPage   = lazy(() => import('./pages/auth/OnboardingPage'));
const CatalogPage      = lazy(() => import('./pages/CatalogPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const RoadmapPage      = lazy(() => import('./pages/dashboard/RoadmapPage'));
const CredentialsPage  = lazy(() => import('./pages/dashboard/CredentialsPage'));
const VerifyCredPage   = lazy(() => import('./pages/VerifyCredentialPage'));
const CohortsPage      = lazy(() => import('./pages/CohortsPage'));
const CohortDetailPage = lazy(() => import('./pages/CohortDetailPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const SettingsPage     = lazy(() => import('./pages/SettingsPage'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers       = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProviders   = lazy(() => import('./pages/admin/AdminProviders'));
const AdminAnalytics   = lazy(() => import('./pages/admin/AdminAnalytics'));
const TvetDashboard    = lazy(() => import('./pages/admin/TvetDashboard'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage    = lazy(() => import('./pages/auth/VerifyEmailPage'));
const AuthCallbackPage   = lazy(() => import('./pages/auth/AuthCallbackPage'));

// Full-screen spinner for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { theme } = useThemeStore();
  const { i18n } = useTranslation();

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <SmoothScrollProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public portal first → login → dashboard */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public routes */}
          <Route element={<RootLayout />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<CourseDetailPage />} />
          <Route path="/credentials/verify/:code" element={<VerifyCredPage />} />
          <Route path="/users/:id" element={<ProfilePage />} />
          <Route path="/cohorts" element={<CohortsPage />} />
          <Route path="/cohorts/:id" element={<CohortDetailPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Onboarding (needs auth but not full layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Learner dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/roadmap" element={<RoadmapPage />} />
            <Route path="/dashboard/credentials" element={<CredentialsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin dashboard */}
        <Route element={<ProtectedRoute roles={['super_admin', 'tvet_admin', 'mentor']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/tvet" element={<TvetDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </SmoothScrollProvider>
  );
}
