// Marketing Campaigns API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import type { NextRequest } from "next/server";

const campaignService = new MarketingCampaignService();

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ? searchParams.get("status")?.split(",") : undefined,
      campaign_type: searchParams.get("campaign_type")
        ? searchParams.get("campaign_type")?.split(",")
        : undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sort: searchParams.get("sort") || "created_at",
      order: searchParams.get("order") || "desc",
      automation_level: searchParams.get("automation_min")
        ? {
            min: parseFloat(searchParams.get("automation_min") || "0"),
            max: parseFloat(searchParams.get("automation_max") || "1"),
          }
        : undefined,
      date_range:
        searchParams.get("start_date") && searchParams.get("end_date")
          ? {
              start: searchParams.get("start_date"),
              end: searchParams.get("end_date"),
            }
          : undefined,
    };

    const result = await campaignService.getCampaigns(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      campaigns: result.data,
      pagination: result.pagination,
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in campaigns GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = CreateCampaignSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const campaignData = {
      ...validationResult.data,
      created_by: session.user.id,
      clinic_id: session.user.user_metadata?.clinic_id || "default",
    };

    // Ensure automation level is ≥80% as per Epic 7.2 requirements
    if (campaignData.automation_level < 0.8) {
      campaignData.automation_level = 0.8;
    }

    const result = await campaignService.createCampaign(campaignData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Campaign created successfully",
        campaign: result.data,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in campaigns POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
