import { auditLog } from '@/lib/audit-legacy/communication-audit';
import { createClient } from '@/lib/supabase/server';
import { CommunicationError, CommunicationNotification } from '@/types/communication';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validation
const createNotificationSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message_id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  notification_type: z.enum(['email', 'sms', 'push', 'whatsapp']),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(1000),
  scheduled_for: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).default({}),
});

const updateNotificationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).max(1000).optional(),
  scheduled_for: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'cancelled']).optional(),
  metadata: z.record(z.any()).optional(),
});

const notificationFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
  notification_type: z.enum(['email', 'sms', 'push', 'whatsapp']).optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * GET /api/communication/notifications
 * List notifications for the clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = notificationFiltersSchema.parse({
      patient_id: searchParams.get('patient_id'),
      conversation_id: searchParams.get('conversation_id'),
      notification_type: searchParams.get('notification_type'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      from_date: searchParams.get('from_date'),
      to_date: searchParams.get('to_date'),
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
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('communication_notifications')
      .select(`
        *,
        patient:patient_id (
          profiles (
            name,
            email
          )
        ),
        conversation:conversation_id (
          id,
          subject
        ),
        message:message_id (
          id,
          content
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters.conversation_id) {
      query = query.eq('conversation_id', filters.conversation_id);
    }

    if (filters.notification_type) {
      query = query.eq('notification_type', filters.notification_type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date);
    }

    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform data
    const transformedNotifications: CommunicationNotification[] = notifications?.map(notification => ({
      id: notification.id,
      clinic_id: notification.clinic_id,
      conversation_id: notification.conversation_id,
      message_id: notification.message_id,
      patient_id: notification.patient_id,
      notification_type: notification.notification_type,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      scheduled_for: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
      sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
      delivered_at: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
      priority: notification.priority,
      attempts: notification.attempts,
      error_message: notification.error_message,
      metadata: notification.metadata || {},
      created_at: new Date(notification.created_at),
      updated_at: new Date(notification.updated_at),
    })) || [];

    return NextResponse.json({
      notifications: transformedNotifications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/notifications:', error);
    
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
 * POST /api/communication/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const notificationData = createNotificationSchema.parse(body);

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
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', notificationData.patient_id)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient || patient.clinic_id !== profile.clinic_id) {
      return NextResponse.json(
        { 
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient not found or does not belong to your clinic' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // If conversation_id is provided, verify it belongs to clinic and patient
    if (notificationData.conversation_id) {
      const { data: conversation, error: convError } = await supabase
        .from('communication_conversations')
        .select('clinic_id, patient_id')
        .eq('id', notificationData.conversation_id)
        .single();

      if (convError || !conversation || 
          conversation.clinic_id !== profile.clinic_id ||
          conversation.patient_id !== notificationData.patient_id) {
        return NextResponse.json(
          { 
            code: 'CONVERSATION_NOT_FOUND',
            message: 'Conversation not found or invalid' 
          } as CommunicationError,
          { status: 404 }
        );
      }
    }

    // If message_id is provided, verify it exists
    if (notificationData.message_id) {
      const { data: message, error: msgError } = await supabase
        .from('communication_messages')
        .select('id, conversation_id')
        .eq('id', notificationData.message_id)
        .single();

      if (msgError || !message) {
        return NextResponse.json(
          { 
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found' 
          } as CommunicationError,
          { status: 404 }
        );
      }

      // If both conversation_id and message_id provided, ensure they match
      if (notificationData.conversation_id && 
          message.conversation_id !== notificationData.conversation_id) {
        return NextResponse.json(
          { 
            code: 'CONVERSATION_MESSAGE_MISMATCH',
            message: 'Message does not belong to the specified conversation' 
          } as CommunicationError,
          { status: 400 }
        );
      }
    }

    // Determine initial status
    const status = notificationData.scheduled_for ? 'pending' : 'pending';

    // Insert notification
    const { data: notification, error: insertError } = await supabase
      .from('communication_notifications')
      .insert({
        clinic_id: profile.clinic_id,
        conversation_id: notificationData.conversation_id,
        message_id: notificationData.message_id,
        patient_id: notificationData.patient_id,
        notification_type: notificationData.notification_type,
        title: notificationData.title,
        content: notificationData.content,
        status,
        scheduled_for: notificationData.scheduled_for,
        priority: notificationData.priority,
        metadata: notificationData.metadata,
        attempts: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating notification:', insertError);
      return NextResponse.json(
        { error: 'Failed to create notification' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform response data
    const transformedNotification: CommunicationNotification = {
      id: notification.id,
      clinic_id: notification.clinic_id,
      conversation_id: notification.conversation_id,
      message_id: notification.message_id,
      patient_id: notification.patient_id,
      notification_type: notification.notification_type,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      scheduled_for: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
      sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
      delivered_at: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
      priority: notification.priority,
      attempts: notification.attempts,
      error_message: notification.error_message,
      metadata: notification.metadata || {},
      created_at: new Date(notification.created_at),
      updated_at: new Date(notification.updated_at),
    };

    // Audit log
    await auditLog({
      action: 'notification_created',
      entity_type: 'notification',
      entity_id: notification.id,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        patient_id: notification.patient_id,
        notification_type: notification.notification_type,
        priority: notification.priority,
        scheduled: !!notification.scheduled_for,
      },
    });

    // TODO: If not scheduled, trigger immediate notification sending
    // This would typically involve queuing the notification for sending

    return NextResponse.json({
      notification: transformedNotification,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/communication/notifications:', error);
    
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
 * PATCH /api/communication/notifications/[id]
 * Update notification status or details
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const body = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Validate request body
    const updateData = updateNotificationSchema.parse(body);

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
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if notification exists and belongs to user's clinic
    const { data: existingNotification, error: fetchError } = await supabase
      .from('communication_notifications')
      .select('id, clinic_id, status')
      .eq('id', notificationId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { 
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Prepare update payload
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    // Copy valid fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        updatePayload[key] = updateData[key as keyof typeof updateData];
      }
    });

    // Handle status changes with timestamps
    if (updateData.status && updateData.status !== existingNotification.status) {
      if (updateData.status === 'sent' && !updatePayload.sent_at) {
        updatePayload.sent_at = new Date().toISOString();
      } else if (updateData.status === 'delivered' && !updatePayload.delivered_at) {
        updatePayload.delivered_at = new Date().toISOString();
      }
    }

    // Update notification
    const { data: notification, error: updateError } = await supabase
      .from('communication_notifications')
      .update(updatePayload)
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json(
        { error: 'Failed to update notification' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform response data
    const transformedNotification: CommunicationNotification = {
      id: notification.id,
      clinic_id: notification.clinic_id,
      conversation_id: notification.conversation_id,
      message_id: notification.message_id,
      patient_id: notification.patient_id,
      notification_type: notification.notification_type,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      scheduled_for: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
      sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
      delivered_at: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
      priority: notification.priority,
      attempts: notification.attempts,
      error_message: notification.error_message,
      metadata: notification.metadata || {},
      created_at: new Date(notification.created_at),
      updated_at: new Date(notification.updated_at),
    };

    // Audit log for status changes
    if (updateData.status && updateData.status !== existingNotification.status) {
      await auditLog({
        action: 'notification_status_changed',
        entity_type: 'notification',
        entity_id: notificationId,
        user_id: user.id,
        clinic_id: profile.clinic_id,
        details: {
          old_status: existingNotification.status,
          new_status: updateData.status,
        },
      });
    }

    return NextResponse.json({
      notification: transformedNotification,
    });

  } catch (error) {
    console.error('Error in PATCH /api/communication/notifications:', error);
    
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
 * DELETE /api/communication/notifications/[id]
 * Cancel a notification (sets status to cancelled)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' } as CommunicationError,
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

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if notification exists and belongs to user's clinic
    const { data: existingNotification, error: fetchError } = await supabase
      .from('communication_notifications')
      .select('id, clinic_id, status')
      .eq('id', notificationId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { 
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Check if notification can be cancelled
    if (['sent', 'delivered', 'cancelled'].includes(existingNotification.status)) {
      return NextResponse.json(
        { 
          code: 'NOTIFICATION_CANNOT_BE_CANCELLED',
          message: 'Notification cannot be cancelled in its current status' 
        } as CommunicationError,
        { status: 400 }
      );
    }

    // Cancel notification
    const { error: cancelError } = await supabase
      .from('communication_notifications')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (cancelError) {
      console.error('Error cancelling notification:', cancelError);
      return NextResponse.json(
        { error: 'Failed to cancel notification' } as CommunicationError,
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      action: 'notification_cancelled',
      entity_type: 'notification',
      entity_id: notificationId,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        old_status: existingNotification.status,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/communication/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}
