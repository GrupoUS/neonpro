/**
 * Vision Analysis Sharing API
 * POST /api/vision/share
 * GET /api/vision/share/[shareId]
 *
 * Enables secure sharing of computer vision analysis results
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";
import type { withErrorMonitoring } from "@/lib/monitoring";
import type { randomUUID } from "crypto";

// Share request validation schema
const shareRequestSchema = z.object({
  analysisId: z.string().uuid("ID de análise inválido"),
  shareType: z.enum(["public", "private", "professional"], {
    required_error: "Tipo de compartilhamento é obrigatório",
  }),
  expiresAt: z.string().datetime().optional(),
  allowedEmails: z.array(z.string().email()).optional(),
  includeImages: z.boolean().default(true),
  includeAnnotations: z.boolean().default(true),
  includeMetrics: z.boolean().default(true),
  includePersonalInfo: z.boolean().default(false),
  shareTitle: z.string().optional(),
  shareMessage: z.string().optional(),
  requirePassword: z.boolean().default(false),
  password: z.string().optional(),
});

// POST - Create a shareable link
export const POST = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = shareRequestSchema.parse(body);

    // Verify user owns the analysis
    const { data: analysis, error: analysisError } = await supabase
      .from("image_analysis")
      .select("*")
      .eq("id", validatedData.analysisId)
      .eq("user_id", user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: "Análise não encontrada ou acesso negado" },
        { status: 404 },
      );
    }

    // Generate unique share ID
    const shareId = randomUUID();
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vision/shared/${shareId}`;

    // Set expiration (default 30 days for public, 7 days for private)
    const defaultExpiration = validatedData.shareType === "public" ? 30 : 7;
    const expiresAt =
      validatedData.expiresAt ||
      new Date(Date.now() + defaultExpiration * 24 * 60 * 60 * 1000).toISOString();

    // Hash password if provided
    let hashedPassword = null;
    if (validatedData.requirePassword && validatedData.password) {
      // In production, use proper password hashing like bcrypt
      hashedPassword = Buffer.from(validatedData.password).toString("base64");
    }

    // Create share record
    const { data: shareRecord, error: shareError } = await supabase
      .from("analysis_shares")
      .insert({
        id: shareId,
        analysis_id: validatedData.analysisId,
        user_id: user.id,
        share_type: validatedData.shareType,
        share_url: shareUrl,
        expires_at: expiresAt,
        allowed_emails: validatedData.allowedEmails || [],
        share_options: {
          includeImages: validatedData.includeImages,
          includeAnnotations: validatedData.includeAnnotations,
          includeMetrics: validatedData.includeMetrics,
          includePersonalInfo: validatedData.includePersonalInfo,
          shareTitle: validatedData.shareTitle,
          shareMessage: validatedData.shareMessage,
        },
        password_hash: hashedPassword,
        view_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (shareError) {
      throw shareError;
    }

    // Log sharing activity
    await supabase.from("analysis_activity_log").insert({
      analysis_id: validatedData.analysisId,
      user_id: user.id,
      activity_type: "shared",
      activity_details: {
        shareId,
        shareType: validatedData.shareType,
        expiresAt,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresAt,
        shareType: validatedData.shareType,
        requiresPassword: validatedData.requirePassword,
      },
    });
  } catch (error) {
    console.error("Vision share creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados de entrada inválidos",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

// GET - Retrieve shared analysis
export const GET = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const password = searchParams.get("password");
    const viewerEmail = searchParams.get("email");

    if (!shareId) {
      return NextResponse.json({ error: "ID de compartilhamento é obrigatório" }, { status: 400 });
    }

    // Get share record
    const { data: shareRecord, error: shareError } = await supabase
      .from("analysis_shares")
      .select(`
        *,
        image_analysis!inner(
          id,
          patient_id,
          treatment_type,
          status,
          accuracy_score,
          confidence,
          improvement_percentage,
          change_metrics,
          before_image_url,
          after_image_url,
          notes,
          created_at,
          analysis_annotations(*),
          analysis_performance(*)
        )
      `)
      .eq("id", shareId)
      .eq("is_active", true)
      .single();

    if (shareError || !shareRecord) {
      return NextResponse.json(
        { error: "Link de compartilhamento não encontrado ou expirado" },
        { status: 404 },
      );
    }

    // Check if share has expired
    if (new Date(shareRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link de compartilhamento expirado" }, { status: 410 });
    }

    // Check password if required
    if (shareRecord.password_hash && password) {
      const providedPasswordHash = Buffer.from(password).toString("base64");
      if (providedPasswordHash !== shareRecord.password_hash) {
        return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
      }
    } else if (shareRecord.password_hash && !password) {
      return NextResponse.json(
        { error: "Senha obrigatória", requiresPassword: true },
        { status: 401 },
      );
    }

    // Check email restrictions for private shares
    if (shareRecord.share_type === "private" && shareRecord.allowed_emails?.length > 0) {
      if (!viewerEmail || !shareRecord.allowed_emails.includes(viewerEmail)) {
        return NextResponse.json(
          { error: "Acesso restrito - email não autorizado" },
          { status: 403 },
        );
      }
    }

    // Increment view count
    await supabase
      .from("analysis_shares")
      .update({
        view_count: shareRecord.view_count + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", shareId);

    // Log view activity
    await supabase.from("analysis_share_views").insert({
      share_id: shareId,
      viewer_email: viewerEmail,
      viewer_ip: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      viewed_at: new Date().toISOString(),
    });

    // Prepare response data based on share options
    const analysis = shareRecord.image_analysis;
    const options = shareRecord.share_options;

    const responseData = {
      shareInfo: {
        id: shareRecord.id,
        shareType: shareRecord.share_type,
        title: options.shareTitle || "Análise de Visão Computacional",
        message: options.shareMessage,
        createdAt: shareRecord.created_at,
        expiresAt: shareRecord.expires_at,
        viewCount: shareRecord.view_count + 1,
      },
      analysis: {
        id: analysis.id,
        ...(options.includePersonalInfo && { patientId: analysis.patient_id }),
        treatmentType: analysis.treatment_type,
        status: analysis.status,
        createdAt: analysis.created_at,
        notes: analysis.notes,
        ...(options.includeMetrics && {
          metrics: {
            accuracyScore: analysis.accuracy_score,
            confidence: analysis.confidence,
            improvementPercentage: analysis.improvement_percentage,
            changeMetrics: analysis.change_metrics,
          },
        }),
        ...(options.includeImages && {
          images: {
            beforeImageUrl: analysis.before_image_url,
            afterImageUrl: analysis.after_image_url,
          },
        }),
        ...(options.includeAnnotations && {
          annotations: analysis.analysis_annotations || [],
        }),
        performance: analysis.analysis_performance?.[0] || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Vision share retrieval error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

// DELETE - Revoke/deactivate a share
export const DELETE = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");

    if (!shareId) {
      return NextResponse.json({ error: "ID de compartilhamento é obrigatório" }, { status: 400 });
    }

    // Deactivate the share (user can only deactivate their own shares)
    const { data, error } = await supabase
      .from("analysis_shares")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", shareId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Compartilhamento não encontrado ou acesso negado" },
        { status: 404 },
      );
    }

    // Log deactivation activity
    await supabase.from("analysis_activity_log").insert({
      analysis_id: data.analysis_id,
      user_id: user.id,
      activity_type: "share_revoked",
      activity_details: { shareId },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Compartilhamento revogado com sucesso",
    });
  } catch (error) {
    console.error("Vision share revocation error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});
