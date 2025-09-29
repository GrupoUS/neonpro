// Main exports for @neonpro/database package

// Type definitions
export * from './types/supabase-generated';

// Database client and utilities
export * from './lib/client';
export * from './lib/realtime';
export * from './lib/migrations';

// Re-export commonly used types for convenience
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  TablesRow,
  Views,
  ViewsRow
} from './types/supabase-generated';

// Version info
export const version = '0.1.0';

// Package metadata
export const metadata = {
  name: '@neonpro/database',
  version,
  description: 'Database utilities and types for NeonPro healthcare platform',
  author: 'NeonPro Team',
  license: 'MIT',
  repository: 'https://github.com/neonpro/neonpro',
  homepage: 'https://neonpro.vercel.app'
};

// Default export for convenience
export { db, dbUtils, defaultConfig } from './lib/client';

// Initialize with environment variables by default
export const database = {
  client: db,
  utils: dbUtils,
  realtime: (client = db) => import('./lib/realtime').then(m => m.createRealtimeManager(client)),
  migrations: () => import('./lib/migrations').then(m => new m.MigrationManager())
};

// Health check function
export async function healthCheck(): Promise<{
  healthy: boolean;
  version: string;
  timestamp: string;
  error?: string;
}> {
  try {
    // Test basic database connectivity
    const { data, error } = await db.from('clinics').select('count').limit(1);
    
    if (error) {
      return {
        healthy: false,
        version,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    return {
      healthy: true,
      version,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      version,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for CommonJS compatibility
export default {
  db,
  dbUtils,
  healthCheck,
  metadata,
  ...database
};