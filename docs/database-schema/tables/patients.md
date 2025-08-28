# Patients Table

## Schema

| Column                         | Type         | Constraints           | Default           | Description                        | LGPD Classification     |
| ------------------------------ | ------------ | --------------------- | ----------------- | ---------------------------------- | ----------------------- |
| id                             | uuid         | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique patient identifier          | Public                  |
| clinic_id                      | uuid         | FK, NOT NULL          | -                 | Clinic reference                   | Organizational Data     |
| medical_record_number          | varchar(100) | NOT NULL, UNIQUE      | -                 | Internal medical record number     | Personal Data           |
| external_ids                   | jsonb        | -                     | '{}'              | External system IDs mapping        | Metadata                |
| given_names                    | text[]       | NOT NULL              | -                 | Patient first/middle names         | Personal Data           |
| family_name                    | varchar(100) | NOT NULL              | -                 | Patient last name                  | Personal Data           |
| full_name                      | text         | NOT NULL              | -                 | Complete patient name              | Personal Data           |
| preferred_name                 | varchar(100) | -                     | -                 | Preferred name for communication   | Personal Data           |
| phone_primary                  | varchar(20)  | -                     | -                 | Primary contact phone              | Personal Data           |
| phone_secondary                | varchar(20)  | -                     | -                 | Secondary contact phone            | Personal Data           |
| email                          | varchar(255) | -                     | -                 | Email address                      | Personal Data           |
| address_line1                  | text         | -                     | -                 | Street address line 1              | Personal Data           |
| address_line2                  | text         | -                     | -                 | Street address line 2              | Personal Data           |
| city                           | varchar(100) | -                     | -                 | City                               | Personal Data           |
| state                          | varchar(50)  | -                     | -                 | State/province                     | Personal Data           |
| postal_code                    | varchar(20)  | -                     | -                 | ZIP/postal code                    | Personal Data           |
| country                        | varchar(50)  | -                     | 'BR'              | Country code                       | Personal Data           |
| birth_date                     | date         | -                     | -                 | Date of birth                      | Personal Data           |
| gender                         | varchar(20)  | -                     | -                 | Gender identity                    | Personal Data           |
| marital_status                 | varchar(30)  | -                     | -                 | Marital status                     | Personal Data           |
| is_active                      | boolean      | -                     | true              | Active patient status              | Metadata                |
| deceased_indicator             | boolean      | -                     | false             | Death indicator                    | Health Data             |
| deceased_date                  | date         | -                     | -                 | Date of death                      | Health Data             |
| data_consent_status            | varchar(20)  | -                     | 'pending'         | LGPD consent status                | Compliance Data         |
| data_consent_date              | timestamptz  | -                     | -                 | Date consent was given             | Compliance Data         |
| data_retention_until           | date         | -                     | -                 | Data retention expiry date         | Compliance Data         |
| data_source                    | varchar(50)  | -                     | 'manual'          | Source of patient data             | Metadata                |
| created_at                     | timestamptz  | -                     | now()             | Record creation timestamp          | Metadata                |
| updated_at                     | timestamptz  | -                     | now()             | Last update timestamp              | Metadata                |
| created_by                     | uuid         | FK                    | -                 | User who created record            | Audit Data              |
| updated_by                     | uuid         | FK                    | -                 | User who last updated record       | Audit Data              |
| photo_url                      | text         | -                     | -                 | Patient photo URL                  | Personal Data           |
| cpf                            | text         | UNIQUE                | -                 | Brazilian CPF document             | Sensitive Personal Data |
| rg                             | text         | -                     | -                 | Brazilian RG document              | Sensitive Personal Data |
| passport_number                | text         | -                     | -                 | Passport number                    | Sensitive Personal Data |
| preferred_contact_method       | text         | -                     | 'phone'           | Preferred communication method     | Personal Data           |
| blood_type                     | text         | -                     | -                 | Blood type                         | Health Data             |
| allergies                      | text[]       | -                     | -                 | Known allergies                    | Health Data             |
| chronic_conditions             | text[]       | -                     | -                 | Chronic medical conditions         | Health Data             |
| current_medications            | text[]       | -                     | -                 | Current medications                | Health Data             |
| insurance_provider             | text         | -                     | -                 | Health insurance provider          | Personal Data           |
| insurance_number               | text         | -                     | -                 | Insurance policy number            | Sensitive Personal Data |
| insurance_plan                 | text         | -                     | -                 | Insurance plan type                | Personal Data           |
| emergency_contact_name         | text         | -                     | -                 | Emergency contact name             | Personal Data           |
| emergency_contact_phone        | text         | -                     | -                 | Emergency contact phone            | Personal Data           |
| emergency_contact_relationship | text         | -                     | -                 | Relationship to patient            | Personal Data           |
| lgpd_consent_given             | boolean      | NOT NULL              | false             | LGPD consent flag                  | Compliance Data         |
| lgpd_consent_version           | text         | -                     | -                 | LGPD consent version               | Compliance Data         |
| data_sharing_consent           | jsonb        | -                     | '{}'              | Granular data sharing permissions  | Compliance Data         |
| marketing_consent              | boolean      | -                     | false             | Marketing communication consent    | Compliance Data         |
| research_consent               | boolean      | -                     | false             | Medical research participation     | Compliance Data         |
| no_show_risk_score             | integer      | -                     | 0                 | AI-calculated no-show risk (0-100) | Analytics Data          |
| last_no_show_date              | timestamptz  | -                     | -                 | Date of last no-show               | Analytics Data          |
| total_no_shows                 | integer      | -                     | 0                 | Total no-show count                | Analytics Data          |
| total_appointments             | integer      | -                     | 0                 | Total appointment count            | Analytics Data          |
| preferred_appointment_time     | text[]       | -                     | -                 | Preferred appointment times        | Analytics Data          |
| communication_preferences      | jsonb        | -                     | '{}'              | Communication preferences          | Personal Data           |
| patient_status                 | text         | -                     | 'active'          | Current patient status             | Metadata                |
| registration_source            | text         | -                     | 'manual'          | How patient was registered         | Metadata                |
| last_visit_date                | timestamptz  | -                     | -                 | Date of last visit                 | Analytics Data          |
| next_appointment_date          | timestamptz  | -                     | -                 | Next scheduled appointment         | Analytics Data          |
| patient_notes                  | text         | -                     | -                 | General patient notes              | Health Data             |
| nationality                    | text         | -                     | 'brasileira'      | Patient nationality                | Personal Data           |
| primary_doctor_id              | uuid         | FK                    | -                 | Primary care physician             | Organizational Data     |

## Advanced Aesthetic Compliance

**LGPD Status**: ✅ **Compliant** - Contains personal, sensitive, and health data
**ANVISA Requirements**: Patient registry for advanced aesthetic medical device software (Class IIa)
**Data Retention**: 7 years minimum (Brazilian medical records law - CFM Resolution 1821/2007)
**Encryption**: Sensitive fields (CPF, RG, passport_number) encrypted at rest

## Relationships

- `clinics.id` ← `patients.clinic_id` (RESTRICT - preserve clinic integrity)
- `professionals.id` ← `patients.primary_doctor_id` (RESTRICT - maintain doctor assignment)
- `professionals.id` ← `patients.created_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `patients.updated_by` (RESTRICT - preserve audit trail)
- `appointments.patient_id` → `patients.id` (CASCADE DELETE for LGPD erasure)
- `medical_records.patient_id` → `patients.id` (CASCADE DELETE for LGPD erasure)
- `consent_records.patient_id` → `patients.id` (CASCADE DELETE for LGPD erasure)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Advanced aesthetic healthcare data protection mandatory

### Current Policies

```sql
-- Professionals access patients in their clinic only
CREATE POLICY "professionals_clinic_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = patients.clinic_id
      AND p.is_active = true
    )
  );

-- Patients access own data only (patient portal)
CREATE POLICY "patients_own_data" ON patients
  FOR SELECT USING (
    auth.uid()::text = id::text AND
    validate_lgpd_consent(id, 'self_access') = true
  );

-- Admin users access all patients in their organization
CREATE POLICY "admin_access_all_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
      AND p.clinic_id = patients.clinic_id
    )
  );
```

### Data Protection Features

- **Field-level encryption**: CPF, RG, passport_number automatically encrypted
- **Consent validation**: Data access requires valid LGPD consent
- **Audit logging**: All operations logged with user identification
- **Data retention**: Automatic flagging for retention policy compliance
- **Anonymization**: Built-in functions for LGPD Right to Erasure

## Audit Requirements

**Triggers**: ✅ Audit trail enabled for all CUD operations

```sql
-- Audit trigger for compliance tracking
CREATE TRIGGER patients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER patients_updated_at_trigger
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- LGPD consent validation
CREATE TRIGGER patients_consent_validation
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION validate_lgpd_consent_update();
```

## AI Integration Features

- **No-show prediction**: `no_show_risk_score` automatically calculated
- **Patient segmentation**: Analytics fields for behavioral analysis
- **Communication optimization**: Preferences used for AI-driven communications
- **Predictive insights**: Historical data used for appointment optimization

## LGPD Compliance Features

### Consent Management

- **lgpd_consent_given**: Master consent flag
- **data_sharing_consent**: Granular permissions for data sharing
- **marketing_consent**: Separate consent for marketing communications
- **research_consent**: Medical research participation consent

### Data Subject Rights

- **Right to Access**: Patient portal access via RLS policies
- **Right to Rectification**: Update capabilities with audit trail
- **Right to Erasure**: CASCADE DELETE relationships and anonymization functions
- **Right to Portability**: JSON export functions for data portability
- **Right to Object**: Opt-out mechanisms for processing activities

### Retention Policy

- **data_retention_until**: Configurable retention period
- **deceased_indicator**: Special handling for deceased patient records
- **anonymization**: Automated anonymization after retention period

---

> **Security Notice**: This table contains sensitive healthcare and personal information. All access is logged and monitored. Healthcare professionals must have valid credentials and appropriate permissions to access patient data.

> **Compliance Note**: All data processing activities comply with LGPD (Lei Geral de Proteção de Dados), ANVISA regulations for medical device software, and CFM (Federal Council of Medicine) requirements for medical record keeping.
