// app/api/automated-analysis/route.ts// Main API endpoints for Story 10.1: Automated Before/After Analysis
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { automatedBeforeAfterAnalysisService } from '@/app/lib/services/automated-before-after-analysis';
import { validationSchemas } from '@/app/lib/validations/automated-before-after-analysis';

// GET /api/automated-analysis - Get analysis sessions with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams();
    const filters = {
      patient_id: searchParams.get('patient_id') || undefined,
      treatment_type: searchParams.get('treatment_type') || undefined,
      analysis_type: (searchParams.get('analysis_type') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      accuracy_min: searchParams.get('accuracy_min')
        ? Number(searchParams.get('accuracy_min'))
        : undefined,
      created_by: searchParams.get('created_by') || undefined,
    };

    // Validate filters    const validatedFilters =
    validationSchemas.analysisSessionFilters.parse(filters);

    const sessions =
      await automatedBeforeAfterAnalysisService.getAnalysisSessions(
        validatedFilters,
      );

    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch analysis sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST /api/automated-analysis - Create new analysis session
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const _body = await request.json();

    // Validate request body    const validatedData = validationSchemas.createAnalysisSession.parse(body);

    const session =
      await automatedBeforeAfterAnalysisService.createAnalysisSession(
        validatedData,
      );

    return NextResponse.json(
      {
        success: true,
        data: session,
        message: 'Analysis session created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create analysis session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// PUT /api/automated-analysis - Update analysis session
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
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }

    // Validate updates    const validatedUpdates =
    validationSchemas.updateAnalysisSession.parse(updates);

    const updatedSession =
      await automatedBeforeAfterAnalysisService.updateAnalysisSession(
        id,
        validatedUpdates,
      );

    return NextResponse.json({
      success: true,
      data: updatedSession,
      message: 'Analysis session updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update analysis session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// DELETE /api/automated-analysis - Delete analysis session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await (await supabase).auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams();
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }

    await automatedBeforeAfterAnalysisService.deleteAnalysisSession(id);

    return NextResponse.json({
      success: true,
      message: 'Analysis session deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete analysis session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = any;

export type SessionValidationResult = any;
