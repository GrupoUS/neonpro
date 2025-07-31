-- =====================================================
-- NeonPro Audit Trail System - Database Schema
-- =====================================================
-- 
-- Sistema completo de auditoria com:
-- - Logs de auditoria com integridade
-- - Relatórios e estatísticas
-- - Alertas de segurança
-- - Arquivamento automático
-- - Row Level Security (RLS)
-- 
-- @author APEX Master Developer
-- @version 1.0.0
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA PRINCIPAL DE LOGS DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações do evento
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    
    -- Contexto do usuário
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    -- Informações de rede
    ip_address INET,
    user_agent TEXT,
    
    -- Recurso afetado
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    
    -- Dados da mudança (criptografados se sensíveis)
    old_values JSONB,
    new_values JSONB,
    
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}',
    
    -- Integridade e timestamp
    checksum VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT audit_logs_event_type_check CHECK (event_type ~ '^[a-z_]+\.[a-z_]+$')
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);

-- Índice composto para consultas complexas
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(
    event_type, severity, timestamp DESC, user_id
);

-- Índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values_gin ON audit_logs USING GIN(old_values);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values_gin ON audit_logs USING GIN(new_values);

-- =====================================================
-- TABELA DE ARQUIVO DE LOGS ANTIGOS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs_archive (
    LIKE audit_logs INCLUDING ALL
);

-- Particionamento por data para melhor performance
CREATE TABLE IF NOT EXISTS audit_logs_archive_2024 PARTITION OF audit_logs_archive
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE IF NOT EXISTS audit_logs_archive_2025 PARTITION OF audit_logs_archive
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- =====================================================
-- TABELA DE RELATÓRIOS DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações do relatório
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Filtros aplicados
    filters JSONB NOT NULL DEFAULT '{}',
    
    -- Metadados
    total_events INTEGER NOT NULL DEFAULT 0,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Status e configurações
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    export_format VARCHAR(20) DEFAULT 'json' CHECK (export_format IN ('json', 'csv', 'pdf', 'xlsx')),
    
    -- Arquivo exportado (se aplicável)
    export_file_path TEXT,
    export_file_size BIGINT,
    
    -- Auditoria do próprio relatório
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para relatórios
CREATE INDEX IF NOT EXISTS idx_audit_reports_generated_at ON audit_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_reports_generated_by ON audit_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_audit_reports_status ON audit_reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_reports_filters_gin ON audit_reports USING GIN(filters);

-- =====================================================
-- TABELA DE ALERTAS DE SEGURANÇA
-- =====================================================

CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referência ao evento de auditoria
    event_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
    
    -- Tipo e severidade do alerta
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Descrição e contexto
    description TEXT NOT NULL,
    
    -- Informações do usuário/sessão
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    
    -- Status do alerta
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    
    -- Ações tomadas
    actions_taken JSONB DEFAULT '[]',
    
    -- Responsável pela investigação
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'
);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_alert_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_assigned_to ON security_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_security_alerts_ip_address ON security_alerts(ip_address);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Configuração
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    
    -- Descrição e categoria
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    
    -- Metadados
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Configurações padrão
INSERT INTO audit_config (config_key, config_value, description, category) VALUES
('retention_days', '365', 'Dias de retenção dos logs antes do arquivamento', 'retention'),
('archive_enabled', 'true', 'Habilita arquivamento automático de logs antigos', 'retention'),
('encryption_enabled', 'true', 'Habilita criptografia de dados sensíveis', 'security'),
('real_time_alerts', 'true', 'Habilita alertas em tempo real para atividades suspeitas', 'alerts'),
('max_failed_attempts', '5', 'Máximo de tentativas de login falhadas antes de alerta', 'security'),
('suspicious_ip_threshold', '10', 'Número de eventos suspeitos por IP antes de alerta', 'security'),
('export_formats', '["json", "csv", "pdf"]', 'Formatos de exportação disponíveis', 'export'),
('log_levels', '["low", "medium", "high", "critical"]', 'Níveis de log disponíveis', 'logging')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- TABELA DE ESTATÍSTICAS DE AUDITORIA (CACHE)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Período das estatísticas
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Estatísticas agregadas
    total_events INTEGER NOT NULL DEFAULT 0,
    events_by_type JSONB NOT NULL DEFAULT '{}',
    events_by_severity JSONB NOT NULL DEFAULT '{}',
    events_by_user JSONB NOT NULL DEFAULT '{}',
    events_by_hour JSONB NOT NULL DEFAULT '{}',
    
    -- Métricas de segurança
    suspicious_activities INTEGER NOT NULL DEFAULT 0,
    failed_access_attempts INTEGER NOT NULL DEFAULT 0,
    security_violations INTEGER NOT NULL DEFAULT 0,
    
    -- Metadados
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    UNIQUE(period_start, period_end)
);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_audit_statistics_period ON audit_statistics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_audit_statistics_generated_at ON audit_statistics(generated_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilita RLS nas tabelas
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_logs
CREATE POLICY "audit_logs_select_policy" ON audit_logs
    FOR SELECT USING (
        -- Admins podem ver tudo
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_admin')
        )
        OR
        -- Usuários podem ver seus próprios logs
        user_id = auth.uid()
        OR
        -- Usuários da mesma clínica podem ver logs da clínica
        (
            clinic_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM user_clinics uc
                WHERE uc.user_id = auth.uid() 
                AND uc.clinic_id = audit_logs.clinic_id
            )
        )
    );

CREATE POLICY "audit_logs_insert_policy" ON audit_logs
    FOR INSERT WITH CHECK (
        -- Apenas o sistema pode inserir logs
        auth.uid() IS NOT NULL
    );

-- Políticas para audit_reports
CREATE POLICY "audit_reports_select_policy" ON audit_reports
    FOR SELECT USING (
        -- Admins podem ver todos os relatórios
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_admin')
        )
        OR
        -- Usuários podem ver relatórios que criaram
        generated_by = auth.uid()
    );

CREATE POLICY "audit_reports_insert_policy" ON audit_reports
    FOR INSERT WITH CHECK (
        generated_by = auth.uid()
    );

-- Políticas para security_alerts
CREATE POLICY "security_alerts_select_policy" ON security_alerts
    FOR SELECT USING (
        -- Apenas admins e security_admins podem ver alertas
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_admin')
        )
    );

CREATE POLICY "security_alerts_update_policy" ON security_alerts
    FOR UPDATE USING (
        -- Apenas admins e security_admins podem atualizar alertas
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_admin')
        )
    );

-- Políticas para audit_config
CREATE POLICY "audit_config_select_policy" ON audit_config
    FOR SELECT USING (
        -- Apenas admins podem ver configurações
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

CREATE POLICY "audit_config_update_policy" ON audit_config
    FOR UPDATE USING (
        -- Apenas admins podem alterar configurações
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para audit_reports
CREATE TRIGGER update_audit_reports_updated_at
    BEFORE UPDATE ON audit_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para audit_config
CREATE TRIGGER update_audit_config_updated_at
    BEFORE UPDATE ON audit_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para validar integridade dos logs
CREATE OR REPLACE FUNCTION validate_audit_log_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se o checksum está presente
    IF NEW.checksum IS NULL OR LENGTH(NEW.checksum) != 64 THEN
        RAISE EXCEPTION 'Checksum inválido ou ausente';
    END IF;
    
    -- Verifica se o event_type está no formato correto
    IF NEW.event_type !~ '^[a-z_]+\.[a-z_]+$' THEN
        RAISE EXCEPTION 'Formato de event_type inválido: %', NEW.event_type;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validação de integridade
CREATE TRIGGER validate_audit_log_integrity_trigger
    BEFORE INSERT OR UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_log_integrity();

-- Função para arquivamento automático
CREATE OR REPLACE FUNCTION auto_archive_old_logs()
RETURNS INTEGER AS $$
DECLARE
    retention_days INTEGER;
    cutoff_date TIMESTAMPTZ;
    archived_count INTEGER;
BEGIN
    -- Obtém configuração de retenção
    SELECT (config_value::TEXT)::INTEGER INTO retention_days
    FROM audit_config 
    WHERE config_key = 'retention_days' AND is_active = true;
    
    IF retention_days IS NULL THEN
        retention_days := 365; -- Padrão
    END IF;
    
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Move logs antigos para arquivo
    WITH moved_logs AS (
        DELETE FROM audit_logs 
        WHERE timestamp < cutoff_date
        RETURNING *
    )
    INSERT INTO audit_logs_archive 
    SELECT * FROM moved_logs;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RETURN archived_count;
END;
$$ language 'plpgsql';

-- Função para gerar estatísticas
CREATE OR REPLACE FUNCTION generate_audit_statistics(
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    stats_id UUID;
    total_events INTEGER;
    events_by_type JSONB;
    events_by_severity JSONB;
    events_by_user JSONB;
    events_by_hour JSONB;
    suspicious_count INTEGER;
    failed_attempts INTEGER;
    violations INTEGER;
BEGIN
    -- Conta total de eventos
    SELECT COUNT(*) INTO total_events
    FROM audit_logs
    WHERE timestamp BETWEEN start_date AND end_date;
    
    -- Eventos por tipo
    SELECT jsonb_object_agg(event_type, count)
    INTO events_by_type
    FROM (
        SELECT event_type, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY event_type
    ) t;
    
    -- Eventos por severidade
    SELECT jsonb_object_agg(severity, count)
    INTO events_by_severity
    FROM (
        SELECT severity, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY severity
    ) t;
    
    -- Eventos por usuário
    SELECT jsonb_object_agg(COALESCE(user_id::TEXT, 'anonymous'), count)
    INTO events_by_user
    FROM (
        SELECT user_id, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY user_id
        LIMIT 100 -- Limita para evitar objetos muito grandes
    ) t;
    
    -- Eventos por hora
    SELECT jsonb_object_agg(hour_bucket, count)
    INTO events_by_hour
    FROM (
        SELECT 
            EXTRACT(HOUR FROM timestamp)::TEXT as hour_bucket,
            COUNT(*) as count
        FROM audit_logs
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour_bucket
    ) t;
    
    -- Atividades suspeitas
    SELECT COUNT(*) INTO suspicious_count
    FROM audit_logs
    WHERE timestamp BETWEEN start_date AND end_date
    AND event_type LIKE '%suspicious%';
    
    -- Tentativas de acesso falhadas
    SELECT COUNT(*) INTO failed_attempts
    FROM audit_logs
    WHERE timestamp BETWEEN start_date AND end_date
    AND (event_type LIKE '%failed%' OR event_type = 'auth.login_failed');
    
    -- Violações de segurança
    SELECT COUNT(*) INTO violations
    FROM audit_logs
    WHERE timestamp BETWEEN start_date AND end_date
    AND event_type LIKE '%violation%';
    
    -- Insere estatísticas
    INSERT INTO audit_statistics (
        period_start,
        period_end,
        total_events,
        events_by_type,
        events_by_severity,
        events_by_user,
        events_by_hour,
        suspicious_activities,
        failed_access_attempts,
        security_violations
    ) VALUES (
        start_date,
        end_date,
        total_events,
        COALESCE(events_by_type, '{}'),
        COALESCE(events_by_severity, '{}'),
        COALESCE(events_by_user, '{}'),
        COALESCE(events_by_hour, '{}'),
        suspicious_count,
        failed_attempts,
        violations
    ) RETURNING id INTO stats_id;
    
    RETURN stats_id;
END;
$$ language 'plpgsql';

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Tabela principal de logs de auditoria com integridade e criptografia';
COMMENT ON TABLE audit_logs_archive IS 'Arquivo de logs antigos para retenção de longo prazo';
COMMENT ON TABLE audit_reports IS 'Relatórios de auditoria gerados pelos usuários';
COMMENT ON TABLE security_alerts IS 'Alertas de segurança baseados em atividades suspeitas';
COMMENT ON TABLE audit_config IS 'Configurações do sistema de auditoria';
COMMENT ON TABLE audit_statistics IS 'Estatísticas agregadas de auditoria (cache)';

COMMENT ON COLUMN audit_logs.checksum IS 'Hash SHA-256 para verificação de integridade';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores anteriores (criptografados se sensíveis)';
COMMENT ON COLUMN audit_logs.new_values IS 'Novos valores (criptografados se sensíveis)';
COMMENT ON COLUMN security_alerts.actions_taken IS 'Array de ações tomadas em resposta ao alerta';

-- =====================================================
-- GRANTS E PERMISSÕES
-- =====================================================

-- Permissões para authenticated users
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT ON audit_reports TO authenticated;
GRANT INSERT, UPDATE ON audit_reports TO authenticated;
GRANT SELECT ON security_alerts TO authenticated;
GRANT SELECT ON audit_statistics TO authenticated;

-- Permissões para service_role (sistema)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índice parcial para eventos críticos
CREATE INDEX IF NOT EXISTS idx_audit_logs_critical_events 
ON audit_logs(timestamp DESC) 
WHERE severity = 'critical';

-- Índice parcial para eventos de segurança
CREATE INDEX IF NOT EXISTS idx_audit_logs_security_events 
ON audit_logs(timestamp DESC) 
WHERE event_type LIKE 'security.%';

-- Índice para consultas por período
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_range 
ON audit_logs(timestamp) 
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Atualiza estatísticas das tabelas
ANALYZE audit_logs;
ANALYZE audit_reports;
ANALYZE security_alerts;
ANALYZE audit_config;
ANALYZE audit_statistics;

-- Log de criação do schema
INSERT INTO audit_logs (
    event_type,
    severity,
    description,
    metadata,
    checksum
) VALUES (
    'system.schema_created',
    'medium',
    'Schema de auditoria criado com sucesso',
    '{"version": "1.0.0", "tables_created": ["audit_logs", "audit_logs_archive", "audit_reports", "security_alerts", "audit_config", "audit_statistics"]}',
    encode(sha256('system.schema_created'::bytea), 'hex')
);
