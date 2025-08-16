import { createClient } from '@supabase/supabase-js';
import { AuditLogger } from '../../audit/audit-logger';
import { LGPDManager } from '../../lgpd/lgpd-manager';
import { EncryptionService } from '../../security/encryption-service';

export type StorageConfig = {
  provider: 'local' | 's3' | 'azure' | 'gcp' | 'ftp' | 'sftp';
  name: string;
  enabled: boolean;
  priority: number;
  connection_config: Record<string, any>;
  encryption_enabled: boolean;
  compression_enabled: boolean;
  retention_days: number;
  max_storage_gb: number;
  cost_per_gb: number;
  bandwidth_limit_mbps?: number;
  metadata: Record<string, any>;
};

export type StorageLocation = {
  id: string;
  provider: string;
  path: string;
  size_bytes: number;
  checksum: string;
  encrypted: boolean;
  compressed: boolean;
  created_at: Date;
  expires_at?: Date;
  metadata: Record<string, any>;
};

export type StorageResult = {
  success: boolean;
  location?: StorageLocation;
  error?: string;
  duration_ms: number;
  bytes_transferred: number;
  transfer_rate_mbps: number;
};

export type StorageMetrics = {
  provider: string;
  total_storage_gb: number;
  used_storage_gb: number;
  available_storage_gb: number;
  total_files: number;
  upload_success_rate: number;
  download_success_rate: number;
  average_upload_speed_mbps: number;
  average_download_speed_mbps: number;
  total_cost: number;
  monthly_cost: number;
  bandwidth_usage_gb: number;
  error_rate: number;
  last_health_check: Date;
  health_status: 'healthy' | 'warning' | 'error';
};

export type StorageOperation = {
  id: string;
  type: 'upload' | 'download' | 'delete' | 'list' | 'verify';
  provider: string;
  source_path: string;
  target_path: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: Date;
  completed_at?: Date;
  progress_percentage: number;
  bytes_total: number;
  bytes_transferred: number;
  transfer_rate_mbps: number;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  metadata: Record<string, any>;
};

export abstract class StorageProvider {
  protected config: StorageConfig;
  protected auditLogger: AuditLogger;
  protected encryptionService: EncryptionService;
  protected lgpdManager: LGPDManager;

  constructor(config: StorageConfig) {
    this.config = config;
    this.auditLogger = new AuditLogger();
    this.encryptionService = new EncryptionService();
    this.lgpdManager = new LGPDManager();
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract upload(
    localPath: string,
    remotePath: string,
    options?: any,
  ): Promise<StorageResult>;
  abstract download(
    remotePath: string,
    localPath: string,
    options?: any,
  ): Promise<StorageResult>;
  abstract delete(remotePath: string): Promise<boolean>;
  abstract list(remotePath: string): Promise<StorageLocation[]>;
  abstract exists(remotePath: string): Promise<boolean>;
  abstract getMetrics(): Promise<StorageMetrics>;
  abstract testConnection(): Promise<boolean>;
  abstract cleanup(olderThanDays: number): Promise<number>;

  protected async processFile(
    filePath: string,
    operation: 'encrypt' | 'decrypt' | 'compress' | 'decompress',
  ): Promise<string> {
    switch (operation) {
      case 'encrypt':
        if (this.config.encryption_enabled) {
          return await this.encryptionService.encryptFile(filePath);
        }
        return filePath;

      case 'decrypt':
        if (this.config.encryption_enabled) {
          return await this.encryptionService.decryptFile(filePath);
        }
        return filePath;

      case 'compress':
        if (this.config.compression_enabled) {
          return await this.compressFile(filePath);
        }
        return filePath;

      case 'decompress':
        if (this.config.compression_enabled) {
          return await this.decompressFile(filePath);
        }
        return filePath;

      default:
        return filePath;
    }
  }

  protected async compressFile(filePath: string): Promise<string> {
    // Implementar compressão
    const compressedPath = `${filePath}.gz`;
    // Lógica de compressão aqui
    return compressedPath;
  }

  protected async decompressFile(filePath: string): Promise<string> {
    // Implementar descompressão
    const decompressedPath = filePath.replace('.gz', '');
    // Lógica de descompressão aqui
    return decompressedPath;
  }

  protected calculateChecksum(_filePath: string): Promise<string> {
    // Implementar cálculo de checksum
    return Promise.resolve('mock_checksum');
  }

  protected getFileSize(_filePath: string): Promise<number> {
    // Implementar obtenção do tamanho do arquivo
    return Promise.resolve(0);
  }
}

// Implementação para armazenamento local
export class LocalStorageProvider extends StorageProvider {
  private readonly basePath: string;

  constructor(config: StorageConfig) {
    super(config);
    this.basePath = config.connection_config.base_path || './backups';
  }

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {}

  async upload(
    localPath: string,
    remotePath: string,
    options?: any,
  ): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      // Processar arquivo (criptografia/compressão)
      let processedPath = localPath;
      if (this.config.compression_enabled) {
        processedPath = await this.processFile(processedPath, 'compress');
      }
      if (this.config.encryption_enabled) {
        processedPath = await this.processFile(processedPath, 'encrypt');
      }

      const _targetPath = `${this.basePath}/${remotePath}`;
      const fileSize = await this.getFileSize(processedPath);
      const checksum = await this.calculateChecksum(processedPath);

      const duration = Date.now() - startTime;
      const transferRate = fileSize / 1024 / 1024 / (duration / 1000); // MB/s

      const location: StorageLocation = {
        id: this.generateLocationId(),
        provider: this.config.provider,
        path: remotePath,
        size_bytes: fileSize,
        checksum,
        encrypted: this.config.encryption_enabled,
        compressed: this.config.compression_enabled,
        created_at: new Date(),
        expires_at:
          this.config.retention_days > 0
            ? new Date(
                Date.now() + this.config.retention_days * 24 * 60 * 60 * 1000,
              )
            : undefined,
        metadata: options?.metadata || {},
      };

      await this.auditLogger.log({
        action: 'storage_upload',
        resource_type: 'storage_file',
        resource_id: location.id,
        details: {
          provider: this.config.provider,
          path: remotePath,
          size_bytes: fileSize,
          duration_ms: duration,
        },
      });

      return {
        success: true,
        location,
        duration_ms: duration,
        bytes_transferred: fileSize,
        transfer_rate_mbps: transferRate,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.toString(),
        duration_ms: duration,
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
      };
    }
  }

  async download(
    remotePath: string,
    localPath: string,
    _options?: any,
  ): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      const sourcePath = `${this.basePath}/${remotePath}`;
      const fileSize = await this.getFileSize(sourcePath);

      let processedPath = localPath;

      // Processar arquivo (descriptografia/descompressão)
      if (this.config.encryption_enabled) {
        processedPath = await this.processFile(processedPath, 'decrypt');
      }
      if (this.config.compression_enabled) {
        processedPath = await this.processFile(processedPath, 'decompress');
      }

      const duration = Date.now() - startTime;
      const transferRate = fileSize / 1024 / 1024 / (duration / 1000); // MB/s

      await this.auditLogger.log({
        action: 'storage_download',
        resource_type: 'storage_file',
        resource_id: remotePath,
        details: {
          provider: this.config.provider,
          path: remotePath,
          size_bytes: fileSize,
          duration_ms: duration,
        },
      });

      return {
        success: true,
        duration_ms: duration,
        bytes_transferred: fileSize,
        transfer_rate_mbps: transferRate,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.toString(),
        duration_ms: duration,
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
      };
    }
  }

  async delete(remotePath: string): Promise<boolean> {
    try {
      const _targetPath = `${this.basePath}/${remotePath}`;

      await this.auditLogger.log({
        action: 'storage_delete',
        resource_type: 'storage_file',
        resource_id: remotePath,
        details: {
          provider: this.config.provider,
          path: remotePath,
        },
      });

      return true;
    } catch (_error) {
      return false;
    }
  }

  async list(remotePath: string): Promise<StorageLocation[]> {
    try {
      const _targetPath = `${this.basePath}/${remotePath}`;

      // Simular listagem de arquivos
      const files: StorageLocation[] = [
        {
          id: this.generateLocationId(),
          provider: this.config.provider,
          path: `${remotePath}/backup1.sql`,
          size_bytes: 1024 * 1024,
          checksum: 'mock_checksum_1',
          encrypted: this.config.encryption_enabled,
          compressed: this.config.compression_enabled,
          created_at: new Date(),
          metadata: {},
        },
      ];

      return files;
    } catch (_error) {
      return [];
    }
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      const _targetPath = `${this.basePath}/${remotePath}`;
      return true; // Simulado
    } catch (_error) {
      return false;
    }
  }

  async getMetrics(): Promise<StorageMetrics> {
    return {
      provider: this.config.provider,
      total_storage_gb: this.config.max_storage_gb,
      used_storage_gb: Math.random() * this.config.max_storage_gb,
      available_storage_gb: this.config.max_storage_gb * 0.7,
      total_files: Math.floor(Math.random() * 1000),
      upload_success_rate: 95 + Math.random() * 5,
      download_success_rate: 98 + Math.random() * 2,
      average_upload_speed_mbps: 50 + Math.random() * 50,
      average_download_speed_mbps: 80 + Math.random() * 40,
      total_cost: Math.random() * 100,
      monthly_cost: Math.random() * 20,
      bandwidth_usage_gb: Math.random() * 500,
      error_rate: Math.random() * 5,
      last_health_check: new Date(),
      health_status: 'healthy',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
      return false;
    }
  }

  async cleanup(olderThanDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Simular limpeza
      const deletedCount = Math.floor(Math.random() * 10);

      await this.auditLogger.log({
        action: 'storage_cleanup',
        resource_type: 'storage_provider',
        resource_id: this.config.name,
        details: {
          provider: this.config.provider,
          older_than_days: olderThanDays,
          deleted_count: deletedCount,
        },
      });

      return deletedCount;
    } catch (_error) {
      return 0;
    }
  }

  private generateLocationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Implementação para Amazon S3
export class S3StorageProvider extends StorageProvider {
  private readonly bucket: string;

  constructor(config: StorageConfig) {
    super(config);
    this.bucket = config.connection_config.bucket;
    // Inicializar cliente S3
  }

  async connect(): Promise<void> {
    // Implementar conexão S3
  }

  async disconnect(): Promise<void> {}

  async upload(
    localPath: string,
    remotePath: string,
    options?: any,
  ): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      // Processar arquivo
      let processedPath = localPath;
      if (this.config.compression_enabled) {
        processedPath = await this.processFile(processedPath, 'compress');
      }
      if (this.config.encryption_enabled) {
        processedPath = await this.processFile(processedPath, 'encrypt');
      }

      const fileSize = await this.getFileSize(processedPath);
      const checksum = await this.calculateChecksum(processedPath);

      const duration = Date.now() - startTime;
      const transferRate = fileSize / 1024 / 1024 / (duration / 1000);

      const location: StorageLocation = {
        id: this.generateLocationId(),
        provider: this.config.provider,
        path: remotePath,
        size_bytes: fileSize,
        checksum,
        encrypted: this.config.encryption_enabled,
        compressed: this.config.compression_enabled,
        created_at: new Date(),
        expires_at:
          this.config.retention_days > 0
            ? new Date(
                Date.now() + this.config.retention_days * 24 * 60 * 60 * 1000,
              )
            : undefined,
        metadata: {
          bucket: this.bucket,
          storage_class: options?.storage_class || 'STANDARD',
          ...options?.metadata,
        },
      };

      return {
        success: true,
        location,
        duration_ms: duration,
        bytes_transferred: fileSize,
        transfer_rate_mbps: transferRate,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.toString(),
        duration_ms: duration,
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
      };
    }
  }

  async download(
    _remotePath: string,
    localPath: string,
    _options?: any,
  ): Promise<StorageResult> {
    const startTime = Date.now();

    try {
      // Simular download
      const fileSize = 1024 * 1024; // 1MB simulado

      let processedPath = localPath;

      // Processar arquivo
      if (this.config.encryption_enabled) {
        processedPath = await this.processFile(processedPath, 'decrypt');
      }
      if (this.config.compression_enabled) {
        processedPath = await this.processFile(processedPath, 'decompress');
      }

      const duration = Date.now() - startTime;
      const transferRate = fileSize / 1024 / 1024 / (duration / 1000);

      return {
        success: true,
        duration_ms: duration,
        bytes_transferred: fileSize,
        transfer_rate_mbps: transferRate,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.toString(),
        duration_ms: duration,
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
      };
    }
  }

  async delete(_remotePath: string): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
      return false;
    }
  }

  async list(_remotePath: string): Promise<StorageLocation[]> {
    try {
      return [];
    } catch (_error) {
      return [];
    }
  }

  async exists(_remotePath: string): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
      return false;
    }
  }

  async getMetrics(): Promise<StorageMetrics> {
    return {
      provider: this.config.provider,
      total_storage_gb: this.config.max_storage_gb,
      used_storage_gb: Math.random() * this.config.max_storage_gb,
      available_storage_gb: this.config.max_storage_gb * 0.8,
      total_files: Math.floor(Math.random() * 5000),
      upload_success_rate: 98 + Math.random() * 2,
      download_success_rate: 99 + Number(Math.random()),
      average_upload_speed_mbps: 100 + Math.random() * 100,
      average_download_speed_mbps: 150 + Math.random() * 100,
      total_cost: Math.random() * 500,
      monthly_cost: Math.random() * 50,
      bandwidth_usage_gb: Math.random() * 1000,
      error_rate: Math.random() * 2,
      last_health_check: new Date(),
      health_status: 'healthy',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      return true;
    } catch (_error) {
      return false;
    }
  }

  async cleanup(_olderThanDays: number): Promise<number> {
    try {
      return Math.floor(Math.random() * 50);
    } catch (_error) {
      return 0;
    }
  }

  private generateLocationId(): string {
    return `s3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Gerenciador de provedores de armazenamento
export class StorageManager {
  private readonly supabase;
  private readonly auditLogger: AuditLogger;
  private readonly providers: Map<string, StorageProvider> = new Map();
  private readonly activeOperations: Map<string, StorageOperation> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    this.auditLogger = new AuditLogger();
  }

  /**
   * Registra um provedor de armazenamento
   */
  async registerProvider(config: StorageConfig): Promise<void> {
    try {
      let provider: StorageProvider;

      switch (config.provider) {
        case 'local':
          provider = new LocalStorageProvider(config);
          break;
        case 's3':
          provider = new S3StorageProvider(config);
          break;
        default:
          throw new Error(`Provedor não suportado: ${config.provider}`);
      }

      await provider.connect();
      this.providers.set(config.name, provider);

      // Salvar configuração
      await this.saveStorageConfig(config);

      await this.auditLogger.log({
        action: 'storage_provider_registered',
        resource_type: 'storage_provider',
        resource_id: config.name,
        details: {
          provider: config.provider,
          enabled: config.enabled,
        },
      });
    } catch (error) {
      throw new Error(`Erro ao registrar provedor: ${error}`);
    }
  }

  /**
   * Remove um provedor de armazenamento
   */
  async unregisterProvider(name: string): Promise<void> {
    try {
      const provider = this.providers.get(name);
      if (provider) {
        await provider.disconnect();
        this.providers.delete(name);
      }

      // Remover configuração
      await this.deleteStorageConfig(name);

      await this.auditLogger.log({
        action: 'storage_provider_unregistered',
        resource_type: 'storage_provider',
        resource_id: name,
      });
    } catch (error) {
      throw new Error(`Erro ao remover provedor: ${error}`);
    }
  }

  /**
   * Faz upload de um arquivo
   */
  async uploadFile(
    localPath: string,
    remotePath: string,
    providerName?: string,
    options?: any,
  ): Promise<StorageResult> {
    try {
      const provider = providerName
        ? this.providers.get(providerName)
        : this.selectBestProvider('upload');

      if (!provider) {
        throw new Error('Nenhum provedor disponível');
      }

      const operationId = this.generateOperationId();
      const operation: StorageOperation = {
        id: operationId,
        type: 'upload',
        provider: providerName || 'auto',
        source_path: localPath,
        target_path: remotePath,
        status: 'running',
        started_at: new Date(),
        progress_percentage: 0,
        bytes_total: await provider.getFileSize(localPath),
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
        retry_count: 0,
        max_retries: 3,
        metadata: options?.metadata || {},
      };

      this.activeOperations.set(operationId, operation);

      const result = await provider.upload(localPath, remotePath, options);

      operation.status = result.success ? 'completed' : 'failed';
      operation.completed_at = new Date();
      operation.progress_percentage = 100;
      operation.bytes_transferred = result.bytes_transferred;
      operation.transfer_rate_mbps = result.transfer_rate_mbps;
      operation.error_message = result.error;

      await this.saveStorageOperation(operation);
      this.activeOperations.delete(operationId);

      return result;
    } catch (error) {
      throw new Error(`Erro no upload: ${error}`);
    }
  }

  /**
   * Faz download de um arquivo
   */
  async downloadFile(
    remotePath: string,
    localPath: string,
    providerName?: string,
    options?: any,
  ): Promise<StorageResult> {
    try {
      const provider = providerName
        ? this.providers.get(providerName)
        : this.selectBestProvider('download');

      if (!provider) {
        throw new Error('Nenhum provedor disponível');
      }

      const operationId = this.generateOperationId();
      const operation: StorageOperation = {
        id: operationId,
        type: 'download',
        provider: providerName || 'auto',
        source_path: remotePath,
        target_path: localPath,
        status: 'running',
        started_at: new Date(),
        progress_percentage: 0,
        bytes_total: 0, // Será atualizado durante o download
        bytes_transferred: 0,
        transfer_rate_mbps: 0,
        retry_count: 0,
        max_retries: 3,
        metadata: options?.metadata || {},
      };

      this.activeOperations.set(operationId, operation);

      const result = await provider.download(remotePath, localPath, options);

      operation.status = result.success ? 'completed' : 'failed';
      operation.completed_at = new Date();
      operation.progress_percentage = 100;
      operation.bytes_transferred = result.bytes_transferred;
      operation.transfer_rate_mbps = result.transfer_rate_mbps;
      operation.error_message = result.error;

      await this.saveStorageOperation(operation);
      this.activeOperations.delete(operationId);

      return result;
    } catch (error) {
      throw new Error(`Erro no download: ${error}`);
    }
  }

  /**
   * Lista arquivos em um provedor
   */
  async listFiles(
    remotePath: string,
    providerName?: string,
  ): Promise<StorageLocation[]> {
    try {
      const provider = providerName
        ? this.providers.get(providerName)
        : this.selectBestProvider('list');

      if (!provider) {
        throw new Error('Nenhum provedor disponível');
      }

      return await provider.list(remotePath);
    } catch (error) {
      throw new Error(`Erro ao listar arquivos: ${error}`);
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(
    remotePath: string,
    providerName?: string,
  ): Promise<boolean> {
    try {
      const provider = providerName
        ? this.providers.get(providerName)
        : this.selectBestProvider('delete');

      if (!provider) {
        throw new Error('Nenhum provedor disponível');
      }

      return await provider.delete(remotePath);
    } catch (error) {
      throw new Error(`Erro ao deletar arquivo: ${error}`);
    }
  }

  /**
   * Obtém métricas de todos os provedores
   */
  async getAllMetrics(): Promise<StorageMetrics[]> {
    const metrics: StorageMetrics[] = [];

    for (const [_name, provider] of this.providers) {
      try {
        const providerMetrics = await provider.getMetrics();
        metrics.push(providerMetrics);
      } catch (_error) {}
    }

    return metrics;
  }

  /**
   * Testa conectividade de todos os provedores
   */
  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.testConnection();
      } catch (_error) {
        results[name] = false;
      }
    }

    return results;
  }

  /**
   * Executa limpeza em todos os provedores
   */
  async cleanupAll(olderThanDays: number): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.cleanup(olderThanDays);
      } catch (_error) {
        results[name] = 0;
      }
    }

    return results;
  }

  /**
   * Lista operações de armazenamento
   */
  async listOperations(
    filters?: {
      type?: string[];
      provider?: string;
      status?: string[];
      date_from?: Date;
      date_to?: Date;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<{
    operations: StorageOperation[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let query = this.supabase
        .from('storage_operations')
        .select('*', { count: 'exact' })
        .order('started_at', { ascending: false });

      if (filters?.type) {
        query = query.in('type', filters.type);
      }

      if (filters?.provider) {
        query = query.eq('provider', filters.provider);
      }

      if (filters?.status) {
        query = query.in('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('started_at', filters.date_from.toISOString());
      }

      if (filters?.date_to) {
        query = query.lte('started_at', filters.date_to.toISOString());
      }

      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.range(offset, offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const operations = data.map(this.mapDatabaseToStorageOperation);

      return {
        operations,
        total: count || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || operations.length,
      };
    } catch (error) {
      throw new Error(`Erro ao listar operações: ${error}`);
    }
  }

  // Métodos privados
  private selectBestProvider(_operation: string): StorageProvider | null {
    // Implementar lógica de seleção do melhor provedor
    // baseado em prioridade, disponibilidade, performance, etc.

    const availableProviders = Array.from(this.providers.values()).filter(
      (provider) => provider.config.enabled,
    );

    if (availableProviders.length === 0) {
      return null;
    }

    // Por enquanto, retorna o primeiro disponível
    // TODO: Implementar lógica mais sofisticada
    return availableProviders[0];
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de persistência
  private async saveStorageConfig(config: StorageConfig): Promise<void> {
    const { error } = await this.supabase.from('storage_configs').upsert({
      name: config.name,
      provider: config.provider,
      enabled: config.enabled,
      priority: config.priority,
      connection_config: config.connection_config,
      encryption_enabled: config.encryption_enabled,
      compression_enabled: config.compression_enabled,
      retention_days: config.retention_days,
      max_storage_gb: config.max_storage_gb,
      cost_per_gb: config.cost_per_gb,
      bandwidth_limit_mbps: config.bandwidth_limit_mbps,
      metadata: config.metadata,
    });

    if (error) {
      throw error;
    }
  }

  private async deleteStorageConfig(name: string): Promise<void> {
    const { error } = await this.supabase
      .from('storage_configs')
      .delete()
      .eq('name', name);

    if (error) {
      throw error;
    }
  }

  private async saveStorageOperation(
    operation: StorageOperation,
  ): Promise<void> {
    const { error } = await this.supabase.from('storage_operations').insert({
      id: operation.id,
      type: operation.type,
      provider: operation.provider,
      source_path: operation.source_path,
      target_path: operation.target_path,
      status: operation.status,
      started_at: operation.started_at.toISOString(),
      completed_at: operation.completed_at?.toISOString(),
      progress_percentage: operation.progress_percentage,
      bytes_total: operation.bytes_total,
      bytes_transferred: operation.bytes_transferred,
      transfer_rate_mbps: operation.transfer_rate_mbps,
      error_message: operation.error_message,
      retry_count: operation.retry_count,
      max_retries: operation.max_retries,
      metadata: operation.metadata,
    });

    if (error) {
      throw error;
    }
  }

  private mapDatabaseToStorageOperation(data: any): StorageOperation {
    return {
      id: data.id,
      type: data.type,
      provider: data.provider,
      source_path: data.source_path,
      target_path: data.target_path,
      status: data.status,
      started_at: new Date(data.started_at),
      completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
      progress_percentage: data.progress_percentage || 0,
      bytes_total: data.bytes_total || 0,
      bytes_transferred: data.bytes_transferred || 0,
      transfer_rate_mbps: data.transfer_rate_mbps || 0,
      error_message: data.error_message,
      retry_count: data.retry_count || 0,
      max_retries: data.max_retries || 3,
      metadata: data.metadata || {},
    };
  }
}

export default StorageManager;
