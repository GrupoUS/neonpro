import { createClient } from '@supabase/supabase-js'
import type { inferAsyncReturnType } from '@trpc/server'
import type { Database } from '@neonpro/types'

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration for Edge runtime')
}

export const createContext = async ({ req }: { req: Request }) => {
  const authHeader = req.headers.get('authorization') ?? ''
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    supabase,
    session: user,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
