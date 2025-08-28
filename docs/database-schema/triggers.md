# Database Triggers - NeonPro Advanced Aesthetic Platform

## Overview

Automated triggers for audit trails, compliance enforcement, and advanced aesthetic data protection.

## Audit Trail Triggers

### patients_audit_trigger

**Table**: patients
**Event**: INSERT, UPDATE, DELETE
**Timing**: AFTER
**Function**: create_audit_log()
**Purpose**: Track all patient data changes for LGPD compliance

```sql
CREATE TRIGGER patients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();
```

### appointments_audit_trigger

**Table**: appointments  
**Event**: INSERT, UPDATE, DELETE
**Timing**: AFTER
**Function**: create_audit_log()
**Purpose**: Track appointment modifications for advanced aesthetic audit trail

```sql
CREATE TRIGGER appointments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();
```

### medical_records_audit_trigger

**Table**: medical_records
**Event**: INSERT, UPDATE, DELETE
**Timing**: AFTER
**Function**: create_audit_log()
**Purpose**: Comprehensive audit trail for aesthetic medical information (ANVISA requirement)

```sql
CREATE TRIGGER medical_records_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();
```

## Timestamp Management Triggers

### patients_updated_at_trigger

**Table**: patients
**Event**: UPDATE
**Timing**: BEFORE
**Function**: update_updated_at()
**Purpose**: Automatically update timestamp on patient record changes

```sql
CREATE TRIGGER patients_updated_at_trigger
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### appointments_updated_at_trigger

**Table**: appointments
**Event**: UPDATE
**Timing**: BEFORE
**Function**: update_updated_at()
**Purpose**: Track appointment modification timestamps

```sql
CREATE TRIGGER appointments_updated_at_trigger
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Data Encryption Triggers

### patients_encrypt_sensitive_data

**Table**: patients
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: encrypt_patient_sensitive_fields()
**Purpose**: Automatically encrypt CPF, name, and birth_date on storage

```sql
CREATE TRIGGER patients_encrypt_sensitive_data
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_patient_sensitive_fields();
```

## Compliance Validation Triggers

### consent_validation_trigger

**Table**: medical_records, appointments, treatments
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: validate_patient_consent()
**Purpose**: Ensure valid LGPD consent before processing advanced aesthetic data

```sql
CREATE TRIGGER consent_validation_trigger
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_patient_consent();
```

### professional_access_validation

**Table**: medical_records
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: validate_professional_access()
**Purpose**: Ensure advanced aesthetic professional has valid access to patient data

```sql
CREATE TRIGGER professional_access_validation
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_professional_access();
```

## AI Integration Triggers

### appointment_no_show_prediction

**Table**: appointments
**Event**: INSERT, UPDATE
**Timing**: AFTER
**Function**: update_no_show_prediction()
**Purpose**: Automatically calculate and update no-show risk scores

```sql
CREATE TRIGGER appointment_no_show_prediction
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_no_show_prediction();
```

### ai_chat_content_sanitization

**Table**: ai_chat_messages
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: sanitize_phi_content()
**Purpose**: Remove PHI before storing AI chat messages

```sql
CREATE TRIGGER ai_chat_content_sanitization
  BEFORE INSERT OR UPDATE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_phi_content();
```

## Financial Triggers

### payment_transaction_audit

**Table**: payment_transactions
**Event**: INSERT, UPDATE, DELETE
**Timing**: AFTER
**Function**: create_financial_audit_log()
**Purpose**: Track all financial operations for regulatory compliance

```sql
CREATE TRIGGER payment_transaction_audit
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_financial_audit_log();
```

### payment_reconciliation_trigger

**Table**: payment_transactions
**Event**: UPDATE
**Timing**: AFTER
**Function**: update_payment_reconciliation()
**Purpose**: Automatically update reconciliation status

```sql
CREATE TRIGGER payment_reconciliation_trigger
  AFTER UPDATE ON payment_transactions
  FOR EACH ROW
  WHEN (OLD.status != NEW.status)
  EXECUTE FUNCTION update_payment_reconciliation();
```

## Business Rule Enforcement Triggers

### appointment_conflict_prevention

**Table**: appointments
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: prevent_appointment_conflicts()
**Purpose**: Prevent double-booking and scheduling conflicts

```sql
CREATE TRIGGER appointment_conflict_prevention
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_appointment_conflicts();
```

### professional_license_validation

**Table**: appointments, medical_records
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: validate_professional_license()
**Purpose**: Ensure professional has valid license for aesthetic medical procedures

```sql
CREATE TRIGGER professional_license_validation
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_professional_license();
```

## Data Retention Triggers

### automatic_data_archival

**Table**: medical_records, appointments
**Event**: UPDATE
**Timing**: AFTER
**Function**: check_data_retention_policy()
**Purpose**: Automatically archive old records per Brazilian advanced aesthetic law (7 years)

```sql
CREATE TRIGGER automatic_data_archival
  AFTER UPDATE ON medical_records
  FOR EACH ROW
  WHEN (NEW.updated_at != OLD.updated_at)
  EXECUTE FUNCTION check_data_retention_policy();
```

## Performance Optimization Triggers

### search_vector_update

**Table**: patients, professionals
**Event**: INSERT, UPDATE
**Timing**: BEFORE
**Function**: update_search_vector()
**Purpose**: Maintain full-text search vectors for quick advanced aesthetic professional searches

```sql
CREATE TRIGGER search_vector_update
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();
```

## Error Handling Triggers

### failed_operation_logging

**Table**: ALL (via event triggers)
**Event**: ERROR
**Timing**: AFTER
**Function**: log_operation_failure()
**Purpose**: Log failed database operations for debugging and compliance

```sql
CREATE EVENT TRIGGER failed_operation_logging
  ON sql_drop
  EXECUTE FUNCTION log_operation_failure();
```

---

> **Advanced Aesthetic Compliance Note**: All triggers are designed to meet Brazilian advanced aesthetic regulations (LGPD, ANVISA, CFM). They ensure data protection, professional validation, and comprehensive audit trails for aesthetic medical operations.

> **Performance Impact**: Triggers are optimized to minimize performance impact on critical advanced aesthetic operations while maintaining comprehensive compliance and audit requirements.
