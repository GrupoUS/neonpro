/**
 * API Server
 *
 * This file sets up the Hono server with tRPC middleware for the NeonPro platform API,
 * providing end-to-end type safety and healthcare compliance features.
 */

import { trpcServer } from '@trpc/server/adapters/hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { appRouter, createContext } from './router'

// Create Hono app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://neonpro.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Health check endpoint (before tRPC)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  })
})

// tRPC middleware
{
	// replace unsafe any-call with a function-typed cast to avoid "Unsafe call of a(n) `any` typed value"
	const trpcHandler = (trpcServer as unknown as (opts: {
		router: typeof appRouter,
		createContext: (opts: unknown) => Promise<unknown> | unknown
	}) => unknown)({
		router: appRouter,
		createContext: (opts: unknown) => {
			return createContext(opts)
		}
	})

	app.use('/trpc/*', trpcHandler)
}

// API info endpoint
app.get('/api/info', (c) => {
  return c.json({
    name: 'NeonPro API',
    description: 'Healthcare platform for aesthetic clinics in Brazil',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      trpc: '/trpc',
      architecture: '/trpc/architecture',
      migration: '/trpc/migration',
      system: '/trpc/system',
      status: '/trpc/status'
    },
    features: {
      healthcare_compliance: ['lgpd', 'anvisa', 'cfm'],
      real_time: true,
      edge_optimization: true,
      performance_monitoring: true,
      audit_trail: true
    }
  })
})

// Error handling middleware
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({
    error: {
      message: err.message || 'Internal Server Error',
      status: 500,
      timestamp: new Date().toISOString()
    }
  }, 500)
})

// Not found middleware
app.notFound((c) => {
  return c.json({
    error: {
      message: 'Endpoint not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  }, 404)
})

// For Bun runtime (single default export kept)
export default {
	port: 3001,
	fetch: app.fetch,
	websocket: app.websocket,
}

// Development server startup
if (import.meta.main) {
	console.log('🚀 NeonPro API Server starting on port 3001')
	console.log('📚 API Documentation: http://localhost:3001/api/info')
	console.log('🏥 Healthcare Compliance: LGPD, ANVISA, CFM')
	console.log('⚡ Runtime: Bun with Edge Optimization')
}
