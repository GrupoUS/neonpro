/**
 * Simple auth helper for server-side user authentication
 */

import { createClient } from '@/app/utils/supabase/server';

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}
