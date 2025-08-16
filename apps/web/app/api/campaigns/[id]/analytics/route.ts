// Campaign Analytics API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { MarketingCampaignService } from '@/app/lib/services/marketing-campaign-service';
import { createClient } from '@/app/utils/supabase/server';

const campaignService = new MarketingCampaignService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await campaignService.getCampaignAnalytics(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      analytics: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
