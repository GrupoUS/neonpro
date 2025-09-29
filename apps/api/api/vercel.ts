import { Hono } from 'hono'
import { handle } from 'hono/vercel'

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

export default handle(app)