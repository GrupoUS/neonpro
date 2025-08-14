import { auditLog } from '@/lib/audit/communication-audit';
import { createClient } from '@/lib/supabase/server';
import { CommunicationConsent, CommunicationError } from '@/types/communication';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validation
const createConsentSchema = z.object({
  patient_id: z.string().uuid(),
  consent_type: z.enum(['marketing', 'appointment_reminders', 'treatment_followup', 'general_communication']),
  channel: z.enum(['email', 'sms', 'push', 'whatsapp', 'all']),
  granted: z.boolean(),
  source: z.enum(['registration', 'website', 'app', 'clinic', 'phone', 'manual']).default('manual'),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  legal_basis: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const updateConsentSchema = z.object({
  granted: z.boolean(),
  source: z.enum(['registration', 'website', 'app', 'clinic', 'phone', 'manual']).optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  legal_basis: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const consentFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  consent_type: z.enum(['marketing', 'appointment_reminders', 'treatment_followup', 'general_communication']).optional(),
  channel: z.enum(['email', 'sms', 'push', 'whatsapp', 'all']).optional(),
  granted: z.boolean().optional(),
  source: z.enum(['registration', 'website', 'app', 'clinic', 'phone', 'manual']).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * GET /api/communication/consents
 * List communication consents for the clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = consentFiltersSchema.parse({
      patient_id: searchParams.get('patient_id'),
      consent_type: searchParams.get('consent_type'),
      channel: searchParams.get('channel'),
      granted: searchParams.get('granted') === 'true' ? true : searchParams.get('granted') === 'false' ? false : undefined,
      source: searchParams.get('source'),
      from_date: searchParams.get('from_date'),
      to_date: searchParams.get('to_date'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('communication_consents')
      .select(`
        *,
        patient:patient_id (
          profiles (
            name,
            email,
            phone
          )
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters.consent_type) {
      query = query.eq('consent_type', filters.consent_type);
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel);
    }

    if (filters.granted !== undefined) {
      query = query.eq('granted', filters.granted);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date);
    }

    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: consents, error, count } = await query;

    if (error) {
      console.error('Error fetching consents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consents' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform data
    const transformedConsents: CommunicationConsent[] = consents?.map(consent => ({
      id: consent.id,
      clinic_id: consent.clinic_id,
      patient_id: consent.patient_id,
      consent_type: consent.consent_type,
      channel: consent.channel,
      granted: consent.granted,
      granted_at: consent.granted_at ? new Date(consent.granted_at) : null,
      revoked_at: consent.revoked_at ? new Date(consent.revoked_at) : null,
      source: consent.source,
      ip_address: consent.ip_address,
      user_agent: consent.user_agent,
      legal_basis: consent.legal_basis,
      notes: consent.notes,
      created_at: new Date(consent.created_at),
      updated_at: new Date(consent.updated_at),
    })) || [];

    return NextResponse.json({
      consents: transformedConsents,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/consents:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/consents
 * Create or update a communication consent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const consentData = createConsentSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', consentData.patient_id)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient || patient.clinic_id !== profile.clinic_id) {
      return NextResponse.json(
        { 
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found or does not belong to your clinic' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Check if consent already exists for this patient/type/channel combination
    const { data: existingConsent } = await supabase
      .from('communication_consents')
      .select('id, granted')
      .eq('clinic_id', profile.clinic_id)
      .eq('patient_id', consentData.patient_id)
      .eq('consent_type', consentData.consent_type)
      .eq('channel', consentData.channel)
      .single();

    let result;
    let isUpdate = false;

    if (existingConsent) {
      // Update existing consent
      isUpdate = true;
      const updateData: any = {
        granted: consentData.granted,
        source: consentData.source,
        ip_address: consentData.ip_address,
        user_agent: consentData.user_agent,
        legal_basis: consentData.legal_basis,
        notes: consentData.notes,
        updated_at: new Date().toISOString(),
      };

      // Set granted_at or revoked_at based on consent status
      if (consentData.granted && !existingConsent.granted) {
        updateData.granted_at = new Date().toISOString();
        updateData.revoked_at = null;
      } else if (!consentData.granted && existingConsent.granted) {
        updateData.revoked_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('communication_consents')
        .update(updateData)
        .eq('id', existingConsent.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating consent:', error);
        return NextResponse.json(
          { error: 'Failed to update consent' } as CommunicationError,
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new consent
      const insertData: any = {
        clinic_id: profile.clinic_id,
        patient_id: consentData.patient_id,
        consent_type: consentData.consent_type,
        channel: consentData.channel,
        granted: consentData.granted,
        source: consentData.source,
        ip_address: consentData.ip_address,
        user_agent: consentData.user_agent,
        legal_basis: consentData.legal_basis,
        notes: consentData.notes,
      };

      // Set granted_at or revoked_at based on initial consent status
      if (consentData.granted) {
        insertData.granted_at = new Date().toISOString();
      } else {
        insertData.revoked_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('communication_consents')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating consent:', error);
        return NextResponse.json(
          { error: 'Failed to create consent' } as CommunicationError,
          { status: 500 }
        );
      }

      result = data;
    }

    // Transform response data
    const transformedConsent: CommunicationConsent = {
      id: result.id,
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      consent_type: result.consent_type,
      channel: result.channel,
      granted: result.granted,
      granted_at: result.granted_at ? new Date(result.granted_at) : null,
      revoked_at: result.revoked_at ? new Date(result.revoked_at) : null,
      source: result.source,
      ip_address: result.ip_address,
      user_agent: result.user_agent,
      legal_basis: result.legal_basis,
      notes: result.notes,
      created_at: new Date(result.created_at),
      updated_at: new Date(result.updated_at),
    };

    // Audit log
    await auditLog({
      action: isUpdate ? 'consent_updated' : 'consent_created',
      entity_type: 'consent',
      entity_id: result.id,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        patient_id: result.patient_id,
        consent_type: result.consent_type,
        channel: result.channel,
        granted: result.granted,
        source: result.source,
      },
    });

    return NextResponse.json({
      consent: transformedConsent,
    }, { status: isUpdate ? 200 : 201 });

  } catch (error) {
    console.error('Error in POST /api/communication/consents:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communication/consents/[id]
 * Update a specific consent
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const consentId = searchParams.get('id');
    const body = await request.json();

    if (!consentId) {
      return NextResponse.json(
        { error: 'Consent ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Validate request body
    const updateData = updateConsentSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if consent exists and belongs to user's clinic
    const { data: existingConsent, error: fetchError } = await supabase
      .from('communication_consents')
      .select('id, clinic_id, granted')
      .eq('id', consentId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !existingConsent) {
      return NextResponse.json(
        { 
          code: 'CONSENT_NOT_FOUND',
          message: 'Consent not found' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Prepare update payload
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    // Copy valid fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        updatePayload[key] = updateData[key as keyof typeof updateData];
      }
    });

    // Handle granted status changes with timestamps
    if (updateData.granted !== undefined && updateData.granted !== existingConsent.granted) {
      if (updateData.granted) {
        updatePayload.granted_at = new Date().toISOString();
        updatePayload.revoked_at = null;
      } else {
        updatePayload.revoked_at = new Date().toISOString();
      }
    }

    // Update consent
    const { data: consent, error: updateError } = await supabase
      .from('communication_consents')
      .update(updatePayload)
      .eq('id', consentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating consent:', updateError);
      return NextResponse.json(
        { error: 'Failed to update consent' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform response data
    const transformedConsent: CommunicationConsent = {
      id: consent.id,
      clinic_id: consent.clinic_id,
      patient_id: consent.patient_id,
      consent_type: consent.consent_type,
      channel: consent.channel,
      granted: consent.granted,
      granted_at: consent.granted_at ? new Date(consent.granted_at) : null,
      revoked_at: consent.revoked_at ? new Date(consent.revoked_at) : null,
      source: consent.source,
      ip_address: consent.ip_address,
      user_agent: consent.user_agent,
      legal_basis: consent.legal_basis,
      notes: consent.notes,
      created_at: new Date(consent.created_at),
      updated_at: new Date(consent.updated_at),
    };

    // Audit log
    await auditLog({
      action: 'consent_updated',
      entity_type: 'consent',
      entity_id: consentId,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        updates: updatePayload,
        old_granted: existingConsent.granted,
        new_granted: consent.granted,
      },
    });

    return NextResponse.json({
      consent: transformedConsent,
    });

  } catch (error) {
    console.error('Error in PUT /api/communication/consents:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * GET /api/communication/consents/patient/[id]
 * Get all consents for a specific patient
 */
export async function getPatientConsents(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams, pathname } = new URL(request.url);
    const patientId = pathname.split('/').pop();

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('clinic_id, name, email')
      .eq('id', patientId)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient || patient.clinic_id !== profile.clinic_id) {
      return NextResponse.json(
        { 
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found or does not belong to your clinic' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Get all consents for the patient
    const { data: consents, error } = await supabase
      .from('communication_consents')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .eq('patient_id', patientId)
      .order('consent_type', { ascending: true })
      .order('channel', { ascending: true });

    if (error) {
      console.error('Error fetching patient consents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch patient consents' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform data
    const transformedConsents: CommunicationConsent[] = consents?.map(consent => ({
      id: consent.id,
      clinic_id: consent.clinic_id,
      patient_id: consent.patient_id,
      consent_type: consent.consent_type,
      channel: consent.channel,
      granted: consent.granted,
      granted_at: consent.granted_at ? new Date(consent.granted_at) : null,
      revoked_at: consent.revoked_at ? new Date(consent.revoked_at) : null,
      source: consent.source,
      ip_address: consent.ip_address,
      user_agent: consent.user_agent,
      legal_basis: consent.legal_basis,
      notes: consent.notes,
      created_at: new Date(consent.created_at),
      updated_at: new Date(consent.updated_at),
    })) || [];

    // Group consents by type and channel for easier frontend consumption
    const groupedConsents = transformedConsents.reduce((acc, consent) => {
      const key = `${consent.consent_type}_${consent.channel}`;
      acc[key] = consent;
      return acc;
    }, {} as Record<string, CommunicationConsent>);

    return NextResponse.json({
      patient: {
        id: patientId,
        name: patient.name,
        email: patient.email,
      },
      consents: transformedConsents,
      grouped_consents: groupedConsents,
      summary: {
        total_consents: transformedConsents.length,
        granted_consents: transformedConsents.filter(c => c.granted).length,
        revoked_consents: transformedConsents.filter(c => !c.granted).length,
      },
    });

  } catch (error) {
    console.error('Error in getPatientConsents:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}
