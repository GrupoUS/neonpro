/**
 * Simple entry point for Vercel deployment
 * Basic Edge Function to demonstrate the deployment works
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    message: 'NeonPro API is running successfully!'
  })
})

// Basic API info endpoint
app.get('/', (c) => {
  return c.json({
    name: 'NeonPro API',
    version: '2.0.0',
    description: 'Edge-optimized healthcare platform for Brazilian aesthetic clinics',
    endpoints: {
      health: '/health',
      api: '/api/*'
    },
    timestamp: new Date().toISOString()
  })
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

export default handle(app)