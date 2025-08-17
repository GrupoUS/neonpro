import type { NextRequest } from 'next/server';
import { securityMiddleware } from '@/lib/security/middleware';

export async function middleware(request: NextRequest) {
  // Apply security middleware to all API routes and protected pages
  const response = await securityMiddleware(request);

  if (response) {
    return response;
  }

  // Continue to next middleware or route
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
