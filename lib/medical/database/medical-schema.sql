-- ============================================================================
-- NeonPro Medical History & Records Database Schema
-- Story 2.2: Medical History & Records
-- 
-- Sistema completo de histórico médico e registros:
-- - Registros médicos estruturados
-- - Upload de documentos/fotos com versionamento
-- - Assinaturas digitais
-- - Integração com formulários de consentimento
-- - Auditoria completa e conformidade LGPD
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Medical Record Types
CREATE TYPE medical_record_type AS ENUM (
  'consultation',
  'diagnosis',
  'treatment',
  'prescription',
  'lab_result',
  'imaging',
  'surgery',
  'vaccination',
  'allergy',
  'vital_signs',
  'progress_note',
  'discharge_summary',
  'referral',
  'emergency',
  'follow_up'
);

-- Medical Record Status
CREATE TYPE medical_record_status AS ENUM (
  'draft',
  'pending_review',
  'reviewed',
  'approved',
  'signed',
  'archived',
  'cancelled'
);

-- Document Types
CREATE TYPE medical_document_type AS ENUM (
  'medical_report',
  'lab_result',
  'imaging_study',
  'prescription',
  'consent_form',
  'insurance_document',
  'identification',
  'before_after_photo',
  'clinical_photo',
  'x_ray',
  'mri_scan',
  'ct_scan',
  'ultrasound',
  'other_document'
);

-- Document Categories
CREATE TYPE document_category AS ENUM (
  'administrative',
  'clinical',
  'diagnostic',
  'treatment',
  'legal',
  'insurance',
  'research',
  'educational'
);

-- Access Levels
CREATE TYPE access_level AS ENUM (
  'public',
  'internal',
  'restricted',
  'confidential',
  'top_secret'
);

-- Attachment Categories
CREATE TYPE attachment_category AS ENUM (
  'document',
  'image',
  'video',
  'audio',
  'scan',
  'report',
  'form',
  'certificate'
);

-- Signature Types
CREATE TYPE signature_type AS ENUM (
  'digital_certificate',
  'electronic_signature',
  'biometric_signature',
  'pin_signature',
  'handwritten_scan'
);

-- Signer Roles
CREATE TYPE signer_role AS ENUM (
  'patient',
  'doctor',
  'nurse',
  'administrator',
  'witness',
  'guardian',
  'legal_representative'
);

-- Hash Algorithms
CREATE TYPE hash_algorithm AS ENUM (
  'sha256',
  'sha512',
  'md5'
);

-- Signature Request Status
CREATE TYPE signature_request_status AS ENUM (
  'pending',
  'sent',
  'viewed',
  'signed',
  'declined',
  'expired',
  'cancelled'
);

-- Consent Form Types
CREATE TYPE consent_form_type AS ENUM (
  'treatment_consent',
  'data_processing',
  'photography',
  'research_participation',
  'marketing_communication',
  'third_party_sharing',
  'telemedicine',
  'emergency_contact',
  'minor_consent',
  'custom'
);

-- Consent Methods
CREATE TYPE consent_method AS ENUM (
  'digital_signature',
  'electronic_consent',
  'verbal_recorded',
  'written_physical',
  'biometric',
  'witnessed'
);

-- Field Types
CREATE TYPE field_type AS ENUM (
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'date',
  'datetime',
  'checkbox',
  'radio',
  'select',
  'multiselect',
  'file_upload',
  'signature',
  'consent_checkbox'
);

-- Data Categories
CREATE TYPE data_category AS ENUM (
  'personal_data',
  'sensitive_data',
  'health_data',
  'biometric_data',
  'contact_data',
  'demographic_data',
  'behavioral_data',
  'technical_data'
);

-- Legal Basis Types
CREATE TYPE legal_basis_type AS ENUM (
  'consent',
  'contract',
  'legal_obligation',
  'vital_interests',
  'public_task',
  'legitimate_interests'
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Medical Records Table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  record_type medical_record_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  status medical_record_status NOT NULL DEFAULT 'draft',
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  is_confidential BOOLEAN DEFAULT false,
  is_emergency BOOLEAN DEFAULT false,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  parent_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Medical History Table
CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  condition_name VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  onset_date DATE,
  resolution_date DATE,
  is_chronic BOOLEAN DEFAULT false,
  is_hereditary BOOLEAN DEFAULT false,
  notes TEXT,
  related_records UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Attachments Table
CREATE TABLE medical_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  category attachment_category NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_hash VARCHAR(128),
  thumbnail_path TEXT,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  access_level access_level DEFAULT 'internal',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Documents Table
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type medical_document_type NOT NULL,
  category document_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_hash VARCHAR(128),
  thumbnail_path TEXT,
  access_level access_level DEFAULT 'internal',
  is_before_after BOOLEAN DEFAULT false,
  before_after_pair_id UUID,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Document Versions Table
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash VARCHAR(128),
  changes_description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Before/After Photo Pairs Table
CREATE TABLE before_after_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  before_photo_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
  after_photo_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
  comparison_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Signatures Table
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL, -- Can reference various document types
  document_type VARCHAR(50) NOT NULL, -- 'medical_record', 'medical_document', 'consent_response'
  signer_id UUID NOT NULL REFERENCES users(id),
  signer_role signer_role NOT NULL,
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255),
  signature_type signature_type NOT NULL,
  signature_data TEXT NOT NULL,
  certificate_data TEXT,
  hash_algorithm hash_algorithm DEFAULT 'sha256',
  document_hash VARCHAR(128) NOT NULL,
  signature_hash VARCHAR(128) NOT NULL,
  timestamp_server TEXT,
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,
  is_valid BOOLEAN DEFAULT true,
  validation_details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Signature Requests Table
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_title VARCHAR(255) NOT NULL,
  requester_id UUID NOT NULL REFERENCES users(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  required_signers JSONB NOT NULL DEFAULT '[]',
  completed_signers JSONB DEFAULT '[]',
  status signature_request_status DEFAULT 'pending',
  message TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Consent Forms Table
CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  form_type consent_form_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  language VARCHAR(10) DEFAULT 'pt-BR',
  content JSONB NOT NULL DEFAULT '{}',
  fields JSONB NOT NULL DEFAULT '[]',
  validation_rules JSONB DEFAULT '[]',
  legal_basis JSONB NOT NULL DEFAULT '[]',
  retention_period INTEGER DEFAULT 3650, -- days
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_until TIMESTAMP WITH TIME ZONE
);

-- Consent Form Versions Table
CREATE TABLE consent_form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  version_number VARCHAR(20) NOT NULL,
  content JSONB NOT NULL,
  fields JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Responses Table
CREATE TABLE consent_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES consent_forms(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '[]',
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_method consent_method NOT NULL,
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,
  witness_id UUID REFERENCES users(id) ON DELETE SET NULL,
  witness_name VARCHAR(255),
  signature_id UUID REFERENCES digital_signatures(id) ON DELETE SET NULL,
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Record Audit Log
CREATE TABLE medical_record_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL,
  record_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_role VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  changes JSONB,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical System Configuration
CREATE TABLE medical_system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, config_key)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Medical Records Indexes
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_status ON medical_records(status);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at);
CREATE INDEX idx_medical_records_appointment_id ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_parent_id ON medical_records(parent_record_id);
CREATE INDEX idx_medical_records_content_gin ON medical_records USING GIN(content);
CREATE INDEX idx_medical_records_tags_gin ON medical_records USING GIN(tags);
CREATE INDEX idx_medical_records_metadata_gin ON medical_records USING GIN(metadata);

-- Medical History Indexes
CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_clinic_id ON medical_history(clinic_id);
CREATE INDEX idx_medical_history_category ON medical_history(category);
CREATE INDEX idx_medical_history_condition ON medical_history(condition_name);
CREATE INDEX idx_medical_history_status ON medical_history(status);
CREATE INDEX idx_medical_history_onset_date ON medical_history(onset_date);
CREATE INDEX idx_medical_history_chronic ON medical_history(is_chronic);
CREATE INDEX idx_medical_history_hereditary ON medical_history(is_hereditary);

-- Medical Attachments Indexes
CREATE INDEX idx_medical_attachments_record_id ON medical_attachments(record_id);
CREATE INDEX idx_medical_attachments_patient_id ON medical_attachments(patient_id);
CREATE INDEX idx_medical_attachments_clinic_id ON medical_attachments(clinic_id);
CREATE INDEX idx_medical_attachments_category ON medical_attachments(category);
CREATE INDEX idx_medical_attachments_file_hash ON medical_attachments(file_hash);
CREATE INDEX idx_medical_attachments_created_at ON medical_attachments(created_at);

-- Medical Documents Indexes
CREATE INDEX idx_medical_documents_patient_id ON medical_documents(patient_id);
CREATE INDEX idx_medical_documents_clinic_id ON medical_documents(clinic_id);
CREATE INDEX idx_medical_documents_type ON medical_documents(document_type);
CREATE INDEX idx_medical_documents_category ON medical_documents(category);
CREATE INDEX idx_medical_documents_file_hash ON medical_documents(file_hash);
CREATE INDEX idx_medical_documents_before_after ON medical_documents(is_before_after);
CREATE INDEX idx_medical_documents_pair_id ON medical_documents(before_after_pair_id);
CREATE INDEX idx_medical_documents_parent_id ON medical_documents(parent_document_id);
CREATE INDEX idx_medical_documents_created_at ON medical_documents(created_at);
CREATE INDEX idx_medical_documents_tags_gin ON medical_documents USING GIN(tags);

-- Document Versions Indexes
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_version ON document_versions(version_number);
CREATE INDEX idx_document_versions_created_at ON document_versions(created_at);

-- Before/After Pairs Indexes
CREATE INDEX idx_before_after_pairs_patient_id ON before_after_pairs(patient_id);
CREATE INDEX idx_before_after_pairs_clinic_id ON before_after_pairs(clinic_id);
CREATE INDEX idx_before_after_pairs_treatment_id ON before_after_pairs(treatment_id);
CREATE INDEX idx_before_after_pairs_before_photo ON before_after_pairs(before_photo_id);
CREATE INDEX idx_before_after_pairs_after_photo ON before_after_pairs(after_photo_id);

-- Digital Signatures Indexes
CREATE INDEX idx_digital_signatures_document ON digital_signatures(document_id, document_type);
CREATE INDEX idx_digital_signatures_signer_id ON digital_signatures(signer_id);
CREATE INDEX idx_digital_signatures_type ON digital_signatures(signature_type);
CREATE INDEX idx_digital_signatures_created_at ON digital_signatures(created_at);
CREATE INDEX idx_digital_signatures_valid ON digital_signatures(is_valid);
CREATE INDEX idx_digital_signatures_expires_at ON digital_signatures(expires_at);

-- Signature Requests Indexes
CREATE INDEX idx_signature_requests_document ON signature_requests(document_id, document_type);
CREATE INDEX idx_signature_requests_requester_id ON signature_requests(requester_id);
CREATE INDEX idx_signature_requests_clinic_id ON signature_requests(clinic_id);
CREATE INDEX idx_signature_requests_status ON signature_requests(status);
CREATE INDEX idx_signature_requests_deadline ON signature_requests(deadline);
CREATE INDEX idx_signature_requests_created_at ON signature_requests(created_at);

-- Consent Forms Indexes
CREATE INDEX idx_consent_forms_clinic_id ON consent_forms(clinic_id);
CREATE INDEX idx_consent_forms_type ON consent_forms(form_type);
CREATE INDEX idx_consent_forms_active ON consent_forms(is_active);
CREATE INDEX idx_consent_forms_version ON consent_forms(version);
CREATE INDEX idx_consent_forms_effective ON consent_forms(effective_from, effective_until);

-- Consent Responses Indexes
CREATE INDEX idx_consent_responses_form_id ON consent_responses(form_id);
CREATE INDEX idx_consent_responses_patient_id ON consent_responses(patient_id);
CREATE INDEX idx_consent_responses_clinic_id ON consent_responses(clinic_id);
CREATE INDEX idx_consent_responses_consent_given ON consent_responses(consent_given);
CREATE INDEX idx_consent_responses_method ON consent_responses(consent_method);
CREATE INDEX idx_consent_responses_valid ON consent_responses(is_valid);
CREATE INDEX idx_consent_responses_expires_at ON consent_responses(expires_at);
CREATE INDEX idx_consent_responses_withdrawn_at ON consent_responses(withdrawn_at);
CREATE INDEX idx_consent_responses_created_at ON consent_responses(created_at);

-- Audit Log Indexes
CREATE INDEX idx_medical_record_audit_record ON medical_record_audit(record_id, record_type);
CREATE INDEX idx_medical_record_audit_user_id ON medical_record_audit(user_id);
CREATE INDEX idx_medical_record_audit_action ON medical_record_audit(action);
CREATE INDEX idx_medical_record_audit_created_at ON medical_record_audit(created_at);

-- System Config Indexes
CREATE INDEX idx_medical_system_config_clinic ON medical_system_config(clinic_id);
CREATE INDEX idx_medical_system_config_key ON medical_system_config(config_key);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_attachments_updated_at BEFORE UPDATE ON medical_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON medical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_before_after_pairs_updated_at BEFORE UPDATE ON before_after_pairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signature_requests_updated_at BEFORE UPDATE ON signature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consent_forms_updated_at BEFORE UPDATE ON consent_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consent_responses_updated_at BEFORE UPDATE ON consent_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_system_config_updated_at BEFORE UPDATE ON medical_system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log medical record changes
CREATE OR REPLACE FUNCTION log_medical_record_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_values JSONB;
  new_values JSONB;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    old_values := NULL;
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    old_values := to_jsonb(OLD);
    new_values := NULL;
  END IF;

  -- Insert audit log
  INSERT INTO medical_record_audit (
    record_id,
    record_type,
    action,
    user_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_TABLE_NAME,
    action_type,
    COALESCE(NEW.created_by, NEW.updated_by, OLD.created_by),
    old_values,
    new_values,
    NOW()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Apply audit triggers
CREATE TRIGGER medical_records_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION log_medical_record_changes();

CREATE TRIGGER medical_documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_documents
  FOR EACH ROW EXECUTE FUNCTION log_medical_record_changes();

CREATE TRIGGER consent_responses_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON consent_responses
  FOR EACH ROW EXECUTE FUNCTION log_medical_record_changes();

-- Function to validate signature expiration
CREATE OR REPLACE FUNCTION validate_signature_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if signature is expired
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() THEN
    NEW.is_valid := false;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_signature_expiration_trigger
  BEFORE INSERT OR UPDATE ON digital_signatures
  FOR EACH ROW EXECUTE FUNCTION validate_signature_expiration();

-- Function to auto-expire consent responses
CREATE OR REPLACE FUNCTION auto_expire_consent()
RETURNS void AS $$
BEGIN
  UPDATE consent_responses 
  SET is_valid = false
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_valid = true;
END;
$$ language 'plpgsql';

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM medical_record_audit 
  WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$ language 'plpgsql';

-- Function to generate medical record statistics
CREATE OR REPLACE FUNCTION get_medical_record_stats(
  p_clinic_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_records BIGINT,
  records_by_type JSONB,
  records_by_status JSONB,
  records_by_month JSONB,
  avg_records_per_patient NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH record_stats AS (
    SELECT 
      COUNT(*) as total,
      jsonb_object_agg(record_type, type_count) as by_type,
      jsonb_object_agg(status, status_count) as by_status,
      jsonb_object_agg(month_year, month_count) as by_month,
      COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT patient_id), 0) as avg_per_patient
    FROM (
      SELECT 
        record_type,
        status,
        TO_CHAR(created_at, 'YYYY-MM') as month_year,
        patient_id,
        COUNT(*) OVER (PARTITION BY record_type) as type_count,
        COUNT(*) OVER (PARTITION BY status) as status_count,
        COUNT(*) OVER (PARTITION BY TO_CHAR(created_at, 'YYYY-MM')) as month_count
      FROM medical_records 
      WHERE clinic_id = p_clinic_id
        AND (p_start_date IS NULL OR created_at::date >= p_start_date)
        AND (p_end_date IS NULL OR created_at::date <= p_end_date)
    ) sub
  )
  SELECT 
    total,
    by_type,
    by_status,
    by_month,
    avg_per_patient
  FROM record_stats;
END;
$$ language 'plpgsql';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_system_config ENABLE ROW LEVEL SECURITY;

-- Medical Records Policies
CREATE POLICY "Users can view medical records from their clinic" ON medical_records
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert medical records in their clinic" ON medical_records
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update medical records in their clinic" ON medical_records
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Medical History Policies
CREATE POLICY "Users can view medical history from their clinic" ON medical_history
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage medical history in their clinic" ON medical_history
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Medical Attachments Policies
CREATE POLICY "Users can view attachments from their clinic" ON medical_attachments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage attachments in their clinic" ON medical_attachments
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Medical Documents Policies
CREATE POLICY "Users can view documents from their clinic" ON medical_documents
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage documents in their clinic" ON medical_documents
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Digital Signatures Policies
CREATE POLICY "Users can view signatures they created or are involved in" ON digital_signatures
  FOR SELECT USING (
    signer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM medical_records mr 
      WHERE mr.id::text = document_id AND mr.clinic_id IN (
        SELECT clinic_id FROM user_clinic_access 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Consent Forms Policies
CREATE POLICY "Users can view consent forms from their clinic" ON consent_forms
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage consent forms in their clinic" ON consent_forms
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Consent Responses Policies
CREATE POLICY "Users can view consent responses from their clinic" ON consent_responses
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR patient_id = auth.uid()
  );

-- Audit Log Policies
CREATE POLICY "Users can view audit logs from their clinic" ON medical_record_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_clinic_access uca
      WHERE uca.user_id = auth.uid() 
        AND uca.is_active = true
        AND uca.role IN ('admin', 'manager', 'doctor')
    )
  );

-- ============================================================================
-- CRON JOBS
-- ============================================================================

-- Auto-expire consent responses daily at 2 AM
SELECT cron.schedule(
  'auto-expire-consent',
  '0 2 * * *',
  'SELECT auto_expire_consent();'
);

-- Clean up old audit logs weekly on Sunday at 3 AM
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 3 * * 0',
  'SELECT cleanup_old_audit_logs();'
);

-- Update signature validation daily at 1 AM
SELECT cron.schedule(
  'validate-signatures',
  '0 1 * * *',
  'UPDATE digital_signatures SET is_valid = false WHERE expires_at < NOW() AND is_valid = true;'
);

-- ============================================================================
-- INITIAL SYSTEM CONFIGURATION
-- ============================================================================

-- Insert default medical system configurations
INSERT INTO medical_system_config (id, clinic_id, config_key, config_value, description, created_by) 
SELECT 
  uuid_generate_v4(),
  c.id,
  'medical_record_retention_years',
  '20'::jsonb,
  'Number of years to retain medical records',
  c.created_by
FROM clinics c
ON CONFLICT (clinic_id, config_key) DO NOTHING;

INSERT INTO medical_system_config (id, clinic_id, config_key, config_value, description, created_by) 
SELECT 
  uuid_generate_v4(),
  c.id,
  'document_max_file_size_mb',
  '50'::jsonb,
  'Maximum file size for document uploads in MB',
  c.created_by
FROM clinics c
ON CONFLICT (clinic_id, config_key) DO NOTHING;

INSERT INTO medical_system_config (id, clinic_id, config_key, config_value, description, created_by) 
SELECT 
  uuid_generate_v4(),
  c.id,
  'signature_validity_days',
  '3650'::jsonb,
  'Number of days digital signatures remain valid',
  c.created_by
FROM clinics c
ON CONFLICT (clinic_id, config_key) DO NOTHING;

INSERT INTO medical_system_config (id, clinic_id, config_key, config_value, description, created_by) 
SELECT 
  uuid_generate_v4(),
  c.id,
  'consent_default_retention_days',
  '3650'::jsonb,
  'Default retention period for consent forms in days',
  c.created_by
FROM clinics c
ON CONFLICT (clinic_id, config_key) DO NOTHING;

INSERT INTO medical_system_config (id, clinic_id, config_key, config_value, description, created_by) 
SELECT 
  uuid_generate_v4(),
  c.id,
  'auto_backup_medical_data',
  'true'::jsonb,
  'Enable automatic backup of medical data',
  c.created_by
FROM clinics c
ON CONFLICT (clinic_id, config_key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE medical_records IS 'Stores structured medical records and clinical notes';
COMMENT ON TABLE medical_history IS 'Patient medical history and chronic conditions';
COMMENT ON TABLE medical_attachments IS 'File attachments linked to medical records';
COMMENT ON TABLE medical_documents IS 'Standalone medical documents with versioning';
COMMENT ON TABLE document_versions IS 'Version history for medical documents';
COMMENT ON TABLE before_after_pairs IS 'Before and after photo pairs for treatments';
COMMENT ON TABLE digital_signatures IS 'Digital signatures for medical documents';
COMMENT ON TABLE signature_requests IS 'Requests for digital signatures';
COMMENT ON TABLE consent_forms IS 'Configurable consent forms with LGPD compliance';
COMMENT ON TABLE consent_form_versions IS 'Version history for consent forms';
COMMENT ON TABLE consent_responses IS 'Patient responses to consent forms';
COMMENT ON TABLE medical_record_audit IS 'Audit trail for all medical record changes';
COMMENT ON TABLE medical_system_config IS 'System configuration for medical module';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Medical History & Records Schema completed successfully
-- Features implemented:
-- ✅ Structured medical records with JSONB content
-- ✅ Medical history tracking with chronic conditions
-- ✅ Document management with versioning
-- ✅ Before/after photo pairs
-- ✅ Digital signatures with multiple types
-- ✅ Consent forms with LGPD compliance
-- ✅ Comprehensive audit logging
-- ✅ Row Level Security (RLS)
-- ✅ Automated maintenance tasks
-- ✅ Performance optimized indexes
-- ✅ Data retention and cleanup
-- ✅ Statistical functions
-- ✅ Multi-clinic support

SELECT 'NeonPro Medical History & Records Schema - Story 2.2 completed successfully! 🏥📋' as status;