-- Migration: Create Card Payment System Tables
-- Description: Comprehensive card payment processing with Stripe integration
-- Author: APEX Master Developer
-- Date: 2025-01-26

-- Create card payments table
CREATE TABLE IF NOT EXISTS card_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_document VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    payment_method_id VARCHAR(255),
    customer_id VARCHAR(255),
    payable_id UUID REFERENCES ap_payables(id),
    patient_id UUID REFERENCES patients(id),
    receipt_url TEXT,
    failure_reason TEXT,
    captured_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card refunds table
CREATE TABLE IF NOT EXISTS card_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_refund_id VARCHAR(255) NOT NULL UNIQUE,
    payment_intent_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    reason VARCHAR(50),
    receipt_number VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card disputes table
CREATE TABLE IF NOT EXISTS card_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_dispute_id VARCHAR(255) NOT NULL UNIQUE,
    charge_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    evidence_due_by TIMESTAMP WITH TIME ZONE,
    evidence_submitted BOOLEAN DEFAULT false,
    evidence_details JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card webhook events table
CREATE TABLE IF NOT EXISTS card_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved payment methods table
CREATE TABLE IF NOT EXISTS saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'card',
    card_brand VARCHAR(20),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create installment plans table
CREATE TABLE IF NOT EXISTS installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES card_payments(id) ON DELETE CASCADE,
    total_amount INTEGER NOT NULL, -- Total amount in cents
    installments INTEGER NOT NULL CHECK (installments >= 1 AND installments <= 12),
    installment_amount INTEGER NOT NULL, -- Amount per installment in cents
    interest_rate DECIMAL(5,4) DEFAULT 0, -- Monthly interest rate
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create installment payments table
CREATE TABLE IF NOT EXISTS installment_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES installment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, installment_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_payments_stripe_intent ON card_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_status ON card_payments(status);
CREATE INDEX IF NOT EXISTS idx_card_payments_customer_email ON card_payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_card_payments_payable ON card_payments(payable_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_patient ON card_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_created ON card_payments(created_at);

CREATE INDEX IF NOT EXISTS idx_card_refunds_stripe_id ON card_refunds(stripe_refund_id);
CREATE INDEX IF NOT EXISTS idx_card_refunds_payment_intent ON card_refunds(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_card_refunds_status ON card_refunds(status);

CREATE INDEX IF NOT EXISTS idx_card_disputes_stripe_id ON card_disputes(stripe_dispute_id);
CREATE INDEX IF NOT EXISTS idx_card_disputes_charge ON card_disputes(charge_id);
CREATE INDEX IF NOT EXISTS idx_card_disputes_status ON card_disputes(status);
CREATE INDEX IF NOT EXISTS idx_card_disputes_evidence_due ON card_disputes(evidence_due_by);

CREATE INDEX IF NOT EXISTS idx_card_webhook_events_stripe_id ON card_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_card_webhook_events_type ON card_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_card_webhook_events_processed ON card_webhook_events(processed_at);

CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_patient ON saved_payment_methods(patient_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_stripe_id ON saved_payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_customer ON saved_payment_methods(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_default ON saved_payment_methods(patient_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_installment_plans_payment ON installment_plans(payment_id);
CREATE INDEX IF NOT EXISTS idx_installment_plans_status ON installment_plans(status);

CREATE INDEX IF NOT EXISTS idx_installment_payments_plan ON installment_payments(plan_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_status ON installment_payments(status);
CREATE INDEX IF NOT EXISTS idx_installment_payments_due_date ON installment_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_installment_payments_retry_date ON installment_payments(next_retry_date);

-- Add updated_at triggers
CREATE TRIGGER update_card_payments_updated_at BEFORE UPDATE ON card_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_refunds_updated_at BEFORE UPDATE ON card_refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_disputes_updated_at BEFORE UPDATE ON card_disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_payment_methods_updated_at BEFORE UPDATE ON saved_payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installment_plans_updated_at BEFORE UPDATE ON installment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installment_payments_updated_at BEFORE UPDATE ON installment_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE card_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_payments
CREATE POLICY "card_payments_select" ON card_payments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
        OR payable_id IN (
            SELECT id FROM ap_payables 
            WHERE created_by = auth.uid()
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "card_payments_insert" ON card_payments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
        OR payable_id IN (
            SELECT id FROM ap_payables 
            WHERE created_by = auth.uid()
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "card_payments_update" ON card_payments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
        OR payable_id IN (
            SELECT id FROM ap_payables 
            WHERE created_by = auth.uid()
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

-- RLS Policies for card_refunds (linked to card_payments access)
CREATE POLICY "card_refunds_select" ON card_refunds
    FOR SELECT USING (
        payment_intent_id IN (
            SELECT stripe_payment_intent_id FROM card_payments 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

CREATE POLICY "card_refunds_insert" ON card_refunds
    FOR INSERT WITH CHECK (true); -- System can insert refunds

-- RLS Policies for saved_payment_methods
CREATE POLICY "saved_payment_methods_select" ON saved_payment_methods
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "saved_payment_methods_insert" ON saved_payment_methods
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "saved_payment_methods_update" ON saved_payment_methods
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

-- RLS Policies for installment_plans (linked to card_payments access)
CREATE POLICY "installment_plans_select" ON installment_plans
    FOR SELECT USING (
        payment_id IN (
            SELECT id FROM card_payments 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

CREATE POLICY "installment_plans_insert" ON installment_plans
    FOR INSERT WITH CHECK (
        payment_id IN (
            SELECT id FROM card_payments 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

-- RLS Policies for installment_payments (linked to installment_plans access)
CREATE POLICY "installment_payments_select" ON installment_payments
    FOR SELECT USING (
        plan_id IN (
            SELECT id FROM installment_plans 
            WHERE payment_id IN (
                SELECT id FROM card_payments 
                WHERE patient_id IN (
                    SELECT id FROM patients 
                    WHERE created_by = auth.uid() 
                    OR auth.uid() IN (
                        SELECT id FROM profiles 
                        WHERE role IN ('admin', 'manager', 'financial')
                    )
                )
            )
        )
    );

CREATE POLICY "installment_payments_insert" ON installment_payments
    FOR INSERT WITH CHECK (
        plan_id IN (
            SELECT id FROM installment_plans 
            WHERE payment_id IN (
                SELECT id FROM card_payments 
                WHERE patient_id IN (
                    SELECT id FROM patients 
                    WHERE created_by = auth.uid() 
                    OR auth.uid() IN (
                        SELECT id FROM profiles 
                        WHERE role IN ('admin', 'manager', 'financial')
                    )
                )
            )
        )
    );

CREATE POLICY "installment_payments_update" ON installment_payments
    FOR UPDATE USING (
        plan_id IN (
            SELECT id FROM installment_plans 
            WHERE payment_id IN (
                SELECT id FROM card_payments 
                WHERE patient_id IN (
                    SELECT id FROM patients 
                    WHERE created_by = auth.uid() 
                    OR auth.uid() IN (
                        SELECT id FROM profiles 
                        WHERE role IN ('admin', 'manager', 'financial')
                    )
                )
            )
        )
    );

-- RLS Policies for disputes and webhook events (admin/financial only)
CREATE POLICY "card_disputes_select" ON card_disputes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('admin', 'manager', 'financial')
        )
    );

CREATE POLICY "card_disputes_insert" ON card_disputes
    FOR INSERT WITH CHECK (true); -- System can insert disputes

CREATE POLICY "card_webhook_events_select" ON card_webhook_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('admin', 'manager', 'financial')
        )
    );

CREATE POLICY "card_webhook_events_insert" ON card_webhook_events
    FOR INSERT WITH CHECK (true); -- System can insert webhook events

-- Create useful views
CREATE OR REPLACE VIEW card_payment_summary AS
SELECT 
    cp.id,
    cp.stripe_payment_intent_id,
    cp.amount,
    cp.currency,
    cp.status,
    cp.customer_name,
    cp.customer_email,
    cp.description,
    cp.created_at,
    p.name as patient_name,
    p.email as patient_email,
    CASE 
        WHEN cp.payable_id IS NOT NULL THEN 'payable'
        WHEN cp.patient_id IS NOT NULL THEN 'patient'
        ELSE 'standalone'
    END as payment_type
FROM card_payments cp
LEFT JOIN patients p ON cp.patient_id = p.id;

CREATE OR REPLACE VIEW installment_overview AS
SELECT 
    ip.id as plan_id,
    cp.customer_name,
    cp.customer_email,
    ip.total_amount,
    ip.installments,
    ip.installment_amount,
    ip.interest_rate,
    ip.status as plan_status,
    COUNT(ipt.id) as total_installments,
    COUNT(CASE WHEN ipt.status = 'paid' THEN 1 END) as paid_installments,
    COUNT(CASE WHEN ipt.status = 'pending' THEN 1 END) as pending_installments,
    COUNT(CASE WHEN ipt.status = 'failed' THEN 1 END) as failed_installments,
    MIN(CASE WHEN ipt.status = 'pending' THEN ipt.due_date END) as next_due_date
FROM installment_plans ip
JOIN card_payments cp ON ip.payment_id = cp.id
LEFT JOIN installment_payments ipt ON ip.id = ipt.plan_id
GROUP BY ip.id, cp.customer_name, cp.customer_email, ip.total_amount, 
         ip.installments, ip.installment_amount, ip.interest_rate, ip.status;

-- Create functions for payment analytics
CREATE OR REPLACE FUNCTION get_card_payment_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
    total_payments BIGINT,
    total_amount BIGINT,
    successful_payments BIGINT,
    successful_amount BIGINT,
    failed_payments BIGINT,
    refunded_payments BIGINT,
    refunded_amount BIGINT,
    average_payment_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(cp.amount), 0) as total_amount,
        COUNT(CASE WHEN cp.status = 'succeeded' THEN 1 END) as successful_payments,
        COALESCE(SUM(CASE WHEN cp.status = 'succeeded' THEN cp.amount ELSE 0 END), 0) as successful_amount,
        COUNT(CASE WHEN cp.status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN cr.id IS NOT NULL THEN 1 END) as refunded_payments,
        COALESCE(SUM(cr.amount), 0) as refunded_amount,
        COALESCE(AVG(CASE WHEN cp.status = 'succeeded' THEN cp.amount END), 0) as average_payment_amount
    FROM card_payments cp
    LEFT JOIN card_refunds cr ON cp.stripe_payment_intent_id = cr.payment_intent_id
    WHERE cp.created_at::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_overdue_installments()
RETURNS TABLE (
    installment_id UUID,
    plan_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    installment_number INTEGER,
    amount INTEGER,
    due_date DATE,
    days_overdue INTEGER,
    retry_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ipt.id,
        ipt.plan_id,
        cp.customer_name,
        cp.customer_email,
        ipt.installment_number,
        ipt.amount,
        ipt.due_date,
        (CURRENT_DATE - ipt.due_date)::INTEGER as days_overdue,
        ipt.retry_count
    FROM installment_payments ipt
    JOIN installment_plans ip ON ipt.plan_id = ip.id
    JOIN card_payments cp ON ip.payment_id = cp.id
    WHERE ipt.status = 'pending' 
    AND ipt.due_date < CURRENT_DATE
    ORDER BY ipt.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON card_payments TO authenticated;
GRANT SELECT, INSERT ON card_refunds TO authenticated;
GRANT SELECT ON card_disputes TO authenticated;
GRANT SELECT ON card_webhook_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_payment_methods TO authenticated;
GRANT SELECT, INSERT, UPDATE ON installment_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON installment_payments TO authenticated;

GRANT SELECT ON card_payment_summary TO authenticated;
GRANT SELECT ON installment_overview TO authenticated;

GRANT EXECUTE ON FUNCTION get_card_payment_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_overdue_installments() TO authenticated;

COMMIT;
