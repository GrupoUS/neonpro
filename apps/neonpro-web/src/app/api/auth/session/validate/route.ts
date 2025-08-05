/**
 * Session Validation API Route
 * Validates current session and returns security information
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SessionManager } from '@/lib/auth/session/SessionManager';
import { createClient } from '@/lib/supabase/server';
import {
  SessionValidationResult,
  SecurityEventType,
  SecuritySeverity
} from '@/types/session';

// Initialize session manager
let sessionManager: SessionManager | null = null;

async function getSessionManager() {
  if (!sessionManager) {
    const supabase = await createClient();
    sessionManager = new SessionManager(supabase, {
      defaultTimeout: 30,
      maxConcurrentSessions: 5,
      enableDeviceTracking: true,
      enableSecurityMonitoring: true,
      enableSuspiciousActivityDetection: true,
      sessionCleanupInterval: 300000, // 5 minutes
      securityEventRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production'
    });
  }
  return sessionManager;
}

export async function POST(request: NextRequest) {
  try {
// Cookie instantiation moved inside request handlers;
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({
        valid: false,
        errors: ['No session token found'],
        security_score: 0
      } as SessionValidationResult, { status: 401 });
    }

    const manager = await getSessionManager();
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Validate session
    const validation = await manager.validateSession(sessionToken, {
      ip_address: clientIP,
      user_agent: userAgent
    });

    if (!validation.valid) {
      // Log failed validation attempt
      await manager.logSecurityEvent({
        session_id: sessionToken,
        event_type: SecurityEventType.SESSION_VALIDATION_FAILED,
        severity: SecuritySeverity.MEDIUM,
        description: `Session validation failed: ${validation.errors?.join(', ')}`,
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          validation_errors: validation.errors,
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json(validation, { status: 401 });
    }

    // Get session details
    const session = await manager.getSession(sessionToken);
    if (!session) {
      return NextResponse.json({
        valid: false,
        errors: ['Session not found'],
        security_score: 0
      } as SessionValidationResult, { status: 404 });
    }

    // Update last activity
    await manager.updateLastActivity(sessionToken);

    // Check for security warnings
    const warnings: string[] = [];
    
    // Check for IP address changes
    if (session.ip_address !== clientIP) {
      warnings.push('IP address has changed since session creation');
      
      // Log IP change event
      await manager.logSecurityEvent({
        session_id: sessionToken,
        event_type: SecurityEventType.IP_ADDRESS_CHANGE,
        severity: SecuritySeverity.MEDIUM,
        description: `IP address changed from ${session.ip_address} to ${clientIP}`,
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          old_ip: session.ip_address,
          new_ip: clientIP,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check for user agent changes
    if (session.user_agent !== userAgent) {
      warnings.push('Browser or device information has changed');
      
      // Log user agent change event
      await manager.logSecurityEvent({
        session_id: sessionToken,
        event_type: SecurityEventType.USER_AGENT_CHANGE,
        severity: SecuritySeverity.LOW,
        description: 'User agent changed during session',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          old_user_agent: session.user_agent,
          new_user_agent: userAgent,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check session age
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    const hoursOld = sessionAge / (1000 * 60 * 60);
    
    if (hoursOld > 24) {
      warnings.push('Session is older than 24 hours');
    }

    // Check for concurrent sessions
    const activeSessions = await manager.getActiveSessionsForUser(session.user_id);
    if (activeSessions.length > 3) {
      warnings.push(`Multiple active sessions detected (${activeSessions.length})`);
    }

    // Calculate security score
    let securityScore = 100;
    securityScore -= warnings.length * 10;
    securityScore -= Math.min(30, Math.floor(hoursOld / 24) * 10); // Deduct for age
    securityScore = Math.max(0, securityScore);

    // Log successful validation
    await manager.logSecurityEvent({
      session_id: sessionToken,
      event_type: SecurityEventType.SESSION_VALIDATED,
      severity: SecuritySeverity.LOW,
      description: 'Session validated successfully',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        security_score: securityScore,
        warnings_count: warnings.length,
        timestamp: new Date().toISOString()
      }
    });

    const result: SessionValidationResult = {
      valid: true,
      session: session,
      warnings: warnings.length > 0 ? warnings : undefined,
      security_score: securityScore
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Session validation error:', error);
    
    return NextResponse.json({
      valid: false,
      errors: ['Internal server error during session validation'],
      security_score: 0
    } as SessionValidationResult, { status: 500 });
  }
}

// Handle preflight requests
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

