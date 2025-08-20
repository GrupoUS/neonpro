-- Override Management System Database Schema
-- Following HIPAA audit trail requirements and healthcare compliance standards

-- Table for storing conflict override requests with comprehensive audit trail
CREATE TABLE IF NOT EXISTS appointment_override_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    conflict_type VARCHAR(100) NOT NULL,
    conflict_details TEXT NOT NULL,
    override_reason VARCHAR(50) NOT NULL CHECK (
        override_reason IN (
            'emergency_appointment',
            'patient_preference', 
            'medical_priority',
            'schedule_optimization',
            'special_circumstances',
            'administrative_decision'
        )
    ),
    override_reason_text TEXT NOT NULL,
    requested_by UUID NOT NULL REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected')
    ),
    impact_assessment JSONB NOT NULL, -- Store affected appointments and impact details
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}', -- Additional context and tracking data
    
    -- Audit trail constraints
    CONSTRAINT check_approved_fields CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        (status = 'rejected' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        (status = 'pending' AND approved_by IS NULL AND approved_at IS NULL)
    )
);

-- Comprehensive audit log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    session_id VARCHAR(255), -- For tracking user sessions
    action VARCHAR(100) NOT NULL, -- Specific action taken
    resource_type VARCHAR(50) NOT NULL, -- Type of resource accessed/modified
    resource_id UUID, -- ID of the specific resource
    details JSONB NOT NULL DEFAULT '{}', -- Comprehensive action details
    ip_address INET, -- Client IP address
    user_agent TEXT, -- Browser/client information
    success BOOLEAN NOT NULL DEFAULT true, -- Whether the action succeeded
    error_message TEXT, -- Error details if action failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance indexes
    CONSTRAINT audit_logs_action_check CHECK (action ~ '^[A-Z_]+$') -- Enforce action naming convention
);

-- Table for tracking notification queue for affected parties
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('patient', 'staff', 'manager', 'system')),
    recipient_id UUID, -- Could be patient_id, staff_id, etc.
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (
        delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')
    ),
    delivery_method VARCHAR(20) DEFAULT 'email' CHECK (
        delivery_method IN ('email', 'sms', 'push', 'in_app')
    ),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Override permissions based on user roles
CREATE TABLE IF NOT EXISTS override_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL UNIQUE,
    can_override_conflicts BOOLEAN NOT NULL DEFAULT false,
    can_approve_overrides BOOLEAN NOT NULL DEFAULT false,
    max_override_impact_minutes INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance and audit indexes
CREATE INDEX IF NOT EXISTS idx_override_requests_status ON appointment_override_requests(status);
CREATE INDEX IF NOT EXISTS idx_override_requests_requested_by ON appointment_override_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_override_requests_appointment ON appointment_override_requests(appointment_id);
CREATE INDEX IF NOT EXISTS idx_override_requests_created_at ON appointment_override_requests(created_at DESC);

-- Audit logs indexes for efficient querying and compliance reporting
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session ON audit_logs(session_id);

-- Notification queue indexes for efficient processing
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient ON notification_queue(recipient_type, recipient_id);

-- RLS policies for secure access control
ALTER TABLE appointment_override_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE override_permissions ENABLE ROW LEVEL SECURITY;

-- Override requests policies
CREATE POLICY "Users can view override requests they created or are authorized to approve" ON appointment_override_requests
    FOR SELECT USING (
        requested_by = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('clinic_manager', 'supervisor')
        )
    );

CREATE POLICY "Authorized users can create override requests" ON appointment_override_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('clinic_manager', 'supervisor', 'receptionist')
        )
    );

CREATE POLICY "Only managers can approve/reject override requests" ON appointment_override_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('clinic_manager', 'supervisor')
        )
    );

-- Audit logs policies (read-only for users, full access for managers)
CREATE POLICY "Managers can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('clinic_manager', 'supervisor')
        )
    );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true); -- Allow system inserts

-- Notification queue policies
CREATE POLICY "Staff can manage notifications" ON notification_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('clinic_manager', 'supervisor', 'receptionist', 'staff')
        )
    );

-- Override permissions policies (read-only for security)
CREATE POLICY "All authenticated users can view override permissions" ON override_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Triggers for automatic audit logging
CREATE OR REPLACE FUNCTION log_override_request_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log override request status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO audit_logs (
            user_id, action, resource_type, resource_id, details
        ) VALUES (
            auth.uid(),
            CASE NEW.status
                WHEN 'approved' THEN 'APPROVE_OVERRIDE_REQUEST'
                WHEN 'rejected' THEN 'REJECT_OVERRIDE_REQUEST'
                ELSE 'UPDATE_OVERRIDE_REQUEST'
            END,
            'appointment_override',
            NEW.id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'appointment_id', NEW.appointment_id,
                'reason', NEW.override_reason,
                'impact_minutes', (NEW.impact_assessment->>'estimated_delay_minutes')::integer
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger
DROP TRIGGER IF EXISTS trigger_log_override_changes ON appointment_override_requests;
CREATE TRIGGER trigger_log_override_changes
    AFTER UPDATE ON appointment_override_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_override_request_changes();

-- Function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit logs older than 7 years (HIPAA requirement is 6 years minimum)
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    INSERT INTO audit_logs (
        user_id, action, resource_type, details
    ) VALUES (
        NULL, -- System action
        'CLEANUP_AUDIT_LOGS',
        'audit_log',
        jsonb_build_object('deleted_count', deleted_count, 'retention_period', '7 years')
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default override permissions
INSERT INTO override_permissions (role, can_override_conflicts, can_approve_overrides, max_override_impact_minutes, requires_approval) 
VALUES 
    ('clinic_manager', true, true, 480, false),
    ('supervisor', true, true, 240, false),
    ('receptionist', true, false, 60, true),
    ('staff', false, false, 0, true)
ON CONFLICT (role) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON appointment_override_requests TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_queue TO authenticated;
GRANT SELECT ON override_permissions TO authenticated;