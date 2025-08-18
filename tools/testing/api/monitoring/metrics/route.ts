// Monitoring metrics API endpoint
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock metrics data for testing
    const metrics = {
      responseTime: Math.random() * 100 + 20,
      errorRate: Math.random() * 0.1,
      throughput: Math.random() * 1000 + 500,
      cpuUsage: Math.random() * 80 + 10,
      memoryUsage: Math.random() * 70 + 20,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock recording metric
    console.log('Metric recorded:', body);

    return NextResponse.json({
      success: true,
      id: `metric-${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}
