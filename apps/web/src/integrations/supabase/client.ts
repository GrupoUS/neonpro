// Updated to use new healthcare database schema
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/supabase/types/database';

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_TEST = typeof import.meta !== 'undefined'
  && (import.meta as any).env?.MODE === 'test';

// Validate required environment variables
if (!SUPABASE_URL && !IS_TEST) {
  throw new Error(
    'Missing required environment variable: VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL',
  );
}

if (!SUPABASE_PUBLISHABLE_KEY && !IS_TEST) {
  throw new Error(
    'Missing required environment variable: VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );
}

import { getSiteUrl } from '@/lib/site-url';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL_RESOLVED = IS_TEST
  ? SUPABASE_URL || 'http://localhost:54321'
  : SUPABASE_URL;

const SUPABASE_KEY_RESOLVED = IS_TEST
  ? SUPABASE_PUBLISHABLE_KEY || 'test-anon-key'
  : SUPABASE_PUBLISHABLE_KEY;

if (!IS_TEST && (!SUPABASE_URL_RESOLVED || !SUPABASE_KEY_RESOLVED)) {
  throw new Error(
    'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents) in Vercel envs.',
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL_RESOLVED as string,
  SUPABASE_KEY_RESOLVED as string,
  {
    auth: {
      storage: typeof globalThis !== 'undefined' && 'localStorage' in globalThis
        ? (globalThis.localStorage as Storage)
        : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
// Helper functions for authentication with proper redirects

// Helper para login com OAuth providers
export const _signInWithProvider = async (
  provider: 'google' | 'github' | 'apple',
  redirectTo?: string,
) => {
  const baseUrl = getSiteUrl();
  const finalRedirectTo = redirectTo
    ? `${baseUrl}${redirectTo}`
    : `${baseUrl}/dashboard`;

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(finalRedirectTo)}`,
    },
  });
};

// Helper para login com email/password
export const _signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// Helper para signup com redirecionamento
export const _signUpWithEmail = async (
  email: string,
  password: string,
  redirectTo?: string,
) => {
  const baseUrl = getSiteUrl();
  const finalRedirectTo = redirectTo
    ? `${baseUrl}${redirectTo}`
    : `${baseUrl}/dashboard`;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent(finalRedirectTo)}`,
    },
  });
};

// Helper para reset de senha
export const _resetPassword = async (email: string, redirectTo?: string) => {
  const baseUrl = getSiteUrl();
  const finalRedirectTo = redirectTo
    ? `${baseUrl}${redirectTo}`
    : `${baseUrl}/dashboard`;

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent(finalRedirectTo)}`,
  });
};

// Helper para logout
export const signOut = async () => {
  return supabase.auth.signOut();
};

// Helper para verificar se usuário está autenticado
export const _getCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
};

// Helper para verificar sessão atual
export const _getCurrentSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
