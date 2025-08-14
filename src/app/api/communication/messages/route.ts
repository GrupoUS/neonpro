import { auditLog } from '@/lib/audit/communication-audit';
import { validateUserAccess } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';
import { CommunicationError, CommunicationMessage } from '@/types/communication';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validation
const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1).max(4000),
  message_type: z.enum(['text', 'image', 'file', 'template']).default('text'),
  metadata: z.record(z.any()).optional(),
  template_id: z.string().uuid().optional(),
  template_variables: z.record(z.string()).optional(),
});

const messageFiltersSchema = z.object({
  conversation_id: z.string().uuid(),
  message_type: z.enum(['text', 'image', 'file', 'template', 'system']).optional(),
  sender_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
});

/**
 * GET /api/communication/messages
 * Retrieve messages for a conversation with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = messageFiltersSchema.parse({
      conversation_id: searchParams.get('conversation_id'),
      message_type: searchParams.get('message_type'),
      sender_id: searchParams.get('sender_id'),
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Validate user has access to the conversation
    const hasAccess = await validateUserAccess(user.id, 'conversation', filters.conversation_id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to conversation' } as CommunicationError,
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('communication_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          email,
          profiles (
            id,
            name,
            avatar_url,
            role
          )
        )
      `)
      .eq('conversation_id', filters.conversation_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.message_type) {
      query = query.eq('message_type', filters.message_type);
    }
    
    if (filters.sender_id) {
      query = query.eq('sender_id', filters.sender_id);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    if (filters.search) {
      query = query.textSearch('content', filters.search);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: messages, error, count } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform data
    const transformedMessages: CommunicationMessage[] = messages?.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      content: msg.content,
      message_type: msg.message_type,
      metadata: msg.metadata || {},
      read_at: msg.read_at ? new Date(msg.read_at) : undefined,
      delivered_at: msg.delivered_at ? new Date(msg.delivered_at) : undefined,
      created_at: new Date(msg.created_at),
      updated_at: new Date(msg.updated_at),
      sender: msg.sender?.profiles ? {
        id: msg.sender.id,
        name: msg.sender.profiles.name,
        avatar: msg.sender.profiles.avatar_url,
        role: msg.sender.profiles.role,
      } : undefined,
    })) || [];

    // Audit log for message access
    await auditLog({
      action: 'messages_accessed',
      entity_type: 'conversation',
      entity_id: filters.conversation_id,
      user_id: user.id,
      details: {
        filters,
        message_count: transformedMessages.length,
      },
    });

    return NextResponse.json({
      messages: transformedMessages,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/messages:', error);
    
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
 * POST /api/communication/messages
 * Send a new message in a conversation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const messageData = sendMessageSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Validate user has access to the conversation
    const hasAccess = await validateUserAccess(user.id, 'conversation', messageData.conversation_id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to conversation' } as CommunicationError,
        { status: 403 }
      );
    }

    // Process template if provided
    let finalContent = messageData.content;
    if (messageData.template_id && messageData.template_variables) {
      const { data: template, error: templateError } = await supabase
        .from('communication_templates')
        .select('content')
        .eq('id', messageData.template_id)
        .eq('active', true)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { 
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found or inactive' 
          } as CommunicationError,
          { status: 404 }
        );
      }

      // Replace template variables
      finalContent = template.content;
      Object.entries(messageData.template_variables).forEach(([key, value]) => {
        finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('communication_messages')
      .insert({
        conversation_id: messageData.conversation_id,
        sender_id: user.id,
        content: finalContent,
        message_type: messageData.message_type,
        metadata: {
          ...messageData.metadata,
          template_id: messageData.template_id,
          template_variables: messageData.template_variables,
        },
        delivered_at: new Date().toISOString(),
      })
      .select(`
        *,
        sender:sender_id (
          id,
          email,
          profiles (
            id,
            name,
            avatar_url,
            role
          )
        )
      `)
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { 
          code: 'MESSAGE_SEND_FAILED',
          message: 'Failed to send message' 
        } as CommunicationError,
        { status: 500 }
      );
    }

    // Update conversation updated_at
    await supabase
      .from('communication_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id);

    // Transform response data
    const transformedMessage: CommunicationMessage = {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      content: message.content,
      message_type: message.message_type,
      metadata: message.metadata || {},
      delivered_at: new Date(message.delivered_at),
      created_at: new Date(message.created_at),
      updated_at: new Date(message.updated_at),
      sender: message.sender?.profiles ? {
        id: message.sender.id,
        name: message.sender.profiles.name,
        avatar: message.sender.profiles.avatar_url,
        role: message.sender.profiles.role,
      } : undefined,
    };

    // Broadcast real-time message to conversation participants
    await supabase
      .channel(`conversation:${messageData.conversation_id}`)
      .send({
        type: 'broadcast',
        event: 'new_message',
        payload: {
          message: transformedMessage,
          conversation_id: messageData.conversation_id,
        },
      });

    // Audit log
    await auditLog({
      action: 'message_sent',
      entity_type: 'message',
      entity_id: message.id,
      user_id: user.id,
      details: {
        conversation_id: messageData.conversation_id,
        message_type: messageData.message_type,
        template_id: messageData.template_id,
        content_length: finalContent.length,
      },
    });

    return NextResponse.json({
      message: transformedMessage,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/communication/messages:', error);
    
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
 * PATCH /api/communication/messages/[id]/read
 * Mark a message as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' } as CommunicationError,
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

    // Update message read status
    const { data: message, error: updateError } = await supabase
      .from('communication_messages')
      .update({ 
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select('id, conversation_id, sender_id')
      .single();

    if (updateError) {
      console.error('Error marking message as read:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark message as read' } as CommunicationError,
        { status: 500 }
      );
    }

    // Broadcast read status to conversation
    await supabase
      .channel(`conversation:${message.conversation_id}`)
      .send({
        type: 'broadcast',
        event: 'message_read',
        payload: {
          message_id: messageId,
          read_by: user.id,
          read_at: new Date().toISOString(),
        },
      });

    // Audit log
    await auditLog({
      action: 'message_read',
      entity_type: 'message',
      entity_id: messageId,
      user_id: user.id,
      details: {
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in PATCH /api/communication/messages/read:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}
