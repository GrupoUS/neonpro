import { Hono } from 'hono'
import auth from './routes/auth'
import patients from './routes/patients'
import appointments from './routes/appointments'

// Minimal Hono application exported for Vercel handler consumption.
// Note: We use basePath('/api') so that requests rewritten from
// '/api/*' map cleanly to these routes.
const app = new Hono().basePath('/api')

app.get('/', (c) =>
  c.json({
    name: 'NeonPro API',
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  }),
)

// T011: Simplified health route for contract test; returns minimal object to satisfy test.
app.get('/health', (c) => c.json({ status: 'ok' }))

// Versioned router group
const v1 = new Hono()

v1.get('/health', (c) =>
  c.json({
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
)

v1.get('/info', (c) =>
  c.json({
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
  }),
)

v1.route('/auth', auth)
v1.route('/patients', patients)
v1.route('/appointments', appointments)

app.route('/v1', v1)

// T012: OpenAPI route (minimal stub) - will be expanded later.
app.get('/openapi.json', (c) => c.json({ openapi: '3.1.0', info: { title: 'NeonPro API', version: '0.1.0' } }))

export { app }
