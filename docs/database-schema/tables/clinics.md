# Clinics Table

## Schema

| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | uuid_generate_v4() | Unique clinic identifier | Public |
| clinic_code | varchar(20) | NOT NULL, UNIQUE | - | Unique clinic code | Organizational Data |
| clinic_name | varchar(255) | NOT NULL | - | Clinic display name | Personal Data |
| legal_name | varchar(255) | - | - | Legal business name | Personal Data |
| email | varchar(255) | - | - | Clinic contact email | Personal Data |
| phone | varchar(20) | - | - | Clinic contact phone | Personal Data |
| website | text | - | - | Clinic website URL | Public Data |
| address_line1 | varchar(255) | - | - | Street address line 1 | Personal Data |
| address_line2 | varchar(255) | - | - | Street address line 2 | Personal Data |
| city | varchar(100) | - | - | City | Personal Data |
| state | varchar(50) | - | - | State/province | Personal Data |
| postal_code | varchar(20) | - | - | ZIP/postal code | Personal Data |
| country | varchar(50) | - | 'Brazil' | Country | Personal Data |
| tax_id | varchar(20) | - | - | CNPJ (Brazilian tax ID) | Sensitive Personal Data |
| state_registration | varchar(30) | - | - | State tax registration | Sensitive Personal Data |
| municipal_registration | varchar(30) | - | - | Municipal registration | Sensitive Personal Data |
| medical_license | varchar(50) | - | - | Medical practice license | Professional Data |
| anvisa_license | varchar(50) | - | - | ANVISA license number | Professional Data |
| crf_license | varchar(50) | - | - | Responsible pharmacist license | Professional Data |
| clinic_type | varchar(50) | - | - | Type of clinic (aesthetic, medical, etc.) | Business Data |
| specialties | text[] | - | - | Medical specialties offered | Business Data |
| operating_since | date | - | - | Date clinic started operations | Business Data |
| business_hours | jsonb | - | '{}' | Operating hours by day of week | Business Data |
| timezone | varchar(50) | - | 'America/Sao_Paulo' | Clinic timezone | Business Data |
| default_currency | char(3) | - | 'BRL' | Default currency code | Business Data |
| language_code | char(2) | - | 'pt' | Default language code | Business Data |
| status | varchar(20) | - | 'active' | Clinic operational status | Metadata |
| is_active | boolean | - | true | Active status flag | Metadata |
| subscription_plan | varchar(50) | - | - | NeonPro subscription plan | Business Data |
| compliance_level | varchar(20) | - | 'basic' | Compliance certification level | Compliance Data |
| created_at | timestamptz | - | now() | Record creation timestamp | Metadata |
| updated_at | timestamptz | - | now() | Last update timestamp | Metadata |
| created_by | uuid | FK | - | User who created record | Audit Data |
| updated_by | uuid | FK | - | User who last updated record | Audit Data |
| cfm_registration | text | - | - | CFM (Federal Council of Medicine) registration | Professional Data |
| cnes_code | text | - | - | CNES (National Registry of Health Establishments) | Professional Data |
| specialty_focus | text[] | - | - | Primary medical specialties | Business Data |
| lgpd_responsible_name | text | - | - | LGPD responsible person name | Compliance Data |
| lgpd_responsible_email | text | - | - | LGPD responsible person email | Compliance Data |
| lgpd_dpo_name | text | - | - | Data Protection Officer name | Compliance Data |
| lgpd_dpo_email | text | - | - | Data Protection Officer email | Compliance Data |
| privacy_policy_url | text | - | - | Privacy policy URL | Compliance Data |
| terms_of_service_url | text | - | - | Terms of service URL | Compliance Data |
| operating_hours | jsonb | - | '{}' | Detailed operating schedule | Business Data |
| emergency_contact | jsonb | - | '{}' | Emergency contact information | Business Data |
| business_type | text | - | 'clinic' | Type of healthcare business | Business Data |
| max_patients | integer | - | 1000 | Maximum patient capacity | Business Data |
| max_staff | integer | - | 10 | Maximum staff capacity | Business Data |
| features_enabled | text[] | - | ['appointments', 'patients'] | Enabled platform features | Business Data |
| deleted_at | timestamptz | - | - | Soft deletion timestamp | Metadata |

## Healthcare Compliance

**LGPD Status**: ✅ **Compliant** - Contains business and professional data
**ANVISA Requirements**: Healthcare establishment registration (Class IIa)
**CFM Registration**: Federal Council of Medicine compliance
**CNES Integration**: National health establishment registry
**Data Retention**: Indefinite (business and regulatory compliance records)

## Relationships

- `tenants.id` ← `clinics.tenant_id` (RESTRICT - preserve tenant structure)
- `professionals.id` ← `clinics.created_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `clinics.updated_by` (RESTRICT - preserve audit trail)
- `patients.clinic_id` → `clinics.id` (RESTRICT - preserve patient associations)
- `professionals.clinic_id` → `clinics.id` (RESTRICT - preserve professional associations)
- `appointments.clinic_id` → `clinics.id` (RESTRICT - preserve appointment history)
- `rooms.clinic_id` → `clinics.id` (RESTRICT - preserve facility structure)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Multi-tenant clinic isolation

### Current Policies

```sql
-- Staff access own clinic only
CREATE POLICY "staff_own_clinic" ON clinics
  FOR ALL USING (
    id IN (
      SELECT clinic_id FROM professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Patients view their clinic (limited fields)
CREATE POLICY "patients_view_clinic" ON clinics
  FOR SELECT USING (
    id IN (
      SELECT clinic_id FROM patients 
      WHERE auth.uid()::text = id::text
    )
  );

-- System admin access (for support)
CREATE POLICY "system_admin_access" ON clinics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role = 'system_admin'
    )
  );
```

## Brazilian Healthcare Regulatory Compliance

### ANVISA Requirements
- **Medical Device Software**: Class IIa compliance for healthcare establishments
- **License Tracking**: Automated validation of ANVISA licenses
- **Regulatory Updates**: Integration with ANVISA databases

### CFM Integration
- **Medical Practice Registration**: Federal Council of Medicine compliance
- **Professional Oversight**: Medical professional validation
- **Ethics Compliance**: Code of medical ethics enforcement

### CNES Integration
- **National Registry**: Integration with health establishment database
- **Capacity Reporting**: Patient and staff capacity tracking
- **Service Classification**: Healthcare service categorization

## LGPD Compliance Features

### Data Protection Structure
- **Responsible Person**: LGPD-required data protection responsible
- **DPO Management**: Data Protection Officer designation and contact
- **Privacy Documentation**: Links to privacy policy and terms of service
- **Compliance Level**: Certification and audit status tracking

### Patient Rights Management
- **Data Access**: Automated patient data access provisions
- **Consent Management**: Centralized consent tracking per clinic
- **Data Portability**: Patient data export capabilities
- **Right to Erasure**: Coordinated patient data deletion

## Business Logic & Features

### Operating Schedule Management
```json
// business_hours structure
{
  "monday": {"open": "08:00", "close": "18:00", "break": {"start": "12:00", "end": "13:00"}},
  "tuesday": {"open": "08:00", "close": "18:00", "break": {"start": "12:00", "end": "13:00"}},
  "wednesday": {"open": "08:00", "close": "18:00", "break": {"start": "12:00", "end": "13:00"}},
  "thursday": {"open": "08:00", "close": "18:00", "break": {"start": "12:00", "end": "13:00"}},
  "friday": {"open": "08:00", "close": "18:00", "break": {"start": "12:00", "end": "13:00"}},
  "saturday": {"open": "08:00", "close": "12:00"},
  "sunday": {"closed": true}
}
```

### Emergency Contact Structure
```json
// emergency_contact structure
{
  "primary": {"name": "Dr. Silva", "phone": "+5511999999999", "email": "emergency@clinic.com"},
  "secondary": {"name": "Nurse Ana", "phone": "+5511888888888"},
  "after_hours": {"phone": "+5511777777777", "instructions": "Call for emergencies only"}
}
```

### Feature Management
- **Modular Features**: Enable/disable platform features per clinic
- **Capacity Limits**: Patient and staff limits based on subscription
- **Specialty Tracking**: Medical specialties and focus areas
- **Integration Control**: Third-party service integrations

## Performance Optimizations

### Indexes
```sql
-- Core clinic queries
CREATE INDEX idx_clinics_active ON clinics (is_active, status);
CREATE INDEX idx_clinics_code ON clinics (clinic_code);
CREATE INDEX idx_clinics_tax_id ON clinics (tax_id);

-- Location-based searches
CREATE INDEX idx_clinics_location ON clinics (city, state);

-- Specialties search
CREATE INDEX idx_clinics_specialties ON clinics USING GIN (specialties);
CREATE INDEX idx_clinics_specialty_focus ON clinics USING GIN (specialty_focus);

-- Features search
CREATE INDEX idx_clinics_features ON clinics USING GIN (features_enabled);
```

### Soft Delete Support
- **Logical Deletion**: `deleted_at` timestamp for soft deletes
- **Data Retention**: Maintains historical data for compliance
- **Recovery Options**: Ability to restore deleted clinics

## Audit & Monitoring

### Audit Requirements
```sql
-- Comprehensive clinic audit trail
CREATE TRIGGER clinics_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER clinics_updated_at_trigger
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Compliance monitoring
CREATE TRIGGER clinic_compliance_monitoring_trigger
  AFTER UPDATE ON clinics
  FOR EACH ROW
  WHEN (OLD.compliance_level != NEW.compliance_level)
  EXECUTE FUNCTION log_compliance_change();
```

### Regulatory Monitoring
- **License Expiration**: Automated alerts for license renewals
- **Compliance Audits**: Regular compliance status assessments
- **Regulatory Updates**: Integration with regulatory body changes

---

> **Multi-tenant Notice**: This table serves as the core tenant isolation mechanism. All clinic data is strictly segregated through RLS policies ensuring complete data isolation between healthcare establishments.

> **Regulatory Compliance**: All clinic operations must maintain compliance with ANVISA, CFM, and LGPD requirements. Regular audits and monitoring ensure continuous regulatory adherence.