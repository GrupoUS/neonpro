/**
 * NeonPro Notification System - Core Manager
 * Story 1.7: Sistema de Notificações
 *
 * Gerenciador central do sistema de notificações
 * Coordena envio, templates, canais e automação
 */

import { createClient } from '@supabase/supabase-js';
// import { RuleEngine } from './rule-engine';
// import { MetricsCollector } from './metrics-collector';
import { auditLogger } from '../auth/audit/audit-logger';
import { ChannelOrchestrator } from './channels/channel-orchestrator';
import { TemplateEngine } from './template-engine';
import {
  type BaseNotification,
  type DeliveryNotification,
  type DeliveryResult,
  NotificationCategory,
  type NotificationChannel,
  type NotificationContext,
  type NotificationEvent,
  type NotificationFilters,
  type NotificationMetrics,
  NotificationPriority,
  type NotificationRecipient,
  NotificationStatus,
  type NotificationSystemConfig,
  type NotificationTemplate,
  NotificationType,
  type PaginatedResult,
  type PaginationOptions,
} from './types';

// ============================================================================
// NOTIFICATION MANAGER CLASS
// ============================================================================

/**
 * Gerenciador central do sistema de notificações
 */
class NotificationManager {
  private supabase: any;
  private templateEngine: TemplateEngine;
  private channelManager: ChannelOrchestrator;
  // private ruleEngine: RuleEngine;
  // private metricsCollector: MetricsCollector;
  private config: NotificationSystemConfig;
  private isInitialized = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.templateEngine = new TemplateEngine();
    this.channelManager = new ChannelOrchestrator();
    // this.ruleEngine = new RuleEngine();
    // this.metricsCollector = new MetricsCollector();
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  /**
   * Inicializa o sistema de notificações
   */
  async initialize(config: NotificationSystemConfig): Promise<void> {
    try {
      this.config = config;

      // Inicializar componentes
      await this.templateEngine.initialize();
      await this.channelManager.initialize(config.channels);
      // await this.ruleEngine.initialize();
      // await this.metricsCollector.initialize();

      // Carregar templates e regras do banco
      await this.loadTemplates();
      await this.loadRules();

      this.isInitialized = true;

      await auditLogger.log({
        action: 'notification_system_initialized',
        category: 'system',
        severity: 'info',
        details: {
          channelsEnabled: config.channels.filter((c) => c.isEnabled).length,
          analyticsEnabled: config.analytics.enabled,
          lgpdCompliance: config.compliance.lgpd.enabled,
        },
      });
    } catch (error) {
      await auditLogger.log({
        action: 'notification_system_init_failed',
        category: 'system',
        severity: 'error',
        details: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Verifica se o sistema está inicializado
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'NotificationManager não foi inicializado. Chame initialize() primeiro.'
      );
    }
  }

  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Envia uma notificação
   */
  async sendNotification(
    type: NotificationType,
    recipient: NotificationRecipient,
    data: Record<string, any>,
    options?: {
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
      scheduledFor?: Date;
      template?: string;
    }
  ): Promise<DeliveryResult[]> {
    this.ensureInitialized();

    try {
      // Criar notificação base
      const notification = await this.createNotification(
        type,
        data,
        options?.priority
      );

      // Determinar canais de entrega
      const channels = this.determineChannels(
        recipient,
        type,
        options?.channels
      );

      // Verificar rate limiting
      await this.checkRateLimit(recipient, channels);

      // Criar notificações de entrega para cada canal
      const deliveryNotifications = await Promise.all(
        channels.map((channel) =>
          this.createDeliveryNotification(
            notification,
            recipient,
            channel,
            options
          )
        )
      );

      // Enviar notificações
      const results = await Promise.all(
        deliveryNotifications.map((dn) => this.deliverNotification(dn))
      );

      // Registrar métricas
      // await this.metricsCollector.recordDelivery(deliveryNotifications, results);

      // Log de auditoria
      await auditLogger.log({
        action: 'notification_sent',
        category: 'notification',
        severity: 'info',
        details: {
          type,
          recipientId: recipient.id,
          channels: channels.length,
          success: results.filter((r) => r.success).length,
        },
      });

      return results;
    } catch (error) {
      await auditLogger.log({
        action: 'notification_send_failed',
        category: 'notification',
        severity: 'error',
        details: {
          type,
          recipientId: recipient.id,
          error: error.message,
        },
      });
      throw error;
    }
  }

  /**
   * Envia notificação em lote
   */
  async sendBulkNotification(
    type: NotificationType,
    recipients: NotificationRecipient[],
    data: Record<string, any>,
    options?: {
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
      batchSize?: number;
    }
  ): Promise<DeliveryResult[][]> {
    this.ensureInitialized();

    const batchSize = options?.batchSize || 100;
    const results: DeliveryResult[][] = [];

    // Processar em lotes
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((recipient) =>
          this.sendNotification(type, recipient, data, options)
        )
      );

      results.push(...batchResults);

      // Delay entre lotes para evitar sobrecarga
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // ============================================================================
  // CRIAÇÃO DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Cria uma notificação base
   */
  private async createNotification(
    type: NotificationType,
    data: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<BaseNotification> {
    const category = this.getNotificationCategory(type);

    const notification: BaseNotification = {
      id: crypto.randomUUID(),
      type,
      category,
      priority,
      title: data.title || this.getDefaultTitle(type),
      message: data.message || '',
      data,
      metadata: {
        source: 'notification-manager',
        version: '1.0.0',
        correlationId: data.correlationId || crypto.randomUUID(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar no banco
    const { error } = await this.supabase
      .from('notifications')
      .insert(notification);

    if (error) {
      throw new Error(`Erro ao salvar notificação: ${error.message}`);
    }

    return notification;
  }

  /**
   * Cria uma notificação de entrega
   */
  private async createDeliveryNotification(
    notification: BaseNotification,
    recipient: NotificationRecipient,
    channel: NotificationChannel,
    options?: {
      scheduledFor?: Date;
      template?: string;
    }
  ): Promise<DeliveryNotification> {
    // Buscar template
    const template = await this.getTemplate(
      notification.type,
      channel,
      options?.template
    );

    // Renderizar conteúdo
    const context: NotificationContext = {
      recipient,
      clinic: await this.getClinicInfo(recipient.id),
      data: notification.data || {},
      timestamp: new Date(),
      locale: recipient.language || 'pt-BR',
    };

    const renderedContent = await this.templateEngine.render(template, context);

    const deliveryNotification: DeliveryNotification = {
      ...notification,
      title: renderedContent.title,
      message: renderedContent.body,
      recipient,
      channel,
      template,
      scheduledFor: options?.scheduledFor,
      attempts: [],
      status: NotificationStatus.PENDING,
    };

    // Salvar no banco
    const { error } = await this.supabase
      .from('notification_deliveries')
      .insert({
        id: crypto.randomUUID(),
        notification_id: notification.id,
        recipient_id: recipient.id,
        channel,
        template_id: template?.id,
        scheduled_for: options?.scheduledFor,
        status: NotificationStatus.PENDING,
        created_at: new Date(),
      });

    if (error) {
      throw new Error(`Erro ao salvar delivery: ${error.message}`);
    }

    return deliveryNotification;
  }

  // ============================================================================
  // ENTREGA DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Entrega uma notificação
   */
  private async deliverNotification(
    notification: DeliveryNotification
  ): Promise<DeliveryResult> {
    try {
      // Verificar se deve ser agendada
      if (notification.scheduledFor && notification.scheduledFor > new Date()) {
        await this.scheduleNotification(notification);
        return {
          success: true,
          status: NotificationStatus.PENDING,
          messageId: `scheduled_${notification.id}`,
        };
      }

      // Entregar através do canal
      const result = await this.channelManager.deliver(notification);

      // Atualizar status
      await this.updateDeliveryStatus(notification.id, result);

      // Registrar evento
      await this.recordNotificationEvent(notification.id, 'sent', {
        channel: notification.channel,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      const result: DeliveryResult = {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message,
      };

      await this.updateDeliveryStatus(notification.id, result);
      await this.recordNotificationEvent(notification.id, 'failed', {
        error: error.message,
      });

      return result;
    }
  }

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  /**
   * Busca template para notificação
   */
  private async getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    templateId?: string
  ): Promise<NotificationTemplate | undefined> {
    if (templateId) {
      return await this.templateEngine.getTemplate(templateId);
    }

    return await this.templateEngine.getTemplateByType(type, channel);
  }

  /**
   * Carrega templates do banco
   */
  private async loadTemplates(): Promise<void> {
    const { data: templates, error } = await this.supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Erro ao carregar templates: ${error.message}`);
    }

    for (const template of templates || []) {
      await this.templateEngine.addTemplate(template);
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Determina canais de entrega baseado nas preferências
   */
  private determineChannels(
    recipient: NotificationRecipient,
    type: NotificationType,
    requestedChannels?: NotificationChannel[]
  ): NotificationChannel[] {
    const category = this.getNotificationCategory(type);
    const preferences = recipient.preferences;

    if (requestedChannels) {
      // Filtrar apenas canais habilitados nas preferências
      return requestedChannels.filter(
        (channel) =>
          preferences.channels[channel] &&
          preferences.categories[category]?.channels.includes(channel)
      );
    }

    // Usar preferências do usuário
    return (
      preferences.categories[category]?.channels || [this.config.defaultChannel]
    );
  }

  /**
   * Obtém categoria da notificação
   */
  private getNotificationCategory(
    type: NotificationType
  ): NotificationCategory {
    const categoryMap: Record<string, NotificationCategory> = {
      appointment_: NotificationCategory.APPOINTMENT,
      patient_: NotificationCategory.PATIENT,
      system_: NotificationCategory.SYSTEM,
      security_: NotificationCategory.SECURITY,
      payment_: NotificationCategory.PAYMENT,
      promotional_: NotificationCategory.MARKETING,
      newsletter: NotificationCategory.MARKETING,
      campaign_: NotificationCategory.MARKETING,
      staff_: NotificationCategory.STAFF,
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (type.startsWith(prefix)) {
        return category;
      }
    }

    return NotificationCategory.SYSTEM;
  }

  /**
   * Obtém título padrão para tipo de notificação
   */
  private getDefaultTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      [NotificationType.APPOINTMENT_CREATED]: 'Agendamento Criado',
      [NotificationType.APPOINTMENT_UPDATED]: 'Agendamento Atualizado',
      [NotificationType.APPOINTMENT_CANCELLED]: 'Agendamento Cancelado',
      [NotificationType.APPOINTMENT_REMINDER]: 'Lembrete de Consulta',
      [NotificationType.APPOINTMENT_CONFIRMATION]: 'Confirmação de Consulta',
      [NotificationType.PATIENT_REGISTERED]: 'Cadastro Realizado',
      [NotificationType.PATIENT_UPDATED]: 'Dados Atualizados',
      [NotificationType.PATIENT_BIRTHDAY]: 'Feliz Aniversário!',
      [NotificationType.PATIENT_FOLLOW_UP]: 'Acompanhamento',
      [NotificationType.SYSTEM_MAINTENANCE]: 'Manutenção do Sistema',
      [NotificationType.SYSTEM_UPDATE]: 'Atualização do Sistema',
      [NotificationType.SYSTEM_ALERT]: 'Alerta do Sistema',
      [NotificationType.SECURITY_ALERT]: 'Alerta de Segurança',
      [NotificationType.PAYMENT_RECEIVED]: 'Pagamento Recebido',
      [NotificationType.PAYMENT_FAILED]: 'Falha no Pagamento',
      [NotificationType.PAYMENT_REMINDER]: 'Lembrete de Pagamento',
      [NotificationType.INVOICE_GENERATED]: 'Fatura Gerada',
      [NotificationType.PROMOTIONAL_OFFER]: 'Oferta Especial',
      [NotificationType.NEWSLETTER]: 'Newsletter',
      [NotificationType.CAMPAIGN_MESSAGE]: 'Mensagem da Campanha',
      [NotificationType.STAFF_SCHEDULE_CHANGE]: 'Mudança de Horário',
      [NotificationType.STAFF_TASK_ASSIGNED]: 'Nova Tarefa',
      [NotificationType.STAFF_PERFORMANCE_REPORT]: 'Relatório de Performance',
    };

    return titles[type] || 'Notificação';
  }

  /**
   * Obtém informações da clínica
   */
  private async getClinicInfo(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('clinics')
      .select('*')
      .eq('owner_id', userId)
      .single();

    return (
      data || {
        id: 'default',
        name: 'NeonPro Clinic',
        contact: {
          phone: '(11) 99999-9999',
          email: 'contato@neonpro.com',
          address: 'São Paulo, SP',
        },
      }
    );
  }

  /**
   * Verifica rate limiting
   */
  private async checkRateLimit(
    recipient: NotificationRecipient,
    channels: NotificationChannel[]
  ): Promise<void> {
    if (!this.config.rateLimiting.enabled) return;

    // Implementar verificação de rate limiting
    // Por simplicidade, apenas log por enquanto
    await auditLogger.log({
      action: 'rate_limit_check',
      category: 'notification',
      severity: 'info',
      details: {
        recipientId: recipient.id,
        channels: channels.length,
      },
    });
  }

  /**
   * Agenda notificação
   */
  private async scheduleNotification(
    notification: DeliveryNotification
  ): Promise<void> {
    // Implementar agendamento (pode usar cron jobs, queue, etc.)
    await auditLogger.log({
      action: 'notification_scheduled',
      category: 'notification',
      severity: 'info',
      details: {
        notificationId: notification.id,
        scheduledFor: notification.scheduledFor,
      },
    });
  }

  /**
   * Atualiza status de entrega
   */
  private async updateDeliveryStatus(
    notificationId: string,
    result: DeliveryResult
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notification_deliveries')
      .update({
        status: result.status,
        message_id: result.messageId,
        error_message: result.error,
        delivered_at: result.success ? new Date() : null,
        updated_at: new Date(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  /**
   * Registra evento de notificação
   */
  private async recordNotificationEvent(
    notificationId: string,
    event: string,
    data?: Record<string, any>
  ): Promise<void> {
    const notificationEvent: NotificationEvent = {
      id: crypto.randomUUID(),
      notificationId,
      event: event as any,
      timestamp: new Date(),
      data,
    };

    const { error } = await this.supabase
      .from('notification_events')
      .insert(notificationEvent);

    if (error) {
      console.error('Erro ao registrar evento:', error);
    }
  }

  /**
   * Carrega regras de automação
   */
  private async loadRules(): Promise<void> {
    const { data: rules, error } = await this.supabase
      .from('notification_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Erro ao carregar regras: ${error.message}`);
    }

    for (const _rule of rules || []) {
      // await this.ruleEngine.addRule(rule);
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS DE CONSULTA
  // ============================================================================

  /**
   * Busca notificações com filtros
   */
  async getNotifications(
    filters: NotificationFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<DeliveryNotification>> {
    this.ensureInitialized();

    let query = this.supabase.from('notification_deliveries').select(`
        *,
        notification:notifications(*),
        recipient:recipients(*)
      `);

    // Aplicar filtros
    if (filters.types?.length) {
      query = query.in('notification.type', filters.types);
    }

    if (filters.statuses?.length) {
      query = query.in('status', filters.statuses);
    }

    if (filters.recipientId) {
      query = query.eq('recipient_id', filters.recipientId);
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    // Paginação
    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .range(offset, offset + pagination.limit - 1)
      .order(pagination.sortBy || 'created_at', {
        ascending: pagination.sortOrder === 'asc',
      });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar notificações: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit),
        hasNext: offset + pagination.limit < (count || 0),
        hasPrev: pagination.page > 1,
      },
    };
  }

  /**
   * Obtém métricas de notificação
   */
  async getMetrics(
    _startDate: Date,
    _endDate: Date,
    _filters?: NotificationFilters
  ): Promise<NotificationMetrics> {
    this.ensureInitialized();
    // return await this.metricsCollector.getMetrics(startDate, endDate, filters);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      channels: {},
      trends: [],
    };
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    this.ensureInitialized();

    const { error } = await this.supabase
      .from('notification_deliveries')
      .update({
        status: NotificationStatus.READ,
        read_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) {
      throw new Error(`Erro ao marcar como lida: ${error.message}`);
    }

    await this.recordNotificationEvent(notificationId, 'read', { userId });
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

let notificationManager: NotificationManager | null = null;

/**
 * Obtém instância singleton do NotificationManager
 */
export function getNotificationManager(): NotificationManager {
  if (!notificationManager) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    notificationManager = new NotificationManager(supabaseUrl, supabaseKey);
  }
  return notificationManager;
}

/**
 * Inicializa o sistema de notificações
 */
export async function initializeNotificationSystem(
  config: NotificationSystemConfig
): Promise<NotificationManager> {
  const manager = getNotificationManager();
  await manager.initialize(config);
  return manager;
}

export { NotificationManager };
