-- Insert test data for Accounts Payable system
-- Story: 2.1 - Accounts Payable Management
-- Date: 2025-07-21

BEGIN;

-- Temporarily disable audit triggers for test data insertion
DROP TRIGGER IF EXISTS vendors_audit_trigger ON vendors;
DROP TRIGGER IF EXISTS accounts_payable_audit_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS ap_payments_audit_trigger ON ap_payments;

-- Insert expense categories
INSERT INTO expense_categories (category_code, category_name, description, is_active) VALUES
('SUPPLIES', 'Medical Supplies', 'Medical and clinical supplies', true),
('EQUIPMENT', 'Equipment', 'Medical equipment and instruments', true),
('UTILITIES', 'Utilities', 'Electricity, water, internet, phone', true),
('RENT', 'Rent & Facilities', 'Office rent and facility costs', true),
('SERVICES', 'Professional Services', 'Legal, accounting, consulting services', true),
('MAINTENANCE', 'Maintenance', 'Equipment and facility maintenance', true),
('MARKETING', 'Marketing', 'Advertising and marketing expenses', true),
('TRAINING', 'Training & Education', 'Staff training and education', true);

-- Insert test vendors
INSERT INTO vendors (
    vendor_code, company_name, contact_person, email, phone, 
    address_line1, city, state, postal_code, 
    tax_id, vendor_type, payment_terms_days, payment_method,
    is_active
) VALUES
('VEN001', 'MedSupply Brasil Ltda', 'Carlos Silva', 'carlos@medsupply.com.br', '11999887766',
 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567',
 '12.345.678/0001-90', 'supplier', 30, 'bank_transfer', true),
 
('VEN002', 'TechEquip Medical', 'Ana Santos', 'ana@techequip.com.br', '11888776655',
 'Av. Paulista, 456', 'São Paulo', 'SP', '04567-890',
 '98.765.432/0001-10', 'supplier', 45, 'bank_transfer', true),
 
('VEN003', 'Clínica Clean Services', 'João Costa', 'joao@clinicaclean.com', '11777665544',
 'Rua da Limpeza, 789', 'São Paulo', 'SP', '02345-678',
 '11.222.333/0001-44', 'service_provider', 15, 'pix', true),
 
('VEN004', 'Legal & Tax Consultoria', 'Maria Oliveira', 'maria@legaltax.com.br', '11666554433',
 'Rua dos Advogados, 321', 'São Paulo', 'SP', '03456-789',
 '44.555.666/0001-77', 'consultant', 30, 'bank_transfer', true),
 
('VEN005', 'PowerGrid Energia', 'Roberto Lima', 'roberto@powergrid.com.br', '11555443322',
 'Av. da Energia, 654', 'São Paulo', 'SP', '05678-901',
 '77.888.999/0001-33', 'supplier', 20, 'bank_transfer', true);

-- Insert test accounts payable
INSERT INTO accounts_payable (
    vendor_id, expense_category_id, invoice_number, invoice_date, due_date,
    gross_amount, tax_amount, net_amount, description, status, priority
) VALUES
-- Pending invoices
((SELECT id FROM vendors WHERE vendor_code = 'VEN001'),
 (SELECT id FROM expense_categories WHERE category_code = 'SUPPLIES'),
 'INV-2024-001', '2024-12-15', '2025-01-15', 2500.00, 250.00, 2750.00,
 'Suprimentos médicos mensais - seringas, luvas, máscaras', 'pending', 'normal'),

((SELECT id FROM vendors WHERE vendor_code = 'VEN002'),
 (SELECT id FROM expense_categories WHERE category_code = 'EQUIPMENT'),
 'EQ-2024-456', '2024-12-20', '2025-02-05', 15000.00, 1500.00, 16500.00,
 'Equipamento de laser para tratamentos estéticos', 'approved', 'high'),

((SELECT id FROM vendors WHERE vendor_code = 'VEN003'),
 (SELECT id FROM expense_categories WHERE category_code = 'SERVICES'),
 'SRV-789', '2025-01-01', '2025-01-16', 800.00, 80.00, 880.00,
 'Serviço de limpeza mensal da clínica', 'pending', 'normal'),

((SELECT id FROM vendors WHERE vendor_code = 'VEN004'),
 (SELECT id FROM expense_categories WHERE category_code = 'SERVICES'),
 'LEG-2024-999', '2024-12-30', '2025-01-30', 1200.00, 120.00, 1320.00,
 'Consultoria jurídica - adequação LGPD', 'approved', 'high'),

((SELECT id FROM vendors WHERE vendor_code = 'VEN005'),
 (SELECT id FROM expense_categories WHERE category_code = 'UTILITIES'),
 'PWR-DEC-24', '2024-12-31', '2025-01-20', 450.00, 45.00, 495.00,
 'Conta de energia elétrica - dezembro 2024', 'pending', 'normal'),

-- Overdue invoice
((SELECT id FROM vendors WHERE vendor_code = 'VEN001'),
 (SELECT id FROM expense_categories WHERE category_code = 'SUPPLIES'),
 'INV-2024-999', '2024-11-15', '2024-12-15', 1800.00, 180.00, 1980.00,
 'Suprimentos médicos - produtos dermocosméticos', 'overdue', 'urgent'),

-- Paid invoice  
((SELECT id FROM vendors WHERE vendor_code = 'VEN003'),
 (SELECT id FROM expense_categories WHERE category_code = 'SERVICES'),
 'SRV-NOV-24', '2024-11-01', '2024-11-16', 800.00, 80.00, 880.00,
 'Serviço de limpeza mensal - novembro 2024', 'paid', 'normal');

-- Update paid invoice
UPDATE accounts_payable 
SET paid_amount = net_amount, status = 'paid'
WHERE invoice_number = 'SRV-NOV-24';

-- Insert payment for the paid invoice
INSERT INTO ap_payments (
    accounts_payable_id, vendor_id, payment_date, payment_amount,
    payment_method, transaction_reference, status, notes
) VALUES
((SELECT id FROM accounts_payable WHERE invoice_number = 'SRV-NOV-24'),
 (SELECT id FROM vendors WHERE vendor_code = 'VEN003'),
 '2024-11-15', 880.00, 'pix', 'PIX-TXN-20241115-001',
 'completed', 'Pagamento via PIX efetuado pontualmente');

-- Insert recurring payment schedules
INSERT INTO payment_schedules (
    vendor_id, expense_category_id, schedule_name, description, amount,
    frequency, start_date, next_due_date, payment_day
) VALUES
((SELECT id FROM vendors WHERE vendor_code = 'VEN003'),
 (SELECT id FROM expense_categories WHERE category_code = 'SERVICES'),
 'Limpeza Mensal', 'Serviço de limpeza da clínica - recorrente mensal', 880.00,
 'monthly', '2024-01-01', '2025-02-01', 1),

((SELECT id FROM vendors WHERE vendor_code = 'VEN005'),
 (SELECT id FROM expense_categories WHERE category_code = 'UTILITIES'),
 'Energia Elétrica', 'Conta de energia elétrica mensal', 500.00,
 'monthly', '2024-01-01', '2025-02-20', 20),

((SELECT id FROM vendors WHERE vendor_code = 'VEN004'),
 (SELECT id FROM expense_categories WHERE category_code = 'SERVICES'),
 'Consultoria Trimestral', 'Consultoria jurídica e contábil trimestral', 3600.00,
 'quarterly', '2024-01-01', '2025-04-01', 1);

-- Recreate audit triggers for future operations
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

-- Display summary
SELECT 'Test data inserted successfully!' as message;

SELECT 
    'Vendors created: ' || COUNT(*) as summary
FROM vendors;

SELECT 
    'Expense categories created: ' || COUNT(*) as summary
FROM expense_categories;

SELECT 
    'Accounts payable created: ' || COUNT(*) as summary
FROM accounts_payable;

SELECT 
    'Payments recorded: ' || COUNT(*) as summary
FROM ap_payments;

SELECT 
    'Payment schedules created: ' || COUNT(*) as summary
FROM payment_schedules;
