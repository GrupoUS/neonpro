-- 20250726_create_mfa_schema.sql
-- Multi-Factor Authentication database schema
-- Story 1.1: Multi-Factor Authentication Setup

-- Create MFA settings table
CREATE TABLE user_mfa_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.profiles(clinic_id),
    
    -- General MFA settings
    mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    preferred_method TEXT CHECK (preferred_method IN ('sms', 'email', 'totp', 'biometric')),
    enforced BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- SMS MFA settings
    sms_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    sms_phone_number TEXT,
    sms_verified BOOLEAN DEFAULT FALSE NOT NULL,
    sms_last_used TIMESTAMPTZ,
    
    -- Email MFA settings
    email_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    email_address TEXT,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    email_last_used TIMESTAMPTZ,
    
    -- TOTP (Authenticator App) settings
    totp_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    totp_secret TEXT, -- Encrypted TOTP secret
    totp_verified BOOLEAN DEFAULT FALSE NOT NULL,
    totp_last_used TIMESTAMPTZ,
    
    -- Biometric settings
    biometric_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_verified BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_last_used TIMESTAMPTZ,
    
    -- Backup codes settings
    backup_codes_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    backup_codes_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(user_id),
    
    -- Ensure at least one MFA method is enabled when MFA is enabled
    CONSTRAINT mfa_method_required CHECK (
        NOT mfa_enabled OR 
        sms_enabled OR 
        email_enabled OR 
        totp_enabled OR 
        biometric_enabled
    )
);

-- Create MFA verification codes table
CREATE TABLE mfa_verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.profiles(clinic_id),
    
    -- Verification details
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'totp', 'recovery')),
    
    -- Contact information
    phone_number TEXT,
    email TEXT,
    
    -- Status tracking
    used BOOLEAN DEFAULT FALSE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    max_attempts INTEGER DEFAULT 3 NOT NULL,
    
    -- Timing
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    verified_at TIMESTAMPTZ,
    
    -- Constraints
    CHECK (attempts <= max_attempts),
    CHECK (expires_at > created_at)
);

-- Create MFA audit logs table for LGPD compliance
CREATE TABLE mfa_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.profiles(clinic_id),
    
    -- Event details
    event_type TEXT NOT NULL,
    event_description TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    -- Timing
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Index for performance
    INDEX (user_id, timestamp),
    INDEX (event_type, timestamp)
);

-- Create user recovery codes table
CREATE TABLE user_recovery_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.profiles(clinic_id),
    
    -- Recovery code details
    code_hash TEXT NOT NULL, -- SHA-256 hash of the recovery code
    code_index INTEGER NOT NULL, -- Position in the set (1-8)
    
    -- Usage tracking
    used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    used_ip INET,
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(user_id, code_index),
    CHECK (code_index >= 1 AND code_index <= 8)
);

-- Create user devices table for biometric tracking
CREATE TABLE user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.profiles(clinic_id),
    
    -- Device identification
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
    
    -- Biometric capabilities
    biometric_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_types TEXT[], -- ['fingerprint', 'face', 'voice']
    
    -- WebAuthn credentials
    credential_id TEXT,
    public_key BYTEA,
    counter BIGINT DEFAULT 0,
    
    -- Usage tracking
    first_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    total_uses INTEGER DEFAULT 1 NOT NULL,
    
    -- Status
    trusted BOOLEAN DEFAULT FALSE NOT NULL,
    blocked BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Constraints
    UNIQUE(user_id, device_fingerprint)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_mfa_settings
CREATE POLICY "Users can view their own MFA settings" ON user_mfa_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA settings" ON user_mfa_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA settings" ON user_mfa_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinic admins can view MFA settings in their clinic" ON user_mfa_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.clinic_id = user_mfa_settings.clinic_id
            AND p.role IN ('Owner', 'Manager', 'Admin')
        )
    );

-- RLS Policies for mfa_verification_codes
CREATE POLICY "Users can view their own verification codes" ON mfa_verification_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification codes" ON mfa_verification_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification codes" ON mfa_verification_codes
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mfa_audit_logs
CREATE POLICY "Users can view their own MFA audit logs" ON mfa_audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert MFA audit logs" ON mfa_audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinic admins can view MFA audit logs in their clinic" ON mfa_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.clinic_id = mfa_audit_logs.clinic_id
            AND p.role IN ('Owner', 'Manager', 'Admin')
        )
    );

-- RLS Policies for user_recovery_codes
CREATE POLICY "Users can view their own recovery codes" ON user_recovery_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery codes" ON user_recovery_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery codes" ON user_recovery_codes
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_devices
CREATE POLICY "Users can view their own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON user_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON user_devices
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_mfa_settings_user_id ON user_mfa_settings(user_id);
CREATE INDEX idx_user_mfa_settings_clinic_id ON user_mfa_settings(clinic_id);

CREATE INDEX idx_mfa_verification_codes_user_id ON mfa_verification_codes(user_id);
CREATE INDEX idx_mfa_verification_codes_expires_at ON mfa_verification_codes(expires_at);
CREATE INDEX idx_mfa_verification_codes_type ON mfa_verification_codes(type);

CREATE INDEX idx_mfa_audit_logs_user_id ON mfa_audit_logs(user_id);
CREATE INDEX idx_mfa_audit_logs_timestamp ON mfa_audit_logs(timestamp);
CREATE INDEX idx_mfa_audit_logs_event_type ON mfa_audit_logs(event_type);

CREATE INDEX idx_user_recovery_codes_user_id ON user_recovery_codes(user_id);
CREATE INDEX idx_user_recovery_codes_expires_at ON user_recovery_codes(expires_at);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint ON user_devices(device_fingerprint);

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_mfa_settings updated_at
CREATE TRIGGER update_user_mfa_settings_updated_at
    BEFORE UPDATE ON user_mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set clinic_id based on user profile
CREATE OR REPLACE FUNCTION set_clinic_id_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Set clinic_id from the user's profile
    SELECT clinic_id INTO NEW.clinic_id
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set clinic_id on insert for MFA tables
CREATE TRIGGER set_user_mfa_settings_clinic_id
    BEFORE INSERT ON user_mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_clinic_id_from_profile();

CREATE TRIGGER set_mfa_verification_codes_clinic_id
    BEFORE INSERT ON mfa_verification_codes
    FOR EACH ROW
    EXECUTE FUNCTION set_clinic_id_from_profile();

CREATE TRIGGER set_mfa_audit_logs_clinic_id
    BEFORE INSERT ON mfa_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_clinic_id_from_profile();

CREATE TRIGGER set_user_recovery_codes_clinic_id
    BEFORE INSERT ON user_recovery_codes
    FOR EACH ROW
    EXECUTE FUNCTION set_clinic_id_from_profile();

CREATE TRIGGER set_user_devices_clinic_id
    BEFORE INSERT ON user_devices
    FOR EACH ROW
    EXECUTE FUNCTION set_clinic_id_from_profile();

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM mfa_verification_codes
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ language 'plpgsql';

-- Function to log MFA events
CREATE OR REPLACE FUNCTION log_mfa_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_description TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_fingerprint TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    INSERT INTO mfa_audit_logs (
        user_id,
        event_type,
        event_description,
        ip_address,
        user_agent,
        device_fingerprint,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_description,
        p_ip_address,
        p_user_agent,
        p_device_fingerprint,
        p_metadata
    );
END;
$$ language 'plpgsql';

-- Grant permissions
GRANT ALL ON user_mfa_settings TO authenticated;
GRANT ALL ON mfa_verification_codes TO authenticated;
GRANT ALL ON mfa_audit_logs TO authenticated;
GRANT ALL ON user_recovery_codes TO authenticated;
GRANT ALL ON user_devices TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_mfa_settings IS 'Multi-factor authentication settings for users';
COMMENT ON TABLE mfa_verification_codes IS 'Temporary verification codes for MFA setup and usage';
COMMENT ON TABLE mfa_audit_logs IS 'Audit trail for MFA events (LGPD compliance)';
COMMENT ON TABLE user_recovery_codes IS 'Backup recovery codes for MFA';
COMMENT ON TABLE user_devices IS 'User devices for biometric authentication tracking';