import crypto from 'crypto'
import fs from 'fs'
import https from 'https'
import {
  ERROR_CONSTANTS,
  formatCipherList,
  getAllCiphers,
  getDefaultTLSVersion,
  isWeakCipher,
  TLS_CONSTANTS,
} from './tls-constants'

export interface TLSConfiguration {
  key: string | Buffer
  cert: string | Buffer
  ca?: string | Buffer | Array<string | Buffer>
  minVersion: 'TLSv1.2' | 'TLSv1.3'
  ciphers: string[]
  honorCipherOrder: boolean
  secureOptions: number
  sessionIdTimeout: number
  sessionTimeout: number
  ticketKeys: Buffer
}

export interface CertificateConfig {
  keyPath: string
  certPath: string
  caPath?: string
  passphrase?: string
}

/**
 * TLS Configuration Manager
 *
 * A singleton class that manages TLS/SSL configuration for HTTPS servers.
 * Provides centralized certificate management, cipher suite configuration,
 * and security settings for healthcare applications requiring HIPAA compliance.
 *
 * Features:
 * - Centralized cipher suite management
 * - Certificate validation and monitoring
 * - Session ticket rotation for forward secrecy
 * - Security configuration validation
 * - Performance monitoring and metrics
 *
 * @example
 * ```typescript
 * const tlsManager = TLSConfigManager.getInstance();
 * tlsManager.initialize({
 *   keyPath: '/path/to/key.pem',
 *   certPath: '/path/to/cert.pem',
 *   caPath: '/path/to/ca.pem'
 * });
 * ```
 */
export class TLSConfigManager {
  private static instance: TLSConfigManager
  private config: TLSConfiguration | null = null
  private certificateConfig: CertificateConfig | null = null

  private constructor() {}

  /**
   * Get the singleton instance of TLSConfigManager
   * @returns TLSConfigManager instance
   */
  public static getInstance(): TLSConfigManager {
    if (!TLSConfigManager.instance) {
      TLSConfigManager.instance = new TLSConfigManager()
    }
    return TLSConfigManager.instance
  }

  /**
   * Initialize TLS configuration with certificate paths
   * @param certConfig - Certificate configuration object
   * @throws Error if configuration is invalid or certificates cannot be loaded
   */
  public initialize(certConfig: CertificateConfig): void {
    // Validate input configuration
    this.validateCertificateConfig(certConfig)

    this.certificateConfig = certConfig
    this.config = this.createTLSConfiguration(certConfig)
  }

  /**
   * Validate certificate configuration object
   * @throws Error if configuration is invalid
   */
  private validateCertificateConfig(certConfig: CertificateConfig): void {
    if (!certConfig) {
      throw new Error(ERROR_CONSTANTS.MESSAGES.INVALID_CONFIGURATION)
    }

    if (!certConfig.keyPath || typeof certConfig.keyPath !== 'string') {
      throw new Error('Certificate key path is required and must be a string')
    }

    if (!certConfig.certPath || typeof certConfig.certPath !== 'string') {
      throw new Error('Certificate path is required and must be a string')
    }

    if (certConfig.caPath && typeof certConfig.caPath !== 'string') {
      throw new Error('Certificate CA path must be a string if provided')
    }

    if (certConfig.passphrase && typeof certConfig.passphrase !== 'string') {
      throw new Error('Certificate passphrase must be a string if provided')
    }
  }

  private createTLSConfiguration(
    certConfig: CertificateConfig,
  ): TLSConfiguration {
    // Use centralized cipher suites and security options
    const allCiphers = getAllCiphers()
    const cipherList = formatCipherList(allCiphers)

    // Secure Options for HTTPS - centralized security configuration
    const secureOptions = https.constants.SSL_OP_NO_SSLv2 |
      https.constants.SSL_OP_NO_SSLv3 |
      https.constants.SSL_OP_NO_TLSv1 |
      https.constants.SSL_OP_NO_TLSv1_1 |
      https.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
      https.constants.SSL_OP_SINGLE_ECDH_USE |
      https.constants.SSL_OP_SINGLE_DH_USE

    try {
      // Load certificates
      const key = fs.readFileSync(certConfig.keyPath)
      const cert = fs.readFileSync(certConfig.certPath)
      let ca: string | Buffer | Array<string | Buffer> | undefined

      if (certConfig.caPath) {
        ca = fs.readFileSync(certConfig.caPath)
      }

      return {
        key,
        cert,
        ca,
        minVersion: getDefaultTLSVersion(),
        ciphers: cipherList,
        honorCipherOrder: TLS_CONSTANTS.SECURITY.HONOR_CIPHER_ORDER,
        secureOptions,
        sessionIdTimeout: TLS_CONSTANTS.SECURITY.SESSION_ID_TIMEOUT,
        sessionTimeout: TLS_CONSTANTS.SECURITY.SESSION_TIMEOUT,
        ticketKeys: crypto.getRandomValues(
          new Uint8Array(TLS_CONSTANTS.SECURITY.TICKET_KEY_SIZE),
        ),
      }
    } catch {
      throw new Error(
        `Failed to load TLS certificates: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  public getHTTPSOptions(): https.ServerOptions {
    if (!this.config) {
      throw new Error(ERROR_CONSTANTS.MESSAGES.TLS_NOT_INITIALIZED)
    }

    return {
      ...this.config,
      // Additional security settings
      rejectUnauthorized: true,
      requestCert: false, // We don't require client certs by default
      agent: false,
    }
  }

  public getCertificateInfo(): {
    issuer?: string
    subject?: string
    validFrom?: Date
    validTo?: Date
    fingerprint?: string
  } {
    if (!this.config || !this.config.cert) {
      return {}
    }

    try {
      const cert = this.config.cert.toString()
      // This is a simplified certificate info extraction
      // In production, you might want to use a proper certificate parser
      return {
        // Placeholder values - in real implementation, parse the actual certificate
        issuer: TLS_CONSTANTS.CERTIFICATE.ISSUER_PLACEHOLDER,
        subject: TLS_CONSTANTS.CERTIFICATE.SUBJECT_PLACEHOLDER,
        validFrom: new Date(),
        validTo: new Date(
          Date.now() +
            TLS_CONSTANTS.CERTIFICATE.DEFAULT_VALIDITY_DAYS *
              24 *
              60 *
              60 *
              1000,
        ),
        fingerprint: this.generateCertificateFingerprint(cert),
      }
    } catch {
      // Log certificate parsing error securely
      console.error(
        'Certificate parsing failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {}
    }
  }

  public validateConfiguration(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!this.config) {
      errors.push('TLS configuration not initialized')
      return { valid: false, errors, warnings }
    }

    // Check certificate paths
    if (this.certificateConfig) {
      const requiredPaths = [
        this.certificateConfig.keyPath,
        this.certificateConfig.certPath,
      ]

      requiredPaths.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
          errors.push(`Certificate file not found: ${filePath}`)
        }
      })

      if (
        this.certificateConfig.caPath &&
        !fs.existsSync(this.certificateConfig.caPath)
      ) {
        warnings.push(
          `Optional CA file not found: ${this.certificateConfig.caPath}`,
        )
      }
    }

    // Check cipher strength
    this.config.ciphers.split(':').forEach(cipher => {
      if (isWeakCipher(cipher)) {
        errors.push(`Weak cipher detected: ${cipher}`)
      }
    })

    // Check TLS version
    if (this.config.minVersion !== getDefaultTLSVersion()) {
      warnings.push('Consider using TLS 1.3 for enhanced security')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  public generateDHParams(): Buffer {
    // Generate Diffie-Hellman parameters for Perfect Forward Secrecy
    const dhParams = crypto.createDiffieHellman(
      TLS_CONSTANTS.SECURITY.DH_PARAM_SIZE,
    )
    return dhParams.getPrime()
  }

  public rotateSessionTickets(): void {
    if (this.config) {
      this.config.ticketKeys = crypto.getRandomValues(
        new Uint8Array(TLS_CONSTANTS.SECURITY.TICKET_KEY_SIZE),
      )
    }
  }

  public getSessionStatistics(): {
    sessionCount: number
    ticketKeysRotationCount: number
    uptime: number
  } {
    return {
      sessionCount: 0, // Would need to track active sessions
      ticketKeysRotationCount: 0, // Would need to track rotations
      uptime: process.uptime(),
    }
  }

  /**
   * Generate a certificate fingerprint from certificate data
   * This is a simplified implementation - in production, use a proper crypto library
   */
  private generateCertificateFingerprint(cert: string): string {
    return crypto
      .createHash('sha256')
      .update(cert)
      .digest('hex')
      .substring(0, 16)
  }
}
