/**
 * ANVISA Compliance Alerts API Route
 * Handles compliance alerts, notifications, and automated warnings
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
    const alertType = searchParams.get('alert_type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const resolved = searchParams.get('resolved');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const filters = {
      clinicId,
      alertType: alertType || undefined,
      severity: severity || undefined,
      status: status || undefined,
      resolved:
        resolved === 'true' ? true : resolved === 'false' ? false : undefined,
    };

    const alerts = await anvisaAPI.getComplianceAlerts(filters);
    return NextResponse.json({
      success: true,
      data: alerts,
      meta: { total: alerts.length, filters },
    });
  } catch (error) {
    console.error('Error in ANVISA alerts GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alertData = await request.json();

    // Validate required fields
    const requiredFields = ['clinic_id', 'alert_type', 'severity', 'message'];
    const missingFields = requiredFields.filter((field) => !alertData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newAlert = await anvisaAPI.createComplianceAlert(alertData);
    return NextResponse.json(
      {
        success: true,
        data: newAlert,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ANVISA alerts POST:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
