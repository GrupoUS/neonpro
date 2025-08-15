// Individual Report API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';
import { UpdateReportRequest } from '@/app/lib/validations/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/reports/[id] - Get specific report
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID is required',
        },
        { status: 400 }
      );
    }

    const report = await reportService.getReportById(reportId);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch report',
      },
      { status: 500 }
    );
  }
}

// PUT /api/report-builder/reports/[id] - Update specific report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID is required',
        },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = UpdateReportRequest.safeParse(body);
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

    const report = await reportService.updateReport(
      reportId,
      validationResult.data
    );

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update report',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/report-builder/reports/[id] - Delete specific report
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID is required',
        },
        { status: 400 }
      );
    }

    const success = await reportService.deleteReport(reportId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete report',
      },
      { status: 500 }
    );
  }
}
