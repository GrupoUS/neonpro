-- Brazilian Tax System Integration Migration
-- Story 5.5: Comprehensive tax compliance for Brazilian healthcare providers

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tax Configurations Table
-- Store clinic tax settings and Brazilian tax regime information
CREATE TABLE IF NOT EXISTS tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Brazilian Tax Identification
    cnpj VARCHAR(18) NOT NULL, -- Format: XX.XXX.XXX/XXXX-XX
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    
    -- Tax Regime Configuration
    regime_tributario VARCHAR(50) NOT NULL DEFAULT 'simples_nacional', -- simples_nacional, lucro_presumido, lucro_real
    optante_simples_nacional BOOLEAN DEFAULT true,
    
    -- Tax Rates Configuration (percentages)
    icms_rate DECIMAL(5,2) DEFAULT 0.00,
    iss_rate DECIMAL(5,2) DEFAULT 5.00, -- ISS for services (typical 2-5%)
    pis_rate DECIMAL(5,2) DEFAULT 0.65,
    cofins_rate DECIMAL(5,2) DEFAULT 3.00,
    irpj_rate DECIMAL(5,2) DEFAULT 15.00,
    csll_rate DECIMAL(5,2) DEFAULT 9.00,
    
    -- Simples Nacional Configuration
    simples_nacional_anexo VARCHAR(10) DEFAULT 'III', -- Anexo III for services
    simples_nacional_rate DECIMAL(5,2) DEFAULT 6.00, -- Varies by revenue bracket
    
    -- Address Information for Tax Documents
    endereco JSONB NOT NULL DEFAULT '{
        "logradouro": "",
        "numero": "",
        "complemento": "",
        "bairro": "",
        "cidade": "",
        "uf": "",
        "cep": ""
    }'::jsonb,
    
    -- Configuration Status
    active BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- NFe Documents Table
-- Store Electronic Invoice (Nota Fiscal Eletrônica) information
CREATE TABLE IF NOT EXISTS nfe_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES billing_invoices(id), -- Link to billing system
    
    -- NFe Identification
    numero_nfe INTEGER NOT NULL,
    serie_nfe INTEGER DEFAULT 1,
    chave_acesso VARCHAR(44) UNIQUE, -- 44-digit access key
    
    -- Document Information
    tipo_documento VARCHAR(20) DEFAULT 'nfe', -- nfe, nfce, nfse
    modelo_documento VARCHAR(5) DEFAULT '55', -- 55 for NFe, 65 for NFCe
    natureza_operacao VARCHAR(100) DEFAULT 'Prestação de Serviços de Saúde',
    
    -- Tax Information
    valor_total DECIMAL(12,2) NOT NULL,
    valor_base_calculo DECIMAL(12,2),
    valor_icms DECIMAL(12,2) DEFAULT 0.00,
    valor_iss DECIMAL(12,2) DEFAULT 0.00,
    valor_pis DECIMAL(12,2) DEFAULT 0.00,
    valor_cofins DECIMAL(12,2) DEFAULT 0.00,
    
    -- Customer Information
    cliente_cnpj_cpf VARCHAR(18),
    cliente_nome VARCHAR(200),
    cliente_endereco JSONB,
    
    -- Services Information
    servicos JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of service items
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'draft', -- draft, authorized, cancelled, rejected
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    protocolo_autorizacao VARCHAR(50),
    
    -- XML and PDF Storage
    xml_content TEXT, -- NFe XML content
    pdf_url TEXT, -- PDF document URL
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Tax Calculations Table
-- Store detailed tax calculations for services and invoices
CREATE TABLE IF NOT EXISTS tax_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Related Documents
    invoice_id UUID REFERENCES billing_invoices(id),
    nfe_id UUID REFERENCES nfe_documents(id),
    
    -- Calculation Base Information
    valor_base DECIMAL(12,2) NOT NULL,
    tipo_servico VARCHAR(100) NOT NULL, -- Healthcare service type
    codigo_servico VARCHAR(10), -- Service code for tax purposes
    
    -- Individual Tax Calculations
    icms_calculation JSONB DEFAULT '{
        "base_calculo": 0,
        "aliquota": 0,
        "valor": 0,
        "situacao_tributaria": "N"
    }'::jsonb,
    
    iss_calculation JSONB DEFAULT '{
        "base_calculo": 0,
        "aliquota": 0,
        "valor": 0,
        "codigo_municipio": ""
    }'::jsonb,
    
    pis_calculation JSONB DEFAULT '{
        "base_calculo": 0,
        "aliquota": 0,
        "valor": 0,
        "situacao_tributaria": "01"
    }'::jsonb,
    
    cofins_calculation JSONB DEFAULT '{
        "base_calculo": 0,
        "aliquota": 0,
        "valor": 0,
        "situacao_tributaria": "01"
    }'::jsonb,
    
    -- Simples Nacional Calculation
    simples_nacional_calculation JSONB DEFAULT '{
        "aliquota": 0,
        "valor": 0,
        "anexo": "III"
    }'::jsonb,
    
    -- Total Tax Information
    total_impostos DECIMAL(12,2) GENERATED ALWAYS AS (
        COALESCE((icms_calculation->>'valor')::decimal, 0) +
        COALESCE((iss_calculation->>'valor')::decimal, 0) +
        COALESCE((pis_calculation->>'valor')::decimal, 0) +
        COALESCE((cofins_calculation->>'valor')::decimal, 0) +
        COALESCE((simples_nacional_calculation->>'valor')::decimal, 0)
    ) STORED,
    
    -- Calculation Metadata
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calculation_method VARCHAR(50) DEFAULT 'automatic', -- automatic, manual, imported
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SPED Entries Table
-- Store digital bookkeeping entries for SPED compliance
CREATE TABLE IF NOT EXISTS sped_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- SPED Information
    periodo_apuracao DATE NOT NULL, -- Monthly period (YYYY-MM-01)
    tipo_escrituracao VARCHAR(20) DEFAULT 'ECD', -- ECD, ECF, EFD
    
    -- Entry Details
    codigo_conta VARCHAR(20) NOT NULL, -- Chart of accounts code
    descricao_conta VARCHAR(200) NOT NULL,
    valor_debito DECIMAL(12,2) DEFAULT 0.00,
    valor_credito DECIMAL(12,2) DEFAULT 0.00,
    
    -- Document References
    numero_documento VARCHAR(50),
    data_documento DATE,
    historico TEXT,
    
    -- Tax Related Information
    cfop VARCHAR(10), -- Código Fiscal de Operações e Prestações
    cst_pis VARCHAR(5), -- Situação Tributária PIS
    cst_cofins VARCHAR(5), -- Situação Tributária COFINS
    
    -- Entry Classification
    natureza_operacao VARCHAR(100),
    origem_lancamento VARCHAR(20) DEFAULT 'system', -- system, manual, imported
    
    -- Validation and Status
    validado BOOLEAN DEFAULT false,
    data_validacao TIMESTAMP WITH TIME ZONE,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax Compliance Reports Table
-- Store generated compliance reports and submissions
CREATE TABLE IF NOT EXISTS tax_compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Report Information
    tipo_relatorio VARCHAR(50) NOT NULL, -- sped_ecd, sped_ecf, livro_registro, dctf
    periodo_referencia DATE NOT NULL, -- Reference period
    descricao VARCHAR(200),
    
    -- Report Data
    conteudo_relatorio JSONB NOT NULL DEFAULT '{}'::jsonb,
    arquivo_gerado TEXT, -- File path or URL
    hash_arquivo VARCHAR(64), -- File integrity hash
    
    -- Submission Information
    status_envio VARCHAR(20) DEFAULT 'pending', -- pending, sent, accepted, rejected
    data_envio TIMESTAMP WITH TIME ZONE,
    protocolo_receita VARCHAR(50), -- Receipt protocol from tax authority
    
    -- Validation
    validacoes_executadas JSONB DEFAULT '[]'::jsonb,
    erros_encontrados JSONB DEFAULT '[]'::jsonb,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Service Tax Codes Table
-- Brazilian service classification for tax purposes
CREATE TABLE IF NOT EXISTS service_tax_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Service Classification
    codigo_servico VARCHAR(10) PRIMARY KEY, -- Format: XX.XX
    descricao_servico TEXT NOT NULL,
    categoria VARCHAR(100),
    
    -- Tax Configuration
    iss_aliquota_minima DECIMAL(5,2) DEFAULT 2.00,
    iss_aliquota_maxima DECIMAL(5,2) DEFAULT 5.00,
    tributacao_pis_cofins VARCHAR(20) DEFAULT 'cumulativo', -- cumulativo, nao_cumulativo
    
    -- Healthcare Specific
    aplicavel_saude BOOLEAN DEFAULT true,
    observacoes TEXT,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_tax_configurations_clinic_id ON tax_configurations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_cnpj ON tax_configurations(cnpj);

CREATE INDEX IF NOT EXISTS idx_nfe_documents_clinic_id ON nfe_documents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_nfe_documents_invoice_id ON nfe_documents(invoice_id);
CREATE INDEX IF NOT EXISTS idx_nfe_documents_chave_acesso ON nfe_documents(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_nfe_documents_status ON nfe_documents(status);
CREATE INDEX IF NOT EXISTS idx_nfe_documents_data_emissao ON nfe_documents(data_emissao);

CREATE INDEX IF NOT EXISTS idx_tax_calculations_clinic_id ON tax_calculations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_invoice_id ON tax_calculations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_calculation_date ON tax_calculations(calculation_date);

CREATE INDEX IF NOT EXISTS idx_sped_entries_clinic_id ON sped_entries(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sped_entries_periodo ON sped_entries(periodo_apuracao);
CREATE INDEX IF NOT EXISTS idx_sped_entries_conta ON sped_entries(codigo_conta);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_clinic_id ON tax_compliance_reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tipo ON tax_compliance_reports(tipo_relatorio);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_periodo ON tax_compliance_reports(periodo_referencia);

-- Create Update Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tax_configurations_updated_at 
    BEFORE UPDATE ON tax_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfe_documents_updated_at 
    BEFORE UPDATE ON nfe_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_calculations_updated_at 
    BEFORE UPDATE ON tax_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sped_entries_updated_at 
    BEFORE UPDATE ON sped_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_reports_updated_at 
    BEFORE UPDATE ON tax_compliance_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Brazilian Healthcare Service Tax Codes
INSERT INTO service_tax_codes (codigo_servico, descricao_servico, categoria, iss_aliquota_minima, iss_aliquota_maxima, aplicavel_saude, observacoes) VALUES
('04.01', 'Medicina e biomedicina', 'Saúde', 2.00, 5.00, true, 'Serviços médicos gerais'),
('04.02', 'Análises clínicas, patologia, eletricidade médica, radioterapia, quimioterapia, ultra-sonografia, ressonância magnética, radiologia, tomografia e congêneres', 'Saúde', 2.00, 5.00, true, 'Exames e diagnósticos'),
('04.03', 'Hospitais, clínicas, laboratórios, sanatórios, manicômios, casas de saúde, prontos-socorros, ambulatórios e congêneres', 'Saúde', 2.00, 5.00, true, 'Estabelecimentos de saúde'),
('04.04', 'Instrumentação cirúrgica', 'Saúde', 2.00, 5.00, true, 'Procedimentos cirúrgicos'),
('04.05', 'Acupuntura', 'Saúde', 2.00, 5.00, true, 'Medicina alternativa'),
('04.06', 'Enfermagem, inclusive serviços auxiliares', 'Saúde', 2.00, 5.00, true, 'Serviços de enfermagem'),
('04.07', 'Serviços farmacêuticos', 'Saúde', 2.00, 5.00, true, 'Serviços farmacêuticos'),
('04.08', 'Terapia ocupacional, fisioterapia e fonoaudiologia', 'Saúde', 2.00, 5.00, true, 'Terapias e reabilitação'),
('04.09', 'Terapias de qualquer espécie destinadas ao tratamento físico, mental e psíquico', 'Saúde', 2.00, 5.00, true, 'Terapias diversas'),
('04.10', 'Nutrição', 'Saúde', 2.00, 5.00, true, 'Serviços nutricionais'),
('04.11', 'Obstetrícia', 'Saúde', 2.00, 5.00, true, 'Serviços obstétricos'),
('04.12', 'Odontologia', 'Saúde', 2.00, 5.00, true, 'Serviços odontológicos'),
('04.13', 'Ortóptica', 'Saúde', 2.00, 5.00, true, 'Serviços ortópticos'),
('04.14', 'Próteses sob encomenda', 'Saúde', 2.00, 5.00, true, 'Próteses personalizadas'),
('04.15', 'Psicanálise', 'Saúde', 2.00, 5.00, true, 'Serviços psicanalíticos'),
('04.16', 'Psicologia', 'Saúde', 2.00, 5.00, true, 'Serviços psicológicos'),
('04.17', 'Casas de repouso e de recuperação, creches, asilos e congêneres', 'Saúde', 2.00, 5.00, true, 'Cuidados especializados'),
('04.18', 'Inseminação artificial, fertilização in vitro e congêneres', 'Saúde', 2.00, 5.00, true, 'Reprodução assistida'),
('04.19', 'Bancos de sangue, leite, pele, olhos, óvulos, sêmen e congêneres', 'Saúde', 2.00, 5.00, true, 'Bancos biológicos'),
('04.20', 'Coleta de sangue, leite, tecidos, sêmen, órgãos e materiais biológicos de qualquer espécie', 'Saúde', 2.00, 5.00, true, 'Coleta de materiais biológicos'),
('04.21', 'Unidade de atendimento, assistência ou tratamento móvel e congêneres', 'Saúde', 2.00, 5.00, true, 'Atendimento móvel'),
('04.22', 'Planos de medicina de grupo ou individual e convênios para prestação de assistência médica, hospitalar, odontológica e congêneres', 'Saúde', 2.00, 5.00, true, 'Planos de saúde'),
('04.23', 'Outros planos de saúde que se cumpram através de serviços de terceiros contratados, credenciados, cooperados ou apenas pagos pelo operador do plano mediante indicação do beneficiário', 'Saúde', 2.00, 5.00, true, 'Outros planos de saúde')
ON CONFLICT (codigo_servico) DO NOTHING;

-- RLS (Row Level Security) Policies
ALTER TABLE tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sped_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_compliance_reports ENABLE ROW LEVEL SECURITY;

-- Policies for tax_configurations
CREATE POLICY "Users can view tax configurations for their clinic" ON tax_configurations
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage tax configurations" ON tax_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access uca
            JOIN user_roles ur ON uca.user_id = ur.user_id
            WHERE uca.user_id = auth.uid() 
            AND uca.clinic_id = tax_configurations.clinic_id
            AND ur.role IN ('admin', 'owner')
        )
    );

-- Policies for nfe_documents
CREATE POLICY "Users can view NFe documents for their clinic" ON nfe_documents
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
    ));

CREATE POLICY "Staff can manage NFe documents" ON nfe_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access uca
            JOIN user_roles ur ON uca.user_id = ur.user_id
            WHERE uca.user_id = auth.uid() 
            AND uca.clinic_id = nfe_documents.clinic_id
            AND ur.role IN ('admin', 'owner', 'staff')
        )
    );

-- Policies for tax_calculations
CREATE POLICY "Users can view tax calculations for their clinic" ON tax_calculations
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
    ));

CREATE POLICY "Staff can manage tax calculations" ON tax_calculations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access uca
            JOIN user_roles ur ON uca.user_id = ur.user_id
            WHERE uca.user_id = auth.uid() 
            AND uca.clinic_id = tax_calculations.clinic_id
            AND ur.role IN ('admin', 'owner', 'staff')
        )
    );

-- Policies for sped_entries
CREATE POLICY "Users can view SPED entries for their clinic" ON sped_entries
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage SPED entries" ON sped_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access uca
            JOIN user_roles ur ON uca.user_id = ur.user_id
            WHERE uca.user_id = auth.uid() 
            AND uca.clinic_id = sped_entries.clinic_id
            AND ur.role IN ('admin', 'owner')
        )
    );

-- Policies for tax_compliance_reports
CREATE POLICY "Users can view compliance reports for their clinic" ON tax_compliance_reports
    FOR SELECT USING (clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage compliance reports" ON tax_compliance_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access uca
            JOIN user_roles ur ON uca.user_id = ur.user_id
            WHERE uca.user_id = auth.uid() 
            AND uca.clinic_id = tax_compliance_reports.clinic_id
            AND ur.role IN ('admin', 'owner')
        )
    );

-- Public access to service_tax_codes (read-only)
ALTER TABLE service_tax_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view service tax codes" ON service_tax_codes FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE tax_configurations IS 'Store Brazilian tax configuration for clinics including CNPJ, tax regime, and rates';
COMMENT ON TABLE nfe_documents IS 'Electronic invoice (NFe) documents for Brazilian tax compliance';
COMMENT ON TABLE tax_calculations IS 'Detailed tax calculations for services and invoices';
COMMENT ON TABLE sped_entries IS 'Digital bookkeeping entries for SPED compliance';
COMMENT ON TABLE tax_compliance_reports IS 'Generated tax compliance reports and submissions';
COMMENT ON TABLE service_tax_codes IS 'Brazilian service classification codes for tax purposes';