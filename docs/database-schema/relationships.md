# Table Relationships - NeonPro Healthcare Platform

## Overview
Foreign key relationships between tables, organized by domain and cascade actions for LGPD compliance.

## Core Business Relationships

### Clinic-Centric Relationships
- `clinics.id` ← `patients.clinic_id` (RESTRICT - preserve clinic integrity)
- `clinics.id` ← `professionals.clinic_id` (RESTRICT - maintain professional associations)
- `clinics.id` ← `appointments.clinic_id` (RESTRICT - preserve appointment history)
- `clinics.id` ← `services.clinic_id` (RESTRICT - maintain service catalog)
- `clinics.id` ← `rooms.clinic_id` (RESTRICT - preserve facility information)

### Patient-Centric Relationships
- `patients.id` ← `appointments.patient_id` (CASCADE DELETE - LGPD Right to Erasure)
- `patients.id` ← `medical_records.patient_id` (CASCADE DELETE - LGPD compliance)
- `patients.id` ← `consent_records.patient_id` (CASCADE DELETE - remove consent data)
- `patients.id` ← `patient_uploads.patient_id` (CASCADE DELETE - remove patient files)
- `patients.id` ← `treatment_plans.patient_id` (CASCADE DELETE - remove treatment data)
- `patients.id` ← `ai_no_show_predictions.patient_id` (CASCADE DELETE - remove AI predictions)

### Professional-Centric Relationships
- `professionals.id` ← `appointments.professional_id` (RESTRICT - preserve appointment history)
- `professionals.id` ← `medical_records.professional_id` (RESTRICT - maintain authorship record)
- `professionals.id` ← `ai_chat_sessions.professional_id` (RESTRICT - preserve AI interaction logs)
- `professionals.id` ← `professional_availability.professional_id` (CASCADE DELETE - remove availability)
- `professionals.id` ← `professional_certifications.professional_id` (CASCADE DELETE - remove certifications)

### Appointment-Centric Relationships  
- `appointments.id` ← `appointment_reminders.appointment_id` (CASCADE DELETE - remove reminders)
- `appointments.id` ← `no_show_predictions.appointment_id` (CASCADE DELETE - remove predictions)
- `appointments.id` ← `treatment_progress.appointment_id` (CASCADE DELETE - remove progress tracking)
- `appointments.id` ← `payment_transactions.appointment_id` (RESTRICT - preserve financial records)

## AI & Intelligence Relationships

### AI Chat System
- `ai_chat_sessions.id` ← `ai_chat_messages.session_id` (CASCADE DELETE - remove messages with session)
- `professionals.id` ← `ai_chat_sessions.professional_id` (RESTRICT - preserve professional interaction logs)
- `patients.id` ← `ai_chat_sessions.patient_id` (CASCADE DELETE - LGPD patient data removal)

### AI Predictions & Analytics
- `appointments.id` ← `ai_no_show_predictions.appointment_id` (CASCADE DELETE - remove predictions)
- `patients.id` ← `no_show_analytics.patient_id` (CASCADE DELETE - remove patient analytics)
- `ai_models.id` ← `ai_performance_metrics.model_id` (CASCADE DELETE - remove performance data)

### AI Training & Compliance
- `ai_training_data_audit.id` ← `ai_compliance_logs.training_audit_id` (RESTRICT - preserve compliance trail)
- `professionals.id` ← `ai_compliance_logs.reviewed_by` (RESTRICT - maintain reviewer record)

## Compliance & Audit Relationships

### LGPD Compliance
- `patients.id` ← `consent_records.patient_id` (CASCADE DELETE - remove consent on patient deletion)
- `consent_forms.id` ← `consent_records.form_id` (RESTRICT - preserve form templates)
- `data_subject_requests.id` ← `data_access_logs.request_id` (CASCADE DELETE - cleanup access logs)

### Audit Trail
- `audit_logs.id` ← `compliance_violations.audit_log_id` (RESTRICT - preserve violation evidence)
- `professionals.id` ← `audit_logs.performed_by` (RESTRICT - maintain accountability)
- `healthcare_audit_logs.id` ← `professional_compliance_assessments.audit_id` (RESTRICT - preserve assessments)

### Legal & Regulatory
- `regulatory_requirements.id` ← `compliance_tracking.requirement_id` (RESTRICT - maintain compliance mapping)
- `legal_documents.id` ← `consent_forms.legal_document_id` (RESTRICT - preserve legal basis)

## Financial Relationships

### Payment Processing
- `payment_gateways.id` ← `payment_transactions.gateway_id` (RESTRICT - preserve transaction records)
- `payment_methods.id` ← `payment_transactions.payment_method_id` (RESTRICT - maintain payment history)
- `appointments.id` ← `payment_transactions.appointment_id` (RESTRICT - link payments to services)

### Financial Analytics
- `payment_transactions.id` ← `payment_reconciliations.transaction_id` (RESTRICT - preserve reconciliation data)
- `clinics.id` ← `revenue_analytics.clinic_id` (RESTRICT - maintain financial reporting)

## Healthcare-Specific Relationships

### Medical Records
- `medical_records.id` ← `prescriptions.medical_record_id` (CASCADE DELETE - remove prescriptions with record)
- `medical_conditions.id` ← `medical_records.condition_id` (RESTRICT - preserve medical terminology)
- `medical_specialties.id` ← `professionals.specialty_id` (RESTRICT - maintain specialty classification)

### Treatment & Procedures
- `procedures.id` ← `treatment_plans.procedure_id` (RESTRICT - preserve procedure definitions)
- `treatment_plans.id` ← `treatment_progress.plan_id` (CASCADE DELETE - remove progress with plan)
- `services.id` ← `appointments.service_id` (RESTRICT - maintain service history)

## System & Infrastructure Relationships

### Authentication & Authorization
- `tenants.id` ← `clinics.tenant_id` (RESTRICT - preserve tenant structure)
- `profiles.id` ← `professionals.profile_id` (RESTRICT - maintain user profiles)
- `role_permissions.id` ← `professionals.role_id` (RESTRICT - preserve permission structure)

### Notifications & Communications
- `notification_templates.id` ← `appointment_reminders.template_id` (RESTRICT - preserve templates)
- `communication_templates.id` ← `campaign_executions.template_id` (RESTRICT - maintain campaign integrity)

### Integration & Sync
- `external_api_configurations.id` ← `calendar_sync_configs.api_config_id` (RESTRICT - preserve integration settings)
- `legacy_systems.id` ← `legacy_sync_logs.system_id` (RESTRICT - maintain sync history)

## Cascade Action Summary

### CASCADE DELETE (LGPD Compliance)
- Patient data removal: All patient-related records deleted when patient is deleted
- Consent cleanup: All consent records removed with patient data
- AI data removal: AI predictions and analytics deleted with patient data
- Session cleanup: Chat sessions and messages removed appropriately

### RESTRICT (Data Preservation)  
- Audit integrity: Audit logs and compliance records preserved
- Professional accountability: Professional associations maintained for legal requirements
- Financial records: Payment and transaction history preserved for tax/legal compliance
- Medical standards: Procedure definitions and medical terminology preserved

### SET NULL (Soft References)
- Optional associations where referential integrity is not critical
- Used for analytics and reporting relationships that shouldn't block deletions

---

> **LGPD Compliance Note**: CASCADE DELETE relationships ensure complete patient data removal for Right to Erasure compliance. RESTRICT relationships preserve audit trails and professional accountability as required by Brazilian healthcare regulations.

> **Performance Consideration**: Foreign key constraints are indexed for optimal query performance while maintaining referential integrity for healthcare data.