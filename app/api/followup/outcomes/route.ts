// Treatment Outcomes API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { createTreatmentOutcomeSchema } from '@/app/lib/validations/followup';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      patient_id: searchParams.get('patient_id') || undefined,
      treatment_id: searchParams.get('treatment_id') || undefined,
      followup_id: searchParams.get('followup_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    };

    const outcomes = await treatmentFollowupService.getTreatmentOutcomes(filters);

    return NextResponse.json({
      success: true,
      data: outcomes,
      total: outcomes.length
    });
  } catch (error) {
    console.error('Error fetching treatment outcomes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch treatment outcomes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = createTreatmentOutcomeSchema.parse(body);
    
    // Create outcome
    const outcome = await treatmentFollowupService.createTreatmentOutcome(validatedData);

    return NextResponse.json({
      success: true,
      data: outcome,
      message: 'Treatment outcome recorded successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }
    
    console.error('Error creating treatment outcome:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create treatment outcome',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
