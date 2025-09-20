import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock handlers for financial API endpoints
export const handlers = [
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
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Handle invalid token
    if (authHeader === 'Bearer invalid-token') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED', 
          message: 'Invalid token'
        }
      }, { status: 401 });
    }

    // Handle server errors
    if (request.url.includes('/dashboard/invalid')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9)
        }
      }, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: {
            amount: 125000,
            currency: 'BRL',
            formatted: 'R$ 125.000,00'
          },
          totalExpenses: 85000,
          netProfit: 40000,
          profitMargin: 32,
          revenueGrowth: 12.5,
          expenseGrowth: 8.2
        },
        metrics: {
          id: 'dashboard-metrics-001',
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: timeframe
          },
          mrr: {
            amount: 42000,
            currency: 'BRL',
            formatted: 'R$ 42.000,00'
          },
          arr: {
            amount: 504000,
            currency: 'BRL',
            formatted: 'R$ 504.000,00'
          },
          averageTicket: {
            amount: 850,
            currency: 'BRL',
            formatted: 'R$ 850,00'
          },
          customerCount: 235,
          churnRate: 2.8,
          monthlyRecurringRevenue: 42000,
          averageOrderValue: 350,
          customerLifetimeValue: 2800,
          costPerAcquisition: 120,
          retentionRate: 96.8
        },
        trends: {
          revenue: [
            { month: 'Jan', value: 38000 },
            { month: 'Feb', value: 41000 },
            { month: 'Mar', value: 39500 },
            { month: 'Apr', value: 44000 },
            { month: 'May', value: 42000 },
            { month: 'Jun', value: 45000 }
          ],
          expenses: [
            { month: 'Jan', value: 28000 },
            { month: 'Feb', value: 29500 },
            { month: 'Mar', value: 27800 },
            { month: 'Apr', value: 31000 },
            { month: 'May', value: 30200 },
            { month: 'Jun', value: 32000 }
          ]
        },
        projections: includeProjections ? {
          nextMonth: {
            revenue: 47000,
            expenses: 33000,
            profit: 14000
          },
          nextQuarter: {
            revenue: 142000,
            expenses: 98000,
            profit: 44000
          }
        } : null
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        timeframe,
        currency: 'BRL',
        lgpdCompliant: true,
        dataAnonymized: true,
        consentStatus: 'granted',
        retentionPeriod: '7-years'
      }
    });
  }),

  // Financial Metrics API
  http.get('/api/financial/metrics', ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d';
    const date = url.searchParams.get('date');
    const metrics = url.searchParams.get('metrics')?.split(',') || [];

    // Handle validation errors FIRST (before auth check)
    if (date === 'invalid-date') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: 'Data em formato de data inválido',
          field: 'date'
        }
      }, { status: 400 });
    }

    if (period === 'invalid') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid period parameter',
          details: 'Period must be one of: 7d, 30d, 90d, 1y',
          field: 'period',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9)
        }
      }, { status: 400 });
    }

    // Handle authentication errors AFTER validation - no authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Handle invalid token
    if (authHeader === 'Bearer invalid-token') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED', 
          message: 'Invalid token'
        }
      }, { status: 401 });
    }

    // Handle server errors
    if (request.url.includes('/invalid')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9)
        }
      }, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'metrics-001',
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          type: period
        },
        kpis: {
          revenue: {
            amount: 125000,
            currency: 'BRL',
            formatted: 'R$ 125.000,00',
            growth: 12.5,
            trend: 'up'
          },
          profit: {
            amount: 40000,
            currency: 'BRL',
            formatted: 'R$ 40.000,00',
            margin: 32,
            trend: 'up'
          },
          costs: {
            amount: 85000,
            currency: 'BRL',
            formatted: 'R$ 85.000,00',
            growth: 8.2,
            trend: 'up'
          },
          efficiency: {
            score: 85,
            percentile: 92,
            trend: 'stable'
          }
        },
        details: {
          totalRevenue: 125000,
          totalExpenses: 85000,
          netProfit: 40000,
          grossMargin: 68,
          netMargin: 32,
          operatingMargin: 35,
          ebitda: 48000,
          cashFlow: 35000,
          burnRate: 12000,
          runway: 24
        },
        breakdown: {
          revenueBySource: [
            { source: 'Consultas', amount: 75000, percentage: 60 },
            { source: 'Procedimentos', amount: 35000, percentage: 28 },
            { source: 'Exames', amount: 15000, percentage: 12 }
          ],
          expensesByCategory: [
            { category: 'Pessoal', amount: 45000, percentage: 53 },
            { category: 'Infraestrutura', amount: 25000, percentage: 29 },
            { category: 'Marketing', amount: 10000, percentage: 12 },
            { category: 'Outros', amount: 5000, percentage: 6 }
          ]
        }
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        period,
        currency: 'BRL',
        lgpdCompliant: true,
        dataAnonymized: true
      }
    }, {
      headers: {
        'Cache-Control': 'max-age=300'
      }
    });
  }),

  // Financial Trends API
  http.get('/api/financial/trends', ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '12m';
    const metric = url.searchParams.get('metric') || 'revenue';

    // Handle validation errors FIRST (before auth check)
    if (metric === 'invalid') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid metric parameter',
          details: 'Metric must be one of: revenue, expenses, profit, arr, mrr',
          field: 'metric',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9)
        }
      }, { status: 400 });
    }

    if (period === 'invalid') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid period parameter',
          details: 'Period must be one of: 7d, 30d, 90d, 12m',
          field: 'period',
          requestId: 'req-' + Math.random().toString(36).substr(2, 9)
        }
      }, { status: 400 });
    }

    // Handle authentication errors AFTER validation - no authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Handle invalid token
    if (authHeader === 'Bearer invalid-token') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED', 
          message: 'Invalid token'
        }
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'trends-001',
        period: {
          start: '2023-01-01',
          end: '2024-01-31',
          type: period
        },
        series: [
          {
            name: 'Revenue',
            data: [
              { period: '2023-01', value: 35000 },
              { period: '2023-02', value: 38000 },
              { period: '2023-03', value: 41000 },
              { period: '2023-04', value: 39500 },
              { period: '2023-05', value: 44000 },
              { period: '2023-06', value: 42000 },
              { period: '2023-07', value: 45000 },
              { period: '2023-08', value: 47000 },
              { period: '2023-09', value: 49000 },
              { period: '2023-10', value: 51000 },
              { period: '2023-11', value: 48000 },
              { period: '2023-12', value: 52000 }
            ]
          },
          {
            name: 'Expenses',
            data: [
              { period: '2023-01', value: 28000 },
              { period: '2023-02', value: 29500 },
              { period: '2023-03', value: 27800 },
              { period: '2023-04', value: 31000 },
              { period: '2023-05', value: 30200 },
              { period: '2023-06', value: 32000 },
              { period: '2023-07', value: 33500 },
              { period: '2023-08', value: 34000 },
              { period: '2023-09', value: 35200 },
              { period: '2023-10', value: 36000 },
              { period: '2023-11', value: 34800 },
              { period: '2023-12', value: 37000 }
            ]
          }
        ],
        insights: {
          growth: {
            revenue: 12.5,
            expenses: 8.2,
            profit: 18.7
          },
          volatility: {
            revenue: 0.15,
            expenses: 0.08
          },
          seasonality: {
            peak: 'December',
            low: 'March'
          }
        }
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        period,
        metric,
        currency: 'BRL'
      }
    });
  }),
  // Financial Dashboard API
  http.get('/api/financial/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const includeProjections = url.searchParams.get('includeProjections') === 'true';

    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: 125000,
          totalExpenses: 85000,
          netProfit: 40000,
          profitMargin: 32,
          revenueGrowth: 12.5,
          expenseGrowth: 8.2
        },
        metrics: {
          monthlyRecurringRevenue: 42000,
          averageOrderValue: 350,
          customerLifetimeValue: 2800,
          costPerAcquisition: 120,
          churnRate: 3.2,
          retentionRate: 96.8
        },
        trends: {
          revenue: [
            { month: 'Jan', value: 38000 },
            { month: 'Feb', value: 41000 },
            { month: 'Mar', value: 39500 },
            { month: 'Apr', value: 44000 },
            { month: 'May', value: 42000 },
            { month: 'Jun', value: 45000 }
          ],
          expenses: [
            { month: 'Jan', value: 28000 },
            { month: 'Feb', value: 29500 },
            { month: 'Mar', value: 27800 },
            { month: 'Apr', value: 31000 },
            { month: 'May', value: 30200 },
            { month: 'Jun', value: 32000 }
          ]
        },
        projections: includeProjections ? {
          nextMonth: {
            revenue: 47000,
            expenses: 33000,
            profit: 14000
          },
          nextQuarter: {
            revenue: 142000,
            expenses: 98000,
            profit: 44000
          }
        } : null
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        timeframe,
        currency: 'BRL',
        lgpdCompliant: true,
        dataAnonymized: false,
        consentStatus: 'granted'
      }
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
            oneTime: 83000
          },
          expenses: {
            total: 85000,
            growth: 8.2,
            operational: 55000,
            marketing: 18000
          },
          mrr: 42000,
          churnRate: 3.2,
          growth: {
            revenueGrowth: 12.5,
            expenseGrowth: 8.2,
            profitGrowth: 14.3
          }
        },
        period: {
          type: period,
          quarter: period === 'quarter' ? 1 : undefined,
          year: 2024,
          label: period === 'year' ? '2024' : undefined,
          start: '2024-01-01',
          end: '2024-01-31'
        }
      },
      meta: {
        timeframe,
        lastUpdated: new Date().toISOString(),
        currency: 'BRL'
      }
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
        message: 'Metric not supported'
      }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        trend: {
          metric,
          period: metric === 'mrr' ? '12_months' : period,
          forecast: metric === 'arr' ? {
            enabled: true,
            period: 'quarterly',
            confidence: 0.85,
            nextQuarter: 150000,
            nextYear: 600000
          } : undefined,
          analysis: metric === 'churn' ? {
            type: 'detailed',
            trend: 'improving',
            rate: 2.8,
            patterns: ['seasonal', 'monthly'],
            seasonality: 'quarterly'
          } : undefined,
          dataPoints: [
            { period: '2024-01', value: 35000, change: 5.2 },
            { period: '2024-02', value: 37000, change: 5.7 },
            { period: '2024-03', value: 39000, change: 5.4 }
          ]
        },
        chartData: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [
            {
              label: metric,
              data: [35000, 37000, 39000],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }
          ]
        },
        comparison: {
          metrics: ['revenue', 'expenses', 'profit'],
          data: [
            { name: 'revenue', trend: 'up', changePercent: 12.5 },
            { name: 'expenses', trend: 'up', changePercent: 8.2 },
            { name: 'profit', trend: 'up', changePercent: 14.3 }
          ]
        },
        anomalies: {
          detected: false,
          points: []
        },
        seasonality: {
          detected: true,
          pattern: 'quarterly',
          confidence: 0.85,
          patterns: ['Q1-growth', 'Q2-stable', 'Q3-peak', 'Q4-decline']
        },
        calculation: {
          method: 'linear_regression',
          confidence: 0.92,
          dataQuality: 'high',
          rSquared: 0.88
        },
        metadata: {
          dataQuality: 'high',
          lastCalculated: new Date().toISOString()
        }
      },
      meta: {
        metric,
        period,
        lastUpdated: new Date().toISOString(),
        dataPoints: 100
      }
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
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Handle validation errors
    if (!body.period) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['period']
          }
        }
      }, { status: 400 });
    }

    if (!body.metrics || !Array.isArray(body.metrics)) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields',
          details: {
            missingFields: ['metrics']
          }
        }
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
            expected: 'YYYY-MM-DD format'
          }
        }
      }, { status: 400 });
    }

    // Handle timeout scenarios
    if (body.timeout && body.timeout <= 5000) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'CALCULATION_TIMEOUT',
          message: 'Request exceeded maximum processing time',
          timeout: body.timeout
        }
      }, { status: 408 });
    }

    const isBulkCalculation = body.calculations && Array.isArray(body.calculations);
    const isRealTime = body.realTime === true;
    
    return HttpResponse.json({
      success: true,
      data: {
        calculation: {
          period: body.period || { start: '2024-01-01', end: '2024-01-31', type: 'month' },
          metrics: {
            mrr: {
              amount: 10000.0,
              currency: 'BRL'
            },
            arr: {
              amount: 120000.0,
              currency: 'BRL'
            },
            churn: {
              amount: 2.5,
              unit: 'percent'
            },
            growth: {
              amount: 12.5,
              unit: 'percent'
            }
          },
          realTime: isRealTime,
          precision: body.precision || 'standard',
          calculatedAt: new Date().toISOString(),
          executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156
        },
        calculations: isBulkCalculation ? body.calculations.map((calc: any, index: number) => ({
          period: calc.period,
          metrics: {
            mrr: { amount: 40000 + (index * 1000), currency: 'BRL' },
            churn: { amount: 2.5 - (index * 0.1), unit: 'percent' }
          }
        })) : undefined,
        comparison: isBulkCalculation ? {
          trends: {
            mrr: 'increasing',
            churn: 'decreasing'
          }
        } : undefined,
        performance: body.includePerformance ? {
          executionTime: body.timeout ? Math.min(body.timeout - 100, 4900) : 156,
          memoryUsage: 42.8,
          cacheHit: true
        } : undefined
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        metrics: body.metrics,
        realTime: isRealTime
      }
    });
  }),

  // Handle error endpoints for testing
  http.get('/api/financial/dashboard/invalid', () => {
    return HttpResponse.json({
      error: 'Server error',
      message: 'Internal server error'
    }, { status: 500 });
  }),
];

// Setup server
export const server = setupServer(...handlers);

// Configure server for testing environment
if (typeof global !== 'undefined') {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}