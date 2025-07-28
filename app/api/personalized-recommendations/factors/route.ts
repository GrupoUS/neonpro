// Story 9.2: Personalized Treatment Recommendations - API Factors Route
// Personalization factors API endpoint

import { personalizedRecommendationsService } from '@/app/lib/services/personalized-recommendations';
import { createPersonalizationFactorSchema } from '@/app/lib/validations/personalized-recommendations';
import { CreatePersonalizationFactorRequest } from '@/app/types/personalized-recommendations';
import { NextRequest, NextResponse } from 'next/server';

// Get personalization factors
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

    const factors = await personalizedRecommendationsService.getPersonalizationFactors(patientId);
    
    return NextResponse.json({
      factors,
      success: true
    });
  } catch (error) {
    console.error('Error fetching personalization factors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalization factors', success: false },
      { status: 500 }
    );
  }
}

// Create personalization factor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createPersonalizationFactorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid personalization factor data', 
          details: validationResult.error.issues,
          success: false 
        },
        { status: 400 }
      );
    }

    const factorData: CreatePersonalizationFactorRequest = validationResult.data;
    const factor = await personalizedRecommendationsService.createPersonalizationFactor(factorData);
    
    return NextResponse.json({
      factor,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating personalization factor:', error);
    return NextResponse.json(
      { error: 'Failed to create personalization factor', success: false },
      { status: 500 }
    );
  }
}
