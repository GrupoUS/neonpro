-- WebAuthn Credentials Table for TASK-002: Authentication Enhancement
-- This table stores WebAuthn/FIDO2 credentials for multi-factor authentication

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT NOT NULL CHECK (device_type IN ('platform', 'cross-platform')),
  device_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  backup_eligible BOOLEAN DEFAULT false NOT NULL,
  backup_state BOOLEAN DEFAULT false NOT NULL,
  transports TEXT[] DEFAULT '{}',
  aaguid UUID,
  
  -- Index for fast lookups
  UNIQUE(credential_id),
  INDEX idx_webauthn_user_id ON webauthn_credentials(user_id),
  INDEX idx_webauthn_credential_id ON webauthn_credentials(credential_id),
  INDEX idx_webauthn_active ON webauthn_credentials(is_active, user_id)
);

-- Enable RLS for security
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own WebAuthn credentials" ON webauthn_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WebAuthn credentials" ON webauthn_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WebAuthn credentials" ON webauthn_credentials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WebAuthn credentials" ON webauthn_credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Trusted Devices Table for session management enhancement
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Composite unique constraint
  UNIQUE(user_id, device_fingerprint),
  INDEX idx_trusted_devices_user_id ON trusted_devices(user_id),
  INDEX idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint),
  INDEX idx_trusted_devices_active ON trusted_devices(is_active, expires_at)
);

-- Enable RLS for trusted devices
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trusted devices
CREATE POLICY "Users can view their own trusted devices" ON trusted_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted devices" ON trusted_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted devices" ON trusted_devices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted devices" ON trusted_devices
  FOR DELETE USING (auth.uid() = user_id);

-- MFA Backup Codes Table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_used BOOLEAN DEFAULT false NOT NULL,
  
  INDEX idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id),
  INDEX idx_mfa_backup_codes_unused ON mfa_backup_codes(user_id, is_used)
);

-- Enable RLS for MFA backup codes
ALTER TABLE mfa_backup_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for MFA backup codes
CREATE POLICY "Users can view their own MFA backup codes" ON mfa_backup_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA backup codes" ON mfa_backup_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA backup codes" ON mfa_backup_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Security Audit Log Table for TASK-002 security audit implementation
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  INDEX idx_security_audit_user_id ON security_audit_log(user_id),
  INDEX idx_security_audit_event_type ON security_audit_log(event_type),
  INDEX idx_security_audit_created_at ON security_audit_log(created_at),
  INDEX idx_security_audit_success ON security_audit_log(success, event_type)
);

-- Enable RLS for security audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security audit log (admin and user access)
CREATE POLICY "Users can view their own security audit log" ON security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policy (assuming admin role exists)
CREATE POLICY "Admins can view all security audit logs" ON security_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to automatically clean up expired trusted devices
CREATE OR REPLACE FUNCTION cleanup_expired_trusted_devices()
RETURNS void AS $$
BEGIN
  UPDATE trusted_devices 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_description TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    event_description,
    ip_address,
    user_agent,
    success,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_description,
    p_ip_address,
    p_user_agent,
    p_success,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the security logging function
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;