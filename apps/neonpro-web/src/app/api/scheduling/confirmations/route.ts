import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { schedulingTemplateEngine } from '@/lib/communication/scheduling-templates'
import { SchedulingCommunicationWorkflow } from '@/lib/communication/scheduling-workflow'
import { CommunicationService } from '@/lib/communication/communication-service'
import { NoShowPredictor } from '@/lib/communication/no-show-predictor'

// Schema validation for confirmation requests
const ConfirmationRequestSchema = z.object({
  appointmentId: z.string().uuid(),
  sendTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default('09:00'), // HH:MM format
  timeoutHours: z.number().min(1).max(72).default(24),
  channels: z.array(z.enum(['sms', 'email', 'whatsapp'])).default(['whatsapp']),
  enableEscalation: z.boolean().default(true),
  escalationChannels: z.array(z.enum(['sms', 'email', 'whatsapp'])).default(['sms']),
  customMessage: z.string().optional(),
  useWorkflow: z.boolean().default(true),
  useNoShowPrediction: z.boolean().default(true)
})

const ConfirmationResponseSchema = z.object({
  confirmationToken: z.string(),
  response: z.enum(['confirmed', 'cancelled', 'reschedule']),
  rescheduleDate: z.string().optional(),
  rescheduleTime: z.string().optional(),
  notes: z.string().optional()
})

const BulkConfirmationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clinicId: z.string().uuid(),
  sendTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  timeoutHours: z.number().min(1).max(72).default(24),
  channels: z.array(z.enum(['sms', 'email', 'whatsapp'])).default(['whatsapp']),
  useWorkflow: z.boolean().default(true)
})

/**
 * POST /api/scheduling/confirmations
 * Schedule appointment confirmation requests using intelligent workflow
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ConfirmationRequestSchema.parse(body)

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(*),
        professionals(*),
        services(*),
        clinics(*)
      `)
      .eq('id', validatedData.appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if confirmation already exists
    const { data: existingConfirmation } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('appointment_id', validatedData.appointmentId)
      .neq('status', 'expired')
      .single()

    if (existingConfirmation) {
      return NextResponse.json({
        error: 'Confirmation request already exists',
        existing: existingConfirmation
      }, { status: 409 })
    }

    // Use intelligent workflow by default
    if (validatedData.useWorkflow) {
      try {
        const workflowConfig = {
          confirmationSettings: {
            enableConfirmationRequests: true,
            sendTime: validatedData.sendTime,
            timeoutHours: validatedData.timeoutHours,
            escalationChannels: validatedData.escalationChannels
          },
          noShowPrevention: {
            enabled: validatedData.useNoShowPrediction,
            probabilityThreshold: 0.6, // Lower threshold for confirmations
            interventionTiming: '2h',
            specialHandling: true
          }
        }

        const workflow = new SchedulingCommunicationWorkflow()
        const workflows = await workflow.initializeWorkflows(
          validatedData.appointmentId,
          workflowConfig
        )

        const confirmationWorkflow = workflows.find(w => w.workflowType === 'confirmation')

        if (confirmationWorkflow) {
          return NextResponse.json({
            success: true,
            method: 'workflow',
            workflowId: confirmationWorkflow.id,
            confirmationToken: confirmationWorkflow.metadata.confirmationToken,
            scheduledAt: confirmationWorkflow.scheduledAt,
            steps: confirmationWorkflow.steps.length,
            message: 'Confirmation workflow scheduled'
          })
        }
      } catch (workflowError) {
        console.error('Workflow error, falling back to legacy method:', workflowError)
        // Fall through to legacy method
      }
    }

    // Legacy confirmation method
    return await handleLegacyConfirmation(supabase, validatedData, appointment, user)

  } catch (error) {
    console.error('Error in POST /api/scheduling/confirmations:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Handle legacy confirmation creation
 */
async function handleLegacyConfirmation(
  supabase: any, 
  data: z.infer<typeof ConfirmationRequestSchema>, 
  appointment: any, 
  user: any
) {
  // Generate confirmation token
  const confirmationToken = generateConfirmationToken()
  
  // Calculate send time (day before appointment at specified time)
  const appointmentDate = new Date(appointment.date)
  const [hours, minutes] = data.sendTime.split(':').map(Number)
  const sendAt = new Date(appointmentDate)
  sendAt.setDate(sendAt.getDate() - 1) // Day before
  sendAt.setHours(hours, minutes, 0, 0)

  // Calculate expiration time
  const expiresAt = new Date(sendAt.getTime() + data.timeoutHours * 60 * 60 * 1000)

  // Get no-show prediction if enabled
  let noShowPrediction = null
  if (data.useNoShowPrediction) {
    try {
      const predictor = new NoShowPredictor()
      noShowPrediction = await predictor.predict(data.appointmentId)
    } catch (error) {
      console.error('Error getting no-show prediction:', error)
    }
  }

  // Create confirmation record
  const { data: confirmationRecord, error: insertError } = await supabase
    .from('appointment_confirmations')
    .insert({
      appointment_id: data.appointmentId,
      patient_id: appointment.patient_id,
      clinic_id: appointment.clinic_id,
      confirmation_token: confirmationToken,
      send_at: sendAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      channels: data.channels,
      escalation_channels: data.escalationChannels,
      custom_message: data.customMessage,
      no_show_prediction: noShowPrediction,
      timeout_hours: data.timeoutHours,
      enable_escalation: data.enableEscalation,
      status: 'pending',
      created_by: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating confirmation:', insertError)
    throw new Error('Failed to create confirmation request')
  }

  return NextResponse.json({
    success: true,
    method: 'legacy',
    confirmation: confirmationRecord,
    confirmationToken,
    sendAt,
    expiresAt,
    message: 'Confirmation request scheduled'
  })
}

/**
 * PUT /api/scheduling/confirmations
 * Handle patient responses to confirmation requests
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const validatedData = ConfirmationResponseSchema.parse(body)

    // Find confirmation by token
    const { data: confirmation, error: confirmationError } = await supabase
      .from('appointment_confirmations')
      .select(`
        *,
        appointments(*),
        patients(*),
        clinics(*)
      `)
      .eq('confirmation_token', validatedData.confirmationToken)
      .single()

    if (confirmationError || !confirmation) {
      return NextResponse.json({ error: 'Invalid confirmation token' }, { status: 404 })
    }

    // Check if confirmation has expired
    if (new Date() > new Date(confirmation.expires_at)) {
      return NextResponse.json({ error: 'Confirmation request has expired' }, { status: 410 })
    }

    // Check if already responded
    if (confirmation.status !== 'pending') {
      return NextResponse.json({
        error: 'Already responded to this confirmation',
        currentResponse: confirmation.status
      }, { status: 409 })
    }

    // Update confirmation with response
    const updateData: any = {
      status: validatedData.response,
      response_date: new Date().toISOString(),
      response_notes: validatedData.notes
    }

    // Handle reschedule requests
    if (validatedData.response === 'reschedule' && validatedData.rescheduleDate && validatedData.rescheduleTime) {
      updateData.reschedule_requested_date = validatedData.rescheduleDate
      updateData.reschedule_requested_time = validatedData.rescheduleTime
    }

    const { error: updateError } = await supabase
      .from('appointment_confirmations')
      .update(updateData)
      .eq('id', confirmation.id)

    if (updateError) {
      console.error('Error updating confirmation:', updateError)
      return NextResponse.json({ error: 'Failed to update confirmation' }, { status: 500 })
    }

    // Update appointment status based on response
    let appointmentStatus = confirmation.appointments.status
    if (validatedData.response === 'confirmed') {
      appointmentStatus = 'confirmed'
    } else if (validatedData.response === 'cancelled') {
      appointmentStatus = 'cancelled'
    } else if (validatedData.response === 'reschedule') {
      appointmentStatus = 'reschedule_requested'
    }

    if (appointmentStatus !== confirmation.appointments.status) {
      await supabase
        .from('appointments')
        .update({
          status: appointmentStatus,
          confirmation_status: validatedData.response,
          updated_at: new Date().toISOString()
        })
        .eq('id', confirmation.appointment_id)
    }

    // Send notification to clinic staff
    try {
      const communicationService = new CommunicationService()
      
      let notificationMessage = ''
      switch (validatedData.response) {
        case 'confirmed':
          notificationMessage = `✅ Consulta confirmada: ${confirmation.patients.name} - ${new Date(confirmation.appointments.date).toLocaleDateString('pt-BR')}`
          break
        case 'cancelled':
          notificationMessage = `❌ Consulta cancelada: ${confirmation.patients.name} - ${new Date(confirmation.appointments.date).toLocaleDateString('pt-BR')}`
          break
        case 'reschedule':
          notificationMessage = `🔄 Reagendamento solicitado: ${confirmation.patients.name} - ${new Date(confirmation.appointments.date).toLocaleDateString('pt-BR')}`
          if (validatedData.rescheduleDate) {
            notificationMessage += ` → Nova data: ${validatedData.rescheduleDate}`
          }
          break
      }

      // Send to clinic notification channels (implementation depends on clinic preferences)
      // This could be integrated with clinic staff notification system
      
    } catch (notificationError) {
      console.error('Error sending clinic notification:', notificationError)
      // Don't fail the response for notification errors
    }

    return NextResponse.json({
      success: true,
      response: validatedData.response,
      appointmentId: confirmation.appointment_id,
      message: `Appointment ${validatedData.response}`,
      nextSteps: getNextSteps(validatedData.response)
    })

  } catch (error) {
    console.error('Error in PUT /api/scheduling/confirmations:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/scheduling/confirmations
 * Get confirmation requests with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const clinicId = searchParams.get('clinicId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const confirmationToken = searchParams.get('token')

    // Handle single token lookup (public endpoint for patient responses)
    if (confirmationToken) {
      const { data: confirmation, error: tokenError } = await supabase
        .from('appointment_confirmations')
        .select(`
          *,
          appointments(*),
          patients(name),
          professionals(name),
          services(name),
          clinics(name, address, phone)
        `)
        .eq('confirmation_token', confirmationToken)
        .single()

      if (tokenError || !confirmation) {
        return NextResponse.json({ error: 'Invalid confirmation token' }, { status: 404 })
      }

      // Check if expired
      const isExpired = new Date() > new Date(confirmation.expires_at)

      return NextResponse.json({
        success: true,
        confirmation: {
          ...confirmation,
          expired: isExpired
        }
      })
    }

    // Query confirmations with filters
    let query = supabase
      .from('appointment_confirmations')
      .select(`
        *,
        appointments(*),
        patients(name, phone, email),
        clinics(name)
      `)

    if (appointmentId) {
      query = query.eq('appointment_id', appointmentId)
    }
    
    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('send_at', startOfDay.toISOString())
        .lte('send_at', endOfDay.toISOString())
    }

    const { data: confirmations, error: queryError } = await query
      .order('send_at', { ascending: true })

    if (queryError) {
      console.error('Error fetching confirmations:', queryError)
      return NextResponse.json({ error: 'Failed to fetch confirmations' }, { status: 500 })
    }

    // Add expiration status to each confirmation
    const confirmationsWithStatus = confirmations?.map(conf => ({
      ...conf,
      expired: new Date() > new Date(conf.expires_at),
      timeRemaining: Math.max(0, new Date(conf.expires_at).getTime() - Date.now())
    })) || []

    return NextResponse.json({
      success: true,
      confirmations: confirmationsWithStatus,
      count: confirmationsWithStatus.length,
      summary: {
        pending: confirmationsWithStatus.filter(c => c.status === 'pending' && !c.expired).length,
        confirmed: confirmationsWithStatus.filter(c => c.status === 'confirmed').length,
        cancelled: confirmationsWithStatus.filter(c => c.status === 'cancelled').length,
        reschedule: confirmationsWithStatus.filter(c => c.status === 'reschedule').length,
        expired: confirmationsWithStatus.filter(c => c.expired).length
      }
    })

  } catch (error) {
    console.error('Error in GET /api/scheduling/confirmations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/scheduling/confirmations
 * Cancel/expire confirmation requests
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const confirmationId = searchParams.get('id')
    const appointmentId = searchParams.get('appointmentId')

    if (!confirmationId && !appointmentId) {
      return NextResponse.json({ error: 'Either confirmationId or appointmentId required' }, { status: 400 })
    }

    let query = supabase
      .from('appointment_confirmations')
      .update({
        status: 'expired',
        expired_by: user.id,
        expired_at: new Date().toISOString()
      })

    if (confirmationId) {
      query = query.eq('id', confirmationId)
    } else {
      query = query.eq('appointment_id', appointmentId)
    }

    const { data: updated, error: updateError } = await query.select()

    if (updateError) {
      console.error('Error expiring confirmations:', updateError)
      return NextResponse.json({ error: 'Failed to expire confirmations' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      expired: updated?.length || 0,
      message: `Expired ${updated?.length || 0} confirmation(s)`
    })

  } catch (error) {
    console.error('Error in DELETE /api/scheduling/confirmations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Helper functions
 */
function generateConfirmationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function getNextSteps(response: string): string[] {
  switch (response) {
    case 'confirmed':
      return [
        'Sua consulta está confirmada',
        'Você receberá um lembrete antes do horário',
        'Em caso de imprevistos, entre em contato com a clínica'
      ]
    case 'cancelled':
      return [
        'Sua consulta foi cancelada',
        'Você pode reagendar quando desejar',
        'Entre em contato com a clínica para mais informações'
      ]
    case 'reschedule':
      return [
        'Solicitação de reagendamento enviada',
        'A clínica entrará em contato para confirmar nova data',
        'Aguarde o retorno da equipe'
      ]
    default:
      return []
  }
}
