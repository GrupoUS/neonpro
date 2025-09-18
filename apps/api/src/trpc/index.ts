/**
 * tRPC Main Export File
 * Healthcare-compliant tRPC setup for NeonPro platform
 */

export { createContext } from './context';
export { appRouter } from './router';
export type { AppRouter } from './router';
export type { Context } from './context';
export { router, publicProcedure, protectedProcedure, patientProcedure } from './trpc';

// Export schemas for client-side validation
export * from './schemas';