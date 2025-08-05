/**
 * Analytics Dashboard API Route
 * GET /api/analytics/dashboard - Retrieve dashboard analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { analyticsService } from '@/lib/analytics';

/**
 * Get dashboard analytics data
 */
export async function GET(request: NextRequest) {
  // Authenticate request
  const authResult = await requireAuth(['admin', 'clinic_owner', 'manager'])(request);
  
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  const user = authResult.user!;
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const clinicId = searchParams.get('clinicId') || user.clinicId;
    
    // Validate clinic access
    if (clinicId && user.role !== 'admin' && user.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Access denied to clinic data' },
        { status: 403 }
      );
    }
    
    // Get dashboard data
    const dashboardData = await analyticsService.getDashboardOverview({
      period,
      clinicId: clinicId || undefined,
      userId: user.id,
    });
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        period,
        clinicId,
        generatedAt: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
