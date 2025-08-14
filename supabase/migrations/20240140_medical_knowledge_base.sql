-- Medical Knowledge Base Integration Migration
-- Story 9.5: Comprehensive medical knowledge management with research database access

-- Knowledge Sources table - Medical databases and repositories
CREATE TABLE public.knowledge_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100) NOT NULL, -- 'database', 'journal', 'guideline', 'drug_db'
  api_endpoint TEXT,
  access_credentials JSONB, -- Encrypted credentials for API access
  last_sync TIMESTAMPTZ,
  sync_frequency INTEGER DEFAULT 24, -- Hours between syncs
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error'
  configuration JSONB, -- Source-specific configuration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_source_type CHECK (source_type IN ('database', 'journal', 'guideline', 'drug_db', 'classification', 'research')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'error', 'syncing'))
);

-- Medical Knowledge table - Cached medical information
CREATE TABLE public.medical_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_type VARCHAR(100) NOT NULL, -- 'guideline', 'research', 'drug_info', 'diagnosis', 'treatment'
  title VARCHAR(500) NOT NULL,
  content_data JSONB NOT NULL, -- Structured medical content
  source_id UUID REFERENCES public.knowledge_sources(id),
  external_id VARCHAR(255), -- ID in external system
  validity_date DATE, -- When knowledge expires or needs review
  evidence_level VARCHAR(50), -- A, B, C, D evidence levels
  quality_score DECIMAL(3,2), -- 0.00 to 1.00 quality rating
  medical_categories TEXT[], -- Medical specialties/categories
  keywords TEXT[], -- Searchable keywords
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_knowledge_type CHECK (knowledge_type IN ('guideline', 'research', 'drug_info', 'diagnosis', 'treatment', 'protocol', 'reference')),
  CONSTRAINT valid_evidence_level CHECK (evidence_level IN ('A', 'B', 'C', 'D', 'Expert Opinion', 'Not Graded')),
  CONSTRAINT valid_quality_score CHECK (quality_score >= 0.00 AND quality_score <= 1.00)
);

-- Research Cache table - Cached search results
CREATE TABLE public.research_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  search_parameters JSONB, -- Filters, dates, categories
  search_results JSONB NOT NULL, -- Cached results
  source_id UUID REFERENCES public.knowledge_sources(id),
  cache_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  relevance_score DECIMAL(3,2), -- Search result relevance
  result_count INTEGER,
  search_user_id UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_relevance_score CHECK (relevance_score >= 0.00 AND relevance_score <= 1.00)
);

-- Validation Results table - Evidence validation for AI recommendations
CREATE TABLE public.validation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID, -- Reference to AI recommendation
  recommendation_type VARCHAR(100), -- 'treatment', 'diagnosis', 'protocol'
  knowledge_source_id UUID REFERENCES public.knowledge_sources(id),
  knowledge_reference_id UUID REFERENCES public.medical_knowledge(id),
  evidence_level VARCHAR(50),
  validation_status VARCHAR(50) NOT NULL, -- 'validated', 'conflicted', 'unsupported', 'pending'
  confidence_score DECIMAL(3,2), -- Validation confidence
  validation_notes TEXT,
  validation_date TIMESTAMPTZ DEFAULT NOW(),
  validator_id UUID REFERENCES auth.users(id), -- Human validator if applicable
  automated BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_validation_status CHECK (validation_status IN ('validated', 'conflicted', 'unsupported', 'pending', 'requires_review')),
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00)
);

-- Drug Information table - Pharmaceutical database
CREATE TABLE public.drug_information (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand_names TEXT[],
  drug_class VARCHAR(255),
  mechanism_of_action TEXT,
  indications TEXT[],
  contraindications TEXT[],
  side_effects JSONB, -- Structured side effect data
  dosage_information JSONB, -- Dosage guidelines
  interaction_data JSONB, -- Drug interactions
  monitoring_requirements TEXT[],
  pregnancy_category VARCHAR(10),
  controlled_substance_schedule VARCHAR(10),
  source_id UUID REFERENCES public.knowledge_sources(id),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for drug search
  INDEX idx_drug_name ON public.drug_information USING gin(to_tsvector('english', drug_name)),
  INDEX idx_generic_name ON public.drug_information USING gin(to_tsvector('english', generic_name))
);

-- Drug Interactions table - Drug-drug interactions
CREATE TABLE public.drug_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_1_id UUID REFERENCES public.drug_information(id),
  drug_2_id UUID REFERENCES public.drug_information(id),
  interaction_type VARCHAR(100), -- 'major', 'moderate', 'minor'
  severity_level INTEGER, -- 1-10 severity scale
  mechanism TEXT,
  clinical_effects TEXT,
  management_strategy TEXT,
  evidence_level VARCHAR(50),
  source_id UUID REFERENCES public.knowledge_sources(id),
  
  CONSTRAINT valid_interaction_type CHECK (interaction_type IN ('major', 'moderate', 'minor', 'contraindicated')),
  CONSTRAINT valid_severity_level CHECK (severity_level >= 1 AND severity_level <= 10),
  CONSTRAINT different_drugs CHECK (drug_1_id != drug_2_id)
);

-- Medical Guidelines table - Treatment guidelines and protocols
CREATE TABLE public.medical_guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guideline_title VARCHAR(500) NOT NULL,
  organization VARCHAR(255), -- Issuing medical organization
  version VARCHAR(50),
  publication_date DATE,
  last_review_date DATE,
  next_review_date DATE,
  specialty VARCHAR(255),
  conditions_covered TEXT[],
  guideline_content JSONB, -- Structured guideline content
  evidence_grade VARCHAR(50),
  implementation_notes TEXT,
  source_id UUID REFERENCES public.knowledge_sources(id),
  status VARCHAR(50) DEFAULT 'current', -- 'current', 'superseded', 'withdrawn'
  
  CONSTRAINT valid_guideline_status CHECK (status IN ('current', 'superseded', 'withdrawn', 'draft'))
);

-- Knowledge Search Index table - Search optimization
CREATE TABLE public.knowledge_search_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL, -- References knowledge content
  content_type VARCHAR(100) NOT NULL, -- 'knowledge', 'drug', 'guideline'
  search_vector tsvector,
  medical_terms TEXT[],
  concepts TEXT[],
  last_indexed TIMESTAMPTZ DEFAULT NOW(),
  
  -- Full-text search index
  INDEX idx_search_vector ON public.knowledge_search_index USING gin(search_vector),
  INDEX idx_medical_terms ON public.knowledge_search_index USING gin(medical_terms),
  INDEX idx_concepts ON public.knowledge_search_index USING gin(concepts)
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_sources_status ON public.knowledge_sources(status);
CREATE INDEX idx_knowledge_sources_type ON public.knowledge_sources(source_type);
CREATE INDEX idx_medical_knowledge_type ON public.medical_knowledge(knowledge_type);
CREATE INDEX idx_medical_knowledge_categories ON public.medical_knowledge USING gin(medical_categories);
CREATE INDEX idx_medical_knowledge_keywords ON public.medical_knowledge USING gin(keywords);
CREATE INDEX idx_research_cache_query ON public.research_cache(search_query);
CREATE INDEX idx_research_cache_expiry ON public.research_cache(expiry_date);
CREATE INDEX idx_validation_results_status ON public.validation_results(validation_status);
CREATE INDEX idx_drug_information_class ON public.drug_information(drug_class);
CREATE INDEX idx_drug_interactions_severity ON public.drug_interactions(severity_level);
CREATE INDEX idx_medical_guidelines_specialty ON public.medical_guidelines(specialty);
CREATE INDEX idx_medical_guidelines_status ON public.medical_guidelines(status);

-- Enable Row Level Security
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_search_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Knowledge Sources - Admin and medical staff access
CREATE POLICY "knowledge_sources_select" ON public.knowledge_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

CREATE POLICY "knowledge_sources_admin" ON public.knowledge_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Medical Knowledge - Read access for medical staff
CREATE POLICY "medical_knowledge_select" ON public.medical_knowledge
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

CREATE POLICY "medical_knowledge_admin" ON public.medical_knowledge
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Research Cache - User-specific access
CREATE POLICY "research_cache_user" ON public.research_cache
  FOR ALL USING (search_user_id = auth.uid());

CREATE POLICY "research_cache_medical_staff" ON public.research_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

-- Validation Results - Medical staff access
CREATE POLICY "validation_results_select" ON public.validation_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

CREATE POLICY "validation_results_insert" ON public.validation_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'medical_staff')
    )
  );

-- Drug Information - Read access for medical staff
CREATE POLICY "drug_information_select" ON public.drug_information
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff', 'pharmacist')
    )
  );

-- Drug Interactions - Read access for medical staff
CREATE POLICY "drug_interactions_select" ON public.drug_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff', 'pharmacist')
    )
  );

-- Medical Guidelines - Read access for medical staff
CREATE POLICY "medical_guidelines_select" ON public.medical_guidelines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

-- Knowledge Search Index - Read access for medical staff
CREATE POLICY "knowledge_search_index_select" ON public.knowledge_search_index
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor', 'nurse', 'medical_staff')
    )
  );

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_sources_updated_at 
  BEFORE UPDATE ON public.knowledge_sources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_knowledge_updated_at 
  BEFORE UPDATE ON public.medical_knowledge 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for automatic search indexing
CREATE OR REPLACE FUNCTION index_medical_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Index medical knowledge
  IF TG_TABLE_NAME = 'medical_knowledge' THEN
    INSERT INTO public.knowledge_search_index (content_id, content_type, search_vector, medical_terms, concepts)
    VALUES (
      NEW.id,
      'knowledge',
      to_tsvector('english', NEW.title || ' ' || COALESCE(NEW.content_data->>'summary', '')),
      NEW.keywords,
      NEW.medical_categories
    )
    ON CONFLICT (content_id, content_type) DO UPDATE SET
      search_vector = EXCLUDED.search_vector,
      medical_terms = EXCLUDED.medical_terms,
      concepts = EXCLUDED.concepts,
      last_indexed = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER index_medical_knowledge 
  AFTER INSERT OR UPDATE ON public.medical_knowledge 
  FOR EACH ROW EXECUTE FUNCTION index_medical_content();

-- Audit logging for knowledge updates
CREATE TABLE public.knowledge_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_knowledge_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.knowledge_audit_log (table_name, record_id, operation, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.knowledge_audit_log (table_name, record_id, operation, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.knowledge_audit_log (table_name, record_id, operation, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to key tables
CREATE TRIGGER audit_knowledge_sources 
  AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_sources 
  FOR EACH ROW EXECUTE FUNCTION log_knowledge_changes();

CREATE TRIGGER audit_medical_knowledge 
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_knowledge 
  FOR EACH ROW EXECUTE FUNCTION log_knowledge_changes();

CREATE TRIGGER audit_drug_information 
  AFTER INSERT OR UPDATE OR DELETE ON public.drug_information 
  FOR EACH ROW EXECUTE FUNCTION log_knowledge_changes();

-- Sample data for testing
INSERT INTO public.knowledge_sources (source_name, source_type, status) VALUES
('PubMed', 'database', 'active'),
('UpToDate', 'database', 'active'),
('FDA Drug Database', 'drug_db', 'active'),
('WHO Guidelines', 'guideline', 'active'),
('Cochrane Library', 'research', 'active');

-- Comments for documentation
COMMENT ON TABLE public.knowledge_sources IS 'Medical knowledge databases and repositories';
COMMENT ON TABLE public.medical_knowledge IS 'Cached medical information and research';
COMMENT ON TABLE public.research_cache IS 'Cached search results for performance';
COMMENT ON TABLE public.validation_results IS 'Evidence validation for AI recommendations';
COMMENT ON TABLE public.drug_information IS 'Pharmaceutical database information';
COMMENT ON TABLE public.drug_interactions IS 'Drug-drug interaction data';
COMMENT ON TABLE public.medical_guidelines IS 'Treatment guidelines and protocols';
COMMENT ON TABLE public.knowledge_search_index IS 'Search optimization index';
COMMENT ON TABLE public.knowledge_audit_log IS 'Audit trail for knowledge changes';
