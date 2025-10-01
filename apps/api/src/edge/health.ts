import { Hono } from 'hono'

/**
 * Edge Runtime Health Check Endpoint
 *
 * Provides health status for Edge runtime functions
 * - No sensitive data exposed
 * - Fast response time (<100ms)
 * - Suitable for monitoring and load balancing
 */

const app = new Hono()

app.get('/api/health', (c) => {
  const startTime = Date.now()

  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    region: process.env['VERCEL_REGION'] ?? 'local',
    responseTime: Date.now() - startTime,
  })
})

export default app
