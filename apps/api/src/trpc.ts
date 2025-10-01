/**
 * tRPC Configuration
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import { type CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@neonpro/database'
import { logAuditEvent } from './utils/audit-log'

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateHTTPContextOptions) => {
  const { req } = opts

  // Get the token from the Authorization header
  const rawAuthHeader = req.headers['authorization']
  const bearerHeader = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader
  const token = bearerHeader?.startsWith('Bearer ') ? bearerHeader.replace('Bearer ', '') : bearerHeader

  // Create Supabase client
  const supabase = new SupabaseClient<Database>(
    process.env['SUPABASE_URL'] ?? '',
    process.env['SUPABASE_ANON_KEY'] ?? '',
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
  const userMetadata = user?.user_metadata as Record<string, unknown> | undefined
  const clinicId = typeof userMetadata?.['clinic_id'] === 'string' ? userMetadata['clinic_id'] : undefined

  return {
    supabase,
    user,
    clinicId: clinicId ?? '',
    environment: process.env['NODE_ENV'] === 'production' ? 'production' :
                 process.env['NODE_ENV'] === 'staging' ? 'staging' : 'development',
  }
}

/**
 * This is the context used in WebSocket connections
 * @link https://trpc.io/docs/adapters/ws
 */
export const createWSSContext = async (opts: CreateWSSContextFnOptions) => {
  const { req } = opts

  // Get the token from the query string
  const token = req.url?.split('token=')[1]

  // Create Supabase client
  const supabase = new SupabaseClient<Database>(
    process.env['SUPABASE_URL'] ?? '',
    process.env['SUPABASE_ANON_KEY'] ?? '',
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
  const userMetadata = user?.user_metadata as Record<string, unknown> | undefined
  const clinicId = typeof userMetadata?.['clinic_id'] === 'string' ? userMetadata['clinic_id'] : undefined

  return {
    supabase,
    user,
    clinicId: clinicId ?? '',
    environment: process.env['NODE_ENV'] === 'production' ? 'production' :
                 process.env['NODE_ENV'] === 'staging' ? 'staging' : 'development',
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
      return JSON.parse(JSON.stringify(object, (_key, value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      }))
    },
    deserialize: (object) => {
      return JSON.parse(JSON.stringify(object), (_key, value) => {
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
export const createTRPCRouter = t.router

/**
 * Create an unprotected procedure
 * @link https://trpc.io/docs/procedures
 */
export const publicProcedure = t.procedure

/**
 * Create a protected procedure
 * @link https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.clinicId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      clinicId: ctx.clinicId,
    },
  })
})

/**
 * Create a middleware for healthcare compliance
 * @link https://trpc.io/docs/middlewares
 */
export const healthcareComplianceMiddleware = t.middleware(async ({ ctx, next }) => {
  // Log access for compliance
  await logAuditEvent({
    supabase: ctx.supabase,
    clinicId: ctx.clinicId,
    userId: ctx.user?.id ?? null,
    action: 'API_ACCESS',
    resourceType: 'TRPC_API',
    resourceId: null,
    details: {
      environment: ctx.environment,
      timestamp: new Date(),
    },
    createdAt: new Date(),
  })

  return next({
    ctx,
  })
})

/**
 * Create a procedure with healthcare compliance
 * @link https://trpc.io/docs/procedures
 */
export const complianceProcedure = t.procedure.use(healthcareComplianceMiddleware)

/**
 * Export type definition of API
 * @link https://trpc.io/docs/type-safety
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>
