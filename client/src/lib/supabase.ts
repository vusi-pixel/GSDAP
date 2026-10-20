import { createClient, type User as SupabaseUser, type Session } from '@supabase/supabase-js';
import type { User } from '../store';

// Supabase project endpoint
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bpvjxenorzxummlgdwuf.supabase.co';

// Public anonymous key (configured via environment variable)
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== 'placeholder' &&
      !SUPABASE_ANON_KEY.startsWith('your-')
  );
};

// Safe client instantiation (does not throw on missing anon key)
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'dummy-anon-key-pending-configuration',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Map Supabase user object to GSDAP internal User model
export function mapSupabaseUser(sbUser: SupabaseUser): User {
  const meta = sbUser.user_metadata || {};
  const emailName = sbUser.email ? sbUser.email.split('@')[0] : 'Learner';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    firstName: meta.firstName || meta.first_name || meta.full_name?.split(' ')[0] || emailName,
    lastName: meta.lastName || meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
    role: (meta.role as User['role']) || 'learner',
    emailVerified: Boolean(sbUser.email_confirmed_at),
  };
}

/**
 * Sign In with Supabase Real-Time Authentication
 */
export async function supabaseSignIn(credentials: { email?: string; password?: string }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Anon Key is not configured yet. Please supply VITE_SUPABASE_ANON_KEY.');
  }

  if (!credentials.email || !credentials.password) {
    throw new Error('Valid email and password are required.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user ? mapSupabaseUser(data.user) : null,
    session: data.session,
    accessToken: data.session?.access_token || '',
  };
}

/**
 * Register a new user with Supabase Real-Time Authentication
 */
export async function supabaseSignUp(data: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Anon Key is not configured yet. Please supply VITE_SUPABASE_ANON_KEY.');
  }

  if (!data.email || !data.password) {
    throw new Error('Valid email and password are required.');
  }

  const { data: resData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        role: 'learner',
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: resData.user ? mapSupabaseUser(resData.user) : null,
    session: resData.session,
    accessToken: resData.session?.access_token || '',
  };
}

/**
 * Sign Out from Supabase
 */
export async function supabaseSignOut() {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign out error:', err);
  }
}

/**
 * Send password reset email
 */
export async function supabaseResetPassword(email: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Anon Key is not configured.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

/**
 * Initialize real-time authentication listener across browser tabs & sessions
 */
export function initSupabaseAuth(
  onSync: (user: User | null, token: string | null) => void
) {
  if (!isSupabaseConfigured()) return () => {};

  // Check existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      onSync(mapSupabaseUser(session.user), session.access_token);
    }
  });

  // Listen to real-time auth state events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
    if (session?.user) {
      onSync(mapSupabaseUser(session.user), session.access_token);
    } else if (event === 'SIGNED_OUT') {
      onSync(null, null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
