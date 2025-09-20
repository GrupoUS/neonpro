// Audit logging helper (Phase 3.4 T031)
// Thin wrapper over existing audit middleware/services with Supabase toggle.
import { createClient } from '@supabase/supabase-js';
import type { Context, Next } from 'hono';
import { logger } from '../utils/secure-logger';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export function auditLog(eventName: string) {
  return async (c: Context, next: Next) => {
    const startedAt = Date.now();
    await next();
    const durationMs = Date.now() - startedAt;

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
      userId: (c.get('userId') as string) || c.req.header('x-user-id') || 'anonymous',
      clinicId: (c.get('clinicId') as string) || c.req.header('x-clinic-id') || null,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || null,
      userAgent: c.req.header('user-agent') || null,
    };

    if (process.env.AI_AUDIT_DB === 'true') {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('ai_audit_events').insert({
            clinic_id: payload.clinicId,
            user_id: payload.userId,
            session_id: null,
            action_type: eventName,
            metadata: JSON.stringify(payload),
            status: c.res.status < 400 ? 'success' : 'error',
            created_at: payload.timestamp,
          });
          return;
        } catch (err) {
          // fall through to console logging
          logger.warn(
            'auditLog supabase insert failed',
            { operation: 'supabase_insert', error: err } as any,
          );
        }
      }
    }

    // Fallback to console if DB disabled or failed
    logger.info(
      'AUDIT_EVENT',
      { operation: 'audit_event', payload: JSON.stringify(payload) } as any,
    );
  };
}
