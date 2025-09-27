/**
 * @file Supabase Auth API Routes
 *
 * Native Supabase authentication integration with Hono API server
 * Provides authentication endpoints for the healthcare platform
 *
 * @version 2.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM
 */

import { createAdminClient } from '@/clients/supabase'
import { EnhancedSessionManager } from '@/security/enhanced-session-manager'
import { SessionCookieUtils } from '@/security/session-cookie-utils'
import { logger } from '@/utils/healthcare-errors'
import { Hono } from 'hono'

const authApp = new Hono()

// Supabase Auth endpoints proxy
authApp.post('/sign-up', async c => {
  try {
    const { email, password, ...metadata } = await c.req.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata,
    })

    // Healthcare audit logging
    logger.info('User signup attempt', {
      email: email.substring(0, 3) + '***', // LGPD privacy
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    })

    if (error) {
      return c.json({ error: error.message }, 400)
    }

    return c.json({ data })
  } catch (error) {
    logger.error('Auth signup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return c.json({ error: 'Signup service error' }, 500)
  }
})

authApp.post('/sign-in', async c => {
  try {
    const { email, password } = await c.req.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Healthcare audit logging
    logger.info('User signin attempt', {
      email: email.substring(0, 3) + '***', // LGPD privacy
      success: !error,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    })

    if (error) {
      return c.json({ error: error.message }, 400)
    }

    return c.json({ data })
  } catch (error) {
    logger.error('Auth signin error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return c.json({ error: 'Signin service error' }, 500)
  }
})

authApp.post('/sign-out', async c => {
  try {
    const supabase = createAdminClient()

    // Enhanced session cleanup for healthcare compliance
    try {
      // Initialize EnhancedSessionManager and SessionCookieUtils
      const sessionManager = new EnhancedSessionManager()
      const cookieUtils = new SessionCookieUtils()

      // Get user information from Supabase for enhanced session cleanup BEFORE signOut
      const { data: { user } } = await supabase.auth.getUser()

      // Now perform Supabase signOut
      const { error } = await supabase.auth.signOut()

      if (error) {
        return c.json({ error: error.message }, 400)
      }

      if (user) {
        // Clean up enhanced sessions with specific user ID
        const removedCount = sessionManager.removeAllUserSessions(user.id)

        // Create cleanup cookies for session termination
        const cleanupCookies = cookieUtils.createCleanupCookies()

        // Set cleanup cookies in response
        cleanupCookies.forEach(cookie => {
          c.header('Set-Cookie', cookie)
        })

        // Healthcare audit logging
        logger.info('Enhanced session cleanup completed', {
          action: 'sign_out',
          userId: user.id,
          sessionsRemoved: removedCount,
          timestamp: new Date().toISOString(),
          compliance: 'LGPD compliant',
        })
      } else {
        logger.warn('User context not available for enhanced session cleanup', {
          action: 'sign_out_partial',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (sessionError) {
      // Log session cleanup error but don't fail the sign-out
      logger.error('Session cleanup warning during sign-out', {
        error: sessionError instanceof Error ? sessionError.message : 'Unknown error',
      })
    }

    return c.json({
      success: true,
      message: 'Sign-out completed with enhanced session cleanup',
    })
  } catch (error) {
    logger.error('Auth signout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return c.json({ error: 'Signout service error' }, 500)
  }
})

authApp.get('/user', async c => {
  try {
    const authHeader = c.req.header('authorization')
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.getUser(token)

    if (error) {
      return c.json({ error: error.message }, 401)
    }

    return c.json({ data })
  } catch (error) {
    logger.error('Auth get user error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return c.json({ error: 'Get user service error' }, 500)
  }
})

// OAuth callback handling
authApp.get('/callback', async c => {
  try {
    const url = new URL(c.req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return c.json({ error: 'No authorization code provided' }, 400)
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return c.json({ error: error.message }, 400)
    }

    // Redirect to frontend with session
    const redirectUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/auth/callback?access_token=${data.session?.access_token}&refresh_token=${data.session?.refresh_token}`

    return c.redirect(redirectUrl)
  } catch (error) {
    logger.error('Auth callback error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return c.json({ error: 'Callback service error' }, 500)
  }
})

export { authApp }
