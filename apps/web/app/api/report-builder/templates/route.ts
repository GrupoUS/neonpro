// Report Templates API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from 'next/server';
import { ReportBuilderService } from '@/app/lib/services/report-builder';
import { CreateReportTemplateRequest } from '@/app/lib/validations/report-builder';

const reportService = new ReportBuilderService();

// GET /api/report-builder/templates - Get all report templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const perPage = Number.parseInt(searchParams.get('per_page') || '10', 10);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const filters = {
      search,
      category,
    };

    const result = await reportService.getReportTemplates(
      page,
      perPage,
      filters
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch report templates',
      },
      { status: 500 }
    );
  }
}

// POST /api/report-builder/templates - Create new report template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateReportTemplateRequest.safeParse(body);
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

    const template = await reportService.createReportTemplate(
      validationResult.data
    );

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report template:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create report template',
      },
      { status: 500 }
    );
  }
}
