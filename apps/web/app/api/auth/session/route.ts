// =====================================================
// Session Management API Routes
// Story 1.4: Session Management & Security
// =====================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UnifiedSessionSystem } from '@/lib/auth/session';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const extendSessionSchema = z.object({
  sessionId: z.string().uuid(),
  extendBy: z.number().min(1).max(120).optional(), // minutes
});

const validateSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

const updateActivitySchema = z.object({
  sessionId: z.string().uuid(),
  activityType: z.string(),
  metadata: z.record(z.any()).optional(),
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return '127.0.0.1';
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

async function initializeSessionSystem() {
  const supabase = createRouteHandlerClient({ cookies });
  return new UnifiedSessionSystem(supabase);
}

// =====================================================
// GET - Get Session Information
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const sessionSystem = await initializeSessionSystem();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate session ID format
    const validation = validateSessionSchema.safeParse({ sessionId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Get session information
    const session = await sessionSystem.sessionManager.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get additional session data
    const [activities, securityScore] = await Promise.all([
      sessionSystem.sessionManager.getSessionActivities(sessionId),
      sessionSystem.sessionManager.calculateSecurityScore(sessionId),
    ]);

    return NextResponse.json({
      session,
      activities: activities.slice(0, 10), // Last 10 activities
      securityScore,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create or Extend Session
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();
    const { action } = body;

    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    switch (action) {
      case 'extend': {
        const validation = extendSessionSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request data', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { sessionId, extendBy = 30 } = validation.data;

        // Extend session
        const success = await sessionSystem.sessionManager.extendSession(
          sessionId,
          extendBy
        );

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to extend session' },
            { status: 400 }
          );
        }

        // Log security event
        await sessionSystem.securityEventLogger.logEvent({
          type: 'session_extended',
          severity: 'low',
          description: `Session extended by ${extendBy} minutes`,
          sessionId,
          ipAddress: clientIP,
          userAgent,
          metadata: { extendBy },
        });

        return NextResponse.json({
          success: true,
          message: `Session extended by ${extendBy} minutes`,
          timestamp: new Date().toISOString(),
        });
      }

      case 'validate': {
        const validation = validateSessionSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request data', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { sessionId } = validation.data;

        // Validate session
        const isValid =
          await sessionSystem.sessionManager.validateSession(sessionId);
        const session = isValid
          ? await sessionSystem.sessionManager.getSession(sessionId)
          : null;

        return NextResponse.json({
          valid: isValid,
          session,
          timestamp: new Date().toISOString(),
        });
      }

      case 'activity': {
        const validation = updateActivitySchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request data', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { sessionId, activityType, metadata } = validation.data;

        // Record activity
        await sessionSystem.sessionManager.recordActivity(
          sessionId,
          activityType,
          {
            ...metadata,
            ipAddress: clientIP,
            userAgent,
          }
        );

        return NextResponse.json({
          success: true,
          message: 'Activity recorded',
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update Session
// =====================================================

export async function PUT(request: NextRequest) {
  try {
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();
    const { sessionId, updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate session exists
    const session = await sessionSystem.sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session
    const success = await sessionSystem.sessionManager.updateSession(
      sessionId,
      updates
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 400 }
      );
    }

    // Log security event
    await sessionSystem.securityEventLogger.logEvent({
      type: 'session_updated',
      severity: 'low',
      description: 'Session information updated',
      sessionId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { updates },
    });

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Terminate Session
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const sessionSystem = await initializeSessionSystem();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate session ID format
    const validation = validateSessionSchema.safeParse({ sessionId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Terminate session
    const success =
      await sessionSystem.sessionManager.terminateSession(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to terminate session' },
        { status: 400 }
      );
    }

    // Log security event
    await sessionSystem.securityEventLogger.logEvent({
      type: 'session_terminated',
      severity: 'medium',
      description: 'Session manually terminated',
      sessionId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      success: true,
      message: 'Session terminated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
