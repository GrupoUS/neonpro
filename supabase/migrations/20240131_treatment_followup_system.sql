-- Epic 7.3: Treatment Follow-up Automation
-- Created by VoidBeast Agent - Auto Story Implementation
-- Automated follow-up with intelligent scheduling and patient monitoring

-- Treatment follow-up protocols table
CREATE TABLE IF NOT EXISTS treatment_followup_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    treatment_type VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    protocol_version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    evidence_level VARCHAR(50), -- A, B, C, D based on evidence quality
    protocol_source TEXT, -- Guidelines source or reference
    
    -- Follow-up scheduling rules
    initial_followup_days INTEGER NOT NULL DEFAULT 7,
    subsequent_intervals INTEGER[] DEFAULT ARRAY[30, 90, 180], -- Days for follow-ups
    max_followups INTEGER DEFAULT 4,
    urgent_threshold_hours INTEGER DEFAULT 24, -- When to escalate
    
    -- Automation settings
    automation_level DECIMAL(3,2) DEFAULT 0.85 CHECK (automation_level >= 0.5 AND automation_level <= 1.0),
    auto_schedule_enabled BOOLEAN DEFAULT true,
    auto_reminders_enabled BOOLEAN DEFAULT true,
    escalation_enabled BOOLEAN DEFAULT true,
    
    -- Content templates
    sms_template TEXT,
    whatsapp_template TEXT,
    email_template TEXT,
    phone_script TEXT,
    
    -- Compliance tracking
    lgpd_compliant BOOLEAN DEFAULT true,
    consent_required BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 2555, -- 7 years
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Patient treatment follow-ups table
CREATE TABLE IF NOT EXISTS patient_treatment_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    treatment_id UUID, -- Reference to treatment/appointment
    protocol_id UUID REFERENCES treatment_followup_protocols(id),
    
    -- Follow-up details
    followup_type VARCHAR(50) NOT NULL, -- initial, routine, urgent, outcome_check
    sequence_number INTEGER DEFAULT 1,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    optimal_time_calculated BOOLEAN DEFAULT false,
    
    -- Communication preferences
    preferred_channel VARCHAR(20) DEFAULT 'sms', -- sms, whatsapp, email, phone
    backup_channels VARCHAR(20)[] DEFAULT ARRAY['email', 'phone'],
    language_preference VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Status tracking
    status VARCHAR(30) DEFAULT 'scheduled', -- scheduled, sent, completed, missed, cancelled, escalated
    attempts_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Response tracking
    patient_responded BOOLEAN DEFAULT false,
    response_channel VARCHAR(20),
    response_content TEXT,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
    
    -- Outcome tracking
    treatment_compliance_score DECIMAL(3,2) CHECK (treatment_compliance_score >= 0 AND treatment_compliance_score <= 1),
    symptoms_improved BOOLEAN,
    side_effects_reported BOOLEAN,
    additional_care_needed BOOLEAN,
    notes TEXT,
    
    -- Automation metadata
    auto_generated BOOLEAN DEFAULT true,
    ai_optimized_timing BOOLEAN DEFAULT false,
    shadow_test_variant VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(patient_id, treatment_id, sequence_number)
);

-- Follow-up communication log
CREATE TABLE IF NOT EXISTS followup_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID REFERENCES patient_treatment_followups(id) ON DELETE CASCADE,
    
    -- Communication details
    channel VARCHAR(20) NOT NULL, -- sms, whatsapp, email, phone
    message_content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, read
    delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Response tracking
    response_received BOOLEAN DEFAULT false,
    response_time_minutes INTEGER,
    response_content TEXT,
    
    -- Performance metrics
    engagement_score DECIMAL(3,2),
    conversion_achieved BOOLEAN DEFAULT false,
    
    -- Technical metadata
    message_id VARCHAR(255), -- External service message ID
    provider VARCHAR(50), -- SMS/WhatsApp provider
    cost_cents INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Treatment outcomes tracking
CREATE TABLE IF NOT EXISTS treatment_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    treatment_id UUID,
    followup_id UUID REFERENCES patient_treatment_followups(id),
    
    -- Outcome measurements
    outcome_date DATE NOT NULL,
    measurement_type VARCHAR(50) NOT NULL, -- pain_scale, mobility, satisfaction, compliance
    value_numeric DECIMAL(10,2),
    value_text TEXT,
    scale_type VARCHAR(30), -- 1_to_10, percentage, yes_no, custom
    
    -- Clinical assessment
    clinical_improvement BOOLEAN,
    meets_treatment_goals BOOLEAN,
    requires_additional_treatment BOOLEAN,
    
    -- Patient reported outcomes
    patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 10),
    quality_of_life_score DECIMAL(3,2),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    mobility_score DECIMAL(3,2),
    
    -- Follow-up recommendations
    next_followup_recommended BOOLEAN DEFAULT true,
    followup_interval_days INTEGER,
    escalation_required BOOLEAN DEFAULT false,
    referral_needed BOOLEAN DEFAULT false,
    specialist_type VARCHAR(100),
    
    -- Data source
    data_source VARCHAR(30) DEFAULT 'patient_report', -- patient_report, clinical_exam, automated_assessment
    reliability_score DECIMAL(3,2) DEFAULT 0.8,
    
    -- AI analysis
    ai_analyzed BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(3,2),
    ai_recommendations TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES auth.users(id)
);

-- Follow-up escalation rules
CREATE TABLE IF NOT EXISTS followup_escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES treatment_followup_protocols(id),
    
    -- Escalation conditions
    condition_type VARCHAR(50) NOT NULL, -- no_response, poor_outcome, urgent_symptoms, compliance_issue
    threshold_value DECIMAL(10,2),
    time_threshold_hours INTEGER,
    attempts_threshold INTEGER,
    
    -- Escalation actions
    escalation_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    notify_roles VARCHAR(50)[] DEFAULT ARRAY['nurse', 'doctor'],
    auto_schedule_appointment BOOLEAN DEFAULT false,
    priority_level VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Templates and scripts
    escalation_message_template TEXT,
    internal_alert_template TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance analytics for follow-up system
CREATE TABLE IF NOT EXISTS followup_performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Time period
    analysis_date DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    
    -- Volume metrics
    total_followups_scheduled INTEGER DEFAULT 0,
    total_followups_completed INTEGER DEFAULT 0,
    total_followups_missed INTEGER DEFAULT 0,
    total_escalations INTEGER DEFAULT 0,
    
    -- Performance metrics
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    response_rate DECIMAL(5,2) DEFAULT 0.0,
    satisfaction_average DECIMAL(3,2) DEFAULT 0.0,
    escalation_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Channel performance
    sms_success_rate DECIMAL(5,2) DEFAULT 0.0,
    whatsapp_success_rate DECIMAL(5,2) DEFAULT 0.0,
    email_success_rate DECIMAL(5,2) DEFAULT 0.0,
    phone_success_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Timing optimization
    optimal_time_accuracy DECIMAL(5,2) DEFAULT 0.0,
    avg_response_time_minutes INTEGER DEFAULT 0,
    
    -- Treatment outcomes
    treatment_improvement_rate DECIMAL(5,2) DEFAULT 0.0,
    goal_achievement_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- AI performance
    ai_prediction_accuracy DECIMAL(5,2) DEFAULT 0.0,
    automation_success_rate DECIMAL(5,2) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_followup_protocols_treatment_type ON treatment_followup_protocols(treatment_type);
CREATE INDEX IF NOT EXISTS idx_followup_protocols_active ON treatment_followup_protocols(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_patient_followups_patient_id ON patient_treatment_followups(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_followups_scheduled_date ON patient_treatment_followups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_patient_followups_status ON patient_treatment_followups(status);
CREATE INDEX IF NOT EXISTS idx_patient_followups_protocol ON patient_treatment_followups(protocol_id);

CREATE INDEX IF NOT EXISTS idx_followup_communications_followup_id ON followup_communications(followup_id);
CREATE INDEX IF NOT EXISTS idx_followup_communications_sent_at ON followup_communications(sent_at);
CREATE INDEX IF NOT EXISTS idx_followup_communications_channel ON followup_communications(channel);

CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_patient_id ON treatment_outcomes(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_outcome_date ON treatment_outcomes(outcome_date);
CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_followup_id ON treatment_outcomes(followup_id);

CREATE INDEX IF NOT EXISTS idx_escalation_rules_protocol ON followup_escalation_rules(protocol_id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_active ON followup_escalation_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_analytics_date ON followup_performance_analytics(analysis_date);
CREATE INDEX IF NOT EXISTS idx_analytics_period_type ON followup_performance_analytics(period_type);

-- Row Level Security (RLS) policies
ALTER TABLE treatment_followup_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_treatment_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_performance_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded based on auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON treatment_followup_protocols FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON patient_treatment_followups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON followup_communications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON treatment_outcomes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON followup_escalation_rules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON followup_performance_analytics FOR SELECT USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE treatment_followup_protocols IS 'Defines automated follow-up protocols for different treatment types with evidence-based guidelines';
COMMENT ON TABLE patient_treatment_followups IS 'Tracks individual patient follow-ups with intelligent scheduling and outcome monitoring';
COMMENT ON TABLE followup_communications IS 'Logs all communication attempts and responses for follow-up tracking';
COMMENT ON TABLE treatment_outcomes IS 'Records treatment outcomes and patient progress measurements';
COMMENT ON TABLE followup_escalation_rules IS 'Defines escalation conditions and actions for follow-up management';
COMMENT ON TABLE followup_performance_analytics IS 'Aggregated performance metrics for follow-up system optimization';

-- Insert sample follow-up protocols
INSERT INTO treatment_followup_protocols (
    name, description, treatment_type, specialty, evidence_level, 
    initial_followup_days, subsequent_intervals, automation_level,
    sms_template, email_template
) VALUES 
(
    'Ortodontia - Protocolo Padrão',
    'Follow-up automatizado para tratamentos ortodônticos com monitoramento de ajustes e progresso',
    'ortodontia',
    'ortodontia',
    'A',
    7,
    ARRAY[30, 60, 90, 120],
    0.90,
    'Olá {patient_name}! Como está seu tratamento ortodôntico? Responda: 1-Ótimo 2-Bom 3-Regular 4-Ruim. Dúvidas? Ligue (11) 99999-9999',
    'Prezado(a) {patient_name}, esperamos que seu tratamento ortodôntico esteja progredindo bem. Como parte do nosso acompanhamento, gostaríamos de saber como você está se sentindo...'
),
(
    'Implantes - Acompanhamento Pós-Cirúrgico',
    'Protocolo intensivo para acompanhamento pós-implante com foco em cicatrização e complicações',
    'implante',
    'cirurgia',
    'A',
    1,
    ARRAY[3, 7, 14, 30, 90],
    0.85,
    'Oi {patient_name}! Como está a cicatrização do seu implante? Dor de 0-10? Sangramento? Responda ou ligue se precisar!',
    'Caro(a) {patient_name}, seu implante foi realizado há {days_since_treatment} dias. É fundamental acompanharmos sua recuperação...'
),
(
    'Limpeza e Prevenção - Manutenção',
    'Follow-up para limpezas e procedimentos preventivos com foco em manutenção da saúde bucal',
    'limpeza',
    'clinica_geral',
    'B',
    30,
    ARRAY[90, 180],
    0.95,
    'Oi {patient_name}! Que tal agendar sua próxima limpeza? Manter a regularidade é fundamental para sua saúde bucal!',
    'Prezado(a) {patient_name}, já faz {days_since_treatment} dias desde sua última limpeza. É hora de cuidar novamente da sua saúde bucal...'
);

-- Insert sample escalation rules
INSERT INTO followup_escalation_rules (
    protocol_id, condition_type, threshold_value, time_threshold_hours, 
    attempts_threshold, escalation_level, notify_roles, escalation_message_template
) VALUES 
(
    (SELECT id FROM treatment_followup_protocols WHERE treatment_type = 'implante' LIMIT 1),
    'no_response',
    NULL,
    24,
    3,
    'high',
    ARRAY['cirurgiao', 'enfermeira'],
    'ATENÇÃO: Paciente {patient_name} não respondeu ao follow-up pós-implante há 24h. Verificar urgentemente.'
),
(
    (SELECT id FROM treatment_followup_protocols WHERE treatment_type = 'ortodontia' LIMIT 1),
    'poor_outcome',
    3.0,
    NULL,
    NULL,
    'medium',
    ARRAY['ortodontista', 'coordenadora'],
    'Paciente {patient_name} reportou insatisfação (nota ≤3) no follow-up ortodôntico. Reagendar consulta.'
);
