// =====================================================================================
// MARKETING CAMPAIGNS API - CAMPAIGN EXECUTION ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/marketing/campaigns/[id]/execute - Execute campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists and is executable
    const campaign = await marketingCampaignsService.getCampaignById(id);
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Validate campaign status
    if (!['scheduled', 'active', 'draft'].includes(campaign.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot execute campaign with status: ${campaign.status}` 
        },
        { status: 400 }
      );
    }

    // Execute campaign
    const execution = await marketingCampaignsService.executeCampaign(id, {
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      testMode: body.testMode || false,
      testRecipients: body.testRecipients || [],
      executedBy: body.executedBy
    });

    return NextResponse.json({
      success: true,
      data: execution,
      message: 'Campaign execution started successfully'
    }, { status: 201 });

  } catch (error) {
    console.error(`POST /api/marketing/campaigns/${params.id}/execute error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
