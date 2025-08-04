-- NeonPro Notification System Schema
-- Story 1.7: Sistema de Notificações Avançado
-- Created: 2025-07-30

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notification channels enum
CREATE TYPE notification_channel AS ENUM (
    'push',
    'email', 
    'sms',
    'whatsapp',
    'in_app'
);

-- Notification status enum
CREATE TYPE notification_status AS ENUM (
    'pending',
    'processing',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'failed',
    'cancelled'
);

-- Notification priority enum
CREATE TYPE notification_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- Template status enum
CREATE TYPE template_status AS ENUM (
    'draft',
    'active',
    'archived'
);

-- Main notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Notification details
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel notification_channel NOT NULL,
    priority notification_priority DEFAULT 'normal',
    status notification_status DEFAULT 'pending',
    
    -- Template information
    template_id UUID REFERENCES notification_templates(id),
    template_variables JSONB DEFAULT '{}',
    
    -- Delivery details
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_push_token TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Tracking and analytics
    external_id TEXT, -- ID from external provider (SendGrid, Twilio, etc.)
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    failure_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_recipient CHECK (
        (channel = 'email' AND recipient_email IS NOT NULL) OR
        (channel = 'sms' AND recipient_phone IS NOT NULL) OR
        (channel = 'push' AND recipient_push_token IS NOT NULL) OR
        (channel = 'whatsapp' AND recipient_phone IS NOT NULL) OR
        (channel = 'in_app')
    )
);

-- Notification templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- appointment, reminder, marketing, system, etc.
    channel notification_channel NOT NULL,
    
    -- Template content
    subject_template TEXT, -- For email/push
    content_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Available variables for this template
    
    -- Configuration
    status template_status DEFAULT 'draft',
    is_system_template BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id, name, channel)
);

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Category preferences
    appointment_notifications BOOLEAN DEFAULT TRUE,
    reminder_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    system_notifications BOOLEAN DEFAULT TRUE,
    
    -- Timing preferences
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    
    -- Contact information
    preferred_email TEXT,
    preferred_phone TEXT,
    push_tokens JSONB DEFAULT '[]', -- Array of push tokens for different devices
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, clinic_id)
);

-- Notification channels configuration
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Channel details
    channel notification_channel NOT NULL,
    provider TEXT NOT NULL, -- sendgrid, twilio, firebase, etc.
    
    -- Configuration
    config JSONB NOT NULL, -- Provider-specific configuration
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id, channel, provider)
);

-- Notification analytics and metrics
CREATE TABLE notification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Analytics data
    event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, failed
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional data
    user_agent TEXT,
    ip_address INET,
    device_info JSONB,
    location_info JSONB,
    
    -- Provider data
    provider_data JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification audit logs
CREATE TABLE notification_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Audit details
    action TEXT NOT NULL, -- created, updated, sent, cancelled, etc.
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    api_endpoint TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_clinic_id ON notifications(clinic_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_notification_templates_clinic_id ON notification_templates(clinic_id);
CREATE INDEX idx_notification_templates_category ON notification_templates(category);
CREATE INDEX idx_notification_templates_channel ON notification_templates(channel);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_clinic_id ON notification_preferences(clinic_id);

CREATE INDEX idx_notification_channels_clinic_id ON notification_channels(clinic_id);
CREATE INDEX idx_notification_channels_channel ON notification_channels(channel);

CREATE INDEX idx_notification_analytics_notification_id ON notification_analytics(notification_id);
CREATE INDEX idx_notification_analytics_event_type ON notification_analytics(event_type);
CREATE INDEX idx_notification_analytics_event_timestamp ON notification_analytics(event_timestamp);

CREATE INDEX idx_notification_audit_logs_notification_id ON notification_audit_logs(notification_id);
CREATE INDEX idx_notification_audit_logs_user_id ON notification_audit_logs(user_id);
CREATE INDEX idx_notification_audit_logs_created_at ON notification_audit_logs(created_at);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_channels_updated_at
    BEFORE UPDATE ON notification_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can access their own notifications" ON notifications
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notifications.clinic_id
        )
    );

-- RLS Policies for notification_templates
CREATE POLICY "Clinic staff can manage templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notification_templates.clinic_id
        )
    );

-- RLS Policies for notification_preferences  
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notification_preferences.clinic_id
            AND cs.role IN ('admin', 'manager')
        )
    );

-- RLS Policies for notification_channels
CREATE POLICY "Clinic admins can manage channels" ON notification_channels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notification_channels.clinic_id
            AND cs.role IN ('admin', 'manager')
        )
    );

-- RLS Policies for notification_analytics
CREATE POLICY "Clinic staff can view analytics" ON notification_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notification_analytics.clinic_id
        )
    );

-- RLS Policies for notification_audit_logs
CREATE POLICY "Clinic admins can view audit logs" ON notification_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs 
            WHERE cs.user_id = auth.uid() 
            AND cs.clinic_id = notification_audit_logs.clinic_id
            AND cs.role = 'admin'
        )
    );

-- Insert default system templates
INSERT INTO notification_templates (
    id,
    name,
    description,
    category,
    channel,
    subject_template,
    content_template,
    variables,
    status,
    is_system_template
) VALUES
-- Appointment reminder templates
(
    uuid_generate_v4(),
    'Appointment Reminder - Email',
    'Email reminder for upcoming appointments',
    'appointment',
    'email',
    'Lembrete: Consulta agendada para {appointment_date}',
    'Olá {patient_name}, sua consulta está agendada para {appointment_date} às {appointment_time} com {professional_name}. Local: {clinic_address}. Em caso de dúvidas, entre em contato: {clinic_phone}.',
    '["patient_name", "appointment_date", "appointment_time", "professional_name", "clinic_address", "clinic_phone"]',
    'active',
    true
),
(
    uuid_generate_v4(),
    'Appointment Reminder - SMS',
    'SMS reminder for upcoming appointments',
    'appointment',
    'sms',
    null,
    'Lembrete: Sua consulta é amanhã {appointment_date} às {appointment_time} com {professional_name}. {clinic_name} - {clinic_phone}',
    '["patient_name", "appointment_date", "appointment_time", "professional_name", "clinic_name", "clinic_phone"]',
    'active',
    true
),
-- Appointment confirmation templates
(
    uuid_generate_v4(),
    'Appointment Confirmation - Email',
    'Email confirmation for new appointments',
    'appointment',
    'email',
    'Consulta confirmada - {clinic_name}',
    'Olá {patient_name}, sua consulta foi confirmada para {appointment_date} às {appointment_time} com {professional_name}. Chegue 15 minutos antes. Local: {clinic_address}. Contato: {clinic_phone}.',
    '["patient_name", "appointment_date", "appointment_time", "professional_name", "clinic_name", "clinic_address", "clinic_phone"]',
    'active',
    true
),
-- Welcome message template
(
    uuid_generate_v4(),
    'Welcome New Patient - Email',
    'Welcome message for new patients',
    'system',
    'email',
    'Bem-vindo à {clinic_name}!',
    'Olá {patient_name}, seja bem-vindo à {clinic_name}! Seu cadastro foi realizado com sucesso. Para agendamentos, entre em contato: {clinic_phone} ou acesse nosso portal online.',
    '["patient_name", "clinic_name", "clinic_phone"]',
    'active',
    true
);

-- Create view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    clinic_id,
    channel,
    status,
    DATE(created_at) as date,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_count,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    ROUND(
        (COUNT(CASE WHEN status = 'delivered' THEN 1 END)::FLOAT / COUNT(*)) * 100, 
        2
    ) as delivery_rate,
    ROUND(
        (COUNT(CASE WHEN status = 'opened' THEN 1 END)::FLOAT / COUNT(*)) * 100, 
        2
    ) as open_rate,
    ROUND(
        (COUNT(CASE WHEN status = 'clicked' THEN 1 END)::FLOAT / COUNT(*)) * 100, 
        2
    ) as click_rate
FROM notifications
GROUP BY clinic_id, channel, status, DATE(created_at);

-- Create function to get clinic notification metrics
CREATE OR REPLACE FUNCTION get_clinic_notification_metrics(
    clinic_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_sent BIGINT,
    total_delivered BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    total_failed BIGINT,
    delivery_rate NUMERIC,
    open_rate NUMERIC,
    click_rate NUMERIC,
    avg_delivery_time INTERVAL,
    channel_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            COUNT(*) as sent,
            COUNT(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 END) as delivered,
            COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) as opened,
            COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
            AVG(delivered_at - created_at) as avg_delivery,
            json_object_agg(
                channel, 
                json_build_object(
                    'sent', COUNT(*),
                    'delivered', COUNT(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 END),
                    'failed', COUNT(CASE WHEN status = 'failed' THEN 1 END)
                )
            ) as channels
        FROM notifications
        WHERE clinic_id = clinic_uuid
        AND DATE(created_at) BETWEEN start_date AND end_date
        GROUP BY clinic_id
    )
    SELECT 
        m.sent,
        m.delivered,
        m.opened,
        m.clicked,
        m.failed,
        ROUND((m.delivered::NUMERIC / NULLIF(m.sent, 0)) * 100, 2),
        ROUND((m.opened::NUMERIC / NULLIF(m.sent, 0)) * 100, 2),
        ROUND((m.clicked::NUMERIC / NULLIF(m.sent, 0)) * 100, 2),
        m.avg_delivery,
        m.channels::JSONB
    FROM metrics m;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT ON notification_channels TO authenticated;
GRANT SELECT ON notification_analytics TO authenticated;
GRANT SELECT ON notification_audit_logs TO authenticated;
GRANT SELECT ON notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_clinic_notification_metrics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Main table storing all notifications sent through the system';
COMMENT ON TABLE notification_templates IS 'Templates for different types of notifications';
COMMENT ON TABLE notification_preferences IS 'User preferences for receiving notifications';
COMMENT ON TABLE notification_channels IS 'Configuration for different notification channels per clinic';
COMMENT ON TABLE notification_analytics IS 'Analytics and tracking data for notifications';
COMMENT ON TABLE notification_audit_logs IS 'Audit trail for notification-related actions';

COMMENT ON FUNCTION get_clinic_notification_metrics IS 'Get comprehensive notification metrics for a clinic within a date range';