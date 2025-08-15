import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * LGPD Data Access API Route
 *
 * Implements LGPD Article 15 - Right of Access
 * Provides comprehensive data export for data subjects
 *
 * Features:
 * - Complete user data extraction
 * - Multiple export formats (JSON, CSV, PDF)
 * - Anonymized references
 * - Audit trail
 * - Rate limiting
 *
 * Security:
 * - Authentication required
 * - User can only access their own data
 * - Request logging
 * - Data anonymization for exports
 */

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Request validation schema
const DataAccessRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  categories: z
    .array(
      z.enum([
        'profile',
        'appointments',
        'treatments',
        'payments',
        'communications',
        'preferences',
        'all',
      ])
    )
    .default(['all']),
  includeDeleted: z.boolean().default(false),
  anonymizeThirdParty: z.boolean().default(true),
});

interface UserDataExport {
  exportId: string;
  userId: string;
  exportDate: string;
  format: string;
  categories: string[];
  data: {
    profile?: any;
    appointments?: any[];
    treatments?: any[];
    payments?: any[];
    communications?: any[];
    preferences?: any;
    metadata?: {
      accountCreated: string;
      lastLogin: string;
      dataRetentionPolicy: string;
      totalRecords: number;
    };
  };
}

// Rate limiting helper
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Data extraction functions
async function extractUserProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      email,
      full_name,
      phone,
      birth_date,
      gender,
      address,
      city,
      state,
      zip_code,
      emergency_contact_name,
      emergency_contact_phone,
      medical_conditions,
      allergies,
      medications,
      preferred_language,
      communication_preferences,
      created_at,
      updated_at
    `
    )
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error extracting user profile:', error);
    return null;
  }

  return data;
}

async function extractUserAppointments(
  supabase: any,
  userId: string,
  includeDeleted = false
) {
  let query = supabase
    .from('appointments')
    .select(
      `
      id,
      appointment_date,
      appointment_time,
      status,
      treatment_type,
      duration,
      notes,
      practitioner_name,
      room,
      created_at,
      updated_at,
      ${includeDeleted ? 'deleted_at,' : ''}
      treatment_plans (
        id,
        treatment_name,
        description,
        estimated_sessions,
        cost_per_session
      )
    `
    )
    .eq('patient_id', userId);

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('appointment_date', {
    ascending: false,
  });

  if (error) {
    console.error('Error extracting appointments:', error);
    return [];
  }

  return data || [];
}

async function extractUserTreatments(
  supabase: any,
  userId: string,
  includeDeleted = false
) {
  let query = supabase
    .from('treatments')
    .select(
      `
      id,
      treatment_name,
      treatment_type,
      start_date,
      end_date,
      status,
      total_cost,
      sessions_completed,
      sessions_planned,
      results,
      side_effects,
      practitioner_notes,
      created_at,
      updated_at,
      ${includeDeleted ? 'deleted_at,' : ''}
      treatment_sessions (
        id,
        session_date,
        session_notes,
        before_photos,
        after_photos,
        satisfaction_rating
      )
    `
    )
    .eq('patient_id', userId);

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('start_date', { ascending: false });

  if (error) {
    console.error('Error extracting treatments:', error);
    return [];
  }

  return data || [];
}

async function extractUserPayments(
  supabase: any,
  userId: string,
  includeDeleted = false
) {
  let query = supabase
    .from('payments')
    .select(
      `
      id,
      payment_date,
      amount,
      currency,
      payment_method,
      payment_status,
      transaction_id,
      description,
      invoice_number,
      created_at,
      updated_at,
      ${includeDeleted ? 'deleted_at,' : ''}
      payment_installments (
        id,
        installment_number,
        due_date,
        amount,
        status
      )
    `
    )
    .eq('patient_id', userId);

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('payment_date', {
    ascending: false,
  });

  if (error) {
    console.error('Error extracting payments:', error);
    return [];
  }

  return data || [];
}

async function extractUserCommunications(
  supabase: any,
  userId: string,
  anonymizeThirdParty = true
) {
  const { data, error } = await supabase
    .from('communications')
    .select(
      `
      id,
      communication_type,
      subject,
      content,
      sender_type,
      sender_name,
      recipient_type,
      status,
      sent_at,
      read_at,
      created_at,
      updated_at
    `
    )
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error extracting communications:', error);
    return [];
  }

  // Anonymize third-party data if requested
  if (anonymizeThirdParty && data) {
    return data.map((comm) => ({
      ...comm,
      sender_name: comm.sender_id === userId ? comm.sender_name : '***',
      content:
        comm.sender_id === userId
          ? comm.content
          : '[Content from clinic staff]',
    }));
  }

  return data || [];
}

async function extractUserPreferences(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select(
      `
      id,
      notification_preferences,
      communication_preferences,
      privacy_settings,
      accessibility_settings,
      language_preference,
      theme_preference,
      timezone,
      created_at,
      updated_at
    `
    )
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error extracting preferences:', error);
    return null;
  }

  return data;
}

async function extractUserMetadata(supabase: any, userId: string) {
  // Get account creation date
  const { data: userData } = await supabase
    .from('users')
    .select('created_at, last_login_at')
    .eq('id', userId)
    .single();

  // Count total records
  const [
    appointmentsCount,
    treatmentsCount,
    paymentsCount,
    communicationsCount,
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('patient_id', userId),
    supabase
      .from('treatments')
      .select('id', { count: 'exact' })
      .eq('patient_id', userId),
    supabase
      .from('payments')
      .select('id', { count: 'exact' })
      .eq('patient_id', userId),
    supabase
      .from('communications')
      .select('id', { count: 'exact' })
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
  ]);

  return {
    accountCreated: userData?.created_at || null,
    lastLogin: userData?.last_login_at || null,
    dataRetentionPolicy:
      '7 years from last interaction (as per LGPD requirements)',
    totalRecords:
      (appointmentsCount.count || 0) +
      (treatmentsCount.count || 0) +
      (paymentsCount.count || 0) +
      (communicationsCount.count || 0),
  };
}

// Format converters
function convertToCSV(data: any): string {
  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};

    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        flattened[prefix + key] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix + key}_`));
      } else if (Array.isArray(obj[key])) {
        flattened[prefix + key] = JSON.stringify(obj[key]);
      } else {
        flattened[prefix + key] = obj[key];
      }
    }

    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);

  return [
    headers.join(','),
    values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
  ].join('\n');
}

// Log data access request
async function logDataAccessRequest(
  supabase: any,
  userId: string,
  format: string,
  categories: string[],
  success: boolean
) {
  try {
    await supabase.from('lgpd_access_logs').insert([
      {
        user_id: userId,
        request_type: 'data_access',
        request_details: {
          format,
          categories,
          timestamp: new Date().toISOString(),
        },
        success,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Failed to log data access request:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access your data.' },
        { status: 401 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(user.id)) {
      await logDataAccessRequest(supabase, user.id, 'unknown', [], false);
      return NextResponse.json(
        {
          error:
            'Rate limit exceeded. You can request data export 3 times per hour.',
          retryAfter:
            Math.ceil(
              (rateLimitMap.get(user.id)?.resetTime || Date.now()) - Date.now()
            ) / 1000,
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = DataAccessRequestSchema.parse(body);

    const { format, categories, includeDeleted, anonymizeThirdParty } =
      validatedRequest;

    // Extract user data based on requested categories
    const exportData: UserDataExport = {
      exportId: nanoid(),
      userId: user.id,
      exportDate: new Date().toISOString(),
      format,
      categories,
      data: {},
    };

    // Extract data by category
    if (categories.includes('all') || categories.includes('profile')) {
      exportData.data.profile = await extractUserProfile(supabase, user.id);
    }

    if (categories.includes('all') || categories.includes('appointments')) {
      exportData.data.appointments = await extractUserAppointments(
        supabase,
        user.id,
        includeDeleted
      );
    }

    if (categories.includes('all') || categories.includes('treatments')) {
      exportData.data.treatments = await extractUserTreatments(
        supabase,
        user.id,
        includeDeleted
      );
    }

    if (categories.includes('all') || categories.includes('payments')) {
      exportData.data.payments = await extractUserPayments(
        supabase,
        user.id,
        includeDeleted
      );
    }

    if (categories.includes('all') || categories.includes('communications')) {
      exportData.data.communications = await extractUserCommunications(
        supabase,
        user.id,
        anonymizeThirdParty
      );
    }

    if (categories.includes('all') || categories.includes('preferences')) {
      exportData.data.preferences = await extractUserPreferences(
        supabase,
        user.id
      );
    }

    // Always include metadata
    exportData.data.metadata = await extractUserMetadata(supabase, user.id);

    // Log successful request
    await logDataAccessRequest(supabase, user.id, format, categories, true);

    // Return data in requested format
    switch (format) {
      case 'csv': {
        const csvData = convertToCSV(exportData);
        return new NextResponse(csvData, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="lgpd-data-export-${exportData.exportId}.csv"`,
          },
        });
      }

      case 'pdf':
        // For PDF, return JSON with instructions (PDF generation would require additional libraries)
        return NextResponse.json({
          ...exportData,
          note: 'PDF export is available upon request. Please contact our data protection team.',
        });

      default: // JSON
        return NextResponse.json(exportData);
    }
  } catch (error) {
    console.error('LGPD Data Access Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during data export' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's data access history
    const { data: accessHistory, error } = await supabase
      .from('lgpd_access_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('request_type', 'data_access')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching access history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch access history' },
        { status: 500 }
      );
    }

    // Get rate limit status
    const rateLimitStatus = rateLimitMap.get(user.id);
    const remainingRequests = rateLimitStatus
      ? Math.max(0, RATE_LIMIT - rateLimitStatus.count)
      : RATE_LIMIT;

    return NextResponse.json({
      message: 'LGPD Data Access API - Get your personal data export',
      rateLimitStatus: {
        remainingRequests,
        resetTime: rateLimitStatus?.resetTime || null,
        windowDuration: RATE_LIMIT_WINDOW,
      },
      supportedFormats: ['json', 'csv', 'pdf'],
      availableCategories: [
        'profile',
        'appointments',
        'treatments',
        'payments',
        'communications',
        'preferences',
        'all',
      ],
      recentAccessHistory: accessHistory || [],
      usage: {
        endpoint: 'POST /api/lgpd/data-access',
        parameters: {
          format: 'json | csv | pdf (default: json)',
          categories: 'Array of data categories (default: ["all"])',
          includeDeleted: 'boolean (default: false)',
          anonymizeThirdParty: 'boolean (default: true)',
        },
        example: {
          format: 'json',
          categories: ['profile', 'appointments'],
          includeDeleted: false,
          anonymizeThirdParty: true,
        },
      },
    });
  } catch (error) {
    console.error('LGPD Data Access GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
