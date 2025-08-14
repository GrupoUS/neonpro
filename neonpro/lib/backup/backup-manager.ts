/**
 * NeonPro Backup Manager
 * Story 1.8: Sistema de Backup e Recovery
 * 
 * Gerenciador principal do sistema de backup automático,
 * coordenando backups, recovery e monitoramento.
 */

import { createClient } from '@supabase/supabase-js';
import { 
  BackupConfig, 
  BackupRecord, 
  BackupProgress, 
  BackupStatus, 
  BackupType,
  RecoveryRequest,
  RecoveryProgress,
  BackupMetrics,
  BackupAlert,
  BackupFilter,
  PaginatedResult,
  PaginationOptions,
  ApiResponse,
  BackupEvent,
  DataType,
  StorageType,
  BackupPriority
} from './types';
import { StorageProvider } from './storage';
import { SchedulerService } from './scheduler';
import { MonitoringService } from './monitoring';
// import { SecurityService } from './security';
import { auditLogger } from '../auth/audit/audit-logger';

/**
 * Gerenciador principal do sistema de backup
 */
export class BackupManager {
  private supabase;
  private storageProvider: StorageProvider;
  private scheduler: SchedulerService;
  private monitoring: MonitoringService;
  // private security: SecurityService;
  private activeBackups = new Map<string, BackupProgress>();
  private activeRecoveries = new Map<string, RecoveryProgress>();

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    this.storageProvider = new StorageProvider();
    this.scheduler = new SchedulerService(this);
    this.monitoring = new MonitoringService(this);
    // this.security = new SecurityService();
  }

  // ============================================================================
  // CONFIGURAÇÃO DE BACKUP
  // ============================================================================

  /**
   * Criar nova configuração de backup
   */
  async createBackupConfig(config: Omit<BackupConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BackupConfig>> {
    try {
      // Validar configuração
      await this.validateBackupConfig(config);

      const newConfig: BackupConfig = {
        ...config,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no banco
      const { data, error } = await this.supabase
        .from('backup_configs')
        .insert(newConfig)
        .select()
        .single();

      if (error) throw error;

      // Agendar backup se habilitado
      if (newConfig.enabled) {
        await this.scheduler.scheduleBackup(newConfig);
      }

      // Log de auditoria
      await auditLogger.log({
        action: 'BACKUP_CONFIG_CREATED',
        entityType: 'BACKUP_CONFIG',
        entityId: newConfig.id,
        details: { name: newConfig.name, type: newConfig.type },
        userId: newConfig.createdBy
      });

      return {
        success: true,
        data: data as BackupConfig,
        message: 'Configuração de backup criada com sucesso',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao criar configuração de backup', error);
    }
  }

  /**
   * Atualizar configuração de backup
   */
  async updateBackupConfig(id: string, updates: Partial<BackupConfig>): Promise<ApiResponse<BackupConfig>> {
    try {
      const updatedConfig = {
        ...updates,
        id,
        updatedAt: new Date()
      };

      const { data, error } = await this.supabase
        .from('backup_configs')
        .update(updatedConfig)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Reagendar se necessário
      if (updates.schedule || updates.enabled !== undefined) {
        await this.scheduler.rescheduleBackup(data as BackupConfig);
      }

      await auditLogger.log({
        action: 'BACKUP_CONFIG_UPDATED',
        entityType: 'BACKUP_CONFIG',
        entityId: id,
        details: updates,
        userId: updates.createdBy || 'system'
      });

      return {
        success: true,
        data: data as BackupConfig,
        message: 'Configuração atualizada com sucesso',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao atualizar configuração', error);
    }
  }

  /**
   * Listar configurações de backup
   */
  async listBackupConfigs(options?: PaginationOptions): Promise<ApiResponse<PaginatedResult<BackupConfig>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options || {};
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from('backup_configs')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'ASC' })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as BackupConfig[],
          total: count || 0,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao listar configurações', error);
    }
  }

  // ============================================================================
  // EXECUÇÃO DE BACKUP
  // ============================================================================

  /**
   * Executar backup manualmente
   */
  async executeBackup(configId: string, userId: string): Promise<ApiResponse<BackupRecord>> {
    try {
      // Buscar configuração
      const { data: config } = await this.supabase
        .from('backup_configs')
        .select('*')
        .eq('id', configId)
        .single();

      if (!config) {
        throw new Error('Configuração de backup não encontrada');
      }

      // Verificar se já existe backup em execução
      if (this.activeBackups.has(configId)) {
        throw new Error('Backup já está em execução para esta configuração');
      }

      // Criar registro de backup
      const backupRecord: Omit<BackupRecord, 'id'> = {
        configId,
        type: config.type,
        status: BackupStatus.PENDING,
        startTime: new Date(),
        size: 0,
        filesCount: 0,
        checksum: '',
        path: '',
        metadata: {
          version: '1.0',
          source: 'manual',
          dataTypes: config.dataTypes,
          environment: process.env.NODE_ENV || 'development',
          hostname: process.env.HOSTNAME || 'localhost',
          userId,
          clientVersion: '1.0.0',
          dependencies: []
        },
        warnings: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data: record, error } = await this.supabase
        .from('backup_records')
        .insert(backupRecord)
        .select()
        .single();

      if (error) throw error;

      // Iniciar backup em background
      this.performBackup(record as BackupRecord, config as BackupConfig);

      await auditLogger.log({
        action: 'BACKUP_STARTED',
        entityType: 'BACKUP',
        entityId: record.id,
        details: { configId, type: config.type },
        userId
      });

      return {
        success: true,
        data: record as BackupRecord,
        message: 'Backup iniciado com sucesso',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao executar backup', error);
    }
  }

  /**
   * Realizar backup (processo interno)
   */
  private async performBackup(record: BackupRecord, config: BackupConfig): Promise<void> {
    const progress: BackupProgress = {
      backupId: record.id,
      status: BackupStatus.RUNNING,
      percentage: 0,
      filesProcessed: 0,
      totalFiles: 0,
      bytesProcessed: 0,
      totalBytes: 0,
      speed: 0,
      eta: 0,
      startTime: new Date(),
      lastUpdate: new Date()
    };

    this.activeBackups.set(record.configId, progress);

    try {
      // Atualizar status para RUNNING
      await this.updateBackupStatus(record.id, BackupStatus.RUNNING);

      // Executar backup baseado no tipo de dados
      const backupResult = await this.executeBackupByType(config, progress);

      // Calcular checksum
      const checksum = await this.calculateChecksum(backupResult.path);

      // Atualizar registro com sucesso
      await this.supabase
        .from('backup_records')
        .update({
          status: BackupStatus.COMPLETED,
          endTime: new Date(),
          duration: Math.floor((Date.now() - record.startTime.getTime()) / 1000),
          size: backupResult.size,
          compressedSize: backupResult.compressedSize,
          filesCount: backupResult.filesCount,
          checksum,
          path: backupResult.path,
          updatedAt: new Date()
        })
        .eq('id', record.id);

      // Enviar para storage remoto se configurado
      if (config.storage.type !== StorageType.LOCAL) {
        await this.storageProvider.upload(backupResult.path, config.storage);
      }

      // Aplicar política de retenção
      await this.applyRetentionPolicy(config);

      // Notificar sucesso
      await this.monitoring.notifyBackupSuccess(record.id, config);

      await auditLogger.log({
        action: 'BACKUP_COMPLETED',
        entityType: 'BACKUP',
        entityId: record.id,
        details: { 
          size: backupResult.size, 
          duration: Math.floor((Date.now() - record.startTime.getTime()) / 1000),
          filesCount: backupResult.filesCount
        },
        userId: record.metadata.userId
      });

    } catch (error) {
      // Atualizar status para FAILED
      await this.updateBackupStatus(record.id, BackupStatus.FAILED, error.message);
      
      // Notificar falha
      await this.monitoring.notifyBackupFailure(record.id, config, error.message);

      await auditLogger.log({
        action: 'BACKUP_FAILED',
        entityType: 'BACKUP',
        entityId: record.id,
        details: { error: error.message },
        userId: record.metadata.userId
      });
    } finally {
      this.activeBackups.delete(record.configId);
    }
  }

  /**
   * Executar backup por tipo de dados
   */
  private async executeBackupByType(config: BackupConfig, progress: BackupProgress): Promise<{
    path: string;
    size: number;
    compressedSize?: number;
    filesCount: number;
  }> {
    const results = {
      path: '',
      size: 0,
      compressedSize: 0,
      filesCount: 0
    };

    for (const dataType of config.dataTypes) {
      switch (dataType) {
        case DataType.DATABASE:
          const dbResult = await this.backupDatabase(config, progress);
          results.size += dbResult.size;
          results.filesCount += dbResult.filesCount;
          break;

        case DataType.FILES:
          const filesResult = await this.backupFiles(config, progress);
          results.size += filesResult.size;
          results.filesCount += filesResult.filesCount;
          break;

        case DataType.LOGS:
          const logsResult = await this.backupLogs(config, progress);
          results.size += logsResult.size;
          results.filesCount += logsResult.filesCount;
          break;

        case DataType.CONFIG:
          const configResult = await this.backupConfig(config, progress);
          results.size += configResult.size;
          results.filesCount += configResult.filesCount;
          break;

        case DataType.MEDIA:
          const mediaResult = await this.backupMedia(config, progress);
          results.size += mediaResult.size;
          results.filesCount += mediaResult.filesCount;
          break;

        case DataType.DOCUMENTS:
          const docsResult = await this.backupDocuments(config, progress);
          results.size += docsResult.size;
          results.filesCount += docsResult.filesCount;
          break;
      }
    }

    // Comprimir se habilitado
    if (config.compression.enabled) {
      const compressedResult = await this.compressBackup(results.path, config.compression);
      results.compressedSize = compressedResult.size;
      results.path = compressedResult.path;
    }

    // Criptografar se habilitado
    if (config.encryption.enabled) {
      const encryptedResult = await this.encryptBackup(results.path, config.encryption);
      results.path = encryptedResult.path;
    }

    return results;
  }

  // ============================================================================
  // MÉTODOS DE BACKUP POR TIPO
  // ============================================================================

  private async backupDatabase(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup do banco de dados
    // Usar pg_dump para PostgreSQL/Supabase
    return { size: 0, filesCount: 0 };
  }

  private async backupFiles(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup de arquivos
    return { size: 0, filesCount: 0 };
  }

  private async backupLogs(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup de logs
    return { size: 0, filesCount: 0 };
  }

  private async backupConfig(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup de configurações
    return { size: 0, filesCount: 0 };
  }

  private async backupMedia(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup de mídia
    return { size: 0, filesCount: 0 };
  }

  private async backupDocuments(config: BackupConfig, progress: BackupProgress) {
    // Implementar backup de documentos
    return { size: 0, filesCount: 0 };
  }

  // ============================================================================
  // RECOVERY
  // ============================================================================

  /**
   * Solicitar recuperação
   */
  async requestRecovery(request: Omit<RecoveryRequest, 'id' | 'requestedAt' | 'status'>): Promise<ApiResponse<RecoveryRequest>> {
    try {
      const recoveryRequest: RecoveryRequest = {
        ...request,
        id: crypto.randomUUID(),
        requestedAt: new Date(),
        status: 'NOT_STARTED'
      };

      const { data, error } = await this.supabase
        .from('recovery_requests')
        .insert(recoveryRequest)
        .select()
        .single();

      if (error) throw error;

      await auditLogger.log({
        action: 'RECOVERY_REQUESTED',
        entityType: 'RECOVERY',
        entityId: recoveryRequest.id,
        details: { backupId: request.backupId, type: request.type },
        userId: request.requestedBy
      });

      return {
        success: true,
        data: data as RecoveryRequest,
        message: 'Solicitação de recuperação criada',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao solicitar recuperação', error);
    }
  }

  // ============================================================================
  // MONITORAMENTO
  // ============================================================================

  /**
   * Obter métricas de backup
   */
  async getBackupMetrics(startDate?: Date, endDate?: Date): Promise<ApiResponse<BackupMetrics>> {
    try {
      const metrics = await this.monitoring.calculateMetrics(startDate, endDate);
      
      return {
        success: true,
        data: metrics,
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao obter métricas', error);
    }
  }

  /**
   * Listar backups com filtros
   */
  async listBackups(filter?: BackupFilter, options?: PaginationOptions): Promise<ApiResponse<PaginatedResult<BackupRecord>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'startTime', sortOrder = 'DESC' } = options || {};
      const offset = (page - 1) * limit;

      let query = this.supabase
        .from('backup_records')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filter?.configId) query = query.eq('configId', filter.configId);
      if (filter?.type) query = query.eq('type', filter.type);
      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.startDate) query = query.gte('startTime', filter.startDate.toISOString());
      if (filter?.endDate) query = query.lte('startTime', filter.endDate.toISOString());
      if (filter?.minSize) query = query.gte('size', filter.minSize);
      if (filter?.maxSize) query = query.lte('size', filter.maxSize);

      const { data, error, count } = await query
        .order(sortBy, { ascending: sortOrder === 'ASC' })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as BackupRecord[],
          total: count || 0,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao listar backups', error);
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private async validateBackupConfig(config: any): Promise<void> {
    if (!config.name || config.name.trim().length === 0) {
      throw new Error('Nome da configuração é obrigatório');
    }

    if (!config.dataTypes || config.dataTypes.length === 0) {
      throw new Error('Pelo menos um tipo de dados deve ser selecionado');
    }

    if (!config.schedule) {
      throw new Error('Agendamento é obrigatório');
    }

    if (!config.storage) {
      throw new Error('Configuração de storage é obrigatória');
    }
  }

  private async updateBackupStatus(backupId: string, status: BackupStatus, error?: string): Promise<void> {
    const updates: any = {
      status,
      updatedAt: new Date()
    };

    if (error) {
      updates.error = error;
    }

    if (status === BackupStatus.COMPLETED || status === BackupStatus.FAILED) {
      updates.endTime = new Date();
    }

    await this.supabase
      .from('backup_records')
      .update(updates)
      .eq('id', backupId);
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    // Implementar cálculo de checksum
    return 'sha256-checksum';
  }

  private async compressBackup(path: string, config: any) {
    // Implementar compressão
    return { path: path + '.gz', size: 0 };
  }

  private async encryptBackup(path: string, config: any) {
    // Implementar criptografia
    return { path: path + '.enc' };
  }

  private async applyRetentionPolicy(config: BackupConfig): Promise<void> {
    // Implementar política de retenção
    const { data: oldBackups } = await this.supabase
      .from('backup_records')
      .select('*')
      .eq('configId', config.id)
      .eq('status', BackupStatus.COMPLETED)
      .order('startTime', { ascending: true });

    if (!oldBackups) return;

    const retention = config.retention;
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (retention.maxAge * 24 * 60 * 60 * 1000));

    // Remover backups antigos
    const toDelete = oldBackups.filter(backup => 
      new Date(backup.startTime) < cutoffDate
    );

    for (const backup of toDelete) {
      await this.deleteBackup(backup.id);
    }
  }

  private async deleteBackup(backupId: string): Promise<void> {
    // Implementar exclusão de backup
    await this.supabase
      .from('backup_records')
      .update({ status: BackupStatus.EXPIRED })
      .eq('id', backupId);
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

  /**
   * Obter progresso de backup ativo
   */
  getBackupProgress(configId: string): BackupProgress | null {
    return this.activeBackups.get(configId) || null;
  }

  /**
   * Cancelar backup em execução
   */
  async cancelBackup(configId: string, userId: string): Promise<ApiResponse> {
    try {
      const progress = this.activeBackups.get(configId);
      if (!progress) {
        throw new Error('Nenhum backup ativo encontrado para esta configuração');
      }

      // Atualizar status para CANCELLED
      await this.updateBackupStatus(progress.backupId, BackupStatus.CANCELLED);
      
      // Remover da lista de ativos
      this.activeBackups.delete(configId);

      await auditLogger.log({
        action: 'BACKUP_CANCELLED',
        entityType: 'BACKUP',
        entityId: progress.backupId,
        details: { configId },
        userId
      });

      return {
        success: true,
        message: 'Backup cancelado com sucesso',
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      };
    } catch (error) {
      return this.handleError('Erro ao cancelar backup', error);
    }
  }
}

// Instância singleton
export const backupManager = new BackupManager();
