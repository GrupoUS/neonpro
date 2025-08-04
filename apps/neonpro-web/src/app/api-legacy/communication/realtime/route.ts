import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auditLog } from '@/lib/audit-legacy/communication-audit';
import { z } from 'zod';

// Schema validation for real-time events
const realtimeEventSchema = z.object({
  type: z.enum(['message_sent', 'message_read', 'typing_start', 'typing_stop', 'user_online', 'user_offline']),
  conversation_id: z.string().uuid(),
  message_id: z.string().uuid().optional(),
  data: z.record(z.any()).default({}),
});

const subscriptionSchema = z.object({
  conversation_ids: z.array(z.string().uuid()).optional(),
  patient_id: z.string().uuid().optional(),
  event_types: z.array(z.enum(['message_sent', 'message_read', 'typing_start', 'typing_stop', 'user_online', 'user_offline'])).optional(),
});

/**
 * GET /api/communication/realtime
 * Server-Sent Events endpoint for real-time communication updates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Parse subscription parameters
    const subscription = subscriptionSchema.parse({
      conversation_ids: searchParams.get('conversation_ids')?.split(',') || undefined,
      patient_id: searchParams.get('patient_id') || undefined,
      event_types: searchParams.get('event_types')?.split(',') || undefined,
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' },
        { status: 400 }
      );
    }

    // Verify access to requested conversations
    if (subscription.conversation_ids) {
      const { data: conversations, error: convError } = await supabase
        .from('communication_conversations')
        .select('id')
        .eq('clinic_id', profile.clinic_id)
        .in('id', subscription.conversation_ids);

      if (convError || !conversations || conversations.length !== subscription.conversation_ids.length) {
        return NextResponse.json(
          { error: 'Access denied to one or more conversations' },
          { status: 403 }
        );
      }
    }

    // Verify access to patient
    if (subscription.patient_id) {
      const { data: patient, error: patientError } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', subscription.patient_id)
        .eq('role', 'patient')
        .single();

      if (patientError || !patient || patient.clinic_id !== profile.clinic_id) {
        return NextResponse.json(
          { error: 'Access denied to patient' },
          { status: 403 }
        );
      }
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: 'connection_established',
          timestamp: new Date().toISOString(),
          user_id: user.id,
          clinic_id: profile.clinic_id,
        })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Setup Supabase real-time subscription
        const channel = supabase
          .channel('communication_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'communication_messages',
              filter: subscription.conversation_ids 
                ? `conversation_id=in.(${subscription.conversation_ids.join(',')})`
                : `clinic_id=eq.${profile.clinic_id}`,
            },
            (payload) => {
              try {
                // Filter events based on subscription
                const eventData = {
                  type: 'message_event',
                  event: payload.eventType,
                  data: payload.new || payload.old,
                  timestamp: new Date().toISOString(),
                };

                const message = `data: ${JSON.stringify(eventData)}\n\n`;
                controller.enqueue(encoder.encode(message));
              } catch (error) {
                console.error('Error processing real-time event:', error);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'communication_conversations',
              filter: `clinic_id=eq.${profile.clinic_id}`,
            },
            (payload) => {
              try {
                const eventData = {
                  type: 'conversation_event',
                  event: payload.eventType,
                  data: payload.new || payload.old,
                  timestamp: new Date().toISOString(),
                };

                const message = `data: ${JSON.stringify(eventData)}\n\n`;
                controller.enqueue(encoder.encode(message));
              } catch (error) {
                console.error('Error processing conversation event:', error);
              }
            }
          )
          .subscribe();

        // Handle stream closure
        const cleanup = () => {
          supabase.removeChannel(channel);
        };

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Keep-alive ping every 30 seconds
        const keepAlive = setInterval(() => {
          try {
            const ping = `data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(ping));
          } catch (error) {
            clearInterval(keepAlive);
            cleanup();
            controller.close();
          }
        }, 30000);

        // Cleanup interval on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          cleanup();
        });
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/realtime:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid subscription parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}/**
 * POST /api/communication/realtime
 * Send real-time events for typing indicators, read receipts, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const eventData = realtimeEventSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' },
        { status: 400 }
      );
    }

    // Verify access to conversation
    const { data: conversation, error: convError } = await supabase
      .from('communication_conversations')
      .select('id, clinic_id, patient_id')
      .eq('id', eventData.conversation_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Verify access to message if provided
    if (eventData.message_id) {
      const { data: message, error: msgError } = await supabase
        .from('communication_messages')
        .select('id, conversation_id')
        .eq('id', eventData.message_id)
        .eq('conversation_id', eventData.conversation_id)
        .single();

      if (msgError || !message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
    }

    // Handle different event types
    let updateData: any = {};
    let shouldUpdateMessage = false;
    let shouldUpdateConversation = false;

    switch (eventData.type) {
      case 'message_read':
        if (eventData.message_id) {
          // Mark message as read
          updateData = {
            read_at: new Date().toISOString(),
            read_by: user.id,
          };
          shouldUpdateMessage = true;
        }
        break;

      case 'typing_start':
      case 'typing_stop':
        // Update conversation with typing status
        const typingUsers = eventData.data.typing_users || [];
        if (eventData.type === 'typing_start' && !typingUsers.includes(user.id)) {
          typingUsers.push(user.id);
        } else if (eventData.type === 'typing_stop') {
          const index = typingUsers.indexOf(user.id);
          if (index > -1) {
            typingUsers.splice(index, 1);
          }
        }
        
        updateData = {
          metadata: {
            ...conversation.metadata,
            typing_users: typingUsers,
            last_typing_update: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        };
        shouldUpdateConversation = true;
        break;

      case 'user_online':
      case 'user_offline':
        // Update user presence in conversation metadata
        const presence = conversation.metadata?.presence || {};
        presence[user.id] = {
          status: eventData.type === 'user_online' ? 'online' : 'offline',
          last_seen: new Date().toISOString(),
        };

        updateData = {
          metadata: {
            ...conversation.metadata,
            presence,
          },
          updated_at: new Date().toISOString(),
        };
        shouldUpdateConversation = true;
        break;
    }

    // Apply updates
    if (shouldUpdateMessage && eventData.message_id) {
      const { error: updateError } = await supabase
        .from('communication_messages')
        .update(updateData)
        .eq('id', eventData.message_id);

      if (updateError) {
        console.error('Error updating message:', updateError);
        return NextResponse.json(
          { error: 'Failed to update message' },
          { status: 500 }
        );
      }
    }

    if (shouldUpdateConversation) {
      const { error: updateError } = await supabase
        .from('communication_conversations')
        .update(updateData)
        .eq('id', eventData.conversation_id);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        return NextResponse.json(
          { error: 'Failed to update conversation' },
          { status: 500 }
        );
      }
    }

    // Broadcast event to other clients via Supabase real-time
    // This will be picked up by the SSE endpoint subscribers
    const { error: broadcastError } = await supabase
      .channel('communication_realtime')
      .send({
        type: 'broadcast',
        event: eventData.type,
        payload: {
          conversation_id: eventData.conversation_id,
          message_id: eventData.message_id,
          user_id: user.id,
          data: eventData.data,
          timestamp: new Date().toISOString(),
        },
      });

    if (broadcastError) {
      console.error('Error broadcasting event:', broadcastError);
      // Don't fail the request for broadcast errors
    }

    // Audit log for important events
    if (['message_read', 'user_online', 'user_offline'].includes(eventData.type)) {
      await auditLog({
        action: `realtime_${eventData.type}`,
        entity_type: 'conversation',
        entity_id: eventData.conversation_id,
        user_id: user.id,
        clinic_id: profile.clinic_id,
        details: {
          event_type: eventData.type,
          message_id: eventData.message_id,
          data: eventData.data,
        },
      });
    }

    return NextResponse.json({
      success: true,
      event_type: eventData.type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in POST /api/communication/realtime:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid event data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}