/**
 * TTFB (Time to First Byte) Logging Middleware
 *
 * This middleware measures and logs TTFB for all Edge routes to the
 * performance_metrics table using the Supabase anon client under RLS.
 *
 * Key features:
 * - Measures TTFB from startTime to response completion
 * - Logs to performance_metrics table with metric_name='ttfb_edge'
 * - Uses anon client with RLS for clinic_id filtering
 * - Async logging (fire-and-forget, no blocking)
 * - Error handling (logs failures but doesn't fail requests)
 * - Healthcare compliance (no PII, clinic_id scoped)
 */

import { Context, Next } from 'hono'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@neonpro/types'

interface TTFBLoggerOptions {
  supabaseUrl: string
  supabaseAnonKey: string
}

/**
 * Create TTFB logging middleware
 */
export const createTTFBLogger = (options: TTFBLoggerOptions) => {
  const { supabaseUrl, supabaseAnonKey } = options

  return async (c: Context, next: Next) => {
    // Execute the request first
    await next()

    // Only log TTFB for successful responses (2xx, 3xx)
    const status = c.res.status
    if (status < 200 || status >= 400) {
      return
    }

    // Get timing and context information
    const startTime = c.get('startTime')
    const clinicId = c.get('clinicId')

    if (!startTime || !clinicId) {
      // Skip logging if timing or clinic context is missing
      return
    }

    // Calculate TTFB in milliseconds
    const ttfb = Date.now() - startTime

    // Log TTFB asynchronously (fire-and-forget)
    // Use setTimeout to avoid blocking the response
    setTimeout(async () => {
      try {
        // Create anon client for Edge runtime
        const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              'X-Client-Runtime': 'edge'
            }
          }
        })

        // Insert TTFB metric
        const { error } = await supabase
          .from('performance_metrics')
          .insert({
            metric_name: 'ttfb_edge',
            metric_value: ttfb,
            clinic_id: clinicId,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Failed to log TTFB metric:', error)
        }
      } catch (error) {
        console.error('Failed to log TTFB metric:', error)
      }
    }, 0)
  }
}

/**
 * Default TTFB logger middleware factory
 */
export const ttfbLogger = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createTTFBLogger({
    supabaseUrl,
    supabaseAnonKey
  })
}
