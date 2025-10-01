import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router'
import { createContext } from './trpc/context'

const app = new Hono()

app.use('*', cors({
  origin: ['https://*.neonpro.com.br', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    region: process.env['VERCEL_REGION'] ?? 'local',
    timestamp: Date.now(),
  }),
)

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
