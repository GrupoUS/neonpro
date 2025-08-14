-- =====================================================================================
-- SUPPLIER MANAGEMENT SYSTEM MIGRATION
-- Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
-- =====================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- CORE SUPPLIER TABLES
-- =====================================================================================

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Basic Information
    supplier_name TEXT NOT NULL,
    supplier_code TEXT NOT NULL, -- Unique internal code
    business_registration TEXT, -- CNPJ/CPF
    tax_id TEXT,
    
    -- Contact Information
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    
    -- Address Information
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Brasil',
    
    -- Business Information
    supplier_type supplier_type_enum NOT NULL DEFAULT 'medical_supplies',
    category TEXT[] DEFAULT '{}', -- Array of categories
    payment_terms INTEGER DEFAULT 30, -- Days
    currency TEXT DEFAULT 'BRL',
    
    -- Performance Metrics
    performance_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 10.00
    reliability_rating supplier_rating_enum DEFAULT 'not_rated',
    quality_rating supplier_rating_enum DEFAULT 'not_rated',
    delivery_rating supplier_rating_enum DEFAULT 'not_rated',
    
    -- Status and Timestamps
    status supplier_status_enum DEFAULT 'active',
    is_preferred BOOLEAN DEFAULT false,
    is_critical BOOLEAN DEFAULT false, -- Critical supplier for essential items
    
    -- Audit fields
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(clinic_id, supplier_code),
    CHECK (performance_score >= 0.00 AND performance_score <= 10.00)
);

-- Supplier contracts table
CREATE TABLE supplier_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Contract Information
    contract_number TEXT NOT NULL,
    contract_type contract_type_enum NOT NULL DEFAULT 'general',
    
    -- Terms and Conditions
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renewal BOOLEAN DEFAULT false,
    renewal_notice_days INTEGER DEFAULT 30,
    
    -- Pricing and Payment
    payment_terms INTEGER DEFAULT 30, -- Days
    early_payment_discount DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    late_payment_penalty DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    minimum_order_amount DECIMAL(12,2) DEFAULT 0.00,
    volume_discount_tiers JSONB DEFAULT '[]'::jsonb, -- Array of discount tiers
    
    -- Performance Clauses
    delivery_sla_days INTEGER DEFAULT 7,
    quality_requirements TEXT,
    performance_penalties JSONB DEFAULT '{}'::jsonb,
    
    -- Status and Metadata
    status contract_status_enum DEFAULT 'active',
    contract_value DECIMAL(15,2),
    currency TEXT DEFAULT 'BRL',
    
    -- Document Management
    contract_document_url TEXT,
    signed_date DATE,
    
    -- Audit fields
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(supplier_id, contract_number),
    CHECK (early_payment_discount >= 0.00 AND early_payment_discount <= 100.00),
    CHECK (late_payment_penalty >= 0.00),
    CHECK (minimum_order_amount >= 0.00),
    CHECK (contract_value >= 0.00)
);

-- Supplier contacts table
CREATE TABLE supplier_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Contact Information
    contact_name TEXT NOT NULL,
    contact_title TEXT,
    department TEXT,
    
    -- Contact Methods
    email TEXT,
    phone TEXT,
    mobile TEXT,
    whatsapp TEXT,
    
    -- Contact Type and Preferences
    contact_type contact_type_enum DEFAULT 'general',
    is_primary BOOLEAN DEFAULT false,
    preferred_contact_method TEXT DEFAULT 'email',
    
    -- Communication Preferences
    can_receive_orders BOOLEAN DEFAULT true,
    can_receive_invoices BOOLEAN DEFAULT false,
    can_receive_complaints BOOLEAN DEFAULT false,
    emergency_contact BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- PERFORMANCE TRACKING TABLES
-- =====================================================================================

-- Supplier performance metrics table
CREATE TABLE supplier_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    evaluation_type evaluation_type_enum DEFAULT 'monthly',
    
    -- Delivery Performance
    total_orders INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    late_deliveries INTEGER DEFAULT 0,
    avg_delivery_days DECIMAL(5,2) DEFAULT 0.00,
    delivery_performance_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100
    
    -- Quality Performance
    total_items_received INTEGER DEFAULT 0,
    defective_items INTEGER DEFAULT 0,
    returned_items INTEGER DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100
    
    -- Financial Performance
    total_order_value DECIMAL(15,2) DEFAULT 0.00,
    total_invoiced DECIMAL(15,2) DEFAULT 0.00,
    total_paid DECIMAL(15,2) DEFAULT 0.00,
    avg_payment_delay_days DECIMAL(5,2) DEFAULT 0.00,
    cost_savings DECIMAL(15,2) DEFAULT 0.00,
    
    -- Communication and Service
    response_time_hours DECIMAL(8,2) DEFAULT 0.00,
    communication_rating DECIMAL(3,2) DEFAULT 0.00, -- 1-10
    issue_resolution_days DECIMAL(5,2) DEFAULT 0.00,
    
    -- Overall Performance
    overall_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100
    performance_grade performance_grade_enum DEFAULT 'C',
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by UUID REFERENCES public.profiles(id),
    
    -- Constraints
    UNIQUE(supplier_id, period_start, period_end, evaluation_type),
    CHECK (period_end >= period_start),
    CHECK (on_time_deliveries <= total_orders),
    CHECK (late_deliveries <= total_orders),
    CHECK (defective_items <= total_items_received),
    CHECK (returned_items <= total_items_received),
    CHECK (delivery_performance_score >= 0.00 AND delivery_performance_score <= 100.00),
    CHECK (quality_score >= 0.00 AND quality_score <= 100.00),
    CHECK (overall_score >= 0.00 AND overall_score <= 100.00),
    CHECK (communication_rating >= 1.00 AND communication_rating <= 10.00)
);

-- Supplier evaluations table
CREATE TABLE supplier_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Evaluation Information
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    evaluation_type evaluation_type_enum NOT NULL,
    
    -- Scoring Criteria (1-10 scale)
    delivery_reliability DECIMAL(3,2) NOT NULL, -- On-time delivery
    product_quality DECIMAL(3,2) NOT NULL, -- Quality of products
    customer_service DECIMAL(3,2) NOT NULL, -- Support and communication
    pricing_competitiveness DECIMAL(3,2) NOT NULL, -- Cost effectiveness
    technical_support DECIMAL(3,2) NOT NULL, -- Technical assistance
    documentation_quality DECIMAL(3,2) NOT NULL, -- Documentation and compliance
    
    -- Calculated Scores
    weighted_score DECIMAL(5,2) NOT NULL, -- Weighted average
    final_grade performance_grade_enum NOT NULL,
    
    -- Qualitative Assessment
    strengths TEXT,
    weaknesses TEXT,
    improvement_recommendations TEXT,
    action_items TEXT,
    
    -- Future Relationship
    renewal_recommendation BOOLEAN DEFAULT true,
    preferred_supplier_status BOOLEAN DEFAULT false,
    risk_level risk_level_enum DEFAULT 'low',
    
    -- Evaluator Information
    evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    approval_date DATE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (evaluation_period_end >= evaluation_period_start),
    CHECK (delivery_reliability >= 1.00 AND delivery_reliability <= 10.00),
    CHECK (product_quality >= 1.00 AND product_quality <= 10.00),
    CHECK (customer_service >= 1.00 AND customer_service <= 10.00),
    CHECK (pricing_competitiveness >= 1.00 AND pricing_competitiveness <= 10.00),
    CHECK (technical_support >= 1.00 AND technical_support <= 10.00),
    CHECK (documentation_quality >= 1.00 AND documentation_quality <= 10.00),
    CHECK (weighted_score >= 1.00 AND weighted_score <= 10.00)
);

-- =====================================================================================
-- QUALITY AND COMMUNICATION TABLES
-- =====================================================================================

-- Supplier communication log
CREATE TABLE supplier_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES supplier_contacts(id),
    
    -- Communication Details
    communication_type communication_type_enum NOT NULL,
    subject TEXT NOT NULL,
    message_body TEXT,
    
    -- Communication Method
    method communication_method_enum DEFAULT 'email',
    direction communication_direction_enum NOT NULL,
    
    -- Status and Follow-up
    status communication_status_enum DEFAULT 'sent',
    priority priority_level_enum DEFAULT 'medium',
    requires_response BOOLEAN DEFAULT false,
    response_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    handled_by UUID REFERENCES public.profiles(id),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier quality issues table
CREATE TABLE supplier_quality_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Issue Information
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issue_type quality_issue_type_enum NOT NULL,
    severity severity_level_enum DEFAULT 'medium',
    
    -- Issue Details
    issue_description TEXT NOT NULL,
    affected_items TEXT[],
    quantity_affected INTEGER DEFAULT 0,
    estimated_cost_impact DECIMAL(12,2) DEFAULT 0.00,
    
    -- Resolution
    resolution_required BOOLEAN DEFAULT true,
    resolution_description TEXT,
    resolution_date DATE,
    resolved_by UUID REFERENCES public.profiles(id),
    
    -- Impact Assessment
    customer_impact BOOLEAN DEFAULT false,
    regulatory_impact BOOLEAN DEFAULT false,
    financial_impact DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status
    status issue_status_enum DEFAULT 'open',
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    
    -- Audit fields
    reported_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (quantity_affected >= 0),
    CHECK (estimated_cost_impact >= 0.00),
    CHECK (financial_impact >= 0.00)
);

-- =====================================================================================
-- ENUM TYPES
-- =====================================================================================

-- Supplier type enum
CREATE TYPE supplier_type_enum AS ENUM (
    'medical_supplies',
    'pharmaceuticals',
    'equipment',
    'consumables',
    'services',
    'maintenance',
    'technology',
    'general'
);

-- Supplier rating enum
CREATE TYPE supplier_rating_enum AS ENUM (
    'excellent',
    'good',
    'satisfactory',
    'needs_improvement',
    'poor',
    'not_rated'
);

-- Supplier status enum
CREATE TYPE supplier_status_enum AS ENUM (
    'active',
    'inactive',
    'pending_approval',
    'suspended',
    'blacklisted'
);

-- Contract type enum
CREATE TYPE contract_type_enum AS ENUM (
    'general',
    'exclusive',
    'preferred',
    'volume_based',
    'seasonal',
    'emergency'
);

-- Contract status enum
CREATE TYPE contract_status_enum AS ENUM (
    'active',
    'expired',
    'pending_renewal',
    'terminated',
    'draft'
);

-- Contact type enum
CREATE TYPE contact_type_enum AS ENUM (
    'general',
    'sales',
    'technical',
    'billing',
    'customer_service',
    'emergency'
);

-- Evaluation type enum
CREATE TYPE evaluation_type_enum AS ENUM (
    'monthly',
    'quarterly',
    'semi_annual',
    'annual',
    'ad_hoc'
);

-- Performance grade enum
CREATE TYPE performance_grade_enum AS ENUM (
    'A+',
    'A',
    'B+',
    'B',
    'C+',
    'C',
    'D',
    'F'
);

-- Risk level enum
CREATE TYPE risk_level_enum AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Communication type enum
CREATE TYPE communication_type_enum AS ENUM (
    'order_inquiry',
    'delivery_issue',
    'quality_complaint',
    'payment_inquiry',
    'contract_negotiation',
    'general_inquiry',
    'emergency'
);

-- Communication method enum
CREATE TYPE communication_method_enum AS ENUM (
    'email',
    'phone',
    'whatsapp',
    'video_call',
    'in_person',
    'portal'
);

-- Communication direction enum
CREATE TYPE communication_direction_enum AS ENUM (
    'outbound',
    'inbound'
);

-- Communication status enum
CREATE TYPE communication_status_enum AS ENUM (
    'sent',
    'delivered',
    'read',
    'responded',
    'failed'
);

-- Priority level enum
CREATE TYPE priority_level_enum AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Quality issue type enum
CREATE TYPE quality_issue_type_enum AS ENUM (
    'defective_product',
    'wrong_product',
    'missing_items',
    'damaged_packaging',
    'expired_product',
    'documentation_error',
    'compliance_issue'
);

-- Severity level enum
CREATE TYPE severity_level_enum AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Issue status enum
CREATE TYPE issue_status_enum AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed',
    'escalated'
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Suppliers indexes
CREATE INDEX idx_suppliers_clinic_id ON suppliers(clinic_id);
CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_performance_score ON suppliers(performance_score DESC);
CREATE INDEX idx_suppliers_is_preferred ON suppliers(is_preferred);
CREATE INDEX idx_suppliers_is_critical ON suppliers(is_critical);

-- Contracts indexes
CREATE INDEX idx_supplier_contracts_supplier_id ON supplier_contracts(supplier_id);
CREATE INDEX idx_supplier_contracts_end_date ON supplier_contracts(end_date);
CREATE INDEX idx_supplier_contracts_status ON supplier_contracts(status);
CREATE INDEX idx_supplier_contracts_auto_renewal ON supplier_contracts(auto_renewal);

-- Contacts indexes
CREATE INDEX idx_supplier_contacts_supplier_id ON supplier_contacts(supplier_id);
CREATE INDEX idx_supplier_contacts_is_primary ON supplier_contacts(is_primary);
CREATE INDEX idx_supplier_contacts_contact_type ON supplier_contacts(contact_type);

-- Performance indexes
CREATE INDEX idx_supplier_performance_supplier_id ON supplier_performance(supplier_id);
CREATE INDEX idx_supplier_performance_period ON supplier_performance(period_start, period_end);
CREATE INDEX idx_supplier_performance_evaluation_type ON supplier_performance(evaluation_type);
CREATE INDEX idx_supplier_performance_overall_score ON supplier_performance(overall_score DESC);

-- Evaluations indexes
CREATE INDEX idx_supplier_evaluations_supplier_id ON supplier_evaluations(supplier_id);
CREATE INDEX idx_supplier_evaluations_date ON supplier_evaluations(evaluation_date);
CREATE INDEX idx_supplier_evaluations_grade ON supplier_evaluations(final_grade);

-- Communications indexes
CREATE INDEX idx_supplier_communications_supplier_id ON supplier_communications(supplier_id);
CREATE INDEX idx_supplier_communications_date ON supplier_communications(communication_date);
CREATE INDEX idx_supplier_communications_type ON supplier_communications(communication_type);
CREATE INDEX idx_supplier_communications_status ON supplier_communications(status);

-- Quality issues indexes
CREATE INDEX idx_supplier_quality_issues_supplier_id ON supplier_quality_issues(supplier_id);
CREATE INDEX idx_supplier_quality_issues_date ON supplier_quality_issues(issue_date);
CREATE INDEX idx_supplier_quality_issues_type ON supplier_quality_issues(issue_type);
CREATE INDEX idx_supplier_quality_issues_severity ON supplier_quality_issues(severity);
CREATE INDEX idx_supplier_quality_issues_status ON supplier_quality_issues(status);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quality_issues ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Suppliers are viewable by clinic members" ON suppliers
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Suppliers are insertable by clinic members" ON suppliers
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Suppliers are updatable by clinic members" ON suppliers
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Apply similar RLS policies to all related tables
-- (Contracts, Contacts, Performance, Evaluations, Communications, Quality Issues)

-- Supplier contracts policies
CREATE POLICY "Supplier contracts are viewable by clinic members" ON supplier_contracts
    FOR SELECT USING (
        supplier_id IN (
            SELECT id FROM suppliers 
            WHERE clinic_id IN (
                SELECT clinic_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Supplier contracts are insertable by clinic members" ON supplier_contracts
    FOR INSERT WITH CHECK (
        supplier_id IN (
            SELECT id FROM suppliers 
            WHERE clinic_id IN (
                SELECT clinic_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Supplier contracts are updatable by clinic members" ON supplier_contracts
    FOR UPDATE USING (
        supplier_id IN (
            SELECT id FROM suppliers 
            WHERE clinic_id IN (
                SELECT clinic_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Apply similar patterns for other tables...

-- =====================================================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_contracts_updated_at 
    BEFORE UPDATE ON supplier_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_contacts_updated_at 
    BEFORE UPDATE ON supplier_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_evaluations_updated_at 
    BEFORE UPDATE ON supplier_evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_communications_updated_at 
    BEFORE UPDATE ON supplier_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_quality_issues_updated_at 
    BEFORE UPDATE ON supplier_quality_issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance calculation trigger
CREATE OR REPLACE FUNCTION calculate_supplier_performance_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate performance score based on latest evaluation
    UPDATE suppliers 
    SET performance_score = (
        SELECT weighted_score 
        FROM supplier_evaluations 
        WHERE supplier_id = NEW.supplier_id 
        ORDER BY evaluation_date DESC 
        LIMIT 1
    )
    WHERE id = NEW.supplier_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_supplier_performance_score
    AFTER INSERT OR UPDATE ON supplier_evaluations
    FOR EACH ROW EXECUTE FUNCTION calculate_supplier_performance_score();

-- =====================================================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================================================

-- Insert sample suppliers (using default clinic)
INSERT INTO suppliers (
    clinic_id, supplier_name, supplier_code, business_registration,
    primary_contact_name, primary_contact_email, primary_contact_phone,
    address_line1, city, state, postal_code,
    supplier_type, category, payment_terms,
    performance_score, is_preferred, is_critical
) VALUES 
(
    (SELECT id FROM public.profiles LIMIT 1),
    'MedSupply Brasil Ltda',
    'MED001',
    '12.345.678/0001-90',
    'Carlos Silva',
    'carlos@medsupply.com.br',
    '+55 11 98765-4321',
    'Rua das Medicinas, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'medical_supplies',
    ARRAY['injectables', 'syringes', 'needles'],
    30,
    8.5,
    true,
    true
),
(
    (SELECT id FROM public.profiles LIMIT 1),
    'Pharma Express',
    'PHR002',
    '98.765.432/0001-10',
    'Ana Costa',
    'ana@pharmaexpress.com.br',
    '+55 11 99876-5432',
    'Av. Farmacêutica, 456',
    'Rio de Janeiro',
    'RJ',
    '20123-456',
    'pharmaceuticals',
    ARRAY['anesthetics', 'antibiotics'],
    45,
    7.8,
    false,
    false
),
(
    (SELECT id FROM public.profiles LIMIT 1),
    'EquipMed Solutions',
    'EQP003',
    '55.444.333/0001-22',
    'Roberto Mendes',
    'roberto@equipmed.com.br',
    '+55 11 91234-5678',
    'Rua dos Equipamentos, 789',
    'Belo Horizonte',
    'MG',
    '30123-789',
    'equipment',
    ARRAY['lasers', 'monitors', 'chairs'],
    60,
    9.2,
    true,
    false
);

-- Insert sample contracts
INSERT INTO supplier_contracts (
    supplier_id, contract_number, contract_type,
    start_date, end_date, auto_renewal,
    payment_terms, early_payment_discount,
    delivery_sla_days, contract_value
) VALUES 
(
    (SELECT id FROM suppliers WHERE supplier_code = 'MED001'),
    'CONT-MED001-2024',
    'preferred',
    '2024-01-01',
    '2024-12-31',
    true,
    30,
    2.5,
    3,
    150000.00
),
(
    (SELECT id FROM suppliers WHERE supplier_code = 'PHR002'),
    'CONT-PHR002-2024',
    'general',
    '2024-03-01',
    '2025-02-28',
    false,
    45,
    1.0,
    7,
    80000.00
);

-- Insert sample contacts
INSERT INTO supplier_contacts (
    supplier_id, contact_name, contact_title, department,
    email, phone, contact_type, is_primary
) VALUES 
(
    (SELECT id FROM suppliers WHERE supplier_code = 'MED001'),
    'Carlos Silva',
    'Gerente Comercial',
    'Vendas',
    'carlos@medsupply.com.br',
    '+55 11 98765-4321',
    'sales',
    true
),
(
    (SELECT id FROM suppliers WHERE supplier_code = 'MED001'),
    'Maria Santos',
    'Suporte Técnico',
    'Técnico',
    'maria@medsupply.com.br',
    '+55 11 98765-4322',
    'technical',
    false
);

-- =====================================================================================
-- VIEWS FOR REPORTING
-- =====================================================================================

-- Supplier performance summary view
CREATE VIEW supplier_performance_summary AS
SELECT 
    s.id,
    s.supplier_name,
    s.supplier_code,
    s.supplier_type,
    s.performance_score,
    s.is_preferred,
    s.is_critical,
    
    -- Latest performance metrics
    sp.delivery_performance_score,
    sp.quality_score,
    sp.overall_score,
    sp.performance_grade,
    
    -- Contract information
    sc.payment_terms,
    sc.early_payment_discount,
    sc.end_date as contract_end_date,
    
    -- Issue counts
    (SELECT COUNT(*) FROM supplier_quality_issues sqi 
     WHERE sqi.supplier_id = s.id AND sqi.status = 'open') as open_issues,
    
    -- Recent communication
    (SELECT MAX(communication_date) FROM supplier_communications scom 
     WHERE scom.supplier_id = s.id) as last_communication
     
FROM suppliers s
LEFT JOIN supplier_performance sp ON s.id = sp.supplier_id 
    AND sp.period_end = (SELECT MAX(period_end) FROM supplier_performance WHERE supplier_id = s.id)
LEFT JOIN supplier_contracts sc ON s.id = sc.supplier_id AND sc.status = 'active'
WHERE s.status = 'active';

-- Contract renewal alerts view
CREATE VIEW contract_renewal_alerts AS
SELECT 
    sc.id,
    s.supplier_name,
    s.supplier_code,
    sc.contract_number,
    sc.end_date,
    sc.auto_renewal,
    sc.renewal_notice_days,
    
    -- Days until expiration
    (sc.end_date - CURRENT_DATE) as days_until_expiration,
    
    -- Alert status
    CASE 
        WHEN (sc.end_date - CURRENT_DATE) <= sc.renewal_notice_days 
        THEN 'urgent'
        WHEN (sc.end_date - CURRENT_DATE) <= (sc.renewal_notice_days * 2) 
        THEN 'warning'
        ELSE 'normal'
    END as alert_status
    
FROM supplier_contracts sc
JOIN suppliers s ON sc.supplier_id = s.id
WHERE sc.status = 'active' 
    AND sc.end_date IS NOT NULL
    AND sc.end_date > CURRENT_DATE
ORDER BY sc.end_date ASC;

-- Quality issues summary view
CREATE VIEW quality_issues_summary AS
SELECT 
    s.id as supplier_id,
    s.supplier_name,
    
    -- Issue counts by status
    COUNT(CASE WHEN sqi.status = 'open' THEN 1 END) as open_issues,
    COUNT(CASE WHEN sqi.status = 'in_progress' THEN 1 END) as in_progress_issues,
    COUNT(CASE WHEN sqi.status = 'resolved' THEN 1 END) as resolved_issues,
    
    -- Issue counts by severity
    COUNT(CASE WHEN sqi.severity = 'critical' THEN 1 END) as critical_issues,
    COUNT(CASE WHEN sqi.severity = 'high' THEN 1 END) as high_issues,
    COUNT(CASE WHEN sqi.severity = 'medium' THEN 1 END) as medium_issues,
    COUNT(CASE WHEN sqi.severity = 'low' THEN 1 END) as low_issues,
    
    -- Financial impact
    SUM(CASE WHEN sqi.status = 'open' THEN sqi.financial_impact ELSE 0 END) as open_financial_impact,
    SUM(sqi.financial_impact) as total_financial_impact
    
FROM suppliers s
LEFT JOIN supplier_quality_issues sqi ON s.id = sqi.supplier_id
    AND sqi.issue_date >= CURRENT_DATE - INTERVAL '12 months'
WHERE s.status = 'active'
GROUP BY s.id, s.supplier_name
ORDER BY open_issues DESC, critical_issues DESC;

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================

-- Add comment to track migration
COMMENT ON TABLE suppliers IS 'Epic 6 - Story 6.3: Supplier management with performance tracking and evaluation';
