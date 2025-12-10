/**
 * Supabase Health Check Service
 *
 * Validates Supabase connection and basic functionality
 * Following docs/rules/supabase-best-practices.md
 */

import { createAdminClient, createServerClient } from '../lib/supabase/client';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Comprehensive Supabase health check
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  try {
    // Test 1: Basic connection with server client
    const serverClient = createServerClient();
    const { data: _serverTest, error: serverError } = await serverClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (serverError) {
      return {
        status: 'unhealthy',
        message: 'Server client connection failed',
        details: { error: serverError.message },
        timestamp,
      };
    }

    // Test 2: Admin client connection
    const adminClient = createAdminClient();
    const { data: _adminTest, error: adminError } = await adminClient
      .from('audit_logs')
      .select('count')
      .limit(1);

    if (adminError) {
      return {
        status: 'degraded',
        message: 'Admin client connection failed',
        details: { error: adminError.message },
        timestamp,
      };
    }

    // Test 3: Database function test
    const { data: _functionTest, error: functionError } = await adminClient
      .rpc('validate_lgpd_consent', {
        patient_uuid: '00000000-0000-0000-0000-000000000000',
        purpose: 'health_check',
      });

    // Function test is optional - don't fail if function doesn't exist
    const functionStatus = functionError ? 'Function not available' : 'Function available';

    return {
      status: 'healthy',
      message: 'All Supabase connections working',
      details: {
        serverClient: 'Connected',
        adminClient: 'Connected',
        databaseFunctions: functionStatus,
        tablesAccessible: ['profiles', 'audit_logs'],
      },
      timestamp,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Supabase health check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp,
    };
  }
}

/**
 * Check RLS policies are working
 */
export async function checkRLSPolicies(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  try {
    const serverClient = createServerClient();

    // Test RLS by trying to access patients without auth (should fail)
    const { data, error } = await serverClient
      .from('patients')
      .select('id')
      .limit(1);

    // If we get data without auth, RLS might be disabled (security issue)
    if (data && data.length > 0) {
      return {
        status: 'unhealthy',
        message: 'RLS policies may be disabled - security risk',
        details: { warning: 'Unauthorized access to patient data possible' },
        timestamp,
      };
    }

    // If we get an auth error, RLS is working correctly
    if (error && error.message.includes('JWT')) {
      return {
        status: 'healthy',
        message: 'RLS policies are active and working',
        details: { rls_status: 'Active' },
        timestamp,
      };
    }

    return {
      status: 'degraded',
      message: 'RLS status unclear',
      details: { error: error?.message },
      timestamp,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'RLS check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp,
    };
  }
}

/**
 * Test LGPD compliance functions
 */
export async function checkLGPDCompliance(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  try {
    const adminClient = createAdminClient();

    // Check if consent_records table exists and is accessible
    const { error } = await adminClient
      .from('consent_records')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'unhealthy',
        message: 'LGPD compliance tables not accessible',
        details: { error: error.message },
        timestamp,
      };
    }

    return {
      status: 'healthy',
      message: 'LGPD compliance infrastructure ready',
      details: {
        consent_records: 'Accessible',
        audit_logs: 'Available',
      },
      timestamp,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'LGPD compliance check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp,
    };
  }
}

/**
 * Get comprehensive health status
 */
export async function getComprehensiveHealthStatus() {
  const [supabaseHealth, rlsHealth, lgpdHealth] = await Promise.all([
    checkSupabaseHealth(),
    checkRLSPolicies(),
    checkLGPDCompliance(),
  ]);

  const overallStatus = [supabaseHealth, rlsHealth, lgpdHealth].every(
    check => check.status === 'healthy',
  )
    ? 'healthy'
    : 'degraded';

  return {
    overall_status: overallStatus,
    checks: {
      supabase_connection: supabaseHealth,
      rls_policies: rlsHealth,
      lgpd_compliance: lgpdHealth,
    },
    timestamp: new Date().toISOString(),
  };
}
