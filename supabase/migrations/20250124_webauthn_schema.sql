-- WebAuthn Schema Migration
-- Created: 2025-01-24
-- Purpose: WebAuthn/FIDO2 authentication infrastructure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create webauthn_credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    credential_public_key BYTEA NOT NULL,
    credential_counter BIGINT NOT NULL DEFAULT 0,
    credential_device_type TEXT NOT NULL CHECK (credential_device_type IN ('singleDevice', 'multiDevice')),
    credential_backed_up BOOLEAN NOT NULL DEFAULT false,
    transports TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- User-friendly metadata
    name TEXT NOT NULL DEFAULT 'WebAuthn Credential',
    description TEXT,
    
    -- Security and audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Additional security metadata
    user_agent TEXT,
    ip_address INET,
    aaguid UUID,
    attestation_object BYTEA,
    client_data_json JSONB,
    
    CONSTRAINT webauthn_credentials_user_id_name_unique UNIQUE (user_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_active ON webauthn_credentials(user_id, is_active);

-- Create trusted_devices table
CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    browser TEXT,
    os TEXT,
    user_agent TEXT,
    ip_address INET,
    fingerprint TEXT,
    
    -- Trust and security metadata
    trust_score INTEGER NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    is_trusted BOOLEAN NOT NULL DEFAULT false,
    risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    CONSTRAINT trusted_devices_user_device_unique UNIQUE (user_id, device_id)
);

-- Create indexes for trusted devices
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_device_id ON trusted_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_trusted ON trusted_devices(user_id, is_trusted);

-- Create mfa_backup_codes table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    
    CONSTRAINT mfa_backup_codes_user_code_unique UNIQUE (user_id, code_hash)
);

-- Create index for backup codes
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_active ON mfa_backup_codes(user_id, is_used, expires_at);

-- Create security_audit_log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 'login_failure', 'logout',
        'webauthn_registration', 'webauthn_authentication', 
        'mfa_setup', 'mfa_verification',
        'password_change', 'password_reset',
        'account_locked', 'account_unlocked',
        'suspicious_activity', 'security_breach',
        'device_trusted', 'device_untrusted',
        'backup_code_generated', 'backup_code_used'
    )),
    event_description TEXT NOT NULL,
    
    -- Context and metadata
    ip_address INET,
    user_agent TEXT,
    device_id TEXT,
    location JSONB, -- {country, city, region, etc}
    
    -- Security metadata
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    success BOOLEAN NOT NULL DEFAULT true,
    error_code TEXT,
    error_message TEXT,
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Retention policy
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 years')
);

-- Create indexes for security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_risk_level ON security_audit_log(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address ON security_audit_log(ip_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_webauthn_credentials_updated_at 
    BEFORE UPDATE ON webauthn_credentials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trusted_devices_updated_at 
    BEFORE UPDATE ON trusted_devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webauthn_credentials
CREATE POLICY "Users can view their own WebAuthn credentials"
ON webauthn_credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WebAuthn credentials"
ON webauthn_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WebAuthn credentials"
ON webauthn_credentials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WebAuthn credentials"
ON webauthn_credentials FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for trusted_devices
CREATE POLICY "Users can view their own trusted devices"
ON trusted_devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted devices"
ON trusted_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted devices"
ON trusted_devices FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for mfa_backup_codes
CREATE POLICY "Users can view their own MFA backup codes"
ON mfa_backup_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA backup codes"
ON mfa_backup_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA backup codes"
ON mfa_backup_codes FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for security_audit_log
CREATE POLICY "Users can view their own security audit logs"
ON security_audit_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert security audit logs"
ON security_audit_log FOR INSERT
WITH CHECK (true); -- Allow system to log events

-- Create functions for security operations
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_id TEXT DEFAULT NULL,
    p_risk_level TEXT DEFAULT 'low',
    p_success BOOLEAN DEFAULT true,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO security_audit_log (
        user_id, event_type, event_description, 
        ip_address, user_agent, device_id, 
        risk_level, success, metadata
    ) VALUES (
        p_user_id, p_event_type, p_event_description,
        p_ip_address, p_user_agent, p_device_id,
        p_risk_level, p_success, p_metadata
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_security_tables()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Delete expired MFA backup codes
    DELETE FROM mfa_backup_codes 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Delete expired security audit logs
    DELETE FROM security_audit_log 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
    
    -- Delete expired trusted device records
    DELETE FROM trusted_devices 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webauthn_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON trusted_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mfa_backup_codes TO authenticated;
GRANT SELECT, INSERT ON security_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;

-- Create initial security audit log entry
SELECT log_security_event(
    NULL,
    'system',
    'WebAuthn schema migration completed successfully',
    NULL,
    'Migration Script',
    'system',
    'low',
    true,
    '{"migration": "20250124_webauthn_schema", "version": "1.0"}'::JSONB
);

-- Add comments for documentation
COMMENT ON TABLE webauthn_credentials IS 'Stores WebAuthn/FIDO2 credentials for passwordless authentication';
COMMENT ON TABLE trusted_devices IS 'Tracks trusted devices for enhanced security and user experience';
COMMENT ON TABLE mfa_backup_codes IS 'Stores hashed MFA backup codes for account recovery';
COMMENT ON TABLE security_audit_log IS 'Comprehensive security event logging for compliance and monitoring';
COMMENT ON FUNCTION log_security_event IS 'Centralized function for logging security events with proper metadata';
COMMENT ON FUNCTION cleanup_security_tables IS 'Automated cleanup of expired security records';