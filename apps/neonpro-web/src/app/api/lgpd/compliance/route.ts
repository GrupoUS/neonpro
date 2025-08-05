import type { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { LGPDComplianceManager } from "@/lib/lgpd/compliance-manager";
import type { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Validation schemas
const complianceQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeMetrics: z.boolean().default(true),
  includeAssessments: z.boolean().default(false),
});

const assessmentCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  areasToAssess: z.array(z.string()).min(1),
  scheduledAt: z.string().datetime().optional(),
});

// GET /api/lgpd/compliance - Get compliance overview
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

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validatedQuery = complianceQuerySchema.parse({
      ...queryParams,
      includeMetrics: queryParams.includeMetrics !== "false",
      includeAssessments: queryParams.includeAssessments === "true",
    });

    const complianceManager = new LGPDComplianceManager(supabase);

    // Get compliance overview
    const overview = await complianceManager.getComplianceOverview({
      userId: validatedQuery.userId,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
    });

    let metrics = null;
    let assessments = null;

    if (validatedQuery.includeMetrics) {
      // Get dashboard metrics
      const { data: metricsData } = await supabase
        .from("lgpd_dashboard_metrics")
        .select("*")
        .single();

      metrics = metricsData;
    }

    if (validatedQuery.includeAssessments) {
      // Get recent assessments
      const { data: assessmentsData } = await supabase
        .from("lgpd_compliance_assessments")
        .select(`
          id,
          name,
          status,
          score,
          compliance_percentage,
          completed_at,
          next_assessment_due
        `)
        .order("completed_at", { ascending: false })
        .limit(5);

      assessments = assessmentsData;
    }

    // Log access
    await complianceManager.logAuditEvent({
      eventType: "system_access",
      userId: user.id,
      description: "Compliance overview accessed",
      details: "Admin accessed LGPD compliance dashboard",
      metadata: {
        query_params: validatedQuery,
        access_time: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview,
        metrics,
        assessments,
      },
    });
  } catch (error) {
    console.error("LGPD Compliance API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/lgpd/compliance - Create compliance assessment
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

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = assessmentCreateSchema.parse(body);

    const complianceManager = new LGPDComplianceManager(supabase);

    // Create new assessment
    const assessment = await complianceManager.createComplianceAssessment({
      name: validatedData.name,
      description: validatedData.description,
      areasAssessed: validatedData.areasToAssess,
      assessorId: user.id,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined,
    });

    // Log assessment creation
    await complianceManager.logAuditEvent({
      eventType: "admin_action",
      userId: user.id,
      description: "Compliance assessment created",
      details: `Assessment "${validatedData.name}" created`,
      metadata: {
        assessment_id: assessment.id,
        areas_assessed: validatedData.areasToAssess,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: assessment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("LGPD Assessment Creation Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/lgpd/compliance - Run automated assessment
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

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Run automated compliance assessment
    const { data: assessmentId, error: assessmentError } = await supabase.rpc(
      "generate_compliance_assessment",
    );

    if (assessmentError) {
      throw new Error(`Assessment generation failed: ${assessmentError.message}`);
    }

    // Get the created assessment
    const { data: assessment } = await supabase
      .from("lgpd_compliance_assessments")
      .select(`
        id,
        name,
        status,
        score,
        compliance_percentage,
        findings,
        recommendations,
        completed_at
      `)
      .eq("id", assessmentId)
      .single();

    const complianceManager = new LGPDComplianceManager(supabase);

    // Log automated assessment
    await complianceManager.logAuditEvent({
      eventType: "admin_action",
      userId: user.id,
      description: "Automated compliance assessment executed",
      details: `Assessment completed with score: ${assessment?.score}/100`,
      metadata: {
        assessment_id: assessmentId,
        score: assessment?.score,
        compliance_percentage: assessment?.compliance_percentage,
      },
    });

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Automated Assessment Error:", error);

    return NextResponse.json({ error: "Failed to run automated assessment" }, { status: 500 });
  }
}
