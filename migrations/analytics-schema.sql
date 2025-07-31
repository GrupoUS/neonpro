-- Analytics dashboard views for comprehensive reporting
-- Story 2.3: Analytics Dashboard & Reports - T1.3: Analytics Schema Migration

-- ============================================================================
-- APPOINTMENTS ANALYTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW analytics_appointments AS
SELECT 
    a.id,
    a.clinic_id,
    a.patient_id,
    a.professional_id,
    a.service_type_id,
    a.status,
    a.start_time,
    a.end_time,
    a.created_at,
    -- Derived date fields for easier analytics
    DATE(a.start_time) as appointment_date,
    EXTRACT(YEAR FROM a.start_time) as year,
    EXTRACT(MONTH FROM a.start_time) as month,
    EXTRACT(DAY FROM a.start_time) as day,
    EXTRACT(DOW FROM a.start_time) as day_of_week,
    EXTRACT(HOUR FROM a.start_time) as hour,
    -- Duration calculation
    EXTRACT(EPOCH FROM (a.end_time - a.start_time))/60 as duration_minutes,
    -- Business metrics
    CASE 
        WHEN a.status = 'completed' THEN 1 
        ELSE 0 
    END as is_completed,
    CASE 
        WHEN a.status = 'cancelled' THEN 1 
        ELSE 0 
    END as is_cancelled,
    CASE 
        WHEN a.status = 'no_show' THEN 1 
        ELSE 0 
    END as is_no_show,
    -- Time-based groupings
    DATE_TRUNC('week', a.start_time) as week_start,
    DATE_TRUNC('month', a.start_time) as month_start,
    DATE_TRUNC('quarter', a.start_time) as quarter_start
FROM appointments a
WHERE a.start_time IS NOT NULL;

-- ============================================================================
-- PATIENTS ANALYTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW analytics_patients AS
SELECT 
    p.id,
    p.clinic_id,
    p.created_at,
    DATE(p.created_at) as registration_date,
    EXTRACT(YEAR FROM p.created_at) as registration_year,
    EXTRACT(MONTH FROM p.created_at) as registration_month,
    DATE_TRUNC('month', p.created_at) as registration_month_start,
    DATE_TRUNC('quarter', p.created_at) as registration_quarter_start,
    -- Patient demographics (safely computed)
    EXTRACT(YEAR FROM AGE(COALESCE(p.birth_date, p.created_at))) as age_years,
    CASE 
        WHEN p.gender = 'female' THEN 'F'
        WHEN p.gender = 'male' THEN 'M'
        ELSE 'Other'
    END as gender_code,
    -- Geographic data
    COALESCE(p.city, 'Unknown') as city,
    COALESCE(p.state, 'Unknown') as state,
    -- Activity metrics (will need joins for full calculation)
    1 as patient_count
FROM patients p;

-- ============================================================================
-- FINANCIAL ANALYTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW analytics_financial AS
SELECT 
    f.id,
    f.clinic_id,
    f.patient_id,
    f.appointment_id,
    f.amount,
    f.payment_method,
    f.status as payment_status,
    f.created_at,
    DATE(f.created_at) as payment_date,
    EXTRACT(YEAR FROM f.created_at) as year,
    EXTRACT(MONTH FROM f.created_at) as month,
    EXTRACT(DAY FROM f.created_at) as day,
    DATE_TRUNC('week', f.created_at) as week_start,
    DATE_TRUNC('month', f.created_at) as month_start,
    DATE_TRUNC('quarter', f.created_at) as quarter_start,
    -- Business metrics
    CASE 
        WHEN f.status = 'paid' THEN f.amount 
        ELSE 0 
    END as revenue,
    CASE 
        WHEN f.status = 'pending' THEN f.amount 
        ELSE 0 
    END as pending_amount,
    CASE 
        WHEN f.status = 'cancelled' THEN f.amount 
        ELSE 0 
    END as cancelled_amount
FROM financial_transactions f
WHERE f.amount IS NOT NULL;

-- ============================================================================
-- ANALYTICS SUMMARY FUNCTIONS
-- ============================================================================

-- Appointment statistics by date range
CREATE OR REPLACE FUNCTION get_appointment_stats(
    p_clinic_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_appointments BIGINT,
    completed_appointments BIGINT,
    cancelled_appointments BIGINT,
    no_show_appointments BIGINT,
    completion_rate NUMERIC,
    avg_duration_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_appointments,
        SUM(is_completed)::BIGINT as completed_appointments,
        SUM(is_cancelled)::BIGINT as cancelled_appointments,
        SUM(is_no_show)::BIGINT as no_show_appointments,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 THEN (SUM(is_completed)::NUMERIC / COUNT(*)) * 100 
                ELSE 0 
            END, 2
        ) as completion_rate,
        ROUND(AVG(duration_minutes), 2) as avg_duration_minutes
    FROM analytics_appointments
    WHERE clinic_id = p_clinic_id
      AND appointment_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revenue statistics by date range
CREATE OR REPLACE FUNCTION get_revenue_stats(
    p_clinic_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_revenue NUMERIC,
    pending_revenue NUMERIC,
    total_transactions BIGINT,
    avg_transaction_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(SUM(pending_amount), 0) as pending_revenue,
        COUNT(*)::BIGINT as total_transactions,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 THEN SUM(revenue) / COUNT(*) 
                ELSE 0 
            END, 2
        ) as avg_transaction_value
    FROM analytics_financial
    WHERE clinic_id = p_clinic_id
      AND payment_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Patient growth statistics
CREATE OR REPLACE FUNCTION get_patient_growth_stats(
    p_clinic_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '12 months',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    registration_month DATE,
    new_patients BIGINT,
    cumulative_patients BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_registrations AS (
        SELECT 
            registration_month_start::DATE as month,
            COUNT(*) as new_count
        FROM analytics_patients
        WHERE clinic_id = p_clinic_id
          AND registration_date BETWEEN p_start_date AND p_end_date
        GROUP BY registration_month_start
        ORDER BY registration_month_start
    )
    SELECT 
        month as registration_month,
        new_count::BIGINT as new_patients,
        SUM(new_count) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING)::BIGINT as cumulative_patients
    FROM monthly_registrations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for appointments analytics
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start_time 
ON appointments(clinic_id, start_time);

CREATE INDEX IF NOT EXISTS idx_appointments_status_start_time 
ON appointments(status, start_time);

-- Indexes for patients analytics  
CREATE INDEX IF NOT EXISTS idx_patients_clinic_created_at 
ON patients(clinic_id, created_at);

-- Indexes for financial analytics
CREATE INDEX IF NOT EXISTS idx_financial_clinic_created_at 
ON financial_transactions(clinic_id, created_at);

CREATE INDEX IF NOT EXISTS idx_financial_status_created_at 
ON financial_transactions(status, created_at);

-- ============================================================================
-- SECURITY POLICIES (RLS)
-- ============================================================================

-- Enable RLS on views is automatic through base tables
-- But we ensure functions have SECURITY DEFINER for controlled access