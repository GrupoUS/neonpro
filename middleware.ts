import { NextRequest } from 'next/server';
import { sessionAuthMiddleware } from './middleware/session-auth';

/**
 * Main middleware function for Next.js
 * Handles session authentication and security
 */
export async function middleware(request: NextRequest) {
  return sessionAuthMiddleware.handle(request);
}

/**
 * Middleware configuration
 * Defines which routes should be processed by the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|manifest).*)',
  ],
};