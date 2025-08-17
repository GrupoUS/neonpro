/**
 * ANVISA Compliance API Route
 * Handles compliance monitoring, scoring, and reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI } from '@/lib/api/anvisa';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    switch (reportType) {
      case 'score':
        const complianceScore =
          await anvisaAPI.calculateClinicComplianceScore(clinicId);
        return NextResponse.json({
          success: true,
          data: complianceScore,
          meta: { type: 'compliance_score' },
        });

      case 'report':
        const complianceReport = await anvisaAPI.generateComplianceReport(
          clinicId,
          startDate || undefined,
          endDate || undefined
        );
        return NextResponse.json({
          success: true,
          data: complianceReport,
          meta: { type: 'compliance_report' },
        });

      default:
        // Return both score and basic compliance data
        const [score, alerts] = await Promise.all([
          anvisaAPI.calculateClinicComplianceScore(clinicId),
          anvisaAPI.getAlerts(clinicId),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            compliance_score: score,
            active_alerts: alerts,
            summary: {
              total_alerts: alerts.length,
              high_priority_alerts: alerts.filter((a) => a.priority === 'high')
                .length,
            },
          },
          meta: { type: 'compliance_overview' },
        });
    }
  } catch (error) {
    console.error('Error in ANVISA compliance GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}
