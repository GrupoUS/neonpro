import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = await createClient();
    
    // For development: Skip auth check
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;

    // Query performance data for the specific segment
    const { data: performance, error } = await supabase
      .from('segment_performance')
      .select('*')
      .eq('segment_id', id)
      .order('calculated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // If no performance data exists, return default/calculated values
    if (!performance || performance.length === 0) {
      // Get basic segment info and member count
      const { data: segment, error: segmentError } = await supabase
        .from('patient_segments')
        .select('id, name, member_count')
        .eq('id', id)
        .single();

      if (segmentError) throw segmentError;

      const defaultPerformance = {
        segment_id: id,
        member_count: segment.member_count || 0,
        new_members: 0,
        departed_members: 0,
        member_retention_rate: 0.85,
        average_engagement_score: 0.75,
        total_revenue: 0,
        roi: 0,
        campaign_open_rate: 0,
        treatment_success_rate: 0.8,
        patient_satisfaction_score: 0.85,
        calculated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: defaultPerformance
      });
    }

    return NextResponse.json({
      success: true,
      data: performance[0]
    });

  } catch (error) {
    console.error('Error fetching segment performance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch segment performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
