-- Migration: LGPD Automation Tables
-- Description: Criação das tabelas para suporte à automação LGPD
-- Date: 2024-12-20

-- Tabela de configuração da automação
CREATE TABLE IF NOT EXISTS lgpd_automation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Configurações de agendamento
    schedules JSONB NOT NULL DEFAULT '{
        "fullAutomation": {
            "enabled": false,
            "cron": "0 2 * * *",
            "timezone": "America/Sao_Paulo"
        },
        "consentManagement": {
            "enabled": false,
            "cron": "0 */6 * * *"
        },
        "dataSubjectRights": {
            "enabled": false,
            "cron": "0 */4 * * *"
        },
        "auditReporting": {
            "enabled": false,
            "cron": "0 1 * * 0"
        },
        "anonymization": {
            "enabled": false,
            "cron": "0 3 * * 0"
        }
    }',
    
    -- Configurações de notificação
    notifications JSONB NOT NULL DEFAULT '{
        "email": {
            "enabled": false,
            "recipients": [],
            "events": []
        },
        "webhook": {
            "enabled": false,
            "url": "",
            "events": []
        }
    }',
    
    -- Limites de execução
    limits JSONB NOT NULL DEFAULT '{
        "maxConcurrentJobs": 3,
        "jobTimeout": 3600,
        "retryAttempts": 3,
        "batchSize": 100
    }',
    
    -- Recursos habilitados
    features JSONB NOT NULL DEFAULT '{
        "autoConsentManagement": false,
        "autoDataSubjectRights": false,
        "autoAuditReporting": false,
        "autoAnonymization": false,
        "realTimeMonitoring": false,
        "smartAlerts": false
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(clinic_id)
);

-- Tabela de jobs de automação
CREATE TABLE IF NOT EXISTS lgpd_automation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'full_automation',
        'consent_management',
        'data_subject_rights',
        'audit_reporting',
        'anonymization',
        'health_check'
    )),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'running',
        'completed',
        'failed',
        'cancelled'
    )),
    
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN (
        'low',
        'normal',
        'high'
    )),
    
    parameters JSONB DEFAULT '{}',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    message TEXT,
    error_message TEXT,
    results JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de alertas de conformidade
CREATE TABLE IF NOT EXISTS lgpd_compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    severity VARCHAR(10) NOT NULL CHECK (severity IN (
        'low',
        'medium',
        'high',
        'critical'
    )),
    
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'consent',
        'data_subject_rights',
        'security',
        'audit',
        'performance',
        'compliance'
    )),
    
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'resolved',
        'dismissed'
    )),
    
    source VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    auto_resolve_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de métricas de conformidade
CREATE TABLE IF NOT EXISTS lgpd_compliance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    
    dimensions JSONB DEFAULT '{}',
    tags JSONB DEFAULT '{}',
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de incidentes de segurança
CREATE TABLE IF NOT EXISTS lgpd_security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN (
        'low',
        'medium',
        'high',
        'critical'
    )),
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open',
        'investigating',
        'resolved',
        'closed'
    )),
    
    affected_data_types TEXT[],
    affected_records_count INTEGER DEFAULT 0,
    
    detection_method VARCHAR(100),
    source_ip INET,
    user_agent TEXT,
    
    mitigation_steps TEXT,
    resolution_notes TEXT,
    
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_config_clinic_id ON lgpd_automation_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_jobs_clinic_id ON lgpd_automation_jobs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_jobs_status ON lgpd_automation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_jobs_type ON lgpd_automation_jobs(type);
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_jobs_created_at ON lgpd_automation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_automation_jobs_scheduled_for ON lgpd_automation_jobs(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_clinic_id ON lgpd_compliance_alerts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_status ON lgpd_compliance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_severity ON lgpd_compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_category ON lgpd_compliance_alerts(category);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_created_at ON lgpd_compliance_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_alerts_auto_resolve ON lgpd_compliance_alerts(auto_resolve_at) WHERE auto_resolve_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_metrics_clinic_id ON lgpd_compliance_metrics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_metrics_type ON lgpd_compliance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_metrics_recorded_at ON lgpd_compliance_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_compliance_metrics_composite ON lgpd_compliance_metrics(clinic_id, metric_type, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_lgpd_security_incidents_clinic_id ON lgpd_security_incidents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_security_incidents_status ON lgpd_security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_lgpd_security_incidents_severity ON lgpd_security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_lgpd_security_incidents_detected_at ON lgpd_security_incidents(detected_at DESC);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lgpd_automation_config_updated_at
    BEFORE UPDATE ON lgpd_automation_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_automation_jobs_updated_at
    BEFORE UPDATE ON lgpd_automation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_compliance_alerts_updated_at
    BEFORE UPDATE ON lgpd_compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_security_incidents_updated_at
    BEFORE UPDATE ON lgpd_security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE lgpd_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_security_incidents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lgpd_automation_config
CREATE POLICY "Users can view automation config for their clinic" ON lgpd_automation_config
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update automation config for their clinic" ON lgpd_automation_config
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert automation config for their clinic" ON lgpd_automation_config
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
            AND role IN ('admin', 'manager')
        )
    );

-- Políticas RLS para lgpd_automation_jobs
CREATE POLICY "Users can view automation jobs for their clinic" ON lgpd_automation_jobs
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert automation jobs for their clinic" ON lgpd_automation_jobs
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update automation jobs for their clinic" ON lgpd_automation_jobs
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Políticas RLS para lgpd_compliance_alerts
CREATE POLICY "Users can view compliance alerts for their clinic" ON lgpd_compliance_alerts
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert compliance alerts for their clinic" ON lgpd_compliance_alerts
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update compliance alerts for their clinic" ON lgpd_compliance_alerts
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Políticas RLS para lgpd_compliance_metrics
CREATE POLICY "Users can view compliance metrics for their clinic" ON lgpd_compliance_metrics
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "System can insert compliance metrics" ON lgpd_compliance_metrics
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para lgpd_security_incidents
CREATE POLICY "Users can view security incidents for their clinic" ON lgpd_security_incidents
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert security incidents for their clinic" ON lgpd_security_incidents
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update security incidents for their clinic" ON lgpd_security_incidents
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() AND status = 'active'
            AND role IN ('admin', 'manager')
        )
    );

-- Função para auto-resolver alertas
CREATE OR REPLACE FUNCTION auto_resolve_expired_alerts()
RETURNS void AS $$
BEGIN
    UPDATE lgpd_compliance_alerts 
    SET 
        status = 'resolved',
        resolved_at = NOW(),
        resolution_notes = 'Auto-resolvido por expiração',
        updated_at = NOW()
    WHERE 
        status = 'active' 
        AND auto_resolve_at IS NOT NULL 
        AND auto_resolve_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para calcular score de conformidade
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_clinic_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    consent_score NUMERIC := 0;
    audit_score NUMERIC := 0;
    alert_score NUMERIC := 0;
    request_score NUMERIC := 0;
    final_score NUMERIC := 0;
BEGIN
    -- Score de consentimentos (30%)
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE status = 'active')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 30,
        0
    ) INTO consent_score
    FROM lgpd_consent
    WHERE clinic_id = p_clinic_id;
    
    -- Score de auditoria (25%)
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 25
        ELSE 0
    END INTO audit_score
    FROM lgpd_audit_trail
    WHERE clinic_id = p_clinic_id
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Score de alertas (25%)
    SELECT COALESCE(
        25 - (COUNT(*) FILTER (WHERE severity IN ('high', 'critical') AND status = 'active') * 5),
        0
    ) INTO alert_score
    FROM lgpd_compliance_alerts
    WHERE clinic_id = p_clinic_id;
    
    -- Score de solicitações (20%)
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 20,
        20
    ) INTO request_score
    FROM lgpd_data_subject_requests
    WHERE clinic_id = p_clinic_id
    AND created_at >= NOW() - INTERVAL '90 days';
    
    final_score := GREATEST(0, LEAST(100, consent_score + audit_score + alert_score + request_score));
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE lgpd_automation_config IS 'Configurações da automação LGPD por clínica';
COMMENT ON TABLE lgpd_automation_jobs IS 'Jobs de automação executados ou agendados';
COMMENT ON TABLE lgpd_compliance_alerts IS 'Alertas de conformidade LGPD';
COMMENT ON TABLE lgpd_compliance_metrics IS 'Métricas de conformidade coletadas automaticamente';
COMMENT ON TABLE lgpd_security_incidents IS 'Incidentes de segurança relacionados à LGPD';

-- Inserir configuração padrão para clínicas existentes
INSERT INTO lgpd_automation_config (clinic_id, enabled, created_by)
SELECT 
    id as clinic_id,
    false as enabled,
    (SELECT id FROM auth.users LIMIT 1) as created_by
FROM clinics 
WHERE id NOT IN (SELECT clinic_id FROM lgpd_automation_config)
ON CONFLICT (clinic_id) DO NOTHING;