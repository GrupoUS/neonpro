import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { IntegratedSessionSecurity } from '@/lib/security/integrated-session-security';

/**
 * Session Security API Route
 * Handles session management, validation, and security operations
 */

const sessionSecurity = new IntegratedSessionSecurity();

/**
 * POST /api/security/session
 * Initialize session security for a user
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { sessionId, maxConcurrentSessions = 3 } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }

    // Initialize session security
    const result = await sessionSecurity.initializeSessionSecurity(
      authResult.user?.id,
      sessionId,
      request,
      { maxConcurrentSessions },
    );

    return NextResponse.json({
      message: 'Session security initialized successfully',
      sessionId,
      csrfToken: result.csrfToken,
      fingerprint: result.fingerprint,
      timeoutConfig: result.timeoutConfig,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to initialize session security' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/security/session
 * Validate session security and update activity
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, activityType = 'api_call' } = body;

    if (!(sessionId && userId)) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 },
      );
    }

    // Perform comprehensive security check
    const securityCheck = await sessionSecurity.performSecurityCheck(
      userId,
      sessionId,
      request,
    );

    if (!securityCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Session security validation failed',
          reason: securityCheck.reason,
          action: securityCheck.action,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Session security validated successfully',
      securityStatus: securityCheck,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to validate session security' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/security/session
 * Get session security status and information
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }

    // Get session security status
    const status = await sessionSecurity.getSessionSecurityStatus(
      authResult.user?.id,
      sessionId,
    );

    return NextResponse.json({
      sessionId,
      userId: authResult.user?.id,
      securityStatus: status,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to get session security status' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/security/session
 * Terminate session and cleanup security data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const terminateAll = searchParams.get('terminateAll') === 'true';

    if (!(sessionId || terminateAll)) {
      return NextResponse.json(
        { error: 'Session ID is required or set terminateAll=true' },
        { status: 400 },
      );
    }

    if (terminateAll) {
      // Terminate all sessions for the user
      await sessionSecurity.terminateAllUserSessions(authResult.user?.id);
      return NextResponse.json({
        message: 'All user sessions terminated successfully',
      });
    }
    // Terminate specific session
    await sessionSecurity.terminateSession(authResult.user?.id, sessionId!);
    return NextResponse.json({
      message: 'Session terminated successfully',
      sessionId,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 },
    );
  }
}
