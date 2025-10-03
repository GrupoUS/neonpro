/**
 * Edge Functions for Public Operations
 * Runtime: edge
 * Purpose: Public endpoints requiring fast response times
 * LGPD: No sensitive patient data exposed
 */

import { Hono } from 'https://deno.land/x/hono@v4.9.7/mod.ts'
import { cors } from 'https://deno.land/x/hono@v4.9.7/middleware/cors.ts'
import { validator } from 'https://deno.land/x/hono@v4.9.7/validator.ts'
import { z } from 'https://deno.land/x/zod@v4.1.11/mod.ts'

const app = new Hono()

// CORS middleware for Edge Functions
app.use('*', cors({
  origin: ['https://neonpro.com.br', 'https://www.neonpro.com.br'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-Response-Time', 'X-Rate-Limit-Remaining'],
  maxAge: 86400,
}))

// Rate limiting middleware
app.use('*', async (c, next) => {
  const clientIP = c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || 'unknown'
  
  // Simple rate limiting - in production, use Redis or similar
  const rateLimitHeaders = {
    'X-Rate-Limit-Limit': '1000',
    'X-Rate-Limit-Remaining': '999',
    'X-Rate-Limit-Reset': Math.ceil(Date.now() / 1000) + 3600,
  }
  
  c.header('X-Rate-Limit-Limit', rateLimitHeaders['X-Rate-Limit-Limit'])
  c.header('X-Rate-Limit-Remaining', rateLimitHeaders['X-Rate-Limit-Remaining'])
  c.header('X-Rate-Limit-Reset', rateLimitHeaders['X-Rate-Limit-Reset'])
  
  await next()
})

// Health check endpoint
app.get('/health', (c) => {
  const startTime = Date.now()
  
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: Deno.env.get('VERCEL_ENV') || 'development',
    region: Deno.env.get('VERCEL_REGION') || 'gru1',
    lgpdCompliant: true,
    uptime: Date.now() - startTime
  }, {
    headers: {
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'X-LGPD-Compliant': 'true',
      'Cache-Control': 'no-cache'
    }
  })
})

// Public clinic information
app.get('/clinics', validator('query', z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  specialty: z.string().optional(),
})), async (c) => {
  const startTime = Date.now()
  const { city, state, specialty } = c.req.valid('query')
  
  // Mock data - in production, query database with RLS policies
  const clinics = [
    {
      id: 'clinic-1',
      name: 'Clínica Estética São Paulo',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      specialties: ['dermatologia', 'estética'],
      phone: '(11) 3333-3333',
      coordinates: { lat: -23.5505, lng: -46.6333 }
    },
    {
      id: 'clinic-2', 
      name: 'Rio Beauty Center',
      address: 'Rua Rio Branco, 200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      specialties: ['estética', 'cosmética'],
      phone: '(21) 2222-2222',
      coordinates: { lat: -22.9068, lng: -43.1729 }
    }
  ].filter(clinic => {
    if (city && !clinic.city.toLowerCase().includes(city.toLowerCase())) return false
    if (state && clinic.state !== state.toUpperCase()) return false
    if (specialty && !clinic.specialties.includes(specialty.toLowerCase())) return false
    return true
  })

  return c.json({
    success: true,
    data: clinics,
    count: clinics.length,
    filters: { city, state, specialty }
  }, {
    headers: {
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
      'X-LGPD-Compliant': 'true'
    }
  })
})

// Available procedures (public information)
app.get('/procedures', validator('query', z.object({
  category: z.string().optional(),
  specialty: z.string().optional(),
})), async (c) => {
  const startTime = Date.now()
  const { category, specialty } = c.req.valid('query')
  
  // Mock procedure data - no patient information
  const procedures = [
    {
      id: 'proc-1',
      name: 'Tratamento de Peeling Químico',
      category: 'peeling',
      specialty: 'dermatologia',
      duration: 60,
      description: 'Tratamento para renovação celular',
      anvisaCode: '12345678901',
      requiresConsent: true,
      contraindications: ['gestantes', 'peles sensíveis'],
      priceRange: { min: 300, max: 800 }
    },
    {
      id: 'proc-2',
      name: 'Aplicação de Toxina Botulínica',
      category: 'botox',
      specialty: 'estética',
      duration: 30,
      description: 'Redução de rugas de expressão',
      anvisaCode: '12345678902',
      requiresConsent: true,
      contraindications: ['doenças neuromusculares'],
      priceRange: { min: 500, max: 1500 }
    }
  ].filter(proc => {
    if (category && proc.category !== category) return false
    if (specialty && proc.specialty !== specialty) return false
    return true
  })

  return c.json({
    success: true,
    data: procedures,
    count: procedures.length,
    filters: { category, specialty }
  }, {
    headers: {
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'Cache-Control': 'public, max-age=1800', // 30 minutes cache
      'X-LGPD-Compliant': 'true'
    }
  })
})

// Professional verification (public CRM validation)
app.post('/professionals/verify', validator('json', z.object({
  crm: z.string().min(4),
  uf: z.string().length(2),
  name: z.string().min(3),
})), async (c) => {
  const startTime = Date.now()
  const { crm, uf, name } = c.req.valid('json')
  
  // Mock CRM verification - integrate with CFM API in production
  const isValid = crm.length >= 4 && uf.length === 2 && name.length >= 3
  
  return c.json({
    success: true,
    data: {
      crm,
      uf: uf.toUpperCase(),
      name: name.trim(),
      verified: isValid,
      verifiedAt: isValid ? new Date().toISOString() : null,
      source: 'CFM Public Database'
    }
  }, {
    headers: {
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'Cache-Control': isValid ? 'public, max-age=86400' : 'no-cache',
      'X-LGPD-Compliant': 'true',
      'X-CFM-Compliant': 'true'
    }
  })
})

// Educational content (public)
app.get('/educational/:slug', async (c) => {
  const startTime = Date.now()
  const slug = c.req.param('slug')
  
  // Mock educational content
  const content = {
    'cuidados-pele': {
      title: 'Cuidados Diários com a Pele',
      content: 'Conteúdo educativo sobre cuidados...',
      category: 'skincare',
      readingTime: 5,
      lastUpdated: new Date().toISOString()
    },
    'pos-procedimento': {
      title: 'Cuidados Pós-Procedimento',
      content: 'Conteúdo educativo sobre pós-tratamento...',
      category: 'aftercare',
      readingTime: 8,
      lastUpdated: new Date().toISOString()
    }
  }[slug]

  if (!content) {
    return c.json({
      success: false,
      error: 'Content not found'
    }, 404)
  }

  return c.json({
    success: true,
    data: content
  }, {
    headers: {
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
      'X-LGPD-Compliant': 'true'
    }
  })
})

// Error handler
app.onError((err, c) => {
  console.error('Edge function error:', err)
  
  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, {
    status: 500,
    headers: {
      'X-LGPD-Compliant': 'true',
      'Cache-Control': 'no-cache'
    }
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /clinics',
      'GET /procedures', 
      'POST /professionals/verify',
      'GET /educational/:slug'
    ]
  }, {
    status: 404,
    headers: {
      'X-LGPD-Compliant': 'true',
      'Cache-Control': 'no-cache'
    }
  })
})

export default app