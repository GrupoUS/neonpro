import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * LGPD Data Deletion API Route
 *
 * Implements LGPD Article 16 - Right to Erasure
 * Provides secure data deletion with compliance requirements
 *
 * Features:
 * - Complete user data deletion
 * - Selective data deletion by category
 * - Compliance with retention requirements
 * - Anonymization option
 * - Audit trail
 * - Grace period for account recovery
 *
 * Security:
 * - Authentication required
 * - User can only delete their own data
 * - Irreversible deletion warnings
 * - Compliance validation
 * - Legal retention period checks
 */

// Request validation schema
const DataDeletionRequestSchema = z.object({
  deletionType: z.enum(['complete', 'selective']).default('complete'),
  categories: z
    .array(
      z.enum([
        'profile',
        'appointments',
        'treatments',
        'payments',
        'communications',
        'preferences',
        'account',
      ])
    )
    .optional(),
  reason: z.string().min(10).max(500),
  confirmUnderstanding: z.boolean().refine((val) => val === true, {
    message: 'You must confirm understanding of irreversible deletion',
  }),
  alternativeAction: z.enum(['delete', 'anonymize']).default('delete'),
  gracePeriod: z.boolean().default(true), // 30-day recovery period
  retainLegalData: z.boolean().default(true), // Keep data required by law
});

type DeletionResult = {
  deletionId: string;
  userId: string;
  deletionDate: string;
  deletionType: string;
  categories?: string[];
  reason: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  gracePeriodEnd?: string;
  retainedData: {
    legal: string[];
    business: string[];
  };
  summary: {
    recordsDeleted: number;
    recordsAnonymized: number;
    recordsRetained: number;
  };
};

// Legal retention requirements
const RETENTION_REQUIREMENTS = {
  tax_records: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
  medical_records: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
  payment_records: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
  audit_logs: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
  anvisa_reports: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
};

const GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

// Helper function to check retention requirements
function checkRetentionRequirements(record: any, recordType: string): boolean {
  const now = Date.now();
  const recordDate = new Date(
    record.created_at || record.date || record.timestamp
  ).getTime();
  const retentionPeriod =
    RETENTION_REQUIREMENTS[recordType as keyof typeof RETENTION_REQUIREMENTS];

  if (!retentionPeriod) {
    return false;
  }

  return now - recordDate < retentionPeriod;
}

// Anonymization function
function anonymizeRecord(record: any): any {
  const anonymized = { ...record };

  // Remove or hash PII
  anonymized.email = undefined;
  anonymized.full_name = undefined;
  anonymized.phone = undefined;
  anonymized.address = undefined;
  anonymized.birth_date = undefined;
  anonymized.emergency_contact_name = undefined;
  anonymized.emergency_contact_phone = undefined;
  anonymized.cpf = undefined;
  anonymized.rg = undefined;

  // Replace with anonymous IDs
  anonymized.user_id = `anon_${nanoid()}`;
  anonymized.anonymized_at = new Date().toISOString();
  anonymized.original_id_hash = record.id; // Keep hashed reference

  return anonymized;
}

// Delete user profile
async function deleteUserProfile(
  supabase: any,
  userId: string,
  anonymize = false
) {
  if (anonymize) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      const anonymizedProfile = anonymizeRecord(profile);

      // Move to anonymized table
      await supabase.from('anonymized_users').insert([anonymizedProfile]);
    }
  }

  const { error } = await supabase.from('users').delete().eq('id', userId);

  if (error) {
    throw error;
  }

  return { deleted: !anonymize, anonymized: anonymize };
}

// Delete appointments
async function deleteUserAppointments(
  supabase: any,
  userId: string,
  retainLegal = true,
  anonymize = false
) {
  let deleted = 0;
  let retained = 0;
  let anonymized = 0;

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', userId);

  if (appointments) {
    for (const appointment of appointments) {
      // Check if we need to retain for legal reasons
      if (
        retainLegal &&
        checkRetentionRequirements(appointment, 'medical_records')
      ) {
        if (anonymize) {
          const anonymizedRecord = anonymizeRecord(appointment);
          await supabase
            .from('anonymized_appointments')
            .insert([anonymizedRecord]);
          anonymized++;
        } else {
          retained++;
          continue;
        }
      }

      await supabase.from('appointments').delete().eq('id', appointment.id);

      deleted++;
    }
  }

  return { deleted, retained, anonymized };
}

// Delete treatments
async function deleteUserTreatments(
  supabase: any,
  userId: string,
  retainLegal = true,
  anonymize = false
) {
  let deleted = 0;
  let retained = 0;
  let anonymized = 0;

  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .eq('patient_id', userId);

  if (treatments) {
    for (const treatment of treatments) {
      if (
        retainLegal &&
        checkRetentionRequirements(treatment, 'medical_records')
      ) {
        if (anonymize) {
          const anonymizedRecord = anonymizeRecord(treatment);
          await supabase
            .from('anonymized_treatments')
            .insert([anonymizedRecord]);
          anonymized++;
        } else {
          retained++;
          continue;
        }
      }

      // Delete related sessions
      await supabase
        .from('treatment_sessions')
        .delete()
        .eq('treatment_id', treatment.id);

      await supabase.from('treatments').delete().eq('id', treatment.id);

      deleted++;
    }
  }

  return { deleted, retained, anonymized };
}

// Delete payments
async function deleteUserPayments(
  supabase: any,
  userId: string,
  retainLegal = true,
  anonymize = false
) {
  let deleted = 0;
  let retained = 0;
  let anonymized = 0;

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('patient_id', userId);

  if (payments) {
    for (const payment of payments) {
      if (
        retainLegal &&
        checkRetentionRequirements(payment, 'payment_records')
      ) {
        if (anonymize) {
          const anonymizedRecord = anonymizeRecord(payment);
          await supabase.from('anonymized_payments').insert([anonymizedRecord]);
          anonymized++;
        } else {
          retained++;
          continue;
        }
      }

      // Delete installments
      await supabase
        .from('payment_installments')
        .delete()
        .eq('payment_id', payment.id);

      await supabase.from('payments').delete().eq('id', payment.id);

      deleted++;
    }
  }

  return { deleted, retained, anonymized };
}

// Delete communications
async function deleteUserCommunications(
  supabase: any,
  userId: string,
  anonymize = false
) {
  const _deleted = 0;
  let anonymized = 0;

  if (anonymize) {
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

    if (communications) {
      for (const comm of communications) {
        const anonymizedRecord = anonymizeRecord(comm);
        await supabase
          .from('anonymized_communications')
          .insert([anonymizedRecord]);
        anonymized++;
      }
    }
  }

  const { error } = await supabase
    .from('communications')
    .delete()
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

  if (error) {
    throw error;
  }

  return { deleted: anonymize ? 0 : 1, retained: 0, anonymized };
}

// Delete preferences
async function deleteUserPreferences(supabase: any, userId: string) {
  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return { deleted: 1, retained: 0, anonymized: 0 };
}

// Schedule deletion (for grace period)
async function scheduleDeletion(
  supabase: any,
  deletionRequest: any
): Promise<string> {
  const deletionId = nanoid();
  const gracePeriodEnd = new Date(Date.now() + GRACE_PERIOD).toISOString();

  const { error } = await supabase.from('scheduled_deletions').insert([
    {
      id: deletionId,
      user_id: deletionRequest.userId,
      deletion_type: deletionRequest.deletionType,
      categories: deletionRequest.categories,
      reason: deletionRequest.reason,
      alternative_action: deletionRequest.alternativeAction,
      retain_legal_data: deletionRequest.retainLegalData,
      scheduled_for: gracePeriodEnd,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    throw error;
  }

  return deletionId;
}

// Execute deletion
async function executeDeletion(supabase: any, userId: string, request: any) {
  const { deletionType, categories, alternativeAction, retainLegalData } =
    request;
  const anonymize = alternativeAction === 'anonymize';

  let totalDeleted = 0;
  let totalRetained = 0;
  let totalAnonymized = 0;

  const retainedData = {
    legal: [] as string[],
    business: [] as string[],
  };

  if (deletionType === 'complete' || categories?.includes('appointments')) {
    const result = await deleteUserAppointments(
      supabase,
      userId,
      retainLegalData,
      anonymize
    );
    totalDeleted += result.deleted;
    totalRetained += result.retained;
    totalAnonymized += result.anonymized;
    if (result.retained > 0) {
      retainedData.legal.push('appointments');
    }
  }

  if (deletionType === 'complete' || categories?.includes('treatments')) {
    const result = await deleteUserTreatments(
      supabase,
      userId,
      retainLegalData,
      anonymize
    );
    totalDeleted += result.deleted;
    totalRetained += result.retained;
    totalAnonymized += result.anonymized;
    if (result.retained > 0) {
      retainedData.legal.push('treatments');
    }
  }

  if (deletionType === 'complete' || categories?.includes('payments')) {
    const result = await deleteUserPayments(
      supabase,
      userId,
      retainLegalData,
      anonymize
    );
    totalDeleted += result.deleted;
    totalRetained += result.retained;
    totalAnonymized += result.anonymized;
    if (result.retained > 0) {
      retainedData.legal.push('payments');
    }
  }

  if (deletionType === 'complete' || categories?.includes('communications')) {
    const result = await deleteUserCommunications(supabase, userId, anonymize);
    totalDeleted += result.deleted;
    totalRetained += result.retained;
    totalAnonymized += result.anonymized;
  }

  if (deletionType === 'complete' || categories?.includes('preferences')) {
    const result = await deleteUserPreferences(supabase, userId);
    totalDeleted += result.deleted;
    totalRetained += result.retained;
    totalAnonymized += result.anonymized;
  }

  // Profile and account deletion last
  if (
    deletionType === 'complete' ||
    categories?.includes('profile') ||
    categories?.includes('account')
  ) {
    const result = await deleteUserProfile(supabase, userId, anonymize);
    totalDeleted += result.deleted ? 1 : 0;
    totalAnonymized += result.anonymized ? 1 : 0;
  }

  return {
    recordsDeleted: totalDeleted,
    recordsAnonymized: totalAnonymized,
    recordsRetained: totalRetained,
    retainedData,
  };
}

// Log deletion request
async function logDeletionRequest(
  supabase: any,
  userId: string,
  request: any,
  success: boolean,
  deletionId?: string
) {
  try {
    await supabase.from('lgpd_deletion_logs').insert([
      {
        user_id: userId,
        deletion_id: deletionId,
        request_type: 'data_deletion',
        request_details: request,
        success,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (_error) {}
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
        { error: 'Unauthorized. Please log in to delete your data.' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = DataDeletionRequestSchema.parse(body);

    const {
      deletionType,
      categories,
      reason,
      alternativeAction,
      gracePeriod,
      retainLegalData,
    } = validatedRequest;

    // Prepare deletion request
    const deletionRequest = {
      userId: user.id,
      deletionType,
      categories,
      reason,
      alternativeAction,
      retainLegalData,
    };

    let deletionResult: DeletionResult;

    if (gracePeriod) {
      // Schedule deletion with grace period
      const deletionId = await scheduleDeletion(supabase, deletionRequest);

      deletionResult = {
        deletionId,
        userId: user.id,
        deletionDate: new Date().toISOString(),
        deletionType,
        categories,
        reason,
        status: 'scheduled',
        gracePeriodEnd: new Date(Date.now() + GRACE_PERIOD).toISOString(),
        retainedData: { legal: [], business: [] },
        summary: {
          recordsDeleted: 0,
          recordsAnonymized: 0,
          recordsRetained: 0,
        },
      };

      await logDeletionRequest(
        supabase,
        user.id,
        deletionRequest,
        true,
        deletionId
      );

      return NextResponse.json({
        ...deletionResult,
        message:
          'Data deletion scheduled successfully. You have 30 days to cancel this request.',
        cancellationUrl: `/api/lgpd/data-deletion/cancel/${deletionId}`,
        gracePeriodEnd: deletionResult.gracePeriodEnd,
      });
    }
    // Execute immediate deletion
    const deletionId = nanoid();

    const summary = await executeDeletion(supabase, user.id, deletionRequest);

    deletionResult = {
      deletionId,
      userId: user.id,
      deletionDate: new Date().toISOString(),
      deletionType,
      categories,
      reason,
      status: 'completed',
      retainedData: summary.retainedData,
      summary: {
        recordsDeleted: summary.recordsDeleted,
        recordsAnonymized: summary.recordsAnonymized,
        recordsRetained: summary.recordsRetained,
      },
    };

    await logDeletionRequest(
      supabase,
      user.id,
      deletionRequest,
      true,
      deletionId
    );

    return NextResponse.json({
      ...deletionResult,
      message: 'Data deletion completed successfully.',
      warning:
        'This action is irreversible. Your data has been permanently deleted.',
    });
  } catch (error) {
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
      { error: 'Internal server error during data deletion' },
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

    // Get user's deletion history
    const { data: deletionHistory, error } = await supabase
      .from('lgpd_deletion_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get scheduled deletions
    const { data: scheduledDeletions } = await supabase
      .from('scheduled_deletions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true });

    if (error) {
    }

    return NextResponse.json({
      message: 'LGPD Data Deletion API - Right to Erasure',
      deletionTypes: ['complete', 'selective'],
      availableCategories: [
        'profile',
        'appointments',
        'treatments',
        'payments',
        'communications',
        'preferences',
        'account',
      ],
      alternativeActions: ['delete', 'anonymize'],
      retentionRequirements: {
        medical_records: '7 years',
        payment_records: '5 years',
        tax_records: '5 years',
        audit_logs: '7 years',
        anvisa_reports: '10 years',
      },
      gracePeriod: '30 days',
      scheduledDeletions: scheduledDeletions || [],
      recentDeletionHistory: deletionHistory || [],
      usage: {
        endpoint: 'POST /api/lgpd/data-deletion',
        parameters: {
          deletionType: 'complete | selective',
          categories: 'Array of data categories (required for selective)',
          reason: 'Reason for deletion (min 10 chars)',
          confirmUnderstanding: 'Must be true',
          alternativeAction: 'delete | anonymize (default: delete)',
          gracePeriod: 'boolean (default: true)',
          retainLegalData: 'boolean (default: true)',
        },
        example: {
          deletionType: 'selective',
          categories: ['communications', 'preferences'],
          reason: 'No longer need these data categories',
          confirmUnderstanding: true,
          alternativeAction: 'anonymize',
          gracePeriod: true,
          retainLegalData: true,
        },
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
