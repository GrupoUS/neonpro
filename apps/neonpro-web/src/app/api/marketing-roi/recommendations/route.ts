import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { createmarketingROIService } from "@/app/lib/services/marketing-roi-service";
import type {
  OptimizationRecommendationsRequest,
  OptimizationRecommendationsResponse,
  MarketingOptimizationStrategy,
  MarketingOptimizationPriority,
} from "@/app/types/marketing-roi";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignIds = searchParams.get("campaignIds")?.split(",").filter(Boolean);
    const treatmentIds = searchParams.get("treatmentIds")?.split(",").filter(Boolean);
    const priority = searchParams.get("priority") as MarketingOptimizationPriority | null;
    const strategy = searchParams.get("strategy") as MarketingOptimizationStrategy | null;

    const requestData: OptimizationRecommendationsRequest = {
      campaignIds,
      treatmentIds,
      filters: {
        priority: priority || undefined,
        strategy: strategy || undefined,
        minImpact: searchParams.get("minImpact")
          ? parseFloat(searchParams.get("minImpact")!)
          : undefined,
        maxImplementationCost: searchParams.get("maxImplementationCost")
          ? parseFloat(searchParams.get("maxImplementationCost")!)
          : undefined,
      },
    };

    const recommendations =
      await createmarketingROIService().getOptimizationRecommendations(requestData);

    const response: OptimizationRecommendationsResponse = {
      recommendations,
      metadata: {
        totalRecommendations: recommendations.length,
        highPriorityCount: recommendations.filter((r) => r.priority === "high").length,
        averageImpact:
          recommendations.reduce((sum, r) => sum + r.expectedImpact, 0) / recommendations.length,
        totalImplementationCost: recommendations.reduce(
          (sum, r) => sum + (r.implementationCost || 0),
          0,
        ),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Marketing ROI recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketing ROI recommendations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData: OptimizationRecommendationsRequest = await request.json();

    // Validate request data
    if (!requestData.campaignIds && !requestData.treatmentIds) {
      return NextResponse.json(
        { error: "Either campaignIds or treatmentIds must be provided" },
        { status: 400 },
      );
    }

    const recommendations =
      await createmarketingROIService().getOptimizationRecommendations(requestData);

    // Generate comprehensive analysis
    const analysis = await createmarketingROIService().generateOptimizationInsights({
      recommendations,
      timeframe: "90d",
      includeMarketComparison: true,
    });

    const response: OptimizationRecommendationsResponse = {
      recommendations,
      analysis,
      metadata: {
        totalRecommendations: recommendations.length,
        highPriorityCount: recommendations.filter((r) => r.priority === "high").length,
        averageImpact:
          recommendations.reduce((sum, r) => sum + r.expectedImpact, 0) / recommendations.length,
        totalImplementationCost: recommendations.reduce(
          (sum, r) => sum + (r.implementationCost || 0),
          0,
        ),
        estimatedTimeframe: Math.max(...recommendations.map((r) => r.timeframe || 30)),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Marketing ROI recommendations generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate marketing ROI recommendations" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recommendationId, status, feedback } = await request.json();

    if (!recommendationId || !status) {
      return NextResponse.json(
        { error: "Recommendation ID and status are required" },
        { status: 400 },
      );
    }

    const updatedRecommendation = await createmarketingROIService().updateRecommendationStatus(
      recommendationId,
      status,
      feedback,
    );

    return NextResponse.json({
      success: true,
      recommendation: updatedRecommendation,
    });
  } catch (error) {
    console.error("Marketing ROI recommendation update error:", error);
    return NextResponse.json(
      { error: "Failed to update marketing ROI recommendation" },
      { status: 500 },
    );
  }
}
