// =====================================================================================
// MARKETING CAMPAIGNS API - CAMPAIGN ANALYTICS ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';

// GET /api/marketing/campaigns/[id]/analytics - Get campaign analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const campaign = await marketingCampaignsService.getCampaignById(id);
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get analytics with optional date range
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const includeSegments = searchParams.get('include_segments') === 'true';
    const includeDevices = searchParams.get('include_devices') === 'true';

    const analytics = await marketingCampaignsService.getCampaignAnalytics(id);

    // Add additional filtering or processing based on query params
    if (startDate || endDate) {
      // Filter timeline data if date range provided - using any casting for flexibility
      const analyticsData = analytics as any;
      if (analyticsData.timeline) {
        analyticsData.timeline = analyticsData.timeline.filter((point: any) => {
          const pointDate = new Date(point.date);
          if (startDate && pointDate < new Date(startDate)) {
            return false;
          }
          if (endDate && pointDate > new Date(endDate)) {
            return false;
          }
          return true;
        });
      }
    }

    // Remove optional data if not requested
    const analyticsData = analytics as any;
    if (!includeSegments && analyticsData.segmentPerformance) {
      analyticsData.segmentPerformance = undefined;
    }
    if (!includeDevices && analyticsData.deviceBreakdown) {
      analyticsData.deviceBreakdown = undefined;
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        campaign_id: id,
        campaign_name: campaign.name,
        campaign_status: campaign.status,
        generated_at: new Date().toISOString(),
        filters: {
          start_date: startDate,
          end_date: endDate,
          include_segments: includeSegments,
          include_devices: includeDevices,
        },
      },
    });
  } catch (error) {
    console.error(
      `GET /api/marketing/campaigns/${params.id}/analytics error:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaign analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
