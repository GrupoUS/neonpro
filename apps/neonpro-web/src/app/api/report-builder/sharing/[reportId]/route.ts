// Report Sharing API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { type NextRequest, NextResponse } from "next/server";
import { ReportBuilderService } from "@/app/lib/services/report-builder";
import { CreateReportShareRequest } from "@/app/lib/validations/report-builder";

const reportService = new ReportBuilderService();

// GET /api/report-builder/sharing/[reportId] - Get sharing info for specific report
export async function GET(request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const reportId = params.reportId;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: "Report ID is required",
        },
        { status: 400 },
      );
    }

    const sharing = await reportService.getReportSharing(reportId);

    return NextResponse.json({
      success: true,
      data: sharing,
    });
  } catch (error) {
    console.error("Error fetching report sharing:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch report sharing",
      },
      { status: 500 },
    );
  }
}

// POST /api/report-builder/sharing/[reportId] - Create new sharing link for report
export async function POST(request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const reportId = params.reportId;
    const body = await request.json();

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: "Report ID is required",
        },
        { status: 400 },
      );
    }

    // Validate request body
    const validationResult = CreateReportShareRequest.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const sharing = await reportService.createReportShare(reportId, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: sharing,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating report sharing:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create report sharing",
      },
      { status: 500 },
    );
  }
}
