# Consolidated Database Schema Documentation

## Overview

This document provides a comprehensive overview of the NeonPro aesthetic clinic management system database schema. The system is designed to support multi-professional collaboration, compliance management, and advanced treatment planning for aesthetic healthcare providers.

## Architecture Version: 6.0.0

### New in Version 6.0.0
- Multi-professional coordination system
- Cross-disciplinary team management
- Professional referral workflows
- Collaborative session management
- Inter-professional communication system
- Professional supervision and mentorship
- Scope validation and authorization
- Coordination protocols and automation

## Core Schema Groups

### 1. Clinic and Professional Management

#### clinics
Core clinic entity with detailed information and settings.

```sql
CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text UNIQUE,
  address text,
  phone text,
  email text,
  logo_url text,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### professionals
Enhanced professional information with multi-council support.

```sql
CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  professional_type text NOT NULL CHECK (professional_type IN ('doctor', 'nurse', 'pharmacist', 'aesthetician')),
  council_type text NOT NULL CHECK (council_type IN ('CFM', 'COREN', 'CFF', 'CNEP')),
  council_number text NOT NULL,
  council_state text NOT NULL,
  specialization text[] DEFAULT '{}',
  bio text,
  profile_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### clinic_professionals
Relationship table linking professionals to clinics with roles.

```sql
CREATE TABLE clinic_professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'professional', 'assistant')),
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Patient Management

#### patients
Comprehensive patient information with enhanced privacy features.

```sql
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  cns text UNIQUE, -- Cartão Nacional de Saúde
  cpf text UNIQUE, -- CPF for identification
  address text,
  emergency_contact jsonb DEFAULT '{}',
  medical_history jsonb DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  skin_type text CHECK (skin_type IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  fitzpatrick_scale text CHECK (fitzpatrick_scale IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  photo_consent boolean DEFAULT false,
  data_processing_consent boolean DEFAULT false,
  marketing_consent boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_documents
Patient document management with version control.

```sql
CREATE TABLE patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text NOT NULL,
  file_url text NOT NULL,
  description text,
  version integer DEFAULT 1,
  is_current boolean DEFAULT true,
  uploaded_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);
```

### 3. Service Management

#### service_categories
Aesthetic service categories for organization.

```sql
CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### service_types
Comprehensive aesthetic procedure definitions with TUSS codes.

```sql
CREATE TABLE service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  tuss_code text, -- TUSS procedure code
  duration_minutes integer NOT NULL,
  base_price numeric(10,2),
  requires_doctor boolean DEFAULT false,
  requires_nurse boolean DEFAULT false,
  requires_preparation boolean DEFAULT false,
  recovery_time_days integer DEFAULT 0,
  contraindications text[] DEFAULT '{}',
  side_effects text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4. Appointment Management

#### appointments
Enhanced appointment system with AI-powered features.

```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  service_type_id uuid REFERENCES service_types(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  price numeric(10,2),
  notes text,
  ai_predicted_no_show_prob numeric(3,2) DEFAULT 0.0,
  ai_risk_score numeric(3,2) DEFAULT 0.0,
  ai_intervention_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### appointment_history
Complete audit trail for appointment changes.

```sql
CREATE TABLE appointment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  change_type text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  change_reason text,
  changed_at timestamptz DEFAULT now()
);
```

### 5. Inventory Management

#### inventory_products
Comprehensive product tracking for aesthetic supplies.

```sql
CREATE TABLE inventory_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  sku text UNIQUE,
  barcode text,
  manufacturer text,
  anvisa_registration text, -- ANVISA registration number
  unit_type text NOT NULL CHECK (unit_type IN ('ml', 'units', 'mg', 'g')),
  unit_size numeric(10,3) NOT NULL,
  current_quantity numeric(10,3) DEFAULT 0,
  min_quantity numeric(10,3) DEFAULT 0,
  max_quantity numeric(10,3),
  reorder_point numeric(10,3),
  cost_per_unit numeric(10,2),
  selling_price_per_unit numeric(10,2),
  expiry_date date,
  batch_number text,
  storage_requirements text,
  requires_refrigeration boolean DEFAULT false,
  is_controlled_substance boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### inventory_transactions
Complete transaction history for audit trails.

```sql
CREATE TABLE inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES inventory_products(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'waste', 'transfer', 'return')),
  quantity numeric(10,3) NOT NULL,
  unit_cost numeric(10,2),
  transaction_date timestamptz DEFAULT now(),
  performed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  notes text,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  batch_number text,
  expiry_date date
);
```

#### inventory_alerts
Automated inventory management alerts.

```sql
CREATE TABLE inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES inventory_products(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expiring_soon', 'expired', 'reorder_needed')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
```

### 6. Treatment Planning System

#### treatment_plans
Comprehensive treatment planning for aesthetic procedures.

```sql
CREATE TABLE treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  treatment_goals text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'on_hold')),
  start_date date,
  estimated_completion_date date,
  actual_completion_date date,
  total_cost numeric(10,2),
  patient_satisfaction numeric(2,1),
  ai_recommended_procedures jsonb DEFAULT '{}',
  ai_risk_assessment jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### treatment_sessions
Individual session tracking within treatment plans.

```sql
CREATE TABLE treatment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id uuid REFERENCES treatment_plans(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  session_number integer NOT NULL,
  procedure_id uuid REFERENCES service_types(id) ON DELETE CASCADE,
  products_used jsonb DEFAULT '{}',
  notes text,
  outcome text,
  patient_feedback text,
  professional_notes text,
  photos_before text[] DEFAULT '{}',
  photos_after text[] DEFAULT '{}',
  side_effects text[] DEFAULT '{}',
  satisfaction_rating numeric(2,1),
  ai_treatment_assessment jsonb DEFAULT '{}',
  session_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

#### treatment_assessments
AI-powered assessment templates and results.

```sql
CREATE TABLE treatment_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id uuid REFERENCES treatment_plans(id) ON DELETE CASCADE,
  assessment_type text NOT NULL,
  assessment_data jsonb NOT NULL,
  ai_recommendations jsonb DEFAULT '{}',
  confidence_score numeric(3,2),
  performed_by uuid REFERENCES professionals(id) ON DELETE CASCADE,
  performed_at timestamptz DEFAULT now()
);
```

#### documentation_templates
Standardized documentation templates.

```sql
CREATE TABLE documentation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('consent_form', 'treatment_record', 'follow_up', 'discharge_summary')),
  template_content jsonb NOT NULL,
  required_fields text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 7. Multi-Professional Coordination System

#### professional_teams
Cross-disciplinary teams for collaboration.

```sql
CREATE TABLE professional_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  team_type text NOT NULL CHECK (team_type IN ('multidisciplinary', 'specialized', 'consultation', 'emergency')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### team_members
Team composition with roles and permissions.

```sql
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES professional_teams(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('leader', 'coordinator', 'member', 'consultant', 'supervisor')),
  permissions jsonb DEFAULT '{}',
  scope_limitations text[] DEFAULT '{}',
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### professional_referrals
Cross-professional referrals and consultations.

```sql
CREATE TABLE professional_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  referring_professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  referred_professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  referral_type text NOT NULL CHECK (referral_type IN ('consultation', 'treatment', 'assessment', 'supervision', 'second_opinion')),
  reason text NOT NULL,
  clinical_notes text,
  urgency_level text NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  response_notes text,
  response_deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### collaborative_sessions
Joint treatment and planning sessions.

```sql
CREATE TABLE collaborative_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  team_id uuid REFERENCES professional_teams(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('planning', 'treatment', 'assessment', 'follow_up', 'emergency')),
  title text NOT NULL,
  description text,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  location text,
  virtual_meeting_url text,
  facilitator_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### coordination_threads
Communication threads for coordination.

```sql
CREATE TABLE coordination_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  team_id uuid REFERENCES professional_teams(id) ON DELETE CASCADE,
  session_id uuid REFERENCES collaborative_sessions(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES professional_referrals(id) ON DELETE CASCADE,
  subject text NOT NULL,
  context_type text NOT NULL CHECK (context_type IN ('patient_care', 'treatment_planning', 'consultation', 'urgent', 'administrative')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_by uuid REFERENCES professionals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### coordination_messages
Secure messaging between professionals.

```sql
CREATE TABLE coordination_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES coordination_threads(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('text', 'clinical_note', 'image', 'document', 'referral_request', 'treatment_update')),
  content text,
  attachment_url text,
  is_sensitive boolean DEFAULT false,
  requires_acknowledgment boolean DEFAULT false,
  acknowledged_by uuid[] DEFAULT '{}',
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### professional_supervision
Supervision and mentorship relationships.

```sql
CREATE TABLE professional_supervision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  supervisee_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  supervision_type text NOT NULL CHECK (supervision_type IN ('clinical', 'administrative', 'mentorship', 'training')),
  scope text NOT NULL,
  requirements text[] DEFAULT '{}',
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'as_needed')),
  max_autonomy_level integer DEFAULT 1 CHECK (max_autonomy_level BETWEEN 1 AND 5),
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### professional_scope_validation
Professional scope authorization and validation.

```sql
CREATE TABLE professional_scope_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  procedure_id uuid REFERENCES service_types(id) ON DELETE CASCADE,
  medication_id uuid REFERENCES inventory_products(id) ON DELETE CASCADE,
  is_authorized boolean NOT NULL,
  authorization_level text CHECK (authorization_level IN ('independent', 'supervised', 'prohibited')),
  conditions text[] DEFAULT '{}',
  supervision_requirements text,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz,
  authorized_by uuid REFERENCES professionals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### coordination_protocols
Standardized coordination workflows.

```sql
CREATE TABLE coordination_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  protocol_type text NOT NULL CHECK (protocol_type IN ('emergency', 'consultation', 'referral', 'treatment_coordination', 'supervision')),
  trigger_conditions text[] DEFAULT '{}',
  required_professions text[] DEFAULT '{}',
  workflow_steps jsonb DEFAULT '{}',
  timeline_requirements jsonb DEFAULT '{}',
  documentation_requirements text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 8. Compliance Management System

#### compliance_categories
Regulatory compliance categories.

```sql
CREATE TABLE compliance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  regulatory_body text NOT NULL CHECK (regulatory_body IN ('LGPD', 'ANVISA', 'CFM', 'COREN', 'CFF', 'CNEP')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### compliance_requirements
Specific compliance requirements and standards.

```sql
CREATE TABLE compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES compliance_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  requirement_type text NOT NULL CHECK (requirement_type IN ('policy', 'procedure', 'documentation', 'training', 'technical')),
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed')),
  is_mandatory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### compliance_assessments
Compliance assessment tracking.

```sql
CREATE TABLE compliance_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  assessment_type text NOT NULL CHECK (assessment_type IN ('self_assessment', 'audit', 'inspection', 'review')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'requires_action')),
  score numeric(5,2),
  findings text[] DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  due_date date,
  assessed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  assessed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### data_consent_records
LGPD-compliant data consent management.

```sql
CREATE TABLE data_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('treatment', 'data_sharing', 'marketing', 'research', 'photography')),
  consent_given boolean DEFAULT false,
  consent_date timestamptz,
  expiry_date timestamptz,
  version integer DEFAULT 1,
  consent_document_url text,
  withdrawn_at timestamptz,
  withdrawn_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### compliance_reports
Automated compliance reporting.

```sql
CREATE TABLE compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('lgpd', 'anvisa', 'professional_council', 'internal_audit', 'risk_assessment')),
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'approved')),
  report_data jsonb,
  generated_at timestamptz,
  generated_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  approved_at timestamptz,
  approved_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  file_url text,
  created_at timestamptz DEFAULT now()
);
```

### 9. Financial Management

#### payments
Payment processing and tracking.

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'installment')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### 10. System Configuration

#### system_settings
System-wide configuration and settings.

```sql
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Database Functions and Triggers

### AI-Powered Functions

#### Anti-No-Show Prediction
```sql
CREATE OR REPLACE FUNCTION predict_no_show_probability(
  p_patient_id uuid,
  p_professional_id uuid,
  p_service_type_id uuid,
  p_appointment_time timestamptz
)
RETURNS numeric AS $$
  -- AI-powered no-show prediction logic
$$ LANGUAGE plpgsql;
```

#### Professional Scope Validation
```sql
CREATE OR REPLACE FUNCTION validate_professional_scope(
  p_professional_id uuid,
  p_procedure_id uuid,
  p_medication_id uuid
)
RETURNS TABLE(is_authorized boolean, authorization_level text, conditions text[]) AS $$
  -- Professional scope validation with supervision checks
$$ LANGUAGE plpgsql;
```

#### Compliance Check Automation
```sql
CREATE OR REPLACE FUNCTION run_compliance_checks(p_clinic_id uuid)
RETURNS void AS $$
  -- Automated compliance checking and alert generation
$$ LANGUAGE plpgsql;
```

### Automated Triggers

#### Appointment Status Changes
```sql
CREATE TRIGGER update_appointment_history
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_change();
```

#### Inventory Level Monitoring
```sql
CREATE TRIGGER check_inventory_levels
  AFTER INSERT OR UPDATE ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_inventory_alerts();
```

#### Referral Deadline Monitoring
```sql
CREATE TRIGGER check_referral_deadlines
  AFTER INSERT OR UPDATE ON professional_referrals
  FOR EACH ROW
  EXECUTE FUNCTION check_referral_response_deadline();
```

## Security and Compliance

### Row Level Security (RLS)

All tables implement Row Level Security (RLS) policies to ensure data privacy and compliance:

- **Clinic-based isolation**: Users can only access data from their clinic
- **Role-based permissions**: Different access levels based on professional roles
- **Patient privacy**: Strict controls on patient data access
- **Audit trails**: Complete logging of all data access and modifications

### Data Encryption

- **Encryption at rest**: All sensitive data encrypted in database
- **Encryption in transit**: TLS 1.3 for all API communications
- **Secure storage**: PHI and PII stored with enhanced security measures

### Compliance Features

- **LGPD Compliance**: Complete data subject rights management
- **ANVISA Integration**: Medical device and product tracking
- **Professional Council Support**: CFM, COREN, CFF, CNEP validation
- **Audit Trail**: Complete modification history for compliance reporting

## Performance Optimization

### Indexing Strategy

Comprehensive indexing for optimal query performance:

```sql
-- Primary and foreign key indexes automatically created
-- Additional performance indexes:
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, start_time);
CREATE INDEX idx_patients_clinic_search ON patients(clinic_id, name, email);
CREATE INDEX idx_professionals_clinic_type ON professionals(clinic_id, professional_type);
CREATE INDEX idx_inventory_clinic_product ON inventory_products(clinic_id, name);
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX idx_coordination_threads_patient ON coordination_threads(patient_id);
```

### Query Optimization

- **Materialized views** for complex analytics queries
- **Partitioning** for large tables (appointments, transactions)
- **Connection pooling** for high concurrent access
- **Query caching** for frequently accessed data

## Integration Points

### External System Integration

- **Supabase Auth**: User authentication and management
- **CopilotKit**: AI-powered assistance and automation
- **Payment Gateways**: Multiple payment processor support
- **Calendar Systems**: External calendar synchronization
- **Messaging Platforms**: SMS and email notifications

### API Integration

- **RESTful APIs**: Standard REST endpoints for external integration
- **Webhook Support**: Real-time event notifications
- **GraphQL**: Optional GraphQL interface for complex queries
- **SDK Support**: Client libraries for multiple platforms

## Backup and Recovery

### Backup Strategy

- **Automated daily backups**: Full database backups with point-in-time recovery
- **Incremental backups**: Hourly incremental backups for minimal data loss
- **Geographic redundancy**: Multi-region backup storage
- **Backup testing**: Regular recovery testing and validation

### Disaster Recovery

- **RTO < 1 hour**: Recovery Time Objective of less than 1 hour
- **RPO < 5 minutes**: Recovery Point Objective of less than 5 minutes
- **Failover automation**: Automatic failover to secondary region
- **Data consistency**: Cross-region data consistency guarantees

## Monitoring and Maintenance

### Performance Monitoring

- **Query performance tracking**: Slow query identification and optimization
- **Resource utilization monitoring**: CPU, memory, and storage monitoring
- **Connection pool monitoring**: Database connection optimization
- **Index performance tracking**: Index usage and effectiveness analysis

### Health Checks

- **Database connectivity**: Continuous database health monitoring
- **API endpoint monitoring**: External API health verification
- **Storage capacity monitoring**: Proactive storage management
- **Security monitoring**: Intrusion detection and prevention

## Future Enhancements

### Planned Features

- **Machine Learning Integration**: Advanced AI for treatment optimization
- **Blockchain Integration**: Enhanced security and audit trails
- **IoT Device Integration**: Smart device connectivity
- **Advanced Analytics**: Predictive modeling and business intelligence
- **Mobile Optimization**: Enhanced mobile experience

### Scalability Improvements

- **Horizontal scaling**: Multi-master database configuration
- **Read replicas**: Improved read performance and scalability
- **Microservices architecture**: Service decomposition for better scalability
- **Container orchestration**: Kubernetes-based deployment and scaling

## Conclusion

This consolidated database schema provides a comprehensive foundation for the NeonPro aesthetic clinic management system. The architecture supports multi-professional collaboration, comprehensive compliance management, and advanced treatment planning while maintaining strict security and performance standards.

The system is designed to scale with the growing needs of aesthetic clinics while maintaining the flexibility to adapt to changing regulatory requirements and technological advancements.

For detailed implementation guidance and API documentation, please refer to the respective documentation folders in the `/docs/` directory.