-- ============================================================================
-- NeonPro Backup & Recovery System - Database Schema
-- Story 1.8: Sistema de Backup e Recovery
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Tipos de backup
CREATE TYPE backup_type AS ENUM (
  'FULL',
  'INCREMENTAL', 
  'DIFFERENTIAL',
  'DATABASE',
  'FILES'
);

-- Frequência de backup
CREATE TYPE backup_frequency AS ENUM (
  'HOURLY',
  'DAILY',
  'WEEKLY', 
  'MONTHLY',
  'CUSTOM'
);

-- Status de backup
CREATE TYPE backup_status AS ENUM (
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'PAUSED'
);

-- Providers de storage
CREATE TYPE storage_provider AS ENUM (
  'LOCAL',
  'S3',
  'GCS',
  'AZURE'
);

-- Tipos de recovery
CREATE TYPE recovery_type AS ENUM (
  'FULL_RESTORE',
  'PARTIAL_RESTORE',
  'POINT_IN_TIME',
  'VERIFICATION'
);

-- Status de recovery
CREATE TYPE recovery_status AS ENUM (
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
);

-- Tipos de alerta
CREATE TYPE alert_type AS ENUM (
  'BACKUP_FAILURE',
  'BACKUP_SUCCESS',
  'BACKUP_OVERDUE',
  'STORAGE_FULL',
  'PERFORMANCE',
  'SECURITY',
  'RECOVERY_FAILURE',
  'SYSTEM_ERROR'
);

-- Severidade de alerta
CREATE TYPE alert_severity AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Prioridade
CREATE TYPE priority_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Status de saúde
CREATE TYPE health_status AS ENUM (
  'HEALTHY',
  'DEGRADED',
  'UNHEALTHY'
);

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Configurações de backup
CREATE TABLE backup_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  type backup_type NOT NULL,
  
  -- Caminhos e filtros
  source_paths TEXT[] DEFAULT '{}',
  exclude_patterns TEXT[] DEFAULT '{}',
  include_patterns TEXT[] DEFAULT '{}',
  
  -- Configurações de banco de dados
  database_config JSONB,
  
  -- Agendamento
  schedule_frequency backup_frequency,
  schedule_time TIME,
  schedule_timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  schedule_cron VARCHAR(100),
  
  -- Retenção
  retention_daily INTEGER DEFAULT 7,
  retention_weekly INTEGER DEFAULT 4,
  retention_monthly INTEGER DEFAULT 12,
  retention_yearly INTEGER DEFAULT 5,
  
  -- Configurações técnicas
  compression BOOLEAN DEFAULT true,
  compression_level INTEGER DEFAULT 6,
  encryption BOOLEAN DEFAULT true,
  chunk_size INTEGER DEFAULT 1048576, -- 1MB
  timeout_seconds INTEGER DEFAULT 3600, -- 1 hora
  max_retries INTEGER DEFAULT 3,
  
  -- Storage
  storage_provider storage_provider DEFAULT 'LOCAL',
  storage_config JSONB,
  
  -- Notificações
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notify_on_warning BOOLEAN DEFAULT true,
  notification_channels TEXT[] DEFAULT '{"EMAIL"}',
  
  -- Performance
  max_concurrent_backups INTEGER DEFAULT 2,
  bandwidth_limit_mbps INTEGER,
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_retention CHECK (
    retention_daily > 0 AND 
    retention_weekly > 0 AND 
    retention_monthly > 0 AND 
    retention_yearly > 0
  ),
  CONSTRAINT valid_compression_level CHECK (
    compression_level >= 1 AND compression_level <= 9
  ),
  CONSTRAINT valid_timeout CHECK (timeout_seconds > 0),
  CONSTRAINT valid_chunk_size CHECK (chunk_size > 0)
);

-- Registros de backup
CREATE TABLE backup_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES backup_configs(id) ON DELETE CASCADE,
  
  -- Status e timing
  status backup_status DEFAULT 'PENDING',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- segundos
  
  -- Dados do backup
  type backup_type NOT NULL,
  size BIGINT, -- bytes
  compressed_size BIGINT, -- bytes
  file_count INTEGER,
  
  -- Storage
  storage_path TEXT,
  storage_provider storage_provider,
  
  -- Integridade
  checksum VARCHAR(128),
  checksum_algorithm VARCHAR(20) DEFAULT 'SHA256',
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  warning_messages TEXT[],
  
  -- Execução
  triggered_by UUID REFERENCES auth.users(id),
  is_manual BOOLEAN DEFAULT false,
  parent_backup_id UUID REFERENCES backup_records(id), -- Para incrementais
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solicitações de recovery
CREATE TABLE recovery_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_id UUID NOT NULL REFERENCES backup_records(id),
  
  -- Tipo e configurações
  type recovery_type NOT NULL,
  status recovery_status DEFAULT 'PENDING',
  priority priority_level DEFAULT 'MEDIUM',
  
  -- Opções de recovery
  target_path TEXT,
  overwrite_existing BOOLEAN DEFAULT false,
  restore_permissions BOOLEAN DEFAULT true,
  restore_timestamps BOOLEAN DEFAULT true,
  
  -- Filtros
  include_patterns TEXT[],
  exclude_patterns TEXT[],
  
  -- Progresso
  progress INTEGER DEFAULT 0, -- 0-100
  current_step TEXT,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- segundos
  
  -- Resultado
  result JSONB,
  error_message TEXT,
  
  -- Usuários
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alertas de backup
CREATE TABLE backup_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tipo e severidade
  type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  
  -- Conteúdo
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  -- Entidade relacionada
  entity_type VARCHAR(50), -- 'BACKUP', 'CONFIG', 'RECOVERY', 'SYSTEM'
  entity_id UUID,
  
  -- Status
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas de backup
CREATE TABLE backup_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Período
  date DATE NOT NULL,
  hour INTEGER, -- 0-23, NULL para métricas diárias
  
  -- Contadores
  total_backups INTEGER DEFAULT 0,
  successful_backups INTEGER DEFAULT 0,
  failed_backups INTEGER DEFAULT 0,
  cancelled_backups INTEGER DEFAULT 0,
  
  -- Tamanhos
  total_size BIGINT DEFAULT 0,
  compressed_size BIGINT DEFAULT 0,
  
  -- Performance
  average_duration NUMERIC(10,2), -- segundos
  min_duration INTEGER,
  max_duration INTEGER,
  
  -- Taxa de sucesso
  success_rate NUMERIC(5,2), -- porcentagem
  
  -- Storage
  storage_used BIGINT DEFAULT 0,
  
  -- Sistema
  cpu_usage NUMERIC(5,2),
  memory_usage BIGINT,
  disk_usage NUMERIC(5,2),
  network_throughput BIGINT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(date, hour)
);

-- Tarefas agendadas
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES backup_configs(id) ON DELETE CASCADE,
  
  -- Agendamento
  cron_expression VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, RUNNING, PAUSED
  
  -- Execução
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- Configurações
  max_retries INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 300, -- segundos
  timeout INTEGER DEFAULT 3600, -- segundos
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log de auditoria
CREATE TABLE backup_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ação
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  
  -- Detalhes
  details JSONB DEFAULT '{}',
  old_values JSONB,
  new_values JSONB,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Resultado
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Configurações do sistema
CREATE TABLE backup_system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_sensitive BOOLEAN DEFAULT false,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Backup configs
CREATE INDEX idx_backup_configs_enabled ON backup_configs(enabled);
CREATE INDEX idx_backup_configs_type ON backup_configs(type);
CREATE INDEX idx_backup_configs_created_by ON backup_configs(created_by);
CREATE INDEX idx_backup_configs_updated_at ON backup_configs(updated_at);

-- Backup records
CREATE INDEX idx_backup_records_config_id ON backup_records(config_id);
CREATE INDEX idx_backup_records_status ON backup_records(status);
CREATE INDEX idx_backup_records_start_time ON backup_records(start_time);
CREATE INDEX idx_backup_records_type ON backup_records(type);
CREATE INDEX idx_backup_records_triggered_by ON backup_records(triggered_by);
CREATE INDEX idx_backup_records_parent_backup_id ON backup_records(parent_backup_id);

-- Recovery requests
CREATE INDEX idx_recovery_requests_backup_id ON recovery_requests(backup_id);
CREATE INDEX idx_recovery_requests_status ON recovery_requests(status);
CREATE INDEX idx_recovery_requests_type ON recovery_requests(type);
CREATE INDEX idx_recovery_requests_requested_by ON recovery_requests(requested_by);
CREATE INDEX idx_recovery_requests_requested_at ON recovery_requests(requested_at);
CREATE INDEX idx_recovery_requests_priority ON recovery_requests(priority);

-- Backup alerts
CREATE INDEX idx_backup_alerts_type ON backup_alerts(type);
CREATE INDEX idx_backup_alerts_severity ON backup_alerts(severity);
CREATE INDEX idx_backup_alerts_timestamp ON backup_alerts(timestamp);
CREATE INDEX idx_backup_alerts_acknowledged ON backup_alerts(acknowledged);
CREATE INDEX idx_backup_alerts_resolved ON backup_alerts(resolved);
CREATE INDEX idx_backup_alerts_entity ON backup_alerts(entity_type, entity_id);

-- Backup metrics
CREATE INDEX idx_backup_metrics_date ON backup_metrics(date);
CREATE INDEX idx_backup_metrics_date_hour ON backup_metrics(date, hour);

-- Scheduled tasks
CREATE INDEX idx_scheduled_tasks_config_id ON scheduled_tasks(config_id);
CREATE INDEX idx_scheduled_tasks_enabled ON scheduled_tasks(enabled);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_tasks(next_run);

-- Audit log
CREATE INDEX idx_backup_audit_log_timestamp ON backup_audit_log(timestamp);
CREATE INDEX idx_backup_audit_log_user_id ON backup_audit_log(user_id);
CREATE INDEX idx_backup_audit_log_action ON backup_audit_log(action);
CREATE INDEX idx_backup_audit_log_entity ON backup_audit_log(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_backup_configs_updated_at
  BEFORE UPDATE ON backup_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_records_updated_at
  BEFORE UPDATE ON backup_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recovery_requests_updated_at
  BEFORE UPDATE ON recovery_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_alerts_updated_at
  BEFORE UPDATE ON backup_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_metrics_updated_at
  BEFORE UPDATE ON backup_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_system_config_updated_at
  BEFORE UPDATE ON backup_system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES
-- ============================================================================

-- Função para calcular métricas diárias
CREATE OR REPLACE FUNCTION calculate_daily_backup_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  total_count INTEGER;
  success_count INTEGER;
  failed_count INTEGER;
  cancelled_count INTEGER;
  total_size_val BIGINT;
  compressed_size_val BIGINT;
  avg_duration NUMERIC;
  min_duration_val INTEGER;
  max_duration_val INTEGER;
  success_rate_val NUMERIC;
BEGIN
  -- Calcular métricas do dia
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    COUNT(*) FILTER (WHERE status = 'FAILED'),
    COUNT(*) FILTER (WHERE status = 'CANCELLED'),
    COALESCE(SUM(size), 0),
    COALESCE(SUM(compressed_size), 0),
    AVG(duration),
    MIN(duration),
    MAX(duration)
  INTO 
    total_count,
    success_count,
    failed_count,
    cancelled_count,
    total_size_val,
    compressed_size_val,
    avg_duration,
    min_duration_val,
    max_duration_val
  FROM backup_records
  WHERE DATE(start_time) = target_date;
  
  -- Calcular taxa de sucesso
  success_rate_val := CASE 
    WHEN total_count > 0 THEN (success_count::NUMERIC / total_count::NUMERIC) * 100
    ELSE 100
  END;
  
  -- Inserir ou atualizar métricas
  INSERT INTO backup_metrics (
    date,
    total_backups,
    successful_backups,
    failed_backups,
    cancelled_backups,
    total_size,
    compressed_size,
    average_duration,
    min_duration,
    max_duration,
    success_rate
  ) VALUES (
    target_date,
    total_count,
    success_count,
    failed_count,
    cancelled_count,
    total_size_val,
    compressed_size_val,
    avg_duration,
    min_duration_val,
    max_duration_val,
    success_rate_val
  )
  ON CONFLICT (date, hour) DO UPDATE SET
    total_backups = EXCLUDED.total_backups,
    successful_backups = EXCLUDED.successful_backups,
    failed_backups = EXCLUDED.failed_backups,
    cancelled_backups = EXCLUDED.cancelled_backups,
    total_size = EXCLUDED.total_size,
    compressed_size = EXCLUDED.compressed_size,
    average_duration = EXCLUDED.average_duration,
    min_duration = EXCLUDED.min_duration,
    max_duration = EXCLUDED.max_duration,
    success_rate = EXCLUDED.success_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_backup_data()
RETURNS VOID AS $$
BEGIN
  -- Limpar alertas resolvidos antigos (30 dias)
  DELETE FROM backup_alerts 
  WHERE resolved = true 
    AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Limpar métricas antigas (90 dias)
  DELETE FROM backup_metrics 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
  
  -- Limpar logs de auditoria antigos (180 dias)
  DELETE FROM backup_audit_log 
  WHERE timestamp < NOW() - INTERVAL '180 days';
  
  -- Limpar recovery requests antigos (60 dias)
  DELETE FROM recovery_requests 
  WHERE completed_at < NOW() - INTERVAL '60 days'
    AND status IN ('COMPLETED', 'FAILED', 'CANCELLED');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE backup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para backup_configs
CREATE POLICY "Users can view their own backup configs" ON backup_configs
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can create backup configs" ON backup_configs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own backup configs" ON backup_configs
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can delete their own backup configs" ON backup_configs
  FOR DELETE USING (auth.uid() = created_by);

-- Políticas para backup_records
CREATE POLICY "Users can view backup records from their configs" ON backup_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM backup_configs 
      WHERE backup_configs.id = backup_records.config_id 
        AND (backup_configs.created_by = auth.uid() OR backup_configs.updated_by = auth.uid())
    )
  );

CREATE POLICY "System can manage backup records" ON backup_records
  FOR ALL USING (true); -- Permitir para sistema/serviços

-- Políticas para recovery_requests
CREATE POLICY "Users can view their own recovery requests" ON recovery_requests
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can create recovery requests" ON recovery_requests
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can update their own recovery requests" ON recovery_requests
  FOR UPDATE USING (auth.uid() = requested_by);

-- Políticas para backup_alerts
CREATE POLICY "Users can view backup alerts" ON backup_alerts
  FOR SELECT USING (true); -- Todos podem ver alertas

CREATE POLICY "Users can acknowledge alerts" ON backup_alerts
  FOR UPDATE USING (true);

-- Políticas para backup_metrics
CREATE POLICY "Users can view backup metrics" ON backup_metrics
  FOR SELECT USING (true); -- Métricas são públicas

-- Políticas para scheduled_tasks
CREATE POLICY "Users can view scheduled tasks from their configs" ON scheduled_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM backup_configs 
      WHERE backup_configs.id = scheduled_tasks.config_id 
        AND (backup_configs.created_by = auth.uid() OR backup_configs.updated_by = auth.uid())
    )
  );

-- Políticas para backup_audit_log
CREATE POLICY "Users can view their own audit logs" ON backup_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para backup_system_config
CREATE POLICY "Admins can manage system config" ON backup_system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Configurações padrão do sistema
INSERT INTO backup_system_config (key, value, description, category) VALUES
('max_concurrent_backups', '2', 'Número máximo de backups simultâneos', 'performance'),
('default_retention_days', '30', 'Retenção padrão em dias', 'retention'),
('default_compression_level', '6', 'Nível de compressão padrão (1-9)', 'compression'),
('alert_email_enabled', 'true', 'Habilitar alertas por email', 'notifications'),
('alert_sms_enabled', 'false', 'Habilitar alertas por SMS', 'notifications'),
('monitoring_interval_seconds', '60', 'Intervalo de monitoramento em segundos', 'monitoring'),
('cleanup_interval_hours', '24', 'Intervalo de limpeza automática em horas', 'maintenance'),
('max_backup_size_gb', '100', 'Tamanho máximo de backup em GB', 'limits'),
('encryption_algorithm', '"aes-256-gcm"', 'Algoritmo de criptografia padrão', 'security'),
('backup_timeout_hours', '4', 'Timeout padrão para backups em horas', 'performance')
ON CONFLICT (key) DO NOTHING;

-- Agendar limpeza automática diária
SELECT cron.schedule(
  'cleanup-backup-data',
  '0 2 * * *', -- Todo dia às 2h
  'SELECT cleanup_old_backup_data();'
);

-- Agendar cálculo de métricas diárias
SELECT cron.schedule(
  'calculate-daily-metrics',
  '30 0 * * *', -- Todo dia às 00:30
  'SELECT calculate_daily_backup_metrics();'
);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE backup_configs IS 'Configurações de backup definidas pelos usuários';
COMMENT ON TABLE backup_records IS 'Registros históricos de execuções de backup';
COMMENT ON TABLE recovery_requests IS 'Solicitações de recuperação de dados';
COMMENT ON TABLE backup_alerts IS 'Alertas e notificações do sistema de backup';
COMMENT ON TABLE backup_metrics IS 'Métricas agregadas de performance e uso';
COMMENT ON TABLE scheduled_tasks IS 'Tarefas agendadas para execução automática';
COMMENT ON TABLE backup_audit_log IS 'Log de auditoria de todas as operações';
COMMENT ON TABLE backup_system_config IS 'Configurações globais do sistema';

COMMENT ON COLUMN backup_configs.source_paths IS 'Caminhos de origem para backup';
COMMENT ON COLUMN backup_configs.exclude_patterns IS 'Padrões de arquivos a excluir';
COMMENT ON COLUMN backup_configs.database_config IS 'Configurações específicas para backup de BD';
COMMENT ON COLUMN backup_configs.storage_config IS 'Configurações do provider de storage';

COMMENT ON COLUMN backup_records.checksum IS 'Hash para verificação de integridade';
COMMENT ON COLUMN backup_records.metadata IS 'Metadados adicionais do backup';
COMMENT ON COLUMN backup_records.parent_backup_id IS 'Backup pai para backups incrementais';

COMMENT ON COLUMN recovery_requests.result IS 'Resultado detalhado da operação de recovery';
COMMENT ON COLUMN recovery_requests.progress IS 'Progresso da operação (0-100%)';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Conceder permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Conceder permissões para serviços
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
