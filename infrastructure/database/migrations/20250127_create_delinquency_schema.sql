-- =====================================================
-- DELINQUENCY MANAGEMENT SYSTEM SCHEMA
-- =====================================================
-- Creates comprehensive delinquency management system
-- with risk profiling, collection workflows, and notifications

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CUSTOMER RISK PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1000),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    payment_history JSONB NOT NULL DEFAULT '{}',
    credit_limit DECIMAL(15,2),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(customer_id)
);

-- =====================================================
-- DELINQUENCY RULES
-- =====================================================
CREATE TABLE IF NOT EXISTS delinquency_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(name)
);

-- =====================================================
-- DELINQUENCY PAYMENT PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS delinquency_payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    original_amount DECIMAL(15,2) NOT NULL CHECK (original_amount > 0),
    negotiated_amount DECIMAL(15,2) NOT NULL CHECK (negotiated_amount > 0),
    installments INTEGER NOT NULL CHECK (installments > 0),
    installment_amount DECIMAL(15,2) NOT NULL CHECK (installment_amount > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    terms TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'defaulted')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (end_date > start_date),
    CHECK (negotiated_amount <= original_amount + (original_amount * interest_rate))
);

-- =====================================================
-- PAYMENT PLAN INSTALLMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_plan_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_plan_id UUID NOT NULL REFERENCES delinquency_payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    paid_date DATE,
    paid_amount DECIMAL(15,2) CHECK (paid_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    payment_method TEXT,
    transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(payment_plan_id, installment_number)
);

-- =====================================================
-- NOTIFICATION TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'warning', 'final_notice', 'collection', 'legal')),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'call', 'letter')),
    subject TEXT,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(name, type, channel)
);

-- =====================================================
-- DELINQUENCY NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS delinquency_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'warning', 'final_notice', 'collection', 'legal')),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'call', 'letter')),
    template_id UUID REFERENCES notification_templates(id),
    subject TEXT,
    content TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SCHEDULED NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    channel TEXT NOT NULL,
    template_id UUID REFERENCES notification_templates(id),
    scheduled_for TIMESTAMPTZ NOT NULL,
    rule_id UUID REFERENCES delinquency_rules(id),
    payment_id UUID,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- COLLECTION WORKFLOWS
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    current_stage TEXT NOT NULL,
    next_action_type TEXT,
    next_action_date TIMESTAMPTZ,
    next_action_template UUID REFERENCES notification_templates(id),
    action_history JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'escalated')),
    assigned_to UUID REFERENCES auth.users(id),
    priority INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(customer_id, status) WHERE status = 'active'
);

-- =====================================================
-- COLLECTION ACTIVITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES collection_workflows(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation')),
    description TEXT NOT NULL,
    outcome TEXT,
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    amount_collected DECIMAL(15,2) DEFAULT 0,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DELINQUENCY AUDIT TRAIL
-- =====================================================
CREATE TABLE IF NOT EXISTS delinquency_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer risk profiles
CREATE INDEX idx_customer_risk_profiles_customer_id ON customer_risk_profiles(customer_id);
CREATE INDEX idx_customer_risk_profiles_risk_level ON customer_risk_profiles(risk_level);
CREATE INDEX idx_customer_risk_profiles_risk_score ON customer_risk_profiles(risk_score);

-- Delinquency rules
CREATE INDEX idx_delinquency_rules_active ON delinquency_rules(is_active);
CREATE INDEX idx_delinquency_rules_priority ON delinquency_rules(priority);

-- Payment plans
CREATE INDEX idx_payment_plans_customer_id ON delinquency_payment_plans(customer_id);
CREATE INDEX idx_payment_plans_status ON delinquency_payment_plans(status);
CREATE INDEX idx_payment_plans_dates ON delinquency_payment_plans(start_date, end_date);

-- Payment plan installments
CREATE INDEX idx_installments_payment_plan_id ON payment_plan_installments(payment_plan_id);
CREATE INDEX idx_installments_due_date ON payment_plan_installments(due_date);
CREATE INDEX idx_installments_status ON payment_plan_installments(status);

-- Notifications
CREATE INDEX idx_notifications_customer_id ON delinquency_notifications(customer_id);
CREATE INDEX idx_notifications_status ON delinquency_notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON delinquency_notifications(scheduled_for);
CREATE INDEX idx_notifications_type ON delinquency_notifications(type);

-- Scheduled notifications
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);

-- Collection workflows
CREATE INDEX idx_collection_workflows_customer_id ON collection_workflows(customer_id);
CREATE INDEX idx_collection_workflows_status ON collection_workflows(status);
CREATE INDEX idx_collection_workflows_assigned_to ON collection_workflows(assigned_to);
CREATE INDEX idx_collection_workflows_next_action_date ON collection_workflows(next_action_date);

-- Collection activities
CREATE INDEX idx_collection_activities_workflow_id ON collection_activities(workflow_id);
CREATE INDEX idx_collection_activities_customer_id ON collection_activities(customer_id);
CREATE INDEX idx_collection_activities_type ON collection_activities(activity_type);
CREATE INDEX idx_collection_activities_date ON collection_activities(created_at);

-- Audit trail
CREATE INDEX idx_audit_trail_table_record ON delinquency_audit_trail(table_name, record_id);
CREATE INDEX idx_audit_trail_changed_at ON delinquency_audit_trail(changed_at);
CREATE INDEX idx_audit_trail_changed_by ON delinquency_audit_trail(changed_by);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Overdue payments summary
CREATE OR REPLACE VIEW overdue_payments_summary AS
SELECT 
    c.id as customer_id,
    c.name as customer_name,
    c.email as customer_email,
    crp.risk_level,
    COUNT(*) as overdue_count,
    SUM(CASE 
        WHEN ri.type = 'invoice' THEN (ri.data->>'total')::DECIMAL
        ELSE ppi.amount
    END) as total_overdue_amount,
    AVG(CASE 
        WHEN ri.type = 'invoice' THEN EXTRACT(days FROM NOW() - (ri.data->>'dueDate')::DATE)
        ELSE EXTRACT(days FROM NOW() - ppi.due_date)
    END) as avg_days_overdue,
    MAX(CASE 
        WHEN ri.type = 'invoice' THEN EXTRACT(days FROM NOW() - (ri.data->>'dueDate')::DATE)
        ELSE EXTRACT(days FROM NOW() - ppi.due_date)
    END) as max_days_overdue
FROM customers c
LEFT JOIN customer_risk_profiles crp ON c.id = crp.customer_id
LEFT JOIN receipts_invoices ri ON c.id = ri.customer_id 
    AND ri.type = 'invoice' 
    AND ri.status IN ('sent', 'overdue')
    AND (ri.data->>'dueDate')::DATE < CURRENT_DATE
LEFT JOIN delinquency_payment_plans dpp ON c.id = dpp.customer_id
LEFT JOIN payment_plan_installments ppi ON dpp.id = ppi.payment_plan_id 
    AND ppi.status = 'pending'
    AND ppi.due_date < CURRENT_DATE
WHERE (ri.id IS NOT NULL OR ppi.id IS NOT NULL)
GROUP BY c.id, c.name, c.email, crp.risk_level;

-- Collection workflow status
CREATE OR REPLACE VIEW collection_workflow_status AS
SELECT 
    cw.id as workflow_id,
    c.name as customer_name,
    cw.current_stage,
    cw.next_action_type,
    cw.next_action_date,
    cw.status,
    cw.priority,
    u.email as assigned_to_email,
    COUNT(ca.id) as total_activities,
    SUM(ca.amount_collected) as total_collected,
    MAX(ca.created_at) as last_activity_date
FROM collection_workflows cw
JOIN customers c ON cw.customer_id = c.id
LEFT JOIN auth.users u ON cw.assigned_to = u.id
LEFT JOIN collection_activities ca ON cw.id = ca.workflow_id
GROUP BY cw.id, c.name, cw.current_stage, cw.next_action_type, 
         cw.next_action_date, cw.status, cw.priority, u.email;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate customer payment history
CREATE OR REPLACE FUNCTION get_customer_payment_history(customer_id UUID)
RETURNS TABLE (
    total_payments INTEGER,
    on_time_payments INTEGER,
    late_payments INTEGER,
    average_delay_days NUMERIC,
    last_payment_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH payment_data AS (
        -- Get invoice payments
        SELECT 
            (ri.data->>'dueDate')::DATE as due_date,
            ri.updated_at::DATE as paid_date,
            CASE WHEN ri.updated_at::DATE <= (ri.data->>'dueDate')::DATE THEN 1 ELSE 0 END as on_time
        FROM receipts_invoices ri
        WHERE ri.customer_id = get_customer_payment_history.customer_id
        AND ri.status = 'paid'
        AND ri.type = 'invoice'
        
        UNION ALL
        
        -- Get installment payments
        SELECT 
            ppi.due_date,
            ppi.paid_date,
            CASE WHEN ppi.paid_date <= ppi.due_date THEN 1 ELSE 0 END as on_time
        FROM payment_plan_installments ppi
        JOIN delinquency_payment_plans dpp ON ppi.payment_plan_id = dpp.id
        WHERE dpp.customer_id = get_customer_payment_history.customer_id
        AND ppi.status = 'paid'
    )
    SELECT 
        COUNT(*)::INTEGER as total_payments,
        SUM(on_time)::INTEGER as on_time_payments,
        (COUNT(*) - SUM(on_time))::INTEGER as late_payments,
        AVG(CASE WHEN on_time = 0 THEN EXTRACT(days FROM paid_date - due_date) ELSE 0 END) as average_delay_days,
        MAX(paid_date) as last_payment_date
    FROM payment_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get delinquency statistics
CREATE OR REPLACE FUNCTION get_delinquency_statistics(
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_overdue INTEGER,
    total_amount DECIMAL,
    average_days_overdue NUMERIC,
    risk_distribution JSONB,
    recovery_rate NUMERIC,
    collection_efficiency NUMERIC
) AS $$
DECLARE
    _start_date TIMESTAMPTZ := COALESCE(start_date, NOW() - INTERVAL '30 days');
    _end_date TIMESTAMPTZ := COALESCE(end_date, NOW());
BEGIN
    RETURN QUERY
    WITH overdue_data AS (
        SELECT 
            COUNT(*) as overdue_count,
            SUM(CASE 
                WHEN ri.type = 'invoice' THEN (ri.data->>'total')::DECIMAL
                ELSE ppi.amount
            END) as overdue_amount,
            AVG(CASE 
                WHEN ri.type = 'invoice' THEN EXTRACT(days FROM NOW() - (ri.data->>'dueDate')::DATE)
                ELSE EXTRACT(days FROM NOW() - ppi.due_date)
            END) as avg_overdue_days
        FROM (
            SELECT 'invoice' as type, customer_id, data, created_at
            FROM receipts_invoices 
            WHERE status IN ('sent', 'overdue')
            AND (data->>'dueDate')::DATE < CURRENT_DATE
            AND created_at BETWEEN _start_date AND _end_date
            
            UNION ALL
            
            SELECT 'installment' as type, dpp.customer_id, NULL as data, ppi.created_at
            FROM payment_plan_installments ppi
            JOIN delinquency_payment_plans dpp ON ppi.payment_plan_id = dpp.id
            WHERE ppi.status = 'pending'
            AND ppi.due_date < CURRENT_DATE
            AND ppi.created_at BETWEEN _start_date AND _end_date
        ) ri
        LEFT JOIN payment_plan_installments ppi ON ri.type = 'installment'
    ),
    risk_data AS (
        SELECT 
            jsonb_object_agg(risk_level, count) as risk_dist
        FROM (
            SELECT 
                COALESCE(crp.risk_level, 'unknown') as risk_level,
                COUNT(*) as count
            FROM overdue_payments_summary ops
            LEFT JOIN customer_risk_profiles crp ON ops.customer_id = crp.customer_id
            GROUP BY COALESCE(crp.risk_level, 'unknown')
        ) rd
    ),
    recovery_data AS (
        SELECT 
            COALESCE(SUM(ca.amount_collected), 0) as total_collected,
            COUNT(DISTINCT ca.customer_id) as customers_with_collection
        FROM collection_activities ca
        WHERE ca.created_at BETWEEN _start_date AND _end_date
        AND ca.amount_collected > 0
    )
    SELECT 
        od.overdue_count::INTEGER,
        od.overdue_amount,
        od.avg_overdue_days,
        rd.risk_dist,
        CASE WHEN od.overdue_amount > 0 THEN (rcd.total_collected / od.overdue_amount) * 100 ELSE 0 END as recovery_rate,
        CASE WHEN od.overdue_count > 0 THEN (rcd.customers_with_collection::NUMERIC / od.overdue_count) * 100 ELSE 0 END as collection_efficiency
    FROM overdue_data od
    CROSS JOIN risk_data rd
    CROSS JOIN recovery_data rcd;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate payment plan installments
CREATE OR REPLACE FUNCTION generate_payment_plan_installments(plan_id UUID)
RETURNS VOID AS $$
DECLARE
    plan_record RECORD;
    installment_date DATE;
    i INTEGER;
BEGIN
    -- Get payment plan details
    SELECT * INTO plan_record
    FROM delinquency_payment_plans
    WHERE id = plan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment plan not found';
    END IF;
    
    -- Delete existing installments
    DELETE FROM payment_plan_installments WHERE payment_plan_id = plan_id;
    
    -- Generate installments
    installment_date := plan_record.start_date;
    
    FOR i IN 1..plan_record.installments LOOP
        INSERT INTO payment_plan_installments (
            payment_plan_id,
            installment_number,
            amount,
            due_date
        ) VALUES (
            plan_id,
            i,
            plan_record.installment_amount,
            installment_date
        );
        
        -- Calculate next installment date (monthly)
        installment_date := installment_date + INTERVAL '1 month';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update risk scores automatically
CREATE OR REPLACE FUNCTION update_customer_risk_scores()
RETURNS VOID AS $$
DECLARE
    customer_record RECORD;
    payment_history RECORD;
    risk_score INTEGER;
    risk_level TEXT;
BEGIN
    FOR customer_record IN 
        SELECT id FROM customers 
        WHERE id NOT IN (
            SELECT customer_id FROM customer_risk_profiles 
            WHERE last_updated > NOW() - INTERVAL '7 days'
        )
    LOOP
        -- Get payment history
        SELECT * INTO payment_history
        FROM get_customer_payment_history(customer_record.id);
        
        -- Calculate risk score (simplified version)
        risk_score := 0;
        
        IF payment_history.total_payments > 0 THEN
            -- Payment punctuality (40% weight)
            risk_score := risk_score + (400 - (payment_history.on_time_payments::NUMERIC / payment_history.total_payments * 400));
            
            -- Average delay (30% weight)
            risk_score := risk_score + LEAST(payment_history.average_delay_days * 10, 300);
            
            -- Payment frequency (20% weight)
            IF payment_history.total_payments < 5 THEN
                risk_score := risk_score + 200;
            ELSE
                risk_score := risk_score + GREATEST(0, 200 - (payment_history.total_payments * 5));
            END IF;
            
            -- Recent activity (10% weight)
            IF payment_history.last_payment_date IS NOT NULL THEN
                risk_score := risk_score + LEAST(EXTRACT(days FROM NOW() - payment_history.last_payment_date) * 0.3, 100);
            ELSE
                risk_score := risk_score + 100;
            END IF;
        ELSE
            risk_score := 500; -- Default for new customers
        END IF;
        
        -- Determine risk level
        IF risk_score <= 250 THEN
            risk_level := 'low';
        ELSIF risk_score <= 500 THEN
            risk_level := 'medium';
        ELSIF risk_score <= 750 THEN
            risk_level := 'high';
        ELSE
            risk_level := 'critical';
        END IF;
        
        -- Upsert risk profile
        INSERT INTO customer_risk_profiles (
            customer_id,
            risk_score,
            risk_level,
            payment_history,
            last_updated
        ) VALUES (
            customer_record.id,
            risk_score,
            risk_level,
            jsonb_build_object(
                'totalPayments', payment_history.total_payments,
                'onTimePayments', payment_history.on_time_payments,
                'latePayments', payment_history.late_payments,
                'averageDelayDays', payment_history.average_delay_days,
                'lastPaymentDate', payment_history.last_payment_date
            ),
            NOW()
        )
        ON CONFLICT (customer_id) DO UPDATE SET
            risk_score = EXCLUDED.risk_score,
            risk_level = EXCLUDED.risk_level,
            payment_history = EXCLUDED.payment_history,
            last_updated = EXCLUDED.last_updated,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_risk_profiles_updated_at
    BEFORE UPDATE ON customer_risk_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delinquency_rules_updated_at
    BEFORE UPDATE ON delinquency_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON delinquency_payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at
    BEFORE UPDATE ON payment_plan_installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON delinquency_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_notifications_updated_at
    BEFORE UPDATE ON scheduled_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_workflows_updated_at
    BEFORE UPDATE ON collection_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_activities_updated_at
    BEFORE UPDATE ON collection_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate installments trigger
CREATE OR REPLACE FUNCTION trigger_generate_installments()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        PERFORM generate_payment_plan_installments(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_installments
    AFTER INSERT OR UPDATE ON delinquency_payment_plans
    FOR EACH ROW EXECUTE FUNCTION trigger_generate_installments();

-- Audit trail triggers
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO delinquency_audit_trail (
            table_name, record_id, action, old_values, changed_by
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO delinquency_audit_trail (
            table_name, record_id, action, old_values, new_values, changed_by
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO delinquency_audit_trail (
            table_name, record_id, action, new_values, changed_by
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_customer_risk_profiles
    AFTER INSERT OR UPDATE OR DELETE ON customer_risk_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_delinquency_payment_plans
    AFTER INSERT OR UPDATE OR DELETE ON delinquency_payment_plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_collection_workflows
    AFTER INSERT OR UPDATE OR DELETE ON collection_workflows
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customer_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delinquency_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE delinquency_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE delinquency_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE delinquency_audit_trail ENABLE ROW LEVEL SECURITY;

-- Policies for customer_risk_profiles
CREATE POLICY "Users can view risk profiles for their organization" ON customer_risk_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can manage risk profiles for their organization" ON customer_risk_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Policies for delinquency_rules
CREATE POLICY "Users can view delinquency rules for their organization" ON delinquency_rules
    FOR SELECT USING (auth.jwt() ->> 'organization_id' IS NOT NULL);

CREATE POLICY "Admins can manage delinquency rules" ON delinquency_rules
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Policies for payment plans
CREATE POLICY "Users can view payment plans for their organization" ON delinquency_payment_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can manage payment plans for their organization" ON delinquency_payment_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Policies for installments
CREATE POLICY "Users can view installments for their organization" ON payment_plan_installments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM delinquency_payment_plans dpp
            JOIN customers c ON dpp.customer_id = c.id
            WHERE dpp.id = payment_plan_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can manage installments for their organization" ON payment_plan_installments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM delinquency_payment_plans dpp
            JOIN customers c ON dpp.customer_id = c.id
            WHERE dpp.id = payment_plan_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Policies for notifications
CREATE POLICY "Users can view notifications for their organization" ON delinquency_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can manage notifications for their organization" ON delinquency_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- Policies for collection workflows
CREATE POLICY "Users can view collection workflows for their organization" ON collection_workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

CREATE POLICY "Users can manage collection workflows for their organization" ON collection_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.organization_id = auth.jwt() ->> 'organization_id'
        )
    );

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default notification templates
INSERT INTO notification_templates (name, type, channel, subject, content, variables) VALUES
('Lembrete de Pagamento - Email', 'reminder', 'email', 
 'Lembrete: Fatura vencendo em breve',
 'Olá {{customerName}},<br><br>Este é um lembrete de que sua fatura no valor de R$ {{amount}} vence em {{daysUntilDue}} dias.<br><br>Para evitar juros e multas, realize o pagamento até {{dueDate}}.<br><br>Atenciosamente,<br>Equipe NeonPro',
 '["customerName", "amount", "daysUntilDue", "dueDate"]'),

('Aviso de Atraso - Email', 'warning', 'email',
 'AVISO: Pagamento em atraso',
 'Olá {{customerName}},<br><br>Identificamos que sua fatura no valor de R$ {{amount}} está em atraso há {{daysOverdue}} dias.<br><br>Para regularizar sua situação, realize o pagamento o quanto antes.<br><br>Em caso de dúvidas, entre em contato conosco.<br><br>Atenciosamente,<br>Equipe NeonPro',
 '["customerName", "amount", "daysOverdue"]'),

('Aviso Final - Email', 'final_notice', 'email',
 'AVISO FINAL: Regularize sua situação',
 'Olá {{customerName}},<br><br>Este é nosso aviso final sobre o pagamento em atraso no valor de R$ {{amount}}.<br><br>Caso não seja regularizado em 5 dias úteis, seu nome poderá ser incluído nos órgãos de proteção ao crédito.<br><br>Para negociar, entre em contato conosco.<br><br>Atenciosamente,<br>Equipe NeonPro',
 '["customerName", "amount"]'),

('Cobrança - Email', 'collection', 'email',
 'Cobrança: Regularize sua situação',
 'Olá {{customerName}},<br><br>Sua conta no valor de R$ {{amount}} encontra-se em aberto há {{daysOverdue}} dias.<br><br>Para evitar maiores transtornos, regularize sua situação o quanto antes.<br><br>Estamos à disposição para negociar.<br><br>Atenciosamente,<br>Departamento de Cobrança',
 '["customerName", "amount", "daysOverdue"]');

-- Insert default delinquency rules
INSERT INTO delinquency_rules (name, description, trigger_conditions, actions, priority) VALUES
('Lembrete 3 dias antes do vencimento', 'Envia lembrete 3 dias antes do vencimento',
 jsonb_build_object('daysOverdue', -3),
 jsonb_build_array(
   jsonb_build_object('type', 'email', 'delay', 0, 'template', (SELECT id FROM notification_templates WHERE name = 'Lembrete de Pagamento - Email'))
 ), 1),

('Aviso de atraso - 5 dias', 'Envia aviso após 5 dias de atraso',
 jsonb_build_object('daysOverdue', 5),
 jsonb_build_array(
   jsonb_build_object('type', 'email', 'delay', 0, 'template', (SELECT id FROM notification_templates WHERE name = 'Aviso de Atraso - Email'))
 ), 2),

('Aviso final - 15 dias', 'Envia aviso final após 15 dias de atraso',
 jsonb_build_object('daysOverdue', 15),
 jsonb_build_array(
   jsonb_build_object('type', 'email', 'delay', 0, 'template', (SELECT id FROM notification_templates WHERE name = 'Aviso Final - Email'))
 ), 3),

('Cobrança - 30 dias', 'Inicia processo de cobrança após 30 dias',
 jsonb_build_object('daysOverdue', 30),
 jsonb_build_array(
   jsonb_build_object('type', 'email', 'delay', 0, 'template', (SELECT id FROM notification_templates WHERE name = 'Cobrança - Email')),
   jsonb_build_object('type', 'call', 'delay', 1, 'template', 'call_script_1')
 ), 4);

-- Create indexes on JSONB columns for better performance
CREATE INDEX idx_delinquency_rules_trigger_conditions_gin ON delinquency_rules USING GIN (trigger_conditions);
CREATE INDEX idx_delinquency_rules_actions_gin ON delinquency_rules USING GIN (actions);
CREATE INDEX idx_customer_risk_profiles_payment_history_gin ON customer_risk_profiles USING GIN (payment_history);
CREATE INDEX idx_collection_workflows_action_history_gin ON collection_workflows USING GIN (action_history);

COMMIT;