/**
 * Specialized Aesthetic Clinic Security Middleware
 * T085 - Enhanced Security and Compliance for Aesthetic Clinic Operations
 *
 * Features:
 * - Healthcare-specific request validation
 * - Enhanced security headers for aesthetic clinic data
 * - LGPD compliance enforcement
 * - Medical data access control
 * - Real-time threat detection
 * - Compliance with Brazilian healthcare regulations
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger';
import { AestheticClinicSecurityService } from '../security/aesthetic-clinic-security-service';
import { AestheticMFAService } from '../security/aesthetic-mfa-service';
import { MedicalImageProtectionService } from '../security/medical-image-protection-service';

// Middleware Configuration
const AESTHETIC_CLINIC_CONFIG = {
  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Aesthetic-Clinic-Version': '1.0.0',
    'X-LGPD-Compliant': 'true',
    'X-Healthcare-Security': 'enabled',
  },

  // Rate limiting
  rateLimiting: {
    standardWindow: 60 * 1000, // 1 minute
    standardLimit: 100,
    authWindow: 15 * 60 * 1000, // 15 minutes
    authLimit: 5,
    imageUploadWindow: 60 * 1000, // 1 minute
    imageUploadLimit: 10,
    sensitiveDataWindow: 60 * 60 * 1000, // 1 hour
    sensitiveDataLimit: 25,
  },

  // File upload restrictions
  fileUploads: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImagesPerRequest: 10,
    requireMFA: true,
    scanForMalware: true,
  },

  // Data sensitivity levels
  sensitivityLevels: {
    low: ['patient_name', 'appointment_time'],
    medium: ['patient_contact', 'treatment_type', 'medical_history'],
    high: ['patient_id', 'medical_images', 'financial_data', 'treatment_records'],
    critical: ['biometric_data', 'genetic_info', 'payment_info'],
  },

  // Compliance requirements
  compliance: {
    lgpd: {
      dataRetentionDays: 365,
      requireConsent: true,
      requireAnonymization: true,
      allowDataPortability: true,
    },
    anvisa: {
      requireAuditTrail: true,
      dataClassification: true,
      traceability: true,
    },
  },
} as const;

// Request Sensitivity Level
export const REQUEST_SENSITIVITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type RequestSensitivity = (typeof REQUEST_SENSITIVITY)[keyof typeof REQUEST_SENSITIVITY];

// Healthcare Data Type
export const HEALTHCARE_DATA_TYPE = {
  PATIENT_DEMOGRAPHICS: 'patient_demographics',
  MEDICAL_HISTORY: 'medical_history',
  TREATMENT_RECORDS: 'treatment_records',
  MEDICAL_IMAGES: 'medical_images',
  FINANCIAL_DATA: 'financial_data',
  APPOINTMENT_DATA: 'appointment_data',
  CONSENT_FORMS: 'consent_forms',
  BIOMETRIC_DATA: 'biometric_data',
} as const;

export type HealthcareDataType = (typeof HEALTHCARE_DATA_TYPE)[keyof typeof HEALTHCARE_DATA_TYPE];

// Security Event
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  requestPath: string;
  requestMethod: string;
  sensitivityLevel: RequestSensitivity;
  dataType: HealthcareDataType[];
  ipAddress: string;
  userAgent: string;
  riskScore: number;
  action: 'access' | 'modify' | 'upload' | 'download' | 'delete';
  complianceChecked: boolean;
  lgpdCompliant: boolean;
  anvisaCompliant: boolean;
  details: Record<string, any>;
}

// Compliance Check Result
export interface ComplianceCheckResult {
  lgpd: {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  };
  anvisa: {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  };
  overall: boolean;
}

/**
 * Aesthetic Clinic Security Middleware
 */
export class AestheticClinicMiddleware {
  private securityService: AestheticClinicSecurityService;
  private mfaService: AestheticMFAService;
  private imageProtectionService: MedicalImageProtectionService;
  private securityEvents: SecurityEvent[] = [];
  private requestCounts = new Map<string, number[]>();

  constructor() {
    this.securityService = new AestheticClinicSecurityService();
    this.mfaService = new AestheticMFAService();
    this.imageProtectionService = new MedicalImageProtectionService();
  }

  /**
   * Main middleware function
   */
  async middleware(c: Context, next: Next): Promise<void> {
    const startTime = Date.now();
    const requestPath = c.req.path;
    const requestMethod = c.req.method;

    try {
      // Apply security headers
      this.applySecurityHeaders(c);

      // Determine request sensitivity and data types
      const sensitivity = this.determineRequestSensitivity(requestPath, requestMethod);
      const dataTypes = this.determineDataTypes(requestPath);

      // Get request context
      const user = c.get('user');
      const userId = user?.id || 'anonymous';
      const sessionId = c.get('sessionId') || 'unknown';
      const ipAddress = this.getClientIP(c);
      const userAgent = c.req.header('user-agent') || 'unknown';

      // Rate limiting
      await this.checkRateLimit(c, requestPath, ipAddress, sensitivity);

      // MFA verification for sensitive operations
      if (this.requiresMFA(sensitivity)) {
        await this.verifyMFA(c, userId, ipAddress);
      }

      // LGPD compliance check
      const complianceResult = await this.checkCompliance(c, sensitivity, dataTypes);

      // Data access validation
      await this.validateDataAccess(c, userId, dataTypes, sensitivity);

      // Request validation and sanitization
      await this.validateAndSanitizeRequest(c);

      // Log security event
      await this.logSecurityEvent({
        userId,
        sessionId,
        requestPath,
        requestMethod,
        sensitivityLevel: sensitivity,
        dataType: dataTypes,
        ipAddress,
        userAgent,
        riskScore: this.calculateRiskScore(c, sensitivity),
        action: this.determineAction(requestMethod),
        complianceChecked: true,
        lgpdCompliant: complianceResult.lgpd.compliant,
        anvisaCompliant: complianceResult.anvisa.compliant,
        details: {
          processingTime: Date.now() - startTime,
          compliance: complianceResult,
        },
      });

      // Set context for downstream handlers
      this.setSecurityContext(c, {
        sensitivity,
        dataTypes,
        complianceResult,
        userId,
        sessionId,
        ipAddress,
      });

      await next();
    } catch (error) {
      await this.handleSecurityError(c, error, requestPath, requestMethod);
    }
  }

  /**
   * Healthcare-specific middleware
   */
  async healthcareDataMiddleware(c: Context, next: Next): Promise<void> {
    try {
      // Enhanced security for healthcare data
      await this.middleware(c, next);

      // Additional healthcare-specific checks
      await this.validateHealthcareData(c);
      await this.enforceDataRetention(c);
      await this.checkDataAnonymization(c);
    } catch (error) {
      await this.handleHealthcareError(c, error);
    }
  }

  /**
   * Medical image upload middleware
   */
  async medicalImageUploadMiddleware(c: Context, next: Next): Promise<void> {
    try {
      const user = c.get('user');
      const userId = user?.id;
      const ipAddress = this.getClientIP(c);

      // Check MFA verification
      if (!this.mfaService.isMFAVerified(userId)) {
        throw new HTTPException(401, {
          message: 'MFA verification required for medical image uploads',
        });
      }

      // Validate file upload
      await this.validateFileUpload(c);

      // Scan for malware
      await this.scanUploadForMalware(c);

      // Set image processing context
      c.set('imageUploadContext', {
        userId,
        ipAddress,
        timestamp: new Date(),
        securityLevel: 'high',
      });

      await next();
    } catch (error) {
      await this.handleImageUploadError(c, error);
    }
  }

  /**
   * Financial transaction middleware
   */
  async financialTransactionMiddleware(c: Context, next: Next): Promise<void> {
    try {
      const user = c.get('user');
      const userId = user?.id;
      const ipAddress = this.getClientIP(c);

      // Enhanced security for financial transactions
      if (!this.mfaService.isMFAVerified(userId)) {
        throw new HTTPException(401, {
          message: 'MFA verification required for financial transactions',
        });
      }

      // Validate transaction data
      await this.validateFinancialTransaction(c);

      // Check for suspicious activity
      await this.checkSuspiciousActivity(c, userId, ipAddress);

      // Set transaction context
      c.set('transactionContext', {
        userId,
        ipAddress,
        timestamp: new Date(),
        securityLevel: 'critical',
      });

      await next();
    } catch (error) {
      await this.handleFinancialError(c, error);
    }
  }

  /**
   * Patient data access middleware
   */
  async patientDataAccessMiddleware(c: Context, next: Next): Promise<void> {
    try {
      const user = c.get('user');
      const userId = user?.id;
      const patientId = c.req.param('patientId');
      const ipAddress = this.getClientIP(c);

      // Verify user has permission to access patient data
      const hasPermission = await this.securityService.hasPermission(
        userId,
        'patient_data_access',
        { patientId },
      );

      if (!hasPermission) {
        throw new HTTPException(403, {
          message: 'Insufficient permissions to access patient data',
        });
      }

      // Log data access for audit purposes
      await this.logPatientDataAccess(userId, patientId, ipAddress);

      // Set patient data context
      c.set('patientDataContext', {
        userId,
        patientId,
        ipAddress,
        timestamp: new Date(),
        accessLevel: 'authorized',
      });

      await next();
    } catch (error) {
      await this.handlePatientDataError(c, error);
    }
  }

  /**
   * Audit trail middleware
   */
  async auditTrailMiddleware(c: Context, next: Next): Promise<void> {
    const startTime = Date.now();
    const requestPath = c.req.path;
    const requestMethod = c.req.method;

    try {
      await next();

      // Log successful request
      await this.logAuditEvent({
        userId: c.get('user')?.id || 'anonymous',
        sessionId: c.get('sessionId') || 'unknown',
        requestPath,
        requestMethod,
        status: c.res.status,
        processingTime: Date.now() - startTime,
        success: true,
        ipAddress: this.getClientIP(c),
        userAgent: c.req.header('user-agent') || 'unknown',
        sensitivity: this.determineRequestSensitivity(requestPath, requestMethod),
      });
    } catch (error) {
      // Log failed request
      await this.logAuditEvent({
        userId: c.get('user')?.id || 'anonymous',
        sessionId: c.get('sessionId') || 'unknown',
        requestPath,
        requestMethod,
        status: 500,
        processingTime: Date.now() - startTime,
        success: false,
        ipAddress: this.getClientIP(c),
        userAgent: c.req.header('user-agent') || 'unknown',
        sensitivity: this.determineRequestSensitivity(requestPath, requestMethod),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  // Private helper methods

  private applySecurityHeaders(c: Context): void {
    Object.entries(AESTHETIC_CLINIC_CONFIG.securityHeaders).forEach(([key, value]) => {
      c.header(key, value);
    });
  }

  private determineRequestSensitivity(path: string, method: string): RequestSensitivity {
    if (path.includes('/medical-images') || path.includes('/financial')) {
      return REQUEST_SENSITIVITY.CRITICAL;
    }
    
    if (path.includes('/patients') || path.includes('/treatments')) {
      return REQUEST_SENSITIVITY.HIGH;
    }
    
    if (path.includes('/appointments') || path.includes('/professionals')) {
      return REQUEST_SENSITIVITY.MEDIUM;
    }

    return REQUEST_SENSITIVITY.LOW;
  }

  private determineDataTypes(path: string): HealthcareDataType[] {
    const dataTypes: HealthcareDataType[] = [];

    if (path.includes('/patients')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.PATIENT_DEMOGRAPHICS);
    }
    
    if (path.includes('/medical-records') || path.includes('/treatments')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.MEDICAL_HISTORY);
      dataTypes.push(HEALTHCARE_DATA_TYPE.TREATMENT_RECORDS);
    }
    
    if (path.includes('/medical-images')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.MEDICAL_IMAGES);
    }
    
    if (path.includes('/financial') || path.includes('/payments')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.FINANCIAL_DATA);
    }
    
    if (path.includes('/appointments')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.APPOINTMENT_DATA);
    }
    
    if (path.includes('/consent')) {
      dataTypes.push(HEALTHCARE_DATA_TYPE.CONSENT_FORMS);
    }

    return dataTypes;
  }

  private getClientIP(c: Context): string {
    return (
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for') ||
      c.req.header('x-real-ip') ||
      'unknown'
    );
  }

  private async checkRateLimit(
    c: Context,
    path: string,
    ipAddress: string,
    sensitivity: RequestSensitivity,
  ): Promise<void> {
    const now = Date.now();
    const key = `${ipAddress}:${sensitivity}`;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }

    const requests = this.requestCounts.get(key)!;
    const validRequests = requests.filter(time => now - time < this.getRateLimitWindow(sensitivity));

    if (validRequests.length >= this.getRateLimit(sensitivity)) {
      throw new HTTPException(429, {
        message: 'Rate limit exceeded',
        cause: {
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: this.getRateLimitWindow(sensitivity) / 1000,
        },
      });
    }

    validRequests.push(now);
    this.requestCounts.set(key, validRequests);
  }

  private getRateLimitWindow(sensitivity: RequestSensitivity): number {
    switch (sensitivity) {
      case REQUEST_SENSITIVITY.CRITICAL:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.sensitiveDataWindow;
      case REQUEST_SENSITIVITY.HIGH:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.authWindow;
      default:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.standardWindow;
    }
  }

  private getRateLimit(sensitivity: RequestSensitivity): number {
    switch (sensitivity) {
      case REQUEST_SENSITIVITY.CRITICAL:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.sensitiveDataLimit;
      case REQUEST_SENSITIVITY.HIGH:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.authLimit;
      default:
        return AESTHETIC_CLINIC_CONFIG.rateLimiting.standardLimit;
    }
  }

  private requiresMFA(sensitivity: RequestSensitivity): boolean {
    return sensitivity === REQUEST_SENSITIVITY.HIGH || sensitivity === REQUEST_SENSITIVITY.CRITICAL;
  }

  private async verifyMFA(c: Context, userId: string, ipAddress: string): Promise<void> {
    if (!this.mfaService.isMFAVerified(userId)) {
      throw new HTTPException(401, {
        message: 'MFA verification required',
        cause: {
          code: 'MFA_REQUIRED',
          mfaUrl: '/api/v1/mfa/verify',
        },
      });
    }
  }

  private async checkCompliance(
    c: Context,
    sensitivity: RequestSensitivity,
    dataTypes: HealthcareDataType[],
  ): Promise<ComplianceCheckResult> {
    const result: ComplianceCheckResult = {
      lgpd: { compliant: true, violations: [], recommendations: [] },
      anvisa: { compliant: true, violations: [], recommendations: [] },
      overall: true,
    };

    // LGPD compliance check
    if (sensitivity !== REQUEST_SENSITIVITY.LOW) {
      const lgpdCheck = await this.checkLGPDCompliance(c, dataTypes);
      result.lgpd = lgpdCheck;
      result.overall = result.overall && lgpdCheck.compliant;
    }

    // ANVISA compliance check
    if (dataTypes.includes(HEALTHCARE_DATA_TYPE.MEDICAL_IMAGES)) {
      const anvisaCheck = await this.checkANVISACompliance(c);
      result.anvisa = anvisaCheck;
      result.overall = result.overall && anvisaCheck.compliant;
    }

    return result;
  }

  private async checkLGPDCompliance(
    c: Context,
    dataTypes: HealthcareDataType[],
  ): Promise<{ compliant: boolean; violations: string[]; recommendations: string[] }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for sensitive data handling
    if (dataTypes.includes(HEALTHCARE_DATA_TYPE.FINANCIAL_DATA)) {
      const hasConsent = c.get('lgpdConsent');
      if (!hasConsent) {
        violations.push('Missing LGPD consent for financial data processing');
        recommendations.push('Obtain explicit consent for financial data processing');
      }
    }

    // Check data retention
    const retentionDays = AESTHETIC_CLINIC_CONFIG.compliance.lgpd.dataRetentionDays;
    if (retentionDays > 365) {
      violations.push('Data retention period exceeds LGPD limits');
      recommendations.push('Reduce data retention period to comply with LGPD');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  private async checkANVISACompliance(
    c: Context,
  ): Promise<{ compliant: boolean; violations: string[]; recommendations: string[] }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check medical image handling
    if (c.req.path.includes('/medical-images')) {
      const hasAuditTrail = c.get('auditTrailEnabled');
      if (!hasAuditTrail) {
        violations.push('Missing audit trail for medical images');
        recommendations.push('Enable audit trail for medical image operations');
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  private async validateDataAccess(
    c: Context,
    userId: string,
    dataTypes: HealthcareDataType[],
    sensitivity: RequestSensitivity,
  ): Promise<void> {
    if (sensitivity === REQUEST_SENSITIVITY.LOW) {
      return;
    }

    const hasPermission = await this.securityService.hasPermission(
      userId,
      'healthcare_data_access',
      { dataTypes, sensitivity },
    );

    if (!hasPermission) {
      throw new HTTPException(403, {
        message: 'Insufficient permissions for data access',
        cause: {
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermissions: dataTypes,
        },
      });
    }
  }

  private async validateAndSanitizeRequest(c: Context): Promise<void> {
    // Validate content type
    const contentType = c.req.header('content-type');
    if (contentType && !contentType.includes('application/json')) {
      throw new HTTPException(400, {
        message: 'Invalid content type',
      });
    }

    // Sanitize headers
    const headers = c.req.header();
    Object.keys(headers).forEach(key => {
      const value = headers[key];
      if (value && typeof value === 'string') {
        // Remove potential malicious content
        const sanitized = value.replace(/[<>]/g, '');
        if (sanitized !== value) {
          c.header(key, sanitized);
        }
      }
    });
  }

  private calculateRiskScore(c: Context, sensitivity: RequestSensitivity): number {
    let score = 0.1; // Base score

    // Add score based on sensitivity
    switch (sensitivity) {
      case REQUEST_SENSITIVITY.CRITICAL:
        score += 0.4;
        break;
      case REQUEST_SENSITIVITY.HIGH:
        score += 0.3;
        break;
      case REQUEST_SENSITIVITY.MEDIUM:
        score += 0.2;
        break;
    }

    // Add score based on request method
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private determineAction(method: string): SecurityEvent['action'] {
    switch (method) {
      case 'GET':
        return 'access';
      case 'POST':
        return 'upload';
      case 'PUT':
      case 'PATCH':
        return 'modify';
      case 'DELETE':
        return 'delete';
      default:
        return 'access';
    }
  }

  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 10,000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }

    logger.info('Security event logged', securityEvent);
  }

  private setSecurityContext(
    c: Context,
    context: {
      sensitivity: RequestSensitivity;
      dataTypes: HealthcareDataType[];
      complianceResult: ComplianceCheckResult;
      userId: string;
      sessionId: string;
      ipAddress: string;
    },
  ): void {
    c.set('securityContext', context);
  }

  private async handleSecurityError(c: Context, error: any, path: string, method: string): Promise<void> {
    logger.error('Security middleware error', {
      error: error instanceof Error ? error.message : String(error),
      path,
      method,
      ipAddress: this.getClientIP(c),
      userAgent: c.req.header('user-agent'),
    });

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Security check failed',
    });
  }

  private async validateHealthcareData(c: Context): Promise<void> {
    // Validate healthcare-specific data formats
    // This would include validation of medical codes, formats, etc.
  }

  private async enforceDataRetention(c: Context): Promise<void> {
    // Enforce data retention policies
  }

  private async checkDataAnonymization(c: Context): Promise<void> {
    // Check if data should be anonymized
  }

  private async validateFileUpload(c: Context): Promise<void> {
    const contentLength = c.req.header('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size > AESTHETIC_CLINIC_CONFIG.fileUploads.maxFileSize) {
        throw new HTTPException(413, {
          message: 'File size exceeds limit',
        });
      }
    }
  }

  private async scanUploadForMalware(c: Context): Promise<void> {
    // Implement malware scanning logic
  }

  private async validateFinancialTransaction(c: Context): Promise<void> {
    // Validate financial transaction data
  }

  private async checkSuspiciousActivity(c: Context, userId: string, ipAddress: string): Promise<void> {
    // Check for suspicious transaction patterns
  }

  private async logPatientDataAccess(userId: string, patientId: string, ipAddress: string): Promise<void> {
    logger.info('Patient data access', {
      userId,
      patientId,
      ipAddress,
      timestamp: new Date(),
    });
  }

  private async logAuditEvent(event: any): Promise<void> {
    logger.info('Audit event', event);
  }

  private async handleHealthcareError(c: Context, error: any): Promise<void> {
    await this.handleSecurityError(c, error, c.req.path, c.req.method);
  }

  private async handleImageUploadError(c: Context, error: any): Promise<void> {
    await this.handleSecurityError(c, error, c.req.path, c.req.method);
  }

  private async handleFinancialError(c: Context, error: any): Promise<void> {
    await this.handleSecurityError(c, error, c.req.path, c.req.method);
  }

  private async handlePatientDataError(c: Context, error: any): Promise<void> {
    await this.handleSecurityError(c, error, c.req.path, c.req.method);
  }
}

// Export middleware functions
export const aestheticClinicMiddleware = new AestheticClinicMiddleware();
export const healthcareDataMiddleware = aestheticClinicMiddleware.healthcareDataMiddleware.bind(aestheticClinicMiddleware);
export const medicalImageUploadMiddleware = aestheticClinicMiddleware.medicalImageUploadMiddleware.bind(aestheticClinicMiddleware);
export const financialTransactionMiddleware = aestheticClinicMiddleware.financialTransactionMiddleware.bind(aestheticClinicMiddleware);
export const patientDataAccessMiddleware = aestheticClinicMiddleware.patientDataAccessMiddleware.bind(aestheticClinicMiddleware);
export const auditTrailMiddleware = aestheticClinicMiddleware.auditTrailMiddleware.bind(aestheticClinicMiddleware);