// Campaign Execution API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { MarketingCampaignService } from '@/app/lib/services/marketing-campaign-service';
import { CampaignExecutionSchema } from '@/app/lib/validations/campaigns';
import { createClient } from '@/app/utils/supabase/server';

const campaignService = new MarketingCampaignService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CampaignExecutionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { execution_type } = validationResult.data;

    const result = await campaignService.executeCampaign(
      params.id,
      execution_type
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Campaign execution started successfully',
      executions: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in campaign execution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
