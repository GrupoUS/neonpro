-- NeonPro - Installment Management Schema
-- Story 6.1 - Task 3: Installment Management System
-- Database schema for payment plans and installments

-- Payment Plans Table
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  installment_count INTEGER NOT NULL CHECK (installment_count > 0 AND installment_count <= 60),
  installment_amount DECIMAL(12,2) NOT NULL CHECK (installment_amount > 0),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  start_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'defaulted')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Installments Table
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  late_fee DECIMAL(12,2) DEFAULT 0 CHECK (late_fee >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique installment numbers per payment plan
  UNIQUE(payment_plan_id, installment_number)
);

-- Payment Plan History Table (for tracking modifications)
CREATE TABLE IF NOT EXISTS payment_plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'modified', 'cancelled', 'completed'
  previous_data JSONB,
  new_data JSONB,
  reason TEXT,
  performed_by UUID, -- Could reference users table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Late Payment Tracking Table
CREATE TABLE IF NOT EXISTS late_payment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
  days_overdue INTEGER NOT NULL CHECK (days_overdue > 0),
  late_fee_applied DECIMAL(12,2) DEFAULT 0,
  notification_sent BOOLEAN DEFAULT false,
  notification_type VARCHAR(50), -- 'email', 'sms', 'whatsapp'
  escalation_level INTEGER DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payment_plans_customer_id ON payment_plans(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);
CREATE INDEX IF NOT EXISTS idx_payment_plans_start_date ON payment_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_payment_plans_created_at ON payment_plans(created_at);

CREATE INDEX IF NOT EXISTS idx_installments_payment_plan_id ON installments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_stripe_payment_intent ON installments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_installments_status_due_date ON installments(status, due_date);

CREATE INDEX IF NOT EXISTS idx_payment_plan_history_payment_plan_id ON payment_plan_history(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_history_created_at ON payment_plan_history(created_at);

CREATE INDEX IF NOT EXISTS idx_late_payment_tracking_installment_id ON late_payment_tracking(installment_id);
CREATE INDEX IF NOT EXISTS idx_late_payment_tracking_days_overdue ON late_payment_tracking(days_overdue);
CREATE INDEX IF NOT EXISTS idx_late_payment_tracking_escalation_level ON late_payment_tracking(escalation_level);

-- Views for Analytics and Reporting

-- Payment Plan Summary View
CREATE OR REPLACE VIEW payment_plan_summary AS
SELECT 
  pp.id,
  pp.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  pp.total_amount,
  pp.currency,
  pp.installment_count,
  pp.installment_amount,
  pp.frequency,
  pp.start_date,
  pp.status,
  pp.description,
  COUNT(i.id) as total_installments,
  COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_installments,
  COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_installments,
  COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_installments,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as paid_amount,
  COALESCE(SUM(CASE WHEN i.status IN ('pending', 'overdue') THEN i.amount ELSE 0 END), 0) as remaining_amount,
  COALESCE(SUM(i.late_fee), 0) as total_late_fees,
  CASE 
    WHEN COUNT(CASE WHEN i.status = 'paid' THEN 1 END) = pp.installment_count THEN 100.0
    ELSE ROUND((COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::DECIMAL / pp.installment_count) * 100, 2)
  END as completion_percentage,
  pp.created_at,
  pp.updated_at
FROM payment_plans pp
JOIN customers c ON pp.customer_id = c.id
LEFT JOIN installments i ON pp.id = i.payment_plan_id
GROUP BY pp.id, c.name, c.email;

-- Overdue Installments View
CREATE OR REPLACE VIEW overdue_installments_view AS
SELECT 
  i.id,
  i.payment_plan_id,
  pp.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  i.installment_number,
  i.amount,
  i.due_date,
  i.late_fee,
  CURRENT_DATE - i.due_date as days_overdue,
  pp.total_amount as plan_total_amount,
  pp.description as plan_description,
  lpt.escalation_level,
  lpt.notification_sent,
  lpt.notification_type,
  i.created_at,
  i.updated_at
FROM installments i
JOIN payment_plans pp ON i.payment_plan_id = pp.id
JOIN customers c ON pp.customer_id = c.id
LEFT JOIN late_payment_tracking lpt ON i.id = lpt.installment_id
WHERE i.status = 'overdue'
ORDER BY days_overdue DESC, i.due_date ASC;

-- Payment Performance Metrics View
CREATE OR REPLACE VIEW payment_performance_metrics AS
SELECT 
  DATE_TRUNC('month', i.due_date) as month,
  COUNT(*) as total_installments_due,
  COUNT(CASE WHEN i.status = 'paid' AND i.paid_date <= i.due_date THEN 1 END) as on_time_payments,
  COUNT(CASE WHEN i.status = 'paid' AND i.paid_date > i.due_date THEN 1 END) as late_payments,
  COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_payments,
  SUM(i.amount) as total_amount_due,
  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_amount_collected,
  SUM(CASE WHEN i.status = 'overdue' THEN i.amount ELSE 0 END) as total_amount_overdue,
  SUM(i.late_fee) as total_late_fees,
  ROUND(
    (COUNT(CASE WHEN i.status = 'paid' AND i.paid_date <= i.due_date THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 2
  ) as on_time_payment_rate,
  ROUND(
    (SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) / 
     NULLIF(SUM(i.amount), 0)) * 100, 2
  ) as collection_rate
FROM installments i
JOIN payment_plans pp ON i.payment_plan_id = pp.id
WHERE pp.status != 'cancelled'
GROUP BY DATE_TRUNC('month', i.due_date)
ORDER BY month DESC;

-- Functions

-- Function to calculate next due date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  current_date DATE,
  frequency VARCHAR(20)
) RETURNS DATE AS $$
BEGIN
  CASE frequency
    WHEN 'weekly' THEN
      RETURN current_date + INTERVAL '7 days';
    WHEN 'biweekly' THEN
      RETURN current_date + INTERVAL '14 days';
    WHEN 'monthly' THEN
      RETURN current_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN current_date + INTERVAL '3 months';
    ELSE
      RAISE EXCEPTION 'Invalid frequency: %', frequency;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark overdue installments
CREATE OR REPLACE FUNCTION mark_overdue_installments()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update installments that are past due
  UPDATE installments 
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE 
    status = 'pending' 
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Insert late payment tracking records
  INSERT INTO late_payment_tracking (installment_id, days_overdue)
  SELECT 
    i.id,
    CURRENT_DATE - i.due_date
  FROM installments i
  WHERE 
    i.status = 'overdue'
    AND NOT EXISTS (
      SELECT 1 FROM late_payment_tracking lpt 
      WHERE lpt.installment_id = i.id
    );
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate payment plan statistics
CREATE OR REPLACE FUNCTION get_payment_plan_stats(plan_id UUID)
RETURNS TABLE(
  total_installments INTEGER,
  paid_installments INTEGER,
  overdue_installments INTEGER,
  total_amount DECIMAL(12,2),
  paid_amount DECIMAL(12,2),
  remaining_amount DECIMAL(12,2),
  completion_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_installments,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::INTEGER as paid_installments,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END)::INTEGER as overdue_installments,
    SUM(i.amount) as total_amount,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN i.status IN ('pending', 'overdue') THEN i.amount ELSE 0 END) as remaining_amount,
    CASE 
      WHEN COUNT(*) = 0 THEN 0.00
      ELSE ROUND((COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
    END as completion_percentage
  FROM installments i
  WHERE i.payment_plan_id = plan_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Update payment plan status when all installments are paid
CREATE OR REPLACE FUNCTION update_payment_plan_status()
RETURNS TRIGGER AS $$
DECLARE
  plan_id UUID;
  total_installments INTEGER;
  paid_installments INTEGER;
BEGIN
  -- Get the payment plan ID
  IF TG_OP = 'UPDATE' THEN
    plan_id := NEW.payment_plan_id;
  ELSIF TG_OP = 'INSERT' THEN
    plan_id := NEW.payment_plan_id;
  END IF;
  
  -- Count total and paid installments
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'paid' THEN 1 END)
  INTO total_installments, paid_installments
  FROM installments
  WHERE payment_plan_id = plan_id;
  
  -- Update payment plan status if all installments are paid
  IF paid_installments = total_installments AND total_installments > 0 THEN
    UPDATE payment_plans
    SET 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = plan_id AND status = 'active';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_plan_status
  AFTER INSERT OR UPDATE ON installments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_plan_status();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_late_payment_tracking_updated_at
  BEFORE UPDATE ON late_payment_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE late_payment_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Payment Plans Policies
CREATE POLICY "Users can view payment plans for their customers" ON payment_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = payment_plans.customer_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create payment plans for their customers" ON payment_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = payment_plans.customer_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update payment plans for their customers" ON payment_plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = payment_plans.customer_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Installments Policies
CREATE POLICY "Users can view installments for their customers" ON installments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_plans pp
      JOIN customers c ON pp.customer_id = c.id
      WHERE pp.id = installments.payment_plan_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create installments for their customers" ON installments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM payment_plans pp
      JOIN customers c ON pp.customer_id = c.id
      WHERE pp.id = installments.payment_plan_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update installments for their customers" ON installments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM payment_plans pp
      JOIN customers c ON pp.customer_id = c.id
      WHERE pp.id = installments.payment_plan_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view payment plan history for their customers" ON payment_plan_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_plans pp
      JOIN customers c ON pp.customer_id = c.id
      WHERE pp.id = payment_plan_history.payment_plan_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view late payment tracking for their customers" ON late_payment_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM installments i
      JOIN payment_plans pp ON i.payment_plan_id = pp.id
      JOIN customers c ON pp.customer_id = c.id
      WHERE i.id = late_payment_tracking.installment_id
      AND c.clinic_id IN (
        SELECT clinic_id FROM user_profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Scheduled Jobs (using pg_cron if available)
-- This would typically be set up separately in your database
/*
SELECT cron.schedule('mark-overdue-installments', '0 1 * * *', 'SELECT mark_overdue_installments();');
*/

-- Comments for documentation
COMMENT ON TABLE payment_plans IS 'Payment plans for customers with installment options';
COMMENT ON TABLE installments IS 'Individual installment payments for payment plans';
COMMENT ON TABLE payment_plan_history IS 'Audit trail for payment plan modifications';
COMMENT ON TABLE late_payment_tracking IS 'Tracking and escalation for overdue payments';

COMMENT ON COLUMN payment_plans.frequency IS 'Payment frequency: weekly, biweekly, monthly, quarterly';
COMMENT ON COLUMN payment_plans.status IS 'Plan status: active, completed, cancelled, defaulted';
COMMENT ON COLUMN installments.status IS 'Installment status: pending, paid, overdue, cancelled';
COMMENT ON COLUMN late_payment_tracking.escalation_level IS 'Escalation level from 1 (first notice) to 5 (final notice)';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON payment_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON installments TO authenticated;
GRANT SELECT, INSERT ON payment_plan_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON late_payment_tracking TO authenticated;

GRANT SELECT ON payment_plan_summary TO authenticated;
GRANT SELECT ON overdue_installments_view TO authenticated;
GRANT SELECT ON payment_performance_metrics TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_next_due_date TO authenticated;
GRANT EXECUTE ON FUNCTION mark_overdue_installments TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_plan_stats TO authenticated;