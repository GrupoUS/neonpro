import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * LGPD Data Rectification API Route
 *
 * Implements LGPD Article 16 - Right to Rectification
 * Allows users to correct inaccurate or incomplete personal data
 *
 * Features:
 * - Update user profile information
 * - Correct treatment records
 * - Update contact information
 * - Validation and approval workflow
 * - Audit trail
 * - Data integrity checks
 *
 * Security:
 * - Authentication required
 * - User can only modify their own data
 * - Validation of changes
 * - Medical data requires professional approval
 * - Complete audit logging
 */

// Profile update validation schema
const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/)
    .optional(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zip_code: z
    .string()
    .regex(/^\d{5}-?\d{3}$/)
    .optional(),
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/)
    .optional(),
  preferred_language: z.enum(['pt', 'en', 'es']).optional(),
  communication_preferences: z
    .object({
      email: z.boolean(),
      sms: z.boolean(),
      phone: z.boolean(),
      whatsapp: z.boolean(),
    })
    .optional(),
});

// Medical information update schema (requires approval)
const MedicalUpdateSchema = z.object({
  medical_conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  reason: z.string().min(10).max(500),
});

// Preferences update schema
const PreferencesUpdateSchema = z.object({
  notification_preferences: z
    .object({
      appointment_reminders: z.boolean(),
      treatment_updates: z.boolean(),
      promotional_content: z.boolean(),
      health_tips: z.boolean(),
    })
    .optional(),
  privacy_settings: z
    .object({
      allow_testimonials: z.boolean(),
      allow_photos: z.boolean(),
      allow_marketing_contact: z.boolean(),
      share_anonymous_data: z.boolean(),
    })
    .optional(),
  accessibility_settings: z
    .object({
      large_text: z.boolean(),
      high_contrast: z.boolean(),
      screen_reader: z.boolean(),
      reduced_motion: z.boolean(),
    })
    .optional(),
  theme_preference: z.enum(['light', 'dark', 'auto']).optional(),
  timezone: z.string().optional(),
});

// Main rectification request schema
const RectificationRequestSchema = z.object({
  requestType: z.enum(['profile', 'medical', 'preferences', 'contact']),
  changes: z.record(z.any()),
  reason: z.string().min(5).max(500),
  requiresApproval: z.boolean().default(false),
});

type RectificationResult = {
  rectificationId: string;
  userId: string;
  requestDate: string;
  requestType: string;
  changes: Record<string, any>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvalRequired: boolean;
  changesApplied: boolean;
  audit: {
    originalValues: Record<string, any>;
    newValues: Record<string, any>;
    changedFields: string[];
    timestamp: string;
  };
};

// Data validation functions
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check for invalid patterns
  const invalidPatterns = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];
  if (invalidPatterns.includes(cleanCPF)) {
    return false;
  }

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) {
    checkDigit1 = 0;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) {
    checkDigit2 = 0;
  }

  return (
    checkDigit1 === Number.parseInt(cleanCPF.charAt(9), 10) &&
    checkDigit2 === Number.parseInt(cleanCPF.charAt(10), 10)
  );
}

function validateAge(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();

  return age >= 16 && age <= 120; // Reasonable age range
}

function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

// Get current values for audit trail
async function getCurrentValues(
  supabase: any,
  userId: string,
  requestType: string,
) {
  let currentValues: Record<string, any> = {};

  switch (requestType) {
    case 'profile': {
      const { data: profile } = await supabase
        .from('users')
        .select(
          'full_name, phone, birth_date, gender, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, preferred_language, communication_preferences',
        )
        .eq('id', userId)
        .single();
      currentValues = profile || {};
      break;
    }

    case 'medical': {
      const { data: medical } = await supabase
        .from('users')
        .select('medical_conditions, allergies, medications')
        .eq('id', userId)
        .single();
      currentValues = medical || {};
      break;
    }

    case 'preferences': {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      currentValues = preferences || {};
      break;
    }

    case 'contact': {
      const { data: contact } = await supabase
        .from('users')
        .select('email, phone, emergency_contact_name, emergency_contact_phone')
        .eq('id', userId)
        .single();
      currentValues = contact || {};
      break;
    }
  }

  return currentValues;
}

// Apply changes to database
async function applyChanges(
  supabase: any,
  userId: string,
  requestType: string,
  changes: Record<string, any>,
) {
  let result;

  switch (requestType) {
    case 'profile':
      result = await supabase
        .from('users')
        .update({
          ...changes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      break;

    case 'medical':
      result = await supabase
        .from('users')
        .update({
          medical_conditions: changes.medical_conditions,
          allergies: changes.allergies,
          medications: changes.medications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      break;

    case 'preferences':
      result = await supabase
        .from('user_preferences')
        .update({
          ...changes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      break;

    case 'contact':
      result = await supabase
        .from('users')
        .update({
          phone: changes.phone,
          emergency_contact_name: changes.emergency_contact_name,
          emergency_contact_phone: changes.emergency_contact_phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      break;
  }

  if (result?.error) {
    throw result.error;
  }

  return result;
}

// Check if changes require approval
function requiresApproval(
  requestType: string,
  changes: Record<string, any>,
): boolean {
  // Medical information always requires approval
  if (requestType === 'medical') {
    return true;
  }

  // Sensitive profile changes may require approval
  const sensitiveFields = [
    'birth_date',
    'medical_conditions',
    'allergies',
    'medications',
  ];
  return Object.keys(changes).some((field) => sensitiveFields.includes(field));
}

// Create approval request
async function createApprovalRequest(
  supabase: any,
  rectificationId: string,
  userId: string,
  requestType: string,
  changes: Record<string, any>,
  reason: string,
) {
  const { error } = await supabase.from('rectification_approvals').insert([
    {
      rectification_id: rectificationId,
      user_id: userId,
      request_type: requestType,
      requested_changes: changes,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    throw error;
  }
}

// Log rectification request
async function logRectificationRequest(
  supabase: any,
  rectificationResult: RectificationResult,
) {
  try {
    await supabase.from('lgpd_rectification_logs').insert([
      {
        rectification_id: rectificationResult.rectificationId,
        user_id: rectificationResult.userId,
        request_type: rectificationResult.requestType,
        request_details: {
          changes: rectificationResult.changes,
          reason: rectificationResult.reason,
          originalValues: rectificationResult.audit.originalValues,
          newValues: rectificationResult.audit.newValues,
        },
        status: rectificationResult.status,
        requires_approval: rectificationResult.approvalRequired,
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
        { error: 'Unauthorized. Please log in to rectify your data.' },
        { status: 401 },
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = RectificationRequestSchema.parse(body);

    const { requestType, changes, reason } = validatedRequest;

    // Additional validation based on request type
    switch (requestType) {
      case 'profile':
        ProfileUpdateSchema.parse(changes);
        break;
      case 'medical':
        MedicalUpdateSchema.parse(changes);
        break;
      case 'preferences':
        PreferencesUpdateSchema.parse(changes);
        break;
    }

    // Custom validation
    if (changes.cpf && !validateCPF(changes.cpf)) {
      return NextResponse.json(
        { error: 'Invalid CPF format' },
        { status: 400 },
      );
    }

    if (changes.birth_date && !validateAge(changes.birth_date)) {
      return NextResponse.json(
        { error: 'Invalid birth date' },
        { status: 400 },
      );
    }

    if (changes.phone && !validatePhoneNumber(changes.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 },
      );
    }

    // Get current values for audit
    const originalValues = await getCurrentValues(
      supabase,
      user.id,
      requestType,
    );

    // Check if approval is required
    const needsApproval = requiresApproval(requestType, changes);

    const rectificationId = nanoid();

    // Create audit trail
    const changedFields = Object.keys(changes);
    const newValues = { ...originalValues, ...changes };

    const rectificationResult: RectificationResult = {
      rectificationId,
      userId: user.id,
      requestDate: new Date().toISOString(),
      requestType,
      changes,
      reason,
      status: needsApproval ? 'pending' : 'completed',
      approvalRequired: needsApproval,
      changesApplied: !needsApproval,
      audit: {
        originalValues,
        newValues,
        changedFields,
        timestamp: new Date().toISOString(),
      },
    };

    if (needsApproval) {
      // Create approval request
      await createApprovalRequest(
        supabase,
        rectificationId,
        user.id,
        requestType,
        changes,
        reason,
      );

      // Log request
      await logRectificationRequest(supabase, rectificationResult);

      return NextResponse.json({
        ...rectificationResult,
        message:
          'Rectification request submitted for approval. You will be notified when reviewed.',
        estimatedReviewTime: '2-5 business days',
      });
    }
    // Apply changes immediately
    await applyChanges(supabase, user.id, requestType, changes);

    // Log request
    await logRectificationRequest(supabase, rectificationResult);

    return NextResponse.json({
      ...rectificationResult,
      message: 'Data rectification completed successfully.',
      appliedChanges: changedFields,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during data rectification' },
      { status: 500 },
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

    // Get user's rectification history
    const { data: rectificationHistory, error } = await supabase
      .from('lgpd_rectification_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get pending approvals
    const { data: pendingApprovals } = await supabase
      .from('rectification_approvals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
    }

    return NextResponse.json({
      message: 'LGPD Data Rectification API - Right to Rectification',
      availableRequestTypes: [
        {
          type: 'profile',
          description: 'Update personal information',
          fields: [
            'full_name',
            'phone',
            'birth_date',
            'gender',
            'address',
            'city',
            'state',
            'zip_code',
            'emergency_contact_name',
            'emergency_contact_phone',
            'preferred_language',
          ],
          requiresApproval: false,
        },
        {
          type: 'medical',
          description: 'Update medical information',
          fields: ['medical_conditions', 'allergies', 'medications'],
          requiresApproval: true,
        },
        {
          type: 'preferences',
          description: 'Update user preferences',
          fields: [
            'notification_preferences',
            'privacy_settings',
            'accessibility_settings',
            'theme_preference',
          ],
          requiresApproval: false,
        },
        {
          type: 'contact',
          description: 'Update contact information',
          fields: [
            'phone',
            'emergency_contact_name',
            'emergency_contact_phone',
          ],
          requiresApproval: false,
        },
      ],
      validationRules: {
        cpf: 'Must be valid Brazilian CPF format',
        phone: 'Must be valid phone number format',
        birth_date: 'Must be valid date (YYYY-MM-DD) with age 16-120',
        email: 'Must be valid email format',
        zip_code: 'Must be valid Brazilian ZIP code format (12345-678)',
      },
      pendingApprovals: pendingApprovals || [],
      recentRectificationHistory: rectificationHistory || [],
      usage: {
        endpoint: 'POST /api/lgpd/data-rectification',
        parameters: {
          requestType: 'profile | medical | preferences | contact',
          changes: 'Object with field updates',
          reason: 'Reason for rectification (min 5 chars)',
        },
        example: {
          requestType: 'profile',
          changes: {
            full_name: 'João Silva Santos',
            phone: '+55 11 99999-9999',
            city: 'São Paulo',
          },
          reason: 'Updating name after marriage and new phone number',
        },
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
