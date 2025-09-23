/**
 * 📊 Core Web Vitals Analytics API Endpoint
 * Handles web vitals data collection and analysis
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type {
  MetricAnalysis,
  MetricEntry,
  PerformanceThresholds,
  SessionInfo,
  WebVitalMetric,
} from '../types/web-vitals';

const webVitalsRouter = new Hono();

// CORS middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
  );
}
webVitalsRouter.use(
  '*',
  cors({
    origin: origin =>
      !origin
        ? undefined
        : allowedOrigins.includes(origin)
        ? origin
        : undefined,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// In-memory storage (replace with your database)
const metricsStore = new Map<string, MetricEntry[]>();
const sessionsStore = new Map<string, SessionInfo>();

// Core Web Vitals reporting endpoint
webVitalsRouter.post('/api/analytics/web-vitals', async c => {
  try {
    const body = await c.req.json();
    const {
      metric,
      data,
      sessionId,
      userId,
    }: {
      metric: string;
      data: WebVitalMetric;
      sessionId?: string;
      _userId?: string;
    } = body;

    // Validate required fields
    if (!metric || !data || typeof data.value === 'undefined') {
      return c.json({ error: 'Invalid metric data' }, 400);
    }

    // Create metric entry
    const metricEntry: MetricEntry = {
      id: generateMetricId(),
      metric,
      name: data.name,
      value: data.value,
      delta: data.delta,
      originId: data.id,
      sessionId: sessionId || 'anonymous',
      _userId: userId || null,
      timestamp: new Date().toISOString(),
      url: data.url,
      pathname: data.pathname,
      userAgent: data.userAgent,
      connectionType: data.connectionType,
      deviceMemory: data.deviceMemory,
      hardwareConcurrency: data.hardwareConcurrency,
      // Healthcare context
      isPatientView: data.isPatientView || false,
      isAppointmentView: data.isAppointmentView || false,
      isMedicalRecordView: data.isMedicalRecordView || false,
      // Request context
      clinicId: null,
      requestId: generateMetricId(),
    };

    // Store metric
    if (!metricsStore.has(sessionId || 'anonymous')) {
      metricsStore.set(sessionId || 'anonymous', []);
    }
    metricsStore.get(sessionId || 'anonymous')!.push(metricEntry);

    // Update session info
    const currentSessionId = sessionId || 'anonymous';
    if (!sessionsStore.has(currentSessionId)) {
      sessionsStore.set(currentSessionId, {
        sessionId: currentSessionId,
        _userId: userId || null,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metricsCount: 0,
        urls: new Set(),
      });
    }

    const session = sessionsStore.get(currentSessionId)!;
    session.lastActivity = new Date().toISOString();
    session.metricsCount++;
    session.urls.add(data.pathname || data.url || '');

    // Check for performance issues
    await checkPerformanceThresholds(metricEntry);

    return c.json({
      status: 'recorded',
      metricId: metricEntry.id,
      timestamp: metricEntry.timestamp,
    });
  } catch (error) {
    console.error('Web vitals recording error:', error);
    return c.json({ error: 'Failed to record metric' }, 500);
  }
});

// Batch metrics endpoint (beacon)
webVitalsRouter.post('/api/analytics/web-vitals/beacon', async c => {
  try {
    const body = await c.req.json();
    const {
      metrics,
      sessionId,
      userId,
      url,
      timestamp,
    }: {
      metrics: Record<string, any>;
      sessionId?: string;
      _userId?: string;
      url?: string;
      timestamp?: string;
    } = body;

    if (!metrics || typeof metrics !== 'object') {
      return new Response(null, { status: 204 });
    }

    // Process each metric in the batch
    const processedMetrics: MetricEntry[] = [];

    for (const [metricName, metricData] of Object.entries(metrics)) {
      const typedMetricData = metricData as WebVitalMetric;
      const metricEntry: MetricEntry = {
        id: generateMetricId(),
        metric: metricName,
        name: typedMetricData.name,
        value: typedMetricData.value,
        delta: typedMetricData.delta,
        originId: typedMetricData.id,
        sessionId: sessionId || 'anonymous',
        _userId: userId || null,
        timestamp: new Date(timestamp || Date.now()).toISOString(),
        url: typedMetricData.url || url,
        pathname: typedMetricData.pathname,
        userAgent: typedMetricData.userAgent,
        connectionType: typedMetricData.connectionType,
        deviceMemory: typedMetricData.deviceMemory,
        hardwareConcurrency: typedMetricData.hardwareConcurrency,
        isPatientView: typedMetricData.isPatientView || false,
        isAppointmentView: typedMetricData.isAppointmentView || false,
        isMedicalRecordView: typedMetricData.isMedicalRecordView || false,
        clinicId: null,
        requestId: generateMetricId(),
      };

      processedMetrics.push(metricEntry);
    }

    // Store all metrics
    const sessionKey = sessionId || 'anonymous';
    if (!metricsStore.has(sessionKey)) {
      metricsStore.set(sessionKey, []);
    }
    metricsStore.get(sessionKey)!.push(...processedMetrics);

    // Return empty response for beacon (standard)
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Web vitals beacon error:', error);
    return new Response(null, { status: 204 });
  }
});

// Analytics dashboard endpoint
webVitalsRouter.get('/api/analytics/web-vitals/dashboard', async c => {
  try {
    // Get time range from query params
    const timeRange = c.req.query('timeRange') || '24h';
    const since = getTimeRangeStart(timeRange);

    // Filter metrics by time range
    const allMetrics: MetricEntry[] = [];
    for (const [, metrics] of metricsStore.entries()) {
      const filteredMetrics = metrics.filter(
        m => new Date(m.timestamp) >= since,
      );
      allMetrics.push(...filteredMetrics);
    }

    const dashboard = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: new Set(allMetrics.map(m => m.sessionId)).size,
        totalMetrics: allMetrics.length,
        uniqueUsers: new Set(allMetrics.map(m => m._userId).filter(Boolean))
          .size,
        timeRangeStart: since.toISOString(),
      },
      coreWebVitals: calculateCoreWebVitals(allMetrics),
      performanceGrade: calculatePerformanceGrade(allMetrics),
      healthcareMetrics: calculateHealthcareMetrics(allMetrics),
      deviceBreakdown: calculateDeviceBreakdown(allMetrics),
      urlBreakdown: calculateUrlBreakdown(allMetrics),
      trends: calculateTrends(allMetrics),
    };

    return c.json(dashboard);
  } catch (error) {
    console.error('Dashboard generation error:', error);
    return c.json({ error: 'Failed to generate dashboard' }, 500);
  }
});

// Helper functions
function generateMetricId(): string {
  return 'metric-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getTimeRangeStart(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

async function checkPerformanceThresholds(metric: MetricEntry): Promise<void> {
  const thresholds: PerformanceThresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric.metric as keyof PerformanceThresholds];
  if (!threshold) return;

  let performanceLevel = 'good';
  if (metric.value > threshold.poor) {
    performanceLevel = 'poor';
  } else if (metric.value > threshold.good) {
    performanceLevel = 'needs-improvement';
  }

  // Healthcare-specific alerting
  if (
    performanceLevel === 'poor'
    && (metric.isPatientView
      || metric.isAppointmentView
      || metric.isMedicalRecordView)
  ) {
    console.warn(
      `🏥 Healthcare performance issue: ${metric.metric} = ${metric.value} on ${metric.pathname}`,
    );

    // Could integrate with alerting system here
    // await sendHealthcarePerformanceAlert(metric);
  }
}

function calculateCoreWebVitals(
  metrics: MetricEntry[],
): Record<string, MetricAnalysis> {
  const vitals = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
  const results: Record<string, MetricAnalysis> = {};

  vitals.forEach(vital => {
    const vitalMetrics = metrics.filter(m => m.metric === vital);
    if (vitalMetrics.length === 0) {
      results[vital] = {
        metric: vital,
        count: 0,
        avg: 0,
        p50: 0,
        p90: 0,
        p95: 0,
      };
      return;
    }

    const values = vitalMetrics.map(m => m.value).sort((a, _b) => a - b);
    const p50 = values[Math.floor(values.length * 0.5)] || 0;
    const p90 = values[Math.floor(values.length * 0.9)] || 0;
    const p95 = values[Math.floor(values.length * 0.95)] || 0;
    const avg = values.reduce((sum, _v) => sum + v, 0) / values.length;

    results[vital] = {
      metric: vital,
      count: vitalMetrics.length,
      avg: Math.round(avg * 100) / 100,
      p50: Math.round(p50 * 100) / 100,
      p90: Math.round(p90 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
    };
  });

  return results;
}

function calculatePerformanceGrade(metrics: MetricEntry[]): {
  score: number;
  grade: string;
  goodMetrics: number;
  totalMetrics: number;
} {
  const coreVitals = calculateCoreWebVitals(metrics);
  const thresholds = {
    LCP: { good: 2500 },
    FID: { good: 100 },
    CLS: { good: 0.1 },
  };

  let goodCount = 0;
  let totalCount = 0;

  ['LCP', 'FID', 'CLS'].forEach(vital => {
    const metric = coreVitals[vital];
    if (metric && metric.count > 0) {
      totalCount++;
      if (metric.p95 <= thresholds[vital as keyof typeof thresholds].good) {
        goodCount++;
      }
    }
  });

  const score = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;
  let grade = 'F';

  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';

  return {
    score: Math.round(score),
    grade,
    goodMetrics: goodCount,
    totalMetrics: totalCount,
  };
}

function calculateHealthcareMetrics(metrics: MetricEntry[]): {
  count: number;
  averageResponseTime?: number;
  patientViews?: number;
  appointmentViews?: number;
  medicalRecordViews?: number;
  complianceStatus?: string;
  complianceThreshold?: number;
} {
  const healthcareMetrics = metrics.filter(
    m => m.isPatientView || m.isAppointmentView || m.isMedicalRecordView,
  );

  if (healthcareMetrics.length === 0) {
    return { count: 0 };
  }

  const avgResponseTime = healthcareMetrics.reduce((sum, _m) => sum + m.value, 0)
    / healthcareMetrics.length;

  return {
    count: healthcareMetrics.length,
    averageResponseTime: Math.round(avgResponseTime),
    patientViews: healthcareMetrics.filter(m => m.isPatientView).length,
    appointmentViews: healthcareMetrics.filter(m => m.isAppointmentView)
      .length,
    medicalRecordViews: healthcareMetrics.filter(m => m.isMedicalRecordView)
      .length,
    complianceStatus: avgResponseTime <= 2000 ? 'compliant' : 'needs-improvement',
    complianceThreshold: 2000,
  };
}

function calculateDeviceBreakdown(metrics: MetricEntry[]): Array<{
  device: string;
  metrics: number;
  sessions: number;
}> {
  const devices: Record<string, { count: number; sessions: Set<string> }> = {};

  metrics.forEach(metric => {
    const memory = metric.deviceMemory || 'unknown';
    const cores = metric.hardwareConcurrency || 'unknown';
    const connection = metric.connectionType || 'unknown';
    const key = `${memory}GB-${cores}cores-${connection}`;

    if (!devices[key]) {
      devices[key] = { count: 0, sessions: new Set() };
    }

    devices[key].count++;
    devices[key].sessions.add(metric.sessionId);
  });

  return Object.entries(devices)
    .map(([device, _data]) => ({
      device,
      metrics: data.count,
      sessions: data.sessions.size,
    }))
    .sort((a, _b) => b.metrics - a.metrics);
}

function calculateUrlBreakdown(metrics: MetricEntry[]): Array<{
  url: string;
  metrics: number;
  sessions: number;
  avgValue: number;
}> {
  const urls: Record<
    string,
    { metrics: MetricEntry[]; sessions: Set<string> }
  > = {};

  metrics.forEach(metric => {
    const pathname = metric.pathname || metric.url || 'unknown';
    if (!urls[pathname]) {
      urls[pathname] = { metrics: [], sessions: new Set() };
    }
    urls[pathname].metrics.push(metric);
    urls[pathname].sessions.add(metric.sessionId);
  });

  return Object.entries(urls)
    .map(([url, _data]) => ({
      url,
      metrics: data.metrics.length,
      sessions: data.sessions.size,
      avgValue: Math.round(
        data.metrics.reduce((sum, _m) => sum + m.value, 0)
          / data.metrics.length,
      ),
    }))
    .sort((a, _b) => b.metrics - a.metrics);
}

function calculateTrends(metrics: MetricEntry[]): Array<{
  hour: number;
  count: number;
  avgValue: number;
}> {
  const trends: Record<number, MetricEntry[]> = {};

  metrics.forEach(metric => {
    const hour = new Date(metric.timestamp).getHours();
    if (!trends[hour]) {
      trends[hour] = [];
    }
    trends[hour].push(metric);
  });

  return Object.entries(trends)
    .map(([hour, _hourMetrics]) => ({
      hour: parseInt(hour),
      count: hourMetrics.length,
      avgValue: Math.round(
        _hourMetrics.reduce((sum, _m) => sum + m.value, 0) / hourMetrics.length,
      ),
    }))
    .sort((a, _b) => a.hour - b.hour);
}

export default webVitalsRouter;
