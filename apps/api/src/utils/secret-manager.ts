/**
 * 🔐 SECRET MANAGER - Secure Configuration Management
 *
 * Features:
 * - Environment-based secret loading
 * - Encryption at rest
 * - Audit trail for secret access
 * - LGPD compliant secret handling
 * - Validation and type safety
 */

import crypto from 'crypto';
import { logger } from './secure-logger';

interface SecretConfig {
  provider: 'env' | 'vault' | 'file';
  encryption?: boolean;
  auditTrail?: boolean;
  encryptionKey?: string;
  vaultUrl?: string;
  vaultToken?: string;
}

interface SecretMetadata {
  name: string;
  accessed: Date;
  accessCount: number;
  lastAccessedBy?: string;
  encrypted: boolean;
}

class SecretManager {
  private config: Required<SecretConfig>;
  private secrets: Map<string, string> = new Map();
  private metadata: Map<string, SecretMetadata> = new Map();
  private encryptionKey: Buffer;

  constructor(config: SecretConfig) {
    this.config = {
      provider: config.provider,
      encryption: config.encryption ?? true,
      auditTrail: config.auditTrail ?? true,
      encryptionKey: config.encryptionKey
        || process.env.SECRET_ENCRYPTION_KEY
        || this.generateEncryptionKey(),
      vaultUrl: config.vaultUrl || process.env.VAULT_URL || '',
      vaultToken: config.vaultToken || process.env.VAULT_TOKEN || '',
    };

    this.encryptionKey = Buffer.from(this.config.encryptionKey, 'hex');
    this.loadSecrets();
  }

  private generateEncryptionKey(): string {
    const key = crypto.randomBytes(32).toString('hex');
    logger.warn(
      'Generated new encryption key. Store this securely: SECRET_ENCRYPTION_KEY='
        + key,
    );
    return key;
  }

  private async loadSecrets(): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'env':
          this.loadFromEnvironment();
          break;
        case 'vault':
          await this.loadFromVault();
          break;
        case 'file':
          this.loadFromFile();
          break;
        default:
          throw new Error(
            `Unsupported secret provider: ${this.config.provider}`,
          );
      }

      logger.info('Secrets loaded successfully', {
        provider: this.config.provider,
        secretCount: this.secrets.size,
      });
    } catch (error) {
      logger.error('Failed to load secrets', error as Error, {
        provider: this.config.provider,
      });
      throw error;
    }
  }

  private loadFromEnvironment(): void {
    const secretKeys = [
      'DATABASE_URL',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'REDIS_URL',
      'SMTP_PASSWORD',
      'WEBHOOK_SECRET',
      'OAUTH_CLIENT_SECRET',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ANON_KEY',
    ];

    secretKeys.forEach(key => {
      const value = process.env[key];
      if (value) {
        this.setSecret(key, value, false); // Don't audit initial loading
      }
    });
  }

  private async loadFromVault(): Promise<void> {
    if (!this.config.vaultUrl || !this.config.vaultToken) {
      throw new Error('Vault URL and token are required for vault provider');
    }

    // Vault integration would go here
    // For now, fallback to environment
    logger.warn(
      'Vault provider not fully implemented, falling back to environment',
    );
    this.loadFromEnvironment();
  }

  private loadFromFile(): void {
    // File-based secret loading would go here
    // For now, fallback to environment
    logger.warn(
      'File provider not fully implemented, falling back to environment',
    );
    this.loadFromEnvironment();
  }

  private encrypt(value: string): string {
    if (!this.config.encryption) return value;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedValue: string): string {
    if (!this.config.encryption) return encryptedValue;

    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const _iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private setSecret(name: string, value: string, audit: boolean = true): void {
    const encryptedValue = this.encrypt(value);
    this.secrets.set(name, encryptedValue);

    this.metadata.set(name, {
      name,
      accessed: new Date(),
      accessCount: 0,
      encrypted: this.config.encryption,
    });

    if (audit && this.config.auditTrail) {
      logger.auditDataModification({
        _userId: 'system',
        operation: 'CREATE',
        dataType: 'secret',
        recordId: name,
      });
    }
  }

  public getSecret(name: string, accessedBy?: string): string | undefined {
    const encryptedValue = this.secrets.get(name);
    if (!encryptedValue) {
      logger.warn('Secret not found', { secretName: name, accessedBy });
      return undefined;
    }

    // Update metadata
    const metadata = this.metadata.get(name);
    if (metadata) {
      metadata.accessed = new Date();
      metadata.accessCount++;
      metadata.lastAccessedBy = accessedBy;
    }

    // Audit access
    if (this.config.auditTrail) {
      logger.auditDataAccess({
        _userId: accessedBy || 'unknown',
        operation: 'READ',
        dataType: 'secret',
        endpoint: 'secret-manager',
        ip: 'internal',
        userAgent: 'secret-manager',
      });
    }

    try {
      return this.decrypt(encryptedValue);
    } catch (error) {
      logger.error('Failed to decrypt secret', error as Error, {
        secretName: name,
        accessedBy,
      });
      return undefined;
    }
  }

  public hasSecret(name: string): boolean {
    return this.secrets.has(name);
  }

  public listSecrets(): string[] {
    return Array.from(this.secrets.keys());
  }

  public getSecretMetadata(name: string): SecretMetadata | undefined {
    return this.metadata.get(name);
  }

  public rotateSecret(
    name: string,
    newValue: string,
    rotatedBy?: string,
  ): void {
    if (!this.secrets.has(name)) {
      throw new Error(`Secret ${name} not found`);
    }

    this.setSecret(name, newValue);

    if (this.config.auditTrail) {
      logger.auditDataModification({
        _userId: rotatedBy || 'system',
        operation: 'UPDATE',
        dataType: 'secret',
        recordId: name,
        changes: ['value_rotated'],
      });
    }

    logger.info('Secret rotated successfully', {
      secretName: name,
      rotatedBy,
    });
  }

  public deleteSecret(name: string, deletedBy?: string): boolean {
    const existed = this.secrets.delete(name);
    this.metadata.delete(name);

    if (existed && this.config.auditTrail) {
      logger.auditDataModification({
        _userId: deletedBy || 'system',
        operation: 'DELETE',
        dataType: 'secret',
        recordId: name,
      });
    }

    return existed;
  }

  // Convenience methods for common secrets
  public getDatabaseUrl(): string | undefined {
    return this.getSecret('DATABASE_URL', 'database-connection');
  }

  public getJwtSecret(): string | undefined {
    return this.getSecret('JWT_SECRET', 'jwt-service');
  }

  public getApiKey(_service: string): string | undefined {
    return this.getSecret(
      `${service.toUpperCase()}_API_KEY`,
      `${service}-service`,
    );
  }

  public getSupabaseKeys(): { serviceRole?: string; anon?: string } {
    return {
      serviceRole: this.getSecret(
        'SUPABASE_SERVICE_ROLE_KEY',
        'supabase-service',
      ),
      anon: this.getSecret('SUPABASE_ANON_KEY', 'supabase-client'),
    };
  }

  // Health check method
  public healthCheck(): { status: 'healthy' | 'unhealthy'; details: any } {
    const requiredSecrets = ['DATABASE_URL', 'JWT_SECRET'];
    const missingSecrets = requiredSecrets.filter(
      secret => !this.hasSecret(secret),
    );

    if (missingSecrets.length > 0) {
      return {
        status: 'unhealthy',
        details: {
          missingSecrets,
          totalSecrets: this.secrets.size,
          provider: this.config.provider,
        },
      };
    }

    return {
      status: 'healthy',
      details: {
        totalSecrets: this.secrets.size,
        provider: this.config.provider,
        encryption: this.config.encryption,
      },
    };
  }
}

// Factory function
export function createSecretManager(
  config?: Partial<SecretConfig>,
): SecretManager {
  return new SecretManager({
    provider: 'env',
    encryption: true,
    auditTrail: true,
    ...config,
  });
}

// Default instance
export const secrets = createSecretManager();

// Export types
export type { SecretConfig, SecretMetadata };
export { SecretManager };
