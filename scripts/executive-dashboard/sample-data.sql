-- Executive Dashboard Sample Data Population
-- Story 7.1: Executive Dashboard Implementation
-- This script populates sample data for testing the executive dashboard

-- Get a clinic ID (using the first one available)
DO $$
DECLARE
    sample_clinic_id UUID;
    sample_user_id UUID;
    current_month_start DATE;
    current_month_end DATE;
    previous_month_start DATE;
    previous_month_end DATE;
BEGIN
    -- Get sample clinic and user
    SELECT id INTO sample_clinic_id FROM clinics LIMIT 1;
    SELECT id INTO sample_user_id FROM profiles LIMIT 1;
    
    IF sample_clinic_id IS NULL OR sample_user_id IS NULL THEN
        RAISE NOTICE 'No clinic or user found. Please ensure you have data in clinics and profiles tables.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using clinic ID: % and user ID: %', sample_clinic_id, sample_user_id;
    
    -- Set date ranges
    current_month_start := DATE_TRUNC('month', CURRENT_DATE);
    current_month_end := current_month_start + INTERVAL '1 month' - INTERVAL '1 day';
    previous_month_start := current_month_start - INTERVAL '1 month';
    previous_month_end := current_month_start - INTERVAL '1 day';
    
    -- Insert current month KPIs
    INSERT INTO executive_kpi_values (clinic_id, kpi_name, kpi_value, unit, period_type, period_start, period_end, created_by, updated_by) VALUES
    -- Current month KPIs
    (sample_clinic_id, 'total_revenue', 85000.00, 'BRL', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'total_appointments', 342, 'appointments', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'new_patients', 48, 'patients', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'patient_satisfaction', 92.5, '%', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'staff_utilization', 78.3, '%', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'average_ticket', 248.54, 'BRL', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'conversion_rate', 23.6, '%', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'no_show_rate', 8.2, '%', 'monthly', current_month_start, current_month_end, sample_user_id, sample_user_id),
    
    -- Previous month KPIs for comparison
    (sample_clinic_id, 'total_revenue', 78500.00, 'BRL', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'total_appointments', 315, 'appointments', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'new_patients', 42, 'patients', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'patient_satisfaction', 89.1, '%', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'staff_utilization', 75.8, '%', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'average_ticket', 249.21, 'BRL', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'conversion_rate', 21.4, '%', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id),
    (sample_clinic_id, 'no_show_rate', 9.7, '%', 'monthly', previous_month_start, previous_month_end, sample_user_id, sample_user_id);
    
    -- Insert sample alerts
    INSERT INTO executive_dashboard_alerts (clinic_id, alert_type, severity, title, message, threshold_value, current_value, kpi_name, period_type, period_start, period_end) VALUES
    (sample_clinic_id, 'revenue_drop', 'high', 'Queda na conversão de leads', 'A taxa de conversão de leads está abaixo do esperado este mês.', 25.0, 23.6, 'conversion_rate', 'monthly', current_month_start, current_month_end),
    (sample_clinic_id, 'no_show_spike', 'medium', 'Aumento no no-show', 'Taxa de faltas está ligeiramente acima da meta mensal.', 7.0, 8.2, 'no_show_rate', 'monthly', current_month_start, current_month_end),
    (sample_clinic_id, 'target_missed', 'low', 'Meta de novos pacientes atingida', 'Superamos a meta de novos pacientes para este mês!', 45.0, 48.0, 'new_patients', 'monthly', current_month_start, current_month_end);
    
    -- Insert sample dashboard widgets for user
    INSERT INTO executive_dashboard_widgets (clinic_id, user_id, widget_type, position_x, position_y, width, height, configuration) VALUES
    (sample_clinic_id, sample_user_id, 'revenue_chart', 0, 0, 6, 4, '{"chart_type": "line", "period": "6_months"}'),
    (sample_clinic_id, sample_user_id, 'kpi_card', 6, 0, 3, 2, '{"kpi_name": "total_revenue", "show_comparison": true}'),
    (sample_clinic_id, sample_user_id, 'kpi_card', 9, 0, 3, 2, '{"kpi_name": "total_appointments", "show_comparison": true}'),
    (sample_clinic_id, sample_user_id, 'kpi_card', 6, 2, 3, 2, '{"kpi_name": "new_patients", "show_comparison": true}'),
    (sample_clinic_id, sample_user_id, 'kpi_card', 9, 2, 3, 2, '{"kpi_name": "patient_satisfaction", "show_comparison": true}'),
    (sample_clinic_id, sample_user_id, 'alert_list', 0, 4, 6, 3, '{"max_alerts": 5, "severity_filter": "all"}'),
    (sample_clinic_id, sample_user_id, 'appointments_chart', 6, 4, 6, 3, '{"chart_type": "bar", "period": "current_month"}');
    
    -- Insert sample reports
    INSERT INTO executive_dashboard_reports (clinic_id, report_name, report_type, period_type, period_start, period_end, format, status, file_path, generated_at, requested_by) VALUES
    (sample_clinic_id, 'Resumo Executivo - ' || TO_CHAR(previous_month_start, 'MM/YYYY'), 'executive_summary', 'monthly', previous_month_start, previous_month_end, 'pdf', 'completed', '/reports/executive_summary_' || TO_CHAR(previous_month_start, 'YYYYMM') || '.pdf', previous_month_end + INTERVAL '2 days', sample_user_id),
    (sample_clinic_id, 'Análise de KPIs - ' || TO_CHAR(previous_month_start, 'MM/YYYY'), 'kpi_analysis', 'monthly', previous_month_start, previous_month_end, 'excel', 'completed', '/reports/kpi_analysis_' || TO_CHAR(previous_month_start, 'YYYYMM') || '.xlsx', previous_month_end + INTERVAL '1 day', sample_user_id),
    (sample_clinic_id, 'Análise de Tendências - Q' || EXTRACT(QUARTER FROM CURRENT_DATE), 'trend_analysis', 'quarterly', DATE_TRUNC('quarter', CURRENT_DATE), DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months' - INTERVAL '1 day', 'pdf', 'generating', NULL, NULL, sample_user_id);
    
    RAISE NOTICE 'Sample data inserted successfully for executive dashboard!';
    RAISE NOTICE 'Current month KPIs: % to %', current_month_start, current_month_end;
    RAISE NOTICE 'Previous month KPIs: % to %', previous_month_start, previous_month_end;
    RAISE NOTICE 'Total KPIs inserted: 16';
    RAISE NOTICE 'Total alerts inserted: 3';
    RAISE NOTICE 'Total widgets inserted: 7';
    RAISE NOTICE 'Total reports inserted: 3';
    
END $$;