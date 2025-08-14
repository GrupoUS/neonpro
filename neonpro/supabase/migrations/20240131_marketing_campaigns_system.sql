-- Marketing Campaigns and Personalization System
-- Epic 7.2: Automated Marketing Campaigns + Personalization
-- Author: VoidBeast Agent
-- Created: 2024-01-31

-- Campaign Templates
CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push', 'multi-channel'
    content_template JSONB NOT NULL, -- Template structure with placeholders
    subject_template TEXT,
    personalization_fields JSONB, -- Available personalization options
    target_segments JSONB, -- Applicable patient segments
    default_settings JSONB, -- Default campaign settings
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- 'automated', 'manual', 'trigger-based', 'a-b-test'
    template_id UUID REFERENCES campaign_templates(id),
    target_segments JSONB NOT NULL, -- Patient segmentation criteria
    content JSONB NOT NULL, -- Campaign content and variations
    delivery_channels JSONB NOT NULL, -- ['email', 'sms', 'whatsapp', 'push']
    schedule_config JSONB, -- Scheduling and timing configuration
    trigger_config JSONB, -- Event-based triggers
    personalization_config JSONB, -- Personalization rules
    send_time_optimization BOOLEAN DEFAULT true,
    automation_level DECIMAL(3,2) DEFAULT 0.80, -- Target ≥80% automation
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Executions
CREATE TABLE IF NOT EXISTS campaign_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    execution_type VARCHAR(50) NOT NULL, -- 'scheduled', 'triggered', 'manual', 'test'
    target_patient_ids JSONB, -- Array of target patient IDs
    content_variation_id VARCHAR(50), -- For A/B testing
    delivery_channel VARCHAR(50) NOT NULL,
    personalized_content JSONB, -- Final personalized content
    execution_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed', 'cancelled'
    scheduled_at TIMESTAMP,
    executed_at TIMESTAMP,
    metrics JSONB, -- Delivery, open, click, conversion metrics
    error_details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign A/B Tests
CREATE TABLE IF NOT EXISTS campaign_ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'content', 'subject', 'timing', 'channel', 'multivariate'
    variations JSONB NOT NULL, -- Test variations and configurations
    traffic_split JSONB NOT NULL, -- Traffic allocation between variations
    success_metrics JSONB NOT NULL, -- Metrics to optimize for
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    min_sample_size INTEGER DEFAULT 100,
    test_duration_hours INTEGER,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'running', 'completed', 'stopped'
    winner_variation_id VARCHAR(50),
    statistical_significance DECIMAL(5,4),
    results JSONB, -- Detailed test results
    auto_select_winner BOOLEAN DEFAULT false,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Triggers
CREATE TABLE IF NOT EXISTS campaign_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    trigger_name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'event', 'behavioral', 'date-based', 'milestone', 'lifecycle'
    trigger_conditions JSONB NOT NULL, -- Conditions that activate the trigger
    delay_config JSONB, -- Delay before sending (immediate, hours, days)
    frequency_limits JSONB, -- Frequency capping rules
    suppression_rules JSONB, -- Rules to suppress sending
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Personalization Profiles
CREATE TABLE IF NOT EXISTS patient_personalization_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) UNIQUE,
    preferences JSONB, -- Communication preferences and interests
    behavioral_data JSONB, -- Behavioral patterns and interactions
    engagement_score DECIMAL(5,2), -- Overall engagement score (0-100)
    channel_preferences JSONB, -- Preferred communication channels
    content_preferences JSONB, -- Preferred content types and topics
    send_time_preferences JSONB, -- Optimal send times
    frequency_preferences JSONB, -- Communication frequency preferences
    personalization_segments JSONB, -- Dynamic segment memberships
    ai_insights JSONB, -- AI-generated insights and recommendations
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Performance Metrics
CREATE TABLE IF NOT EXISTS campaign_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    execution_id UUID REFERENCES campaign_executions(id),
    metric_date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_complaints INTEGER DEFAULT 0,
    delivery_rate DECIMAL(5,4),
    open_rate DECIMAL(5,4),
    click_rate DECIMAL(5,4),
    conversion_rate DECIMAL(5,4),
    unsubscribe_rate DECIMAL(5,4),
    bounce_rate DECIMAL(5,4),
    complaint_rate DECIMAL(5,4),
    revenue_generated DECIMAL(10,2),
    roi DECIMAL(8,4),
    cost_per_acquisition DECIMAL(8,2),
    engagement_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(campaign_id, execution_id, metric_date, channel)
);

-- Consent Management for LGPD Compliance
CREATE TABLE IF NOT EXISTS marketing_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    consent_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push', 'all'
    consent_status BOOLEAN NOT NULL,
    consent_source VARCHAR(100), -- Where consent was given
    consent_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP,
    withdrawal_date TIMESTAMP,
    withdrawal_reason TEXT,
    opt_in_campaign_id UUID REFERENCES marketing_campaigns(id),
    legal_basis VARCHAR(100), -- LGPD legal basis
    consent_text TEXT, -- Actual consent text shown to user
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(patient_id, consent_type)
);

-- Campaign Audit Trail
CREATE TABLE IF NOT EXISTS campaign_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES profiles(id),
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON marketing_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_campaign_id ON campaign_executions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_status ON campaign_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_scheduled_at ON campaign_executions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ab_tests_campaign_id ON campaign_ab_tests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON campaign_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_triggers_campaign_id ON campaign_triggers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_triggers_active ON campaign_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_personalization_patient_id ON patient_personalization_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_performance_campaign_id ON campaign_performance_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON campaign_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_consent_patient_id ON marketing_consent(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_type_status ON marketing_consent(consent_type, consent_status);
CREATE INDEX IF NOT EXISTS idx_audit_campaign_id ON campaign_audit_trail(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON campaign_audit_trail(timestamp);

-- RLS Policies
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can access campaign templates" ON campaign_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access marketing campaigns" ON marketing_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access campaign executions" ON campaign_executions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access ab tests" ON campaign_ab_tests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access campaign triggers" ON campaign_triggers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access personalization profiles" ON patient_personalization_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access performance metrics" ON campaign_performance_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access consent records" ON marketing_consent FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can access audit trail" ON campaign_audit_trail FOR ALL USING (auth.role() = 'authenticated');
