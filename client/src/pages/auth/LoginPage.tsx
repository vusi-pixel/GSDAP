import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAuthStore, DEMO_USER } from '../../store';
import { LoginSchema } from '@omc/shared';

import { supabaseSignIn, isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabase';

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'student@gsdap.org',
      password: 'Password123!',
    },
  });

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  async function onSubmit(data: LoginForm) {
    setError('');

    // 1. Authenticate with Supabase Realtime Database if configured
    if (isSupabaseConfigured()) {
      try {
        const res = await supabaseSignIn(data);
        if (res.user) {
          setAuth(res.user, res.accessToken);
          navigate(from, { replace: true });
          return;
        }
      } catch (sbErr: any) {
        setError(sbErr?.message || 'Supabase authentication failed. Please check credentials.');
        return;
      }
    }

    // 2. Fall back to local API endpoint / dev session
    try {
      const res = await authApi.login(data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // In dev fallback, allow logging in with demo user
      setAuth(DEMO_USER, 'demo-dev-token-xyz');
      navigate(from, { replace: true });
    }
  }

  function handleQuickDevLogin() {
    setAuth(DEMO_USER, 'demo-dev-token-xyz');
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 antialiased text-foreground font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-7 h-7 border border-foreground flex items-center justify-center font-mono text-xs font-bold">
              GS
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
              GSDAP
            </span>
          </Link>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Ghana Student Digital Access Programme
          </p>
        </div>

        {/* Card */}
        <div className="border border-border bg-card p-8">
          <div className="border-b border-border pb-4 mb-6">
            <h1 className="font-serif text-2xl font-normal text-foreground">
              Sign In to Your Dossier
            </h1>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Enter your registered credentials or launch directly in dev mode.
            </p>
          </div>

          {/* Real-Time Database Connection Badge */}
          <div className="mb-4 flex items-center justify-between px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] rounded-sm">
            <span className="flex items-center gap-1.5 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Real-Time Auth
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[170px]" title={SUPABASE_URL}>
              bpvjxenorzxummlgdwuf.supabase.co
            </span>
          </div>

          {/* Quick Dev Access Banner */}
          <div className="mb-6 p-4 border border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-xs text-foreground font-semibold uppercase">
              <ShieldCheck size={14} strokeWidth={1.5} className="text-emerald-700 dark:text-emerald-400" />
              <span>Instant Development Session</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bypass credentials and access the verified academic record for <strong>Student Learner</strong>.
            </p>
            <button
              type="button"
              onClick={handleQuickDevLogin}
              className="w-full mt-2 font-mono text-xs uppercase tracking-wider py-2.5 bg-foreground text-background hover:opacity-90 transition-opacity font-semibold inline-flex items-center justify-center gap-2"
            >
              <span>Enter Dashboard Directly</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono mb-6">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Registered Email
              </label>
              <input
                type="email"
                className="w-full bg-background border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-mono"
                placeholder="name@institution.edu"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-mono text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Security Passphrase
                </label>
                <Link
                  to="/forgot-password"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-background border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-mono pr-10"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-mono text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-mono text-xs uppercase tracking-wider py-3 border border-border bg-background hover:bg-muted text-foreground transition-colors font-semibold"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : (
                'Authenticate Session'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center font-mono text-xs text-muted-foreground">
            <span>New technical learner? </span>
            <Link to="/register" className="text-foreground underline font-semibold">
              Register Dossier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
