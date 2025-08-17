-- Story 11.2: No-Show Prediction System Migration
-- Creates tables for no-show prediction with ≥80% accuracy
-- Date: 2025-08-01

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.no_show_analytics CASCADE;
DROP TABLE IF EXISTS public.intervention_strategies CASCADE;
DROP TABLE IF EXISTS public.risk_factors CASCADE;
DROP TABLE IF EXISTS public.no_show_predictions CASCADE;

-- Create no_show_predictions table
CREATE TABLE public.no_show_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    risk_score DECIMAL(5,4) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    prediction_confidence DECIMAL(5,4) NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
    prediction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    factors_analyzed JSONB NOT NULL DEFAULT '{}',
    intervention_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    actual_outcome TEXT CHECK (actual_outcome IN ('attended', 'no_show', 'cancelled', 'rescheduled')),
    prediction_accuracy DECIMAL(5,4),
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create risk_factors table
CREATE TABLE public.risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    factor_type TEXT NOT NULL CHECK (factor_type IN (
        'historical_attendance', 'appointment_timing', 'demographics',
        'communication_response', 'weather_sensitivity', 'distance_travel',
        'appointment_type', 'day_of_week', 'season', 'confirmation_pattern'
    )),
    factor_value DECIMAL(10,4) NOT NULL,
    weight_score DECIMAL(5,4) NOT NULL CHECK (weight_score >= 0 AND weight_score <= 1),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculation_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create intervention_strategies table
CREATE TABLE public.intervention_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES public.no_show_predictions(id) ON DELETE CASCADE,
    intervention_type TEXT NOT NULL CHECK (intervention_type IN (
        'targeted_reminder', 'confirmation_request', 'incentive_offer',
        'flexible_rescheduling', 'personal_call', 'priority_booking'
    )),
    trigger_time TIMESTAMPTZ NOT NULL,
    executed_at TIMESTAMPTZ,
    effectiveness_score DECIMAL(5,4),
    intervention_details JSONB DEFAULT '{}',
    result_outcome TEXT CHECK (result_outcome IN ('successful', 'failed', 'no_response')),
    cost_impact DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create no_show_analytics table
CREATE TABLE public.no_show_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    predicted_no_shows INTEGER NOT NULL DEFAULT 0,
    actual_no_shows INTEGER NOT NULL DEFAULT 0,
    accuracy_rate DECIMAL(5,4) NOT NULL CHECK (accuracy_rate >= 0 AND accuracy_rate <= 1),
    cost_impact DECIMAL(12,2) NOT NULL DEFAULT 0,
    revenue_recovered DECIMAL(12,2) NOT NULL DEFAULT 0,
    interventions_executed INTEGER NOT NULL DEFAULT 0,
    model_performance_metrics JSONB DEFAULT '{}',
    clinic_id UUID REFERENCES public.clinics(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(date, clinic_id)
);

-- Create indexes for performance
CREATE INDEX idx_no_show_predictions_appointment ON public.no_show_predictions(appointment_id);
CREATE INDEX idx_no_show_predictions_patient ON public.no_show_predictions(patient_id);
CREATE INDEX idx_no_show_predictions_date ON public.no_show_predictions(prediction_date);
CREATE INDEX idx_no_show_predictions_risk_score ON public.no_show_predictions(risk_score DESC);

CREATE INDEX idx_risk_factors_patient ON public.risk_factors(patient_id);
CREATE INDEX idx_risk_factors_type ON public.risk_factors(factor_type);
CREATE INDEX idx_risk_factors_updated ON public.risk_factors(last_updated DESC);

CREATE INDEX idx_intervention_strategies_prediction ON public.intervention_strategies(prediction_id);
CREATE INDEX idx_intervention_strategies_type ON public.intervention_strategies(intervention_type);
CREATE INDEX idx_intervention_strategies_trigger ON public.intervention_strategies(trigger_time);

CREATE INDEX idx_no_show_analytics_date ON public.no_show_analytics(date DESC);
CREATE INDEX idx_no_show_analytics_accuracy ON public.no_show_analytics(accuracy_rate DESC);

-- Create RLS policies
ALTER TABLE public.no_show_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_show_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for no_show_predictions
CREATE POLICY "Users can view their own clinic's no-show predictions" ON public.no_show_predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = appointment_id 
            AND a.clinic_id IN (
                SELECT clinic_id FROM public.user_dashboard_preferences 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Authorized users can insert no-show predictions" ON public.no_show_predictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Authorized users can update no-show predictions" ON public.no_show_predictions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

-- RLS Policies for risk_factors
CREATE POLICY "Users can view their clinic's risk factors" ON public.risk_factors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id 
            AND p.clinic_id IN (
                SELECT clinic_id FROM public.user_dashboard_preferences 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Authorized users can manage risk factors" ON public.risk_factors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

-- RLS Policies for intervention_strategies
CREATE POLICY "Users can view their clinic's intervention strategies" ON public.intervention_strategies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.no_show_predictions nsp
            JOIN public.appointments a ON nsp.appointment_id = a.id
            WHERE nsp.id = prediction_id 
            AND a.clinic_id IN (
                SELECT clinic_id FROM public.user_dashboard_preferences 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Authorized users can manage intervention strategies" ON public.intervention_strategies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

-- RLS Policies for no_show_analytics
CREATE POLICY "Users can view their clinic's no-show analytics" ON public.no_show_analytics
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.user_dashboard_preferences 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authorized users can manage no-show analytics" ON public.no_show_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_show_predictions_updated_at
    BEFORE UPDATE ON public.no_show_predictions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER intervention_strategies_updated_at
    BEFORE UPDATE ON public.intervention_strategies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER no_show_analytics_updated_at
    BEFORE UPDATE ON public.no_show_analytics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function for calculating prediction accuracy
CREATE OR REPLACE FUNCTION public.calculate_prediction_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate accuracy when actual_outcome is set
    IF NEW.actual_outcome IS NOT NULL AND OLD.actual_outcome IS NULL THEN
        -- Accuracy based on how close the prediction was
        IF (NEW.risk_score >= 0.5 AND NEW.actual_outcome = 'no_show') OR 
           (NEW.risk_score < 0.5 AND NEW.actual_outcome IN ('attended', 'rescheduled')) THEN
            NEW.prediction_accuracy = 1.0 - ABS(NEW.risk_score - 
                CASE WHEN NEW.actual_outcome = 'no_show' THEN 1.0 ELSE 0.0 END);
        ELSE
            NEW.prediction_accuracy = ABS(NEW.risk_score - 
                CASE WHEN NEW.actual_outcome = 'no_show' THEN 1.0 ELSE 0.0 END);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_prediction_accuracy_trigger
    BEFORE UPDATE ON public.no_show_predictions
    FOR EACH ROW EXECUTE FUNCTION public.calculate_prediction_accuracy();

-- Insert sample data for testing (optional)
INSERT INTO public.no_show_analytics (date, predicted_no_shows, actual_no_shows, accuracy_rate, cost_impact)
VALUES 
    (CURRENT_DATE - INTERVAL '1 day', 5, 4, 0.85, 1200.00),
    (CURRENT_DATE - INTERVAL '2 days', 3, 3, 0.90, 0.00),
    (CURRENT_DATE - INTERVAL '3 days', 7, 6, 0.82, 800.00);

COMMENT ON TABLE public.no_show_predictions IS 'ML-based no-show predictions with ≥80% accuracy requirement';
COMMENT ON TABLE public.risk_factors IS 'Multi-factor risk analysis for no-show prediction';
COMMENT ON TABLE public.intervention_strategies IS 'Proactive interventions for high-risk appointments';
COMMENT ON TABLE public.no_show_analytics IS 'Performance tracking and model accuracy analytics';