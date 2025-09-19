# Compliance & Audit Module (Phase 4)

This module provides generic action/actor audit logging with healthcare compliance validation, complementing the existing domain-specific `AuditService`.

## Overview

The Compliance & Audit Module introduces a generic audit framework that:

- **Complements existing infrastructure** - Works alongside the existing `AuditService` for WebRTC/telemedicine
- **Provides generic action/actor pattern** - Standard audit event structure for any system action  
- **Enforces healthcare compliance** - Validates against LGPD, ANVISA, and CFM frameworks
- **Tracks consent references** - Links audit events to consent for healthcare compliance
- **Centralized compliance policies** - Unified validation logic across frameworks

## Key Components

### Types (`types.ts`)

**Core Types:**
- `GenericAuditEvent` - Standard audit event with action/actor/resource/consent
- `ConsentReference` - Healthcare consent tracking with framework-specific validation
- `ComplianceViolation` - Standardized violation reporting with remediation guidance
- `ComplianceReport` - Comprehensive compliance reporting with metrics

**Enums:**
- `AuditAction` - Standard actions (CREATE, READ, UPDATE, DELETE, PRESCRIBE, DIAGNOSE, etc.)
- `ActorType` - Who performed the action (PATIENT, DOCTOR, NURSE, ADMIN, SYSTEM, etc.)
- `ComplianceFramework` - Supported frameworks (LGPD, ANVISA, CFM, HIPAA, GDPR)
- `RiskLevel` - Risk assessment (LOW, MEDIUM, HIGH, CRITICAL)
- `ComplianceStatus` - Compliance state (COMPLIANT, NON_COMPLIANT, PENDING_REVIEW, UNKNOWN)

### Validators (`validators.ts`)

**Framework-Specific Validators:**
- `LGPDValidator` - Brazilian data protection law compliance
- `ANVISAValidator` - Brazilian health surveillance compliance  
- `CFMValidator` - Brazilian medical council compliance

**Main Validator:**
- `ComplianceValidator` - Orchestrates all framework validations

### Service (`compliance-audit-service.ts`)

**Core Service:**
- `ComplianceAuditService` - Main audit logging service with in-memory storage
- Automatic compliance validation
- Event search and filtering
- Compliance reporting
- Memory management

## Usage Examples

### Basic Event Logging

```typescript
import { ComplianceAuditService } from '@neonpro/core-services';

const auditService = new ComplianceAuditService({
  autoValidate: true,
  defaultFrameworks: ['LGPD', 'ANVISA', 'CFM']
});

// Log a data access event
const event = await auditService.logEvent({
  action: 'READ',
  actor: { id: 'doctor-123', type: 'DOCTOR', name: 'Dr. Silva' },
  resource: { type: 'patient_record', id: 'patient-456' },
  clinicId: 'clinic-789',
  consentRef: {
    id: 'consent-123',
    type: 'data_processing',
    grantedAt: new Date().toISOString(),
    status: 'ACTIVE',
    framework: 'LGPD'
  }
});

console.log(event.complianceStatus); // 'COMPLIANT'
```

### Healthcare-Specific Logging

```typescript
// Log medical prescription
await auditService.logMedicalAction({
  action: 'PRESCRIBE',
  doctorId: 'doctor-123',
  patientId: 'patient-456',
  resourceId: 'prescription-789',
  clinicId: 'clinic-123',
  consentRef: {
    id: 'consent-treatment',
    type: 'treatment',
    grantedAt: new Date().toISOString(),
    status: 'ACTIVE',
    framework: 'CFM'
  },
  metadata: {
    doctorName: 'Dr. Silva',
    doctorEmail: 'dr.silva@clinic.com',
    prescriptionId: 'rx-789',
    telemedicineAuthorized: true
  }
});

// Log consent management
await auditService.logConsentGrant({
  patientId: 'patient-123',
  consentRef: {
    id: 'consent-456',
    type: 'telemedicine',
    grantedAt: new Date().toISOString(),
    status: 'ACTIVE',
    framework: 'CFM'
  },
  clinicId: 'clinic-456'
});
```

### Compliance Reporting

```typescript
// Generate compliance report
const report = await auditService.generateComplianceReport(
  'clinic-123',
  '2024-01-01T00:00:00.000Z',
  '2024-01-31T23:59:59.999Z',
  ['LGPD', 'ANVISA', 'CFM']
);

console.log(`Compliance Score: ${report.complianceScore}%`);
console.log(`Total Events: ${report.totalEvents}`);
console.log(`Violations Found: ${report.violations.length}`);

// Display violations
report.violations.forEach(violation => {
  console.log(`${violation.framework} ${violation.severity}: ${violation.description}`);
  if (violation.remediation) {
    console.log(`Remediation: ${violation.remediation}`);
  }
});
```

### Event Search and Filtering

```typescript
// Search for high-risk events
const highRiskEvents = await auditService.searchEvents('clinic-123', {
  riskLevel: 'HIGH',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-31T23:59:59.999Z'
});

// Search by actor
const doctorActions = await auditService.searchEvents('clinic-123', {
  actorType: 'DOCTOR',
  action: 'PRESCRIBE'
});

// Search by session
const sessionEvents = auditService.getSessionEvents('session-123', 'clinic-123');
```

## Compliance Framework Details

### LGPD (Lei Geral de Proteção de Dados)

**Requirements:**
- Explicit consent for data processing
- Valid consent status (ACTIVE, not EXPIRED)
- Consent must match framework type

**Violations:**
- Missing consent reference
- Inactive/expired consent
- Processing without legal basis

### ANVISA (Agência Nacional de Vigilância Sanitária)

**Requirements:**
- Medical actions performed only by authorized professionals
- Complete professional identification (name, email, license)
- Tracking of controlled substances

**Violations:**
- Unauthorized medical actions
- Incomplete professional identification
- Missing tracking information

### CFM (Conselho Federal de Medicina)

**Requirements:**
- Telemedicine authorization for remote diagnosis
- Explicit patient consent for telemedicine
- Prescription documentation completeness
- Doctor-only prescription authority

**Violations:**
- Unauthorized telemedicine practice
- Missing telemedicine consent
- Incomplete prescription documentation
- Non-doctor prescriptions

## Integration with Existing Infrastructure

### Complementary to AuditService

```typescript
import { AuditService } from '@neonpro/database';
import { ComplianceAuditService } from '@neonpro/core-services';

// Use existing AuditService for domain-specific logging
const auditService = new AuditService(supabaseClient);
await auditService.logSessionStart(sessionId, doctorId, patientId, clinicId);

// Use ComplianceAuditService for generic compliance tracking
const complianceService = new ComplianceAuditService();
await complianceService.logDataAccess({
  actorId: doctorId,
  actorType: 'DOCTOR',
  resourceType: 'session_data',
  resourceId: sessionId,
  clinicId,
  consentRef: {
    id: 'consent-session',
    type: 'telemedicine',
    grantedAt: new Date().toISOString(),
    status: 'ACTIVE',
    framework: 'CFM'
  }
});
```

### With Existing Types

The module is designed to work with existing type infrastructure:

```typescript
import type { MedicalDataClassification } from '@neonpro/types';
import { ComplianceAuditService, type AuditAction } from '@neonpro/core-services';

// Map existing classifications to audit actions
const mapToAuditAction = (operation: string): AuditAction => {
  switch (operation) {
    case 'view': return 'READ';
    case 'edit': return 'UPDATE';
    case 'create': return 'CREATE';
    case 'remove': return 'DELETE';
    default: return 'ACCESS';
  }
};
```

## Configuration Options

```typescript
const auditService = new ComplianceAuditService({
  // Which frameworks to apply by default
  defaultFrameworks: ['LGPD', 'ANVISA', 'CFM'],
  
  // Auto-validate events on creation
  autoValidate: true,
  
  // Store events in database (Phase 4: in-memory only)
  persistEvents: false,
  
  // Maximum events to keep in memory
  maxMemoryEvents: 1000
});
```

## Testing

Comprehensive test suites cover:

- **Basic event logging** - Core functionality validation
- **Framework-specific validation** - Each compliance framework
- **Healthcare scenarios** - Medical actions, consent management
- **Search and filtering** - Event querying capabilities
- **Compliance reporting** - Report generation and metrics
- **Memory management** - Event cleanup and limits
- **Error handling** - Invalid data and edge cases

Run tests:
```bash
pnpm --filter @neonpro/core-services test src/audit
```

## Future Enhancements (Post-Phase 4)

1. **Database Persistence** - Store events in audit_logs table
2. **Real-time Notifications** - Alert on compliance violations
3. **Integration APIs** - REST/GraphQL endpoints for reporting
4. **Advanced Analytics** - Compliance trends and predictions
5. **Additional Frameworks** - HIPAA, GDPR, local regulations
6. **Automated Remediation** - Self-healing compliance violations