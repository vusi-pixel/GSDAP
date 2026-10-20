import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '../../lib/api';
import { RegisterSchema } from '@omc/shared';
import { supabaseSignUp, isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabase';

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setError('');

    // 1. Register with Supabase Realtime Database if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseSignUp(data);
        setSuccess(true);
        return;
      } catch (sbErr: any) {
        setError(sbErr?.message || 'Registration failed in Supabase. Please check input parameters.');
        return;
      }
    }

    // 2. Fall back to local API endpoint
    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed. Please check form inputs.');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 antialiased text-foreground font-sans">
        <div className="border border-border bg-card p-10 max-w-md w-full text-center space-y-6">
          <div className="w-12 h-12 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-normal text-foreground">
            Dossier Created Successfully
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            A confirmation attestation has been sent to your email. You may now authenticate your session.
          </p>
          <Link
            to="/login"
            className="w-full font-mono text-xs uppercase tracking-wider py-3 bg-foreground text-background hover:opacity-90 transition-opacity font-semibold block"
          >
            Sign In to Registry
          </Link>
        </div>
      </div>
    );
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
              Register Academic Record
            </h1>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Join the national technical learning consortium. All core curricula remain public and free.
            </p>
          </div>

          {/* Real-Time Database Connection Badge */}
          <div className="mb-6 flex items-center justify-between px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] rounded-sm">
            <span className="flex items-center gap-1.5 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Real-Time Database
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[170px]" title={SUPABASE_URL}>
              bpvjxenorzxummlgdwuf.supabase.co
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono mb-6">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-sans"
                  placeholder="First name"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs font-mono text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-sans"
                  placeholder="Last name"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs font-mono text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-background border border-border px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-mono"
                placeholder="name@domain.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-mono text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-background border border-border px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors font-mono pr-10"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              className="w-full font-mono text-xs uppercase tracking-wider py-3 bg-foreground text-background hover:opacity-90 transition-opacity font-semibold mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : (
                'Create Dossier'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center font-mono text-xs text-muted-foreground">
            <span>Already registered? </span>
            <Link to="/login" className="text-foreground underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
