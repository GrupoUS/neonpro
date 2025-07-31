-- Migration: Create PIX Payments Table
-- Date: 2025-01-26
-- Description: Add support for Brazilian PIX instant payments

-- Create PIX payments table
CREATE TABLE IF NOT EXISTS pix_payments (
  id VARCHAR(255) PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  description TEXT,
  payer_name VARCHAR(255) NOT NULL,
  payer_document VARCHAR(20) NOT NULL,
  payer_email VARCHAR(255) NOT NULL,
  payer_bank VARCHAR(100),
  payer_info JSONB,
  qr_code TEXT NOT NULL,
  qr_code_image TEXT,
  pix_key VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pix_payments_status ON pix_payments(status);
CREATE INDEX IF NOT EXISTS idx_pix_payments_payer_document ON pix_payments(payer_document);
CREATE INDEX IF NOT EXISTS idx_pix_payments_created_at ON pix_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_pix_payments_expires_at ON pix_payments(expires_at);

-- Add PIX payment reference to main payments table
ALTER TABLE ap_payments 
ADD COLUMN IF NOT EXISTS pix_payment_id VARCHAR(255) REFERENCES pix_payments(id);

-- Create index for PIX payment reference
CREATE INDEX IF NOT EXISTS idx_ap_payments_pix_payment_id ON ap_payments(pix_payment_id);

-- Add payment method enum values if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check');
    ELSE
        -- Add PIX to existing enum if not present
        BEGIN
            ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'pix';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Update payment method column to use enum
ALTER TABLE ap_payments 
ALTER COLUMN payment_method TYPE payment_method_enum USING payment_method::payment_method_enum;

-- Create function to automatically expire PIX payments
CREATE OR REPLACE FUNCTION expire_pix_payments()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE pix_payments 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get PIX payment statistics
CREATE OR REPLACE FUNCTION get_pix_payment_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_payments BIGINT,
    total_amount DECIMAL(12,2),
    successful_payments BIGINT,
    successful_amount DECIMAL(12,2),
    pending_payments BIGINT,
    pending_amount DECIMAL(12,2),
    expired_payments BIGINT,
    expired_amount DECIMAL(12,2),
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_payments,
        COALESCE(SUM(amount), 0)::DECIMAL(12,2) as total_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END)::BIGINT as successful_payments,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount END), 0)::DECIMAL(12,2) as successful_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending_payments,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount END), 0)::DECIMAL(12,2) as pending_amount,
        COUNT(CASE WHEN status = 'expired' THEN 1 END)::BIGINT as expired_payments,
        COALESCE(SUM(CASE WHEN status = 'expired' THEN amount END), 0)::DECIMAL(12,2) as expired_amount,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0
        END as success_rate
    FROM pix_payments
    WHERE created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pix_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pix_payments_updated_at
    BEFORE UPDATE ON pix_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_pix_payments_updated_at();

-- Enable Row Level Security
ALTER TABLE pix_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own PIX payments" ON pix_payments
    FOR SELECT USING (
        payer_email = auth.email() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager', 'financial')
        )
    );

CREATE POLICY "Admins can insert PIX payments" ON pix_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager', 'financial')
        )
    );

CREATE POLICY "Admins can update PIX payments" ON pix_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager', 'financial')
        )
    );

-- Create view for PIX payment summary
CREATE OR REPLACE VIEW pix_payments_summary AS
SELECT 
    p.id,
    p.amount,
    p.currency,
    p.description,
    p.payer_name,
    p.payer_email,
    p.status,
    p.created_at,
    p.paid_at,
    p.expires_at,
    ap.id as main_payment_id,
    ap.payable_id,
    pt.name as patient_name
FROM pix_payments p
LEFT JOIN ap_payments ap ON ap.pix_payment_id = p.id
LEFT JOIN ap_payables pay ON pay.id = ap.payable_id
LEFT JOIN patients pt ON pt.id = pay.patient_id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON pix_payments TO authenticated;
GRANT SELECT ON pix_payments_summary TO authenticated;
GRANT EXECUTE ON FUNCTION expire_pix_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pix_payment_stats(DATE, DATE) TO authenticated;

-- Insert initial configuration
INSERT INTO payment_gateways (name, type, configuration, is_active) 
VALUES (
    'PIX Brazil',
    'pix',
    '{
        "environment": "sandbox",
        "merchant_name": "NeonPro Clinic",
        "merchant_city": "São Paulo",
        "default_expiration_minutes": 30,
        "webhook_enabled": true
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- Create comment for documentation
COMMENT ON TABLE pix_payments IS 'Brazilian PIX instant payment transactions';
COMMENT ON COLUMN pix_payments.qr_code IS 'PIX QR code data according to Brazilian Central Bank standards';
COMMENT ON COLUMN pix_payments.pix_key IS 'PIX key used for the transaction (clinic''s key)';
COMMENT ON COLUMN pix_payments.payer_document IS 'Payer''s CPF or CNPJ document number';
COMMENT ON FUNCTION expire_pix_payments() IS 'Automatically expires pending PIX payments that have passed their expiration time';
COMMENT ON FUNCTION get_pix_payment_stats(DATE, DATE) IS 'Returns PIX payment statistics for a given date range';
