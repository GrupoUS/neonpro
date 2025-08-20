-- scripts/07-performance-metrics.sql
-- Performance monitoring tables for NeonPro

-- 1. Performance metrics table for Core Web Vitals tracking
CREATE TABLE public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Core Web Vitals metrics
    lcp DECIMAL(10,3) NOT NULL, -- Largest Contentful Paint (seconds)
    fid DECIMAL(10,3) NOT NULL, -- First Input Delay (milliseconds)
    cls DECIMAL(10,3) NOT NULL, -- Cumulative Layout Shift (score)
    fcp DECIMAL(10,3) NOT NULL, -- First Contentful Paint (seconds)
    ttfb DECIMAL(10,3) NOT NULL, -- Time to First Byte (milliseconds)
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100), -- Overall performance score
    
    -- Context information
    page TEXT NOT NULL, -- Page URL or identifier
    user_agent TEXT, -- Browser user agent
    connection TEXT, -- Connection type (4g, 3g, wifi, etc.)
    device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance alerts table for monitoring degradations
CREATE TABLE public.performance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    
    -- Alert information
    alerts JSONB NOT NULL, -- Array of alert messages
    metrics_snapshot JSONB NOT NULL, -- Snapshot of metrics that triggered alert
    severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    
    -- Resolution tracking
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on performance tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for performance_metrics
CREATE POLICY "Users can view metrics from their clinic" ON public.performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.clinic_id = performance_metrics.clinic_id
        )
    );

CREATE POLICY "Users can insert metrics for their clinic" ON public.performance_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.clinic_id = performance_metrics.clinic_id
        )
    );

-- 5. RLS policies for performance_alerts  
CREATE POLICY "Users can view alerts from their clinic" ON public.performance_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.clinic_id = performance_alerts.clinic_id
        )
    );

CREATE POLICY "Users can insert alerts for their clinic" ON public.performance_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.clinic_id = performance_alerts.clinic_id
        )
    );

CREATE POLICY "Users can update alerts from their clinic" ON public.performance_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.clinic_id = performance_alerts.clinic_id
        )
    );

-- 6. Indexes for performance optimization
CREATE INDEX idx_performance_metrics_clinic_created ON public.performance_metrics(clinic_id, created_at DESC);
CREATE INDEX idx_performance_metrics_page ON public.performance_metrics(page);
CREATE INDEX idx_performance_metrics_score ON public.performance_metrics(score);
CREATE INDEX idx_performance_metrics_user_created ON public.performance_metrics(user_id, created_at DESC);

CREATE INDEX idx_performance_alerts_clinic ON public.performance_alerts(clinic_id, resolved_at);
CREATE INDEX idx_performance_alerts_severity ON public.performance_alerts(severity, created_at DESC);
CREATE INDEX idx_performance_alerts_unresolved ON public.performance_alerts(clinic_id) WHERE resolved_at IS NULL;

-- 7. View for performance analytics (aggregated metrics)
CREATE VIEW public.performance_analytics AS
SELECT 
    clinic_id,
    page,
    device_type,
    DATE_TRUNC('day', created_at) as date,
    
    -- Average metrics
    ROUND(AVG(lcp)::numeric, 3) as avg_lcp,
    ROUND(AVG(fid)::numeric, 3) as avg_fid,
    ROUND(AVG(cls)::numeric, 3) as avg_cls,
    ROUND(AVG(fcp)::numeric, 3) as avg_fcp,
    ROUND(AVG(ttfb)::numeric, 3) as avg_ttfb,
    ROUND(AVG(score)::numeric, 0) as avg_score,
    
    -- Performance distribution
    COUNT(*) as total_measurements,
    COUNT(*) FILTER (WHERE score >= 90) as excellent_count,
    COUNT(*) FILTER (WHERE score >= 70 AND score < 90) as good_count,
    COUNT(*) FILTER (WHERE score < 70) as poor_count,
    
    -- Percentiles for better insights
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY score) as median_score,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score) as p75_score,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY score) as p95_score

FROM public.performance_metrics
GROUP BY clinic_id, page, device_type, DATE_TRUNC('day', created_at);

-- 8. Function to calculate performance trends
CREATE OR REPLACE FUNCTION public.get_performance_trends(
    p_clinic_id UUID,
    p_days INTEGER DEFAULT 30,
    p_page TEXT DEFAULT NULL
)
RETURNS TABLE (
    metric_name TEXT,
    current_avg DECIMAL,
    previous_avg DECIMAL,
    trend_direction TEXT,
    percentage_change DECIMAL
) LANGUAGE plpgsql AS $$
DECLARE
    current_period_start DATE := CURRENT_DATE - INTERVAL '1 day' * (p_days / 2);
    previous_period_start DATE := CURRENT_DATE - INTERVAL '1 day' * p_days;
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            AVG(lcp) as avg_lcp,
            AVG(fid) as avg_fid,
            AVG(cls) as avg_cls,
            AVG(fcp) as avg_fcp,
            AVG(ttfb) as avg_ttfb,
            AVG(score) as avg_score
        FROM public.performance_metrics 
        WHERE clinic_id = p_clinic_id 
        AND created_at >= current_period_start
        AND (p_page IS NULL OR page = p_page)
    ),
    previous_metrics AS (
        SELECT 
            AVG(lcp) as avg_lcp,
            AVG(fid) as avg_fid,
            AVG(cls) as avg_cls,
            AVG(fcp) as avg_fcp,
            AVG(ttfb) as avg_ttfb,
            AVG(score) as avg_score
        FROM public.performance_metrics 
        WHERE clinic_id = p_clinic_id 
        AND created_at >= previous_period_start 
        AND created_at < current_period_start
        AND (p_page IS NULL OR page = p_page)
    )
    SELECT 
        metric::TEXT,
        current_val::DECIMAL,
        previous_val::DECIMAL,
        CASE 
            WHEN current_val > previous_val THEN 
                CASE WHEN metric = 'score' THEN 'improving' ELSE 'degrading' END
            WHEN current_val < previous_val THEN 
                CASE WHEN metric = 'score' THEN 'degrading' ELSE 'improving' END
            ELSE 'stable'
        END::TEXT,
        CASE 
            WHEN previous_val > 0 THEN 
                ROUND(((current_val - previous_val) / previous_val * 100)::numeric, 2)
            ELSE 0
        END::DECIMAL
    FROM (
        SELECT 'lcp' as metric, c.avg_lcp as current_val, p.avg_lcp as previous_val FROM current_metrics c, previous_metrics p
        UNION ALL
        SELECT 'fid' as metric, c.avg_fid as current_val, p.avg_fid as previous_val FROM current_metrics c, previous_metrics p
        UNION ALL
        SELECT 'cls' as metric, c.avg_cls as current_val, p.avg_cls as previous_val FROM current_metrics c, previous_metrics p
        UNION ALL
        SELECT 'fcp' as metric, c.avg_fcp as current_val, p.avg_fcp as previous_val FROM current_metrics c, previous_metrics p
        UNION ALL
        SELECT 'ttfb' as metric, c.avg_ttfb as current_val, p.avg_ttfb as previous_val FROM current_metrics c, previous_metrics p
        UNION ALL
        SELECT 'score' as metric, c.avg_score as current_val, p.avg_score as previous_val FROM current_metrics c, previous_metrics p
    ) trends;
END;
$$;

-- 9. Grant permissions for performance monitoring
GRANT SELECT, INSERT ON public.performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.performance_alerts TO authenticated;
GRANT SELECT ON public.performance_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_trends TO authenticated;

-- 10. Comments for documentation
COMMENT ON TABLE public.performance_metrics IS 'Stores Core Web Vitals and performance metrics for each page visit';
COMMENT ON TABLE public.performance_alerts IS 'Tracks performance degradation alerts and their resolution status';
COMMENT ON VIEW public.performance_analytics IS 'Aggregated performance metrics for analytics and reporting';
COMMENT ON FUNCTION public.get_performance_trends IS 'Calculates performance trends over specified time periods';

-- Performance monitoring setup complete!