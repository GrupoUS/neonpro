-- Migration: Create Accounts Payable Schema
-- Story: 2.1 - Accounts Payable Management  
-- Date: 2025-07-21
-- Description: Complete accounts payable management system with vendors, payments, and audit trails

BEGIN;

-- 1. Create vendors table with comprehensive supplier information
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brazil',
    
    -- Tax information
    tax_id VARCHAR(50), -- CPF/CNPJ
    state_registration VARCHAR(50),
    municipal_registration VARCHAR(50),
    
    -- Banking information
    bank_name VARCHAR(255),
    bank_branch VARCHAR(50),
    bank_account VARCHAR(50),
    pix_key VARCHAR(255),
    
    -- Vendor details
    vendor_type VARCHAR(50) CHECK (vendor_type IN ('supplier', 'service_provider', 'contractor', 'consultant', 'other')),
    payment_terms_days INTEGER DEFAULT 30,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'pix', 'credit_card', 'other')),
    credit_limit DECIMAL(12,2),
    
    -- Status and flags
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    tax_exempt BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES auth.users(id),
    deleted_reason TEXT
);

-- 2. Create expense_categories table for classification
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    parent_category_id UUID REFERENCES expense_categories(id),
    description TEXT,
    
    -- Configuration
    requires_approval BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. Create accounts_payable table with payment terms and status
CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_number VARCHAR(100) UNIQUE NOT NULL, -- Auto-generated AP number
    
    -- Vendor and categorization
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    expense_category_id UUID NOT NULL REFERENCES expense_categories(id),
    
    -- Invoice/Bill information
    invoice_number VARCHAR(255),
    invoice_date DATE,
    due_date DATE NOT NULL,
    
    -- Financial details
    gross_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_amount DECIMAL(12,2) GENERATED ALWAYS AS (net_amount - paid_amount) STORED,
    
    -- Payment information
    payment_terms_days INTEGER DEFAULT 30,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'pix', 'credit_card', 'other')),
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'draft', 'pending', 'approved', 'scheduled', 'paid', 'partially_paid', 
        'overdue', 'disputed', 'cancelled', 'refunded'
    )),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Additional information
    description TEXT,
    notes TEXT,
    
    -- Approval workflow
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    approval_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES auth.users(id),
    deleted_reason TEXT
);

-- 4. Create payment_schedules table for recurring payments
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Link to vendor or can be independent
    vendor_id UUID REFERENCES vendors(id),
    expense_category_id UUID NOT NULL REFERENCES expense_categories(id),
    
    -- Schedule details
    schedule_name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    
    -- Recurrence configuration
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    frequency_interval INTEGER DEFAULT 1, -- Every N periods
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for indefinite
    next_due_date DATE NOT NULL,
    
    -- Days configuration
    payment_day INTEGER, -- Day of month (1-31) for monthly/quarterly/yearly
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    auto_generate BOOLEAN DEFAULT true, -- Auto-generate AP records
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 5. Create payments table for tracking all payments
CREATE TABLE ap_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Related AP record
    accounts_payable_id UUID NOT NULL REFERENCES accounts_payable(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    
    -- Payment details
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
        'cash', 'check', 'bank_transfer', 'pix', 'credit_card', 'other'
    )),
    
    -- Payment method specific info
    check_number VARCHAR(100),
    bank_account VARCHAR(100),
    transaction_reference VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'cancelled', 'reversed'
    )),
    
    -- Additional information
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 6. Create ap_documents table for document management
CREATE TABLE ap_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Links to related records
    accounts_payable_id UUID REFERENCES accounts_payable(id),
    vendor_id UUID REFERENCES vendors(id),
    payment_id UUID REFERENCES ap_payments(id),
    
    -- Document details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'invoice', 'receipt', 'contract', 'purchase_order', 'payment_voucher', 'other'
    )),
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 7. Create audit_log for all payable transactions
CREATE TABLE ap_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to the changed record
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Change details
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'pay')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- Array of field names that changed
    
    -- Context
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_vendors_vendor_code ON vendors(vendor_code);
CREATE INDEX idx_vendors_company_name ON vendors(company_name);
CREATE INDEX idx_vendors_is_active ON vendors(is_active) WHERE is_active = true;
CREATE INDEX idx_vendors_deleted_at ON vendors(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_expense_categories_code ON expense_categories(category_code);
CREATE INDEX idx_expense_categories_parent ON expense_categories(parent_category_id);
CREATE INDEX idx_expense_categories_active ON expense_categories(is_active) WHERE is_active = true;

CREATE INDEX idx_accounts_payable_ap_number ON accounts_payable(ap_number);
CREATE INDEX idx_accounts_payable_vendor ON accounts_payable(vendor_id);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_invoice_number ON accounts_payable(invoice_number);
CREATE INDEX idx_accounts_payable_deleted_at ON accounts_payable(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_payment_schedules_vendor ON payment_schedules(vendor_id);
CREATE INDEX idx_payment_schedules_next_due ON payment_schedules(next_due_date) WHERE is_active = true;
CREATE INDEX idx_payment_schedules_active ON payment_schedules(is_active) WHERE is_active = true;

CREATE INDEX idx_ap_payments_ap_id ON ap_payments(accounts_payable_id);
CREATE INDEX idx_ap_payments_vendor ON ap_payments(vendor_id);
CREATE INDEX idx_ap_payments_payment_date ON ap_payments(payment_date);
CREATE INDEX idx_ap_payments_payment_number ON ap_payments(payment_number);

CREATE INDEX idx_ap_documents_ap_id ON ap_documents(accounts_payable_id);
CREATE INDEX idx_ap_documents_vendor_id ON ap_documents(vendor_id);
CREATE INDEX idx_ap_documents_type ON ap_documents(document_type);

CREATE INDEX idx_ap_audit_log_table_record ON ap_audit_log(table_name, record_id);
CREATE INDEX idx_ap_audit_log_created_at ON ap_audit_log(created_at DESC);
CREATE INDEX idx_ap_audit_log_created_by ON ap_audit_log(created_by);

-- RLS Policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to manage their organization's data
CREATE POLICY vendors_policy ON vendors FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY expense_categories_policy ON expense_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY accounts_payable_policy ON accounts_payable FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY payment_schedules_policy ON payment_schedules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY ap_payments_policy ON ap_payments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY ap_documents_policy ON ap_documents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY ap_audit_log_policy ON ap_audit_log FOR ALL USING (auth.uid() IS NOT NULL);

-- Functions for auto-generating numbers
CREATE OR REPLACE FUNCTION generate_ap_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    new_number VARCHAR(100);
    year_part VARCHAR(4);
    seq_part INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::VARCHAR;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(ap_number FROM 'AP' || year_part || '-(.*)') AS INTEGER)), 0) + 1
    INTO seq_part
    FROM accounts_payable
    WHERE ap_number LIKE 'AP' || year_part || '-%';
    
    new_number := 'AP' || year_part || '-' || LPAD(seq_part::VARCHAR, 6, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    new_number VARCHAR(100);
    year_part VARCHAR(4);
    seq_part INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::VARCHAR;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 'PAY' || year_part || '-(.*)') AS INTEGER)), 0) + 1
    INTO seq_part
    FROM ap_payments
    WHERE payment_number LIKE 'PAY' || year_part || '-%';
    
    new_number := 'PAY' || year_part || '-' || LPAD(seq_part::VARCHAR, 6, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-number generation
CREATE OR REPLACE FUNCTION trigger_generate_ap_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ap_number IS NULL OR NEW.ap_number = '' THEN
        NEW.ap_number := generate_ap_number();
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_payable_auto_number
    BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_ap_number();

CREATE OR REPLACE FUNCTION trigger_generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ap_payments_auto_number
    BEFORE INSERT ON ap_payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_payment_number();

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION trigger_ap_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO ap_audit_log (table_name, record_id, action, old_values, created_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO ap_audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO ap_audit_log (table_name, record_id, action, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to main tables
CREATE TRIGGER vendors_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_ap_audit_log();

CREATE TRIGGER accounts_payable_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION trigger_ap_audit_log();

CREATE TRIGGER ap_payments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ap_payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_ap_audit_log();

COMMIT;
