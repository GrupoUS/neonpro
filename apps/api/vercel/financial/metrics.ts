export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'
    const timeframe = url.searchParams.get('timeframe') || '30d'
    const category = url.searchParams.get('category')

    // Mock financial metrics data
    const allMetrics = {
      revenue: {
        total: 125000,
        growth: 12.5,
        monthlyRecurring: 42000,
        oneTime: 83000,
        breakdown: {
          subscriptions: 42000,
          consultations: 35000,
          products: 28000,
          services: 20000,
        },
      },
      expenses: {
        total: 85000,
        growth: 8.2,
        operational: 55000,
        marketing: 18000,
        technology: 12000,
        breakdown: {
          salaries: 35000,
          infrastructure: 12000,
          marketing: 18000,
          office: 8000,
          legal: 5000,
          other: 7000,
        },
      },
      profitability: {
        grossProfit: 40000,
        grossMargin: 32,
        netProfit: 35000,
        netMargin: 28,
        ebitda: 38000,
        ebitdaMargin: 30.4,
      },
      cashFlow: {
        operating: 42000,
        investing: -8000,
        financing: 5000,
        net: 39000,
        burnRate: 12000,
      },
      performance: {
        customerAcquisitionCost: 120,
        customerLifetimeValue: 2800,
        returnOnInvestment: 18.5,
        returnOnAssets: 15.2,
        returnOnEquity: 22.1,
      },
    }

    let responseData

    switch (type) {
      case 'revenue':
        responseData = { revenue: allMetrics.revenue }
        break
      case 'expenses':
        responseData = { expenses: allMetrics.expenses }
        break
      case 'profitability':
        responseData = { profitability: allMetrics.profitability }
        break
      case 'cashflow':
        responseData = { cashFlow: allMetrics.cashFlow }
        break
      case 'performance':
        responseData = { performance: allMetrics.performance }
        break
      default:
        responseData = allMetrics
    }

    // Add metadata
    const finalData = {
      ...responseData,
      metadata: {
        timeframe,
        category,
        lastUpdated: new Date().toISOString(),
        currency: 'BRL',
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      },
    }

    return new Response(JSON.stringify(finalData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=180',
      },
    })
  } catch (error) {
    console.error('Financial metrics API error:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to fetch financial metrics data',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
