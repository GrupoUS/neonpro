-- ============================================================================
-- NeonPro Notification System - Database Schema
-- Story 1.7: Sistema de Notificações
-- 
-- Estrutura completa do banco de dados para o sistema de notificações
-- Suporte a templates, canais, automação e analytics
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'APPOINTMENT',
  'PAYMENT', 
  'REMINDER',
  'ALERT',
  'MARKETING',
  'SYSTEM'
);

-- Canais de notificação
CREATE TYPE notification_channel AS ENUM (
  'EMAIL',
  'SMS',
  'PUSH',
  'IN_APP'
);

-- Prioridades
CREATE TYPE notification_priority AS ENUM (
  'LOW',
  'MEDIUM', 
  'HIGH',
  'URGENT'
);

-- Status de entrega
CREATE TYPE delivery_status AS ENUM (
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'CANCELLED'
);

-- Tipos de trigger para automação
CREATE TYPE trigger_type AS ENUM (
  'EVENT',
  'SCHEDULE',
  'CONDITION'
);

-- Tipos de ação para automação
CREATE TYPE action_type AS ENUM (
  'SEND_NOTIFICATION',
  'DELAY',
  'WEBHOOK',
  'UPDATE_ENTITY'
);

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Templates de notificação
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type notification_type NOT NULL,
  channels notification_channel[] NOT NULL DEFAULT '{}',
  subject VARCHAR(500),
  content TEXT NOT NULL,
  html_content TEXT,
  variables JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT templates_name_unique UNIQUE(name)
);

-- Configurações de canais
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel notification_channel NOT NULL,
  name VARCHAR(255) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  is_healthy BOOLEAN DEFAULT true,
  last_health_check TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT channels_channel_unique UNIQUE(channel)
);

-- Preferências de usuário
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  channel notification_channel NOT NULL,
  type notification_type,
  is_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  frequency_limit INTEGER, -- máximo por dia
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT preferences_user_channel_type_unique UNIQUE(user_id, channel, type)
);

-- Notificações enviadas
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES notification_templates(id),
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'MEDIUM',
  channel notification_channel NOT NULL,
  
  -- Destinatário
  recipient_id UUID REFERENCES auth.users(id),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_device_token TEXT,
  
  -- Conteúdo
  subject VARCHAR(500),
  content TEXT NOT NULL,
  html_content TEXT,
  variables JSONB DEFAULT '{}',
  
  -- Agendamento
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}', -- contexto da aplicação
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entregas de notificação
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  -- Status
  status delivery_status DEFAULT 'PENDING',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Detalhes da entrega
  provider_id VARCHAR(255), -- ID do provedor externo
  provider_response JSONB,
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Métricas
  delivery_time_ms INTEGER, -- tempo de entrega em ms
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos de interação (abrir, clicar, etc.)
CREATE TABLE notification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES notification_deliveries(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type VARCHAR(50) NOT NULL, -- 'opened', 'clicked', 'unsubscribed', etc.
  
  -- Detalhes do evento
  user_agent TEXT,
  ip_address INET,
  location JSONB, -- país, cidade, etc.
  device_info JSONB,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTOMAÇÃO
-- ============================================================================

-- Regras de automação
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuração
  is_active BOOLEAN DEFAULT true,
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Estatísticas
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execuções de automação
CREATE TABLE automation_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
  
  -- Dados da execução
  trigger_data JSONB,
  execution_context JSONB,
  results JSONB DEFAULT '[]',
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Erro
  error_message TEXT,
  error_details JSONB,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- ANALYTICS E RELATÓRIOS
-- ============================================================================

-- Estatísticas diárias
CREATE TABLE notification_stats_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  
  -- Agregações por canal
  email_sent INTEGER DEFAULT 0,
  email_delivered INTEGER DEFAULT 0,
  email_failed INTEGER DEFAULT 0,
  
  sms_sent INTEGER DEFAULT 0,
  sms_delivered INTEGER DEFAULT 0,
  sms_failed INTEGER DEFAULT 0,
  
  push_sent INTEGER DEFAULT 0,
  push_delivered INTEGER DEFAULT 0,
  push_failed INTEGER DEFAULT 0,
  
  in_app_sent INTEGER DEFAULT 0,
  in_app_delivered INTEGER DEFAULT 0,
  in_app_failed INTEGER DEFAULT 0,
  
  -- Agregações por tipo
  appointment_count INTEGER DEFAULT 0,
  payment_count INTEGER DEFAULT 0,
  reminder_count INTEGER DEFAULT 0,
  alert_count INTEGER DEFAULT 0,
  marketing_count INTEGER DEFAULT 0,
  system_count INTEGER DEFAULT 0,
  
  -- Métricas gerais
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  avg_delivery_time_ms INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT stats_daily_date_unique UNIQUE(date)
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices para performance
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_deliveries_status ON notification_deliveries(status);
CREATE INDEX idx_deliveries_sent_at ON notification_deliveries(sent_at);
CREATE INDEX idx_deliveries_next_retry_at ON notification_deliveries(next_retry_at);

CREATE INDEX idx_events_delivery_id ON notification_events(delivery_id);
CREATE INDEX idx_events_type ON notification_events(event_type);
CREATE INDEX idx_events_created_at ON notification_events(created_at);

CREATE INDEX idx_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_preferences_channel ON notification_preferences(channel);

CREATE INDEX idx_templates_type ON notification_templates(type);
CREATE INDEX idx_templates_active ON notification_templates(is_active);

CREATE INDEX idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX idx_automation_executions_rule_id ON automation_executions(rule_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);

-- Índices para busca de texto
CREATE INDEX idx_templates_name_trgm ON notification_templates USING gin(name gin_trgm_ops);
CREATE INDEX idx_notifications_content_trgm ON notifications USING gin(content gin_trgm_ops);

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
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_channels_updated_at
  BEFORE UPDATE ON notification_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_deliveries_updated_at
  BEFORE UPDATE ON notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_stats_daily_updated_at
  BEFORE UPDATE ON notification_stats_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular estatísticas diárias
CREATE OR REPLACE FUNCTION calculate_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO notification_stats_daily (
    date,
    email_sent, email_delivered, email_failed,
    sms_sent, sms_delivered, sms_failed,
    push_sent, push_delivered, push_failed,
    in_app_sent, in_app_delivered, in_app_failed,
    appointment_count, payment_count, reminder_count,
    alert_count, marketing_count, system_count,
    total_sent, total_delivered, total_failed,
    avg_delivery_time_ms
  )
  SELECT 
    target_date,
    
    -- Por canal
    COUNT(*) FILTER (WHERE n.channel = 'EMAIL') as email_sent,
    COUNT(*) FILTER (WHERE n.channel = 'EMAIL' AND d.status = 'DELIVERED') as email_delivered,
    COUNT(*) FILTER (WHERE n.channel = 'EMAIL' AND d.status = 'FAILED') as email_failed,
    
    COUNT(*) FILTER (WHERE n.channel = 'SMS') as sms_sent,
    COUNT(*) FILTER (WHERE n.channel = 'SMS' AND d.status = 'DELIVERED') as sms_delivered,
    COUNT(*) FILTER (WHERE n.channel = 'SMS' AND d.status = 'FAILED') as sms_failed,
    
    COUNT(*) FILTER (WHERE n.channel = 'PUSH') as push_sent,
    COUNT(*) FILTER (WHERE n.channel = 'PUSH' AND d.status = 'DELIVERED') as push_delivered,
    COUNT(*) FILTER (WHERE n.channel = 'PUSH' AND d.status = 'FAILED') as push_failed,
    
    COUNT(*) FILTER (WHERE n.channel = 'IN_APP') as in_app_sent,
    COUNT(*) FILTER (WHERE n.channel = 'IN_APP' AND d.status = 'DELIVERED') as in_app_delivered,
    COUNT(*) FILTER (WHERE n.channel = 'IN_APP' AND d.status = 'FAILED') as in_app_failed,
    
    -- Por tipo
    COUNT(*) FILTER (WHERE n.type = 'APPOINTMENT') as appointment_count,
    COUNT(*) FILTER (WHERE n.type = 'PAYMENT') as payment_count,
    COUNT(*) FILTER (WHERE n.type = 'REMINDER') as reminder_count,
    COUNT(*) FILTER (WHERE n.type = 'ALERT') as alert_count,
    COUNT(*) FILTER (WHERE n.type = 'MARKETING') as marketing_count,
    COUNT(*) FILTER (WHERE n.type = 'SYSTEM') as system_count,
    
    -- Totais
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE d.status = 'DELIVERED') as total_delivered,
    COUNT(*) FILTER (WHERE d.status = 'FAILED') as total_failed,
    COALESCE(AVG(d.delivery_time_ms), 0)::INTEGER as avg_delivery_time_ms
    
  FROM notifications n
  LEFT JOIN notification_deliveries d ON n.id = d.notification_id
  WHERE DATE(n.created_at) = target_date
  
  ON CONFLICT (date) DO UPDATE SET
    email_sent = EXCLUDED.email_sent,
    email_delivered = EXCLUDED.email_delivered,
    email_failed = EXCLUDED.email_failed,
    sms_sent = EXCLUDED.sms_sent,
    sms_delivered = EXCLUDED.sms_delivered,
    sms_failed = EXCLUDED.sms_failed,
    push_sent = EXCLUDED.push_sent,
    push_delivered = EXCLUDED.push_delivered,
    push_failed = EXCLUDED.push_failed,
    in_app_sent = EXCLUDED.in_app_sent,
    in_app_delivered = EXCLUDED.in_app_delivered,
    in_app_failed = EXCLUDED.in_app_failed,
    appointment_count = EXCLUDED.appointment_count,
    payment_count = EXCLUDED.payment_count,
    reminder_count = EXCLUDED.reminder_count,
    alert_count = EXCLUDED.alert_count,
    marketing_count = EXCLUDED.marketing_count,
    system_count = EXCLUDED.system_count,
    total_sent = EXCLUDED.total_sent,
    total_delivered = EXCLUDED.total_delivered,
    total_failed = EXCLUDED.total_failed,
    avg_delivery_time_ms = EXCLUDED.avg_delivery_time_ms,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_stats_daily ENABLE ROW LEVEL SECURITY;

-- Políticas para templates (admins podem gerenciar)
CREATE POLICY "Templates são visíveis para usuários autenticados"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar templates"
  ON notification_templates FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para canais (apenas admins)
CREATE POLICY "Canais são visíveis para admins"
  ON notification_channels FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para preferências (usuários podem gerenciar suas próprias)
CREATE POLICY "Usuários podem ver suas preferências"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar suas preferências"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para notificações
CREATE POLICY "Usuários podem ver suas notificações"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sistema pode criar notificações"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para entregas
CREATE POLICY "Entregas são visíveis baseadas na notificação"
  ON notification_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.id = notification_id 
      AND (n.recipient_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  );

-- Políticas para eventos
CREATE POLICY "Eventos são visíveis baseados na entrega"
  ON notification_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notification_deliveries d
      JOIN notifications n ON d.notification_id = n.id
      WHERE d.id = delivery_id 
      AND (n.recipient_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  );

-- Políticas para automação (apenas admins)
CREATE POLICY "Automação é visível para admins"
  ON automation_rules FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Execuções de automação são visíveis para admins"
  ON automation_executions FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para estatísticas (apenas admins)
CREATE POLICY "Estatísticas são visíveis para admins"
  ON notification_stats_daily FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Configurações padrão dos canais
INSERT INTO notification_channels (channel, name, configuration, is_enabled) VALUES
('EMAIL', 'Email Provider', '{
  "provider": "resend",
  "from_email": "noreply@neonpro.com.br",
  "from_name": "NeonPro",
  "reply_to": "support@neonpro.com.br"
}', true),
('SMS', 'SMS Provider', '{
  "provider": "twilio",
  "from_number": "+5511999999999"
}', true),
('PUSH', 'Push Notifications', '{
  "provider": "fcm",
  "project_id": "neonpro-notifications"
}', true),
('IN_APP', 'In-App Notifications', '{
  "websocket_enabled": true,
  "persistence_enabled": true
}', true);

-- Templates padrão
INSERT INTO notification_templates (name, description, type, channels, subject, content, variables) VALUES
('welcome', 'Boas-vindas para novos usuários', 'SYSTEM', 
 ARRAY['EMAIL', 'IN_APP'], 
 'Bem-vindo ao NeonPro!', 
 'Olá {{user.firstName}}, bem-vindo ao NeonPro! Estamos felizes em tê-lo conosco.',
 '["user.firstName", "user.email"]'),
 
('appointment-reminder', 'Lembrete de consulta agendada', 'APPOINTMENT',
 ARRAY['SMS', 'PUSH'],
 'Lembrete: Consulta amanhã',
 'Olá {{patient.firstName}}, lembre-se da sua consulta amanhã às {{appointment.time}} com {{doctor.name}}.',
 '["patient.firstName", "appointment.time", "appointment.date", "doctor.name"]'),
 
('payment-confirmation', 'Confirmação de pagamento', 'PAYMENT',
 ARRAY['EMAIL', 'SMS'],
 'Pagamento confirmado - NeonPro',
 'Seu pagamento de {{payment.amount}} foi confirmado. Referência: {{payment.reference}}.',
 '["payment.amount", "payment.reference", "payment.date"]'),
 
('system-alert', 'Alerta do sistema', 'ALERT',
 ARRAY['EMAIL', 'IN_APP', 'PUSH'],
 'Alerta do Sistema - {{alert.title}}',
 'Atenção: {{alert.message}}. Ação necessária: {{alert.action}}.',
 '["alert.title", "alert.message", "alert.action", "alert.severity"]');

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Este schema fornece:
-- 1. Estrutura completa para notificações multi-canal
-- 2. Sistema de templates flexível
-- 3. Automação baseada em eventos
-- 4. Analytics e relatórios
-- 5. Segurança com RLS
-- 6. Performance otimizada com índices
-- 7. Auditoria completa
-- 8. Extensibilidade para futuras funcionalidades

-- Para usar este schema:
-- 1. Execute este arquivo no seu banco Supabase
-- 2. Configure as variáveis de ambiente para os provedores
-- 3. Implemente os workers para processamento assíncrono
-- 4. Configure os webhooks para eventos externos
