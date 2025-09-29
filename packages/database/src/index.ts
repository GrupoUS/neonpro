// Main exports for @neonpro/database package

// Database client and utilities
export * from './lib/simple-client.js';
export * from './lib/migrations.js';

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

// Import client utilities
import { db } from './lib/simple-client.js';

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