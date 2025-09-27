/**
 * tRPC Main Export File
 * Healthcare-compliant tRPC setup for NeonPro platform
 */

export { createContext } from './context.js'
export type { Context } from './context.js'
export { appRouter } from './router.js'
export type { AppRouter } from './router.js'
export { patientProcedure, protectedProcedure, publicProcedure, router } from './trpc.js'

// Export schemas for client-side validation
export * from './schemas.js'
