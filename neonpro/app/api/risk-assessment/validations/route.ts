/**
 * Risk Validations API Routes
 * Story 9.4: Medical validation for risk assessments
 * 
 * Provides endpoints for human-in-the-loop medical validation:
 * - Creating validations by medical professionals
 * - Updating validation status and feedback
 * - Retrieving validation history
 */

import { RiskAssessmentService } from '@/app/lib/services/risk-assessment-automation';
import { ValidationSchema } from '@/app/lib/validations/risk-assessment-automation';
import type { CreateValidationRequest } from '@/app/types/risk-assessment-automation';
import { NextRequest, NextResponse } from 'next/server';

const riskAssessmentService = new RiskAssessmentService();

/**
 * GET /api/risk-assessment/validations
 * Retrieve risk validations with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const validatorId = searchParams.get('validatorId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const filters: any = {};
    if (assessmentId) filters.assessment_id = assessmentId;
    if (validatorId) filters.validator_id = validatorId;
    if (status) filters.validation_status = status;

    const validations = await riskAssessmentService.getAllValidations(filters, limit, offset);

    return NextResponse.json({
      success: true,
      data: validations,
      pagination: {
        limit,
        offset,
        total: validations.length
      }
    });
  } catch (error) {
    console.error('Error fetching validations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch validations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/risk-assessment/validations
 * Create new validation by medical professional
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = ValidationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const requestData: CreateValidationRequest = validationResult.data;
    
    // Create validation
    const validation = await riskAssessmentService.createValidation(requestData);

    return NextResponse.json({
      success: true,
      data: validation,
      message: 'Validation created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating validation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create validation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
