# Sentry Error Tracking Integration

## Overview

This document describes the implementation of Sentry error tracking integration for the NeonPro healthcare platform, providing comprehensive error monitoring, healthcare-specific error classification, and LGPD-compliant data sanitization.

## Architecture

### Core Components

1. **Sentry Initialization** (`src/lib/sentry.ts`)
   - Healthcare-specific Sentry configuration
   - LGPD-compliant data sanitization
   - Custom error context extraction

2. **Error Tracking Middleware** (`src/middleware/error-tracking.ts`)
   - Automatic error capture and classification
   - Healthcare-specific error types
   - Sensitive data redaction
   - Request context extraction

3. **Healthcare Error Classes**
   - `HealthcareError`: Base class for healthcare-specific errors
   - `PatientDataAccessError`: Patient data access violations
   - `LGPDComplianceError`: LGPD compliance violations
   - `MedicalDataValidationError`: Medical data validation errors

## Key Features

### Healthcare-Specific Error Classification

```typescript
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  DATABASE = "database",
  EXTERNAL_SERVICE = "external_service",
  CONFIGURATION = "configuration",
  HEALTHCARE_COMPLIANCE = "healthcare_compliance",
  PATIENT_DATA = "patient_data",
  SYSTEM = "system",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
```

### LGPD-Compliant Data Sanitization

The system automatically redacts sensitive data patterns:

- **Brazilian Documents**: CPF, RG, CNPJ
- **Healthcare Identifiers**: SUS card, CRM, CRO
- **Contact Information**: Email, phone numbers
- **Medical Codes**: CID-10, TUSS procedures

### Error Context Extraction

Automatically captures healthcare-relevant context:

```typescript
interface HealthcareApiErrorContext {
  clinicId?: string;
  route: string;
  method: string;
  status: number;
  requestId: string;
  hasPatientData: boolean;
  durationMs: number;
  feature?: string;
}
```

## Usage

### Basic Error Handling

```typescript
import { errorTrackingMiddleware } from "./middleware/error-tracking";

const app = new Hono();
app.use("*", errorTrackingMiddleware());
```

### Custom Healthcare Errors

```typescript
import {
  HealthcareError,
  ErrorCategory,
  ErrorSeverity,
} from "./middleware/error-tracking";

throw new HealthcareError(
  "Patient data access denied",
  ErrorCategory.PATIENT_DATA,
  ErrorSeverity.HIGH,
  403,
  {
    isPatientDataInvolved: true,
    complianceImpact: true,
    metadata: { patientId: "redacted" },
  },
);
```

### Manual Error Capture

```typescript
import { captureHealthcareApiError } from "./lib/sentry";

captureHealthcareApiError(error, {
  route: "/api/patients",
  method: "GET",
  status: 500,
  requestId: "req-123",
  hasPatientData: true,
  durationMs: 150,
  feature: "patient-search",
  clinicId: "clinic-456",
});
```

## Configuration

### Environment Variables

```bash
# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Healthcare Compliance
HEALTHCARE_COMPLIANCE_LEVEL=maximum
LGPD_COMPLIANT=true
```

### Sentry Initialization

```typescript
import { initializeSentry } from "./lib/sentry";

// Initialize Sentry with healthcare-specific configuration
initializeSentry();
```

## Error Response Format

The middleware returns standardized error responses:

```json
{
  "error": {
    "message": "Patient data access denied",
    "category": "patient_data",
    "severity": "high",
    "code": "PATIENT_ACCESS_DENIED",
    "requestId": "req-123",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "context": {
    "route": "/api/patients/123",
    "method": "GET",
    "hasPatientData": true,
    "complianceImpact": true
  }
}
```

## Security & Compliance

### Data Sanitization

- Automatic redaction of sensitive patterns
- Field-level sanitization for known sensitive fields
- URL parameter sanitization
- Request/response body sanitization

### LGPD Compliance

- No sensitive data sent to Sentry
- Audit trail for error events
- Data retention policies
- Patient data protection flags

### Healthcare Compliance

- Medical data classification
- Compliance impact assessment
- Healthcare-specific error categories
- Professional license validation

## Testing

The implementation includes comprehensive testing:

```bash
# Test error tracking components
bun -e "
import { initializeSentry } from './src/lib/sentry.ts';
import { errorTrackingMiddleware } from './src/middleware/error-tracking.ts';
// Test implementation...
"
```

## Monitoring & Alerts

### Key Metrics

- Error rate by category
- Patient data access errors
- Compliance violations
- Response time impact
- Error severity distribution

### Alert Conditions

- Critical healthcare errors
- Patient data access violations
- LGPD compliance breaches
- High error rates (>5%)
- System-level failures

## Best Practices

1. **Use Healthcare Error Classes**: Always use specific healthcare error classes for better categorization
2. **Include Context**: Provide relevant healthcare context (clinic, patient data involvement)
3. **Sanitize Data**: Never log sensitive patient information
4. **Monitor Compliance**: Track compliance-related errors separately
5. **Test Error Paths**: Regularly test error handling scenarios

## Troubleshooting

### Common Issues

1. **Sentry Not Initialized**: Ensure `SENTRY_DSN` is configured
2. **Missing Context**: Verify middleware is properly registered
3. **Data Leakage**: Check sanitization patterns are comprehensive
4. **Performance Impact**: Monitor error handling overhead

### Debug Mode

```typescript
// Enable debug logging
process.env.SENTRY_DEBUG = "true";
```

## Related Documentation

- [Healthcare Compliance Guidelines](./healthcare-compliance.md)
- [LGPD Implementation](./lgpd-compliance.md)
- [API Error Handling](../apis/error-handling.md)
- [Security Best Practices](../security/best-practices.md)

## Last Updated

January 2024 - Initial implementation with healthcare-specific error tracking and LGPD compliance.
