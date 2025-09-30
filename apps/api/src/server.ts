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
			// Hono adapter passes an object like { req: Request }. Cast to the expected shape.
			return createContext(opts as { req?: Request })
		}
	})

	// Add a thin wrapper middleware that forwards to the tRPC adapter.
	// This keeps types happy (we define a Hono-compatible middleware) while
	// only casting inside the wrapper where necessary.
	const trpcMiddleware = async (c: Parameters<typeof app['fetch']>[0], next?: any) => {
		// Forward to the trpc handler. adapter may not have precise TS types, so cast locally.
		return await (trpcHandler as unknown as (arg: any, next?: any) => Promise<Response>)(c, next)
	}

	// Use the wrapper instead of passing the untyped handler directly.
	app.use('/trpc/*', trpcMiddleware)
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
      status: '/trpc/status',
      analysis: {
        start: '/trpc/analysis.startAnalysis',
        status: '/trpc/analysis.getAnalysisStatus',
        results: '/trpc/analysis.getAnalysisResults',
        list: '/trpc/analysis.listAnalyses',
        delete: '/trpc/analysis.deleteAnalysis'
      }
    },
    features: {
      healthcare_compliance: ['lgpd', 'anvisa', 'cfm'],
      real_time: true,
      edge_optimization: true,
      performance_monitoring: true,
      audit_trail: true,
      code_analysis: {
        hono_trpc_analysis: true,
        supabase_integration_analysis: true,
        architectural_violation_detection: true,
        healthcare_compliance_validation: true,
        performance_benchmarking: true,
        type_safety_analysis: true,
        edge_optimization_analysis: true,
        mobile_optimization: true,
        brazilian_healthcare_focus: true
      }
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
