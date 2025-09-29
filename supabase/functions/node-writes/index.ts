import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Hono } from 'https://esm.sh/hono@4.9.7'
import { validator } from 'https://esm.sh/hono@4.9.7/validator'
import * as v from 'https://esm.sh/valibot@1.0.0-beta.9'

const app = new Hono()

// Validation schemas
const CreateAppointmentSchema = v.object({
  patientId: v.string(),
  professionalId: v.string(),
  clinicId: v.string(),
  serviceId: v.string(),
  scheduledAt: v.string(),
  durationMinutes: v.number([v.minValue(15), v.maxValue(480)]),
  notes: v.optional(v.string([v.maxLength(1000)])),
  source: v.optional(v.picklist(['web', 'mobile', 'api', 'import']))
})

const UpdateAppointmentSchema = v.object({
  status: v.optional(v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])),
  notes: v.optional(v.string([v.maxLength(1000)])),
  professionalId: v.optional(v.string())
})

// CORS configuration
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (c.req.method === 'OPTIONS') {
    return c.json({}, 200)
  }
  
  await next()
})

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'node',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Create appointment (write operation)
app.post('/appointments', validator('json', CreateAppointmentSchema), async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const body = c.req.valid('json')
  
  try {
    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', body.professionalId)
      .eq('clinic_id', body.clinicId)
      .eq('date(scheduled_at)', body.scheduledAt.split('T')[0])
      .in('status', ['scheduled', 'confirmed'])
    
    if (conflictError) throw conflictError
    
    if (conflicts && conflicts.length > 0) {
      return c.json({ 
        error: 'Time slot not available',
        code: 'CONFLICT'
      }, 409)
    }
    
    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: body.patientId,
        professional_id: body.professionalId,
        clinic_id: body.clinicId,
        service_id: body.serviceId,
        scheduled_at: body.scheduledAt,
        duration_minutes: body.durationMinutes,
        notes: body.notes,
        status: 'scheduled',
        source: body.source || 'api',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'appointment_created',
        table_name: 'appointments',
        record_id: data.id,
        changes: body,
        user_id: 'system', // Should come from auth
        ip_address: c.req.header('CF-Connecting-IP') || 'unknown',
        user_agent: c.req.header('User-Agent') || 'unknown'
      })
    
    return c.json({ 
      data,
      message: 'Appointment created successfully'
    }, 201)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return c.json({ error: 'Failed to create appointment' }, 500)
  }
})

// Update appointment (write operation)
app.put('/appointments/:id', validator('json', UpdateAppointmentSchema), async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const appointmentId = c.req.param('id')
  const updates = c.req.valid('json')
  
  try {
    // Check if appointment exists and is modifiable
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (!existing) {
      return c.json({ error: 'Appointment not found' }, 404)
    }
    
    if (existing.status === 'completed' || existing.status === 'cancelled') {
      return c.json({ 
        error: 'Cannot modify completed or cancelled appointment',
        code: 'INVALID_STATE'
      }, 400)
    }
    
    // Update appointment
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()
    
    if (error) throw error
    
    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'appointment_updated',
        table_name: 'appointments',
        record_id: appointmentId,
        old_values: existing,
        new_values: updates,
        user_id: 'system', // Should come from auth
        ip_address: c.req.header('CF-Connecting-IP') || 'unknown',
        user_agent: c.req.header('User-Agent') || 'unknown'
      })
    
    return c.json({ 
      data,
      message: 'Appointment updated successfully'
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return c.json({ error: 'Failed to update appointment' }, 500)
  }
})

// Cancel appointment (write operation)
app.delete('/appointments/:id', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const appointmentId = c.req.param('id')
  const reason = c.req.query('reason') || 'Cancelled by user'
  
  try {
    // Check if appointment exists and is cancellable
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (!existing) {
      return c.json({ error: 'Appointment not found' }, 404)
    }
    
    if (existing.status === 'completed' || existing.status === 'cancelled') {
      return c.json({ 
        error: 'Appointment already completed or cancelled',
        code: 'INVALID_STATE'
      }, 400)
    }
    
    // Cancel appointment
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()
    
    if (error) throw error
    
    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'appointment_cancelled',
        table_name: 'appointments',
        record_id: appointmentId,
        changes: { reason },
        user_id: 'system', // Should come from auth
        ip_address: c.req.header('CF-Connecting-IP') || 'unknown',
        user_agent: c.req.header('User-Agent') || 'unknown'
      })
    
    return c.json({ 
      data,
      message: 'Appointment cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return c.json({ error: 'Failed to cancel appointment' }, 500)
  }
})

// Webhook handler for external integrations
app.post('/webhooks/stripe', async (c) => {
  const payload = await c.req.json()
  const signature = c.req.header('stripe-signature')
  
  // Verify Stripe webhook signature (simplified)
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400)
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Handle different Stripe events
    switch (payload.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(supabase, payload.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(supabase, payload.data.object)
        break
      default:
        console.log('Unhandled Stripe event:', payload.type)
    }
    
    return c.json({ received: true })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return c.json({ error: 'Failed to process webhook' }, 500)
  }
})

// Background job handlers
async function handlePaymentSuccess(supabase: any, payment: any) {
  console.log('Processing successful payment:', payment.id)
  
  // Update appointment payment status
  if (payment.metadata.appointment_id) {
    await supabase
      .from('appointments')
      .update({ 
        payment_status: 'paid',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.metadata.appointment_id)
  }
  
  // Create transaction record
  await supabase
    .from('financial_transactions')
    .insert({
      appointment_id: payment.metadata.appointment_id,
      amount: payment.amount / 100, // Convert from cents
      currency: payment.currency,
      status: 'completed',
      payment_method: 'stripe',
      external_id: payment.id,
      created_at: new Date().toISOString()
    })
}

async function handlePaymentFailure(supabase: any, payment: any) {
  console.log('Processing failed payment:', payment.id)
  
  // Update appointment payment status
  if (payment.metadata.appointment_id) {
    await supabase
      .from('appointments')
      .update({ 
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.metadata.appointment_id)
  }
}

Deno.serve(app.fetch)