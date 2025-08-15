# 🔐 NeonPro Security Guide

## Security Overview

NeonPro implements a comprehensive security framework designed specifically for healthcare applications, ensuring compliance with LGPD, ANVISA, and CFM requirements while maintaining the highest standards of patient data protection.

## Authentication & Authorization

### Multi-Factor Authentication (MFA)

```typescript
// Required for all administrative access
const mfaConfig = {
  factors: ['password', 'totp', 'backup_codes'],
  gracePeriod: 0, // No grace period for healthcare
  required: ['admin', 'doctor', 'nurse'],
  optional: ['patient', 'receptionist'],
};
```

### Role-Based Access Control (RBAC)

```typescript
const roles = {
  admin: {
    permissions: ['*'],
    mfaRequired: true,
    sessionTimeout: '4h',
  },
  doctor: {
    permissions: [
      'patient:read',
      'patient:write',
      'treatment:read',
      'treatment:write',
      'prescription:read',
      'prescription:write',
    ],
    mfaRequired: true,
    sessionTimeout: '8h',
  },
  nurse: {
    permissions: [
      'patient:read',
      'patient:write',
      'treatment:read',
      'schedule:read',
      'schedule:write',
    ],
    mfaRequired: false,
    sessionTimeout: '8h',
  },
  receptionist: {
    permissions: [
      'patient:read',
      'patient:write',
      'schedule:read',
      'schedule:write',
      'billing:read',
      'billing:write',
    ],
    mfaRequired: false,
    sessionTimeout: '8h',
  },
  patient: {
    permissions: [
      'patient:read:own',
      'appointment:read:own',
      'treatment:read:own',
    ],
    mfaRequired: false,
    sessionTimeout: '24h',
  },
};
```

### Session Management

```typescript
const sessionConfig = {
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 28800000, // 8 hours
  },
  refreshToken: {
    rotation: true,
    reuseInterval: 0,
    inactivityTimeout: 3600000, // 1 hour
  },
  concurrentSessions: {
    admin: 2,
    doctor: 3,
    nurse: 2,
    receptionist: 2,
    patient: 1,
  },
};
```

## Data Protection & Encryption

### Encryption Standards

- **At Rest**: AES-256-GCM for sensitive data
- **In Transit**: TLS 1.3 minimum
- **Field Level**: Selective encryption for PII/PHI
- **Key Management**: AWS KMS or HashiCorp Vault

### Sensitive Data Classification

```typescript
enum DataClassification {
  PUBLIC = 'public', // Marketing materials
  INTERNAL = 'internal', // Internal documentation
  CONFIDENTIAL = 'confidential', // Business data
  RESTRICTED = 'restricted', // Financial data
  PHI = 'phi', // Patient Health Information
}

const encryptionMapping = {
  [DataClassification.PUBLIC]: null,
  [DataClassification.INTERNAL]: null,
  [DataClassification.CONFIDENTIAL]: 'AES-128',
  [DataClassification.RESTRICTED]: 'AES-256',
  [DataClassification.PHI]: 'AES-256-GCM',
};
```

### Database Security

#### Row Level Security (RLS)

```sql
-- Patients can only see their own data
CREATE POLICY patient_isolation ON patients
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Doctors can see patients under their care
CREATE POLICY doctor_patient_access ON patients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctor_patient_assignments
      WHERE doctor_id = auth.uid()
      AND patient_id = patients.id
      AND is_active = true
    )
  );

-- Admin can see all (with audit logging)
CREATE POLICY admin_access ON patients
  FOR ALL TO authenticated
  USING (
    user_role() = 'admin'
    AND audit_log_access('patients', patients.id)
  );
```

#### Audit Logging

```sql
-- Audit trigger for all patient data access
CREATE OR REPLACE FUNCTION audit_patient_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    user_id,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent',
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## API Security

### Rate Limiting

```typescript
const rateLimits = {
  authentication: {
    login: '5 requests per 15 minutes',
    passwordReset: '3 requests per hour',
    mfaVerification: '10 requests per 15 minutes',
  },
  api: {
    general: '100 requests per minute',
    patientData: '50 requests per minute',
    fileUpload: '10 requests per minute',
    export: '5 requests per hour',
  },
  search: {
    patient: '30 requests per minute',
    appointment: '60 requests per minute',
  },
};
```

### Input Validation & Sanitization

```typescript
// Comprehensive input validation
const inputValidation = {
  sanitization: {
    html: DOMPurify.sanitize,
    sql: 'Use parameterized queries only',
    xss: 'Auto-escape all user inputs',
    csrf: 'Token-based protection',
  },
  validation: {
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    email: 'RFC 5322 compliant',
    fileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
    fileSize: '10MB maximum',
  },
};
```

### CORS Configuration

```typescript
const corsConfig = {
  origin: ['https://neonpro.vercel.app', 'https://*.neonpro.com.br'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};
```

## LGPD Compliance

### Consent Management

```typescript
interface ConsentRecord {
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  version: string;
  withdrawal?: Date;
}

enum ConsentPurpose {
  ESSENTIAL = 'essential', // Required for service
  ANALYTICS = 'analytics', // Usage analytics
  MARKETING = 'marketing', // Marketing communications
  RESEARCH = 'research', // Medical research
  THIRD_PARTY = 'third_party', // Third-party integrations
}
```

### Data Subject Rights

```typescript
// Right to Access
async function exportUserData(userId: string): Promise<UserDataExport> {
  return {
    personalData: await getPersonalData(userId),
    medicalRecords: await getMedicalRecords(userId),
    appointments: await getAppointments(userId),
    communications: await getCommunications(userId),
    auditLogs: await getAuditLogs(userId),
  };
}

// Right to Rectification
async function updateUserData(userId: string, updates: Partial<User>) {
  await auditLog('data_rectification', userId, updates);
  return await updateUser(userId, updates);
}

// Right to Erasure
async function deleteUserData(userId: string, reason: ErasureReason) {
  // Anonymize instead of delete for medical records (legal retention)
  if (reason === ErasureReason.MEDICAL_RETENTION) {
    await anonymizeUserData(userId);
  } else {
    await hardDeleteUserData(userId);
  }
  await auditLog('data_erasure', userId, { reason });
}
```

### Data Retention Policies

```typescript
const retentionPolicies = {
  personalData: '5 years after last contact',
  medicalRecords: '20 years (CFM requirement)',
  auditLogs: '10 years (compliance requirement)',
  backups: '30 days rolling',
  sessionLogs: '1 year',
  errorLogs: '2 years',
};
```

## Security Monitoring & Incident Response

### Threat Detection

```typescript
// Automated threat detection
const securityRules = {
  suspiciousLogin: {
    trigger: 'Multiple failed logins from different IPs',
    action: 'Temporary account lock + alert',
    threshold: 5,
  },
  dataExfiltration: {
    trigger: 'Large data export requests',
    action: 'Require additional authorization',
    threshold: '100 patient records',
  },
  privilegeEscalation: {
    trigger: 'Access to higher privilege resources',
    action: 'Block + immediate alert',
    threshold: 1,
  },
  offHoursAccess: {
    trigger: 'Admin access outside business hours',
    action: 'Additional MFA + notification',
    hours: '18:00-08:00',
  },
};
```

### Incident Response Workflow

```typescript
enum IncidentSeverity {
  LOW = 'low', // Minor security issues
  MEDIUM = 'medium', // Potential security threats
  HIGH = 'high', // Active security incidents
  CRITICAL = 'critical', // Data breach or system compromise
}

const responseTimeTargets = {
  [IncidentSeverity.LOW]: '24 hours',
  [IncidentSeverity.MEDIUM]: '4 hours',
  [IncidentSeverity.HIGH]: '1 hour',
  [IncidentSeverity.CRITICAL]: '15 minutes',
};
```

### Security Metrics & KPIs

- **Authentication Success Rate**: > 99%
- **Failed Login Attempts**: < 2% of total attempts
- **Mean Time to Detection (MTTD)**: < 5 minutes
- **Mean Time to Response (MTTR)**: < 1 hour
- **Security Patch Compliance**: 100% within 72 hours
- **Vulnerability Scan Results**: Zero high/critical findings

## Compliance Frameworks

### ANVISA Requirements

- **Product Registration**: All aesthetic products must be ANVISA registered
- **Adverse Event Reporting**: Automated reporting system
- **Professional Licensing**: Integration with CFM database
- **Procedure Classification**: Proper classification of all procedures

### CFM Digital Standards

- **Digital Signature**: Integration with ICP-Brasil certificates
- **Electronic Prescription**: e-Prescribe compliance
- **Telemedicine**: Compliance with CFM Resolution 2314/2022
- **Medical Record Standards**: CFM Resolution 1821/2007

## Security Testing

### Automated Security Scanning

```yaml
# Security test pipeline
security_tests:
  static_analysis:
    - SAST scanning (SonarQube)
    - Dependency vulnerability scanning
    - Secrets detection
    - License compliance

  dynamic_analysis:
    - DAST scanning (OWASP ZAP)
    - API security testing
    - Authentication testing
    - Session management testing

  infrastructure:
    - Container security scanning
    - Infrastructure as Code scanning
    - Cloud security posture management
    - Network security testing
```

### Penetration Testing

- **Frequency**: Quarterly for critical systems
- **Scope**: Full application + infrastructure
- **Methodology**: OWASP Top 10 + healthcare-specific threats
- **Reporting**: Executive summary + technical details
- **Remediation**: 30-day SLA for critical findings

## Secure Development Practices

### Code Review Requirements

- **Security Review**: Mandatory for all security-sensitive code
- **Peer Review**: All code must be reviewed by at least one peer
- **Automated Checks**: Security linting and vulnerability scanning
- **Compliance Check**: LGPD and healthcare compliance validation

### Secrets Management

```typescript
// Never store secrets in code
const config = {
  database: {
    url: process.env.DATABASE_URL,
    password: process.env.DB_PASSWORD,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    iv: process.env.ENCRYPTION_IV,
  },
  apis: {
    supabase: process.env.SUPABASE_SERVICE_ROLE_KEY,
    stripe: process.env.STRIPE_SECRET_KEY,
  },
};
```

### Secure Coding Guidelines

1. **Input Validation**: Validate all inputs at entry points
2. **Output Encoding**: Encode all outputs to prevent XSS
3. **Parameterized Queries**: Use parameterized queries to prevent SQL injection
4. **Error Handling**: Don't expose sensitive information in errors
5. **Logging**: Log security events but not sensitive data
6. **Dependencies**: Keep all dependencies updated and scan for vulnerabilities

---

**Last Updated**: 2024-01-15
**Next Security Review**: 2024-02-15
**Classification**: RESTRICTED
**Compliance**: LGPD + ANVISA + CFM
