// API Routes for Reorder Alert Management
// Story 6.2: Automated Reorder Alerts + Threshold Management

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { IntelligentThresholdService } from "@/app/lib/services/intelligent-threshold-service";

const thresholdService = new IntelligentThresholdService();

const queryParamsSchema = z.object({
  clinic_id: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const alertStatsSchema = z.object({
  clinic_id: z.string(),
  start_date: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  end_date: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const { clinic_id, start_date, end_date } = alertStatsSchema.parse(params);

    const dateRange = start_date && end_date ? { start: start_date, end: end_date } : undefined;
    const stats = await thresholdService.getAlertStats(clinic_id, dateRange);

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Alert statistics retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching alert stats:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch alert statistics",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
