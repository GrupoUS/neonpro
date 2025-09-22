import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
const metricsApi = new Hono();

// In-memory storage for metrics (use Redis in production)
const metrics = {
  webVitals: [] as any[],
  serverMetrics: [] as any[],
  databaseMetrics: [] as any[],
};

// Web Vitals schema
const webVitalSchema = z.object({
  name: z.string(),
  value: z.number(),
  delta: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  timestamp: z.number(),
  url: z.string(),
  sessionId: z.string(),
  userAgent: z.string(),
  connection: z.string().optional(),
});

// Server metrics schema
const serverMetricSchema = z.object({
  type: z.enum(['cold-start', 'execution-time', 'memory-usage', 'bundle-size']),
  value: z.number(),
  timestamp: z.number(),
  metadata: z.record(z.any()).optional(),
});

// Collect Web Vitals
metricsApi.post(
  '/web-vitals',
  zValidator('json', webVitalSchema),
  async c => {
    const metric = c.req.valid('json');

    // Store metric
    metrics.webVitals.push({
      ...metric,
      receivedAt: Date.now(),
    });

    // Keep only last 10,000 metrics
    if (metrics.webVitals.length > 10000) {
      metrics.webVitals = metrics.webVitals.slice(-10000);
    }

    return c.json({ success: true });
  },
);

// Collect server metrics
metricsApi.post(
  '/server',
  zValidator('json', serverMetricSchema),
  async c => {
    const metric = c.req.valid('json');

    metrics.serverMetrics.push({
      ...metric,
      receivedAt: Date.now(),
    });

    if (metrics.serverMetrics.length > 5000) {
      metrics.serverMetrics = metrics.serverMetrics.slice(-5000);
    }

    return c.json({ success: true });
  },
);

// Get performance dashboard data
metricsApi.get('/dashboard', async c => {
  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;
  // const last1Hour = now - (60 * 60 * 1000); // unused

  // Filter recent metrics
  const recentWebVitals = metrics.webVitals.filter(
    m => m.timestamp > last24Hours,
  );
  const recentServerMetrics = metrics.serverMetrics.filter(
    m => m.timestamp > last24Hours,
  );

  // Calculate Core Web Vitals averages
  const webVitalsByName = recentWebVitals.reduce((acc,_metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    },
    {} as Record<string, number[]>,
  );

  const webVitalsAverages = Object.entries(webVitalsByName).reduce((acc,_[name,_values]) => {
      acc[name] = {
        average: values.reduce((sum,_val) => sum + val, 0) / values.length,
        p95: percentile(values, 95),
        p99: percentile(values, 99),
        count: values.length,
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  // Calculate server metrics
  const coldStarts = recentServerMetrics
    .filter(m => m.type === 'cold-start')
    .map(m => m.value);

  const executionTimes = recentServerMetrics
    .filter(m => m.type === 'execution-time')
    .map(m => m.value);

  const dashboard = {
    timestamp: now,
    period: '24h',

    webVitals: webVitalsAverages,

    server: {
      coldStarts: {
        average: average(coldStarts),
        p95: percentile(coldStarts, 95),
        count: coldStarts.length,
      },
      executionTime: {
        average: average(executionTimes),
        p95: percentile(executionTimes, 95),
        count: executionTimes.length,
      },
    },

    alerts: generateAlerts(webVitalsAverages, recentServerMetrics),

    summary: {
      totalSessions: new Set(recentWebVitals.map(m => m.sessionId)).size,
      totalPageViews: recentWebVitals.filter(m => m.name === 'FCP').length,
      averageRating: calculateAverageRating(recentWebVitals),
    },
  };

  return c.json(dashboard);
});

// Get real-time metrics (last 5 minutes)
metricsApi.get('/realtime', async c => {
  const now = Date.now();
  const last5Minutes = now - 5 * 60 * 1000;

  const recentMetrics = {
    webVitals: metrics.webVitals.filter(m => m.timestamp > last5Minutes),
    server: metrics.serverMetrics.filter(m => m.timestamp > last5Minutes),
  };

  return c.json({
    timestamp: now,
    period: '5m',
    metrics: recentMetrics,
    counts: {
      webVitals: recentMetrics.webVitals.length,
      server: recentMetrics.server.length,
    },
  });
});

// Helper functions
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a,_b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum,_val) => sum + val, 0) / values.length;
}

function generateAlerts(webVitals: any, serverMetrics: any[]) {
  const alerts = [];

  // Web Vitals alerts
  Object.entries(webVitals).forEach(([name, data]: [string,_any]) => {
    if (name === 'LCP' && data.average > 2500) {
      alerts.push({
        type: 'warning',
        metric: 'LCP',
        message: `Largest Contentful Paint is ${Math.round(data.average)}ms (target: <2.5s)`,
        value: data.average,
      });
    }

    if (name === 'FID' && data.average > 100) {
      alerts.push({
        type: 'warning',
        metric: 'FID',
        message: `First Input Delay is ${Math.round(data.average)}ms (target: <100ms)`,
        value: data.average,
      });
    }
  });

  // Server alerts
  const coldStarts = serverMetrics.filter(m => m.type === 'cold-start');
  const avgColdStart = average(coldStarts.map(m => m.value));

  if (avgColdStart > 1000) {
    alerts.push({
      type: 'error',
      metric: 'cold-start',
      message: `Average cold start time is ${Math.round(avgColdStart)}ms (target: <1s)`,
      value: avgColdStart,
    });
  }

  return alerts;
}

function calculateAverageRating(metrics: any[]): number {
  const ratings = { good: 3, 'needs-improvement': 2, poor: 1 };
  const total = metrics.reduce((sum,_metric) => sum + (ratings[metric.rating] || 0),
    0,
  );
  return total / metrics.length || 0;
}

export default metricsApi;
