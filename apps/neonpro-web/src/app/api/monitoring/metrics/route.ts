/**
 * TASK-001: Foundation Setup & Baseline
 * Metrics Collection API
 * 
 * Provides comprehensive metrics collection for baseline establishment
 * and ongoing performance monitoring across all epic functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordPerformanceMetric, getPerformanceMetrics } from '@/lib/monitoring/performance';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const metric_type = searchParams.get('type');
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get performance metrics based on filters
    const metrics = await getPerformanceMetrics({
      metric_type: metric_type as any,
      timeframe,
      limit,
    });

    // Calculate baseline statistics
    const stats = calculateMetricStats(metrics);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        stats,
        baseline: {
          api_max_ms: 500,
          page_max_ms: 2000,
          db_max_ms: 100,
          component_max_ms: 50,
        },
        timeframe,
        total_count: metrics.length,
      },
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      route_path,
      metric_type,
      duration_ms,
      status_code,
      error_message,
      metadata
    } = body;

    // Validate required fields
    if (!route_path || !metric_type || duration_ms === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: route_path, metric_type, duration_ms' },
        { status: 400 }
      );
    }

    // Record the performance metric
    const metric = await recordPerformanceMetric({
      route_path,
      metric_type,
      duration_ms,
      status_code,
      error_message,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: { metric },
      message: 'Metric recorded successfully',
    });

  } catch (error) {
    console.error('Error recording metric:', error);
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}

function calculateMetricStats(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      count: 0,
      avg_duration: 0,
      min_duration: 0,
      max_duration: 0,
      p95_duration: 0,
      error_rate: 0,
    };
  }

  const durations = metrics.map(m => m.duration_ms).sort((a, b) => a - b);
  const errorCount = metrics.filter(m => m.error_message).length;

  return {
    count: metrics.length,
    avg_duration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    min_duration: durations[0],
    max_duration: durations[durations.length - 1],
    p95_duration: durations[Math.floor(durations.length * 0.95)],
    error_rate: (errorCount / metrics.length) * 100,
  };
}
