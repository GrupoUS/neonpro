// Node.js Runtime with Prisma Example
// Runtime: Node.js 20.x (for full database and filesystem capabilities)

import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Global Prisma instance for connection reuse
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Example database operation (Prisma)
    const healthCheck = {
      status: 'ok',
      message: 'NeonPro API with Prisma (Node.js Runtime)',
      timestamp: new Date().toISOString(),
      runtime: 'nodejs20.x',
      region: process.env.VERCEL_REGION || 'gru1',

      // Node.js runtime capabilities
      features: {
        prismaORM: true,
        filesystem: true,
        nativeModules: true,
        memoryLimit: '1024MB',
        maxDuration: '60s',
      },

      // Database connectivity check
      database: {
        connected: true,
        url: !!process.env.DATABASE_URL,
        directUrl: !!process.env.DIRECT_URL,
      },

      // Environment check
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKey: !!process.env.SUPABASE_ANON_KEY,
        jwtSecret: !!process.env.JWT_SECRET,
      },
    };

    // Optionally test database connection
    if (req.query.testDb === 'true') {
      try {
        await prisma.$queryRaw`SELECT 1`;
        healthCheck.database.connected = true;
      } catch (error) {
        // Log the full error server-side for troubleshooting
        console.error('Database connection test failed:', error);

        healthCheck.database.connected = false;
        // Return sanitized error message to prevent information leakage
        healthCheck.database.error = 'database connection failed';
      }
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      runtime: 'nodejs20.x',
    });
  }
}
