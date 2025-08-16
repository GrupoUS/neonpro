import { createClient } from '@supabase/supabase-js';
import { broadcastToChannel, broadcastToUser } from '@/app/api/websocket/route';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Analytics & Trial notification types
export type AnalyticsNotificationType =
  | 'trial_started'
  | 'trial_ending'
  | 'trial_expired'
  | 'trial_converted'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'payment_successful'
  | 'payment_failed'
  | 'analytics_milestone'
  | 'system_alert'
  | 'campaign_update'
  | 'revenue_milestone'
  | 'user_milestone'
  | 'conversion_alert'
  | 'churn_alert';

export type AnalyticsNotificationData = {
  id?: string;
  type: AnalyticsNotificationType;
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('database' | 'websocket' | 'email' | 'push')[];
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  clinicId?: string;
};

export type AnalyticsNotificationTemplate = {
  type: AnalyticsNotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('database' | 'websocket' | 'email' | 'push')[];
  variables?: string[];
};

// Analytics notification templates
const ANALYTICS_NOTIFICATION_TEMPLATES: Record<
  AnalyticsNotificationType,
  AnalyticsNotificationTemplate
> = {
  trial_started: {
    type: 'trial_started',
    title: 'Trial Iniciado com Sucesso',
    message:
      'Seu trial {{trialType}} foi iniciado e expira em {{endDate}}. Aproveite todos os recursos premium!',
    priority: 'medium',
    channels: ['database', 'websocket', 'email'],
    variables: ['trialType', 'endDate'],
  },
  trial_ending: {
    type: 'trial_ending',
    title: 'Trial Terminando em Breve',
    message:
      'Seu trial {{trialType}} expira em {{daysLeft}} dias. Faça upgrade agora para continuar aproveitando os recursos premium.',
    priority: 'high',
    channels: ['database', 'websocket', 'email', 'push'],
    variables: ['trialType', 'daysLeft'],
  },
  trial_expired: {
    type: 'trial_expired',
    title: 'Trial Expirado',
    message:
      'Seu trial {{trialType}} expirou. Faça upgrade para um plano pago para restaurar o acesso aos recursos premium.',
    priority: 'urgent',
    channels: ['database', 'websocket', 'email'],
    variables: ['trialType'],
  },
  trial_converted: {
    type: 'trial_converted',
    title: 'Bem-vindo ao Premium!',
    message:
      'Parabéns! Seu trial foi convertido com sucesso para uma assinatura {{subscriptionTier}}.',
    priority: 'medium',
    channels: ['database', 'websocket', 'email'],
    variables: ['subscriptionTier'],
  },
  subscription_created: {
    type: 'subscription_created',
    title: 'Assinatura Ativada',
    message:
      'Sua assinatura {{subscriptionTier}} foi ativada. Bem-vindo aos recursos premium!',
    priority: 'medium',
    channels: ['database', 'websocket', 'email'],
    variables: ['subscriptionTier'],
  },
  subscription_updated: {
    type: 'subscription_updated',
    title: 'Assinatura Atualizada',
    message:
      'Sua assinatura foi atualizada para {{newTier}}. As mudanças entram em vigor imediatamente.',
    priority: 'medium',
    channels: ['database', 'websocket', 'email'],
    variables: ['newTier'],
  },
  subscription_cancelled: {
    type: 'subscription_cancelled',
    title: 'Assinatura Cancelada',
    message:
      'Sua assinatura foi cancelada. Você manterá o acesso até {{endDate}}.',
    priority: 'high',
    channels: ['database', 'websocket', 'email'],
    variables: ['endDate'],
  },
  payment_successful: {
    type: 'payment_successful',
    title: 'Pagamento Realizado com Sucesso',
    message:
      'Seu pagamento de {{amount}} foi processado com sucesso. Obrigado!',
    priority: 'low',
    channels: ['database', 'websocket'],
    variables: ['amount'],
  },
  payment_failed: {
    type: 'payment_failed',
    title: 'Falha no Pagamento',
    message:
      'Seu pagamento de {{amount}} não pôde ser processado. Por favor, atualize seu método de pagamento.',
    priority: 'urgent',
    channels: ['database', 'websocket', 'email'],
    variables: ['amount'],
  },
  analytics_milestone: {
    type: 'analytics_milestone',
    title: 'Marco Alcançado!',
    message: 'Parabéns! Você alcançou {{milestone}}. {{details}}',
    priority: 'medium',
    channels: ['database', 'websocket'],
    variables: ['milestone', 'details'],
  },
  system_alert: {
    type: 'system_alert',
    title: 'Alerta do Sistema',
    message: '{{alertMessage}}',
    priority: 'high',
    channels: ['database', 'websocket', 'email'],
    variables: ['alertMessage'],
  },
  campaign_update: {
    type: 'campaign_update',
    title: 'Atualização de Campanha',
    message: 'Campanha "{{campaignName}}" foi {{action}}. {{details}}',
    priority: 'medium',
    channels: ['database', 'websocket'],
    variables: ['campaignName', 'action', 'details'],
  },
  revenue_milestone: {
    type: 'revenue_milestone',
    title: 'Meta de Receita Alcançada!',
    message: 'Parabéns! Sua receita atingiu {{amount}} este mês. {{details}}',
    priority: 'medium',
    channels: ['database', 'websocket', 'email'],
    variables: ['amount', 'details'],
  },
  user_milestone: {
    type: 'user_milestone',
    title: 'Marco de Usuários Alcançado!',
    message:
      'Incrível! Você agora tem {{userCount}} usuários ativos. {{details}}',
    priority: 'medium',
    channels: ['database', 'websocket'],
    variables: ['userCount', 'details'],
  },
  conversion_alert: {
    type: 'conversion_alert',
    title: 'Alerta de Conversão',
    message: 'Taxa de conversão {{trend}} para {{rate}}%. {{recommendation}}',
    priority: 'high',
    channels: ['database', 'websocket', 'email'],
    variables: ['trend', 'rate', 'recommendation'],
  },
  churn_alert: {
    type: 'churn_alert',
    title: 'Alerta de Churn',
    message: 'Taxa de churn {{trend}} para {{rate}}%. {{actionRequired}}',
    priority: 'urgent',
    channels: ['database', 'websocket', 'email'],
    variables: ['trend', 'rate', 'actionRequired'],
  },
};

export class AnalyticsNotificationService {
  /**
   * Send an analytics notification using a template
   */
  static async sendNotification(
    type: AnalyticsNotificationType,
    userId: string,
    variables: Record<string, any> = {},
    overrides: Partial<AnalyticsNotificationData> = {}
  ): Promise<string | null> {
    try {
      const template = ANALYTICS_NOTIFICATION_TEMPLATES[type];
      if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      // Replace variables in title and message
      const title = AnalyticsNotificationService.replaceVariables(
        template.title,
        variables
      );
      const message = AnalyticsNotificationService.replaceVariables(
        template.message,
        variables
      );

      const notificationData: AnalyticsNotificationData = {
        type,
        title,
        message,
        userId,
        priority: overrides.priority || template.priority,
        channels: overrides.channels || template.channels,
        data: variables,
        scheduledFor: overrides.scheduledFor,
        expiresAt: overrides.expiresAt,
        metadata: overrides.metadata,
        clinicId: overrides.clinicId,
      };

      return await AnalyticsNotificationService.processNotification(
        notificationData
      );
    } catch (_error) {
      return null;
    }
  }

  /**
   * Send a custom analytics notification
   */
  static async sendCustomNotification(
    data: AnalyticsNotificationData
  ): Promise<string | null> {
    try {
      return await AnalyticsNotificationService.processNotification(data);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Process notification through different channels
   */
  private static async processNotification(
    data: AnalyticsNotificationData
  ): Promise<string | null> {
    const notificationId =
      await AnalyticsNotificationService.saveToDatabase(data);

    if (!notificationId) {
      return null;
    }

    // Process each channel
    const promises = data.channels.map((channel) => {
      switch (channel) {
        case 'websocket':
          return AnalyticsNotificationService.sendWebSocketNotification(data);
        case 'email':
          return AnalyticsNotificationService.sendEmailNotification(data);
        case 'push':
          return AnalyticsNotificationService.sendPushNotification(data);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);

    return notificationId;
  }

  /**
   * Save notification to database
   */
  private static async saveToDatabase(
    data: AnalyticsNotificationData
  ): Promise<string | null> {
    try {
      const { data: notification, error } = await supabase
        .from('analytics_notifications')
        .insert({
          type: data.type,
          title: data.title,
          message: data.message,
          user_id: data.userId,
          clinic_id: data.clinicId,
          priority: data.priority,
          channels: data.channels,
          data: data.data || {},
          scheduled_for: data.scheduledFor?.toISOString(),
          expires_at: data.expiresAt?.toISOString(),
          metadata: data.metadata || {},
          status: 'sent',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        return null;
      }

      return notification.id;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Send WebSocket notification
   */
  private static async sendWebSocketNotification(
    data: AnalyticsNotificationData
  ): Promise<void> {
    try {
      const wsMessage = {
        type: 'analytics_notification',
        notification: {
          id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          data: data.data,
          timestamp: new Date().toISOString(),
        },
      };

      // Send to specific user
      broadcastToUser(data.userId, wsMessage);

      // Also broadcast to analytics channel for admin monitoring
      if (data.priority === 'urgent' || data.priority === 'high') {
        broadcastToChannel('analytics', {
          type: 'user_analytics_notification',
          userId: data.userId,
          clinicId: data.clinicId,
          notification: wsMessage.notification,
        });
      }
    } catch (_error) {}
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    data: AnalyticsNotificationData
  ): Promise<void> {
    try {
      // Get user email and preferences
      const { data: user, error } = await supabase
        .from('users')
        .select('email, email_preferences, analytics_email_preferences')
        .eq('id', data.userId)
        .single();

      if (error || !user) {
        return;
      }

      // Check analytics email preferences
      const analyticsEmailPrefs = user.analytics_email_preferences || {};
      if (analyticsEmailPrefs[data.type] === false) {
        return;
      }

      // Queue email for sending
      await supabase.from('email_queue').insert({
        to_email: user.email,
        subject: data.title,
        body: data.message,
        template_type: `analytics_${data.type}`,
        template_data: data.data || {},
        priority: data.priority,
        category: 'analytics',
        scheduled_for:
          data.scheduledFor?.toISOString() || new Date().toISOString(),
      });
    } catch (_error) {}
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(
    data: AnalyticsNotificationData
  ): Promise<void> {
    try {
      // Get user's push tokens
      const { data: tokens, error } = await supabase
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', data.userId)
        .eq('active', true);

      if (error || !tokens || tokens.length === 0) {
        return;
      }

      // Queue push notifications
      const pushJobs = tokens.map((tokenData) => ({
        token: tokenData.token,
        platform: tokenData.platform,
        title: data.title,
        body: data.message,
        data: data.data || {},
        priority: data.priority,
        category: 'analytics',
        scheduled_for:
          data.scheduledFor?.toISOString() || new Date().toISOString(),
      }));

      await supabase.from('push_queue').insert(pushJobs);
    } catch (_error) {}
  }

  /**
   * Replace variables in template strings
   */
  private static replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  /**
   * Mark analytics notification as read
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analytics_notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read',
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get user analytics notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      types?: AnalyticsNotificationType[];
      clinicId?: string;
    } = {}
  ) {
    try {
      let query = supabase
        .from('analytics_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.clinicId) {
        query = query.eq('clinic_id', options.clinicId);
      }

      if (options.unreadOnly) {
        query = query.is('read_at', null);
      }

      if (options.types && options.types.length > 0) {
        query = query.in('type', options.types);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        return null;
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get unread analytics notification count
   */
  static async getUnreadCount(
    userId: string,
    clinicId?: string
  ): Promise<number> {
    try {
      let query = supabase
        .from('analytics_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { count, error } = await query;

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Send trial milestone notifications
   */
  static async sendTrialMilestoneNotification(
    userId: string,
    trialData: {
      type: string;
      daysLeft: number;
      endDate: string;
      conversionRate?: number;
    },
    clinicId?: string
  ): Promise<void> {
    try {
      let notificationType: AnalyticsNotificationType;

      if (trialData.daysLeft <= 0) {
        notificationType = 'trial_expired';
      } else if (trialData.daysLeft <= 3) {
        notificationType = 'trial_ending';
      } else {
        return; // No notification needed
      }

      await AnalyticsNotificationService.sendNotification(
        notificationType,
        userId,
        {
          trialType: trialData.type,
          daysLeft: trialData.daysLeft.toString(),
          endDate: trialData.endDate,
        },
        { clinicId }
      );
    } catch (_error) {}
  }

  /**
   * Send analytics milestone notifications
   */
  static async sendAnalyticsMilestone(
    userId: string,
    milestone: {
      type: 'revenue' | 'users' | 'conversion' | 'churn';
      value: number;
      previousValue?: number;
      target?: number;
    },
    clinicId?: string
  ): Promise<void> {
    try {
      let notificationType: AnalyticsNotificationType;
      let variables: Record<string, any> = {};

      switch (milestone.type) {
        case 'revenue':
          notificationType = 'revenue_milestone';
          variables = {
            amount: `R$ ${milestone.value.toLocaleString('pt-BR')}`,
            details: milestone.target
              ? `Meta: R$ ${milestone.target.toLocaleString('pt-BR')}`
              : 'Continue assim!',
          };
          break;

        case 'users':
          notificationType = 'user_milestone';
          variables = {
            userCount: milestone.value.toString(),
            details: 'Seu negócio está crescendo!',
          };
          break;

        case 'conversion': {
          notificationType = 'conversion_alert';
          const trend = milestone.previousValue
            ? milestone.value > milestone.previousValue
              ? 'aumentou'
              : 'diminuiu'
            : 'está em';
          variables = {
            trend,
            rate: milestone.value.toFixed(1),
            recommendation:
              milestone.value < 5
                ? 'Considere otimizar suas campanhas de conversão.'
                : 'Excelente performance!',
          };
          break;
        }

        case 'churn': {
          notificationType = 'churn_alert';
          const churnTrend = milestone.previousValue
            ? milestone.value > milestone.previousValue
              ? 'aumentou'
              : 'diminuiu'
            : 'está em';
          variables = {
            trend: churnTrend,
            rate: milestone.value.toFixed(1),
            actionRequired:
              milestone.value > 10
                ? 'Ação imediata necessária para reduzir o churn.'
                : 'Continue monitorando.',
          };
          break;
        }

        default:
          return;
      }

      await AnalyticsNotificationService.sendNotification(
        notificationType,
        userId,
        variables,
        { clinicId }
      );
    } catch (_error) {}
  }

  /**
   * Clean up old analytics notifications
   */
  static async cleanupOldNotifications(daysOld = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('analytics_notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
      }
    } catch (_error) {}
  }
}

// Export singleton instance
export const analyticsNotificationService = new AnalyticsNotificationService();
