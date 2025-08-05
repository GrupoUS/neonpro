// app/api/automated-analysis/reports/route.ts
// API endpoints for analysis reports generation and management

import { createautomatedBeforeAfterAnalysisService } from '@/app/lib/services/automated-before-after-analysis';
import { validationSchemas } from '@/app/lib/validations/automated-before-after-analysis';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server';

// GET /api/automated-analysis/reports - Get analysis reports with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      session_id: searchParams.get('session_id') || undefined,
      report_type: searchParams.get('report_type') as any || undefined,
      generated_by: searchParams.get('generated_by') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      is_public: searchParams.get('is_public') ? searchParams.get('is_public') === 'true' : undefined,
    };

    // Validate filters
    const validatedFilters = validationSchemas.reportFilters.parse(filters);

    const reports = await createautomatedBeforeAfterAnalysisService().getAnalysisReports(validatedFilters);

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });

  } catch (error) {
    console.error('Error fetching analysis reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/automated-analysis/reports - Generate new analysis report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = validationSchemas.generateReport.parse(body);

    const report = await createautomatedBeforeAfterAnalysisService().generateReport(validatedData);

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Analysis report generated successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating analysis report:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

