import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/api/lgpd'
]

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/api/lgpd/compliance',
  '/api/lgpd/audit',
  '/api/lgpd/breach'
]

// Public LGPD routes (for user consent management)
const publicLGPDRoutes = [
  '/api/lgpd/consent'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicLGPDRoute = publicLGPDRoutes.some(route => pathname.startsWith(route))

  // Allow public LGPD routes with authentication (but not admin check)
  if (isPublicLGPDRoute) {
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return res
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin access for admin routes
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      // For API routes, return JSON error
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      // For page routes, redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // LGPD Compliance Logging for sensitive operations
  if (pathname.startsWith('/api/lgpd/') && session) {
    // Log API access for audit trail
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const ipAddress = req.ip || req.headers.get('x-forwarded-for') || 'Unknown'
    
    // Add headers for audit logging
    res.headers.set('x-lgpd-user-id', session.user.id)
    res.headers.set('x-lgpd-ip-address', ipAddress)
    res.headers.set('x-lgpd-user-agent', userAgent)
    res.headers.set('x-lgpd-timestamp', new Date().toISOString())
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}