/**
 * Centralized database exports for monorepo sharing
 * Healthcare-optimized database utilities and services
 */

// Core database clients - factory functions
export { createClient, createServiceClient } from './client.js'

// Prisma client - direct export to avoid import issues
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Database types
export type { SupabaseClient } from './client.js'
export type { Database } from './types/supabase-generated.js'

// Utility functions
export { checkDatabaseHealth, closeDatabaseConnections } from './client.js'

export { sanitizeForAI } from './index.js'
