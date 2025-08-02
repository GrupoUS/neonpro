import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/patients(.*)',
  '/appointments(.*)',
  '/admin(.*)',
  '/api/protected(.*)'
])

// 🔄 ALTERNATIVE 1: Enhanced error handling with custom redirect
export const alternativeMethod1 = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = auth()
    
    if (!userId) {
      // Custom redirect with return URL preservation
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }
  }
})

// 🔄 ALTERNATIVE 2: Role-based protection with user data
export const alternativeMethod2 = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, user } = auth()
    
    if (!userId) {
      return auth().redirectToSignIn()
    }
    
    // Additional role-based checks if needed
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Example: Check for admin role
      const userRole = user?.publicMetadata?.role
      if (userRole !== 'admin') {
        return Response.redirect(new URL('/unauthorized', req.url))
      }
    }
  }
})

// 🔄 ALTERNATIVE 3: Minimal implementation
export const alternativeMethod3 = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}