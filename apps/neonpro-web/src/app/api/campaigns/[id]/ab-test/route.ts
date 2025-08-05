// Campaign A/B Testing API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from "next/server";
import { MarketingCampaignService } from "@/app/lib/services/marketing-campaign-service";
import { ABTestCreateSchema } from "@/app/lib/validations/campaigns";
import { createClient } from "@/app/utils/supabase/server";

const campaignService = new MarketingCampaignService();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ABTestCreateSchema.safeParse({
      ...body,
      campaign_id: params.id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const result = await campaignService.createABTest(validationResult.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "A/B test created successfully",
        ab_test: result.data,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in A/B test creation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
