/**
 * LGPD Compliance Automation System - Supabase Configuration
 * Story 1.5: LGPD Compliance Automation
 * 
 * This file provides configuration and utilities for setting up
 * the LGPD compliance database schema in Supabase.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// =====================================================
// SUPABASE CLIENT CONFIGURATION
// =====================================================

/**
 * Creates a Supabase client with proper configuration for LGPD operations
 */
export function createLGPDSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'lgpd-compliance-system'
      }
    }
  });
}

// =====================================================
// DATABASE SCHEMA VALIDATION
// =====================================================

/**
 * Validates that all required LGPD tables exist in the database
 */
export async function validateLGPDSchema(supabase: SupabaseClient): Promise<{
  isValid: boolean;
  missingTables: string[];
  errors: string[];
}> {
  const requiredTables = [
    'lgpd_consent_records',
    'lgpd_audit_logs',
    'lgpd_data_subject_requests',
    'lgpd_compliance_assessments',
    'lgpd_compliance_alerts',
    'lgpd_breach_incidents',
    'lgpd_retention_policies',
    'lgpd_retention_executions',
    'lgpd_minimization_rules',
    'lgpd_minimization_violations',
    'lgpd_third_party_agreements',
    'lgpd_third_party_transfers',
    'lgpd_assessments',
    'lgpd_legal_documents'
  ];

  const missingTables: string[] = [];
  const errors: string[] = [];

  try {
    // Check if tables exist by querying information_schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', requiredTables);

    if (error) {
      errors.push(`Failed to query database schema: ${error.message}`);
      return { isValid: false, missingTables: [], errors };
    }

    const existingTables = tables?.map(t => t.table_name) || [];
    
    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        missingTables.push(table);
      }
    }

    // Additional validation: Check for required indexes
    const requiredIndexes = [
      'idx_lgpd_consent_records_clinic_id',
      'idx_lgpd_audit_logs_clinic_id',
      'idx_lgpd_dsr_clinic_id',
      'idx_lgpd_compliance_assessments_clinic_id'
    ];

    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('schemaname', 'public')
      .in('indexname', requiredIndexes);

    if (indexError) {
      errors.push(`Failed to query database indexes: ${indexError.message}`);
    } else {
      const existingIndexes = indexes?.map(i => i.indexname) || [];
      const missingIndexes = requiredIndexes.filter(idx => !existingIndexes.includes(idx));
      
      if (missingIndexes.length > 0) {
        errors.push(`Missing required indexes: ${missingIndexes.join(', ')}`);
      }
    }

  } catch (err) {
    errors.push(`Schema validation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    isValid: missingTables.length === 0 && errors.length === 0,
    missingTables,
    errors
  };
}

// =====================================================
// SCHEMA SETUP UTILITIES
// =====================================================

/**
 * Executes the LGPD schema SQL file
 * Note: This requires database admin privileges
 */
export async function setupLGPDSchema(supabase: SupabaseClient): Promise<{
  success: boolean;
  message: string;
  errors?: string[];
}> {
  try {
    // Read the schema SQL file
    const schemaSQL = await import('./schema.sql?raw');
    
    // Execute the schema SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: schemaSQL.default
    });

    if (error) {
      return {
        success: false,
        message: 'Failed to execute schema SQL',
        errors: [error.message]
      };
    }

    // Validate the schema was created successfully
    const validation = await validateLGPDSchema(supabase);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Schema created but validation failed',
        errors: validation.errors
      };
    }

    return {
      success: true,
      message: 'LGPD schema setup completed successfully'
    };

  } catch (err) {
    return {
      success: false,
      message: 'Schema setup failed',
      errors: [err instanceof Error ? err.message : 'Unknown error']
    };
  }
}

// =====================================================
// ROW LEVEL SECURITY HELPERS
// =====================================================

/**
 * Validates that RLS policies are properly configured
 */
export async function validateRLSPolicies(supabase: SupabaseClient): Promise<{
  isValid: boolean;
  missingPolicies: string[];
  errors: string[];
}> {
  const requiredPolicies = [
    'Users can view consent records for their clinics',
    'Users can insert consent records for their clinics',
    'Users can view audit logs for their clinics',
    'Users can manage DSR for their clinics',
    'Users can manage compliance assessments for their clinics'
  ];

  const missingPolicies: string[] = [];
  const errors: string[] = [];

  try {
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .eq('schemaname', 'public')
      .like('tablename', 'lgpd_%');

    if (error) {
      errors.push(`Failed to query RLS policies: ${error.message}`);
      return { isValid: false, missingPolicies: [], errors };
    }

    const existingPolicies = policies?.map(p => p.policyname) || [];
    
    for (const policy of requiredPolicies) {
      if (!existingPolicies.includes(policy)) {
        missingPolicies.push(policy);
      }
    }

  } catch (err) {
    errors.push(`RLS validation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    isValid: missingPolicies.length === 0 && errors.length === 0,
    missingPolicies,
    errors
  };
}

// =====================================================
// MIGRATION UTILITIES
// =====================================================

/**
 * Checks if the database needs migration to support LGPD features
 */
export async function checkMigrationStatus(supabase: SupabaseClient): Promise<{
  needsMigration: boolean;
  currentVersion: string;
  targetVersion: string;
  migrationSteps: string[];
}> {
  const targetVersion = '1.0.0';
  const migrationSteps: string[] = [];

  try {
    // Check if migration tracking table exists
    const { data: migrationTable, error: migrationError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'lgpd_migrations');

    if (migrationError || !migrationTable || migrationTable.length === 0) {
      // No migration table exists, full setup needed
      migrationSteps.push('Create migration tracking table');
      migrationSteps.push('Execute full LGPD schema setup');
      migrationSteps.push('Configure RLS policies');
      migrationSteps.push('Create default data');
      
      return {
        needsMigration: true,
        currentVersion: '0.0.0',
        targetVersion,
        migrationSteps
      };
    }

    // Check current version
    const { data: versionData, error: versionError } = await supabase
      .from('lgpd_migrations')
      .select('version')
      .order('applied_at', { ascending: false })
      .limit(1);

    if (versionError) {
      migrationSteps.push('Fix migration table issues');
      migrationSteps.push('Validate current schema');
      
      return {
        needsMigration: true,
        currentVersion: 'unknown',
        targetVersion,
        migrationSteps
      };
    }

    const currentVersion = versionData?.[0]?.version || '0.0.0';
    
    if (currentVersion !== targetVersion) {
      migrationSteps.push(`Migrate from ${currentVersion} to ${targetVersion}`);
      migrationSteps.push('Update schema if needed');
      migrationSteps.push('Validate migration');
      
      return {
        needsMigration: true,
        currentVersion,
        targetVersion,
        migrationSteps
      };
    }

    return {
      needsMigration: false,
      currentVersion,
      targetVersion,
      migrationSteps: []
    };

  } catch (err) {
    migrationSteps.push('Handle migration check errors');
    migrationSteps.push('Perform full schema validation');
    
    return {
      needsMigration: true,
      currentVersion: 'error',
      targetVersion,
      migrationSteps
    };
  }
}

// =====================================================
// PERFORMANCE OPTIMIZATION
// =====================================================

/**
 * Analyzes database performance for LGPD tables
 */
export async function analyzeLGPDPerformance(supabase: SupabaseClient): Promise<{
  recommendations: string[];
  slowQueries: string[];
  indexUsage: Record<string, number>;
}> {
  const recommendations: string[] = [];
  const slowQueries: string[] = [];
  const indexUsage: Record<string, number> = {};

  try {
    // Check table sizes
    const { data: tableSizes, error: sizeError } = await supabase
      .from('pg_stat_user_tables')
      .select('relname, n_tup_ins, n_tup_upd, n_tup_del, seq_scan, idx_scan')
      .like('relname', 'lgpd_%');

    if (!sizeError && tableSizes) {
      for (const table of tableSizes) {
        const totalOps = table.n_tup_ins + table.n_tup_upd + table.n_tup_del;
        const indexRatio = table.idx_scan / (table.seq_scan + table.idx_scan || 1);
        
        indexUsage[table.relname] = indexRatio;
        
        if (indexRatio < 0.8 && totalOps > 1000) {
          recommendations.push(`Consider adding indexes to ${table.relname} (index usage: ${(indexRatio * 100).toFixed(1)}%)`);
        }
        
        if (table.seq_scan > table.idx_scan && totalOps > 100) {
          recommendations.push(`High sequential scan ratio on ${table.relname} - review query patterns`);
        }
      }
    }

    // Check for missing indexes on foreign keys
    const lgpdTables = [
      'lgpd_consent_records',
      'lgpd_audit_logs',
      'lgpd_data_subject_requests',
      'lgpd_compliance_assessments',
      'lgpd_compliance_alerts',
      'lgpd_breach_incidents'
    ];

    for (const table of lgpdTables) {
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', table)
        .eq('table_schema', 'public')
        .like('column_name', '%_id');

      if (!columnError && columns) {
        for (const column of columns) {
          // Check if index exists for this column
          const { data: indexes, error: indexError } = await supabase
            .from('pg_indexes')
            .select('indexname')
            .eq('tablename', table)
            .like('indexdef', `%${column.column_name}%`);

          if (!indexError && (!indexes || indexes.length === 0)) {
            recommendations.push(`Consider adding index on ${table}.${column.column_name}`);
          }
        }
      }
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Database performance looks good for LGPD operations');
    }

  } catch (err) {
    recommendations.push('Unable to analyze performance - check database permissions');
  }

  return {
    recommendations,
    slowQueries,
    indexUsage
  };
}

// =====================================================
// BACKUP AND MAINTENANCE
// =====================================================

/**
 * Creates a backup configuration for LGPD data
 */
export function createBackupConfig() {
  return {
    tables: [
      'lgpd_consent_records',
      'lgpd_audit_logs',
      'lgpd_data_subject_requests',
      'lgpd_compliance_assessments',
      'lgpd_compliance_alerts',
      'lgpd_breach_incidents',
      'lgpd_retention_policies',
      'lgpd_retention_executions',
      'lgpd_minimization_rules',
      'lgpd_minimization_violations',
      'lgpd_third_party_agreements',
      'lgpd_third_party_transfers',
      'lgpd_assessments',
      'lgpd_legal_documents'
    ],
    schedule: {
      daily: ['lgpd_audit_logs', 'lgpd_consent_records'],
      weekly: ['lgpd_data_subject_requests', 'lgpd_compliance_assessments'],
      monthly: ['lgpd_retention_policies', 'lgpd_assessments']
    },
    retention: {
      daily: '30 days',
      weekly: '12 weeks',
      monthly: '12 months'
    },
    encryption: true,
    compression: true
  };
}

/**
 * Maintenance tasks for LGPD database
 */
export async function performMaintenance(supabase: SupabaseClient): Promise<{
  success: boolean;
  tasksCompleted: string[];
  errors: string[];
}> {
  const tasksCompleted: string[] = [];
  const errors: string[] = [];

  try {
    // Vacuum analyze LGPD tables
    const lgpdTables = [
      'lgpd_consent_records',
      'lgpd_audit_logs',
      'lgpd_data_subject_requests',
      'lgpd_compliance_assessments'
    ];

    for (const table of lgpdTables) {
      try {
        await supabase.rpc('vacuum_analyze_table', { table_name: table });
        tasksCompleted.push(`Vacuumed and analyzed ${table}`);
      } catch (err) {
        errors.push(`Failed to vacuum ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Update table statistics
    try {
      await supabase.rpc('update_table_statistics');
      tasksCompleted.push('Updated table statistics');
    } catch (err) {
      errors.push(`Failed to update statistics: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Clean up old audit logs (older than 7 years as per LGPD)
    try {
      const { error: cleanupError } = await supabase
        .from('lgpd_audit_logs')
        .delete()
        .lt('created_at', new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString());

      if (cleanupError) {
        errors.push(`Failed to cleanup old audit logs: ${cleanupError.message}`);
      } else {
        tasksCompleted.push('Cleaned up old audit logs');
      }
    } catch (err) {
      errors.push(`Audit log cleanup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

  } catch (err) {
    errors.push(`Maintenance error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    success: errors.length === 0,
    tasksCompleted,
    errors
  };
}

// =====================================================
// EXPORT CONFIGURATION
// =====================================================

export const lgpdDatabaseConfig = {
  createClient: createLGPDSupabaseClient,
  validateSchema: validateLGPDSchema,
  setupSchema: setupLGPDSchema,
  validateRLS: validateRLSPolicies,
  checkMigration: checkMigrationStatus,
  analyzePerformance: analyzeLGPDPerformance,
  createBackupConfig,
  performMaintenance
};

export default lgpdDatabaseConfig;