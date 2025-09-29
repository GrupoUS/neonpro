/**
 * Node Handler for NeonPro Architecture
 * Handles write operations in the Node Runtime
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { validator } from 'hono/validator'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schemas
const CreateAppointmentSchema = z.object({
  patient_id: z.string(),
  clinic_id: z.string(),
  service_id: z.string(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).optional(),
  payment_status: z.enum(['pending', 'paid', 'refunded', 'failed']).optional()
})

const UpdateAppointmentSchema = z.object({
  id: z.string(),
  patient_id: z.string().optional(),
  clinic_id: z.string().optional(),
  service_id: z.string().optional(),
  date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).optional(),
  payment_status: z.enum(['pending', 'paid', 'refunded', 'failed']).optional()
})

const CreatePatientSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  emergency_contact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional()
})

const nodeApp = new Hono()

// CORS configuration for Node runtime
nodeApp.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://*.vercel.app',
    'https://neonpro.vercel.app'
  ],
  credentials: true,
  allowMethods: ['POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info']
}))

// Health check endpoint
nodeApp.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'node',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  })
})

// Create appointment
nodeApp.post('/appointments', validator('json', CreateAppointmentSchema), async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const body = c.req.valid('json')
    
    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', body.clinic_id)
      .eq('date', body.date)
      .or(`(start_time.lt.${body.end_time},end_time.gt.${body.start_time})`)
      .eq('status', 'scheduled')

    if (conflictError) throw conflictError

    if (conflicts && conflicts.length > 0) {
      return c.json({ 
        error: 'Time slot conflict detected',
        conflicts 
      }, 409)
    }

    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: body.patient_id,
        clinic_id: body.clinic_id,
        service_id: body.service_id,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        notes: body.notes,
        status: body.status || 'scheduled',
        payment_status: body.payment_status || 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    return c.json({ 
      data,
      message: 'Appointment created successfully',
      runtime: 'node'
    })
  } catch (error) {
    console.error('Node create appointment error:', error)
    return c.json({ 
      error: 'Failed to create appointment',
      runtime: 'node'
    }, 500)
  }
})

// Update appointment
nodeApp.put('/appointments', validator('json', UpdateAppointmentSchema), async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const body = c.req.valid('json')
    const { id, ...updateData } = body

    // Check if appointment exists
    const { data: existing, error: findError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (findError) throw findError

    if (!existing) {
      return c.json({ error: 'Appointment not found' }, 404)
    }

    // Update appointment
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return c.json({ 
      data,
      message: 'Appointment updated successfully',
      runtime: 'node'
    })
  } catch (error) {
    console.error('Node update appointment error:', error)
    return c.json({ 
      error: 'Failed to update appointment',
      runtime: 'node'
    }, 500)
  }
})

// Delete appointment
nodeApp.delete('/appointments/:id', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const id = c.req.param('id')

    // Check if appointment exists
    const { data: existing, error: findError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (findError) throw findError

    if (!existing) {
      return c.json({ error: 'Appointment not found' }, 404)
    }

    // Delete appointment
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return c.json({ 
      message: 'Appointment deleted successfully',
      runtime: 'node'
    })
  } catch (error) {
    console.error('Node delete appointment error:', error)
    return c.json({ 
      error: 'Failed to delete appointment',
      runtime: 'node'
    }, 500)
  }
})

// Create patient
nodeApp.post('/patients', validator('json', CreatePatientSchema), async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const body = c.req.valid('json')
    
    // Check if email already exists
    const { data: existing, error: findError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existing) {
      return c.json({ error: 'Patient with this email already exists' }, 409)
    }

    // Create patient
    const { data, error } = await supabase
      .from('patients')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return c.json({ 
      data,
      message: 'Patient created successfully',
      runtime: 'node'
    })
  } catch (error) {
    console.error('Node create patient error:', error)
    return c.json({ 
      error: 'Failed to create patient',
      runtime: 'node'
    }, 500)
  }
})

// Stripe webhook handler
nodeApp.post('/webhooks/stripe', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const signature = c.req.header('stripe-signature')
    const payload = await c.req.text()

    // Verify webhook signature (you'll need to configure your Stripe webhook secret)
    // const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET!)
    // const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // For now, just log the event
    console.log('Stripe webhook received:', payload)

    // Handle different event types
    const event = JSON.parse(payload)
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update appointment payment status
        await supabase
          .from('appointments')
          .update({ payment_status: 'paid' })
          .eq('stripe_payment_intent_id', event.data.object.id)
        break
      
      case 'payment_intent.payment_failed':
        // Update appointment payment status
        await supabase
          .from('appointments')
          .update({ payment_status: 'failed' })
          .eq('stripe_payment_intent_id', event.data.object.id)
        break
      
      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return c.json({ error: 'Webhook handler failed' }, 500)
  }
})

// Error handling
nodeApp.onError((err, c) => {
  console.error('Node handler error:', err)
  
  return c.json({
    error: 'Node runtime error',
    message: err.message,
    runtime: 'node',
    timestamp: new Date().toISOString()
  }, 500)
})

// Not found handler
nodeApp.notFound((c) => {
  return c.json({
    error: 'Node endpoint not found',
    runtime: 'node',
    timestamp: new Date().toISOString()
  }, 404)
})

export const nodeHandler = nodeApp