/**
 * Supabase Server Configuration
 * Server-side Supabase instance for API routes and SSR
 */

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => createServerSupabaseClient();

export default createClient;
