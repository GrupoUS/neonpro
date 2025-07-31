import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf-protection';
import { requireAuth } from '@/lib/auth';

/**
 * CSRF Token API Route
 * Handles CSRF token generation and validation
 */

const csrfProtection = new CSRFProtection();

/**
 * POST /api/security/csrf-token
 * Generate a new CSRF token for the session
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Generate CSRF token
    const token = await csrfProtection.generateToken(
      sessionId,
      request.headers.get('user-agent') || '',
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      request.ip || 'unknown'
    );

    return NextResponse.json({
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      sessionId
    });

  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/security/csrf-token
 * Validate a CSRF token
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, sessionId } = body;

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: 'Token and session ID are required' },
        { status: 400 }
      );
    }

    // Validate CSRF token
    const isValid = await csrfProtection.validateToken(token, sessionId);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'CSRF token is valid'
    });

  } catch (error) {
    console.error('CSRF token validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/security/csrf-token
 * Invalidate CSRF tokens for a session
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Invalidate tokens for the session
    await csrfProtection.invalidateSessionTokens(sessionId);

    return NextResponse.json({
      message: 'CSRF tokens invalidated successfully'
    });

  } catch (error) {
    console.error('CSRF token invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate CSRF tokens' },
      { status: 500 }
    );
  }
}