import { patientSegmentationService } from '@/app/lib/services/patient-segmentation-service';
import { CreateSegmentSchema } from '@/app/lib/validations/segmentation';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const segmentType = searchParams.get('segment_type');
    const minAccuracy = searchParams.get('min_accuracy');

    const filters: any = {};
    if (isActive !== null) filters.is_active = isActive === 'true';
    if (segmentType) filters.segment_type = segmentType;
    if (minAccuracy) filters.min_accuracy = parseFloat(minAccuracy);

    const segments = await patientSegmentationService.getPatientSegments(filters);

    return NextResponse.json({
      success: true,
      data: segments,
      total: segments.length
    });

  } catch (error) {
    console.error('Error fetching patient segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient segments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = CreateSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Map validation schema to service interface
    const segmentData = {
      segment_name: validationResult.data.name,
      description: validationResult.data.description,
      criteria: validationResult.data.criteria as any, // Type casting for compatibility
      segment_type: validationResult.data.segment_type,
      ai_model: undefined,
      expected_accuracy: undefined
    };

    const segment = await patientSegmentationService.createAISegment(segmentData);

    return NextResponse.json({
      success: true,
      data: segment,
      message: 'AI-powered segment created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating patient segment:', error);
    return NextResponse.json(
      { error: 'Failed to create patient segment' },
      { status: 500 }
    );
  }
}
