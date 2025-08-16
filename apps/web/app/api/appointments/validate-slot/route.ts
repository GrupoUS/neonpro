// =============================================
// NeonPro Appointment Slot Validation API
// Story 1.2: Real-time conflict prevention
// Route: /api/appointments/validate-slot
// =============================================

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Validation schema for slot validation request
const validateSlotSchema = z.object({
  professional_id: z.string().uuid('Invalid professional ID'),
  service_type_id: z.string().uuid('Invalid service type ID'),
  start_time: z.string().datetime('Invalid start time format'),
  end_time: z.string().datetime('Invalid end time format'),
  exclude_appointment_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now(); // Capture start time for performance monitoring

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile to extract clinic_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json(
        {
          error: 'Profile not found',
          details: 'User profile or clinic not found',
        },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateSlotSchema.parse(body);

    // Call the stored procedure for slot validation
    const { data: validationResult, error: validationError } =
      await supabase.rpc('sp_validate_appointment_slot', {
        p_clinic_id: profile.clinic_id,
        p_professional_id: validatedData.professional_id,
        p_service_type_id: validatedData.service_type_id,
        p_start_time: validatedData.start_time,
        p_end_time: validatedData.end_time,
        p_exclude_appointment_id: validatedData.exclude_appointment_id || null,
      });

    if (validationError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationError.message,
          code: 'VALIDATION_PROCEDURE_ERROR',
        },
        { status: 500 }
      );
    }

    // Parse the result (stored procedure returns jsonb)
    const result =
      typeof validationResult === 'string'
        ? JSON.parse(validationResult)
        : validationResult;

    // Format response for frontend
    const response = {
      success: result.success,
      available: result.available,
      conflicts: result.conflicts || [],
      warnings: result.warnings || [],
      alternative_slots: result.alternative_slots || [],
      validation_details: result.validation_details || {},
      performance: {
        validation_time_ms: Date.now() - startTime, // Actual performance calculation
      },
    };

    // Add HTTP status based on availability
    const status = result.available ? 200 : 409; // 409 Conflict

    return NextResponse.json(response, { status });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'Invalid request parameters',
          validation_errors: error.errors,
          code: 'INVALID_REQUEST_PARAMETERS',
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          details: 'Request body contains invalid JSON',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred during slot validation',
        code: 'INTERNAL_SERVER_ERROR',
        performance: {
          validation_time_ms: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint for availability checking by parameters
export async function GET(request: NextRequest) {
  const startTime = Date.now(); // Capture start time for performance monitoring

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const professionalId = searchParams.get('professional_id');
    const serviceTypeId = searchParams.get('service_type_id');
    const startTime = searchParams.get('start_time');
    const endTime = searchParams.get('end_time');
    const excludeAppointmentId = searchParams.get('exclude_appointment_id');

    // Validate required parameters
    if (!(professionalId && serviceTypeId && startTime && endTime)) {
      return NextResponse.json(
        {
          error: 'Missing parameters',
          details:
            'professional_id, service_type_id, start_time, and end_time are required',
        },
        { status: 400 }
      );
    }

    // Validate UUIDs and datetime format
    const queryData = {
      professional_id: professionalId,
      service_type_id: serviceTypeId,
      start_time: startTime,
      end_time: endTime,
      exclude_appointment_id: excludeAppointmentId,
    };

    const validatedData = validateSlotSchema.parse(queryData);

    // Call validation function
    const { data: validationResult, error: validationError } =
      await supabase.rpc('sp_validate_appointment_slot', {
        p_clinic_id: profile.clinic_id,
        p_professional_id: validatedData.professional_id,
        p_service_type_id: validatedData.service_type_id,
        p_start_time: validatedData.start_time,
        p_end_time: validatedData.end_time,
        p_exclude_appointment_id: validatedData.exclude_appointment_id || null,
      });

    if (validationError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationError.message,
        },
        { status: 500 }
      );
    }

    const result =
      typeof validationResult === 'string'
        ? JSON.parse(validationResult)
        : validationResult;

    return NextResponse.json({
      available: result.available,
      conflicts: result.conflicts || [],
      warnings: result.warnings || [],
      alternative_slots: result.alternative_slots || [],
      performance: {
        validation_time_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          validation_errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
        performance: {
          validation_time_ms: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
