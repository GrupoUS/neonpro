/**
 * NeonPro Backup Monitoring Service
 * Story 1.8: Sistema de Backup e Recovery
 * 
 * Serviço de monitoramento para métricas, alertas e
 * performance do sistema de backup.
 */

import { createClient } from '@supabase/supabase-js';
import { 
  BackupMetrics, 
  BackupAlert, 
  AlertType, 
  AlertSeverity,
  BackupConfig,
  BackupRecord,
  BackupStatus,
  MonitoringConfig,
  PerformanceMetrics,
  HealthCheck,
  ApiResponse,
  NotificationChannel
} from './types';
import { auditLogger } from '../auth/audit/audit-logger';
import { notificationManager } from '../notifications';

/**
 * Interface para métricas em tempo real
 */
interface RealTimeMetrics {
  activeBackups: number;
  queuedBackups: number;
  failedBackups: number;
  totalStorage: number;
  averageBackupTime: number;
  successRate: number;
  lastUpdate: Date;
}

/**
 * Serviço de monitoramento de backups
 */
export class MonitoringService {
  private supabase;
  private backupManager: any;
  private config: MonitoringConfig;
  private realTimeMetrics: RealTimeMetrics;
  private alertHistory = new Map<string, BackupAlert[]>();
  private performanceHistory: PerformanceMetrics[] = [];
  private monitoringInterval?: NodeJS.Timeout;

  constructor(backupManager: any) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.backupManager = backupManager;
    
    // Configuração padrão
    this.config = {
      enabled: true,
      checkInterval: 60000, // 1 minuto
      alertThresholds: {
        failureRate: 0.1, // 10%
        maxBackupTime: 3600, // 1 hora
        minFreeSpace: 1073741824, // 1GB
        maxRetries: 3
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        webhook: false
      },
      retention: {
        metricsRetention: 90, // 90 dias
        alertsRetention: 30 // 30 dias
      }
    };

    // Métricas iniciais
    this.realTimeMetrics = {
      activeBackups: 0,
      queuedBackups: 0,
      failedBackups: 0,
      totalStorage: 0,
      averageBackupTime: 0,
      successRate: 100,
      lastUpdate: new Date()
    };

    this.startMonitoring();
  }

  /**
   * Iniciar monitoramento
   */
  private startMonitoring(): void {
    if (this.config.enabled) {
      this.monitoringInterval = setInterval(() => {
        this.performHealthCheck();
      }, this.config.checkInterval);

      console.log('Monitoramento de backup iniciado');
    }
  }

  /**
   * Parar monitoramento
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('Monitoramento de backup parado');
    }
  }

  // ============================================================================
  // MÉTRICAS
  // ============================================================================

  /**
   * Calcular métricas de backup
   */
  async calculateMetrics(startDate?: Date, endDate?: Date): Promise<BackupMetrics> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias
      const end = endDate || new Date();

      // Buscar backups no período
      const { data: backups, error } = await this.supabase
        .from('backup_records')
        .select('*')
        .gte('startTime', start.toISOString())
        .lte('startTime', end.toISOString())
        .order('startTime', { ascending: false });

      if (error) throw error;

      const records = backups || [];
      const totalBackups = records.length;
      const successfulBackups = records.filter(b => b.status === BackupStatus.COMPLETED).length;
      const failedBackups = records.filter(b => b.status === BackupStatus.FAILED).length;
      const totalSize = records.reduce((sum, b) => sum + (b.size || 0), 0);
      const totalDuration = records
        .filter(b => b.duration)
        .reduce((sum, b) => sum + b.duration, 0);

      // Calcular métricas
      const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 100;
      const averageSize = totalBackups > 0 ? totalSize / totalBackups : 0;
      const averageDuration = records.filter(b => b.duration).length > 0 
        ? totalDuration / records.filter(b => b.duration).length 
        : 0;

      // Backup mais recente
      const lastBackup = records.length > 0 ? new Date(records[0].startTime) : null;

      // Próximo backup agendado
      const { data: nextScheduled } = await this.supabase
        .from('scheduled_tasks')
        .select('nextRun')
        .eq('status', 'SCHEDULED')
        .order('nextRun', { ascending: true })
        .limit(1)
        .single();

      const nextBackup = nextScheduled ? new Date(nextScheduled.nextRun) : null;

      // Tendências (comparar com período anterior)
      const previousPeriod = new Date(start.getTime() - (end.getTime() - start.getTime()));
      const { data: previousBackups } = await this.supabase
        .from('backup_records')
        .select('*')
        .gte('startTime', previousPeriod.toISOString())
        .lt('startTime', start.toISOString());

      const previousTotal = previousBackups?.length || 0;
      const previousSuccessful = previousBackups?.filter(b => b.status === BackupStatus.COMPLETED).length || 0;
      const previousSuccessRate = previousTotal > 0 ? (previousSuccessful / previousTotal) * 100 : 100;

      const trends = {
        backupCount: totalBackups - previousTotal,
        successRate: successRate - previousSuccessRate,
        averageSize: 0, // Calcular se necessário
        averageDuration: 0 // Calcular se necessário
      };

      return {
        totalBackups,
        successfulBackups,
        failedBackups,
        successRate,
        totalSize,
        averageSize,
        averageDuration,
        lastBackup,
        nextBackup,
        trends,
        period: {
          start,
          end
        }
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      throw error;
    }
  }

  /**
   * Obter métricas em tempo real
   */
  async getRealTimeMetrics(): Promise<ApiResponse<RealTimeMetrics>> {
    try {
      // Atualizar métricas
      await this.updateRealTimeMetrics();
      
      return {
        success: true,
        data: { ...this.realTimeMetrics },
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao obter métricas em tempo real', error);
    }
  }

  /**
   * Atualizar métricas em tempo real
   */
  private async updateRealTimeMetrics(): Promise<void> {
    try {
      // Backups ativos
      const { data: activeBackups } = await this.supabase
        .from('backup_records')
        .select('id')
        .eq('status', BackupStatus.RUNNING);

      // Backups na fila
      const { data: queuedBackups } = await this.supabase
        .from('backup_records')
        .select('id')
        .eq('status', BackupStatus.PENDING);

      // Backups falhados nas últimas 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: failedBackups } = await this.supabase
        .from('backup_records')
        .select('id')
        .eq('status', BackupStatus.FAILED)
        .gte('startTime', yesterday.toISOString());

      // Storage total
      const { data: storageData } = await this.supabase
        .from('backup_records')
        .select('size')
        .eq('status', BackupStatus.COMPLETED);

      const totalStorage = storageData?.reduce((sum, b) => sum + (b.size || 0), 0) || 0;

      // Taxa de sucesso nas últimas 24h
      const { data: recentBackups } = await this.supabase
        .from('backup_records')
        .select('status')
        .gte('startTime', yesterday.toISOString());

      const recentTotal = recentBackups?.length || 0;
      const recentSuccessful = recentBackups?.filter(b => b.status === BackupStatus.COMPLETED).length || 0;
      const successRate = recentTotal > 0 ? (recentSuccessful / recentTotal) * 100 : 100;

      // Tempo médio de backup
      const { data: completedBackups } = await this.supabase
        .from('backup_records')
        .select('duration')
        .eq('status', BackupStatus.COMPLETED)
        .gte('startTime', yesterday.toISOString())
        .not('duration', 'is', null);

      const averageBackupTime = completedBackups?.length > 0
        ? completedBackups.reduce((sum, b) => sum + b.duration, 0) / completedBackups.length
        : 0;

      // Atualizar métricas
      this.realTimeMetrics = {
        activeBackups: activeBackups?.length || 0,
        queuedBackups: queuedBackups?.length || 0,
        failedBackups: failedBackups?.length || 0,
        totalStorage,
        averageBackupTime,
        successRate,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Erro ao atualizar métricas em tempo real:', error);
    }
  }

  // ============================================================================
  // ALERTAS
  // ============================================================================

  /**
   * Criar alerta
   */
  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    details?: any,
    entityId?: string
  ): Promise<BackupAlert> {
    const alert: BackupAlert = {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      details: details || {},
      entityId,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    // Salvar no banco
    await this.supabase
      .from('backup_alerts')
      .insert(alert);

    // Adicionar ao histórico
    const entityAlerts = this.alertHistory.get(entityId || 'system') || [];
    entityAlerts.push(alert);
    this.alertHistory.set(entityId || 'system', entityAlerts);

    // Enviar notificação
    await this.sendAlertNotification(alert);

    await auditLogger.log({
      action: 'ALERT_CREATED',
      entityType: 'ALERT',
      entityId: alert.id,
      details: { type, severity, message },
      userId: 'system'
    });

    return alert;
  }

  /**
   * Enviar notificação de alerta
   */
  private async sendAlertNotification(alert: BackupAlert): Promise<void> {
    try {
      const channels: NotificationChannel[] = [];
      
      if (this.config.notifications.email) channels.push('EMAIL');
      if (this.config.notifications.sms) channels.push('SMS');
      if (this.config.notifications.push) channels.push('PUSH');

      if (channels.length === 0) return;

      const notification = {
        title: `Alerta de Backup - ${alert.severity}`,
        message: alert.message,
        data: {
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
          timestamp: alert.timestamp.toISOString()
        },
        channels,
        priority: alert.severity === AlertSeverity.CRITICAL ? 'HIGH' : 'MEDIUM'
      };

      await notificationManager.send(notification);
    } catch (error) {
      console.error('Erro ao enviar notificação de alerta:', error);
    }
  }

  /**
   * Verificar condições de alerta
   */
  private async checkAlertConditions(): Promise<void> {
    try {
      // Verificar taxa de falha
      const metrics = await this.calculateMetrics();
      
      if (metrics.successRate < (100 - this.config.alertThresholds.failureRate * 100)) {
        await this.createAlert(
          AlertType.BACKUP_FAILURE,
          AlertSeverity.HIGH,
          `Taxa de sucesso baixa: ${metrics.successRate.toFixed(1)}%`,
          { successRate: metrics.successRate, threshold: this.config.alertThresholds.failureRate }
        );
      }

      // Verificar tempo de backup
      if (metrics.averageDuration > this.config.alertThresholds.maxBackupTime) {
        await this.createAlert(
          AlertType.PERFORMANCE,
          AlertSeverity.MEDIUM,
          `Tempo de backup acima do limite: ${Math.round(metrics.averageDuration / 60)} minutos`,
          { averageDuration: metrics.averageDuration, threshold: this.config.alertThresholds.maxBackupTime }
        );
      }

      // Verificar espaço em disco (implementar conforme necessário)
      // await this.checkDiskSpace();

      // Verificar backups antigos
      await this.checkStaleBackups();

    } catch (error) {
      console.error('Erro ao verificar condições de alerta:', error);
    }
  }

  /**
   * Verificar backups antigos
   */
  private async checkStaleBackups(): Promise<void> {
    try {
      const { data: configs } = await this.supabase
        .from('backup_configs')
        .select('*')
        .eq('enabled', true);

      for (const config of configs || []) {
        const { data: lastBackup } = await this.supabase
          .from('backup_records')
          .select('startTime')
          .eq('configId', config.id)
          .eq('status', BackupStatus.COMPLETED)
          .order('startTime', { ascending: false })
          .limit(1)
          .single();

        if (lastBackup) {
          const lastBackupTime = new Date(lastBackup.startTime);
          const hoursSinceLastBackup = (Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60);
          
          // Verificar baseado na frequência do backup
          let maxHours = 24; // Default
          switch (config.schedule?.frequency) {
            case 'HOURLY': maxHours = 2; break;
            case 'DAILY': maxHours = 26; break;
            case 'WEEKLY': maxHours = 168 + 24; break; // 1 semana + 1 dia
            case 'MONTHLY': maxHours = 30 * 24 + 24; break; // 1 mês + 1 dia
          }

          if (hoursSinceLastBackup > maxHours) {
            await this.createAlert(
              AlertType.BACKUP_OVERDUE,
              AlertSeverity.HIGH,
              `Backup atrasado para configuração "${config.name}": ${Math.round(hoursSinceLastBackup)} horas`,
              { 
                configId: config.id, 
                configName: config.name,
                hoursSinceLastBackup,
                maxHours
              },
              config.id
            );
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar backups antigos:', error);
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Realizar verificação de saúde
   */
  async performHealthCheck(): Promise<HealthCheck> {
    const healthCheck: HealthCheck = {
      timestamp: new Date(),
      overall: 'HEALTHY',
      components: {
        database: 'HEALTHY',
        storage: 'HEALTHY',
        scheduler: 'HEALTHY',
        notifications: 'HEALTHY'
      },
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed,
        activeConnections: 0,
        queueSize: this.realTimeMetrics.queuedBackups
      },
      issues: []
    };

    try {
      // Verificar banco de dados
      try {
        await this.supabase.from('backup_configs').select('id').limit(1);
      } catch (error) {
        healthCheck.components.database = 'UNHEALTHY';
        healthCheck.issues.push('Falha na conexão com o banco de dados');
      }

      // Verificar scheduler
      const schedulerStats = this.backupManager.scheduler?.getSchedulerStats();
      if (!schedulerStats || schedulerStats.totalTasks === 0) {
        healthCheck.components.scheduler = 'DEGRADED';
        healthCheck.issues.push('Nenhuma tarefa agendada');
      }

      // Atualizar métricas em tempo real
      await this.updateRealTimeMetrics();

      // Verificar condições de alerta
      await this.checkAlertConditions();

      // Determinar status geral
      const componentStatuses = Object.values(healthCheck.components);
      if (componentStatuses.includes('UNHEALTHY')) {
        healthCheck.overall = 'UNHEALTHY';
      } else if (componentStatuses.includes('DEGRADED')) {
        healthCheck.overall = 'DEGRADED';
      }

      // Salvar métricas de performance
      const performanceMetric: PerformanceMetrics = {
        timestamp: new Date(),
        backupCount: this.realTimeMetrics.activeBackups,
        averageBackupTime: this.realTimeMetrics.averageBackupTime,
        successRate: this.realTimeMetrics.successRate,
        storageUsed: this.realTimeMetrics.totalStorage,
        memoryUsage: healthCheck.metrics.memoryUsage,
        cpuUsage: 0, // Implementar se necessário
        networkLatency: 0 // Implementar se necessário
      };

      this.performanceHistory.push(performanceMetric);
      
      // Manter apenas últimas 1000 entradas
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-1000);
      }

    } catch (error) {
      console.error('Erro no health check:', error);
      healthCheck.overall = 'UNHEALTHY';
      healthCheck.issues.push(`Erro interno: ${error.message}`);
    }

    return healthCheck;
  }

  // ============================================================================
  // NOTIFICAÇÕES
  // ============================================================================

  /**
   * Notificar sucesso de backup
   */
  async notifyBackupSuccess(backupId: string, config: BackupConfig): Promise<void> {
    try {
      if (config.notifications?.onSuccess) {
        const notification = {
          title: 'Backup Concluído',
          message: `Backup "${config.name}" concluído com sucesso`,
          data: {
            backupId,
            configId: config.id,
            configName: config.name
          },
          channels: ['EMAIL', 'PUSH'] as NotificationChannel[],
          priority: 'LOW' as const
        };

        await notificationManager.send(notification);
      }
    } catch (error) {
      console.error('Erro ao notificar sucesso de backup:', error);
    }
  }

  /**
   * Notificar falha de backup
   */
  async notifyBackupFailure(backupId: string, config: BackupConfig, errorMessage: string): Promise<void> {
    try {
      const notification = {
        title: 'Falha no Backup',
        message: `Backup "${config.name}" falhou: ${errorMessage}`,
        data: {
          backupId,
          configId: config.id,
          configName: config.name,
          error: errorMessage
        },
        channels: ['EMAIL', 'PUSH', 'SMS'] as NotificationChannel[],
        priority: 'HIGH' as const
      };

      await notificationManager.send(notification);

      // Criar alerta
      await this.createAlert(
        AlertType.BACKUP_FAILURE,
        AlertSeverity.HIGH,
        `Falha no backup "${config.name}": ${errorMessage}`,
        { backupId, configId: config.id, error: errorMessage },
        config.id
      );
    } catch (error) {
      console.error('Erro ao notificar falha de backup:', error);
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Obter histórico de performance
   */
  getPerformanceHistory(hours: number = 24): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceHistory.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Obter alertas ativos
   */
  async getActiveAlerts(): Promise<ApiResponse<BackupAlert[]>> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('backup_alerts')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: alerts as BackupAlert[],
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao obter alertas ativos', error);
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<ApiResponse> {
    try {
      const { error } = await this.supabase
        .from('backup_alerts')
        .update({ 
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      await auditLogger.log({
        action: 'ALERT_ACKNOWLEDGED',
        entityType: 'ALERT',
        entityId: alertId,
        details: {},
        userId
      });

      return {
        success: true,
        message: 'Alerta reconhecido',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao reconhecer alerta', error);
    }
  }

  /**
   * Resolver alerta
   */
  async resolveAlert(alertId: string, userId: string, resolution?: string): Promise<ApiResponse> {
    try {
      const { error } = await this.supabase
        .from('backup_alerts')
        .update({ 
          resolved: true,
          resolvedBy: userId,
          resolvedAt: new Date().toISOString(),
          resolution
        })
        .eq('id', alertId);

      if (error) throw error;

      await auditLogger.log({
        action: 'ALERT_RESOLVED',
        entityType: 'ALERT',
        entityId: alertId,
        details: { resolution },
        userId
      });

      return {
        success: true,
        message: 'Alerta resolvido',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao resolver alerta', error);
    }
  }

  private handleError(message: string, error: any): ApiResponse {
    console.error(message, error);
    return {
      success: false,
      error: error.message || 'Erro interno do servidor',
      message,
      timestamp: new Date(),
      requestId: crypto.randomUUID()
    };
  }
}
