// =====================================================
// Notifications API Routes
// Story 1.4: Session Management & Security
// =====================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UnifiedSessionSystem } from '@/lib/auth/session';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const sendNotificationSchema = z.object({
  type: z.enum([
    'session_warning',
    'session_expired',
    'login_alert',
    'security_alert',
    'device_alert',
    'password_alert',
    'account_alert',
    'system_alert',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  channels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).optional(),
  metadata: z.record(z.any()).optional(),
  scheduledFor: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  quietHours: z
    .object({
      enabled: z.boolean(),
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: z.string(),
    })
    .optional(),
  notificationTypes: z.record(z.boolean()).optional(),
});

const queryNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  type: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'read']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return '127.0.0.1';
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

async function initializeSessionSystem() {
  const supabase = createRouteHandlerClient({ cookies });
  return new UnifiedSessionSystem(supabase);
}

async function getCurrentUser() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

function parseDate(dateString?: string): Date | undefined {
  if (!dateString) {
    return;
  }
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// =====================================================
// GET - Query Notifications
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const { searchParams } = new URL(request.url);

    // Check for specific actions
    const action = searchParams.get('action');

    if (action === 'preferences') {
      // Get user notification preferences
      const preferences =
        await sessionSystem.notificationService.getUserPreferences(user.id);

      return NextResponse.json({
        preferences,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'statistics') {
      // Get notification statistics
      const stats =
        await sessionSystem.notificationService.getNotificationStatistics(
          user.id
        );

      return NextResponse.json({
        statistics: stats,
        timestamp: new Date().toISOString(),
      });
    }

    // Parse query parameters for notifications list
    const queryData = {
      limit: Number.parseInt(searchParams.get('limit') || '50', 10),
      offset: Number.parseInt(searchParams.get('offset') || '0', 10),
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') as any,
      status: searchParams.get('status') as any,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const validation = queryNotificationsSchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { limit, offset, type, priority, status, startDate, endDate } =
      validation.data;

    // Build filters
    const filters: any = {
      userId: user.id,
    };

    if (type) {
      filters.type = type;
    }
    if (priority) {
      filters.priority = priority;
    }
    if (status) {
      filters.status = status;
    }

    // Get notifications
    const notifications =
      await sessionSystem.notificationService.getUserNotifications(user.id, {
        limit,
        offset,
        filters,
        startDate: parseDate(startDate),
        endDate: parseDate(endDate),
      });

    // Get unread count
    const unreadCount = await sessionSystem.notificationService.getUnreadCount(
      user.id
    );

    return NextResponse.json({
      notifications,
      pagination: {
        limit,
        offset,
        total: notifications.length,
      },
      unreadCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notifications GET error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Send Notification or Update Preferences
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();
    const { action } = body;

    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    switch (action) {
      case 'send': {
        const validation = sendNotificationSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            {
              error: 'Invalid notification data',
              details: validation.error.errors,
            },
            { status: 400 }
          );
        }

        const {
          type,
          priority,
          title,
          message,
          channels,
          metadata,
          scheduledFor,
        } = validation.data;

        // Send notification
        const notification =
          await sessionSystem.notificationService.sendNotification({
            userId: user.id,
            type,
            priority,
            title,
            message,
            channels: channels || ['in_app'],
            metadata: {
              ...metadata,
              sentViaAPI: true,
              senderIP: clientIP,
              senderUserAgent: userAgent,
            },
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          });

        // Log security event
        await sessionSystem.securityEventLogger.logEvent({
          type: 'notification_sent',
          severity: 'low',
          description: `Notification sent: ${title}`,
          userId: user.id,
          ipAddress: clientIP,
          userAgent,
          metadata: {
            notificationId: notification.id,
            notificationType: type,
            priority,
            channels,
          },
        });

        return NextResponse.json({
          success: true,
          notification,
          message: 'Notification sent successfully',
          timestamp: new Date().toISOString(),
        });
      }

      case 'mark_read': {
        const { notificationIds } = body;

        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
          return NextResponse.json(
            { error: 'Invalid notification IDs' },
            { status: 400 }
          );
        }

        // Mark notifications as read
        const results = await Promise.all(
          notificationIds.map((id) =>
            sessionSystem.notificationService.markAsRead(id, user.id)
          )
        );

        const successCount = results.filter(Boolean).length;

        return NextResponse.json({
          success: true,
          markedCount: successCount,
          total: notificationIds.length,
          message: `${successCount} notifications marked as read`,
          timestamp: new Date().toISOString(),
        });
      }

      case 'mark_all_read': {
        // Mark all notifications as read
        const markedCount =
          await sessionSystem.notificationService.markAllAsRead(user.id);

        return NextResponse.json({
          success: true,
          markedCount,
          message: `${markedCount} notifications marked as read`,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Notifications POST error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update Notification Preferences
// =====================================================

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const body = await request.json();

    const validation = updatePreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const preferences = validation.data;

    // Update user preferences
    const success =
      await sessionSystem.notificationService.updateUserPreferences(
        user.id,
        preferences
      );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 400 }
      );
    }

    // Log security event
    await sessionSystem.securityEventLogger.logEvent({
      type: 'profile_updated',
      severity: 'low',
      description: 'Notification preferences updated',
      userId: user.id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { updatedPreferences: preferences },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notifications PUT error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete Notifications
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionSystem = await initializeSessionSystem();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const clearAll = searchParams.get('clearAll') === 'true';
    const clearRead = searchParams.get('clearRead') === 'true';
    const olderThan = searchParams.get('olderThan');

    if (notificationId) {
      // Delete specific notification
      const success =
        await sessionSystem.notificationService.deleteNotification(
          notificationId,
          user.id
        );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete notification or notification not found' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification deleted successfully',
        timestamp: new Date().toISOString(),
      });
    }
    if (clearAll) {
      // Clear all notifications for user
      const deletedCount =
        await sessionSystem.notificationService.clearUserNotifications(user.id);

      // Log the cleanup
      await sessionSystem.securityEventLogger.logEvent({
        type: 'data_deletion',
        severity: 'medium',
        description: `All notifications cleared: ${deletedCount} notifications deleted`,
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { deletedCount, clearAll: true },
      });

      return NextResponse.json({
        success: true,
        deletedCount,
        message: 'All notifications cleared successfully',
        timestamp: new Date().toISOString(),
      });
    }
    if (clearRead) {
      // Clear only read notifications
      const deletedCount =
        await sessionSystem.notificationService.clearReadNotifications(user.id);

      // Log the cleanup
      await sessionSystem.securityEventLogger.logEvent({
        type: 'data_deletion',
        severity: 'low',
        description: `Read notifications cleared: ${deletedCount} notifications deleted`,
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { deletedCount, clearRead: true },
      });

      return NextResponse.json({
        success: true,
        deletedCount,
        message: 'Read notifications cleared successfully',
        timestamp: new Date().toISOString(),
      });
    }
    if (olderThan) {
      // Clear notifications older than specified date
      const cutoffDate = parseDate(olderThan);
      if (!cutoffDate) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }

      const deletedCount =
        await sessionSystem.notificationService.clearOldNotifications(
          user.id,
          cutoffDate
        );

      // Log the cleanup
      await sessionSystem.securityEventLogger.logEvent({
        type: 'data_deletion',
        severity: 'low',
        description: `Old notifications cleared: ${deletedCount} notifications deleted`,
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { deletedCount, cutoffDate: cutoffDate.toISOString() },
      });

      return NextResponse.json({
        success: true,
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
        message: 'Old notifications cleared successfully',
        timestamp: new Date().toISOString(),
      });
    }
    return NextResponse.json(
      { error: 'Invalid delete operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Notifications DELETE error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
