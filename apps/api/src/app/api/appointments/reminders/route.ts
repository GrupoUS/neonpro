/**
 * Appointment Reminders API
 * 
 * Manages WhatsApp/SMS/Email reminders for healthcare appointments
 * with Brazilian compliance and LGPD consent validation.
 */

import { NextRequest } from 'next/server'
import { whatsappReminderService, type AppointmentReminder } from '../../../services/whatsapp-reminder-service'
import { createHealthcareResponse } from '../../../middleware/edge-runtime'
import { createClient } from '@supabase/supabase-js'

// Configure for edge runtime
export const runtime = 'edge'
export const regions = ['sao1', 'gru1']

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send reminder for specific appointment (POST)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { appointmentId, reminderType, language = 'pt-BR' } = body

    // Validate required fields
    if (!appointmentId || !reminderType) {
      return createHealthcareResponse({
        error: 'Missing required fields',
        required: ['appointmentId', 'reminderType']
      }, {
        status: 400,
        dataType: 'public'
      })
    }

    // Get appointment details with patient and clinic info
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patients!inner(
          id,
          name,
          phone,
          email,
          preferred_contact_method
        ),
        clinics!inner(
          id,
          name,
          address,
          phone
        ),
        doctors!inner(
          name
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return createHealthcareResponse({
        error: 'Appointment not found',
        appointmentId
      }, {
        status: 404,
        dataType: 'public'
      })
    }

    // Check if appointment is eligible for reminders
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return createHealthcareResponse({
        error: 'Appointment not eligible for reminders',
        status: appointment.status
      }, {
        status: 400,
        dataType: 'public'
      })
    }

    // Build reminder object
    const reminder: AppointmentReminder = {
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
      preferredChannel: appointment.patients.preferred_contact_method || 'whatsapp'
    }

    // Send reminder
    const result = await whatsappReminderService.sendAppointmentReminder(reminder)
    
    const processingTime = Date.now() - startTime

    return createHealthcareResponse({
      success: result.success,
      messageId: result.messageId,
      channel: result.deliveryStatus.channel,
      fallbackUsed: result.fallbackUsed,
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: result.success ? 200 : 500,
      dataType: 'public'
    })

  } catch (error) {
    console.error('Reminder send error:', error)
    
    const processingTime = Date.now() - startTime
    
    return createHealthcareResponse({
      error: 'Failed to send reminder',
      message: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      dataType: 'public'
    })
  }
}

/**
 * Send batch reminders for multiple appointments (POST to /batch)
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { appointmentIds, reminderType, language = 'pt-BR' } = body

    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return createHealthcareResponse({
        error: 'Invalid appointment IDs array'
      }, {
        status: 400,
        dataType: 'public'
      })
    }

    // Get all appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patients!inner(
          id,
          name,
          phone,
          email,
          preferred_contact_method
        ),
        clinics!inner(
          id,
          name,
          address,
          phone
        ),
        doctors!inner(
          name
        )
      `)
      .in('id', appointmentIds)
      .neq('status', 'cancelled')
      .neq('status', 'completed')

    if (appointmentsError) {
      throw appointmentsError
    }

    // Build reminder objects
    const reminders: AppointmentReminder[] = appointments.map(appointment => ({
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
      consentGiven: true,
      preferredChannel: appointment.patients.preferred_contact_method || 'whatsapp'
    }))

    // Send batch reminders
    const result = await whatsappReminderService.sendBatchReminders(reminders)
    
    const processingTime = Date.now() - startTime

    return createHealthcareResponse({
      batchResult: {
        total: reminders.length,
        success: result.success,
        failed: result.failed,
        successRate: `${Math.round((result.success / reminders.length) * 100)}%`
      },
      processingTime,
      timestamp: new Date().toISOString(),
      details: result.results
    }, {
      status: 200,
      dataType: 'public'
    })

  } catch (error) {
    console.error('Batch reminder error:', error)
    
    const processingTime = Date.now() - startTime
    
    return createHealthcareResponse({
      error: 'Failed to send batch reminders',
      message: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      dataType: 'public'
    })
  }
}

/**
 * Get reminder statistics for clinic (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clinicId = url.searchParams.get('clinicId')
    const days = parseInt(url.searchParams.get('days') || '30')

    if (!clinicId) {
      return createHealthcareResponse({
        error: 'Missing clinic ID parameter'
      }, {
        status: 400,
        dataType: 'public'
      })
    }

    // Get delivery statistics
    const stats = await whatsappReminderService.getDeliveryStatistics(clinicId, days)

    return createHealthcareResponse({
      clinicId,
      period: `${days} days`,
      statistics: stats,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      dataType: 'public',
      cacheControl: 'private, max-age=300' // Cache for 5 minutes
    })

  } catch (error) {
    console.error('Statistics retrieval error:', error)
    
    return createHealthcareResponse({
      error: 'Failed to retrieve statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      dataType: 'public'
    })
  }
}

export async function OPTIONS(request: NextRequest) {
  return createHealthcareResponse({}, {
    status: 200,
    dataType: 'public'
  })
}