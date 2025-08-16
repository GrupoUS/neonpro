/**
 * ROI Alerts API Routes
 * /api/marketing-roi/alerts
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { marketingROIService } from '@/app/lib/services/marketing-roi-service';
import { CreateROIAlertSchema } from '@/app/types/marketing-roi';
import { createClient } from '@/app/utils/supabase/server';

// Utility functions
async function validateUserAndClinic(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const clinicId = request.nextUrl.searchParams.get('clinic_id');
  if (!clinicId) {
    return {
      error: NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      ),
    };
  }

  const { data: userClinic, error: clinicError } = await supabase
    .from('user_clinics')
    .select('role')
    .eq('user_id', user.id)
    .eq('clinic_id', clinicId)
    .single();

  if (clinicError || !userClinic) {
    return {
      error: NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      ),
    };
  }

  return { user, clinicId, userRole: userClinic.role };
}

/**
 * GET /api/marketing-roi/alerts
 * Get active ROI alerts
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) {
      return validation.error;
    }

    const { clinicId } = validation;
    const activeOnly =
      request.nextUrl.searchParams.get('active_only') !== 'false';

    const alerts = await marketingROIService.getROIAlerts(clinicId, activeOnly);

    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing-roi/alerts
 * Create a new ROI alert
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) {
      return validation.error;
    }

    const { clinicId, user } = validation;
    const body = await request.json();

    // Validate request body
    const validatedData = CreateROIAlertSchema.parse(body);

    const alert = await marketingROIService.createROIAlert(
      clinicId,
      validatedData,
      user.id
    );

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
