export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const includeProjections = url.searchParams.get('includeProjections') === 'true';

    // Mock financial dashboard data
    const dashboardData = {
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
      } : null,
      lastUpdated: new Date().toISOString(),
      timeframe,
      currency: 'BRL'
    };

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Financial dashboard API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch financial dashboard data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}