-- NeonPro Notification System Database Schema
-- HIPAA-compliant tables for notification management
-- Created: 2025-07-21

-- Notification preferences for users (patients and staff)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_granted BOOLEAN DEFAULT false NOT NULL,
    consent_granted_at TIMESTAMPTZ,
    consent_revoked_at TIMESTAMPTZ,
    email VARCHAR(255),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Channel preferences (JSON structure)
    channels JSONB DEFAULT '{
        "email": {
            "enabled": true,
            "enabledTypes": ["appointment_reminder", "appointment_confirmation", "appointment_cancellation", "billing_reminder"]
        },
        "sms": {
            "enabled": false,
            "enabledTypes": ["appointment_reminder", "emergency_alert"]
        },
        "in_app": {
            "enabled": true,
            "enabledTypes": ["appointment_reminder", "appointment_confirmation", "appointment_cancellation", "reschedule_request", "treatment_reminder", "follow_up_reminder", "billing_reminder"]
        }
    }'::jsonb NOT NULL,
    
    -- Reminder intervals in hours before appointment
    reminder_intervals INTEGER[] DEFAULT ARRAY[24, 2], -- 24 hours and 2 hours before
    
    -- Quiet hours (no notifications sent during these times)
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    quiet_hours_enabled BOOLEAN DEFAULT true,
    
    -- LGPD/HIPAA compliance fields
    data_retention_consent BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Scheduled notifications for future delivery
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (
        notification_type IN (
            'appointment_reminder',
            'appointment_confirmation', 
            'appointment_cancellation',
            'reschedule_request',
            'treatment_reminder',
            'follow_up_reminder',
            'emergency_alert',
            'billing_reminder'
        )
    ),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
    
    -- Notification payload (encrypted sensitive data)
    payload JSONB NOT NULL,
    
    -- Scheduling information
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'failed', 'cancelled')
    ),
    
    -- Retry logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    
    -- Delivery tracking
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    delivery_details JSONB,
    
    -- Metadata for filtering and organization
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Indexes for performance
    INDEX idx_scheduled_notifications_due ON scheduled_notifications(scheduled_for, status) WHERE status = 'pending',
    INDEX idx_scheduled_notifications_recipient ON scheduled_notifications(recipient_id),
    INDEX idx_scheduled_notifications_type ON scheduled_notifications(notification_type),
    INDEX idx_scheduled_notifications_status ON scheduled_notifications(status)
);

-- In-app notifications for dashboard display
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    
    -- Read status
    read_at TIMESTAMPTZ,
    is_read BOOLEAN GENERATED ALWAYS AS (read_at IS NOT NULL) STORED,
    
    -- Action buttons/links
    actions JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auto-expire notifications after 30 days
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Indexes
    INDEX idx_in_app_notifications_user ON in_app_notifications(user_id),
    INDEX idx_in_app_notifications_unread ON in_app_notifications(user_id, read_at) WHERE read_at IS NULL,
    INDEX idx_in_app_notifications_expires ON in_app_notifications(expires_at)
);-- HIPAA Compliance: Audit logging for all notification activities
-- Retention period: 7 years as required by HIPAA
CREATE TABLE IF NOT EXISTS notification_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Action tracking
    action VARCHAR(50) NOT NULL CHECK (
        action IN (
            'notification_sent',
            'notification_scheduled', 
            'notification_cancelled',
            'notification_failed',
            'notification_blocked',
            'preferences_updated',
            'consent_granted',
            'consent_revoked',
            'notification_error'
        )
    ),
    
    -- Related entities
    recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notification_id UUID, -- References scheduled_notifications or other notification tables
    notification_type VARCHAR(50),
    channel VARCHAR(20) CHECK (channel IN ('email', 'sms', 'in_app')),
    
    -- Outcome
    success BOOLEAN,
    error_message TEXT,
    reason TEXT,
    
    -- Timing
    delivered_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Request context for security
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- HIPAA retention management
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,
    retention_until TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 years'),
    
    -- Indexes for compliance queries
    INDEX idx_audit_log_recipient ON notification_audit_log(recipient_id),
    INDEX idx_audit_log_timestamp ON notification_audit_log(timestamp),
    INDEX idx_audit_log_action ON notification_audit_log(action),
    INDEX idx_audit_log_notification ON notification_audit_log(notification_id) WHERE notification_id IS NOT NULL,
    INDEX idx_audit_log_retention ON notification_audit_log(retention_until, archived) WHERE archived = false
);

-- Row Level Security Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notification preferences
CREATE POLICY "Users can view own notification preferences" 
    ON notification_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" 
    ON notification_preferences FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" 
    ON notification_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can only see their own scheduled notifications
CREATE POLICY "Users can view own scheduled notifications" 
    ON scheduled_notifications FOR SELECT 
    USING (auth.uid() = recipient_id);

-- Only system/admin can manage scheduled notifications
CREATE POLICY "System can manage scheduled notifications" 
    ON scheduled_notifications FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'system')
        )
    );

-- Users can see their own in-app notifications
CREATE POLICY "Users can view own in-app notifications" 
    ON in_app_notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own in-app notifications" 
    ON in_app_notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- System can create in-app notifications for users
CREATE POLICY "System can create in-app notifications" 
    ON in_app_notifications FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'system')
        ) OR auth.uid() = user_id
    );

-- Audit log access: Users can see logs related to them, admins see all
CREATE POLICY "Users can view own audit logs" 
    ON notification_audit_log FOR SELECT 
    USING (
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs" 
    ON notification_audit_log FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'system')
        )
    );

-- Functions and Triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_notifications_updated_at 
    BEFORE UPDATE ON scheduled_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id, email, consent_granted, consent_granted_at)
    VALUES (NEW.id, NEW.email, true, now())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences when user profile is created
-- Note: This assumes you have a profiles table trigger or similar
-- You may need to adjust based on your actual user creation flow

-- Clean up expired in-app notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM in_app_notifications 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Comments for documentation
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery channels and timing';
COMMENT ON TABLE scheduled_notifications IS 'Future notifications scheduled for delivery';
COMMENT ON TABLE in_app_notifications IS 'Notifications displayed in the application interface';
COMMENT ON TABLE notification_audit_log IS 'HIPAA-compliant audit trail for all notification activities';

COMMENT ON COLUMN notification_preferences.channels IS 'JSON configuration for notification channels and enabled types';
COMMENT ON COLUMN notification_preferences.reminder_intervals IS 'Hours before appointment to send reminders';
COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Start of quiet period (no notifications)';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS 'End of quiet period';

COMMENT ON COLUMN notification_audit_log.retention_until IS 'HIPAA requires 7-year retention of health information';
COMMENT ON COLUMN notification_audit_log.archived IS 'Marks logs moved to long-term storage';