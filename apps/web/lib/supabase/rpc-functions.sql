-- =================================================================
-- RPC Functions para NeonPro - Sistema de Hooks React
-- =================================================================
-- 
-- Este arquivo contém todas as stored procedures necessárias para
-- os hooks React funcionarem com performance otimizada.
--
-- Execute este SQL no Supabase SQL Editor para criar as funções.
-- =================================================================

-- Função para buscar métricas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_filter TIMESTAMPTZ;
  end_filter TIMESTAMPTZ;
BEGIN
  -- Define filtros de data
  start_filter := COALESCE(start_date, date_trunc('month', CURRENT_DATE));
  end_filter := COALESCE(end_date, CURRENT_DATE + INTERVAL '1 day');
  
  -- Busca métricas principais
  SELECT json_build_object(
    'total_patients', (
      SELECT COUNT(*) 
      FROM patients 
      WHERE status = 'active'
    ),
    'upcoming_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE appointment_date >= CURRENT_DATE 
        AND status = 'scheduled'
    ),
    'monthly_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM financial_transactions 
      WHERE status = 'completed' 
        AND created_at >= start_filter 
        AND created_at <= end_filter
    ),
    'active_staff', (
      SELECT COUNT(*) 
      FROM staff_members 
      WHERE is_active = true
    ),
    'previous_month_patients', (
      SELECT COUNT(*) 
      FROM patients 
      WHERE created_at < start_filter 
        AND status = 'active'
    ),
    'previous_month_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM financial_transactions 
      WHERE status = 'completed' 
        AND created_at >= (start_filter - INTERVAL '1 month') 
        AND created_at < start_filter
    ),
    'previous_month_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE appointment_date >= (start_filter - INTERVAL '1 month') 
        AND appointment_date < start_filter 
        AND status IN ('completed', 'scheduled')
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar receita mensal
CREATE OR REPLACE FUNCTION get_monthly_revenue_stats(
  months_back INTEGER DEFAULT 12
)
RETURNS TABLE(
  month TEXT,
  revenue DECIMAL(10,2),
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(date_trunc('month', ft.created_at), 'YYYY-MM') as month,
    COALESCE(SUM(ft.amount), 0) as revenue,
    COUNT(ft.id)::INTEGER as transaction_count
  FROM financial_transactions ft
  WHERE ft.status = 'completed'
    AND ft.created_at >= (CURRENT_DATE - INTERVAL '1 month' * months_back)
  GROUP BY date_trunc('month', ft.created_at)
  ORDER BY date_trunc('month', ft.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar estatísticas de funcionários
CREATE OR REPLACE FUNCTION get_staff_statistics(
  staff_id UUID DEFAULT NULL
)
RETURNS TABLE(
  staff_member_id UUID,
  staff_name TEXT,
  total_appointments INTEGER,
  monthly_appointments INTEGER,
  total_revenue DECIMAL(10,2),
  average_rating DECIMAL(3,2)
) AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
BEGIN
  start_of_month := date_trunc('month', CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    sm.id as staff_member_id,
    sm.name as staff_name,
    (
      SELECT COUNT(*)::INTEGER
      FROM appointments a
      WHERE a.staff_member_id = sm.id 
        AND a.status = 'completed'
    ) as total_appointments,
    (
      SELECT COUNT(*)::INTEGER
      FROM appointments a
      WHERE a.staff_member_id = sm.id 
        AND a.status = 'completed'
        AND a.appointment_date >= start_of_month
    ) as monthly_appointments,
    (
      SELECT COALESCE(SUM(ft.amount), 0)
      FROM financial_transactions ft
      INNER JOIN appointments a ON ft.appointment_id = a.id
      WHERE a.staff_member_id = sm.id 
        AND ft.status = 'completed'
    ) as total_revenue,
    COALESCE((
      SELECT AVG(rating)::numeric(3,2)
      FROM staff_ratings sr
      WHERE sr.staff_member_id = sm.id 
        AND sr.status = 'active'
        AND sr.created_at >= CURRENT_DATE - INTERVAL '12 months'
    ), 0.00) as average_rating
  FROM staff_members sm
  WHERE sm.is_active = true
    AND (staff_id IS NULL OR sm.id = staff_id)
  ORDER BY sm.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar estatísticas de serviços
CREATE OR REPLACE FUNCTION get_service_statistics(
  service_id UUID DEFAULT NULL
)
RETURNS TABLE(
  service_id UUID,
  service_name TEXT,
  total_appointments INTEGER,
  monthly_appointments INTEGER,
  total_revenue DECIMAL(10,2),
  average_price DECIMAL(8,2)
) AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
BEGIN
  start_of_month := date_trunc('month', CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    (
      SELECT COUNT(*)::INTEGER
      FROM appointments a
      WHERE a.service_id = s.id 
        AND a.status IN ('completed', 'scheduled')
    ) as total_appointments,
    (
      SELECT COUNT(*)::INTEGER
      FROM appointments a
      WHERE a.service_id = s.id 
        AND a.status IN ('completed', 'scheduled')
        AND a.appointment_date >= start_of_month
    ) as monthly_appointments,
    (
      SELECT COALESCE(SUM(ft.amount), 0)
      FROM financial_transactions ft
      INNER JOIN appointments a ON ft.appointment_id = a.id
      WHERE a.service_id = s.id 
        AND ft.status = 'completed'
    ) as total_revenue,
    s.price as average_price
  FROM services s
  WHERE s.is_active = true
    AND (service_id IS NULL OR s.id = service_id)
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar relatório financeiro detalhado
CREATE OR REPLACE FUNCTION get_financial_report(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_filter TIMESTAMPTZ;
  end_filter TIMESTAMPTZ;
BEGIN
  start_filter := COALESCE(start_date, date_trunc('month', CURRENT_DATE));
  end_filter := COALESCE(end_date, CURRENT_DATE + INTERVAL '1 day');
  
  SELECT json_build_object(
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0)
      FROM financial_transactions
      WHERE status = 'completed'
        AND created_at >= start_filter
        AND created_at <= end_filter
    ),
    'pending_revenue', (
      SELECT COALESCE(SUM(amount), 0)
      FROM financial_transactions
      WHERE status = 'pending'
        AND created_at >= start_filter
        AND created_at <= end_filter
    ),
    'completed_transactions', (
      SELECT COUNT(*)
      FROM financial_transactions
      WHERE status = 'completed'
        AND created_at >= start_filter
        AND created_at <= end_filter
    ),
    'pending_transactions', (
      SELECT COUNT(*)
      FROM financial_transactions
      WHERE status = 'pending'
        AND created_at >= start_filter
        AND created_at <= end_filter
    ),
    'payment_methods', (
      SELECT json_agg(
        json_build_object(
          'method', payment_method,
          'count', count,
          'total', total
        )
      )
      FROM (
        SELECT 
          COALESCE(payment_method, 'unknown') as payment_method,
          COUNT(*) as count,
          SUM(amount) as total
        FROM financial_transactions
        WHERE status = 'completed'
          AND created_at >= start_filter
          AND created_at <= end_filter
        GROUP BY payment_method
        ORDER BY total DESC
      ) pm
    ),
    'revenue_by_service', (
      SELECT json_agg(
        json_build_object(
          'service_name', service_name,
          'revenue', revenue,
          'appointments', appointments
        )
      )
      FROM (
        SELECT 
          s.name as service_name,
          SUM(ft.amount) as revenue,
          COUNT(ft.id) as appointments
        FROM financial_transactions ft
        INNER JOIN appointments a ON ft.appointment_id = a.id
        INNER JOIN services s ON a.service_id = s.id
        WHERE ft.status = 'completed'
          AND ft.created_at >= start_filter
          AND ft.created_at <= end_filter
        GROUP BY s.id, s.name
        ORDER BY revenue DESC
      ) rs
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar disponibilidade de horários
CREATE OR REPLACE FUNCTION check_time_slot_availability(
  staff_member_id UUID,
  appointment_date TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
  slot_end TIMESTAMPTZ;
BEGIN
  slot_end := appointment_date + (duration_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE staff_member_id = check_time_slot_availability.staff_member_id
    AND status = 'scheduled'
    AND (
      -- Novo agendamento começa durante outro agendamento
      (appointment_date >= appointments.appointment_date 
       AND appointment_date < appointments.appointment_date + INTERVAL '1 hour')
      OR
      -- Novo agendamento termina durante outro agendamento  
      (slot_end > appointments.appointment_date 
       AND slot_end <= appointments.appointment_date + INTERVAL '1 hour')
      OR
      -- Novo agendamento engloba outro agendamento
      (appointment_date <= appointments.appointment_date 
       AND slot_end >= appointments.appointment_date + INTERVAL '1 hour')
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar agendamentos com detalhes completos
CREATE OR REPLACE FUNCTION get_appointments_with_details(
  date_start TIMESTAMPTZ DEFAULT NULL,
  date_end TIMESTAMPTZ DEFAULT NULL,
  appointment_status TEXT DEFAULT NULL,
  staff_id UUID DEFAULT NULL,
  patient_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  appointment_id UUID,
  appointment_date TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  service_id UUID,
  service_name TEXT,
  service_price DECIMAL(8,2),
  service_duration INTEGER,
  staff_member_id UUID,
  staff_name TEXT,
  staff_specialization TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.appointment_date,
    a.status,
    a.notes,
    p.id as patient_id,
    p.name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    s.id as service_id,
    s.name as service_name,
    s.price as service_price,
    s.duration as service_duration,
    sm.id as staff_member_id,
    sm.name as staff_name,
    sm.specialization as staff_specialization
  FROM appointments a
  INNER JOIN patients p ON a.patient_id = p.id
  INNER JOIN services s ON a.service_id = s.id
  INNER JOIN staff_members sm ON a.staff_member_id = sm.id
  WHERE 
    (date_start IS NULL OR a.appointment_date >= date_start)
    AND (date_end IS NULL OR a.appointment_date <= date_end)
    AND (appointment_status IS NULL OR a.status = appointment_status)
    AND (staff_id IS NULL OR a.staff_member_id = staff_id)
    AND (patient_id IS NULL OR a.patient_id = patient_id)
  ORDER BY a.appointment_date ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar auditoria automática
CREATE OR REPLACE FUNCTION create_audit_log(
  table_name TEXT,
  record_id UUID,
  action TEXT,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL,
  user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    user_id,
    created_at
  ) VALUES (
    gen_random_uuid(),
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    COALESCE(user_id, auth.uid()),
    NOW()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- GRANTS E PERMISSÕES
-- =================================================================

-- Permitir acesso às funções para usuários autenticados
GRANT EXECUTE ON FUNCTION get_dashboard_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_revenue_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_service_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_report TO authenticated;
GRANT EXECUTE ON FUNCTION check_time_slot_availability TO authenticated;
GRANT EXECUTE ON FUNCTION get_appointments_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;

-- =================================================================
-- ÍNDICES PARA PERFORMANCE
-- =================================================================

-- Índices para appointments (se não existirem)
CREATE INDEX IF NOT EXISTS idx_appointments_staff_date ON appointments(staff_member_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_service_date ON appointments(service_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Índices para financial_transactions (se não existirem)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at ON financial_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment_id ON financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_payment_method ON financial_transactions(payment_method);

-- Índices para patients (se não existirem)
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Índices para staff_members (se não existirem)
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_specialization ON staff_members(specialization);

-- Índices para services (se não existirem)
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- =================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =================================================================

COMMENT ON FUNCTION get_dashboard_metrics IS 'Retorna métricas principais do dashboard com dados de crescimento';
COMMENT ON FUNCTION get_monthly_revenue_stats IS 'Retorna estatísticas de receita mensal para os últimos N meses';
COMMENT ON FUNCTION get_staff_statistics IS 'Retorna estatísticas detalhadas dos funcionários';
COMMENT ON FUNCTION get_service_statistics IS 'Retorna estatísticas detalhadas dos serviços';
COMMENT ON FUNCTION get_financial_report IS 'Retorna relatório financeiro completo com análises';
COMMENT ON FUNCTION check_time_slot_availability IS 'Verifica disponibilidade de horário para agendamento';
COMMENT ON FUNCTION get_appointments_with_details IS 'Retorna agendamentos com todos os detalhes relacionados';
COMMENT ON FUNCTION create_audit_log IS 'Cria registro de auditoria para mudanças no sistema';