-- ============================================================================
-- Story 13.3: Marketing and Social Media Integration - Database Structure
-- Epic 13: CRM and Marketing Integration 
-- Created: 2025-01-24
-- Purpose: Database schema for social media management and marketing automation
-- ============================================================================

BEGIN;

-- ============================================================================
-- Social Media Management Tables
-- ============================================================================

-- Social Media Platform registry (predefined platforms)
CREATE TABLE social_media_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name VARCHAR(50) NOT NULL UNIQUE,
    platform_display_name VARCHAR(100) NOT NULL,
    platform_icon_url TEXT,
    api_base_url TEXT,
    oauth_config JSONB DEFAULT '{}', -- OAuth endpoints and configuration
    api_rate_limits JSONB DEFAULT '{}', -- Rate limiting information
    supported_features JSONB DEFAULT '{}', -- posting, analytics, messaging, etc.
    webhook_capabilities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clinic's Social Media Accounts
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL, -- References social_media_platforms
    account_name VARCHAR(255) NOT NULL,
    account_handle VARCHAR(255), -- @username, page handle, etc.
    account_id VARCHAR(255), -- Platform-specific account ID
    access_token TEXT, -- Encrypted OAuth token
    refresh_token TEXT, -- Encrypted refresh token  
    token_expires_at TIMESTAMPTZ,
    account_metadata JSONB DEFAULT '{}', -- Profile info, follower count, etc.
    sync_settings JSONB DEFAULT '{}', -- Sync preferences and configuration
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'paused', 'disconnected')),
    sync_error_message TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(clinic_id, platform_name, account_id)
);

-- Social Media Posts and Content
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    post_type VARCHAR(30) NOT NULL CHECK (post_type IN ('post', 'story', 'reel', 'video', 'carousel', 'live')),
    content_text TEXT,
    media_urls JSONB DEFAULT '[]', -- Array of media file URLs
    hashtags JSONB DEFAULT '[]', -- Array of hashtags
    mentions JSONB DEFAULT '[]', -- Array of user mentions
    post_settings JSONB DEFAULT '{}', -- Platform-specific settings
    scheduled_time TIMESTAMPTZ,
    published_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'deleted')),
    platform_post_id VARCHAR(255), -- Platform-specific post ID
    platform_post_url TEXT, -- Direct link to post
    engagement_stats JSONB DEFAULT '{}', -- Likes, comments, shares, etc.
    targeting_settings JSONB DEFAULT '{}', -- Audience targeting options
    campaign_tag VARCHAR(255), -- For grouping related posts
    created_by UUID NOT NULL REFERENCES profiles(id),
    published_by UUID REFERENCES profiles(id),
    error_message TEXT, -- If posting failed
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Media Analytics and Performance
CREATE TABLE social_media_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    post_id UUID REFERENCES social_media_posts(id) ON DELETE CASCADE,
    analytics_type VARCHAR(30) NOT NULL CHECK (analytics_type IN ('account_overview', 'post_performance', 'audience_insights', 'engagement_rate')),
    analytics_date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}', -- Platform-specific metrics
    reach_metrics JSONB DEFAULT '{}', -- Reach, impressions, unique views
    engagement_metrics JSONB DEFAULT '{}', -- Likes, comments, shares, saves
    audience_demographics JSONB DEFAULT '{}', -- Age, gender, location data
    performance_score DECIMAL(5,2), -- Calculated performance score
    benchmark_comparison JSONB DEFAULT '{}', -- Comparison with industry/historical data
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(account_id, post_id, analytics_type, analytics_date)
);

-- Post Engagement and Interactions
CREATE TABLE social_post_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
    engagement_type VARCHAR(30) NOT NULL CHECK (engagement_type IN ('like', 'love', 'comment', 'share', 'save', 'click', 'view', 'reach')),
    engagement_count INTEGER NOT NULL DEFAULT 0,
    user_profile JSONB DEFAULT '{}', -- Engaging user information (when available)
    comment_text TEXT, -- For comment engagements
    sentiment_score DECIMAL(3,2), -- AI-analyzed sentiment (-1 to 1)
    engagement_timestamp TIMESTAMPTZ NOT NULL,
    platform_engagement_id VARCHAR(255), -- Platform-specific engagement ID
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, engagement_type, platform_engagement_id)
);

-- ============================================================================
-- Marketing Automation Platforms (HubSpot, Mailchimp, etc.)
-- ============================================================================

-- Marketing Platforms registry
CREATE TABLE marketing_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name VARCHAR(50) NOT NULL UNIQUE,
    platform_type VARCHAR(30) NOT NULL CHECK (platform_type IN ('crm', 'email_marketing', 'automation', 'analytics', 'lead_generation')),
    api_base_url TEXT,
    oauth_config JSONB DEFAULT '{}',
    webhook_capabilities JSONB DEFAULT '{}',
    features_supported JSONB DEFAULT '{}', -- contacts, campaigns, workflows, analytics
    pricing_model VARCHAR(50), -- 'freemium', 'subscription', 'usage_based'
    integration_complexity VARCHAR(20) DEFAULT 'medium' CHECK (integration_complexity IN ('low', 'medium', 'high')),
    documentation_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'beta')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clinic's Marketing Platform Connections
CREATE TABLE marketing_platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES marketing_platforms(id) ON DELETE CASCADE,
    connection_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255), -- Platform-specific account ID
    api_key TEXT, -- Encrypted API key
    access_token TEXT, -- Encrypted OAuth token
    refresh_token TEXT, -- Encrypted refresh token
    token_expires_at TIMESTAMPTZ,
    webhook_url TEXT,
    webhook_secret TEXT,
    sync_configuration JSONB DEFAULT '{}', -- Sync settings and field mappings
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'paused', 'disconnected')),
    sync_error_message TEXT,
    connection_health_score INTEGER DEFAULT 100 CHECK (connection_health_score >= 0 AND connection_health_score <= 100),
    data_flow_direction VARCHAR(20) DEFAULT 'bidirectional' CHECK (data_flow_direction IN ('inbound', 'outbound', 'bidirectional')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(clinic_id, platform_id, account_id)
);

-- Marketing Automation Workflows
CREATE TABLE marketing_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN ('email_sequence', 'lead_nurturing', 'patient_retention', 'reactivation', 'onboarding', 'follow_up')),
    trigger_event VARCHAR(100) NOT NULL, -- 'form_submission', 'appointment_booking', 'treatment_completion', etc.
    trigger_conditions JSONB DEFAULT '{}', -- Conditions that must be met
    workflow_steps JSONB NOT NULL DEFAULT '[]', -- Array of workflow steps/actions
    target_audience JSONB DEFAULT '{}', -- Audience criteria
    personalization_rules JSONB DEFAULT '{}', -- Dynamic content rules
    frequency_settings JSONB DEFAULT '{}', -- Timing and frequency controls
    success_metrics JSONB DEFAULT '{}', -- KPIs and goals
    a_b_test_config JSONB DEFAULT '{}', -- A/B testing configuration
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    performance_stats JSONB DEFAULT '{}', -- Workflow performance data
    created_by UUID NOT NULL REFERENCES profiles(id),
    last_modified_by UUID REFERENCES profiles(id),
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Executions and Results
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES marketing_workflows(id) ON DELETE CASCADE,
    target_contact_id UUID, -- Could be patient_id or lead_id
    contact_type VARCHAR(20) CHECK (contact_type IN ('patient', 'lead', 'prospect')),
    execution_status VARCHAR(30) DEFAULT 'running' CHECK (execution_status IN ('running', 'completed', 'failed', 'cancelled', 'paused')),
    current_step_index INTEGER DEFAULT 0,
    steps_completed INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    execution_data JSONB DEFAULT '{}', -- Execution context and variables
    performance_metrics JSONB DEFAULT '{}', -- Open rates, click rates, conversions
    error_log JSONB DEFAULT '[]', -- Array of errors encountered
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    next_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance Optimization
-- ============================================================================

-- Social Media indexes
CREATE INDEX idx_social_accounts_clinic_platform ON social_media_accounts(clinic_id, platform_name);
CREATE INDEX idx_social_accounts_status ON social_media_accounts(status);
CREATE INDEX idx_social_posts_clinic_schedule ON social_media_posts(clinic_id, scheduled_time);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_posts_platform ON social_media_posts(account_id, status);
CREATE INDEX idx_social_analytics_date ON social_media_analytics(analytics_date DESC);
CREATE INDEX idx_social_analytics_post ON social_media_analytics(post_id);
CREATE INDEX idx_post_engagement_type_timestamp ON social_post_engagement(engagement_type, engagement_timestamp DESC);

-- Marketing Platform indexes
CREATE INDEX idx_marketing_connections_clinic ON marketing_platform_connections(clinic_id, sync_status);
CREATE INDEX idx_marketing_connections_platform ON marketing_platform_connections(platform_id, sync_status);
CREATE INDEX idx_marketing_workflows_clinic_type ON marketing_workflows(clinic_id, workflow_type, status);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id, execution_status);
CREATE INDEX idx_workflow_executions_contact ON workflow_executions(target_contact_id, contact_type);
CREATE INDEX idx_workflow_executions_next_action ON workflow_executions(next_action_at) WHERE execution_status = 'running';

-- ============================================================================
-- Triggers for Automation and Data Consistency
-- ============================================================================

-- Update social media account sync timestamp
CREATE OR REPLACE FUNCTION update_social_account_sync()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_sync_at = now();
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_social_account_sync
    BEFORE UPDATE ON social_media_accounts
    FOR EACH ROW
    WHEN (OLD.sync_status IS DISTINCT FROM NEW.sync_status)
    EXECUTE FUNCTION update_social_account_sync();

-- Update marketing platform connection health
CREATE OR REPLACE FUNCTION update_marketing_connection_health()
RETURNS TRIGGER AS $$
BEGIN
    -- Lower health score on sync errors
    IF NEW.sync_status = 'error' AND OLD.sync_status != 'error' THEN
        NEW.connection_health_score = GREATEST(NEW.connection_health_score - 20, 0);
    -- Improve health score on successful sync
    ELSIF NEW.sync_status = 'active' AND OLD.sync_status = 'error' THEN
        NEW.connection_health_score = LEAST(NEW.connection_health_score + 10, 100);
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketing_connection_health
    BEFORE UPDATE ON marketing_platform_connections
    FOR EACH ROW
    WHEN (OLD.sync_status IS DISTINCT FROM NEW.sync_status)
    EXECUTE FUNCTION update_marketing_connection_health();

-- Update workflow execution progress
CREATE OR REPLACE FUNCTION update_workflow_execution_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update completion timestamp
    IF NEW.execution_status = 'completed' AND OLD.execution_status != 'completed' THEN
        NEW.completed_at = now();
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_execution_progress
    BEFORE UPDATE ON workflow_executions
    FOR EACH ROW
    WHEN (OLD.execution_status IS DISTINCT FROM NEW.execution_status OR OLD.current_step_index IS DISTINCT FROM NEW.current_step_index)
    EXECUTE FUNCTION update_workflow_execution_progress();

-- ============================================================================
-- RLS Security - Enable RLS without policies for now
-- ============================================================================

-- Enable RLS on all new tables (policies to be added in future migrations)
ALTER TABLE social_media_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Insert Default Social Media Platforms
-- ============================================================================

INSERT INTO social_media_platforms (platform_name, platform_display_name, api_base_url, supported_features, oauth_config) VALUES
('instagram', 'Instagram', 'https://graph.instagram.com/', '{"posting": true, "analytics": true, "messaging": false, "stories": true}', '{"auth_url": "https://api.instagram.com/oauth/authorize", "token_url": "https://api.instagram.com/oauth/access_token"}'),
('facebook', 'Facebook', 'https://graph.facebook.com/', '{"posting": true, "analytics": true, "messaging": true, "pages": true}', '{"auth_url": "https://www.facebook.com/v18.0/dialog/oauth", "token_url": "https://graph.facebook.com/v18.0/oauth/access_token"}'),
('whatsapp_business', 'WhatsApp Business', 'https://graph.facebook.com/', '{"messaging": true, "templates": true, "webhooks": true}', '{"auth_url": "https://www.facebook.com/v18.0/dialog/oauth", "token_url": "https://graph.facebook.com/v18.0/oauth/access_token"}'),
('tiktok', 'TikTok', 'https://open-api.tiktok.com/', '{"posting": true, "analytics": true, "messaging": false}', '{"auth_url": "https://www.tiktok.com/auth/authorize/", "token_url": "https://open-api.tiktok.com/oauth/access_token/"}'),
('linkedin', 'LinkedIn', 'https://api.linkedin.com/', '{"posting": true, "analytics": true, "messaging": false}', '{"auth_url": "https://www.linkedin.com/oauth/v2/authorization", "token_url": "https://www.linkedin.com/oauth/v2/accessToken"}');

-- ============================================================================
-- Insert Default Marketing Platforms
-- ============================================================================

INSERT INTO marketing_platforms (platform_name, platform_type, api_base_url, features_supported, pricing_model, integration_complexity, documentation_url) VALUES
('HubSpot', 'crm', 'https://api.hubapi.com/v3/', '{"contacts": true, "campaigns": true, "workflows": true, "analytics": true, "email_marketing": true}', 'freemium', 'medium', 'https://developers.hubspot.com/'),
('Mailchimp', 'email_marketing', 'https://server.api.mailchimp.com/3.0/', '{"contacts": true, "campaigns": true, "email_marketing": true, "automation": true}', 'freemium', 'low', 'https://mailchimp.com/developer/'),
('RD Station', 'automation', 'https://api.rdstation.com.br/v2/', '{"contacts": true, "workflows": true, "analytics": true, "lead_scoring": true}', 'subscription', 'medium', 'https://developers.rdstation.com/'),
('ActiveCampaign', 'automation', 'https://api.activecampaign.com/api/3/', '{"contacts": true, "automation": true, "email_marketing": true, "lead_scoring": true}', 'subscription', 'medium', 'https://developers.activecampaign.com/'),
('ConvertKit', 'email_marketing', 'https://api.convertkit.com/v3/', '{"contacts": true, "email_marketing": true, "automation": true}', 'freemium', 'low', 'https://developers.convertkit.com/');

COMMIT;