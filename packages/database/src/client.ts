/**
 * Enhanced Supabase + Prisma Database Client
 * Optimized for healthcare workloads with connection pooling and performance monitoring
 */

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Connection pool configuration optimized for healthcare workloads
const createOptimizedSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false, // Server-side optimization
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10, // Healthcare-appropriate rate limiting
        },
      },
      global: {
        headers: {
          'x-application-name': 'neonpro-healthcare',
        },
      },
    }
  )
}

// Browser client for client-side operations with RLS
const createBrowserSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 5, // Conservative for client-side
        },
      },
    }
  )
}

// Prisma with Supabase adapter for optimal performance
const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL!
  
  const adapter = new PrismaPg({ 
    connectionString,
    // Healthcare-optimized connection pool settings
    pool: {
      max: 20, // Maximum connections
      min: 5,  // Minimum connections
      acquireTimeoutMillis: 60000, // 60 seconds
      createTimeoutMillis: 30000,  // 30 seconds
      destroyTimeoutMillis: 5000,  // 5 seconds
      idleTimeoutMillis: 30000,    // 30 seconds
      reapIntervalMillis: 1000,    // 1 second
      createRetryIntervalMillis: 200, // 200ms
    }
  })
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })
}

// Global instances
export const supabase = createOptimizedSupabaseClient()
export const supabaseBrowser = createBrowserSupabaseClient()
export const prisma = createPrismaClient()

// Connection health check
export const checkDatabaseHealth = async () => {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('clinics')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return {
      status: 'healthy',
      prisma: true,
      supabase: true,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

// Graceful shutdown
export const closeDatabaseConnections = async () => {
  try {
    await prisma.$disconnect()
    console.log('Database connections closed successfully')
  } catch (error) {
    console.error('Error closing database connections:', error)
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeDatabaseConnections)
  process.on('SIGTERM', closeDatabaseConnections)
}