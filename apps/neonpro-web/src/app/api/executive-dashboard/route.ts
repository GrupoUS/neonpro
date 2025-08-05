// Executive Dashboard API - Main Dashboard Data
// Story 7.1: Executive Dashboard Implementation
// GET /api/executive-dashboard

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executiveDashboardService } from '@/lib/services/executive-dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const periodType = searchParams.get('period_type') || 'monthly';

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' }, 
        { status: 400 }
      );
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .eq('clinic_id', clinicId)
      .single();

    if (!professional) {
      return NextResponse.json(
        { error: 'Access denied to this clinic' }, 
        { status: 403 }
      );
    }

    // Get comprehensive dashboard data
    const dashboardData = await executiveDashboardService.getDashboardData(
      clinicId,
      user.id,
      periodType
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        clinic_id: clinicId,
        user_id: user.id,
        period_type: periodType,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Executive dashboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
