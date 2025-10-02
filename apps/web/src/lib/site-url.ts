/**
 * @file Site URL Helper
 * 
 * Centralized site URL resolution for OAuth redirects
 * Implements pattern from supabase-auth-redirects.md
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 */

/**
 * Get the current site URL in order of priority:
 * 1. VITE_PUBLIC_SITE_URL (recommended)
 * 2. VERCEL_URL (auto-prefixed with https)
 * 3. window.location.origin (client-side)
 * 4. http://localhost:5173 (fallback)
 */
export function getSiteUrl(): string {
  // Server-side environment variables
  if (typeof window === 'undefined') {
    // Priority 1: Explicit site URL
    if (process.env.VITE_PUBLIC_SITE_URL) {
      return process.env.VITE_PUBLIC_SITE_URL
    }
    
    // Priority 2: Vercel URL (auto-prefixed with https)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    // Fallback for server-side
    return 'http://localhost:5173'
  }

  // Client-side environment variables
  // Priority 1: Explicit site URL
  if (import.meta.env.VITE_PUBLIC_SITE_URL) {
    return import.meta.env.VITE_PUBLIC_SITE_URL
  }
  
  // Priority 2: Vercel URL (auto-prefixed with https)
  if (import.meta.env.VERCEL_URL) {
    return `https://${import.meta.env.VERCEL_URL}`
  }
  
  // Priority 3: Browser location
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Priority 4: Fallback
  return 'http://localhost:5173'
}

/**
 * Build OAuth redirect URL with next parameter
 * Used for OAuth flows to redirect back to intended page
 */
export function buildOAuthRedirectUrl(finalRedirectTo: string = '/dashboard'): string {
  const siteUrl = getSiteUrl()
  const callbackUrl = `${siteUrl}/auth/callback`
  const nextParam = encodeURIComponent(finalRedirectTo)
  
  return `${callbackUrl}?next=${nextParam}`
}

/**
 * Build email confirmation redirect URL
 */
export function buildEmailRedirectUrl(finalRedirectTo: string = '/dashboard'): string {
  const siteUrl = getSiteUrl()
  const callbackUrl = `${siteUrl}/auth/callback`
  const nextParam = encodeURIComponent(finalRedirectTo)
  
  return `${callbackUrl}?next=${nextParam}&type=email_confirmation`
}

/**
 * Build password reset redirect URL
 */
export function buildPasswordResetRedirectUrl(): string {
  const siteUrl = getSiteUrl()
  return `${siteUrl}/auth/reset-password`
}

/**
 * Extract next parameter from callback URL
 */
export function getNextRedirectFromCallback(url: string): string {
  try {
    const urlObj = new URL(url)
    const next = urlObj.searchParams.get('next')
    
    // Validate that the redirect URL is safe (same origin)
    if (next) {
      const siteUrl = getSiteUrl()
      const nextUrl = new URL(next, siteUrl)
      
      if (nextUrl.origin === new URL(siteUrl).origin) {
        return next
      }
    }
  } catch (error) {
    console.warn('Invalid URL for next redirect:', error)
  }
  
  // Safe fallback
  return '/dashboard'
}