/**
 * Health Check API Endpoint
 * Monitor system status and dependencies
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const supabase = createClient();
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);

    const dbStatus = !error ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;

    // Health check response
    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          response_time_ms: responseTime,
        },
        api: {
          status: 'healthy',
          response_time_ms: responseTime,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
        response_time_ms: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}