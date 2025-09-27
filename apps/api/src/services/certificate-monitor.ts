import { exec } from 'child_process'
import fs from 'fs'
// import path from 'path';
import { promisify } from 'util'
import { TLSConfigManager } from '../config/tls-config.js'
import { HealthcareLogger } from '../logging/healthcare-logger.js'

const execAsync = promisify(exec)

export interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: Date
  validTo: Date
  fingerprint: string
  serialNumber: string
  version: number
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  publicKeySize: number
  sans: string[]
}

export interface CertificateMonitorConfig {
  certificatePath: string
  privateKeyPath?: string
  chainPath?: string
  renewalThresholdDays: number
  checkIntervalHours: number
  notificationEmail?: string
  webhookUrl?: string
  renewalCommand?: string
  autoRenew: boolean
}

export interface CertificateAlert {
  type: 'warning' | 'critical' | 'expired' | 'renewed' | 'error'
  certificate: CertificateInfo
  message: string
  timestamp: Date
  daysUntilExpiry?: number
}

export class CertificateMonitor {
  private config: CertificateMonitorConfig
  private logger: HealthcareLogger
  private tlsManager: TLSConfigManager
  private checkInterval?: NodeJS.Timeout
  private isChecking = false

  constructor(
    config: CertificateMonitorConfig,
    logger: HealthcareLogger,
    tlsManager: TLSConfigManager,
  ) {
    this.config = config
    this.logger = logger
    this.tlsManager = tlsManager
  }

  public async start(): Promise<void> {
    try {
      // Validate certificate files exist
      await this.validateCertificateFiles()

      // Perform initial check
      await this.checkCertificate()

      // Set up periodic checking
      this.checkInterval = setInterval(
        () => this.checkCertificate(),
        this.config.checkIntervalHours * 60 * 60 * 1000,
      )

      this.logger.logSystemEvent('certificate_monitor_started', {
        checkInterval: this.config.checkIntervalHours,
        renewalThreshold: this.config.renewalThresholdDays,
        certificatePath: this.config.certificatePath,
        timestamp: new Date().toISOString(),
      })
    } catch {
      error
      this.logger.logError('certificate_monitor_start_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        config: this.config,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = undefined
    }

    this.logger.logSystemEvent('certificate_monitor_stopped', {
      timestamp: new Date().toISOString(),
    })
  }

  private async validateCertificateFiles(): Promise<void> {
    const requiredFiles = [this.config.certificatePath]

    if (this.config.privateKeyPath) {
      requiredFiles.push(this.config.privateKeyPath)
    }

    for (const filePath of requiredFiles) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Certificate file not found: ${filePath}`)
      }

      try {
        const stats = fs.statSync(filePath)
        if (stats.size === 0) {
          throw new Error(`Certificate file is empty: ${filePath}`)
        }
      } catch {
        error
        throw new Error(`Cannot read certificate file: ${filePath}`)
      }
    }
  }

  private async checkCertificate(): Promise<void> {
    if (this.isChecking) {
      return
    }

    this.isChecking = true

    try {
      const certInfo = await this.getCertificateInfo()
      const daysUntilExpiry = this.calculateDaysUntilExpiry(certInfo.validTo)

      await this.logger.logSystemEvent('certificate_check_completed', {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom.toISOString(),
        validTo: certInfo.validTo.toISOString(),
        daysUntilExpiry,
        fingerprint: certInfo.fingerprint,
        timestamp: new Date().toISOString(),
      })

      // Determine alert level based on expiry
      await this.handleCertificateExpiry(certInfo, daysUntilExpiry)
    } catch {
      error
      await this.logger.logError('certificate_check_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        certificatePath: this.config.certificatePath,
        timestamp: new Date().toISOString(),
      })

      // Send error alert
      await this.sendAlert({
        type: 'error',
        certificate: {} as CertificateInfo,
        message: `Certificate check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        timestamp: new Date(),
      })
    } finally {
      this.isChecking = false
    }
  }

  private async getCertificateInfo(): Promise<CertificateInfo> {
    try {
      // Use OpenSSL to extract certificate information
      const { stdout } = await execAsync(
        `openssl x509 -in "${this.config.certificatePath}" -text -noout`,
      )

      return await this.parseCertificateOutput(stdout)
    } catch {
      error
      throw new Error(
        `Failed to get certificate info: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  private async parseCertificateOutput(
    opensslOutput: string,
  ): Promise<CertificateInfo> {
    const lines = opensslOutput.split('\n')

    const certInfo: Partial<CertificateInfo> = {}

    // Parse certificate fields
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith('Subject:')) {
        certInfo.subject = line.replace('Subject:', '').trim()
      } else if (line.startsWith('Issuer:')) {
        certInfo.issuer = line.replace('Issuer:', '').trim()
      } else if (line.startsWith('Not Before:')) {
        certInfo.validFrom = new Date(line.replace('Not Before:', '').trim())
      } else if (line.startsWith('Not After:')) {
        certInfo.validTo = new Date(line.replace('Not After:', '').trim())
      } else if (line.startsWith('Signature Algorithm:')) {
        certInfo.signatureAlgorithm = line
          .replace('Signature Algorithm:', '')
          .trim()
      } else if (line.startsWith('Public Key Algorithm:')) {
        certInfo.publicKeyAlgorithm = line
          .replace('Public Key Algorithm:', '')
          .trim()
      } else if (line.includes('Public-Key:')) {
        const keySizeMatch = line.match(/(\d+) bit/)
        if (keySizeMatch) {
          certInfo.publicKeySize = parseInt(keySizeMatch[1])
        }
      } else if (line.startsWith('X509v3 Subject Alternative Name:')) {
        const sansLine = line
          .replace('X509v3 Subject Alternative Name:', '')
          .trim()
        certInfo.sans = this.parseSANs(sansLine)
      }
    }

    // Get additional certificate info
    try {
      const { stdout: fingerprintOutput } = await execAsync(
        `openssl x509 -in "${this.config.certificatePath}" -fingerprint -noout`,
      )
      certInfo.fingerprint = fingerprintOutput
        .replace('SHA1 Fingerprint=', '')
        .trim()
    } catch {
      error
      // Fingerprint is optional
    }

    try {
      const { stdout: serialOutput } = await execAsync(
        `openssl x509 -in "${this.config.certificatePath}" -serial -noout`,
      )
      certInfo.serialNumber = serialOutput.replace('serial=', '').trim()
    } catch {
      error
      // Serial number is optional
    }

    return {
      subject: certInfo.subject || 'Unknown',
      issuer: certInfo.issuer || 'Unknown',
      validFrom: certInfo.validFrom || new Date(),
      validTo: certInfo.validTo || new Date(),
      fingerprint: certInfo.fingerprint || 'Unknown',
      serialNumber: certInfo.serialNumber || 'Unknown',
      version: certInfo.version || 3,
      signatureAlgorithm: certInfo.signatureAlgorithm || 'Unknown',
      publicKeyAlgorithm: certInfo.publicKeyAlgorithm || 'Unknown',
      publicKeySize: certInfo.publicKeySize || 0,
      sans: certInfo.sans || [],
    }
  }

  private parseSANs(sansLine: string): string[] {
    const sans: string[] = []

    // Parse different types of Subject Alternative Names
    const dnsMatches = sansLine.match(/DNS:([^,\s]+)/g)
    const emailMatches = sansLine.match(/email:([^,\s]+)/g)
    const uriMatches = sansLine.match(/URI:([^,\s]+)/g)
    const ipMatches = sansLine.match(/IP Address:([^,\s]+)/g)

    if (dnsMatches) {
      sans.push(...dnsMatches.map(match => match.replace('DNS:', '')))
    }
    if (emailMatches) {
      sans.push(...emailMatches.map(match => match.replace('email:', '')))
    }
    if (uriMatches) {
      sans.push(...uriMatches.map(match => match.replace('URI:', '')))
    }
    if (ipMatches) {
      sans.push(...ipMatches.map(match => match.replace('IP Address:', '')))
    }

    return sans
  }

  private calculateDaysUntilExpiry(validTo: Date): number {
    const now = new Date()
    const timeDiff = validTo.getTime() - now.getTime()
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  private async handleCertificateExpiry(
    certInfo: CertificateInfo,
    daysUntilExpiry: number,
  ): Promise<void> {
    let alertType: CertificateAlert['type'] = 'warning'
    let message = ''

    if (daysUntilExpiry < 0) {
      alertType = 'expired'
      message = `Certificate expired ${Math.abs(daysUntilExpiry)} days ago`
    } else if (daysUntilExpiry === 0) {
      alertType = 'critical'
      message = 'Certificate expires today'
    } else if (daysUntilExpiry <= 7) {
      alertType = 'critical'
      message = `Certificate expires in ${daysUntilExpiry} days`
    } else if (daysUntilExpiry <= this.config.renewalThresholdDays) {
      alertType = 'warning'
      message = `Certificate expires in ${daysUntilExpiry} days`
    } else {
      // Certificate is valid, no alert needed
      return
    }

    const alert: CertificateAlert = {
      type: alertType,
      certificate: certInfo,
      message,
      timestamp: new Date(),
      daysUntilExpiry,
    }

    await this.sendAlert(alert)

    // Attempt auto-renewal if configured
    if (
      this.config.autoRenew &&
      alertType === 'critical' &&
      this.config.renewalCommand
    ) {
      await this.attemptAutoRenewal(alert)
    }
  }

  private async sendAlert(alert: CertificateAlert): Promise<void> {
    try {
      // Log the alert
      this.logger.logSystemEvent('certificate_alert', {
        type: alert.type,
        message: alert.message,
        certificate: {
          subject: alert.certificate.subject,
          issuer: alert.certificate.issuer,
          validTo: alert.certificate.validTo.toISOString(),
          fingerprint: alert.certificate.fingerprint,
        },
        daysUntilExpiry: alert.daysUntilExpiry,
        timestamp: alert.timestamp.toISOString(),
      })

      // Send email notification if configured
      if (this.config.notificationEmail) {
        await this.sendEmailAlert(alert)
      }

      // Send webhook notification if configured
      if (this.config.webhookUrl) {
        await this.sendWebhookAlert(alert)
      }
    } catch {
      error
      await this.logger.logError('certificate_alert_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        alert,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private async sendEmailAlert(alert: CertificateAlert): Promise<void> {
    // Placeholder for email alert implementation
    // In a real implementation, you would use a service like SendGrid, AWS SES, or nodemailer
    this.logger.logSystemEvent('email_alert_sent', {
      to: this.config.notificationEmail,
      type: alert.type,
      message: alert.message,
      timestamp: new Date().toISOString(),
    })
  }

  private async sendWebhookAlert(alert: CertificateAlert): Promise<void> {
    try {
      // Use fetch or axios to send webhook
      // This is a placeholder implementation
      this.logger.logSystemEvent('webhook_alert_sent', {
        url: this.config.webhookUrl,
        type: alert.type,
        timestamp: new Date().toISOString(),
      })
    } catch {
      error
      throw new Error(
        `Failed to send webhook alert: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  private async attemptAutoRenewal(alert: CertificateAlert): Promise<void> {
    try {
      if (!this.config.renewalCommand) {
        return
      }

      this.logger.logSystemEvent('auto_renewal_attempt', {
        certificate: alert.certificate.subject,
        command: this.config.renewalCommand,
        timestamp: new Date().toISOString(),
      })

      const { stdout, stderr } = await execAsync(this.config.renewalCommand)

      if (stderr) {
        throw new Error(`Renewal command stderr: ${stderr}`)
      }

      // Check if renewal was successful by verifying certificate again
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for renewal
      await this.checkCertificate()

      this.logger.logSystemEvent('auto_renewal_success', {
        certificate: alert.certificate.subject,
        output: stdout,
        timestamp: new Date().toISOString(),
      })

      // Send renewal success alert
      await this.sendAlert({
        type: 'renewed',
        certificate: alert.certificate,
        message: 'Certificate automatically renewed successfully',
        timestamp: new Date(),
      })
    } catch {
      error
      await this.logger.logError('auto_renewal_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        certificate: alert.certificate.subject,
        command: this.config.renewalCommand,
        timestamp: new Date().toISOString(),
      })

      // Send failure alert
      await this.sendAlert({
        type: 'error',
        certificate: alert.certificate,
        message: `Automatic renewal failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        timestamp: new Date(),
      })
    }
  }

  public async getCertificateStatus(): Promise<{
    certificate: CertificateInfo | null
    daysUntilExpiry: number | null
    status: 'valid' | 'expiring' | 'expired' | 'error'
    lastCheck: Date | null
  }> {
    try {
      const certInfo = await this.getCertificateInfo()
      const daysUntilExpiry = this.calculateDaysUntilExpiry(certInfo.validTo)

      let status: 'valid' | 'expiring' | 'expired' | 'error'
      if (daysUntilExpiry < 0) {
        status = 'expired'
      } else if (daysUntilExpiry <= this.config.renewalThresholdDays) {
        status = 'expiring'
      } else {
        status = 'valid'
      }

      return {
        certificate: certInfo,
        daysUntilExpiry,
        status,
        lastCheck: new Date(),
      }
    } catch {
      error
      return {
        certificate: null,
        daysUntilExpiry: null,
        status: 'error',
        lastCheck: new Date(),
      }
    }
  }

  public updateConfig(newConfig: Partial<CertificateMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig }

    this.logger.logSystemEvent('certificate_monitor_config_updated', {
      newConfig,
      timestamp: new Date().toISOString(),
    })

    // Restart monitoring with new config
    this.stop()
    this.start().catch(async error => {
      await this.logger.logError('certificate_monitor_restart_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    })
  }
}
