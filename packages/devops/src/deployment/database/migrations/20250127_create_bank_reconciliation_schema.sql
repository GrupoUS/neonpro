-- NeonPro - Bank Reconciliation Schema
-- Story 6.1 - Task 4: Bank Reconciliation System
-- Database schema for comprehensive bank reconciliation functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Bank Statements table
CREATE TABLE IF NOT EXISTS bank_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    statement_date TIMESTAMPTZ NOT NULL,
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credits DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_debits DECIMAL(15,2) NOT NULL DEFAULT 0,
    statement_period_start TIMESTAMPTZ NOT NULL,
    statement_period_end TIMESTAMPTZ NOT NULL,
    file_path TEXT,
    import_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bank Transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
    transaction_date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(100),
    debit_amount DECIMAL(15,2),
    credit_amount DECIMAL(15,2),
    balance DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
    category VARCHAR(100),
    matched_payment_id UUID REFERENCES payments(id),
    reconciliation_status VARCHAR(20) NOT NULL DEFAULT 'unmatched' CHECK (reconciliation_status IN ('unmatched', 'matched', 'disputed', 'ignored')),
    matching_confidence DECIMAL(3,2) CHECK (matching_confidence >= 0 AND matching_confidence <= 1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure either debit or credit amount is provided
    CONSTRAINT check_amount CHECK (
        (debit_amount IS NOT NULL AND credit_amount IS NULL) OR
        (debit_amount IS NULL AND credit_amount IS NOT NULL)
    )
);

-- Reconciliation Rules table
CREATE TABLE IF NOT EXISTS reconciliation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('exact_match', 'amount_match', 'date_range_match', 'description_pattern', 'reference_match')),
    conditions JSONB NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    auto_match BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reconciliation Discrepancies table
CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
    discrepancy_type VARCHAR(50) NOT NULL CHECK (discrepancy_type IN ('missing_transaction', 'duplicate_transaction', 'amount_mismatch', 'date_mismatch', 'unmatched_payment')),
    description TEXT NOT NULL,
    expected_amount DECIMAL(15,2),
    actual_amount DECIMAL(15,2),
    transaction_id UUID REFERENCES bank_transactions(id),
    payment_id UUID REFERENCES payments(id),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reconciliation Audit Trail table
CREATE TABLE IF NOT EXISTS reconciliation_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID REFERENCES bank_statements(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('import', 'match', 'unmatch', 'dispute', 'resolve', 'ignore', 'manual_adjustment')),
    old_values JSONB,
    new_values JSONB,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_bank_statements_account_date ON bank_statements(account_number, statement_date);
CREATE INDEX IF NOT EXISTS idx_bank_statements_created_by ON bank_statements(created_by);
CREATE INDEX IF NOT EXISTS idx_bank_statements_import_status ON bank_statements(import_status);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement_id ON bank_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_amount ON bank_transactions(debit_amount, credit_amount);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON bank_transactions(reconciliation_status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_matched_payment ON bank_transactions(matched_payment_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reference ON bank_transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_description_gin ON bank_transactions USING gin(description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_active ON reconciliation_rules(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_type ON reconciliation_rules(rule_type);

CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_statement ON reconciliation_discrepancies(statement_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_status ON reconciliation_discrepancies(status, severity);
CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_type ON reconciliation_discrepancies(discrepancy_type);

CREATE INDEX IF NOT EXISTS idx_reconciliation_audit_statement ON reconciliation_audit_trail(statement_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_audit_transaction ON reconciliation_audit_trail(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_audit_action ON reconciliation_audit_trail(action_type, created_at);

-- Views for analysis and reporting

-- Bank Statement Summary View
CREATE OR REPLACE VIEW bank_statement_summary AS
SELECT 
    bs.id,
    bs.bank_name,
    bs.account_number,
    bs.statement_date,
    bs.opening_balance,
    bs.closing_balance,
    bs.total_credits,
    bs.total_debits,
    bs.import_status,
    COUNT(bt.id) as total_transactions,
    COUNT(CASE WHEN bt.reconciliation_status = 'matched' THEN 1 END) as matched_transactions,
    COUNT(CASE WHEN bt.reconciliation_status = 'unmatched' THEN 1 END) as unmatched_transactions,
    COUNT(CASE WHEN bt.reconciliation_status = 'disputed' THEN 1 END) as disputed_transactions,
    ROUND(
        CASE 
            WHEN COUNT(bt.id) > 0 THEN 
                (COUNT(CASE WHEN bt.reconciliation_status = 'matched' THEN 1 END)::DECIMAL / COUNT(bt.id)) * 100
            ELSE 0
        END, 2
    ) as reconciliation_percentage,
    COUNT(rd.id) as open_discrepancies
FROM bank_statements bs
LEFT JOIN bank_transactions bt ON bs.id = bt.statement_id
LEFT JOIN reconciliation_discrepancies rd ON bs.id = rd.statement_id AND rd.status = 'open'
GROUP BY bs.id, bs.bank_name, bs.account_number, bs.statement_date, 
         bs.opening_balance, bs.closing_balance, bs.total_credits, bs.total_debits, bs.import_status;

-- Unmatched Transactions View
CREATE OR REPLACE VIEW unmatched_transactions_view AS
SELECT 
    bt.id,
    bt.statement_id,
    bs.bank_name,
    bs.account_number,
    bt.transaction_date,
    bt.description,
    bt.reference_number,
    COALESCE(bt.debit_amount, bt.credit_amount) as amount,
    bt.transaction_type,
    bt.matching_confidence,
    bt.notes,
    EXTRACT(DAYS FROM NOW() - bt.transaction_date) as days_unmatched
FROM bank_transactions bt
JOIN bank_statements bs ON bt.statement_id = bs.id
WHERE bt.reconciliation_status = 'unmatched'
ORDER BY bt.transaction_date DESC;

-- Reconciliation Performance Metrics View
CREATE OR REPLACE VIEW reconciliation_performance_metrics AS
SELECT 
    DATE_TRUNC('month', bs.statement_date) as month,
    bs.bank_name,
    COUNT(DISTINCT bs.id) as statements_processed,
    COUNT(bt.id) as total_transactions,
    COUNT(CASE WHEN bt.reconciliation_status = 'matched' THEN 1 END) as matched_transactions,
    ROUND(
        CASE 
            WHEN COUNT(bt.id) > 0 THEN 
                (COUNT(CASE WHEN bt.reconciliation_status = 'matched' THEN 1 END)::DECIMAL / COUNT(bt.id)) * 100
            ELSE 0
        END, 2
    ) as avg_reconciliation_rate,
    COUNT(CASE WHEN bt.matching_confidence >= 0.9 THEN 1 END) as high_confidence_matches,
    COUNT(rd.id) as total_discrepancies,
    COUNT(CASE WHEN rd.severity = 'critical' THEN 1 END) as critical_discrepancies
FROM bank_statements bs
LEFT JOIN bank_transactions bt ON bs.id = bt.statement_id
LEFT JOIN reconciliation_discrepancies rd ON bs.id = rd.statement_id
GROUP BY DATE_TRUNC('month', bs.statement_date), bs.bank_name
ORDER BY month DESC, bs.bank_name;

-- Functions

-- Function to calculate reconciliation score
CREATE OR REPLACE FUNCTION calculate_reconciliation_score(statement_id_param UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_transactions INTEGER;
    matched_transactions INTEGER;
    score DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN reconciliation_status = 'matched' THEN 1 END)
    INTO total_transactions, matched_transactions
    FROM bank_transactions
    WHERE statement_id = statement_id_param;
    
    IF total_transactions = 0 THEN
        RETURN 0;
    END IF;
    
    score := (matched_transactions::DECIMAL / total_transactions) * 100;
    RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-mark old unmatched transactions
CREATE OR REPLACE FUNCTION mark_old_unmatched_transactions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE bank_transactions
    SET 
        reconciliation_status = 'ignored',
        notes = COALESCE(notes || ' | ', '') || 'Auto-ignored after 90 days unmatched',
        updated_at = NOW()
    WHERE 
        reconciliation_status = 'unmatched'
        AND transaction_date < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to detect potential duplicate transactions
CREATE OR REPLACE FUNCTION detect_duplicate_transactions(statement_id_param UUID)
RETURNS TABLE(
    transaction_id UUID,
    duplicate_transaction_id UUID,
    similarity_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t1.id as transaction_id,
        t2.id as duplicate_transaction_id,
        CASE 
            WHEN t1.description = t2.description 
                 AND ABS(COALESCE(t1.debit_amount, t1.credit_amount) - COALESCE(t2.debit_amount, t2.credit_amount)) < 0.01
                 AND ABS(EXTRACT(EPOCH FROM (t1.transaction_date - t2.transaction_date))) < 86400 -- 1 day
            THEN 1.0
            WHEN similarity(t1.description, t2.description) > 0.8
                 AND ABS(COALESCE(t1.debit_amount, t1.credit_amount) - COALESCE(t2.debit_amount, t2.credit_amount)) < 0.01
            THEN 0.9
            WHEN ABS(COALESCE(t1.debit_amount, t1.credit_amount) - COALESCE(t2.debit_amount, t2.credit_amount)) < 0.01
                 AND ABS(EXTRACT(EPOCH FROM (t1.transaction_date - t2.transaction_date))) < 86400
            THEN 0.7
            ELSE 0.0
        END as similarity_score
    FROM bank_transactions t1
    JOIN bank_transactions t2 ON t1.statement_id = t2.statement_id AND t1.id < t2.id
    WHERE 
        t1.statement_id = statement_id_param
        AND (
            (t1.description = t2.description 
             AND ABS(COALESCE(t1.debit_amount, t1.credit_amount) - COALESCE(t2.debit_amount, t2.credit_amount)) < 0.01)
            OR similarity(t1.description, t2.description) > 0.8
        )
    ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_bank_statements_updated_at
    BEFORE UPDATE ON bank_statements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_transactions_updated_at
    BEFORE UPDATE ON bank_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reconciliation_rules_updated_at
    BEFORE UPDATE ON reconciliation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reconciliation_discrepancies_updated_at
    BEFORE UPDATE ON reconciliation_discrepancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger function
CREATE OR REPLACE FUNCTION log_reconciliation_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log significant changes to bank transactions
        IF OLD.reconciliation_status != NEW.reconciliation_status 
           OR OLD.matched_payment_id IS DISTINCT FROM NEW.matched_payment_id THEN
            INSERT INTO reconciliation_audit_trail (
                transaction_id,
                action_type,
                old_values,
                new_values,
                performed_by
            ) VALUES (
                NEW.id,
                CASE 
                    WHEN NEW.reconciliation_status = 'matched' THEN 'match'
                    WHEN NEW.reconciliation_status = 'unmatched' THEN 'unmatch'
                    WHEN NEW.reconciliation_status = 'disputed' THEN 'dispute'
                    WHEN NEW.reconciliation_status = 'ignored' THEN 'ignore'
                    ELSE 'update'
                END,
                jsonb_build_object(
                    'reconciliation_status', OLD.reconciliation_status,
                    'matched_payment_id', OLD.matched_payment_id,
                    'matching_confidence', OLD.matching_confidence
                ),
                jsonb_build_object(
                    'reconciliation_status', NEW.reconciliation_status,
                    'matched_payment_id', NEW.matched_payment_id,
                    'matching_confidence', NEW.matching_confidence
                ),
                COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger
CREATE TRIGGER bank_transactions_audit_trigger
    AFTER UPDATE ON bank_transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_reconciliation_audit();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_audit_trail ENABLE ROW LEVEL SECURITY;

-- Bank Statements policies
CREATE POLICY "Users can view their own bank statements" ON bank_statements
    FOR SELECT USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

CREATE POLICY "Users can insert their own bank statements" ON bank_statements
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own bank statements" ON bank_statements
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

-- Bank Transactions policies
CREATE POLICY "Users can view bank transactions from their statements" ON bank_transactions
    FOR SELECT USING (statement_id IN (
        SELECT id FROM bank_statements WHERE created_by = auth.uid()
    ) OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

CREATE POLICY "Users can insert bank transactions to their statements" ON bank_transactions
    FOR INSERT WITH CHECK (statement_id IN (
        SELECT id FROM bank_statements WHERE created_by = auth.uid()
    ));

CREATE POLICY "Users can update bank transactions from their statements" ON bank_transactions
    FOR UPDATE USING (statement_id IN (
        SELECT id FROM bank_statements WHERE created_by = auth.uid()
    ) OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

-- Reconciliation Rules policies
CREATE POLICY "Users can view reconciliation rules" ON reconciliation_rules
    FOR SELECT USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

CREATE POLICY "Users can create reconciliation rules" ON reconciliation_rules
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their reconciliation rules" ON reconciliation_rules
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

-- Reconciliation Discrepancies policies
CREATE POLICY "Users can view discrepancies from their statements" ON reconciliation_discrepancies
    FOR SELECT USING (statement_id IN (
        SELECT id FROM bank_statements WHERE created_by = auth.uid()
    ) OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

CREATE POLICY "System can insert discrepancies" ON reconciliation_discrepancies
    FOR INSERT WITH CHECK (true); -- System-generated, no user restriction

CREATE POLICY "Users can update discrepancies from their statements" ON reconciliation_discrepancies
    FOR UPDATE USING (statement_id IN (
        SELECT id FROM bank_statements WHERE created_by = auth.uid()
    ) OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
    ));

-- Audit Trail policies
CREATE POLICY "Users can view audit trail for their data" ON reconciliation_audit_trail
    FOR SELECT USING (
        (statement_id IS NOT NULL AND statement_id IN (
            SELECT id FROM bank_statements WHERE created_by = auth.uid()
        ))
        OR (transaction_id IS NOT NULL AND transaction_id IN (
            SELECT bt.id FROM bank_transactions bt
            JOIN bank_statements bs ON bt.statement_id = bs.id
            WHERE bs.created_by = auth.uid()
        ))
        OR auth.uid() IN (
            SELECT user_id FROM user_roles WHERE role_name IN ('admin', 'financial_manager')
        )
    );

CREATE POLICY "System can insert audit trail" ON reconciliation_audit_trail
    FOR INSERT WITH CHECK (true); -- System-generated audit trail

-- Comments for documentation
COMMENT ON TABLE bank_statements IS 'Bank statements imported for reconciliation';
COMMENT ON TABLE bank_transactions IS 'Individual transactions from bank statements';
COMMENT ON TABLE reconciliation_rules IS 'Rules for automatic transaction matching';
COMMENT ON TABLE reconciliation_discrepancies IS 'Detected discrepancies during reconciliation';
COMMENT ON TABLE reconciliation_audit_trail IS 'Audit trail for all reconciliation activities';

COMMENT ON COLUMN bank_statements.import_status IS 'Status of the statement import process';
COMMENT ON COLUMN bank_transactions.reconciliation_status IS 'Current reconciliation status of the transaction';
COMMENT ON COLUMN bank_transactions.matching_confidence IS 'Confidence score (0-1) for automatic matching';
COMMENT ON COLUMN reconciliation_rules.auto_match IS 'Whether this rule can automatically match transactions';
COMMENT ON COLUMN reconciliation_discrepancies.severity IS 'Severity level of the discrepancy';

-- Create scheduled job to auto-ignore old unmatched transactions (if pg_cron is available)
-- This would typically be set up separately in the database
-- SELECT cron.schedule('auto-ignore-old-transactions', '0 2 * * *', 'SELECT mark_old_unmatched_transactions();');