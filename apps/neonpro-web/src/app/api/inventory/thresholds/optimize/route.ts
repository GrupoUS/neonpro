// API Routes for Threshold Optimization Analysis
// Story 6.2: Automated Reorder Alerts + Threshold Management

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { IntelligentThresholdService } from "@/app/lib/services/intelligent-threshold-service";

const thresholdService = new IntelligentThresholdService();

const queryParamsSchema = z.object({
  clinic_id: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { clinic_id } = queryParamsSchema.parse(params);

    const optimizations = await thresholdService.analyzeThresholdOptimization(clinic_id);

    return NextResponse.json({
      success: true,
      data: optimizations,
      count: optimizations.length,
      summary: {
        total_items_analyzed: optimizations.length,
        potential_savings: optimizations.reduce((sum, opt) => sum + opt.potential_savings, 0),
        high_priority_items: optimizations.filter((opt) => opt.implementation_priority === "high")
          .length,
        average_confidence:
          optimizations.length > 0
            ? optimizations.reduce((sum, opt) => sum + opt.confidence_score, 0) /
              optimizations.length
            : 0,
      },
    });
  } catch (error: any) {
    console.error("Error analyzing threshold optimization:", error);

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
        error: "Failed to analyze threshold optimization",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
