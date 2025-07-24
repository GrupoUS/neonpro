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

    // Extend session if needed
    const extended = await sessionManager.extendSessionIfNeeded(sessionId);

    // Log security event
    await securityAuditFramework.logSecurityEvent({
      eventType: 'authentication',
      severity: 'low',
      userId: session.user.id,
      sessionId,
      resource: 'session',
      action: 'extend_attempt',
      outcome: extended ? 'success' : 'failure',
      metadata: { extended, userAgent },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      extended,
      message: extended ? 'Session extended successfully' : 'Session extension not needed',
    });

  } catch (error) {
    console.error('Session extend error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}