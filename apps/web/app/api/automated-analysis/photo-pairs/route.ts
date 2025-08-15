// app/api/automated-analysis/photo-pairs/route.ts
// API endpoints for before/after photo pairs management

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { automatedBeforeAfterAnalysisService } from '@/app/lib/services/automated-before-after-analysis';
import { validationSchemas } from '@/app/lib/validations/automated-before-after-analysis';

// GET /api/automated-analysis/photo-pairs - Get photo pairs with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      session_id: searchParams.get('session_id') || undefined,
      treatment_area: searchParams.get('treatment_area') || undefined,
      pair_type: (searchParams.get('pair_type') as any) || undefined,
      analysis_status:
        (searchParams.get('analysis_status') as any) || undefined,
      improvement_min: searchParams.get('improvement_min')
        ? Number(searchParams.get('improvement_min'))
        : undefined,
      time_between_min: searchParams.get('time_between_min')
        ? Number(searchParams.get('time_between_min'))
        : undefined,
      time_between_max: searchParams.get('time_between_max')
        ? Number(searchParams.get('time_between_max'))
        : undefined,
    };

    // Validate filters
    const validatedFilters = validationSchemas.photoPairFilters.parse(filters);

    const photoPairs =
      await automatedBeforeAfterAnalysisService.getPhotoPairs(validatedFilters);

    return NextResponse.json({
      success: true,
      data: photoPairs,
      count: photoPairs.length,
    });
  } catch (error) {
    console.error('Error fetching photo pairs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch photo pairs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/automated-analysis/photo-pairs - Create new photo pair
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = validationSchemas.createPhotoPair.parse(body);

    const photoPair =
      await automatedBeforeAfterAnalysisService.createPhotoPair(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: photoPair,
        message: 'Photo pair created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating photo pair:', error);
    return NextResponse.json(
      {
        error: 'Failed to create photo pair',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/automated-analysis/photo-pairs - Update photo pair
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Photo pair ID is required' },
        { status: 400 }
      );
    }

    // Validate updates
    const validatedUpdates = validationSchemas.updatePhotoPair.parse(updates);

    const updatedPhotoPair =
      await automatedBeforeAfterAnalysisService.updatePhotoPair(
        id,
        validatedUpdates
      );

    return NextResponse.json({
      success: true,
      data: updatedPhotoPair,
      message: 'Photo pair updated successfully',
    });
  } catch (error) {
    console.error('Error updating photo pair:', error);
    return NextResponse.json(
      {
        error: 'Failed to update photo pair',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/automated-analysis/photo-pairs - Delete photo pair
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Photo pair ID is required' },
        { status: 400 }
      );
    }

    await automatedBeforeAfterAnalysisService.deletePhotoPair(id);

    return NextResponse.json({
      success: true,
      message: 'Photo pair deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting photo pair:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete photo pair',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
