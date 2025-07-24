/**
 * Trial Campaigns API Route
 * GET /api/trial-management/campaigns - List campaigns
 * POST /api/trial-management/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import TrialManager from '@/lib/trial-management';
import { z } from 'zod';

// Validation schema for campaign creation
const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['conversion', 'retention', 'engagement', 'custom']),
  targetAudience: z.object({
    userRole: z.array(z.string()).optional(),
    demographics: z.record(z.any()).optional(),
    behaviorCriteria: z.record(z.any()).optional(),
  }),
  configuration: z.object({
    variants: z.array(z.object({
      name: z.string(),
      weight: z.number().min(0).max(1),
      config: z.record(z.any()),
    })).min(2),
    duration: z.number().min(1), // days
    conversionGoal: z.string().optional(),
    metrics: z.array(z.string()).optional(),
  }),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
});

/**
 * Get trial campaigns
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
    const type = searchParams.get('type');
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
    
    // Get campaigns
    const result = await TrialManager.campaigns.getCampaigns({
      status,
      type,
      clinicId: clinicId || undefined,
      limit: Math.min(limit, 100),
      offset,
    });
    
    return NextResponse.json({
      success: true,
      data: result.campaigns,
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
    console.error('Campaign retrieval error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve campaigns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create new trial campaign
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
    const validation = CreateCampaignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const campaignData = validation.data;
    
    // Validate variant weights sum to 1
    const totalWeight = campaignData.configuration.variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );
    
    if (Math.abs(totalWeight - 1) > 0.001) {
      return NextResponse.json(
        { error: 'Variant weights must sum to 1.0' },
        { status: 400 }
      );
    }
    
    // Create campaign
    const campaign = await TrialManager.campaigns.createCampaign({
      ...campaignData,
      clinicId: user.clinicId || undefined,
      createdBy: user.id,
    });
    
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Campaign creation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}