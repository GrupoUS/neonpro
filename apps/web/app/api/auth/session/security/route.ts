/**
 * Security Events API Route
 * Manages security events and monitoring
 */

import { type NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/session-manager';
import { createClient } from '@/lib/supabase/server';
import type { SecurityEventType, SecuritySeverity } from '@/types/session';

// Initialize session manager
let sessionManager: SessionManager | null = null;

async function getSessionManager() {
  if (!sessionManager) {
    const supabase = createClient();
    sessionManager = new SessionManager(supabase, {
      defaultTimeout: 30,
      maxConcurrentSessions: 5,
      enableDeviceTracking: true,
      enableSecurityMonitoring: true,
      enableSuspiciousActivityDetection: true,
      sessionCleanupInterval: 300_000,
      securityEventRetention: 30 * 24 * 60 * 60 * 1000,
      encryptionKey:
        process.env.SESSION_ENCRYPTION_KEY ||
        'default-key-change-in-production',
    });
  }
  return sessionManager;
}

// Get security events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const eventType = searchParams.get('eventType');
    const severity = searchParams.get('severity');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const manager = await getSessionManager();

    // Build filters
    const filters: any = {};
    if (userId) {
      filters.user_id = userId;
    }
    if (sessionId) {
      filters.session_id = sessionId;
    }
    if (eventType) {
      filters.event_type = eventType;
    }
    if (severity) {
      filters.severity = severity;
    }
    if (startDate) {
      filters.start_date = startDate;
    }
    if (endDate) {
      filters.end_date = endDate;
    }

    const events = await manager.getSecurityEvents(filters, limit, offset);
    const totalCount = await manager.getSecurityEventsCount(filters);

    return NextResponse.json({
      events,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error while fetching security events' },
      { status: 500 },
    );
  }
}

// Create security event
export async function POST(request: NextRequest) {
  try {
    const { sessionId, eventType, severity, description, metadata } =
      await request.json();

    if (!(sessionId && eventType && severity && description)) {
      return NextResponse.json(
        {
          error:
            'Session ID, event type, severity, and description are required',
        },
        { status: 400 },
      );
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Log security event
    const event = await manager.logSecurityEvent({
      session_id: sessionId,
      event_type: eventType as SecurityEventType,
      severity: severity as SecuritySeverity,
      description,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: metadata || {},
    });

    return NextResponse.json({ event });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error during security event creation' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
