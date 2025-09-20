import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Mock handlers for financial API endpoints
export const handlers = [
  // AI CRUD Intent API
  http.post('/api/v1/ai/crud/intent', async ({ request }) => {
    const body = await request.json();
    
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    // Mock successful intent creation
    return HttpResponse.json({
      success: true,
      data: {
        intentId: 'intent-123',
        token: 'secure-token-456',
        entity: body.entity,
        operation: body.operation,
        status: 'created',
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      },
      meta: {
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // AI CRUD Confirm API
  http.post('/api/v1/ai/crud/confirm', async ({ request }) => {
    const body = await request.json();
    
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    // Mock successful confirmation
    return HttpResponse.json({
      success: true,
      data: {
        confirmId: 'confirm-456',
        executionToken: 'exec-token-789',
        validated: true,
        transformations: {},
        compliance: {
          lgpd: { valid: true, score: 95 },
          cfm: { valid: true, score: 92 },
          anvisa: { valid: true, score: 88 },
        },
      },
      meta: {
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
        workflow: {
          currentStep: 'confirmed',
          nextStep: 'execute',
        },
      },
    });
  }),

  // AI CRUD Execute API
  http.post('/api/v1/ai/crud/execute', async ({ request }) => {
    const body = await request.json();
    
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer test-token') {
      return HttpResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    // Mock successful execution
    return HttpResponse.json({
      success: true,
      data: {
        executionId: 'exec-789',
        result: {
          id: 'patient-123',
          ...body.operation.data,
        },
        status: 'completed',
      },
      auditTrail: {
        timestamp: new Date().toISOString(),
        userId: body.context.userId,
        operation: body.operation.type,
        correlationId: body.context.correlationId || 'corr-123',
      },
      meta: {
        requestId: 'req-789',
        timestamp: new Date().toISOString(),
        performance: {
          executionTime: 150,
        },
      },
    });
  }),

  // Financial Dashboard API
  http.get('/api/financial/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const includeProjections = url.searchParams.get('includeProjections') === 'true';

    // Handle authentication errors - no authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Handle invalid token
    if (authHeader === 'Bearer invalid-token') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      }, { status: 401 });
    }

    // Handle server errors
    if (request.url.includes('/dashboard/invalid')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        },
      }, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: {
            amount: 125000,
            currency: 'BRL',
            formatted: 'R$ 125.000,00',
          },
          totalExpenses: 85000,
          netProfit: 40000,
          profitMargin: 32,
          revenueGrowth: 12.5,
          expenseGrowth: 8.2,
        },
        metrics: {
          id: 'dashboard-metrics-001',
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: timeframe,
          },
          mrr: {
            amount: 42000,
            currency: 'BRL',
            formatted: 'R$ 42.000,00',
          },
          arr: {
            amount: 504000,
            currency: 'BRL',
            formatted: 'R$ 504.000,00',
          },
          averageTicket: {
            amount: 850,
            currency: 'BRL',
            formatted: 'R$ 850,00',
          },
          customerCount: 235,
          churnRate: 2.8,
          monthlyRecurringRevenue: 42000,
          averageOrderValue: 350,
          customerLifetimeValue: 2800,
          costPerAcquisition: 120,
          retentionRate: 96.8,
        },
        trends: {
          revenue: [
            { month: 'Jan', value: 38000 },
            { month: 'Feb', value: 41000 },
            { month: 'Mar', value: 39500 },
            { month: 'Apr', value: 44000 },
            { month: 'May', value: 42000 },
            { month: 'Jun', value: 45000 },
          ],
          expenses: [
            { month: 'Jan', value: 28000 },
            { month: 'Feb', value: 29500 },
            { month: 'Mar', value: 27800 },
            { month: 'Apr', value: 31000 },
            { month: 'May', value: 30200 },
            { month: 'Jun', value: 32000 },
          ],
        },
        projections: includeProjections
          ? {
            nextMonth: {
              revenue: 47000,
              expenses: 33000,
              profit: 14000,
            },
            nextQuarter: {
              revenue: 142000,
              expenses: 98000,
              profit: 44000,
            },
          }
          : null,
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        timeframe,
        currency: 'BRL',
        lgpdCompliant: true,
        dataAnonymized: true,
        consentStatus: 'granted',
        retentionPeriod: '7-years',
      },
    });
  }),

  // Financial Metrics API
  http.get('/api/financial/metrics', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const period = url.searchParams.get('period') || 'month';

    return HttpResponse.json({
      success: true,
      data: {
        metrics: {
          revenue: {
            total: 125000,
            growth: 12.5,
            monthlyRecurring: 42000,
            oneTime: 83000,
          },
          expenses: {
            total: 85000,
            growth: 8.2,
            operational: 55000,
            marketing: 18000,
          },
          mrr: 42000,
          churnRate: 3.2,
          growth: {
            revenueGrowth: 12.5,
            expenseGrowth: 8.2,
            profitGrowth: 14.3,
          },
        },
        period: {
          type: period,
          quarter: period === 'quarter' ? 1 : undefined,
          year: 2024,
          label: period === 'year' ? '2024' : undefined,
          start: '2024-01-01',
          end: '2024-01-31',
        },
      },
      meta: {
        timeframe,
        lastUpdated: new Date().toISOString(),
        currency: 'BRL',
      },
    });
  }),

  // Financial Trends API
  http.get('/api/financial/trends', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'revenue';
    const period = url.searchParams.get('period') || 'monthly';

    // Handle invalid metric
    if (metric === 'invalid-metric') {
      return HttpResponse.json({
        error: 'Invalid metric',
        message: 'Metric not supported',
      }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        trend: {
          metric,
          period: metric === 'mrr' ? '12_months' : period,
          forecast: metric === 'arr'
            ? {
              enabled: true,
              period: 'quarterly',
              confidence: 0.85,
              nextQuarter: 150000,
              nextYear: 600000,
            }
            : undefined,
          analysis: metric === 'churn'
            ? {
              type: 'detailed',
              trend: 'improving',
              rate: 2.8,
              patterns: ['seasonal', 'monthly'],
              seasonality: 'quarterly',
            }
            : undefined,
          dataPoints: [
            { period: '2024-01', value: 35000, change: 5.2 },
            { period: '2024-02', value: 37000, change: 5.7 },
            { period: '2024-03', value: 39000, change: 5.4 },
          ],
        },
        chartData: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [
            {
              label: metric,
              data: [35000, 37000, 39000],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
          ],
        },
        comparison: {
          metrics: ['revenue', 'expenses', 'profit'],
          data: [
            { name: 'revenue', trend: 'up', changePercent: 12.5 },
            { name: 'expenses', trend: 'up', changePercent: 8.2 },
            { name: 'profit', trend: 'up', changePercent: 14.3 },
          ],
        },
        anomalies: {
          detected: false,
          points: [],
        },
        seasonality: {
          detected: true,
          pattern: 'quarterly',
          confidence: 0.85,
          patterns: ['Q1-growth', 'Q2-stable', 'Q3-peak', 'Q4-decline'],
        },
        calculation: {
          method: 'linear_regression',
          confidence: 0.92,
          dataQuality: 'high',
          rSquared: 0.88,
        },
        metadata: {
          dataQuality: 'high',
          lastCalculated: new Date().toISOString(),
        },
      },
      meta: {
        metric,
        period,
        lastUpdated: new Date().toISOString(),
        dataPoints: 100,
      },
    });
  }),

  // Financial Metrics Calculate API
  http.post('http://localhost:3000/api/financial/metrics/calculate', async ({ request }) => {
    const body = await request.json() as any;

    // Handle authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Check for bulk calculation first
    const isBulkCalculation = body.calculations && Array.isArray(body.calculations);
    const isRealTime = body.realTime === true;

    if (isBulkCalculation) {
      // Return bulk calculation response
      return HttpResponse.json({
        success: true,
        data: {
          calculations: body.calculations.map((calc: any, index: number) => ({
            period: calc.period,
            metrics: {
              mrr: { amount: 40000 + (index * 1000), currency: 'BRL' },
              churn: { amount: 2.5 - (index * 0.1), unit: 'percent' },
            },
          })),
          comparison: {
            trends: {
              mrr: 'increasing',
              churn: 'decreasing',
            },
          },
        },
        meta: {
          calculatedAt: new Date().toISOString(),
          metrics: body.calculations.map((c: any) => c.metrics).flat(),
          bulkCalculation: true,
        },
      });
    }

    // Handle validation errors for single calculation requests
    if (!body.period) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['period'],
          },
        },
      }, { status: 400 });
    }

    if (!body.metrics || !Array.isArray(body.metrics)) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['metrics'],
          },
        },
      }, { status: 400 });
    }

    // Handle invalid date format
    if (body.period && body.period.start === 'invalid-date') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format',
          details: {
            field: 'period.start',
            value: body.period.start,
            expected: 'YYYY-MM-DD format',
          },
        },
      }, { status: 400 });
    }

    // Handle timeout scenarios
    if (body.timeout && body.timeout <= 5000) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'CALCULATION_TIMEOUT',
          message: 'Request exceeded maximum processing timeout',
          timeout: body.timeout,
        },
      }, { status: 408 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        calculation: {
          period: body.period || { start: '2024-01-01', end: '2024-01-31', type: 'month' },
          metrics: {
            mrr: {
              amount: 10000.0,
              currency: 'BRL',
            },
            arr: {
              amount: 120000.0,
              currency: 'BRL',
            },
            churn: {
              amount: 2.5,
              unit: 'percent',
            },
            growth: {
              amount: 12.5,
              unit: 'percent',
            },
          },
          realTime: isRealTime,
          precision: body.precision || 'standard',
          calculatedAt: new Date().toISOString(),
          executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156,
        },
        performance: body.includePerformance
          ? {
            executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156,
            memoryUsage: 42.8,
            cacheHit: true,
          }
          : undefined,
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        metrics: body.metrics,
        realTime: isRealTime,
      },
    });
  }),

  // Financial Trends API
  http.get('http://localhost:3000/api/financial/trends', ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric');
    const period = url.searchParams.get('period');
    const includeeForecast = url.searchParams.get('include_forecast') === 'true';
    const analysis = url.searchParams.get('analysis');
    const format = url.searchParams.get('format');
    const metrics = url.searchParams.get('metrics');
    const compare = url.searchParams.get('compare') === 'true';
    const detectAnomalies = url.searchParams.get('detect_anomalies') === 'true';
    const analyzeSeasonality = url.searchParams.get('analyze_seasonality') === 'true';
    const method = url.searchParams.get('method');
    const minDataPoints = url.searchParams.get('min_data_points');

    // Handle authentication errors
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Handle invalid metrics
    if (metric === 'invalid_metric') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INVALID_METRIC',
          message: 'Invalid metric specified',
          validMetrics: ['mrr', 'arr', 'churn', 'revenue', 'growth'],
        },
      }, { status: 400 });
    }

    // Handle insufficient data scenarios
    if (minDataPoints && parseInt(minDataPoints) > 24) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_DATA',
          message: 'Insufficient data points for requested analysis',
          details: {
            requested: parseInt(minDataPoints),
            available: 24,
          },
        },
      }, { status: 400 });
    }

    // Generate mock trend data
    const dataPoints = Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${String(i + 1).padStart(2, '0')}-01`,
      value: 10000 + (i * 1000) + Math.random() * 500,
      growth: (Math.random() - 0.5) * 20,
      formattedValue: `R$ ${
        (10000 + (i * 1000) + Math.random() * 500).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
        })
      }`,
      ...(detectAnomalies && i === 8 && { anomaly: true, anomalyScore: 0.95 }),
    }));

    return HttpResponse.json({
      success: true,
      data: {
        trend: {
          metric: metric || 'mrr',
          period: period || '12_months',
          dataPoints,
          summary: {
            totalGrowth: 24.5,
            averageGrowth: 2.04,
            maxValue: Math.max(...dataPoints.map(p => p.value)),
            minValue: Math.min(...dataPoints.map(p => p.value)),
            volatility: 12.8,
          },
          ...(format === 'chart_data' && {
            chartData: {
              type: 'line',
              xAxis: 'date',
              yAxis: 'value',
              color: '#10b981',
              datasets: [{
                label: metric || 'Revenue',
                data: dataPoints.map(p => ({ x: p.date, y: p.value })),
              }],
            },
          }),
          ...(compare && metrics && {
            comparison: {
              metrics: metrics.split(',').map(m => ({
                metric: m,
                correlation: Math.random() * 0.8 + 0.2,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
              })),
            },
          }),
          ...(includeeForecast && {
            forecast: {
              enabled: true,
              period: period + '_forecast',
              confidence: 0.85,
              dataPoints: Array.from({ length: 6 }, (_, i) => ({
                date: `2024-${String(i + 13).padStart(2, '0')}-01`,
                value: 22000 + (i * 1200),
                confidence: 0.85 - (i * 0.05),
              })),
              predictions: Array.from({ length: 6 }, (_, i) => ({
                date: `2024-${String(i + 13).padStart(2, '0')}-01`,
                value: 22000 + (i * 1200),
                confidence: 0.85 - (i * 0.05),
              })),
              accuracy: 0.85,
              model: 'linear_regression',
            },
          }),
          ...(analysis === 'detailed' && {
            analysis: {
              type: 'detailed',
              patterns: ['seasonal', 'growth'],
              seasonality: 'moderate',
              averageChurn: 2.5,
              trendDirection: 'increasing',
              acceleration: 'stable',
              correlation: 0.92,
            },
          }),
          ...(format === 'chart_data' && {
            chartData: {
              type: 'line',
              xAxis: 'date',
              yAxis: 'value',
              color: '#10b981',
              datasets: [{
                label: metric || 'Revenue',
                data: dataPoints.map(p => ({ x: p.date, y: p.value })),
              }],
            },
          }),
          ...(compare && metrics && {
            comparison: {
              metrics: metrics.split(',').map(m => ({
                metric: m,
                correlation: Math.random() * 0.8 + 0.2,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
              })),
            },
          }),
          ...(method && {
            calculationMethod: {
              method: method,
              confidence: 0.91,
              rSquared: 0.88,
            },
          }),
        },
        ...(detectAnomalies && {
          anomalies: {
            detected: true,
            count: dataPoints.filter(p => p.anomaly).length,
            points: dataPoints.filter(p => p.anomaly).map(p => ({
              date: p.date,
              value: p.value,
              expectedValue: p.value * 0.9,
              deviationPercent: 15.2,
              severity: 'medium',
              score: p.anomalyScore,
              type: 'outlier',
            })),
            items: dataPoints.filter(p => p.anomaly).map(p => ({
              date: p.date,
              value: p.value,
              score: p.anomalyScore,
              type: 'outlier',
            })),
          },
        }),
        ...(analyzeSeasonality && {
          seasonality: {
            detected: true,
            patterns: ['quarterly', 'yearly'],
            pattern: 'quarterly',
            strength: 0.73,
            peaks: ['Q1', 'Q4'],
            troughs: ['Q2', 'Q3'],
            cycle: 'quarterly',
            peakMonths: ['January', 'October'],
            troughMonths: ['April', 'July'],
          },
        }),
        ...(method && {
          calculation: {
            method: method,
            confidence: 0.91,
            rSquared: 0.88,
            slope: 1250.5,
            intercept: 8500.0,
            standardError: 125.8,
            accuracy: 'high',
          },
        }),
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        dataSource: 'financial_metrics_v2',
        cacheStatus: 'miss',
      },
    });
  }),

  // Handle error endpoints for testing
  http.get('/api/financial/dashboard/invalid', () => {
    return HttpResponse.json({
      error: 'Server error',
      message: 'Internal server error',
    }, { status: 500 });
  }),
];

// Setup server
export const server = setupServer(...handlers);

// Configure server for testing environment
if (typeof global !== 'undefined') {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
