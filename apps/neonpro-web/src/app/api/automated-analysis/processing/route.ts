// app/api/automated-analysis/processing/route.ts
// API endpoints for analysis processing and comparison operations

import { automatedBeforeAfterAnalysisService } from '@/app/lib/services/automated-before-after-analysis';
import { validationSchemas } from '@/app/lib/validations/automated-before-after-analysis';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server';

// POST /api/automated-analysis/processing - Start analysis processing
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'start_analysis': {
        // Validate start analysis request
        const validatedData = validationSchemas.startAnalysis.parse(data);
        const progress = await automatedBeforeAfterAnalysisService.startAnalysis(validatedData);

        return NextResponse.json({
          success: true,
          data: progress,
          message: 'Analysis started successfully',
        });
      }

      case 'comparison_analysis': {
        // Validate comparison analysis request
        const validatedData = validationSchemas.comparisonAnalysis.parse(data);
        const result = await automatedBeforeAfterAnalysisService.performComparisonAnalysis(validatedData);

        return NextResponse.json({
          success: true,
          data: result,
          message: 'Comparison analysis completed successfully',
        });
      }

      case 'batch_analysis': {
        // Validate batch analysis request
        const validatedData = validationSchemas.batchAnalysis.parse(data);
        const results = await automatedBeforeAfterAnalysisService.batchAnalysis(validatedData);

        return NextResponse.json({
          success: true,
          data: results,
          message: 'Batch analysis started successfully',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing analysis request:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/automated-analysis/processing - Get analysis progress
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const progress = await automatedBeforeAfterAnalysisService.getAnalysisProgress(sessionId);

    return NextResponse.json({
      success: true,
      data: progress,
    });

  } catch (error) {
    console.error('Error fetching analysis progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
