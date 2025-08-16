// Data Sources API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/data-sources - Get all available data sources
export async function GET(_request: NextRequest) {
  try {
    const dataSources = await reportService.getDataSources();

    return NextResponse.json({
      success: true,
      data: dataSources,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch data sources',
      },
      { status: 500 },
    );
  }
}
