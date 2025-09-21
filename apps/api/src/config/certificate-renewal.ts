/**
 * SSL/TLS Certificate Renewal and Monitoring Configuration
 * Implements automatic certificate renewal for healthcare compliance
 */

import { readFileSync } from 'fs';
import { logger } from '../lib/logger';

interface CertificateInfo {
  cert: string;
  key: string;
  ca?: string;
  issuer: string;
  subject: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  serialNumber: string;
}

interface RenewalConfig {
  provider: 'letsencrypt' | 'manual';
  email: string;
  domains: string[];
  staging: boolean;
  renewalThresholdDays: number;
  monitoringIntervalHours: number;
}

/**
 * Parse certificate to extract information
 */
function parseCertificate(certPath: string): CertificateInfo | null {
  try {
    const certContent = readFileSync(certPath, 'utf8');

    // Parse certificate using crypto module
    const crypto = require('crypto');
    const cert = new crypto.X509Certificate(certContent);

    const expiryDate = new Date(cert.validTo);
    const _now = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      cert: certContent,
      key: '', // Will be loaded separately
      issuer: cert.issuer,
      subject: cert.subject,
      expiryDate,
      daysUntilExpiry,
      serialNumber: cert.serialNumber,
    };
  } catch (_error) {
    logger.error('Failed to parse certificate', { error: error.message });
    return null;
  }
}

/**
 * Check certificate expiry and trigger renewal if needed
 */
export async function checkCertificateExpiry(): Promise<void> {
  const config = getRenewalConfig();
  const certPath = process.env.SSL_CERT_PATH;

  if (!certPath) {
    logger.warn('SSL certificate path not configured');
    return;
  }

  const certInfo = parseCertificate(certPath);
  if (!certInfo) {
    logger.error('Failed to parse certificate for expiry check');
    return;
  }

  logger.info('Certificate expiry check', {
    expiryDate: certInfo.expiryDate,
    daysUntilExpiry: certInfo.daysUntilExpiry,
    subject: certInfo.subject,
  });

  // Check if renewal is needed
  if (certInfo.daysUntilExpiry <= config.renewalThresholdDays) {
    logger.warn('Certificate renewal required', {
      daysUntilExpiry: certInfo.daysUntilExpiry,
      threshold: config.renewalThresholdDays,
    });

    await triggerCertificateRenewal(config);
  } else {
    logger.info('Certificate is valid', {
      daysUntilExpiry: certInfo.daysUntilExpiry,
    });
  }
}

/**
 * Trigger certificate renewal process
 */
async function triggerCertificateRenewal(config: RenewalConfig): Promise<void> {
  try {
    logger.info('Starting certificate renewal process', {
      provider: config.provider,
      domains: config.domains,
    });

    if (config.provider === 'letsencrypt') {
      await renewLetsEncryptCertificate(config);
    } else {
      logger.warn('Manual certificate renewal required');
      await notifyManualRenewalRequired(config);
    }
  } catch (_error) {
    logger.error('Certificate renewal failed', { error: error.message });
    await notifyRenewalFailure(error as Error);
  }
}

/**
 * Renew Let's Encrypt certificate using certbot
 */
async function renewLetsEncryptCertificate(config: RenewalConfig): Promise<void> {
  const { spawn } = require('child_process');

  const certbotArgs = [
    'renew',
    '--quiet',
    '--non-interactive',
    '--agree-tos',
    '--email',
    config.email,
  ];

  if (config.staging) {
    certbotArgs.push('--staging');
  }

  return new Promise(_(resolve,_reject) => {
    const certbot = spawn('certbot', certbotArgs);

    certbot.on(_'close', (code: number) => {
      if (code === 0) {
        logger.info('Certificate renewal successful');
        notifyRenewalSuccess();
        resolve();
      } else {
        const error = new Error(`Certbot renewal failed with code ${code}`);
        logger.error('Certificate renewal failed', { exitCode: code });
        reject(error);
      }
    });

    certbot.on(_'error', (error: Error) => {
      logger.error('Certbot spawn error', { error: error.message });
      reject(error);
    });
  });
}

/**
 * Get renewal configuration from environment
 */
function getRenewalConfig(): RenewalConfig {
  return {
    provider: (process.env.CERT_PROVIDER as 'letsencrypt' | 'manual') || 'letsencrypt',
    email: process.env.LETSENCRYPT_EMAIL || 'admin@neonpro.com',
    domains: process.env.CERT_DOMAINS?.split(',') || ['api.neonpro.com'],
    staging: process.env.LETSENCRYPT_STAGING === 'true',
    renewalThresholdDays: parseInt(process.env.CERT_RENEWAL_THRESHOLD_DAYS || '30'),
    monitoringIntervalHours: parseInt(process.env.CERT_MONITORING_INTERVAL_HOURS || '24'),
  };
}

/**
 * Start certificate monitoring service
 */
export function startCertificateMonitoring(): void {
  const config = getRenewalConfig();
  const intervalMs = config.monitoringIntervalHours * 60 * 60 * 1000;

  logger.info('Starting certificate monitoring service', {
    intervalHours: config.monitoringIntervalHours,
    thresholdDays: config.renewalThresholdDays,
  });

  // Initial check
  checkCertificateExpiry();

  // Schedule periodic checks
  setInterval(_() => {
    checkCertificateExpiry();
  }, intervalMs);
}

/**
 * Notify successful renewal
 */
async function notifyRenewalSuccess(): Promise<void> {
  logger.info('Certificate renewal successful - service will restart to load new certificate');

  // In production, you might want to reload the certificate without restart
  // For now, we'll log the success
  const certInfo = parseCertificate(process.env.SSL_CERT_PATH!);
  if (certInfo) {
    logger.info('New certificate loaded', {
      expiryDate: certInfo.expiryDate,
      daysUntilExpiry: certInfo.daysUntilExpiry,
    });
  }
}

/**
 * Notify manual renewal required
 */
async function notifyManualRenewalRequired(config: RenewalConfig): Promise<void> {
  const message = `Manual certificate renewal required for domains: ${config.domains.join(', ')}`;

  logger.warn(message, {
    provider: config.provider,
    domains: config.domains,
  });

  // In production, you might want to send email/Slack notifications here
}

/**
 * Notify renewal failure
 */
async function notifyRenewalFailure(error: Error): Promise<void> {
  const message = `Certificate renewal failed: ${error.message}`;

  logger.error(message, { error: error.message });

  // In production, you might want to send urgent notifications here
}

/**
 * Health check for certificate status
 */
export function getCertificateHealth(): {
  status: 'healthy' | 'warning' | 'critical';
  daysUntilExpiry: number;
  expiryDate?: Date;
  error?: string;
} {
  try {
    const certPath = process.env.SSL_CERT_PATH;
    if (!certPath) {
      return {
        status: 'critical',
        daysUntilExpiry: 0,
        error: 'Certificate path not configured',
      };
    }

    const certInfo = parseCertificate(certPath);
    if (!certInfo) {
      return {
        status: 'critical',
        daysUntilExpiry: 0,
        error: 'Failed to parse certificate',
      };
    }

    const status = certInfo.daysUntilExpiry <= 7
      ? 'critical'
      : certInfo.daysUntilExpiry <= 30
      ? 'warning'
      : 'healthy';

    return {
      status,
      daysUntilExpiry: certInfo.daysUntilExpiry,
      expiryDate: certInfo.expiryDate,
    };
  } catch (_error) {
    return {
      status: 'critical',
      daysUntilExpiry: 0,
      error: (error as Error).message,
    };
  }
}
