import { NextResponse } from 'next/server';
import type {
  BookingResponse,
  CreateAppointmentFormData,
} from '@/app/lib/types/appointments';
import { createClient } from '@/app/utils/supabase/server';
import { NeonProAutomation } from '@/lib/automation/trigger-jobs';

/**
 * 🚀 ENHANCED APPOINTMENTS API with Background Jobs
 *
 * Versão melhorada da API de appointments que automaticamente:
 * - Envia email de confirmação
 * - Agenda lembrete 24h antes
 * - Integra com sistema Trigger.dev
 *
 * Mantém 100% compatibilidade com API existente
 */

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error_message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the appointment data from request body
    const body: CreateAppointmentFormData = await request.json();

    // Validate required fields
    if (
      !(
        body.patient_id &&
        body.professional_id &&
        body.service_type_id &&
        body.start_time &&
        body.end_time
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error_message: 'Dados obrigatórios não fornecidos',
        },
        { status: 400 }
      );
    }

    // Get clinic_id from user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error_message: 'Perfil do usuário não encontrado' },
        { status: 400 }
      );
    }

    // ✨ ENHANCED: Get additional data for automation
    const [patientResult, professionalResult, serviceResult, clinicResult] =
      await Promise.all([
        supabase
          .from('patients')
          .select('full_name, email')
          .eq('id', body.patient_id)
          .single(),
        supabase
          .from('professionals')
          .select('name')
          .eq('id', body.professional_id)
          .single(),
        supabase
          .from('service_types')
          .select('name')
          .eq('id', body.service_type_id)
          .single(),
        supabase
          .from('clinics')
          .select('name')
          .eq('id', profile.clinic_id)
          .single(),
      ]);

    // Create the appointment (manter lógica original)
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: body.patient_id,
        professional_id: body.professional_id,
        service_type_id: body.service_type_id,
        appointment_date: body.start_time.split('T')[0], // Extract date
        appointment_time:
          body.start_time.split('T')[1]?.split('Z')[0] || body.start_time,
        end_time: body.end_time,
        status: 'confirmed', // ✨ ENHANCED: Auto-confirm with email
        notes: body.notes,
        clinic_id: profile.clinic_id,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return NextResponse.json(
        {
          success: false,
          error_message: 'Erro ao criar consulta',
          details: appointmentError.message,
        },
        { status: 500 }
      );
    }

    // ✨ ENHANCED: Trigger background jobs automaticamente
    let automationResults = null;

    try {
      if (
        patientResult.data?.email &&
        professionalResult.data?.name &&
        serviceResult.data?.name &&
        clinicResult.data?.name
      ) {
        console.log('🤖 Triggering appointment automation...');

        automationResults = await NeonProAutomation.onNewAppointmentCreated({
          appointmentId: appointment.id,
          patientEmail: patientResult.data.email,
          patientName: patientResult.data.full_name,
          clinicName: clinicResult.data.name,
          clinicId: profile.clinic_id,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          professionalName: professionalResult.data.name,
          serviceName: serviceResult.data.name,
        });

        console.log('✅ Appointment automation triggered successfully', {
          appointmentId: appointment.id,
          confirmationJobId: automationResults?.confirmation?.jobId,
          reminderJobId: automationResults?.reminder?.jobId,
        });
      }
    } catch (automationError) {
      // Log error but don't fail the appointment creation
      console.error('⚠️ Automation failed, but appointment was created', {
        appointmentId: appointment.id,
        error:
          automationError instanceof Error
            ? automationError.message
            : automationError,
      });
    }

    // Prepare response (compatível com API original)
    const response: BookingResponse = {
      success: true,
      appointment: {
        id: appointment.id,
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        service_type_id: appointment.service_type_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        notes: appointment.notes,
        created_at: appointment.created_at,
      },
      // ✨ ENHANCED: Include automation status
      automation: automationResults
        ? {
            confirmation_job_id: automationResults.confirmation?.jobId,
            reminder_job_id: automationResults.reminder?.jobId,
            status: 'triggered',
          }
        : {
            status: 'skipped',
            reason: 'missing_data_or_email',
          },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in enhanced appointments API:', error);
    return NextResponse.json(
      {
        success: false,
        error_message: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: List appointments with automation status
 * ✨ ENHANCED: Inclui status dos jobs de automação
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error_message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get clinic_id from user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error_message: 'Perfil do usuário não encontrado' },
        { status: 400 }
      );
    }

    // Query parameters
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
        professional_id,
        service_type_id,
        appointment_date,
        appointment_time,
        end_time,
        status,
        notes,
        created_at,
        confirmation_sent_at,
        reminder_sent_at,
        patients (
          full_name,
          email,
          phone
        ),
        professionals (
          name,
          specialty
        ),
        service_types (
          name,
          duration_minutes,
          price
        )
      `
      )
      .eq('clinic_id', profile.clinic_id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(limit);

    if (date) {
      query = query.eq('appointment_date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      return NextResponse.json(
        { success: false, error_message: 'Erro ao buscar consultas' },
        { status: 500 }
      );
    }

    // ✨ ENHANCED: Add automation status to each appointment
    const enhancedAppointments = appointments?.map((appointment) => ({
      ...appointment,
      automation_status: {
        confirmation_sent: Boolean(appointment.confirmation_sent_at),
        reminder_sent: Boolean(appointment.reminder_sent_at),
        confirmation_sent_at: appointment.confirmation_sent_at,
        reminder_sent_at: appointment.reminder_sent_at,
      },
    }));

    return NextResponse.json({
      success: true,
      appointments: enhancedAppointments,
      total: enhancedAppointments?.length || 0,
      has_automation: true, // ✨ Flag indicating enhanced API
    });
  } catch (error) {
    console.error('Error in enhanced appointments GET:', error);
    return NextResponse.json(
      {
        success: false,
        error_message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
