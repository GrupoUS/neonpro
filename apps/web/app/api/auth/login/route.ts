import { RealAuthService, } from '@neonpro/security'
import type { NextRequest, } from 'next/server'
import { NextResponse, } from 'next/server'

// Validate required environment variables
function validateEnvironmentVariables(): {
  supabaseUrl: string
  supabaseAnonKey: string
  jwtSecret: string
} {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const jwtSecret = process.env.JWT_SECRET

  const missingVars: string[] = []

  if (!supabaseUrl) missingVars.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL',)
  if (!supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',)
  if (!jwtSecret) missingVars.push('JWT_SECRET',)

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ',)}`,)
  }

  return { supabaseUrl: supabaseUrl!, supabaseAnonKey: supabaseAnonKey!, jwtSecret: jwtSecret!, }
}

// Lazy, typed getter for auth service
let authService: RealAuthService | undefined
function getAuthService(): RealAuthService {
  if (!authService) {
    const { supabaseUrl, supabaseAnonKey, jwtSecret, } = validateEnvironmentVariables()
    authService = new RealAuthService(supabaseUrl, supabaseAnonKey, jwtSecret,)
  }
  return authService
}

export async function POST(request: NextRequest,) {
  try {
    const svc = getAuthService()
    const body = await request.json()
    const { email, password, deviceInfo, } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', },
        { status: 400, },
      )
    }

    const result = await svc.login({
      email,
      password,
      deviceInfo: deviceInfo || {
        userAgent: request.headers.get('user-agent',) || 'Unknown',
        ip: (() => {
          const xForwardedFor = request.headers.get('x-forwarded-for',)
          if (xForwardedFor) {
            // Parse comma-separated list and take the first IP
            return xForwardedFor.split(',',)[0]?.trim() || '127.0.0.1'
          }
          return request.headers.get('x-real-ip',) || '127.0.0.1'
        })(),
      },
    },)

    if (result.success) {
      // Sanitize response to exclude tokens from JSON body
      const sanitizedResult = {
        success: result.success,
        user: result.user,
        sessionId: result.sessionId,
        requiresMfa: result.requiresMfa,
      }

      const response = NextResponse.json(sanitizedResult,)

      // Set secure cookies for tokens
      if (result.accessToken) {
        response.cookies.set('neonpro_access_token', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24, // 24 hours
        },)
      }

      if (result.refreshToken) {
        response.cookies.set('neonpro_refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        },)
      }

      if (result.sessionId) {
        response.cookies.set('neonpro_session_id', result.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        },)
      }

      return response
    }

    return NextResponse.json(result, { status: 401, },)
  } catch (error) {
    console.error('Login API error:', error,)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Missing required environment variables',) ? 503 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 503
          ? 'Service unavailable: configuration error'
          : 'Internal server error',
      },
      { status, },
    )
  }
}
