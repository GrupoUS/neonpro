// Campaign Analytics API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import { MarketingCampaignService } from "@/app/lib/services/marketing-campaign-service";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const campaignService = new MarketingCampaignService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await campaignService.getCampaignAnalytics(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      analytics: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in campaign analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
