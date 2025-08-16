/**
 * Marketing Campaigns API Routes
 * /api/marketing-roi/campaigns
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { marketingROIService } from '@/app/lib/services/marketing-roi-service';
import {
  CreateMarketingCampaignSchema,
  MarketingROIFiltersSchema,
} from '@/app/types/marketing-roi';
import { createClient } from '@/app/utils/supabase/server';

// Utility functions
async function validateUserAndClinic(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const clinicId = request.nextUrl.searchParams.get('clinic_id');
  if (!clinicId) {
    return {
      error: NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 },
      ),
    };
  }

  const { data: userClinic, error: clinicError } = await supabase
    .from('user_clinics')
    .select('role')
    .eq('user_id', user.id)
    .eq('clinic_id', clinicId)
    .single();

  if (clinicError || !userClinic) {
    return {
      error: NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 },
      ),
    };
  }

  return { user, clinicId, userRole: userClinic.role };
}

function getPaginationParams(request: NextRequest) {
  const page = Number.parseInt(
    request.nextUrl.searchParams.get('page') || '1',
    10,
  );
  const limit = Math.min(
    Number.parseInt(request.nextUrl.searchParams.get('limit') || '20', 10),
    100,
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function getDateRangeParams(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get('start_date');
  const endDate = request.nextUrl.searchParams.get('end_date');

  return {
    start_date: startDate ? new Date(startDate) : undefined,
    end_date: endDate ? new Date(endDate) : undefined,
  };
}

/**
 * GET /api/marketing-roi/campaigns
 * Get marketing campaigns with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) {
      return validation.error;
    }

    const { clinicId } = validation;
    const { limit, offset } = getPaginationParams(request);
    const { start_date, end_date } = getDateRangeParams(request);

    // Parse filters
    const filters = {
      channel: request.nextUrl.searchParams.get('channel'),
      campaign_type: request.nextUrl.searchParams.get('campaign_type'),
      status: request.nextUrl.searchParams.get('status'),
      min_roi: request.nextUrl.searchParams.get('min_roi')
        ? Number.parseFloat(request.nextUrl.searchParams.get('min_roi')!)
        : undefined,
      max_budget: request.nextUrl.searchParams.get('max_budget')
        ? Number.parseFloat(request.nextUrl.searchParams.get('max_budget')!)
        : undefined,
      date_range:
        start_date && end_date
          ? { start: start_date, end: end_date }
          : undefined,
    };

    // Validate filters
    const validatedFilters = MarketingROIFiltersSchema.parse(filters);

    const campaigns = await marketingROIService.getMarketingCampaigns(
      clinicId,
      validatedFilters,
      limit,
      offset,
    );

    return NextResponse.json(campaigns);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/marketing-roi/campaigns
 * Create a new marketing campaign
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateUserAndClinic(request);
    if (validation.error) {
      return validation.error;
    }

    const { clinicId, user } = validation;
    const body = await request.json();

    // Validate request body
    const validatedData = CreateMarketingCampaignSchema.parse(body);

    const campaign = await marketingROIService.createMarketingCampaign(
      clinicId,
      validatedData,
      user.id,
    );

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 },
    );
  }
}
