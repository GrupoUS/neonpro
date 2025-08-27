-- Migration: Vision Analysis Schema Extensions
-- Epic 10.1: Automated Before/After Analysis
-- Target: ≥95% accuracy, <30s processing time

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for analysis
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE annotation_type AS ENUM ('measurement', 'highlight', 'comparison', 'annotation');
CREATE TYPE treatment_type AS ENUM (
  'skin-aesthetic', 
  'medical-healing', 
  'body-contouring', 
  'facial-rejuvenation', 
  'scar-treatment', 
  'pigmentation'
);

-- Additional enums for new features
CREATE TYPE share_type_enum AS ENUM ('public', 'private', 'professional');
CREATE TYPE export_format_enum AS ENUM ('pdf', 'excel', 'json', 'csv');
CREATE TYPE activity_type_enum AS ENUM (
    'created', 'updated', 'deleted', 'shared', 'share_revoked', 
    'exported', 'viewed', 'config_updated', 'config_reset',
    'quality_reviewed', 'annotation_added', 'annotation_updated'
);

-- Image Analysis Results Table
CREATE TABLE IF NOT EXISTS image_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  before_image_id UUID NOT NULL REFERENCES patient_images(id) ON DELETE CASCADE,
  after_image_id UUID NOT NULL REFERENCES patient_images(id) ON DELETE CASCADE,
  
  -- Analysis metadata
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  treatment_type treatment_type NOT NULL,
  status analysis_status NOT NULL DEFAULT 'pending',
  
  -- Performance metrics
  accuracy_score DECIMAL(5,4) NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  processing_time INTEGER NOT NULL CHECK (processing_time > 0), -- milliseconds
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Analysis results
  improvement_percentage DECIMAL(5,2) NOT NULL,
  change_metrics JSONB NOT NULL DEFAULT '{}',
  annotations JSONB NOT NULL DEFAULT '[]',
  
  -- Quality control
  meets_accuracy_requirement BOOLEAN GENERATED ALWAYS AS (accuracy_score >= 0.95) STORED,
  meets_time_requirement BOOLEAN GENERATED ALWAYS AS (processing_time <= 30000) STORED,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT different_images CHECK (before_image_id != after_image_id),
  CONSTRAINT valid_improvement CHECK (improvement_percentage >= -100 AND improvement_percentage <= 100)
);

-- Analysis Performance Tracking
CREATE TABLE IF NOT EXISTS analysis_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
  
  -- Performance metrics
  preprocessing_time INTEGER NOT NULL, -- milliseconds
  model_inference_time INTEGER NOT NULL, -- milliseconds
  postprocessing_time INTEGER NOT NULL, -- milliseconds
  total_processing_time INTEGER NOT NULL,
  
  -- Resource usage
  memory_usage_mb DECIMAL(8,2),
  cpu_usage_percent DECIMAL(5,2),
  gpu_usage_percent DECIMAL(5,2),
  
  -- Model information
  model_version VARCHAR(50),
  model_accuracy DECIMAL(5,4),
  
  -- Timestamps
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_times CHECK (
    preprocessing_time > 0 AND 
    model_inference_time > 0 AND 
    postprocessing_time > 0 AND
    total_processing_time = preprocessing_time + model_inference_time + postprocessing_time
  )
);

-- Analysis Annotations Table
CREATE TABLE IF NOT EXISTS analysis_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
  
  -- Annotation details
  annotation_type annotation_type NOT NULL,
  description TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- Array of {x, y, width?, height?}
  
  -- Measurement data
  measurement_value DECIMAL(10,4),
  measurement_unit VARCHAR(20),
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (jsonb_typeof(coordinates) = 'array'),
  CONSTRAINT measurement_consistency CHECK (
    (measurement_value IS NULL AND measurement_unit IS NULL) OR
    (measurement_value IS NOT NULL AND measurement_unit IS NOT NULL)
  )
);

-- Analysis Quality Control
CREATE TABLE IF NOT EXISTS analysis_quality_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
  
  -- Quality metrics
  image_quality_score DECIMAL(5,4) NOT NULL CHECK (image_quality_score >= 0 AND image_quality_score <= 1),
  alignment_score DECIMAL(5,4) NOT NULL CHECK (alignment_score >= 0 AND alignment_score <= 1),
  lighting_consistency DECIMAL(5,4) NOT NULL CHECK (lighting_consistency >= 0 AND lighting_consistency <= 1),
  resolution_adequacy BOOLEAN NOT NULL,
  
  -- Validation flags
  manual_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  automated_validation_passed BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Review information
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis Comparison History
CREATE TABLE IF NOT EXISTS analysis_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Comparison details
  baseline_analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
  current_analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
  
  -- Comparison metrics
  improvement_trend DECIMAL(5,2) NOT NULL, -- percentage change
  consistency_score DECIMAL(5,4) NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 1),
  
  -- Timeline information
  time_between_analyses INTERVAL NOT NULL,
  comparison_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_analyses CHECK (baseline_analysis_id != current_analysis_id)
);

-- Create indexes for performance
CREATE INDEX idx_image_analysis_patient_id ON image_analysis(patient_id);
CREATE INDEX idx_image_analysis_date ON image_analysis(analysis_date DESC);
CREATE INDEX idx_image_analysis_status ON image_analysis(status);
CREATE INDEX idx_image_analysis_accuracy ON image_analysis(accuracy_score DESC);
CREATE INDEX idx_image_analysis_processing_time ON image_analysis(processing_time);
CREATE INDEX idx_image_analysis_treatment_type ON image_analysis(treatment_type);
CREATE INDEX idx_image_analysis_requirements ON image_analysis(meets_accuracy_requirement, meets_time_requirement);

CREATE INDEX idx_analysis_performance_analysis_id ON analysis_performance(analysis_id);
CREATE INDEX idx_analysis_performance_total_time ON analysis_performance(total_processing_time);

CREATE INDEX idx_analysis_annotations_analysis_id ON analysis_annotations(analysis_id);
CREATE INDEX idx_analysis_annotations_type ON analysis_annotations(annotation_type);

CREATE INDEX idx_analysis_quality_analysis_id ON analysis_quality_control(analysis_id);
CREATE INDEX idx_analysis_quality_review_required ON analysis_quality_control(manual_review_required);

CREATE INDEX idx_analysis_comparisons_patient_id ON analysis_comparisons(patient_id);
CREATE INDEX idx_analysis_comparisons_date ON analysis_comparisons(comparison_date DESC);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_image_analysis_change_metrics ON image_analysis USING GIN (change_metrics);
CREATE INDEX idx_image_analysis_annotations ON image_analysis USING GIN (annotations);
CREATE INDEX idx_analysis_annotations_coordinates ON analysis_annotations USING GIN (coordinates);

-- Additional tables for sharing, exports, configuration, and activity logging

-- Analysis Shares Table
CREATE TABLE analysis_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES image_analysis(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type share_type_enum NOT NULL DEFAULT 'private',
    share_url TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    allowed_emails TEXT[] DEFAULT '{}',
    share_options JSONB NOT NULL DEFAULT '{}',
    password_hash TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis Share Views Table (for tracking who viewed shared analyses)
CREATE TABLE analysis_share_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES analysis_shares(id) ON DELETE CASCADE,
    viewer_email TEXT,
    viewer_ip TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis Exports Table
CREATE TABLE analysis_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_ids UUID[] NOT NULL,
    export_format export_format_enum NOT NULL,
    export_options JSONB NOT NULL DEFAULT '{}',
    file_size_bytes BIGINT,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vision Analysis Configuration Table
CREATE TABLE vision_analysis_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis Activity Log Table
CREATE TABLE analysis_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES image_analysis(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type activity_type_enum NOT NULL,
    activity_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- Enable Row Level Security on all tables
ALTER TABLE image_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_quality_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_share_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_analysis_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_analysis
CREATE POLICY "Users can view their clinic's image analyses" ON image_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE p.id = image_analysis.patient_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert image analyses for their clinic's patients" ON image_analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p 
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE p.id = image_analysis.patient_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their clinic's image analyses" ON image_analysis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patients p 
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE p.id = image_analysis.patient_id 
      AND cu.user_id = auth.uid()
    )
  );

-- RLS Policies for analysis_performance
CREATE POLICY "Users can view performance data for their clinic's analyses" ON analysis_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM image_analysis ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE ia.id = analysis_performance.analysis_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert performance data" ON analysis_performance
  FOR INSERT WITH CHECK (true); -- Allow system inserts

-- RLS Policies for analysis_annotations
CREATE POLICY "Users can view annotations for their clinic's analyses" ON analysis_annotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM image_analysis ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE ia.id = analysis_annotations.analysis_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage annotations for their clinic's analyses" ON analysis_annotations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM image_analysis ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE ia.id = analysis_annotations.analysis_id 
      AND cu.user_id = auth.uid()
    )
  );

-- RLS Policies for analysis_quality_control
CREATE POLICY "Users can view quality control for their clinic's analyses" ON analysis_quality_control
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM image_analysis ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE ia.id = analysis_quality_control.analysis_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage quality control for their clinic's analyses" ON analysis_quality_control
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM image_analysis ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE ia.id = analysis_quality_control.analysis_id 
      AND cu.user_id = auth.uid()
    )
  );

-- RLS Policies for analysis_comparisons
CREATE POLICY "Users can view comparisons for their clinic's patients" ON analysis_comparisons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE p.id = analysis_comparisons.patient_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage comparisons for their clinic's patients" ON analysis_comparisons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p 
      JOIN clinic_users cu ON p.clinic_id = cu.clinic_id 
      WHERE p.id = analysis_comparisons.patient_id 
      AND cu.user_id = auth.uid()
    )
  );

-- Create functions for automated triggers
CREATE OR REPLACE FUNCTION update_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_analysis_updated_at
  BEFORE UPDATE ON image_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_updated_at();

-- Function to validate analysis requirements
CREATE OR REPLACE FUNCTION validate_analysis_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate accuracy requirement
  IF NEW.accuracy_score < 0.95 THEN
    RAISE WARNING 'Analysis accuracy (%) below required 95%% threshold', (NEW.accuracy_score * 100);
  END IF;
  
  -- Validate processing time requirement
  IF NEW.processing_time > 30000 THEN
    RAISE WARNING 'Processing time (ms) exceeds 30s requirement', NEW.processing_time;
  END IF;
  
  -- Validate change metrics structure
  IF NOT (NEW.change_metrics ? 'overallImprovement') THEN
    RAISE EXCEPTION 'change_metrics must contain overallImprovement field';
  END IF;
  
  -- Validate annotations structure
  IF jsonb_typeof(NEW.annotations) != 'array' THEN
    RAISE EXCEPTION 'annotations must be a JSON array';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER trigger_validate_analysis_requirements
  BEFORE INSERT OR UPDATE ON image_analysis
  FOR EACH ROW
  EXECUTE FUNCTION validate_analysis_requirements();

-- Function to automatically create quality control record
CREATE OR REPLACE FUNCTION create_quality_control_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analysis_quality_control (
    analysis_id,
    image_quality_score,
    alignment_score,
    lighting_consistency,
    resolution_adequacy,
    manual_review_required,
    automated_validation_passed
  ) VALUES (
    NEW.id,
    0.95, -- Default quality score
    0.90, -- Default alignment score
    0.85, -- Default lighting consistency
    true, -- Assume adequate resolution
    NEW.accuracy_score < 0.95 OR NEW.processing_time > 30000, -- Require manual review if requirements not met
    NEW.accuracy_score >= 0.95 AND NEW.processing_time <= 30000 -- Automated validation
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic quality control
CREATE TRIGGER trigger_create_quality_control
  AFTER INSERT ON image_analysis
  FOR EACH ROW
  EXECUTE FUNCTION create_quality_control_record();

-- Create views for common queries
CREATE VIEW analysis_summary AS
SELECT 
  ia.id,
  ia.patient_id,
  p.name as patient_name,
  ia.analysis_date,
  ia.treatment_type,
  ia.accuracy_score,
  ia.processing_time,
  ia.improvement_percentage,
  ia.meets_accuracy_requirement,
  ia.meets_time_requirement,
  qc.manual_review_required,
  qc.automated_validation_passed,
  COUNT(aa.id) as annotation_count
FROM image_analysis ia
JOIN patients p ON ia.patient_id = p.id
LEFT JOIN analysis_quality_control qc ON ia.id = qc.analysis_id
LEFT JOIN analysis_annotations aa ON ia.id = aa.analysis_id
GROUP BY 
  ia.id, ia.patient_id, p.name, ia.analysis_date, ia.treatment_type,
  ia.accuracy_score, ia.processing_time, ia.improvement_percentage,
  ia.meets_accuracy_requirement, ia.meets_time_requirement,
  qc.manual_review_required, qc.automated_validation_passed;

-- Create view for performance analytics
CREATE VIEW analysis_performance_summary AS
SELECT 
  DATE_TRUNC('day', ia.analysis_date) as analysis_date,
  ia.treatment_type,
  COUNT(*) as total_analyses,
  AVG(ia.accuracy_score) as avg_accuracy,
  AVG(ia.processing_time) as avg_processing_time,
  AVG(ia.improvement_percentage) as avg_improvement,
  COUNT(*) FILTER (WHERE ia.meets_accuracy_requirement) as accuracy_compliant_count,
  COUNT(*) FILTER (WHERE ia.meets_time_requirement) as time_compliant_count,
  COUNT(*) FILTER (WHERE ia.meets_accuracy_requirement AND ia.meets_time_requirement) as fully_compliant_count
FROM image_analysis ia
GROUP BY DATE_TRUNC('day', ia.analysis_date), ia.treatment_type
ORDER BY analysis_date DESC;

-- RLS Policies for new tables

-- Analysis Shares Policies
CREATE POLICY "Users can view their own shares" ON analysis_shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares for their analyses" ON analysis_shares
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM image_analysis ia
            JOIN patients p ON ia.patient_id = p.id
            JOIN clinic_users cu ON p.clinic_id = cu.clinic_id
            WHERE ia.id = analysis_id AND cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own shares" ON analysis_shares
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON analysis_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Public access for active, non-expired shares (for shared links)
CREATE POLICY "Public access to active shares" ON analysis_shares
    FOR SELECT USING (
        is_active = true AND
        expires_at > NOW() AND
        share_type IN ('public', 'professional')
    );

-- Analysis Share Views Policies
CREATE POLICY "Anyone can log share views" ON analysis_share_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view logs for their shares" ON analysis_share_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analysis_shares 
            WHERE id = share_id AND user_id = auth.uid()
        )
    );

-- Analysis Exports Policies
CREATE POLICY "Users can view their own exports" ON analysis_exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports" ON analysis_exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports" ON analysis_exports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports" ON analysis_exports
    FOR DELETE USING (auth.uid() = user_id);

-- Vision Analysis Config Policies
CREATE POLICY "Users can view their own config" ON vision_analysis_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own config" ON vision_analysis_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" ON vision_analysis_config
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config" ON vision_analysis_config
    FOR DELETE USING (auth.uid() = user_id);

-- Analysis Activity Log Policies
CREATE POLICY "Users can view their own activity logs" ON analysis_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs" ON analysis_activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Additional indexes for performance
CREATE INDEX idx_analysis_shares_user_id ON analysis_shares(user_id);
CREATE INDEX idx_analysis_shares_analysis_id ON analysis_shares(analysis_id);
CREATE INDEX idx_analysis_shares_expires_at ON analysis_shares(expires_at);
CREATE INDEX idx_analysis_shares_active ON analysis_shares(is_active) WHERE is_active = true;
CREATE INDEX idx_analysis_share_views_share_id ON analysis_share_views(share_id);
CREATE INDEX idx_analysis_share_views_viewed_at ON analysis_share_views(viewed_at);
CREATE INDEX idx_analysis_exports_user_id ON analysis_exports(user_id);
CREATE INDEX idx_analysis_exports_created_at ON analysis_exports(created_at);
CREATE INDEX idx_vision_config_user_id ON vision_analysis_config(user_id);
CREATE INDEX idx_activity_log_user_id ON analysis_activity_log(user_id);
CREATE INDEX idx_activity_log_analysis_id ON analysis_activity_log(analysis_id);
CREATE INDEX idx_activity_log_activity_type ON analysis_activity_log(activity_type);
CREATE INDEX idx_activity_log_created_at ON analysis_activity_log(created_at);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_shares_updated_at BEFORE UPDATE ON analysis_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vision_config_updated_at BEFORE UPDATE ON vision_analysis_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON image_analysis TO authenticated;
GRANT SELECT, INSERT ON analysis_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_annotations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON analysis_quality_control TO authenticated;
GRANT SELECT, INSERT, UPDATE ON analysis_comparisons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_shares TO authenticated;
GRANT SELECT, INSERT ON analysis_share_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_exports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vision_analysis_config TO authenticated;
GRANT SELECT, INSERT ON analysis_activity_log TO authenticated;

GRANT SELECT ON analysis_summary TO authenticated;
GRANT SELECT ON analysis_performance_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE image_analysis IS 'Computer vision analysis results for before/after image comparisons with ≥95% accuracy and <30s processing time requirements';
COMMENT ON TABLE analysis_performance IS 'Detailed performance metrics for analysis operations';
COMMENT ON TABLE analysis_annotations IS 'Visual annotations and measurements from computer vision analysis';
COMMENT ON TABLE analysis_quality_control IS 'Quality control and validation records for analyses';
COMMENT ON TABLE analysis_comparisons IS 'Historical comparison tracking between analyses';

COMMENT ON COLUMN image_analysis.accuracy_score IS 'Analysis accuracy score (0-1), must be ≥0.95';
COMMENT ON COLUMN image_analysis.processing_time IS 'Processing time in milliseconds, must be ≤30000';
COMMENT ON COLUMN image_analysis.change_metrics IS 'JSON object containing detailed change measurements';
COMMENT ON COLUMN image_analysis.annotations IS 'JSON array of visual annotations and measurements';