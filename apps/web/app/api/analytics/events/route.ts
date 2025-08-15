/**
 * Analytics Events API Route
 * POST /api/analytics/events - Track analytics events
 * GET /api/analytics/events - Retrieve analytics events
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyticsService } from '@/lib/analytics';
import { requireAuth } from '@/lib/middleware/auth';

// Validation schema for event tracking
const EventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  clinicId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

const BatchEventsSchema = z.object({
  events: z.array(EventSchema).min(1).max(100),
});

/**
 * Track analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    let events;
    if (Array.isArray(body.events)) {
      const validation = BatchEventsSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Invalid batch events format',
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }
      events = validation.data.events;
    } else {
      const validation = EventSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid event format', details: validation.error.issues },
          { status: 400 }
        );
      }
      events = [validation.data];
    }

    // Optional authentication for user-specific events
    let user;
    try {
      const authResult = await requireAuth()(request);
      if (authResult.authenticated) {
        user = authResult.user;
      }
    } catch {
      // Continue without authentication for anonymous events
    }

    // Process events
    const trackedEvents = await Promise.all(
      events.map(async (event) => {
        // Override userId and clinicId with authenticated user data if available
        const eventData = {
          ...event,
          userId: user?.id || event.userId,
          clinicId: user?.clinicId || event.clinicId,
          timestamp: event.timestamp || new Date().toISOString(),
        };

        return await analyticsService.trackEvent(eventData);
      })
    );

    return NextResponse.json({
      success: true,
      tracked: trackedEvents.length,
      events: trackedEvents,
    });
  } catch (error) {
    console.error('Event tracking error:', error);

    return NextResponse.json(
      {
        error: 'Failed to track events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Retrieve analytics events
 */
export async function GET(request: NextRequest) {
  // Require authentication for event retrieval
  const authResult = await requireAuth(['admin', 'clinic_owner', 'manager'])(
    request
  );

  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const user = authResult.user!;

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const eventName = searchParams.get('event');
    const userId = searchParams.get('userId');
    const clinicId = searchParams.get('clinicId') || user.clinicId;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate clinic access
    if (clinicId && user.role !== 'admin' && user.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Access denied to clinic data' },
        { status: 403 }
      );
    }

    // Get events
    const result = await analyticsService.getEvents({
      limit: Math.min(limit, 1000), // Max 1000 events per request
      offset,
      eventName,
      userId,
      clinicId: clinicId || undefined,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: result.events,
      pagination: {
        limit,
        offset,
        total: result.total,
        hasMore: result.hasMore,
      },
      metadata: {
        clinicId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Event retrieval error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
