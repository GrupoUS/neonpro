import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { AuditLogger } from '../../auth/audit/audit-logger';

export interface ScheduledNotification {
  id: string;
  notification_id: string;
  user_id?: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  template_id?: string;
  recipient: string;
  subject?: string;
  content: string;
  data?: Record<string, any>;
  scheduled_at: Date;
  timezone?: string;
  repeat_pattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    days_of_week?: number[]; // 0-6 (Sunday-Saturday)
    day_of_month?: number;
    end_date?: Date;
    max_occurrences?: number;
  };
  status: 'pending' | 'sent' | 'failed' | 'cancelled' | 'expired';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export interface ScheduleConfig {
  notification_id: string;
  user_id?: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  template_id?: string;
  recipient: string;
  subject?: string;
  content: string;
  data?: Record<string, any>;
  scheduled_at: Date;
  timezone?: string;
  repeat_pattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    days_of_week?: number[];
    day_of_month?: number;
    end_date?: Date;
    max_occurrences?: number;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  max_retries?: number;
}

export interface SchedulerStats {
  total_scheduled: number;
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
  expired: number;
  next_execution: Date | null;
  channels: Record<string, number>;
  priorities: Record<string, number>;
}

export class NotificationScheduler {
  private readonly supabase;
  private readonly auditLogger: AuditLogger;
  private readonly cronJobs: Map<string, any> = new Map();
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly batchSize = 100;
  private readonly processingIntervalMs = 60_000; // 1 minuto

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.auditLogger = new AuditLogger();
  }

  /**
   * Inicia o scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Scheduler já está em execução');
    }

    this.isRunning = true;

    // Processar notificações pendentes a cada minuto
    this.processingInterval = setInterval(
      () => this.processScheduledNotifications(),
      this.processingIntervalMs
    );

    // Limpar notificações expiradas diariamente
    cron.schedule('0 0 * * *', () => {
      this.cleanupExpiredNotifications();
    });

    await this.auditLogger.log({
      action: 'scheduler_started',
      resource_type: 'notification_scheduler',
      details: {
        batch_size: this.batchSize,
        processing_interval_ms: this.processingIntervalMs,
      },
    });

    console.log('NotificationScheduler iniciado');
  }

  /**
   * Para o scheduler
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Parar interval de processamento
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Parar todos os cron jobs
    for (const [id, job] of this.cronJobs) {
      job.stop();
      this.cronJobs.delete(id);
    }

    await this.auditLogger.log({
      action: 'scheduler_stopped',
      resource_type: 'notification_scheduler',
    });

    console.log('NotificationScheduler parado');
  }

  /**
   * Agenda uma notificação
   */
  async schedule(config: ScheduleConfig): Promise<string> {
    try {
      // Validar configuração
      await this.validateScheduleConfig(config);

      // Gerar ID único
      const scheduleId = this.generateScheduleId();

      // Preparar dados para inserção
      const scheduledNotification: Partial<ScheduledNotification> = {
        id: scheduleId,
        notification_id: config.notification_id,
        user_id: config.user_id,
        channel: config.channel,
        template_id: config.template_id,
        recipient: config.recipient,
        subject: config.subject,
        content: config.content,
        data: config.data,
        scheduled_at: config.scheduled_at,
        timezone: config.timezone || 'America/Sao_Paulo',
        repeat_pattern: config.repeat_pattern,
        status: 'pending',
        priority: config.priority || 'normal',
        metadata: config.metadata,
        created_at: new Date(),
        updated_at: new Date(),
        retry_count: 0,
        max_retries: config.max_retries || 3,
      };

      // Salvar no banco de dados
      const { error } = await this.supabase
        .from('scheduled_notifications')
        .insert(scheduledNotification);

      if (error) {
        throw error;
      }

      // Se for agendamento único e próximo, criar cron job específico
      if (!config.repeat_pattern && this.isNearFuture(config.scheduled_at)) {
        await this.createCronJob(scheduleId, config.scheduled_at);
      }

      await this.auditLogger.log({
        action: 'notification_scheduled',
        resource_type: 'scheduled_notification',
        resource_id: scheduleId,
        details: {
          channel: config.channel,
          scheduled_at: config.scheduled_at,
          recipient: config.recipient,
          has_repeat: Boolean(config.repeat_pattern),
        },
      });

      return scheduleId;
    } catch (error) {
      throw new Error(`Erro ao agendar notificação: ${error}`);
    }
  }

  /**
   * Cancela uma notificação agendada
   */
  async cancel(scheduleId: string): Promise<void> {
    try {
      // Atualizar status no banco
      const { error } = await this.supabase
        .from('scheduled_notifications')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      // Remover cron job se existir
      if (this.cronJobs.has(scheduleId)) {
        this.cronJobs.get(scheduleId).stop();
        this.cronJobs.delete(scheduleId);
      }

      await this.auditLogger.log({
        action: 'notification_cancelled',
        resource_type: 'scheduled_notification',
        resource_id: scheduleId,
      });
    } catch (error) {
      throw new Error(`Erro ao cancelar notificação: ${error}`);
    }
  }

  /**
   * Reagenda uma notificação
   */
  async reschedule(scheduleId: string, newScheduledAt: Date): Promise<void> {
    try {
      // Validar nova data
      if (newScheduledAt <= new Date()) {
        throw new Error('Nova data deve ser no futuro');
      }

      // Atualizar no banco
      const { error } = await this.supabase
        .from('scheduled_notifications')
        .update({
          scheduled_at: newScheduledAt.toISOString(),
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId);

      if (error) {
        throw error;
      }

      // Recriar cron job se necessário
      if (this.cronJobs.has(scheduleId)) {
        this.cronJobs.get(scheduleId).stop();
        this.cronJobs.delete(scheduleId);
      }

      if (this.isNearFuture(newScheduledAt)) {
        await this.createCronJob(scheduleId, newScheduledAt);
      }

      await this.auditLogger.log({
        action: 'notification_rescheduled',
        resource_type: 'scheduled_notification',
        resource_id: scheduleId,
        details: {
          new_scheduled_at: newScheduledAt,
        },
      });
    } catch (error) {
      throw new Error(`Erro ao reagendar notificação: ${error}`);
    }
  }

  /**
   * Lista notificações agendadas
   */
  async list(filters?: {
    user_id?: string;
    channel?: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<ScheduledNotification[]> {
    try {
      let query = this.supabase
        .from('scheduled_notifications')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.start_date) {
        query = query.gte('scheduled_at', filters.start_date.toISOString());
      }

      if (filters?.end_date) {
        query = query.lte('scheduled_at', filters.end_date.toISOString());
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

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Erro ao listar notificações agendadas: ${error}`);
    }
  }

  /**
   * Obtém estatísticas do scheduler
   */
  async getStats(): Promise<SchedulerStats> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_notifications')
        .select('status, channel, priority, scheduled_at');

      if (error) {
        throw error;
      }

      const stats: SchedulerStats = {
        total_scheduled: data.length,
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
        expired: 0,
        next_execution: null,
        channels: {},
        priorities: {},
      };

      // Calcular estatísticas
      data.forEach((notification) => {
        // Status
        stats[notification.status as keyof SchedulerStats] =
          (stats[notification.status as keyof SchedulerStats] as number) + 1;

        // Canais
        stats.channels[notification.channel] =
          (stats.channels[notification.channel] || 0) + 1;

        // Prioridades
        stats.priorities[notification.priority] =
          (stats.priorities[notification.priority] || 0) + 1;

        // Próxima execução
        if (notification.status === 'pending') {
          const scheduledAt = new Date(notification.scheduled_at);
          if (!stats.next_execution || scheduledAt < stats.next_execution) {
            stats.next_execution = scheduledAt;
          }
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error}`);
    }
  }

  // Métodos privados
  private async processScheduledNotifications(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const now = new Date();

      // Buscar notificações pendentes que devem ser enviadas
      const { data: notifications, error } = await this.supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', now.toISOString())
        .limit(this.batchSize);

      if (error) {
        throw error;
      }

      if (!notifications || notifications.length === 0) {
        return;
      }

      console.log(`Processando ${notifications.length} notificações agendadas`);

      // Processar cada notificação
      for (const notification of notifications) {
        try {
          await this.processNotification(notification);
        } catch (error) {
          console.error(
            `Erro ao processar notificação ${notification.id}:`,
            error
          );
          await this.handleNotificationError(notification, error as Error);
        }
      }
    } catch (error) {
      console.error('Erro no processamento de notificações agendadas:', error);
    }
  }

  private async processNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    // Marcar como sendo processada
    await this.supabase
      .from('scheduled_notifications')
      .update({ status: 'processing' })
      .eq('id', notification.id);

    // Enviar notificação através do canal apropriado
    await this.sendNotification(notification);

    // Marcar como enviada
    await this.supabase
      .from('scheduled_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notification.id);

    // Processar repetição se necessário
    if (notification.repeat_pattern) {
      await this.scheduleNextOccurrence(notification);
    }

    await this.auditLogger.log({
      action: 'scheduled_notification_sent',
      resource_type: 'scheduled_notification',
      resource_id: notification.id,
      details: {
        channel: notification.channel,
        recipient: notification.recipient,
      },
    });
  }

  private async sendNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    // Aqui seria feita a integração com o NotificationManager
    // Por enquanto, simular o envio
    console.log(
      `Enviando notificação ${notification.id} via ${notification.channel} para ${notification.recipient}`
    );

    // Simular delay de envio
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async handleNotificationError(
    notification: ScheduledNotification,
    error: Error
  ): Promise<void> {
    const retryCount = notification.retry_count + 1;

    if (retryCount <= notification.max_retries) {
      // Reagendar para retry
      const nextRetry = new Date(Date.now() + retryCount * 60_000); // Retry em 1, 2, 3 minutos

      await this.supabase
        .from('scheduled_notifications')
        .update({
          status: 'pending',
          retry_count: retryCount,
          scheduled_at: nextRetry.toISOString(),
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notification.id);
    } else {
      // Marcar como falha definitiva
      await this.supabase
        .from('scheduled_notifications')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notification.id);
    }
  }

  private async scheduleNextOccurrence(
    notification: ScheduledNotification
  ): Promise<void> {
    if (!notification.repeat_pattern) {
      return;
    }

    const pattern = notification.repeat_pattern;
    const currentDate = new Date(notification.scheduled_at);
    let nextDate: Date;

    switch (pattern.type) {
      case 'daily':
        nextDate = new Date(
          currentDate.getTime() + (pattern.interval || 1) * 24 * 60 * 60 * 1000
        );
        break;
      case 'weekly':
        nextDate = new Date(
          currentDate.getTime() +
            (pattern.interval || 1) * 7 * 24 * 60 * 60 * 1000
        );
        break;
      case 'monthly':
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + (pattern.interval || 1));
        break;
      case 'yearly':
        nextDate = new Date(currentDate);
        nextDate.setFullYear(nextDate.getFullYear() + (pattern.interval || 1));
        break;
      default:
        return;
    }

    // Verificar se deve continuar repetindo
    if (pattern.end_date && nextDate > pattern.end_date) {
      return;
    }

    // Criar nova ocorrência
    const newScheduleId = this.generateScheduleId();
    const newNotification = {
      ...notification,
      id: newScheduleId,
      scheduled_at: nextDate,
      status: 'pending' as const,
      retry_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: undefined,
      error_message: undefined,
    };

    await this.supabase.from('scheduled_notifications').insert(newNotification);
  }

  private async cleanupExpiredNotifications(): Promise<void> {
    try {
      const expiredDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás

      const { error } = await this.supabase
        .from('scheduled_notifications')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('scheduled_at', expiredDate.toISOString());

      if (error) {
        throw error;
      }

      await this.auditLogger.log({
        action: 'expired_notifications_cleaned',
        resource_type: 'notification_scheduler',
        details: { expired_before: expiredDate },
      });
    } catch (error) {
      console.error('Erro ao limpar notificações expiradas:', error);
    }
  }

  private async createCronJob(
    scheduleId: string,
    scheduledAt: Date
  ): Promise<void> {
    const cronExpression = this.dateToCronExpression(scheduledAt);

    const job = cron.schedule(
      cronExpression,
      async () => {
        try {
          const { data: notification } = await this.supabase
            .from('scheduled_notifications')
            .select('*')
            .eq('id', scheduleId)
            .eq('status', 'pending')
            .single();

          if (notification) {
            await this.processNotification(notification);
          }

          // Remover job após execução
          job.stop();
          this.cronJobs.delete(scheduleId);
        } catch (error) {
          console.error(`Erro no cron job ${scheduleId}:`, error);
        }
      },
      {
        scheduled: false,
      }
    );

    this.cronJobs.set(scheduleId, job);
    job.start();
  }

  private dateToCronExpression(date: Date): string {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const _year = date.getFullYear();

    return `${minute} ${hour} ${day} ${month} *`;
  }

  private isNearFuture(date: Date): boolean {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 0 && diffHours <= 24; // Próximas 24 horas
  }

  private async validateScheduleConfig(config: ScheduleConfig): Promise<void> {
    if (!config.notification_id) {
      throw new Error('notification_id é obrigatório');
    }

    if (!config.channel) {
      throw new Error('Canal é obrigatório');
    }

    if (!config.recipient) {
      throw new Error('Destinatário é obrigatório');
    }

    if (!config.content) {
      throw new Error('Conteúdo é obrigatório');
    }

    if (!config.scheduled_at) {
      throw new Error('Data de agendamento é obrigatória');
    }

    if (config.scheduled_at <= new Date()) {
      throw new Error('Data de agendamento deve ser no futuro');
    }

    // Validar padrão de repetição
    if (config.repeat_pattern) {
      if (
        config.repeat_pattern.end_date &&
        config.repeat_pattern.end_date <= config.scheduled_at
      ) {
        throw new Error('Data de fim deve ser posterior à data de agendamento');
      }

      if (
        config.repeat_pattern.max_occurrences &&
        config.repeat_pattern.max_occurrences <= 0
      ) {
        throw new Error('Número máximo de ocorrências deve ser positivo');
      }
    }
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default NotificationScheduler;
