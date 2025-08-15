// lib/supabase.ts
// Supabase client configuration (optional - project uses Prisma as primary database)

import { createClient } from '@supabase/supabase-js';

// =============================================================================================
// 🔧 SUPABASE CLIENT CONFIGURATION
// =============================================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// =============================================================================================
// 🔐 AUTH HELPERS
// =============================================================================================

// Sign up with email and password
export const signUp = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Get current user
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// =============================================================================================
// 🔄 AUTH STATE LISTENER
// =============================================================================================

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// =============================================================================================
// 📝 NOTE
// =============================================================================================

/*
 * This file provides Supabase client configuration for authentication purposes.
 * The main database operations are handled by Prisma (see lib/prisma.ts).
 * 
 * Supabase is used here primarily for:
 * - User authentication
 * - Session management
 * - OAuth providers (Google, GitHub, etc.)
 * 
 * For database operations, use Prisma client instead.
 */

export default supabase;
