/**
 * Appointment Reminders API
 *
 * Manages WhatsApp/SMS/Email reminders for healthcare appointments
 * with Brazilian compliance and LGPD consent validation.
 */

import { NextRequest } from 'next/server';
import type { Database } from '../../../../../packages/database/src/types/supabase';
import { createAdminClient } from '../../../../lib/supabase/client';
import { createHealthcareResponse } from '../../../../middleware/edge-runtime';
import {
  type AppointmentReminder,
  whatsappReminderService,
} from '../../../../services/whatsapp-reminder-service';

// Configure for edge runtime
export const runtime = 'edge';

// Type for the appointment query result with joined tables
type AppointmentWithRelations = Database['public']['Tables']['appointments']['Row'] & {
  patients: Database['public']['Tables']['patients']['Row'];
  clinics: Database['public']['Tables']['clinics']['Row'];
  doctors: Database['public']['Tables']['doctors']['Row'];
};

/**
 * Send reminder for specific appointment (POST)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { appointmentId, reminderType, language = 'pt-BR' } = body;

    // Validate required fields
    if (!appointmentId || !reminderType) {
      return createHealthcareResponse(
        {
          error: 'Missing required fields',
          required: ['appointmentId', 'reminderType'],
        },
        {
          status: 400,
          dataType: 'public',
        },
      );
    }

    // Create admin client for service operations
    const supabase = createAdminClient();

    // Get appointment details with patient and clinic info
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        patients!inner(*),
        clinics!inner(*),
        doctors!inner(*)
      `,
      )
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return createHealthcareResponse(
        {
          error: 'Appointment not found',
          appointmentId,
        },
        {
          status: 404,
          dataType: 'public',
        },
      );
    }

    // Type assertion for the appointment data
    const typedAppointment = appointment as AppointmentWithRelations;

    // Check if appointment is eligible for reminders
    if (
      typedAppointment.status === 'cancelled'
      || typedAppointment.status === 'completed'
    ) {
      return createHealthcareResponse(
        {
          error: 'Appointment not eligible for reminders',
          status: typedAppointment.status,
        },
        {
          status: 400,
          dataType: 'public',
        },
      );
    }

    // Build reminder object
    const reminder: AppointmentReminder = {
      appointmentId: typedAppointment.id,
      patientId: typedAppointment.patients.id,
      clinicId: typedAppointment.clinics.id,
      doctorName: typedAppointment.doctors.name,
      appointmentDate: typedAppointment.appointment_date,
      appointmentTime: typedAppointment.appointment_time,
      clinicName: typedAppointment.clinics.name,
      clinicAddress: typedAppointment.clinics.address,
      patientName: typedAppointment.patients.name,
      patientPhone: typedAppointment.patients.phone,
      reminderType,
      language,
      consentGiven: true, // Will be validated by the service
      preferredChannel: typedAppointment.patients.preferred_contact_method || 'whatsapp',
    };

    // Send reminder
    const result = await whatsappReminderService.sendAppointmentReminder(reminder);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        success: result.success,
        messageId: result.messageId,
        channel: result.deliveryStatus.channel,
        fallbackUsed: result.fallbackUsed,
        processingTime: processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: result.success ? 200 : 500,
        dataType: 'public',
      },
    );
  } catch (error) {
    console.error('Reminder send error:', error);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        error: 'Failed to send reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        dataType: 'public',
      },
    );
  }
}

/**
 * Send bulk reminders for multiple appointments (PUT)
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { appointmentIds, reminderType, language = 'pt-BR' } = body;

    // Validate required fields
    if (
      !appointmentIds
      || !Array.isArray(appointmentIds)
      || appointmentIds.length === 0
      || !reminderType
    ) {
      return createHealthcareResponse(
        {
          error: 'Missing required fields',
          required: ['appointmentIds (array)', 'reminderType'],
        },
        {
          status: 400,
          dataType: 'public',
        },
      );
    }

    // Create admin client for service operations
    const supabase = createAdminClient();

    // Get all appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        patients!inner(*),
        clinics!inner(*),
        doctors!inner(*)
      `,
      )
      .in('id', appointmentIds)
      .neq('status', 'cancelled')
      .neq('status', 'completed');

    if (appointmentsError) {
      throw appointmentsError;
    }

    // Type assertion for the appointments data
    const typedAppointments = appointments as AppointmentWithRelations[];

    // Build reminder objects
    const reminders: AppointmentReminder[] = typedAppointments.map(
      appointment => ({
        appointmentId: appointment.id,
        patientId: appointment.patients.id,
        clinicId: appointment.clinics.id,
        doctorName: appointment.doctors.name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        clinicName: appointment.clinics.name,
        clinicAddress: appointment.clinics.address,
        patientName: appointment.patients.name,
        patientPhone: appointment.patients.phone,
        reminderType,
        language,
        consentGiven: true, // Will be validated by the service
        preferredChannel: appointment.patients.preferred_contact_method || 'whatsapp',
      }),
    );

    // Send bulk reminders
    const results = await whatsappReminderService.sendBulkReminders(reminders);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        success: true,
        totalSent: results.length,
        results: results.map(r => ({
          appointmentId: r.appointmentId,
          success: r.success,
          messageId: r.messageId,
          channel: r.deliveryStatus.channel,
          fallbackUsed: r.fallbackUsed,
        })),
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        dataType: 'public',
      },
    );
  } catch (error) {
    console.error('Bulk reminder send error:', error);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        error: 'Failed to send bulk reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        dataType: 'public',
      },
    );
  }
}

/**
 * Get reminder status for appointments (GET)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');

    if (!appointmentId && !patientId) {
      return createHealthcareResponse(
        {
          error: 'Missing required parameter',
          required: 'appointmentId OR patientId',
        },
        {
          status: 400,
          dataType: 'public',
        },
      );
    }

    // Create admin client for service operations
    const supabase = createAdminClient();

    // Get reminder history
    let query = supabase
      .from('reminder_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (appointmentId) {
      query = query.eq('appointment_id', appointmentId);
    } else if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data: reminders, error: remindersError } = await query;

    if (remindersError) {
      throw remindersError;
    }

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        reminders: reminders || [],
        count: reminders?.length || 0,
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        dataType: 'public',
      },
    );
  } catch (error) {
    console.error('Get reminder status error:', error);

    const processingTime = Date.now() - startTime;

    return createHealthcareResponse(
      {
        error: 'Failed to get reminder status',
        message: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        dataType: 'public',
      },
    );
  }
}

export async function OPTIONS() {
  return createHealthcareResponse(
    {},
    {
      status: 200,
      dataType: 'public',
    },
  );
}
