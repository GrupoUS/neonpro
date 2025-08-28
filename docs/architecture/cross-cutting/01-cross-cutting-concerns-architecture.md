# NeonPro Cross-Cutting Concerns Architecture

## 📋 Overview

Cross-cutting concerns are aspects of the system that span multiple layers, components, and modules. This document defines the comprehensive architecture for managing these concerns in the NeonPro Healthcare Platform, ensuring consistency, maintainability, and compliance across the entire system.

### Core Cross-Cutting Concerns

1. **Security & Authentication** - Identity management, authorization, encryption
2. **Logging & Monitoring** - Centralized logging, metrics, observability
3. **Error Handling & Recovery** - Consistent error management and resilience
4. **Data Validation & Sanitization** - Input validation and data integrity
5. **Compliance & Audit** - LGPD, healthcare regulations, audit trails
6. **Caching & Performance** - Data caching, response optimization
7. **Configuration Management** - Environment configs, feature flags, secrets
8. **Communication & Integration** - Message queuing, event-driven patterns
9. **Internationalization** - Multi-language support and localization
10. **Rate Limiting & Throttling** - API protection and resource management

---

## 🔐 Security & Authentication Architecture

### Authentication Framework

```typescript
// Centralized Authentication Service
export class AuthenticationService {
  private jwtService: JWTService;
  private healthcareValidator: HealthcareValidator;
  private auditLogger: AuditLogger;
  private emergencyAccess: EmergencyAccessService;

  constructor(dependencies: AuthDependencies) {
    this.jwtService = dependencies.jwt;
    this.healthcareValidator = dependencies.healthcareValidator;
    this.auditLogger = dependencies.auditLogger;
    this.emergencyAccess = dependencies.emergencyAccess;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    // 1. Validate basic credentials
    const user = await this.validateCredentials(credentials);

    // 2. Healthcare-specific validation
    if (user.role === "healthcare_provider") {
      await this.healthcareValidator.validateLicense(user.licenseNumber);
    }

    // 3. Generate tokens with healthcare context
    const tokens = await this.jwtService.generateTokens(user, {
      clinicId: user.clinicId,
      permissions: user.permissions,
      emergencyAccess: user.emergencyAccess,
      lgpdConsent: user.lgpdConsent,
    });

    // 4. Audit log authentication
    await this.auditLogger.logAuthentication(user.id, "SUCCESS", {
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      timestamp: new Date().toISOString(),
    });

    return { user, tokens, sessionInfo: this.createSession(user) };
  }

  async authorizeRequest(token: string, requiredPermissions: Permission[]): Promise<AuthContext> {
    // Token validation and permission checking
    const payload = await this.jwtService.verifyToken(token);
    const hasPermissions = this.checkPermissions(payload.permissions, requiredPermissions);

    if (!hasPermissions && !payload.emergencyAccess) {
      throw new AuthorizationError("Insufficient permissions");
    }

    return {
      userId: payload.userId,
      role: payload.role,
      permissions: payload.permissions,
      clinicId: payload.clinicId,
      emergencyAccess: payload.emergencyAccess,
      sessionId: payload.sessionId,
    };
  }
}
```

### Authorization Matrix

```typescript
// Role-based Permission Matrix
export const HEALTHCARE_PERMISSIONS = {
  // Patient Data Access
  "read:patients": ["admin", "healthcare_provider", "clinic_staff"],
  "write:patients": ["admin", "healthcare_provider"],
  "export:patients": ["admin", "healthcare_provider"],
  "delete:patients": ["admin"], // Soft delete only

  // Professional Management
  "read:professionals": ["admin", "clinic_manager", "healthcare_provider"],
  "write:professionals": ["admin", "clinic_manager"],
  "validate:licenses": ["admin", "healthcare_provider"],

  // Appointment Management
  "read:appointments": ["admin", "healthcare_provider", "clinic_staff", "patient"],
  "write:appointments": ["admin", "healthcare_provider", "clinic_staff"],
  "cancel:appointments": ["admin", "healthcare_provider", "patient"],

  // Emergency Access
  "emergency:override": ["admin", "emergency_physician"],
  "emergency:patient_access": ["emergency_physician"],

  // Compliance & Reporting
  "read:audit_logs": ["admin", "compliance_officer"],
  "export:compliance_reports": ["admin", "compliance_officer"],
  "submit:anvisa_reports": ["admin", "healthcare_provider"],
} as const;

// Context-based Authorization
export class AuthorizationService {
  async checkAccess(
    context: AuthContext,
    resource: Resource,
    action: string,
  ): Promise<boolean> {
    // Base permission check
    const hasPermission = this.hasBasePermission(context.permissions, `${action}:${resource.type}`);

    // Scope-based validation
    const scopeValid = await this.validateScope(context, resource, action);

    // Emergency override check
    const emergencyOverride = this.isEmergencyOverride(context, resource, action);

    // LGPD compliance check
    const lgpdCompliant = await this.checkLGPDCompliance(context, resource, action);

    return (hasPermission && scopeValid && lgpdCompliant) || emergencyOverride;
  }

  private async validateScope(
    context: AuthContext,
    resource: Resource,
    action: string,
  ): Promise<boolean> {
    switch (resource.type) {
      case "patient":
        // Clinic-based access control
        return resource.clinicId === context.clinicId;

      case "professional":
        // Professional can only access their own data unless admin
        return context.role === "admin" || resource.id === context.userId;

      case "appointment":
        // Patient can only access their appointments
        // Professional can access appointments in their clinic
        return this.validateAppointmentAccess(context, resource);

      default:
        return true;
    }
  }
}
```

### Encryption & Data Protection

```typescript
// Field-Level Encryption Service
export class EncryptionService {
  private keyManager: KeyManager;
  private auditLogger: AuditLogger;

  constructor(keyManager: KeyManager, auditLogger: AuditLogger) {
    this.keyManager = keyManager;
    this.auditLogger = auditLogger;
  }

  async encryptPersonalData(
    data: PersonalData,
    context: EncryptionContext,
  ): Promise<EncryptedData> {
    // 1. Get appropriate encryption key
    const key = await this.keyManager.getEncryptionKey(context.dataClassification);

    // 2. Encrypt sensitive fields
    const encryptedFields = await this.encryptFields(data, key, context.sensitiveFields);

    // 3. Create encryption metadata
    const metadata: EncryptionMetadata = {
      algorithm: "aes-256-gcm",
      keyVersion: key.version,
      encryptedAt: new Date().toISOString(),
      encryptedBy: context.userId,
      dataClassification: context.dataClassification,
      retentionPeriod: context.retentionPeriod,
    };

    // 4. Audit log encryption event
    await this.auditLogger.logEncryption({
      dataType: context.dataType,
      userId: context.userId,
      encryptionLevel: context.dataClassification,
      fieldsEncrypted: context.sensitiveFields.length,
    });

    return { encryptedFields, metadata };
  }

  async decryptPersonalData(
    encryptedData: EncryptedData,
    context: DecryptionContext,
  ): Promise<PersonalData> {
    // 1. Validate decryption permissions
    await this.validateDecryptionPermissions(context);

    // 2. Get decryption key
    const key = await this.keyManager.getDecryptionKey(
      encryptedData.metadata.keyVersion,
    );

    // 3. Decrypt data
    const decryptedData = await this.decryptFields(encryptedData, key);

    // 4. Audit log access
    await this.auditLogger.logDecryption({
      dataType: encryptedData.metadata.dataType,
      accessedBy: context.userId,
      accessPurpose: context.purpose,
      accessedAt: new Date().toISOString(),
    });

    return decryptedData;
  }
}

// LGPD-Compliant Data Handling
export class LGPDDataHandler {
  async maskPersonalData(data: PersonalData, permissions: Permission[]): Promise<MaskedData> {
    const maskingLevel = this.determineMaskingLevel(permissions);

    return {
      ...data,
      cpf: this.maskCPF(data.cpf, maskingLevel),
      email: this.maskEmail(data.email, maskingLevel),
      phone: this.maskPhone(data.phone, maskingLevel),
      fullName: this.maskName(data.fullName, maskingLevel),
    };
  }

  private maskCPF(cpf: string, level: MaskingLevel): string {
    switch (level) {
      case "full":
        return "***.***.***-**";
      case "partial":
        return `${cpf.slice(0, 3)}.***.***.${cpf.slice(-2)}`;
      case "none":
        return cpf;
      default:
        return "***.***.***-**";
    }
  }
}
```

---

## 📊 Logging & Monitoring Architecture

### Centralized Logging System

```typescript
// Structured Logging Service
export class LoggingService {
  private logger: Logger;
  private logStorage: LogStorage;
  private auditTrail: AuditTrail;
  private complianceLogger: ComplianceLogger;

  constructor(dependencies: LoggingDependencies) {
    this.logger = dependencies.logger;
    this.logStorage = dependencies.logStorage;
    this.auditTrail = dependencies.auditTrail;
    this.complianceLogger = dependencies.complianceLogger;
  }

  // Healthcare-specific logging with LGPD compliance
  async logHealthcareEvent(event: HealthcareEvent): Promise<void> {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: event.severity,
      service: event.service,
      userId: event.userId,
      sessionId: event.sessionId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      duration: event.duration,
      success: event.success,
      errorCode: event.errorCode,
      message: event.message,
      metadata: this.sanitizeMetadata(event.metadata),
      compliance: {
        lgpdImpact: event.lgpdImpact,
        auditRequired: event.auditRequired,
        retentionClass: event.retentionClass,
        sensitiveDataAccess: event.sensitiveDataAccess,
      },
    };

    // Multi-destination logging
    await Promise.all([
      this.logger.log(logEntry),
      this.logStorage.store(logEntry),
      event.auditRequired && this.auditTrail.record(logEntry),
      event.lgpdImpact && this.complianceLogger.record(logEntry),
    ]);

    // Real-time alerting for critical events
    if (event.severity === "critical" || event.errorCode?.startsWith("SECURITY_")) {
      await this.triggerAlert(logEntry);
    }
  }

  // Patient data access logging (LGPD requirement)
  async logPatientDataAccess(access: PatientDataAccess): Promise<void> {
    await this.logHealthcareEvent({
      severity: "info",
      service: "patient-service",
      userId: access.accessorId,
      sessionId: access.sessionId,
      action: "data_access",
      resourceType: "patient",
      resourceId: access.patientId,
      ipAddress: access.ipAddress,
      userAgent: access.userAgent,
      success: true,
      message: `Patient data accessed for ${access.purpose}`,
      metadata: {
        fieldsAccessed: access.fieldsAccessed,
        accessPurpose: access.purpose,
        legalBasis: access.legalBasis,
        dataRetentionPeriod: access.dataRetentionPeriod,
      },
      lgpdImpact: true,
      auditRequired: true,
      retentionClass: "extended",
      sensitiveDataAccess: true,
    });
  }

  // Professional license validation logging
  async logLicenseValidation(validation: LicenseValidation): Promise<void> {
    await this.logHealthcareEvent({
      severity: validation.isValid ? "info" : "warning",
      service: "professional-service",
      userId: validation.professionalId,
      action: "license_validation",
      resourceType: "professional",
      resourceId: validation.professionalId,
      success: validation.isValid,
      message: `Professional license validation: ${validation.isValid ? "VALID" : "INVALID"}`,
      metadata: {
        licenseNumber: validation.licenseNumber,
        validationSource: validation.source,
        expirationDate: validation.expirationDate,
        specializations: validation.specializations,
      },
      auditRequired: true,
      retentionClass: "standard",
    });
  }
}

// Healthcare Metrics Collection
export class HealthcareMetrics {
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;

  constructor(metricsCollector: MetricsCollector, alertManager: AlertManager) {
    this.metricsCollector = metricsCollector;
    this.alertManager = alertManager;
  }

  // Business Metrics
  async recordAppointmentMetrics(appointment: Appointment): Promise<void> {
    await this.metricsCollector.increment("appointments.scheduled", {
      professionalId: appointment.professionalId,
      serviceType: appointment.serviceType,
      clinicId: appointment.clinicId,
    });

    await this.metricsCollector.histogram("appointment.duration", appointment.duration, {
      serviceType: appointment.serviceType,
      professionalSpecialty: appointment.professionalSpecialty,
    });
  }

  // Performance Metrics
  async recordAPIPerformance(request: APIRequest, response: APIResponse): Promise<void> {
    const duration = response.timestamp - request.timestamp;

    await this.metricsCollector.histogram("api.request.duration", duration, {
      method: request.method,
      endpoint: request.endpoint,
      statusCode: response.statusCode.toString(),
      userId: request.userId,
    });

    await this.metricsCollector.increment("api.requests.total", {
      method: request.method,
      endpoint: request.endpoint,
      statusCode: response.statusCode.toString(),
    });

    // Alert on slow responses
    if (duration > 2000) { // 2 seconds
      await this.alertManager.sendAlert({
        severity: "warning",
        title: "Slow API Response",
        message: `${request.endpoint} took ${duration}ms to respond`,
        metadata: { request, response },
      });
    }
  }

  // Compliance Metrics
  async recordComplianceMetrics(event: ComplianceEvent): Promise<void> {
    await this.metricsCollector.increment("compliance.events.total", {
      type: event.type,
      result: event.result,
      regulation: event.regulation,
    });

    if (event.result === "violation") {
      await this.alertManager.sendAlert({
        severity: "critical",
        title: "Compliance Violation",
        message: `${event.regulation} compliance violation detected`,
        metadata: event,
      });
    }
  }
}
```

### Monitoring & Observability

```typescript
// Health Check Service
export class HealthCheckService {
  private dependencies: HealthDependency[];
  private healthCheckers: Map<string, HealthChecker>;

  constructor(dependencies: HealthDependency[]) {
    this.dependencies = dependencies;
    this.healthCheckers = new Map();
    this.initializeHealthCheckers();
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.all(
      this.dependencies.map(dep => this.checkDependency(dep)),
    );

    const overallStatus = checks.every(check => check.status === "healthy")
      ? "healthy"
      : checks.some(check => check.status === "critical")
      ? "critical"
      : "degraded";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: checks.reduce((acc, check) => {
        acc[check.name] = check;
        return acc;
      }, {} as Record<string, HealthCheck>),
      metadata: {
        uptime: process.uptime(),
        version: process.env.APP_VERSION,
        environment: process.env.NODE_ENV,
      },
    };
  }

  private async checkDependency(dependency: HealthDependency): Promise<HealthCheck> {
    const checker = this.healthCheckers.get(dependency.type);
    if (!checker) {
      return {
        name: dependency.name,
        status: "unknown",
        message: "No health checker available",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const start = Date.now();
      await checker.check(dependency.config);
      const duration = Date.now() - start;

      return {
        name: dependency.name,
        status: duration < dependency.timeout ? "healthy" : "degraded",
        message: `Response time: ${duration}ms`,
        timestamp: new Date().toISOString(),
        responseTime: duration,
      };
    } catch (error) {
      return {
        name: dependency.name,
        status: "critical",
        message: error.message,
        timestamp: new Date().toISOString(),
        error: error,
      };
    }
  }
}

// Distributed Tracing
export class DistributedTracing {
  private tracer: Tracer;
  private spanProcessor: SpanProcessor;

  constructor(tracer: Tracer, spanProcessor: SpanProcessor) {
    this.tracer = tracer;
    this.spanProcessor = spanProcessor;
  }

  // Healthcare request tracing
  async traceHealthcareRequest(request: HealthcareRequest): Promise<Span> {
    const span = this.tracer.startSpan(`healthcare.${request.operation}`, {
      attributes: {
        "healthcare.patient_id": request.patientId,
        "healthcare.professional_id": request.professionalId,
        "healthcare.operation": request.operation,
        "healthcare.clinic_id": request.clinicId,
        "request.id": request.requestId,
        "user.id": request.userId,
        "user.role": request.userRole,
      },
    });

    // Add healthcare-specific context
    span.setAttributes({
      "lgpd.consent_required": request.lgpdConsentRequired,
      "audit.required": request.auditRequired,
      "emergency.access": request.emergencyAccess,
      "compliance.regulation": request.applicableRegulations,
    });

    return span;
  }

  // Database operation tracing
  async traceDatabaseOperation(operation: DatabaseOperation): Promise<Span> {
    const span = this.tracer.startSpan(`db.${operation.type}`, {
      attributes: {
        "db.operation": operation.type,
        "db.table": operation.table,
        "db.query_type": operation.queryType,
        "db.connection_pool": operation.connectionPool,
      },
    });

    // Add performance context
    if (operation.slowQuery) {
      span.setAttributes({
        "db.slow_query": true,
        "db.query_time": operation.queryTime,
        "performance.alert": true,
      });
    }

    return span;
  }
}
```

---

## 🛡️ Error Handling & Recovery Architecture

### Centralized Error Handling

```typescript
// Healthcare Error Handler
export class HealthcareErrorHandler {
  private logger: LoggingService;
  private alertManager: AlertManager;
  private errorRecovery: ErrorRecoveryService;

  constructor(
    logger: LoggingService,
    alertManager: AlertManager,
    errorRecovery: ErrorRecoveryService,
  ) {
    this.logger = logger;
    this.alertManager = alertManager;
    this.errorRecovery = errorRecovery;
  }

  async handleError(error: Error, context: ErrorContext): Promise<ErrorResponse> {
    // 1. Classify error
    const errorClassification = this.classifyError(error);

    // 2. Log error with healthcare context
    await this.logError(error, context, errorClassification);

    // 3. Attempt recovery if applicable
    const recoveryResult = await this.attemptRecovery(error, context);

    // 4. Send alerts for critical errors
    if (errorClassification.severity === "critical") {
      await this.alertManager.sendCriticalAlert({
        error,
        context,
        classification: errorClassification,
        recoveryAttempted: recoveryResult.attempted,
        recoverySuccessful: recoveryResult.successful,
      });
    }

    // 5. Return user-friendly error response
    return this.formatErrorResponse(error, context, errorClassification);
  }

  private classifyError(error: Error): ErrorClassification {
    // Healthcare-specific error classification
    if (error instanceof LGPDComplianceError) {
      return {
        type: "compliance_violation",
        severity: "critical",
        category: "legal",
        userFacing: false,
        requiresManualIntervention: true,
        auditRequired: true,
      };
    }

    if (error instanceof PatientDataAccessError) {
      return {
        type: "unauthorized_access",
        severity: "high",
        category: "security",
        userFacing: true,
        requiresManualIntervention: false,
        auditRequired: true,
      };
    }

    if (error instanceof ProfessionalLicenseError) {
      return {
        type: "license_validation_failed",
        severity: "high",
        category: "regulatory",
        userFacing: true,
        requiresManualIntervention: true,
        auditRequired: true,
      };
    }

    if (error instanceof DatabaseConnectionError) {
      return {
        type: "infrastructure_failure",
        severity: "critical",
        category: "infrastructure",
        userFacing: false,
        requiresManualIntervention: false,
        auditRequired: false,
      };
    }

    // Default classification
    return {
      type: "unknown_error",
      severity: "medium",
      category: "application",
      userFacing: true,
      requiresManualIntervention: false,
      auditRequired: false,
    };
  }

  private async logError(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification,
  ): Promise<void> {
    await this.logger.logHealthcareEvent({
      severity: this.mapSeverityToLogLevel(classification.severity),
      service: context.service,
      userId: context.userId,
      sessionId: context.sessionId,
      action: context.action,
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: false,
      errorCode: this.generateErrorCode(error, classification),
      message: error.message,
      metadata: {
        errorType: classification.type,
        errorCategory: classification.category,
        stackTrace: error.stack,
        requestId: context.requestId,
        correlationId: context.correlationId,
        errorClassification: classification,
      },
      lgpdImpact: classification.category === "legal",
      auditRequired: classification.auditRequired,
      retentionClass: classification.auditRequired ? "extended" : "standard",
    });
  }

  private formatErrorResponse(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification,
  ): ErrorResponse {
    // Don't expose sensitive information to users
    const userMessage = classification.userFacing
      ? this.getUserFriendlyMessage(error, classification)
      : "Um erro interno ocorreu. Nossa equipe foi notificada.";

    return {
      success: false,
      error: classification.type,
      message: userMessage,
      code: this.generateErrorCode(error, classification),
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      ...(process.env.NODE_ENV === "development" && {
        details: {
          originalMessage: error.message,
          stackTrace: error.stack,
          classification,
        },
      }),
    };
  }
}

// Circuit Breaker Pattern for External Services
export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private serviceName: string,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN";
      } else {
        throw new ServiceUnavailableError(
          `${this.serviceName} is currently unavailable (circuit breaker open)`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
  }
}
```

### Retry & Resilience Patterns

```typescript
// Retry Service with Healthcare Context
export class RetryService {
  async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: HealthcareContext,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();

        // Log successful retry
        if (attempt > 1) {
          await this.logRetrySuccess(attempt, context);
        }

        return result;
      } catch (error) {
        lastError = error;

        // Don't retry certain healthcare-specific errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Don't retry on final attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt, config);

        // Log retry attempt
        await this.logRetryAttempt(attempt, error, delay, context);

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // Log final failure
    await this.logRetryFailure(config.maxAttempts, lastError, context);
    throw lastError;
  }

  private isNonRetryableError(error: Error): boolean {
    return (
      error instanceof ValidationError
      || error instanceof AuthorizationError
      || error instanceof LGPDComplianceError
      || error instanceof ProfessionalLicenseError
      || (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500)
    );
  }

  private calculateBackoffDelay(attempt: number, config: RetryConfig): number {
    const baseDelay = config.baseDelayMs;
    const maxDelay = config.maxDelayMs;

    let delay: number;

    switch (config.backoffStrategy) {
      case "exponential":
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      case "linear":
        delay = baseDelay * attempt;
        break;
      case "fixed":
        delay = baseDelay;
        break;
      default:
        delay = baseDelay;
    }

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.min(delay, maxDelay);
  }
}
```

---

## 🗂️ Data Validation & Sanitization Architecture

### Input Validation Framework

```typescript
// Healthcare Data Validator
export class HealthcareValidator {
  private brazilianValidator: BrazilianDocumentValidator;
  private medicalValidator: MedicalDataValidator;
  private lgpdValidator: LGPDComplianceValidator;

  constructor(
    brazilianValidator: BrazilianDocumentValidator,
    medicalValidator: MedicalDataValidator,
    lgpdValidator: LGPDComplianceValidator,
  ) {
    this.brazilianValidator = brazilianValidator;
    this.medicalValidator = medicalValidator;
    this.lgpdValidator = lgpdValidator;
  }

  async validatePatientData(data: PatientData): Promise<ValidationResult> {
    const validations = await Promise.all([
      // Brazilian document validation
      this.brazilianValidator.validateCPF(data.cpf),
      this.brazilianValidator.validateCNS(data.cns),

      // Medical data validation
      this.medicalValidator.validateMedicalHistory(data.medicalHistory),
      this.medicalValidator.validateAllergies(data.allergies),

      // LGPD compliance validation
      this.lgpdValidator.validateConsent(data.consent),
      this.lgpdValidator.validateDataMinimization(data),

      // General data validation
      this.validatePersonalData(data.personalInfo),
      this.validateContactData(data.contactInfo),
    ]);

    return this.aggregateValidationResults(validations);
  }

  async validateProfessionalData(data: ProfessionalData): Promise<ValidationResult> {
    const validations = await Promise.all([
      // Brazilian document validation
      this.brazilianValidator.validateCPF(data.cpf),
      this.brazilianValidator.validateCRM(data.crm, data.state),

      // Professional validation
      this.medicalValidator.validateLicenseNumber(data.licenseNumber),
      this.medicalValidator.validateSpecializations(data.specializations),

      // Professional experience validation
      this.validateProfessionalExperience(data.experience),
      this.validateWorkingHours(data.workingHours),
    ]);

    return this.aggregateValidationResults(validations);
  }

  private async validatePersonalData(data: PersonalData): Promise<FieldValidation[]> {
    return [
      await this.validateField("fullName", data.fullName, {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        message: "Nome deve conter apenas letras e espaços",
      }),

      await this.validateField("email", data.email, {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Email deve ter formato válido",
      }),

      await this.validateField("phone", data.phone, {
        required: true,
        pattern: /^\+55\d{2}9?\d{8}$/,
        message: "Telefone deve estar no formato brasileiro (+5511999999999)",
      }),

      await this.validateField("dateOfBirth", data.dateOfBirth, {
        required: true,
        type: "date",
        maxDate: new Date(),
        minAge: 0,
        maxAge: 120,
        message: "Data de nascimento inválida",
      }),
    ];
  }
}

// Brazilian Document Validator
export class BrazilianDocumentValidator {
  async validateCPF(cpf: string): Promise<ValidationResult> {
    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, "");

    // Basic format validation
    if (cleanCPF.length !== 11) {
      return {
        isValid: false,
        errors: ["CPF deve ter 11 dígitos"],
        field: "cpf",
      };
    }

    // Check for known invalid patterns
    if (/^(\d)\1+$/.test(cleanCPF)) {
      return {
        isValid: false,
        errors: ["CPF inválido - todos os dígitos são iguais"],
        field: "cpf",
      };
    }

    // Validate check digits
    if (!this.validateCPFCheckDigits(cleanCPF)) {
      return {
        isValid: false,
        errors: ["CPF inválido - dígitos verificadores incorretos"],
        field: "cpf",
      };
    }

    return {
      isValid: true,
      errors: [],
      field: "cpf",
      formattedValue: this.formatCPF(cleanCPF),
    };
  }

  async validateCRM(crm: string, state: string): Promise<ValidationResult> {
    // CRM format: numbers followed by state code
    const crmPattern = /^(\d{4,6})([A-Z]{2})$/;
    const match = crm.match(crmPattern);

    if (!match) {
      return {
        isValid: false,
        errors: ["CRM deve estar no formato NNNNNN-UF"],
        field: "crm",
      };
    }

    const [, number, stateCode] = match;

    // Validate state code
    if (stateCode !== state) {
      return {
        isValid: false,
        errors: ["Estado do CRM não confere com o estado informado"],
        field: "crm",
      };
    }

    // Validate CRM number length by state
    const minLength = this.getCRMMinLength(stateCode);
    if (number.length < minLength) {
      return {
        isValid: false,
        errors: [`CRM do estado ${stateCode} deve ter pelo menos ${minLength} dígitos`],
        field: "crm",
      };
    }

    return {
      isValid: true,
      errors: [],
      field: "crm",
      formattedValue: `${number}-${stateCode}`,
    };
  }

  private validateCPFCheckDigits(cpf: string): boolean {
    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cpf.charAt(9)) !== firstDigit) {
      return false;
    }

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf.charAt(10)) === secondDigit;
  }
}
```

### Data Sanitization Service

```typescript
// Data Sanitization for Healthcare
export class DataSanitizer {
  private xssProtection: XSSProtection;
  private sqlInjectionProtection: SQLInjectionProtection;
  private lgpdSanitizer: LGPDSanitizer;

  constructor(
    xssProtection: XSSProtection,
    sqlInjectionProtection: SQLInjectionProtection,
    lgpdSanitizer: LGPDSanitizer,
  ) {
    this.xssProtection = xssProtection;
    this.sqlInjectionProtection = sqlInjectionProtection;
    this.lgpdSanitizer = lgpdSanitizer;
  }

  async sanitizePatientData(data: RawPatientData): Promise<SanitizedPatientData> {
    return {
      personalInfo: await this.sanitizePersonalInfo(data.personalInfo),
      medicalInfo: await this.sanitizeMedicalInfo(data.medicalInfo),
      contactInfo: await this.sanitizeContactInfo(data.contactInfo),
      consent: await this.sanitizeConsentData(data.consent),
    };
  }

  private async sanitizePersonalInfo(data: RawPersonalInfo): Promise<SanitizedPersonalInfo> {
    return {
      fullName: this.sanitizeText(data.fullName, {
        allowHTML: false,
        maxLength: 100,
        trim: true,
        normalizeWhitespace: true,
      }),

      cpf: this.sanitizeCPF(data.cpf),

      dateOfBirth: this.sanitizeDate(data.dateOfBirth),

      gender: this.sanitizeEnum(data.gender, ["M", "F", "O"]),

      mothersName: this.sanitizeText(data.mothersName, {
        allowHTML: false,
        maxLength: 100,
        trim: true,
        normalizeWhitespace: true,
        optional: true,
      }),
    };
  }

  private sanitizeText(text: string, options: TextSanitizationOptions): string {
    if (!text && !options.optional) {
      throw new ValidationError("Campo obrigatório não informado");
    }

    if (!text) {
      return "";
    }

    // Remove HTML if not allowed
    let sanitized = options.allowHTML
      ? this.xssProtection.sanitizeHTML(text)
      : this.stripHTML(text);

    // Trim whitespace
    if (options.trim) {
      sanitized = sanitized.trim();
    }

    // Normalize whitespace
    if (options.normalizeWhitespace) {
      sanitized = sanitized.replace(/\s+/g, " ");
    }

    // Check length
    if (options.maxLength && sanitized.length > options.maxLength) {
      throw new ValidationError(`Texto excede o limite de ${options.maxLength} caracteres`);
    }

    if (options.minLength && sanitized.length < options.minLength) {
      throw new ValidationError(`Texto deve ter pelo menos ${options.minLength} caracteres`);
    }

    return sanitized;
  }

  private sanitizeCPF(cpf: string): string {
    // Remove all non-digits
    return cpf.replace(/[^\d]/g, "");
  }

  private sanitizeDate(date: string): string {
    // Validate and normalize date format to ISO
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationError("Data inválida");
    }
    return parsedDate.toISOString().split("T")[0];
  }
}
```

---

This comprehensive cross-cutting concerns architecture ensures consistent handling of security, logging, error management, and data validation across the entire NeonPro Healthcare Platform, maintaining Brazilian healthcare compliance and LGPD requirements throughout all system interactions.
