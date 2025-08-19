// Monitoring alerts API endpoint
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Mock alerts data for testing
    const alerts = [
      {
        id: 'alert-1',
        type: 'performance',
        severity: 'warning',
        message: 'Response time elevated',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'alert-2',
        type: 'security',
        severity: 'info',
        message: 'Unusual login pattern detected',
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ alerts });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const alert = await request.json();

    return NextResponse.json({
      success: true,
      id: `alert-${Date.now()}`,
      alert,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
