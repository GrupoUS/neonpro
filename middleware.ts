import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/patients(.*)',
  '/appointments(.*)',
  '/admin(.*)',
  '/api/protected(.*)'
])

export default clerkMiddleware((auth, req) => {
  // Clerk v6 syntax: Use auth().userId to check authentication
  // and auth().redirectToSignIn() for redirects
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}