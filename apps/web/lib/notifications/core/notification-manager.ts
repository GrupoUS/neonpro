import { createClient } from '@supabase/supabase-js';
import { AuditLogger } from '../../auth/audit/audit-logger';
import { EncryptionService } from '../../compliance/encryption';
import { TemplateEngine } from '../templates/template-engine';
import { ChannelProvider } from './channel-providers';
import { NotificationAnalytics } from './notification-analytics';
import { NotificationScheduler } from './notification-scheduler';

export interface NotificationConfig {
  id: string;
  type: NotificationTypeEnum;
  channel: NotificationChannelEnum;
  priority: NotificationPriorityEnum;
  template_id: string;
  recipient_id: string;
  recipient_type: 'patient' | 'staff' | 'admin';
  data: Record<string, any>;
  scheduled_at?: Date;
  expires_at?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationTypeEnum;
  channel: NotificationChannelEnum;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  language: string;
  frequency_limit: number;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationResult {
  id: string;
  status: 'sent' | 'failed' | 'pending' | 'scheduled';
  channel: NotificationChannelEnum;
  sent_at?: Date;
  delivered_at?: Date;
  error_message?: string;
  retry_count: number;
  cost?: number;
  engagement?: {
    opened?: boolean;
    clicked?: boolean;
    replied?: boolean;
    opened_at?: Date;
    clicked_at?: Date;
    replied_at?: Date;
  };
}

export enum NotificationTypeEnum {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  TREATMENT_UPDATE = 'treatment_update',
  PAYMENT_REMINDER = 'payment_reminder',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  MARKETING_CAMPAIGN = 'marketing_campaign',
  BIRTHDAY_GREETING = 'birthday_greeting',
  FOLLOW_UP = 'follow_up',
  EMERGENCY_ALERT = 'emergency_alert',
}

export enum NotificationChannelEnum {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app',
}

export enum NotificationPriorityEnum {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export class NotificationManager {
  private supabase;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private encryptionService: EncryptionService;
  private templateEngine: TemplateEngine;
  private channelProvider: ChannelProvider;
  private scheduler: NotificationScheduler;
  private analytics: NotificationAnalytics;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.auditLogger = new AuditLogger();
    this.lgpdManager = new LGPDManager();
    this.encryptionService = new EncryptionService();
    this.templateEngine = new TemplateEngine();
    this.channelProvider = new ChannelProvider();
    this.scheduler = new NotificationScheduler();
    this.analytics = new NotificationAnalytics();
  }

  /**
   * Envia uma notificação
   */
  async sendNotification(
    config: NotificationConfig
  ): Promise<NotificationResult> {
    try {
      // Validar configuração
      await this.validateNotificationConfig(config);

      // Verificar consentimento LGPD
      const hasConsent = await this.lgpdManager.checkConsentForNotification(
        config.recipient_id,
        config.channel,
        config.type
      );

      if (!hasConsent) {
        throw new Error(
          'Usuário não possui consentimento para este tipo de notificação'
        );
      }

      // Verificar preferências do usuário
      const preferences = await this.getUserPreferences(config.recipient_id);
      if (!this.isChannelEnabled(preferences, config.channel)) {
        throw new Error('Canal de notificação desabilitado pelo usuário');
      }

      // Verificar rate limiting
      await this.checkRateLimit(config.recipient_id, config.channel);

      // Renderizar template
      const renderedContent = await this.templateEngine.render(
        config.template_id,
        config.data
      );

      // Criptografar dados sensíveis se necessário
      const encryptedData = await this.encryptSensitiveData(
        config,
        renderedContent
      );

      // Enviar através do canal apropriado
      const result = await this.channelProvider.send({
        ...config,
        content: encryptedData.content,
        subject: encryptedData.subject,
      });

      // Salvar no banco de dados
      const notification = await this.saveNotification(config, result);

      // Log de auditoria
      await this.auditLogger.log({
        action: 'notification_sent',
        resource_type: 'notification',
        resource_id: notification.id,
        user_id: config.recipient_id,
        details: {
          type: config.type,
          channel: config.channel,
          status: result.status,
        },
      });

      // Atualizar analytics
      await this.analytics.recordNotificationSent({
        type: config.type,
        channel: config.channel,
        recipient_type: config.recipient_type,
        status: result.status,
      });

      return result;
    } catch (error) {
      await this.handleNotificationError(config, error as Error);
      throw error;
    }
  }

  /**
   * Agenda uma notificação para envio futuro
   */
  async scheduleNotification(
    config: NotificationConfig,
    scheduledAt: Date
  ): Promise<string> {
    try {
      // Validar data de agendamento
      if (scheduledAt <= new Date()) {
        throw new Error('Data de agendamento deve ser no futuro');
      }

      // Salvar notificação agendada
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          ...config,
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Agendar no scheduler
      await this.scheduler.schedule(data.id, scheduledAt);

      await this.auditLogger.log({
        action: 'notification_scheduled',
        resource_type: 'notification',
        resource_id: data.id,
        user_id: config.recipient_id,
        details: {
          type: config.type,
          channel: config.channel,
          scheduled_at: scheduledAt,
        },
      });

      return data.id;
    } catch (error) {
      throw new Error(`Erro ao agendar notificação: ${error}`);
    }
  }

  /**
   * Envia notificações em lote
   */
  async sendBulkNotifications(
    configs: NotificationConfig[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const batchSize = 100; // Processar em lotes de 100

    for (let i = 0; i < configs.length; i += batchSize) {
      const batch = configs.slice(i, i + batchSize);
      const batchPromises = batch.map((config) =>
        this.sendNotification(config).catch((error) => ({
          id: '',
          status: 'failed' as const,
          channel: config.channel,
          error_message: error.message,
          retry_count: 0,
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pequena pausa entre lotes para evitar sobrecarga
      if (i + batchSize < configs.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Obtém preferências de notificação do usuário
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar preferências: ${error.message}`);
    }

    // Retornar preferências padrão se não existir
    if (!data) {
      return {
        user_id: userId,
        email_enabled: true,
        sms_enabled: true,
        push_enabled: true,
        whatsapp_enabled: false,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        frequency_limit: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    return data;
  }

  /**
   * Atualiza preferências de notificação do usuário
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await this.auditLogger.log({
        action: 'notification_preferences_updated',
        resource_type: 'notification_preferences',
        resource_id: userId,
        user_id: userId,
        details: preferences,
      });
    } catch (error) {
      throw new Error(`Erro ao atualizar preferências: ${error}`);
    }
  }

  /**
   * Cancela uma notificação agendada
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      // Atualizar status no banco
      const { error } = await this.supabase
        .from('notifications')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('status', 'scheduled');

      if (error) throw error;

      // Cancelar no scheduler
      await this.scheduler.cancel(notificationId);

      await this.auditLogger.log({
        action: 'notification_cancelled',
        resource_type: 'notification',
        resource_id: notificationId,
        details: { reason: 'user_request' },
      });
    } catch (error) {
      throw new Error(`Erro ao cancelar notificação: ${error}`);
    }
  }

  /**
   * Obtém histórico de notificações
   */
  async getNotificationHistory(
    userId: string,
    filters?: {
      type?: NotificationTypeEnum;
      channel?: NotificationChannelEnum;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(`Erro ao buscar histórico: ${error}`);
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('recipient_id', userId);

      if (error) throw error;

      // Atualizar analytics
      await this.analytics.recordNotificationEngagement(
        notificationId,
        'opened'
      );
    } catch (error) {
      throw new Error(`Erro ao marcar como lida: ${error}`);
    }
  }

  // Métodos privados
  private async validateNotificationConfig(
    config: NotificationConfig
  ): Promise<void> {
    if (!config.recipient_id) {
      throw new Error('recipient_id é obrigatório');
    }

    if (!config.template_id) {
      throw new Error('template_id é obrigatório');
    }

    if (!Object.values(NotificationTypeEnum).includes(config.type)) {
      throw new Error('Tipo de notificação inválido');
    }

    if (!Object.values(NotificationChannelEnum).includes(config.channel)) {
      throw new Error('Canal de notificação inválido');
    }

    // Verificar se template existe
    const template = await this.templateEngine.getTemplate(config.template_id);
    if (!template) {
      throw new Error('Template não encontrado');
    }
  }

  private isChannelEnabled(
    preferences: NotificationPreferences,
    channel: NotificationChannelEnum
  ): boolean {
    switch (channel) {
      case NotificationChannelEnum.EMAIL:
        return preferences.email_enabled;
      case NotificationChannelEnum.SMS:
        return preferences.sms_enabled;
      case NotificationChannelEnum.PUSH:
        return preferences.push_enabled;
      case NotificationChannelEnum.WHATSAPP:
        return preferences.whatsapp_enabled;
      default:
        return true;
    }
  }

  private async checkRateLimit(
    userId: string,
    channel: NotificationChannelEnum
  ): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { count } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('channel', channel)
      .gte('created_at', oneDayAgo.toISOString());

    if (count && count >= preferences.frequency_limit) {
      throw new Error('Limite de frequência de notificações excedido');
    }
  }

  private async encryptSensitiveData(
    config: NotificationConfig,
    renderedContent: { subject?: string; content: string }
  ) {
    // Criptografar dados sensíveis baseado no tipo de notificação
    const sensitiveTypes = [
      NotificationTypeEnum.SECURITY_ALERT,
      NotificationTypeEnum.PAYMENT_CONFIRMATION,
      NotificationTypeEnum.TREATMENT_UPDATE,
    ];

    if (sensitiveTypes.includes(config.type)) {
      return {
        subject: renderedContent.subject
          ? await this.encryptionService.encrypt(renderedContent.subject)
          : undefined,
        content: await this.encryptionService.encrypt(renderedContent.content),
      };
    }

    return renderedContent;
  }

  private async saveNotification(
    config: NotificationConfig,
    result: NotificationResult
  ) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        ...config,
        status: result.status,
        sent_at: result.sent_at?.toISOString(),
        delivered_at: result.delivered_at?.toISOString(),
        error_message: result.error_message,
        retry_count: result.retry_count,
        cost: result.cost,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async handleNotificationError(
    config: NotificationConfig,
    error: Error
  ): Promise<void> {
    await this.auditLogger.log({
      action: 'notification_error',
      resource_type: 'notification',
      resource_id: config.id,
      user_id: config.recipient_id,
      details: {
        error: error.message,
        type: config.type,
        channel: config.channel,
      },
    });

    // Implementar retry logic se necessário
    if (this.shouldRetry(error)) {
      // Agendar retry
      await this.scheduleRetry(config);
    }
  }

  private shouldRetry(error: Error): boolean {
    // Implementar lógica de retry baseada no tipo de erro
    const retryableErrors = [
      'network_error',
      'timeout',
      'rate_limit',
      'temporary_failure',
    ];

    return retryableErrors.some((retryableError) =>
      error.message.toLowerCase().includes(retryableError)
    );
  }

  private async scheduleRetry(config: NotificationConfig): Promise<void> {
    // Implementar lógica de retry com backoff exponencial
    const retryDelay = Math.min(
      1000 * 2 ** (config.metadata?.retry_count || 0),
      300_000
    );
    const retryAt = new Date(Date.now() + retryDelay);

    await this.scheduleNotification(
      {
        ...config,
        metadata: {
          ...config.metadata,
          retry_count: (config.metadata?.retry_count || 0) + 1,
          original_attempt: config.metadata?.original_attempt || new Date(),
        },
      },
      retryAt
    );
  }
}

export default NotificationManager;
