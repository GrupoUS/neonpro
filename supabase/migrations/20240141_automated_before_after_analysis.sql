-- Migration: 20240141_automated_before_after_analysis.sql
-- Story 10.1: Automated Before/After Analysis (≥95% Accuracy)
-- Created: 2025-01-26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Analysis Engine Configuration
CREATE TABLE analysis_engine_config (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    engine_name varchar(100) NOT NULL,
    model_version varchar(50) NOT NULL,
    accuracy_threshold numeric(5,2) DEFAULT 95.00,
    processing_timeout_seconds integer DEFAULT 30,
    feature_extraction_config jsonb,
    measurement_metrics jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Photo Analysis Sessions
CREATE TABLE photo_analysis_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL,
    treatment_type varchar(100),
    session_name varchar(255),
    analysis_type varchar(50) CHECK (analysis_type IN ('before_after', 'progress_tracking', 'treatment_validation')),
    status varchar(30) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'queued')) DEFAULT 'pending',
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    processing_time_seconds integer,
    total_photos integer DEFAULT 0,
    processed_photos integer DEFAULT 0,
    accuracy_score numeric(5,2),
    confidence_level numeric(5,2),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_photo_analysis_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_photo_analysis_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Before/After Photo Pairs
CREATE TABLE before_after_photo_pairs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid NOT NULL,
    before_photo_id uuid,
    after_photo_id uuid,
    treatment_area varchar(100),
    pair_type varchar(50) CHECK (pair_type IN ('frontal', 'profile', 'close_up', 'full_body', 'specific_area')),
    time_between_days integer,
    analysis_status varchar(30) CHECK (analysis_status IN ('pending', 'analyzed', 'failed', 'manual_review')) DEFAULT 'pending',
    improvement_percentage numeric(5,2),
    comparison_score numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_photo_pairs_session FOREIGN KEY (session_id) REFERENCES photo_analysis_sessions(id) ON DELETE CASCADE
);

-- Image Analysis Results
CREATE TABLE image_analysis_results (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_pair_id uuid NOT NULL,
    analysis_engine varchar(100) NOT NULL,
    analysis_timestamp timestamp with time zone DEFAULT now(),
    processing_time_ms integer,
    feature_vectors jsonb,
    measurement_data jsonb,
    change_detection jsonb,
    quality_metrics jsonb,
    annotations jsonb,
    confidence_scores jsonb,
    raw_analysis_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_analysis_photo_pair FOREIGN KEY (photo_pair_id) REFERENCES before_after_photo_pairs(id) ON DELETE CASCADE
);

-- Measurement Metrics
CREATE TABLE measurement_metrics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name varchar(100) NOT NULL UNIQUE,
    metric_type varchar(50) CHECK (metric_type IN ('distance', 'area', 'volume', 'angle', 'texture', 'color', 'symmetry')),
    measurement_unit varchar(20),
    calculation_method varchar(100),
    accuracy_weight numeric(3,2) DEFAULT 1.00,
    is_active boolean DEFAULT true,
    description text,
    validation_rules jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Treatment Area Definitions
CREATE TABLE treatment_areas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_name varchar(100) NOT NULL UNIQUE,
    area_category varchar(50) CHECK (area_category IN ('facial', 'body', 'specific', 'surgical', 'cosmetic')),
    anatomical_region varchar(100),
    measurement_points jsonb,
    standard_views jsonb,
    analysis_parameters jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Visual Annotations
CREATE TABLE visual_annotations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_result_id uuid NOT NULL,
    annotation_type varchar(50) CHECK (annotation_type IN ('highlight', 'measurement', 'comparison', 'change_area', 'improvement_zone')),
    coordinates jsonb NOT NULL,
    annotation_data jsonb,
    style_properties jsonb,
    description text,
    is_visible boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_annotations_analysis FOREIGN KEY (analysis_result_id) REFERENCES image_analysis_results(id) ON DELETE CASCADE
);

-- Analysis Reports
CREATE TABLE analysis_reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid NOT NULL,
    report_type varchar(50) CHECK (report_type IN ('summary', 'detailed', 'patient_consultation', 'clinical', 'research')),
    report_title varchar(255),
    generated_at timestamp with time zone DEFAULT now(),
    report_data jsonb,
    export_formats jsonb,
    template_used varchar(100),
    generated_by uuid,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_reports_session FOREIGN KEY (session_id) REFERENCES photo_analysis_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_generated_by FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Quality Control Validations
CREATE TABLE quality_validations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_result_id uuid NOT NULL,
    validation_type varchar(50) CHECK (validation_type IN ('automated', 'manual', 'peer_review', 'expert_validation')),
    validator_id uuid,
    validation_status varchar(30) CHECK (validation_status IN ('pending', 'approved', 'rejected', 'needs_review')) DEFAULT 'pending',
    accuracy_assessment numeric(5,2),
    quality_score numeric(5,2),
    validation_notes text,
    validation_data jsonb,
    validated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fk_validations_analysis FOREIGN KEY (analysis_result_id) REFERENCES image_analysis_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_validations_validator FOREIGN KEY (validator_id) REFERENCES users(id)
);

-- Machine Learning Model Training
CREATE TABLE ml_model_training (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name varchar(100) NOT NULL,
    model_version varchar(50) NOT NULL,
    training_dataset_size integer,
    validation_dataset_size integer,
    training_start timestamp with time zone,
    training_end timestamp with time zone,
    accuracy_achieved numeric(5,2),
    precision_score numeric(5,2),
    recall_score numeric(5,2),
    f1_score numeric(5,2),
    training_parameters jsonb,
    model_weights_path text,
    deployment_status varchar(30) CHECK (deployment_status IN ('training', 'completed', 'deployed', 'archived')) DEFAULT 'training',
    performance_metrics jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default measurement metrics
INSERT INTO measurement_metrics (metric_name, metric_type, measurement_unit, calculation_method, description) VALUES
('facial_symmetry', 'symmetry', 'percentage', 'bilateral_comparison', 'Measures facial symmetry using bilateral landmark comparison'),
('skin_texture_improvement', 'texture', 'score', 'texture_analysis', 'Analyzes skin texture quality and improvement'),
('volume_change', 'volume', 'cubic_cm', '3d_reconstruction', 'Measures volume changes in treatment areas'),
('distance_measurement', 'distance', 'millimeters', 'landmark_distance', 'Measures distances between anatomical landmarks'),
('area_coverage', 'area', 'square_cm', 'contour_analysis', 'Measures area coverage of treatment effects'),
('color_uniformity', 'color', 'score', 'color_histogram', 'Analyzes color distribution and uniformity'),
('angle_correction', 'angle', 'degrees', 'angle_measurement', 'Measures angular corrections and improvements');

-- Insert default treatment areas
INSERT INTO treatment_areas (area_name, area_category, anatomical_region, analysis_parameters) VALUES
('facial_full', 'facial', 'face', '{"standard_views": ["frontal", "profile_left", "profile_right"], "key_landmarks": ["nose", "lips", "eyes", "jawline"]}'),
('facial_upper', 'facial', 'upper_face', '{"focus_areas": ["forehead", "eyes", "eyebrows"], "measurement_points": ["brow_position", "eye_symmetry"]}'),
('facial_lower', 'facial', 'lower_face', '{"focus_areas": ["chin", "jawline", "neck"], "measurement_points": ["chin_projection", "jawline_definition"]}'),
('body_abdomen', 'body', 'abdomen', '{"measurement_types": ["circumference", "volume", "contour"], "standard_poses": ["frontal", "side"]}'),
('body_arms', 'body', 'arms', '{"focus_areas": ["upper_arm", "forearm"], "measurement_points": ["circumference", "definition"]}'),
('surgical_rhinoplasty', 'surgical', 'nose', '{"specific_measurements": ["nasal_projection", "tip_rotation", "bridge_profile"]}'),
('cosmetic_lips', 'cosmetic', 'lips', '{"measurement_focus": ["volume", "symmetry", "definition"], "key_angles": ["cupids_bow", "commissure"]}}');

-- Insert default analysis engine configuration
INSERT INTO analysis_engine_config (engine_name, model_version, feature_extraction_config, measurement_metrics) VALUES
('primary_cv_engine', 'v2.1.0', 
 '{"algorithms": ["dlib_landmarks", "opencv_features", "deep_learning"], "preprocessing": ["noise_reduction", "normalization", "alignment"]}',
 '{"accuracy_threshold": 95.0, "confidence_minimum": 90.0, "processing_timeout": 30}');

-- Create indexes for performance
CREATE INDEX idx_photo_analysis_sessions_patient ON photo_analysis_sessions(patient_id);
CREATE INDEX idx_photo_analysis_sessions_status ON photo_analysis_sessions(status);
CREATE INDEX idx_photo_analysis_sessions_created ON photo_analysis_sessions(created_at);
CREATE INDEX idx_before_after_pairs_session ON before_after_photo_pairs(session_id);
CREATE INDEX idx_before_after_pairs_analysis_status ON before_after_photo_pairs(analysis_status);
CREATE INDEX idx_image_analysis_photo_pair ON image_analysis_results(photo_pair_id);
CREATE INDEX idx_image_analysis_timestamp ON image_analysis_results(analysis_timestamp);
CREATE INDEX idx_visual_annotations_analysis ON visual_annotations(analysis_result_id);
CREATE INDEX idx_analysis_reports_session ON analysis_reports(session_id);
CREATE INDEX idx_quality_validations_analysis ON quality_validations(analysis_result_id);
CREATE INDEX idx_quality_validations_status ON quality_validations(validation_status);
CREATE INDEX idx_ml_model_training_status ON ml_model_training(deployment_status);

-- Row Level Security (RLS)
ALTER TABLE analysis_engine_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_photo_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_training ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analysis engine config" ON analysis_engine_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage analysis engine config" ON analysis_engine_config FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their photo analysis sessions" ON photo_analysis_sessions FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create photo analysis sessions" ON photo_analysis_sessions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their photo analysis sessions" ON photo_analysis_sessions FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view photo pairs in their sessions" ON before_after_photo_pairs FOR SELECT USING (
    EXISTS (SELECT 1 FROM photo_analysis_sessions pas WHERE pas.id = session_id AND pas.created_by = auth.uid())
);

CREATE POLICY "Users can view analysis results for their sessions" ON image_analysis_results FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM before_after_photo_pairs bapp 
        JOIN photo_analysis_sessions pas ON pas.id = bapp.session_id 
        WHERE bapp.id = photo_pair_id AND pas.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view measurement metrics" ON measurement_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage measurement metrics" ON measurement_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view treatment areas" ON treatment_areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage treatment areas" ON treatment_areas FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view annotations for their analyses" ON visual_annotations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM image_analysis_results iar
        JOIN before_after_photo_pairs bapp ON bapp.id = iar.photo_pair_id
        JOIN photo_analysis_sessions pas ON pas.id = bapp.session_id 
        WHERE iar.id = analysis_result_id AND pas.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view their analysis reports" ON analysis_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM photo_analysis_sessions pas WHERE pas.id = session_id AND pas.created_by = auth.uid())
);

CREATE POLICY "Users can view quality validations for their analyses" ON quality_validations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM image_analysis_results iar
        JOIN before_after_photo_pairs bapp ON bapp.id = iar.photo_pair_id
        JOIN photo_analysis_sessions pas ON pas.id = bapp.session_id 
        WHERE iar.id = analysis_result_id AND pas.created_by = auth.uid()
    )
);

CREATE POLICY "Admin can view ML model training" ON ml_model_training FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage ML model training" ON ml_model_training FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for triggers
CREATE OR REPLACE FUNCTION update_photo_analysis_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_before_after_photo_pairs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_analysis_engine_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_measurement_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_treatment_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ml_model_training_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_photo_analysis_sessions_updated_at
    BEFORE UPDATE ON photo_analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION update_photo_analysis_sessions_updated_at();

CREATE TRIGGER trigger_update_before_after_photo_pairs_updated_at
    BEFORE UPDATE ON before_after_photo_pairs
    FOR EACH ROW EXECUTE FUNCTION update_before_after_photo_pairs_updated_at();

CREATE TRIGGER trigger_update_analysis_engine_config_updated_at
    BEFORE UPDATE ON analysis_engine_config
    FOR EACH ROW EXECUTE FUNCTION update_analysis_engine_config_updated_at();

CREATE TRIGGER trigger_update_measurement_metrics_updated_at
    BEFORE UPDATE ON measurement_metrics
    FOR EACH ROW EXECUTE FUNCTION update_measurement_metrics_updated_at();

CREATE TRIGGER trigger_update_treatment_areas_updated_at
    BEFORE UPDATE ON treatment_areas
    FOR EACH ROW EXECUTE FUNCTION update_treatment_areas_updated_at();

CREATE TRIGGER trigger_update_ml_model_training_updated_at
    BEFORE UPDATE ON ml_model_training
    FOR EACH ROW EXECUTE FUNCTION update_ml_model_training_updated_at();

-- Comments
COMMENT ON TABLE analysis_engine_config IS 'Configuration for computer vision analysis engines';
COMMENT ON TABLE photo_analysis_sessions IS 'Analysis sessions for before/after photo comparisons';
COMMENT ON TABLE before_after_photo_pairs IS 'Photo pairs for before/after analysis';
COMMENT ON TABLE image_analysis_results IS 'Results from automated image analysis';
COMMENT ON TABLE measurement_metrics IS 'Available measurement metrics for analysis';
COMMENT ON TABLE treatment_areas IS 'Defined treatment areas for analysis';
COMMENT ON TABLE visual_annotations IS 'Visual annotations and highlights on analyzed images';
COMMENT ON TABLE analysis_reports IS 'Generated analysis reports for consultation';
COMMENT ON TABLE quality_validations IS 'Quality control and validation results';
COMMENT ON TABLE ml_model_training IS 'Machine learning model training history and performance';
