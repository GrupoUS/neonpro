-- =====================================================
-- NeonPro - Sistema de Faturamento e Pagamentos
-- Task 7: Billing and Payment System
-- =====================================================

-- Enum para tipos de serviços
CREATE TYPE service_type AS ENUM (
  'consultation',
  'treatment',
  'procedure',
  'package',
  'maintenance'
);

-- Enum para status de faturas
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'pending',
  'paid',
  'overdue',
  'cancelled',
  'refunded'
);

-- Enum para métodos de pagamento
CREATE TYPE payment_method AS ENUM (
  'cash',
  'debit_card',
  'credit_card',
  'pix',
  'bank_transfer',
  'installments',
  'insurance'
);

-- Enum para status de pagamentos
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Enum para tipos de desconto
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'promotional',
  'loyalty',
  'insurance_covered'
);

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Serviços
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type service_type NOT NULL DEFAULT 'consultation',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER DEFAULT 60,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  requires_appointment BOOLEAN DEFAULT true,
  max_sessions INTEGER, -- Para pacotes/tratamentos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de Planos de Preços
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Plano Básico", "Plano Premium"
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sessions_included INTEGER DEFAULT 1,
  validity_days INTEGER, -- Validade do plano em dias
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Faturas/Orçamentos
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Número sequencial da fatura
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id), -- Opcional, se vinculada a agendamento
  status invoice_status DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  payment_terms TEXT, -- Condições de pagamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de Itens da Fatura
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_type discount_type,
  discount_value DECIMAL(10,2) DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  total DECIMAL(10,2) NOT NULL, -- subtotal - discount
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  external_id VARCHAR(255), -- ID do gateway de pagamento
  gateway VARCHAR(100), -- stripe, mercadopago, etc.
  installments INTEGER DEFAULT 1,
  installment_number INTEGER DEFAULT 1,
  fees DECIMAL(10,2) DEFAULT 0.00, -- Taxas do gateway
  net_amount DECIMAL(10,2), -- Valor líquido após taxas
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de Parcelas (para pagamentos parcelados)
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status payment_status DEFAULT 'pending',
  external_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações Financeiras
CREATE TABLE financial_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name VARCHAR(255),
  cnpj VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  tax_rate DECIMAL(5,2) DEFAULT 0.00, -- Taxa de imposto padrão
  default_payment_terms TEXT,
  invoice_prefix VARCHAR(10) DEFAULT 'INV', -- Prefixo das faturas
  next_invoice_number INTEGER DEFAULT 1,
  payment_prefix VARCHAR(10) DEFAULT 'PAY', -- Prefixo dos pagamentos
  next_payment_number INTEGER DEFAULT 1,
  default_due_days INTEGER DEFAULT 30, -- Prazo padrão para vencimento
  late_fee_percentage DECIMAL(5,2) DEFAULT 0.00, -- Multa por atraso
  discount_limit_percentage DECIMAL(5,2) DEFAULT 100.00, -- Limite de desconto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_financial_settings_updated_at
  BEFORE UPDATE ON financial_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para calcular totais da fatura
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_subtotal DECIMAL(10,2) := 0;
  invoice_total DECIMAL(10,2) := 0;
BEGIN
  -- Calcular subtotal dos itens
  SELECT 
    COALESCE(SUM(total), 0) INTO invoice_total,
    COALESCE(SUM(subtotal), 0) INTO invoice_subtotal
  FROM invoice_items 
  WHERE invoice_id = NEW.invoice_id;
  
  -- Atualizar a fatura
  UPDATE invoices 
  SET 
    subtotal = invoice_subtotal,
    total_amount = invoice_total
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para recalcular totais quando itens são modificados
CREATE TRIGGER calculate_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Função para gerar número da fatura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  settings RECORD;
  new_number INTEGER;
BEGIN
  -- Buscar configurações
  SELECT * INTO settings FROM financial_settings ORDER BY created_at DESC LIMIT 1;
  
  IF settings IS NULL THEN
    -- Criar configurações padrão se não existir
    INSERT INTO financial_settings (invoice_prefix, next_invoice_number) 
    VALUES ('INV', 1) RETURNING * INTO settings;
  END IF;
  
  -- Gerar número da fatura
  new_number := settings.next_invoice_number;
  NEW.invoice_number := settings.invoice_prefix || '-' || LPAD(new_number::TEXT, 6, '0');
  
  -- Atualizar próximo número
  UPDATE financial_settings 
  SET next_invoice_number = new_number + 1 
  WHERE id = settings.id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar número da fatura automaticamente
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Função para gerar número do pagamento
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  settings RECORD;
  new_number INTEGER;
BEGIN
  -- Buscar configurações
  SELECT * INTO settings FROM financial_settings ORDER BY created_at DESC LIMIT 1;
  
  IF settings IS NULL THEN
    -- Criar configurações padrão se não existir
    INSERT INTO financial_settings (payment_prefix, next_payment_number) 
    VALUES ('PAY', 1) RETURNING * INTO settings;
  END IF;
  
  -- Gerar número do pagamento
  new_number := settings.next_payment_number;
  NEW.payment_number := settings.payment_prefix || '-' || LPAD(new_number::TEXT, 6, '0');
  
  -- Atualizar próximo número
  UPDATE financial_settings 
  SET next_payment_number = new_number + 1 
  WHERE id = settings.id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar número do pagamento automaticamente
CREATE TRIGGER generate_payment_number_trigger
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION generate_payment_number();

-- Função para atualizar status da fatura baseado nos pagamentos
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_record RECORD;
  total_paid DECIMAL(10,2);
  new_status invoice_status;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO invoice_record FROM invoices WHERE id = NEW.invoice_id;
  
  -- Calcular total pago
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments 
  WHERE invoice_id = NEW.invoice_id AND status = 'completed';
  
  -- Determinar novo status
  IF total_paid >= invoice_record.total_amount THEN
    new_status := 'paid';
  ELSIF total_paid > 0 THEN
    new_status := 'pending'; -- Parcialmente pago
  ELSIF invoice_record.due_date < CURRENT_DATE THEN
    new_status := 'overdue';
  ELSE
    new_status := 'pending';
  END IF;
  
  -- Atualizar status da fatura
  UPDATE invoices 
  SET 
    status = new_status,
    paid_amount = total_paid
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar status da fatura quando pagamento é modificado
CREATE TRIGGER update_invoice_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para performance
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_category ON services(category);

CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_number ON payments(payment_number);

CREATE INDEX idx_installments_payment ON installments(payment_id);
CREATE INDEX idx_installments_invoice ON installments(invoice_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status ON installments(status);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_settings ENABLE ROW LEVEL SECURITY;

-- Policies para services
CREATE POLICY "Serviços são visíveis para usuários autenticados" ON services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admins podem inserir serviços" ON services
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Apenas admins podem atualizar serviços" ON services
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Apenas admins podem deletar serviços" ON services
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policies para pricing_plans
CREATE POLICY "Planos são visíveis para usuários autenticados" ON pricing_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Apenas admins podem gerenciar planos" ON pricing_plans
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policies para invoices
CREATE POLICY "Usuários podem ver suas próprias faturas" ON invoices
  FOR SELECT TO authenticated USING (
    patient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Apenas staff pode criar faturas" ON invoices
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Apenas staff pode atualizar faturas" ON invoices
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Apenas admins podem deletar faturas" ON invoices
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policies para invoice_items
CREATE POLICY "Itens seguem política da fatura" ON invoice_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE id = invoice_id AND (
        patient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
        )
      )
    )
  );

CREATE POLICY "Apenas staff pode gerenciar itens da fatura" ON invoice_items
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Policies para payments
CREATE POLICY "Pagamentos seguem política da fatura" ON payments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE id = invoice_id AND (
        patient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
        )
      )
    )
  );

CREATE POLICY "Apenas staff pode gerenciar pagamentos" ON payments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Policies para installments
CREATE POLICY "Parcelas seguem política do pagamento" ON installments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      WHERE p.id = payment_id AND (
        i.patient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
        )
      )
    )
  );

CREATE POLICY "Apenas staff pode gerenciar parcelas" ON installments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
    )
  );

-- Policies para financial_settings
CREATE POLICY "Apenas admins podem ver configurações financeiras" ON financial_settings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Apenas admins podem gerenciar configurações financeiras" ON financial_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações financeiras padrão
INSERT INTO financial_settings (
  clinic_name,
  invoice_prefix,
  next_invoice_number,
  payment_prefix,
  next_payment_number,
  default_due_days,
  tax_rate
) VALUES (
  'NeonPro Clinic',
  'NP',
  1,
  'PAY',
  1,
  30,
  0.00
) ON CONFLICT DO NOTHING;

-- Inserir alguns serviços padrão
INSERT INTO services (name, description, type, base_price, duration_minutes, category, created_by) VALUES 
  ('Consulta Dermatológica', 'Consulta inicial com dermatologista', 'consultation', 250.00, 60, 'Dermatologia', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('Limpeza de Pele', 'Limpeza facial profunda', 'treatment', 180.00, 90, 'Estética', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('Botox Facial', 'Aplicação de toxina botulínica', 'procedure', 800.00, 45, 'Procedimentos', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('Pacote Anti-aging', 'Tratamento completo anti-envelhecimento', 'package', 2500.00, 120, 'Pacotes', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('Retorno/Avaliação', 'Consulta de retorno ou avaliação', 'consultation', 120.00, 30, 'Consultas', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Inserir planos de preços para alguns serviços
INSERT INTO pricing_plans (service_id, name, description, price, sessions_included, validity_days) 
SELECT 
  s.id,
  'Plano Mensal - ' || s.name,
  'Plano mensal com desconto',
  s.base_price * 0.85,
  4,
  30
FROM services s 
WHERE s.type IN ('consultation', 'treatment')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE services IS 'Tabela de serviços oferecidos pela clínica';
COMMENT ON TABLE pricing_plans IS 'Planos de preços e pacotes para os serviços';
COMMENT ON TABLE invoices IS 'Faturas e orçamentos emitidos';
COMMENT ON TABLE invoice_items IS 'Itens detalhados de cada fatura';
COMMENT ON TABLE payments IS 'Pagamentos realizados';
COMMENT ON TABLE installments IS 'Parcelas de pagamentos parcelados';
COMMENT ON TABLE financial_settings IS 'Configurações financeiras da clínica';
