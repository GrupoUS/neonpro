-- Migration: Risk Assessment Automation with Medical Validation
-- Story 9.4: Comprehensive automated risk assessment with human-in-the-loop medical oversight
-- Created: 2025-01-26

-- Risk Assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Risk Analysis Data
  risk_factors JSONB NOT NULL DEFAULT '{}', -- Structured risk factor analysis
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  risk_categories JSONB NOT NULL DEFAULT '{}', -- Medical, procedural, patient-specific, environmental
  
  -- Assessment Details
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('routine', 'consultation', 'treatment', 'emergency')),
  assessment_method TEXT NOT NULL CHECK (assessment_method IN ('automated', 'manual', 'hybrid')),
  assessment_context JSONB DEFAULT '{}', -- Context of assessment (procedure, conditions, etc.)
  
  -- Clinical Data
  medical_history_factors JSONB DEFAULT '{}',
  current_conditions JSONB DEFAULT '{}',
  contraindications JSONB DEFAULT '{}',
  risk_multipliers JSONB DEFAULT '{}',
  
  -- Timestamps and Status
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'requires_review', 'rejected')),
  validation_required BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Audit and Tracking
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Validations table (Human-in-the-loop oversight)
CREATE TABLE IF NOT EXISTS risk_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES profiles(id), -- Medical professional
  
  -- Validation Decision
  validation_decision TEXT NOT NULL CHECK (validation_decision IN ('approved', 'rejected', 'modified', 'escalated')),
  validation_notes TEXT,
  override_risk_score INTEGER CHECK (override_risk_score >= 0 AND override_risk_score <= 100),
  override_risk_level TEXT CHECK (override_risk_level IN ('low', 'moderate', 'high', 'critical')),
  
  -- Medical Professional Context
  validator_credentials JSONB DEFAULT '{}',
  validation_confidence INTEGER CHECK (validation_confidence >= 0 AND validation_confidence <= 100),
  requires_second_opinion BOOLEAN DEFAULT FALSE,
  
  -- Audit Trail
  validation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  validation_duration_minutes INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Mitigations table
CREATE TABLE IF NOT EXISTS risk_mitigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  -- Mitigation Strategy
  mitigation_type TEXT NOT NULL CHECK (mitigation_type IN ('preventive', 'monitoring', 'intervention', 'emergency')),
  mitigation_strategy TEXT NOT NULL,
  mitigation_details JSONB DEFAULT '{}',
  
  -- Implementation
  implementation_status TEXT NOT NULL DEFAULT 'planned' CHECK (implementation_status IN ('planned', 'active', 'completed', 'cancelled')),
  implementation_date TIMESTAMPTZ,
  responsible_staff_id UUID REFERENCES profiles(id),
  
  -- Effectiveness Tracking
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  effectiveness_notes TEXT,
  monitoring_frequency TEXT CHECK (monitoring_frequency IN ('continuous', 'hourly', 'daily', 'weekly', 'monthly')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Alerts table
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('immediate', 'warning', 'monitoring', 'predictive')),
  risk_category TEXT NOT NULL CHECK (risk_category IN ('medical', 'procedural', 'patient_specific', 'environmental')),
  severity_level TEXT NOT NULL CHECK (severity_level IN ('info', 'warning', 'high', 'critical', 'emergency')),
  
  -- Alert Content
  alert_title TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  alert_details JSONB DEFAULT '{}',
  recommended_actions JSONB DEFAULT '{}',
  
  -- Status and Escalation
  alert_status TEXT NOT NULL DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved', 'escalated')),
  escalation_level INTEGER DEFAULT 0 CHECK (escalation_level >= 0 AND escalation_level <= 5),
  escalation_path JSONB DEFAULT '{}',
  
  -- Response Tracking
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Emergency Integration
  emergency_protocol_triggered BOOLEAN DEFAULT FALSE,
  emergency_response_time_minutes INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Thresholds Configuration table
CREATE TABLE IF NOT EXISTS risk_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES profiles(id), -- NULL for global thresholds
  
  -- Threshold Configuration
  threshold_name TEXT NOT NULL,
  risk_category TEXT NOT NULL CHECK (risk_category IN ('medical', 'procedural', 'patient_specific', 'environmental')),
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('score', 'factor', 'combination')),
  
  -- Threshold Values
  low_threshold INTEGER NOT NULL CHECK (low_threshold >= 0 AND low_threshold <= 100),
  moderate_threshold INTEGER NOT NULL CHECK (moderate_threshold >= 0 AND moderate_threshold <= 100),
  high_threshold INTEGER NOT NULL CHECK (high_threshold >= 0 AND high_threshold <= 100),
  critical_threshold INTEGER NOT NULL CHECK (critical_threshold >= 0 AND critical_threshold <= 100),
  
  -- Actions and Responses
  automated_actions JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  escalation_rules JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure thresholds are in logical order
  CHECK (low_threshold <= moderate_threshold AND moderate_threshold <= high_threshold AND high_threshold <= critical_threshold)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_risk_assessments_patient_id ON risk_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_validation_status ON risk_assessments(validation_status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_assessment_date ON risk_assessments(assessment_date);

CREATE INDEX IF NOT EXISTS idx_risk_validations_assessment_id ON risk_validations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_validations_validator_id ON risk_validations(validator_id);
CREATE INDEX IF NOT EXISTS idx_risk_validations_validation_date ON risk_validations(validation_date);

CREATE INDEX IF NOT EXISTS idx_risk_mitigations_assessment_id ON risk_mitigations(risk_assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_mitigations_implementation_status ON risk_mitigations(implementation_status);

CREATE INDEX IF NOT EXISTS idx_risk_alerts_patient_id ON risk_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity_level ON risk_alerts(severity_level);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_alert_status ON risk_alerts(alert_status);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON risk_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_risk_thresholds_clinic_id ON risk_thresholds(clinic_id);
CREATE INDEX IF NOT EXISTS idx_risk_thresholds_risk_category ON risk_thresholds(risk_category);

-- RLS Policies
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_thresholds ENABLE ROW LEVEL SECURITY;

-- Risk Assessments policies
CREATE POLICY "Users can view risk assessments for their patients" ON risk_assessments
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM appointments WHERE staff_id = auth.uid()
      UNION
      SELECT id FROM profiles WHERE id = auth.uid() -- Patients can see their own
    )
  );

CREATE POLICY "Medical staff can create risk assessments" ON risk_assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor' OR role = 'nurse')
    )
  );

CREATE POLICY "Medical staff can update risk assessments" ON risk_assessments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor' OR role = 'nurse')
    )
  );

-- Risk Validations policies
CREATE POLICY "Medical professionals can view validations" ON risk_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor')
    )
  );

CREATE POLICY "Medical professionals can create validations" ON risk_validations
  FOR INSERT WITH CHECK (
    validator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor')
    )
  );

-- Risk Mitigations policies
CREATE POLICY "Staff can view risk mitigations" ON risk_mitigations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'doctor', 'nurse', 'staff')
    )
  );

CREATE POLICY "Medical staff can manage risk mitigations" ON risk_mitigations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor' OR role = 'nurse')
    )
  );

-- Risk Alerts policies
CREATE POLICY "Staff can view risk alerts" ON risk_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'doctor', 'nurse', 'staff')
    )
    OR patient_id = auth.uid() -- Patients can see their own alerts
  );

CREATE POLICY "Medical staff can manage risk alerts" ON risk_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor' OR role = 'nurse')
    )
  );

-- Risk Thresholds policies
CREATE POLICY "Staff can view risk thresholds" ON risk_thresholds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'doctor', 'nurse', 'staff')
    )
  );

CREATE POLICY "Admins can manage risk thresholds" ON risk_thresholds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Functions for automated triggers
CREATE OR REPLACE FUNCTION update_risk_assessment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_generic_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER trigger_update_risk_assessments_timestamp
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_risk_assessment_timestamp();

CREATE TRIGGER trigger_update_risk_validations_timestamp
  BEFORE UPDATE ON risk_validations
  FOR EACH ROW EXECUTE FUNCTION update_generic_timestamp();

CREATE TRIGGER trigger_update_risk_mitigations_timestamp
  BEFORE UPDATE ON risk_mitigations
  FOR EACH ROW EXECUTE FUNCTION update_generic_timestamp();

CREATE TRIGGER trigger_update_risk_alerts_timestamp
  BEFORE UPDATE ON risk_alerts
  FOR EACH ROW EXECUTE FUNCTION update_generic_timestamp();

CREATE TRIGGER trigger_update_risk_thresholds_timestamp
  BEFORE UPDATE ON risk_thresholds
  FOR EACH ROW EXECUTE FUNCTION update_generic_timestamp();

-- Insert default risk thresholds
INSERT INTO risk_thresholds (threshold_name, risk_category, threshold_type, low_threshold, moderate_threshold, high_threshold, critical_threshold) VALUES
('Medical Risk Standard', 'medical', 'score', 20, 40, 70, 90),
('Procedural Risk Standard', 'procedural', 'score', 15, 35, 65, 85),
('Patient-Specific Risk Standard', 'patient_specific', 'score', 25, 45, 75, 95),
('Environmental Risk Standard', 'environmental', 'score', 10, 30, 60, 80);

COMMENT ON TABLE risk_assessments IS 'Comprehensive automated risk assessments with medical validation';
COMMENT ON TABLE risk_validations IS 'Human-in-the-loop medical professional validation of risk assessments';
COMMENT ON TABLE risk_mitigations IS 'Risk mitigation strategies and implementation tracking';
COMMENT ON TABLE risk_alerts IS 'Real-time risk alerts with escalation and emergency integration';
COMMENT ON TABLE risk_thresholds IS 'Configurable risk thresholds for automated decision making';
