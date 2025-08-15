// Custom Reports API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';
import { CreateReportRequest } from '@/app/lib/validations/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/reports - Get all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const perPage = Number.parseInt(searchParams.get('per_page') || '10', 10);
    const search = searchParams.get('search') || undefined;
    const visualizationType =
      searchParams.get('visualization_type') || undefined;
    const isTemplate =
      searchParams.get('is_template') === 'true'
        ? true
        : searchParams.get('is_template') === 'false'
          ? false
          : undefined;

    const filters = {
      search,
      visualization_type: visualizationType,
      is_template: isTemplate,
    };

    const result = await reportService.getReports(page, perPage, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch reports',
      },
      { status: 500 }
    );
  }
}

// POST /api/report-builder/reports - Create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateReportRequest.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const report = await reportService.createReport(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create report',
      },
      { status: 500 }
    );
  }
}
