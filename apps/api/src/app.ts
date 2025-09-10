import { Hono } from 'hono'
import auth from '@/routes/auth'
import patients from '@/routes/patients'
import appointments from '@/routes/appointments'

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

app.get('/health', (c) =>
  c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
)

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

export { app }
