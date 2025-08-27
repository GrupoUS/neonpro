// Monitoring metrics API endpoint
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      id: `metric-${Date.now()}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 },
    );
  }
}
