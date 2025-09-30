/**
 * Main tRPC Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { initTRPC } from '@trpc/server'
import { type CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import { type CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@neonpro/database'
import { createTRPCRouter } from './trpc'
import { architectureRouter } from './routers/architecture'
import { migrationRouter } from './routers/migration'

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateHTTPContextOptions) => {
  const { req } = opts

  // Get the token from the Authorization header
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  // Create Supabase client
  const supabase = new SupabaseClient<Database>(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    }
  )

  // Get the user from the token
  const { data: { user } } = await supabase.auth.getUser(token)

  // Get the clinic ID from user metadata
  const clinicId = user?.user_metadata?.clinic_id as string | undefined

  return {
    supabase,
    user,
    clinicId: clinicId || '',
    environment: process.env.NODE_ENV === 'production' ? 'production' :
                 process.env.NODE_ENV === 'staging' ? 'staging' : 'development',
  }
}

/**
 * This is the context used in WebSocket connections
 * @link https://trpc.io/docs/adapters/ws
 */
export const createWSSContext = async (opts: CreateWSSContextFnOptions) => {
  const { req, res } = opts

  // Get the token from the query string
  const token = req.url?.split('token=')[1]

  // Create Supabase client
  const supabase = new SupabaseClient<Database>(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    }
  )

  // Get the user from the token
  const { data: { user } } = await supabase.auth.getUser(token)

  // Get the clinic ID from user metadata
  const clinicId = user?.user_metadata?.clinic_id as string | undefined

  return {
    supabase,
    user,
    clinicId: clinicId || '',
    environment: process.env.NODE_ENV === 'production' ? 'production' :
                 process.env.NODE_ENV === 'staging' ? 'staging' : 'development',
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @link https://trpc.io/docs/data-transformers
   */
  transformer: {
    serialize: (object) => {
      return JSON.parse(JSON.stringify(object, (key, value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      }))
    },
    deserialize: (object) => {
      return JSON.parse(JSON.stringify(object), (key, value) => {
        // Convert ISO strings to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      })
    },
  },
  /**
   * @link https://trpc.io/docs/error-formatting
   */
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === 'BAD_REQUEST' && error.cause instanceof Error ? error.cause.message : null,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURES
 *
 * These are the pieces you use to build your tRPC API.
 * @link https://trpc.io/docs/router
 * @link https://trpc.io/docs/procedures
 */

/**
 * Create a router
 * @link https://trpc.io/docs/router
 */
export const appRouter = createTRPCRouter({
  architecture: architectureRouter,
  migration: migrationRouter,
  health: t.procedure.query(() => ({ status: 'ok' })),
})

/**
 * Export type definition of API
 * @link https://trpc.io/docs/type-safety
 */
export type AppRouter = typeof appRouter

/**
 * Create a server-side handler for tRPC
 * @link https://trpc.io/docs/server
 */
export const createTRPCHandler = () => {
  return t.createCallerFactory(appRouter)(createTRPCContext)
}

/**
 * Create a WebSocket handler for tRPC
 * @link https://trpc.io/docs/adapters/ws
 */
export const createTRPCWSHandler = () => {
  return t.createCallerFactory(appRouter)(createWSSContext)
}
