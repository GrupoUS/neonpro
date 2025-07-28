// API endpoint for churn predictions
// Story 7.4: Advanced patient retention analytics with predictive modeling

import { RetentionService } from '../../../lib/services/retention';
import {
    ChurnPredictionQuerySchema,
    CreatePatientChurnPredictionSchema
} from '../../../lib/validations/retention';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = ChurnPredictionQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
      risk_level: searchParams.get('risk_level'),
      is_active: searchParams.get('is_active'),
      model_version: searchParams.get('model_version')
    });

    // Parse additional filters
    const patient_id = searchParams.get('patient_id');
    
    const filters: any = { ...queryParams };
    
    if (patient_id) {
      filters.patient_id = patient_id;
    }

    const result = await RetentionService.getChurnPredictions(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in churn predictions GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch churn predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = CreatePatientChurnPredictionSchema.parse(body);

    const churnPrediction = await RetentionService.createChurnPrediction(validatedData);

    return NextResponse.json({
      success: true,
      data: churnPrediction,
      message: 'Churn prediction created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in churn predictions POST:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create churn prediction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

