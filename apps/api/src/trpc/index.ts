/**
 * tRPC exports
 * Centralized exports for tRPC factory functions and utilities
 */

export { router, procedure, middleware } from './trpc-factory'
export { createContext } from './context'
export type { Context } from './context'
export { appRouter } from './router'
export type { AppRouter } from './router'

// Re-export commonly used tRPC utilities
export { initTRPC } from '@trpc/server'
export { TRPCError } from '@trpc/server'

// Protected procedure helper
import { procedure } from './trpc-factory'
import { TRPCError } from '@trpc/server'

export const protectedProcedure = procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})