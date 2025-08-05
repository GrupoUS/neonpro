// =====================================================
// Resource Optimization API
// Story 2.4: Smart Resource Management - Optimization
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AllocationEngine } from '@/lib/resources/allocation-engine';
import { ResourceManager } from '@/lib/resources/resource-manager';

// =====================================================
// POST /api/resources/optimize - Get allocation suggestions
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { clinic_id, resource_type, start_time, end_time } = body;
    if (!clinic_id || !resource_type || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'clinic_id, resource_type, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize allocation engine and get suggestions
    const allocationEngine = new AllocationEngine();
    const optimization = await allocationEngine.suggestOptimalAllocation(
      clinic_id,
      body
    );

    return NextResponse.json({
      success: true,
      data: optimization,
      message: 'Allocation suggestions generated successfully'
    });

  } catch (error) {
    console.error('Error generating allocation suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate allocation suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET /api/resources/optimize/workload - Staff workload optimization
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!clinicId || !date) {
      return NextResponse.json(
        { error: 'clinic_id and date are required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize allocation engine and optimize workload
    const allocationEngine = new AllocationEngine();
    const optimization = await allocationEngine.optimizeStaffWorkload(clinicId, date);

    return NextResponse.json({
      success: true,
      data: optimization,
      message: 'Staff workload optimization completed'
    });

  } catch (error) {
    console.error('Error optimizing staff workload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize staff workload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
