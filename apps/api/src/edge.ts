/**
 * Edge Handler for NeonPro Architecture
 * Handles read operations in the Edge Runtime
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

const edgeApp = new Hono()

// CORS configuration for Edge runtime
edgeApp.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://*.vercel.app',
    'https://neonpro.vercel.app'
  ],
  credentials: true,
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info']
}))

// Health check endpoint
edgeApp.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  })
})

// Appointments endpoint (read-only)
edgeApp.get('/appointments', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clinic:clinics(*),
        service:services(*),
        patient:patients(*)
      `)
      .order('date', { ascending: true })
      .limit(100)

    if (error) throw error

    return c.json({ 
      data,
      metadata: {
        count: data.length,
        runtime: 'edge'
      }
    })
  } catch (error) {
    console.error('Edge appointments error:', error)
    return c.json({ 
      error: 'Failed to fetch appointments',
      runtime: 'edge'
    }, 500)
  }
})

// Availability endpoint
edgeApp.get('/availability', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const clinicId = c.req.query('clinic_id')
    const date = c.req.query('date')

    let query = supabase
      .from('availability')
      .select('*')

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }
    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query.order('start_time', { ascending: true })

    if (error) throw error

    return c.json({ 
      data,
      metadata: {
        count: data.length,
        runtime: 'edge'
      }
    })
  } catch (error) {
    console.error('Edge availability error:', error)
    return c.json({ 
      error: 'Failed to fetch availability',
      runtime: 'edge'
    }, 500)
  }
})

// Clinics endpoint
edgeApp.get('/clinics', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return c.json({ 
      data,
      metadata: {
        count: data.length,
        runtime: 'edge'
      }
    })
  } catch (error) {
    console.error('Edge clinics error:', error)
    return c.json({ 
      error: 'Failed to fetch clinics',
      runtime: 'edge'
    }, 500)
  }
})

// Services endpoint
edgeApp.get('/services', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return c.json({ 
      data,
      metadata: {
        count: data.length,
        runtime: 'edge'
      }
    })
  } catch (error) {
    console.error('Edge services error:', error)
    return c.json({ 
      error: 'Failed to fetch services',
      runtime: 'edge'
    }, 500)
  }
})

// Patients endpoint (read-only)
edgeApp.get('/patients', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return c.json({ 
      data,
      metadata: {
        count: data.length,
        runtime: 'edge'
      }
    })
  } catch (error) {
    console.error('Edge patients error:', error)
    return c.json({ 
      error: 'Failed to fetch patients',
      runtime: 'edge'
    }, 500)
  }
})

// Error handling
edgeApp.onError((err, c) => {
  console.error('Edge handler error:', err)
  
  return c.json({
    error: 'Edge runtime error',
    message: err.message,
    runtime: 'edge',
    timestamp: new Date().toISOString()
  }, 500)
})

// Not found handler
edgeApp.notFound((c) => {
  return c.json({
    error: 'Edge endpoint not found',
    runtime: 'edge',
    timestamp: new Date().toISOString()
  }, 404)
})

export default edgeApp