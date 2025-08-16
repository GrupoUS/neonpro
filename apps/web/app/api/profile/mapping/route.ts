// app/api/profile/mapping/route.ts
// VIBECODE V1.0 - Professional Profile Email Mapping API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

type EmailDomainMapping = {
  domain: string;
  default_role: 'admin' | 'doctor' | 'nurse' | 'staff' | 'professional';
  department?: string;
  auto_approve: boolean;
};

// Configuration for email domain to professional role mapping
const EMAIL_DOMAIN_MAPPINGS: EmailDomainMapping[] = [
  // Clinic domains - admin access
  { domain: 'neonpro.clinic', default_role: 'admin', auto_approve: true },
  { domain: 'clinica.com.br', default_role: 'admin', auto_approve: true },

  // Medical domains - doctor access
  { domain: 'crm.org.br', default_role: 'doctor', auto_approve: true },
  { domain: 'cfm.org.br', default_role: 'doctor', auto_approve: true },

  // Healthcare domains - staff access
  {
    domain: 'saude.gov.br',
    default_role: 'staff',
    department: 'Healthcare',
    auto_approve: true,
  },
  {
    domain: 'sus.br',
    default_role: 'staff',
    department: 'Public Health',
    auto_approve: true,
  },

  // Nursing domains
  { domain: 'coren.gov.br', default_role: 'nurse', auto_approve: true },

  // Default for other emails
  { domain: '*', default_role: 'professional', auto_approve: false },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, force_mapping } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email required', message: 'Email is required for mapping' },
        { status: 400 },
      );
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 },
      );
    }

    // Extract domain from email
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!emailDomain) {
      return NextResponse.json(
        {
          error: 'Invalid email',
          message: 'Could not extract domain from email',
        },
        { status: 400 },
      );
    }

    // Find matching domain mapping
    let mapping = EMAIL_DOMAIN_MAPPINGS.find((m) => m.domain === emailDomain);

    // Fallback to default mapping if no specific domain found
    if (!mapping) {
      mapping = EMAIL_DOMAIN_MAPPINGS.find((m) => m.domain === '*')!;
    }

    // Check if user already has a professional profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Profile lookup failed', message: profileError.message },
        { status: 500 },
      );
    }

    // If profile exists and force_mapping is not true, return existing mapping
    if (existingProfile && !force_mapping) {
      return NextResponse.json({
        success: true,
        message: 'Profile mapping already exists',
        mapping: {
          email: existingProfile.email,
          role: existingProfile.role,
          department: existingProfile.department,
          professional_title: existingProfile.professional_title,
          mapping_source: 'existing',
        },
        auto_approved: true,
      });
    }

    // Create or update professional profile mapping
    const profileUpdate = {
      role: mapping.default_role,
      department: mapping.department || existingProfile?.department,
      profile_sync_status: mapping.auto_approve ? 'synced' : 'pending',
      updated_at: new Date().toISOString(),
    };

    let profile;
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Mapping failed', message: updateError.message },
          { status: 500 },
        );
      }

      profile = updatedProfile;
    } else {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email,
          ...profileUpdate,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Mapping failed', message: createError.message },
          { status: 500 },
        );
      }

      profile = newProfile;
    }

    // Log mapping event for audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      event_type: 'profile_mapping',
      event_data: {
        email,
        domain: emailDomain,
        mapped_role: mapping.default_role,
        mapping_source: 'email_domain',
        auto_approved: mapping.auto_approve,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Profile mapped to ${mapping.default_role} role${mapping.auto_approve ? ' and auto-approved' : ', pending approval'}`,
      mapping: {
        email,
        role: mapping.default_role,
        department: mapping.department,
        domain: emailDomain,
        mapping_source: 'email_domain',
        auto_approved: mapping.auto_approve,
      },
      profile,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error', message: 'Profile mapping failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email required', message: 'Email parameter is required' },
        { status: 400 },
      );
    }

    // Extract domain and find mapping
    const emailDomain = email.split('@')[1]?.toLowerCase();
    let mapping = EMAIL_DOMAIN_MAPPINGS.find((m) => m.domain === emailDomain);

    if (!mapping) {
      mapping = EMAIL_DOMAIN_MAPPINGS.find((m) => m.domain === '*')!;
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select(
        'email, role, department, professional_title, profile_sync_status',
      )
      .eq('email', email)
      .single();

    return NextResponse.json({
      email,
      domain: emailDomain,
      suggested_mapping: {
        role: mapping.default_role,
        department: mapping.department,
        auto_approve: mapping.auto_approve,
      },
      existing_profile: existingProfile || null,
      available_roles: ['admin', 'doctor', 'nurse', 'staff', 'professional'],
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Could not fetch mapping information',
      },
      { status: 500 },
    );
  }
}
