-- Notifications System Schema
-- Run this after the main schema setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'appointment_confirmed',
    'appointment_cancelled', 
    'appointment_reminder',
    'appointment_rescheduled',
    'system',
    'marketing'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url TEXT
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  status_changes BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  reminder_timing INTEGER DEFAULT 120, -- minutes before appointment
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB, -- JSON array of variable names
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System/admin can insert notifications for any user
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS policies for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for email templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Everyone can read active email templates (for rendering)
CREATE POLICY "Everyone can read active templates" ON email_templates
  FOR SELECT USING (is_active = true);

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user profile is created
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON profiles;
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Function to automatically send appointment notifications
CREATE OR REPLACE FUNCTION send_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  patient_preferences RECORD;
BEGIN
  -- Get patient notification preferences
  SELECT np.* INTO patient_preferences
  FROM notification_preferences np
  WHERE np.user_id = COALESCE(NEW.patient_id, OLD.patient_id);

  -- Skip if user has disabled status change notifications
  IF patient_preferences.status_changes = false THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Determine notification type and content based on the change
  IF TG_OP = 'INSERT' THEN
    notification_type := 'appointment_confirmed';
    notification_title := 'Agendamento Criado';
    notification_message := 'Seu agendamento foi criado com sucesso.';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      CASE NEW.status
        WHEN 'confirmed' THEN
          notification_type := 'appointment_confirmed';
          notification_title := 'Agendamento Confirmado';
          notification_message := 'Seu agendamento foi confirmado.';
        WHEN 'cancelled' THEN
          notification_type := 'appointment_cancelled';
          notification_title := 'Agendamento Cancelado';
          notification_message := 'Seu agendamento foi cancelado.';
        WHEN 'rescheduled' THEN
          notification_type := 'appointment_rescheduled';
          notification_title := 'Agendamento Reagendado';
          notification_message := 'Seu agendamento foi reagendado.';
        ELSE
          notification_type := 'appointment_confirmed';
          notification_title := 'Status do Agendamento Atualizado';
          notification_message := 'O status do seu agendamento foi atualizado.';
      END CASE;
    ELSE
      -- No status change, skip notification
      RETURN NEW;
    END IF;
  ELSE
    -- DELETE operation, skip
    RETURN OLD;
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority
  ) VALUES (
    COALESCE(NEW.patient_id, OLD.patient_id),
    notification_type,
    notification_title,
    notification_message,
    jsonb_build_object(
      'appointment_id', COALESCE(NEW.id, OLD.id),
      'appointment_date', COALESCE(NEW.date_time, OLD.date_time)
    ),
    'medium'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment notifications
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION send_appointment_notification();

-- Function to send reminder notifications
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS void AS $$
DECLARE
  reminder_appointment RECORD;
  patient_preferences RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get all confirmed appointments that need reminders
  FOR reminder_appointment IN
    SELECT a.*, p.full_name as patient_name, s.name as service_name
    FROM appointments a
    JOIN profiles p ON a.patient_id = p.id
    JOIN services s ON a.service_id = s.id
    WHERE a.status = 'confirmed'
    AND a.date_time > CURRENT_TIMESTAMP
    AND a.date_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
  LOOP
    -- Get patient preferences
    SELECT np.* INTO patient_preferences
    FROM notification_preferences np
    WHERE np.user_id = reminder_appointment.patient_id;

    -- Skip if reminders are disabled
    IF patient_preferences.appointment_reminders = false THEN
      CONTINUE;
    END IF;

    -- Calculate reminder time
    reminder_time := reminder_appointment.date_time - INTERVAL '1 minute' * patient_preferences.reminder_timing;

    -- Send reminder if it's time and not already sent
    IF CURRENT_TIMESTAMP >= reminder_time THEN
      -- Check if reminder already sent
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = reminder_appointment.patient_id 
        AND type = 'appointment_reminder'
        AND data->>'appointment_id' = reminder_appointment.id::text
        AND created_at >= CURRENT_DATE
      ) THEN
        -- Send reminder notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          priority
        ) VALUES (
          reminder_appointment.patient_id,
          'appointment_reminder',
          'Lembrete de Agendamento',
          'Você tem um agendamento em ' || (patient_preferences.reminder_timing / 60)::text || ' horas.',
          jsonb_build_object(
            'appointment_id', reminder_appointment.id,
            'appointment_date', reminder_appointment.date_time,
            'service_name', reminder_appointment.service_name
          ),
          'high'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete expired notifications
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
  AND expires_at < CURRENT_TIMESTAMP;

  -- Delete old read notifications (older than 30 days)
  DELETE FROM notifications 
  WHERE read_at IS NOT NULL 
  AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

  -- Delete very old unread notifications (older than 90 days)
  DELETE FROM notifications 
  WHERE read_at IS NULL 
  AND created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('appointment_confirmation', 
 'Agendamento Confirmado - {{clinic_name}}', 
 '<html><body><h2>Agendamento Confirmado</h2><p>Olá {{patient_name}},</p><p>Seu agendamento foi confirmado para:</p><ul><li>Data: {{appointment_date}}</li><li>Horário: {{appointment_time}}</li><li>Serviço: {{service_name}}</li><li>Profissional: {{professional_name}}</li></ul><p>Atenciosamente,<br>{{clinic_name}}</p></body></html>',
 'Olá {{patient_name}}, seu agendamento foi confirmado para {{appointment_date}} às {{appointment_time}}. Serviço: {{service_name}}. Profissional: {{professional_name}}.',
 '["patient_name", "appointment_date", "appointment_time", "service_name", "professional_name", "clinic_name"]'::jsonb),

('appointment_reminder',
 'Lembrete de Agendamento - {{clinic_name}}',
 '<html><body><h2>Lembrete de Agendamento</h2><p>Olá {{patient_name}},</p><p>Lembramos que você tem um agendamento:</p><ul><li>Data: {{appointment_date}}</li><li>Horário: {{appointment_time}}</li><li>Serviço: {{service_name}}</li><li>Profissional: {{professional_name}}</li></ul><p>Até logo,<br>{{clinic_name}}</p></body></html>',
 'Lembrete: Você tem um agendamento em {{appointment_date}} às {{appointment_time}}. Serviço: {{service_name}}.',
 '["patient_name", "appointment_date", "appointment_time", "service_name", "professional_name", "clinic_name"]'::jsonb),

('appointment_cancellation',
 'Agendamento Cancelado - {{clinic_name}}',
 '<html><body><h2>Agendamento Cancelado</h2><p>Olá {{patient_name}},</p><p>Informamos que seu agendamento foi cancelado:</p><ul><li>Data: {{appointment_date}}</li><li>Horário: {{appointment_time}}</li><li>Motivo: {{cancellation_reason}}</li></ul><p>Entre em contato para reagendar.<br>{{clinic_name}}</p></body></html>',
 'Seu agendamento de {{appointment_date}} às {{appointment_time}} foi cancelado. Motivo: {{cancellation_reason}}.',
 '["patient_name", "appointment_date", "appointment_time", "cancellation_reason", "clinic_name"]'::jsonb);

-- Comments explaining the schema
COMMENT ON TABLE notifications IS 'Stores all user notifications';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON TABLE email_templates IS 'Templates for automated emails';
COMMENT ON FUNCTION send_appointment_reminders() IS 'Function to be called by cron job to send reminder notifications';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Function to clean up old/expired notifications';