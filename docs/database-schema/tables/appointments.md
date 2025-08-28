# Appointments Table

## Schema

| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique appointment identifier | Public |
| clinic_id | uuid | FK, NOT NULL | - | Clinic reference | Organizational Data |
| patient_id | uuid | FK, NOT NULL | - | Patient reference | Personal Data |
| professional_id | uuid | FK, NOT NULL | - | Healthcare professional reference | Organizational Data |
| service_type_id | uuid | FK, NOT NULL | - | Service/procedure type reference | Health Data |
| status | varchar(50) | - | 'scheduled' | Appointment status | Metadata |
| start_time | timestamptz | NOT NULL | - | Appointment start time | Personal Data |
| end_time | timestamptz | NOT NULL | - | Appointment end time | Personal Data |
| notes | text | - | - | Appointment notes | Health Data |
| internal_notes | text | - | - | Internal staff notes | Health Data |
| reminder_sent_at | timestamptz | - | - | Email reminder timestamp | Metadata |
| confirmation_sent_at | timestamptz | - | - | Confirmation sent timestamp | Metadata |
| whatsapp_reminder_sent | boolean | - | false | WhatsApp reminder status | Metadata |
| sms_reminder_sent | boolean | - | false | SMS reminder status | Metadata |
| room_id | uuid | FK | - | Assigned room reference | Organizational Data |
| priority | integer | - | 1 | Appointment priority (1-5) | Metadata |
| created_at | timestamptz | - | now() | Record creation timestamp | Metadata |
| updated_at | timestamptz | - | now() | Last update timestamp | Metadata |
| created_by | uuid | FK, NOT NULL | - | User who created appointment | Audit Data |
| updated_by | uuid | FK | - | User who last updated appointment | Audit Data |
| cancelled_at | timestamptz | - | - | Cancellation timestamp | Metadata |
| cancelled_by | uuid | FK | - | User who cancelled appointment | Audit Data |
| cancellation_reason | text | - | - | Reason for cancellation | Health Data |

## Healthcare Compliance

**LGPD Status**: ✅ **Compliant** - Contains personal and health data
**ANVISA Requirements**: Appointment records for medical device software (Class IIa)
**Data Retention**: 7 years minimum (Brazilian medical records law)
**Audit Trail**: Complete appointment lifecycle tracking

## Relationships

- `clinics.id` ← `appointments.clinic_id` (RESTRICT - preserve appointment history)
- `patients.id` ← `appointments.patient_id` (CASCADE DELETE for LGPD erasure)
- `professionals.id` ← `appointments.professional_id` (RESTRICT - maintain professional history)
- `service_types.id` ← `appointments.service_type_id` (RESTRICT - preserve service definitions)
- `rooms.id` ← `appointments.room_id` (RESTRICT - maintain facility history)
- `professionals.id` ← `appointments.created_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `appointments.updated_by` (RESTRICT - preserve audit trail)
- `professionals.id` ← `appointments.cancelled_by` (RESTRICT - preserve cancellation audit)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Healthcare scheduling data protection

### Current Policies

```sql
-- Professionals access appointments in their clinic only
CREATE POLICY "professionals_clinic_appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.user_id = auth.uid() 
      AND p.clinic_id = appointments.clinic_id
      AND p.is_active = true
    )
  );

-- Professionals access their own appointments
CREATE POLICY "professionals_own_appointments" ON appointments
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Patients access own appointments only
CREATE POLICY "patients_own_appointments" ON appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE auth.uid()::text = id::text
    ) AND
    validate_lgpd_consent(patient_id, 'appointment_access') = true
  );

-- Reception staff access all clinic appointments
CREATE POLICY "reception_clinic_appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = appointments.clinic_id
      AND p.role IN ('receptionist', 'admin')
    )
  );
```

## Business Rules & Constraints

### Appointment Status Flow
Valid status transitions:
- `scheduled` → `confirmed`, `cancelled`, `rescheduled`
- `confirmed` → `checked_in`, `cancelled`, `no_show`
- `checked_in` → `in_progress`, `cancelled`
- `in_progress` → `completed`, `cancelled`
- `completed` → (final state)
- `no_show` → (final state, can reschedule)
- `cancelled` → `rescheduled` (if rebooking)

### Time Validation
- `end_time` must be after `start_time`
- Appointments cannot overlap for same professional
- Minimum appointment duration: 15 minutes
- Maximum appointment duration: 8 hours

### Scheduling Rules
- Cannot schedule appointments in the past
- Professional availability must be checked
- Room availability must be validated (if room assigned)
- Patient cannot have overlapping appointments

## Audit Requirements

**Triggers**: ✅ Full appointment lifecycle audit

```sql
-- Audit trigger for appointment changes
CREATE TRIGGER appointments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER appointments_updated_at_trigger
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- No-show prediction update
CREATE TRIGGER appointment_no_show_prediction_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_no_show_prediction();

-- Appointment conflict prevention
CREATE TRIGGER appointment_conflict_prevention_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_appointment_conflicts();
```

## AI Integration Features

### No-Show Prediction
- Automatic risk score calculation on appointment creation/update
- Integration with patient history and behavioral patterns
- Real-time updates based on appointment modifications

### Intelligent Scheduling
- AI-powered optimal time slot recommendations
- Professional workload balancing
- Patient preference learning and optimization

### Communication Automation
- Smart reminder scheduling based on patient preferences
- Multi-channel communication (WhatsApp, SMS, email)
- Confirmation tracking and follow-up automation

## Performance Optimizations

### Indexes
```sql
-- Core scheduling queries
CREATE INDEX idx_appointments_professional_time ON appointments (professional_id, start_time);
CREATE INDEX idx_appointments_patient_time ON appointments (patient_id, start_time);
CREATE INDEX idx_appointments_clinic_date ON appointments (clinic_id, DATE(start_time));
CREATE INDEX idx_appointments_status_time ON appointments (status, start_time);

-- Conflict prevention
CREATE INDEX idx_appointments_room_time ON appointments (room_id, start_time, end_time) WHERE room_id IS NOT NULL;

-- Analytics and reporting
CREATE INDEX idx_appointments_created_month ON appointments (DATE_TRUNC('month', created_at));
CREATE INDEX idx_appointments_no_show ON appointments (status) WHERE status = 'no_show';
```

## Integration Points

### Calendar Sync
- External calendar provider integration
- Bi-directional sync with Google Calendar, Outlook
- Conflict resolution for double-bookings

### Payment Integration
- Automatic payment transaction creation
- Integration with Brazilian payment gateways (PIX, cards)
- Insurance claim processing

### Communication Systems
- WhatsApp Business API integration
- SMS gateway for reminders
- Email notification system

## Compliance & Monitoring

### LGPD Compliance
- Patient consent validation for appointment access
- Automatic data retention policy enforcement
- Secure data sharing with patient consent

### Healthcare Regulations
- CFM compliance for medical appointment records
- ANVISA requirements for medical device software
- Professional license validation before scheduling

### Audit & Reporting
- Complete appointment lifecycle tracking
- Professional performance metrics
- Patient satisfaction and no-show analytics
- Financial reporting and reconciliation

---

> **Scheduling Notice**: All appointment modifications are tracked and audited. Healthcare professionals must maintain accurate records for regulatory compliance and patient safety.

> **Integration**: This table serves as the core scheduling engine, integrated with AI prediction systems, communication platforms, and financial processing systems.