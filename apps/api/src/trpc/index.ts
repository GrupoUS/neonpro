/**
 * tRPC Main Export File
 * Healthcare-compliant tRPC setup for NeonPro platform
 */

export { createContext } from './context'
export type { Context } from './context'
export { appRouter } from './router'
export type { AppRouter } from './router'
export { patientProcedure, protectedProcedure, publicProcedure, router } from './trpc'

// Export schemas for client-side validation
export * from './schemas'
