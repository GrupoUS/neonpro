import { createServer } from 'http'

// Simple Edge server for benchmarking
const port = 3000

const handler = async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const path = url.pathname
  const method = req.method
  
  // Set common headers
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // Mock data for benchmarking
  const mockData = {
    '/health': {
      status: 'healthy',
      runtime: 'edge',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      region: 'local',
      responseTime: 5
    },
    '/architecture/config': {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        clinic_id: '550e8400-e29b-41d4-a716-446655440000',
        config_json: { version: '1.0.0', features: ['edge_runtime', 'rls', 'caching'] },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      responseTime: 10,
      cached: false
    },
    '/performance/metrics': {
      success: true,
      data: [{
        id: '550e8400-e29b-41d4-a716-446655440001',
        clinic_id: '550e8400-e29b-41d4-a716-446655440000',
        metric_name: 'response_time',
        metric_value: 120.5,
        additional_metadata: { endpoint: '/health', timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      }],
      responseTime: 15,
      cached: false
    },
    '/compliance/status': {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        clinic_id: '550e8400-e29b-41d4-a716-446655440000',
        lgpd_compliant: true,
        anvisa_compliant: true,
        cfm_compliant: true,
        overall_score: 95.5,
        last_audit: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      responseTime: 8,
      cached: false
    },
    '/migration/state': {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        clinic_id: '550e8400-e29b-41d4-a716-446655440000',
        migration_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        progress: 100.0,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      responseTime: 12,
      cached: false
    },
    '/package-manager/config': {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        clinic_id: '550e8400-e29b-41d4-a716-446655440000',
        package_manager: 'bun',
        config_json: { version: '1.0.0', cache: true, production: false },
        created_at: new Date().toISOString()
      },
      responseTime: 7,
      cached: false
    },
    '/realtime/status': {
      status: 'active',
      subscriptions: 0,
      responseTime: 5
    },
    '/migration/start': {
      success: true,
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'started',
        options: { dry_run: true }
      },
      responseTime: 20,
      forwarded: false
    }
  }
  
  // Handle different routes
  if (mockData[path]) {
    if (method === 'GET') {
      res.writeHead(200)
      res.end(JSON.stringify(mockData[path]))
      return
    } else if (method === 'POST' && path === '/migration/start') {
      res.writeHead(200)
      res.end(JSON.stringify(mockData[path]))
      return
    }
  }
  
  // Return 404 for unknown routes
  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
}

const server = createServer(handler)

console.log(`Starting Edge server on port ${port}`)
server.listen(port, () => {
  console.log(`Edge server is running on http://localhost:${port}`)
})
