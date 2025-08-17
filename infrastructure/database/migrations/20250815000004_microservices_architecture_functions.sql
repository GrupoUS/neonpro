-- ================================================
-- MICROSERVICES ARCHITECTURE FUNCTIONS
-- Database functions for supporting microservices infrastructure
-- Story 4.2: Enterprise Architecture & Scalability
-- ================================================

-- ================================================
-- SERVICE DISCOVERY FUNCTIONS
-- ================================================

-- Register a new service instance
CREATE OR REPLACE FUNCTION register_service_instance(
    p_service_name VARCHAR(255),
    p_service_version VARCHAR(50),
    p_instance_id VARCHAR(255),
    p_host VARCHAR(255),
    p_port INTEGER,
    p_protocol VARCHAR(10) DEFAULT 'http',
    p_health_check_url VARCHAR(500) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_tags JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    service_id UUID;
BEGIN
    INSERT INTO service_registry (
        service_name, service_version, instance_id, host, port, 
        protocol, health_check_url, metadata, tags, status
    ) VALUES (
        p_service_name, p_service_version, p_instance_id, p_host, p_port,
        p_protocol, p_health_check_url, p_metadata, p_tags, 'healthy'
    )
    ON CONFLICT (instance_id) 
    DO UPDATE SET
        service_name = EXCLUDED.service_name,
        service_version = EXCLUDED.service_version,
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        protocol = EXCLUDED.protocol,
        health_check_url = EXCLUDED.health_check_url,
        metadata = EXCLUDED.metadata,
        tags = EXCLUDED.tags,
        last_heartbeat = NOW(),
        updated_at = NOW()
    RETURNING id INTO service_id;
    
    RETURN service_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Discover service instances
CREATE OR REPLACE FUNCTION discover_service_instances(
    p_service_name VARCHAR(255),
    p_status VARCHAR(20) DEFAULT NULL,
    p_max_age_minutes INTEGER DEFAULT 5
)
RETURNS TABLE(
    instance_id VARCHAR(255),
    host VARCHAR(255),
    port INTEGER,
    protocol VARCHAR(10),
    health_check_url VARCHAR(500),
    status VARCHAR(20),
    metadata JSONB,
    tags JSONB,
    last_heartbeat TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.instance_id,
        sr.host,
        sr.port,
        sr.protocol,
        sr.health_check_url,
        sr.status,
        sr.metadata,
        sr.tags,
        sr.last_heartbeat
    FROM service_registry sr
    WHERE sr.service_name = p_service_name
    AND (p_status IS NULL OR sr.status = p_status)
    AND sr.last_heartbeat > NOW() - (p_max_age_minutes || ' minutes')::INTERVAL
    ORDER BY sr.last_heartbeat DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deregister service instance
CREATE OR REPLACE FUNCTION deregister_service_instance(p_instance_id VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM service_registry WHERE instance_id = p_instance_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update service health status
CREATE OR REPLACE FUNCTION update_service_health(
    p_instance_id VARCHAR(255),
    p_status VARCHAR(20),
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE service_registry 
    SET 
        status = p_status,
        last_heartbeat = NOW(),
        updated_at = NOW(),
        metadata = COALESCE(p_metadata, metadata)
    WHERE instance_id = p_instance_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get service dependencies
CREATE OR REPLACE FUNCTION get_service_dependencies(p_service_name VARCHAR(255))
RETURNS TABLE(
    depends_on VARCHAR(255),
    dependency_type VARCHAR(50),
    timeout_ms INTEGER,
    retry_policy JSONB,
    circuit_breaker JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sd.depends_on,
        sd.dependency_type,
        sd.timeout_ms,
        sd.retry_policy,
        sd.circuit_breaker
    FROM service_dependencies sd
    WHERE sd.service_name = p_service_name
    ORDER BY sd.dependency_type, sd.depends_on;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- CONFIGURATION MANAGEMENT FUNCTIONS
-- ================================================

-- Get configuration value with fallback
CREATE OR REPLACE FUNCTION get_configuration_value(
    p_key VARCHAR(255),
    p_environment VARCHAR(50) DEFAULT 'production',
    p_tenant_id UUID DEFAULT NULL,
    p_service_name VARCHAR(255) DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    config_value TEXT;
BEGIN
    -- Try tenant-specific configuration first
    IF p_tenant_id IS NOT NULL THEN
        SELECT value INTO config_value
        FROM configurations
        WHERE key = p_key 
        AND environment = p_environment
        AND tenant_id = p_tenant_id
        AND (p_service_name IS NULL OR service_name = p_service_name OR service_name IS NULL)
        ORDER BY service_name NULLS LAST
        LIMIT 1;
        
        IF config_value IS NOT NULL THEN
            RETURN config_value;
        END IF;
    END IF;
    
    -- Fallback to global configuration
    SELECT value INTO config_value
    FROM configurations
    WHERE key = p_key 
    AND environment = p_environment
    AND tenant_id IS NULL
    AND (p_service_name IS NULL OR service_name = p_service_name OR service_name IS NULL)
    ORDER BY service_name NULLS LAST
    LIMIT 1;
    
    RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set configuration value
CREATE OR REPLACE FUNCTION set_configuration_value(
    p_key VARCHAR(255),
    p_value TEXT,
    p_type VARCHAR(20),
    p_environment VARCHAR(50) DEFAULT 'production',
    p_tenant_id UUID DEFAULT NULL,
    p_service_name VARCHAR(255) DEFAULT NULL,
    p_is_secret BOOLEAN DEFAULT FALSE,
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    config_id UUID;
BEGIN
    INSERT INTO configurations (
        key, value, type, environment, tenant_id, service_name, 
        is_secret, description, created_by
    ) VALUES (
        p_key, p_value, p_type, p_environment, p_tenant_id, p_service_name,
        p_is_secret, p_description, p_created_by
    )
    ON CONFLICT (key, environment, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID))
    DO UPDATE SET
        value = EXCLUDED.value,
        type = EXCLUDED.type,
        service_name = EXCLUDED.service_name,
        is_secret = EXCLUDED.is_secret,
        description = EXCLUDED.description,
        version = configurations.version + 1,
        updated_at = NOW()
    RETURNING id INTO config_id;
    
    RETURN config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(
    p_feature_key VARCHAR(255),
    p_environment VARCHAR(50) DEFAULT 'production',
    p_tenant_id UUID DEFAULT NULL,
    p_user_roles JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    flag_record feature_flags%ROWTYPE;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
    is_enabled BOOLEAN := FALSE;
BEGIN
    SELECT * INTO flag_record
    FROM feature_flags
    WHERE key = p_feature_key 
    AND environment = p_environment
    AND enabled = true;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check date range
    IF flag_record.start_date IS NOT NULL AND current_time < flag_record.start_date THEN
        RETURN FALSE;
    END IF;
    
    IF flag_record.end_date IS NOT NULL AND current_time > flag_record.end_date THEN
        RETURN FALSE;
    END IF;
    
    -- Check tenant restriction
    IF flag_record.tenant_ids IS NOT NULL AND jsonb_array_length(flag_record.tenant_ids) > 0 THEN
        IF p_tenant_id IS NULL OR NOT (flag_record.tenant_ids ? p_tenant_id::TEXT) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check role restriction
    IF flag_record.user_roles IS NOT NULL AND jsonb_array_length(flag_record.user_roles) > 0 THEN
        IF p_user_roles IS NULL THEN
            RETURN FALSE;
        END IF;
        
        -- Check if any user role matches
        IF NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(flag_record.user_roles) AS required_role
            WHERE flag_record.user_roles ? required_role
        ) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- MONITORING FUNCTIONS
-- ================================================

-- Record metrics batch
CREATE OR REPLACE FUNCTION record_metrics_batch(p_metrics JSONB)
RETURNS INTEGER AS $$
DECLARE
    metric_record JSONB;
    inserted_count INTEGER := 0;
BEGIN
    FOR metric_record IN SELECT * FROM jsonb_array_elements(p_metrics)
    LOOP
        INSERT INTO metrics (
            name, value, unit, tags, timestamp, source, tenant_id
        ) VALUES (
            metric_record->>'name',
            (metric_record->>'value')::DOUBLE PRECISION,
            COALESCE(metric_record->>'unit', 'count'),
            COALESCE(metric_record->'tags', '{}'::JSONB),
            COALESCE((metric_record->>'timestamp')::TIMESTAMP WITH TIME ZONE, NOW()),
            metric_record->>'source',
            NULLIF(metric_record->>'tenant_id', '')::UUID
        );
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get aggregated metrics
CREATE OR REPLACE FUNCTION get_aggregated_metrics(
    p_metric_name VARCHAR(255),
    p_source VARCHAR(255) DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '1 hour',
    p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    p_aggregation VARCHAR(20) DEFAULT 'avg' -- avg, sum, min, max, count
)
RETURNS TABLE(
    time_bucket TIMESTAMP WITH TIME ZONE,
    aggregated_value DOUBLE PRECISION,
    data_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    EXECUTE format('
        SELECT 
            date_trunc(''minute'', timestamp) as time_bucket,
            %s(value) as aggregated_value,
            count(*)::INTEGER as data_points
        FROM metrics
        WHERE name = $1
        AND ($2 IS NULL OR source = $2)
        AND ($3 IS NULL OR tenant_id = $3)
        AND timestamp BETWEEN $4 AND $5
        GROUP BY time_bucket
        ORDER BY time_bucket',
        CASE p_aggregation 
            WHEN 'sum' THEN 'sum'
            WHEN 'min' THEN 'min'
            WHEN 'max' THEN 'max'
            WHEN 'count' THEN 'count'
            ELSE 'avg'
        END
    )
    USING p_metric_name, p_source, p_tenant_id, p_start_time, p_end_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record log entries batch
CREATE OR REPLACE FUNCTION record_logs_batch(p_logs JSONB)
RETURNS INTEGER AS $$
DECLARE
    log_record JSONB;
    inserted_count INTEGER := 0;
BEGIN
    FOR log_record IN SELECT * FROM jsonb_array_elements(p_logs)
    LOOP
        INSERT INTO logs (
            level, message, service, operation, user_id, tenant_id,
            request_id, session_id, metadata, timestamp, stack, duration
        ) VALUES (
            log_record->>'level',
            log_record->>'message',
            log_record->>'service',
            log_record->>'operation',
            NULLIF(log_record->>'user_id', '')::UUID,
            NULLIF(log_record->>'tenant_id', '')::UUID,
            log_record->>'request_id',
            log_record->>'session_id',
            COALESCE(log_record->'metadata', '{}'::JSONB),
            COALESCE((log_record->>'timestamp')::TIMESTAMP WITH TIME ZONE, NOW()),
            log_record->>'stack',
            (log_record->>'duration')::DOUBLE PRECISION
        );
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- API GATEWAY FUNCTIONS
-- ================================================

-- Get API route configuration
CREATE OR REPLACE FUNCTION get_api_route(
    p_path VARCHAR(500),
    p_method VARCHAR(10),
    p_version VARCHAR(50) DEFAULT '1.0.0'
)
RETURNS TABLE(
    route_id UUID,
    service_name VARCHAR(255),
    target_path VARCHAR(500),
    timeout_ms INTEGER,
    rate_limit_requests INTEGER,
    rate_limit_window_ms INTEGER,
    authentication_required BOOLEAN,
    authorization_roles JSONB,
    cache_ttl_seconds INTEGER,
    retry_policy JSONB,
    circuit_breaker JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.id,
        ar.service_name,
        ar.target_path,
        ar.timeout_ms,
        ar.rate_limit_requests,
        ar.rate_limit_window_ms,
        ar.authentication_required,
        ar.authorization_roles,
        ar.cache_ttl_seconds,
        ar.retry_policy,
        ar.circuit_breaker
    FROM api_routes ar
    WHERE ar.path = p_path 
    AND ar.method = p_method
    AND ar.version = p_version
    AND ar.enabled = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier VARCHAR(255),
    p_identifier_type VARCHAR(50),
    p_route_id UUID,
    p_limit_requests INTEGER,
    p_limit_window_ms INTEGER
)
RETURNS TABLE(
    allowed BOOLEAN,
    remaining_requests INTEGER,
    reset_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_window_start TIMESTAMP WITH TIME ZONE;
    current_requests INTEGER := 0;
    rate_limit_record api_rate_limits%ROWTYPE;
BEGIN
    current_window_start := date_trunc('minute', NOW()) - 
        (EXTRACT(SECOND FROM NOW())::INTEGER % (p_limit_window_ms / 1000)) * INTERVAL '1 second';
    
    -- Get or create rate limit record
    SELECT * INTO rate_limit_record
    FROM api_rate_limits
    WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND route_id = p_route_id;
    
    IF FOUND THEN
        -- Check if we're in a new window
        IF rate_limit_record.window_start < current_window_start THEN
            -- Reset counter for new window
            UPDATE api_rate_limits
            SET 
                requests_count = 1,
                window_start = current_window_start,
                last_request = NOW(),
                blocked_until = NULL,
                updated_at = NOW()
            WHERE identifier = p_identifier
            AND identifier_type = p_identifier_type
            AND route_id = p_route_id;
            
            current_requests := 1;
        ELSE
            -- Increment counter in current window
            UPDATE api_rate_limits
            SET 
                requests_count = requests_count + 1,
                last_request = NOW(),
                updated_at = NOW()
            WHERE identifier = p_identifier
            AND identifier_type = p_identifier_type
            AND route_id = p_route_id
            RETURNING requests_count INTO current_requests;
        END IF;
    ELSE
        -- Create new rate limit record
        INSERT INTO api_rate_limits (
            identifier, identifier_type, route_id, requests_count, window_start, last_request
        ) VALUES (
            p_identifier, p_identifier_type, p_route_id, 1, current_window_start, NOW()
        );
        
        current_requests := 1;
    END IF;
    
    -- Check if limit exceeded
    IF current_requests > p_limit_requests THEN
        -- Block until next window
        UPDATE api_rate_limits
        SET blocked_until = current_window_start + (p_limit_window_ms / 1000) * INTERVAL '1 second'
        WHERE identifier = p_identifier
        AND identifier_type = p_identifier_type
        AND route_id = p_route_id;
        
        RETURN QUERY SELECT 
            false as allowed,
            0 as remaining_requests,
            current_window_start + (p_limit_window_ms / 1000) * INTERVAL '1 second' as reset_time;
    ELSE
        RETURN QUERY SELECT 
            true as allowed,
            (p_limit_requests - current_requests) as remaining_requests,
            current_window_start + (p_limit_window_ms / 1000) * INTERVAL '1 second' as reset_time;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log API request
CREATE OR REPLACE FUNCTION log_api_request(
    p_request_id VARCHAR(255),
    p_method VARCHAR(10),
    p_path VARCHAR(500),
    p_service_name VARCHAR(255),
    p_user_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_headers JSONB DEFAULT '{}',
    p_request_body JSONB DEFAULT NULL,
    p_response_status INTEGER DEFAULT NULL,
    p_response_headers JSONB DEFAULT '{}',
    p_response_body JSONB DEFAULT NULL,
    p_duration_ms DOUBLE PRECISION DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO api_request_logs (
        request_id, method, path, service_name, user_id, tenant_id,
        ip_address, user_agent, request_headers, request_body,
        response_status, response_headers, response_body,
        duration_ms, error_message
    ) VALUES (
        p_request_id, p_method, p_path, p_service_name, p_user_id, p_tenant_id,
        p_ip_address, p_user_agent, p_request_headers, p_request_body,
        p_response_status, p_response_headers, p_response_body,
        p_duration_ms, p_error_message
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- MULTI-TENANCY FUNCTIONS
-- ================================================

-- Check tenant service subscription
CREATE OR REPLACE FUNCTION check_tenant_service_access(
    p_tenant_id UUID,
    p_service_name VARCHAR(255),
    p_feature VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE(
    has_access BOOLEAN,
    plan VARCHAR(100),
    features JSONB,
    limits JSONB,
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    subscription_record tenant_service_subscriptions%ROWTYPE;
BEGIN
    SELECT * INTO subscription_record
    FROM tenant_service_subscriptions
    WHERE tenant_id = p_tenant_id
    AND service_name = p_service_name
    AND enabled = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false as has_access,
            NULL::VARCHAR(100) as plan,
            NULL::JSONB as features,
            NULL::JSONB as limits,
            NULL::TIMESTAMP WITH TIME ZONE as trial_expires_at,
            NULL::TIMESTAMP WITH TIME ZONE as subscription_expires_at;
        RETURN;
    END IF;
    
    -- Check if subscription is expired
    IF subscription_record.subscription_expires_at IS NOT NULL 
       AND subscription_record.subscription_expires_at < NOW() THEN
        RETURN QUERY SELECT 
            false as has_access,
            subscription_record.plan,
            subscription_record.features,
            subscription_record.limits,
            subscription_record.trial_expires_at,
            subscription_record.subscription_expires_at;
        RETURN;
    END IF;
    
    -- Check trial expiration
    IF subscription_record.trial_expires_at IS NOT NULL 
       AND subscription_record.trial_expires_at < NOW()
       AND subscription_record.subscription_expires_at IS NULL THEN
        RETURN QUERY SELECT 
            false as has_access,
            subscription_record.plan,
            subscription_record.features,
            subscription_record.limits,
            subscription_record.trial_expires_at,
            subscription_record.subscription_expires_at;
        RETURN;
    END IF;
    
    -- Check feature access
    IF p_feature IS NOT NULL AND subscription_record.features IS NOT NULL THEN
        IF NOT (subscription_record.features ? p_feature) THEN
            RETURN QUERY SELECT 
                false as has_access,
                subscription_record.plan,
                subscription_record.features,
                subscription_record.limits,
                subscription_record.trial_expires_at,
                subscription_record.subscription_expires_at;
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT 
        true as has_access,
        subscription_record.plan,
        subscription_record.features,
        subscription_record.limits,
        subscription_record.trial_expires_at,
        subscription_record.subscription_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track resource usage
CREATE OR REPLACE FUNCTION track_resource_usage(
    p_tenant_id UUID,
    p_service_name VARCHAR(255),
    p_resource_type VARCHAR(100),
    p_usage_amount DOUBLE PRECISION,
    p_usage_unit VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    period_start TIMESTAMP WITH TIME ZONE;
    period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current month period
    period_start := date_trunc('month', NOW());
    period_end := period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    INSERT INTO tenant_resource_usage (
        tenant_id, service_name, resource_type, usage_amount, 
        usage_unit, period_start, period_end
    ) VALUES (
        p_tenant_id, p_service_name, p_resource_type, p_usage_amount,
        p_usage_unit, period_start, period_end
    )
    ON CONFLICT (tenant_id, service_name, resource_type, period_start)
    DO UPDATE SET
        usage_amount = tenant_resource_usage.usage_amount + EXCLUDED.usage_amount,
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- EVENT SOURCING FUNCTIONS
-- ================================================

-- Append event to stream
CREATE OR REPLACE FUNCTION append_event(
    p_aggregate_id UUID,
    p_aggregate_type VARCHAR(255),
    p_event_type VARCHAR(255),
    p_event_data JSONB,
    p_metadata JSONB DEFAULT '{}',
    p_tenant_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL,
    p_causation_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    sequence_num BIGINT;
BEGIN
    INSERT INTO events (
        aggregate_id, aggregate_type, event_type, event_data, metadata,
        tenant_id, user_id, correlation_id, causation_id
    ) VALUES (
        p_aggregate_id, p_aggregate_type, p_event_type, p_event_data, p_metadata,
        p_tenant_id, p_user_id, p_correlation_id, p_causation_id
    )
    RETURNING sequence_number INTO sequence_num;
    
    RETURN sequence_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get events for aggregate
CREATE OR REPLACE FUNCTION get_aggregate_events(
    p_aggregate_id UUID,
    p_from_sequence BIGINT DEFAULT 0
)
RETURNS TABLE(
    sequence_number BIGINT,
    event_type VARCHAR(255),
    event_version INTEGER,
    event_data JSONB,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.sequence_number,
        e.event_type,
        e.event_version,
        e.event_data,
        e.metadata,
        e.timestamp
    FROM events e
    WHERE e.aggregate_id = p_aggregate_id
    AND e.sequence_number > p_from_sequence
    ORDER BY e.sequence_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- MESSAGE QUEUE FUNCTIONS
-- ================================================

-- Enqueue message
CREATE OR REPLACE FUNCTION enqueue_message(
    p_queue_name VARCHAR(255),
    p_message_type VARCHAR(255),
    p_payload JSONB,
    p_priority INTEGER DEFAULT 5,
    p_max_retries INTEGER DEFAULT 3,
    p_delay_seconds INTEGER DEFAULT 0,
    p_tenant_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    next_retry TIMESTAMP WITH TIME ZONE;
BEGIN
    IF p_delay_seconds > 0 THEN
        next_retry := NOW() + (p_delay_seconds || ' seconds')::INTERVAL;
    END IF;
    
    INSERT INTO message_queue (
        queue_name, message_type, payload, priority, max_retries,
        next_retry_at, tenant_id, user_id
    ) VALUES (
        p_queue_name, p_message_type, p_payload, p_priority, p_max_retries,
        next_retry, p_tenant_id, p_user_id
    )
    RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dequeue message
CREATE OR REPLACE FUNCTION dequeue_message(
    p_queue_name VARCHAR(255),
    p_worker_id VARCHAR(255)
)
RETURNS TABLE(
    message_id UUID,
    message_type VARCHAR(255),
    payload JSONB,
    retry_count INTEGER,
    max_retries INTEGER
) AS $$
DECLARE
    selected_message_id UUID;
BEGIN
    -- Select and lock the next available message
    SELECT id INTO selected_message_id
    FROM message_queue
    WHERE queue_name = p_queue_name
    AND status = 'pending'
    AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY priority DESC, created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF selected_message_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Update status to processing
    UPDATE message_queue
    SET 
        status = 'processing',
        updated_at = NOW()
    WHERE id = selected_message_id;
    
    -- Return message details
    RETURN QUERY
    SELECT 
        mq.id,
        mq.message_type,
        mq.payload,
        mq.retry_count,
        mq.max_retries
    FROM message_queue mq
    WHERE mq.id = selected_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark message as completed
CREATE OR REPLACE FUNCTION complete_message(p_message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE message_queue
    SET 
        status = 'completed',
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_message_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark message as failed
CREATE OR REPLACE FUNCTION fail_message(
    p_message_id UUID,
    p_error_message TEXT,
    p_retry_delay_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_retry_count INTEGER;
    max_retry_count INTEGER;
BEGIN
    SELECT retry_count, max_retries 
    INTO current_retry_count, max_retry_count
    FROM message_queue
    WHERE id = p_message_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Increment retry count
    current_retry_count := current_retry_count + 1;
    
    IF current_retry_count >= max_retry_count THEN
        -- Move to dead letter queue
        UPDATE message_queue
        SET 
            status = 'dead_letter',
            retry_count = current_retry_count,
            error_message = p_error_message,
            updated_at = NOW()
        WHERE id = p_message_id;
    ELSE
        -- Schedule for retry
        UPDATE message_queue
        SET 
            status = 'pending',
            retry_count = current_retry_count,
            error_message = p_error_message,
            next_retry_at = NOW() + (p_retry_delay_seconds || ' seconds')::INTERVAL,
            updated_at = NOW()
        WHERE id = p_message_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- CACHE FUNCTIONS
-- ================================================

-- Get cache value
CREATE OR REPLACE FUNCTION get_cache_value(p_key VARCHAR(500))
RETURNS JSONB AS $$
DECLARE
    cache_value JSONB;
BEGIN
    SELECT value INTO cache_value
    FROM cache_entries
    WHERE key = p_key
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF FOUND THEN
        -- Update access statistics
        UPDATE cache_entries
        SET 
            access_count = access_count + 1,
            last_accessed = NOW()
        WHERE key = p_key;
    END IF;
    
    RETURN cache_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set cache value
CREATE OR REPLACE FUNCTION set_cache_value(
    p_key VARCHAR(500),
    p_value JSONB,
    p_ttl_seconds INTEGER DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'
)
RETURNS BOOLEAN AS $$
DECLARE
    expires_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    IF p_ttl_seconds IS NOT NULL THEN
        expires_timestamp := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;
    END IF;
    
    INSERT INTO cache_entries (key, value, expires_at, tenant_id, tags)
    VALUES (p_key, p_value, expires_timestamp, p_tenant_id, p_tags)
    ON CONFLICT (key)
    DO UPDATE SET
        value = EXCLUDED.value,
        expires_at = EXCLUDED.expires_at,
        tenant_id = EXCLUDED.tenant_id,
        tags = EXCLUDED.tags,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete cache value
CREATE OR REPLACE FUNCTION delete_cache_value(p_key VARCHAR(500))
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM cache_entries WHERE key = p_key;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- CLEANUP FUNCTIONS
-- ================================================

-- Cleanup expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_entries()
RETURNS TABLE(
    cache_cleaned INTEGER,
    old_logs_cleaned INTEGER,
    old_metrics_cleaned INTEGER,
    dead_messages_cleaned INTEGER
) AS $$
DECLARE
    cache_count INTEGER;
    logs_count INTEGER;
    metrics_count INTEGER;
    messages_count INTEGER;
BEGIN
    -- Clean expired cache entries
    DELETE FROM cache_entries WHERE expires_at IS NOT NULL AND expires_at < NOW();
    GET DIAGNOSTICS cache_count = ROW_COUNT;
    
    -- Clean old logs (older than retention period)
    DELETE FROM logs 
    WHERE timestamp < NOW() - INTERVAL '30 days'; -- Default retention
    GET DIAGNOSTICS logs_count = ROW_COUNT;
    
    -- Clean old metrics (older than retention period)
    DELETE FROM metrics 
    WHERE timestamp < NOW() - INTERVAL '90 days'; -- Default retention
    GET DIAGNOSTICS metrics_count = ROW_COUNT;
    
    -- Clean old dead letter messages
    DELETE FROM message_queue 
    WHERE status = 'dead_letter' AND updated_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS messages_count = ROW_COUNT;
    
    RETURN QUERY SELECT cache_count, logs_count, metrics_count, messages_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- HEALTH CHECK FUNCTIONS
-- ================================================

-- Comprehensive system health check
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE(
    component VARCHAR(255),
    status VARCHAR(20),
    message TEXT,
    response_time_ms DOUBLE PRECISION
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
    db_status VARCHAR(20);
    service_count INTEGER;
    healthy_services INTEGER;
BEGIN
    -- Database connectivity check
    start_time := clock_timestamp();
    SELECT 'healthy' INTO db_status;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'database'::VARCHAR(255),
        db_status,
        'Database connectivity OK'::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Service registry health
    start_time := clock_timestamp();
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'healthy')
    INTO service_count, healthy_services
    FROM service_registry
    WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';
    
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'service_registry'::VARCHAR(255),
        CASE 
            WHEN service_count = 0 THEN 'unknown'
            WHEN healthy_services::FLOAT / service_count::FLOAT >= 0.8 THEN 'healthy'
            WHEN healthy_services::FLOAT / service_count::FLOAT >= 0.5 THEN 'degraded'
            ELSE 'unhealthy'
        END,
        format('Services: %s/%s healthy', healthy_services, service_count)::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Message queue health
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO service_count
    FROM message_queue
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
    
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'message_queue'::VARCHAR(255),
        CASE 
            WHEN service_count > 1000 THEN 'unhealthy'
            WHEN service_count > 100 THEN 'degraded'
            ELSE 'healthy'
        END,
        format('Pending messages: %s', service_count)::TEXT,
        EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;