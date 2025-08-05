import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  private getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY not found in environment variables');
    }
    return Buffer.from(key, 'hex');
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const key = this.getKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('neonpro', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const key = this.getKey();
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    decipher.setAAD(Buffer.from('neonpro', 'utf8'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  generateSecureId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

export class LGPDEncryptionService extends EncryptionService {
  encryptPersonalData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['cpf', 'rg', 'email', 'phone', 'address'];
    const encrypted = { ...data };
    
    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        const encryptionResult = this.encrypt(encrypted[field]);
        encrypted[field] = `enc:${encryptionResult.encrypted}:${encryptionResult.iv}:${encryptionResult.tag}`;
      }
    }
    
    return encrypted;
  }

  decryptPersonalData(data: Record<string, any>): Record<string, any> {
    const decrypted = { ...data };
    
    for (const [key, value] of Object.entries(decrypted)) {
      if (typeof value === 'string' && value.startsWith('enc:')) {
        const [, encrypted, iv, tag] = value.split(':');
        try {
          decrypted[key] = this.decrypt({ encrypted, iv, tag });
        } catch (error) {
          console.error(`Failed to decrypt field ${key}:`, error);
          decrypted[key] = '[ENCRYPTED]';
        }
      }
    }
    
    return decrypted;
  }
}

export const encryptionService = new EncryptionService();
export const lgpdEncryptionService = new LGPDEncryptionService();
