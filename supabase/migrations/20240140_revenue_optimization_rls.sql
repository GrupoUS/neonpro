-- Migration: Revenue Optimization RLS Policies (Fixed)
-- Description: Apply RLS policies for revenue optimization tables using correct table relationships

-- 🔥 RLS POLICIES FOR REVENUE_OPTIMIZATIONS
CREATE POLICY "Users can view revenue optimizations for their clinic" ON public.revenue_optimizations 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can insert revenue optimizations for their clinic" ON public.revenue_optimizations 
    FOR INSERT TO authenticated
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update revenue optimizations for their clinic" ON public.revenue_optimizations 
    FOR UPDATE TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 RLS POLICIES FOR PRICING_STRATEGIES
CREATE POLICY "Users can view pricing strategies for their clinic" ON public.pricing_strategies 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage pricing strategies for their clinic" ON public.pricing_strategies 
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 RLS POLICIES FOR CUSTOMER_LIFETIME_VALUE
CREATE POLICY "Users can view CLV for their clinic" ON public.customer_lifetime_value 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage CLV for their clinic" ON public.customer_lifetime_value 
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 RLS POLICIES FOR REVENUE_ANALYTICS
CREATE POLICY "Users can view revenue analytics for their clinic" ON public.revenue_analytics 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage revenue analytics for their clinic" ON public.revenue_analytics 
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 RLS POLICIES FOR COMPETITIVE_ANALYSIS
CREATE POLICY "Users can view competitive analysis for their clinic" ON public.competitive_analysis 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage competitive analysis for their clinic" ON public.competitive_analysis 
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 RLS POLICIES FOR SALES_OPPORTUNITIES
CREATE POLICY "Users can view sales opportunities for their clinic" ON public.sales_opportunities 
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage sales opportunities for their clinic" ON public.sales_opportunities 
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.professionals 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 🔥 ENABLE RLS FOR ALL TABLES
ALTER TABLE public.revenue_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_lifetime_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_opportunities ENABLE ROW LEVEL SECURITY;

-- 📊 VERIFY CONFIGURATION
COMMENT ON TABLE public.revenue_optimizations IS 
    'Revenue optimization engine with intelligent pricing strategies and predictive analytics - RLS enabled';
COMMENT ON TABLE public.pricing_strategies IS 
    'Dynamic pricing strategies with demand-based and competitive analysis - RLS enabled';
COMMENT ON TABLE public.customer_lifetime_value IS 
    'Customer lifetime value calculations and predictions - RLS enabled';
COMMENT ON TABLE public.revenue_analytics IS 
    'Revenue analytics with aggregated metrics and performance indicators - RLS enabled';
COMMENT ON TABLE public.competitive_analysis IS 
    'Competitive analysis data and benchmarking - RLS enabled';
COMMENT ON TABLE public.sales_opportunities IS 
    'Sales opportunities identification and tracking - RLS enabled';