-- Migration: Create Receipts and Invoices System Schema
-- Description: Tables and functions for receipt/invoice generation, NFSe integration, and email delivery
-- Author: APEX Master Developer
-- Date: 2025-01-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create receipts_invoices table
CREATE TABLE IF NOT EXISTS receipts_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receipt', 'invoice')),
    customer_id UUID NOT NULL,
    data JSONB NOT NULL,
    pdf_path TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    
    -- NFSe fields
    nfse_number VARCHAR(50),
    nfse_status VARCHAR(20) CHECK (nfse_status IN ('pending', 'issued', 'cancelled', 'error')),
    nfse_issued_at TIMESTAMPTZ,
    nfse_xml TEXT,
    nfse_error_message TEXT,
    
    -- Email delivery fields
    email_sent_at TIMESTAMPTZ,
    email_recipient VARCHAR(255),
    email_delivery_status VARCHAR(20) CHECK (email_delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    email_error_message TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Indexes
    CONSTRAINT fk_receipts_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receipt', 'invoice')),
    template_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create nfse_providers table
CREATE TABLE IF NOT EXISTS nfse_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('ginfes', 'issnet', 'webiss', 'simpliss')),
    city_code VARCHAR(10) NOT NULL,
    service_code VARCHAR(10),
    environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('production', 'sandbox')),
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(city_code, provider_type)
);

-- Create email_delivery_log table
CREATE TABLE IF NOT EXISTS email_delivery_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    message_id VARCHAR(255),
    delivery_status VARCHAR(20) NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    webhook_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_email_delivery_document FOREIGN KEY (document_id) REFERENCES receipts_invoices(id) ON DELETE CASCADE
);

-- Create document_audit_trail table
CREATE TABLE IF NOT EXISTS document_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_document_audit_document FOREIGN KEY (document_id) REFERENCES receipts_invoices(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_customer_id ON receipts_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_type ON receipts_invoices(type);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_status ON receipts_invoices(status);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_number ON receipts_invoices(number);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_created_at ON receipts_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_nfse_status ON receipts_invoices(nfse_status);
CREATE INDEX IF NOT EXISTS idx_receipts_invoices_email_status ON receipts_invoices(email_delivery_status);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_type ON invoice_templates(type);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_active ON invoice_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_default ON invoice_templates(is_default);

CREATE INDEX IF NOT EXISTS idx_nfse_providers_city ON nfse_providers(city_code);
CREATE INDEX IF NOT EXISTS idx_nfse_providers_active ON nfse_providers(is_active);

CREATE INDEX IF NOT EXISTS idx_email_delivery_document ON email_delivery_log(document_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_status ON email_delivery_log(delivery_status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_created ON email_delivery_log(created_at);

CREATE INDEX IF NOT EXISTS idx_document_audit_document ON document_audit_trail(document_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_action ON document_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_document_audit_created ON document_audit_trail(created_at);

-- Create views for reporting
CREATE OR REPLACE VIEW receipts_invoices_summary AS
SELECT 
    ri.id,
    ri.number,
    ri.type,
    ri.status,
    ri.customer_id,
    c.name as customer_name,
    c.email as customer_email,
    c.document as customer_document,
    (ri.data->>'total')::DECIMAL as total_amount,
    ri.nfse_number,
    ri.nfse_status,
    ri.email_sent_at,
    ri.email_delivery_status,
    ri.created_at,
    ri.updated_at
FROM receipts_invoices ri
LEFT JOIN customers c ON ri.customer_id = c.id;

CREATE OR REPLACE VIEW overdue_invoices AS
SELECT 
    ri.*,
    c.name as customer_name,
    c.email as customer_email,
    (ri.data->>'dueDate')::DATE as due_date,
    (ri.data->>'total')::DECIMAL as total_amount,
    CURRENT_DATE - (ri.data->>'dueDate')::DATE as days_overdue
FROM receipts_invoices ri
LEFT JOIN customers c ON ri.customer_id = c.id
WHERE ri.type = 'invoice'
  AND ri.status IN ('sent', 'overdue')
  AND (ri.data->>'dueDate')::DATE < CURRENT_DATE;

CREATE OR REPLACE VIEW email_delivery_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as delivery_date,
    delivery_status,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('day', created_at)) as percentage
FROM email_delivery_log
GROUP BY DATE_TRUNC('day', created_at), delivery_status
ORDER BY delivery_date DESC, delivery_status;

-- Create functions

-- Function to generate next document number
CREATE OR REPLACE FUNCTION generate_document_number(
    doc_type VARCHAR(20),
    prefix VARCHAR(10) DEFAULT NULL
)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    formatted_number VARCHAR(50);
    year_suffix VARCHAR(4);
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Get next sequential number for the document type and year
    SELECT COALESCE(MAX(
        CASE 
            WHEN number ~ '^[A-Z]*[0-9]+/' || year_suffix || '$' THEN
                SUBSTRING(number FROM '[0-9]+')::INTEGER
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM receipts_invoices
    WHERE type = doc_type
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Format the number
    IF prefix IS NOT NULL THEN
        formatted_number := prefix || LPAD(next_number::VARCHAR, 6, '0') || '/' || year_suffix;
    ELSE
        formatted_number := LPAD(next_number::VARCHAR, 6, '0') || '/' || year_suffix;
    END IF;
    
    RETURN formatted_number;
END;
$$;

-- Function to update document status with audit trail
CREATE OR REPLACE FUNCTION update_document_status(
    doc_id UUID,
    new_status VARCHAR(20),
    user_id UUID DEFAULT NULL,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    old_status VARCHAR(20);
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Get current status
    SELECT status INTO old_status
    FROM receipts_invoices
    WHERE id = doc_id;
    
    IF old_status IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update status
    UPDATE receipts_invoices
    SET status = new_status,
        updated_at = NOW()
    WHERE id = doc_id;
    
    -- Create audit trail entry
    old_data := jsonb_build_object('status', old_status);
    new_data := jsonb_build_object('status', new_status);
    
    INSERT INTO document_audit_trail (
        document_id,
        action,
        old_data,
        new_data,
        user_id,
        ip_address,
        user_agent
    ) VALUES (
        doc_id,
        'status_update',
        old_data,
        new_data,
        user_id,
        ip_address,
        user_agent
    );
    
    RETURN TRUE;
END;
$$;

-- Function to mark overdue invoices
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE receipts_invoices
    SET status = 'overdue',
        updated_at = NOW()
    WHERE type = 'invoice'
      AND status = 'sent'
      AND (data->>'dueDate')::DATE < CURRENT_DATE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log the bulk update
    INSERT INTO document_audit_trail (
        document_id,
        action,
        new_data
    )
    SELECT 
        id,
        'bulk_overdue_update',
        jsonb_build_object('updated_count', updated_count)
    FROM receipts_invoices
    WHERE status = 'overdue'
      AND updated_at >= NOW() - INTERVAL '1 minute';
    
    RETURN updated_count;
END;
$$;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_statistics(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_documents BIGINT,
    total_receipts BIGINT,
    total_invoices BIGINT,
    total_amount DECIMAL,
    paid_amount DECIMAL,
    overdue_amount DECIMAL,
    nfse_issued BIGINT,
    emails_sent BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_documents,
        COUNT(*) FILTER (WHERE type = 'receipt') as total_receipts,
        COUNT(*) FILTER (WHERE type = 'invoice') as total_invoices,
        COALESCE(SUM((data->>'total')::DECIMAL), 0) as total_amount,
        COALESCE(SUM((data->>'total')::DECIMAL) FILTER (WHERE status = 'paid'), 0) as paid_amount,
        COALESCE(SUM((data->>'total')::DECIMAL) FILTER (WHERE status = 'overdue'), 0) as overdue_amount,
        COUNT(*) FILTER (WHERE nfse_status = 'issued') as nfse_issued,
        COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as emails_sent
    FROM receipts_invoices
    WHERE (start_date IS NULL OR created_at::DATE >= start_date)
      AND (end_date IS NULL OR created_at::DATE <= end_date);
END;
$$;

-- Create triggers

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_receipts_invoices_updated_at
    BEFORE UPDATE ON receipts_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoice_templates_updated_at
    BEFORE UPDATE ON invoice_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_nfse_providers_updated_at
    BEFORE UPDATE ON nfse_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_email_delivery_log_updated_at
    BEFORE UPDATE ON email_delivery_log
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for audit trail on document changes
CREATE OR REPLACE FUNCTION create_document_audit_trail()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO document_audit_trail (
            document_id,
            action,
            old_data,
            new_data
        ) VALUES (
            NEW.id,
            'update',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO document_audit_trail (
            document_id,
            action,
            new_data
        ) VALUES (
            NEW.id,
            'create',
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO document_audit_trail (
            document_id,
            action,
            old_data
        ) VALUES (
            OLD.id,
            'delete',
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_receipts_invoices_audit
    AFTER INSERT OR UPDATE OR DELETE ON receipts_invoices
    FOR EACH ROW
    EXECUTE FUNCTION create_document_audit_trail();

-- Enable Row Level Security (RLS)
ALTER TABLE receipts_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfse_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Receipts and invoices policies
CREATE POLICY "Users can view their organization's documents" ON receipts_invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.organization_id = (
                  SELECT c.organization_id FROM customers c
                  WHERE c.id = receipts_invoices.customer_id
              )
        )
    );

CREATE POLICY "Users can create documents for their organization" ON receipts_invoices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.organization_id = (
                  SELECT c.organization_id FROM customers c
                  WHERE c.id = receipts_invoices.customer_id
              )
        )
    );

CREATE POLICY "Users can update their organization's documents" ON receipts_invoices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.organization_id = (
                  SELECT c.organization_id FROM customers c
                  WHERE c.id = receipts_invoices.customer_id
              )
        )
    );

-- Templates policies
CREATE POLICY "Users can view their organization's templates" ON invoice_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage templates" ON invoice_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.role IN ('admin', 'owner')
        )
    );

-- NFSe providers policies
CREATE POLICY "Admins can manage NFSe providers" ON nfse_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.role IN ('admin', 'owner')
        )
    );

-- Email delivery log policies
CREATE POLICY "Users can view email logs for their documents" ON email_delivery_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM receipts_invoices ri
            JOIN customers c ON ri.customer_id = c.id
            JOIN user_profiles up ON c.organization_id = up.organization_id
            WHERE ri.id = email_delivery_log.document_id
              AND up.user_id = auth.uid()
        )
    );

-- Audit trail policies
CREATE POLICY "Users can view audit trail for their documents" ON document_audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM receipts_invoices ri
            JOIN customers c ON ri.customer_id = c.id
            JOIN user_profiles up ON c.organization_id = up.organization_id
            WHERE ri.id = document_audit_trail.document_id
              AND up.user_id = auth.uid()
        )
    );

-- Insert default templates
INSERT INTO invoice_templates (name, type, template_data, is_default, is_active) VALUES
('Template Moderno - Recibo', 'receipt', '{
  "template": "modern",
  "colors": {
    "primary": "#2563eb",
    "secondary": "#64748b",
    "accent": "#10b981"
  },
  "fonts": {
    "header": "Helvetica-Bold",
    "body": "Helvetica"
  },
  "layout": {
    "showLogo": true,
    "showWatermark": false,
    "headerHeight": 120,
    "footerHeight": 80
  }
}', true, true),
('Template Moderno - Fatura', 'invoice', '{
  "template": "modern",
  "colors": {
    "primary": "#2563eb",
    "secondary": "#64748b",
    "accent": "#10b981"
  },
  "fonts": {
    "header": "Helvetica-Bold",
    "body": "Helvetica"
  },
  "layout": {
    "showLogo": true,
    "showWatermark": false,
    "headerHeight": 120,
    "footerHeight": 80,
    "showDueDate": true,
    "showPaymentTerms": true
  }
}', true, true),
('Template Corporativo - Fatura', 'invoice', '{
  "template": "corporate",
  "colors": {
    "primary": "#1f2937",
    "secondary": "#6b7280",
    "accent": "#059669"
  },
  "fonts": {
    "header": "Helvetica-Bold",
    "body": "Helvetica"
  },
  "layout": {
    "showLogo": true,
    "showWatermark": true,
    "headerHeight": 140,
    "footerHeight": 100,
    "showDueDate": true,
    "showPaymentTerms": true,
    "showTaxBreakdown": true
  }
}', false, true);

-- Create scheduled job to mark overdue invoices (requires pg_cron extension)
-- SELECT cron.schedule('mark-overdue-invoices', '0 1 * * *', 'SELECT mark_overdue_invoices();');

COMMIT;