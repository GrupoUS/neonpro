-- RBAC System Migration
-- Story 1.2: Role-Based Permissions Enhancement
-- Created: 2025-01-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Role Definitions Table
CREATE TABLE IF NOT EXISTS role_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    hierarchy INTEGER NOT NULL,
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- User Role Assignments Table
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role_definitions(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active role per user per clinic
    CONSTRAINT unique_active_user_clinic_role UNIQUE (user_id, clinic_id, is_active) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Permission Audit Log Table
CREATE TABLE IF NOT EXISTS permission_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    clinic_id UUID NOT NULL,
    permission VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    result VARCHAR(20) NOT NULL, -- 'granted', 'denied'
    reason TEXT,
    context JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Transitions Table (for tracking role changes)
CREATE TABLE IF NOT EXISTS role_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    clinic_id UUID NOT NULL,
    from_role_id UUID REFERENCES role_definitions(id),
    to_role_id UUID NOT NULL REFERENCES role_definitions(id),
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT,
    effective_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Security Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_definitions_name ON role_definitions(name);
CREATE INDEX IF NOT EXISTS idx_role_definitions_hierarchy ON role_definitions(hierarchy);
CREATE INDEX IF NOT EXISTS idx_role_definitions_active ON role_definitions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_clinic ON user_role_assignments(user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_active ON user_role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_expires ON user_role_assignments(expires_at);

CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_user_clinic ON permission_audit_logs(user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_created_at ON permission_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_permission ON permission_audit_logs(permission);

CREATE INDEX IF NOT EXISTS idx_role_transitions_user_clinic ON role_transitions(user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_role_transitions_effective_at ON role_transitions(effective_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_role_definitions_updated_at
    BEFORE UPDATE ON role_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_role_assignments_updated_at
    BEFORE UPDATE ON user_role_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_clinic_id UUID,
    p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
BEGIN
    -- Get user's permissions for the clinic
    SELECT rd.permissions INTO user_permissions
    FROM user_role_assignments ura
    JOIN role_definitions rd ON ura.role_id = rd.id
    WHERE ura.user_id = p_user_id
      AND ura.clinic_id = p_clinic_id
      AND ura.is_active = true
      AND rd.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > NOW());
    
    -- Check if permission exists in user's permissions
    RETURN p_permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role hierarchy level
CREATE OR REPLACE FUNCTION get_user_hierarchy_level(
    p_user_id UUID,
    p_clinic_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    hierarchy_level INTEGER;
BEGIN
    SELECT rd.hierarchy INTO hierarchy_level
    FROM user_role_assignments ura
    JOIN role_definitions rd ON ura.role_id = rd.id
    WHERE ura.user_id = p_user_id
      AND ura.clinic_id = p_clinic_id
      AND ura.is_active = true
      AND rd.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > NOW());
    
    RETURN COALESCE(hierarchy_level, 999); -- Return high number if no role found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log permission check
CREATE OR REPLACE FUNCTION log_permission_check(
    p_user_id UUID,
    p_clinic_id UUID,
    p_permission TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'check',
    p_result TEXT DEFAULT 'granted',
    p_reason TEXT DEFAULT NULL,
    p_context JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO permission_audit_logs (
        user_id, clinic_id, permission, resource_type, resource_id,
        action, result, reason, context, ip_address, user_agent
    ) VALUES (
        p_user_id, p_clinic_id, p_permission, p_resource_type, p_resource_id,
        p_action, p_result, p_reason, p_context, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign role with transition logging
CREATE OR REPLACE FUNCTION assign_user_role(
    p_user_id UUID,
    p_role_id UUID,
    p_clinic_id UUID,
    p_assigned_by UUID,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
    old_role_id UUID;
BEGIN
    -- Get current role if exists
    SELECT role_id INTO old_role_id
    FROM user_role_assignments
    WHERE user_id = p_user_id
      AND clinic_id = p_clinic_id
      AND is_active = true;
    
    -- Deactivate existing role assignment
    UPDATE user_role_assignments
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id
      AND clinic_id = p_clinic_id
      AND is_active = true;
    
    -- Create new role assignment
    INSERT INTO user_role_assignments (
        user_id, role_id, clinic_id, assigned_by, expires_at, notes
    ) VALUES (
        p_user_id, p_role_id, p_clinic_id, p_assigned_by, p_expires_at, p_notes
    ) RETURNING id INTO assignment_id;
    
    -- Log role transition
    INSERT INTO role_transitions (
        user_id, clinic_id, from_role_id, to_role_id, changed_by
    ) VALUES (
        p_user_id, p_clinic_id, old_role_id, p_role_id, p_assigned_by
    );
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove user role
CREATE OR REPLACE FUNCTION remove_user_role(
    p_user_id UUID,
    p_clinic_id UUID,
    p_removed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    old_role_id UUID;
BEGIN
    -- Get current role
    SELECT role_id INTO old_role_id
    FROM user_role_assignments
    WHERE user_id = p_user_id
      AND clinic_id = p_clinic_id
      AND is_active = true;
    
    -- Deactivate role assignment
    UPDATE user_role_assignments
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id
      AND clinic_id = p_clinic_id
      AND is_active = true;
    
    -- Log role transition (to no role)
    IF old_role_id IS NOT NULL THEN
        INSERT INTO role_transitions (
            user_id, clinic_id, from_role_id, to_role_id, changed_by
        ) VALUES (
            p_user_id, p_clinic_id, old_role_id, NULL, p_removed_by
        );
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default roles
INSERT INTO role_definitions (name, display_name, description, permissions, hierarchy, is_system_role) VALUES
(
    'owner',
    'Proprietário',
    'Proprietário da clínica com acesso total ao sistema',
    ARRAY[
        'manage_clinic', 'manage_users', 'manage_roles', 'assign_roles',
        'view_users', 'create_users', 'update_users', 'delete_users',
        'manage_patients', 'view_patients', 'create_patients', 'update_patients', 'delete_patients',
        'manage_appointments', 'view_appointments', 'create_appointments', 'update_appointments', 'delete_appointments',
        'manage_finances', 'view_finances', 'create_finances', 'update_finances', 'delete_finances',
        'manage_reports', 'view_reports', 'create_reports',
        'manage_system', 'view_system', 'update_system',
        'manage_integrations', 'view_integrations',
        'manage_data', 'export_data', 'import_data', 'backup_data'
    ],
    1,
    true
),
(
    'manager',
    'Gerente',
    'Gerente da clínica com acesso administrativo',
    ARRAY[
        'manage_users', 'view_users', 'create_users', 'update_users',
        'manage_patients', 'view_patients', 'create_patients', 'update_patients', 'delete_patients',
        'manage_appointments', 'view_appointments', 'create_appointments', 'update_appointments', 'delete_appointments',
        'manage_finances', 'view_finances', 'create_finances', 'update_finances',
        'manage_reports', 'view_reports', 'create_reports',
        'view_system',
        'view_integrations',
        'export_data'
    ],
    2,
    true
),
(
    'staff',
    'Funcionário',
    'Funcionário da clínica com acesso operacional',
    ARRAY[
        'view_users',
        'manage_patients', 'view_patients', 'create_patients', 'update_patients',
        'manage_appointments', 'view_appointments', 'create_appointments', 'update_appointments',
        'view_finances',
        'view_reports'
    ],
    3,
    true
),
(
    'patient',
    'Paciente',
    'Paciente com acesso limitado aos próprios dados',
    ARRAY[
        'view_own_data',
        'update_own_profile',
        'view_own_appointments',
        'create_own_appointments'
    ],
    4,
    true
)
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_definitions
CREATE POLICY "Users can view role definitions" ON role_definitions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only owners can manage role definitions" ON role_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN role_definitions rd ON ura.role_id = rd.id
            WHERE ura.user_id = auth.uid()
              AND rd.name = 'owner'
              AND ura.is_active = true
        )
    );

-- RLS Policies for user_role_assignments
CREATE POLICY "Users can view their own role assignments" ON user_role_assignments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view role assignments in their clinic" ON user_role_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN role_definitions rd ON ura.role_id = rd.id
            WHERE ura.user_id = auth.uid()
              AND ura.clinic_id = user_role_assignments.clinic_id
              AND rd.hierarchy <= 2
              AND ura.is_active = true
        )
    );

CREATE POLICY "Only owners and managers can assign roles" ON user_role_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN role_definitions rd ON ura.role_id = rd.id
            WHERE ura.user_id = auth.uid()
              AND ura.clinic_id = user_role_assignments.clinic_id
              AND rd.hierarchy <= 2
              AND ura.is_active = true
        )
    );

-- RLS Policies for permission_audit_logs
CREATE POLICY "Users can view their own audit logs" ON permission_audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view audit logs in their clinic" ON permission_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            JOIN role_definitions rd ON ura.role_id = rd.id
            WHERE ura.user_id = auth.uid()
              AND ura.clinic_id = permission_audit_logs.clinic_id
              AND rd.hierarchy <= 2
              AND ura.is_active = true
        )
    );

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT ON role_definitions TO authenticated;
GRANT ALL ON user_role_assignments TO authenticated;
GRANT ALL ON permission_audit_logs TO authenticated;
GRANT SELECT ON role_transitions TO authenticated;
GRANT ALL ON user_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_user_permission(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_hierarchy_level(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_permission_check(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_role(UUID, UUID, UUID, UUID, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_role(UUID, UUID, UUID) TO authenticated;

-- Create a view for easy role and permission queries
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT 
    ura.user_id,
    ura.clinic_id,
    rd.name as role_name,
    rd.display_name as role_display_name,
    rd.hierarchy,
    rd.permissions,
    ura.assigned_at,
    ura.expires_at,
    ura.is_active
FROM user_role_assignments ura
JOIN role_definitions rd ON ura.role_id = rd.id
WHERE ura.is_active = true
  AND rd.is_active = true
  AND (ura.expires_at IS NULL OR ura.expires_at > NOW());

GRANT SELECT ON user_permissions_view TO authenticated;

-- Comments for documentation
COMMENT ON TABLE role_definitions IS 'Defines available roles and their permissions';
COMMENT ON TABLE user_role_assignments IS 'Assigns roles to users for specific clinics';
COMMENT ON TABLE permission_audit_logs IS 'Logs all permission checks for audit purposes';
COMMENT ON TABLE role_transitions IS 'Tracks role changes over time';
COMMENT ON TABLE user_sessions IS 'Manages user session security and tracking';

COMMENT ON FUNCTION check_user_permission(UUID, UUID, TEXT) IS 'Checks if a user has a specific permission in a clinic';
COMMENT ON FUNCTION get_user_hierarchy_level(UUID, UUID) IS 'Gets the hierarchy level of a user in a clinic';
COMMENT ON FUNCTION log_permission_check IS 'Logs permission checks for audit trail';
COMMENT ON FUNCTION assign_user_role IS 'Assigns a role to a user with transition logging';
COMMENT ON FUNCTION remove_user_role IS 'Removes a role from a user with transition logging';
