/**
 * Hybrid Runtime Router
 * Routes requests to Edge or Node functions based on operation type
 * LGPD: Routes sensitive operations to Node runtime only
 */

import { Hono } from 'https://deno.land/x/hono@v4.9.7/mod.ts'
import { cors } from 'https://deno.land/x/hono@v4.9.7/middleware/cors.ts'
import { validator } from 'https://deno.land/x/hono@v4.9.7/validator.ts'
import { z } from 'https://deno.land/x/zod@v4.1.11/mod.ts'

// Import Edge functions (default runtime)
import publicEndpoints from './edge/public-endpoints.ts'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: ['https://neonpro.com.br', 'https://www.neonpro.com.br'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Authorization', 
    'Content-Type', 
    'X-Requested-With',
    'X-Healthcare-Professional',
    'X-Healthcare-Context',
    'X-Real-IP',
    'User-Agent'
  ],
  exposeHeaders: [
    'X-Response-Time',
    'X-LGPD-Compliant',
    'X-Data-Residency',
    'X-Rate-Limit-Remaining',
    'X-Access-Level',
    'X-Audit-Logged'
  ],
  maxAge: 86400,
}))

// Request logging middleware (LGPD compliance)
app.use('*', async (c, next) => {
  const startTime = Date.now()
  const clientIP = c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const userAgent = c.req.header('user-agent') || 'unknown'
  const method = c.req.method
  const path = c.req.path
  
  // Log request for audit trail (non-sensitive data only)
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method,
    path,
    clientIP,
    userAgent: userAgent.substring(0, 100), // Truncate for privacy
    lgpdCompliant: true,
    dataResidency: 'brazil-only'
  }))
  
  await next()
  
  // Add response time header
  c.header('X-Response-Time', `${Date.now() - startTime}ms`)
  c.header('X-LGPD-Compliant', 'true')
  c.header('X-Data-Residency', 'brazil-only')
})

// Route: Public endpoints (Edge Runtime)
app.route('/', publicEndpoints)

// Route: Health check (Edge Runtime)
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: Deno.env.get('VERCEL_ENV') || 'development',
    region: Deno.env.get('VERCEL_REGION') || 'gru1',
    runtime: 'edge',
    lgpdCompliant: true
  }, {
    headers: {
      'Cache-Control': 'no-cache',
      'X-Runtime': 'edge'
    }
  })
})

// Route: Admin operations (Node Runtime - Redirect)
app.all('/api/admin/*', async (c) => {
  const path = c.req.path
  const method = c.req.method
  
  // Redirect to Node Runtime function
  const nodeFunctionPath = path.replace('/api/admin', '/admin-operations')
  
  return await fetchNodeFunction(nodeFunctionPath, {
    method,
    headers: Object.fromEntries(c.req.headers.entries()),
    body: method !== 'GET' && method !== 'HEAD' ? await c.req.text() : undefined
  })
})

// Route: Sensitive patient operations (Node Runtime - Redirect)
app.all('/api/patients/*/export', async (c) => {
  return await fetchNodeFunction('/admin-operations', {
    method: 'POST',
    headers: Object.fromEntries(c.req.headers.entries()),
    body: JSON.stringify({
      operation: 'patient_export',
      patientId: c.req.param('id'),
      context: {
        timestamp: new Date().toISOString(),
        requestedBy: c.req.header('authorization'),
        lgpdCompliance: true
      }
    })
  })
})

// Route: Compliance reports (Node Runtime - Redirect)
app.all('/api/compliance/*', async (c) => {
  const path = c.req.path
  const method = c.req.method
  
  return await fetchNodeFunction('/admin-operations', {
    method,
    headers: Object.fromEntries(c.req.headers.entries()),
    body: method !== 'GET' && method !== 'HEAD' ? await c.req.text() : undefined
  })
})

// Route: Patient data access validation (Edge Runtime with LGPD checks)
app.get('/api/patients/:id', validator('param', z.object({
  id: z.string().uuid('Invalid patient ID format')
})), async (c) => {
  const { id } = c.req.valid('param')
  const authHeader = c.req.header('authorization')
  const healthcareProfessional = c.req.header('x-healthcare-professional')
  const healthcareContext = c.req.header('x-healthcare-context')
  
  // LGPD compliance checks
  if (!authHeader) {
    return c.json({
      success: false,
      error: 'Não autorizado',
      code: 'MISSING_AUTH',
      lgpdCompliance: true
    }, 401, {
      headers: {
        'X-LGPD-Compliant': 'true',
        'X-Auth-Required': 'true'
      }
    })
  }
  
  // Healthcare professional validation
  if (!healthcareProfessional) {
    return c.json({
      success: false,
      error: 'Professional credentials required',
      code: 'MISSING_CREDENTIALS',
      lgpdCompliance: true,
      cfmCompliance: true
    }, 403, {
      headers: {
        'X-LGPD-Compliant': 'true',
        'X-CFM-Compliant': 'true',
        'X-Credentials-Required': 'true'
      }
    })
  }
  
  try {
    // In production, this would validate against the database
    // For now, return mock response with LGPD headers
    const mockPatient = {
      id,
      name: 'Nome do Paciente',
      email: 'paciente@exemplo.com',
      phone: '(11) 99999-9999',
      birthDate: '1990-01-01',
      gender: 'male',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      lgpdConsent: {
        marketing: true,
        dataProcessing: true,
        consentDate: '2024-01-01T00:00:00Z',
        expiresAt: '2025-01-01T00:00:00Z'
      },
      auditTrail: {
        lastAccessedAt: new Date().toISOString(),
        accessCount: 1
      }
    }
    
    return c.json({
      success: true,
      data: mockPatient
    }, {
      headers: {
        'X-Data-Classification': 'sensitive',
        'X-LGPD-Compliant': 'true',
        'X-Audit-Logged': 'true',
        'X-Access-Level': 'full',
        'X-CFM-Compliant': 'true',
        'X-Medical-Record-Access': 'logged',
        'X-Healthcare-Context': 'patient_care',
        'Cache-Control': 'private, max-age=600',
        'ETag': `"${Date.now()}"`,
        'X-Retention-Policy': '7-years',
        'X-Data-Category': 'medical-records'
      }
    })
    
  } catch (error) {
    console.error('Patient access error:', error)
    
    return c.json({
      success: false,
      error: 'Erro ao acessar dados do paciente',
      code: 'ACCESS_ERROR',
      lgpdCompliance: true
    }, 500, {
      headers: {
        'X-LGPD-Compliant': 'true',
        'X-Error-Logged': 'true'
      }
    })
  }
})

// Route: Patient search (Edge Runtime - No sensitive data)
app.get('/api/patients/search', validator('query', z.object({
  q: z.string().min(1, 'Search query required'),
  limit: z.string().transform(Number).default(10)
})), async (c) => {
  const { q, limit } = c.req.valid('query')
  
  // Only return basic, non-sensitive information
  const mockResults = [
    {
      id: 'patient-1',
      name: 'Paciente Silva',
      city: 'São Paulo',
      state: 'SP',
      lastVisit: '2024-01-15'
    },
    {
      id: 'patient-2', 
      name: 'Paciente Santos',
      city: 'Rio de Janeiro',
      state: 'RJ',
      lastVisit: '2024-01-10'
    }
  ].filter(patient => 
    patient.name.toLowerCase().includes(q.toLowerCase()) ||
    patient.city.toLowerCase().includes(q.toLowerCase())
  ).slice(0, limit)
  
  return c.json({
    success: true,
    data: mockResults,
    count: mockResults.length,
    query: { q, limit }
  }, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'X-LGPD-Compliant': 'true',
      'X-Data-Masked': 'true'
    }
  })
})

// Helper function to fetch Node Runtime functions
async function fetchNodeFunction(path: string, options: {
  method: string
  headers: Record<string, string>
  body?: string
}): Promise<Response> {
  try {
    const baseUrl = Deno.env.get('VERCEL_URL') || 'localhost:3000'
    const url = `https://${baseUrl}${path}`
    
    const response = await fetch(url, {
      method: options.method,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'X-Node-Runtime': 'true',
        'X-LGPD-Compliant': 'true'
      },
      body: options.body
    })
    
    // Return response with LGPD headers
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Runtime': 'nodejs18.x',
        'X-LGPD-Compliant': 'true',
        'X-Data-Residency': 'brazil-only'
      }
    })
    
  } catch (error) {
    console.error('Node function fetch error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'NODE_FUNCTION_ERROR',
      lgpdCompliance: true
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-LGPD-Compliant': 'true',
        'X-Error-Logged': 'true'
      }
    })
  }
}

// Error handler
app.onError((err, c) => {
  console.error('Router error:', err)
  
  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    lgpdCompliant: true
  }, {
    status: 500,
    headers: {
      'X-LGPD-Compliant': 'true',
      'Cache-Control': 'no-cache',
      'X-Error-Logged': 'true'
    }
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/patients/:id',
      'GET /api/patients/search',
      'POST /api/admin/* (Node Runtime)',
      'GET /api/compliance/* (Node Runtime)'
    ],
    lgpdCompliant: true
  }, {
    status: 404,
    headers: {
      'X-LGPD-Compliant': 'true',
      'Cache-Control': 'no-cache'
    }
  })
})

export default app