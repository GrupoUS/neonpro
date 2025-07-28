// API endpoint for patient retention analytics
// Story 7.4: Advanced patient retention analytics with predictive modeling

import { NextRequest, NextResponse } from 'next/server';
import { RetentionService } from '../../../lib/services/retention';
import {
    CreatePatientRetentionAnalyticsSchema,
    RetentionAnalyticsQuerySchema
} from '../../../lib/validations/retention';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = RetentionAnalyticsQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
      risk_level: searchParams.get('risk_level'),
      segment: searchParams.get('segment'),
      search: searchParams.get('search')
    });

    // Parse additional filters
    const patient_id = searchParams.get('patient_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    
    const filters: any = { ...queryParams };
    
    if (patient_id) {
      filters.patient_id = patient_id;
    }
    
    if (start_date && end_date) {
      filters.date_range = { start_date, end_date };
    }

    const result = await RetentionService.getPatientRetentionAnalytics(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in retention analytics GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch retention analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = CreatePatientRetentionAnalyticsSchema.parse(body);

    const retentionAnalytics = await RetentionService.createPatientRetentionAnalytics(validatedData);

    return NextResponse.json({
      success: true,
      data: retentionAnalytics,
      message: 'Retention analytics created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in retention analytics POST:', error);
    
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
        error: 'Failed to create retention analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

