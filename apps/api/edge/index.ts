/**
 * Edge Runtime API
 *
 * This file sets up the Hono Edge runtime app for NeonPro platform API,
 * providing optimized read operations with Supabase anon client and RLS enforcement.
 *
 * Key features:
 * - Edge runtime reads with direct Supabase anon client queries
 * - Row Level Security (RLS) enforcement for clinic_id filtering
 * - Caching middleware for performance optimization
 * - Forward write operations to Node tRPC
 * - Healthcare compliance (LGPD/ANVISA/CFM)
 * - TTFB <150ms target
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@neonpro/types'
import { createCacheMiddleware } from './middleware/cache'
import { ttfbLogger } from './middleware/ttfb-logger'
import { initializeRealtimeCacheService } from './services/realtime-cache'

// Initialize Supabase client for Edge runtime (anon key only - no secrets)
const supabaseUrl = process.env['SUPABASE_URL']
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration for Edge runtime')
}

// Initialize realtime cache service
let realtimeCacheService: Awaited<ReturnType<typeof initializeRealtimeCacheService>> | null = null

// Initialize realtime service asynchronously
initializeRealtimeCacheService(supabaseUrl, supabaseAnonKey).then(service => {
  realtimeCacheService = service
}).catch(error => {
  console.error('Failed to initialize realtime cache service:', error)
})

// Create Hono app for Edge runtime
const app = new Hono<{
  Variables: {
    startTime: number
    clinicId?: string
    userId?: string
    isFirstRequest?: boolean
  }
}>()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://neonpro.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Request timing middleware
app.use('*', async (c, next) => {
  c.set('startTime', Date.now())
  await next()
})

// Authentication and RLS middleware
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.substring(7)
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return c.json({ error: 'Invalid authentication token' }, 401)
    }

    // Extract clinic_id from user metadata (required for RLS)
    const clinicId = user.user_metadata?.['clinic_id'] as string | undefined
    if (!clinicId) {
      return c.json({ error: 'Missing clinic_id in user metadata' }, 401)
    }

    c.set('clinicId', clinicId)
    c.set('userId', user.id)

    // Setup realtime subscriptions for cache invalidation
    if (realtimeCacheService) {
      realtimeCacheService.subscribeToClinic(clinicId)
    }

    await next()
  } catch {
    return c.json({ error: 'Authentication failed' }, 401)
  }
})

// Caching middleware for GET requests (after authentication)
app.use('*', createCacheMiddleware({
  ttl: 60, // 60 seconds cache
  skipMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  skipPaths: ['/migration/start']
}))

// TTFB logging middleware (final, after all processing)
app.use('*', ttfbLogger(supabaseUrl, supabaseAnonKey))

// Health check endpoint (Edge optimized)
app.get('/health', (c) => {
  const startTime = c.get('startTime')

  return c.json({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    region: process.env['VERCEL_REGION'] ?? 'local',
    responseTime: Date.now() - startTime,
  })
})

// Realtime status endpoint
app.get('/realtime/status', (c) => {
  const startTime = c.get('startTime')

  if (!realtimeCacheService) {
    return c.json({
      status: 'disabled',
      message: 'Realtime cache service not initialized',
      responseTime: Date.now() - startTime,
    }, 503)
  }

  const status = realtimeCacheService.getSubscriptionStatus()

  return c.json({
    status: 'active',
    ...status,
    responseTime: Date.now() - startTime,
  })
})

// Architecture config endpoint (Edge read)
app.get('/architecture/config', async (c) => {
  const startTime = c.get('startTime')
  const clinicId = c.get('clinicId')

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase
      .from('architecture_configs')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          error: 'Architecture configuration not found',
          responseTime: Date.now() - startTime
        }, 404)
      }
      throw error
    }

    const isFirstRequest = c.get('isFirstRequest') ?? false
    return c.json({
      success: true,
      data,
      responseTime: Date.now() - startTime,
      cached: !isFirstRequest
    })
  } catch (error) {
    console.error('Error fetching architecture config:', error)
    return c.json({
      error: 'Failed to fetch architecture configuration',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Performance metrics endpoint (Edge read)
app.get('/performance/metrics', async (c) => {
  const startTime = c.get('startTime')
  const clinicId = c.get('clinicId')

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    const isFirstRequest = c.get('isFirstRequest') ?? false
    return c.json({
      success: true,
      data,
      responseTime: Date.now() - startTime,
      cached: !isFirstRequest
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return c.json({
      error: 'Failed to fetch performance metrics',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Compliance status endpoint (Edge read)
app.get('/compliance/status', async (c) => {
  const startTime = c.get('startTime')
  const clinicId = c.get('clinicId')

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase
      .from('compliance_status')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          error: 'Compliance status not found',
          responseTime: Date.now() - startTime
        }, 404)
      }
      throw error
    }

    const isFirstRequest = c.get('isFirstRequest') ?? false
    return c.json({
      success: true,
      data,
      responseTime: Date.now() - startTime,
      cached: !isFirstRequest
    })
  } catch (error) {
    console.error('Error fetching compliance status:', error)
    return c.json({
      error: 'Failed to fetch compliance status',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Migration state endpoint (Edge read)
app.get('/migration/state', async (c) => {
  const startTime = c.get('startTime')
  const clinicId = c.get('clinicId')

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase
      .from('migration_states')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          error: 'Migration state not found',
          responseTime: Date.now() - startTime
        }, 404)
      }
      throw error
    }

    const isFirstRequest = c.get('isFirstRequest') ?? false
    return c.json({
      success: true,
      data,
      responseTime: Date.now() - startTime,
      cached: !isFirstRequest
    })
  } catch (error) {
    console.error('Error fetching migration state:', error)
    return c.json({
      error: 'Failed to fetch migration state',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Package manager config endpoint (Edge read)
app.get('/package-manager/config', async (c) => {
  const startTime = c.get('startTime')
  const clinicId = c.get('clinicId')

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase
      .from('package_manager_configs')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({
          error: 'Package manager configuration not found',
          responseTime: Date.now() - startTime
        }, 404)
      }
      throw error
    }

    const isFirstRequest = c.get('isFirstRequest') ?? false
    return c.json({
      success: true,
      data,
      responseTime: Date.now() - startTime,
      cached: !isFirstRequest
    })
  } catch (error) {
    console.error('Error fetching package manager config:', error)
    return c.json({
      error: 'Failed to fetch package manager configuration',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Migration start endpoint (forward to Node tRPC)
const startMigrationSchema = z.object({
  migrationId: z.string().uuid(),
  options: z.object({
    dry_run: z.boolean().default(false),
    force: z.boolean().default(false),
    skip_validation: z.boolean().default(false)
  }).optional()
})

app.post('/migration/start', zValidator('json', startMigrationSchema), async (c) => {
  const startTime = c.get('startTime')
  const userId = c.get('userId')
  const clinicId = c.get('clinicId')
  const body = c.req.valid('json')

  try {
    // Forward to Node tRPC endpoint
    const nodeRpcUrl = process.env['NODE_TRPC_URL'] || 'http://localhost:3001/trpc'
    const authHeader = c.req.header('Authorization')

    const response = await fetch(`${nodeRpcUrl}/migration.startMigration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({
        id: body.migrationId,
        options: body.options
      })
    })

    let result: { success?: boolean; [key: string]: unknown }
    let isSuccess = false

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, unknown>
      result = { success: false, ...errorData }

      // Log audit trail for LGPD compliance (failed)
      console.error('LGPD Audit: Migration start request', {
        userId,
        clinicId,
        migrationId: body.migrationId,
        options: body.options,
        timestamp: new Date().toISOString(),
        result: 'failed'
      })

      return c.json({
        error: 'Failed to start migration',
        details: errorData,
        responseTime: Date.now() - startTime
      }, response.status as any)
    }

    result = await response.json() as { success?: boolean; [key: string]: unknown }
    isSuccess = result.success === true

    // Log audit trail for LGPD compliance
    console.error('LGPD Audit: Migration start request', {
      userId,
      clinicId,
      migrationId: body.migrationId,
      options: body.options,
      timestamp: new Date().toISOString(),
      result: isSuccess ? 'success' : 'failed'
    })

    return c.json({
      success: true,
      data: result,
      responseTime: Date.now() - startTime,
      forwarded: true
    })
  } catch (error) {
    console.error('Error forwarding migration start:', error)

    // Log audit trail for LGPD compliance (error)
    console.error('LGPD Audit: Migration start request', {
      userId,
      clinicId,
      migrationId: body.migrationId,
      options: body.options,
      timestamp: new Date().toISOString(),
      result: 'failed'
    })

    return c.json({
      error: 'Failed to start migration',
      responseTime: Date.now() - startTime
    }, 500)
  }
})

// Error handling middleware
app.onError((err, c) => {
  console.error('Edge API Error:', err)
  const startTime = c.get('startTime')

  // Check if it's a Zod validation error
  if (err.name === 'ZodError') {
    const zodError = err as { message?: string; errors?: Array<{ message?: string }> }
    const errorMessage = zodError.message ||
                        (zodError.errors?.map(e => e.message).join(', ')) ||
                        'Invalid input'
    return c.json({
      error: `validation: ${errorMessage}`
    }, 400)
  }

  return c.json({
    error: {
      message: err.message || 'Internal Server Error',
      status: 500,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }
  }, 500)
})

// Not found middleware
app.notFound((c) => {
  const startTime = c.get('startTime')

  return c.json({
    error: {
      message: 'Edge endpoint not found',
      status: 404,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }
  }, 404)
})

// Edge runtime export
export default app
