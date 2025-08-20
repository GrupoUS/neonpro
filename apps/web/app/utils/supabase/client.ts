/**
 * Supabase Client Configuration
 * Client-side Supabase instance for browser usage
 */

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => createBrowserSupabaseClient();

export default createClient;
