/**
 * Enhanced Supabase + Prisma Database Client
 * Optimized for healthcare workloads with connection pooling and performance monitoring
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

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
    },
  );
};

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
    },
  );
};

// Prisma client for healthcare workloads
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
  });
};

// Client creation functions for testing
export const createClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

export const createServiceClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase service role environment variables');
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

// Global instances
export const supabase = createOptimizedSupabaseClient();
export const supabaseBrowser = createBrowserSupabaseClient();
export const prisma = createPrismaClient();

// Connection health check
export const checkDatabaseHealth = async () => {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;

    // Test Supabase connection
    const { error } = await supabase
      .from('clinics')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      prisma: true,
      supabase: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// Graceful shutdown
export const closeDatabaseConnections = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connections closed successfully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeDatabaseConnections);
  process.on('SIGTERM', closeDatabaseConnections);
}
