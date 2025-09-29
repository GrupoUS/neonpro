/**
 * Hybrid Router for NeonPro Architecture
 * Routes requests between Edge and Node runtimes based on operation type
 * 
 * Architecture:
 * - Edge Runtime: Read operations (GET), static content, health checks
 * - Node Runtime: Write operations (POST/PUT/DELETE), webhooks, background jobs
 * - Supabase Functions: Database operations, webhooks, scheduled jobs
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { createClient } from '@supabase/supabase-js'

// Import Edge and Node handlers
import edgeHandler from './edge'
import { nodeHandler } from './node'

const hybridApp = new Hono()

// Global CORS configuration
hybridApp.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://*.vercel.app',
    'https://neonpro.vercel.app'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info']
}))

// Health check endpoint (Edge-optimized)
hybridApp.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    architecture: 'hybrid',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      edge: '/api/* (read operations)',
      node: '/api/* (write operations)',
      supabase: 'Supabase Functions (database operations)'
    }
  })
})

// System metrics endpoint
hybridApp.get('/metrics', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // Get basic system metrics
    const [{ count: totalAppointments }, { count: activeClinics }] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ])

    return c.json({
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version
      },
      database: {
        total_appointments: totalAppointments || 0,
        active_clinics: activeClinics || 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return c.json({
      error: 'Failed to fetch metrics',
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version
      },
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Route requests based on HTTP method and path
hybridApp.all('/api/*', async (c) => {
  const method = c.req.method
  const path = c.req.path
  
  // Route to Edge runtime for read operations
  if (method === 'GET' && !path.includes('/webhooks')) {
    // Forward to Edge handler for read operations
    return handleEdgeRequest(c, path)
  }
  
  // Route to Node runtime for write operations
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    // Forward to Node handler for write operations
    return handleNodeRequest(c, path, method)
  }
  
  // Fallback to Edge for OPTIONS and other methods
  return handleEdgeRequest(c, path)
})

// Edge request handler (read operations)
async function handleEdgeRequest(c: any, path: string) {
  const edgeUrl = `${process.env.SUPABASE_URL}/functions/v1/edge-reads${path}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    'X-Client-Info': 'neonpro-hybrid-router'
  }
  
  try {
    const url = new URL(edgeUrl)
    
    // Forward query parameters
    const searchParams = new URLSearchParams(c.req.query())
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    const data = await response.json()
    
    return c.json(data, response.status)
  } catch (error) {
    console.error('Edge request failed:', error)
    return c.json({ 
      error: 'Edge service unavailable',
      path,
      timestamp: new Date().toISOString()
    }, 503)
  }
}

// Node request handler (write operations)
async function handleNodeRequest(c: any, path: string, method: string) {
  const nodeUrl = `${process.env.SUPABASE_URL}/functions/v1/node-writes${path}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'X-Client-Info': 'neonpro-hybrid-router',
    'CF-Connecting-IP': c.req.header('CF-Connecting-IP') || 'unknown',
    'User-Agent': c.req.header('User-Agent') || 'unknown'
  }
  
  try {
    const url = new URL(nodeUrl)
    
    // Forward query parameters
    const searchParams = new URLSearchParams(c.req.query())
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
    
    const body = method !== 'GET' ? await c.req.json() : null
    
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    const data = await response.json()
    
    return c.json(data, response.status)
  } catch (error) {
    console.error('Node request failed:', error)
    return c.json({ 
      error: 'Node service unavailable',
      path,
      method,
      timestamp: new Date().toISOString()
    }, 503)
  }
}

// Legacy route handlers for backward compatibility
hybridApp.get('/api/legacy/appointments', async (c) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(50)
    
    if (error) throw error
    
    return c.json({ data })
  } catch (error) {
    return c.json({ error: 'Failed to fetch appointments' }, 500)
  }
})

// Webhook handler (direct to Node runtime)
hybridApp.post('/webhooks/*', async (c) => {
  const path = c.req.path
  return handleNodeRequest(c, path, 'POST')
})

// Error handling middleware
hybridApp.onError((err, c) => {
  console.error('Hybrid router error:', err)
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString()
  }, 500)
})

// Not found handler
hybridApp.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString()
  }, 404)
})

export const hybridHandler = handle(hybridApp)

// Export for different environments
export default hybridHandler