-- LGPD Compliance System Migration
-- Creates all necessary tables, functions, and policies for LGPD compliance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE consent_status AS ENUM ('given', 'withdrawn', 'expired', 'pending');
CREATE TYPE consent_purpose AS ENUM (
  'essential',
  'analytics', 
  'marketing',
  'personalization',
  'communication',
  'location',
  'sharing'
);

CREATE TYPE data_subject_request_type AS ENUM (
  'access',
  'rectification', 
  'erasure',
  'portability',
  'restriction',
  'objection'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE breach_status AS ENUM (
  'detected',
  'investigating', 
  'contained',
  'resolved',
  'closed'
);

CREATE TYPE breach_type AS ENUM (
  'unauthorized_access',
  'data_theft',
  'system_compromise',
  'human_error',
  'malware',
  'phishing',
  'insider_threat',
  'third_party'
);

CREATE TYPE audit_event_type AS ENUM (
  'user_login',
  'user_logout',
  'data_access',
  'data_export',
  'data_deletion',
  'consent_given',
  'consent_withdrawn',
  'consent_updated',
  'security_event',
  'system_access',
  'admin_action',
  'breach_detected',
  'policy_change'
);

CREATE TYPE assessment_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'failed'
);

-- Consent Management Tables
CREATE TABLE lgpd_consent_purposes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  purpose consent_purpose NOT NULL UNIQUE,
  required BOOLEAN DEFAULT FALSE,
  legal_basis TEXT,
  retention_period INTERVAL,
  data_categories TEXT[],
  processing_activities TEXT[],
  third_parties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE lgpd_user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose consent_purpose NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  given_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  consent_method VARCHAR(50), -- 'banner', 'form', 'api', etc.
  consent_version VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, purpose)
);

-- Data Subject Rights Tables
CREATE TABLE lgpd_data_subject_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type data_subject_request_type NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  description TEXT,
  requested_data TEXT[],
  legal_basis TEXT,
  priority INTEGER DEFAULT 1,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB,
  response_message TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  verification_method VARCHAR(100),
  verification_data JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lgpd_data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES lgpd_data_subject_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_format VARCHAR(20) DEFAULT 'json',
  file_path TEXT,
  file_size BIGINT,
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  encryption_key TEXT,
  checksum TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breach Management Tables
CREATE TABLE lgpd_breach_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type breach_type NOT NULL,
  severity breach_severity NOT NULL,
  status breach_status NOT NULL DEFAULT 'detected',
  affected_users_count INTEGER DEFAULT 0,
  data_types TEXT[],
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  contained_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  root_cause TEXT,
  mitigation_steps TEXT,
  authorities_notified_at TIMESTAMP WITH TIME ZONE,
  users_notified_at TIMESTAMP WITH TIME ZONE,
  notification_method VARCHAR(100),
  estimated_impact TEXT,
  lessons_learned TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  reported_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lgpd_breach_affected_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES lgpd_breach_incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_types TEXT[],
  impact_level VARCHAR(20),
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_method VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(incident_id, user_id)
);

-- Audit Trail Tables
CREATE TABLE lgpd_audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type audit_event_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  description TEXT NOT NULL,
  details TEXT,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Partitioning by month for performance
  CONSTRAINT audit_events_timestamp_check CHECK (timestamp >= '2024-01-01'::timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for audit events
CREATE TABLE lgpd_audit_events_2024_01 PARTITION OF lgpd_audit_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE lgpd_audit_events_2024_02 PARTITION OF lgpd_audit_events
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE lgpd_audit_events_2024_03 PARTITION OF lgpd_audit_events
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- Compliance Assessment Tables
CREATE TABLE lgpd_compliance_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status assessment_status NOT NULL DEFAULT 'scheduled',
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100.00,
  compliance_percentage DECIMAL(5,2),
  areas_assessed TEXT[],
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  assessor_id UUID REFERENCES auth.users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  next_assessment_due TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lgpd_compliance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES lgpd_compliance_assessments(id) ON DELETE CASCADE,
  metric_name VARCHAR(255) NOT NULL,
  metric_category VARCHAR(100),
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit VARCHAR(50),
  status VARCHAR(50),
  trend VARCHAR(20), -- 'improving', 'stable', 'declining'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Data Retention and Cleanup Tables
CREATE TABLE lgpd_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_category VARCHAR(100) NOT NULL,
  retention_period INTERVAL NOT NULL,
  legal_basis TEXT,
  auto_delete BOOLEAN DEFAULT FALSE,
  notification_before INTERVAL DEFAULT '30 days',
  exceptions TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lgpd_data_cleanup_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES lgpd_retention_policies(id),
  table_name VARCHAR(255) NOT NULL,
  condition_sql TEXT NOT NULL,
  records_affected INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Documentation Tables
CREATE TABLE lgpd_legal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL, -- 'privacy_policy', 'terms', 'dpia', etc.
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  language VARCHAR(10) DEFAULT 'pt-BR',
  approved_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  checksum TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(document_type, version, language)
);

-- Third Party Data Sharing Tables
CREATE TABLE lgpd_third_party_processors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  adequacy_decision BOOLEAN DEFAULT FALSE,
  safeguards TEXT,
  processing_purposes TEXT[],
  data_categories TEXT[],
  retention_period INTERVAL,
  contract_start_date DATE,
  contract_end_date DATE,
  dpa_signed BOOLEAN DEFAULT FALSE,
  dpa_date DATE,
  last_audit_date DATE,
  next_audit_due DATE,
  risk_level VARCHAR(20) DEFAULT 'medium',
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lgpd_data_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processor_id UUID NOT NULL REFERENCES lgpd_third_party_processors(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_categories TEXT[],
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_volume INTEGER,
  encryption_used BOOLEAN DEFAULT FALSE,
  consent_obtained BOOLEAN DEFAULT FALSE,
  automated BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_consents_user_id ON lgpd_user_consents(user_id);
CREATE INDEX idx_user_consents_purpose ON lgpd_user_consents(purpose);
CREATE INDEX idx_user_consents_status ON lgpd_user_consents(status);
CREATE INDEX idx_user_consents_created_at ON lgpd_user_consents(created_at);

CREATE INDEX idx_data_subject_requests_user_id ON lgpd_data_subject_requests(user_id);
CREATE INDEX idx_data_subject_requests_type ON lgpd_data_subject_requests(request_type);
CREATE INDEX idx_data_subject_requests_status ON lgpd_data_subject_requests(status);
CREATE INDEX idx_data_subject_requests_due_date ON lgpd_data_subject_requests(due_date);

CREATE INDEX idx_breach_incidents_severity ON lgpd_breach_incidents(severity);
CREATE INDEX idx_breach_incidents_status ON lgpd_breach_incidents(status);
CREATE INDEX idx_breach_incidents_discovered_at ON lgpd_breach_incidents(discovered_at);

CREATE INDEX idx_audit_events_user_id ON lgpd_audit_events(user_id);
CREATE INDEX idx_audit_events_type ON lgpd_audit_events(event_type);
CREATE INDEX idx_audit_events_timestamp ON lgpd_audit_events(timestamp);
CREATE INDEX idx_audit_events_session_id ON lgpd_audit_events(session_id);

CREATE INDEX idx_compliance_assessments_status ON lgpd_compliance_assessments(status);
CREATE INDEX idx_compliance_assessments_completed_at ON lgpd_compliance_assessments(completed_at);

CREATE INDEX idx_data_transfers_processor_id ON lgpd_data_transfers(processor_id);
CREATE INDEX idx_data_transfers_user_id ON lgpd_data_transfers(user_id);
CREATE INDEX idx_data_transfers_date ON lgpd_data_transfers(transfer_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lgpd_consent_purposes_updated_at BEFORE UPDATE ON lgpd_consent_purposes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_user_consents_updated_at BEFORE UPDATE ON lgpd_user_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_data_subject_requests_updated_at BEFORE UPDATE ON lgpd_data_subject_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_breach_incidents_updated_at BEFORE UPDATE ON lgpd_breach_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_compliance_assessments_updated_at BEFORE UPDATE ON lgpd_compliance_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_retention_policies_updated_at BEFORE UPDATE ON lgpd_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_third_party_processors_updated_at BEFORE UPDATE ON lgpd_third_party_processors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default consent purposes
INSERT INTO lgpd_consent_purposes (name, description, purpose, required, legal_basis, retention_period, data_categories) VALUES
('Funcionalidades Essenciais', 'Dados necessários para o funcionamento básico da plataforma, incluindo autenticação e segurança.', 'essential', true, 'Execução de contrato', '5 years', ARRAY['email', 'nome', 'dados_autenticacao']),
('Análises e Melhorias', 'Coleta de dados de uso para melhorar a experiência e performance da plataforma.', 'analytics', false, 'Interesse legítimo', '2 years', ARRAY['paginas_visitadas', 'tempo_sessao', 'dispositivo']),
('Marketing e Comunicação', 'Envio de comunicações promocionais e ofertas personalizadas.', 'marketing', false, 'Consentimento', '3 years', ARRAY['email', 'preferencias', 'historico_compras']),
('Personalização', 'Personalização de conteúdo e funcionalidades baseada no perfil do usuário.', 'personalization', false, 'Consentimento', '2 years', ARRAY['preferencias', 'comportamento', 'configuracoes']),
('Notificações', 'Envio de notificações sobre atualizações e informações importantes.', 'communication', false, 'Consentimento', '1 year', ARRAY['email', 'telefone', 'preferencias_notificacao']),
('Localização', 'Uso de dados de localização para funcionalidades baseadas em geografia.', 'location', false, 'Consentimento', '6 months', ARRAY['localizacao', 'fuso_horario']),
('Compartilhamento com Parceiros', 'Compartilhamento de dados agregados com parceiros para melhorar serviços.', 'sharing', false, 'Consentimento', '1 year', ARRAY['dados_agregados', 'metricas_uso']);

-- Insert default retention policies
INSERT INTO lgpd_retention_policies (name, description, data_category, retention_period, legal_basis, auto_delete) VALUES
('Dados de Usuários Inativos', 'Exclusão automática de dados de usuários inativos por mais de 3 anos', 'user_data', '3 years', 'LGPD Art. 16', true),
('Logs de Auditoria', 'Retenção de logs de auditoria por 5 anos para conformidade', 'audit_logs', '5 years', 'LGPD Art. 37', false),
('Dados de Sessão', 'Limpeza de dados de sessão expirados', 'session_data', '30 days', 'Minimização de dados', true),
('Consentimentos Expirados', 'Limpeza de registros de consentimento expirados', 'consent_data', '1 year', 'LGPD Art. 8', true),
('Dados de Incidentes', 'Retenção de dados de incidentes de segurança', 'incident_data', '7 years', 'Obrigação legal', false);

-- Create RLS policies
ALTER TABLE lgpd_user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own consents
CREATE POLICY "Users can view own consents" ON lgpd_user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" ON lgpd_user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents" ON lgpd_user_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own data subject requests
CREATE POLICY "Users can view own requests" ON lgpd_data_subject_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests" ON lgpd_data_subject_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own data exports
CREATE POLICY "Users can view own exports" ON lgpd_data_exports
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (assuming admin role exists)
CREATE POLICY "Admins can view all consents" ON lgpd_user_consents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can view all requests" ON lgpd_data_subject_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can view all exports" ON lgpd_data_exports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can view audit events" ON lgpd_audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to automatically create monthly audit partitions
CREATE OR REPLACE FUNCTION create_monthly_audit_partition()
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  table_name text;
BEGIN
  -- Get the first day of next month
  start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  end_date := start_date + interval '1 month';
  
  -- Generate table name
  table_name := 'lgpd_audit_events_' || to_char(start_date, 'YYYY_MM');
  
  -- Create partition if it doesn't exist
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF lgpd_audit_events FOR VALUES FROM (%L) TO (%L)',
    table_name, start_date, end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly partition creation (requires pg_cron extension)
-- SELECT cron.schedule('create-audit-partitions', '0 0 1 * *', 'SELECT create_monthly_audit_partition();');

COMMIT;
