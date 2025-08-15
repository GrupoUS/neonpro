import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// =============================================
// NeonPro Conflict Override API
// Story 1.2: Manager conflict override system
// =============================================

interface ConflictOverrideRequest {
  appointment_id?: string;
  professional_id: string;
  clinic_id: string;
  patient_id: string;
  service_type_id: string;
  start_time: string;
  end_time: string;
  override_reason: string;
  conflicts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

interface ConflictOverrideResponse {
  success: boolean;
  appointment_id?: string;
  override_id?: string;
  warnings?: string[];
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ConflictOverrideRequest = await request.json();

    const {
      appointment_id,
      professional_id,
      clinic_id,
      patient_id,
      service_type_id,
      start_time,
      end_time,
      override_reason,
      conflicts,
    } = body;

    // Validate required fields
    if (
      !(
        professional_id &&
        clinic_id &&
        patient_id &&
        service_type_id &&
        start_time &&
        end_time &&
        override_reason &&
        conflicts.length
      )
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has manager permissions for this clinic
    const hasManagerPermission = await checkManagerPermissions(
      supabase,
      user.id,
      clinic_id
    );
    if (!hasManagerPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Manager access required.' },
        { status: 403 }
      );
    }

    // Start database transaction
    const { data: transactionResult, error: transactionError } =
      await supabase.rpc('handle_conflict_override', {
        p_appointment_id: appointment_id,
        p_professional_id: professional_id,
        p_clinic_id: clinic_id,
        p_patient_id: patient_id,
        p_service_type_id: service_type_id,
        p_start_time: start_time,
        p_end_time: end_time,
        p_override_reason: override_reason,
        p_conflicts: JSON.stringify(conflicts),
        p_manager_id: user.id,
        p_manager_email: user.email,
      });

    if (transactionError) {
      console.error('Error handling conflict override:', transactionError);
      return NextResponse.json(
        { error: 'Failed to process override request' },
        { status: 500 }
      );
    }

    // Send notifications
    await sendOverrideNotifications(
      supabase,
      transactionResult.appointment_id,
      professional_id,
      patient_id,
      user.email || 'Unknown Manager',
      override_reason,
      conflicts
    );

    const response: ConflictOverrideResponse = {
      success: true,
      appointment_id: transactionResult.appointment_id,
      override_id: transactionResult.override_id,
      warnings: transactionResult.warnings || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in conflict-override API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get override history for an appointment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointment_id');
    const clinicId = searchParams.get('clinic_id');

    if (!(appointmentId && clinicId)) {
      return NextResponse.json(
        { error: 'Missing appointment_id or clinic_id parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user access to this clinic
    const hasAccess = await checkClinicAccess(supabase, user.id, clinicId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch override history
    const { data: overrides, error } = await supabase
      .from('appointment_conflict_overrides')
      .select(
        `
        id,
        override_reason,
        conflicts,
        override_timestamp,
        manager_email,
        is_active,
        profiles!manager_id (
          full_name
        )
      `
      )
      .eq('appointment_id', appointmentId)
      .order('override_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching override history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch override history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ overrides: overrides || [] });
  } catch (error) {
    console.error('Error in conflict-override GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkManagerPermissions(
  supabase: any,
  userId: string,
  clinicId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('clinic_users')
    .select('role')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return false;
  }

  return ['admin', 'manager'].includes(data.role);
}

async function checkClinicAccess(
  supabase: any,
  userId: string,
  clinicId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('clinic_users')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single();

  return !error && data;
}

async function sendOverrideNotifications(
  supabase: any,
  appointmentId: string,
  professionalId: string,
  patientId: string,
  managerEmail: string,
  overrideReason: string,
  conflicts: any[]
) {
  try {
    // Get appointment details for notification
    const { data: appointment } = await supabase
      .from('appointments')
      .select(
        `
        start_time,
        end_time,
        profiles!patient_id (
          full_name,
          email,
          phone
        ),
        profiles!professional_id (
          full_name,
          email
        )
      `
      )
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      return;
    }

    const notifications = [
      {
        recipient_id: professionalId,
        recipient_email: appointment.profiles.email,
        type: 'conflict_override_professional',
        title: 'Agendamento com Override de Conflito',
        message: `Um gestor (${managerEmail}) autorizou um agendamento que possui conflitos. Motivo: ${overrideReason}`,
        data: {
          appointment_id: appointmentId,
          start_time: appointment.start_time,
          patient_name: appointment.profiles.full_name,
          conflicts,
          manager_email: managerEmail,
        },
      },
      {
        recipient_id: patientId,
        recipient_email: appointment.profiles.email,
        type: 'conflict_override_patient',
        title: 'Agendamento Confirmado com Exceção',
        message: `Seu agendamento foi confirmado mesmo com restrições. Profissional: ${appointment.profiles.full_name}`,
        data: {
          appointment_id: appointmentId,
          start_time: appointment.start_time,
          professional_name: appointment.profiles.full_name,
        },
      },
    ];

    // Insert notifications
    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending override notifications:', error);
    // Don't throw error - notifications are not critical
  }
}
