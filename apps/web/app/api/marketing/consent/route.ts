// Marketing Consent Management API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization (LGPD Compliance)
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { MarketingCampaignService } from '@/app/lib/services/marketing-campaign-service';
import { MarketingConsentSchema } from '@/app/lib/validations/campaigns';
import { createClient } from '@/app/utils/supabase/server';

const campaignService = new MarketingCampaignService();

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const consentType = searchParams.get('consent_type') || undefined;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 },
      );
    }

    const result = await campaignService.getPatientConsent(
      patientId,
      consentType,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      consent: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = MarketingConsentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const result = await campaignService.updateConsent(validationResult.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Consent updated successfully',
      consent: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const consentType = searchParams.get('consent_type');
    const reason = searchParams.get('reason') || undefined;

    if (!(patientId && consentType)) {
      return NextResponse.json(
        {
          error: 'Patient ID and consent type are required',
        },
        { status: 400 },
      );
    }

    const result = await campaignService.withdrawConsent(
      patientId,
      consentType,
      reason,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Consent withdrawn successfully',
      consent: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
