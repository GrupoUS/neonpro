/**
 * Subscription Real-time Events API Route
 * 
 * Handles server-sent events and WebSocket management for real-time
 * subscription status updates and notifications.
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { SubscriptionEvent, SubscriptionRealtimeUpdate } from '../../../../lib/subscription-realtime'
import { subscriptionRealtimeManager } from '../../../../lib/subscription-realtime'

export const runtime = 'edge'

/**
 * GET - Subscribe to real-time subscription events (Server-Sent Events)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()

        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'connection',
            message: 'Connected to subscription events',
            timestamp: new Date().toISOString()
          })}\n\n`)
        )

        // Subscribe to user's subscription updates
        const unsubscribe = subscriptionRealtimeManager.subscribe(
          user.id,
          (update: SubscriptionRealtimeUpdate) => {
            const eventData = JSON.stringify({
              type: 'subscription_update',
              data: update
            })

            controller.enqueue(encoder.encode(`data: ${eventData}\n\n`))
          }
        )

        // Send periodic heartbeat
        const heartbeat = setInterval(() => {
          const heartbeatData = JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            metrics: subscriptionRealtimeManager.getMetrics()
          })

          try {
            controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`))
          } catch (error) {
            // Client disconnected
            clearInterval(heartbeat)
            unsubscribe()
          }
        }, 30000) // 30 second heartbeat

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          unsubscribe()
          controller.close()
        })
      }
    })

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Subscription events API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * POST - Broadcast subscription event or trigger refresh
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, event } = body

    switch (action) {
      case 'broadcast':
        if (!event) {
          return NextResponse.json(
            { error: 'Event data is required for broadcast' },
            { status: 400 }
          )
        }

        const success = await subscriptionRealtimeManager.broadcast(event)
        
        return NextResponse.json({
          success,
          message: success ? 'Event broadcasted successfully' : 'Failed to broadcast event'
        })

      case 'refresh':
        await subscriptionRealtimeManager.forceRefresh(user.id)
        
        return NextResponse.json({
          success: true,
          message: 'Subscription status refreshed'
        })

      case 'metrics':
        const metrics = subscriptionRealtimeManager.getMetrics()
        
        return NextResponse.json({
          success: true,
          metrics
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: broadcast, refresh, metrics' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Subscription events POST API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update subscription status and broadcast change
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId, status, tier, reason } = body

    if (!subscriptionId || !status) {
      return NextResponse.json(
        { error: 'subscriptionId and status are required' },
        { status: 400 }
      )
    }

    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status,
        tier: tier || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id) // Ensure user can only update their own subscription
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Broadcast the change
    const event: SubscriptionRealtimeUpdate = {
      event: getEventType(status, reason),
      userId: user.id,
      subscriptionId,
      status,
      timestamp: new Date().toISOString(),
      metadata: {
        tier,
        reason,
        gracePeriodEnd: updatedSubscription.current_period_end,
        nextBilling: updatedSubscription.current_period_end
      }
    }

    await subscriptionRealtimeManager.broadcast(event)

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      event
    })
  } catch (error) {
    console.error('Subscription update API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to determine event type based on status and reason
 */
function getEventType(status: string, reason?: string): SubscriptionEvent {
  switch (status) {
    case 'active':
      return reason === 'upgrade' ? 'subscription_upgraded' : 
             reason === 'renewed' ? 'subscription_renewed' : 
             'subscription_activated'
    case 'cancelled':
      return 'subscription_cancelled'
    case 'expired':
      return 'subscription_expired'
    case 'trialing':
      return 'subscription_trial_ended'
    case 'incomplete':
      return 'payment_failed'
    default:
      return 'subscription_renewed'
  }
}