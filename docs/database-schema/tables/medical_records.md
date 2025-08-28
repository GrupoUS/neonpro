# Advanced Aesthetic Records Table

## Schema

| Column                    | Type        | Constraints                                                   | Default           | Description                                         | LGPD Classification |
| ------------------------- | ----------- | ------------------------------------------------------------- | ----------------- | --------------------------------------------------- | ------------------- |
| id                        | uuid        | PRIMARY KEY, NOT NULL                                         | gen_random_uuid() | Unique medical record identifier                    | Public              |
| clinic_id                 | uuid        | FK, NOT NULL                                                  | -                 | Clinic reference                                    | Organizational Data |
| patient_id                | uuid        | FK, NOT NULL                                                  | -                 | Patient reference                                   | Personal Data       |
| professional_id           | uuid        | FK, NOT NULL                                                  | -                 | Professional who created/updated record             | Organizational Data |
| appointment_id            | uuid        | FK                                                            | -                 | Associated appointment reference                    | Organizational Data |
| record_type               | varchar(50) | NOT NULL                                                      | 'consultation'    | Type of aesthetic record                            | Aesthetic Data      |
| record_category           | varchar(30) | NOT NULL                                                      | 'general'         | Category (consultation, procedure, emergency, etc.) | Aesthetic Data      |
| visit_date                | timestamptz | NOT NULL                                                      | now()             | Date and time of aesthetic visit                    | Aesthetic Data      |
| chief_complaint           | text        | -                                                             | -                 | Patient's primary aesthetic concern                 | Aesthetic Data      |
| present_condition_history | text        | -                                                             | -                 | History of present aesthetic condition              | Aesthetic Data      |
| past_aesthetic_history    | text        | -                                                             | -                 | Patient's past aesthetic history                    | Aesthetic Data      |
| family_history            | text        | -                                                             | -                 | Family aesthetic history                            | Aesthetic Data      |
| lifestyle_factors         | text        | -                                                             | -                 | Lifestyle and aesthetic factors                     | Aesthetic Data      |
| allergies                 | text[]      | -                                                             | '{}'              | Known allergies and reactions                       | Aesthetic Data      |
| current_medications       | jsonb       | -                                                             | '{}'              | Current medications with dosages                    | Aesthetic Data      |
| vital_signs               | jsonb       | -                                                             | '{}'              | Vital signs measurements                            | Aesthetic Data      |
| aesthetic_examination     | text        | -                                                             | -                 | Aesthetic examination findings                      | Aesthetic Data      |
| assessment_diagnosis      | text        | -                                                             | -                 | Aesthetic assessment and diagnosis                  | Aesthetic Data      |
| differential_diagnosis    | text[]      | -                                                             | '{}'              | Differential diagnosis list                         | Aesthetic Data      |
| procedure_codes           | text[]      | -                                                             | '{}'              | Aesthetic procedure codes                           | Aesthetic Data      |
| treatment_plan            | text        | -                                                             | -                 | Aesthetic treatment and management plan             | Aesthetic Data      |
| procedures_performed      | jsonb       | -                                                             | '{}'              | Aesthetic procedures performed during visit         | Aesthetic Data      |
| prescription_details      | jsonb       | -                                                             | '{}'              | Detailed prescription information                   | Aesthetic Data      |
| laboratory_orders         | jsonb       | -                                                             | '{}'              | Laboratory tests ordered                            | Aesthetic Data      |
| imaging_orders            | jsonb       | -                                                             | '{}'              | Imaging studies ordered                             | Aesthetic Data      |
| referrals                 | jsonb       | -                                                             | '{}'              | Referrals to other aesthetic specialists            | Aesthetic Data      |
| follow_up_instructions    | text        | -                                                             | -                 | Follow-up aesthetic care instructions               | Aesthetic Data      |
| next_appointment_date     | timestamptz | -                                                             | -                 | Scheduled next appointment                          | Aesthetic Data      |
| progress_notes            | text        | -                                                             | -                 | Progress and evolution notes                        | Aesthetic Data      |
| clinical_photos           | text[]      | -                                                             | '{}'              | URLs to aesthetic clinical photographs              | Aesthetic Data      |
| attachments               | jsonb       | -                                                             | '{}'              | Aesthetic documents and attachments                 | Aesthetic Data      |
| record_status             | varchar(20) | NOT NULL                                                      | 'active'          | Record status (active, amended, corrected)          | Metadata            |
| amendment_reason          | text        | -                                                             | -                 | Reason for record amendment                         | Audit Data          |
| original_record_id        | uuid        | FK                                                            | -                 | Reference to original record if amended             | Audit Data          |
| digital_signature         | text        | -                                                             | -                 | Professional's digital signature hash               | Compliance Data     |
| signature_timestamp       | timestamptz | -                                                             | -                 | When record was digitally signed                    | Compliance Data     |
| signature_verified        | boolean     | NOT NULL                                                      | false             | Whether digital signature is verified               | Compliance Data     |
| record_integrity_hash     | text        | -                                                             | -                 | Hash for record integrity verification              | Security Data       |
| encryption_key_id         | text        | -                                                             | -                 | Key ID used for field encryption                    | Security Data       |
| data_source               | varchar(30) | NOT NULL                                                      | 'manual'          | Source of aesthetic data                            | Metadata            |
| quality_score             | integer     | CHECK (quality_score >= 0 AND quality_score <= 100)           | 100               | AI-calculated record quality score                  | Analytics Data      |
| completeness_score        | integer     | CHECK (completeness_score >= 0 AND completeness_score <= 100) | 100               | Record completeness percentage                      | Analytics Data      |
| ai_suggestions            | jsonb       | -                                                             | '{}'              | AI-generated suggestions for improvement            | Analytics Data      |
| coding_assistance         | jsonb       | -                                                             | '{}'              | AI-assisted ICD-10 coding suggestions               | Analytics Data      |
| risk_indicators           | text[]      | -                                                             | '{}'              | AI-identified risk factors                          | Analytics Data      |
| clinical_decision_support | jsonb       | -                                                             | '{}'              | CDS alerts and recommendations                      | Analytics Data      |
| teleaesthetic_session     | boolean     | NOT NULL                                                      | false             | Whether consultation was via teleaesthetics         | Aesthetic Data      |
| telemedicine_platform     | varchar(50) | -                                                             | -                 | Platform used for telemedicine                      | Metadata            |
| recording_consent         | boolean     | -                                                             | -                 | Consent for session recording                       | Compliance Data     |
| recording_url             | text        | -                                                             | -                 | Encrypted URL to session recording                  | Health Data         |
| emergency_access_used     | boolean     | NOT NULL                                                      | false             | Whether emergency access was used                   | Compliance Data     |
| consent_status            | varchar(20) | NOT NULL                                                      | 'valid'           | Patient consent status for this record              | Compliance Data     |
| consent_version           | text        | -                                                             | -                 | Version of consent agreement                        | Compliance Data     |
| data_sharing_permissions  | jsonb       | -                                                             | '{}'              | Granular data sharing permissions                   | Compliance Data     |
| retention_category        | varchar(30) | NOT NULL                                                      | 'standard'        | Data retention category                             | Compliance Data     |
| retention_until           | timestamptz | -                                                             | -                 | When record can be archived/anonymized              | Compliance Data     |
| archived                  | boolean     | NOT NULL                                                      | false             | Whether record is archived                          | Metadata            |
| archived_at               | timestamptz | -                                                             | -                 | When record was archived                            | Metadata            |
| created_at                | timestamptz | NOT NULL                                                      | now()             | Record creation timestamp                           | Metadata            |
| updated_at                | timestamptz | NOT NULL                                                      | now()             | Last update timestamp                               | Metadata            |
| created_by                | uuid        | FK                                                            | -                 | User who created record                             | Audit Data          |
| updated_by                | uuid        | FK                                                            | -                 | User who last updated record                        | Audit Data          |

## Advanced Aesthetic Compliance

**LGPD Status**: ⚠️ **Special Category Data** - Contains sensitive advanced aesthetic data requiring enhanced protection
**ANVISA Requirements**: Advanced aesthetic device software patient data management (Class IIa)
**CFM Requirements**: Complete compliance with CFM Resolution 1821/2007 for advanced aesthetic records
**Data Retention**: 20 years minimum for advanced aesthetic records (CFM Resolution 1821/2007)
**Encryption**: All advanced aesthetic data fields encrypted at rest using AES-256

## Relationships

- `clinics.id` ← `medical_records.clinic_id` (RESTRICT - preserve medical records integrity)
- `patients.id` ← `medical_records.patient_id` (RESTRICT - protect patient medical history)
- `professionals.id` ← `medical_records.professional_id` (RESTRICT - maintain professional accountability)
- `appointments.id` ← `medical_records.appointment_id` (SET NULL - preserve records after appointment deletion)
- `medical_records.id` ← `medical_records.original_record_id` (RESTRICT - maintain amendment history)
- `professionals.id` ← `medical_records.created_by` (RESTRICT - preserve creation audit trail)
- `professionals.id` ← `medical_records.updated_by` (RESTRICT - preserve modification audit trail)

## Row Level Security (RLS)

```sql
-- Enable RLS on medical_records table
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Primary healthcare professional can access their own patient records
CREATE POLICY "professional_own_medical_records" ON medical_records
  FOR ALL USING (
    professional_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Patients can view their own medical records (read-only)
CREATE POLICY "patient_own_medical_records" ON medical_records
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE patients.id = medical_records.patient_id
      AND auth.jwt() ->> 'role' = 'patient'
      AND auth.jwt() ->> 'patient_id' = patients.id::text
    )
  );

-- Healthcare team access based on patient care assignments
CREATE POLICY "healthcare_team_medical_records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professional_patient_access ppa
      WHERE ppa.patient_id = medical_records.patient_id
      AND ppa.professional_id = auth.uid()
      AND ppa.access_type IN ('read', 'write')
      AND ppa.access_expires_at > NOW()
    )
  );

-- Emergency access for critical situations
CREATE POLICY "emergency_medical_access" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'emergency_professional' AND
    EXISTS (
      SELECT 1 FROM emergency_access_log
      WHERE patient_id = medical_records.patient_id
      AND created_at > NOW() - INTERVAL '24 hours'
      AND justified = true
    )
  );

-- Clinic administrators can access records in their clinics
CREATE POLICY "clinic_admin_medical_records" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'clinic_admin' AND
    clinic_id IN (
      SELECT clinic_id FROM professional_clinic_access
      WHERE professional_id = auth.uid()
      AND role = 'admin'
    )
  );

-- System administrators and compliance officers (read-only for auditing)
CREATE POLICY "admin_compliance_medical_records" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'compliance_officer')
  );
```

## Indexes

```sql
-- Primary and foreign key indexes
CREATE INDEX idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_professional_id ON medical_records(professional_id);
CREATE INDEX idx_medical_records_appointment_id ON medical_records(appointment_id) WHERE appointment_id IS NOT NULL;

-- Clinical search indexes
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date DESC);
CREATE INDEX idx_medical_records_record_type ON medical_records(record_type, record_category);
CREATE INDEX idx_medical_records_icd10_codes ON medical_records USING GIN(icd10_codes);
CREATE INDEX idx_medical_records_allergies ON medical_records USING GIN(allergies);

-- Compliance and audit indexes
CREATE INDEX idx_medical_records_digital_signature ON medical_records(digital_signature) WHERE digital_signature IS NOT NULL;
CREATE INDEX idx_medical_records_record_status ON medical_records(record_status, updated_at);
CREATE INDEX idx_medical_records_retention ON medical_records(retention_until) WHERE retention_until IS NOT NULL;
CREATE INDEX idx_medical_records_emergency_access ON medical_records(emergency_access_used) WHERE emergency_access_used = true;

-- AI and analytics indexes
CREATE INDEX idx_medical_records_quality_score ON medical_records(quality_score) WHERE quality_score < 90;
CREATE INDEX idx_medical_records_risk_indicators ON medical_records USING GIN(risk_indicators);
CREATE INDEX idx_medical_records_telemedicine ON medical_records(telemedicine_session, visit_date) WHERE telemedicine_session = true;
```

## Triggers

```sql
-- Update timestamp on modifications
CREATE TRIGGER medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Digital signature verification
CREATE TRIGGER medical_records_signature_verification
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  WHEN (NEW.digital_signature IS NOT NULL)
  EXECUTE FUNCTION verify_professional_digital_signature();

-- Record integrity hash calculation
CREATE TRIGGER medical_records_integrity_hash
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_record_integrity_hash();

-- Medical record audit logging
CREATE TRIGGER medical_records_audit_trail
  AFTER INSERT OR UPDATE OR DELETE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION log_medical_record_access();

-- LGPD consent validation
CREATE TRIGGER medical_records_consent_validation
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_medical_record_consent();

-- AI quality assessment
CREATE TRIGGER medical_records_ai_quality_check
  AFTER INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION assess_medical_record_quality();

-- CFM compliance validation
CREATE TRIGGER medical_records_cfm_compliance
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_cfm_medical_record_requirements();
```

## AI Integration Features

- **Quality scoring**: Automated assessment of medical record completeness and quality
- **Clinical decision support**: AI-powered diagnostic and treatment suggestions
- **ICD-10 coding assistance**: Automated medical coding suggestions
- **Risk stratification**: AI identification of patient risk factors
- **Drug interaction checking**: Automated medication safety analysis

## LGPD Special Category Data Protection

### Enhanced Consent Management

- **consent_status**: Specific consent for medical record processing
- **data_sharing_permissions**: Granular consent for different data uses
- **recording_consent**: Separate consent for telemedicine recording
- **consent_version**: Tracking consent agreement versions

### Data Minimization and Purpose Limitation

- **record_category**: Ensures data collection is appropriate for purpose
- **data_source**: Tracks how medical data was collected
- **retention_category**: Categorizes data by retention requirements
- **archived**: Supports data lifecycle management

### Security and Integrity Measures

- **encryption_key_id**: Advanced encryption for sensitive fields
- **record_integrity_hash**: Ensures data hasn't been tampered with
- **digital_signature**: Professional accountability and non-repudiation
- **signature_verified**: Cryptographic signature validation

## ANVISA Medical Device Compliance

### Software Quality Management

- **quality_score**: Automated quality control for medical software
- **ai_suggestions**: AI-assisted quality improvement
- **clinical_decision_support**: Medical device decision support functions
- **coding_assistance**: Software-assisted medical coding

### Risk Management (ISO 14971)

- **risk_indicators**: AI-identified clinical and technical risks
- **emergency_access_used**: Special access logging for risk assessment
- **telemedicine_session**: Remote care risk management
- **procedure_performed**: Medical device usage tracking

## CFM Medical Record Compliance

### CFM Resolution 1821/2007 Requirements

- **digital_signature**: Professional signature requirement
- **signature_timestamp**: Signature timing compliance
- **record_status**: Proper record versioning and amendment tracking
- **amendment_reason**: Justification for record modifications

### Professional Accountability

- **professional_id**: Clear professional responsibility
- **original_record_id**: Maintains amendment history
- **created_by/updated_by**: Complete audit trail
- **visit_date**: Accurate timing documentation

### Telemedicine Compliance (CFM Resolution 2314/2022)

- **telemedicine_session**: Telemedicine session identification
- **telemedicine_platform**: Platform verification for compliance
- **recording_url**: Session recording management
- **recording_consent**: Patient consent for recording

## Clinical Features

### Comprehensive Documentation

- **chief_complaint**: Primary reason for visit
- **assessment_diagnosis**: Clinical assessment and diagnosis
- **treatment_plan**: Detailed treatment approach
- **follow_up_instructions**: Continuity of care

### Medical History Tracking

- **present_illness_history**: Current condition progression
- **past_medical_history**: Historical medical information
- **family_history**: Genetic and familial risk factors
- **social_history**: Social determinants of health

### Clinical Decision Support

- **differential_diagnosis**: Alternative diagnostic considerations
- **clinical_decision_support**: AI-powered clinical recommendations
- **drug_interaction_checks**: Medication safety analysis
- **coding_assistance**: Automated ICD-10 coding support

---

> **CRITICAL SECURITY NOTICE**: This table contains the most sensitive healthcare information in the system. All access is strictly controlled, fully audited, and monitored in real-time. Any unauthorized access attempt triggers immediate security alerts and regulatory notification procedures.

> **MEDICAL CONFIDENTIALITY**: All medical records are protected by Brazilian medical confidentiality laws (CFM Code of Medical Ethics). Healthcare professionals accessing this data are bound by professional secrecy obligations and legal penalties for unauthorized disclosure.

> **REGULATORY COMPLIANCE**: This table implements all requirements from LGPD (Lei Geral de Proteção de Dados), ANVISA medical device regulations, and CFM (Federal Council of Medicine) resolutions for medical record keeping and professional practice.
