import { auditLog } from '@/lib/audit/communication-audit';
import { validateUserAccess } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';
import { CommunicationConversation, CommunicationError } from '@/types/communication';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validation
const createConversationSchema = z.object({
  type: z.enum(['internal', 'patient_chat', 'broadcast', 'emergency']),
  title: z.string().min(1).max(255).optional(),
  participants: z.array(z.string().uuid()).min(1),
  patient_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const conversationFiltersSchema = z.object({
  type: z.enum(['internal', 'patient_chat', 'broadcast', 'emergency']).optional(),
  patient_id: z.string().uuid().optional(),
  active_only: z.boolean().default(true),
  archived: z.boolean().default(false),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * GET /api/communication/conversations
 * List conversations for the current user with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = conversationFiltersSchema.parse({
      type: searchParams.get('type'),
      patient_id: searchParams.get('patient_id'),
      active_only: searchParams.get('active_only') === 'true',
      archived: searchParams.get('archived') === 'true',
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Build base query - conversations where user is a participant
    let query = supabase
      .from('communication_conversations')
      .select(`
        *,
        last_message:communication_messages(
          id,
          content,
          message_type,
          sender_id,
          created_at,
          sender:sender_id (
            profiles (
              name,
              avatar_url
            )
          )
        ),
        patient:patient_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .contains('participants', [user.id])
      .order('updated_at', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters.active_only) {
      query = query.eq('is_active', true);
    }

    if (filters.archived) {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,patient.name.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: conversations, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' } as CommunicationError,
        { status: 500 }
      );
    }

    // Get unread message counts for each conversation
    const conversationIds = conversations?.map(c => c.id) || [];
    let unreadCounts: Record<string, number> = {};

    if (conversationIds.length > 0) {
      const { data: unreadData } = await supabase
        .from('communication_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null)
        .is('deleted_at', null);

      if (unreadData) {
        unreadCounts = unreadData.reduce((acc, msg) => {
          acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Transform data
    const transformedConversations: CommunicationConversation[] = conversations?.map(conv => ({
      id: conv.id,
      type: conv.type,
      title: conv.title,
      participants: conv.participants,
      patient_id: conv.patient_id,
      clinic_id: conv.clinic_id,
      metadata: conv.metadata || {},
      is_active: conv.is_active,
      archived_at: conv.archived_at ? new Date(conv.archived_at) : undefined,
      created_at: new Date(conv.created_at),
      updated_at: new Date(conv.updated_at),
      last_message: conv.last_message?.[0] ? {
        id: conv.last_message[0].id,
        conversation_id: conv.id,
        sender_id: conv.last_message[0].sender_id,
        content: conv.last_message[0].content,
        message_type: conv.last_message[0].message_type,
        metadata: {},
        created_at: new Date(conv.last_message[0].created_at),
        updated_at: new Date(conv.last_message[0].created_at),
        sender: conv.last_message[0].sender?.profiles ? {
          id: conv.last_message[0].sender_id,
          name: conv.last_message[0].sender.profiles.name,
          avatar: conv.last_message[0].sender.profiles.avatar_url,
        } : undefined,
      } : undefined,
      unread_count: unreadCounts[conv.id] || 0,
      patient: conv.patient ? {
        id: conv.patient.id,
        name: conv.patient.name,
        avatar: conv.patient.avatar_url,
      } : undefined,
    })) || [];

    // Audit log for conversation access
    await auditLog({
      action: 'conversations_accessed',
      entity_type: 'conversation',
      entity_id: 'list',
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        filters,
        conversation_count: transformedConversations.length,
      },
    });

    return NextResponse.json({
      conversations: transformedConversations,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/conversations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const conversationData = createConversationSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Validate all participants belong to the same clinic or are patients
    const { data: participantProfiles } = await supabase
      .from('profiles')
      .select('id, clinic_id, role')
      .in('id', conversationData.participants);

    const validParticipants = participantProfiles?.every(p => 
      p.clinic_id === profile.clinic_id || p.role === 'patient'
    );

    if (!validParticipants) {
      return NextResponse.json(
        { error: 'All participants must belong to the same clinic' } as CommunicationError,
        { status: 400 }
      );
    }

    // Ensure current user is included in participants
    const participants = [...new Set([user.id, ...conversationData.participants])];

    // For patient_chat, validate patient_id is provided and is in participants
    if (conversationData.type === 'patient_chat') {
      if (!conversationData.patient_id) {
        return NextResponse.json(
          { error: 'Patient ID is required for patient chat conversations' } as CommunicationError,
          { status: 400 }
        );
      }

      if (!participants.includes(conversationData.patient_id)) {
        participants.push(conversationData.patient_id);
      }
    }

    // Check for existing conversation (prevent duplicates for patient chats)
    if (conversationData.type === 'patient_chat' && conversationData.patient_id) {
      const { data: existingConv } = await supabase
        .from('communication_conversations')
        .select('id')
        .eq('type', 'patient_chat')
        .eq('patient_id', conversationData.patient_id)
        .eq('clinic_id', profile.clinic_id)
        .eq('is_active', true)
        .single();

      if (existingConv) {
        return NextResponse.json(
          { 
            code: 'CONVERSATION_EXISTS',
            message: 'Active conversation with this patient already exists',
            conversation_id: existingConv.id 
          } as CommunicationError,
          { status: 409 }
        );
      }
    }

    // Insert conversation
    const { data: conversation, error: insertError } = await supabase
      .from('communication_conversations')
      .insert({
        type: conversationData.type,
        title: conversationData.title,
        participants,
        patient_id: conversationData.patient_id,
        clinic_id: profile.clinic_id,
        metadata: conversationData.metadata || {},
        is_active: true,
      })
      .select(`
        *,
        patient:patient_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      return NextResponse.json(
        { error: 'Failed to create conversation' } as CommunicationError,
        { status: 500 }
      );
    }

    // Send system message for conversation creation
    const systemMessage = `Conversa ${conversationData.type === 'patient_chat' ? 'com paciente' : 'interna'} iniciada por ${profile.name || user.email}`;
    
    await supabase
      .from('communication_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: systemMessage,
        message_type: 'system',
        metadata: { system_event: 'conversation_created' },
        delivered_at: new Date().toISOString(),
      });

    // Transform response data
    const transformedConversation: CommunicationConversation = {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      participants: conversation.participants,
      patient_id: conversation.patient_id,
      clinic_id: conversation.clinic_id,
      metadata: conversation.metadata || {},
      is_active: conversation.is_active,
      created_at: new Date(conversation.created_at),
      updated_at: new Date(conversation.updated_at),
      unread_count: 0,
      patient: conversation.patient ? {
        id: conversation.patient.id,
        name: conversation.patient.name,
        avatar: conversation.patient.avatar_url,
      } : undefined,
    };

    // Notify all participants via real-time
    participants.forEach(participantId => {
      supabase
        .channel(`user:${participantId}`)
        .send({
          type: 'broadcast',
          event: 'conversation_created',
          payload: {
            conversation: transformedConversation,
          },
        });
    });

    // Audit log
    await auditLog({
      action: 'conversation_created',
      entity_type: 'conversation',
      entity_id: conversation.id,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      patient_id: conversationData.patient_id,
      details: {
        type: conversationData.type,
        participant_count: participants.length,
        title: conversationData.title,
      },
    });

    return NextResponse.json({
      conversation: transformedConversation,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/communication/conversations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/communication/conversations/[id]
 * Update conversation (archive, reactivate, update title, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    const body = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Validate user has access to the conversation
    const hasAccess = await validateUserAccess(user.id, 'conversation', conversationId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to conversation' } as CommunicationError,
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active;
    }

    if (body.archived !== undefined) {
      updateData.archived_at = body.archived ? new Date().toISOString() : null;
    }

    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata;
    }

    // Update conversation
    const { data: conversation, error: updateError } = await supabase
      .from('communication_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update conversation' } as CommunicationError,
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      action: 'conversation_updated',
      entity_type: 'conversation',
      entity_id: conversationId,
      user_id: user.id,
      details: {
        updates: updateData,
      },
    });

    return NextResponse.json({
      conversation,
    });

  } catch (error) {
    console.error('Error in PATCH /api/communication/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}
