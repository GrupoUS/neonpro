/**
 * Sistema de Agendamento Inteligente de Notificações - NeonPro
 *
 * Componente responsável por agendar e otimizar o timing de envio de notificações,
 * utilizando ML para personalização e análise de padrões comportamentais.
 *
 * Features:
 * - Agendamento flexível (recorrente, único, condicional)
 * - Otimização por timezone e fuso horário
 * - Machine Learning para timing personalizado
 * - Rate limiting inteligente
 * - Fallback automático
 *
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */

import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { notificationManager } from '../core/notification-manager';
import { NotificationChannel, NotificationType } from '../types';

// ================================================================================
// SCHEMAS & TYPES
// ================================================================================

const ScheduleConfigSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  clinicId: z.string().uuid(),
  createdBy: z.string().uuid(),
  isActive: z.boolean().default(true),

  // Configuração da notificação
  template: z.object({
    templateId: z.string().uuid().optional(),
    content: z.string().min(1),
    subject: z.string().optional(),
    variables: z.record(z.string()).optional(),
  }),

  // Configuração de envio
  channels: z.array(z.nativeEnum(NotificationChannel)),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Configuração de agendamento
  schedule: z.object({
    type: z.enum(['immediate', 'delayed', 'recurring', 'conditional']),
    timezone: z.string().default('America/Sao_Paulo'),

    // Para agendamento atrasado
    delayMinutes: z.number().optional(),
    scheduledAt: z.string().datetime().optional(),

    // Para agendamento recorrente
    cron: z.string().optional(),
    recurrence: z
      .object({
        frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        interval: z.number().min(1).default(1),
        daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        dayOfMonth: z.number().min(1).max(31).optional(),
        endDate: z.string().datetime().optional(),
        maxOccurrences: z.number().optional(),
      })
      .optional(),

    // Para agendamento condicional
    conditions: z
      .array(
        z.object({
          field: z.string(),
          operator: z.enum([
            'equals',
            'not_equals',
            'greater_than',
            'less_than',
            'contains',
          ]),
          value: z.any(),
        })
      )
      .optional(),
  }),

  // Configuração de audiência
  audience: z.object({
    type: z.enum(['all', 'users', 'patients', 'staff', 'custom']),
    userIds: z.array(z.string().uuid()).optional(),
    filters: z
      .array(
        z.object({
          field: z.string(),
          operator: z.string(),
          value: z.any(),
        })
      )
      .optional(),
    segmentId: z.string().uuid().optional(),
  }),

  // Configurações avançadas
  options: z
    .object({
      enablePersonalization: z.boolean().default(true),
      optimizeDeliveryTime: z.boolean().default(true),
      respectQuietHours: z.boolean().default(true),
      quietHours: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/),
          end: z.string().regex(/^\d{2}:\d{2}$/),
        })
        .optional(),
      maxRetriesPerChannel: z.number().min(0).max(5).default(3),
      enableFallback: z.boolean().default(true),
      batchSize: z.number().min(1).max(1000).default(100),
    })
    .optional(),
});

type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;

interface ScheduledNotification {
  id: string;
  scheduleId: string;
  userId: string;
  channel: NotificationChannel;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  scheduledFor: Date;
  actualSentAt?: Date;
  attempt: number;
  lastError?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface OptimizationResult {
  originalTime: Date;
  optimizedTime: Date;
  confidence: number;
  reason: string;
  factors: Array<{
    factor: string;
    weight: number;
    impact: string;
  }>;
}

interface BatchExecutionResult {
  scheduleId: string;
  totalTargeted: number;
  totalQueued: number;
  totalFailed: number;
  errors: string[];
  executionTime: number;
  nextExecution?: Date;
}

// ================================================================================
// NOTIFICATION SCHEDULER
// ================================================================================

export class NotificationScheduler {
  private readonly supabase: ReturnType<typeof createClient>;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createClient();
    this.startScheduleProcessor();
  }

  // ================================================================================
  // SCHEDULE MANAGEMENT
  // ================================================================================

  /**
   * Cria um novo agendamento de notificação
   */
  async createSchedule(config: Omit<ScheduleConfig, 'id'>): Promise<string> {
    const validatedConfig = ScheduleConfigSchema.parse({
      id: crypto.randomUUID(),
      ...config,
    });

    try {
      // Inserir configuração de agendamento
      const { data: schedule, error: scheduleError } = await this.supabase
        .from('notification_schedules')
        .insert({
          id: validatedConfig.id,
          name: validatedConfig.name,
          description: validatedConfig.description,
          clinic_id: validatedConfig.clinicId,
          created_by: validatedConfig.createdBy,
          is_active: validatedConfig.isActive,
          template_config: validatedConfig.template,
          channels: validatedConfig.channels,
          priority: validatedConfig.priority,
          schedule_config: validatedConfig.schedule,
          audience_config: validatedConfig.audience,
          options: validatedConfig.options,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (scheduleError) {
        throw new Error(`Erro ao criar agendamento: ${scheduleError.message}`);
      }

      // Se for agendamento imediato, processar imediatamente
      if (validatedConfig.schedule.type === 'immediate') {
        await this.processSchedule(validatedConfig.id!);
      } else {
        // Gerar próximas execuções
        await this.generateUpcomingExecutions(validatedConfig.id!);
      }

      console.log(
        `📅 Agendamento criado: ${validatedConfig.id} - ${validatedConfig.name}`
      );
      return validatedConfig.id!;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma configuração de agendamento existente
   */
  async updateSchedule(
    scheduleId: string,
    updates: Partial<ScheduleConfig>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notification_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId);

      if (error) {
        throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      }

      // Regenerar execuções se mudou a configuração de agenda
      if (updates.schedule) {
        await this.generateUpcomingExecutions(scheduleId);
      }

      console.log(`📅 Agendamento atualizado: ${scheduleId}`);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  }

  /**
   * Cancela um agendamento
   */
  async cancelSchedule(scheduleId: string): Promise<void> {
    try {
      // Desativar agendamento
      const { error: scheduleError } = await this.supabase
        .from('notification_schedules')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId);

      if (scheduleError) {
        throw new Error(
          `Erro ao cancelar agendamento: ${scheduleError.message}`
        );
      }

      // Cancelar notificações pendentes
      const { error: notificationsError } = await this.supabase
        .from('scheduled_notifications')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('schedule_id', scheduleId)
        .eq('status', 'pending');

      if (notificationsError) {
        console.error(
          'Erro ao cancelar notificações pendentes:',
          notificationsError
        );
      }

      console.log(`📅 Agendamento cancelado: ${scheduleId}`);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }

  // ================================================================================
  // SCHEDULE PROCESSING
  // ================================================================================

  /**
   * Inicia o processador de agendamentos
   */
  private startScheduleProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Processar a cada minuto
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processScheduledNotifications();
      }
    }, 60 * 1000);

    console.log('📅 Processador de agendamentos iniciado');
  }

  /**
   * Para o processador de agendamentos
   */
  public stopScheduleProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('📅 Processador de agendamentos parado');
  }

  /**
   * Processa notificações agendadas que estão prontas para envio
   */
  private async processScheduledNotifications(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const now = new Date();

      // Buscar notificações prontas para envio
      const { data: notifications, error } = await this.supabase
        .from('scheduled_notifications')
        .select(
          `
          *,
          notification_schedules!inner(*)
        `
        )
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())
        .limit(100);

      if (error) {
        console.error('Erro ao buscar notificações agendadas:', error);
        return;
      }

      if (!notifications || notifications.length === 0) {
        return;
      }

      console.log(
        `📅 Processando ${notifications.length} notificações agendadas`
      );

      // Agrupar por agendamento para processamento em lote
      const groupedBySchedule = new Map<string, any[]>();
      notifications.forEach((notification) => {
        const scheduleId = notification.schedule_id;
        if (!groupedBySchedule.has(scheduleId)) {
          groupedBySchedule.set(scheduleId, []);
        }
        groupedBySchedule.get(scheduleId)?.push(notification);
      });

      // Processar cada grupo
      const results = await Promise.allSettled(
        Array.from(groupedBySchedule.entries()).map(
          ([scheduleId, notifications]) =>
            this.processBatch(scheduleId, notifications)
        )
      );

      // Log resultados
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Erro ao processar lote ${index}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Erro no processamento de agendamentos:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa um lote de notificações de um agendamento específico
   */
  private async processBatch(
    scheduleId: string,
    notifications: any[]
  ): Promise<BatchExecutionResult> {
    const startTime = Date.now();
    let totalQueued = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    try {
      for (const notification of notifications) {
        try {
          // Marcar como processando
          await this.supabase
            .from('scheduled_notifications')
            .update({
              status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          // Otimizar timing se necessário
          let finalTime = new Date(notification.scheduled_for);
          if (
            notification.notification_schedules.options?.optimizeDeliveryTime
          ) {
            const optimization = await this.optimizeDeliveryTime(
              notification.user_id,
              notification.channel,
              finalTime
            );
            finalTime = optimization.optimizedTime;
          }

          // Verificar quiet hours
          if (
            this.isInQuietHours(
              finalTime,
              notification.notification_schedules.options?.quietHours
            )
          ) {
            // Reagendar para fora do quiet hour
            const nextAvailable = this.findNextAvailableTime(
              finalTime,
              notification.notification_schedules.options?.quietHours
            );

            await this.supabase
              .from('scheduled_notifications')
              .update({
                scheduled_for: nextAvailable.toISOString(),
                status: 'pending',
                updated_at: new Date().toISOString(),
              })
              .eq('id', notification.id);

            continue;
          }

          // Enviar notificação
          await notificationManager.sendNotification({
            userId: notification.user_id,
            channel: notification.channel,
            type: NotificationType.CUSTOM,
            content: notification.content,
            metadata: {
              scheduleId,
              scheduledNotificationId: notification.id,
              ...notification.metadata,
            },
          });

          // Marcar como enviada
          await this.supabase
            .from('scheduled_notifications')
            .update({
              status: 'sent',
              actual_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          totalQueued++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro desconhecido';
          errors.push(`Notification ${notification.id}: ${errorMessage}`);
          totalFailed++;

          // Marcar como falha e incrementar tentativa
          await this.supabase
            .from('scheduled_notifications')
            .update({
              status: 'failed',
              last_error: errorMessage,
              attempt: notification.attempt + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          // Reagendar se ainda tem tentativas
          const maxRetries =
            notification.notification_schedules.options?.maxRetriesPerChannel ||
            3;
          if (notification.attempt < maxRetries) {
            const retryDelay = 2 ** notification.attempt * 5; // Exponential backoff
            const retryTime = new Date(Date.now() + retryDelay * 60 * 1000);

            await this.supabase
              .from('scheduled_notifications')
              .update({
                status: 'pending',
                scheduled_for: retryTime.toISOString(),
              })
              .eq('id', notification.id);
          }
        }
      }

      return {
        scheduleId,
        totalTargeted: notifications.length,
        totalQueued,
        totalFailed,
        errors,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(
        `Erro ao processar lote do agendamento ${scheduleId}:`,
        error
      );
      throw error;
    }
  }

  // ================================================================================
  // TIMING OPTIMIZATION
  // ================================================================================

  /**
   * Otimiza o horário de entrega baseado no perfil do usuário
   */
  private async optimizeDeliveryTime(
    userId: string,
    channel: NotificationChannel,
    scheduledTime: Date
  ): Promise<OptimizationResult> {
    try {
      // Buscar histórico de engajamento do usuário
      const { data: history, error } = await this.supabase
        .from('notifications')
        .select('sent_at, opened_at, clicked_at, channel')
        .eq('user_id', userId)
        .eq('channel', channel)
        .not('opened_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error || !history || history.length < 5) {
        // Dados insuficientes, usar horário original
        return {
          originalTime: scheduledTime,
          optimizedTime: scheduledTime,
          confidence: 0.1,
          reason: 'Dados insuficientes para otimização',
          factors: [],
        };
      }

      // Análise de padrões de engajamento por hora
      const hourlyEngagement = new Map<
        number,
        { count: number; avgResponseTime: number }
      >();

      history.forEach((notification) => {
        const sentHour = new Date(notification.sent_at).getHours();
        const openedAt = notification.opened_at
          ? new Date(notification.opened_at)
          : null;
        const sentAt = new Date(notification.sent_at);

        if (openedAt) {
          const responseTime =
            (openedAt.getTime() - sentAt.getTime()) / (1000 * 60); // minutos

          const current = hourlyEngagement.get(sentHour) || {
            count: 0,
            avgResponseTime: 0,
          };
          current.count++;
          current.avgResponseTime =
            (current.avgResponseTime * (current.count - 1) + responseTime) /
            current.count;
          hourlyEngagement.set(sentHour, current);
        }
      });

      // Encontrar melhor horário
      let bestHour = scheduledTime.getHours();
      let bestScore = 0;
      const factors: Array<{ factor: string; weight: number; impact: string }> =
        [];

      hourlyEngagement.forEach(({ count, avgResponseTime }, hour) => {
        if (count < 2) {
          return; // Dados insuficientes para essa hora
        }

        // Score baseado em frequência de engajamento e tempo de resposta
        const engagementScore = count / history.length;
        const responseScore = Math.max(0, (240 - avgResponseTime) / 240); // 240 min = 4h normalizado
        const combinedScore = engagementScore * 0.6 + responseScore * 0.4;

        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestHour = hour;
        }
      });

      // Aplicar otimização se encontrou um horário melhor
      const optimizedTime = new Date(scheduledTime);
      optimizedTime.setHours(bestHour, 0, 0, 0);

      // Se o horário otimizado é no passado, mover para o próximo dia
      if (optimizedTime < new Date()) {
        optimizedTime.setDate(optimizedTime.getDate() + 1);
      }

      const confidence = Math.min(bestScore, 0.9); // Máximo 90% de confiança
      const hourlyData = hourlyEngagement.get(bestHour);

      factors.push(
        {
          factor: 'Histórico de engajamento',
          weight: 0.6,
          impact: `${(((hourlyData?.count || 0) / history.length) * 100).toFixed(1)}% das interações`,
        },
        {
          factor: 'Tempo de resposta',
          weight: 0.4,
          impact: `Média de ${hourlyData?.avgResponseTime?.toFixed(0) || 0} minutos`,
        }
      );

      return {
        originalTime: scheduledTime,
        optimizedTime,
        confidence,
        reason: `Horário otimizado baseado em ${history.length} interações históricas`,
        factors,
      };
    } catch (error) {
      console.error('Erro na otimização de timing:', error);
      return {
        originalTime: scheduledTime,
        optimizedTime: scheduledTime,
        confidence: 0,
        reason: 'Erro na otimização - usando horário original',
        factors: [],
      };
    }
  }

  // ================================================================================
  // UTILITY METHODS
  // ================================================================================

  /**
   * Verifica se o horário está dentro do quiet hour
   */
  private isInQuietHours(
    time: Date,
    quietHours?: { start: string; end: string }
  ): boolean {
    if (!quietHours) {
      return false;
    }

    const hour = time.getHours();
    const minute = time.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    if (startInMinutes <= endInMinutes) {
      // Mesmo dia (ex: 22:00 - 08:00 do dia seguinte)
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    }
    // Cruza meia-noite (ex: 22:00 - 08:00 do dia seguinte)
    return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
  }

  /**
   * Encontra o próximo horário disponível fora do quiet hour
   */
  private findNextAvailableTime(
    time: Date,
    quietHours?: { start: string; end: string }
  ): Date {
    if (!quietHours) {
      return time;
    }

    const result = new Date(time);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    // Se está em quiet hour, mover para o fim do quiet hour
    if (this.isInQuietHours(result, quietHours)) {
      result.setHours(endHour, endMinute, 0, 0);

      // Se o fim do quiet hour é no dia seguinte
      if (endHour < result.getHours()) {
        result.setDate(result.getDate() + 1);
      }
    }

    return result;
  }

  /**
   * Gera execuções futuras para agendamentos recorrentes
   */
  private async generateUpcomingExecutions(scheduleId: string): Promise<void> {
    try {
      // Buscar configuração do agendamento
      const { data: schedule, error } = await this.supabase
        .from('notification_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error || !schedule) {
        throw new Error(`Agendamento não encontrado: ${scheduleId}`);
      }

      const config = schedule.schedule_config;
      if (config.type !== 'recurring' || !config.recurrence) {
        return;
      }

      // Gerar próximas 10 execuções
      const executions = this.calculateNextExecutions(config, 10);

      // Buscar audiência
      const audience = await this.resolveAudience(
        schedule.audience_config,
        schedule.clinic_id
      );

      // Criar notificações agendadas
      const notifications = executions.flatMap((executionTime) =>
        audience.map((userId) => ({
          id: crypto.randomUUID(),
          schedule_id: scheduleId,
          user_id: userId,
          channel: schedule.channels[0], // Para múltiplos canais, criar uma entrada por canal
          status: 'pending' as const,
          scheduled_for: executionTime.toISOString(),
          attempt: 0,
          content: schedule.template_config.content,
          metadata: {
            templateId: schedule.template_config.templateId,
            variables: schedule.template_config.variables,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

      if (notifications.length > 0) {
        const { error: insertError } = await this.supabase
          .from('scheduled_notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Erro ao inserir notificações agendadas:', insertError);
        } else {
          console.log(
            `📅 Geradas ${notifications.length} execuções para agendamento ${scheduleId}`
          );
        }
      }
    } catch (error) {
      console.error('Erro ao gerar execuções futuras:', error);
      throw error;
    }
  }

  /**
   * Calcula próximas execuções baseadas na configuração de recorrência
   */
  private calculateNextExecutions(config: any, limit: number): Date[] {
    const executions: Date[] = [];
    const now = new Date();
    const { recurrence } = config;

    let current = new Date(now);
    current.setSeconds(0, 0); // Zerar segundos e milissegundos

    for (let i = 0; i < limit && executions.length < limit; i++) {
      let next: Date;

      switch (recurrence.frequency) {
        case 'daily':
          next = new Date(current);
          next.setDate(current.getDate() + recurrence.interval);
          break;

        case 'weekly':
          next = new Date(current);
          next.setDate(current.getDate() + 7 * recurrence.interval);

          // Ajustar para dias da semana específicos se configurado
          if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
            const dayOfWeek = next.getDay();
            if (!recurrence.daysOfWeek.includes(dayOfWeek)) {
              // Encontrar próximo dia da semana válido
              const nextValidDay = recurrence.daysOfWeek
                .map((day) => {
                  const diff = (day - dayOfWeek + 7) % 7;
                  return diff === 0 ? 7 : diff;
                })
                .sort((a, b) => a - b)[0];

              next.setDate(next.getDate() + nextValidDay);
            }
          }
          break;

        case 'monthly':
          next = new Date(current);
          next.setMonth(current.getMonth() + recurrence.interval);

          // Ajustar dia do mês se configurado
          if (recurrence.dayOfMonth) {
            next.setDate(recurrence.dayOfMonth);
          }
          break;

        case 'yearly':
          next = new Date(current);
          next.setFullYear(current.getFullYear() + recurrence.interval);
          break;

        default:
          throw new Error(
            `Frequência de recorrência não suportada: ${recurrence.frequency}`
          );
      }

      // Verificar se passou da data limite
      if (recurrence.endDate && next > new Date(recurrence.endDate)) {
        break;
      }

      // Verificar número máximo de ocorrências
      if (
        recurrence.maxOccurrences &&
        executions.length >= recurrence.maxOccurrences
      ) {
        break;
      }

      executions.push(next);
      current = next;
    }

    return executions;
  }

  /**
   * Resolve a audiência baseada na configuração
   */
  private async resolveAudience(
    audienceConfig: any,
    clinicId: string
  ): Promise<string[]> {
    try {
      switch (audienceConfig.type) {
        case 'all': {
          const { data: allUsers } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('clinic_id', clinicId);
          return allUsers?.map((u) => u.id) || [];
        }

        case 'users':
          return audienceConfig.userIds || [];

        case 'patients': {
          const { data: patients } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('clinic_id', clinicId)
            .eq('role', 'patient');
          return patients?.map((p) => p.id) || [];
        }

        case 'staff': {
          const { data: staff } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('clinic_id', clinicId)
            .in('role', ['staff', 'manager', 'owner']);
          return staff?.map((s) => s.id) || [];
        }

        case 'custom':
          // Implementar filtros customizados baseados em audienceConfig.filters
          return await this.resolveCustomAudience(
            audienceConfig.filters,
            clinicId
          );

        default:
          return [];
      }
    } catch (error) {
      console.error('Erro ao resolver audiência:', error);
      return [];
    }
  }

  /**
   * Resolve audiência customizada baseada em filtros
   */
  private async resolveCustomAudience(
    filters: any[],
    clinicId: string
  ): Promise<string[]> {
    if (!filters || filters.length === 0) {
      return [];
    }

    try {
      let query = this.supabase
        .from('profiles')
        .select('id')
        .eq('clinic_id', clinicId);

      // Aplicar filtros
      filters.forEach((filter) => {
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.field, filter.value);
            break;
          case 'not_equals':
            query = query.neq(filter.field, filter.value);
            break;
          case 'greater_than':
            query = query.gt(filter.field, filter.value);
            break;
          case 'less_than':
            query = query.lt(filter.field, filter.value);
            break;
          case 'contains':
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
        }
      });

      const { data } = await query;
      return data?.map((u) => u.id) || [];
    } catch (error) {
      console.error('Erro ao resolver audiência customizada:', error);
      return [];
    }
  }

  /**
   * Processa um agendamento específico manualmente
   */
  async processSchedule(scheduleId: string): Promise<BatchExecutionResult> {
    try {
      const { data: schedule, error } = await this.supabase
        .from('notification_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error || !schedule) {
        throw new Error(`Agendamento não encontrado: ${scheduleId}`);
      }

      // Resolver audiência
      const audience = await this.resolveAudience(
        schedule.audience_config,
        schedule.clinic_id
      );

      // Criar notificações para envio imediato
      const notifications = audience.flatMap((userId) =>
        schedule.channels.map((channel) => ({
          id: crypto.randomUUID(),
          schedule_id: scheduleId,
          user_id: userId,
          channel,
          status: 'pending' as const,
          scheduled_for: new Date().toISOString(),
          attempt: 0,
          content: schedule.template_config.content,
          metadata: {
            templateId: schedule.template_config.templateId,
            variables: schedule.template_config.variables,
          },
        }))
      );

      // Processar em lote
      return await this.processBatch(scheduleId, notifications);
    } catch (error) {
      console.error(`Erro ao processar agendamento ${scheduleId}:`, error);
      throw error;
    }
  }
}

// ================================================================================
// EXPORT
// ================================================================================

export const notificationScheduler = new NotificationScheduler();
export type {
  ScheduleConfig,
  ScheduledNotification,
  OptimizationResult,
  BatchExecutionResult,
};
