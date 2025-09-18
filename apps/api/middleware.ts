/**
 * Next.js Middleware with Brazilian Healthcare Compliance
 * 
 * This middleware runs on Vercel Edge Runtime and enforces Brazilian healthcare
 * compliance for all API requests, including LGPD, CFM, and ANVISA requirements.
 */

import { NextRequest, NextResponse } from 'next/server'
import { brazilianHealthcareEdge } from './src/middleware/edge-runtime'

// Configure edge runtime
export const config = {
  matcher: [
    '/api/:path*',
    '/health/:path*',
    '/compliance/:path*'
  ],
  runtime: 'edge',
  regions: ['sao1', 'gru1'] // São Paulo and Guarulhos, Brazil only
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Validate edge runtime environment on startup
    if (process.env.NODE_ENV === 'production') {
      const { BrazilianHealthcareEdgeRuntime } = await import('./src/middleware/edge-runtime')
      BrazilianHealthcareEdgeRuntime.validateEdgeEnvironment()
    }
    
    // Apply Brazilian healthcare compliance
    const response = await brazilianHealthcareEdge.middleware(request)
    
    // Add performance metrics
    const responseTime = Date.now() - startTime
    response.headers.set('X-Edge-Processing-Time', `${responseTime}ms`)
    response.headers.set('X-Processed-At', new Date().toISOString())
    
    // Log compliance metrics
    if (process.env.NODE_ENV === 'development') {
      console.log(`Healthcare Edge Runtime: ${request.url} processed in ${responseTime}ms`)
    }
    
    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return compliance error with proper headers
    return new NextResponse(
      JSON.stringify({
        error: 'Healthcare compliance middleware failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Type': 'middleware-compliance-failure',
          'X-Processing-Time': `${Date.now() - startTime}ms`
        }
      }
    )
  }
}

/**
 * Export runtime configuration for Vercel
 */
export const runtime = 'edge'
export const regions = ['sao1', 'gru1']