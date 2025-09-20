export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'revenue';
    const period = url.searchParams.get('period') || 'monthly';
    const limit = parseInt(url.searchParams.get('limit') || '12');

    // Mock trend data generation
    const generateTrendData = (baseValue: number, periods: number, volatility: number = 0.1) => {
      const data = [];
      let currentValue = baseValue;
      
      for (let i = 0; i < periods; i++) {
        const change = (Math.random() - 0.5) * 2 * volatility * currentValue;
        currentValue += change;
        
        const date = new Date();
        date.setMonth(date.getMonth() - (periods - i - 1));
        
        data.push({
          period: date.toISOString().slice(0, 7), // YYYY-MM format
          value: Math.round(currentValue),
          change: i > 0 ? Math.round(((currentValue - data[i-1]?.value || currentValue) / (data[i-1]?.value || currentValue)) * 100 * 100) / 100 : 0
        });
      }
      
      return data;
    };

    let trendData;
    let metadata;

    switch (metric) {
      case 'revenue':
        trendData = generateTrendData(35000, limit, 0.15);
        metadata = {
          title: 'Revenue Trends',
          unit: 'BRL',
          description: 'Monthly revenue progression'
        };
        break;
        
      case 'expenses':
        trendData = generateTrendData(25000, limit, 0.1);
        metadata = {
          title: 'Expense Trends',
          unit: 'BRL',
          description: 'Monthly expense progression'
        };
        break;
        
      case 'profit':
        trendData = generateTrendData(10000, limit, 0.2);
        metadata = {
          title: 'Profit Trends',
          unit: 'BRL',
          description: 'Monthly profit progression'
        };
        break;
        
      case 'customers':
        trendData = generateTrendData(250, limit, 0.08);
        metadata = {
          title: 'Customer Growth',
          unit: 'count',
          description: 'Customer base growth over time'
        };
        break;
        
      case 'aov':
        trendData = generateTrendData(350, limit, 0.05);
        metadata = {
          title: 'Average Order Value',
          unit: 'BRL',
          description: 'Average order value trends'
        };
        break;
        
      default:
        trendData = generateTrendData(35000, limit, 0.15);
        metadata = {
          title: 'General Trends',
          unit: 'BRL',
          description: 'General financial trends'
        };
    }

    // Calculate additional analytics
    const analytics = {
      total: trendData.reduce((sum, item) => sum + item.value, 0),
      average: Math.round(trendData.reduce((sum, item) => sum + item.value, 0) / trendData.length),
      growth: trendData.length > 1 ? 
        Math.round(((trendData[trendData.length - 1].value - trendData[0].value) / trendData[0].value) * 100 * 100) / 100 : 0,
      trend: trendData.length > 1 ? 
        (trendData[trendData.length - 1].value > trendData[0].value ? 'up' : 'down') : 'stable'
    };

    const responseData = {
      data: trendData,
      metadata: {
        ...metadata,
        metric,
        period,
        limit,
        lastUpdated: new Date().toISOString()
      },
      analytics
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Financial trends API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch financial trends data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}