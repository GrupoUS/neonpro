import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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

    const { start, end } = await request.json();

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    const period = {
      start: new Date(start),
      end: new Date(end),
    };

    // Generate compliance report
    const report = await securityAuditFramework.generateComplianceReport(period);

    // Log report generation
    await securityAuditFramework.logSecurityEvent({
      eventType: 'data_access',
      severity: 'medium',
      userId: session.user.id,
      resource: 'compliance_report',
      action: 'generate',
      outcome: 'success',
      metadata: { 
        period,
        reportId: crypto.randomUUID(),
        overallRiskScore: report.riskAssessment.overallRiskScore,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (error) {
    console.error('Compliance report generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
