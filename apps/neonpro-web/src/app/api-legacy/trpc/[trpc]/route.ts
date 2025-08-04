import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

/**
 * tRPC API Handler for Next.js 14 App Router
 * 
 * Healthcare-compliant tRPC endpoint with:
 * - Supabase authentication integration
 * - LGPD compliance validation
 * - Comprehensive audit logging
 * - Medical role-based access control
 * - Real-time type safety
 */

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : ({ path, error }) => {
            // Production error logging with healthcare compliance
            console.error('tRPC Healthcare API Error:', {
              path,
              message: error.message,
              code: error.code,
              timestamp: new Date().toISOString(),
              // Don't log sensitive healthcare data in production
            });
          },
  });

export { handler as GET, handler as POST };