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
    const period = searchParams.get('period') || 'monthly';
    const type = searchParams.get('type') || 'revenue'; // revenue, appointments

    if (type === 'revenue') {
      // Get revenue trends
      const { data: revenueTrends, error: trendsError } = await supabase
        .rpc('get_revenue_trends', {
          p_clinic_id: clinicId,
          p_period: period,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (trendsError) {
        console.error('Error fetching revenue trends:', trendsError);
        return NextResponse.json(
          { error: 'Failed to fetch revenue trends' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        type: 'revenue',
        trends: revenueTrends || [],
        period: period,
        dateRange: {
          start_date: startDate,
          end_date: endDate
        }
      });
    }

    if (type === 'appointments') {
      // Get appointment trends
      const { data: appointmentTrends, error: appointmentError } = await supabase
        .rpc('get_appointment_trends', {
          p_clinic_id: clinicId,
          p_period: period,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (appointmentError) {
        console.error('Error fetching appointment trends:', appointmentError);
        return NextResponse.json(
          { error: 'Failed to fetch appointment trends' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        type: 'appointments',
        trends: appointmentTrends || [],
        period: period,
        dateRange: {
          start_date: startDate,
          end_date: endDate
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid trend type. Use "revenue" or "appointments"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}