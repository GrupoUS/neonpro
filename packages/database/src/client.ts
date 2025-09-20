/**
 * Enhanced Supabase + Prisma Database Client
 * Optimized for healthcare workloads with connection pooling and performance monitoring
 */

import { PrismaClient } from "@prisma/client";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { winstonLogger } from "@neonpro/shared/services/structured-logging";

// Connection pool configuration optimized for healthcare workloads
const createOptimizedSupabaseClient = (): SupabaseClient => {
  // Skip Supabase client creation in test environment
  if (process.env.NODE_ENV === 'test') {
    // Return a mock client for testing
    return {
      from: (_table: string) => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    } as any;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing required Supabase environment variables for optimized client",
    );
  }

  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: "public",
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
          "x-application-name": "neonpro-healthcare",
        },
      },
    },
  );
};

// Browser client for client-side operations with RLS
const createBrowserSupabaseClient = (): SupabaseClient => {
  // Skip Supabase client creation in test environment
  if (process.env.NODE_ENV === 'test') {
    // Return a mock client for testing
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    } as any;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
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
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });
};

// Client creation functions for testing
export const createNodeSupabaseClient = (): SupabaseClient => {
  // Skip Supabase client creation in test environment
  if (process.env.NODE_ENV === 'test') {
    // Return a mock client for testing
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    } as any;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: "public",
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
};

export const createServiceSupabaseClient = (): SupabaseClient => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service role environment variables");
  }
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: "public",
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
};

// Export generic createClient for backwards compatibility
export const createClient = createNodeSupabaseClient;
export const createServiceClient = createServiceSupabaseClient;

// Global instances - lazy loaded to handle test environment
let _supabase: SupabaseClient | null = null;
let _supabaseBrowser: SupabaseClient | null = null;
let _prisma: PrismaClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createOptimizedSupabaseClient();
    }
    return (_supabase as any)[prop];
  }
});

export const supabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseBrowser) {
      _supabaseBrowser = createBrowserSupabaseClient();
    }
    return (_supabaseBrowser as any)[prop];
  }
});

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = createPrismaClient();
    }
    return (_prisma as any)[prop];
  }
});

// Connection health check
export const checkDatabaseHealth = async () => {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;

    // Test Supabase connection
    const { error } = await supabase.from("clinics").select("id").limit(1);

    if (error) throw error;

    return {
      status: "healthy",
      prisma: true,
      supabase: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
};

// Graceful shutdown
export const closeDatabaseConnections = async () => {
  try {
    await prisma.$disconnect();
    winstonLogger.info("Database connections closed successfully");
  } catch (error) {
    winstonLogger.error("Error closing database connections", error instanceof Error ? error : new Error(String(error)));
  }
};

// Handle process termination
if (
  typeof process !== "undefined" &&
  typeof (process as any).on === "function"
) {
  process.on("SIGINT", closeDatabaseConnections);
  process.on("SIGTERM", closeDatabaseConnections);
}
