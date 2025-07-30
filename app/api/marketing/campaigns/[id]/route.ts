// =====================================================================================
// MARKETING CAMPAIGNS API - INDIVIDUAL CAMPAIGN ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/marketing/campaigns/[id] - Get campaign by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaign = await marketingCampaignsService.getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error(`GET /api/marketing/campaigns/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// PUT /api/marketing/campaigns/[id] - Update campaign
export async function PUT(
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

    // Check if campaign exists
    const existingCampaign = await marketingCampaignsService.getCampaignById(id);
    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    if (body.status && existingCampaign.status === 'completed' && body.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify completed campaigns' },
        { status: 400 }
      );
    }

    // Update campaign
    const updatedCampaign = await marketingCampaignsService.updateCampaign(id, body);

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error(`PUT /api/marketing/campaigns/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/marketing/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const existingCampaign = await marketingCampaignsService.getCampaignById(id);
    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Validate deletion (don't allow deletion of active or completed campaigns)
    if (['active', 'completed'].includes(existingCampaign.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete active or completed campaigns. Please cancel first.' 
        },
        { status: 400 }
      );
    }

    await marketingCampaignsService.deleteCampaign(id);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error(`DELETE /api/marketing/campaigns/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
