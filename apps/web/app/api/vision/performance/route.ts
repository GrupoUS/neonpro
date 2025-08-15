/**
 * Vision Analysis Performance Monitoring API
 * GET /api/vision/performance
 *
 * Provides performance metrics and monitoring for computer vision analysis
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { withErrorMonitoring } from '@/lib/monitoring';

// Query parameters validation
const performanceQuerySchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
  groupBy: z.enum(['hour', 'day', 'week']).default('hour'),
  includeDetails: z.boolean().default(false),
});

// GET - Performance metrics
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
    const queryParams = {
      timeRange: searchParams.get('timeRange') || '24h',
      groupBy: searchParams.get('groupBy') || 'hour',
      includeDetails: searchParams.get('includeDetails') === 'true',
    };

    const validatedParams = performanceQuerySchema.parse(queryParams);

    // Calculate time range
    const now = new Date();
    const timeRangeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(
      now.getTime() - timeRangeMap[validatedParams.timeRange]
    );

    // Get performance metrics
    const { data: performanceData, error: perfError } = await supabase
      .from('analysis_performance')
      .select(`
        *,
        image_analysis!inner(
          id,
          treatment_type,
          status,
          created_at
        )
      `)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false });

    if (perfError) {
      throw perfError;
    }

    // Calculate aggregate metrics
    const totalAnalyses = performanceData.length;
    const avgAccuracy =
      totalAnalyses > 0
        ? performanceData.reduce((sum, item) => sum + item.accuracy_score, 0) /
          totalAnalyses
        : 0;
    const avgProcessingTime =
      totalAnalyses > 0
        ? performanceData.reduce(
            (sum, item) => sum + item.processing_time_ms,
            0
          ) / totalAnalyses
        : 0;
    const avgConfidence =
      totalAnalyses > 0
        ? performanceData.reduce(
            (sum, item) => sum + item.confidence_score,
            0
          ) / totalAnalyses
        : 0;

    // Performance targets compliance
    const accuracyTarget = 0.95;
    const timeTarget = 30_000; // 30 seconds

    const accuracyCompliance =
      totalAnalyses > 0
        ? performanceData.filter(
            (item) => item.accuracy_score >= accuracyTarget
          ).length / totalAnalyses
        : 0;
    const timeCompliance =
      totalAnalyses > 0
        ? performanceData.filter(
            (item) => item.processing_time_ms <= timeTarget
          ).length / totalAnalyses
        : 0;

    // Group data by time period if requested
    let timeSeriesData = [];
    if (validatedParams.includeDetails) {
      const groupedData = new Map();

      performanceData.forEach((item) => {
        const date = new Date(item.created_at);
        let groupKey: string;

        switch (validatedParams.groupBy) {
          case 'hour':
            groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            break;
          case 'day':
            groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            break;
          case 'week': {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
            break;
          }
          default:
            groupKey = date.toISOString().split('T')[0];
        }

        if (!groupedData.has(groupKey)) {
          groupedData.set(groupKey, {
            timestamp: groupKey,
            count: 0,
            totalAccuracy: 0,
            totalProcessingTime: 0,
            totalConfidence: 0,
            accuracyCompliant: 0,
            timeCompliant: 0,
          });
        }

        const group = groupedData.get(groupKey);
        group.count++;
        group.totalAccuracy += item.accuracy_score;
        group.totalProcessingTime += item.processing_time_ms;
        group.totalConfidence += item.confidence_score;

        if (item.accuracy_score >= accuracyTarget) group.accuracyCompliant++;
        if (item.processing_time_ms <= timeTarget) group.timeCompliant++;
      });

      timeSeriesData = Array.from(groupedData.values())
        .map((group) => ({
          timestamp: group.timestamp,
          count: group.count,
          avgAccuracy: group.count > 0 ? group.totalAccuracy / group.count : 0,
          avgProcessingTime:
            group.count > 0 ? group.totalProcessingTime / group.count : 0,
          avgConfidence:
            group.count > 0 ? group.totalConfidence / group.count : 0,
          accuracyCompliance:
            group.count > 0 ? group.accuracyCompliant / group.count : 0,
          timeCompliance:
            group.count > 0 ? group.timeCompliant / group.count : 0,
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }

    // Treatment type breakdown
    const treatmentBreakdown = new Map();
    performanceData.forEach((item) => {
      const treatmentType = item.image_analysis.treatment_type;
      if (!treatmentBreakdown.has(treatmentType)) {
        treatmentBreakdown.set(treatmentType, {
          count: 0,
          totalAccuracy: 0,
          totalProcessingTime: 0,
          accuracyCompliant: 0,
          timeCompliant: 0,
        });
      }

      const breakdown = treatmentBreakdown.get(treatmentType);
      breakdown.count++;
      breakdown.totalAccuracy += item.accuracy_score;
      breakdown.totalProcessingTime += item.processing_time_ms;

      if (item.accuracy_score >= accuracyTarget) breakdown.accuracyCompliant++;
      if (item.processing_time_ms <= timeTarget) breakdown.timeCompliant++;
    });

    const treatmentStats = Array.from(treatmentBreakdown.entries()).map(
      ([type, stats]) => ({
        treatmentType: type,
        count: stats.count,
        avgAccuracy: stats.count > 0 ? stats.totalAccuracy / stats.count : 0,
        avgProcessingTime:
          stats.count > 0 ? stats.totalProcessingTime / stats.count : 0,
        accuracyCompliance:
          stats.count > 0 ? stats.accuracyCompliant / stats.count : 0,
        timeCompliance: stats.count > 0 ? stats.timeCompliant / stats.count : 0,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAnalyses,
          avgAccuracy,
          avgProcessingTime,
          avgConfidence,
          accuracyCompliance,
          timeCompliance,
          timeRange: validatedParams.timeRange,
        },
        targets: {
          accuracyTarget,
          timeTarget,
          accuracyTargetMet: avgAccuracy >= accuracyTarget,
          timeTargetMet: avgProcessingTime <= timeTarget,
        },
        treatmentBreakdown: treatmentStats,
        ...(validatedParams.includeDetails && { timeSeries: timeSeriesData }),
      },
    });
  } catch (error) {
    console.error('Vision performance monitoring error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Parâmetros de consulta inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
});

// POST - Record performance metric
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

    const body = await request.json();
    const {
      analysisId,
      processingTimeMs,
      accuracyScore,
      confidenceScore,
      memoryUsageMb,
      errorCount,
    } = body;

    // Validate required fields
    if (
      !analysisId ||
      typeof processingTimeMs !== 'number' ||
      typeof accuracyScore !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: analysisId, processingTimeMs, accuracyScore',
        },
        { status: 400 }
      );
    }

    // Insert performance record
    const { data, error } = await supabase
      .from('analysis_performance')
      .insert({
        analysis_id: analysisId,
        processing_time_ms: processingTimeMs,
        accuracy_score: accuracyScore,
        confidence_score: confidenceScore || 0,
        memory_usage_mb: memoryUsageMb || 0,
        error_count: errorCount || 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
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
    console.error('Performance recording error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
});
