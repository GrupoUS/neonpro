import { createClient } from '@supabase/supabase-js';
import type { Context, Next } from 'hono';
import { unauthorized } from '../utils/responses';

// Bearer auth using Supabase access token
export async function requireAuth(c: Context, next: Next) {
  const auth = c.req.header('authorization') || c.req.header('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : undefined;

  if (!token) {
    return unauthorized(c, 'Missing Bearer token');
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Fail closed in prod, but return explicit error
    return unauthorized(c, 'Server missing Supabase configuration');
  }

  const supabase = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return unauthorized(c, 'Invalid or expired token', error);
  }

  // Attach user info to context for downstream handlers
  c.set('userId', data.user.id);
  c.set('user', data.user);

  return next();
}
