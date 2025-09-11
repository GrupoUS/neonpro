/**
 * 📊 Core Web Vitals Analytics API Endpoint
 * Handles web vitals data collection and analysis
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const webVitalsRouter = new Hono();

// Enable CORS for web vitals reporting
webVitalsRouter.use('*', cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://neonpro.vercel.app',
    'https://neonpro.com.br'
  ],
  allowMethods: ['POST', 'GET'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// In-memory storage (replace with your database)
const metricsStore = new Map();
const sessionsStore = new Map();

// Core Web Vitals reporting endpoint
webVitalsRouter.post('/api/analytics/web-vitals', async (c) => {
  try {
    const body = await c.req.json();
    const { metric, data, sessionId, userId } = body;

    // Validate required fields
    if (!metric || !data || typeof data.value === 'undefined') {
      return c.json({ error: 'Invalid metric data' }, 400);
    }

    // Create metric entry
    const metricEntry = {
      id: generateMetricId(),
      metric,
      value: data.value,
      delta: data.delta,
      metricId: data.id,
      sessionId: sessionId || 'anonymous',
      userId: userId || null,
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
      clinicId: c.get('clinicId') || null,
      requestId: c.get('requestId') || generateMetricId()
    };

    // Store metric
    if (!metricsStore.has(sessionId)) {
      metricsStore.set(sessionId, []);
    }
    metricsStore.get(sessionId).push(metricEntry);

    // Update session info
    if (!sessionsStore.has(sessionId)) {
      sessionsStore.set(sessionId, {
        sessionId,
        userId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metricsCount: 0,
        urls: new Set()
      });
    }
    
    const session = sessionsStore.get(sessionId);
    session.lastActivity = new Date().toISOString();
    session.metricsCount++;
    session.urls.add(data.pathname || data.url);

    // Check for performance issues
    await checkPerformanceThresholds(metricEntry);

    return c.json({ 
      status: 'recorded',
      metricId: metricEntry.id,
      timestamp: metricEntry.timestamp
    });

  } catch (error) {
    console.error('Web vitals recording error:', error);
    return c.json({ error: 'Failed to record metric' }, 500);
  }
});

// Batch metrics endpoint (beacon)
webVitalsRouter.post('/api/analytics/web-vitals/beacon', async (c) => {
  try {
    const body = await c.req.json();
    const { metrics, sessionId, userId, url, timestamp } = body;

    if (!metrics || typeof metrics !== 'object') {
      return new Response(null, { status: 204 });
    }

    // Process each metric in the batch
    const processedMetrics = [];
    
    for (const [metricName, metricData] of Object.entries(metrics)) {
      const metricEntry = {
        id: generateMetricId(),
        metric: metricName,
        value: metricData.value,
        delta: metricData.delta,
        metricId: metricData.id,
        sessionId: sessionId || 'anonymous',
        userId: userId || null,
        timestamp: new Date(timestamp || Date.now()).toISOString(),
        url: metricData.url || url,
        pathname: metricData.pathname,
        userAgent: metricData.userAgent,
        connectionType: metricData.connectionType,
        deviceMemory: metricData.deviceMemory,
        hardwareConcurrency: metricData.hardwareConcurrency,
        isPatientView: metricData.isPatientView || false,
        isAppointmentView: metricData.isAppointmentView || false,
        isMedicalRecordView: metricData.isMedicalRecordView || false,
        batchSubmission: true
      };

      processedMetrics.push(metricEntry);
    }

    // Store all metrics
    if (!metricsStore.has(sessionId)) {
      metricsStore.set(sessionId, []);
    }
    metricsStore.get(sessionId).push(...processedMetrics);

    // Return empty response for beacon (standard)
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error('Web vitals beacon error:', error);
    return new Response(null, { status: 204 });
  }
});

// Analytics dashboard endpoint
webVitalsRouter.get('/api/analytics/web-vitals/dashboard', async (c) => {
  try {
    // Get time range from query params
    const timeRange = c.req.query('timeRange') || '24h';
    const since = getTimeRangeStart(timeRange);

    // Filter metrics by time range
    const allMetrics = [];
    for (const [sessionId, metrics] of metricsStore.entries()) {
      const filteredMetrics = metrics.filter(m => new Date(m.timestamp) >= since);
      allMetrics.push(...filteredMetrics);
    }

    const dashboard = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: new Set(allMetrics.map(m => m.sessionId)).size,
        totalMetrics: allMetrics.length,
        uniqueUsers: new Set(allMetrics.map(m => m.userId).filter(Boolean)).size,
        timeRangeStart: since.toISOString()
      },
      coreWebVitals: calculateCoreWebVitals(allMetrics),
      performanceGrade: calculatePerformanceGrade(allMetrics),
      healthcareMetrics: calculateHealthcareMetrics(allMetrics),
      deviceBreakdown: calculateDeviceBreakdown(allMetrics),
      urlBreakdown: calculateUrlBreakdown(allMetrics),
      trends: calculateTrends(allMetrics)
    };

    return c.json(dashboard);

  } catch (error) {
    console.error('Dashboard generation error:', error);
    return c.json({ error: 'Failed to generate dashboard' }, 500);
  }
});

// Helper functions
function generateMetricId() {
  return 'metric-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getTimeRangeStart(timeRange) {
  const now = new Date();
  switch (timeRange) {
    case '1h': return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

async function checkPerformanceThresholds(metric) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  const threshold = thresholds[metric.metric];
  if (!threshold) return;

  let performanceLevel = 'good';
  if (metric.value > threshold.poor) {
    performanceLevel = 'poor';
  } else if (metric.value > threshold.good) {
    performanceLevel = 'needs-improvement';
  }

  // Healthcare-specific alerting
  if (performanceLevel === 'poor' && 
      (metric.isPatientView || metric.isAppointmentView || metric.isMedicalRecordView)) {
    console.warn(`🏥 Healthcare performance issue: ${metric.metric} = ${metric.value} on ${metric.pathname}`);
    
    // Could integrate with alerting system here
    // await sendHealthcarePerformanceAlert(metric);
  }
}

function calculateCoreWebVitals(metrics) {
  const vitals = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
  const results = {};

  vitals.forEach(vital => {
    const vitalMetrics = metrics.filter(m => m.metric === vital);
    if (vitalMetrics.length === 0) {
      results[vital] = { count: 0 };
      return;
    }

    const values = vitalMetrics.map(m => m.value).sort((a, b) => a - b);
    const p50 = values[Math.floor(values.length * 0.50)] || 0;
    const p75 = values[Math.floor(values.length * 0.75)] || 0;
    const p90 = values[Math.floor(values.length * 0.90)] || 0;
    const p95 = values[Math.floor(values.length * 0.95)] || 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    results[vital] = {
      count: vitalMetrics.length,
      p50: Math.round(p50 * 100) / 100,
      p75: Math.round(p75 * 100) / 100,
      p90: Math.round(p90 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      average: Math.round(avg * 100) / 100,
      min: values[0],
      max: values[values.length - 1]
    };
  });

  return results;
}

function calculatePerformanceGrade(metrics) {
  const coreVitals = calculateCoreWebVitals(metrics);
  const thresholds = {
    LCP: { good: 2500 },
    FID: { good: 100 },
    CLS: { good: 0.1 }
  };

  let goodCount = 0;
  let totalCount = 0;

  ['LCP', 'FID', 'CLS'].forEach(vital => {
    const metric = coreVitals[vital];
    if (metric && metric.count > 0) {
      totalCount++;
      if (metric.p75 <= thresholds[vital].good) {
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
    totalMetrics: totalCount
  };
}

function calculateHealthcareMetrics(metrics) {
  const healthcareMetrics = metrics.filter(m => 
    m.isPatientView || m.isAppointmentView || m.isMedicalRecordView
  );

  if (healthcareMetrics.length === 0) {
    return { count: 0 };
  }

  const avgResponseTime = healthcareMetrics.reduce((sum, m) => sum + m.value, 0) / healthcareMetrics.length;
  
  return {
    count: healthcareMetrics.length,
    averageResponseTime: Math.round(avgResponseTime),
    patientViews: healthcareMetrics.filter(m => m.isPatientView).length,
    appointmentViews: healthcareMetrics.filter(m => m.isAppointmentView).length,
    medicalRecordViews: healthcareMetrics.filter(m => m.isMedicalRecordView).length,
    complianceStatus: avgResponseTime <= 2000 ? 'compliant' : 'needs-improvement',
    complianceThreshold: 2000
  };
}

function calculateDeviceBreakdown(metrics) {
  const devices = {};
  
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
    .map(([device, data]) => ({
      device,
      metrics: data.count,
      sessions: data.sessions.size
    }))
    .sort((a, b) => b.metrics - a.metrics);
}

function calculateUrlBreakdown(metrics) {
  const urls = {};
  
  metrics.forEach(metric => {
    const pathname = metric.pathname || metric.url || 'unknown';
    if (!urls[pathname]) {
      urls[pathname] = { 
        count: 0, 
        sessions: new Set(),
        avgValue: 0,
        totalValue: 0
      };
    }
    
    urls[pathname].count++;
    urls[pathname].sessions.add(metric.sessionId);
    urls[pathname].totalValue += metric.value;
    urls[pathname].avgValue = urls[pathname].totalValue / urls[pathname].count;
  });

  return Object.entries(urls)
    .map(([url, data]) => ({
      url,
      metrics: data.count,
      sessions: data.sessions.size,
      avgPerformance: Math.round(data.avgValue)
    }))
    .sort((a, b) => b.metrics - a.metrics)
    .slice(0, 20);
}

function calculateTrends(metrics) {
  // Basic hourly trends for the last 24 hours
  const hourlyMetrics = {};
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = hour.getHours();
    hourlyMetrics[hourKey] = { hour: hourKey, count: 0, avgPerformance: 0 };
  }
  
  metrics.forEach(metric => {
    const hour = new Date(metric.timestamp).getHours();
    if (hourlyMetrics[hour]) {
      hourlyMetrics[hour].count++;
    }
  });
  
  return Object.values(hourlyMetrics);
}

export default webVitalsRouter;