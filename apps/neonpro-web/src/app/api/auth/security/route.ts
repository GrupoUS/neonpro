// =====================================================
// Security Events API Routes
// Story 1.4: Session Management & Security
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { UnifiedSessionSystem } from '@/lib/auth/session'
import { z } from 'zod'

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const securityEventSchema = z.object({
  type: z.enum([
    'login_attempt',
    'login_success',
    'login_failure',
    'logout',
    'session_expired',
    'session_extended',
    'device_registered',
    'device_trusted',
    'device_untrusted',
    'device_removed',
    'device_reported_suspicious',
    'suspicious_activity',
    'security_violation',
    'password_changed',
    'email_changed',
    'profile_updated',
    'permission_changed',
    'data_export',
    'data_deletion',
    'api_abuse',
    'rate_limit_exceeded',
    'unauthorized_access',
    'malicious_request'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1).max(1000),
  metadata: z.record(z.any()).optional()
})

const queryEventsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  resolved: z.boolean().optional()
})

const resolveEventSchema = z.object({
  eventId: z.string().uuid(),
  resolution: z.string().min(1).max(500),
  metadata: z.record(z.any()).optional()
})

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return '127.0.0.1'
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown'
}

async function initializeSessionSystem() {
  const supabase = await createClient()
  return new UnifiedSessionSystem(supabase)
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? undefined : date
}

// =====================================================
// GET - Query Security Events
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const sessionSystem = await initializeSessionSystem()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const queryData = {
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      severity: searchParams.get('severity') as any,
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      resolved: searchParams.get('resolved') ? searchParams.get('resolved') === 'true' : undefined
    }
    
    const validation = queryEventsSchema.safeParse(queryData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { limit, offset, severity, type, startDate, endDate, resolved } = validation.data
    
    // Build filters
    const filters: any = {
      userId: user.id
    }
    
    if (severity) filters.severity = severity
    if (type) filters.type = type
    if (resolved !== undefined) filters.resolved = resolved
    
    // Get events
    const events = await sessionSystem.securityEventLogger.getEvents(
      filters,
      {
        limit,
        offset,
        startDate: parseDate(startDate),
        endDate: parseDate(endDate)
      }
    )
    
    // Get statistics
    const stats = await sessionSystem.securityEventLogger.getEventStatistics(user.id)
    
    return NextResponse.json({
      events,
      pagination: {
        limit,
        offset,
        total: events.length
      },
      statistics: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Security events GET error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST - Log Security Event or Resolve Event
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const sessionSystem = await initializeSessionSystem()
    const body = await request.json()
    const { action } = body

    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    switch (action) {
      case 'log': {
        const validation = securityEventSchema.safeParse(body)
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid event data', details: validation.error.errors },
            { status: 400 }
          )
        }

        const { type, severity, description, metadata } = validation.data
        
        // Log security event
        const event = await sessionSystem.securityEventLogger.logEvent({
          type,
          severity,
          description,
          userId: user.id,
          ipAddress: clientIP,
          userAgent,
          metadata: {
            ...metadata,
            loggedViaAPI: true,
            timestamp: new Date().toISOString()
          }
        })

        return NextResponse.json({
          success: true,
          event,
          message: 'Security event logged successfully',
          timestamp: new Date().toISOString()
        })
      }

      case 'resolve': {
        const validation = resolveEventSchema.safeParse(body)
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid resolution data', details: validation.error.errors },
            { status: 400 }
          )
        }

        const { eventId, resolution, metadata } = validation.data
        
        // Verify event ownership
        const event = await sessionSystem.securityEventLogger.getEvent(eventId)
        if (!event || event.userId !== user.id) {
          return NextResponse.json(
            { error: 'Event not found or access denied' },
            { status: 404 }
          )
        }

        // Resolve event
        const success = await sessionSystem.securityEventLogger.resolveEvent(
          eventId,
          resolution,
          {
            ...metadata,
            resolvedBy: user.id,
            resolvedAt: new Date().toISOString(),
            resolvedViaAPI: true
          }
        )
        
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to resolve event' },
            { status: 400 }
          )
        }

        // Log resolution as new event
        await sessionSystem.securityEventLogger.logEvent({
          type: 'security_event_resolved',
          severity: 'low',
          description: `Security event resolved: ${event.type}`,
          userId: user.id,
          ipAddress: clientIP,
          userAgent,
          metadata: {
            originalEventId: eventId,
            resolution,
            ...metadata
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Event resolved successfully',
          timestamp: new Date().toISOString()
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Security events POST error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// DELETE - Clear Security Events
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const sessionSystem = await initializeSessionSystem()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const clearAll = searchParams.get('clearAll') === 'true'
    const olderThan = searchParams.get('olderThan')
    
    if (eventId) {
      // Delete specific event
      const event = await sessionSystem.securityEventLogger.getEvent(eventId)
      if (!event || event.userId !== user.id) {
        return NextResponse.json(
          { error: 'Event not found or access denied' },
          { status: 404 }
        )
      }

      const success = await sessionSystem.securityEventLogger.deleteEvent(eventId)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete event' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Event deleted successfully',
        timestamp: new Date().toISOString()
      })
      
    } else if (clearAll) {
      // Clear all events for user
      const deletedCount = await sessionSystem.securityEventLogger.clearUserEvents(user.id)
      
      // Log the cleanup
      await sessionSystem.securityEventLogger.logEvent({
        type: 'data_deletion',
        severity: 'medium',
        description: `Security events cleared: ${deletedCount} events deleted`,
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { deletedCount, clearAll: true }
      })

      return NextResponse.json({
        success: true,
        deletedCount,
        message: 'All events cleared successfully',
        timestamp: new Date().toISOString()
      })
      
    } else if (olderThan) {
      // Clear events older than specified date
      const cutoffDate = parseDate(olderThan)
      if (!cutoffDate) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }

      const deletedCount = await sessionSystem.securityEventLogger.clearOldEvents(
        user.id,
        cutoffDate
      )
      
      // Log the cleanup
      await sessionSystem.securityEventLogger.logEvent({
        type: 'data_deletion',
        severity: 'low',
        description: `Old security events cleared: ${deletedCount} events deleted`,
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { deletedCount, cutoffDate: cutoffDate.toISOString() }
      })

      return NextResponse.json({
        success: true,
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
        message: 'Old events cleared successfully',
        timestamp: new Date().toISOString()
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid delete operation' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Security events DELETE error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

