/**
 * A/B Testing API Route
 * GET /api/trial-management/ab-tests - List A/B tests
 * POST /api/trial-management/ab-tests - Create A/B test
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import TrialManager from '@/lib/trial-management';
import { z } from 'zod';

// Validation schema for A/B test creation
const CreateABTestSchema = z.object({
  name: z.string().min(1).max(100),
  hypothesis: z.string().min(1),
  testType: z.enum(['feature_toggle', 'ui_variant', 'pricing', 'content', 'workflow']),
  variants: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    allocation: z.number().min(0).max(1),
    configuration: z.record(z.any()),
  })).min(2),
  targetCriteria: z.object({
    userSegments: z.array(z.string()).optional(),
    inclusionRules: z.record(z.any()).optional(),
    exclusionRules: z.record(z.any()).optional(),
  }),
  metrics: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional(),
    customEvents: z.array(z.string()).optional(),
  }),
  settings: z.object({
    duration: z.number().min(1), // days
    minSampleSize: z.number().min(1).optional(),
    confidenceLevel: z.number().min(0.8).max(0.99).optional(),
    trafficAllocation: z.number().min(0.1).max(1).optional(),
  }),
});

/**
 * Get A/B tests
 */
export async function GET(request: NextRequest) {
  // Require admin or clinic owner permissions
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
    const status = searchParams.get('status');
    const testType = searchParams.get('testType');
    const clinicId = searchParams.get('clinicId') || user.clinicId;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Validate clinic access
    if (clinicId && user.role !== 'admin' && user.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Access denied to clinic data' },
        { status: 403 }
      );
    }
    
    // Get A/B tests
    const result = await TrialManager.campaigns.getABTests({
      status,
      testType,
      clinicId: clinicId || undefined,
      limit: Math.min(limit, 100),
      offset,
    });
    
    return NextResponse.json({
      success: true,
      data: result.tests,
      pagination: {
        limit,
        offset,
        total: result.total,
        hasMore: result.hasMore,
      },
      metadata: {
        clinicId,
        generatedAt: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('A/B test retrieval error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve A/B tests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create new A/B test
 */
export async function POST(request: NextRequest) {
  // Require admin or clinic owner permissions
  const authResult = await requireAuth(['admin', 'clinic_owner'])(request);
  
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  const user = authResult.user!;
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = CreateABTestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid A/B test data', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const testData = validation.data;
    
    // Validate variant allocations sum to 1
    const totalAllocation = testData.variants.reduce(
      (sum, variant) => sum + variant.allocation,
      0
    );
    
    if (Math.abs(totalAllocation - 1) > 0.001) {
      return NextResponse.json(
        { error: 'Variant allocations must sum to 1.0' },
        { status: 400 }
      );
    }
    
    // Create A/B test
    const abTest = await TrialManager.campaigns.createABTest({
      ...testData,
      clinicId: user.clinicId || undefined,
      createdBy: user.id,
      status: 'draft',
    });
    
    return NextResponse.json({
      success: true,
      data: abTest,
      message: 'A/B test created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('A/B test creation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create A/B test',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}