# Audit Logs Table

## Schema

| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique audit log identifier | Public |
| clinic_id | uuid | FK, NOT NULL | - | Clinic where action occurred | Organizational Data |
| user_id | uuid | FK | - | User who performed the action | Audit Data |
| session_id | uuid | - | - | Session identifier for action grouping | Audit Data |
| table_name | varchar(100) | NOT NULL | - | Database table affected | Audit Data |
| record_id | uuid | - | - | ID of the affected record | Audit Data |
| action_type | varchar(20) | NOT NULL | - | Type of action (INSERT, UPDATE, DELETE, SELECT) | Audit Data |
| operation_category | varchar(30) | NOT NULL | - | Category (patient_data, medical_record, appointment, etc.) | Audit Data |
| action_description | text | NOT NULL | - | Human-readable description of action | Audit Data |
| old_values | jsonb | - | - | Previous values (for UPDATE operations) | Audit Data |
| new_values | jsonb | - | - | New values (for INSERT/UPDATE operations) | Audit Data |
| changed_fields | text[] | - | '{}' | List of fields that were modified | Audit Data |
| ip_address | inet | - | - | IP address of client | Audit Data |
| user_agent | text | - | - | Browser/client user agent | Audit Data |
| request_method | varchar(10) | - | - | HTTP method (GET, POST, PUT, DELETE) | Audit Data |
| endpoint | text | - | - | API endpoint accessed | Audit Data |
| request_payload | jsonb | - | - | Sanitized request payload | Audit Data |
| response_status | integer | - | - | HTTP response status code | Audit Data |
| execution_time_ms | integer | - | - | Query/operation execution time | Performance Data |
| success | boolean | NOT NULL | true | Whether operation was successful | Audit Data |
| error_message | text | - | - | Error details if operation failed | Audit Data |
| error_code | varchar(50) | - | - | System error code | Audit Data |
| data_classification | varchar(30) | NOT NULL | 'public' | LGPD data classification affected | Compliance Data |
| phi_accessed | boolean | NOT NULL | false | Whether PHI (Protected Health Info) was accessed | Compliance Data |
| consent_verified | boolean | - | - | Whether patient consent was verified | Compliance Data |
| business_justification | text | - | - | Business reason for data access | Compliance Data |
| emergency_access | boolean | NOT NULL | false | Whether emergency access was used | Compliance Data |
| audit_level | varchar(20) | NOT NULL | 'standard' | Audit detail level (minimal, standard, detailed) | Metadata |
| compliance_tags | text[] | - | '{}' | Compliance-related tags (LGPD, ANVISA, CFM) | Compliance Data |
| risk_score | integer | CHECK (risk_score >= 0 AND risk_score <= 100) | 0 | Risk assessment for this action (0-100) | Analytics Data |
| automated_action | boolean | NOT NULL | false | Whether action was automated/system-generated | Metadata |
| batch_id | uuid | - | - | Batch identifier for grouped operations | Audit Data |
| parent_audit_id | uuid | FK | - | Parent audit log for related operations | Audit Data |
| application_context | jsonb | - | '{}' | Application-specific context data | Metadata |
| geographic_location | point | - | - | Geographic location of action (if available) | Audit Data |
| device_fingerprint | text | - | - | Device identification fingerprint | Audit Data |
| retention_category | varchar(30) | NOT NULL | 'standard' | Data retention category | Compliance Data |
| retention_until | timestamptz | - | - | When this audit log can be deleted | Compliance Data |
| anonymized | boolean | NOT NULL | false | Whether log has been anonymized | Compliance Data |
| anonymized_at | timestamptz | - | - | When log was anonymized | Compliance Data |
| export_restricted | boolean | NOT NULL | false | Whether log export is restricted | Compliance Data |
| created_at | timestamptz | NOT NULL | now() | Audit log creation timestamp | Metadata |
| indexed_at | timestamptz | - | - | When log was indexed for search | Metadata |
| archived_at | timestamptz | - | - | When log was archived | Metadata |

## Healthcare Compliance

**LGPD Status**: ✅ **Fully Compliant** - Comprehensive audit trail for all data processing activities
**ANVISA Requirements**: Complete audit trail for medical device software (Class IIa)
**CFM Requirements**: Medical practice audit logging per CFM Resolution 1821/2007
**Data Retention**: 10 years minimum for healthcare audit logs
**Encryption**: All audit data encrypted at rest with restricted access

## Relationships

- `clinics.id` ← `audit_logs.clinic_id` (RESTRICT - preserve clinic audit history)
- `professionals.id` ← `audit_logs.user_id` (SET NULL - preserve logs after user deletion)
- `audit_logs.id` ← `audit_logs.parent_audit_id` (RESTRICT - maintain audit hierarchy)

## Row Level Security (RLS)

```sql
-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only system administrators and compliance officers can access audit logs
CREATE POLICY "admin_compliance_audit_access" ON audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'compliance_officer', 'security_officer')
  );

-- Audit logs can only be inserted by system or authorized processes
CREATE POLICY "system_audit_creation" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('system', 'audit_service') OR
    auth.uid() IS NULL -- Allow system-generated logs
  );

-- No updates allowed - audit logs are immutable
-- No DELETE policy - audit logs cannot be deleted (only anonymized)
```

## Indexes

```sql
-- Primary and foreign key indexes
CREATE INDEX idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id) WHERE record_id IS NOT NULL;

-- Audit search and monitoring indexes
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action_type);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action_type, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id) WHERE session_id IS NOT NULL;

-- Compliance and security indexes
CREATE INDEX idx_audit_logs_phi_access ON audit_logs(phi_accessed, created_at) WHERE phi_accessed = true;
CREATE INDEX idx_audit_logs_emergency_access ON audit_logs(emergency_access, created_at) WHERE emergency_access = true;
CREATE INDEX idx_audit_logs_data_classification ON audit_logs(data_classification, created_at);
CREATE INDEX idx_audit_logs_risk_score ON audit_logs(risk_score DESC) WHERE risk_score > 50;

-- Performance and error tracking indexes
CREATE INDEX idx_audit_logs_errors ON audit_logs(success, error_code, created_at) WHERE success = false;
CREATE INDEX idx_audit_logs_compliance_tags ON audit_logs USING GIN(compliance_tags);
CREATE INDEX idx_audit_logs_retention ON audit_logs(retention_until) WHERE retention_until IS NOT NULL;
```

## Triggers

```sql
-- Prevent updates to audit logs (immutable)
CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Auto-calculate retention period
CREATE TRIGGER audit_logs_retention_calculation
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_audit_retention_period();

-- Real-time security monitoring
CREATE TRIGGER audit_logs_security_monitoring
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  WHEN (NEW.risk_score > 80 OR NEW.emergency_access = true OR NEW.phi_accessed = true)
  EXECUTE FUNCTION security_alert_notification();

-- Automatic archival scheduling
CREATE TRIGGER audit_logs_archival_scheduling
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION schedule_audit_log_archival();
```

## AI Integration Features

- **Risk assessment**: Automated risk scoring for audit events
- **Pattern recognition**: AI-driven detection of suspicious activities
- **Behavioral analysis**: User behavior pattern monitoring
- **Compliance prediction**: Proactive compliance issue detection

## LGPD Compliance Features

### Data Processing Audit Trail
- **data_classification**: Tracks which LGPD data categories were accessed
- **consent_verified**: Records consent verification for data processing
- **business_justification**: Documents lawful basis for processing
- **phi_accessed**: Special tracking for health data access

### Data Subject Rights Support
- **Right to Access**: Complete audit trail of personal data access
- **Right to Rectification**: Logs all data modifications with before/after values
- **Right to Erasure**: Tracks data deletion and anonymization activities
- **Right to Portability**: Logs data export and transfer activities

### Retention and Anonymization
- **retention_category**: Categorizes logs by retention requirements
- **retention_until**: Automated retention period calculation
- **anonymized**: Tracks anonymization status for compliance
- **export_restricted**: Controls data export based on LGPD requirements

## ANVISA Medical Device Compliance

### Quality Management System (QMS)
- Comprehensive audit trail for software modifications
- User access and privilege monitoring
- Medical device risk management logging
- Clinical evaluation activity tracking

### Post-Market Surveillance
- **risk_score**: Medical device risk assessment logging
- **error_message**: Software malfunction documentation
- **compliance_tags**: ANVISA-specific compliance tracking
- **automated_action**: Distinguishes human vs automated actions

## CFM Professional Practice Compliance

### Medical Record Access Audit
- Complete healthcare professional access logging
- Medical record modification tracking with before/after values
- Patient data access justification requirements
- Emergency access special handling

### Telemedicine Compliance (CFM Resolution 2314/2022)
- **geographic_location**: Tracks location for telemedicine sessions
- **device_fingerprint**: Device identification for security
- **session_id**: Groups related telemedicine activities
- **endpoint**: Tracks telemedicine API usage

## Security Features

### Access Monitoring
- **ip_address**: Client IP tracking for security analysis
- **user_agent**: Browser/client fingerprinting
- **device_fingerprint**: Device identification
- **geographic_location**: Location-based access control

### Threat Detection
- **risk_score**: Automated threat assessment
- **emergency_access**: Special monitoring for emergency situations
- **execution_time_ms**: Performance anomaly detection
- **batch_id**: Bulk operation monitoring

### Incident Response
- **error_code**: Standardized error classification
- **parent_audit_id**: Event correlation and investigation
- **application_context**: Detailed technical context for debugging
- **compliance_tags**: Regulatory compliance tracking

---

> **Critical Security Notice**: Audit logs are immutable and contain highly sensitive information about all system activities. Access is restricted to authorized security and compliance personnel only. Any unauthorized access attempt is immediately logged and reported.

> **Legal Notice**: These audit logs serve as legal evidence for regulatory compliance and may be requested by ANPD (National Data Protection Authority), ANVISA, or CFM during inspections. All logs are retained according to Brazilian legal requirements and cannot be modified or deleted during the retention period.