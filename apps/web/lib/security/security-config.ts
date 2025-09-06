/**
 * Comprehensive Security Configuration for NeonPro Healthcare Platform
 * Includes LGPD, ANVISA, and CFM compliance requirements
 */

export interface SecurityConfig {
  cors: CORSConfig;
  headers: SecurityHeaders;
  rateLimiting: RateLimitConfig;
  encryption: EncryptionConfig;
  compliance: ComplianceConfig;
}

export interface CORSConfig {
  allowedOrigins: {
    development: string[];
    staging: string[];
    production: string[];
  };
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export interface SecurityHeaders {
  csp: ContentSecurityPolicy;
  hsts: HSTSConfig;
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  contentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: PermissionsPolicyConfig;
}

export interface ContentSecurityPolicy {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
  'child-src': string[];
  'worker-src': string[];
  'frame-ancestors': string[];
  'form-action': string[];
  'base-uri': string[];
  'manifest-src': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
}

export interface HSTSConfig {
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
}

export interface PermissionsPolicyConfig {
  camera: string;
  microphone: string;
  geolocation: string;
  payment: string;
  usb: string;
  bluetooth: string;
  serial: string;
  autoplay: string;
  encryptedMedia: string;
  fullscreen: string;
  pictureInPicture: string;
  displayCapture: string;
  documentDomain: string;
}

export interface RateLimitConfig {
  api: RateLimitRule;
  auth: RateLimitRule;
  upload: RateLimitRule;
  download: RateLimitRule;
  report: RateLimitRule;
  search: RateLimitRule;
}

export interface RateLimitRule {
  requests: number;
  window: number; // milliseconds
  burst: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface EncryptionConfig {
  algorithms: {
    symmetric: 'AES-256-GCM';
    asymmetric: 'RSA-OAEP-256';
    hashing: 'SHA-256';
    signing: 'RS256';
  };
  keyRotation: {
    interval: number; // milliseconds
    retentionPeriod: number; // milliseconds
  };
  dataClassification: {
    public: EncryptionLevel;
    internal: EncryptionLevel;
    confidential: EncryptionLevel;
    restricted: EncryptionLevel;
  };
}

export interface EncryptionLevel {
  atRest: boolean;
  inTransit: boolean;
  inMemory: boolean;
  keyEscrow: boolean;
}

export interface ComplianceConfig {
  lgpd: LGPDConfig;
  anvisa: ANVISAConfig;
  cfm: CFMConfig;
  international: InternationalConfig;
}

export interface LGPDConfig {
  dataProcessingLegalBasis: string[];
  consentManagement: {
    required: boolean;
    granular: boolean;
    withdrawable: boolean;
  };
  dataRetention: {
    defaultPeriod: number; // days
    categories: Record<string, number>;
  };
  dataPortability: boolean;
  rightToBeDeleted: boolean;
  dataProtectionOfficer: {
    required: boolean;
    contact: string;
  };
}

export interface ANVISAConfig {
  registration: {
    required: boolean;
    number?: string;
    category: string;
  };
  dataIntegrity: {
    auditTrail: boolean;
    electronicSignatures: boolean;
    computerizedSystemValidation: boolean;
  };
  qualityManagement: {
    iso13485: boolean;
    iso14971: boolean;
    riskManagement: boolean;
  };
}

export interface CFMConfig {
  telemedineCompliance: {
    resolution: string; // e.g., "CFM 2.314/2022"
    patientConsent: boolean;
    dataTransmissionSecurity: boolean;
    professionalIdentification: boolean;
  };
  medicalRecords: {
    digitalSignature: boolean;
    backupRequirements: boolean;
    accessControl: boolean;
  };
}

export interface InternationalConfig {
  hipaa: {
    enabled: boolean;
    businessAssociate: boolean;
  };
  gdpr: {
    enabled: boolean;
    adequacyDecision: boolean;
  };
  fda: {
    enabled: boolean;
    deviceClass?: 'I' | 'II' | 'III';
  };
}

// Production Security Configuration
export const SECURITY_CONFIG: SecurityConfig = {
  cors: {
    allowedOrigins: {
      development: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://192.168.1.0/24', // Local network
      ],
      staging: [
        'https://neonpro-staging.vercel.app',
        'https://staging.neonpro.com.br',
        'https://preview.neonpro.com.br',
      ],
      production: [
        'https://neonpro.com.br',
        'https://www.neonpro.com.br',
        'https://app.neonpro.com.br',
        'https://portal.neonpro.com.br',
      ],
    },
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Clinic-ID',
      'X-Request-ID',
      'X-API-Version',
      'baggage',
      'sentry-trace',
      'X-Healthcare-Context',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Healthcare-Compliance',
    ],
    credentials: true,
    maxAge: 86_400, // 24 hours
  },

  headers: {
    csp: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for development
        'https://va.vercel-scripts.com',
        'https://vitals.vercel-app.com',
        'https://js.sentry-cdn.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        '*.amazonaws.com', // S3
        '*.supabase.co', // Supabase Storage
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://vitals.vercel-app.com',
        'https://o4507897778585600.ingest.sentry.io',
        'wss://*.supabase.co', // Realtime
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
      ],
      'object-src': ["'none'"],
      'media-src': ["'self'", 'blob:', '*.amazonaws.com'],
      'frame-src': ["'none'"],
      'child-src': ["'none'"],
      'worker-src': ["'self'", 'blob:'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'manifest-src': ["'self'"],
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
    },
    hsts: {
      maxAge: 63_072_000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: 'self',
      microphone: 'self',
      geolocation: 'self',
      payment: 'self',
      usb: '()',
      bluetooth: '()',
      serial: '()',
      autoplay: '()',
      encryptedMedia: '()',
      fullscreen: 'self',
      pictureInPicture: 'self',
      displayCapture: '()',
      documentDomain: '()',
    },
  },

  rateLimiting: {
    api: {
      requests: 100,
      window: 60_000, // 1 minute
      burst: 20,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    auth: {
      requests: 10,
      window: 60_000,
      burst: 2,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
    },
    upload: {
      requests: 20,
      window: 60_000,
      burst: 5,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
    download: {
      requests: 50,
      window: 60_000,
      burst: 10,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
    report: {
      requests: 200,
      window: 60_000,
      burst: 50,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    search: {
      requests: 30,
      window: 60_000,
      burst: 10,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
  },

  encryption: {
    algorithms: {
      symmetric: 'AES-256-GCM',
      asymmetric: 'RSA-OAEP-256',
      hashing: 'SHA-256',
      signing: 'RS256',
    },
    keyRotation: {
      interval: 2_592_000_000, // 30 days
      retentionPeriod: 7_776_000_000, // 90 days
    },
    dataClassification: {
      public: {
        atRest: false,
        inTransit: true,
        inMemory: false,
        keyEscrow: false,
      },
      internal: {
        atRest: true,
        inTransit: true,
        inMemory: false,
        keyEscrow: false,
      },
      confidential: {
        atRest: true,
        inTransit: true,
        inMemory: true,
        keyEscrow: true,
      },
      restricted: {
        atRest: true,
        inTransit: true,
        inMemory: true,
        keyEscrow: true,
      },
    },
  },

  compliance: {
    lgpd: {
      dataProcessingLegalBasis: [
        'consent',
        'legitimate_interest',
        'legal_obligation',
        'vital_interests',
        'public_task',
        'healthcare_provision',
      ],
      consentManagement: {
        required: true,
        granular: true,
        withdrawable: true,
      },
      dataRetention: {
        defaultPeriod: 1095, // 3 years
        categories: {
          patient_records: 1825, // 5 years
          financial_records: 1825, // 5 years
          audit_logs: 2555, // 7 years
          marketing_data: 365, // 1 year
          technical_logs: 90, // 3 months
        },
      },
      dataPortability: true,
      rightToBeDeleted: true,
      dataProtectionOfficer: {
        required: true,
        contact: 'dpo@neonpro.com.br',
      },
    },
    anvisa: {
      registration: {
        required: true,
        number: 'pending', // To be filled when registered
        category: 'software_medical_device',
      },
      dataIntegrity: {
        auditTrail: true,
        electronicSignatures: true,
        computerizedSystemValidation: true,
      },
      qualityManagement: {
        iso13485: true,
        iso14971: true,
        riskManagement: true,
      },
    },
    cfm: {
      telemedineCompliance: {
        resolution: 'CFM 2.314/2022',
        patientConsent: true,
        dataTransmissionSecurity: true,
        professionalIdentification: true,
      },
      medicalRecords: {
        digitalSignature: true,
        backupRequirements: true,
        accessControl: true,
      },
    },
    international: {
      hipaa: {
        enabled: false,
        businessAssociate: false,
      },
      gdpr: {
        enabled: false,
        adequacyDecision: false,
      },
      fda: {
        enabled: false,
      },
    },
  },
};

// Environment-specific security configurations
export function getSecurityConfig(environment?: string): SecurityConfig {
  const env = environment || process.env.NODE_ENV || 'development';
  const config = { ...SECURITY_CONFIG };

  if (env === 'development') {
    // Relax CSP for development
    config.headers.csp['script-src'].push("'unsafe-eval'");
    config.headers.csp['connect-src'].push(
      'ws://localhost:*',
      'http://localhost:*'
    );
    
    // Disable HSTS in development
    config.headers.hsts.maxAge = 0;
    
    // More permissive rate limits
    Object.keys(config.rateLimiting).forEach(key => {
      const rule = config.rateLimiting[key as keyof RateLimitConfig];
      rule.requests *= 10;
      rule.burst *= 2;
    });
  }

  return config;
}

// Utility functions for security validation
export function validateSecurityConfig(config: SecurityConfig): boolean {
  // Validate CSP
  if (!config.headers.csp['default-src'].includes("'self'")) {
    return false;
  }

  // Validate HSTS in production
  if (process.env.NODE_ENV === 'production' && config.headers.hsts.maxAge < 31_536_000) {
    return false;
  }

  // Validate compliance requirements
  if (config.compliance.lgpd.dataProcessingLegalBasis.length === 0) {
    return false;
  }

  return true;
}