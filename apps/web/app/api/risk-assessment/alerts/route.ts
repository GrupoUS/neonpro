/**
 * Risk Alerts API Routes
 * Story 9.4: Real-time alert management for risk assessments
 *
 * Provides endpoints for:
 * - Creating and managing risk alerts
 * - Real-time alert notifications
 * - Alert acknowledgment and resolution
 * - Emergency protocol activation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { RiskAssessmentService } from '@/app/lib/services/risk-assessment-automation';
import { AlertSchema } from '@/app/lib/validations/risk-assessment-automation';
import type { CreateAlertRequest } from '@/app/types/risk-assessment-automation';

const riskAssessmentService = new RiskAssessmentService();

/**
 * GET /api/risk-assessment/alerts
 * Retrieve risk alerts with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const riskLevel = searchParams.get('riskLevel');
    const status = searchParams.get('status');
    const active = searchParams.get('active') === 'true';
    const limit = searchParams.get('limit')
      ? Number.parseInt(searchParams.get('limit')!, 10)
      : 50;
    const offset = searchParams.get('offset')
      ? Number.parseInt(searchParams.get('offset')!, 10)
      : 0;

    const filters: any = {};
    if (assessmentId) filters.assessment_id = assessmentId;
    if (riskLevel) filters.risk_level = riskLevel;
    if (status) filters.alert_status = status;
    if (active) filters.alert_status = 'active';

    const alerts = await riskAssessmentService.getAllAlerts(
      filters,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        limit,
        offset,
        total: alerts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/risk-assessment/alerts
 * Create new risk alert
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = AlertSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const requestData: CreateAlertRequest = validationResult.data;

    // Create alert
    const alert = await riskAssessmentService.createAlert(requestData);

    return NextResponse.json(
      {
        success: true,
        data: alert,
        message: 'Alert created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
