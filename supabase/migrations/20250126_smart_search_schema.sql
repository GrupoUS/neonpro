-- Smart Search + NLP Integration Database Schema
-- Story 3.4: Smart Search + NLP Integration
-- Created: 2025-01-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Search Index Table
-- Unified search index across all patient data
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'patient', 'appointment', 'treatment', 'note', 'file'
    content_id UUID NOT NULL,
    searchable_text TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}',
    keywords TEXT[], -- Extracted keywords for faster matching
    language VARCHAR(5) DEFAULT 'pt', -- pt, en, es
    relevance_score DECIMAL(5,2) DEFAULT 1.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Analytics Table
-- Track search patterns and performance
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    query TEXT NOT NULL,
    normalized_query TEXT, -- Processed/normalized version
    query_intent VARCHAR(50), -- 'find_patient', 'find_appointment', 'find_treatment'
    results_count INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    response_time_ms INTEGER,
    language VARCHAR(5) DEFAULT 'pt',
    search_filters JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Segments Table
-- AI-driven patient segmentation
CREATE TABLE patient_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria_json JSONB NOT NULL, -- Complex criteria for segmentation
    patient_count INTEGER DEFAULT 0,
    auto_update BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Search Logs Table
-- Track voice search interactions
CREATE TABLE voice_search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    audio_file_url TEXT, -- URL to stored audio file
    transcription TEXT,
    confidence_score DECIMAL(5,2),
    query_result JSONB,
    processing_time_ms INTEGER,
    language VARCHAR(5) DEFAULT 'pt',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Suggestions Table
-- Store and rank search suggestions
CREATE TABLE search_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggestion_text VARCHAR(200) NOT NULL,
    category VARCHAR(50), -- 'patient', 'treatment', 'symptom', 'medication'
    usage_count INTEGER DEFAULT 0,
    relevance_score DECIMAL(5,2) DEFAULT 1.0,
    language VARCHAR(5) DEFAULT 'pt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NLP Processing Cache Table
-- Cache processed NLP results for performance
CREATE TABLE nlp_processing_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) UNIQUE NOT NULL, -- MD5 hash of query
    original_query TEXT NOT NULL,
    processed_tokens JSONB,
    extracted_entities JSONB,
    query_intent VARCHAR(50),
    language VARCHAR(5),
    processing_time_ms INTEGER,
    cache_hits INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_search_index_content_type ON search_index(content_type);
CREATE INDEX idx_search_index_content_id ON search_index(content_id);
CREATE INDEX idx_search_index_language ON search_index(language);
CREATE INDEX idx_search_index_relevance ON search_index(relevance_score DESC);
CREATE INDEX idx_search_index_updated ON search_index(last_updated DESC);

-- Full-text search indexes
CREATE INDEX idx_search_index_text_gin ON search_index USING gin(to_tsvector('portuguese', searchable_text));
CREATE INDEX idx_search_index_text_gist ON search_index USING gist(searchable_text gist_trgm_ops);
CREATE INDEX idx_search_index_keywords ON search_index USING gin(keywords);

-- Analytics indexes
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_timestamp ON search_analytics(timestamp DESC);
CREATE INDEX idx_search_analytics_intent ON search_analytics(query_intent);
CREATE INDEX idx_search_analytics_language ON search_analytics(language);

-- Patient segments indexes
CREATE INDEX idx_patient_segments_created_by ON patient_segments(created_by);
CREATE INDEX idx_patient_segments_updated ON patient_segments(last_updated DESC);

-- Voice search indexes
CREATE INDEX idx_voice_search_user ON voice_search_logs(user_id);
CREATE INDEX idx_voice_search_timestamp ON voice_search_logs(timestamp DESC);
CREATE INDEX idx_voice_search_language ON voice_search_logs(language);

-- Suggestions indexes
CREATE INDEX idx_search_suggestions_category ON search_suggestions(category);
CREATE INDEX idx_search_suggestions_usage ON search_suggestions(usage_count DESC);
CREATE INDEX idx_search_suggestions_relevance ON search_suggestions(relevance_score DESC);
CREATE INDEX idx_search_suggestions_language ON search_suggestions(language);

-- NLP cache indexes
CREATE INDEX idx_nlp_cache_hash ON nlp_processing_cache(query_hash);
CREATE INDEX idx_nlp_cache_expires ON nlp_processing_cache(expires_at);
CREATE INDEX idx_nlp_cache_language ON nlp_processing_cache(language);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_search_index_updated_at BEFORE UPDATE ON search_index
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_suggestions_updated_at BEFORE UPDATE ON search_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_processing_cache ENABLE ROW LEVEL SECURITY;

-- Search index policies (clinic-wide access)
CREATE POLICY "Users can view search index" ON search_index
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert search index" ON search_index
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update search index" ON search_index
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Search analytics policies (user-specific)
CREATE POLICY "Users can view own search analytics" ON search_analytics
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own search analytics" ON search_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient segments policies
CREATE POLICY "Users can view patient segments" ON patient_segments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create patient segments" ON patient_segments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own patient segments" ON patient_segments
    FOR UPDATE USING (auth.uid() = created_by OR auth.jwt() ->> 'role' = 'admin');

-- Voice search policies (user-specific)
CREATE POLICY "Users can view own voice searches" ON voice_search_logs
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own voice searches" ON voice_search_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Search suggestions policies (clinic-wide)
CREATE POLICY "Users can view search suggestions" ON search_suggestions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update search suggestions" ON search_suggestions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- NLP cache policies (clinic-wide for performance)
CREATE POLICY "Users can view nlp cache" ON nlp_processing_cache
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert nlp cache" ON nlp_processing_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update nlp cache" ON nlp_processing_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create search functions

-- Function to search with NLP processing
CREATE OR REPLACE FUNCTION search_with_nlp(
    p_query TEXT,
    p_language VARCHAR(5) DEFAULT 'pt',
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_content_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content_type VARCHAR(50),
    content_id UUID,
    searchable_text TEXT,
    metadata_json JSONB,
    relevance_score DECIMAL(5,2),
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.id,
        si.content_type,
        si.content_id,
        si.searchable_text,
        si.metadata_json,
        si.relevance_score,
        ts_rank(to_tsvector(CASE 
            WHEN p_language = 'pt' THEN 'portuguese'
            WHEN p_language = 'en' THEN 'english'
            WHEN p_language = 'es' THEN 'spanish'
            ELSE 'portuguese'
        END, si.searchable_text), plainto_tsquery(p_language, p_query)) as search_rank
    FROM search_index si
    WHERE 
        (p_content_types IS NULL OR si.content_type = ANY(p_content_types))
        AND (
            to_tsvector(CASE 
                WHEN p_language = 'pt' THEN 'portuguese'
                WHEN p_language = 'en' THEN 'english'
                WHEN p_language = 'es' THEN 'spanish'
                ELSE 'portuguese'
            END, si.searchable_text) @@ plainto_tsquery(p_language, p_query)
            OR si.searchable_text ILIKE '%' || p_query || '%'
            OR si.keywords && string_to_array(lower(p_query), ' ')
        )
        AND si.language = p_language
    ORDER BY search_rank DESC, si.relevance_score DESC, si.last_updated DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update search index
CREATE OR REPLACE FUNCTION update_search_index(
    p_content_type VARCHAR(50),
    p_content_id UUID,
    p_searchable_text TEXT,
    p_metadata_json JSONB DEFAULT '{}',
    p_keywords TEXT[] DEFAULT NULL,
    p_language VARCHAR(5) DEFAULT 'pt'
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO search_index (
        content_type,
        content_id,
        searchable_text,
        metadata_json,
        keywords,
        language
    ) VALUES (
        p_content_type,
        p_content_id,
        p_searchable_text,
        p_metadata_json,
        COALESCE(p_keywords, string_to_array(lower(p_searchable_text), ' ')),
        p_language
    )
    ON CONFLICT (content_type, content_id) 
    DO UPDATE SET
        searchable_text = EXCLUDED.searchable_text,
        metadata_json = EXCLUDED.metadata_json,
        keywords = COALESCE(EXCLUDED.keywords, string_to_array(lower(EXCLUDED.searchable_text), ' ')),
        language = EXCLUDED.language,
        last_updated = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired NLP cache
CREATE OR REPLACE FUNCTION clean_expired_nlp_cache()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM nlp_processing_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments
COMMENT ON TABLE search_index IS 'Unified search index for all clinic content with NLP support';
COMMENT ON TABLE search_analytics IS 'Analytics and performance tracking for search queries';
COMMENT ON TABLE patient_segments IS 'AI-driven patient segmentation for advanced filtering';
COMMENT ON TABLE voice_search_logs IS 'Voice search interaction logs and transcriptions';
COMMENT ON TABLE search_suggestions IS 'Smart search suggestions and auto-completion data';
COMMENT ON TABLE nlp_processing_cache IS 'Cache for NLP processing results to improve performance';