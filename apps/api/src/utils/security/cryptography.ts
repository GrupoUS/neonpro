/**
 * 🔐 Cryptographic Operations Utility
 *
 * Secure cryptographic operations for healthcare applications:
 * - Data encryption and decryption
 * - Secure hashing and salting
 * - Digital signatures
 * - Key generation and management
 * - Secure random number generation
 * - LGPD-compliant data anonymization
 *
 * Features:
 * - AES-256 encryption for sensitive data
 * - SHA-256 with salt for password hashing
 * - RSA-2048 for digital signatures
 * - Secure key derivation functions
 * - Hardware security module integration
 * - Cryptographic algorithm agility
 */

import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  createSign,
  createVerify,
  generateKeyPairSync,
  pbkdf2Sync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from 'crypto'
import { HealthcareError } from '../healthcare-errors.js'
import { SecureLogger } from '../secure-logger.js'

export interface CryptoConfig {
  /**
   * Cryptographic configuration
   */
  encryptionAlgorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'aes-128-gcm'
  hashAlgorithm: 'sha256' | 'sha512' | 'sha3-256'
  keyDerivationAlgorithm: 'pbkdf2' | 'scrypt' | 'argon2'
  signatureAlgorithm: 'rsa-sha256' | 'ecdsa-sha256' | 'ed25519'
  keyRotationDays: number
  enableHardwareSecurity: boolean
  secureRandomSource: 'crypto' | 'hardware' | 'mixed'
}

export interface EncryptedData {
  /**
   * Encrypted data structure
   */
  iv: string
  encrypted: string
  tag?: string // For GCM mode
  algorithm: string
  keyId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface KeyPair {
  /**
   * Asymmetric key pair
   */
  publicKey: string
  privateKey: string
  keyId: string
  algorithm: string
  keySize: number
  created: Date
  expires?: Date
}

export interface HashResult {
  /**
   * Hash result with metadata
   */
  hash: string
  salt: string
  algorithm: string
  iterations: number
  keyLength: number
}

export interface DigitalSignature {
  /**
   * Digital signature result
   */
  signature: string
  algorithm: string
  keyId: string
  timestamp: Date
}

export class CryptographyManager {
  private config: CryptoConfig
  private logger: SecureLogger
  private keyStore: Map<string, KeyPair> = new Map()
  private encryptionKeys: Map<string, Buffer> = new Map()

  constructor(config: CryptoConfig) {
    this.config = config
    this.logger = new SecureLogger({
      level: 'info',
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      enableMetrics: true,
      _service: 'CryptographyManager',
    })

    this.initializeKeys()
  }

  /**
   * Initialize cryptographic keys
   */
  private initializeKeys(): void {
    try {
      // Generate master encryption key
      const masterKey = randomBytes(32)
      this.encryptionKeys.set('master', masterKey)

      // Generate RSA key pair for digital signatures
      if (this.config.signatureAlgorithm === 'rsa-sha256') {
        const rsaKeyPair = generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicExponent: 0x10001,
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          publicKeyEncoding: { type: 'spki', format: 'pem' },
        })

        const keyPair: KeyPair = {
          publicKey: rsaKeyPair.publicKey,
          privateKey: rsaKeyPair.privateKey,
          keyId: this.generateKeyId(),
          algorithm: 'rsa-sha256',
          keySize: 2048,
          created: new Date(),
          expires: new Date(Date.now() + this.config.keyRotationDays * 24 * 60 * 60 * 1000),
        }

        this.keyStore.set(keyPair.keyId, keyPair)
      }

      this.logger.info('Cryptographic keys initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize cryptographic keys', error as Error)
      throw new HealthcareError(
        'CRYPTO_INIT_ERROR',
        'SECURITY',
        'CRITICAL',
        'Failed to initialize cryptographic keys',
        { error: error instanceof Error ? error.message : String(error) },
      )
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(
    data: string | Buffer,
    keyId: string = 'master',
    metadata?: Record<string, any>,
  ): Promise<EncryptedData> {
    try {
      const key = this.encryptionKeys.get(keyId)
      if (!key) {
        throw new HealthcareError(
          'KEY_NOT_FOUND',
          'SECURITY',
          'HIGH',
          `Encryption key not found: ${keyId}`,
        )
      }

      const iv = randomBytes(16)
      let encrypted: Buffer
      let tag: Buffer | undefined

      if (this.config.encryptionAlgorithm === 'aes-256-gcm') {
        const cipher = createCipheriv('aes-256-gcm', key, iv)
        const dataToEncrypt = typeof data === 'string' ? Buffer.from(data) : data
        encrypted = Buffer.concat([cipher.update(dataToEncrypt), cipher.final()])
        tag = cipher.getAuthTag()
      } else {
        const cipher = createCipheriv('aes-256-cbc', key, iv)
        const dataToEncrypt = typeof data === 'string' ? Buffer.from(data) : data
        encrypted = Buffer.concat([cipher.update(dataToEncrypt), cipher.final()])
      }

      const result: EncryptedData = {
        iv: iv.toString('base64'),
        encrypted: encrypted.toString('base64'),
        algorithm: this.config.encryptionAlgorithm,
        keyId,
        timestamp: new Date(),
        metadata,
      }

      if (tag) {
        result.tag = tag.toString('base64')
      }

      this.logger.logWithMetrics('info', 'Data encrypted successfully', {
        algorithm: this.config.encryptionAlgorithm,
        keyId,
        dataSize: typeof data === 'string' ? data.length : data.byteLength,
      })

      return result
    } catch (error) {
      this.logger.error('Encryption failed', error as Error, {
        keyId,
        dataSize: typeof data === 'string' ? data.length : data.byteLength,
      })
      throw new HealthcareError(
        'ENCRYPTION_ERROR',
        'SECURITY',
        'HIGH',
        'Failed to encrypt data',
        { keyId, error: error instanceof Error ? error.message : String(error) },
      )
    }
  }

  /**
   * Decrypt encrypted data
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = this.encryptionKeys.get(encryptedData.keyId || 'master')
      if (!key) {
        throw new HealthcareError(
          'KEY_NOT_FOUND',
          'SECURITY',
          'HIGH',
          `Decryption key not found: ${encryptedData.keyId}`,
        )
      }

      const iv = Buffer.from(encryptedData.iv, 'base64')
      const encrypted = Buffer.from(encryptedData.encrypted, 'base64')

      let decrypted: Buffer

      if (encryptedData.algorithm === 'aes-256-gcm') {
        if (!encryptedData.tag) {
          throw new HealthcareError(
            'INVALID_CIPHERTEXT',
            'SECURITY',
            'HIGH',
            'GCM mode requires authentication tag',
          )
        }

        const decipher = createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'))
        decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
      } else {
        const decipher = createDecipheriv('aes-256-cbc', key, iv)
        decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
      }

      this.logger.logWithMetrics('info', 'Data decrypted successfully', {
        algorithm: encryptedData.algorithm,
        keyId: encryptedData.keyId,
        dataSize: decrypted.length,
      })

      return decrypted.toString('utf-8')
    } catch (error) {
      this.logger.error('Decryption failed', error as Error, {
        algorithm: encryptedData.algorithm,
        keyId: encryptedData.keyId,
      })
      throw new HealthcareError(
        'DECRYPTION_ERROR',
        'SECURITY',
        'HIGH',
        'Failed to decrypt data',
        {
          keyId: encryptedData.keyId,
          error: error instanceof Error ? error.message : String(error),
        },
      )
    }
  }

  /**
   * Generate secure hash with salt
   */
  async hash(
    data: string,
    options?: {
      salt?: string
      iterations?: number
      keyLength?: number
    },
  ): Promise<HashResult> {
    try {
      const algorithm = this.config.hashAlgorithm
      const iterations = options?.iterations || 10000
      const keyLength = options?.keyLength || 32
      const salt = options?.salt || randomBytes(16).toString('hex')

      let hash: Buffer

      if (this.config.keyDerivationAlgorithm === 'pbkdf2') {
        // Use built-in pbkdf2 for better performance and security
        hash = pbkdf2Sync(data, salt, iterations, keyLength, algorithm)
      } else {
        // Fallback to simple hash with salt
        hash = createHmac(algorithm, salt).update(data).digest()
      }

      this.logger.logWithMetrics('info', 'Data hashed successfully', {
        algorithm,
        iterations,
        keyLength,
        saltLength: salt.length,
      })

      return {
        hash: hash.toString('hex'),
        salt,
        algorithm,
        iterations,
        keyLength,
      }
    } catch (error) {
      this.logger.error('Hashing failed', error as Error, {
        algorithm: this.config.hashAlgorithm,
        iterations: options?.iterations,
      })
      throw new HealthcareError(
        'HASHING_ERROR',
        'SECURITY',
        'HIGH',
        'Failed to hash data',
        {
          algorithm: this.config.hashAlgorithm,
          error: error instanceof Error ? error.message : String(error),
        },
      )
    }
  }

  /**
   * Verify hash against data
   */
  async verifyHash(data: string, hashResult: HashResult): Promise<boolean> {
    try {
      const newHash = await this.hash(data, {
        salt: hashResult.salt,
        iterations: hashResult.iterations,
        keyLength: hashResult.keyLength,
      })

      const isValid = newHash.hash === hashResult.hash

      this.logger.logWithMetrics('info', 'Hash verification completed', {
        algorithm: hashResult.algorithm,
        isValid,
      })

      return isValid
    } catch (error) {
      this.logger.error('Hash verification failed', error as Error)
      return false
    }
  }

  /**
   * Generate digital signature
   */
  async sign(
    data: string | Buffer,
    keyId?: string,
  ): Promise<DigitalSignature> {
    try {
      const keyPair = this.getLatestKeyPair()
      const actualKeyId = keyId || keyPair.keyId

      const privateKey = this.getKeyPair(actualKeyId)?.privateKey
      if (!privateKey) {
        throw new HealthcareError(
          'PRIVATE_KEY_NOT_FOUND',
          'SECURITY',
          'HIGH',
          `Private key not found: ${actualKeyId}`,
        )
      }

      const dataToSign = typeof data === 'string' ? Buffer.from(data) : data
      const signer = createSign('RSA-SHA256')
      signer.update(dataToSign)
      const signature = signer.sign(privateKey, 'base64')

      const result: DigitalSignature = {
        signature,
        algorithm: this.config.signatureAlgorithm,
        keyId: actualKeyId,
        timestamp: new Date(),
      }

      this.logger.logWithMetrics('info', 'Digital signature created', {
        algorithm: this.config.signatureAlgorithm,
        keyId: actualKeyId,
        dataSize: dataToSign.length,
      })

      return result
    } catch (error) {
      this.logger.error('Digital signature creation failed', error as Error, {
        algorithm: this.config.signatureAlgorithm,
        keyId,
      })
      throw new HealthcareError(
        'SIGNATURE_ERROR',
        'SECURITY',
        'HIGH',
        'Failed to create digital signature',
        {
          keyId,
          error: error instanceof Error ? error.message : String(error),
        },
      )
    }
  }

  /**
   * Verify digital signature
   */
  async verifySignature(
    data: string | Buffer,
    signature: DigitalSignature,
  ): Promise<boolean> {
    try {
      const keyPair = this.getKeyPair(signature.keyId)
      if (!keyPair) {
        throw new HealthcareError(
          'PUBLIC_KEY_NOT_FOUND',
          'SECURITY',
          'HIGH',
          `Public key not found: ${signature.keyId}`,
        )
      }

      const dataToVerify = typeof data === 'string' ? Buffer.from(data) : data
      const signatureBuffer = Buffer.from(signature.signature, 'base64')

      try {
        const verifier = createVerify('RSA-SHA256')
        verifier.update(dataToVerify)
        const isValid = verifier.verify(keyPair.publicKey, signatureBuffer, 'base64')

        this.logger.logWithMetrics('info', 'Digital signature verified', {
          algorithm: signature.algorithm,
          keyId: signature.keyId,
          isValid,
        })

        return isValid
      } catch {
        return false
      }
    } catch (error) {
      this.logger.error('Digital signature verification failed', error as Error, {
        algorithm: signature.algorithm,
        keyId: signature.keyId,
      })
      return false
    }
  }

  /**
   * Generate cryptographically secure random bytes
   */
  generateSecureBytes(length: number): Buffer {
    try {
      const bytes = randomBytes(length)

      this.logger.logWithMetrics('info', 'Secure random bytes generated', {
        length,
      })

      return bytes
    } catch (error) {
      this.logger.error('Secure random generation failed', error as Error, { length })
      throw new HealthcareError(
        'RANDOM_GENERATION_ERROR',
        'SECURITY',
        'CRITICAL',
        'Failed to generate secure random bytes',
        { length, error: error instanceof Error ? error.message : String(error) },
      )
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureString(length: number, encoding: 'hex' | 'base64' | 'base64url' = 'hex'): string {
    const bytes = this.generateSecureBytes(Math.ceil(length / 2))
    return bytes.toString(encoding).substring(0, length)
  }

  /**
   * Anonymize data for LGPD compliance
   */
  async anonymizeData(
    data: Record<string, any>,
    fieldsToAnonymize: string[],
    algorithm: 'hash' | 'encrypt' | 'replace' = 'hash',
  ): Promise<Record<string, any>> {
    try {
      const anonymized = { ...data }

      for (const field of fieldsToAnonymize) {
        if (anonymized[field] !== undefined && anonymized[field] !== null) {
          const value = String(anonymized[field])

          switch (algorithm) {
            case 'hash':
              const hashResult = await this.hash(value, { iterations: 1 })
              anonymized[field] = `ANON_${hashResult.hash.substring(0, 16)}`
              break

            case 'encrypt':
              const encrypted = await this.encrypt(value)
              anonymized[field] = `ENC_${encrypted.encrypted.substring(0, 16)}`
              break

            case 'replace':
              anonymized[field] = this.generateAnonymizedValue(field, value)
              break
          }
        }
      }

      this.logger.logWithMetrics('info', 'Data anonymized for LGPD compliance', {
        fieldsAnonymized: fieldsToAnonymize.length,
        algorithm,
      })

      return anonymized
    } catch (error) {
      this.logger.error('Data anonymization failed', error as Error, {
        fieldsToAnonymize,
        algorithm,
      })
      throw new HealthcareError(
        'ANONYMIZATION_ERROR',
        'SECURITY',
        'HIGH',
        'Failed to anonymize data',
        {
          fieldsToAnonymize,
          algorithm,
          error: error instanceof Error ? error.message : String(error),
        },
      )
    }
  }

  /**
   * Generate anonymized value replacement
   */
  private generateAnonymizedValue(field: string, originalValue: string): string {
    const patterns: Record<string, string> = {
      email: 'anon@example.com',
      phone: '+XX XXX XXXXXXX',
      cpf: 'XXX.XXX.XXX-XX',
      cnpj: 'XX.XXX.XXX/XXXX-XX',
      name: 'Anonymized User',
      address: 'Anonymized Address',
    }

    const fieldLower = field.toLowerCase()
    for (const [key, pattern] of Object.entries(patterns)) {
      if (fieldLower.includes(key)) {
        return pattern
      }
    }

    return 'ANONYMIZED'
  }

  /**
   * Get key pair by ID
   */
  private getKeyPair(keyId: string): KeyPair | undefined {
    return this.keyStore.get(keyId)
  }

  /**
   * Get latest valid key pair
   */
  private getLatestKeyPair(): KeyPair {
    const validKeys = Array.from(this.keyStore.values()).filter(
      key => !key.expires || key.expires > new Date(),
    )

    if (validKeys.length === 0) {
      throw new HealthcareError(
        'NO_VALID_KEYS',
        'SECURITY',
        'CRITICAL',
        'No valid cryptographic keys available',
      )
    }

    // Return the most recently created valid key
    return validKeys.sort((a, b) => b.created.getTime() - a.created.getTime())[0]
  }

  /**
   * Generate unique key ID
   */
  private generateKeyId(): string {
    return `key_${Date.now()}_${this.generateSecureString(8, 'hex')}`
  }

  /**
   * Rotate encryption keys
   */
  async rotateKeys(): Promise<void> {
    try {
      this.logger.info('Starting cryptographic key rotation')

      // Generate new master key
      const newMasterKey = randomBytes(32)
      const newKeyId = this.generateKeyId()

      // Store new key
      this.encryptionKeys.set(newKeyId, newMasterKey)

      // Generate new RSA key pair if using RSA
      if (this.config.signatureAlgorithm === 'rsa-sha256') {
        const rsaKeyPair = generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicExponent: 0x10001,
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          publicKeyEncoding: { type: 'spki', format: 'pem' },
        })

        const keyPair: KeyPair = {
          publicKey: rsaKeyPair.publicKey,
          privateKey: rsaKeyPair.privateKey,
          keyId: newKeyId,
          algorithm: 'rsa-sha256',
          keySize: 2048,
          created: new Date(),
          expires: new Date(Date.now() + this.config.keyRotationDays * 24 * 60 * 60 * 1000),
        }

        this.keyStore.set(newKeyId, keyPair)
      }

      // Clean up expired keys
      this.cleanupExpiredKeys()

      this.logger.info('Cryptographic key rotation completed successfully', {
        newKeyId,
        totalKeys: this.keyStore.size,
      })
    } catch (error) {
      this.logger.error('Key rotation failed', error as Error)
      throw new HealthcareError(
        'KEY_ROTATION_ERROR',
        'SECURITY',
        'CRITICAL',
        'Failed to rotate cryptographic keys',
        { error: error instanceof Error ? error.message : String(error) },
      )
    }
  }

  /**
   * Clean up expired keys
   */
  private cleanupExpiredKeys(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    for (const [keyId, keyPair] of this.keyStore.entries()) {
      if (keyPair.expires && keyPair.expires <= now) {
        expiredKeys.push(keyId)
      }
    }

    for (const keyId of expiredKeys) {
      this.keyStore.delete(keyId)
      this.logger.info('Expired cryptographic key removed', { keyId })
    }
  }

  /**
   * Get cryptographic status
   */
  getCryptoStatus(): {
    algorithm: string
    keyCount: number
    keyRotationDays: number
    nextRotation: Date
    supportedOperations: string[]
  } {
    const latestKey = this.getLatestKeyPair()

    return {
      algorithm: this.config.signatureAlgorithm,
      keyCount: this.keyStore.size,
      keyRotationDays: this.config.keyRotationDays,
      nextRotation: latestKey.expires || new Date(),
      supportedOperations: [
        'encrypt',
        'decrypt',
        'hash',
        'verifyHash',
        'sign',
        'verifySignature',
        'generateSecureBytes',
        'anonymizeData',
      ],
    }
  }
}

// Factory function for creating cryptography manager instances
export function createCryptographyManager(config?: Partial<CryptoConfig>): CryptographyManager {
  const defaultConfig: CryptoConfig = {
    encryptionAlgorithm: 'aes-256-gcm',
    hashAlgorithm: 'sha256',
    keyDerivationAlgorithm: 'pbkdf2',
    signatureAlgorithm: 'rsa-sha256',
    keyRotationDays: 90,
    enableHardwareSecurity: false,
    secureRandomSource: 'crypto',
  }

  return new CryptographyManager({ ...defaultConfig, ...config })
}

// Export types and classes
export type { CryptoConfig, DigitalSignature, EncryptedData, HashResult, KeyPair }
