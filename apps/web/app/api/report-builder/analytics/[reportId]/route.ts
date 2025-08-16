// Report Analytics API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/analytics/[reportId] - Get analytics for specific report
export async function GET(
  _request: NextRequest,
  { params }: { params: { reportId: string } },
) {
  try {
    const reportId = params.reportId;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID is required',
        },
        { status: 400 },
      );
    }

    const analytics = await reportService.getReportAnalytics(reportId);

    if (!analytics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analytics not found for this report',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch report analytics',
      },
      { status: 500 },
    );
  }
}
