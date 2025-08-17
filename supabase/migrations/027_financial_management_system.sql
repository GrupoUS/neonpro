-- Financial Management Tables for Invoice Generation and Payment Tracking
-- Created: January 27, 2025
-- Standards: Brazilian NFSe compliance + Audit requirements

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    
    -- Invoice Details
    description TEXT NOT NULL,
    service_list_code VARCHAR(10), -- Brazilian service code for tax calculation
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Financial Amounts (in centavos for precision)
    subtotal_amount BIGINT NOT NULL CHECK (subtotal_amount >= 0),
    discount_amount BIGINT DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount BIGINT DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    
    -- Brazilian Compliance
    nfse_number VARCHAR(50),
    nfse_verification_code VARCHAR(50),
    nfse_status VARCHAR(20) DEFAULT 'pending' CHECK (nfse_status IN ('pending', 'issued', 'cancelled', 'rejected')),
    nfse_issued_at TIMESTAMP WITH TIME ZONE,
    nfse_xml_url TEXT,
    cnpj_issuer VARCHAR(14) NOT NULL,
    
    -- Invoice Status and Control
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'sent', 'paid', 'cancelled', 'overdue')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    
    -- Audit and Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Shadow Testing Validation
    shadow_validation_status VARCHAR(20) DEFAULT 'pending' CHECK (shadow_validation_status IN ('pending', 'validated', 'failed')),
    shadow_validation_at TIMESTAMP WITH TIME ZONE,
    shadow_variance DECIMAL(10,6) DEFAULT 0,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT positive_total CHECK (total_amount > 0),
    CONSTRAINT discount_not_greater_than_subtotal CHECK (discount_amount <= subtotal_amount),
    CONSTRAINT valid_due_date CHECK (due_date >= issue_date)
);

-- Invoice Items Table (detailed breakdown)
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Item Details
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
    discount_amount BIGINT DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    
    -- Service References
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE SET NULL,
    procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
    
    -- Brazilian Tax Information
    service_code VARCHAR(10),
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount BIGINT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amount CHECK (total_amount >= 0),
    CONSTRAINT valid_calculation CHECK (total_amount = (quantity * unit_price) - discount_amount)
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'financing', 'installment')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    
    -- Payment Processing
    external_transaction_id VARCHAR(100),
    payment_processor VARCHAR(50), -- Stone, PagSeguro, etc.
    authorization_code VARCHAR(100),
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    processed_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Fee and Processing Information
    processing_fee BIGINT DEFAULT 0,
    net_amount BIGINT, -- amount minus processing fees
    
    -- PIX specific (if applicable)
    pix_key VARCHAR(100),
    pix_qr_code TEXT,
    pix_copy_paste TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'
);

-- Payment Installments Table
CREATE TABLE payment_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Installment Details
    installment_number INTEGER NOT NULL CHECK (installment_number > 0),
    total_installments INTEGER NOT NULL CHECK (total_installments > 0),
    amount BIGINT NOT NULL CHECK (amount > 0),
    
    -- Scheduling
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Late fees and interest
    late_fee BIGINT DEFAULT 0,
    interest_amount BIGINT DEFAULT 0,
    final_amount BIGINT, -- amount + late_fee + interest_amount
    
    -- Payment processing
    payment_transaction_id VARCHAR(100),
    paid_amount BIGINT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_installment_number CHECK (installment_number <= total_installments),
    CONSTRAINT valid_final_amount CHECK (final_amount >= amount OR final_amount IS NULL)
);

-- Shadow Validation Table (for financial accuracy testing)
CREATE TABLE shadow_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference Information
    operation_type VARCHAR(50) NOT NULL, -- 'invoice_calculation', 'payment_processing', 'tax_calculation'
    reference_id UUID NOT NULL, -- invoice_id, payment_id, etc.
    reference_table VARCHAR(50) NOT NULL,
    
    -- Validation Results
    original_calculation JSONB NOT NULL,
    shadow_calculation JSONB NOT NULL,
    variance DECIMAL(15,6) DEFAULT 0,
    variance_percentage DECIMAL(8,4) DEFAULT 0,
    
    -- Validation Status
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'passed', 'failed', 'warning')),
    validation_message TEXT,
    
    -- Tolerances
    tolerance_absolute DECIMAL(15,6) DEFAULT 0.01,
    tolerance_percentage DECIMAL(8,4) DEFAULT 0.001,
    
    -- Audit
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validated_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Payment Reminders Table
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    installment_id UUID REFERENCES payment_installments(id) ON DELETE CASCADE,
    
    -- Reminder Details
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('pre_due', 'due', 'overdue', 'final_notice')),
    days_before_due INTEGER DEFAULT 0,
    days_after_due INTEGER DEFAULT 0,
    
    -- Delivery Information
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'whatsapp', 'phone')),
    recipient_contact VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Content
    subject VARCHAR(200),
    message TEXT,
    
    -- Response tracking
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_clinic_id ON invoices(clinic_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_nfse_status ON invoices(nfse_status);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_treatment_plan_id ON invoice_items(treatment_plan_id);
CREATE INDEX idx_invoice_items_procedure_id ON invoice_items(procedure_id);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_processed_at ON payments(processed_at);

CREATE INDEX idx_payment_installments_payment_id ON payment_installments(payment_id);
CREATE INDEX idx_payment_installments_invoice_id ON payment_installments(invoice_id);
CREATE INDEX idx_payment_installments_due_date ON payment_installments(due_date);
CREATE INDEX idx_payment_installments_status ON payment_installments(status);

CREATE INDEX idx_shadow_validations_reference ON shadow_validations(reference_table, reference_id);
CREATE INDEX idx_shadow_validations_status ON shadow_validations(validation_status);
CREATE INDEX idx_shadow_validations_operation_type ON shadow_validations(operation_type);

CREATE INDEX idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_payment_reminders_status ON payment_reminders(status);
CREATE INDEX idx_payment_reminders_delivery_method ON payment_reminders(delivery_method);

-- Row Level Security Policies

-- Invoices RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_policy" ON invoices
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'financial_manager' OR role = 'staff')
        )
    );

CREATE POLICY "invoices_insert_policy" ON invoices
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'financial_manager')
        )
    );

CREATE POLICY "invoices_update_policy" ON invoices
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'financial_manager')
        )
        AND status != 'paid' -- Cannot modify paid invoices
    );

CREATE POLICY "invoices_delete_policy" ON invoices
    FOR DELETE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
        AND status = 'draft' -- Can only delete draft invoices
    );

-- Invoice Items RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_access_policy" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid() 
                AND (role = 'admin' OR role = 'financial_manager' OR role = 'staff')
            )
        )
    );

-- Payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_access_policy" ON payments
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid() 
                AND (role = 'admin' OR role = 'financial_manager' OR role = 'staff')
            )
        )
    );

-- Payment Installments RLS
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_installments_access_policy" ON payment_installments
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid() 
                AND (role = 'admin' OR role = 'financial_manager' OR role = 'staff')
            )
        )
    );

-- Shadow Validations RLS (restricted to admins and financial managers)
ALTER TABLE shadow_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shadow_validations_access_policy" ON shadow_validations
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_clinic_access 
            WHERE role IN ('admin', 'financial_manager')
        )
    );

-- Payment Reminders RLS
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_reminders_access_policy" ON payment_reminders
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid() 
                AND (role = 'admin' OR role = 'financial_manager' OR role = 'staff')
            )
        )
    );

-- Audit Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_installments_updated_at BEFORE UPDATE ON payment_installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for automatic invoice numbering
CREATE OR REPLACE FUNCTION generate_invoice_number(clinic_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    clinic_code VARCHAR(10);
    current_year INTEGER;
    sequence_number INTEGER;
    invoice_number VARCHAR(50);
BEGIN
    -- Get clinic code from clinics table
    SELECT code INTO clinic_code FROM clinics WHERE id = clinic_uuid;
    
    IF clinic_code IS NULL THEN
        RAISE EXCEPTION 'Clinic not found for UUID %', clinic_uuid;
    END IF;
    
    -- Get current year
    current_year := EXTRACT(YEAR FROM CURRENT_TIMESTAMP);
    
    -- Get next sequence number for this clinic and year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM invoices 
    WHERE clinic_id = clinic_uuid 
    AND EXTRACT(YEAR FROM created_at) = current_year;
    
    -- Format: CLINIC-YYYY-NNNNNN
    invoice_number := clinic_code || '-' || current_year || '-' || LPAD(sequence_number::text, 6, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice totals with shadow validation
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_uuid UUID)
RETURNS TABLE(
    subtotal BIGINT,
    discount BIGINT,
    tax BIGINT,
    total BIGINT,
    shadow_variance DECIMAL(10,6)
) AS $$
DECLARE
    calc_subtotal BIGINT := 0;
    calc_discount BIGINT := 0;
    calc_tax BIGINT := 0;
    calc_total BIGINT := 0;
    shadow_subtotal BIGINT := 0;
    shadow_discount BIGINT := 0;
    shadow_tax BIGINT := 0;
    shadow_total BIGINT := 0;
    variance DECIMAL(10,6) := 0;
BEGIN
    -- Main calculation
    SELECT 
        COALESCE(SUM(quantity * unit_price), 0),
        COALESCE(SUM(discount_amount), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO calc_subtotal, calc_discount, calc_tax
    FROM invoice_items 
    WHERE invoice_id = invoice_uuid;
    
    calc_total := calc_subtotal - calc_discount + calc_tax;
    
    -- Shadow calculation (alternative method for validation)
    SELECT 
        COALESCE(SUM(total_amount + discount_amount - tax_amount), 0),
        COALESCE(SUM(discount_amount), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO shadow_subtotal, shadow_discount, shadow_tax
    FROM invoice_items 
    WHERE invoice_id = invoice_uuid;
    
    shadow_total := shadow_subtotal - shadow_discount + shadow_tax;
    
    -- Calculate variance
    IF calc_total > 0 THEN
        variance := ABS(calc_total - shadow_total)::DECIMAL / calc_total::DECIMAL * 100;
    END IF;
    
    -- Return both calculations
    RETURN QUERY SELECT calc_subtotal, calc_discount, calc_tax, calc_total, variance;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment status based on payments received
CREATE OR REPLACE FUNCTION update_invoice_payment_status(invoice_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_amount BIGINT;
    paid_amount BIGINT;
    new_status VARCHAR(20);
BEGIN
    -- Get invoice total
    SELECT invoices.total_amount INTO total_amount
    FROM invoices WHERE id = invoice_uuid;
    
    -- Get total paid amount
    SELECT COALESCE(SUM(amount), 0) INTO paid_amount
    FROM payments 
    WHERE invoice_id = invoice_uuid 
    AND status = 'completed';
    
    -- Determine new payment status
    IF paid_amount = 0 THEN
        new_status := 'pending';
    ELSIF paid_amount >= total_amount THEN
        new_status := 'paid';
    ELSE
        new_status := 'partial';
    END IF;
    
    -- Update invoice payment status
    UPDATE invoices 
    SET payment_status = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = invoice_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update payment status when payments change
CREATE OR REPLACE FUNCTION trigger_update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_invoice_payment_status(NEW.invoice_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_invoice_payment_status(OLD.invoice_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_update_status
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_update_payment_status();

-- Add some sample data for testing (optional)
-- This would typically be done through the application, but useful for development

-- Comments for documentation
COMMENT ON TABLE invoices IS 'Main invoices table with Brazilian NFSe compliance and shadow validation';
COMMENT ON TABLE invoice_items IS 'Detailed breakdown of invoice items linked to treatments and procedures';
COMMENT ON TABLE payments IS 'Payment records with support for multiple Brazilian payment methods';
COMMENT ON TABLE payment_installments IS 'Installment payment tracking with late fees and interest';
COMMENT ON TABLE shadow_validations IS 'Shadow testing results for financial calculation accuracy';
COMMENT ON TABLE payment_reminders IS 'Automated payment reminder system with multi-channel delivery';

COMMENT ON COLUMN invoices.subtotal_amount IS 'Amount in centavos for precision (divide by 100 for reais)';
COMMENT ON COLUMN invoices.nfse_number IS 'Brazilian electronic service invoice number';
COMMENT ON COLUMN invoices.shadow_validation_status IS 'Status of shadow testing validation for financial accuracy';
COMMENT ON COLUMN payments.pix_key IS 'PIX key for Brazilian instant payment system';
COMMENT ON COLUMN shadow_validations.variance_percentage IS 'Percentage variance between original and shadow calculations';
