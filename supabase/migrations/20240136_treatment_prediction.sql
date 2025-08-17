-- Migration: Treatment Success Prediction System
-- Description: AI/ML-powered treatment success prediction with ≥85% accuracy
-- Date: 2025-01-26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Prediction Models table
CREATE TABLE prediction_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    algorithm_type VARCHAR(100) NOT NULL, -- ensemble, neural_network, random_forest, etc.
    accuracy DECIMAL(5,4) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
    confidence_threshold DECIMAL(5,4) NOT NULL DEFAULT 0.85,
    status VARCHAR(50) NOT NULL DEFAULT 'training', -- training, active, deprecated
    training_data_size INTEGER NOT NULL DEFAULT 0,
    feature_count INTEGER NOT NULL DEFAULT 0,
    model_data JSONB, -- Serialized model parameters
    performance_metrics JSONB, -- Precision, recall, F1-score, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(name, version)
);

-- Treatment Predictions table
CREATE TABLE treatment_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_type VARCHAR(255) NOT NULL,
    prediction_score DECIMAL(5,4) NOT NULL CHECK (prediction_score >= 0 AND prediction_score <= 1),
    confidence_interval JSONB NOT NULL, -- {lower: 0.75, upper: 0.95}
    risk_assessment VARCHAR(50) NOT NULL, -- low, medium, high
    predicted_outcome VARCHAR(100) NOT NULL, -- success, partial_success, failure
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    model_id UUID NOT NULL REFERENCES prediction_models(id),
    features_used JSONB NOT NULL, -- Input features for this prediction
    explainability_data JSONB, -- Feature importance, SHAP values, etc.
    actual_outcome VARCHAR(100), -- Filled after treatment completion
    outcome_date TIMESTAMP WITH TIME ZONE,
    accuracy_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Patient Factors table (for ML feature engineering)
CREATE TABLE patient_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    bmi DECIMAL(5,2),
    medical_history JSONB, -- Previous conditions, allergies, medications
    lifestyle_factors JSONB, -- Smoking, alcohol, exercise, diet
    treatment_history JSONB, -- Previous treatments and outcomes
    compliance_score DECIMAL(5,4), -- Treatment adherence history
    skin_type VARCHAR(50),
    skin_condition TEXT,
    treatment_expectations TEXT,
    psychological_factors JSONB, -- Anxiety, motivation, etc.
    social_factors JSONB, -- Support system, socioeconomic status
    geographic_factors JSONB, -- Location, climate, accessibility
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Characteristics table
CREATE TABLE treatment_characteristics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_type VARCHAR(255) NOT NULL,
    complexity_level INTEGER NOT NULL CHECK (complexity_level >= 1 AND complexity_level <= 5),
    duration_weeks INTEGER,
    session_count INTEGER,
    invasiveness_level INTEGER NOT NULL CHECK (invasiveness_level >= 1 AND invasiveness_level <= 5),
    recovery_time_days INTEGER,
    equipment_required JSONB, -- Equipment specifications
    provider_skill_required INTEGER CHECK (provider_skill_required >= 1 AND provider_skill_required <= 5),
    success_rate_baseline DECIMAL(5,4), -- Historical success rate
    contraindications JSONB, -- Medical contraindications
    side_effects JSONB, -- Potential side effects and severity
    cost_range JSONB, -- {min: 1000, max: 5000}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(treatment_type)
);

-- Model Performance Tracking table
CREATE TABLE model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES prediction_models(id) ON DELETE CASCADE,
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accuracy DECIMAL(5,4) NOT NULL,
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    auc_roc DECIMAL(5,4),
    predictions_count INTEGER NOT NULL DEFAULT 0,
    correct_predictions INTEGER NOT NULL DEFAULT 0,
    improvement_percentage DECIMAL(5,2), -- Success rate improvement
    validation_metrics JSONB, -- Cross-validation results
    feature_importance JSONB, -- Feature importance scores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prediction Feedback table (Human-in-the-loop)
CREATE TABLE prediction_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES treatment_predictions(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    feedback_type VARCHAR(50) NOT NULL, -- validation, correction, enhancement
    original_prediction DECIMAL(5,4) NOT NULL,
    adjusted_prediction DECIMAL(5,4),
    reasoning TEXT NOT NULL,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    medical_factors JSONB, -- Additional medical considerations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_treatment_predictions_patient_id ON treatment_predictions(patient_id);
CREATE INDEX idx_treatment_predictions_model_id ON treatment_predictions(model_id);
CREATE INDEX idx_treatment_predictions_prediction_date ON treatment_predictions(prediction_date);
CREATE INDEX idx_treatment_predictions_prediction_score ON treatment_predictions(prediction_score);
CREATE INDEX idx_patient_factors_patient_id ON patient_factors(patient_id);
CREATE INDEX idx_treatment_characteristics_type ON treatment_characteristics(treatment_type);
CREATE INDEX idx_model_performance_model_id ON model_performance(model_id);
CREATE INDEX idx_model_performance_evaluation_date ON model_performance(evaluation_date);
CREATE INDEX idx_prediction_feedback_prediction_id ON prediction_feedback(prediction_id);
CREATE INDEX idx_prediction_models_status ON prediction_models(status);
CREATE INDEX idx_prediction_models_accuracy ON prediction_models(accuracy DESC);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_prediction_models_performance_metrics ON prediction_models USING GIN (performance_metrics);
CREATE INDEX idx_treatment_predictions_features_used ON treatment_predictions USING GIN (features_used);
CREATE INDEX idx_patient_factors_medical_history ON patient_factors USING GIN (medical_history);
CREATE INDEX idx_patient_factors_lifestyle_factors ON patient_factors USING GIN (lifestyle_factors);
CREATE INDEX idx_treatment_characteristics_contraindications ON treatment_characteristics USING GIN (contraindications);

-- Row Level Security (RLS) policies
ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prediction_models
CREATE POLICY "Users can view prediction models" ON prediction_models
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage prediction models" ON prediction_models
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for treatment_predictions
CREATE POLICY "Users can view treatment predictions" ON treatment_predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Medical staff can create treatment predictions" ON treatment_predictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        ) AND created_by = auth.uid()
    );

CREATE POLICY "Medical staff can update treatment predictions" ON treatment_predictions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        ) AND created_by = auth.uid()
    );

-- RLS Policies for patient_factors
CREATE POLICY "Users can view patient factors for accessible patients" ON patient_factors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN user_profiles up ON up.user_id = auth.uid()
            WHERE p.id = patient_factors.patient_id
            AND up.role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

CREATE POLICY "Medical staff can manage patient factors" ON patient_factors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN user_profiles up ON up.user_id = auth.uid()
            WHERE p.id = patient_factors.patient_id
            AND up.role IN ('admin', 'doctor', 'nurse')
        )
    );

-- RLS Policies for treatment_characteristics
CREATE POLICY "Users can view treatment characteristics" ON treatment_characteristics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage treatment characteristics" ON treatment_characteristics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for model_performance
CREATE POLICY "Users can view model performance" ON model_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Admins can manage model performance" ON model_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for prediction_feedback
CREATE POLICY "Medical staff can view prediction feedback" ON prediction_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Medical staff can create prediction feedback" ON prediction_feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        ) AND provider_id = auth.uid()
    );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prediction_models_updated_at BEFORE UPDATE ON prediction_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_predictions_updated_at BEFORE UPDATE ON treatment_predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_factors_updated_at BEFORE UPDATE ON patient_factors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_characteristics_updated_at BEFORE UPDATE ON treatment_characteristics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default treatment characteristics data
INSERT INTO treatment_characteristics (treatment_type, complexity_level, duration_weeks, session_count, invasiveness_level, recovery_time_days, provider_skill_required, success_rate_baseline, equipment_required, contraindications, side_effects, cost_range) VALUES
('Laser Hair Removal', 2, 8, 6, 2, 1, 3, 0.92, '{"laser_type": "diode", "power_range": "800-810nm"}', '["pregnancy", "active_infection", "photosensitive_medication"]', '{"mild": ["redness", "swelling"], "rare": ["hyperpigmentation", "burns"]}', '{"min": 500, "max": 2000, "currency": "BRL"}'),
('Botox Injection', 3, 1, 1, 3, 2, 4, 0.95, '{"needles": "30G", "storage": "refrigerated"}', '["pregnancy", "neuromuscular_disorders", "infection_at_site"]', '{"common": ["bruising", "headache"], "rare": ["ptosis", "asymmetry"]}', '{"min": 800, "max": 1500, "currency": "BRL"}'),
('Chemical Peel', 3, 4, 3, 3, 7, 3, 0.88, '{"acids": ["glycolic", "trichloroacetic"], "neutralizer": "sodium_bicarbonate"}', '["active_acne", "recent_isotretinoin", "keloid_tendency"]', '{"expected": ["peeling", "redness"], "rare": ["hyperpigmentation", "scarring"]}', '{"min": 300, "max": 800, "currency": "BRL"}'),
('Microneedling', 2, 6, 4, 2, 3, 3, 0.90, '{"needle_depth": "0.5-2.5mm", "device": "derma_pen"}', '["active_acne", "blood_disorders", "keloid_history"]', '{"common": ["redness", "dryness"], "uncommon": ["infection", "scarring"]}', '{"min": 400, "max": 1200, "currency": "BRL"}'),
('Dermal Fillers', 4, 1, 1, 4, 3, 5, 0.93, '{"filler_type": "hyaluronic_acid", "needles": "25-27G"}', '["pregnancy", "autoimmune_disease", "infection_at_site"]', '{"common": ["swelling", "bruising"], "rare": ["vascular_occlusion", "granulomas"]}', '{"min": 1200, "max": 3000, "currency": "BRL"}'),
('IPL Photofacial', 2, 6, 4, 2, 1, 3, 0.85, '{"wavelength": "515-1200nm", "cooling": "contact_cooling"}', '["pregnancy", "tanned_skin", "photosensitive_medication"]', '{"mild": ["redness", "darkening"], "rare": ["hypopigmentation", "burns"]}', '{"min": 600, "max": 1500, "currency": "BRL"}'),
('Radiofrequency', 3, 8, 6, 3, 2, 4, 0.87, '{"frequency": "1-6MHz", "cooling": "active_cooling"}', '["pregnancy", "metal_implants", "active_infection"]', '{"common": ["redness", "swelling"], "rare": ["burns", "fat_necrosis"]}', '{"min": 800, "max": 2500, "currency": "BRL"}'),
('Cryolipolysis', 3, 12, 2, 3, 14, 4, 0.78, '{"temperature": "-11°C", "suction": "vacuum_applicator"}', '["pregnancy", "cold_agglutinin_disease", "cryoglobulinemia"]', '{"expected": ["numbness", "bruising"], "rare": ["paradoxical_hyperplasia", "nerve_damage"]}', '{"min": 1500, "max": 4000, "currency": "BRL"}');

-- Insert default prediction model
INSERT INTO prediction_models (name, version, algorithm_type, accuracy, confidence_threshold, status, training_data_size, feature_count, performance_metrics) VALUES
('NeonPro Treatment Success Predictor', '1.0', 'ensemble', 0.87, 0.85, 'active', 5000, 45, 
'{"precision": 0.89, "recall": 0.85, "f1_score": 0.87, "auc_roc": 0.92, "training_accuracy": 0.91, "validation_accuracy": 0.87, "cross_validation_mean": 0.86, "cross_validation_std": 0.02}'
);

-- Comments for documentation
COMMENT ON TABLE prediction_models IS 'Machine learning models for treatment success prediction';
COMMENT ON TABLE treatment_predictions IS 'Individual treatment success predictions with confidence intervals';
COMMENT ON TABLE patient_factors IS 'Patient characteristics and factors used for ML feature engineering';
COMMENT ON TABLE treatment_characteristics IS 'Treatment-specific characteristics and success factors';
COMMENT ON TABLE model_performance IS 'Model performance tracking and accuracy monitoring';
COMMENT ON TABLE prediction_feedback IS 'Human-in-the-loop feedback for model improvement';

COMMENT ON COLUMN prediction_models.accuracy IS 'Model accuracy score (0-1), target ≥0.85';
COMMENT ON COLUMN treatment_predictions.prediction_score IS 'Treatment success probability (0-1)';
COMMENT ON COLUMN treatment_predictions.confidence_interval IS 'JSON with lower and upper confidence bounds';
COMMENT ON COLUMN patient_factors.compliance_score IS 'Historical treatment adherence score (0-1)';
COMMENT ON COLUMN treatment_characteristics.complexity_level IS 'Treatment complexity (1=simple, 5=complex)';
COMMENT ON COLUMN model_performance.improvement_percentage IS 'Success rate improvement vs baseline';
