-- validate-migrations.sql
-- NeonPro Database Migration Validation Script
-- Verifies that all migrations were applied correctly

\echo '=== NeonPro Database Migration Validation ==='
\echo 'Validating database structure and integrity...'

-- Create validation results table
CREATE TEMP TABLE validation_results (
    check_name TEXT,
    status TEXT,
    details TEXT,
    critical BOOLEAN DEFAULT FALSE
);

-- Function to add validation result
CREATE OR REPLACE FUNCTION add_validation_result(
    check_name_param TEXT,
    status_param TEXT,
    details_param TEXT DEFAULT '',
    critical_param BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO validation_results (check_name, status, details, critical)
    VALUES (check_name_param, status_param, details_param, critical_param);
END;
$$ LANGUAGE plpgsql;

\echo '--- Checking Core Tables ---'

-- Check if essential tables exist
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'system_settings', 'profiles', 'clinics', 'patients', 
        'professionals', 'service_types', 'appointments', 
        'clinic_staff', 'appointment_history', 'patient_profiles',
        'patient_audit_log'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY expected_tables LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF table_count > 0 THEN
            PERFORM add_validation_result(
                'Table: ' || table_name,
                'EXISTS',
                'Table found in database'
            );
        ELSE
            PERFORM add_validation_result(
                'Table: ' || table_name,
                'MISSING',
                'Critical table missing from database',
                TRUE
            );
        END IF;
    END LOOP;
END $$;

\echo '--- Checking RLS Policies ---'

-- Check RLS is enabled on critical tables
DO $$
DECLARE
    rls_tables TEXT[] := ARRAY[
        'profiles', 'clinics', 'patients', 'professionals', 
        'service_types', 'appointments', 'clinic_staff', 
        'appointment_history', 'patient_profiles', 'patient_audit_log'
    ];
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY rls_tables LOOP
        SELECT c.relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = table_name;
        
        IF rls_enabled THEN
            PERFORM add_validation_result(
                'RLS: ' || table_name,
                'ENABLED',
                'Row Level Security is properly enabled'
            );
        ELSE
            PERFORM add_validation_result(
                'RLS: ' || table_name,
                'DISABLED',
                'Row Level Security not enabled - SECURITY RISK',
                TRUE
            );
        END IF;
    END LOOP;
END $$;

\echo '--- Checking Functions ---'

-- Check essential functions exist
DO $$
DECLARE
    function_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'handle_new_user', 'set_updated_at', 'check_appointment_conflict',
        'is_within_business_hours', 'is_professional_available',
        'sp_book_appointment', 'sp_update_appointment', 'sp_delete_appointment',
        'get_available_slots', 'record_patient_data_access', 'check_patient_consent'
    ];
    function_name TEXT;
BEGIN
    FOREACH function_name IN ARRAY expected_functions LOOP
        SELECT COUNT(*) INTO function_count
        FROM information_schema.routines
        WHERE routine_schema = 'public' 
        AND routine_name = function_name
        AND routine_type = 'FUNCTION';
        
        IF function_count > 0 THEN
            PERFORM add_validation_result(
                'Function: ' || function_name,
                'EXISTS',
                'Function found in database'
            );
        ELSE
            PERFORM add_validation_result(
                'Function: ' || function_name,
                'MISSING',
                'Required function missing from database',
                TRUE
            );
        END IF;
    END LOOP;
END $$;

\echo '--- Checking Indexes ---'

-- Check performance indexes
DO $$
DECLARE
    index_count INTEGER;
    expected_indexes TEXT[] := ARRAY[
        'idx_appointments_professional_time', 'idx_appointments_patient_id',
        'idx_appointments_clinic_date', 'idx_appointments_status',
        'idx_patient_profiles_user_id', 'idx_patient_profiles_cpf'
    ];
    index_name TEXT;
BEGIN
    FOREACH index_name IN ARRAY expected_indexes LOOP
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = index_name;
        
        IF index_count > 0 THEN
            PERFORM add_validation_result(
                'Index: ' || index_name,
                'EXISTS',
                'Performance index found'
            );
        ELSE
            PERFORM add_validation_result(
                'Index: ' || index_name,
                'MISSING',
                'Performance index missing - may impact performance',
                FALSE
            );
        END IF;
    END LOOP;
END $$;

\echo '--- Checking Constraints ---'

-- Check foreign key constraints
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
    AND constraint_type = 'FOREIGN KEY';
    
    IF constraint_count >= 10 THEN
        PERFORM add_validation_result(
            'Foreign Key Constraints',
            'ADEQUATE',
            'Found ' || constraint_count || ' foreign key constraints'
        );
    ELSE
        PERFORM add_validation_result(
            'Foreign Key Constraints',
            'INSUFFICIENT',
            'Only ' || constraint_count || ' foreign key constraints found',
            TRUE
        );
    END IF;
END $$;

\echo '--- Checking Extensions ---'

-- Check required extensions
DO $$
DECLARE
    extension_exists BOOLEAN;
    required_extensions TEXT[] := ARRAY['btree_gist', 'uuid-ossp'];
    ext_name TEXT;
BEGIN
    FOREACH ext_name IN ARRAY required_extensions LOOP
        SELECT EXISTS(
            SELECT 1 FROM pg_extension WHERE extname = ext_name
        ) INTO extension_exists;
        
        IF extension_exists THEN
            PERFORM add_validation_result(
                'Extension: ' || ext_name,
                'INSTALLED',
                'Required extension is installed'
            );
        ELSE
            PERFORM add_validation_result(
                'Extension: ' || ext_name,
                'MISSING',
                'Required extension not installed',
                TRUE
            );
        END IF;
    END LOOP;
END $$;

\echo '--- Checking Data Integrity ---'

-- Check if system settings has required entries
DO $$
DECLARE
    settings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO settings_count
    FROM public.system_settings
    WHERE key IN ('privacy_policy_version', 'app_name', 'app_version');
    
    IF settings_count >= 3 THEN
        PERFORM add_validation_result(
            'System Settings Data',
            'COMPLETE',
            'Required system settings are present'
        );
    ELSE
        PERFORM add_validation_result(
            'System Settings Data',
            'INCOMPLETE',
            'Missing required system settings entries',
            TRUE
        );
    END IF;
END $$;

\echo '--- Validation Summary ---'

-- Display results
SELECT 
    '🔍 VALIDATION RESULTS' as summary;

-- Show critical issues first
SELECT 
    '❌ CRITICAL ISSUES (MUST BE FIXED):' as critical_header
WHERE EXISTS(SELECT 1 FROM validation_results WHERE critical = TRUE);

SELECT 
    '  • ' || check_name || ': ' || status || 
    CASE WHEN details != '' THEN ' (' || details || ')' ELSE '' END as critical_issues
FROM validation_results 
WHERE critical = TRUE
ORDER BY check_name;

-- Show all results
SELECT 
    CASE 
        WHEN critical THEN '❌ CRITICAL'
        WHEN status IN ('EXISTS', 'ENABLED', 'COMPLETE', 'ADEQUATE', 'INSTALLED') THEN '✅ OK'
        ELSE '⚠️ WARNING'
    END || ' | ' || check_name || ': ' || status ||
    CASE WHEN details != '' THEN ' - ' || details ELSE '' END as all_results
FROM validation_results
ORDER BY critical DESC, check_name;

-- Final summary
SELECT 
    '📊 SUMMARY:' as final_summary;

SELECT 
    '  Total Checks: ' || COUNT(*) ||
    ' | Passed: ' || COUNT(*) FILTER (WHERE status IN ('EXISTS', 'ENABLED', 'COMPLETE', 'ADEQUATE', 'INSTALLED')) ||
    ' | Critical Issues: ' || COUNT(*) FILTER (WHERE critical = TRUE) ||
    ' | Warnings: ' || COUNT(*) FILTER (WHERE critical = FALSE AND status NOT IN ('EXISTS', 'ENABLED', 'COMPLETE', 'ADEQUATE', 'INSTALLED'))
    as summary_stats
FROM validation_results;

-- Migration recommendation
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM validation_results WHERE critical = TRUE) THEN
            '🚨 RECOMMENDATION: Fix critical issues before proceeding with application deployment.'
        ELSE
            '✅ RECOMMENDATION: Database is ready for application deployment.'
    END as recommendation;

-- Cleanup
DROP FUNCTION add_validation_result(TEXT, TEXT, TEXT, BOOLEAN);

\echo '=== Validation Complete ==='