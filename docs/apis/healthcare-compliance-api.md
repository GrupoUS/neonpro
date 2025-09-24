---
title: "Healthcare Compliance API"
last_updated: 2025-09-24
form: reference
tags: [compliance, anvisa, cfm, lgpd, healthcare]
priority: CRITICAL
related:
  - ./AGENTS.md
  - ./core-api.md
---

# Healthcare Compliance API — Critical Endpoints

## ANVISA Compliance

### Device Registration

```bash
POST /api/compliance/anvisa/validate    # Validate ANVISA compliance
GET  /api/compliance/anvisa/report      # Get compliance report
POST /api/compliance/anvisa/register    # Register medical device
```

### Implementation

```typescript
interface ANVISAComplianceReport {
  overallCompliance: 'compliant' | 'partial' | 'non_compliant';
  deviceClass: 'class_i' | 'class_ii' | 'class_iii' | 'class_iv';
  accessibilityCompliance: boolean;
  terminologyCompliance: boolean;
  workflowCompliance: boolean;
  registrationStatus: 'required' | 'approved' | 'pending';
}
```

## CFM Compliance

### Medical Professional Validation

```bash
GET  /api/compliance/cfm/professional/:crm  # Validate CRM
POST /api/compliance/cfm/telemedicine      # Telemedicine authorization
GET  /api/compliance/cfm/specialties       # Validated specialties
```

## LGPD Data Protection

### Consent Management

```bash
POST /api/lgpd/consent              # Record patient consent
GET  /api/lgpd/consent/:patientId   # Get consent status
DELETE /api/lgpd/data/:patientId    # Right to erasure
POST /api/lgpd/audit                # Audit data access
```

### Data Masking

```bash
POST /api/lgpd/mask                 # Mask sensitive data
GET  /api/lgpd/retention-policy     # Data retention rules
POST /api/lgpd/anonymize            # Anonymize patient data
```

## Brazilian Tax Compliance

### Healthcare Billing

```bash
POST /api/compliance/taxes/calculate    # Calculate healthcare taxes
GET  /api/compliance/taxes/cbhpm        # CBHPM procedure codes
POST /api/compliance/taxes/nfse         # Generate service invoice
```

## Usage Example

```typescript
// Validate ANVISA compliance
const compliance = await fetch('/api/compliance/anvisa/validate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    deviceClass: 'class_ii',
    softwareCategory: 'patient_management',
  }),
});

// Check LGPD consent
const consent = await fetch(`/api/lgpd/consent/${patientId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Compliance Requirements

### ANVISA

- Medical device registration for Class II software
- Accessibility compliance (WCAG 2.1 AA)
- Clinical workflow validation
- Post-market surveillance

### CFM

- Medical professional CRM validation
- Telemedicine license verification
- Specialty authorization
- Clinical decision support compliance

### LGPD

- Explicit patient consent
- Data minimization
- Right to erasure
- Audit logging
- Data retention policies

## See Also

- [API Control Hub](./AGENTS.md)
- [Core API Reference](./core-api.md)
- [Billing API](./billing-api.md)
