-- =====================================================
-- BILLING SYSTEM - SQL FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to get financial summary for a date range
CREATE OR REPLACE FUNCTION get_financial_summary(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_revenue DECIMAL(12,2),
  pending_invoices INTEGER,
  overdue_invoices INTEGER,
  paid_invoices INTEGER,
  total_outstanding DECIMAL(12,2),
  monthly_revenue DECIMAL(12,2),
  daily_revenue DECIMAL(12,2)
) 
LANGUAGE plpgsql
AS $$
DECLARE
  total_days INTEGER;
  current_month_start DATE;
  current_month_end DATE;
BEGIN
  -- Calculate date ranges
  total_days := end_date - start_date + 1;
  current_month_start := DATE_TRUNC('month', CURRENT_DATE);
  current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;

  RETURN QUERY
  SELECT 
    -- Total revenue from completed payments
    COALESCE(
      (SELECT SUM(p.amount) 
       FROM payments p 
       WHERE p.payment_date::DATE BETWEEN start_date AND end_date 
         AND p.status = 'completed'), 0
    )::DECIMAL(12,2) AS total_revenue,
    
    -- Count of pending invoices
    COALESCE(
      (SELECT COUNT(*) 
       FROM invoices i 
       WHERE i.status = 'pending'), 0
    )::INTEGER AS pending_invoices,
    
    -- Count of overdue invoices
    COALESCE(
      (SELECT COUNT(*) 
       FROM invoices i 
       WHERE i.status = 'overdue' 
         OR (i.status = 'pending' AND i.due_date < CURRENT_DATE)), 0
    )::INTEGER AS overdue_invoices,
    
    -- Count of paid invoices in period
    COALESCE(
      (SELECT COUNT(*) 
       FROM invoices i 
       WHERE i.status = 'paid' 
         AND i.issue_date::DATE BETWEEN start_date AND end_date), 0
    )::INTEGER AS paid_invoices,
    
    -- Total outstanding amount
    COALESCE(
      (SELECT SUM(i.total_amount - COALESCE(paid_amounts.paid, 0))
       FROM invoices i
       LEFT JOIN (
         SELECT p.invoice_id, SUM(p.amount) as paid
         FROM payments p 
         WHERE p.status = 'completed'
         GROUP BY p.invoice_id
       ) paid_amounts ON i.id = paid_amounts.invoice_id
       WHERE i.status IN ('pending', 'overdue')
         AND (i.total_amount - COALESCE(paid_amounts.paid, 0)) > 0), 0
    )::DECIMAL(12,2) AS total_outstanding,
    
    -- Current month revenue
    COALESCE(
      (SELECT SUM(p.amount) 
       FROM payments p 
       WHERE p.payment_date::DATE BETWEEN current_month_start AND current_month_end 
         AND p.status = 'completed'), 0
    )::DECIMAL(12,2) AS monthly_revenue,
    
    -- Average daily revenue in period
    CASE 
      WHEN total_days > 0 THEN
        COALESCE(
          (SELECT SUM(p.amount) 
           FROM payments p 
           WHERE p.payment_date::DATE BETWEEN start_date AND end_date 
             AND p.status = 'completed'), 0
        ) / total_days
      ELSE 0
    END::DECIMAL(12,2) AS daily_revenue;
END;
$$;

-- Function to get revenue by period (daily, weekly, monthly)
CREATE OR REPLACE FUNCTION get_revenue_by_period(
  start_date DATE,
  end_date DATE,
  period_type TEXT DEFAULT 'daily'
)
RETURNS TABLE (
  period TEXT,
  revenue DECIMAL(12,2),
  invoices_count INTEGER,
  payments_count INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  date_format TEXT;
  date_trunc_format TEXT;
BEGIN
  -- Set format based on period type
  CASE period_type
    WHEN 'daily' THEN 
      date_format := 'YYYY-MM-DD';
      date_trunc_format := 'day';
    WHEN 'weekly' THEN 
      date_format := 'YYYY-"W"WW';
      date_trunc_format := 'week';
    WHEN 'monthly' THEN 
      date_format := 'YYYY-MM';
      date_trunc_format := 'month';
    ELSE 
      date_format := 'YYYY-MM-DD';
      date_trunc_format := 'day';
  END CASE;

  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC(date_trunc_format, p.payment_date::DATE), date_format) AS period,
    COALESCE(SUM(p.amount), 0)::DECIMAL(12,2) AS revenue,
    COUNT(DISTINCT p.invoice_id)::INTEGER AS invoices_count,
    COUNT(p.id)::INTEGER AS payments_count
  FROM payments p
  WHERE p.payment_date::DATE BETWEEN start_date AND end_date
    AND p.status = 'completed'
  GROUP BY DATE_TRUNC(date_trunc_format, p.payment_date::DATE)
  ORDER BY DATE_TRUNC(date_trunc_format, p.payment_date::DATE);
END;
$$;

-- Function to get revenue by service
CREATE OR REPLACE FUNCTION get_revenue_by_service(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  service_id UUID,
  service_name TEXT,
  service_type service_type,
  total_revenue DECIMAL(12,2),
  invoices_count INTEGER,
  average_price DECIMAL(12,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS service_id,
    s.name AS service_name,
    s.service_type,
    COALESCE(SUM(ii.total_amount), 0)::DECIMAL(12,2) AS total_revenue,
    COUNT(DISTINCT ii.invoice_id)::INTEGER AS invoices_count,
    CASE 
      WHEN COUNT(ii.id) > 0 THEN 
        (COALESCE(SUM(ii.total_amount), 0) / COUNT(ii.id))::DECIMAL(12,2)
      ELSE 0::DECIMAL(12,2)
    END AS average_price
  FROM services s
  LEFT JOIN invoice_items ii ON s.id = ii.service_id
  LEFT JOIN invoices i ON ii.invoice_id = i.id
  LEFT JOIN payments p ON i.id = p.invoice_id
  WHERE p.payment_date::DATE BETWEEN start_date AND end_date
    AND p.status = 'completed'
    AND s.is_active = true
  GROUP BY s.id, s.name, s.service_type
  HAVING COALESCE(SUM(ii.total_amount), 0) > 0
  ORDER BY total_revenue DESC;
END;
$$;

-- Function to get payment method statistics
CREATE OR REPLACE FUNCTION get_payment_method_stats(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  method payment_method,
  total_amount DECIMAL(12,2),
  payments_count INTEGER,
  percentage DECIMAL(5,2)
) 
LANGUAGE plpgsql
AS $$
DECLARE
  total_revenue DECIMAL(12,2);
BEGIN
  -- Get total revenue for percentage calculation
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue
  FROM payments 
  WHERE payment_date::DATE BETWEEN start_date AND end_date 
    AND status = 'completed';

  RETURN QUERY
  SELECT 
    p.method,
    COALESCE(SUM(p.amount), 0)::DECIMAL(12,2) AS total_amount,
    COUNT(p.id)::INTEGER AS payments_count,
    CASE 
      WHEN total_revenue > 0 THEN 
        (COALESCE(SUM(p.amount), 0) / total_revenue * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END AS percentage
  FROM payments p
  WHERE p.payment_date::DATE BETWEEN start_date AND end_date
    AND p.status = 'completed'
  GROUP BY p.method
  ORDER BY total_amount DESC;
END;
$$;

-- Function to get outstanding invoices analysis
CREATE OR REPLACE FUNCTION get_outstanding_analysis()
RETURNS TABLE (
  total_outstanding DECIMAL(12,2),
  overdue_count INTEGER,
  overdue_amount DECIMAL(12,2),
  current_count INTEGER,
  current_amount DECIMAL(12,2),
  days_30_count INTEGER,
  days_30_amount DECIMAL(12,2),
  days_60_count INTEGER,
  days_60_amount DECIMAL(12,2),
  days_90_count INTEGER,
  days_90_amount DECIMAL(12,2),
  days_90_plus_count INTEGER,
  days_90_plus_amount DECIMAL(12,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH invoice_balances AS (
    SELECT 
      i.id,
      i.total_amount,
      i.due_date,
      i.status,
      COALESCE(paid_amounts.paid, 0) as paid,
      (i.total_amount - COALESCE(paid_amounts.paid, 0)) as balance,
      (CURRENT_DATE - i.due_date::DATE) as days_past_due
    FROM invoices i
    LEFT JOIN (
      SELECT p.invoice_id, SUM(p.amount) as paid
      FROM payments p 
      WHERE p.status = 'completed'
      GROUP BY p.invoice_id
    ) paid_amounts ON i.id = paid_amounts.invoice_id
    WHERE i.status IN ('pending', 'overdue')
      AND (i.total_amount - COALESCE(paid_amounts.paid, 0)) > 0
  )
  SELECT 
    COALESCE(SUM(balance), 0)::DECIMAL(12,2) AS total_outstanding,
    COALESCE(SUM(CASE WHEN days_past_due > 0 THEN 1 ELSE 0 END), 0)::INTEGER AS overdue_count,
    COALESCE(SUM(CASE WHEN days_past_due > 0 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS overdue_amount,
    COALESCE(SUM(CASE WHEN days_past_due <= 0 THEN 1 ELSE 0 END), 0)::INTEGER AS current_count,
    COALESCE(SUM(CASE WHEN days_past_due <= 0 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS current_amount,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 1 AND 30 THEN 1 ELSE 0 END), 0)::INTEGER AS days_30_count,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 1 AND 30 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS days_30_amount,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 31 AND 60 THEN 1 ELSE 0 END), 0)::INTEGER AS days_60_count,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 31 AND 60 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS days_60_amount,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 61 AND 90 THEN 1 ELSE 0 END), 0)::INTEGER AS days_90_count,
    COALESCE(SUM(CASE WHEN days_past_due BETWEEN 61 AND 90 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS days_90_amount,
    COALESCE(SUM(CASE WHEN days_past_due > 90 THEN 1 ELSE 0 END), 0)::INTEGER AS days_90_plus_count,
    COALESCE(SUM(CASE WHEN days_past_due > 90 THEN balance ELSE 0 END), 0)::DECIMAL(12,2) AS days_90_plus_amount
  FROM invoice_balances;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_financial_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_period(DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_service(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_method_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_outstanding_analysis() TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_date_status ON payments(payment_date, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service_id ON invoice_items(service_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id_status ON payments(invoice_id, status);
