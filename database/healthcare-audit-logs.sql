-- Healthcare Audit Logs Table for tRPC compliance
-- Supabase/PostgreSQL schema for comprehensive healthcare audit trail

CREATE TABLE IF NOT EXISTS healthcare_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and request information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  tenant_id UUID,
  
  -- Request metadata for healthcare compliance
  metadata JSONB NOT NULL DEFAULT '{}',
  request_id VARCHAR(100) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  
  -- Compliance flags for LGPD and healthcare regulations
  compliance_flags JSONB NOT NULL DEFAULT '{
    "lgpd_compliant": false,
    "data_consent_validated": false,
    "medical_role_verified": false
  }',
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and healthcare compliance queries
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_user_id ON healthcare_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_tenant_id ON healthcare_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_action ON healthcare_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_resource_type ON healthcare_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_timestamp ON healthcare_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_request_id ON healthcare_audit_logs(request_id);

-- Index for LGPD compliance queries
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_compliance 
ON healthcare_audit_logs USING GIN(compliance_flags);

-- Row Level Security for tenant isolation
ALTER TABLE healthcare_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view audit logs from their tenant
CREATE POLICY "tenant_isolation_audit_logs" ON healthcare_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.tenant_id = healthcare_audit_logs.tenant_id
    )
  );

-- Policy: Only the system can insert audit logs
CREATE POLICY "system_insert_audit_logs" ON healthcare_audit_logs
  FOR INSERT WITH CHECK (true);

-- Policy: Admins can view all audit logs in their tenant
CREATE POLICY "admin_view_all_audit_logs" ON healthcare_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.tenant_id = healthcare_audit_logs.tenant_id
      AND user_profiles.role = 'admin'
    )
  );

-- Healthcare audit retention policy (7 years as required by medical regulations)
-- This would be implemented as a scheduled job
COMMENT ON TABLE healthcare_audit_logs IS 
'Healthcare audit trail for LGPD compliance and medical regulations. 
Retention period: 7 years minimum for medical data audit compliance.
All healthcare API operations are logged here for compliance and security.';

-- Function to automatically clean old audit logs (7+ years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM healthcare_audit_logs 
  WHERE timestamp < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON healthcare_audit_logs TO authenticated;
GRANT INSERT ON healthcare_audit_logs TO service_role;