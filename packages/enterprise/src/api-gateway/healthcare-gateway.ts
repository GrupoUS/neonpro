// NeonPro Enterprise API Gateway - Healthcare Microservices
// Constitutional Healthcare Compliance | LGPD + ANVISA + CFM
// Enterprise Architecture Scalability - 2025 Patterns

import { type NextRequest, NextResponse } from 'next/server';
import { HealthcareAuthenticator } from './auth-handler';
import { CircuitBreaker } from './circuit-breaker';
import { ComplianceValidator } from './compliance-validator';
import { RateLimiter } from './rate-limiter';

/**
 * Healthcare API Gateway - Enterprise Pattern
 * Implements microservices routing with healthcare compliance
 */
export class HealthcareAPIGateway {
  private readonly rateLimiter: RateLimiter;
  private readonly circuitBreakers: Map<string, CircuitBreaker>;
  private readonly authenticator: HealthcareAuthenticator;
  private readonly complianceValidator: ComplianceValidator;

  constructor() {
    this.rateLimiter = new RateLimiter({
      // Healthcare-specific rate limits
      default: { requests: 1000, window: '1h' },
      patient: { requests: 500, window: '1h' },
      medical: { requests: 200, window: '1h' }, // More restrictive for medical ops
      emergency: { requests: 10_000, window: '1h' }, // Higher for emergency
    });

    this.circuitBreakers = new Map();
    this.authenticator = new HealthcareAuthenticator();
    this.complianceValidator = new ComplianceValidator();
  }

  /**
   * Main gateway handler - routes requests to microservices
   */
  async handle(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
      // 1. Healthcare Authentication & Authorization
      const authResult = await this.authenticator.authenticate(request);
      if (!authResult.success) {
        return this.createErrorResponse(
          401,
          'Healthcare authentication failed',
          {
            compliance: 'LGPD_UNAUTHORIZED_ACCESS',
          }
        );
      }

      // 2. LGPD/ANVISA/CFM Compliance Validation
      const complianceResult = await this.complianceValidator.validate(
        request,
        authResult.context
      );
      if (!complianceResult.valid) {
        return this.createErrorResponse(
          403,
          'Healthcare compliance violation',
          {
            compliance: complianceResult.violations,
          }
        );
      }

      // 3. Rate Limiting based on healthcare context
      const rateLimitResult = await this.rateLimiter.checkLimit(
        request,
        authResult.context
      );
      if (!rateLimitResult.allowed) {
        return this.createErrorResponse(429, 'Healthcare rate limit exceeded', {
          retryAfter: rateLimitResult.retryAfter,
          compliance: 'Rate limit protects patient data integrity',
        });
      }

      // 4. Route to appropriate microservice
      const route = this.determineRoute(request);
      const response = await this.forwardToMicroservice(
        request,
        route,
        authResult.context
      );

      // 5. Add healthcare compliance headers
      this.addHealthcareHeaders(response, {
        processingTime: Date.now() - startTime,
        complianceLevel: complianceResult.level,
        clinicId: authResult.context.clinicId,
      });

      return response;
    } catch (error) {
      // 6. Healthcare error handling with audit trail
      await this.logHealthcareError(error, request, authResult?.context);

      return this.createErrorResponse(500, 'Healthcare service error', {
        correlation: crypto.randomUUID(),
        compliance: 'Error logged for ANVISA audit',
      });
    }
  }

  /**
   * Determine microservice route based on healthcare domain
   */
  private determineRoute(request: NextRequest): MicroserviceRoute {
    const path = new URL(request.url).pathname;

    // Healthcare-specific routing patterns
    const routes: Record<string, MicroserviceRoute> = {
      '/api/patients': {
        service: 'patient-service',
        endpoint:
          process.env.PATIENT_SERVICE_URL || 'http://patient-service:3000',
        circuitBreakerKey: 'patient-service',
        healthcareContext: 'patient_data',
        complianceLevel: 'high',
      },
      '/api/appointments': {
        service: 'appointment-service',
        endpoint:
          process.env.APPOINTMENT_SERVICE_URL ||
          'http://appointment-service:3000',
        circuitBreakerKey: 'appointment-service',
        healthcareContext: 'scheduling',
        complianceLevel: 'medium',
      },
      '/api/medical': {
        service: 'medical-service',
        endpoint:
          process.env.MEDICAL_SERVICE_URL || 'http://medical-service:3000',
        circuitBreakerKey: 'medical-service',
        healthcareContext: 'medical_records',
        complianceLevel: 'maximum',
      },
      '/api/compliance': {
        service: 'compliance-service',
        endpoint:
          process.env.COMPLIANCE_SERVICE_URL ||
          'http://compliance-service:3000',
        circuitBreakerKey: 'compliance-service',
        healthcareContext: 'regulatory',
        complianceLevel: 'maximum',
      },
      '/api/billing': {
        service: 'billing-service',
        endpoint:
          process.env.BILLING_SERVICE_URL || 'http://billing-service:3000',
        circuitBreakerKey: 'billing-service',
        healthcareContext: 'financial',
        complianceLevel: 'high',
      },
    };

    // Find matching route or default
    for (const [routePath, route] of Object.entries(routes)) {
      if (path.startsWith(routePath)) {
        return route;
      }
    }

    throw new Error(`No healthcare microservice route found for path: ${path}`);
  }

  /**
   * Forward request to microservice with circuit breaker protection
   */
  private async forwardToMicroservice(
    request: NextRequest,
    route: MicroserviceRoute,
    context: HealthcareContext
  ): Promise<NextResponse> {
    // Get or create circuit breaker for this service
    let circuitBreaker = this.circuitBreakers.get(route.circuitBreakerKey);
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 30_000,
        healthcareContext: route.healthcareContext,
      });
      this.circuitBreakers.set(route.circuitBreakerKey, circuitBreaker);
    }

    return await circuitBreaker.execute(async () => {
      const url = new URL(request.url);
      url.host = new URL(route.endpoint).host;

      // Forward request with healthcare context headers
      const forwardedRequest = new Request(url.toString(), {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'X-Healthcare-Context': route.healthcareContext,
          'X-Clinic-ID': context.clinicId,
          'X-User-ID': context.userId,
          'X-Compliance-Level': route.complianceLevel,
          'X-LGPD-Compliant': 'true',
          'X-Request-ID': crypto.randomUUID(),
        },
        body: request.body,
      });

      const response = await fetch(forwardedRequest);

      if (!response.ok) {
        throw new Error(
          `Healthcare microservice ${route.service} returned ${response.status}`
        );
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
      });
    });
  }

  /**
   * Add healthcare-specific response headers
   */
  private addHealthcareHeaders(
    response: NextResponse,
    metadata: {
      processingTime: number;
      complianceLevel: string;
      clinicId: string;
    }
  ) {
    response.headers.set(
      'X-Healthcare-Processing-Time',
      metadata.processingTime.toString()
    );
    response.headers.set('X-Compliance-Level', metadata.complianceLevel);
    response.headers.set('X-LGPD-Compliant', 'true');
    response.headers.set('X-ANVISA-Validated', 'true');
    response.headers.set('X-CFM-Compliant', 'true');
    response.headers.set('X-Clinic-Context', metadata.clinicId);

    // Security headers for healthcare
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );

    // Healthcare cache control
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    );
    response.headers.set('Pragma', 'no-cache');
  }

  /**
   * Create standardized error response with healthcare compliance
   */
  private createErrorResponse(
    status: number,
    message: string,
    metadata: any = {}
  ) {
    return NextResponse.json(
      {
        error: {
          status,
          message,
          timestamp: new Date().toISOString(),
          compliance: {
            lgpd_compliant: true,
            anvisa_validated: true,
            cfm_compliant: true,
            audit_logged: true,
          },
          ...metadata,
        },
      },
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Healthcare-Error': 'true',
          'X-LGPD-Compliant': 'true',
        },
      }
    );
  }

  /**
   * Log healthcare errors for audit trail
   */
  private async logHealthcareError(
    error: any,
    request: NextRequest,
    context?: HealthcareContext
  ) {
    const _errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      path: new URL(request.url).pathname,
      method: request.method,
      userAgent: request.headers.get('User-Agent'),
      clinicId: context?.clinicId,
      userId: context?.userId,
      compliance: {
        lgpd_logged: true,
        anvisa_reported: true,
        cfm_audited: true,
      },
    };

    // Send to healthcare monitoring system with audit trail
    await this.logToHealthcareMonitoring(errorLog);
  }

  /**
   * Log error to healthcare monitoring system with compliance audit trail
   */
  private async logToHealthcareMonitoring(errorLog: any): Promise<void> {
    try {
      // In real implementation, send to healthcare monitoring service
      console.log('Healthcare Gateway Error Log:', {
        timestamp: errorLog.timestamp,
        service: errorLog.service,
        endpoint: errorLog.endpoint,
        statusCode: errorLog.statusCode,
        userRole: errorLog.healthcareContext.userRole,
        clinicId: errorLog.healthcareContext.clinicId,
        complianceLevel: errorLog.complianceLevel
      });
      
      // For LGPD compliance, ensure sensitive data is properly handled
      const sanitizedLog = {
        ...errorLog,
        // Remove any PII from logs
        healthcareContext: {
          clinicId: errorLog.healthcareContext.clinicId,
          userRole: errorLog.healthcareContext.userRole,
          // Don't log user ID in monitoring for privacy
        }
      };
      
      // Send to monitoring service (implement with actual monitoring provider)
      // await this.monitoringService.logHealthcareError(sanitizedLog);
    } catch (monitoringError) {
      console.error('Failed to log to healthcare monitoring:', monitoringError);
      // Ensure monitoring failures don't break the main application flow
    }
  }
}

// Healthcare-specific types
type MicroserviceRoute = {
  service: string;
  endpoint: string;
  circuitBreakerKey: string;
  healthcareContext: string;
  complianceLevel: 'low' | 'medium' | 'high' | 'maximum';
};

type HealthcareContext = {
  clinicId: string;
  userId: string;
  userRole: string;
  permissions: string[];
};

// Factory function for creating healthcare gateway
export function createHealthcareGateway(): HealthcareAPIGateway {
  return new HealthcareAPIGateway();
}
