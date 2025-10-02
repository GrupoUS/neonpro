/**
 * @file OAuth Callback Route
 *
 * Handles OAuth redirects and email confirmations
 * Implements patterns from supabase-auth-redirects.md
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 */

import { getNextRedirectFromCallback } from '@/lib/site-url.ts'
import { createSupabaseClient } from '@/lib/supabase/client.ts'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback
})

function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createSupabaseClient()

      try {
        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        )

        if (error) {
          console.error('OAuth callback error:', error)
          // Redirect to login with error
          window.location.href = '/auth/login?error=' + encodeURIComponent(error.message)
          return
        }

        // Get next redirect URL from query params
        const nextUrl = getNextRedirectFromCallback(window.location.href)

        // LGPD Compliant: Use secure audit logging from @neonpro/security
        // Removed console.log with personal data (user email)
        // TODO: Implement secure audit logging for OAuth login events

        // Navigate to intended destination (SPA navigation)
        // For TanStack Router, you would use router.navigate() here
        // For now, using window.location to ensure it works
        window.location.href = nextUrl

      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error)
        window.location.href = '/auth/login?error=callback_failed'
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
        <p className="text-sm text-gray-500 mt-2">Você será redirecionado automaticamente.</p>
      </div>
    </div>
  )
}
