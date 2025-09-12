#!/usr/bin/env node

/**
 * 📊 NEONPRO - Core Web Vitals Monitoring Setup
 * Real User Monitoring (RUM) for production performance tracking
 */

const fs = require('fs');
const path = require('path');

class CoreWebVitalsMonitor {
  constructor() {
    this.metricsHistory = [];
    this.thresholds = {
      // Core Web Vitals thresholds (75th percentile)
      LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
      FID: { good: 100, needsImprovement: 300 },   // First Input Delay
      CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
      // Additional metrics
      FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
      TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte
    };
  }

  createWebVitalsSetup() {
    console.log('📊 Setting up Core Web Vitals monitoring...');
    
    // Create necessary directories
    const webDir = path.join(__dirname, '../../apps/web/src/lib/performance');
    const apiDir = path.join(__dirname, '../../apps/api/src/routes');
    
    if (!fs.existsSync(webDir)) {
      fs.mkdirSync(webDir, { recursive: true });
    }
    
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Generate client-side monitoring script
    this.generateClientScript(webDir);
    
    // Generate server-side analytics endpoint
    this.generateServerEndpoint(apiDir);
    
    // Generate performance monitoring dashboard
    this.generateDashboard();
    
    // Generate package.json additions
    this.generatePackageUpdates();

    console.log('✅ Core Web Vitals setup completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Install web-vitals: npm install web-vitals');
    console.log('  2. Add the client script to your main app entry');
    console.log('  3. Import and use the API routes in your Hono app');
    console.log('  4. Configure environment variables for analytics');
  }

  generateClientScript(webDir) {
    const clientScript = `/**
 * 📊 Core Web Vitals Client-side Monitoring
 * Measures and reports Core Web Vitals to analytics endpoint
 */

// Import web-vitals library (install with: npm install web-vitals)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class WebVitalsReporter {
  constructor() {
    this.metrics = {};
    this.apiEndpoint = '/api/analytics/web-vitals';
    this.sessionId = this.getSessionId();
    this.userId = this.getUserId();
  }

  // Initialize all Core Web Vitals measurements
  init() {
    console.log('🚀 Initializing Core Web Vitals monitoring...');
    
    // Measure Largest Contentful Paint
    getLCP((metric) => {
      this.reportMetric('LCP', metric);
    });

    // Measure First Input Delay
    getFID((metric) => {
      this.reportMetric('FID', metric);
    });

    // Measure Cumulative Layout Shift
    getCLS((metric) => {
      this.reportMetric('CLS', metric);
    });

    // Measure First Contentful Paint
    getFCP((metric) => {
      this.reportMetric('FCP', metric);
    });

    // Measure Time to First Byte
    getTTFB((metric) => {
      this.reportMetric('TTFB', metric);
    });

    // Setup lifecycle events
    this.setupLifecycleReporting();
  }

  // Report individual metric
  reportMetric(name, metric) {
    const metricData = {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType,
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      // Healthcare-specific context
      isPatientView: window.location.pathname.includes('/patients/'),
      isAppointmentView: window.location.pathname.includes('/appointments/'),
      isMedicalRecordView: window.location.pathname.includes('/medical-records/')
    };

    this.metrics[name] = metricData;

    // Send immediately for critical metrics
    if (['LCP', 'FID', 'CLS'].includes(name)) {
      this.sendToAnalytics(name, metricData);
    }
  }

  // Send metrics to analytics endpoint
  async sendToAnalytics(metricName, data) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: metricName,
          data: data,
          sessionId: this.sessionId,
          userId: this.userId
        }),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to send web vitals metric:', error);
    }
  }

  // Setup lifecycle event reporting
  setupLifecycleReporting() {
    // Report when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.sendBatchMetrics();
    });

    // Report when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendBatchMetrics();
      }
    });
  }

  // Send all metrics as batch
  sendBatchMetrics() {
    if (Object.keys(this.metrics).length === 0) return;

    const data = JSON.stringify({
      type: 'web-vitals-batch',
      metrics: this.metrics,
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      timestamp: Date.now()
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiEndpoint + '/beacon', data);
    }
  }

  // Get or generate session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('webvitals-session');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('webvitals-session', sessionId);
    }
    return sessionId;
  }

  // Get user ID from your auth system
  getUserId() {
    // Implement based on your authentication system
    return localStorage.getItem('userId') || 
           sessionStorage.getItem('userId') || 
           null;
  }
}

// Initialize monitoring when DOM is ready
function initWebVitals() {
  if (typeof window !== 'undefined') {
    const reporter = new WebVitalsReporter();
    reporter.init();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebVitals);
} else {
  initWebVitals();
}

export { WebVitalsReporter, initWebVitals };
export default WebVitalsReporter;`;

    fs.writeFileSync(path.join(webDir, 'web-vitals.js'), clientScript);
    console.log('✅ Generated client-side web vitals script');
  }

  generateServerEndpoint(apiDir) {
    const serverEndpoint = `/**
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
    console.warn(\`🏥 Healthcare performance issue: \${metric.metric} = \${metric.value} on \${metric.pathname}\`);
    
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
    const key = \`\${memory}GB-\${cores}cores-\${connection}\`;
    
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

export default webVitalsRouter;`;

    fs.writeFileSync(path.join(apiDir, 'web-vitals.ts'), serverEndpoint);
    console.log('✅ Generated server-side analytics endpoint');
  }

  generateDashboard() {
    const dashboardScript = `#!/usr/bin/env node

/**
 * 📊 Performance Dashboard Generator
 * Creates HTML performance reports from Core Web Vitals data
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class PerformanceDashboard {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || process.env.DEPLOYMENT_URL || 'localhost:3000';
    this.reportPath = path.join(__dirname, '../reports');
  }

  async generateReport() {
    console.log('📊 Generating Performance Report...');
    
    try {
      // Fetch dashboard data from API
      const data = await this.fetchDashboardData();
      
      // Generate HTML report
      const htmlReport = this.generateHTMLReport(data);
      
      // Save report
      const reportFile = this.saveReport(htmlReport);
      
      console.log(\`✅ Report generated: \${reportFile}\`);
      
      return reportFile;
      
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
      throw error;
    }
  }

  async fetchDashboardData() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiUrl,
        port: this.apiUrl.includes('localhost') ? 3000 : 443,
        path: '/api/analytics/web-vitals/dashboard',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const protocol = this.apiUrl.includes('localhost') ? require('http') : require('https');
      
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  generateHTMLReport(data) {
    return \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro - Performance Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .performance-score {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            text-align: center;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            font-weight: bold;
            color: white;
        }
        .score-a { background: #10b981; }
        .score-b { background: #f59e0b; }
        .score-c { background: #ef4444; }
        .score-d { background: #dc2626; }
        .score-f { background: #7f1d1d; }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .metric-title {
            font-size: 0.9em;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .metric-good { color: #10b981; }
        .metric-warning { color: #f59e0b; }
        .metric-poor { color: #ef4444; }
        .metric-subtitle {
            font-size: 0.85em;
            color: #6b7280;
        }
        .healthcare-section {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .healthcare-section h3 {
            color: #92400e;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-number {
            font-size: 1.5em;
            font-weight: bold;
            color: #4f46e5;
        }
        .footer {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
        .alert {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 NeonPro Performance Dashboard</h1>
            <p>Gerado em: \${new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
            <p>Período: \${data.timeRange || '24h'} • \${data.summary.totalSessions} sessões • \${data.summary.totalMetrics} métricas</p>
        </div>

        <div class="performance-score">
            <div class="score-circle score-\${data.performanceGrade.grade.toLowerCase()}">
                \${data.performanceGrade.grade}
            </div>
            <h2>Performance Score: \${data.performanceGrade.score}/100</h2>
            <p>\${data.performanceGrade.goodMetrics} de \${data.performanceGrade.totalMetrics} Core Web Vitals dentro do ideal</p>
        </div>

        \${data.healthcareMetrics && data.healthcareMetrics.count > 0 ? \`
        <div class="healthcare-section">
            <h3>🏥 Métricas de Saúde - Conformidade LGPD</h3>
            <p><strong>Status:</strong> \${data.healthcareMetrics.complianceStatus === 'compliant' ? '✅ Conforme' : '⚠️ Requer Atenção'}</p>
            <p><strong>Tempo Médio de Resposta:</strong> \${data.healthcareMetrics.averageResponseTime}ms (limite: \${data.healthcareMetrics.complianceThreshold}ms)</p>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-number">\${data.healthcareMetrics.patientViews}</div>
                    <div>Visualizações de Pacientes</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">\${data.healthcareMetrics.appointmentViews}</div>
                    <div>Visualizações de Consultas</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">\${data.healthcareMetrics.medicalRecordViews}</div>
                    <div>Visualizações de Prontuários</div>
                </div>
            </div>
        </div>
        \` : ''}

        <h2>📊 Core Web Vitals</h2>
        <div class="metrics-grid">
            \${this.generateMetricCards(data.coreWebVitals)}
        </div>

        <h2>📈 Resumo da Sessão</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-number">\${data.summary.totalSessions}</div>
                <div>Sessões Únicas</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">\${data.summary.uniqueUsers || 0}</div>
                <div>Usuários Únicos</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">\${data.summary.totalMetrics}</div>
                <div>Total de Métricas</div>
            </div>
        </div>

        \${data.urlBreakdown && data.urlBreakdown.length > 0 ? \`
        <h2>🔗 Performance por Página</h2>
        <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #e5e7eb;">
                        <th style="text-align: left; padding: 10px; color: #6b7280;">URL</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Métricas</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Sessões</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Perf. Média</th>
                    </tr>
                </thead>
                <tbody>
                    \${data.urlBreakdown.slice(0, 10).map(url => \`
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 10px; font-family: monospace; font-size: 0.9em;">\${url.url}</td>
                        <td style="padding: 10px; text-align: right;">\${url.metrics}</td>
                        <td style="padding: 10px; text-align: right;">\${url.sessions}</td>
                        <td style="padding: 10px; text-align: right;">\${url.avgPerformance}ms</td>
                    </tr>
                    \`).join('')}
                </tbody>
            </table>
        </div>
        \` : ''}

        <div class="footer">
            <p>📊 Dashboard gerado automaticamente pelo sistema de monitoramento NeonPro</p>
            <p>Para relatórios em tempo real, acesse: \${this.apiUrl}/api/analytics/web-vitals/dashboard</p>
        </div>
    </div>
</body>
</html>\`;
  }

  generateMetricCards(vitals) {
    const metrics = [
      { key: 'LCP', name: 'Largest Contentful Paint', unit: 'ms', good: 2500, poor: 4000 },
      { key: 'FID', name: 'First Input Delay', unit: 'ms', good: 100, poor: 300 },
      { key: 'CLS', name: 'Cumulative Layout Shift', unit: '', good: 0.1, poor: 0.25 },
      { key: 'FCP', name: 'First Contentful Paint', unit: 'ms', good: 1800, poor: 3000 },
      { key: 'TTFB', name: 'Time to First Byte', unit: 'ms', good: 800, poor: 1800 }
    ];

    return metrics.map(metric => {
      const data = vitals[metric.key];
      if (!data || data.count === 0) {
        return \`
        <div class="metric-card">
            <div class="metric-title">\${metric.name}</div>
            <div class="metric-value" style="color: #9ca3af;">N/A</div>
            <div class="metric-subtitle">Sem dados</div>
        </div>\`;
      }

      let cssClass = 'metric-good';
      if (data.p75 > metric.poor) cssClass = 'metric-poor';
      else if (data.p75 > metric.good) cssClass = 'metric-warning';

      return \`
        <div class="metric-card">
            <div class="metric-title">\${metric.name} (\${metric.key})</div>
            <div class="metric-value \${cssClass}">\${data.p75}\${metric.unit}</div>
            <div class="metric-subtitle">P75 • \${data.count} amostras</div>
        </div>\`;
    }).join('');
  }

  saveReport(htmlContent) {
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }

    const filename = \`performance-report-\${new Date().toISOString().split('T')[0]}-\${Date.now()}.html\`;
    const filePath = path.join(this.reportPath, filename);
    
    fs.writeFileSync(filePath, htmlContent);
    
    return filePath;
  }
}

// CLI usage
if (require.main === module) {
  const apiUrl = process.argv[2] || process.env.DEPLOYMENT_URL;
  const dashboard = new PerformanceDashboard(apiUrl);
  
  dashboard.generateReport()
    .then(reportFile => {
      console.log(\`🎉 Performance report ready: \${reportFile}\`);
      console.log('Open the HTML file in your browser to view the report');
    })
    .catch(error => {
      console.error('Failed to generate report:', error);
      process.exit(1);
    });
}

module.exports = PerformanceDashboard;`;

    fs.writeFileSync(path.join(__dirname, '../performance/dashboard-generator.js'), dashboardScript);
    fs.chmodSync(path.join(__dirname, '../performance/dashboard-generator.js'), 0o755);
    console.log('✅ Generated performance dashboard generator');
  }

  generatePackageUpdates() {
    const packageUpdates = {
      devDependencies: {
        "web-vitals": "^4.0.0"
      },
      scripts: {
        "performance:report": "node scripts/performance/dashboard-generator.js",
        "performance:monitor": "node monitoring/scripts/performance-monitor.js"
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '../package-updates.json'),
      JSON.stringify(packageUpdates, null, 2)
    );

    console.log('✅ Generated package.json updates');
    console.log('📋 Add these to your package.json:');
    console.log(JSON.stringify(packageUpdates, null, 2));
  }
}

// Run setup if executed directly
if (require.main === module) {
  const monitor = new CoreWebVitalsMonitor();
  monitor.createWebVitalsSetup();
}

module.exports = CoreWebVitalsMonitor;