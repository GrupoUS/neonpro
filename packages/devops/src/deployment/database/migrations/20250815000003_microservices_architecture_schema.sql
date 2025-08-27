-- ================================================
-- MICROSERVICES ARCHITECTURE SCHEMA
-- Database schema for supporting microservices infrastructure
-- Story 4.2: Enterprise Architecture & Scalability
-- ================================================

-- ================================================
-- SERVICE REGISTRY TABLES
-- ================================================

-- Service registry for microservices discovery
CREATE TABLE IF NOT EXISTS service_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    service_version VARCHAR(50) NOT NULL,
    instance_id VARCHAR(255) NOT NULL UNIQUE,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    protocol VARCHAR(10) DEFAULT 'http',
    health_check_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    metadata JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service dependencies mapping
CREATE TABLE IF NOT EXISTS service_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    depends_on VARCHAR(255) NOT NULL,
    dependency_type VARCHAR(50) DEFAULT 'sync' CHECK (dependency_type IN ('sync', 'async', 'optional')),
    timeout_ms INTEGER DEFAULT 30000,
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff": "exponential"}',
    circuit_breaker JSONB DEFAULT '{"failure_threshold": 5, "recovery_timeout": 60000}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_name, depends_on)
);

-- ================================================
-- CONFIGURATION MANAGEMENT
-- ================================================

-- Centralized configuration storage
CREATE TABLE IF NOT EXISTS configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(255),
    is_secret BOOLEAN DEFAULT FALSE,
    description TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(key, environment, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

-- Feature flags for gradual rollouts
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    percentage INTEGER DEFAULT 100 CHECK (percentage >= 0 AND percentage <= 100),
    tenant_ids JSONB DEFAULT '[]',
    user_roles JSONB DEFAULT '[]',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(key, environment)
);

-- Configuration audit log
CREATE TABLE IF NOT EXISTS configuration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_key VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    updated_by UUID REFERENCES auth.users(id),
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- ================================================
-- MONITORING AND OBSERVABILITY
-- ================================================

-- Metrics storage
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) DEFAULT 'count' CHECK (unit IN ('count', 'bytes', 'milliseconds', 'percentage', 'rate')),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(255) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create indexes for efficient metric queries
CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics (name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_source_timestamp ON metrics (source, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_tags ON metrics USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_timestamp ON metrics (tenant_id, timestamp DESC) WHERE tenant_id IS NOT NULL;

-- Application logs
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    message TEXT NOT NULL,
    service VARCHAR(255) NOT NULL,
    operation VARCHAR(255),
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stack TEXT,
    duration DOUBLE PRECISION
);

-- Create indexes for efficient log queries
CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp ON logs (level, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_service_timestamp ON logs (service, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs (request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp ON logs (user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_tenant_timestamp ON logs (tenant_id, timestamp DESC) WHERE tenant_id IS NOT NULL;

-- Alerts and notifications
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(255) PRIMARY KEY, -- Custom ID from monitoring service
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    service VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255),
    threshold DOUBLE PRECISION,
    current_value DOUBLE PRECISION,
    tags JSONB DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Health checks
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    latency DOUBLE PRECISION NOT NULL,
    checks JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(50),
    uptime DOUBLE PRECISION,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- ================================================
-- API GATEWAY TABLES
-- ================================================

-- API routes configuration
CREATE TABLE IF NOT EXISTS api_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
    service_name VARCHAR(255) NOT NULL,
    target_path VARCHAR(500) NOT NULL,
    timeout_ms INTEGER DEFAULT 30000,
    rate_limit_requests INTEGER DEFAULT 1000,
    rate_limit_window_ms INTEGER DEFAULT 60000,
    authentication_required BOOLEAN DEFAULT TRUE,
    authorization_roles JSONB DEFAULT '[]',
    cache_ttl_seconds INTEGER DEFAULT 0,
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff": "exponential"}',
    circuit_breaker JSONB DEFAULT '{"failure_threshold": 5, "recovery_timeout": 60000}',
    enabled BOOLEAN DEFAULT TRUE,
    version VARCHAR(50) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(path, method, version)
);

-- API rate limiting
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- IP, user ID, API key, etc.
    identifier_type VARCHAR(50) NOT NULL CHECK (identifier_type IN ('ip', 'user', 'api_key', 'tenant')),
    route_id UUID REFERENCES api_routes(id) ON DELETE CASCADE,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, identifier_type, route_id)
);

-- API request logs
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL UNIQUE,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    service_name VARCHAR(255),
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    request_headers JSONB DEFAULT '{}',
    request_body JSONB,
    response_status INTEGER,
    response_headers JSONB DEFAULT '{}',
    response_body JSONB,
    duration_ms DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- Create indexes for API request logs
CREATE INDEX IF NOT EXISTS idx_api_request_logs_timestamp ON api_request_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_service ON api_request_logs (service_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user ON api_request_logs (user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_request_logs_tenant ON api_request_logs (tenant_id, timestamp DESC) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_request_logs_status ON api_request_logs (response_status, timestamp DESC);

-- ================================================
-- MULTI-TENANCY ENHANCEMENTS
-- ================================================

-- Tenant service subscriptions
CREATE TABLE IF NOT EXISTS tenant_service_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    plan VARCHAR(100) NOT NULL DEFAULT 'standard',
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}', -- e.g., {"api_calls_per_month": 10000, "storage_gb": 100}
    enabled BOOLEAN DEFAULT TRUE,
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, service_name)
);

-- Tenant resource usage tracking
CREATE TABLE IF NOT EXISTS tenant_resource_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'api_calls', 'storage', 'bandwidth'
    usage_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    usage_unit VARCHAR(50) NOT NULL, -- e.g., 'count', 'bytes', 'requests'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, service_name, resource_type, period_start)
);

-- ================================================
-- DATA PARTITIONING SUPPORT
-- ================================================

-- Partition metadata for large tables
CREATE TABLE IF NOT EXISTS partition_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    partition_key VARCHAR(255) NOT NULL,
    partition_value VARCHAR(255) NOT NULL,
    partition_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_count BIGINT DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    last_analyzed TIMESTAMP WITH TIME ZONE,
    retention_days INTEGER DEFAULT 365
);

-- ================================================
-- MESSAGE QUEUE AND EVENT SOURCING
-- ================================================

-- Event store for microservices communication
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_version INTEGER DEFAULT 1,
    event_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sequence_number BIGSERIAL,
    correlation_id UUID,
    causation_id UUID
);

-- Create indexes for event sourcing
CREATE INDEX IF NOT EXISTS idx_events_aggregate ON events (aggregate_id, aggregate_type, sequence_number);
CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events (event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_tenant_timestamp ON events (tenant_id, timestamp DESC) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_correlation ON events (correlation_id) WHERE correlation_id IS NOT NULL;

-- Message queue for async processing
CREATE TABLE IF NOT EXISTS message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_name VARCHAR(255) NOT NULL,
    message_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead_letter')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id)
);

-- Create indexes for message queue
CREATE INDEX IF NOT EXISTS idx_message_queue_status_priority ON message_queue (status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_message_queue_queue_name ON message_queue (queue_name, status, created_at);
CREATE INDEX IF NOT EXISTS idx_message_queue_next_retry ON message_queue (next_retry_at) WHERE next_retry_at IS NOT NULL;

-- ================================================
-- CACHING LAYER SUPPORT
-- ================================================

-- Distributed cache entries
CREATE TABLE IF NOT EXISTS cache_entries (
    key VARCHAR(500) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    tags JSONB DEFAULT '[]'
);

-- Create indexes for cache
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires ON cache_entries (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cache_entries_tenant ON cache_entries (tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cache_entries_tags ON cache_entries USING GIN (tags);

-- ================================================
-- SECURITY AND AUDIT ENHANCEMENTS
-- ================================================

-- Service authentication tokens
CREATE TABLE IF NOT EXISTS service_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_used TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id)
);

-- Cross-service request audit
CREATE TABLE IF NOT EXISTS service_request_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    source_service VARCHAR(255) NOT NULL,
    target_service VARCHAR(255) NOT NULL,
    operation VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    request_data JSONB,
    response_status INTEGER,
    duration_ms DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- ================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all multi-tenant tables
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_service_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_audit ENABLE ROW LEVEL SECURITY;

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Configurations policies
CREATE POLICY "Users can view configurations for their tenant"
ON configurations FOR SELECT
USING (
    tenant_id IS NULL OR 
    tenant_id = (SELECT get_current_tenant_id())
);

CREATE POLICY "Service tokens can access configurations"
ON configurations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM service_tokens 
        WHERE token_hash = current_setting('app.service_token', true)
        AND NOT revoked
    )
);

-- Metrics policies
CREATE POLICY "Users can view metrics for their tenant"
ON metrics FOR SELECT
USING (
    tenant_id IS NULL OR 
    tenant_id = (SELECT get_current_tenant_id())
);

-- Logs policies  
CREATE POLICY "Users can view logs for their tenant"
ON logs FOR SELECT
USING (
    tenant_id IS NULL OR 
    tenant_id = (SELECT get_current_tenant_id())
);

-- Events policies
CREATE POLICY "Users can view events for their tenant"
ON events FOR SELECT
USING (
    tenant_id IS NULL OR 
    tenant_id = (SELECT get_current_tenant_id())
);

-- ================================================
-- TRIGGERS AND FUNCTIONS
-- ================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_service_registry_updated_at BEFORE UPDATE ON service_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_dependencies_updated_at BEFORE UPDATE ON service_dependencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_routes_updated_at BEFORE UPDATE ON api_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_service_subscriptions_updated_at BEFORE UPDATE ON tenant_service_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_resource_usage_updated_at BEFORE UPDATE ON tenant_resource_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_queue_updated_at BEFORE UPDATE ON message_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cache_entries_updated_at BEFORE UPDATE ON cache_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Service heartbeat function
CREATE OR REPLACE FUNCTION update_service_heartbeat(
    p_instance_id VARCHAR(255),
    p_status VARCHAR(20) DEFAULT 'healthy'
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE service_registry 
    SET 
        last_heartbeat = NOW(),
        status = p_status,
        updated_at = NOW()
    WHERE instance_id = p_instance_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache_entries 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get service health status
CREATE OR REPLACE FUNCTION get_service_health_status(p_service_name VARCHAR(255))
RETURNS TABLE(
    service_name VARCHAR(255),
    healthy_instances INTEGER,
    total_instances INTEGER,
    health_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_service_name,
        COUNT(*) FILTER (WHERE status = 'healthy')::INTEGER as healthy_instances,
        COUNT(*)::INTEGER as total_instances,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'healthy')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as health_percentage
    FROM service_registry 
    WHERE service_name = p_service_name
    AND last_heartbeat > NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Service registry indexes
CREATE INDEX IF NOT EXISTS idx_service_registry_name_status ON service_registry (service_name, status);
CREATE INDEX IF NOT EXISTS idx_service_registry_heartbeat ON service_registry (last_heartbeat DESC);

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_configurations_key_env_tenant ON configurations (key, environment, tenant_id);
CREATE INDEX IF NOT EXISTS idx_configurations_service ON configurations (service_name) WHERE service_name IS NOT NULL;

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key_env ON feature_flags (key, environment);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags (enabled, environment) WHERE enabled = true;

-- API routes indexes
CREATE INDEX IF NOT EXISTS idx_api_routes_path_method ON api_routes (path, method, enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_api_routes_service ON api_routes (service_name, enabled) WHERE enabled = true;

-- Message queue indexes
CREATE INDEX IF NOT EXISTS idx_message_queue_processing ON message_queue (queue_name, status, priority DESC, created_at) WHERE status IN ('pending', 'processing');

-- ================================================
-- HEALTH CHECK TABLE
-- ================================================

-- Simple health check table for monitoring
CREATE TABLE IF NOT EXISTS health_check (
    id INTEGER PRIMARY KEY DEFAULT 1,
    status VARCHAR(20) DEFAULT 'healthy',
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (id = 1)
);

INSERT INTO health_check (id, status) VALUES (1, 'healthy') ON CONFLICT (id) DO NOTHING;

-- ================================================
-- INITIAL DATA
-- ================================================

-- Insert default configurations
INSERT INTO configurations (key, value, type, environment, description) VALUES
('api.gateway.timeout', '30000', 'number', 'production', 'Default API gateway timeout in milliseconds'),
('api.gateway.rate_limit', '1000', 'number', 'production', 'Default rate limit requests per minute'),
('monitoring.metrics_retention_days', '90', 'number', 'production', 'How long to keep metrics data'),
('monitoring.logs_retention_days', '30', 'number', 'production', 'How long to keep log data'),
('cache.default_ttl', '300', 'number', 'production', 'Default cache TTL in seconds'),
('security.jwt_expiry', '3600', 'number', 'production', 'JWT token expiry in seconds')
ON CONFLICT (key, environment, tenant_id) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, enabled, environment, description) VALUES
('microservices.enabled', true, 'production', 'Enable microservices architecture'),
('monitoring.detailed_logging', false, 'production', 'Enable detailed request/response logging'),
('api.rate_limiting', true, 'production', 'Enable API rate limiting'),
('cache.distributed', true, 'production', 'Enable distributed caching'),
('events.async_processing', true, 'production', 'Enable asynchronous event processing')
ON CONFLICT (key, environment) DO NOTHING;