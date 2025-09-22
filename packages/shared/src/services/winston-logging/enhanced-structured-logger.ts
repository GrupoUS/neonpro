/**
 * Enhanced Winston-based Structured Logger for Healthcare Applications
 * 
 * Comprehensive structured logging with:
 * - Winston transport system
 * - Brazilian PII/PHI redaction
 * - LGPD compliance features
 * - Correlation ID management
 * - Healthcare workflow context
 * 
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Brazilian Healthcare Standards
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';

// Import types and services
import { brazilianPIIRedactionService } from './brazilian-pii-redaction';

// Define schemas inline to avoid circular imports
const WinstonLogLevelSchema = z.enum([
  "error", "warn", "info", "http", "verbose", "debug", "silly",
]);

const HealthcareSeveritySchema = z.enum([
  "debug", "info", "notice", "warn", "error", "critical", "alert", "emergency",
]);

const BrazilianIdentifierSchema = z.object({
  type: z.enum(["cpf", "cnpj", "rg", "sus", "crm", "coren", "cro", "cfo"]),
  value: z.string(),
  masked: z.string(),
  isValid: z.boolean(),
});

const BrazilianHealthcareContextSchema = z.object({
  workflowType: z.enum([
    "patient_registration", "appointment_scheduling", "medical_consultation",
    "diagnosis_procedure", "treatment_administration", "medication_management",
    "laboratory_testing", "diagnostic_imaging", "emergency_response",
    "patient_discharge", "administrative_task", "system_maintenance",
    "billing_processing", "insurance_verification", "consent_management",
  ]).optional(),
  workflowStage: z.string().optional(),
  patientContext: z.object({
    anonymizedPatientId: z.string().optional(),
    ageGroup: z.enum(["pediatric", "adult", "geriatric"]).optional(),
    criticalityLevel: z.enum(["routine", "urgent", "critical", "emergency"]).optional(),
    hasAllergies: z.boolean().optional(),
    isEmergencyCase: z.boolean().optional(),
    requiresConsent: z.boolean().optional(),
    consentStatus: z.enum(["granted", "denied", "pending", "revoked"]).optional(),
  }).optional(),
  professionalContext: z.object({
    anonymizedProfessionalId: z.string().optional(),
    _role: z.string().optional(),
    specialization: z.string().optional(),
    department: z.string().optional(),
    councilNumber: z.string().optional(),
  }).optional(),
  clinicalContext: z.object({
    facilityId: z.string().optional(),
    serviceType: z.string().optional(),
    protocolVersion: z.string().optional(),
    complianceFrameworks: z.array(z.string()).optional(),
    requiresAudit: z.boolean().optional(),
  }).optional(),
  brazilianCompliance: z.object({
    lgpdLegalBasis: z.enum([
      "consent", "contract", "legal_obligation", "vital_interests",
      "public_interest", "legitimate_interests", "healthcare_provision", "public_health",
    ]).optional(),
    dataRetentionDays: z.number().optional(),
    requiresAnonymization: z.boolean().optional(),
    hasExplicitConsent: z.boolean().optional(),
  }).optional(),
});

const EnhancedLGPDComplianceSchema = z.object({
  dataClassification: z.enum(["public", "internal", "confidential", "restricted", "critical"]),
  containsPII: z.boolean(),
  containsPHI: z.boolean(),
  legalBasis: z.enum([
    "consent", "contract", "legal_obligation", "vital_interests",
    "public_interest", "legitimate_interests", "healthcare_provision", "public_health",
  ]),
  retentionPeriod: z.number(),
  requiresConsent: z.boolean(),
  anonymized: z.boolean(),
  auditRequired: z.boolean(),
  brazilianIdentifiers: z.array(BrazilianIdentifierSchema).optional(),
  dataMinimizationApplied: z.boolean(),
  purposeLimitation: z.string().optional(),
});

const WinstonLogEntrySchema = z.object({
  level: WinstonLogLevelSchema,
  message: z.string(),
  timestamp: z.string().optional(),
  severity: HealthcareSeveritySchema.optional(),
  healthcareContext: BrazilianHealthcareContextSchema.optional(),
  _service: z.string(),
  environment: z.string(),
  requestId: z.string().optional(),
  correlationId: z.string().optional(),
  sessionId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  duration: z.number().optional(),
  memoryUsage: z.number().optional(),
  cpuUsage: z.number().optional(),
  anonymizedUserId: z.string().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  metadata: z.record(z.unknown()).optional(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  lgpdCompliance: EnhancedLGPDComplianceSchema,
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

const EnhancedStructuredLoggingConfigSchema = z.object({
  _service: z.string(),
  environment: z.enum(["development", "staging", "production"]).default("development"),
  version: z.string().optional(),
  level: WinstonLogLevelSchema.default("info"),
  severityLevel: HealthcareSeveritySchema.default("info"),
  transports: z.object({
    console: z.object({
      enabled: z.boolean().default(true),
      level: WinstonLogLevelSchema.default("info"),
      format: z.enum(["json", "simple", "colorized"]).default("json"),
    }).optional(),
    file: z.object({
      enabled: z.boolean().default(false),
      level: WinstonLogLevelSchema.default("info"),
      filename: z.string(),
      maxSize: z.string().default("20m"),
      maxFiles: z.number().default(5),
      format: z.enum(["json", "simple"]).default("json"),
    }).optional(),
    dailyRotate: z.object({
      enabled: z.boolean().default(false),
      level: WinstonLogLevelSchema.default("info"),
      filename: z.string(),
      datePattern: z.string().default("YYYY-MM-DD"),
      zippedArchive: z.boolean().default(true),
      maxSize: z.string().default("20m"),
      maxFiles: z.string().default("14d"),
    }).optional(),
  }).default({
    console: { enabled: true },
  }),
  performance: z.object({
    silent: z.boolean().default(false),
    exitOnError: z.boolean().default(false),
    handleExceptions: z.boolean().default(true),
    handleRejections: z.boolean().default(true),
  }).default({}),
  healthcareCompliance: z.object({
    enablePIIRedaction: z.boolean().default(true),
    enableAuditLogging: z.boolean().default(true),
    criticalEventAlerts: z.boolean().default(true),
    patientSafetyLogging: z.boolean().default(true),
    enableBrazilianCompliance: z.boolean().default(true),
  }).default({}),
  lgpdCompliance: z.object({
    dataRetentionDays: z.number().default(365),
    requireExplicitConsent: z.boolean().default(false),
    anonymizeByDefault: z.boolean().default(true),
    enableDataMinimization: z.boolean().default(true),
    enablePurposeLimitation: z.boolean().default(true),
  }).default({}),
  format: z.object({
    colorize: z.boolean().default(false),
    prettyPrint: z.boolean().default(false),
    timestamp: z.boolean().default(true),
    showLevel: z.boolean().default(true),
  }).default({}),
});

// Import types
import {
  EnhancedStructuredLoggingConfig,
  WinstonLogEntry,
  WinstonLogLevel,
  HealthcareSeverity,
  BrazilianHealthcareContext,
  EnhancedLGPDCompliance,
} from './types';

// Custom Winston format for healthcare logs
const healthcareLogFormat = winston.format((info: any) => {
  // Apply PII redaction to all string fields
  if (info.message && typeof info.message === 'string') {
    info.message = brazilianPIIRedactionService.redactText(info.message);
  }

  if (info.error && typeof info.error === 'object') {
    info.error = brazilianPIIRedactionService.redactObject(info.error);
  }

  if (info.metadata && typeof info.metadata === 'object') {
    info.metadata = brazilianPIIRedactionService.redactObject(info.metadata);
  }

  // Add healthcare-specific formatting
  if (info.severity && info.severity !== info.level) {
    info.severityEmoji = getSeverityEmoji(info.severity);
  }

  return info;
});

function getSeverityEmoji(severity: HealthcareSeverity): string {
  const emojis = {
    debug: '🐛',
    info: 'ℹ️',
    notice: '📋',
    warn: '⚠️',
    error: '❌',
    critical: '🔥',
    alert: '🚨',
    emergency: '🆘',
  };
  return emojis[severity] || '';
}

/**
 * Enhanced Structured Logger with Winston integration
 */
export class EnhancedStructuredLogger {
  private winston: winston.Logger;
  private config: EnhancedStructuredLoggingConfig;
  private correlationIdStore: Map<string, string> = new Map();
  private requestContext: Map<string, any> = new Map();

  constructor(config: EnhancedStructuredLoggingConfig) {
    this.config = this.validateConfig(config);
    this.winston = this.createWinstonLogger();
  }

  /**
   * Validate and merge configuration
   */
  private validateConfig(config: EnhancedStructuredLoggingConfig): EnhancedStructuredLoggingConfig {
    // Basic validation - could be enhanced with schema validation
    if (!config._service) {
      throw new Error('Service name is required in logging configuration');
    }
    return config;
  }

  /**
   * Create Winston logger with healthcare configuration
   */
  private createWinstonLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.transports.console?.enabled) {
      transports.push(new winston.transports.Console({
        level: this.config.transports.console.level,
        format: this.createConsoleFormat(),
      }));
    }

    // File transport
    if (this.config.transports.file?.enabled) {
      transports.push(new winston.transports.File({
        level: this.config.transports.file.level,
        filename: this.config.transports.file.filename,
        maxsize: this.parseSize(this.config.transports.file.maxSize),
        maxFiles: this.config.transports.file.maxFiles,
        format: this.createFileFormat(),
      }));
    }

    // Daily rotate transport
    if (this.config.transports.dailyRotate?.enabled) {
      const DailyRotateFile = require('winston-daily-rotate-file');
      transports.push(new DailyRotateFile({
        level: this.config.transports.dailyRotate.level,
        filename: this.config.transports.dailyRotate.filename,
        datePattern: this.config.transports.dailyRotate.datePattern,
        zippedArchive: this.config.transports.dailyRotate.zippedArchive,
        maxSize: this.config.transports.dailyRotate.maxSize,
        maxFiles: this.config.transports.dailyRotate.maxFiles,
        format: this.createFileFormat(),
      }));
    }

    return winston.createLogger({
      level: this.config.level,
      transports,
      exitOnError: this.config.performance.exitOnError,
      handleExceptions: this.config.performance.handleExceptions,
      handleRejections: this.config.performance.handleRejections,
      silent: this.config.performance.silent,
    });
  }

  /**
   * Create console format
   */
  private createConsoleFormat(): winston.Logform.Format {
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      healthcareLogFormat(),
    ];

    if (this.config.transports.console?.format === 'json') {
      formats.push(winston.format.json());
    } else if (this.config.transports.console?.format === 'simple') {
      formats.push(winston.format.simple());
    } else {
      formats.push(winston.format.printf((info) => {
        const timestamp = info.timestamp ? new Date(info.timestamp as string).toLocaleTimeString() : '';
        const severityEmoji = info.severityEmoji || '';
        const correlationId = info.correlationId ? `[${info.correlationId}]` : '';

        return `${timestamp} ${severityEmoji} [${info.level.toUpperCase()}] ${correlationId} ${info.service}: ${info.message} ${
          info.metadata ? JSON.stringify(info.metadata) : ''
        } ${info.error ? `\nError: ${(info.error as Error).stack || (info.error as Error).message}` : ''}`;
      }));
    }

    return winston.format.combine(...formats);
  }

  /**
   * Create file format
   */
  private createFileFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      healthcareLogFormat(),
      winston.format.json()
    );
  }

  /**
   * Parse size string to bytes
   */
  private parseSize(size: string): number {
    const units = { b: 1, k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+)([bkm])$/i);
    if (!match) return 20 * 1024 * 1024; // Default 20MB
    return parseInt(match[1]) * units[match[2].toLowerCase() as keyof typeof units];
  }

  /**
   * Generate correlation ID
   */
  generateCorrelationId(): string {
    return `corr_${nanoid(16)}`;
  }

  /**
   * Set correlation ID for current context
   */
  setCorrelationId(correlationId: string): void {
    this.correlationIdStore.set('current', correlationId);
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string {
    return this.correlationIdStore.get('current') || this.generateCorrelationId();
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(): void {
    this.correlationIdStore.delete('current');
  }

  /**
   * Set request context
   */
  setRequestContext(_context: any): void {
    this.requestContext.set('current', _context);
  }

  /**
   * Get request context
   */
  getRequestContext(): any {
    return this.requestContext.get('current') || {};
  }

  /**
   * Clear request context
   */
  clearRequestContext(): void {
    this.requestContext.delete('current');
  }

  /**
   * Map healthcare severity to Winston level
   */
  private mapSeverityToLevel(severity: HealthcareSeverity): WinstonLogLevel {
    const mapping: Record<HealthcareSeverity, WinstonLogLevel> = {
      debug: 'debug',
      info: 'info',
      notice: 'verbose',
      warn: 'warn',
      error: 'error',
      critical: 'error',
      alert: 'error',
      emergency: 'error',
    };
    return mapping[severity];
  }

  /**
   * Create LGPD compliance metadata
   */
  private createLGPDCompliance(
    severity: HealthcareSeverity,
    data?: any,
    healthcareContext?: BrazilianHealthcareContext
  ): EnhancedLGPDCompliance {
    // Detect PII in data
    const containsPII = this.detectPII(data);
    const containsPHI = this.detectPHI(data, healthcareContext);
    
    // Extract Brazilian identifiers
    const brazilianIdentifiers = this.extractBrazilianIdentifiers(data);

    // Determine data classification
    let dataClassification: EnhancedLGPDCompliance['dataClassification'] = 'internal';
    
    if (['emergency', 'alert', 'critical'].includes(severity)) {
      dataClassification = 'critical';
    } else if (healthcareContext?.patientContext || containsPHI) {
      dataClassification = 'restricted';
    } else if (containsPII) {
      dataClassification = 'confidential';
    }

    return {
      dataClassification,
      containsPII,
      containsPHI,
      legalBasis: healthcareContext?.brazilianCompliance?.lgpdLegalBasis || 'legitimate_interests',
      retentionPeriod: this.config.lgpdCompliance.dataRetentionDays,
      requiresConsent: this.config.lgpdCompliance.requireExplicitConsent && (containsPII || containsPHI),
      anonymized: this.config.lgpdCompliance.anonymizeByDefault,
      auditRequired: ['emergency', 'alert', 'critical'].includes(severity) || 
                    healthcareContext?.patientContext !== undefined ||
                    healthcareContext?.clinicalContext?.requiresAudit,
      brazilianIdentifiers,
      dataMinimizationApplied: this.config.lgpdCompliance.enableDataMinimization,
      purposeLimitation: healthcareContext?.brazilianCompliance?.lgpdLegalBasis || 'healthcare_provision',
    };
  }

  /**
   * Detect PII in data
   */
  private detectPII(data: any): boolean {
    if (!data) return false;
    
    const dataString = JSON.stringify(data);
    return brazilianPIIRedactionService.containsPII(dataString);
  }

  /**
   * Detect PHI in data and context
   */
  private detectPHI(data: any, healthcareContext?: BrazilianHealthcareContext): boolean {
    if (healthcareContext?.patientContext) return true;
    
    // Check for healthcare-related sensitive data
    const healthKeywords = [
      'diagnosis', 'treatment', 'medication', 'symptom', 'patient',
      'medical', 'clinical', 'health', 'therapy', 'surgery',
      'examination', 'prescription', 'allergy', 'condition',
    ];
    
    const dataString = JSON.stringify(data).toLowerCase();
    return healthKeywords.some(keyword => dataString.includes(keyword));
  }

  /**
   * Extract Brazilian identifiers from data
   */
  private extractBrazilianIdentifiers(data: any) {
    if (!data) return [];
    
    const dataString = JSON.stringify(data);
    return brazilianPIIRedactionService.extractBrazilianIdentifiers(dataString);
  }

  /**
   * Core logging method
   */
  private log(
    level: WinstonLogLevel,
    severity: HealthcareSeverity,
    message: string,
    data?: any,
    _context?: {
      healthcare?: BrazilianHealthcareContext;
      technical?: any;
    }
  ): void {
    const correlationId = this.getCorrelationId();
    const requestContext = this.getRequestContext();

    // Create log entry
    const logEntry: WinstonLogEntry = {
      level,
      severity,
      message,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      correlationId,
      requestId: requestContext.requestId,
      sessionId: requestContext.sessionId,
      traceId: requestContext.traceId,
      spanId: requestContext.spanId,
      healthcareContext: context?.healthcare,
      duration: requestContext.duration,
      memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : undefined,
      cpuUsage: process.cpuUsage ? process.cpuUsage().user : undefined,
      anonymizedUserId: requestContext.anonymizedUserId,
      deviceType: requestContext.deviceType,
      metadata: data,
      error: data?.error,
      lgpdCompliance: this.createLGPDCompliance(severity, data, _context?.healthcare),
      tags: [severity, this.config.service, this.config.environment],
      source: this.config.service,
    };

    // Log with Winston
    this.winston.log(level, logEntry);

    // Special handling for critical events
    if (['critical', 'alert', 'emergency'].includes(severity)) {
      this.handleCriticalEvent(logEntry);
    }
  }

  /**
   * Handle critical events
   */
  private handleCriticalEvent(logEntry: WinstonLogEntry): void {
    // Immediate end for critical events  
    this.winston.end();

    // TODO: Implement alert system integration
    if (this.config.healthcareCompliance.criticalEventAlerts) {
      this.sendCriticalAlert(logEntry);
    }
  }

  /**
   * Send critical alert
   */
  private sendCriticalAlert(logEntry: WinstonLogEntry): void {
    // Create alert message with proper redaction
    const alertMessage = brazilianPIIRedactionService.redactText(
      `🚨 CRITICAL EVENT: ${logEntry.message}`
    );

    // Log alert (will be redacted again but that's fine)
    this.winston.error('CRITICAL_ALERT', {
      originalMessage: alertMessage,
      severity: logEntry.severity,
      correlationId: logEntry.correlationId,
      timestamp: logEntry.timestamp,
    });
  }

  // ============================================================================
  // PUBLIC LOGGING METHODS
  // ============================================================================

  debug(message: string, data?: any, _context?: any): void {
    this.log('debug', 'debug', message, data, _context);
  }

  info(message: string, data?: any, _context?: any): void {
    this.log('info', 'info', message, data, _context);
  }

  notice(message: string, data?: any, _context?: any): void {
    this.log('verbose', 'notice', message, data, _context);
  }

  warn(message: string, data?: any, _context?: any): void {
    this.log('warn', 'warn', message, data, _context);
  }

  error(message: string, error?: Error, data?: any, _context?: any): void {
    this.log('error', 'error', message, { ...data, error }, _context);
  }

  critical(message: string, data?: any, _context?: any): void {
    this.log('error', 'critical', message, data, _context);
  }

  alert(message: string, data?: any, _context?: any): void {
    this.log('error', 'alert', message, data, _context);
  }

  emergency(message: string, data?: any, _context?: any): void {
    this.log('error', 'emergency', message, data, _context);
  }

  // ============================================================================
  // HEALTHCARE-SPECIFIC LOGGING METHODS
  // ============================================================================

  /**
   * Log patient safety event
   */
  logPatientSafetyEvent(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ): void {
    const healthcareSeverity = severity === 'critical' ? 'alert' : 
                             severity === 'high' ? 'critical' :
                             severity === 'medium' ? 'error' : 'warn';

    this.log(
      this.mapSeverityToLevel(healthcareSeverity),
      healthcareSeverity,
      `[PATIENT SAFETY] ${message}`,
      {
        ...data,
        patientSafetyEvent: true,
        severity,
      },
      { healthcare: healthcareContext }
    );
  }

  /**
   * Log clinical workflow
   */
  logClinicalWorkflow(
    workflowType: BrazilianHealthcareContext['workflowType'],
    stage: string,
    message: string,
    data?: any,
    _context?: any
  ): void {
    const healthcareContext: BrazilianHealthcareContext = {
      workflowType,
      workflowStage: stage,
      ..._context?.healthcare,
    };

    this.info(
      `[WORKFLOW:${workflowType?.toUpperCase()}] ${message}`,
      data,
      { healthcare: healthcareContext, technical: context?.technical }
    );
  }

  /**
   * Log medication event
   */
  logMedicationEvent(
    action: 'prescribed' | 'administered' | 'verified' | 'adverse_reaction',
    message: string,
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ): void {

    this.log(
      this.mapSeverityToLevel(severity),
      severity,
      `[MEDICATION:${action.toUpperCase()}] ${message}`,
      {
        ...data,
        medicationEvent: true,
        action,
      },
      { healthcare: healthcareContext }
    );
  }

  /**
   * Log emergency response
   */
  logEmergencyResponse(
    action: string,
    responseTime: number,
    message: string,
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ): void {
    const severity = responseTime > 30000 ? 'critical' : 'alert'; // 30 second threshold

    this.log(
      this.mapSeverityToLevel(severity),
      severity,
      `[EMERGENCY:${action.toUpperCase()}] ${message}`,
      {
        ...data,
        emergencyResponse: true,
        action,
        responseTime,
      },
      { healthcare: healthcareContext }
    );
  }

  /**
   * Create child logger with context
   */
  child(_context: any): EnhancedStructuredLogger {
    const childLogger = Object.create(this);
    childLogger.config = { ...this.config };
    childLogger.correlationIdStore = new Map(this.correlationIdStore);
    childLogger.requestContext = new Map(this.requestContext);
    
    // Set child context
    childLogger.setRequestContext({
      ...this.getRequestContext(),
      ..._context,
    });
    
    return childLogger;
  }

  /**
   * Get logger statistics
   */
  getStatistics() {
    return {
      environment: this.config.environment,
      level: this.config.level,
      correlationId: this.getCorrelationId(),
      transports: this.winston.transports.length,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.winston.info('Shutting down enhanced structured logger...');
    await new Promise<void>((resolve) => {
      this.winston.on('finish', resolve);
      this.winston.end();
    });
  }
}