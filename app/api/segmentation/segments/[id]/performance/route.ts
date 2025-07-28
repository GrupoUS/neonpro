import { patientSegmentationService } from '@/app/lib/services/patient-segmentation-service';
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get segment performance
    const performance = await patientSegmentationService.getSegmentPerformance(id);

    return NextResponse.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('Error fetching segment performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment performance' },
      { status: 500 }
    );
  }
}
