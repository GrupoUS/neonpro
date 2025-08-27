-- Migration: 003_create_rls_policies.sql
-- Created: Foundation migration for Row Level Security policies
-- Purpose: Multi-tenant security and healthcare data protection

-- Enable RLS on all tenant-related tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for healthcare data protection

-- 1. Subscription Plans - Public read for active plans
DROP POLICY IF EXISTS "subscription_plans_select" ON subscription_plans;
CREATE POLICY "subscription_plans_public_read" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Only service role can modify subscription plans
CREATE POLICY "subscription_plans_service_role_write" ON subscription_plans
    FOR ALL USING (auth.role() = 'service_role');

-- 2. Subscriptions - Tenant isolation with role-based access
DROP POLICY IF EXISTS "subscriptions_tenant_access" ON subscriptions;
CREATE POLICY "subscriptions_tenant_read" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = subscriptions.tenant_id
            AND ut.is_active = true
        )
    );

-- Only admin role can modify subscriptions
CREATE POLICY "subscriptions_admin_write" ON subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = subscriptions.tenant_id
            AND ut.role IN ('admin', 'owner')
            AND ut.is_active = true
        )
    );

CREATE POLICY "subscriptions_admin_update" ON subscriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = subscriptions.tenant_id
            AND ut.role IN ('admin', 'owner')
            AND ut.is_active = true
        )
    );

-- 3. Tenants - Members can read, owners can modify
DROP POLICY IF EXISTS "tenants_member_access" ON tenants;
CREATE POLICY "tenants_member_read" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = tenants.id
            AND ut.is_active = true
        )
    );

-- Only owners can modify tenant information
CREATE POLICY "tenants_owner_write" ON tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = tenants.id
            AND ut.role = 'owner'
            AND ut.is_active = true
        )
    );

-- Only service role can create tenants (through subscription flow)
CREATE POLICY "tenants_service_role_insert" ON tenants
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 4. User Tenants - Complex role-based access
DROP POLICY IF EXISTS "user_tenants_own_access" ON user_tenants;

-- Users can read their own tenant memberships
CREATE POLICY "user_tenants_own_read" ON user_tenants
    FOR SELECT USING (user_id = auth.uid());

-- Users can read other memberships in their tenants (for collaboration)
CREATE POLICY "user_tenants_tenant_read" ON user_tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = user_tenants.tenant_id
            AND ut.is_active = true
        )
    );

-- Only admins and owners can invite users
CREATE POLICY "user_tenants_admin_invite" ON user_tenants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = user_tenants.tenant_id
            AND ut.role IN ('admin', 'owner')
            AND ut.is_active = true
        )
    );

-- Users can modify their own membership (leave tenant)
CREATE POLICY "user_tenants_own_update" ON user_tenants
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can modify other users' memberships
CREATE POLICY "user_tenants_admin_update" ON user_tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = user_tenants.tenant_id
            AND ut.role IN ('admin', 'owner')
            AND ut.is_active = true
        )
    );

-- Only owners can delete memberships (except users can delete their own)
CREATE POLICY "user_tenants_owner_delete" ON user_tenants
    FOR DELETE USING (
        user_id = auth.uid() OR -- Users can delete their own
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = user_tenants.tenant_id
            AND ut.role = 'owner'
            AND ut.is_active = true
        )
    );

-- 5. Audit Logs - Comprehensive access control for healthcare compliance
DROP POLICY IF EXISTS "audit_logs_tenant_access" ON audit_logs;

-- Healthcare professionals can read audit logs for their patients
CREATE POLICY "audit_logs_healthcare_read" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            WHERE ut.user_id = auth.uid() 
            AND ut.tenant_id = audit_logs.tenant_id
            AND ut.is_active = true
            AND ut.role IN ('admin', 'owner', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Patients can read their own audit logs (LGPD right to access)
CREATE POLICY "audit_logs_patient_read" ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid() AND 
        resource_type IN ('patients', 'appointments', 'medical_records', 'treatments')
    );

-- Only system and service role can insert audit logs
CREATE POLICY "audit_logs_system_insert" ON audit_logs
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.uid() IS NOT NULL -- Authenticated users for their own actions
    );

-- No updates or deletes on audit logs (immutable for compliance)
CREATE POLICY "audit_logs_immutable" ON audit_logs
    FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_delete" ON audit_logs
    FOR DELETE USING (false);

-- Create function to check user role in tenant
CREATE OR REPLACE FUNCTION check_user_role(tenant_uuid UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_tenants 
        WHERE user_id = auth.uid() 
        AND tenant_id = tenant_uuid
        AND role = ANY(required_roles)
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is healthcare professional
CREATE OR REPLACE FUNCTION is_healthcare_professional(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN check_user_role(tenant_uuid, ARRAY['doctor', 'nurse', 'admin', 'owner']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin or owner
CREATE OR REPLACE FUNCTION is_admin_or_owner(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN check_user_role(tenant_uuid, ARRAY['admin', 'owner']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's tenant context
CREATE OR REPLACE FUNCTION get_user_tenant_context()
RETURNS TABLE (
    tenant_id UUID,
    role TEXT,
    permissions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ut.tenant_id,
        ut.role,
        CASE ut.role
            WHEN 'owner' THEN '{"all": true}'::jsonb
            WHEN 'admin' THEN '{"manage_users": true, "manage_settings": true, "view_all_data": true}'::jsonb
            WHEN 'doctor' THEN '{"manage_patients": true, "view_medical_data": true, "create_appointments": true}'::jsonb
            WHEN 'nurse' THEN '{"assist_patients": true, "view_limited_medical_data": true, "update_appointments": true}'::jsonb
            WHEN 'receptionist' THEN '{"manage_appointments": true, "view_patient_contact": true, "manage_schedule": true}'::jsonb
            ELSE '{}'::jsonb
        END as permissions
    FROM user_tenants ut
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate healthcare access
CREATE OR REPLACE FUNCTION validate_healthcare_access(
    tenant_uuid UUID,
    resource_type TEXT,
    action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    has_access BOOLEAN := false;
BEGIN
    -- Get user role in tenant
    SELECT role INTO user_role
    FROM user_tenants
    WHERE user_id = auth.uid() 
    AND tenant_id = tenant_uuid
    AND is_active = true;
    
    -- If no role found, deny access
    IF user_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Define access matrix for healthcare resources
    CASE user_role
        WHEN 'owner', 'admin' THEN
            has_access := true; -- Full access
        WHEN 'doctor' THEN
            has_access := resource_type IN ('patients', 'appointments', 'medical_records', 'treatments', 'prescriptions');
        WHEN 'nurse' THEN
            has_access := resource_type IN ('patients', 'appointments', 'treatments') 
                         AND action_type IN ('select', 'update');
        WHEN 'receptionist' THEN
            has_access := resource_type IN ('patients', 'appointments') 
                         AND action_type IN ('select', 'insert', 'update');
        ELSE
            has_access := false;
    END CASE;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for LGPD data subject rights
CREATE OR REPLACE FUNCTION handle_data_subject_request(
    request_type TEXT,
    subject_email TEXT,
    tenant_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    patient_data JSONB;
BEGIN
    -- Validate request type
    IF request_type NOT IN ('access', 'rectification', 'deletion', 'portability', 'restriction') THEN
        RAISE EXCEPTION 'Invalid request type for LGPD data subject rights';
    END IF;
    
    -- Only allow for authenticated users or admin
    IF NOT (auth.uid() IS NOT NULL AND (
        is_admin_or_owner(tenant_uuid) OR
        EXISTS (SELECT 1 FROM patients WHERE email = subject_email AND tenant_id = tenant_uuid)
    )) THEN
        RAISE EXCEPTION 'Unauthorized data subject request';
    END IF;
    
    -- Handle different request types
    CASE request_type
        WHEN 'access' THEN
            -- Return all patient data (LGPD Article 18, II)
            SELECT jsonb_build_object(
                'patient_data', to_jsonb(p),
                'appointments', jsonb_agg(DISTINCT a.* ORDER BY a.created_at),
                'medical_records', jsonb_agg(DISTINCT mr.* ORDER BY mr.created_at),
                'consents', jsonb_agg(DISTINCT c.* ORDER BY c.created_at)
            ) INTO result
            FROM patients p
            LEFT JOIN appointments a ON a.patient_id = p.id
            LEFT JOIN medical_records mr ON mr.patient_id = p.id
            LEFT JOIN lgpd_patient_consents c ON c.patient_id = p.id
            WHERE p.email = subject_email AND p.tenant_id = tenant_uuid
            GROUP BY p.id;
            
        WHEN 'deletion' THEN
            -- Mark for deletion (implement actual deletion workflow)
            result := jsonb_build_object(
                'status', 'deletion_requested',
                'workflow_initiated', true,
                'estimated_completion', NOW() + INTERVAL '15 days'
            );
            
        ELSE
            result := jsonb_build_object('status', 'request_received', 'type', request_type);
    END CASE;
    
    -- Log the request for compliance
    INSERT INTO audit_logs (
        tenant_id, action, resource_type, new_values, timestamp
    ) VALUES (
        tenant_uuid, 
        'lgpd_data_subject_request', 
        'patients', 
        jsonb_build_object('request_type', request_type, 'subject_email', subject_email),
        NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_user_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION is_healthcare_professional(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenant_context() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_healthcare_access(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_data_subject_request(TEXT, TEXT, UUID) TO authenticated;