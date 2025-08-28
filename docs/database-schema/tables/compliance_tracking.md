# Compliance Tracking Table

## Schema

| Column                   | Type         | Constraints                                               | Default           | Description                                             | LGPD Classification |
| ------------------------ | ------------ | --------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ------------------- |
| id                       | uuid         | PRIMARY KEY, NOT NULL                                     | gen_random_uuid() | Unique compliance record identifier                     | Public              |
| clinic_id                | uuid         | FK, NOT NULL                                              | -                 | Clinic reference                                        | Organizational Data |
| patient_id               | uuid         | FK                                                        | -                 | Patient reference (nullable for clinic-wide tracking)   | Personal Data       |
| professional_id          | uuid         | FK                                                        | -                 | Professional who triggered compliance check             | Organizational Data |
| compliance_type          | varchar(50)  | NOT NULL                                                  | -                 | Type of compliance check (LGPD, ANVISA, CFM)            | Compliance Data     |
| regulation_reference     | varchar(100) | NOT NULL                                                  | -                 | Specific regulation article/section                     | Compliance Data     |
| check_category           | varchar(30)  | NOT NULL                                                  | -                 | Category (data_protection, medical_device, audit_trail) | Compliance Data     |
| check_description        | text         | NOT NULL                                                  | -                 | Description of compliance requirement                   | Compliance Data     |
| current_status           | varchar(20)  | NOT NULL                                                  | 'compliant'       | Current compliance status                               | Compliance Data     |
| previous_status          | varchar(20)  | -                                                         | -                 | Previous status for change tracking                     | Compliance Data     |
| status_changed_at        | timestamptz  | -                                                         | -                 | When status last changed                                | Compliance Data     |
| risk_level               | varchar(10)  | NOT NULL                                                  | 'low'             | Risk assessment (low, medium, high, critical)           | Compliance Data     |
| automated_check          | boolean      | NOT NULL                                                  | true              | Whether check was automated or manual                   | Metadata            |
| check_frequency          | varchar(20)  | NOT NULL                                                  | 'daily'           | How often check should run                              | Compliance Data     |
| next_check_due           | timestamptz  | -                                                         | -                 | Next scheduled compliance check                         | Compliance Data     |
| last_check_at            | timestamptz  | -                                                         | now()             | When check was last performed                           | Compliance Data     |
| remediation_required     | boolean      | NOT NULL                                                  | false             | Whether remediation is needed                           | Compliance Data     |
| remediation_deadline     | timestamptz  | -                                                         | -                 | Deadline for fixing non-compliance                      | Compliance Data     |
| remediation_notes        | text         | -                                                         | -                 | Notes on remediation steps                              | Compliance Data     |
| remediation_completed_at | timestamptz  | -                                                         | -                 | When remediation was completed                          | Compliance Data     |
| evidence_urls            | text[]       | -                                                         | '{}'              | URLs to compliance evidence/documentation               | Compliance Data     |
| audit_trail              | jsonb        | NOT NULL                                                  | '{}'              | Complete audit trail of all changes                     | Audit Data          |
| system_context           | jsonb        | -                                                         | '{}'              | Technical context (versions, configurations)            | Metadata            |
| business_impact          | varchar(20)  | -                                                         | 'none'            | Business impact if non-compliant                        | Compliance Data     |
| regulatory_authority     | varchar(50)  | -                                                         | -                 | Which authority governs this compliance                 | Compliance Data     |
| notification_sent        | boolean      | NOT NULL                                                  | false             | Whether compliance team was notified                    | Compliance Data     |
| notification_sent_at     | timestamptz  | -                                                         | -                 | When notification was sent                              | Compliance Data     |
| external_audit_ref       | varchar(100) | -                                                         | -                 | External audit reference number                         | Compliance Data     |
| compliance_score         | integer      | CHECK (compliance_score >= 0 AND compliance_score <= 100) | 100               | Overall compliance score (0-100)                        | Analytics Data      |
| data_retention_compliant | boolean      | NOT NULL                                                  | true              | Whether data retention rules are followed               | Compliance Data     |
| consent_compliant        | boolean      | NOT NULL                                                  | true              | Whether consent requirements are met                    | Compliance Data     |
| security_compliant       | boolean      | NOT NULL                                                  | true              | Whether security standards are met                      | Compliance Data     |
| created_at               | timestamptz  | NOT NULL                                                  | now()             | Record creation timestamp                               | Metadata            |
| updated_at               | timestamptz  | NOT NULL                                                  | now()             | Last update timestamp                                   | Metadata            |
| created_by               | uuid         | FK                                                        | -                 | User who created record                                 | Audit Data          |
| updated_by               | uuid         | FK                                                        | -                 | User who last updated record                            | Audit Data          |

## Advanced Aesthetic Compliance

**LGPD Status**: ✅ **Fully Compliant** - Tracks LGPD compliance across all data processing activities
**ANVISA Requirements**: Medical device software compliance monitoring (Class IIa)
**CFM Requirements**: Medical record and professional practice compliance tracking
**Data Retention**: 10 years minimum for compliance audit trails
**Encryption**: All compliance data encrypted at rest and in transit

## Relationships

- `clinics.id` ← `compliance_tracking.clinic_id` (RESTRICT - preserve clinic compliance history)
- `patients.id` ← `compliance_tracking.patient_id` (SET NULL - preserve compliance records after patient deletion)
- `professionals.id` ← `compliance_tracking.professional_id` (RESTRICT - maintain professional accountability)
- `professionals.id` ← `compliance_tracking.created_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `compliance_tracking.updated_by` (RESTRICT - preserve audit trail)

## Row Level Security (RLS)

```sql
-- Enable RLS on compliance_tracking table
ALTER TABLE compliance_tracking ENABLE ROW LEVEL SECURITY;

-- Compliance officers can access all records
CREATE POLICY "compliance_officers_all_access" ON compliance_tracking
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'compliance_officer' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Clinic administrators can access their clinic's compliance
CREATE POLICY "clinic_admin_compliance_access" ON compliance_tracking
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'clinic_admin' AND
    clinic_id IN (
      SELECT clinic_id FROM professional_clinic_access
      WHERE professional_id = auth.uid()
    )
  );

-- Professionals can view their own compliance checks
CREATE POLICY "professional_own_compliance" ON compliance_tracking
  FOR SELECT USING (
    professional_id = auth.uid() OR
    created_by = auth.uid()
  );

-- System can create automated compliance checks
CREATE POLICY "system_compliance_creation" ON compliance_tracking
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('system', 'compliance_officer', 'admin')
  );
```

## Indexes

```sql
-- Primary and foreign key indexes
CREATE INDEX idx_compliance_tracking_clinic_id ON compliance_tracking(clinic_id);
CREATE INDEX idx_compliance_tracking_patient_id ON compliance_tracking(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_compliance_tracking_professional_id ON compliance_tracking(professional_id) WHERE professional_id IS NOT NULL;

-- Compliance monitoring indexes
CREATE INDEX idx_compliance_tracking_status ON compliance_tracking(current_status, compliance_type);
CREATE INDEX idx_compliance_tracking_risk_level ON compliance_tracking(risk_level, remediation_required);
CREATE INDEX idx_compliance_tracking_next_check ON compliance_tracking(next_check_due) WHERE remediation_required = false;
CREATE INDEX idx_compliance_tracking_overdue ON compliance_tracking(remediation_deadline) WHERE remediation_required = true;

-- Audit and reporting indexes
CREATE INDEX idx_compliance_tracking_created_at ON compliance_tracking(created_at);
CREATE INDEX idx_compliance_tracking_compliance_type ON compliance_tracking(compliance_type, check_category);
CREATE INDEX idx_compliance_tracking_regulatory_authority ON compliance_tracking(regulatory_authority) WHERE regulatory_authority IS NOT NULL;
```

## Triggers

```sql
-- Update timestamp on modifications
CREATE TRIGGER compliance_tracking_updated_at
  BEFORE UPDATE ON compliance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit trail logging
CREATE TRIGGER compliance_tracking_audit_trail
  AFTER INSERT OR UPDATE OR DELETE ON compliance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION log_compliance_changes();

-- Automatic notification on critical non-compliance
CREATE TRIGGER compliance_critical_notification
  AFTER UPDATE ON compliance_tracking
  FOR EACH ROW
  WHEN (NEW.risk_level = 'critical' AND NEW.current_status != 'compliant')
  EXECUTE FUNCTION send_compliance_alert();

-- Schedule next compliance check
CREATE TRIGGER compliance_schedule_next_check
  AFTER INSERT OR UPDATE ON compliance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION schedule_compliance_check();
```

## AI Integration Features

- **Compliance prediction**: Automated risk assessment based on system patterns
- **Proactive monitoring**: AI-driven detection of potential compliance issues
- **Pattern recognition**: Identifies recurring compliance challenges
- **Trend analysis**: Historical compliance data for predictive insights

## LGPD Compliance Features

### Data Processing Monitoring

- **compliance_type**: Specific LGPD article compliance (Art. 7, 11, 46, etc.)
- **consent_compliant**: Tracks consent-based processing compliance
- **data_retention_compliant**: Monitors data retention policy adherence
- **security_compliant**: Ensures security measures are in place

### Compliance Automation

- **automated_check**: Distinguishes automated vs manual compliance checks
- **check_frequency**: Configurable compliance monitoring intervals
- **next_check_due**: Automated scheduling of compliance reviews
- **remediation_deadline**: Ensures timely resolution of issues

### Regulatory Reporting

- **regulatory_authority**: Maps to ANPD, ANVISA, or CFM requirements
- **external_audit_ref**: Links to external compliance audits
- **evidence_urls**: Documentation for regulatory inspections
- **compliance_score**: Quantitative compliance measurement

## ANVISA Medical Device Compliance

### Software Classification (Class IIa)

- Monitors software quality management system compliance
- Tracks medical device registration requirements
- Ensures clinical evaluation documentation
- Monitors post-market surveillance requirements

### Risk Management (ISO 14971)

- **risk_level**: Medical device risk assessment
- **business_impact**: Impact analysis for non-compliance
- **remediation_required**: Risk mitigation tracking
- **system_context**: Technical risk factors

## CFM Professional Practice Compliance

### Medical Record Compliance (CFM Resolution 1821/2007)

- Monitors medical record completeness and quality
- Tracks professional signature requirements
- Ensures proper medical data handling
- Monitors telemedicine compliance (CFM Resolution 2314/2022)

---

> **Critical Security Notice**: This table contains highly sensitive compliance and audit information. All access is strictly controlled and monitored. Only authorized compliance officers and system administrators have write access.

> **Regulatory Note**: All compliance monitoring activities are performed in accordance with LGPD (Lei Geral de Proteção de Dados), ANVISA regulations for medical device software, and CFM (Federal Council of Medicine) requirements for healthcare professional practice.
