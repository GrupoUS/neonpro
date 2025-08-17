-- =====================================================================================
-- NeonPro Budget & Approval Workflow System
-- Epic 6: Story 6.2 - Task 5: Budget & Approval Workflow
-- Created: 2025-01-26
-- =====================================================================================

-- Budget Management System
CREATE TABLE IF NOT EXISTS inventory_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES profiles(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'monthly', 'quarterly', 'annual', 'project'
    budget_type VARCHAR(100) NOT NULL, -- 'operational', 'expansion', 'emergency'
    total_amount DECIMAL(15,2) NOT NULL,
    allocated_amount DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - spent_amount) STORED,
    currency VARCHAR(3) DEFAULT 'BRL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'exhausted', 'expired'
    auto_approval_limit DECIMAL(15,2) DEFAULT 0,
    approval_required_above DECIMAL(15,2) DEFAULT 1000,
    cost_center VARCHAR(100),
    department VARCHAR(100),
    responsible_user_id UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget allocation tracking
CREATE TABLE IF NOT EXISTS budget_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES inventory_budgets(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    allocated_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    reserved_amount DECIMAL(15,2) DEFAULT 0, -- for pending orders
    allocation_percentage DECIMAL(5,2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order approval workflow
CREATE TABLE IF NOT EXISTS purchase_order_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL, -- reference to purchase_orders.id
    budget_id UUID REFERENCES inventory_budgets(id),
    approval_level INTEGER NOT NULL DEFAULT 1,
    approval_type VARCHAR(50) NOT NULL, -- 'budget', 'manager', 'director', 'automatic'
    required_role VARCHAR(100),
    required_amount_threshold DECIMAL(15,2),
    approver_user_id UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'
    approval_reason TEXT,
    rejection_reason TEXT,
    escalation_reason TEXT,
    auto_approved BOOLEAN DEFAULT FALSE,
    approval_deadline TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval workflow rules
CREATE TABLE IF NOT EXISTS approval_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES profiles(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL, -- 'amount_based', 'category_based', 'department_based'
    category VARCHAR(100),
    department VARCHAR(100),
    cost_center VARCHAR(100),
    min_amount DECIMAL(15,2) DEFAULT 0,
    max_amount DECIMAL(15,2),
    required_approvers INTEGER DEFAULT 1,
    approval_levels JSONB NOT NULL, -- array of approval level definitions
    auto_approval_enabled BOOLEAN DEFAULT FALSE,
    auto_approval_conditions JSONB DEFAULT '{}',
    escalation_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget variance tracking
CREATE TABLE IF NOT EXISTS budget_variances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES inventory_budgets(id) ON DELETE CASCADE,
    allocation_id UUID REFERENCES budget_allocations(id),
    variance_type VARCHAR(50) NOT NULL, -- 'overspend', 'underspend', 'forecast_variance'
    variance_amount DECIMAL(15,2) NOT NULL,
    variance_percentage DECIMAL(5,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    description TEXT,
    impact_analysis TEXT,
    corrective_action TEXT,
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost center management
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES profiles(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    manager_user_id UUID REFERENCES profiles(id),
    budget_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    parent_cost_center_id UUID REFERENCES cost_centers(id),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, code)
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Budget management indexes
CREATE INDEX IF NOT EXISTS idx_inventory_budgets_clinic_id ON inventory_budgets(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_budgets_status ON inventory_budgets(status);
CREATE INDEX IF NOT EXISTS idx_inventory_budgets_dates ON inventory_budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_inventory_budgets_type ON inventory_budgets(budget_type);

-- Budget allocation indexes
CREATE INDEX IF NOT EXISTS idx_budget_allocations_budget_id ON budget_allocations(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_category ON budget_allocations(category, subcategory);

-- Approval workflow indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_approvals_po_id ON purchase_order_approvals(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_approvals_status ON purchase_order_approvals(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_approvals_approver ON purchase_order_approvals(approver_user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_approvals_budget ON purchase_order_approvals(budget_id);

-- Workflow rules indexes
CREATE INDEX IF NOT EXISTS idx_approval_workflow_rules_clinic_id ON approval_workflow_rules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_rules_type ON approval_workflow_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_rules_active ON approval_workflow_rules(is_active);

-- Variance tracking indexes
CREATE INDEX IF NOT EXISTS idx_budget_variances_budget_id ON budget_variances(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_variances_type ON budget_variances(variance_type);
CREATE INDEX IF NOT EXISTS idx_budget_variances_status ON budget_variances(status);
CREATE INDEX IF NOT EXISTS idx_budget_variances_period ON budget_variances(period_start, period_end);

-- Cost center indexes
CREATE INDEX IF NOT EXISTS idx_cost_centers_clinic_id ON cost_centers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_code ON cost_centers(code);
CREATE INDEX IF NOT EXISTS idx_cost_centers_manager ON cost_centers(manager_user_id);

-- =====================================================================================
-- TRIGGERS AND AUTOMATED WORKFLOWS
-- =====================================================================================

-- Auto-update budget spent amounts when purchase orders are completed
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Update budget spent amount when a purchase order is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE inventory_budgets 
        SET spent_amount = spent_amount + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.budget_id;
    END IF;
    
    -- Update budget allocation spent amount
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE budget_allocations 
        SET spent_amount = spent_amount + NEW.total_amount,
            updated_at = NOW()
        WHERE budget_id = NEW.budget_id 
        AND category = NEW.category;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase order completion (this will be created when purchase_orders table exists)
-- CREATE TRIGGER trigger_update_budget_spent_amount
--     AFTER UPDATE ON purchase_orders
--     FOR EACH ROW
--     EXECUTE FUNCTION update_budget_spent_amount();

-- Auto-create budget variances when thresholds are exceeded
CREATE OR REPLACE FUNCTION check_budget_variances()
RETURNS TRIGGER AS $$
DECLARE
    variance_pct DECIMAL(5,2);
    severity_level VARCHAR(50);
BEGIN
    -- Calculate variance percentage
    IF NEW.total_amount > 0 THEN
        variance_pct := ((NEW.spent_amount - NEW.total_amount) / NEW.total_amount) * 100;
    ELSE
        variance_pct := 0;
    END IF;
    
    -- Determine severity
    IF variance_pct > 20 THEN
        severity_level := 'critical';
    ELSIF variance_pct > 10 THEN
        severity_level := 'high';
    ELSIF variance_pct > 5 THEN
        severity_level := 'medium';
    ELSE
        severity_level := 'low';
    END IF;
    
    -- Create variance record if overspending by more than 5%
    IF variance_pct > 5 THEN
        INSERT INTO budget_variances (
            budget_id,
            variance_type,
            variance_amount,
            variance_percentage,
            period_start,
            period_end,
            description,
            severity,
            status
        ) VALUES (
            NEW.id,
            'overspend',
            NEW.spent_amount - NEW.total_amount,
            variance_pct,
            NEW.start_date,
            NEW.end_date,
            'Budget overspend detected: ' || variance_pct || '% over allocated amount',
            severity_level,
            'active'
        )
        ON CONFLICT DO NOTHING; -- Avoid duplicate variance records
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_budget_variances
    AFTER UPDATE ON inventory_budgets
    FOR EACH ROW
    WHEN (NEW.spent_amount != OLD.spent_amount)
    EXECUTE FUNCTION check_budget_variances();

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================================

-- Enable RLS
ALTER TABLE inventory_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_variances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_budgets
CREATE POLICY "Users can view budgets for their clinic"
    ON inventory_budgets FOR SELECT
    USING (clinic_id = auth.uid() OR clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can manage budgets for their clinic"
    ON inventory_budgets FOR ALL
    USING (clinic_id = auth.uid() OR clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for budget_allocations
CREATE POLICY "Users can view budget allocations for their clinic"
    ON budget_allocations FOR SELECT
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ));

CREATE POLICY "Users can manage budget allocations for their clinic"
    ON budget_allocations FOR ALL
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ));

-- RLS Policies for purchase_order_approvals
CREATE POLICY "Users can view approvals for their clinic"
    ON purchase_order_approvals FOR SELECT
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ) OR approver_user_id = auth.uid());

CREATE POLICY "Users can manage approvals for their clinic"
    ON purchase_order_approvals FOR ALL
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ) OR approver_user_id = auth.uid());

-- Similar policies for other tables...
CREATE POLICY "Users can view workflow rules for their clinic"
    ON approval_workflow_rules FOR SELECT
    USING (clinic_id = auth.uid());

CREATE POLICY "Users can manage workflow rules for their clinic"
    ON approval_workflow_rules FOR ALL
    USING (clinic_id = auth.uid());

CREATE POLICY "Users can view variances for their clinic"
    ON budget_variances FOR SELECT
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ));

CREATE POLICY "Users can manage variances for their clinic"
    ON budget_variances FOR ALL
    USING (budget_id IN (
        SELECT id FROM inventory_budgets WHERE clinic_id = auth.uid()
    ));

CREATE POLICY "Users can view cost centers for their clinic"
    ON cost_centers FOR SELECT
    USING (clinic_id = auth.uid());

CREATE POLICY "Users can manage cost centers for their clinic"
    ON cost_centers FOR ALL
    USING (clinic_id = auth.uid());

-- =====================================================================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- =====================================================================================

-- Budget utilization view
CREATE OR REPLACE VIEW budget_utilization_summary AS
SELECT 
    b.id,
    b.clinic_id,
    b.name,
    b.budget_type,
    b.total_amount,
    b.spent_amount,
    b.remaining_amount,
    ROUND((b.spent_amount / NULLIF(b.total_amount, 0)) * 100, 2) as utilization_percentage,
    CASE 
        WHEN b.spent_amount > b.total_amount THEN 'over_budget'
        WHEN (b.spent_amount / NULLIF(b.total_amount, 0)) > 0.9 THEN 'high_utilization'
        WHEN (b.spent_amount / NULLIF(b.total_amount, 0)) > 0.7 THEN 'medium_utilization'
        ELSE 'low_utilization'
    END as utilization_status,
    b.start_date,
    b.end_date,
    CASE 
        WHEN NOW()::DATE > b.end_date THEN 'expired'
        WHEN NOW()::DATE < b.start_date THEN 'future'
        ELSE 'active'
    END as period_status,
    b.status,
    COUNT(v.id) as variance_count
FROM inventory_budgets b
LEFT JOIN budget_variances v ON b.id = v.budget_id AND v.status = 'active'
GROUP BY b.id, b.clinic_id, b.name, b.budget_type, b.total_amount, b.spent_amount, 
         b.remaining_amount, b.start_date, b.end_date, b.status;

-- Approval workflow performance view
CREATE OR REPLACE VIEW approval_workflow_performance AS
SELECT 
    a.budget_id,
    a.approval_type,
    COUNT(*) as total_approvals,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(a.approved_at, a.rejected_at, NOW()) - a.created_at))/3600) as avg_approval_time_hours,
    COUNT(CASE WHEN a.auto_approved = TRUE THEN 1 END) as auto_approved_count
FROM purchase_order_approvals a
WHERE a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY a.budget_id, a.approval_type;

-- =====================================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================================================

-- Insert sample budget
INSERT INTO inventory_budgets (
    clinic_id, name, budget_type, total_amount, start_date, end_date, 
    auto_approval_limit, approval_required_above, cost_center, department
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- placeholder clinic_id
    'Q1 2025 Inventory Budget',
    'operational',
    50000.00,
    '2025-01-01',
    '2025-03-31',
    1000.00,
    5000.00,
    'INV001',
    'Operations'
) ON CONFLICT DO NOTHING;

-- Insert sample approval workflow rule
INSERT INTO approval_workflow_rules (
    clinic_id, rule_name, rule_type, min_amount, required_approvers, 
    approval_levels, auto_approval_enabled, escalation_hours
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- placeholder clinic_id
    'Standard Purchase Approval',
    'amount_based',
    1000.00,
    1,
    '[{"level": 1, "role": "manager", "amount_threshold": 5000}, {"level": 2, "role": "director", "amount_threshold": 20000}]'::jsonb,
    true,
    24
) ON CONFLICT DO NOTHING;

-- Insert sample cost center
INSERT INTO cost_centers (
    clinic_id, code, name, department, budget_limit
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- placeholder clinic_id
    'INV001',
    'Inventory Management',
    'Operations',
    25000.00
) ON CONFLICT DO NOTHING;
