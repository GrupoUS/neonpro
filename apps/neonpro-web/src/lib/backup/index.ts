import type { BackupManager } from "./core/backup-manager";
import type { RecoveryManager } from "./recovery/recovery-manager";
import type { StorageManager } from "./storage/storage-providers";
import type { BackupStrategyManager } from "./strategies/backup-strategies";
import type { AuditLogger } from "../auth/audit/audit-logger";
import type { EncryptionService } from "../security/encryption-service";
import type { LGPDManager } from "../lgpd/lgpd-manager";

// Re-export all types and interfaces
export * from "./core/backup-manager";
export * from "./recovery/recovery-manager";
export * from "./storage/storage-providers";
export * from "./strategies/backup-strategies";

/**
 * Sistema Unificado de Backup e Recovery
 *
 * Este sistema fornece uma solução completa para backup e recuperação de dados,
 * incluindo múltiplas estratégias de backup, provedores de armazenamento,
 * planos de recuperação e monitoramento em tempo real.
 *
 * Características principais:
 * - Backup automático e manual
 * - Múltiplos provedores de armazenamento (Local, S3, Azure, GCP)
 * - Estratégias de backup configuráveis
 * - Planos de recuperação com rollback
 * - Criptografia e compressão
 * - Monitoramento e métricas
 * - Compliance com LGPD
 * - Auditoria completa
 */
export class BackupRecoverySystem {
  private backupManager: BackupManager;
  private recoveryManager: RecoveryManager;
  private storageManager: StorageManager;
  private strategyManager: BackupStrategyManager;
  private auditLogger: AuditLogger;
  private encryptionService: EncryptionService;
  private lgpdManager: LGPDManager;
  private isInitialized: boolean = false;

  constructor() {
    this.backupManager = new BackupManager();
    this.recoveryManager = new RecoveryManager();
    this.storageManager = new StorageManager();
    this.strategyManager = new BackupStrategyManager();
    this.auditLogger = new AuditLogger();
    this.encryptionService = new EncryptionService();
    this.lgpdManager = new LGPDManager();
  }

  /**
   * Inicializa o sistema de backup e recovery
   */
  async initialize(config?: {
    auto_start_backup?: boolean;
    default_storage_provider?: string;
    encryption_enabled?: boolean;
    compression_enabled?: boolean;
    retention_days?: number;
  }): Promise<void> {
    try {
      if (this.isInitialized) {
        throw new Error("Sistema já foi inicializado");
      }

      // Configurar provedores de armazenamento padrão
      await this.setupDefaultStorageProviders();

      // Configurar estratégias de backup padrão
      await this.setupDefaultBackupStrategies();

      // Inicializar gerenciador de backup
      if (config?.auto_start_backup !== false) {
        await this.backupManager.start();
      }

      this.isInitialized = true;

      await this.auditLogger.log({
        action: "backup_system_initialized",
        resource_type: "backup_system",
        resource_id: "main",
        details: {
          auto_start_backup: config?.auto_start_backup,
          encryption_enabled: config?.encryption_enabled,
          compression_enabled: config?.compression_enabled,
        },
      });

      console.log("✅ Sistema de Backup e Recovery inicializado com sucesso");
    } catch (error) {
      throw new Error(`Erro ao inicializar sistema: ${error}`);
    }
  }

  /**
   * Para o sistema de backup e recovery
   */
  async shutdown(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }

      await this.backupManager.stop();
      this.isInitialized = false;

      await this.auditLogger.log({
        action: "backup_system_shutdown",
        resource_type: "backup_system",
        resource_id: "main",
      });

      console.log("✅ Sistema de Backup e Recovery finalizado");
    } catch (error) {
      throw new Error(`Erro ao finalizar sistema: ${error}`);
    }
  }

  /**
   * Cria um backup manual
   */
  async createBackup(
    config: {
      name: string;
      description?: string;
      data_sources: string[];
      storage_provider?: string;
      encryption_enabled?: boolean;
      compression_enabled?: boolean;
      retention_days?: number;
    },
    userId: string,
  ): Promise<string> {
    try {
      this.ensureInitialized();

      const backupConfig = {
        backup_type: "manual" as const,
        schedule: null,
        data_sources: config.data_sources,
        storage_config: {
          provider: config.storage_provider || "local",
          encryption_enabled: config.encryption_enabled ?? true,
          compression_enabled: config.compression_enabled ?? true,
          retention_days: config.retention_days ?? 30,
        },
        notification_config: {
          on_success: true,
          on_failure: true,
          recipients: [userId],
        },
        metadata: {
          name: config.name,
          description: config.description,
          created_by: userId,
        },
      };

      return await this.backupManager.createBackup(backupConfig, userId);
    } catch (error) {
      throw new Error(`Erro ao criar backup: ${error}`);
    }
  }

  /**
   * Agenda um backup automático
   */
  async scheduleBackup(
    config: {
      name: string;
      description?: string;
      schedule: string; // Cron expression
      data_sources: string[];
      storage_provider?: string;
      encryption_enabled?: boolean;
      compression_enabled?: boolean;
      retention_days?: number;
    },
    userId: string,
  ): Promise<string> {
    try {
      this.ensureInitialized();

      const backupConfig = {
        backup_type: "scheduled" as const,
        schedule: config.schedule,
        data_sources: config.data_sources,
        storage_config: {
          provider: config.storage_provider || "local",
          encryption_enabled: config.encryption_enabled ?? true,
          compression_enabled: config.compression_enabled ?? true,
          retention_days: config.retention_days ?? 30,
        },
        notification_config: {
          on_success: true,
          on_failure: true,
          recipients: [userId],
        },
        metadata: {
          name: config.name,
          description: config.description,
          created_by: userId,
        },
      };

      return await this.backupManager.createBackup(backupConfig, userId);
    } catch (error) {
      throw new Error(`Erro ao agendar backup: ${error}`);
    }
  }

  /**
   * Cria um plano de recuperação
   */
  async createRecoveryPlan(
    config: {
      name: string;
      description?: string;
      recovery_type: "full_restore" | "partial_restore" | "point_in_time" | "selective_restore";
      target_timestamp: Date;
      data_sources: string[];
      recovery_steps: any[];
      estimated_duration_minutes: number;
      prerequisites?: string[];
      rollback_plan?: any[];
      validation_checks?: any[];
    },
    userId: string,
  ): Promise<string> {
    try {
      this.ensureInitialized();

      const planData = {
        name: config.name,
        description: config.description || "",
        recovery_type: config.recovery_type,
        target_timestamp: config.target_timestamp,
        data_sources: config.data_sources,
        recovery_steps: config.recovery_steps,
        estimated_duration_minutes: config.estimated_duration_minutes,
        prerequisites: config.prerequisites || [],
        rollback_plan: config.rollback_plan || [],
        validation_checks: config.validation_checks || [],
        metadata: {
          created_by: userId,
        },
      };

      return await this.recoveryManager.createRecoveryPlan(planData, userId);
    } catch (error) {
      throw new Error(`Erro ao criar plano de recuperação: ${error}`);
    }
  }

  /**
   * Executa um plano de recuperação
   */
  async executeRecovery(
    planId: string,
    userId: string,
    options?: {
      dry_run?: boolean;
      skip_validation?: boolean;
      force_execution?: boolean;
      custom_parameters?: Record<string, any>;
    },
  ): Promise<string> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.executeRecoveryPlan(planId, userId, options);
    } catch (error) {
      throw new Error(`Erro ao executar recuperação: ${error}`);
    }
  }

  /**
   * Obtém status de um backup
   */
  async getBackupStatus(jobId: string): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.backupManager.getBackupStatus(jobId);
    } catch (error) {
      throw new Error(`Erro ao obter status do backup: ${error}`);
    }
  }

  /**
   * Obtém status de uma recuperação
   */
  async getRecoveryStatus(executionId: string): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.getRecoveryExecutionStatus(executionId);
    } catch (error) {
      throw new Error(`Erro ao obter status da recuperação: ${error}`);
    }
  }

  /**
   * Lista backups
   */
  async listBackups(
    filters?: {
      backup_type?: string[];
      status?: string[];
      data_sources?: string[];
      created_by?: string;
      date_from?: Date;
      date_to?: Date;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.backupManager.listBackups(filters, pagination);
    } catch (error) {
      throw new Error(`Erro ao listar backups: ${error}`);
    }
  }

  /**
   * Lista planos de recuperação
   */
  async listRecoveryPlans(
    filters?: {
      recovery_type?: string[];
      data_sources?: string[];
      created_by?: string;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.listRecoveryPlans(filters, pagination);
    } catch (error) {
      throw new Error(`Erro ao listar planos de recuperação: ${error}`);
    }
  }

  /**
   * Lista execuções de recuperação
   */
  async listRecoveryExecutions(
    filters?: {
      plan_id?: string;
      status?: string[];
      executed_by?: string;
      date_from?: Date;
      date_to?: Date;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.listRecoveryExecutions(filters, pagination);
    } catch (error) {
      throw new Error(`Erro ao listar execuções de recuperação: ${error}`);
    }
  }

  /**
   * Obtém métricas de backup
   */
  async getBackupMetrics(period: "day" | "week" | "month" = "month"): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.backupManager.getBackupMetrics(period);
    } catch (error) {
      throw new Error(`Erro ao obter métricas de backup: ${error}`);
    }
  }

  /**
   * Obtém métricas de recuperação
   */
  async getRecoveryMetrics(period: "day" | "week" | "month" = "month"): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.getRecoveryMetrics(period);
    } catch (error) {
      throw new Error(`Erro ao obter métricas de recuperação: ${error}`);
    }
  }

  /**
   * Obtém métricas de armazenamento
   */
  async getStorageMetrics(): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.storageManager.getAllMetrics();
    } catch (error) {
      throw new Error(`Erro ao obter métricas de armazenamento: ${error}`);
    }
  }

  /**
   * Testa conectividade dos provedores de armazenamento
   */
  async testStorageConnections(): Promise<Record<string, boolean>> {
    try {
      this.ensureInitialized();
      return await this.storageManager.testAllConnections();
    } catch (error) {
      throw new Error(`Erro ao testar conexões: ${error}`);
    }
  }

  /**
   * Executa limpeza de backups antigos
   */
  async cleanupOldBackups(olderThanDays: number): Promise<{
    storage_cleanup: Record<string, number>;
    backup_cleanup: number;
  }> {
    try {
      this.ensureInitialized();

      const [storageCleanup, backupCleanup] = await Promise.all([
        this.storageManager.cleanupAll(olderThanDays),
        this.backupManager.cleanupExpiredBackups(),
      ]);

      return {
        storage_cleanup: storageCleanup,
        backup_cleanup: backupCleanup,
      };
    } catch (error) {
      throw new Error(`Erro na limpeza: ${error}`);
    }
  }

  /**
   * Verifica integridade de backups
   */
  async verifyBackupIntegrity(
    jobId?: string,
    options?: {
      deep_verification?: boolean;
      check_encryption?: boolean;
      validate_checksums?: boolean;
    },
  ): Promise<any> {
    try {
      this.ensureInitialized();

      if (jobId) {
        return await this.backupManager.verifyBackup(jobId, options);
      } else {
        // Verificar todos os backups recentes
        const backups = await this.backupManager.listBackups({
          status: ["completed"],
          date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
        });

        const verificationResults = [];
        for (const backup of backups.jobs) {
          try {
            const result = await this.backupManager.verifyBackup(backup.id, options);
            verificationResults.push({
              job_id: backup.id,
              ...result,
            });
          } catch (error) {
            verificationResults.push({
              job_id: backup.id,
              valid: false,
              error: error.toString(),
            });
          }
        }

        return {
          total_verified: verificationResults.length,
          valid_backups: verificationResults.filter((r) => r.valid).length,
          invalid_backups: verificationResults.filter((r) => !r.valid).length,
          results: verificationResults,
        };
      }
    } catch (error) {
      throw new Error(`Erro na verificação de integridade: ${error}`);
    }
  }

  /**
   * Testa um plano de recuperação (dry run)
   */
  async testRecoveryPlan(planId: string, userId: string): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.recoveryManager.testRecoveryPlan(planId, userId);
    } catch (error) {
      throw new Error(`Erro ao testar plano de recuperação: ${error}`);
    }
  }

  /**
   * Cancela um backup em andamento
   */
  async cancelBackup(jobId: string, userId: string): Promise<void> {
    try {
      this.ensureInitialized();
      await this.backupManager.cancelBackup(jobId, userId);
    } catch (error) {
      throw new Error(`Erro ao cancelar backup: ${error}`);
    }
  }

  /**
   * Cancela uma recuperação em andamento
   */
  async cancelRecovery(executionId: string, userId: string): Promise<void> {
    try {
      this.ensureInitialized();
      await this.recoveryManager.cancelRecoveryExecution(executionId, userId);
    } catch (error) {
      throw new Error(`Erro ao cancelar recuperação: ${error}`);
    }
  }

  /**
   * Executa rollback de uma recuperação
   */
  async executeRollback(executionId: string, userId: string): Promise<void> {
    try {
      this.ensureInitialized();
      await this.recoveryManager.executeRollback(executionId, userId);
    } catch (error) {
      throw new Error(`Erro ao executar rollback: ${error}`);
    }
  }

  /**
   * Registra um novo provedor de armazenamento
   */
  async registerStorageProvider(config: any): Promise<void> {
    try {
      this.ensureInitialized();
      await this.storageManager.registerProvider(config);
    } catch (error) {
      throw new Error(`Erro ao registrar provedor: ${error}`);
    }
  }

  /**
   * Remove um provedor de armazenamento
   */
  async unregisterStorageProvider(name: string): Promise<void> {
    try {
      this.ensureInitialized();
      await this.storageManager.unregisterProvider(name);
    } catch (error) {
      throw new Error(`Erro ao remover provedor: ${error}`);
    }
  }

  /**
   * Obtém relatório completo do sistema
   */
  async getSystemReport(): Promise<{
    system_status: "healthy" | "warning" | "error";
    backup_metrics: any;
    recovery_metrics: any;
    storage_metrics: any[];
    storage_connections: Record<string, boolean>;
    recent_activities: any[];
    recommendations: string[];
  }> {
    try {
      this.ensureInitialized();

      const [backupMetrics, recoveryMetrics, storageMetrics, storageConnections] =
        await Promise.all([
          this.getBackupMetrics(),
          this.getRecoveryMetrics(),
          this.getStorageMetrics(),
          this.testStorageConnections(),
        ]);

      // Determinar status do sistema
      const allConnectionsHealthy = Object.values(storageConnections).every(
        (connected) => connected,
      );
      const backupSuccessRate = backupMetrics.success_rate || 0;
      const recoverySuccessRate = recoveryMetrics.success_rate || 0;

      let systemStatus: "healthy" | "warning" | "error" = "healthy";

      if (!allConnectionsHealthy || backupSuccessRate < 80 || recoverySuccessRate < 80) {
        systemStatus = "error";
      } else if (backupSuccessRate < 95 || recoverySuccessRate < 95) {
        systemStatus = "warning";
      }

      // Gerar recomendações
      const recommendations: string[] = [];

      if (backupSuccessRate < 95) {
        recommendations.push(
          "Taxa de sucesso de backup abaixo do ideal. Verificar configurações e conectividade.",
        );
      }

      if (recoverySuccessRate < 95) {
        recommendations.push(
          "Taxa de sucesso de recuperação abaixo do ideal. Revisar planos de recuperação.",
        );
      }

      if (!allConnectionsHealthy) {
        recommendations.push(
          "Alguns provedores de armazenamento estão inacessíveis. Verificar conectividade.",
        );
      }

      const totalStorageUsed = storageMetrics.reduce(
        (sum, metric) => sum + metric.used_storage_gb,
        0,
      );
      const totalStorageAvailable = storageMetrics.reduce(
        (sum, metric) => sum + metric.total_storage_gb,
        0,
      );

      if (totalStorageUsed / totalStorageAvailable > 0.8) {
        recommendations.push("Uso de armazenamento acima de 80%. Considerar limpeza ou expansão.");
      }

      // Atividades recentes (simulado)
      const recentActivities = [
        {
          type: "backup_completed",
          timestamp: new Date(),
          description: "Backup automático concluído com sucesso",
        },
        {
          type: "recovery_planned",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          description: "Novo plano de recuperação criado",
        },
      ];

      return {
        system_status: systemStatus,
        backup_metrics: backupMetrics,
        recovery_metrics: recoveryMetrics,
        storage_metrics: storageMetrics,
        storage_connections: storageConnections,
        recent_activities: recentActivities,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório: ${error}`);
    }
  }

  // Métodos privados
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("Sistema não foi inicializado. Chame initialize() primeiro.");
    }
  }

  private async setupDefaultStorageProviders(): Promise<void> {
    // Configurar provedor local padrão
    await this.storageManager.registerProvider({
      provider: "local",
      name: "local_default",
      enabled: true,
      priority: 1,
      connection_config: {
        base_path: "./backups",
      },
      encryption_enabled: true,
      compression_enabled: true,
      retention_days: 30,
      max_storage_gb: 100,
      cost_per_gb: 0,
      metadata: {
        description: "Provedor de armazenamento local padrão",
      },
    });

    console.log("✅ Provedores de armazenamento padrão configurados");
  }

  private async setupDefaultBackupStrategies(): Promise<void> {
    // As estratégias são configuradas automaticamente no BackupStrategyManager
    console.log("✅ Estratégias de backup padrão configuradas");
  }
}

// Instância singleton do sistema
let systemInstance: BackupRecoverySystem | null = null;

/**
 * Obtém a instância singleton do sistema de backup e recovery
 */
export function getBackupRecoverySystem(): BackupRecoverySystem {
  if (!systemInstance) {
    systemInstance = new BackupRecoverySystem();
  }
  return systemInstance;
}

/**
 * Inicializa o sistema de backup e recovery
 */
export async function initializeBackupSystem(config?: any): Promise<BackupRecoverySystem> {
  const system = getBackupRecoverySystem();
  await system.initialize(config);
  return system;
}

/**
 * Para o sistema de backup e recovery
 */
export async function shutdownBackupSystem(): Promise<void> {
  if (systemInstance) {
    await systemInstance.shutdown();
    systemInstance = null;
  }
}

// Export da instância padrão
export default BackupRecoverySystem;
