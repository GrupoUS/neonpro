// SSO Logout Route
// Story 1.3: SSO Integration - Session Termination & Token Revocation

import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ssoManager } from '@/lib/auth/sso/sso-manager';
import { logger } from '@/lib/logger';

const logoutSchema = z.object({
  redirect_to: z.string().url().optional(),
  revoke_tokens: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  global_logout: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('sso_session');
    const userCookie = cookieStore.get('sso_user');

    // Parse request body for logout options
    let logoutOptions = {};
    try {
      const body = await request.json();
      const validationResult = logoutSchema.safeParse(body);
      if (validationResult.success) {
        logoutOptions = validationResult.data;
      }
    } catch {
      // Body parsing failed, use defaults
    }

    // Parse query parameters as fallback
    const { searchParams } = new URL(request.url);
    const queryValidation = logoutSchema.safeParse({
      redirect_to: searchParams.get('redirect_to'),
      revoke_tokens: searchParams.get('revoke_tokens'),
      global_logout: searchParams.get('global_logout'),
    });

    if (queryValidation.success) {
      logoutOptions = { ...logoutOptions, ...queryValidation.data };
    }

    const {
      redirect_to,
      revoke_tokens = true,
      global_logout = false,
    } = logoutOptions;

    let sessionId = null;
    let provider = null;
    let userId = null;

    // Extract session information
    if (sessionCookie) {
      sessionId = sessionCookie.value;
    }

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value);
        provider = userData.provider;
        userId = userData.id;
      } catch (error) {
        logger.warn('SSO logout: Failed to parse user cookie', {
          error: error.message,
        });
      }
    }

    // Perform logout operations
    if (sessionId) {
      try {
        await ssoManager.logout(sessionId, {
          revokeTokens: revoke_tokens,
          globalLogout: global_logout,
        });

        logger.info('SSO logout: Session terminated successfully', {
          sessionId,
          provider,
          userId,
          revokeTokens: revoke_tokens,
          globalLogout: global_logout,
        });
      } catch (error) {
        logger.error('SSO logout: Failed to terminate session', {
          sessionId,
          provider,
          error: error.message,
        });
        // Continue with cookie cleanup even if session termination fails
      }
    }

    // Clear all authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    cookieStore.set('sso_session', '', cookieOptions);
    cookieStore.set('sso_user', '', { ...cookieOptions, httpOnly: false });

    // Also clear any other auth-related cookies
    cookieStore.set('auth_token', '', cookieOptions);
    cookieStore.set('refresh_token', '', cookieOptions);
    cookieStore.set('user_session', '', cookieOptions);

    logger.info('SSO logout: Cookies cleared successfully', {
      provider,
      userId,
    });

    // Determine redirect URL
    let redirectUrl = '/auth/login';

    if (redirect_to) {
      try {
        // Validate redirect URL is safe (same origin)
        const redirectUrlObj = new URL(redirect_to, request.url);
        if (redirectUrlObj.origin === new URL(request.url).origin) {
          redirectUrl = redirect_to;
        }
      } catch (error) {
        logger.warn('SSO logout: Invalid redirect URL', {
          redirect_to,
          error: error.message,
        });
      }
    }

    // Add logout success parameter
    const finalUrl = new URL(redirectUrl, request.url);
    finalUrl.searchParams.set('logout', 'success');
    if (provider) {
      finalUrl.searchParams.set('provider', provider);
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      redirectUrl: finalUrl.toString(),
      provider,
    });
  } catch (error) {
    logger.error('SSO logout: Unexpected error', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'LOGOUT_FAILED',
        message: 'Failed to complete logout',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Support GET for simple logout links
export async function GET(request: NextRequest) {
  return POST(request);
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'PUT method not allowed' },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'DELETE method not allowed' },
    { status: 405 },
  );
}
