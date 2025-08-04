import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const clinicId = searchParams.get('clinic_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get KPIs using the database function
    const { data: kpis, error: kpisError } = await supabase
      .rpc('get_clinic_kpis', {
        p_clinic_id: clinicId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (kpisError) {
      console.error('Error fetching KPIs:', kpisError);
      return NextResponse.json(
        { error: 'Failed to fetch KPIs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      kpis: kpis || [],
      period: {
        start_date: startDate,
        end_date: endDate
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}