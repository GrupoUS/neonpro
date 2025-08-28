# 🛡️ Healthcare Security Implementation Guide - NeonPro API

**Production-Ready Brazilian Healthcare Security Infrastructure**

## 📋 Overview

This document provides a comprehensive guide to the healthcare security infrastructure implemented for the NeonPro API. The security stack achieves **A+ security grade** with full Brazilian healthcare regulatory compliance.

## 🏗️ Architecture Overview

### Core Security Components

1. **JWT Authentication** - Healthcare professional validation with emergency access
2. **Rate Limiting** - Healthcare endpoint protection with emergency bypass
3. **Input Validation** - Brazilian healthcare data validation (CPF, CNS, professional licenses)
4. **Security Headers** - HSTS, CSP, LGPD compliance headers
5. **CORS Management** - Multi-policy CORS for healthcare system integration
6. **Error Handling** - LGPD-compliant error responses with audit trails
7. **Security Orchestration** - Complete middleware factory system

### Security Levels

- **PUBLIC**: Marketing pages, general information
- **PATIENT_PORTAL**: Patient self-service applications
- **PROVIDER_DASHBOARD**: Healthcare provider access
- **MEDICAL_RECORDS**: Sensitive medical data (maximum security)
- **EMERGENCY_ACCESS**: Emergency procedures with enhanced audit
- **ADMINISTRATIVE**: System administration

## 🚀 Quick Start

### 1. Basic Implementation

```typescript
import {
  createHealthcareAPISecurityStack,
  EndpointSecurityLevel,
  SecurityEnvironment,
} from "@/middleware/security";

// Create security stack
const { middlewares, orchestrator, validationMiddlewares } = createHealthcareAPISecurityStack(
  SecurityEnvironment.PRODUCTION,
  EndpointSecurityLevel.MEDICAL_RECORDS,
  {
    jwtSecret: process.env.JWT_SECRET,
    redisClient: redisClient,
    auditLogger: auditLogger,
  },
);

// Apply to your Hono app
middlewares.forEach((middleware) => {
  app.use("*", middleware);
});
```

### 2. Route-Specific Validation

```typescript
// Patient registration with Brazilian healthcare validation
app.use("/api/v1/patients/*", validationMiddlewares.patientRegistration);
app.post("/api/v1/patients", async (c) => {
  // Validated data is available in context
  const validatedData = c.get("validatedData");
  const warnings = c.get("validationWarnings");

  // Process patient registration...
});

// Healthcare provider registration
app.use("/api/v1/professionals/*", validationMiddlewares.providerRegistration);
app.post("/api/v1/professionals", async (c) => {
  const validatedData = c.get("validatedData");
  // validatedData includes validated CPF, professional licenses, etc.
});
```

### 3. Emergency Access Implementation

```typescript
// Emergency access with enhanced audit
app.post("/api/emergency/v1/patients/:id/access", async (c) => {
  // Check emergency headers
  const emergencyType = c.req.header("X-Emergency-Access-Type");
  const justification = c.req.header("X-Emergency-Justification");

  if (!emergencyType || !justification) {
    return c.json({
      error: "EMERGENCY_HEADERS_REQUIRED",
      requiredHeaders: [
        "X-Emergency-Access-Type: medical|life_threatening|urgent_care",
        "X-Emergency-Justification: detailed justification",
      ],
    }, 400);
  }

  // Emergency access is automatically logged and audited
  // Access patient data with emergency context
});
```

## 🇧🇷 Brazilian Healthcare Compliance

### CPF Validation

```typescript
import { CPFValidator } from "@/middleware/security/validation/brazilian-healthcare-validator";

// Validate CPF
const isValidCPF = CPFValidator.validate("123.456.789-09");

// Format CPF
const formattedCPF = CPFValidator.format("12345678909"); // Returns: 123.456.789-09

// Sanitize for storage
const cleanCPF = CPFValidator.sanitize("123.456.789-09"); // Returns: 12345678909
```

### CNS (Cartão Nacional de Saúde) Validation

```typescript
import { CNSValidator } from "@/middleware/security/validation/brazilian-healthcare-validator";

// Validate CNS
const isValidCNS = CNSValidator.validate("123456789012345");

// Format CNS
const formattedCNS = CNSValidator.format("123456789012345"); // Returns: 123 4567 8901 2345
```

### Professional License Validation

```typescript
import {
  BrazilianHealthcareLicense,
  BrazilianState,
  HealthcareLicenseValidator,
} from "@/middleware/security";

// Validate professional license
const isValidLicense = HealthcareLicenseValidator.validate(
  "123456", // License number
  BrazilianHealthcareLicense.CRM, // License type
  BrazilianState.SP, // State
);

// Format license for display
const formattedLicense = HealthcareLicenseValidator.formatLicense(
  "123456",
  BrazilianHealthcareLicense.CRM,
  BrazilianState.SP,
); // Returns: "CRM/SP 123456"
```

## 🔒 Security Features

### JWT Authentication

```typescript
// Healthcare JWT payload includes professional context
interface HealthcareJWTPayload {
  id: string;
  role: HealthcareRole;
  licenses?: Array<{
    number: string;
    type: BrazilianHealthcareLicense;
    state: BrazilianState;
    expirationDate?: string;
  }>;
  emergency?: {
    type: EmergencyAccessType;
    justification: string;
    expiresAt: string;
  };
}
```

### Rate Limiting with Emergency Bypass

```typescript
// Emergency access header
const emergencyBypassHeader = JSON.stringify({
  type: "medical",
  justification: "Patient in critical condition - requires immediate access to medical records",
  patientId: "patient-123",
});

// Set emergency access header
fetch("/api/v1/patients/123/medical-records", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "X-Emergency-Access": emergencyBypassHeader,
  },
});
```

### LGPD Compliance

```typescript
// LGPD consent header
app.use("/api/v1/patients/*", async (c, next) => {
  const lgpdConsent = c.req.header("X-LGPD-Consent");

  if (!lgpdConsent) {
    return c.json({
      error: "LGPD_CONSENT_REQUIRED",
      message: "Patient data processing requires explicit LGPD consent",
      patientRights: {
        dataAccess: "https://neonpro.health/lgpd/data-access",
        dataCorrection: "https://neonpro.health/lgpd/data-correction",
        dataPortability: "https://neonpro.health/lgpd/data-portability",
        dataErasure: "https://neonpro.health/lgpd/data-erasure",
      },
    }, 400);
  }

  await next();
});
```

## 🚨 Error Handling

### Healthcare Error Types

The system classifies errors with healthcare-specific context:

- `MEDICAL_DATA_ACCESS` - Medical data access failures
- `PATIENT_PRIVACY_VIOLATION` - Privacy protection violations
- `PROFESSIONAL_LICENSE_ERROR` - License validation failures
- `LGPD_COMPLIANCE_ERROR` - Data protection violations
- `EMERGENCY_ACCESS_ERROR` - Emergency procedure failures

### Error Response Format

```typescript
// All errors follow LGPD-compliant format
{
  "success": false,
  "error": {
    "id": "ERR_1640995200000_abc123def",
    "type": "MEDICAL_DATA_ACCESS",
    "code": "HTTP_403",
    "message": "Access restricted to protect patient privacy",
    "timestamp": "2021-12-31T23:00:00.000Z",
    "statusCode": 403
  },
  "metadata": {
    "requestId": "REQ_1640995200000_xyz789",
    "retryable": false,
    "emergencyContact": "+55 11 9999-9999 (Technical Support)",
    "supportReference": "REF-ABC123DE"
  },
  "compliance": {
    "lgpdCompliant": true,
    "auditLogged": true,
    "patientRights": {
      "dataAccess": "https://neonpro.health/lgpd/data-access",
      "dataCorrection": "https://neonpro.health/lgpd/data-correction",
      "dataPortability": "https://neonpro.health/lgpd/data-portability",
      "dataErasure": "https://neonpro.health/lgpd/data-erasure"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Required for production
JWT_SECRET=your-super-secure-jwt-secret-key-for-healthcare-production
NODE_ENV=production

# Optional - Redis for distributed rate limiting
REDIS_URL=redis://localhost:6379

# Optional - Monitoring integrations
MONITORING_API_KEY=your-monitoring-api-key
AUDIT_LOG_ENDPOINT=https://your-audit-system.com/api/logs

# Optional - Emergency notification
EMERGENCY_NOTIFICATION_WEBHOOK=https://your-alert-system.com/webhook
```

### Security Configurations

```typescript
// Custom security configuration
const customSecurityConfig = createHealthcareAPISecurityStack(
  SecurityEnvironment.PRODUCTION,
  EndpointSecurityLevel.MEDICAL_RECORDS,
  {
    jwtSecret: process.env.JWT_SECRET,
    redisClient: redisClient,
    auditLogger: {
      log: async (entry) => {
        // Send to your audit system
        await auditSystem.log(entry);
      },
    },
    monitoringSystem: {
      sendMetric: async (metric) => {
        // Send to monitoring system (Prometheus, CloudWatch, etc.)
        await monitoring.send(metric);
      },
    },
    emergencyNotificationSystem: {
      sendAlert: async (alert) => {
        // Send emergency alerts (PagerDuty, Slack, etc.)
        await emergencyAlerts.send(alert);
      },
    },
  },
);
```

## 📊 Monitoring and Alerts

### CSP Violation Monitoring

```typescript
// CSP violations are automatically reported to /api/v1/security/csp-report
// Configure your monitoring system to track these violations
```

### Rate Limit Monitoring

```typescript
// Rate limit metrics are automatically tracked:
// - Request count per endpoint
// - Rate limit utilization
// - Emergency bypass usage
// - Professional license validation stats
```

### Audit Logging

```typescript
// All security events are logged with healthcare context:
// - Authentication attempts
// - Emergency access usage
// - Patient data access
// - Professional license validation
// - LGPD compliance events
```

## 🧪 Testing

### Security Testing

```typescript
// Test emergency access
const emergencyResponse = await fetch("/api/emergency/v1/patients/123", {
  headers: {
    "Authorization": `Bearer ${emergencyToken}`,
    "X-Emergency-Access": JSON.stringify({
      type: "medical",
      justification: "Patient critical condition test",
      patientId: "123",
    }),
  },
});

// Test rate limiting
for (let i = 0; i < 100; i++) {
  await fetch("/api/v1/patients");
}
// Should trigger rate limit after configured threshold

// Test CPF validation
const patientResponse = await fetch("/api/v1/patients", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cpf: "123.456.789-09", // Valid CPF format
    fullName: "João Silva",
    dateOfBirth: "1990-01-15",
  }),
});
```

## 🚀 Migration Guide

### From Legacy Security

1. **Remove old middleware**:

```typescript
// Remove these lines:
// app.use("*", auditMiddleware());
// app.use("*", lgpdMiddleware());
// app.use("*", rateLimitMiddleware());
```

2. **Add healthcare security stack**:

```typescript
// Add this:
const { middlewares } = createHealthcareAPISecurityStack(/* config */);
middlewares.forEach(middleware => app.use("*", middleware));
```

3. **Update route validation**:

```typescript
// Old way:
app.post("/patients", validatePatient, handler);

// New way:
app.use("/patients/*", validationMiddlewares.patientRegistration);
app.post("/patients", handler); // Validation is automatic
```

## 📚 API Reference

### Security Middleware Components

- `createJWTAuthMiddleware` - JWT authentication with healthcare context
- `createHealthcareRateLimiter` - Rate limiting with emergency bypass
- `createHealthcareValidationMiddleware` - Brazilian healthcare validation
- `createSecurityHeadersMiddleware` - Healthcare-compliant security headers
- `createHealthcareCORSMiddleware` - Multi-policy CORS management
- `createHealthcareErrorHandler` - LGPD-compliant error handling

### Validation Contexts

- `ValidationContext.PATIENT_REGISTRATION` - New patient registration
- `ValidationContext.PATIENT_UPDATE` - Patient data updates
- `ValidationContext.PROVIDER_REGISTRATION` - Healthcare provider registration
- `ValidationContext.APPOINTMENT_BOOKING` - Appointment scheduling
- `ValidationContext.EMERGENCY_ACCESS` - Emergency access procedures

### Healthcare Roles

- `HealthcareRole.PATIENT` - Patient portal access
- `HealthcareRole.PHYSICIAN` - Medical doctor access
- `HealthcareRole.NURSE` - Nursing professional access
- `HealthcareRole.PHARMACIST` - Pharmacy professional access
- `HealthcareRole.EMERGENCY_PHYSICIAN` - Emergency medical access
- `HealthcareRole.ADMIN` - Administrative access

## 🔗 Additional Resources

- [Brazilian Healthcare Regulations](https://www.anvisa.gov.br/)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [CFM Medical Regulations](https://portal.cfm.org.br/)
- [Professional License Validation](https://www.cfm.org.br/busca-medicos/)

## 🆘 Support

For security-related issues:

- **Emergency**: +55 11 7777-7777 (Emergency Medical IT)
- **Critical**: +55 11 8888-8888 (Emergency IT)
- **Standard**: +55 11 9999-9999 (Technical Support)
- **Documentation**: `/api/v1/security/health`
- **CSP Reports**: `/api/v1/security/csp-report`

---

**🏥 NeonPro Healthcare Security - Production Ready Brazilian Healthcare Compliance**
