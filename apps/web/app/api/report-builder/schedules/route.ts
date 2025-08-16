// Report Schedules API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';
import { CreateReportScheduleRequest } from '@/app/lib/validations/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/schedules - Get all report schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('report_id');

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID is required',
        },
        { status: 400 },
      );
    }

    const result = await reportService.getSchedules(reportId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch report schedules',
      },
      { status: 500 },
    );
  }
}

// POST /api/report-builder/schedules - Create new report schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateReportScheduleRequest.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const schedule = await reportService.createSchedule(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: schedule,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create report schedule',
      },
      { status: 500 },
    );
  }
}
