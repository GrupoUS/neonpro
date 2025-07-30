/**
 * ROI Dashboard Metrics API Routes
 * /api/marketing-roi/dashboard-metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { marketingROIService } from '@/app/lib/services/marketing-roi-service';

// Utility functions
async function validateUserAndClinic(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const clinicId = request.nextUrl.searchParams.get('clinic_id');
  if (!clinicId) {
    return { error: NextResponse.json({ error: 'clinic_id is required' }, { status: 400 }) };
  }

  const { data: userClinic, error: clinicError } = await supabase
    .from('user_clinics')
    .select('role')
    .eq('user_id', user.id)
    .eq('clinic_id', clinicId)
    .single();

  if (clinicError || !userClinic) {
    return { error: NextResponse.json({ error: 'Access denied to clinic' }, { status: 403 }) };
  }

  return { user, clinicId, userRole: userClinic.role };
}

function getDateRangeParams(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get('start_date');
  const endDate = request.nextUrl.searchParams.get('end_date');
  
  return {
    start_date: startDate ? new Date(startDate) : undefined,
    end_date: endDate ? new Date(endDate) : undefined
  };
}

/**
 * GET /api/marketing-roi/dashboard-metrics
 * Get comprehensive ROI dashboard metrics
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) return validation.error;
    
    const { clinicId } = validation;
    const { start_date, end_date } = getDateRangeParams(request);
    
    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }
    
    const includeTrends = request.nextUrl.searchParams.get('include_trends') === 'true';
    const includeComparisons = request.nextUrl.searchParams.get('include_comparisons') === 'true';
    const includeForecasts = request.nextUrl.searchParams.get('include_forecasts') === 'true';
    
    const dashboardMetrics = await marketingROIService.getROIDashboardMetrics(
      clinicId,
      start_date,
      end_date,
      includeTrends,
      includeComparisons,
      includeForecasts
    );
    
    return NextResponse.json(dashboardMetrics);
  } catch (error: any) {
    console.error('[Marketing ROI API] GET dashboard metrics:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}