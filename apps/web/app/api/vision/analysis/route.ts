/**
 * Computer Vision Analysis API Route
 * POST /api/vision/analysis
 *
 * Handles before/after image analysis with ≥95% accuracy and <30s processing time
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { withErrorMonitoring } from '@/lib/monitoring';
import { visionAnalysisEngine } from '@/lib/vision/analysis-engine';

// Request validation schema
const analysisRequestSchema = z.object({
  beforeImageUrl: z.string().url('URL da imagem "antes" é obrigatória'),
  afterImageUrl: z.string().url('URL da imagem "depois" é obrigatória'),
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  treatmentType: z.enum(
    [
      'acne_treatment',
      'anti_aging',
      'skin_rejuvenation',
      'scar_treatment',
      'pigmentation',
      'wrinkle_reduction',
      'other',
    ],
    { required_error: 'Tipo de tratamento é obrigatório' },
  ),
  analysisOptions: z
    .object({
      enableDetailedMetrics: z.boolean().default(true),
      generateAnnotations: z.boolean().default(true),
      qualityThreshold: z.number().min(0.8).max(1.0).default(0.95),
    })
    .optional(),
});

// GET - Retrieve analysis history
export const GET = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 },
      );
    }

    // Get analysis history
    const history = await visionAnalysisEngine.getPatientAnalysisHistory(
      patientId,
      limit,
      offset,
    );

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        limit,
        offset,
        total: history.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
});

// POST - Start new analysis
export const POST = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analysisRequestSchema.parse(body);

    const startTime = Date.now();

    // Perform computer vision analysis
    const analysisResult = await visionAnalysisEngine.analyzeBeforeAfter(
      validatedData.beforeImageUrl,
      validatedData.afterImageUrl,
      validatedData.patientId,
      validatedData.treatmentType,
      validatedData.analysisOptions,
    );

    const processingTime = Date.now() - startTime;

    // Validate performance requirements
    const performanceWarnings = [];
    if (analysisResult.accuracyScore < 0.95) {
      performanceWarnings.push(
        `Precisão abaixo do esperado: ${(analysisResult.accuracyScore * 100).toFixed(1)}%`,
      );
    }
    if (processingTime > 30_000) {
      performanceWarnings.push(
        `Tempo de processamento excedeu 30s: ${(processingTime / 1000).toFixed(1)}s`,
      );
    }

    // Log performance metrics
    await supabase.from('analysis_performance').insert({
      analysis_id: analysisResult.id,
      processing_time_ms: processingTime,
      accuracy_score: analysisResult.accuracyScore,
      confidence_score: analysisResult.confidence,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: analysisResult,
      performance: {
        processingTime,
        meetsAccuracyTarget: analysisResult.accuracyScore >= 0.95,
        meetsTimeTarget: processingTime <= 30_000,
        warnings: performanceWarnings,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados de entrada inválidos',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
});

// PUT - Update analysis
export const PUT = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'ID da análise é obrigatório' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { notes, qualityRating, reviewStatus } = body;

    // Update analysis with review data
    const { data, error } = await supabase
      .from('image_analysis')
      .update({
        notes,
        quality_rating: qualityRating,
        review_status: reviewStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', analysisId)
      .eq('user_id', user.id) // Ensure user can only update their own analyses
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
});

// DELETE - Delete analysis
export const DELETE = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'ID da análise é obrigatório' },
        { status: 400 },
      );
    }

    // Delete analysis (soft delete)
    const { error } = await supabase
      .from('image_analysis')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', analysisId)
      .eq('user_id', user.id); // Ensure user can only delete their own analyses

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Análise removida com sucesso',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
});
