/**
 * Security Headers Service
 * Provides security headers generation and validation for healthcare compliance
 */

import { z } from 'zod';

/**
 * Security header configuration schema
 */
export const SecurityHeaderConfigSchema = z.object({
  // Content Security Policy
  contentSecurityPolicy: z.object({
    enabled: z.boolean().default(true),
    directives: z.record(z.string(), z.array(z.string())).default({
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    }),
    reportUri: z.string().optional(),
    reportOnly: z.boolean().default(false)
  }).default({}),

  // HTTP Strict Transport Security
  strictTransportSecurity: z.object({
    enabled: z.boolean().default(true),
    maxAge: z.number().int().min(0).default(31536000), // 1 year
    includeSubDomains: z.boolean().default(true),
    preload: z.boolean().default(false)
  }).default({}),

  // X-Frame-Options
  frameOptions: z.object({
    enabled: z.boolean().default(true),
    policy: z.enum(['DENY', 'SAMEORIGIN', 'ALLOW-FROM']).default('DENY'),
    allowFrom: z.string().optional()
  }).default({}),

  // X-Content-Type-Options
  contentTypeOptions: z.object({
    enabled: z.boolean().default(true),
    nosniff: z.boolean().default(true)
  }).default({}),

  // X-XSS-Protection
  xssProtection: z.object({
    enabled: z.boolean().default(true),
    mode: z.enum(['0', '1', '1; mode=block']).default('1; mode=block'),
    reportUri: z.string().optional()
  }).default({}),

  // Referrer Policy
  referrerPolicy: z.object({
    enabled: z.boolean().default(true),
    policy: z.enum([
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ]).default('strict-origin-when-cross-origin')
  }).default({}),

  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: z.object({
    enabled: z.boolean().default(true),
    policies: z.record(z.string(), z.array(z.string())).default({
      'camera': [],
      'microphone': [],
      'geolocation': [],
      'payment': [],
      'usb': [],
      'bluetooth': []
    })
  }).default({}),

  // Healthcare-specific headers
  healthcare: z.object({
    hipaaCompliant: z.boolean().default(true),
    lgpdCompliant: z.boolean().default(true),
    dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('confidential'),
    auditRequired: z.boolean().default(true)
  }).default({})
});

export type SecurityHeaderConfig = z.infer<typeof SecurityHeaderConfigSchema>;

/**
 * Generated security headers
 */
export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Content-Security-Policy-Report-Only'?: string;
  'Strict-Transport-Security'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'X-Healthcare-Classification'?: string;
  'X-Audit-Required'?: string;
  'X-LGPD-Compliant'?: string;
}

/**
 * Generate security headers based on configuration
 */
export function generateSecurityHeaders(config: Partial<SecurityHeaderConfig> = {}): SecurityHeaders {
  const fullConfig = SecurityHeaderConfigSchema.parse(config);
  const headers: SecurityHeaders = {};

  // Content Security Policy
  if (fullConfig.contentSecurityPolicy.enabled) {
    const directives = Object.entries(fullConfig.contentSecurityPolicy.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    const headerName = fullConfig.contentSecurityPolicy.reportOnly 
      ? 'Content-Security-Policy-Report-Only' 
      : 'Content-Security-Policy';
    
    headers[headerName] = directives;
  }

  // Strict Transport Security
  if (fullConfig.strictTransportSecurity.enabled) {
    let value = `max-age=${fullConfig.strictTransportSecurity.maxAge}`;
    if (fullConfig.strictTransportSecurity.includeSubDomains) {
      value += '; includeSubDomains';
    }
    if (fullConfig.strictTransportSecurity.preload) {
      value += '; preload';
    }
    headers['Strict-Transport-Security'] = value;
  }

  // X-Frame-Options
  if (fullConfig.frameOptions.enabled) {
    let value = fullConfig.frameOptions.policy;
    if (fullConfig.frameOptions.policy === 'ALLOW-FROM' && fullConfig.frameOptions.allowFrom) {
      value += ` ${fullConfig.frameOptions.allowFrom}`;
    }
    headers['X-Frame-Options'] = value;
  }

  // X-Content-Type-Options
  if (fullConfig.contentTypeOptions.enabled && fullConfig.contentTypeOptions.nosniff) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // X-XSS-Protection
  if (fullConfig.xssProtection.enabled) {
    headers['X-XSS-Protection'] = fullConfig.xssProtection.mode;
  }

  // Referrer Policy
  if (fullConfig.referrerPolicy.enabled) {
    headers['Referrer-Policy'] = fullConfig.referrerPolicy.policy;
  }

  // Permissions Policy
  if (fullConfig.permissionsPolicy.enabled) {
    const policies = Object.entries(fullConfig.permissionsPolicy.policies)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');
    headers['Permissions-Policy'] = policies;
  }

  // Healthcare-specific headers
  if (fullConfig.healthcare.hipaaCompliant || fullConfig.healthcare.lgpdCompliant) {
    headers['X-Healthcare-Classification'] = fullConfig.healthcare.dataClassification;
    headers['X-Audit-Required'] = fullConfig.healthcare.auditRequired ? 'true' : 'false';
    headers['X-LGPD-Compliant'] = fullConfig.healthcare.lgpdCompliant ? 'true' : 'false';
  }

  return headers;
}

/**
 * Validate security headers against configuration
 */
export function validateSecurityHeaders(headers: Record<string, string>, config: Partial<SecurityHeaderConfig> = {}): boolean {
  const fullConfig = SecurityHeaderConfigSchema.parse(config);
  
  // Check required headers based on configuration
  const requiredHeaders: string[] = [];
  
  if (fullConfig.contentSecurityPolicy.enabled) {
    requiredHeaders.push(
      fullConfig.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy'
    );
  }
  
  if (fullConfig.strictTransportSecurity.enabled) {
    requiredHeaders.push('Strict-Transport-Security');
  }
  
  if (fullConfig.frameOptions.enabled) {
    requiredHeaders.push('X-Frame-Options');
  }
  
  if (fullConfig.contentTypeOptions.enabled) {
    requiredHeaders.push('X-Content-Type-Options');
  }
  
  if (fullConfig.xssProtection.enabled) {
    requiredHeaders.push('X-XSS-Protection');
  }
  
  if (fullConfig.referrerPolicy.enabled) {
    requiredHeaders.push('Referrer-Policy');
  }
  
  // Check if all required headers are present
  for (const headerName of requiredHeaders) {
    if (!(headerName in headers)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Healthcare security header presets
 */
export const HealthcareSecurityPresets = {
  strict: {
    contentSecurityPolicy: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      },
      reportOnly: false
    },
    strictTransportSecurity: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameOptions: {
      enabled: true,
      policy: 'DENY' as const
    },
    healthcare: {
      hipaaCompliant: true,
      lgpdCompliant: true,
      dataClassification: 'restricted' as const,
      auditRequired: true
    }
  },
  
  development: {
    contentSecurityPolicy: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'", 'ws:', 'wss:'],
        'frame-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      },
      reportOnly: true
    },
    strictTransportSecurity: {
      enabled: false
    },
    healthcare: {
      hipaaCompliant: true,
      lgpdCompliant: true,
      dataClassification: 'internal' as const,
      auditRequired: true
    }
  }
} as const;

/**
 * Get default healthcare security configuration
 */
export function getDefaultHealthcareSecurityConfig(environment: 'production' | 'development' = 'production'): SecurityHeaderConfig {
  const preset = environment === 'production' ? HealthcareSecurityPresets.strict : HealthcareSecurityPresets.development;
  return SecurityHeaderConfigSchema.parse(preset);
}