import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

const ConsentSchema = z.object({
  dataProcessingConsent: z.boolean(),
  sensitiveDataConsent: z.boolean(),
  marketingConsent: z.boolean(),
  dataRetentionAcknowledgment: z.boolean(),
  consentVersion: z.string().default('1.0'),
});

// POST - Record new LGPD consent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedConsent = ConsentSchema.parse(body);

    // Record consent in database
    const { data: consent, error } = await supabase
      .from('lgpd_consents')
      .insert({
        patient_id: id,
        data_processing_consent: validatedConsent.dataProcessingConsent,
        sensitive_data_consent: validatedConsent.sensitiveDataConsent,
        marketing_consent: validatedConsent.marketingConsent,
        data_retention_acknowledgment:
          validatedConsent.dataRetentionAcknowledgment,
        consent_version: validatedConsent.consentVersion,
        consent_date: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Consent recording error:', error);
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      );
    } // Log consent for audit trail
    await supabase.from('lgpd_audit_log').insert({
      patient_id: id,
      action: 'consent_given',
      data_fields: Object.keys(validatedConsent),
      legal_basis: 'Consentimento do titular (Art. 7°, I, LGPD)',
      user_agent: request.headers.get('user-agent'),
      ip_address: request.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Consent recorded successfully',
      consent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Consent POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing consent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Update consent record
    const { data: consent, error } = await supabase
      .from('lgpd_consents')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('patient_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Consent updated successfully',
      consent,
    });
  } catch (error) {
    console.error('Consent PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
