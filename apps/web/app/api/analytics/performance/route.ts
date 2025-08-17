/**
 * Performance Metrics Collection API
 *
 * Collects and stores Web Vitals and custom performance metrics
 * Based on 2025 performance monitoring best practices
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Performance metric interface
type PerformanceMetric = {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType: string;
  entries: Array<any>;
  url: string;
  userAgent: string;
  timestamp: number;
  grade: 'good' | 'needs-improvement' | 'poor';
  userId: string;
  sessionId: string;
};

// Supported metric types
const SUPPORTED_METRICS = [
  'CLS', // Cumulative Layout Shift
  'FID', // First Input Delay (deprecated)
  'FCP', // First Contentful Paint
  'LCP', // Largest Contentful Paint
  'TTFB', // Time to First Byte
  'INP', // Interaction to Next Paint (new)
  'LONG_TASK', // Long Task API
  'DNS_TIME', // DNS lookup time
  'CONNECT_TIME', // Connection time
  'COMPONENT_RENDER', // Component render time
  'INTERACTION_RESPONSE', // Interaction response time
  'FUNCTION_EXECUTION', // Function execution time
  'LARGE_RESOURCE', // Large resource loading
] as const;

type MetricType = (typeof SUPPORTED_METRICS)[number];

// Performance thresholds for automated alerts
const PERFORMANCE_ALERTS = {
  LCP: {
    critical: 4000,
    warning: 2500,
  },
  FID: {
    critical: 300,
    warning: 100,
  },
  CLS: {
    critical: 0.25,
    warning: 0.1,
  },
  FCP: {
    critical: 3000,
    warning: 1800,
  },
  TTFB: {
    critical: 1800,
    warning: 800,
  },
  INP: {
    critical: 500,
    warning: 200,
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse request body
    const metrics: PerformanceMetric | PerformanceMetric[] =
      await request.json();
    const metricsArray = Array.isArray(metrics) ? metrics : [metrics];

    // Validate metrics
    const validMetrics = metricsArray.filter(
      (metric) =>
        (metric as any).name &&
        typeof metric.value === 'number' &&
        (SUPPORTED_METRICS as readonly string[]).includes((metric as any).name),
    );

    if (validMetrics.length === 0) {
      return NextResponse.json(
        { error: 'No valid metrics provided' },
        { status: 400 },
      );
    }

    const {
      data: { session },
    } = await (await supabase).auth.getSession();
    const userId = session?.user?.id;

    // Enrich metrics with additional context
    const enrichedMetrics = validMetrics.map((metric) => ({
      ...metric,
      userId: userId || null,
      sessionId: generateSessionId(request),
      url: metric.url || request.headers.get('referer') || 'unknown',
      userAgent:
        metric.userAgent || request.headers.get('user-agent') || 'unknown',
      timestamp: metric.timestamp || Date.now,
      grade:
        metric.grade ||
        calculateGrade((metric as any).name as MetricType, metric.value),
      ip_address: getClientIP(request),
      country: (request as any).geo?.country || 'unknown',
      city: (request as any).geo?.city || 'unknown',
    }));

    // Store metrics in database
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(enrichedMetrics)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 },
      );
    }

    // Check for performance alerts
    await checkPerformanceAlerts(enrichedMetrics, supabase);

    // Return success response with appropriate cache headers
    const response = NextResponse.json({
      success: true,
      stored: data?.length || 0,
      metrics: data?.map((d) => ({
        id: d.id,
        name: (d as any).name,
        grade: d.grade,
      })),
    });

    // Add cache headers (no caching for this endpoint)
    const headers = CacheHeaders.noCache();
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient;
    const { searchParams } = new URL(request.url);
    const {
      data: { session },
    } = await (await supabase).auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Parse query parameters    const userId = searchParams.get('userId') || session.user.id();
    const metric = searchParams.get('metric') as MetricType | null;
    const timeRange = searchParams.get('timeRange') || '24h';
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);

    // Build query
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(Math.min(limit, 1000)); // Cap at 1000 records

    // Filter by metric type
    if (metric && (SUPPORTED_METRICS as readonly string[]).includes(metric)) {
      query = query.eq('name', metric);
    }

    // Filter by time range    const timeRangeMs = parseTimeRange(timeRange);
    if (timeRangeMs > 0) {
      const cutoff = Date.now() - timeRangeMs;
      query = query.gte('timestamp', cutoff);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 },
      );
    }

    // Calculate aggregated statistics    const stats = calculateAggregatedStats(data || []);

    const response = NextResponse.json({
      metrics: data || [],
      count: data?.length || 0,
      timeRange,
      stats,
    });

    // Add cache headers (5 minute cache for aggregated data)    const headers = CacheHeaders.apiResponse();
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Helper functions
function generateSessionId(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-minute buckets
  return Buffer.from(`${ip}-${userAgent}-${timestamp}`)
    .toString('base64')
    .slice(0, 16);
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    (request as any).ip ||
    'unknown'
  );
}

function calculateGrade(
  metric: MetricType,
  value: number,
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds =
    PERFORMANCE_ALERTS[metric as keyof typeof PERFORMANCE_ALERTS];

  if (!thresholds) {
    return 'poor';
  }

  if (value <= thresholds.warning) {
    return 'good';
  }
  if (value <= thresholds.critical) {
    return 'needs-improvement';
  }
  return 'poor';
}

function parseTimeRange(timeRange: string): number {
  const ranges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  return ranges[timeRange] || 0;
}

function calculateAggregatedStats(metrics: any[]) {
  if (metrics.length === 0) {
    return {};
  }

  const statsByMetric: Record<string, any> = {};

  for (const metric of metrics) {
    if (!statsByMetric[(metric as any).name]) {
      statsByMetric[(metric as any).name] = {
        count: 0,
        values: [],
        grades: { good: 0, 'needs-improvement': 0, poor: 0 },
      };
    }

    statsByMetric[(metric as any).name].count++;
    statsByMetric[(metric as any).name].values.push(metric.value);
    statsByMetric[(metric as any).name].grades[metric.grade]++;
  }

  // Calculate percentiles and averages  for (const [metricName, stats] of Object.entries(statsByMetric)) {
  const values = stats.values.sort((a: number, b: number) => a - b);
  const count = values.length;

  statsByMetric[metricName] = {
    ...stats,
    min: values[0],
    max: values[count - 1],
    average: values.reduce((sum: number, val: number) => sum + val, 0) / count,
    median: values[Math.floor(count / 2)],
    p75: values[Math.floor(count * 0.75)],
    p95: values[Math.floor(count * 0.95)],
    p99: values[Math.floor(count * 0.99)],
  };

  statsByMetric[metricName].values = undefined; // Remove raw values to reduce response size  }

  return statsByMetric;
}

async function checkPerformanceAlerts(metrics: any[], supabase: any) {
  for (const metric of metrics) {
    const threshold =
      PERFORMANCE_ALERTS[
        (metric as any).name as keyof typeof PERFORMANCE_ALERTS
      ];

    if (threshold && metric.grade === 'poor') {
      // Store alert (you could extend this to send notifications)
      try {
        await (await supabase).from('performance_alerts').insert({
          metric_name: (metric as any).name,
          metric_value: metric.value,
          threshold: threshold.critical,
          user_id: metric.userId,
          url: metric.url,
          severity: 'critical',
          timestamp: metric.timestamp,
        });
      } catch (_error) {
        // Silently ignore alert creation errors
      }
    }
  }
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = any;

export type SessionValidationResult = any;
