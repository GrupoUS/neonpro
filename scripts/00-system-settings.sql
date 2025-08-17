-- scripts/00-system-settings.sql
-- System Settings Table for NeonPro Configuration Management
-- Purpose: Store system-wide configuration and settings

-- Create system_settings table for configuration management
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings (key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_system_settings_created_at ON public.system_settings (created_at);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
CREATE TRIGGER system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_system_settings_updated_at();

-- RLS Policies
-- Public settings can be read by anyone
CREATE POLICY "Anyone can read public settings" ON public.system_settings
    FOR SELECT USING (is_public = TRUE);

-- Authenticated users can read all settings
CREATE POLICY "Authenticated users can read settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, data_type, is_public, created_by) VALUES
    ('app_name', 'NeonPro', 'Application name', 'string', true, NULL),
    ('app_version', '1.0.0', 'Current application version', 'string', true, NULL),
    ('privacy_policy_version', '1.0', 'Current privacy policy version for LGPD compliance tracking', 'string', true, NULL),
    ('terms_of_service_version', '1.0', 'Current terms of service version', 'string', true, NULL),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'boolean', false, NULL),
    ('max_appointment_duration', '240', 'Maximum appointment duration in minutes', 'number', false, NULL),
    ('min_appointment_duration', '15', 'Minimum appointment duration in minutes', 'number', false, NULL),
    ('booking_advance_days', '30', 'Maximum days in advance for booking', 'number', false, NULL),
    ('cancellation_deadline_hours', '24', 'Hours before appointment when cancellation is allowed', 'number', false, NULL)
ON CONFLICT (key) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.system_settings IS 'System-wide configuration and settings for NeonPro application';
COMMENT ON COLUMN public.system_settings.key IS 'Unique configuration key identifier';
COMMENT ON COLUMN public.system_settings.value IS 'Configuration value stored as text';
COMMENT ON COLUMN public.system_settings.data_type IS 'Data type hint for proper value parsing';
COMMENT ON COLUMN public.system_settings.is_public IS 'Whether this setting can be accessed by non-authenticated users';