# Consolidated Database Schema Documentation

## Overview

This document provides a comprehensive overview of the NeonPro aesthetic clinic management system database schema. The system is designed to support multi-professional collaboration, compliance management, and advanced treatment planning for aesthetic healthcare providers.

## Architecture Version: 9.0.0

### New in Version 9.0.0
- Advanced analytics and business intelligence system
- Real-time dashboards and KPI tracking
- Predictive analytics and machine learning
- Data warehousing and aggregation
- Business intelligence and reporting
- Automated alerts and notifications
- Scheduled reports and distribution
- Data export and visualization
- Performance metrics and optimization
- Comparative analytics and benchmarking

### Version 8.0.0 Features
- Financial management system
- Brazilian tax compliance (ISS, PIS, COFINS, CSLL, IRPJ)
- Payment processing (PIX, boleto, credit card, installments)
- Professional commission management
- Financial reporting and analytics
- Revenue recognition and deferral
- Cost management and allocation
- Integration with accounting systems

### Version 7.0.0 Features
- Advanced patient engagement system
- Multi-channel communication management
- Patient journey tracking and scoring
- Loyalty programs and rewards
- Survey and feedback systems
- Campaign management and automation
- Template management and processing

### Version 6.0.0 Features
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

### 11. Patient Engagement System

#### patient_communication_preferences
Patient communication settings and preferences.

```sql
CREATE TABLE patient_communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT true,
  whatsapp_enabled boolean DEFAULT true,
  push_notifications_enabled boolean DEFAULT true,
  phone_call_enabled boolean DEFAULT false,
  preferred_language text DEFAULT 'pt-BR',
  contact_times jsonb DEFAULT '{"weekday": ["09:00-18:00"], "weekend": ["10:00-16:00"]}',
  do_not_contact boolean DEFAULT false,
  do_not_contact_reason text,
  do_not_contact_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_communication_history
Complete communication history and tracking.

```sql
CREATE TABLE patient_communication_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  communication_type text NOT NULL CHECK (communication_type IN ('email', 'sms', 'whatsapp', 'push_notification', 'phone_call')),
  channel text NOT NULL,
  message_content text,
  template_id uuid,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  failed_reason text,
  cost numeric(10,4),
  metadata jsonb DEFAULT '{}'
);
```

#### communication_templates
Reusable communication templates with variables.

```sql
CREATE TABLE communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  template_type text NOT NULL CHECK (template_type IN ('email', 'sms', 'whatsapp', 'push_notification', 'phone_call')),
  content text NOT NULL,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_journey_stages
Patient lifecycle tracking and engagement scoring.

```sql
CREATE TABLE patient_journey_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  journey_stage text NOT NULL CHECK (journey_stage IN ('lead', 'new', 'active', 'lapsed', 'loyal', 'advocate')),
  engagement_score numeric(3,1) DEFAULT 0.0,
  satisfaction_score numeric(3,1),
  risk_score numeric(3,1) DEFAULT 0.0,
  last_appointment_date timestamptz,
  next_appointment_date timestamptz,
  total_appointments integer DEFAULT 0,
  total_spend numeric(10,2) DEFAULT 0.0,
  preferred_services text[] DEFAULT '{}',
  communication_frequency integer DEFAULT 30, -- days
  loyalty_tier text DEFAULT 'standard' CHECK (loyalty_tier IN ('standard', 'bronze', 'silver', 'gold', 'platinum')),
  stage_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_engagement_actions
Patient interaction tracking and points earning.

```sql
CREATE TABLE patient_engagement_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('appointment_completed', 'review_left', 'referral_made', 'survey_completed', 'campaign_responded', 'social_media_interaction', 'loyalty_redemption')),
  action_details jsonb DEFAULT '{}',
  points_earned integer DEFAULT 0,
  points_multiplier numeric(3,2) DEFAULT 1.0,
  referral_source text,
  campaign_id uuid,
  created_at timestamptz DEFAULT now()
);
```

#### loyalty_programs
Loyalty program configuration and rules.

```sql
CREATE TABLE loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  points_to_currency_rate numeric(10,4) DEFAULT 0.01,
  tiers jsonb DEFAULT '[
    {"name": "standard", "min_points": 0, "multiplier": 1.0, "benefits": []},
    {"name": "bronze", "min_points": 100, "multiplier": 1.1, "benefits": []},
    {"name": "silver", "min_points": 500, "multiplier": 1.2, "benefits": []},
    {"name": "gold", "min_points": 1000, "multiplier": 1.3, "benefits": []},
    {"name": "platinum", "min_points": 2500, "multiplier": 1.5, "benefits": []}
  ]',
  earning_rules jsonb DEFAULT '[]',
  redemption_rules jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_points_balance
Individual patient points tracking and management.

```sql
CREATE TABLE patient_points_balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  program_id uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  current_balance integer DEFAULT 0,
  lifetime_earned integer DEFAULT 0,
  lifetime_redeemed integer DEFAULT 0,
  last_earned_at timestamptz,
  last_redeemed_at timestamptz,
  points_expiry_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_surveys
Survey creation and configuration.

```sql
CREATE TABLE patient_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  survey_type text NOT NULL CHECK (survey_type IN ('satisfaction', 'feedback', 'nps', 'experience', 'specific_treatment')),
  questions jsonb NOT NULL,
  trigger_conditions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  anonymous boolean DEFAULT false,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### patient_survey_responses
Survey response collection and analysis.

```sql
CREATE TABLE patient_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES patient_surveys(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  responses jsonb NOT NULL,
  satisfaction_score numeric(3,1),
  nps_score integer CHECK (nps_score BETWEEN 0 AND 10),
  sentiment_score numeric(3,2),
  completed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);
```

#### engagement_campaigns
Campaign management and execution.

```sql
CREATE TABLE engagement_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  campaign_type text NOT NULL CHECK (campaign_type IN ('reactivation', 'promotion', 'education', 'reminder', 'birthday', 'loyalty')),
  target_audience jsonb DEFAULT '{}',
  campaign_flow jsonb NOT NULL,
  schedule jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  budget numeric(10,2),
  metrics jsonb DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "responded": 0}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### reengagement_triggers
Automated reengagement workflow triggers.

```sql
CREATE TABLE reengagement_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  trigger_name text NOT NULL,
  trigger_condition jsonb NOT NULL,
  action_workflow jsonb NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### campaign_analytics
Campaign performance and effectiveness metrics.

```sql
CREATE TABLE campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES engagement_campaigns(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  metrics jsonb NOT NULL,
  audience_size integer,
  sent_count integer,
  delivered_count integer,
  opened_count integer,
  clicked_count integer,
  responded_count integer,
  conversion_count integer,
  revenue_generated numeric(10,2),
  cost numeric(10,2),
  roi numeric(10,2),
  created_at timestamptz DEFAULT now()
);
```

### 12. Financial Management System

#### financial_transactions
Complete financial transaction tracking.

```sql
CREATE TABLE financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('revenue', 'expense', 'transfer', 'adjustment', 'refund', 'commission')),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'BRL',
  description text,
  category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
  cost_center_id uuid REFERENCES cost_centers(id) ON DELETE SET NULL,
  reference_id uuid, -- appointment_id, patient_id, etc.
  reference_type text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_date timestamptz DEFAULT now(),
  processed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### payment_methods
Payment method configuration and management.

```sql
CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  method_name text NOT NULL,
  method_type text NOT NULL CHECK (method_type IN ('pix', 'credit_card', 'debit_card', 'boleto', 'bank_transfer', 'installment', 'cash')),
  is_active boolean DEFAULT true,
  provider_config jsonb DEFAULT '{}',
  fees jsonb DEFAULT '{"percentage": 0.0, "fixed": 0.0}',
  daily_limit numeric(10,2),
  min_amount numeric(10,2),
  max_amount numeric(10,2),
  settlement_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### tax_configurations
Brazilian tax configuration and rates.

```sql
CREATE TABLE tax_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  tax_type text NOT NULL CHECK (tax_type IN ('iss', 'pis', 'cofins', 'csll', 'irpj', 'icms', 'ipi')),
  tax_name text NOT NULL,
  rate numeric(5,4) NOT NULL,
  calculation_base text NOT NULL CHECK (calculation_base IN ('gross', 'net', 'specific')),
  is_active boolean DEFAULT true,
  valid_from date NOT NULL,
  valid_until date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### commission_rules
Professional commission calculation rules.

```sql
CREATE TABLE commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  commission_type text NOT NULL CHECK (commission_type IN ('percentage', 'fixed', 'tiered', 'hybrid')),
  commission_value numeric(10,2) NOT NULL,
  applies_to text NOT NULL CHECK (applies_to IN ('services', 'products', 'packages', 'all')),
  professional_types text[] DEFAULT '{doctor}', -- CFM, COREN, CFF, CNEP
  service_categories text[] DEFAULT '{}',
  minimum_amount numeric(10,2) DEFAULT 0.0,
  maximum_amount numeric(10,2),
  conditions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  valid_from date NOT NULL,
  valid_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### commission_payments
Commission payment tracking.

```sql
CREATE TABLE commission_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES financial_transactions(id) ON DELETE CASCADE,
  commission_rule_id uuid REFERENCES commission_rules(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  percentage numeric(5,4),
  calculation_base numeric(10,2),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid', 'cancelled')),
  payment_date timestamptz,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### revenue_recognition
Revenue recognition and deferral management.

```sql
CREATE TABLE revenue_recognition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES financial_transactions(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  recognized_amount numeric(10,2) DEFAULT 0.0,
  deferred_amount numeric(10,2),
  recognition_schedule jsonb NOT NULL,
  recognition_period text NOT NULL CHECK (recognition_period IN ('immediate', 'monthly', 'quarterly', 'custom')),
  start_date date NOT NULL,
  end_date date,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### financial_categories
Financial category and account management.

```sql
CREATE TABLE financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category_type text NOT NULL CHECK (category_type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
  parent_category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
  code text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### cost_centers
Cost center configuration and allocation.

```sql
CREATE TABLE cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES professionals(id) ON DELETE SET NULL,
  budget numeric(10,2),
  allocation_method text DEFAULT 'percentage' CHECK (allocation_method IN ('percentage', 'fixed', 'usage')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### financial_reports
Financial report configuration.

```sql
CREATE TABLE financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  report_type text NOT NULL CHECK (report_type IN ('income_statement', 'balance_sheet', 'cash_flow', 'trial_balance', 'custom')),
  configuration jsonb NOT NULL,
  schedule jsonb DEFAULT '{}',
  last_generated_at timestamptz,
  file_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### payment_reconciliation
Payment reconciliation tracking.

```sql
CREATE TABLE payment_reconciliation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  reconciliation_date date NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE CASCADE,
  expected_amount numeric(10,2) NOT NULL,
  actual_amount numeric(10,2) NOT NULL,
  discrepancy numeric(10,2),
  discrepancy_reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reconciled', 'failed')),
  reconciled_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

#### financial_audit_trail
Complete financial audit trail.

```sql
CREATE TABLE financial_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  performed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  performed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);
```

### 13. Analytics and Business Intelligence System

#### analytics_configurations
Analytics system configuration and settings.

```sql
CREATE TABLE analytics_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  config_type text NOT NULL CHECK (config_type IN ('data_warehouse', 'predictive', 'reporting', 'alerting')),
  name text NOT NULL,
  description text,
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### kpi_definitions
KPI definitions and threshold configurations.

```sql
CREATE TABLE kpi_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('financial', 'clinical', 'operational', 'patient')),
  metric_type text NOT NULL CHECK (metric_type IN ('count', 'percentage', 'currency', 'rating', 'time')),
  target_value numeric,
  warning_threshold numeric,
  critical_threshold numeric,
  calculation_method text NOT NULL,
  aggregation_type text NOT NULL CHECK (aggregation_type IN ('sum', 'average', 'max', 'min', 'count')),
  refresh_interval integer DEFAULT 3600,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### analytics_data_warehouse
Centralized data warehouse for all metrics.

```sql
CREATE TABLE analytics_data_warehouse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  date_date date NOT NULL,
  hour integer,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_category text NOT NULL,
  dimension_1 text,
  dimension_2 text,
  dimension_3 text,
  source_system text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### bi_dashboards
Business intelligence dashboard configurations.

```sql
CREATE TABLE bi_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  layout text NOT NULL CHECK (layout IN ('grid', 'freeform')),
  filters jsonb DEFAULT '{}',
  refresh_interval integer,
  is_public boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### dashboard_widgets
Dashboard widget definitions and layouts.

```sql
CREATE TABLE dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid REFERENCES bi_dashboards(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  title text NOT NULL,
  description text,
  position jsonb NOT NULL,
  configuration jsonb NOT NULL,
  data_source jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### scheduled_reports
Automated report scheduling and configuration.

```sql
CREATE TABLE scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  report_type text NOT NULL CHECK (report_type IN ('kpi', 'dashboard', 'custom')),
  configuration jsonb NOT NULL,
  schedule jsonb NOT NULL,
  delivery jsonb NOT NULL,
  is_active boolean DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### predictive_models
Machine learning model configurations.

```sql
CREATE TABLE predictive_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  model_type text NOT NULL CHECK (model_type IN ('no_show', 'revenue', 'patient_behavior', 'treatment_outcome', 'resource_optimization')),
  algorithm text NOT NULL,
  features text[] NOT NULL,
  target_variable text NOT NULL,
  hyperparameters jsonb DEFAULT '{}',
  training_config jsonb DEFAULT '{}',
  model_metrics jsonb,
  is_active boolean DEFAULT true,
  trained_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### analytics_alerts
Alert system configuration and history.

```sql
CREATE TABLE analytics_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  kpi_id uuid REFERENCES kpi_definitions(id) ON DELETE SET NULL,
  condition jsonb NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notification jsonb NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### data_export_requests
Data export request tracking.

```sql
CREATE TABLE data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  data_source jsonb NOT NULL,
  format text NOT NULL CHECK (format IN ('csv', 'excel', 'json', 'pdf')),
  filters jsonb DEFAULT '{}',
  columns text[] DEFAULT '{}',
  schedule jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_url text,
  file_metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### analytics_events
Analytics event tracking and logging.

```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_category text NOT NULL,
  event_data jsonb DEFAULT '{}',
  user_id uuid,
  session_id text,
  timestamp timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);
```

#### performance_metrics
Performance metrics collection.

```sql
CREATE TABLE performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);
```

#### comparative_analytics
Benchmarking and comparative data.

```sql
CREATE TABLE comparative_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  benchmark_type text NOT NULL CHECK (benchmark_type IN ('industry', 'region', 'size', 'custom')),
  metrics jsonb NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  comparison_data jsonb NOT NULL,
  variance jsonb,
  percentiles jsonb,
  insights jsonb,
  created_at timestamptz DEFAULT now()
);
```

### 14. System Configuration

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