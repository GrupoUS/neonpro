/**
 * Session Refresh API Route
 * Refreshes an existing session and extends its expiry time
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SessionManager } from '@/lib/auth/session/SessionManager';
import { createClient } from '@/lib/supabase/server';
import {
  SecurityEventType,
  SecuritySeverity
} from '@/types/session';

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
      sessionCleanupInterval: 300000,
      securityEventRetention: 30 * 24 * 60 * 60 * 1000,
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production'
    });
  }
  return sessionManager;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      );
    }

    const manager = await getSessionManager();
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Validate current session first
    const validation = await manager.validateSession(sessionToken, {
      ip_address: clientIP,
      user_agent: userAgent
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get current session
    const currentSession = await manager.getSession(sessionToken);
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Refresh the session (extend expiry time)
    const refreshedSession = await manager.refreshSession(sessionToken);
    
    if (!refreshedSession) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 500 }
      );
    }

    // Log session refresh event
    await manager.logSecurityEvent({
      session_id: sessionToken,
      event_type: SecurityEventType.SESSION_REFRESHED,
      severity: SecuritySeverity.LOW,
      description: 'Session refreshed successfully',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        old_expires_at: currentSession.expires_at,
        new_expires_at: refreshedSession.expires_at,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(refreshedSession);

  } catch (error) {
    console.error('Session refresh error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error during session refresh' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}