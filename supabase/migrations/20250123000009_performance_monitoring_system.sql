-- Performance Metrics and Monitoring Tables
-- Migration for comprehensive performance tracking system

-- Performance metrics table for Web Vitals and custom metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    rating VARCHAR(20),
    delta DECIMAL(10,3),
    metric_id VARCHAR(100),
    navigation_type VARCHAR(20),
    entries JSONB DEFAULT '[]',
    url TEXT,
    user_agent TEXT,
    timestamp BIGINT NOT NULL DEFAULT EXTRACT(epoch FROM now()) * 1000,
    grade VARCHAR(20) CHECK (grade IN ('good', 'needs-improvement', 'poor')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(32),
    ip_address INET,
    country VARCHAR(10),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance alerts table for critical issues
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,3) NOT NULL,
    threshold DECIMAL(10,3) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT,
    severity VARCHAR(20) CHECK (severity IN ('warning', 'critical')) DEFAULT 'warning',
    timestamp BIGINT NOT NULL DEFAULT EXTRACT(epoch FROM now()) * 1000,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle analysis table for tracking build performance
CREATE TABLE IF NOT EXISTS bundle_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    build_id VARCHAR(50) NOT NULL,
    total_size BIGINT NOT NULL,
    gzipped_size BIGINT NOT NULL,
    chunk_count INTEGER NOT NULL,
    large_modules_count INTEGER DEFAULT 0,
    duplicates_count INTEGER DEFAULT 0,
    chunks JSONB DEFAULT '[]',
    large_modules JSONB DEFAULT '[]',
    duplicates JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) DEFAULT 'production',
    git_commit VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache performance metrics table
CREATE TABLE IF NOT EXISTS cache_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    hit_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,3) DEFAULT 0,
    last_hit TIMESTAMP WITH TIME ZONE,
    last_miss TIMESTAMP WITH TIME ZONE,
    cache_size BIGINT DEFAULT 0,
    ttl INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_grade ON performance_metrics(grade);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_composite ON performance_metrics(user_id, name, timestamp DESC);

-- Performance alerts indexes
CREATE INDEX IF NOT EXISTS idx_performance_alerts_user_id ON performance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_metric_name ON performance_alerts(metric_name);

-- Bundle analysis indexes
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_build_id ON bundle_analysis(build_id);
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_environment ON bundle_analysis(environment);
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_date ON bundle_analysis(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_git_commit ON bundle_analysis(git_commit);

-- Cache performance indexes
CREATE INDEX IF NOT EXISTS idx_cache_performance_key ON cache_performance(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_performance_hit_rate ON cache_performance(hit_rate DESC);
CREATE INDEX IF NOT EXISTS idx_cache_performance_updated ON cache_performance(updated_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_performance ENABLE ROW LEVEL SECURITY;

-- Performance metrics RLS policies
CREATE POLICY "Users can insert their own performance metrics" ON performance_metrics
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert performance metrics" ON performance_metrics
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- Performance alerts RLS policies
CREATE POLICY "Users can view their own performance alerts" ON performance_alerts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance alerts" ON performance_alerts
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own performance alerts" ON performance_alerts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Bundle analysis RLS policies (admin access only)
CREATE POLICY "Admin users can view bundle analysis" ON bundle_analysis
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert bundle analysis" ON bundle_analysis
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Cache performance RLS policies (admin access only)
CREATE POLICY "Admin users can view cache performance" ON cache_performance
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can manage cache performance" ON cache_performance
    FOR ALL TO service_role
    WITH CHECK (true);

-- Functions for performance analytics
-- Function to calculate performance scores
CREATE OR REPLACE FUNCTION calculate_performance_score(
    user_id_param UUID DEFAULT NULL,
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    metric_name TEXT,
    average_value DECIMAL,
    median_value DECIMAL,
    p95_value DECIMAL,
    good_percentage DECIMAL,
    needs_improvement_percentage DECIMAL,
    poor_percentage DECIMAL,
    total_measurements INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH metric_stats AS (
        SELECT 
            pm.name,
            AVG(pm.value) as avg_val,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pm.value) as median_val,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.value) as p95_val,
            COUNT(*) as total_count,
            COUNT(*) FILTER (WHERE pm.grade = 'good') as good_count,
            COUNT(*) FILTER (WHERE pm.grade = 'needs-improvement') as needs_improvement_count,
            COUNT(*) FILTER (WHERE pm.grade = 'poor') as poor_count
        FROM performance_metrics pm
        WHERE (user_id_param IS NULL OR pm.user_id = user_id_param)
            AND pm.timestamp >= EXTRACT(epoch FROM (NOW() - INTERVAL '1 hour' * time_range_hours)) * 1000
        GROUP BY pm.name
    )
    SELECT 
        ms.name::TEXT,
        ROUND(ms.avg_val, 3),
        ROUND(ms.median_val, 3),
        ROUND(ms.p95_val, 3),
        ROUND((ms.good_count::DECIMAL / ms.total_count) * 100, 2),
        ROUND((ms.needs_improvement_count::DECIMAL / ms.total_count) * 100, 2),
        ROUND((ms.poor_count::DECIMAL / ms.total_count) * 100, 2),
        ms.total_count::INTEGER
    FROM metric_stats ms
    ORDER BY ms.total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get performance trends
CREATE OR REPLACE FUNCTION get_performance_trends(
    user_id_param UUID DEFAULT NULL,
    metric_name_param TEXT DEFAULT NULL,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    date_bucket TIMESTAMP WITH TIME ZONE,
    metric_name TEXT,
    average_value DECIMAL,
    median_value DECIMAL,
    measurement_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('hour', TO_TIMESTAMP(pm.timestamp / 1000)) as date_bucket,
        pm.name::TEXT,
        ROUND(AVG(pm.value), 3),
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pm.value), 3),
        COUNT(*)::INTEGER
    FROM performance_metrics pm
    WHERE (user_id_param IS NULL OR pm.user_id = user_id_param)
        AND (metric_name_param IS NULL OR pm.name = metric_name_param)
        AND pm.timestamp >= EXTRACT(epoch FROM (NOW() - INTERVAL '1 day' * days_back)) * 1000
    GROUP BY date_bucket, pm.name
    ORDER BY date_bucket DESC, pm.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old performance data
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete performance metrics older than 90 days
    DELETE FROM performance_metrics 
    WHERE timestamp < EXTRACT(epoch FROM (NOW() - INTERVAL '90 days')) * 1000;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete resolved alerts older than 30 days
    DELETE FROM performance_alerts 
    WHERE resolved = true 
        AND resolved_at < NOW() - INTERVAL '30 days';
    
    -- Delete old bundle analyses (keep last 50)
    DELETE FROM bundle_analysis 
    WHERE id NOT IN (
        SELECT id FROM bundle_analysis 
        ORDER BY analysis_date DESC 
        LIMIT 50
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup function (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-performance-data', '0 2 * * *', 'SELECT cleanup_old_performance_data();');

-- Comments for documentation
COMMENT ON TABLE performance_metrics IS 'Stores Web Vitals and custom performance metrics';
COMMENT ON TABLE performance_alerts IS 'Stores critical performance issues requiring attention';
COMMENT ON TABLE bundle_analysis IS 'Stores bundle size analysis results from production builds';
COMMENT ON TABLE cache_performance IS 'Tracks cache hit rates and performance metrics';

COMMENT ON FUNCTION calculate_performance_score IS 'Calculates aggregated performance scores and percentages';
COMMENT ON FUNCTION get_performance_trends IS 'Returns performance trends over time';
COMMENT ON FUNCTION cleanup_old_performance_data IS 'Cleans up old performance data to maintain database performance';