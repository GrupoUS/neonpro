import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Hono } from 'https://esm.sh/hono@4.9.7'

const app = new Hono()

// CORS configuration for Edge Functions
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (c.req.method === 'OPTIONS') {
    return c.json({}, 200)
  }
  
  await next()
})

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    function: 'edge-reads'
  })
})

// Health check endpoint (legacy)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    function: 'edge-reads'
  })
})

// Get appointments (read-only, Edge-optimized)
app.get('/appointments', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  
  const clinicId = c.req.query('clinicId')
  const limit = parseInt(c.req.query('limit') || '50')
  
  if (!clinicId) {
    return c.json({ error: 'clinicId is required' }, 400)
  }
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(
          id,
          full_name,
          email,
          phone
        ),
        professional:profiles!appointments_professional_id_fkey(
          id,
          full_name,
          professional_type,
          license_number
        ),
        service:services(
          id,
          name,
          duration_minutes,
          price
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    
    return c.json({ 
      data,
      meta: {
        count: data.length,
        limit,
        clinicId
      }
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return c.json({ error: 'Failed to fetch appointments' }, 500)
  }
})

// Get clinic availability (read-only, cached)
app.get('/availability', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  
  const professionalId = c.req.query('professionalId')
  const date = c.req.query('date')
  
  if (!professionalId || !date) {
    return c.json({ error: 'professionalId and date are required' }, 400)
  }
  
  try {
    // Get existing appointments for the day
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('professional_id', professionalId)
      .eq('date(scheduled_at)', date)
      .in('status', ['scheduled', 'confirmed'])
    
    if (error) throw error
    
    // Calculate available slots (simplified logic)
    const workingHours = { start: 9, end: 18 } // 9 AM to 6 PM
    const slotDuration = 30 // 30 minutes
    
    const bookedSlots = appointments.map(apt => {
      const start = new Date(apt.scheduled_at)
      return {
        start: start.getHours(),
        end: start.getHours() + Math.ceil(apt.duration_minutes / 60)
      }
    })
    
    const availableSlots = []
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = hour + (minute / 60)
        const isBooked = bookedSlots.some(booked => 
          slotStart >= booked.start && slotStart < booked.end
        )
        
        if (!isBooked) {
          availableSlots.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: true
          })
        }
      }
    }
    
    return c.json({
      data: availableSlots,
      meta: {
        professionalId,
        date,
        workingHours,
        slotDuration
      }
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return c.json({ error: 'Failed to fetch availability' }, 500)
  }
})

// Get clinics (read-only, public info)
app.get('/clinics', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        address,
        phone,
        email,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    
    return c.json({ data })
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return c.json({ error: 'Failed to fetch clinics' }, 500)
  }
})

// Get services (read-only, public info)
app.get('/services', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  
  const clinicId = c.req.query('clinicId')
  
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
    
    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) throw error
    
    return c.json({ data })
  } catch (error) {
    console.error('Error fetching services:', error)
    return c.json({ error: 'Failed to fetch services' }, 500)
  }
})

serve(app.fetch, {
  port: 8000,
  onListen: ({ port }) => {
    console.log(`Edge reads function running on port ${port}`)
  }
})