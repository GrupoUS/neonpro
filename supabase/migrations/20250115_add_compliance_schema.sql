-- ============================================================================
-- 🛡️ NEONPRO COMPLIANCE SCHEMA MIGRATION
-- Database schema para compliance LGPD/ANVISA
-- Data retention, anonymization e audit logging
-- ============================================================================

-- Migration: add_compliance_fields_and_tables
-- Created: 2025-01-15
-- Purpose: Adicionar campos e tabelas necessárias para compliance

-- ==================== COMPLIANCE AUDIT LOG TABLE ====================

-- Tabela para registrar todas as ações de compliance
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('anonymized', 'deleted', 'retained', 'exported')),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason TEXT NOT NULL,
  compliance_basis TEXT NOT NULL,
  operator_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_compliance_audit_log_table_name ON compliance_audit_log(table_name);
CREATE INDEX idx_compliance_audit_log_timestamp ON compliance_audit_log(timestamp DESC);
CREATE INDEX idx_compliance_audit_log_action ON compliance_audit_log(action);
CREATE INDEX idx_compliance_audit_log_operator ON compliance_audit_log(operator_id);

-- RLS Policy
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_audit_log_select_policy" ON compliance_audit_log
  FOR SELECT USING (
    -- Apenas admins e compliance officers podem ver logs
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'compliance_officer')
    )
  );

-- ==================== ADD COMPLIANCE FIELDS TO EXISTING TABLES ====================

-- Adicionar campos de compliance para pacientes
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anonymization_reason TEXT,
ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_withdrawal_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lgpd_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_processing_consent JSONB DEFAULT '{}';

-- Adicionar campos de compliance para consultas
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anonymization_reason TEXT,
ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sensitive_data_removed BOOLEAN DEFAULT false;

-- Adicionar campos de compliance para transações
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anonymization_reason TEXT,
ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS financial_audit_required BOOLEAN DEFAULT true;

-- Adicionar campos de compliance para agendamentos
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anonymization_reason TEXT,
ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ;

-- Adicionar campos de compliance para faturas
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anonymization_reason TEXT,
ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tax_retention_required BOOLEAN DEFAULT true;

-- ==================== LGPD DATA SUBJECTS RIGHTS TABLE ====================

-- Tabela para rastrear solicitações de direitos dos titulares
CREATE TABLE IF NOT EXISTS lgpd_data_subject_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'deletion', 'portability', 'objection')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  request_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completion_date TIMESTAMPTZ,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  request_details JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  legal_basis TEXT,
  processing_notes TEXT,
  operator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_lgpd_requests_patient_id ON lgpd_data_subject_requests(patient_id);
CREATE INDEX idx_lgpd_requests_type ON lgpd_data_subject_requests(request_type);
CREATE INDEX idx_lgpd_requests_status ON lgpd_data_subject_requests(status);
CREATE INDEX idx_lgpd_requests_date ON lgpd_data_subject_requests(request_date DESC);

-- RLS Policy
ALTER TABLE lgpd_data_subject_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lgpd_requests_select_policy" ON lgpd_data_subject_requests
  FOR SELECT USING (
    -- Admins, compliance officers e o próprio paciente podem ver
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role IN ('admin', 'compliance_officer')
    ) OR 
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "lgpd_requests_insert_policy" ON lgpd_data_subject_requests
  FOR INSERT WITH CHECK (
    -- Qualquer usuário autenticado pode criar solicitação
    auth.uid() IS NOT NULL
  );

-- ==================== CONSENT MANAGEMENT TABLE ====================

-- Tabela para gerenciar consentimentos granulares
CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'marketing', 'third_party_sharing', 'research', 'image_usage')),
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  withdrawal_date TIMESTAMPTZ,
  legal_basis TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_period_days INTEGER,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_patient_consents_patient_id ON patient_consents(patient_id);
CREATE INDEX idx_patient_consents_type ON patient_consents(consent_type);
CREATE INDEX idx_patient_consents_given ON patient_consents(consent_given);
CREATE INDEX idx_patient_consents_date ON patient_consents(consent_date DESC);

-- RLS Policy
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_consents_select_policy" ON patient_consents
  FOR SELECT USING (
    -- Admins, compliance officers e o próprio paciente
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role IN ('admin', 'compliance_officer')
    ) OR 
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- ==================== DATA PROCESSING ACTIVITIES TABLE ====================

-- Registro de atividades de processamento (LGPD Art. 37)
CREATE TABLE IF NOT EXISTS data_processing_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  categories_of_data TEXT[] NOT NULL,
  categories_of_subjects TEXT[] NOT NULL,
  retention_period_days INTEGER,
  security_measures TEXT[] NOT NULL,
  third_party_recipients TEXT[],
  international_transfers BOOLEAN DEFAULT false,
  dpo_assessment TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policy
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_processing_activities_policy" ON data_processing_activities
  FOR ALL USING (
    -- Apenas admins e compliance officers podem acessar
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'compliance_officer')
    )
  );

-- ==================== COMPLIANCE DASHBOARD VIEWS ====================

-- View para dashboard de compliance
CREATE OR REPLACE VIEW compliance_dashboard_summary AS
SELECT 
  -- Estatísticas de retenção de dados
  (SELECT COUNT(*) FROM patients WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '5 years') as patients_need_anonymization,
  (SELECT COUNT(*) FROM consultations WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '5 years') as consultations_need_anonymization,
  (SELECT COUNT(*) FROM transactions WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '3 years') as transactions_need_anonymization,
  
  -- Solicitações LGPD pendentes
  (SELECT COUNT(*) FROM lgpd_data_subject_requests WHERE status = 'pending') as pending_lgpd_requests,
  (SELECT COUNT(*) FROM lgpd_data_subject_requests WHERE status = 'processing') as processing_lgpd_requests,
  
  -- Estatísticas de consentimento
  (SELECT COUNT(*) FROM patients WHERE lgpd_consent_given = true) as patients_with_consent,
  (SELECT COUNT(*) FROM patients WHERE lgpd_consent_given = false OR lgpd_consent_given IS NULL) as patients_without_consent,
  
  -- Ações de compliance recentes (últimos 30 dias)
  (SELECT COUNT(*) FROM compliance_audit_log WHERE timestamp >= NOW() - INTERVAL '30 days') as recent_compliance_actions,
  
  -- Score geral de compliance (0-100)
  LEAST(100, GREATEST(0, 
    100 - (
      -- Penalidades por não compliance
      COALESCE((SELECT COUNT(*) FROM patients WHERE anonymized_at IS NULL AND created_at < NOW() - INTERVAL '5 years') * 2, 0) +
      COALESCE((SELECT COUNT(*) FROM lgpd_data_subject_requests WHERE status = 'pending' AND request_date < NOW() - INTERVAL '15 days') * 5, 0) +
      COALESCE((SELECT COUNT(*) FROM patients WHERE lgpd_consent_given = false OR lgpd_consent_given IS NULL) / 10, 0)
    )
  )) as compliance_score;

-- ==================== FUNCTIONS FOR COMPLIANCE AUTOMATION ====================

-- Função para calcular data de retenção baseada no tipo de dados
CREATE OR REPLACE FUNCTION calculate_retention_date(
  table_name TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  retention_days INTEGER;
BEGIN
  -- Definir períodos de retenção conforme LGPD/ANVISA
  CASE table_name
    WHEN 'patients', 'consultations' THEN
      retention_days := 2555; -- 7 anos (CFM)
    WHEN 'transactions', 'invoices' THEN
      retention_days := 1825; -- 5 anos (fiscal)
    WHEN 'appointments' THEN
      retention_days := 1095; -- 3 anos
    WHEN 'audit_logs' THEN
      retention_days := 3650; -- 10 anos
    ELSE
      retention_days := 1095; -- Default 3 anos
  END CASE;
  
  RETURN created_date + (retention_days || ' days')::INTERVAL;
END;
$$;

-- Função para validar consentimento LGPD
CREATE OR REPLACE FUNCTION validate_lgpd_consent(patient_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  has_valid_consent BOOLEAN := FALSE;
BEGIN
  -- Verificar se existe consentimento válido (não retirado)
  SELECT EXISTS(
    SELECT 1 FROM patient_consents 
    WHERE patient_consents.patient_id = validate_lgpd_consent.patient_id
    AND consent_type = 'data_processing'
    AND consent_given = true
    AND withdrawal_date IS NULL
  ) INTO has_valid_consent;
  
  RETURN has_valid_consent;
END;
$$;

-- ==================== TRIGGERS FOR AUTOMATIC COMPLIANCE ====================

-- Trigger para definir data de retenção automaticamente
CREATE OR REPLACE FUNCTION set_retention_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Definir data de retenção baseada na tabela
  NEW.data_retention_until := calculate_retention_date(TG_TABLE_NAME, NEW.created_at);
  RETURN NEW;
END;
$$;

-- Aplicar trigger nas tabelas relevantes
DROP TRIGGER IF EXISTS set_patients_retention ON patients;
CREATE TRIGGER set_patients_retention
  BEFORE INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION set_retention_date();

DROP TRIGGER IF EXISTS set_consultations_retention ON consultations;
CREATE TRIGGER set_consultations_retention
  BEFORE INSERT ON consultations
  FOR EACH ROW EXECUTE FUNCTION set_retention_date();

DROP TRIGGER IF EXISTS set_transactions_retention ON transactions;
CREATE TRIGGER set_transactions_retention
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_retention_date();

-- ==================== GRANTS AND PERMISSIONS ====================

-- Conceder permissões apropriadas para compliance officers
-- (Assumindo que existe um role 'compliance_officer')

GRANT SELECT, INSERT, UPDATE ON compliance_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON lgpd_data_subject_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patient_consents TO authenticated;
GRANT SELECT ON data_processing_activities TO authenticated;
GRANT SELECT ON compliance_dashboard_summary TO authenticated;

-- ==================== SEED DATA FOR COMPLIANCE ====================

-- Inserir atividades de processamento básicas
INSERT INTO data_processing_activities (activity_name, purpose, legal_basis, categories_of_data, categories_of_subjects, retention_period_days, security_measures)
VALUES 
  ('Gestão de Pacientes', 'Atendimento médico e acompanhamento clínico', 'Execução de contrato', 
   ARRAY['dados pessoais', 'dados de saúde', 'dados de contato'], 
   ARRAY['pacientes', 'usuários do sistema'], 
   2555, 
   ARRAY['criptografia', 'controle de acesso', 'audit logs']),
   
  ('Processamento Financeiro', 'Cobrança de serviços e gestão financeira', 'Execução de contrato', 
   ARRAY['dados pessoais', 'dados financeiros', 'dados bancários'], 
   ARRAY['pacientes', 'clientes'], 
   1825, 
   ARRAY['criptografia', 'tokenização', 'controle de acesso']),
   
  ('Marketing e Comunicação', 'Comunicação comercial e promocional', 'Consentimento', 
   ARRAY['dados pessoais', 'dados de contato', 'preferências'], 
   ARRAY['pacientes', 'prospects'], 
   1095, 
   ARRAY['controle de acesso', 'opt-out automático'])

ON CONFLICT DO NOTHING;

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Índices adicionais para performance de queries de compliance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_retention ON patients(data_retention_until);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_anonymized ON patients(anonymized_at) WHERE anonymized_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_consent ON patients(lgpd_consent_given);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultations_retention ON consultations(data_retention_until);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultations_anonymized ON consultations(anonymized_at) WHERE anonymized_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_retention ON transactions(data_retention_until);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_anonymized ON transactions(anonymized_at) WHERE anonymized_at IS NOT NULL;

-- ==================== COMMENTS FOR DOCUMENTATION ====================

COMMENT ON TABLE compliance_audit_log IS 'Log de auditoria para todas as ações de compliance LGPD/ANVISA';
COMMENT ON TABLE lgpd_data_subject_requests IS 'Solicitações de direitos dos titulares conforme LGPD';
COMMENT ON TABLE patient_consents IS 'Gestão granular de consentimentos dos pacientes';
COMMENT ON TABLE data_processing_activities IS 'Registro de atividades de processamento (LGPD Art. 37)';
COMMENT ON VIEW compliance_dashboard_summary IS 'Resumo executivo para dashboard de compliance';

COMMENT ON FUNCTION calculate_retention_date IS 'Calcula data de retenção baseada no tipo de dados e regulamentações';
COMMENT ON FUNCTION validate_lgpd_consent IS 'Valida se paciente possui consentimento LGPD válido';

-- ==================== SUCCESS MESSAGE ====================

DO $$
BEGIN
  RAISE NOTICE '✅ COMPLIANCE SCHEMA MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '📊 Added: compliance_audit_log, lgpd_data_subject_requests, patient_consents, data_processing_activities';
  RAISE NOTICE '🔐 Added: RLS policies, indexes, triggers for automatic compliance';
  RAISE NOTICE '📈 Added: compliance_dashboard_summary view for monitoring';
  RAISE NOTICE '⚖️ System ready for LGPD/ANVISA compliance automation';
END $$;