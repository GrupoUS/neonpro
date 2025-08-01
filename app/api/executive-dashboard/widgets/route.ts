// Executive Dashboard API - Widgets Management
// Story 7.1: Executive Dashboard Implementation
// GET/PUT /api/executive-dashboard/widgets

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { executiveDashboardService } from '@/src/lib/services/executive-dashboard';

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

    // Get user's dashboard widgets
    const widgets = await executiveDashboardService.getDashboardWidgets(
      clinicId,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: widgets,
      metadata: {
        clinic_id: clinicId,
        user_id: user.id,
        count: widgets.length
      }
    });

  } catch (error) {
    console.error('Widgets API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch widgets',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}