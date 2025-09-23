/**
 * Healthcare-specific error types and handling patterns
 * Provides specialized error classes for LGPD, CFM, and ANVISA compliance scenarios
 */

// Base healthcare error class
export abstract class HealthcareError extends Error {
  public readonly errorCode: string;
  public readonly complianceFramework: "LGPD" | "CFM" | "ANVISA" | "GENERAL";
  public readonly severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  public readonly auditData: Record<string, any>;
  public readonly timestamp: string;
  public readonly operationContext?: string;

  constructor(
    message: string,
    errorCode: string,
    complianceFramework: "LGPD" | "CFM" | "ANVISA" | "GENERAL",
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    auditData: Record<string, any> = {},
    operationContext?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.complianceFramework = complianceFramework;
    this.severity = severity;
    this.auditData = {
      ...auditData,
      _userId: auditData.userId || "unknown",
      clinicId: auditData.clinicId || "unknown",
      ipAddress: auditData.ipAddress || "unknown",
    };
    this.timestamp = new Date().toISOString();
    this.operationContext = operationContext;
  }

  toAuditLog(): Record<string, any> {
    return {
      errorType: this.name,
      errorCode: this.errorCode,
      message: this.message,
      complianceFramework: this.complianceFramework,
      severity: this.severity,
      timestamp: this.timestamp,
      operationContext: this.operationContext,
      auditData: this.auditData,
      stack: this.stack,
    };
  }
}

// General healthcare error (concrete implementation)
export class GeneralHealthcareError extends HealthcareError {
  constructor(
    message: string,
    errorCode: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM",
    auditData: Record<string, any> = {},
    operationContext?: string,
  ) {
    super(message, errorCode, "GENERAL", severity, auditData, operationContext);
  }
}

// LGPD-specific errors
export class LGPDComplianceError extends HealthcareError {
  constructor(
    message: string,
    errorCode: string,
    auditData: Record<string, any> = {},
    operationContext?: string,
  ) {
    super(message, errorCode, "LGPD", "HIGH", auditData, operationContext);
  }
}

// Error handler utility functions
export class HealthcareErrorHandler {
  static handleError(
    error: unknown,
    _context: Record<string, any> = {},
  ): HealthcareError {
    if (error instanceof HealthcareError) {
      return error;
    }

    if (error instanceof Error) {
      return new GeneralHealthcareError(
        error.message,
        "UNKNOWN_HEALTHCARE_ERROR",
        "MEDIUM",
        _context,
        "Unknown operation",
      );
    }

    return new GeneralHealthcareError(
      "An unknown error occurred",
      "UNKNOWN_ERROR",
      "LOW",
      _context,
      "Unknown operation",
    );
  }

  static createErrorResponse(error: HealthcareError): {
    success: false;
    error: {
      code: string;
      message: string;
      complianceFramework: string;
      severity: string;
      timestamp: string;
      operationContext?: string;
    };
  } {
    return {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        complianceFramework: error.complianceFramework,
        severity: error.severity,
        timestamp: error.timestamp,
        operationContext: error.operationContext,
      },
    };
  }
}
