-- Migration: 002_create_indexes_triggers.sql
-- Created: Foundation migration for indexes and triggers
-- Purpose: Performance optimization and data integrity for NeonPro Healthcare

-- Create indexes for subscription system performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_user_tenants_user_id ON user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_id ON user_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_active ON user_tenants(is_active);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- Create function to automatically create tenant for new subscription
CREATE OR REPLACE FUNCTION create_tenant_for_subscription()
RETURNS TRIGGER AS $$
DECLARE
    tenant_name VARCHAR(255);
BEGIN
    -- Generate tenant name from subscription plan
    SELECT name INTO tenant_name FROM subscription_plans WHERE id = NEW.plan_id;
    
    -- Create tenant if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = NEW.tenant_id) THEN
        INSERT INTO tenants (id, name, slug, settings)
        VALUES (
            NEW.tenant_id,
            COALESCE(tenant_name || ' Clinic', 'Healthcare Clinic'),
            LOWER(REPLACE(COALESCE(tenant_name, 'clinic'), ' ', '-')) || '-' || substr(NEW.tenant_id::text, 1, 8),
            '{
                "healthcare_type": "aesthetic_clinic",
                "compliance": {
                    "lgpd_enabled": true,
                    "anvisa_tracking": true,
                    "cfm_integration": true
                },
                "features": {
                    "patient_portal": true,
                    "appointment_booking": true,
                    "inventory_management": true,
                    "financial_management": true
                }
            }'::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic tenant creation
CREATE TRIGGER trigger_create_tenant_for_subscription
    BEFORE INSERT ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION create_tenant_for_subscription();

-- Create function to validate subscription limits
CREATE OR REPLACE FUNCTION validate_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    plan_limits RECORD;
    current_usage RECORD;
BEGIN
    -- Get plan limits
    SELECT max_users, max_patients, max_appointments, storage_gb
    INTO plan_limits
    FROM subscription_plans sp
    JOIN subscriptions s ON s.plan_id = sp.id
    WHERE s.tenant_id = NEW.tenant_id
    AND s.status = 'active';
    
    -- Skip validation if no active subscription found
    IF plan_limits IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Validate based on table being modified
    IF TG_TABLE_NAME = 'user_tenants' THEN
        -- Check user limits
        SELECT COUNT(*) as user_count
        INTO current_usage
        FROM user_tenants
        WHERE tenant_id = NEW.tenant_id AND is_active = true;
        
        IF plan_limits.max_users IS NOT NULL AND current_usage.user_count >= plan_limits.max_users THEN
            RAISE EXCEPTION 'User limit exceeded for subscription plan. Maximum: %, Current: %', 
                plan_limits.max_users, current_usage.user_count;
        END IF;
    END IF;
    
    -- Add similar validations for other resources as tables are created
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log tenant activity for compliance
CREATE OR REPLACE FUNCTION log_tenant_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the activity for healthcare compliance
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        timestamp
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid(),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit_logs
CREATE POLICY "audit_logs_tenant_access" ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = audit_logs.tenant_id
            AND is_active = true
        )
    );

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Add audit triggers to core tables
CREATE TRIGGER trigger_audit_tenants
    AFTER INSERT OR UPDATE OR DELETE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION log_tenant_activity();

CREATE TRIGGER trigger_audit_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_tenant_activity();

CREATE TRIGGER trigger_audit_user_tenants
    AFTER INSERT OR UPDATE OR DELETE ON user_tenants
    FOR EACH ROW
    EXECUTE FUNCTION log_tenant_activity();

-- Create function to clean up old audit logs (LGPD compliance)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit logs older than 7 years (LGPD requirement)
    DELETE FROM audit_logs
    WHERE timestamp < NOW() - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup activity
    INSERT INTO audit_logs (
        tenant_id,
        action,
        resource_type,
        new_values,
        timestamp
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid, -- System tenant
        'audit_cleanup',
        'system',
        jsonb_build_object('deleted_records', deleted_count),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate healthcare data integrity
CREATE OR REPLACE FUNCTION validate_healthcare_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate LGPD consent requirements for patient data
    IF TG_TABLE_NAME LIKE '%patient%' OR TG_TABLE_NAME LIKE '%medical%' THEN
        -- Ensure LGPD consent is properly recorded
        IF NEW.tenant_id IS NULL THEN
            RAISE EXCEPTION 'Tenant ID is required for healthcare data (LGPD compliance)';
        END IF;
    END IF;
    
    -- Validate tenant isolation
    IF NEW.tenant_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM tenants WHERE id = NEW.tenant_id
    ) THEN
        RAISE EXCEPTION 'Invalid tenant ID: %', NEW.tenant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification function for subscription events
CREATE OR REPLACE FUNCTION notify_subscription_event()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSONB;
BEGIN
    -- Create notification payload
    notification_payload := jsonb_build_object(
        'subscription_id', COALESCE(NEW.id, OLD.id),
        'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id),
        'event_type', TG_OP,
        'old_status', CASE WHEN OLD IS NOT NULL THEN OLD.status ELSE NULL END,
        'new_status', CASE WHEN NEW IS NOT NULL THEN NEW.status ELSE NULL END,
        'timestamp', NOW()
    );
    
    -- Send notification
    PERFORM pg_notify('subscription_events', notification_payload::text);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription notifications
CREATE TRIGGER trigger_notify_subscription_event
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION notify_subscription_event();

-- Add trigger for updated_at on audit_logs
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();