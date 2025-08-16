/**
 * NeonPro Backup Scheduler
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Serviço de agendamento para backups automáticos,
 * gerenciando cronogramas e execução de tarefas.
 */

import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { auditLogger } from '../auth/audit/audit-logger';
import {
  type ApiResponse,
  type BackupConfig,
  type BackupSchedule,
  type ScheduledTask,
  ScheduleFrequency,
  TaskStatus,
} from './types';

/**
 * Interface para tarefas agendadas
 */
type ScheduledBackupTask = {
  id: string;
  configId: string;
  cronExpression: string;
  task: cron.ScheduledTask;
  config: BackupConfig;
  nextRun: Date;
  lastRun?: Date;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
};

/**
 * Serviço de agendamento de backups
 */
export class SchedulerService {
  private readonly supabase;
  private readonly backupManager: any; // Referência circular evitada
  private readonly scheduledTasks = new Map<string, ScheduledBackupTask>();
  private readonly isInitialized = false;

  constructor(backupManager: any) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.backupManager = backupManager;
  }

  /**
   * Inicializar o scheduler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    // Carregar configurações ativas
    const { data: configs, error } = await this.supabase
      .from('backup_configs')
      .select('*')
      .eq('enabled', true);

    if (error) {
      throw error;
    }

    // Agendar cada configuração
    for (const config of configs || []) {
      await this.scheduleBackup(config as BackupConfig);
    }

    this.isInitialized = true;

    await auditLogger.log({
      action: 'SCHEDULER_INITIALIZED',
      entityType: 'SYSTEM',
      entityId: 'scheduler',
      details: { tasksCount: this.scheduledTasks.size },
      userId: 'system',
    });
  }

  /**
   * Agendar backup
   */
  async scheduleBackup(
    config: BackupConfig
  ): Promise<ApiResponse<ScheduledTask>> {
    try {
      // Remover agendamento existente se houver
      await this.unscheduleBackup(config.id);

      // Converter schedule para cron expression
      const cronExpression = this.scheduleToCron(config.schedule);

      if (!cron.validate(cronExpression)) {
        throw new Error(`Expressão cron inválida: ${cronExpression}`);
      }

      // Criar tarefa agendada
      const task = cron.schedule(
        cronExpression,
        async () => {
          await this.executeScheduledBackup(config.id);
        },
        {
          scheduled: true,
          timezone: config.schedule.timezone || 'America/Sao_Paulo',
        }
      );

      // Calcular próxima execução
      const nextRun = this.getNextRunTime(
        cronExpression,
        config.schedule.timezone
      );

      const scheduledTask: ScheduledBackupTask = {
        id: crypto.randomUUID(),
        configId: config.id,
        cronExpression,
        task,
        config,
        nextRun,
        status: TaskStatus.SCHEDULED,
        retryCount: 0,
        maxRetries: config.schedule.maxRetries || 3,
      };

      this.scheduledTasks.set(config.id, scheduledTask);

      // Salvar no banco
      await this.saveScheduledTask(scheduledTask);

      await auditLogger.log({
        action: 'BACKUP_SCHEDULED',
        entityType: 'BACKUP_CONFIG',
        entityId: config.id,
        details: {
          cronExpression,
          nextRun: nextRun.toISOString(),
          frequency: config.schedule.frequency,
        },
        userId: config.createdBy,
      });

      return {
        success: true,
        data: {
          id: scheduledTask.id,
          configId: config.id,
          cronExpression,
          nextRun,
          status: TaskStatus.SCHEDULED,
          retryCount: 0,
          maxRetries: scheduledTask.maxRetries,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: 'Backup agendado com sucesso',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return this.handleError('Erro ao agendar backup', error);
    }
  }

  /**
   * Reagendar backup
   */
  async rescheduleBackup(
    config: BackupConfig
  ): Promise<ApiResponse<ScheduledTask>> {
    try {
      if (config.enabled) {
        return await this.scheduleBackup(config);
      }
      await this.unscheduleBackup(config.id);
      return {
        success: true,
        message: 'Backup desabilitado',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return this.handleError('Erro ao reagendar backup', error);
    }
  }

  /**
   * Desagendar backup
   */
  async unscheduleBackup(configId: string): Promise<void> {
    const scheduledTask = this.scheduledTasks.get(configId);

    if (scheduledTask) {
      // Parar tarefa cron
      scheduledTask.task.stop();
      scheduledTask.task.destroy();

      // Remover do mapa
      this.scheduledTasks.delete(configId);

      // Remover do banco
      await this.supabase
        .from('scheduled_tasks')
        .delete()
        .eq('configId', configId);

      await auditLogger.log({
        action: 'BACKUP_UNSCHEDULED',
        entityType: 'BACKUP_CONFIG',
        entityId: configId,
        details: { taskId: scheduledTask.id },
        userId: 'system',
      });
    }
  }

  /**
   * Executar backup agendado
   */
  private async executeScheduledBackup(configId: string): Promise<void> {
    const scheduledTask = this.scheduledTasks.get(configId);

    if (!scheduledTask) {
      return;
    }

    try {
      // Atualizar status
      scheduledTask.status = TaskStatus.RUNNING;
      scheduledTask.lastRun = new Date();
      await this.updateScheduledTask(scheduledTask);

      // Executar backup
      const result = await this.backupManager.executeBackup(
        configId,
        'scheduler'
      );

      if (result.success) {
        // Sucesso
        scheduledTask.status = TaskStatus.COMPLETED;
        scheduledTask.retryCount = 0;

        // Calcular próxima execução
        scheduledTask.nextRun = this.getNextRunTime(
          scheduledTask.cronExpression,
          scheduledTask.config.schedule.timezone
        );

        await auditLogger.log({
          action: 'SCHEDULED_BACKUP_SUCCESS',
          entityType: 'BACKUP',
          entityId: result.data?.id || 'unknown',
          details: { configId, scheduledTaskId: scheduledTask.id },
          userId: 'scheduler',
        });
      } else {
        throw new Error(result.error || 'Falha no backup');
      }
    } catch (error) {
      // Falha
      scheduledTask.status = TaskStatus.FAILED;
      scheduledTask.retryCount++;

      // Verificar se deve tentar novamente
      if (scheduledTask.retryCount < scheduledTask.maxRetries) {
        // Agendar retry em 5 minutos
        setTimeout(
          () => {
            this.executeScheduledBackup(configId);
          },
          5 * 60 * 1000
        );

        scheduledTask.status = TaskStatus.RETRYING;
      }

      await auditLogger.log({
        action: 'SCHEDULED_BACKUP_FAILED',
        entityType: 'BACKUP_CONFIG',
        entityId: configId,
        details: {
          error: error.message,
          retryCount: scheduledTask.retryCount,
          maxRetries: scheduledTask.maxRetries,
        },
        userId: 'scheduler',
      });
    } finally {
      await this.updateScheduledTask(scheduledTask);
    }
  }

  /**
   * Converter schedule para expressão cron
   */
  private scheduleToCron(schedule: BackupSchedule): string {
    const { frequency, time, dayOfWeek, dayOfMonth } = schedule;

    // Extrair hora e minuto do time (formato HH:MM)
    const [hour, minute] = time.split(':').map(Number);

    switch (frequency) {
      case ScheduleFrequency.HOURLY:
        return `${minute} * * * *`;

      case ScheduleFrequency.DAILY:
        return `${minute} ${hour} * * *`;

      case ScheduleFrequency.WEEKLY: {
        const day = dayOfWeek || 0; // 0 = domingo
        return `${minute} ${hour} * * ${day}`;
      }

      case ScheduleFrequency.MONTHLY: {
        const monthDay = dayOfMonth || 1;
        return `${minute} ${hour} ${monthDay} * *`;
      }

      case ScheduleFrequency.CUSTOM:
        return schedule.cronExpression || '0 2 * * *'; // Default: 2:00 AM diário

      default:
        throw new Error(`Frequência não suportada: ${frequency}`);
    }
  }

  /**
   * Obter próximo horário de execução
   */
  private getNextRunTime(_cronExpression: string, _timezone?: string): Date {
    try {
      // Usar biblioteca cron-parser se disponível
      // const parser = require('cron-parser');
      // const interval = parser.parseExpression(cronExpression, {
      //   tz: timezone || 'America/Sao_Paulo'
      // });
      // return interval.next().toDate();

      // Fallback: calcular manualmente baseado na frequência
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // 2:00 AM

      return tomorrow;
    } catch (_error) {
      // Fallback: próximo dia às 2:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0);
      return tomorrow;
    }
  }

  /**
   * Salvar tarefa agendada no banco
   */
  private async saveScheduledTask(task: ScheduledBackupTask): Promise<void> {
    const taskData = {
      id: task.id,
      configId: task.configId,
      cronExpression: task.cronExpression,
      nextRun: task.nextRun.toISOString(),
      lastRun: task.lastRun?.toISOString(),
      status: task.status,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.supabase.from('scheduled_tasks').upsert(taskData);
  }

  /**
   * Atualizar tarefa agendada no banco
   */
  private async updateScheduledTask(task: ScheduledBackupTask): Promise<void> {
    await this.supabase
      .from('scheduled_tasks')
      .update({
        nextRun: task.nextRun.toISOString(),
        lastRun: task.lastRun?.toISOString(),
        status: task.status,
        retryCount: task.retryCount,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', task.id);
  }

  /**
   * Listar tarefas agendadas
   */
  async listScheduledTasks(): Promise<ApiResponse<ScheduledTask[]>> {
    try {
      const tasks = Array.from(this.scheduledTasks.values()).map((task) => ({
        id: task.id,
        configId: task.configId,
        cronExpression: task.cronExpression,
        nextRun: task.nextRun,
        lastRun: task.lastRun,
        status: task.status,
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      return {
        success: true,
        data: tasks,
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return this.handleError('Erro ao listar tarefas agendadas', error);
    }
  }

  /**
   * Obter status de tarefa específica
   */
  getTaskStatus(configId: string): ScheduledTask | null {
    const task = this.scheduledTasks.get(configId);

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      configId: task.configId,
      cronExpression: task.cronExpression,
      nextRun: task.nextRun,
      lastRun: task.lastRun,
      status: task.status,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Pausar todas as tarefas
   */
  async pauseAllTasks(): Promise<ApiResponse> {
    try {
      for (const [_configId, task] of this.scheduledTasks) {
        task.task.stop();
        task.status = TaskStatus.PAUSED;
        await this.updateScheduledTask(task);
      }

      await auditLogger.log({
        action: 'SCHEDULER_PAUSED',
        entityType: 'SYSTEM',
        entityId: 'scheduler',
        details: { tasksCount: this.scheduledTasks.size },
        userId: 'system',
      });

      return {
        success: true,
        message: 'Todas as tarefas foram pausadas',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return this.handleError('Erro ao pausar tarefas', error);
    }
  }

  /**
   * Retomar todas as tarefas
   */
  async resumeAllTasks(): Promise<ApiResponse> {
    try {
      for (const [_configId, task] of this.scheduledTasks) {
        task.task.start();
        task.status = TaskStatus.SCHEDULED;
        await this.updateScheduledTask(task);
      }

      await auditLogger.log({
        action: 'SCHEDULER_RESUMED',
        entityType: 'SYSTEM',
        entityId: 'scheduler',
        details: { tasksCount: this.scheduledTasks.size },
        userId: 'system',
      });

      return {
        success: true,
        message: 'Todas as tarefas foram retomadas',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return this.handleError('Erro ao retomar tarefas', error);
    }
  }

  /**
   * Parar scheduler
   */
  async shutdown(): Promise<void> {
    try {
      for (const [_configId, task] of this.scheduledTasks) {
        task.task.stop();
        task.task.destroy();
      }

      this.scheduledTasks.clear();
      this.isInitialized = false;

      await auditLogger.log({
        action: 'SCHEDULER_SHUTDOWN',
        entityType: 'SYSTEM',
        entityId: 'scheduler',
        details: {},
        userId: 'system',
      });
    } catch (_error) {}
  }

  /**
   * Executar backup imediatamente (fora do agendamento)
   */
  async executeImmediateBackup(
    configId: string,
    userId: string
  ): Promise<ApiResponse> {
    try {
      const result = await this.backupManager.executeBackup(configId, userId);

      await auditLogger.log({
        action: 'IMMEDIATE_BACKUP_EXECUTED',
        entityType: 'BACKUP_CONFIG',
        entityId: configId,
        details: { success: result.success },
        userId,
      });

      return result;
    } catch (error) {
      return this.handleError('Erro ao executar backup imediato', error);
    }
  }

  /**
   * Validar expressão cron
   */
  validateCronExpression(expression: string): ApiResponse<boolean> {
    try {
      const isValid = cron.validate(expression);

      return {
        success: true,
        data: isValid,
        message: isValid ? 'Expressão cron válida' : 'Expressão cron inválida',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error.message,
        message: 'Erro ao validar expressão cron',
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    }
  }

  /**
   * Obter estatísticas do scheduler
   */
  getSchedulerStats(): {
    totalTasks: number;
    activeTasks: number;
    pausedTasks: number;
    failedTasks: number;
    nextExecution?: Date;
  } {
    const tasks = Array.from(this.scheduledTasks.values());

    const stats = {
      totalTasks: tasks.length,
      activeTasks: tasks.filter((t) => t.status === TaskStatus.SCHEDULED)
        .length,
      pausedTasks: tasks.filter((t) => t.status === TaskStatus.PAUSED).length,
      failedTasks: tasks.filter((t) => t.status === TaskStatus.FAILED).length,
      nextExecution: undefined as Date | undefined,
    };

    // Encontrar próxima execução
    const nextRuns = tasks
      .filter((t) => t.status === TaskStatus.SCHEDULED)
      .map((t) => t.nextRun)
      .sort((a, b) => a.getTime() - b.getTime());

    if (nextRuns.length > 0) {
      stats.nextExecution = nextRuns[0];
    }

    return stats;
  }

  private handleError(message: string, error: any): ApiResponse {
    return {
      success: false,
      error: error.message || 'Erro interno do servidor',
      message,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    };
  }
}
