-- Migration: Add AI Services Schema
-- Description: Creates tables and policies for AI chat, predictions, and feature flags
-- Author: NeonPro AI Development Team
-- Date: 2025-08-21
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- AI CONVERSATIONS TABLE
-- =============================================================================

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL CHECK (
    conversation_type IN ('patient_faq', 'staff_query', 'appointment_booking', 'emergency_support', 'general_inquiry')
  ),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US', 'es-ES')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'archived')),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  escalation_reason TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for ai_conversations
CREATE INDEX idx_ai_conversations_user_clinic ON ai_conversations(user_id, clinic_id);
CREATE INDEX idx_ai_conversations_type_status ON ai_conversations(conversation_type, status);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_clinic_created ON ai_conversations(clinic_id, created_at DESC);
CREATE INDEX idx_ai_conversations_metadata ON ai_conversations USING gin(metadata);

-- RLS Policies for ai_conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_user_access" ON ai_conversations
FOR ALL USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'role' = 'staff' AND clinic_id = (auth.jwt() ->> 'clinic_id')::UUID) OR
  (auth.jwt() ->> 'role' = 'admin')
);

-- =============================================================================
-- AI CHAT EMBEDDINGS TABLE (for RAG/Vector Search)
-- =============================================================================

CREATE TABLE ai_chat_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),
  content_type TEXT NOT NULL CHECK (
    content_type IN ('faq', 'procedure', 'policy', 'training', 'treatment', 'pricing', 'schedule')
  ),
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US', 'es-ES')),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_chat_embeddings
CREATE INDEX idx_ai_chat_embeddings_embedding ON ai_chat_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_ai_chat_embeddings_content_type ON ai_chat_embeddings(content_type, is_active);
CREATE INDEX idx_ai_chat_embeddings_clinic_language ON ai_chat_embeddings(clinic_id, language);
CREATE INDEX idx_ai_chat_embeddings_content_search ON ai_chat_embeddings USING gin(to_tsvector('portuguese', content));

-- RLS Policies for ai_chat_embeddings
ALTER TABLE ai_chat_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_chat_embeddings_clinic_access" ON ai_chat_embeddings
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- APPOINTMENT PREDICTIONS TABLE
-- =============================================================================

CREATE TABLE appointment_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  prediction_confidence FLOAT NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
  model_version TEXT NOT NULL,
  weather_data JSONB DEFAULT '{}'::jsonb,
  behavioral_patterns JSONB DEFAULT '{}'::jsonb,
  intervention_recommended BOOLEAN DEFAULT false,
  intervention_type TEXT CHECK (intervention_type IN ('call', 'sms', 'email', 'reschedule', 'none')),
  intervention_scheduled_at TIMESTAMP WITH TIME ZONE,
  intervention_completed BOOLEAN DEFAULT false,
  intervention_result TEXT,
  actual_outcome TEXT CHECK (actual_outcome IN ('attended', 'no_show', 'cancelled', 'rescheduled')),
  feedback_accuracy BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for appointment_predictions
CREATE INDEX idx_appointment_predictions_appointment_id ON appointment_predictions(appointment_id);
CREATE INDEX idx_appointment_predictions_risk_score ON appointment_predictions(risk_score DESC);
CREATE INDEX idx_appointment_predictions_created_at ON appointment_predictions(created_at DESC);
CREATE INDEX idx_appointment_predictions_expires_at ON appointment_predictions(expires_at);
CREATE INDEX idx_appointment_predictions_intervention ON appointment_predictions(intervention_recommended, intervention_completed);

-- RLS Policy for appointment_predictions
ALTER TABLE appointment_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointment_predictions_clinic_access" ON appointment_predictions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_id 
    AND a.clinic_id = (auth.jwt() ->> 'clinic_id')::UUID
  ) OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- FEATURE FLAGS TABLE
-- =============================================================================

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_clinics UUID[] DEFAULT ARRAY[]::UUID[],
  target_users UUID[] DEFAULT ARRAY[]::UUID[],
  target_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  config JSONB DEFAULT '{}'::jsonb,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for feature_flags
CREATE INDEX idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled, environment);
CREATE INDEX idx_feature_flags_rollout ON feature_flags(rollout_percentage, is_enabled);

-- RLS Policy for feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_read_access" ON feature_flags
FOR SELECT USING (
  is_enabled = true OR
  auth.jwt() ->> 'role' IN ('admin', 'staff')
);

CREATE POLICY "feature_flags_admin_full_access" ON feature_flags
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- AI PERFORMANCE METRICS TABLE
-- =============================================================================

CREATE TABLE ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (
    metric_type IN ('response_time', 'accuracy_rate', 'user_satisfaction', 'error_rate', 'cache_hit_rate', 'confidence_score', 'escalation_rate')
  ),
  value FLOAT NOT NULL,
  service_name TEXT NOT NULL,
  operation_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID REFERENCES clinics(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_performance_metrics
CREATE INDEX idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp DESC);
CREATE INDEX idx_ai_performance_metrics_type_service ON ai_performance_metrics(metric_type, service_name);
CREATE INDEX idx_ai_performance_metrics_clinic_timestamp ON ai_performance_metrics(clinic_id, timestamp DESC);

-- RLS Policy for ai_performance_metrics
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_performance_metrics_clinic_access" ON ai_performance_metrics
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- AI AUDIT TRAIL TABLE
-- =============================================================================

CREATE TABLE ai_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (
    operation_type IN ('chat_request', 'prediction_request', 'model_training', 'data_processing', 'user_interaction')
  ),
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID REFERENCES clinics(id),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'timeout')),
  input_data JSONB,
  output_data JSONB,
  error_details TEXT,
  processing_time INTEGER, -- milliseconds
  compliance_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_audit_trail
CREATE INDEX idx_ai_audit_trail_operation_id ON ai_audit_trail(operation_id);
CREATE INDEX idx_ai_audit_trail_timestamp ON ai_audit_trail(timestamp DESC);
CREATE INDEX idx_ai_audit_trail_user_clinic ON ai_audit_trail(user_id, clinic_id, timestamp DESC);
CREATE INDEX idx_ai_audit_trail_service_status ON ai_audit_trail(service_name, status);

-- RLS Policy for ai_audit_trail
ALTER TABLE ai_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_audit_trail_clinic_access" ON ai_audit_trail
FOR SELECT USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "ai_audit_trail_system_write" ON ai_audit_trail
FOR INSERT WITH CHECK (true); -- System can always write audit logs

-- =============================================================================
-- INSERT INITIAL FEATURE FLAGS
-- =============================================================================

INSERT INTO feature_flags (flag_name, display_name, description, is_enabled, rollout_percentage, environment) VALUES
('universal_ai_chat', 'Universal AI Chat', 'AI chat system for patients and staff', false, 10, 'production'),
('no_show_prediction', 'No-Show Prediction', 'ML-powered no-show risk prediction', false, 5, 'production'),
('ai_appointment_optimization', 'AI Appointment Optimization', 'AI-powered scheduling optimization', false, 5, 'production'),
('ai_compliance_automation', 'AI Compliance Automation', 'Automated LGPD/ANVISA/CFM compliance', false, 0, 'production'),
('ai_performance_monitoring', 'AI Performance Monitoring', 'Real-time AI service performance tracking', true, 100, 'production'),
('ai_debug_mode', 'AI Debug Mode', 'Enhanced logging and debugging for AI services', false, 0, 'development');

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_chat_embeddings_updated_at BEFORE UPDATE ON ai_chat_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_predictions_updated_at BEFORE UPDATE ON appointment_predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired predictions
CREATE OR REPLACE FUNCTION cleanup_expired_predictions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM appointment_predictions 
  WHERE expires_at < NOW() 
  AND actual_outcome IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO ai_audit_trail (
    operation_id, 
    service_name, 
    operation_type, 
    status, 
    output_data, 
    timestamp
  ) VALUES (
    'cleanup-' || extract(epoch from now())::text,
    'prediction_cleanup',
    'data_processing',
    'completed',
    jsonb_build_object('deleted_count', deleted_count),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update embedding last_used_at when accessed
CREATE OR REPLACE FUNCTION update_embedding_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called when embeddings are accessed for similarity search
  UPDATE ai_chat_embeddings 
  SET last_used_at = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  total_predictions BIGINT,
  accurate_predictions BIGINT,
  accuracy_rate FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE 
      (risk_score > 70 AND actual_outcome = 'no_show') OR
      (risk_score <= 70 AND actual_outcome = 'attended')
    ) as accurate_predictions,
    ROUND(
      (COUNT(*) FILTER (WHERE 
        (risk_score > 70 AND actual_outcome = 'no_show') OR
        (risk_score <= 70 AND actual_outcome = 'attended')
      ) * 100.0) / NULLIF(COUNT(*), 0), 
      2
    ) as accuracy_rate
  FROM appointment_predictions
  WHERE created_at BETWEEN start_date AND end_date
  AND actual_outcome IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- AI Performance Summary View
CREATE VIEW ai_performance_summary AS
SELECT 
  service_name,
  metric_type,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as measurement_count,
  DATE_TRUNC('day', timestamp) as date
FROM ai_performance_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY service_name, metric_type, DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Conversation Analytics View  
CREATE VIEW ai_conversation_analytics AS
SELECT
  clinic_id,
  conversation_type,
  status,
  language,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as conversation_count,
  AVG(satisfaction_score) as avg_satisfaction,
  AVG(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at))/60) as avg_duration_minutes
FROM ai_conversations
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY clinic_id, conversation_type, status, language, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Prediction Performance View
CREATE VIEW prediction_performance AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_predictions,
  AVG(risk_score) as avg_risk_score,
  AVG(prediction_confidence) as avg_confidence,
  COUNT(*) FILTER (WHERE actual_outcome IS NOT NULL) as predictions_with_outcome,
  COUNT(*) FILTER (WHERE intervention_recommended = true) as interventions_recommended,
  COUNT(*) FILTER (WHERE intervention_completed = true) as interventions_completed
FROM appointment_predictions
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant appropriate permissions to service roles
GRANT SELECT, INSERT, UPDATE ON ai_conversations TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai_chat_embeddings TO service_role;  
GRANT SELECT, INSERT, UPDATE ON appointment_predictions TO service_role;
GRANT SELECT ON feature_flags TO service_role;
GRANT INSERT ON ai_performance_metrics TO service_role;
GRANT INSERT ON ai_audit_trail TO service_role;

-- Grant read access to performance views
GRANT SELECT ON ai_performance_summary TO service_role;
GRANT SELECT ON ai_conversation_analytics TO service_role;
GRANT SELECT ON prediction_performance TO service_role;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE ai_conversations IS 'Stores AI chat conversations between users and the system';
COMMENT ON TABLE ai_chat_embeddings IS 'Vector embeddings for AI chat context and similarity search';
COMMENT ON TABLE appointment_predictions IS 'ML predictions for appointment no-show risk assessment';
COMMENT ON TABLE feature_flags IS 'Feature flag configuration for gradual AI rollout';
COMMENT ON TABLE ai_performance_metrics IS 'Performance metrics and monitoring data for AI services';
COMMENT ON TABLE ai_audit_trail IS 'Comprehensive audit trail for all AI operations and compliance';

COMMENT ON VIEW ai_performance_summary IS 'Aggregated performance metrics by service and date';
COMMENT ON VIEW ai_conversation_analytics IS 'Conversation volume and satisfaction analytics';  
COMMENT ON VIEW prediction_performance IS 'No-show prediction accuracy and intervention metrics';

-- Migration complete
SELECT 'AI Services Schema Migration Completed Successfully' as status;