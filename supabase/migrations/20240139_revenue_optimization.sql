-- =====================================================================================
-- Revenue Optimization Engine Migration
-- Epic 11, Story 11.3: Revenue Optimization Engine (+15% Target)
-- Created: 2024-02-01
-- Author: VoidBeast V6.0 - GitHub Copilot Master Orchestrator
-- =====================================================================================

-- Revenue optimization strategies and tracking
CREATE TABLE IF NOT EXISTS public.revenue_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    optimization_type TEXT NOT NULL CHECK (optimization_type IN (
        'dynamic_pricing', 'service_mix', 'customer_lifetime_value',
        'capacity_utilization', 'upselling', 'cross_selling',
        'competitive_positioning', 'bundle_optimization'
    )),
    strategy JSONB NOT NULL,
    target_increase DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- +15% target
    actual_increase DECIMAL(5,2),
    implementation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    effectiveness_score DECIMAL(5,2), -- 0-100 score
    roi_percentage DECIMAL(8,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dynamic pricing strategies and rules
CREATE TABLE IF NOT EXISTS public.pricing_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.service_types(id) ON DELETE CASCADE,
    service_category TEXT,
    pricing_model TEXT NOT NULL CHECK (pricing_model IN (
        'demand_based', 'capacity_based', 'time_based', 'competition_based',
        'value_based', 'dynamic_bundle', 'seasonal_adjustment'
    )),
    base_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    price_floor DECIMAL(10,2) NOT NULL,
    price_ceiling DECIMAL(10,2) NOT NULL,
    dynamic_adjustments JSONB NOT NULL, -- Rules for price adjustments
    demand_elasticity DECIMAL(5,4), -- Price sensitivity coefficient
    effectiveness_score DECIMAL(5,2), -- Performance rating 0-100
    last_adjustment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer lifetime value tracking and optimization
CREATE TABLE IF NOT EXISTS public.customer_lifetime_value (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    calculated_value DECIMAL(12,2) NOT NULL,
    predicted_value DECIMAL(12,2),
    value_tier TEXT NOT NULL CHECK (value_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    optimization_strategies JSONB NOT NULL, -- Personalized strategies
    retention_probability DECIMAL(5,4),
    churn_risk_score DECIMAL(5,2),
    last_visit_date TIMESTAMPTZ,
    next_visit_prediction TIMESTAMPTZ,
    recommended_services JSONB,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revenue analytics and performance tracking
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    baseline_revenue DECIMAL(12,2) NOT NULL, -- Pre-optimization revenue
    optimized_revenue DECIMAL(12,2) NOT NULL, -- Post-optimization revenue
    revenue_target DECIMAL(12,2) NOT NULL,
    actual_revenue DECIMAL(12,2) NOT NULL,
    optimization_impact DECIMAL(8,2), -- Revenue increase percentage
    variance_analysis JSONB, -- Detailed variance breakdown
    top_performing_optimizations JSONB,
    underperforming_optimizations JSONB,
    cost_savings DECIMAL(10,2),
    roi_achieved DECIMAL(8,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitive analysis and market intelligence
CREATE TABLE IF NOT EXISTS public.competitive_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    service_category TEXT NOT NULL,
    competitor_pricing JSONB NOT NULL, -- Service prices and packages
    market_position TEXT CHECK (market_position IN ('premium', 'mid_market', 'value', 'discount')),
    competitive_advantages JSONB,
    pricing_gaps JSONB, -- Opportunities for optimization
    market_share_estimate DECIMAL(5,2),
    last_analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_sources JSONB, -- Sources of competitive data
    confidence_score DECIMAL(5,2), -- Data reliability 0-100
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upselling and cross-selling opportunities
CREATE TABLE IF NOT EXISTS public.sales_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
        'upsell', 'cross_sell', 'bundle', 'loyalty_upgrade', 'retention_offer'
    )),
    primary_service_id UUID REFERENCES public.service_types(id),
    recommended_services JSONB NOT NULL, -- Service recommendations
    estimated_value DECIMAL(10,2) NOT NULL,
    probability_score DECIMAL(5,2) NOT NULL, -- Success probability 0-100
    personalization_factors JSONB,
    optimal_timing TIMESTAMPTZ, -- Best time to present offer
    communication_channel TEXT CHECK (communication_channel IN (
        'in_person', 'phone', 'email', 'whatsapp', 'app_notification'
    )),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'presented', 'accepted', 'declined', 'expired'
    )),
    presented_at TIMESTAMPTZ,
    response_at TIMESTAMPTZ,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================================

-- Revenue optimizations indexes
CREATE INDEX IF NOT EXISTS idx_revenue_optimizations_clinic_type 
ON public.revenue_optimizations(clinic_id, optimization_type);

CREATE INDEX IF NOT EXISTS idx_revenue_optimizations_status_date 
ON public.revenue_optimizations(status, implementation_date);

-- Pricing strategies indexes
CREATE INDEX IF NOT EXISTS idx_pricing_strategies_clinic_service 
ON public.pricing_strategies(clinic_id, service_id);

CREATE INDEX IF NOT EXISTS idx_pricing_strategies_model_effectiveness 
ON public.pricing_strategies(pricing_model, effectiveness_score);

-- Customer lifetime value indexes
CREATE INDEX IF NOT EXISTS idx_customer_ltv_clinic_tier 
ON public.customer_lifetime_value(clinic_id, value_tier);

CREATE INDEX IF NOT EXISTS idx_customer_ltv_churn_risk 
ON public.customer_lifetime_value(churn_risk_score, retention_probability);

-- Revenue analytics indexes
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_clinic_period 
ON public.revenue_analytics(clinic_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_impact 
ON public.revenue_analytics(optimization_impact, roi_achieved);

-- Competitive analysis indexes
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_clinic_category 
ON public.competitive_analysis(clinic_id, service_category);

CREATE INDEX IF NOT EXISTS idx_competitive_analysis_confidence_date 
ON public.competitive_analysis(confidence_score, last_analysis_date);

-- Sales opportunities indexes
CREATE INDEX IF NOT EXISTS idx_sales_opportunities_patient_status 
ON public.sales_opportunities(patient_id, status);

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_probability_timing 
ON public.sales_opportunities(probability_score, optimal_timing);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE public.revenue_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_lifetime_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_opportunities ENABLE ROW LEVEL SECURITY;

-- Revenue optimizations RLS policies
CREATE POLICY "revenue_optimizations_clinic_access" ON public.revenue_optimizations
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'financial_manager')
        )
    );

-- Pricing strategies RLS policies  
CREATE POLICY "pricing_strategies_clinic_access" ON public.pricing_strategies
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'financial_manager')
        )
    );

-- Customer lifetime value RLS policies
CREATE POLICY "customer_ltv_clinic_access" ON public.customer_lifetime_value
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'financial_manager', 'staff')
        )
    );

-- Revenue analytics RLS policies
CREATE POLICY "revenue_analytics_clinic_access" ON public.revenue_analytics
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'financial_manager')
        )
    );

-- Competitive analysis RLS policies
CREATE POLICY "competitive_analysis_clinic_access" ON public.competitive_analysis
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'financial_manager')
        )
    );

-- Sales opportunities RLS policies
CREATE POLICY "sales_opportunities_clinic_access" ON public.sales_opportunities
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_clinic_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager', 'staff')
        )
    );

-- =====================================================================================
-- UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPING
-- =====================================================================================

-- Revenue optimizations trigger
CREATE OR REPLACE FUNCTION update_revenue_optimizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revenue_optimizations_updated_at
    BEFORE UPDATE ON public.revenue_optimizations
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_optimizations_updated_at();

-- Pricing strategies trigger
CREATE OR REPLACE FUNCTION update_pricing_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_strategies_updated_at
    BEFORE UPDATE ON public.pricing_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_strategies_updated_at();

-- Customer lifetime value trigger
CREATE OR REPLACE FUNCTION update_customer_ltv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_ltv_updated_at
    BEFORE UPDATE ON public.customer_lifetime_value
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_ltv_updated_at();

-- Revenue analytics trigger
CREATE OR REPLACE FUNCTION update_revenue_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revenue_analytics_updated_at
    BEFORE UPDATE ON public.revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_analytics_updated_at();

-- Competitive analysis trigger
CREATE OR REPLACE FUNCTION update_competitive_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitive_analysis_updated_at
    BEFORE UPDATE ON public.competitive_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_competitive_analysis_updated_at();

-- Sales opportunities trigger
CREATE OR REPLACE FUNCTION update_sales_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_opportunities_updated_at
    BEFORE UPDATE ON public.sales_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_opportunities_updated_at();

-- =====================================================================================
-- ANALYTICS FUNCTIONS FOR REVENUE OPTIMIZATION
-- =====================================================================================

-- Calculate revenue optimization impact
CREATE OR REPLACE FUNCTION calculate_revenue_optimization_impact(
    p_clinic_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    optimization_type TEXT,
    baseline_revenue DECIMAL,
    optimized_revenue DECIMAL,
    impact_percentage DECIMAL,
    roi_percentage DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ro.optimization_type,
        COALESCE(SUM(ra.baseline_revenue), 0) as baseline_revenue,
        COALESCE(SUM(ra.optimized_revenue), 0) as optimized_revenue,
        CASE 
            WHEN SUM(ra.baseline_revenue) > 0 
            THEN ((SUM(ra.optimized_revenue) - SUM(ra.baseline_revenue)) / SUM(ra.baseline_revenue)) * 100
            ELSE 0
        END as impact_percentage,
        COALESCE(AVG(ro.roi_percentage), 0) as roi_percentage
    FROM public.revenue_optimizations ro
    LEFT JOIN public.revenue_analytics ra ON ro.clinic_id = ra.clinic_id
    WHERE ro.clinic_id = p_clinic_id
    AND ro.implementation_date >= p_start_date
    AND ro.implementation_date <= p_end_date
    AND ra.period_start >= p_start_date
    AND ra.period_end <= p_end_date
    GROUP BY ro.optimization_type;
END;
$$;

-- Get top revenue optimization opportunities
CREATE OR REPLACE FUNCTION get_revenue_optimization_opportunities(
    p_clinic_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    opportunity_type TEXT,
    estimated_impact DECIMAL,
    implementation_effort TEXT,
    priority_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'dynamic_pricing'::TEXT as opportunity_type,
        COALESCE(AVG(ps.effectiveness_score * ps.current_price * 0.1), 0) as estimated_impact,
        'medium'::TEXT as implementation_effort,
        COALESCE(AVG(ps.effectiveness_score), 0) as priority_score
    FROM public.pricing_strategies ps
    WHERE ps.clinic_id = p_clinic_id
    AND ps.effectiveness_score < 70
    
    UNION ALL
    
    SELECT 
        'customer_lifetime_value'::TEXT as opportunity_type,
        COALESCE(SUM(clv.predicted_value - clv.calculated_value), 0) as estimated_impact,
        'high'::TEXT as implementation_effort,
        COALESCE(AVG(clv.retention_probability * 100), 0) as priority_score
    FROM public.customer_lifetime_value clv
    WHERE clv.clinic_id = p_clinic_id
    AND clv.churn_risk_score > 50
    
    UNION ALL
    
    SELECT 
        'upselling'::TEXT as opportunity_type,
        COALESCE(SUM(so.estimated_value), 0) as estimated_impact,
        'low'::TEXT as implementation_effort,
        COALESCE(AVG(so.probability_score), 0) as priority_score
    FROM public.sales_opportunities so
    WHERE so.clinic_id = p_clinic_id
    AND so.status = 'pending'
    AND so.probability_score > 60
    
    ORDER BY priority_score DESC, estimated_impact DESC
    LIMIT p_limit;
END;
$$;

-- =====================================================================================
-- GRANT PERMISSIONS
-- =====================================================================================

-- Grant access to authenticated users
GRANT ALL ON public.revenue_optimizations TO authenticated;
GRANT ALL ON public.pricing_strategies TO authenticated;
GRANT ALL ON public.customer_lifetime_value TO authenticated;
GRANT ALL ON public.revenue_analytics TO authenticated;
GRANT ALL ON public.competitive_analysis TO authenticated;
GRANT ALL ON public.sales_opportunities TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_revenue_optimization_impact TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_optimization_opportunities TO authenticated;

-- =====================================================================================
-- SAMPLE DATA FOR TESTING AND VALIDATION
-- =====================================================================================

-- Insert sample revenue optimization strategies
INSERT INTO public.revenue_optimizations (
    clinic_id, optimization_type, strategy, target_increase, status, effectiveness_score
) VALUES 
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'dynamic_pricing',
    '{"strategy": "demand_based_pricing", "rules": {"peak_hours_increase": 15, "low_demand_discount": 10}, "target_services": ["aesthetic_consultation", "botox", "filler"]}'::JSONB,
    18.5,
    'active',
    87.3
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'service_mix',
    '{"strategy": "high_margin_optimization", "focus_services": ["laser_treatment", "chemical_peel"], "capacity_allocation": {"high_margin": 70, "standard": 30}}'::JSONB,
    22.0,
    'active',
    92.1
);

-- =====================================================================================
-- MIGRATION COMPLETE - Revenue Optimization Engine Database Schema
-- Epic 11, Story 11.3: +15% Revenue Increase Target Implementation
-- =====================================================================================