import https from 'https'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

export class TLSConfigManager {
  private static instance: TLSConfigManager
  private config: TLSConfiguration | null = null
  private certificateConfig: CertificateConfig | null = null

  private constructor() {}

  public static getInstance(): TLSConfigManager {
    if (!TLSConfigManager.instance) {
      TLSConfigManager.instance = new TLSConfigManager()
    }
    return TLSConfigManager.instance
  }

  public initialize(certConfig: CertificateConfig): void {
    this.certificateConfig = certConfig
    this.config = this.createTLSConfiguration(certConfig)
  }

  private createTLSConfiguration(certConfig: CertificateConfig): TLSConfiguration {
    // TLS 1.3 Cipher Suites (recommended by security standards)
    const tls13Ciphers = [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_CCM_8_SHA384',
      'TLS_AES_128_CCM_SHA256'
    ]

    // Fallback TLS 1.2 Cipher Suites for PFS
    const tls12Ciphers = [
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305',
      'ECDHE-RSA-CHACHA20-POLY1305',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA384'
    ]

    const allCiphers = [...tls13Ciphers, ...tls12Ciphers]

    // Secure Options for HTTPS
    const secureOptions = 
      https.constants.SSL_OP_NO_SSLv2 |
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
        minVersion: 'TLSv1.3' as const,
        ciphers: allCiphers.join(':'),
        honorCipherOrder: true,
        secureOptions,
        sessionIdTimeout: 300, // 5 minutes
        sessionTimeout: 3600, // 1 hour
        ticketKeys: crypto.getRandomValues(new Uint8Array(48))
      }
    } catch (error) {
      throw new Error(`Failed to load TLS certificates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public getHTTPSOptions(): https.ServerOptions {
    if (!this.config) {
      throw new Error('TLS configuration not initialized. Call initialize() first.')
    }

    return {
      ...this.config,
      // Additional security settings
      rejectUnauthorized: true,
      requestCert: false, // We don't require client certs by default
      agent: false
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
        issuer: 'Certificate Authority Placeholder',
        subject: 'NeonPro Healthcare API',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        fingerprint: 'placeholder-fingerprint'
      }
    } catch (error) {
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
      const requiredPaths = [this.certificateConfig.keyPath, this.certificateConfig.certPath]
      
      requiredPaths.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
          errors.push(`Certificate file not found: ${filePath}`)
        }
      })

      if (this.certificateConfig.caPath && !fs.existsSync(this.certificateConfig.caPath)) {
        warnings.push(`Optional CA file not found: ${this.certificateConfig.caPath}`)
      }
    }

    // Check cipher strength
    const weakCiphers = ['MD5', 'SHA1', 'RC4', 'DES', '3DES', 'NULL']
    this.config.ciphers.split(':').forEach(cipher => {
      if (weakCiphers.some(weak => cipher.includes(weak))) {
        errors.push(`Weak cipher detected: ${cipher}`)
      }
    })

    // Check TLS version
    if (this.config.minVersion !== 'TLSv1.3') {
      warnings.push('Consider using TLS 1.3 for enhanced security')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  public generateDHParams(): Buffer {
    // Generate Diffie-Hellman parameters for Perfect Forward Secrecy
    const crypto = require('crypto')
    const dhParams = crypto.createDiffieHellman(2048)
    return dhParams.getPrime()
  }

  public rotateSessionTickets(): void {
    if (this.config) {
      this.config.ticketKeys = crypto.getRandomValues(new Uint8Array(48))
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
      uptime: process.uptime()
    }
  }
}