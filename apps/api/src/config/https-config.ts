/**
 * HTTPS Configuration for NeonPro API
 * TLS 1.3+ mandatory configuration with healthcare compliance
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface HTTPSConfig {
  cert?: string;
  key?: string;
  ca?: string;
  secureProtocol: string;
  minVersion: string;
  maxVersion: string;
  ciphers: string;
  honorCipherOrder: boolean;
  dhparam?: string;
  ecdhCurve: string;
}

/**
 * TLS 1.3 cipher suites for Perfect Forward Secrecy (PFS)
 * Compliant with healthcare security standards
 */
const TLS_13_CIPHER_SUITES = [
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_AES_128_GCM_SHA256',
].join(':');

/**
 * TLS 1.2 cipher suites (fallback, if needed)
 * All suites provide Perfect Forward Secrecy
 */
const TLS_12_CIPHER_SUITES = [
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-RSA-AES128-GCM-SHA256',
].join(':');

/**
 * Combined cipher list for TLS 1.2+ compatibility
 */
const SECURE_CIPHERS = `${TLS_13_CIPHER_SUITES}:${TLS_12_CIPHER_SUITES}`;

/**
 * Get HTTPS configuration based on environment
 */
export function getHTTPSConfig(): HTTPSConfig {
  const config: HTTPSConfig = {
    // TLS version constraints - TLS 1.3+ mandatory
    secureProtocol: 'TLSv1_3_method',
    minVersion: 'TLSv1.3',
    maxVersion: 'TLSv1.3',

    // Cipher configuration for Perfect Forward Secrecy
    ciphers: SECURE_CIPHERS,
    honorCipherOrder: true,

    // Elliptic curve for ECDHE
    ecdhCurve: 'prime256v1:secp384r1:secp521r1',
  };

  // Load certificates in production
  if (process.env.NODE_ENV === 'production') {
    const certPath = process.env.SSL_CERT_PATH;
    const keyPath = process.env.SSL_KEY_PATH;
    const caPath = process.env.SSL_CA_PATH;

    if (certPath && keyPath) {
      try {
        config.cert = readFileSync(certPath, 'utf8');
        config.key = readFileSync(keyPath, 'utf8');

        if (caPath) {
          config.ca = readFileSync(caPath, 'utf8');
        }
      } catch {
        console.error('Failed to load SSL certificates:', error);
        throw new Error('SSL certificate loading failed');
      }
    } else {
      throw new Error('SSL certificate paths not configured for production');
    }
  } else {
    // Development certificates (self-signed)
    try {
      const devCertsPath = join(process.cwd(), 'certs', 'dev');
      config.cert = readFileSync(join(devCertsPath, 'server.crt'), 'utf8');
      config.key = readFileSync(join(devCertsPath, 'server.key'), 'utf8');
    } catch {
      void error;
      // Certificate loading failed - handled by fallback logic
      console.warn(
        'Development certificates not found, HTTPS will not be available',
      );
      // Return configuration without certificates for HTTP fallback
    }
  }

  return config;
}

/**
 * Validate TLS configuration
 */
export function validateTLSConfig(config: HTTPSConfig): boolean {
  // Ensure TLS 1.3+ is enforced
  if (config.minVersion !== 'TLSv1.3') {
    throw new Error('TLS 1.3+ is mandatory for healthcare compliance');
  }

  // Ensure cipher suites include PFS
  if (!config.ciphers.includes('ECDHE-') && !config.ciphers.includes('TLS')) {
    throw new Error('Perfect Forward Secrecy cipher suites required');
  }

  // Validate certificate presence in production
  if (process.env.NODE_ENV === 'production' && (!config.cert || !config.key)) {
    throw new Error('SSL certificates required in production');
  }

  return true;
}

/**
 * Get security headers for HTTPS responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // HSTS with 1 year max-age, include subdomains, and preload
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Content Security Policy for healthcare app
    'Content-Security-Policy': [
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\'', // Allow inline scripts for React
      'style-src \'self\' \'unsafe-inline\'', // Allow inline styles
      'img-src \'self\' data: https:', // Allow images from self, data URLs, and HTTPS
      'connect-src \'self\' https://api.neonpro.com wss://api.neonpro.com',
      'font-src \'self\'',
      'object-src \'none\'',
      'media-src \'self\'',
      'frame-ancestors \'none\'',
    ].join('; '),

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permission policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
