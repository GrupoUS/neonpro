/**
 * Enhanced Security Headers Middleware for Healthcare Platform
 * Comprehensive security headers including HSTS, CSP, and healthcare-specific protections
 *
 * Features:
 * - HTTP Strict Transport Security (HSTS)
 * - Comprehensive security headers
 * - Healthcare-specific protections
 * - LGPD compliance headers
 * - Security headers monitoring
 *
 * @version 2.0.0
 * @compliance LGPD, ANVISA, CFM, ISO 27001
 * @healthcare-platform NeonPro
 */

import { Context, MiddlewareHandler, Next } from 'hono';
import { logger } from '../lib/logger';

// Enhanced Security Headers Configuration
export interface SecurityHeadersConfig {
  // HSTS Configuration
  hsts?: {
    enabled: boolean;
    maxAge: number; // in seconds
    includeSubDomains: boolean;
    preload: boolean;
  };

  // Content Security Policy
  csp?: {
    enabled: boolean;
    reportOnly: boolean;
    reportUri?: string;
  };

  // Other Security Headers
  headers?: {
    // Frame Options
    frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';

    // XSS Protection
    xssProtection?: boolean;
    xssBlockMode?: boolean;

    // Content Type Options
    contentTypeOptions?: boolean;

    // Referrer Policy
    referrerPolicy?: string;

    // Permissions Policy
    permissionsPolicy?: Record<string, string>;

    // Cross-Origin Embedder Policy
    coep?: boolean;

    // Cross-Origin Opener Policy
    coop?: boolean;

    // Cross-Origin Resource Policy
    corp?: string;
  };

  // Healthcare-specific headers
  healthcare?: {
    complianceHeaders: boolean;
    dataClassification:
      | 'PUBLIC'
      | 'INTERNAL'
      | 'CONFIDENTIAL'
      | 'RESTRICTED'
      | 'HIGHLY_RESTRICTED';
    auditTrail: boolean;
    encryptionStatus: boolean;
  };

  // Monitoring
  monitoring?: {
    logHeaders: boolean;
    monitorViolations: boolean;
  };
}

// Healthcare Security Headers Manager
export class HealthcareSecurityHeadersManager {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig) {
    this.config = {
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      csp: {
        enabled: true,
        reportOnly: false,
      },
      headers: {
        frameOptions: 'DENY',
        xssProtection: true,
        xssBlockMode: true,
        contentTypeOptions: true,
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: {
          camera: '()',
          microphone: '()',
          geolocation: '()',
          payment: '()',
          usb: '()',
          'screen-wake-lock': '()',
        },
        coep: true,
        coop: 'same-origin',
        corp: 'same-origin',
      },
      healthcare: {
        complianceHeaders: true,
        dataClassification: 'HIGHLY_RESTRICTED',
        auditTrail: true,
        encryptionStatus: true,
      },
      monitoring: {
        logHeaders: true,
        monitorViolations: true,
      },
      ...config,
    };
  }

  // Generate HSTS header
  generateHSTSHeader(): string {
    const { hsts } = this.config;
    if (!hsts?.enabled) return '';

    const directives = [`max-age=${hsts.maxAge}`];

    if (hsts.includeSubDomains) {
      directives.push('includeSubDomains');
    }

    if (hsts.preload) {
      directives.push('preload');
    }

    return `Strict-Transport-Security: ${directives.join('; ')}`;
  }

  // Generate comprehensive security headers
  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // HSTS Header
    if (this.config.hsts?.enabled) {
      headers['Strict-Transport-Security'] = this.generateHSTSHeader();
    }

    // Frame Options
    if (this.config.headers?.frameOptions) {
      headers['X-Frame-Options'] = this.config.headers.frameOptions;
    }

    // XSS Protection
    if (this.config.headers?.xssProtection) {
      const xssValue = this.config.headers.xssBlockMode ? '1; mode=block' : '1';
      headers['X-XSS-Protection'] = xssValue;
    }

    // Content Type Options
    if (this.config.headers?.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // Referrer Policy
    if (this.config.headers?.referrerPolicy) {
      headers['Referrer-Policy'] = this.config.headers.referrerPolicy;
    }

    // Permissions Policy
    if (this.config.headers?.permissionsPolicy) {
      const policyString = Object.entries(this.config.headers.permissionsPolicy)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
      headers['Permissions-Policy'] = policyString;
    }

    // Cross-Origin Embedder Policy
    if (this.config.headers?.coep) {
      headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    }

    // Cross-Origin Opener Policy
    if (this.config.headers?.coop) {
      headers['Cross-Origin-Opener-Policy'] = this.config.headers.coop;
    }

    // Cross-Origin Resource Policy
    if (this.config.headers?.corp) {
      headers['Cross-Origin-Resource-Policy'] = this.config.headers.corp;
    }

    // Healthcare Compliance Headers
    if (this.config.healthcare?.complianceHeaders) {
      headers['X-Healthcare-Compliance'] = 'LGPD,ANVISA,CFM';
      headers['X-Data-Classification'] = this.config.healthcare.dataClassification;
      headers['X-Audit-Trail'] = this.config.healthcare.auditTrail
        ? 'enabled'
        : 'disabled';
      headers['X-Encryption-Status'] = this.config.healthcare.encryptionStatus
        ? 'enabled'
        : 'disabled';
    }

    // Additional security headers
    headers['X-Request-ID'] = this.generateRequestId();
    headers['X-Content-Security-Policy'] =
      'default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\';';

    return headers;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log security headers for monitoring
  logSecurityHeaders(headers: Record<string, string>, context: Context): void {
    if (!this.config.monitoring?.logHeaders) return;

    logger.info('Security headers applied', {
      requestId: headers['X-Request-ID'],
      endpoint: context.req.path,
      method: context.req.method,
      headersCount: Object.keys(headers).length,
      hstsEnabled: !!headers['Strict-Transport-Security'],
      healthcareCompliance: !!headers['X-Healthcare-Compliance'],
    });
  }

  // Validate security headers configuration
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate HSTS configuration
    if (this.config.hsts?.enabled) {
      if (this.config.hsts.maxAge < 0) {
        errors.push('HSTS maxAge must be positive');
      }

      if (this.config.hsts.maxAge > 63072000) {
        // 2 years
        errors.push('HSTS maxAge should not exceed 63072000 (2 years)');
      }
    }

    // Validate healthcare compliance
    if (this.config.healthcare?.complianceHeaders) {
      const validClassifications = [
        'PUBLIC',
        'INTERNAL',
        'CONFIDENTIAL',
        'RESTRICTED',
        'HIGHLY_RESTRICTED',
      ];
      if (
        !validClassifications.includes(
          this.config.healthcare.dataClassification,
        )
      ) {
        errors.push(
          `Invalid data classification: ${this.config.healthcare.dataClassification}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get environment-specific configuration
  getEnvironmentConfig(
    environment: 'development' | 'staging' | 'production',
  ): SecurityHeadersConfig {
    const baseConfig = { ...this.config };

    switch (environment) {
      case 'development':
        baseConfig.csp = { ...baseConfig.csp, reportOnly: true };
        baseConfig.monitoring = { ...baseConfig.monitoring, logHeaders: true };
        break;
      case 'staging':
        baseConfig.csp = { ...baseConfig.csp, reportOnly: true };
        break;
      case 'production':
        baseConfig.csp = { ...baseConfig.csp, reportOnly: false };
        break;
    }

    return baseConfig;
  }
}

// Create default security headers configuration
export function createDefaultSecurityHeadersConfig(
  overrides?: Partial<SecurityHeadersConfig>,
): SecurityHeadersConfig {
  const environment = (process.env.NODE_ENV as 'development' | 'staging' | 'production')
    || 'development';

  return {
    hsts: {
      enabled: environment !== 'development', // Disable in development for HTTP
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    csp: {
      enabled: true,
      reportOnly: environment === 'development',
      reportUri: '/api/security/csp-violations',
    },
    headers: {
      frameOptions: 'DENY',
      xssProtection: true,
      xssBlockMode: true,
      contentTypeOptions: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: '()',
        microphone: '()',
        geolocation: '()',
        payment: '()',
        usb: '()',
        'screen-wake-lock': '()',
      },
      coep: true,
      coop: 'same-origin',
      corp: 'same-origin',
    },
    healthcare: {
      complianceHeaders: true,
      dataClassification: 'HIGHLY_RESTRICTED',
      auditTrail: true,
      encryptionStatus: true,
    },
    monitoring: {
      logHeaders: true,
      monitorViolations: true,
    },
    ...overrides,
  };
}

// Security Headers Middleware
export function securityHeadersMiddleware(
  config?: Partial<SecurityHeadersConfig>,
): MiddlewareHandler {
  const securityManager = new HealthcareSecurityHeadersManager(
    createDefaultSecurityHeadersConfig(config),
  );

  // Validate configuration
  const validation = securityManager.validateConfiguration();
  if (!validation.valid) {
    logger.error('Security headers configuration invalid', {
      errors: validation.errors,
    });
  }

  return async (c: Context, next: Next) => {
    // Generate security headers
    const headers = securityManager.generateSecurityHeaders();

    // Apply headers to response
    Object.entries(headers).forEach(([key, value]) => {
      c.header(key, value);
    });

    // Log headers for monitoring
    securityManager.logSecurityHeaders(headers, c);

    // Add security context to request
    c.set('securityHeaders', {
      requestId: headers['X-Request-ID'],
      timestamp: new Date().toISOString(),
      headersApplied: Object.keys(headers),
    });

    await next();
  };
}

// Healthcare-specific security headers middleware
export function healthcareSecurityHeadersMiddleware(): MiddlewareHandler {
  return securityHeadersMiddleware({
    healthcare: {
      complianceHeaders: true,
      dataClassification: 'HIGHLY_RESTRICTED',
      auditTrail: true,
      encryptionStatus: true,
    },
    hsts: {
      enabled: process.env.NODE_ENV === 'production',
      maxAge: 63072000, // 2 years for healthcare
      includeSubDomains: true,
      preload: true,
    },
    monitoring: {
      logHeaders: true,
      monitorViolations: true,
    },
  });
}

// Development security headers (less strict)
export function developmentSecurityHeadersMiddleware(): MiddlewareHandler {
  return securityHeadersMiddleware({
    hsts: {
      enabled: false, // Disable in development
      maxAge: 0,
      includeSubDomains: false,
      preload: false,
    },
    csp: {
      enabled: true,
      reportOnly: true,
    },
    monitoring: {
      logHeaders: true,
      monitorViolations: false,
    },
  });
}

// Export types and utilities
export type { SecurityHeadersConfig };
