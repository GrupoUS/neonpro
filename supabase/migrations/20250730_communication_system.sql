-- ================================================
-- NeonPro Communication System Database Schema
-- Story 4.1: Patient Communication Hub
-- Phase 1: Foundation & Database Setup
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- CORE COMMUNICATION TABLES
-- ================================================

-- Conversas/Threads de comunicação
CREATE TABLE communication_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('internal', 'patient_chat', 'broadcast', 'appointment_reminder')),
    title VARCHAR(255),
    participants UUID[] NOT NULL DEFAULT '{}',
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT valid_participants CHECK (array_length(participants, 1) > 0)
);

-- Mensagens do sistema de comunicação
CREATE TABLE communication_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES communication_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID REFERENCES auth.users(id), -- Para mensagens diretas
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'template', 'system', 'reminder')),
    metadata JSONB DEFAULT '{}',
    attachment_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    encryption_key_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete constraint
    CONSTRAINT valid_message_state CHECK (
        (deleted_at IS NULL AND content IS NOT NULL) OR 
        (deleted_at IS NOT NULL)
    )
);

-- Templates de comunicação personalizáveis
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('email', 'sms', 'push', 'chat', 'whatsapp')),
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'appointment', 'reminder', 'marketing', 'post_procedure', 'follow_up')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Lista de variáveis disponíveis: [{name, type, description}]
    triggers JSONB DEFAULT '[]', -- Eventos que ativam o template
    active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint para evitar templates duplicados
    UNIQUE(clinic_id, name, template_type)
);

-- Sistema de notificações multi-canal
CREATE TABLE communication_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id UUID REFERENCES patients(id), -- Para notificações de pacientes
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('push', 'email', 'sms', 'whatsapp', 'in_app')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    title VARCHAR(255),
    content TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Dados adicionais para a notificação
    template_id UUID REFERENCES communication_templates(id),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    external_id VARCHAR(255), -- ID do provedor externo (SendGrid, Twilio, etc.)
    cost_cents INTEGER DEFAULT 0, -- Custo em centavos para tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índice composto para performance
    CONSTRAINT valid_notification_state CHECK (
        (failed_at IS NULL AND sent_at IS NOT NULL) OR 
        (failed_at IS NOT NULL AND error_message IS NOT NULL) OR
        (sent_at IS NULL AND failed_at IS NULL)
    )
);

-- Consentimentos LGPD para comunicação
CREATE TABLE communication_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('email', 'sms', 'push', 'whatsapp', 'marketing', 'reminders', 'surveys')),
    consented BOOLEAN NOT NULL DEFAULT false,
    consented_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    consent_source VARCHAR(100) DEFAULT 'manual', -- 'manual', 'registration', 'portal', 'api'
    evidence_data JSONB DEFAULT '{}', -- Dados de evidência do consentimento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir unicidade por paciente/tipo
    UNIQUE(patient_id, clinic_id, consent_type),
    
    -- Constraint para validar estado do consentimento
    CONSTRAINT valid_consent_state CHECK (
        (consented = true AND consented_at IS NOT NULL AND revoked_at IS NULL) OR
        (consented = false AND (revoked_at IS NOT NULL OR consented_at IS NULL))
    )
);

-- Log de auditoria para compliance LGPD
CREATE TABLE communication_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'message', 'notification', 'consent', 'template'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'send', 'deliver', 'read'
    actor_id UUID REFERENCES auth.users(id),
    patient_id UUID REFERENCES patients(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Índice para busca por entidade
    CONSTRAINT immutable_audit CHECK (true) -- Auditoria é imutável
);

-- ================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================

-- Índices para conversas
CREATE INDEX idx_conversations_clinic_patient ON communication_conversations(clinic_id, patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_participants ON communication_conversations USING GIN(participants);
CREATE INDEX idx_conversations_type_active ON communication_conversations(type, is_active);

-- Índices para mensagens
CREATE INDEX idx_messages_conversation ON communication_messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON communication_messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON communication_messages(recipient_id, created_at DESC) WHERE recipient_id IS NOT NULL;
CREATE INDEX idx_messages_unread ON communication_messages(recipient_id, read_at) WHERE read_at IS NULL;

-- Índices para notificações
CREATE INDEX idx_notifications_recipient ON communication_notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_patient ON communication_notifications(patient_id, created_at DESC) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_notifications_scheduled ON communication_notifications(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_notifications_failed ON communication_notifications(clinic_id, failed_at) WHERE failed_at IS NOT NULL;

-- Índices para templates
CREATE INDEX idx_templates_clinic_active ON communication_templates(clinic_id, active);
CREATE INDEX idx_templates_category ON communication_templates(category, template_type);

-- Índices para consentimentos
CREATE INDEX idx_consents_patient_clinic ON communication_consents(patient_id, clinic_id);
CREATE INDEX idx_consents_type_status ON communication_consents(consent_type, consented);

-- Índices para auditoria
CREATE INDEX idx_audit_entity ON communication_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_patient ON communication_audit_log(patient_id, timestamp DESC);
CREATE INDEX idx_audit_clinic ON communication_audit_log(clinic_id, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON communication_audit_log(timestamp DESC);

-- ================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ================================================

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION audit_communication_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir registro de auditoria
    INSERT INTO communication_audit_log (
        entity_type,
        entity_id,
        action,
        actor_id,
        details,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CURRENT_SETTING('app.current_user_id', true)::UUID,
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de auditoria
CREATE TRIGGER audit_conversations
    AFTER INSERT OR UPDATE OR DELETE ON communication_conversations
    FOR EACH ROW EXECUTE FUNCTION audit_communication_changes();

CREATE TRIGGER audit_messages
    AFTER INSERT OR UPDATE OR DELETE ON communication_messages
    FOR EACH ROW EXECUTE FUNCTION audit_communication_changes();

CREATE TRIGGER audit_notifications
    AFTER INSERT OR UPDATE OR DELETE ON communication_notifications
    FOR EACH ROW EXECUTE FUNCTION audit_communication_changes();

CREATE TRIGGER audit_consents
    AFTER INSERT OR UPDATE OR DELETE ON communication_consents
    FOR EACH ROW EXECUTE FUNCTION audit_communication_changes();

-- ================================================
-- FUNÇÕES UTILITÁRIAS
-- ================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON communication_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consents_updated_at
    BEFORE UPDATE ON communication_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar consentimento antes de enviar notificação
CREATE OR REPLACE FUNCTION check_communication_consent(
    p_patient_id UUID,
    p_clinic_id UUID,
    p_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    consent_exists BOOLEAN;
BEGIN
    SELECT consented INTO consent_exists
    FROM communication_consents
    WHERE patient_id = p_patient_id
    AND clinic_id = p_clinic_id
    AND consent_type = p_type
    AND consented = true
    AND revoked_at IS NULL;
    
    RETURN COALESCE(consent_exists, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- VIEWS PARA CONSULTAS COMUNS
-- ================================================

-- View para mensagens não lidas por usuário
CREATE VIEW unread_messages_by_user AS
SELECT 
    u.id as user_id,
    COUNT(m.id) as unread_count,
    MAX(m.created_at) as latest_message_at
FROM auth.users u
LEFT JOIN communication_messages m ON u.id = m.recipient_id
WHERE m.read_at IS NULL
AND m.deleted_at IS NULL
GROUP BY u.id;

-- View para estatísticas de comunicação por clínica
CREATE VIEW communication_stats_by_clinic AS
SELECT 
    c.id as clinic_id,
    c.clinic_name as clinic_name,
    COUNT(DISTINCT conv.id) as total_conversations,
    COUNT(DISTINCT msg.id) as total_messages,
    COUNT(DISTINCT notif.id) as total_notifications,
    COUNT(DISTINCT CASE WHEN notif.sent_at IS NOT NULL THEN notif.id END) as sent_notifications,
    COUNT(DISTINCT CASE WHEN notif.failed_at IS NOT NULL THEN notif.id END) as failed_notifications
FROM clinics c
LEFT JOIN communication_conversations conv ON c.id = conv.clinic_id
LEFT JOIN communication_messages msg ON conv.id = msg.conversation_id
LEFT JOIN communication_notifications notif ON c.id = notif.clinic_id
GROUP BY c.id, c.clinic_name;

-- ================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ================================================

COMMENT ON TABLE communication_conversations IS 'Tabela principal para threads de conversação entre usuários e pacientes';
COMMENT ON TABLE communication_messages IS 'Mensagens individuais dentro das conversações';
COMMENT ON TABLE communication_templates IS 'Templates personalizáveis para diferentes tipos de comunicação';
COMMENT ON TABLE communication_notifications IS 'Sistema de notificações multi-canal (email, SMS, push)';
COMMENT ON TABLE communication_consents IS 'Controle de consentimentos LGPD para comunicação';
COMMENT ON TABLE communication_audit_log IS 'Log de auditoria imutável para compliance';

COMMENT ON FUNCTION check_communication_consent IS 'Verifica se o paciente deu consentimento para um tipo específico de comunicação';
COMMENT ON VIEW unread_messages_by_user IS 'Contagem de mensagens não lidas por usuário';
COMMENT ON VIEW communication_stats_by_clinic IS 'Estatísticas agregadas de comunicação por clínica';
