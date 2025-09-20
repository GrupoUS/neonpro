---
title: "Sentry API Monitoring & Error Tracking"
description: "Healthcare-compliant error monitoring for NeonPro API with automatic PII redaction"
version: "1.0.0"
last_updated: "2025-09-17"
tags: [monitoring, error-tracking, sentry, healthcare, lgpd, api]
related:
  - ./sentry-monitoring.md
  - ../apis/apis.md
  - ../rules/coding-standards.md
---

# Sentry API Monitoring & Error Tracking

Healthcare-compliant error monitoring system for the NeonPro API with automatic PII/PHI redaction and Brazilian healthcare compliance.

## Overview

The Sentry API integration provides comprehensive error tracking and performance monitoring for the backend API while maintaining strict LGPD compliance and healthcare data protection standards.

### Key Features

- **Healthcare-Compliant Error Tracking**: Automatic redaction of patient data
- **LGPD Compliance**: Full PII sanitization before sending to Sentry
- **Performance Monitoring**: API response times and resource usage
- **Brazilian Healthcare Standards**: CPF, RG, and medical data protection
- **Contextual Error Reporting**: Enriched error context without sensitive data
- **Fallback Logging**: Continues to work even if Sentry is unavailable

## Architecture

```
API Request → Error Tracking Middleware → Sentry Integration → Error Analysis
     ↓                    ↓                        ↓              ↓
Context Extraction → PII Sanitization → Sentry Capture → Healthcare Alerts
```

## Implementation

### 1. Configuration (`apps/api/src/lib/sentry.ts`)

```typescript
// Environment-based initialization
export async function initializeSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  if (!dsn && environment === "production") {
    console.warn("[Sentry API] DSN not configured in production");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new ProfilingIntegration(),
    ],
    beforeSend: sanitizeErrorEvent,
    // Healthcare-specific configuration
  });
}
```

### 2. Error Tracking Service Integration

The error tracking service automatically sends errors to Sentry with sanitized context:

```typescript
// Enhanced error storage with Sentry integration
private async storeError(error: ErrorEvent): Promise<void> {
  // Store locally for compliance
  console.log('📁 Storing error in database:', { /* ... */ });

  // Send to Sentry with sanitized context
  const sentryError = new Error(error.message);
  const sanitizedContext = {
    errorId: error.id,
    healthcareImpact: error.healthcareImpact,
    hasPatientData: error.healthcareImpact.patientSafetyRisk,
  };

  captureException(sentryError, sanitizedContext);
}
```

### 3. Middleware Integration

The error tracking middleware uses Sentry for comprehensive error capture:

```typescript
// Updated import to use Sentry-based error tracker
import { errorTracker } from "../lib/sentry.js";

export function errorTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const context = errorTracker.extractContextFromHono(c);
      errorTracker.captureException(error, context);
      // Handle error response...
    }
  };
}
```

## Data Sanitization

### Automatic PII Redaction

All data is automatically sanitized before sending to Sentry:

#### Brazilian Healthcare Patterns

- **CPF**: `123.456.789-10` → `XXX.XXX.XXX-XX`
- **RG**: `12.345.678-9` → `XX.XXX.XXX-X`
- **Phone**: `(11) 99999-9999` → `(XX) XXXXX-XXXX`
- **Email**: `paciente@email.com` → `xxx@xxx.com`

#### Medical Data Protection

- **Patient IDs**: Completely removed from error reports
- **Medical Records**: Replaced with `[HEALTHCARE_DATA]`
- **Diagnoses**: Automatically redacted
- **Prescriptions**: Sanitized before transmission

#### Request Context Sanitization

- **Authorization Headers**: Completely removed
- **Cookies**: Never sent to Sentry
- **Patient Parameters**: Replaced with `[PATIENT_ID]`
- **IP Addresses**: Masked (e.g., `192.168.1.XXX`)

### Sanitization Functions

```typescript
// String sanitization for Brazilian patterns
function sanitizeString(str?: string): string {
  return str
    ?.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "XXX.XXX.XXX-XX") // CPF
    .replace(/\d{2}\.\d{3}\.\d{3}-\d{1}/g, "XX.XXX.XXX-X") // RG
    .replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, "(XX) XXXXX-XXXX") // Phone
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "xxx@xxx.com"); // Email
}

// Context extraction with sanitization
function extractContextFromHono(c: Context): Record<string, any> {
  return {
    requestId: c.get("requestId") || "unknown",
    method: c.req.method,
    endpoint: sanitizeString(new URL(c.req.url).pathname),
    hasPatientData: !!c.get("patientId"), // Boolean flag only
    clinicId: c.get("clinicId") ? "[CLINIC_ID]" : undefined,
    userId: c.get("userId") ? hashUserId(c.get("userId")) : undefined,
  };
}
```

## Healthcare Error Classification

### Error Categories

- **Patient Safety**: Errors that could affect patient care
- **Data Integrity**: Database or data consistency issues
- **Compliance**: LGPD/ANVISA/CFM regulation violations
- **Authentication**: User authentication failures
- **Authorization**: Access control violations

### Severity Levels

- **Critical**: Patient safety risk or data corruption
- **High**: Workflow disruption or compliance violation
- **Medium**: Performance degradation or minor issues
- **Low**: Informational or debugging errors

### Automatic Classification

```typescript
function assessHealthcareImpact(error: ErrorEvent): HealthcareImpact {
  const impact = { ...error.healthcareImpact };
  const errorText = `${error.message} ${error.source}`.toLowerCase();

  // Patient safety assessment
  const patientSafetyKeywords = [
    "patient",
    "medical",
    "medication",
    "allergy",
    "emergency",
    "diagnosis",
    "treatment",
    "prescription",
    "vital",
    "critical",
  ];

  impact.patientSafetyRisk = patientSafetyKeywords.some((keyword) =>
    errorText.includes(keyword),
  );

  // Automatic severity escalation
  if (impact.patientSafetyRisk) {
    impact.severity = "critical";
    impact.workflowDisruption = "critical";
  }

  return impact;
}
```

## Environment Configuration

### Environment Variables

```bash
# Required for production
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional configuration
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=1.0
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Healthcare-specific settings
SENTRY_HEALTHCARE_MODE=enabled
SENTRY_PII_REDACTION=enabled
SENTRY_PATIENT_DATA_PROTECTION=strict
```

### Development vs Production

**Development Mode**:

- All errors captured for debugging
- Detailed stack traces included
- Local console logging enabled
- Sentry optional (works without DSN)

**Production Mode**:

- Aggressive PII redaction
- Patient data never transmitted
- Critical errors trigger immediate alerts
- Compliance audit logging

## Integration with Error Tracking Service

### Existing Service Enhancement

The implementation enhances the existing robust error tracking service without breaking changes:

```typescript
// Before: Local error tracking only
await this.storeError(sanitizedError);

// After: Local + Sentry integration
await this.storeError(sanitizedError); // Now includes Sentry capture
```

### Backward Compatibility

- All existing error tracking interfaces preserved
- Middleware behavior unchanged for callers
- Fallback to local logging if Sentry unavailable
- No breaking changes to existing error handling

## Monitoring & Alerts

### Critical Error Alerts

```typescript
// Critical healthcare errors trigger immediate Sentry alerts
if (
  healthcareAssessment.severity === "critical" ||
  healthcareAssessment.patientSafetyRisk
) {
  captureMessage(`CRITICAL HEALTHCARE ERROR: ${error.message}`, "fatal", {
    errorId: error.id,
    healthcareImpact: error.healthcareImpact,
    patientSafetyRisk: true,
  });
}
```

### Performance Monitoring

- **API Response Times**: Tracked automatically
- **Database Query Performance**: Monitored for slow queries
- **Memory Usage**: Healthcare data processing optimization
- **Error Rate Thresholds**: Configurable alerts for error spikes

## Compliance & Audit

### LGPD Compliance Features

1. **Data Minimization**: Only essential error data transmitted
2. **Purpose Limitation**: Errors used only for system improvement
3. **Storage Limitation**: Configurable retention periods
4. **Accuracy**: Error data sanitized to prevent inaccuracies
5. **Security**: Encrypted transmission and storage

### Audit Trail

- All error tracking activities logged locally
- Patient data access events recorded
- Compliance violations flagged automatically
- Retention policies enforced

## Usage Examples

### Manual Error Capture

```typescript
import { captureException, captureMessage } from "@/lib/sentry";

// Capture exception with healthcare context
try {
  await processPatientData(patientId);
} catch (error) {
  captureException(error, {
    hasPatientData: true,
    workflow: "patient_data_processing",
    clinicId: "[CLINIC_ID]", // Always sanitized
  });
  throw error;
}

// Capture custom message
captureMessage("Patient workflow completed successfully", "info", {
  workflow: "patient_registration",
});
```

### Context Setting

```typescript
import { setUserContext, addBreadcrumb } from "@/lib/sentry";

// Set user context (sanitized)
setUserContext(userId, clinicId);

// Add breadcrumb for tracking
addBreadcrumb("Patient form validation started", "user_action", {
  formStep: "medical_history",
});
```

## Testing

### Development Testing

```typescript
// Test error capture without Sentry DSN
import { errorTracker } from "@/lib/sentry";

try {
  throw new Error("Test healthcare error");
} catch (error) {
  // Will log locally if no DSN configured
  errorTracker.captureException(error, {
    hasPatientData: false,
    testMode: true,
  });
}
```

### Integration Tests

```typescript
// Verify sanitization works correctly
import { sanitizeErrorEvent } from "@/lib/sentry";

const testEvent = {
  message: "Error processing CPF 123.456.789-10",
  user: { email: "test@example.com" },
};

const sanitized = sanitizeErrorEvent(testEvent);
expect(sanitized.message).toBe("Error processing CPF XXX.XXX.XXX-XX");
expect(sanitized.user.email).toBeUndefined();
```

## Best Practices

### Development Guidelines

1. **Never Log Sensitive Data**: Use sanitization functions
2. **Test Sanitization**: Verify PII redaction in development
3. **Use Structured Context**: Consistent error context structure
4. **Handle Failures Gracefully**: Fallback if Sentry unavailable
5. **Monitor Performance**: Don't impact API response times

### Healthcare-Specific Guidelines

1. **Patient Safety First**: Critical errors get immediate attention
2. **Compliance by Design**: LGPD compliance built into every feature
3. **Data Minimization**: Only collect necessary error context
4. **Audit Everything**: Maintain complete audit trails
5. **Regular Reviews**: Periodic compliance and security reviews

## Troubleshooting

### Common Issues

**Sentry Not Capturing Errors**:

- Check `SENTRY_DSN` environment variable
- Verify network connectivity to Sentry
- Review sanitization functions for over-filtering

**Performance Impact**:

- Adjust sample rates for high-traffic APIs
- Use async error capture to avoid blocking
- Monitor Sentry payload sizes

**Compliance Concerns**:

- Review sanitization logs regularly
- Audit Sentry dashboard for sensitive data
- Update redaction patterns as needed

### Debug Mode

```typescript
// Enable debug logging
process.env.SENTRY_DEBUG = "true";

// Test sanitization
import { sanitizeErrorEvent } from "@/lib/sentry";
console.log(sanitizeErrorEvent(testEvent));
```

## Migration Guide

### From Existing Error Tracking

1. **No Code Changes Required**: Existing error tracking continues to work
2. **Enhanced Functionality**: Automatic Sentry integration added
3. **Configuration Update**: Add Sentry environment variables
4. **Testing**: Verify error capture in development

### Rollback Plan

If issues arise, the system can be rolled back by:

1. Removing Sentry environment variables
2. Error tracking continues with local logging only
3. No data loss or functionality impact

---

## Summary

The Sentry API monitoring implementation provides enterprise-grade error tracking while maintaining the highest standards of healthcare data protection and LGPD compliance. The system enhances existing error tracking capabilities without breaking changes, ensuring a smooth integration with comprehensive patient data protection.

**Key Benefits**:

- ✅ Healthcare-compliant error monitoring
- ✅ Automatic PII/PHI redaction
- ✅ Brazilian regulatory compliance
- ✅ No breaking changes to existing code
- ✅ Comprehensive patient data protection
- ✅ Real-time error alerting for patient safety
