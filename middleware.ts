import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Import existing middleware modules (preserving current functionality)
// TODO: Uncomment and adjust these imports based on actual module exports
// import { validateSubscription } from './middleware/subscription';
// import { checkRolePermissions } from './middleware/rbac';
// import { logAuditEvent } from './middleware/session-auth';

// Define route matchers for different authentication requirements
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/public(.*)',
  '/login(.*)',
  '/signup(.*)',
  '/pricing',
  '/demo',
  '/oauth-demo(.*)',
  '/security-demo(.*)',
  '/test-oauth(.*)'
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/patients(.*)',
  '/appointments(.*)',
  '/inventory(.*)',
  '/settings(.*)',
  '/profile(.*)',
  '/patient-portal(.*)',
  '/api/protected(.*)',
  '/api/patients(.*)',
  '/api/appointments(.*)'
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
]);

// Enterprise-grade middleware with Clerk integration
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = auth();
  const url = req.nextUrl.clone();

  // Public routes - allow access without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (isProtectedRoute(req)) {
    // Check if user is authenticated
    if (!userId) {
      // Redirect to login for unauthenticated users
      url.pathname = '/login';
      url.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // TODO: Integrate existing subscription validation
    // const subscriptionValid = await subscriptionCheck(userId, req);
    // if (!subscriptionValid) {
    //   url.pathname = '/pricing';
    //   return NextResponse.redirect(url);
    // }

    // Admin routes - require admin role
    if (isAdminRoute(req)) {
      const userRole = sessionClaims?.metadata?.role;
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    // TODO: Integrate existing RBAC validation
    // const rbacValid = await rbacCheck(userId, req.nextUrl.pathname);
    // if (!rbacValid) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }
  }

  // Healthcare compliance headers for all routes
  const response = NextResponse.next();
  
  // LGPD and HIPAA compliance headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for healthcare data protection
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.clerk.accounts.dev; connect-src 'self' *.clerk.accounts.dev *.supabase.co wss://*.supabase.co;"
  );

  return response;
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};