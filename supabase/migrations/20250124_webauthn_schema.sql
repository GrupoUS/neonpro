-- WebAuthn Schema Migration
-- Creates tables and functions for WebAuthn (Web Authentication) support
-- Date: 2025-01-24

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- WebAuthn Credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    name TEXT,
    transports TEXT[], -- JSON array of transport methods
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_backup_eligible BOOLEAN DEFAULT false,
    is_backup_verified BOOLEAN DEFAULT false,
    aaguid UUID,
    attestation_type TEXT,
    CONSTRAINT webauthn_credentials_user_credential_unique UNIQUE (user_id, credential_id)
);

-- Security audit log for WebAuthn events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    risk_score DECIMAL(3,2) DEFAULT 0.0,
    metadata JSONB
);

-- Trusted devices for WebAuthn
CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL UNIQUE,
    device_name TEXT,
    device_type TEXT, -- Added device_type field as expected by test
    fingerprint TEXT,
    trusted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- WebAuthn Authentication Attempts (for security monitoring)
CREATE TABLE IF NOT EXISTS webauthn_auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    challenge TEXT,
    origin TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_code TEXT,
    error_message TEXT,
    
    -- Security audit fields
    risk_score DECIMAL(3,2) DEFAULT 0.0,
    geolocation JSONB,
    device_fingerprint TEXT,
    session_id TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_auth_attempts_user_id ON webauthn_auth_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_auth_attempts_timestamp ON webauthn_auth_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_webauthn_auth_attempts_success ON webauthn_auth_attempts(success);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON security_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_device_id ON trusted_devices(device_id);

-- Row Level Security (RLS) policies
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Users can only access their own credentials
CREATE POLICY "Users can view their own webauthn credentials" 
    ON webauthn_credentials FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webauthn credentials" 
    ON webauthn_credentials FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webauthn credentials" 
    ON webauthn_credentials FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webauthn credentials" 
    ON webauthn_credentials FOR DELETE 
    USING (auth.uid() = user_id);

-- Authentication attempts - read-only for users, admins can see all
CREATE POLICY "Users can view their own auth attempts" 
    ON webauthn_auth_attempts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert auth attempts" 
    ON webauthn_auth_attempts FOR INSERT 
    WITH CHECK (true); -- Allow system to log all attempts

-- Security audit log policies
CREATE POLICY "Users can view their own audit logs" 
    ON security_audit_log FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" 
    ON security_audit_log FOR INSERT 
    WITH CHECK (true); -- Allow system to log all events

-- Trusted devices policies
CREATE POLICY "Users can view their own trusted devices" 
    ON trusted_devices FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted devices" 
    ON trusted_devices FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted devices" 
    ON trusted_devices FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted devices" 
    ON trusted_devices FOR DELETE 
    USING (auth.uid() = user_id);

-- Security functions

-- Function to get user's active WebAuthn credentials
CREATE OR REPLACE FUNCTION get_user_webauthn_credentials(user_uuid UUID)
RETURNS TABLE (
    credential_id TEXT,
    name TEXT,
    counter BIGINT,
    transports TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.credential_id,
        w.name,
        w.counter,
        w.transports,
        w.created_at,
        w.last_used_at
    FROM webauthn_credentials w
    WHERE w.user_id = user_uuid
    ORDER BY w.created_at DESC;
END;
$$;

-- Function to update credential counter (for replay attack prevention)
CREATE OR REPLACE FUNCTION update_webauthn_counter(
    cred_id TEXT,
    new_counter BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    old_counter BIGINT;
BEGIN
    -- Get current counter
    SELECT counter INTO old_counter
    FROM webauthn_credentials 
    WHERE credential_id = cred_id;
    
    -- Counter must be incrementing (replay attack prevention)
    IF new_counter <= old_counter THEN
        RETURN FALSE;
    END IF;
    
    -- Update counter and last used timestamp
    UPDATE webauthn_credentials
    SET 
        counter = new_counter,
        last_used_at = NOW()
    WHERE credential_id = cred_id;
    
    RETURN TRUE;
END;
$$;

-- Function to log authentication attempts
CREATE OR REPLACE FUNCTION log_webauthn_attempt(
    user_uuid UUID,
    cred_id TEXT,
    is_success BOOLEAN,
    client_ip INET,
    user_agent_str TEXT,
    challenge_str TEXT,
    origin_str TEXT,
    error_code_str TEXT DEFAULT NULL,
    error_msg TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    attempt_id UUID;
BEGIN
    INSERT INTO webauthn_auth_attempts (
        user_id,
        credential_id,
        success,
        ip_address,
        user_agent,
        challenge,
        origin,
        error_code,
        error_message
    ) VALUES (
        user_uuid,
        cred_id,
        is_success,
        client_ip,
        user_agent_str,
        challenge_str,
        origin_str,
        error_code_str,
        error_msg
    ) RETURNING id INTO attempt_id;
    
    RETURN attempt_id;
END;
$$;

-- Security audit view for failed attempts
CREATE OR REPLACE VIEW webauthn_security_audit AS
SELECT 
    user_id,
    credential_id,
    ip_address,
    user_agent,
    timestamp,
    error_code,
    error_message,
    risk_score,
    geolocation
FROM webauthn_auth_attempts
WHERE success = false
ORDER BY timestamp DESC;

-- Multi-Factor Authentication backup codes table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL, -- Hashed version of the backup code
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    is_used BOOLEAN DEFAULT false,
    CONSTRAINT mfa_backup_codes_user_code_unique UNIQUE (user_id, code_hash)
);

-- Indexes for backup codes
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_used ON mfa_backup_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_expires ON mfa_backup_codes(expires_at);

-- RLS for backup codes
ALTER TABLE mfa_backup_codes ENABLE ROW LEVEL SECURITY;

-- Users can only access their own backup codes
CREATE POLICY "Users can view their own backup codes" 
    ON mfa_backup_codes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can use their own backup codes" 
    ON mfa_backup_codes FOR UPDATE 
    USING (auth.uid() = user_id AND is_used = false) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create backup codes" 
    ON mfa_backup_codes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON webauthn_credentials TO authenticated;
GRANT ALL ON webauthn_auth_attempts TO authenticated;
GRANT ALL ON security_audit_log TO authenticated;
GRANT ALL ON trusted_devices TO authenticated;
GRANT ALL ON mfa_backup_codes TO authenticated;
GRANT SELECT ON webauthn_security_audit TO authenticated;

-- Comments for documentation
COMMENT ON TABLE webauthn_credentials IS 'Stores WebAuthn credential information for passwordless authentication';
COMMENT ON TABLE webauthn_auth_attempts IS 'Logs all WebAuthn authentication attempts for security monitoring';
COMMENT ON FUNCTION get_user_webauthn_credentials(UUID) IS 'Retrieves active WebAuthn credentials for a specific user';
COMMENT ON FUNCTION update_webauthn_counter(TEXT, BIGINT) IS 'Updates credential counter with replay attack prevention';
COMMENT ON FUNCTION log_webauthn_attempt IS 'Logs WebAuthn authentication attempts for security audit';