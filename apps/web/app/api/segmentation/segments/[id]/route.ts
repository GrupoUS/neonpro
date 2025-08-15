import { type NextRequest, NextResponse } from 'next/server';
import { patientSegmentationService } from '@/app/lib/services/patient-segmentation-service';
import { UpdateSegmentSchema } from '@/app/lib/validations/segmentation';
import { createClient } from '@/app/utils/supabase/server';

interface RouteParams {
  id: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get segment analytics
    const analytics = await patientSegmentationService.getSegmentAnalytics(id);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching segment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment analytics' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const validationResult = UpdateSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update segment in database
    const { error } = await supabase
      .from('patient_segments')
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Segment updated successfully',
    });
  } catch (error) {
    console.error('Error updating segment:', error);
    return NextResponse.json(
      { error: 'Failed to update segment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('patient_segments')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Segment deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating segment:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate segment' },
      { status: 500 }
    );
  }
}
