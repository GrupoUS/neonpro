/**
 * Simple API for Vercel deployment
 * This demonstrates the hybrid architecture working
 */

import { Hono } from 'hono'

const app = new Hono()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    message: 'NeonPro API is running successfully!',
    architecture: 'hybrid',
    components: {
      edge_functions: 'https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/edge-reads',
      node_functions: 'https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/node-writes',
      database: 'Supabase PostgreSQL'
    }
  })
})

// API info endpoint
app.get('/', (c) => {
  return c.json({
    name: 'NeonPro API',
    version: '2.0.0',
    description: 'Edge-optimized healthcare platform for Brazilian aesthetic clinics',
    architecture: 'Hybrid (Edge + Node + Supabase Functions)',
    endpoints: {
      health: '/health',
      api: '/api/*',
      docs: '/docs'
    },
    features: [
      'Edge Runtime for read operations',
      'Node Runtime for write operations',
      'Supabase Functions for database operations',
      'Healthcare compliance (LGPD, ANVISA, CFM)',
      'Brazilian data residency'
    ],
    timestamp: new Date().toISOString()
  })
})

// Proxy to Edge Functions
app.get('/api/edge/*', async (c) => {
  const path = c.req.path.replace('/api/edge', '')
  const edgeUrl = `https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/edge-reads${path}`
  
  try {
    const response = await fetch(edgeUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E'}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    return c.json(data, response.status)
  } catch (error) {
    return c.json({
      error: 'Edge function unavailable',
      path,
      timestamp: new Date().toISOString()
    }, 503)
  }
})

// Proxy to Node Functions
app.post('/api/node/*', async (c) => {
  const path = c.req.path.replace('/api/node', '')
  const nodeUrl = `https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/node-writes${path}`
  
  try {
    const body = await c.req.json()
    const response = await fetch(nodeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjE5MzQ0MDgwMH0.OzKSTbggA8h3F0O8g0hC9x4V3YqK5Q6X8W9YcXbZd0'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return c.json(data, response.status)
  } catch (error) {
    return c.json({
      error: 'Node function unavailable',
      path,
      timestamp: new Date().toISOString()
    }, 503)
  }
})

// Error handling
app.onError((err, c) => {
  console.error('API error:', err)
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500)
})

// Not found handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    timestamp: new Date().toISOString()
  }, 404)
})

export default app