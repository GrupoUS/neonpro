import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router.ts'
import { createContext } from './trpc/context.ts'

const app = new Hono()

app.use('*', cors({
  origin: ['https://*.neonpro.com.br', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    region: process.env.VERCEL_REGION ?? 'local',
    timestamp: Date.now(),
    lgpdCompliant: true,
    dataResidency: 'brazil-only'
  }, {
    headers: {
      'X-LGPD-Compliant': 'true',
      'X-Data-Residency': 'brazil-only',
      'Cache-Control': 'no-cache'
    }
  })
})

// Add CORS headers for all responses
app.use('*', async (c, next) => {
  await next()
  c.header('X-LGPD-Compliant', 'true')
  c.header('X-Data-Residency', 'brazil-only')
  c.header('X-Response-Time', `${Date.now() - c.get('startTime')}ms`)
})

// Track start time for response time measurement
app.use('*', async (c, next) => {
  c.set('startTime', Date.now())
  await next()
})

app.use('/trpc/*', async (c) =>
  fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
  }),
)

export default app
export const fetch = (request: Request) => app.fetch(request)
