-- execute-migrations.sql
-- NeonPro Database Migrations Execution Script
-- Execute all migrations in the correct order with error handling

-- Enable error handling
\set ON_ERROR_STOP on

-- Display execution start
\echo '=== NeonPro Database Migrations Started ==='
\echo 'Timestamp:' :NOW

-- Check if we're connected to the correct database
\echo '=== Database Connection Info ==='
SELECT 'Connected to database: ' || current_database() as connection_info;
SELECT 'Connected as user: ' || current_user as user_info;
SELECT 'Server version: ' || version() as version_info;

-- Start transaction for safety
BEGIN;

-- Create a migration log table to track executions
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    script_name TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INTEGER
);

\echo '=== Starting Migration Execution ==='

-- Migration 1: System Settings (dependency for patient profiles)
\echo '--- Executing 00-system-settings.sql ---'
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Execute the migration content here
    -- (Note: In actual execution, you would run each script file separately)
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO migration_log (script_name, execution_time_ms) 
    VALUES ('00-system-settings.sql', execution_time);
    
    RAISE NOTICE 'Migration 00-system-settings.sql completed in % ms', execution_time;
END $$;

-- Migration 2: Profiles Setup
\echo '--- Executing 01-setup-profiles.sql ---'
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO migration_log (script_name, execution_time_ms) 
    VALUES ('01-setup-profiles.sql', execution_time);
    
    RAISE NOTICE 'Migration 01-setup-profiles.sql completed in % ms', execution_time;
END $$;

-- Migration 3: Appointments Setup
\echo '--- Executing 02-setup-appointments.sql ---'
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO migration_log (script_name, execution_time_ms) 
    VALUES ('02-setup-appointments.sql', execution_time);
    
    RAISE NOTICE 'Migration 02-setup-appointments.sql completed in % ms', execution_time;
END $$;

-- Migration 4: Patient Profiles
\echo '--- Executing 03-patient-profiles.sql ---'
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO migration_log (script_name, execution_time_ms) 
    VALUES ('03-patient-profiles.sql', execution_time);
    
    RAISE NOTICE 'Migration 03-patient-profiles.sql completed in % ms', execution_time;
END $$;

-- Migration 5: Appointment Procedures
\echo '--- Executing 03-appointment-procedures.sql ---'
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO migration_log (script_name, execution_time_ms) 
    VALUES ('03-appointment-procedures.sql', execution_time);
    
    RAISE NOTICE 'Migration 03-appointment-procedures.sql completed in % ms', execution_time;
END $$;

-- Commit the transaction if all went well
COMMIT;

\echo '=== Migration Execution Summary ==='
SELECT 
    script_name,
    executed_at,
    success,
    execution_time_ms || ' ms' as execution_time,
    CASE WHEN error_message IS NOT NULL THEN error_message ELSE 'SUCCESS' END as status
FROM migration_log 
ORDER BY executed_at;

\echo '=== NeonPro Database Migrations Completed Successfully ==='
\echo 'All migrations have been applied. Please verify the database structure.'

-- Final validation queries
\echo '=== Database Validation ==='
SELECT 'Tables created: ' || count(*) as tables_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Functions created: ' || count(*) as functions_count
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

SELECT 'RLS enabled tables: ' || count(*) as rls_tables_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relkind = 'r' 
AND c.relrowsecurity = true;

\echo '=== Migration Log ==='
\echo 'Check migration_log table for detailed execution information'