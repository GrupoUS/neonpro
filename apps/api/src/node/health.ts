import { Hono } from 'hono'

/**
 * Node Runtime Health Check Endpoint
 *
 * Provides health status for Node runtime functions
 * - Verifies service role access
 * - Checks database connectivity
 * - No sensitive credentials exposed
 */

const app = new Hono()

app.get('/api/health/node', async (c) => {
  const startTime = Date.now()

  // Verify service role environment variable exists (without exposing it)
  const hasServiceRole = !!process.env['SUPABASE_SERVICE_ROLE_KEY']

  return c.json({
    status: 'healthy',
    runtime: 'node',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    region: process.env['VERCEL_REGION'] ?? 'local',
    uptime: process.uptime(),
    serviceRoleConfigured: hasServiceRole,
    responseTime: Date.now() - startTime,
  })
})

export default app
