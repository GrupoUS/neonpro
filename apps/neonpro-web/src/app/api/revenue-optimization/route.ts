/**
 * NeonPro Revenue Optimization API
 *
 * API endpoints for revenue optimization engine:
 * - Dynamic pricing optimization
 * - Service mix optimization
 * - Customer lifetime value enhancement
 * - Automated revenue recommendations
 * - Competitive analysis and benchmarking
 * - ROI tracking and performance monitoring
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { createrevenueOptimizationEngine } from "@/lib/financial/revenue-optimization-engine";
import type { z } from "zod";

// 🔥 Request Schemas
const PricingOptimizationRequestSchema = z.object({
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
});

const ServiceMixRequestSchema = z.object({
  clinicId: z.string().uuid(),
});

const CLVRequestSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
});

const AutomatedRecommendationsRequestSchema = z.object({
  clinicId: z.string().uuid(),
});

const CompetitiveAnalysisRequestSchema = z.object({
  clinicId: z.string().uuid(),
});

const ROITrackingRequestSchema = z.object({
  clinicId: z.string().uuid(),
  optimizationId: z.string().uuid().optional(),
});

// 🎯 GET: Comprehensive Revenue Optimization Overview
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    // Verify user has access to clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get comprehensive revenue optimization overview
    const [
      pricingOptimization,
      serviceMixOptimization,
      clvEnhancement,
      automatedRecommendations,
      competitiveAnalysis,
      roiTracking,
    ] = await Promise.all([
      createrevenueOptimizationEngine().optimizePricing(clinicId),
      createrevenueOptimizationEngine().optimizeServiceMix(clinicId),
      createrevenueOptimizationEngine().enhanceCLV(clinicId),
      createrevenueOptimizationEngine().generateAutomatedRecommendations(clinicId),
      createrevenueOptimizationEngine().getCompetitiveAnalysis(clinicId),
      createrevenueOptimizationEngine().trackROI(clinicId),
    ]);

    // Get current optimization records
    const { data: optimizations } = await supabase
      .from("revenue_optimizations")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });

    const overview = {
      summary: {
        totalOptimizations: optimizations?.length || 0,
        activeOptimizations: optimizations?.filter((o) => o.status === "active").length || 0,
        completedOptimizations: optimizations?.filter((o) => o.status === "completed").length || 0,
        totalProjectedIncrease: automatedRecommendations.totalProjectedIncrease,
        averageROI: roiTracking.performanceIndicators.overallROI,
        successRate: roiTracking.performanceIndicators.successRate,
      },
      pricing: {
        currentStrategy: pricingOptimization.currentStrategy,
        recommendations: pricingOptimization.recommendations,
        projectedIncrease: pricingOptimization.projectedIncrease,
      },
      serviceMix: {
        profitabilityGain: serviceMixOptimization.profitabilityGain,
        recommendations: serviceMixOptimization.recommendations,
      },
      clv: {
        projectedIncrease: clvEnhancement.projectedIncrease,
        enhancementStrategies: clvEnhancement.enhancementStrategies,
      },
      automated: {
        recommendations: automatedRecommendations.recommendations,
        implementationPlan: automatedRecommendations.implementationPlan,
      },
      competitive: {
        marketPosition: competitiveAnalysis.marketPosition,
        opportunityAreas: competitiveAnalysis.opportunityAreas,
      },
      performance: {
        roiMetrics: roiTracking.roiMetrics,
        trendAnalysis: roiTracking.trendAnalysis,
        recommendations: roiTracking.recommendations,
      },
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error("Error getting revenue optimization overview:", error);
    return NextResponse.json(
      { error: "Failed to get revenue optimization overview" },
      { status: 500 },
    );
  }
} // 🎯 POST: Create New Revenue Optimization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request based on optimization type
    const { optimizationType, clinicId, ...optimizationData } = body;

    if (!optimizationType || !clinicId) {
      return NextResponse.json(
        { error: "Optimization type and clinic ID are required" },
        { status: 400 },
      );
    }

    // Verify user has access to clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let result;

    switch (optimizationType) {
      case "pricing":
        const pricingRequest = PricingOptimizationRequestSchema.parse({
          clinicId,
          ...optimizationData,
        });
        result = await createrevenueOptimizationEngine().optimizePricing(
          pricingRequest.clinicId,
          pricingRequest.serviceId,
        );
        break;

      case "service_mix":
        const serviceMixRequest = ServiceMixRequestSchema.parse({ clinicId });
        result = await createrevenueOptimizationEngine().optimizeServiceMix(
          serviceMixRequest.clinicId,
        );
        break;

      case "clv":
        const clvRequest = CLVRequestSchema.parse({ clinicId, ...optimizationData });
        result = await createrevenueOptimizationEngine().enhanceCLV(
          clvRequest.clinicId,
          clvRequest.patientId,
        );
        break;

      case "automated":
        const automatedRequest = AutomatedRecommendationsRequestSchema.parse({ clinicId });
        result = await createrevenueOptimizationEngine().generateAutomatedRecommendations(
          automatedRequest.clinicId,
        );
        break;

      case "competitive":
        const competitiveRequest = CompetitiveAnalysisRequestSchema.parse({ clinicId });
        result = await createrevenueOptimizationEngine().getCompetitiveAnalysis(
          competitiveRequest.clinicId,
        );
        break;

      case "roi_tracking":
        const roiRequest = ROITrackingRequestSchema.parse({ clinicId, ...optimizationData });
        result = await createrevenueOptimizationEngine().trackROI(
          roiRequest.clinicId,
          roiRequest.optimizationId,
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid optimization type" }, { status: 400 });
    }

    // Create optimization record
    const optimizationRecord = {
      clinic_id: clinicId,
      optimization_type: optimizationType,
      title: body.title || `${optimizationType} Optimization`,
      description: body.description || `Automated ${optimizationType} optimization`,
      target_metric: body.targetMetric || "revenue",
      baseline_value: body.baselineValue || 0,
      target_value: body.targetValue || 0,
      improvement_percentage: result.projectedIncrease || result.profitabilityGain || 0,
      status: "active",
      priority: body.priority || "medium",
      recommendations: result.recommendations || [],
      implementation_steps: result.implementationPlan || [],
      expected_roi: body.expectedROI || 15,
      start_date: new Date().toISOString(),
      target_date: body.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: optimization, error } = await supabase
      .from("revenue_optimizations")
      .insert(optimizationRecord)
      .select()
      .single();

    if (error) {
      console.error("Error creating optimization:", error);
      return NextResponse.json({ error: "Failed to create optimization record" }, { status: 500 });
    }

    return NextResponse.json({
      optimization,
      result,
      message: "Revenue optimization created successfully",
    });
  } catch (error) {
    console.error("Error creating revenue optimization:", error);
    return NextResponse.json({ error: "Failed to create revenue optimization" }, { status: 500 });
  }
}

// 🎯 PUT: Update Revenue Optimization
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, clinicId, ...updateData } = body;

    if (!id || !clinicId) {
      return NextResponse.json(
        { error: "Optimization ID and clinic ID are required" },
        { status: 400 },
      );
    }

    // Verify user has access to clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update optimization
    const { data: optimization, error } = await supabase
      .from("revenue_optimizations")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .select()
      .single();

    if (error) {
      console.error("Error updating optimization:", error);
      return NextResponse.json({ error: "Failed to update optimization" }, { status: 500 });
    }

    return NextResponse.json({
      optimization,
      message: "Revenue optimization updated successfully",
    });
  } catch (error) {
    console.error("Error updating revenue optimization:", error);
    return NextResponse.json({ error: "Failed to update revenue optimization" }, { status: 500 });
  }
}

// 🎯 DELETE: Delete Revenue Optimization
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clinicId = searchParams.get("clinicId");

    if (!id || !clinicId) {
      return NextResponse.json(
        { error: "Optimization ID and clinic ID are required" },
        { status: 400 },
      );
    }

    // Verify user has access to clinic
    const { data: professional } = await supabase
      .from("professionals")
      .select("clinic_id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete optimization
    const { error } = await supabase
      .from("revenue_optimizations")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) {
      console.error("Error deleting optimization:", error);
      return NextResponse.json({ error: "Failed to delete optimization" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Revenue optimization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting revenue optimization:", error);
    return NextResponse.json({ error: "Failed to delete revenue optimization" }, { status: 500 });
  }
}
