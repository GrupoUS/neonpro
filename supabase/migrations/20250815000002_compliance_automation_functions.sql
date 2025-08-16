-- ================================================
-- STORY 4.1: COMPLIANCE AUTOMATION FUNCTIONS
-- Advanced compliance automation functions for LGPD, ANVISA, and CFM
-- ================================================

-- ================================================
-- LGPD COMPLIANCE AUTOMATION FUNCTIONS
-- ================================================

-- Function to automatically classify data based on content analysis
CREATE OR REPLACE FUNCTION auto_classify_data_element(
    p_table_name VARCHAR(255),
    p_column_name VARCHAR(255),
    p_sample_data TEXT
) RETURNS JSONB AS $$
DECLARE
    v_classification JSONB;
    v_sensitivity_score INTEGER := 0;
    v_category VARCHAR(50) := 'personal';
    v_encryption_required BOOLEAN := TRUE;
BEGIN
    -- Initialize classification object
    v_classification := '{}'::JSONB;
    
    -- Analyze data patterns and content
    -- Check for sensitive data patterns
    IF p_sample_data ~* '(cpf|cnpj|rg|passport|social\s*security)' OR
       p_column_name ~* '(cpf|cnpj|document|identity)' THEN
        v_category := 'sensitive';
        v_sensitivity_score := v_sensitivity_score + 3;
    END IF;
    
    -- Check for health data
    IF p_sample_data ~* '(medical|health|treatment|diagnosis|prescription)' OR
       p_column_name ~* '(medical|health|treatment|procedure)' THEN
        v_category := 'sensitive';
        v_sensitivity_score := v_sensitivity_score + 4;
    END IF;
    
    -- Check for financial data
    IF p_sample_data ~* '(bank|credit|payment|financial)' OR
       p_column_name ~* '(payment|bank|financial|credit)' THEN
        v_category := 'sensitive';
        v_sensitivity_score := v_sensitivity_score + 3;
    END IF;
    
    -- Check for biometric data
    IF p_sample_data ~* '(fingerprint|facial|biometric|dna)' OR
       p_column_name ~* '(biometric|fingerprint|facial)' THEN
        v_category := 'sensitive';
        v_sensitivity_score := v_sensitivity_score + 5;
    END IF;
    
    -- Build classification result
    v_classification := jsonb_build_object(
        'suggested_category', v_category,
        'sensitivity_score', v_sensitivity_score,
        'encryption_required', v_encryption_required,
        'recommended_retention_days', CASE 
            WHEN v_sensitivity_score >= 4 THEN 2555 -- 7 years for sensitive health data
            WHEN v_sensitivity_score >= 2 THEN 1825 -- 5 years for personal data
            ELSE 1095 -- 3 years for general data
        END,
        'recommended_legal_basis', CASE
            WHEN p_table_name ~* '(patient|medical|health)' THEN 'vital_interests'
            WHEN p_table_name ~* '(contract|billing|payment)' THEN 'contract'
            ELSE 'consent'
        END,
        'privacy_impact_required', v_sensitivity_score >= 3
    );
    
    RETURN v_classification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically process data subject rights requests
CREATE OR REPLACE FUNCTION process_data_subject_request(
    p_request_id UUID,
    p_processing_action VARCHAR(50) DEFAULT 'auto_process'
) RETURNS JSONB AS $$
DECLARE
    v_request compliance_data_subject_requests%ROWTYPE;
    v_result JSONB := '{}'::JSONB;
    v_data_found JSONB := '{}'::JSONB;
    v_tables_checked TEXT[] := '{}';
    v_records_affected INTEGER := 0;
BEGIN
    -- Get the request details
    SELECT * INTO v_request FROM compliance_data_subject_requests WHERE id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;
    
    -- Verify identity (simplified for automation)
    IF v_request.identity_verification_status != 'verified' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Identity not verified');
    END IF;
    
    -- Process based on request type
    CASE v_request.request_type
        WHEN 'access' THEN
            -- Collect all personal data for the data subject
            v_data_found := collect_personal_data_for_subject(v_request.data_subject_id);
            v_result := jsonb_build_object(
                'request_type', 'access',
                'data_collected', v_data_found,
                'format', 'json',
                'generated_at', NOW()
            );
            
        WHEN 'erasure' THEN
            -- Delete or anonymize personal data
            SELECT * INTO v_records_affected FROM delete_personal_data_for_subject(
                v_request.data_subject_id, 
                v_request.clinic_id
            );
            v_result := jsonb_build_object(
                'request_type', 'erasure',
                'records_affected', v_records_affected,
                'anonymization_applied', true,
                'processed_at', NOW()
            );
            
        WHEN 'portability' THEN
            -- Export data in portable format
            v_data_found := export_portable_data_for_subject(v_request.data_subject_id);
            v_result := jsonb_build_object(
                'request_type', 'portability',
                'exported_data', v_data_found,
                'format', 'structured_json',
                'generated_at', NOW()
            );
            
        WHEN 'rectification' THEN
            -- Process data rectification request
            v_result := process_data_rectification(v_request.id, v_request.request_details::JSONB);
            
        ELSE
            v_result := jsonb_build_object('success', false, 'error', 'Unsupported request type');
    END CASE;
    
    -- Update request status
    UPDATE compliance_data_subject_requests 
    SET 
        processing_status = 'completed',
        completed_at = NOW(),
        data_provided = v_result
    WHERE id = p_request_id;
    
    -- Log compliance event
    INSERT INTO compliance_monitoring_events (
        event_type, event_category, clinic_id, user_id, event_data, compliance_status, severity_level
    ) VALUES (
        'data_subject_request_processed', 'lgpd', v_request.clinic_id, v_request.processed_by,
        jsonb_build_object('request_id', p_request_id, 'request_type', v_request.request_type, 'result', v_result),
        'compliant', 1
    );
    
    RETURN jsonb_build_object('success', true, 'result', v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to collect personal data for a subject
CREATE OR REPLACE FUNCTION collect_personal_data_for_subject(
    p_data_subject_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_data JSONB := '{}'::JSONB;
    v_table_record RECORD;
    v_sql TEXT;
    v_result JSONB;
BEGIN
    -- Get all tables that contain personal data for this subject
    FOR v_table_record IN (
        SELECT DISTINCT table_name, column_name
        FROM compliance_data_classification 
        WHERE data_category IN ('personal', 'sensitive')
    ) LOOP
        -- Build dynamic SQL to extract data
        v_sql := format('
            SELECT jsonb_agg(to_jsonb(t.*)) 
            FROM %I t 
            WHERE id = $1 OR patient_id = $1 OR user_id = $1 OR data_subject_id = $1
        ', v_table_record.table_name);
        
        BEGIN
            EXECUTE v_sql INTO v_result USING p_data_subject_id;
            
            IF v_result IS NOT NULL AND jsonb_array_length(v_result) > 0 THEN
                v_data := jsonb_set(v_data, ARRAY[v_table_record.table_name], v_result);
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                -- Skip tables that don't have the expected structure
                CONTINUE;
        END;
    END LOOP;
    
    RETURN v_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete/anonymize personal data for a subject
CREATE OR REPLACE FUNCTION delete_personal_data_for_subject(
    p_data_subject_id UUID,
    p_clinic_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_records_affected INTEGER := 0;
    v_table_record RECORD;
    v_sql TEXT;
    v_retention_info RECORD;
BEGIN
    -- Check retention requirements before deletion
    FOR v_table_record IN (
        SELECT DISTINCT table_name, retention_period_days
        FROM compliance_data_classification 
        WHERE data_category IN ('personal', 'sensitive')
    ) LOOP
        -- Check if retention period has expired
        v_sql := format('
            SELECT COUNT(*) as count
            FROM %I 
            WHERE (id = $1 OR patient_id = $1 OR user_id = $1 OR data_subject_id = $1)
            AND created_at < NOW() - INTERVAL ''%s days''
        ', v_table_record.table_name, v_table_record.retention_period_days);
        
        BEGIN
            EXECUTE v_sql INTO v_retention_info USING p_data_subject_id;
            
            IF v_retention_info.count > 0 THEN
                -- Anonymize instead of delete for compliance
                v_sql := format('
                    UPDATE %I 
                    SET 
                        name = ''[ANONYMIZED]'',
                        email = ''anonymized@example.com'',
                        phone = ''000000000'',
                        document = ''ANONYMIZED'',
                        updated_at = NOW()
                    WHERE (id = $1 OR patient_id = $1 OR user_id = $1 OR data_subject_id = $1)
                ', v_table_record.table_name);
                
                EXECUTE v_sql USING p_data_subject_id;
                GET DIAGNOSTICS v_records_affected = ROW_COUNT;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                -- Skip tables that don't have the expected structure
                CONTINUE;
        END;
    END LOOP;
    
    RETURN v_records_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ANVISA COMPLIANCE AUTOMATION FUNCTIONS
-- ================================================

-- Function to validate IEC 62304 compliance for software changes
CREATE OR REPLACE FUNCTION validate_iec62304_compliance(
    p_software_item_name VARCHAR(255),
    p_software_version VARCHAR(50),
    p_change_description TEXT
) RETURNS JSONB AS $$
DECLARE
    v_software compliance_software_lifecycle%ROWTYPE;
    v_compliance_result JSONB := '{}'::JSONB;
    v_risk_assessment JSONB;
    v_compliance_score INTEGER := 100;
    v_violations TEXT[] := '{}';
BEGIN
    -- Get software lifecycle record
    SELECT * INTO v_software 
    FROM compliance_software_lifecycle 
    WHERE software_item_name = p_software_item_name 
    AND software_version = p_software_version;
    
    -- Check if software item exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'compliant', false,
            'error', 'Software item not found in lifecycle records'
        );
    END IF;
    
    -- Validate based on safety classification
    CASE v_software.safety_classification
        WHEN 'C' THEN
            -- Class C: Life-threatening - Strictest requirements
            IF v_software.risk_management_file_id IS NULL THEN
                v_violations := array_append(v_violations, 'Risk management file required for Class C');
                v_compliance_score := v_compliance_score - 25;
            END IF;
            
            IF jsonb_array_length(v_software.system_testing) < 3 THEN
                v_violations := array_append(v_violations, 'Insufficient system testing for Class C');
                v_compliance_score := v_compliance_score - 20;
            END IF;
            
        WHEN 'B' THEN
            -- Class B: Non-life-threatening injury - Moderate requirements
            IF jsonb_array_length(v_software.integration_testing) < 2 THEN
                v_violations := array_append(v_violations, 'Insufficient integration testing for Class B');
                v_compliance_score := v_compliance_score - 15;
            END IF;
            
        WHEN 'A' THEN
            -- Class A: No injury - Basic requirements
            IF v_software.software_requirements IS NULL THEN
                v_violations := array_append(v_violations, 'Software requirements missing');
                v_compliance_score := v_compliance_score - 10;
            END IF;
    END CASE;
    
    -- Check change control requirements
    IF p_change_description IS NOT NULL AND length(p_change_description) > 0 THEN
        -- Assess risk impact of change
        v_risk_assessment := assess_change_risk_impact(
            v_software.safety_classification,
            p_change_description
        );
        
        v_compliance_result := jsonb_set(v_compliance_result, '{risk_assessment}', v_risk_assessment);
    END IF;
    
    -- Build compliance result
    v_compliance_result := jsonb_build_object(
        'compliant', v_compliance_score >= 80,
        'compliance_score', v_compliance_score,
        'safety_classification', v_software.safety_classification,
        'violations', v_violations,
        'recommendations', generate_iec62304_recommendations(v_software, v_violations),
        'assessed_at', NOW()
    );
    
    -- Log compliance check
    INSERT INTO compliance_monitoring_events (
        event_type, event_category, event_data, compliance_status, severity_level
    ) VALUES (
        'iec62304_compliance_check', 'anvisa',
        jsonb_build_object('software', p_software_item_name, 'result', v_compliance_result),
        CASE WHEN v_compliance_score >= 80 THEN 'compliant' ELSE 'violation' END,
        CASE WHEN v_compliance_score < 60 THEN 4 ELSE 2 END
    );
    
    RETURN v_compliance_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assess change risk impact
CREATE OR REPLACE FUNCTION assess_change_risk_impact(
    p_safety_classification VARCHAR(10),
    p_change_description TEXT
) RETURNS JSONB AS $$
DECLARE
    v_risk_score INTEGER := 1;
    v_impact_areas TEXT[] := '{}';
    v_mitigation_required BOOLEAN := FALSE;
BEGIN
    -- Analyze change description for risk indicators
    IF p_change_description ~* '(algorithm|calculation|formula|logic)' THEN
        v_risk_score := v_risk_score + 2;
        v_impact_areas := array_append(v_impact_areas, 'core_algorithms');
    END IF;
    
    IF p_change_description ~* '(database|data|storage|persistence)' THEN
        v_risk_score := v_risk_score + 1;
        v_impact_areas := array_append(v_impact_areas, 'data_management');
    END IF;
    
    IF p_change_description ~* '(security|authentication|authorization|encryption)' THEN
        v_risk_score := v_risk_score + 3;
        v_impact_areas := array_append(v_impact_areas, 'security');
    END IF;
    
    IF p_change_description ~* '(interface|api|integration|communication)' THEN
        v_risk_score := v_risk_score + 1;
        v_impact_areas := array_append(v_impact_areas, 'interfaces');
    END IF;
    
    -- Adjust risk based on safety classification
    CASE p_safety_classification
        WHEN 'C' THEN v_risk_score := v_risk_score * 2;
        WHEN 'B' THEN v_risk_score := v_risk_score + 1;
        -- Class A keeps base score
    END CASE;
    
    -- Determine if additional mitigation is required
    v_mitigation_required := v_risk_score >= 5;
    
    RETURN jsonb_build_object(
        'risk_score', v_risk_score,
        'risk_level', CASE 
            WHEN v_risk_score <= 2 THEN 'low'
            WHEN v_risk_score <= 4 THEN 'medium'
            WHEN v_risk_score <= 6 THEN 'high'
            ELSE 'critical'
        END,
        'impact_areas', v_impact_areas,
        'mitigation_required', v_mitigation_required,
        'recommended_testing', CASE 
            WHEN v_risk_score >= 5 THEN '["regression", "integration", "system", "user_acceptance"]'::JSONB
            WHEN v_risk_score >= 3 THEN '["unit", "integration", "system"]'::JSONB
            ELSE '["unit", "integration"]'::JSONB
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- CFM PROFESSIONAL STANDARDS FUNCTIONS
-- ================================================

-- Function to validate professional credentials and licensing
CREATE OR REPLACE FUNCTION validate_cfm_professional_status(
    p_professional_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_professional compliance_medical_professionals%ROWTYPE;
    v_validation_result JSONB := '{}'::JSONB;
    v_compliance_score INTEGER := 100;
    v_violations TEXT[] := '{}';
    v_warnings TEXT[] := '{}';
BEGIN
    -- Get professional record
    SELECT * INTO v_professional 
    FROM compliance_medical_professionals 
    WHERE professional_id = p_professional_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Professional not found in compliance records'
        );
    END IF;
    
    -- Check license status
    IF v_professional.license_status != 'active' THEN
        v_violations := array_append(v_violations, 'Medical license is not active');
        v_compliance_score := v_compliance_score - 50;
    END IF;
    
    -- Check license expiry
    IF v_professional.license_expiry_date <= CURRENT_DATE THEN
        v_violations := array_append(v_violations, 'Medical license has expired');
        v_compliance_score := v_compliance_score - 40;
    ELSIF v_professional.license_expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        v_warnings := array_append(v_warnings, 'Medical license expires within 30 days');
        v_compliance_score := v_compliance_score - 10;
    END IF;
    
    -- Check continuing education status
    IF v_professional.continuing_education_status != 'current' THEN
        v_violations := array_append(v_violations, 'Continuing education requirements not current');
        v_compliance_score := v_compliance_score - 20;
    END IF;
    
    -- Check ethics training status
    IF v_professional.ethics_training_status != 'current' THEN
        v_violations := array_append(v_violations, 'Ethics training not current');
        v_compliance_score := v_compliance_score - 15;
    END IF;
    
    -- Check professional responsibility score
    IF v_professional.professional_responsibility_score < 70 THEN
        v_violations := array_append(v_violations, 'Professional responsibility score below threshold');
        v_compliance_score := v_compliance_score - 25;
    ELSIF v_professional.professional_responsibility_score < 85 THEN
        v_warnings := array_append(v_warnings, 'Professional responsibility score requires attention');
        v_compliance_score := v_compliance_score - 5;
    END IF;
    
    -- Check validation recency
    IF v_professional.last_validation_date < NOW() - INTERVAL '365 days' THEN
        v_warnings := array_append(v_warnings, 'Professional validation is overdue');
        v_compliance_score := v_compliance_score - 10;
    END IF;
    
    -- Build validation result
    v_validation_result := jsonb_build_object(
        'valid', v_compliance_score >= 80,
        'compliance_score', v_compliance_score,
        'cfm_registration', v_professional.cfm_registration,
        'license_status', v_professional.license_status,
        'license_expiry', v_professional.license_expiry_date,
        'violations', v_violations,
        'warnings', v_warnings,
        'telemedicine_authorized', v_professional.telemedicine_authorization,
        'electronic_prescription_authorized', v_professional.electronic_prescription_authorization,
        'last_validated', v_professional.last_validation_date,
        'validated_at', NOW()
    );
    
    -- Update last validation date
    UPDATE compliance_medical_professionals 
    SET last_validation_date = NOW(),
        next_validation_due = NOW() + INTERVAL '1 year'
    WHERE professional_id = p_professional_id;
    
    -- Log validation event
    INSERT INTO compliance_monitoring_events (
        event_type, event_category, user_id, event_data, compliance_status, severity_level
    ) VALUES (
        'cfm_professional_validation', 'cfm', p_professional_id,
        v_validation_result,
        CASE WHEN v_compliance_score >= 80 THEN 'compliant' ELSE 'violation' END,
        CASE WHEN v_compliance_score < 60 THEN 4 ELSE 2 END
    );
    
    RETURN v_validation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMPLIANCE MONITORING AND ALERTING FUNCTIONS
-- ================================================

-- Function to monitor compliance status across all systems
CREATE OR REPLACE FUNCTION monitor_overall_compliance_status(
    p_clinic_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_lgpd_score DECIMAL(5,2);
    v_anvisa_score DECIMAL(5,2);
    v_cfm_score DECIMAL(5,2);
    v_overall_score DECIMAL(5,2);
    v_critical_alerts INTEGER;
    v_pending_requests INTEGER;
    v_compliance_status JSONB;
BEGIN
    -- Calculate LGPD compliance score
    SELECT COALESCE(AVG(
        CASE 
            WHEN granted = TRUE AND (withdrawn = FALSE OR withdrawn IS NULL) THEN 100
            WHEN withdrawn = TRUE THEN 0
            ELSE 50
        END
    ), 0) INTO v_lgpd_score
    FROM compliance_consent_records
    WHERE (p_clinic_id IS NULL OR clinic_id = p_clinic_id);
    
    -- Calculate ANVISA compliance score
    SELECT COALESCE(AVG(
        CASE compliance_status
            WHEN 'compliant' THEN 100
            WHEN 'non_compliant' THEN 0
            ELSE 50
        END
    ), 0) INTO v_anvisa_score
    FROM compliance_software_lifecycle;
    
    -- Calculate CFM compliance score
    SELECT COALESCE(AVG(professional_responsibility_score), 0) INTO v_cfm_score
    FROM compliance_medical_professionals mp
    JOIN professionals p ON mp.professional_id = p.id
    WHERE (p_clinic_id IS NULL OR p.clinic_id = p_clinic_id)
    AND mp.license_status = 'active';
    
    -- Calculate overall compliance score
    v_overall_score := (v_lgpd_score + v_anvisa_score + v_cfm_score) / 3;
    
    -- Count critical alerts
    SELECT COUNT(*) INTO v_critical_alerts
    FROM compliance_alerts
    WHERE severity = 'critical' 
    AND alert_status = 'active'
    AND (p_clinic_id IS NULL OR clinic_id = p_clinic_id);
    
    -- Count pending data subject requests
    SELECT COUNT(*) INTO v_pending_requests
    FROM compliance_data_subject_requests
    WHERE processing_status IN ('received', 'in_progress')
    AND (p_clinic_id IS NULL OR clinic_id = p_clinic_id);
    
    -- Build compliance status
    v_compliance_status := jsonb_build_object(
        'overall_score', v_overall_score,
        'overall_status', CASE 
            WHEN v_overall_score >= 90 THEN 'excellent'
            WHEN v_overall_score >= 80 THEN 'good'
            WHEN v_overall_score >= 70 THEN 'fair'
            WHEN v_overall_score >= 60 THEN 'poor'
            ELSE 'critical'
        END,
        'lgpd_score', v_lgpd_score,
        'anvisa_score', v_anvisa_score,
        'cfm_score', v_cfm_score,
        'critical_alerts', v_critical_alerts,
        'pending_requests', v_pending_requests,
        'requires_attention', v_overall_score < 80 OR v_critical_alerts > 0 OR v_pending_requests > 10,
        'assessed_at', NOW()
    );
    
    -- Store compliance metrics
    INSERT INTO compliance_metrics (
        metric_type, metric_category, clinic_id, metric_name, metric_value, 
        measurement_period, measurement_date
    ) VALUES 
    ('compliance_score', 'overall', p_clinic_id, 'overall_compliance_score', v_overall_score, 'daily', NOW()),
    ('compliance_score', 'lgpd', p_clinic_id, 'lgpd_compliance_score', v_lgpd_score, 'daily', NOW()),
    ('compliance_score', 'anvisa', p_clinic_id, 'anvisa_compliance_score', v_anvisa_score, 'daily', NOW()),
    ('compliance_score', 'cfm', p_clinic_id, 'cfm_compliance_score', v_cfm_score, 'daily', NOW());
    
    RETURN v_compliance_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate IEC 62304 recommendations
CREATE OR REPLACE FUNCTION generate_iec62304_recommendations(
    p_software compliance_software_lifecycle,
    p_violations TEXT[]
) RETURNS JSONB AS $$
DECLARE
    v_recommendations JSONB := '[]'::JSONB;
BEGIN
    -- Generate recommendations based on violations and classification
    IF 'Risk management file required for Class C' = ANY(p_violations) THEN
        v_recommendations := v_recommendations || jsonb_build_array(jsonb_build_object(
            'priority', 'high',
            'category', 'risk_management',
            'recommendation', 'Complete risk management file per ISO 14971 requirements',
            'action_required', 'Create comprehensive risk analysis documentation'
        ));
    END IF;
    
    IF 'Insufficient system testing for Class C' = ANY(p_violations) THEN
        v_recommendations := v_recommendations || jsonb_build_array(jsonb_build_object(
            'priority', 'high',
            'category', 'testing',
            'recommendation', 'Implement comprehensive system testing suite',
            'action_required', 'Design and execute system-level test procedures'
        ));
    END IF;
    
    RETURN v_recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;