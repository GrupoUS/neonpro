// Story 9.2: Personalized Treatment Recommendations - API Protocol Route
// Protocol customizations API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { personalizedRecommendationsService } from '../../../lib/services/personalized-recommendations';
import { createProtocolCustomizationRequestSchema } from '../../../lib/validations/personalized-recommendations';
import { CreateProtocolCustomizationRequest } from '../../../types/personalized-recommendations';

// Get protocol customizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required', success: false },
        { status: 400 }
      );
    }

    const customizations = await personalizedRecommendationsService.getProtocolCustomizations(patientId);
    
    return NextResponse.json({
      customizations,
      success: true
    });
  } catch (error) {
    console.error('Error fetching protocol customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol customizations', success: false },
      { status: 500 }
    );
  }
}

// Create protocol customization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createProtocolCustomizationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid protocol customization data', 
          details: validationResult.error.issues,
          success: false 
        },
        { status: 400 }
      );
    }

    const customizationData: CreateProtocolCustomizationRequest = validationResult.data;
    const customization = await personalizedRecommendationsService.createProtocolCustomization(customizationData);
    
    return NextResponse.json({
      customization,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating protocol customization:', error);
    return NextResponse.json(
      { error: 'Failed to create protocol customization', success: false },
      { status: 500 }
    );
  }
}
