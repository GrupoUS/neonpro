import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/utils/supabase/server';
import { sessionManager } from '@/lib/auth/session-manager';
import { securityAuditFramework } from '@/lib/auth/security-audit-framework';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Validate session security
    const validation = await sessionManager.validateSessionSecurity(sessionId, {
      userAgent,
      ip,
    });

    // Manage concurrent sessions
    await sessionManager.manageConcurrentSessions(session.user.id, sessionId);

    // Log security validation
    await securityAuditFramework.logSecurityEvent({
      eventType: 'authentication',
      severity: validation.riskLevel === 'high' ? 'high' : 'low',
      userId: session.user.id,
      sessionId,
      resource: 'session',
      action: 'security_validation',
      outcome: validation.isValid ? 'success' : 'blocked',
      metadata: { riskLevel: validation.riskLevel, userAgent },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      riskLevel: validation.riskLevel,
      message: validation.isValid 
        ? 'Session is valid and secure' 
        : 'Session validation failed - high risk detected',
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}