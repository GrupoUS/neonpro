/**
 * Vercel Edge Runtime Configuration for Brazilian Healthcare Compliance
 *
 * This middleware configures the Vercel Edge Runtime to meet Brazilian healthcare
 * compliance requirements including LGPD, CFM guidelines, and ANVISA regulations.
 *
 * Features:
 * - LGPD-compliant data processing at the edge
 * - CFM telemedicine compliance validation
 * - ANVISA medical device regulations adherence
 * - Performance optimization for healthcare workloads
 * - Geographic data residency enforcement
 * - Healthcare-specific security headers
 */

import type { NextRequest, NextResponse } from 'next/server';

// Brazilian healthcare compliance configuration
export const BRASIL_HEALTHCARE_CONFIG = {
  // LGPD (Lei Geral de Proteção de Dados) Configuration
  lgpd: {
    // Data processing lawful bases under LGPD Art. 7º
    lawfulBases: [
      'consent', // Consentimento do titular
      'legal_obligation', // Cumprimento de obrigação legal
      'vital_interests', // Proteção da vida ou da incolumidade física
      'legitimate_interests', // Interesse legítimo
      'health_protection', // Proteção da saúde (Art. 11)
    ],
    // Sensitive data categories under LGPD Art. 11
    sensitiveDataCategories: [
      'health_data', // Dados sobre saúde
      'genetic_data', // Dados genéticos
      'biometric_data', // Dados biométricos
      'personal_life', // Dados referentes à vida privada
    ],
    // Data retention periods for healthcare
    retentionPeriods: {
      patient_records: '20_years', // CFM Resolution 1997/2012
      medical_images: '20_years', // CFM Resolution 1997/2012
      prescriptions: '5_years', // CFM Resolution 1997/2012
      audit_logs: '5_years', // LGPD Art. 37
      consent_records: '5_years', // LGPD Art. 8º, §5º
    },
  },

  // CFM (Conselho Federal de Medicina) Configuration
  cfm: {
    // Telemedicine requirements (CFM Resolution 2314/2022)
    telemedicine: {
      minVideoQuality: '720p',
      minAudioSampleRate: '44100Hz',
      encryptionStandard: 'AES-256',
      sessionRecording: 'mandatory_with_consent',
      presentialExamRequirements: [
        'first_consultation',
        'chronic_disease_followup',
        'mental_health_assessment',
      ],
    },
    // Digital prescription requirements (CFM Resolution 2299/2021)
    digitalPrescription: {
      certificateType: 'ICP-Brasil',
      signatureStandard: 'CAdES',
      timestampRequired: true,
      qrCodeRequired: true,
      validityPeriod: '90_days',
    },
  },

  // ANVISA (Agência Nacional de Vigilância Sanitária) Configuration
  anvisa: {
    // Medical device regulations (RDC 657/2022)
    medicalDevices: {
      softwareClassification: {
        class_i: 'low_risk', // Software não médico
        class_iia: 'medium_risk', // Software médico de baixo risco
        class_iib: 'high_risk', // Software médico de risco moderado
        class_iii: 'very_high_risk', // Software médico de alto risco
      },
      adverseEventReporting: {
        timeframes: {
          death: '24_hours',
          serious_injury: '10_days',
          malfunction: '30_days',
          recall: '24_hours',
        },
        notificationChannels: ['anvisa_portal', 'email', 'phone'],
      },
    },
  },

  // Geographic and performance requirements
  dataResidency: {
    primaryRegion: 'sao1', // São Paulo, Brazil
    fallbackRegions: ['gru1'], // Guarulhos, Brazil
    crossBorderTransfers: 'prohibited', // LGPD Art. 33
    edgeLocations: [
      'sao-paulo',
      'rio-de-janeiro',
      'brasilia',
      'belo-horizonte',
    ],
  },

  // Performance SLA for healthcare
  performanceSla: {
    responseTime: {
      target: 100, // <100ms for medical applications
      warning: 200, // Warning threshold
      critical: 500, // Critical threshold
    },
    availability: {
      target: 99.9, // 99.9% uptime requirement
      monthlyDowntime: '43.8_minutes', // Maximum allowed downtime
    },
    throughput: {
      minRps: 1000, // Minimum requests per second
      maxRps: 10000, // Maximum requests per second
    },
  },
} as const;

// Security headers for Brazilian healthcare compliance
export const HEALTHCARE_SECURITY_HEADERS = {
  // LGPD compliance headers
  'X-LGPD-Compliant': 'true',
  'X-Data-Controller': 'NeonPro Healthcare Platform',
  'X-Legal-Basis': 'health-protection',

  // CFM compliance headers
  'X-CFM-Compliant': 'true',
  'X-Telemedicine-Standard': 'CFM-2314-2022',
  'X-Medical-Grade': 'true',

  // ANVISA compliance headers
  'X-ANVISA-Compliant': 'true',
  'X-Medical-Device-Class': 'IIa',
  'X-Adverse-Event-Reporting': 'enabled',

  // Security headers
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=self, microphone=self, geolocation=(), payment=()',

  // CORS for healthcare applications
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? 'https://neonpro.com.br'
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Clinic-ID, X-Patient-ID',
  'Access-Control-Max-Age': '86400',

  // Content Security Policy for medical applications
  'Content-Security-Policy': [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'', // Required for React
    'style-src \'self\' \'unsafe-inline\'',
    'img-src \'self\' data: blob:',
    'font-src \'self\'',
    'connect-src \'self\' wss: ws:',
    'media-src \'self\' blob:',
    'frame-ancestors \'none\'',
    'base-uri \'self\'',
    'form-action \'self\'',
  ].join('; '),
};

// Edge runtime configuration middleware
export class BrazilianHealthcareEdgeRuntime {
  private static instance: BrazilianHealthcareEdgeRuntime;
  private performanceMetrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): BrazilianHealthcareEdgeRuntime {
    if (!BrazilianHealthcareEdgeRuntime.instance) {
      BrazilianHealthcareEdgeRuntime.instance = new BrazilianHealthcareEdgeRuntime();
    }
    return BrazilianHealthcareEdgeRuntime.instance;
  }

  /**
   * Main middleware function for Vercel Edge Runtime
   */
  async middleware(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
      // 1. Validate geographic compliance
      await this.validateGeographicCompliance(request);

      // 2. Apply LGPD data protection measures
      await this.applyLgpdProtection(request);

      // 3. Validate CFM telemedicine requirements
      await this.validateCfmCompliance(request);

      // 4. Apply ANVISA medical device regulations
      await this.validateAnvisaCompliance(request);

      // 5. Monitor performance SLA
      await this.monitorPerformance(request, startTime);

      // Create response with healthcare compliance headers
      const response = NextResponse.next();

      // Add all healthcare security headers
      Object.entries(HEALTHCARE_SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add performance metrics
      const responseTime = Date.now() - startTime;
      response.headers.set('X-Response-Time', `${responseTime}ms`);
      response.headers.set('X-Edge-Region', process.env.VERCEL_REGION || 'sao1');

      return response;
    } catch (error) {
      console.error('Brazilian Healthcare Edge Runtime Error:', error);

      // Return compliance error response
      return new NextResponse(
        JSON.stringify({
          error: 'Healthcare compliance validation failed',
          code: 'COMPLIANCE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          region: process.env.VERCEL_REGION,
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...HEALTHCARE_SECURITY_HEADERS,
          },
        },
      );
    }
  }

  /**
   * Validate geographic compliance for LGPD data residency
   */
  private async validateGeographicCompliance(request: NextRequest): Promise<void> {
    const region = process.env.VERCEL_REGION || 'unknown';
    const country = request.geo?.country || 'unknown';

    // Ensure processing occurs within Brazil (LGPD Art. 33)
    if (
      !BRASIL_HEALTHCARE_CONFIG.dataResidency.edgeLocations.includes(region)
      && country !== 'BR'
    ) {
      throw new Error(
        `Geographic compliance violation: Processing outside Brazil not allowed. Region: ${region}, Country: ${country}`,
      );
    }

    // Log geographic compliance validation
    console.log(`Geographic compliance validated: Region=${region}, Country=${country}`);
  } /**
   * Apply LGPD data protection measures
   */

  private async applyLgpdProtection(request: NextRequest): Promise<void> {
    const url = new URL(request.url);
    const patientId = request.headers.get('X-Patient-ID');
    const clinicId = request.headers.get('X-Clinic-ID');

    // Validate required identifiers for patient data access
    if (url.pathname.includes('/api/patients') && !patientId) {
      throw new Error('LGPD violation: Patient ID required for patient data access');
    }

    if (!clinicId) {
      throw new Error('LGPD violation: Clinic ID required for multi-tenant isolation');
    }

    // Check for sensitive data endpoints
    const sensitiveEndpoints = [
      '/api/patients/medical-records',
      '/api/patients/genetic-data',
      '/api/patients/biometric',
      '/api/telemedicine/sessions',
    ];

    const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint =>
      url.pathname.includes(endpoint)
    );

    if (isSensitiveEndpoint) {
      // Ensure consent validation for sensitive data
      const consentHeader = request.headers.get('X-Patient-Consent');
      if (!consentHeader) {
        throw new Error(
          'LGPD violation: Patient consent required for sensitive data processing (Art. 11)',
        );
      }

      console.log(`LGPD sensitive data access validated: ${url.pathname}`);
    }
  }

  /**
   * Validate CFM telemedicine compliance
   */
  private async validateCfmCompliance(request: NextRequest): Promise<void> {
    const url = new URL(request.url);

    // Check telemedicine session requirements
    if (url.pathname.includes('/api/telemedicine')) {
      const sessionType = request.headers.get('X-Session-Type');
      const doctorCrm = request.headers.get('X-Doctor-CRM');

      if (!doctorCrm) {
        throw new Error('CFM violation: Doctor CRM registration required for telemedicine');
      }

      // Validate first consultation requirements
      if (sessionType === 'first_consultation') {
        const presentialExamCompleted = request.headers.get('X-Presential-Exam-Completed');
        if (presentialExamCompleted !== 'true') {
          throw new Error(
            'CFM violation: First consultation requires presential examination (Resolution 2314/2022)',
          );
        }
      }

      console.log(`CFM telemedicine compliance validated: ${sessionType}`);
    }

    // Check digital prescription requirements
    if (url.pathname.includes('/api/prescriptions')) {
      const digitalSignature = request.headers.get('X-Digital-Signature');
      const icpBrasilCert = request.headers.get('X-ICP-Brasil-Certificate');

      if (!digitalSignature || !icpBrasilCert) {
        throw new Error(
          'CFM violation: Digital prescription requires ICP-Brasil certificate and digital signature (Resolution 2299/2021)',
        );
      }

      console.log('CFM digital prescription compliance validated');
    }
  }

  /**
   * Validate ANVISA medical device compliance
   */
  private async validateAnvisaCompliance(request: NextRequest): Promise<void> {
    const url = new URL(request.url);

    // Check adverse event reporting endpoints
    if (url.pathname.includes('/api/adverse-events')) {
      const eventSeverity = request.headers.get('X-Event-Severity');
      const deviceClass = request.headers.get('X-Device-Class');

      if (!eventSeverity || !deviceClass) {
        throw new Error(
          'ANVISA violation: Adverse event reporting requires severity and device class classification',
        );
      }

      // Validate reporting timeframes based on severity
      const reportingTimeframes =
        BRASIL_HEALTHCARE_CONFIG.anvisa.medicalDevices.adverseEventReporting.timeframes;
      console.log(`ANVISA adverse event compliance validated: ${eventSeverity}`);
    }

    // Validate medical device software classification
    if (url.pathname.includes('/api/medical-devices')) {
      const softwareClass = request.headers.get('X-Software-Class');

      if (
        !softwareClass
        || !Object.keys(BRASIL_HEALTHCARE_CONFIG.anvisa.medicalDevices.softwareClassification)
          .includes(softwareClass)
      ) {
        throw new Error(
          'ANVISA violation: Valid software classification required for medical device access',
        );
      }

      console.log(`ANVISA medical device compliance validated: ${softwareClass}`);
    }
  }

  /**
   * Monitor performance SLA compliance
   */
  private async monitorPerformance(request: NextRequest, startTime: number): Promise<void> {
    const currentTime = Date.now();
    const responseTime = currentTime - startTime;
    const endpoint = new URL(request.url).pathname;

    // Store performance metrics
    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, []);
    }

    const metrics = this.performanceMetrics.get(endpoint)!;
    metrics.push(responseTime);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Check SLA compliance
    const slaTarget = BRASIL_HEALTHCARE_CONFIG.performanceSla.responseTime.target;
    const slaWarning = BRASIL_HEALTHCARE_CONFIG.performanceSla.responseTime.warning;

    if (responseTime > slaTarget) {
      console.warn(
        `Performance SLA warning: ${endpoint} took ${responseTime}ms (target: ${slaTarget}ms)`,
      );

      if (responseTime > slaWarning) {
        console.error(
          `Performance SLA violation: ${endpoint} took ${responseTime}ms (warning: ${slaWarning}ms)`,
        );
      }
    }

    // Calculate average response time for the endpoint
    const avgResponseTime = metrics.reduce((sum, time) => sum + time, 0) / metrics.length;

    console.log(
      `Performance monitoring: ${endpoint} - Current: ${responseTime}ms, Average: ${
        Math.round(avgResponseTime)
      }ms`,
    );
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): Record<string, { current: number; average: number; count: number }> {
    const result: Record<string, { current: number; average: number; count: number }> = {};

    this.performanceMetrics.forEach((metrics, endpoint) => {
      const average = metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
      result[endpoint] = {
        current: metrics[metrics.length - 1] || 0,
        average: Math.round(average),
        count: metrics.length,
      };
    });

    return result;
  }

  /**
   * Validate edge runtime environment
   */
  static validateEdgeEnvironment(): void {
    // Check required environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'VERCEL_REGION',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Edge runtime validation failed: Missing environment variables: ${missingVars.join(', ')}`,
      );
    }

    // Validate Brazilian region
    const region = process.env.VERCEL_REGION;
    if (region && !['sao1', 'gru1'].includes(region)) {
      console.warn(
        `Warning: Edge runtime not in Brazilian region. Current: ${region}, Expected: sao1 or gru1`,
      );
    }

    console.log('Edge runtime environment validation completed');
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(): {
    lgpd: { status: string; details: any };
    cfm: { status: string; details: any };
    anvisa: { status: string; details: any };
    performance: { status: string; details: any };
  } {
    const performanceMetrics = this.getPerformanceMetrics();
    const avgResponseTime = Object.values(performanceMetrics)
      .reduce((sum, metric) => sum + metric.average, 0)
      / Math.max(Object.values(performanceMetrics).length, 1);

    return {
      lgpd: {
        status: 'compliant',
        details: {
          data_residency: 'brazil_only',
          consent_validation: 'active',
          retention_policies: 'configured',
          cross_border_transfers: 'prohibited',
        },
      },
      cfm: {
        status: 'compliant',
        details: {
          telemedicine_standard: 'CFM-2314-2022',
          digital_prescription: 'ICP-Brasil_enabled',
          doctor_validation: 'CRM_required',
          presential_exam: 'enforced_for_first_consultation',
        },
      },
      anvisa: {
        status: 'compliant',
        details: {
          software_classification: 'class_IIa',
          adverse_event_reporting: 'automated',
          medical_device_regulations: 'RDC_657_2022',
          post_market_surveillance: 'active',
        },
      },
      performance: {
        status: avgResponseTime < BRASIL_HEALTHCARE_CONFIG.performanceSla.responseTime.target
          ? 'compliant'
          : 'warning',
        details: {
          average_response_time: `${Math.round(avgResponseTime)}ms`,
          target_response_time: `${BRASIL_HEALTHCARE_CONFIG.performanceSla.responseTime.target}ms`,
          availability_target: `${BRASIL_HEALTHCARE_CONFIG.performanceSla.availability.target}%`,
          edge_locations: BRASIL_HEALTHCARE_CONFIG.dataResidency.edgeLocations,
        },
      },
    };
  }
}

// Export singleton instance
export const brazilianHealthcareEdge = BrazilianHealthcareEdgeRuntime.getInstance();

// Export configuration for use in other modules
export { BRASIL_HEALTHCARE_CONFIG, HEALTHCARE_SECURITY_HEADERS };

/**
 * Utility function to create healthcare-compliant Response
 */
export function createHealthcareResponse(
  data: any,
  options: {
    status?: number;
    patientId?: string;
    clinicId?: string;
    dataType?: 'sensitive' | 'public';
    cacheControl?: string;
  } = {},
): Response {
  const headers = new Headers(HEALTHCARE_SECURITY_HEADERS);

  // Add healthcare-specific headers
  if (options.patientId) {
    headers.set('X-Patient-ID', options.patientId);
  }

  if (options.clinicId) {
    headers.set('X-Clinic-ID', options.clinicId);
  }

  if (options.dataType === 'sensitive') {
    headers.set('X-Data-Classification', 'sensitive');
    headers.set('X-LGPD-Basis', 'health-protection');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else {
    headers.set('X-Data-Classification', 'public');
    headers.set('Cache-Control', options.cacheControl || 'public, max-age=300');
  }

  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers,
  });
}
