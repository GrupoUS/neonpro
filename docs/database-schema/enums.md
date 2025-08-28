# Custom Enum Types - NeonPro Healthcare Platform

## Overview
Custom enumeration types for standardized values across healthcare operations and compliance requirements.

## Healthcare Professional Enums

### professional_type
**Purpose**: Classification of healthcare professionals
**Values**: 
- `doctor` - Medical doctor (CRM required)
- `dentist` - Dental professional (CRO required)  
- `nurse` - Nursing professional (COREN required)
- `physiotherapist` - Physical therapy professional (CREFITO required)
- `psychologist` - Psychology professional (CRP required)
- `nutritionist` - Nutrition professional (CRN required)
- `aesthetician` - Aesthetic professional (specific certification required)
- `receptionist` - Front desk and administrative staff
- `manager` - Clinic management and supervisory roles

### professional_status
**Purpose**: Current status of healthcare professional
**Values**:
- `active` - Currently practicing and available
- `inactive` - Temporarily unavailable
- `suspended` - License suspended by regulatory body
- `pending_verification` - Awaiting license verification
- `retired` - No longer practicing

### license_status
**Purpose**: Status of professional license validation
**Values**:
- `valid` - License verified and current
- `expired` - License has expired  
- `suspended` - License suspended by regulatory body
- `pending` - License verification in progress
- `invalid` - License validation failed

## Patient & Appointment Enums

### appointment_status
**Purpose**: Current status of medical appointments
**Values**:
- `scheduled` - Appointment confirmed and scheduled
- `confirmed` - Patient confirmed attendance
- `checked_in` - Patient arrived and checked in
- `in_progress` - Consultation/treatment underway
- `completed` - Appointment finished successfully
- `cancelled` - Cancelled by patient or clinic
- `no_show` - Patient did not attend
- `rescheduled` - Moved to different date/time

### patient_status
**Purpose**: Current patient status in clinic
**Values**:
- `active` - Currently receiving care
- `inactive` - Not currently receiving care
- `discharged` - Treatment completed successfully  
- `transferred` - Moved to another clinic/professional
- `deceased` - Patient has passed away (for records retention)

### gender
**Purpose**: Patient gender classification (LGPD compliant)
**Values**:
- `male` - Male
- `female` - Female  
- `non_binary` - Non-binary
- `prefer_not_to_say` - Patient prefers not to disclose

## Medical & Treatment Enums

### treatment_status
**Purpose**: Status of medical treatments and procedures
**Values**:
- `planned` - Treatment plan created
- `in_progress` - Treatment underway
- `completed` - Treatment finished successfully
- `suspended` - Treatment temporarily halted
- `cancelled` - Treatment cancelled
- `failed` - Treatment unsuccessful

### urgency_level
**Purpose**: Medical urgency classification
**Values**:
- `routine` - Standard scheduled care
- `urgent` - Requires prompt attention  
- `emergency` - Immediate medical attention required
- `critical` - Life-threatening situation

### procedure_category
**Purpose**: Classification of medical procedures
**Values**:
- `consultation` - Medical consultation
- `diagnostic` - Diagnostic procedures
- `therapeutic` - Treatment procedures
- `surgical` - Surgical interventions
- `preventive` - Preventive care
- `aesthetic` - Cosmetic/aesthetic procedures

## Compliance & Audit Enums

### lgpd_data_category
**Purpose**: LGPD data classification
**Values**:
- `public` - Publicly available information
- `personal` - Personal data (LGPD Article 5, I)
- `sensitive` - Sensitive personal data (LGPD Article 5, II)  
- `health` - Health-related data (special category)
- `biometric` - Biometric identification data

### consent_status
**Purpose**: LGPD consent status
**Values**:
- `pending` - Consent request sent, awaiting response
- `granted` - Patient granted consent
- `denied` - Patient denied consent
- `withdrawn` - Patient withdrew consent
- `expired` - Consent period expired

### audit_action
**Purpose**: Types of auditable actions
**Values**:
- `create` - Record creation
- `read` - Data access/viewing
- `update` - Record modification
- `delete` - Record deletion
- `anonymize` - Data anonymization (LGPD)
- `export` - Data export/download
- `login` - System access
- `logout` - System exit

### compliance_status
**Purpose**: Compliance verification status
**Values**:
- `compliant` - Meets all requirements
- `non_compliant` - Fails compliance checks
- `partial` - Partially compliant
- `pending_review` - Awaiting compliance review
- `remediation_required` - Requires corrective action

## AI & Technology Enums

### ai_model_type
**Purpose**: Classification of AI models used
**Values**:
- `chat` - Conversational AI models
- `prediction` - Predictive analytics models
- `classification` - Data classification models
- `recommendation` - Recommendation engines
- `vision` - Computer vision models

### ai_confidence_level
**Purpose**: AI prediction confidence levels
**Values**:
- `very_low` - 0-20% confidence
- `low` - 21-40% confidence  
- `medium` - 41-60% confidence
- `high` - 61-80% confidence
- `very_high` - 81-100% confidence

### chat_role
**Purpose**: Participants in AI chat sessions
**Values**:
- `system` - System messages and instructions
- `user` - Healthcare professional input
- `assistant` - AI model responses
- `tool` - Function/tool execution results

## Financial & Payment Enums

### payment_status
**Purpose**: Status of financial transactions
**Values**:
- `pending` - Payment initiated, awaiting processing
- `processing` - Payment being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled
- `refunded` - Payment refunded to customer
- `disputed` - Payment under dispute

### payment_method_type
**Purpose**: Classification of payment methods
**Values**:
- `credit_card` - Credit card payment
- `debit_card` - Debit card payment
- `pix` - Brazilian instant payment system
- `bank_transfer` - Bank wire transfer
- `cash` - Cash payment
- `insurance` - Health insurance coverage

### transaction_type
**Purpose**: Type of financial transaction
**Values**:
- `payment` - Service payment
- `refund` - Money return
- `adjustment` - Price adjustment
- `fee` - Service or processing fee
- `discount` - Price reduction
- `tax` - Tax payment

## System & Infrastructure Enums

### notification_type
**Purpose**: Classification of system notifications
**Values**:
- `appointment_reminder` - Appointment reminders
- `system_alert` - System status alerts
- `compliance_warning` - Compliance notifications
- `payment_notification` - Payment-related notifications
- `emergency_alert` - Emergency system alerts

### integration_status
**Purpose**: Status of external system integrations
**Values**:
- `active` - Integration working normally
- `inactive` - Integration disabled
- `error` - Integration experiencing errors
- `maintenance` - Integration under maintenance
- `deprecated` - Integration being phased out

### data_retention_status
**Purpose**: Data retention policy status
**Values**:
- `active` - Data within retention period
- `archive_eligible` - Ready for archival
- `archived` - Data archived
- `deletion_eligible` - Ready for deletion
- `deleted` - Data permanently deleted

---

> **Healthcare Compliance**: All enums comply with Brazilian healthcare regulations and support LGPD data classification requirements. Values are designed to support audit trails and regulatory reporting.

> **Extensibility**: Enum types can be extended through ALTER TYPE commands while maintaining backward compatibility with existing data.