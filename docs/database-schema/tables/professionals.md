# Professionals Table

## Schema

| Column              | Type         | Constraints           | Default           | Description                                          | LGPD Classification     |
| ------------------- | ------------ | --------------------- | ----------------- | ---------------------------------------------------- | ----------------------- |
| id                  | uuid         | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique professional identifier                       | Public                  |
| clinic_id           | uuid         | FK, NOT NULL          | -                 | Clinic reference                                     | Organizational Data     |
| user_id             | uuid         | FK                    | -                 | Auth user reference (Supabase Auth)                  | System Data             |
| full_name           | varchar(255) | NOT NULL              | -                 | Professional full name                               | Personal Data           |
| specialization      | varchar(255) | -                     | -                 | Medical specialization                               | Professional Data       |
| license_number      | varchar(100) | -                     | -                 | Professional license number (CRM, CRO, etc.)         | Sensitive Personal Data |
| phone               | varchar(20)  | -                     | -                 | Contact phone number                                 | Personal Data           |
| email               | varchar(255) | -                     | -                 | Professional email address                           | Personal Data           |
| color               | varchar(7)   | -                     | '#10B981'         | Calendar display color (hex)                         | Personal Preference     |
| is_active           | boolean      | -                     | true              | Active professional status                           | Metadata                |
| can_work_weekends   | boolean      | -                     | false             | Weekend availability flag                            | Work Preferences        |
| default_start_time  | time         | -                     | '08:00:00'        | Default work start time                              | Work Preferences        |
| default_end_time    | time         | -                     | '18:00:00'        | Default work end time                                | Work Preferences        |
| default_break_start | time         | -                     | '12:00:00'        | Default lunch break start                            | Work Preferences        |
| default_break_end   | time         | -                     | '13:00:00'        | Default lunch break end                              | Work Preferences        |
| service_type_ids    | uuid[]       | -                     | -                 | Array of service types this professional can perform | Professional Data       |
| created_at          | timestamptz  | -                     | now()             | Record creation timestamp                            | Metadata                |
| updated_at          | timestamptz  | -                     | now()             | Last update timestamp                                | Metadata                |
| created_by          | uuid         | FK                    | -                 | User who created record                              | Audit Data              |
| updated_by          | uuid         | FK                    | -                 | User who last updated record                         | Audit Data              |

## Advanced Aesthetic Compliance

**LGPD Status**: ✅ **Compliant** - Contains personal and professional data
**CFM Requirements**: Professional license validation and tracking for advanced aesthetic procedures
**Professional Council Compliance**: Integration with CRM, CRO, COREN systems for aesthetic specializations
**Data Retention**: Indefinite (professional records for regulatory compliance)

## Relationships

- `clinics.id` ← `professionals.clinic_id` (RESTRICT - preserve professional associations)
- `auth.users.id` ← `professionals.user_id` (RESTRICT - preserve authentication link)
- `service_types.id` ← `professionals.service_type_ids` (ARRAY FK - RESTRICT)
- `professionals.id` ← `professionals.created_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `professionals.updated_by` (RESTRICT - preserve audit trail)
- `appointments.professional_id` → `professionals.id` (RESTRICT - maintain appointment history)
- `medical_records.professional_id` → `professionals.id` (RESTRICT - preserve authorship)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Professional data protection

### Current Policies

```sql
-- Professionals access own profile
CREATE POLICY "professionals_own_profile" ON professionals
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Clinic staff access colleagues in same clinic
CREATE POLICY "clinic_staff_colleagues" ON professionals
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM professionals
      WHERE user_id = auth.uid()
    )
  );

-- Admins access all professionals in their clinic
CREATE POLICY "admin_clinic_professionals" ON professionals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = professionals.clinic_id
      AND p.role = 'admin'
    )
  );

-- Patient portal access (limited view)
CREATE POLICY "patients_view_professionals" ON professionals
  FOR SELECT USING (
    is_active = true AND
    clinic_id IN (
      SELECT clinic_id FROM patients
      WHERE auth.uid()::text = id::text
    )
  );
```

## Professional License Validation

### Brazilian Professional Councils

- **CRM**: Conselho Regional de Medicina (Medical Doctors)
- **CRO**: Conselho Regional de Odontologia (Dentists)
- **COREN**: Conselho Regional de Enfermagem (Nurses)
- **CREFITO**: Conselho Regional de Fisioterapia (Physiotherapists)
- **CRP**: Conselho Regional de Psicologia (Psychologists)
- **CRN**: Conselho Regional de Nutrição (Nutritionists)

### License Validation Process

```sql
-- Automatic license validation trigger
CREATE TRIGGER professional_license_validation_trigger
  BEFORE INSERT OR UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION validate_professional_license();

-- Professional council API integration
CREATE TRIGGER sync_professional_council_trigger
  AFTER INSERT OR UPDATE ON professionals
  FOR EACH ROW
  WHEN (NEW.license_number IS NOT NULL)
  EXECUTE FUNCTION sync_with_professional_council();
```

## Audit Requirements

**Triggers**: ✅ Professional activity and license tracking

```sql
-- Comprehensive audit trail
CREATE TRIGGER professionals_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER professionals_updated_at_trigger
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Professional status change tracking
CREATE TRIGGER professional_status_change_trigger
  AFTER UPDATE ON professionals
  FOR EACH ROW
  WHEN (OLD.is_active != NEW.is_active)
  EXECUTE FUNCTION log_professional_status_change();
```

## Work Schedule Management

### Default Schedule Configuration

- **Standard Hours**: 8:00 AM - 6:00 PM (configurable per professional)
- **Lunch Break**: 12:00 PM - 1:00 PM (configurable)
- **Weekend Work**: Optional flag for weekend availability
- **Service Types**: Array of procedures/services professional can perform

### Integration with Availability System

- Links to `professional_availability` table for detailed scheduling
- Integration with appointment conflict prevention
- Real-time availability calculation for booking system

## Performance Optimizations

### Indexes

```sql
-- Core professional queries
CREATE INDEX idx_professionals_clinic_active ON professionals (clinic_id, is_active);
CREATE INDEX idx_professionals_user_id ON professionals (user_id);
CREATE INDEX idx_professionals_license ON professionals (license_number);

-- Service type lookups
CREATE INDEX idx_professionals_service_types ON professionals USING GIN (service_type_ids);

-- Name search
CREATE INDEX idx_professionals_name_search ON professionals USING GIN (to_tsvector('portuguese', full_name));
```

### Service Type Array Operations

```sql
-- Check if professional can perform specific service
SELECT * FROM professionals
WHERE service_type_ids @> ARRAY['service-uuid']::uuid[];

-- Find professionals for multiple services
SELECT * FROM professionals
WHERE service_type_ids && ARRAY['service1', 'service2']::uuid[];
```

## Integration Points

### Authentication System

- **Supabase Auth**: Links to auth.users via user_id
- **Multi-factor Authentication**: Required for healthcare professionals
- **Session Management**: Professional activity tracking

### Professional Council APIs

- **Real-time License Validation**: Integration with Brazilian professional councils
- **Automatic Status Updates**: License expiration and suspension alerts
- **Compliance Monitoring**: Continuous professional qualification tracking

### Scheduling System

- **Availability Management**: Integration with professional_availability table
- **Conflict Prevention**: Real-time appointment scheduling validation
- **Workload Balancing**: AI-powered appointment distribution

## Security Features

### Data Protection

- **License Number Encryption**: Sensitive professional credentials protected
- **Role-based Access**: Granular permissions based on professional role
- **Audit Logging**: Complete tracking of professional data changes

### Professional Verification

- **License Validation**: Automatic verification with professional councils
- **Photo Verification**: Optional professional photo for identification
- **Digital Signature**: Integration with digital certificate systems

### Compliance Monitoring

- **CFM Compliance**: Federal Council of Medicine requirements
- **Professional Ethics**: Code of conduct enforcement
- **Continuing Education**: Professional development tracking

---

> **Professional Notice**: All professional data is protected under LGPD and professional council regulations. License validation is mandatory for healthcare service provision.

> **Integration**: This table serves as the foundation for professional authentication, scheduling, and regulatory compliance across the NeonPro platform.
