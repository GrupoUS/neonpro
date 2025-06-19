/**
 * Supabase Client Configuration for NEONPRO
 * Based on Midday.ai authentication patterns and VIBECODE V1.0 research findings
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabase = createClient()
