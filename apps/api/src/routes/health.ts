/**
 * Health Check Routes for NeonPro API
 * 
 * Provides comprehensive health monitoring for Supabase integration
 * Following docs/rules/supabase-best-practices.md
 */

import { Hono } from 'hono';
import { 
  checkSupabaseHealth, 
  checkRLSPolicies, 
  checkLGPDCompliance,
  getComprehensiveHealthStatus 
} from '../services/supabase-health.service';

const health = new Hono();

/**
 * Basic health check
 * GET /health
 */
health.get('/', async (c) => {
  return c.json({
    status: 'healthy',
    message: 'NeonPro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Supabase connection health check
 * GET /health/supabase
 */
health.get('/supabase', async (c) => {
  try {
    const healthResult = await checkSupabaseHealth();
    
    return c.json(healthResult, {
      status: healthResult.status === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

/**
 * RLS policies health check
 * GET /health/rls
 */
health.get('/rls', async (c) => {
  try {
    const rlsResult = await checkRLSPolicies();
    
    return c.json(rlsResult, {
      status: rlsResult.status === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      message: 'RLS check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

/**
 * LGPD compliance health check
 * GET /health/lgpd
 */
health.get('/lgpd', async (c) => {
  try {
    const lgpdResult = await checkLGPDCompliance();
    
    return c.json(lgpdResult, {
      status: lgpdResult.status === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      message: 'LGPD compliance check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

/**
 * Comprehensive health check
 * GET /health/comprehensive
 */
health.get('/comprehensive', async (c) => {
  try {
    const comprehensiveStatus = await getComprehensiveHealthStatus();
    
    return c.json(comprehensiveStatus, {
      status: comprehensiveStatus.overall_status === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return c.json({
      overall_status: 'unhealthy',
      message: 'Comprehensive health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

/**
 * Database tables check
 * GET /health/tables
 */
health.get('/tables', async (c) => {
  try {
    const { createAdminClient } = await import('../lib/supabase/client');
    const adminClient = createAdminClient();
    
    // Check key tables exist and are accessible
    const tableChecks = await Promise.allSettled([
      adminClient.from('patients').select('count').limit(1),
      adminClient.from('professionals').select('count').limit(1),
      adminClient.from('appointments').select('count').limit(1),
      adminClient.from('clinics').select('count').limit(1),
      adminClient.from('services').select('count').limit(1),
      adminClient.from('audit_logs').select('count').limit(1),
      adminClient.from('consent_records').select('count').limit(1)
    ]);
    
    const tableNames = ['patients', 'professionals', 'appointments', 'clinics', 'services', 'audit_logs', 'consent_records'];
    const tableStatus = tableChecks.map((result, index) => ({
      table: tableNames[index],
      status: result.status === 'fulfilled' ? 'accessible' : 'error',
      error: result.status === 'rejected' ? result.reason?.message : null
    }));
    
    const allTablesAccessible = tableStatus.every(table => table.status === 'accessible');
    
    return c.json({
      status: allTablesAccessible ? 'healthy' : 'degraded',
      message: allTablesAccessible ? 'All core tables accessible' : 'Some tables have issues',
      tables: tableStatus,
      timestamp: new Date().toISOString()
    }, allTablesAccessible ? 200 : 503);
    
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      message: 'Table accessibility check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

export default health;
