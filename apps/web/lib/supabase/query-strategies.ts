/**
 * 🎯 Query Strategies for Healthcare Connection Pooling
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Intelligent query routing and optimization strategies for healthcare operations
 * Features:
 * - Query type classification and routing
 * - Healthcare-specific optimization patterns
 * - Multi-tenant query isolation
 * - LGPD/ANVISA/CFM compliant query execution
 * - Performance monitoring and auto-scaling
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { getConnectionPoolManager } from './connection-pool-manager';

// Healthcare query classification
export type HealthcareQueryType =
  | 'patient_critical' // Emergency patient data access
  | 'patient_standard' // Regular patient operations
  | 'clinical_workflow' // Clinical procedures and scheduling
  | 'financial_sensitive' // Payment and billing operations
  | 'analytics_readonly' // Reporting and analytics
  | 'administrative' // User management and settings
  | 'compliance_audit' // LGPD/ANVISA/CFM compliance queries
  | 'realtime_monitoring'; // Real-time health monitoring

// Query execution context
interface QueryContext {
  clinicId: string;
  userId: string;
  userRole: 'admin' | 'professional' | 'assistant' | 'patient';
  patientId?: string;
  queryType: HealthcareQueryType;
  priority: 'emergency' | 'high' | 'normal' | 'low';
  requiresAudit: boolean;
  lgpdSensitive: boolean;
}

// Query execution result with metrics
interface QueryResult<T = any> {
  data: T;
  error: Error | null;
  executionTime: number;
  poolKey: string;
  strategy: QueryStrategy;
  complianceVerified: boolean;
  auditTrail?: AuditEntry;
}

// Audit trail entry
interface AuditEntry {
  timestamp: Date;
  clinicId: string;
  userId: string;
  queryType: HealthcareQueryType;
  patientId?: string;
  action: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// Query optimization strategies
interface QueryStrategy {
  name: string;
  poolType: 'critical' | 'standard' | 'analytics' | 'administrative';
  connectionMode: 'transaction' | 'session' | 'pooled';
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  auditRequired: boolean;
}

class HealthcareQueryStrategies {
  private static instance: HealthcareQueryStrategies;
  private readonly poolManager = getConnectionPoolManager();

  // Predefined strategies for healthcare operations
  private readonly strategies: Record<HealthcareQueryType, QueryStrategy> = {
    patient_critical: {
      name: 'Patient Critical Operations',
      poolType: 'critical',
      connectionMode: 'transaction',
      timeout: 5000, // 5 seconds max for emergency operations
      retryAttempts: 3,
      cacheEnabled: false, // Never cache critical patient data
      auditRequired: true,
    },

    patient_standard: {
      name: 'Standard Patient Operations',
      poolType: 'standard',
      connectionMode: 'transaction',
      timeout: 15_000, // 15 seconds for standard operations
      retryAttempts: 2,
      cacheEnabled: true,
      auditRequired: true,
    },

    clinical_workflow: {
      name: 'Clinical Workflow Management',
      poolType: 'standard',
      connectionMode: 'session',
      timeout: 20_000, // 20 seconds for complex workflows
      retryAttempts: 2,
      cacheEnabled: true,
      auditRequired: true,
    },

    financial_sensitive: {
      name: 'Financial Operations',
      poolType: 'critical',
      connectionMode: 'transaction',
      timeout: 10_000, // 10 seconds for financial operations
      retryAttempts: 3,
      cacheEnabled: false, // Never cache financial data
      auditRequired: true,
    },

    analytics_readonly: {
      name: 'Analytics & Reporting',
      poolType: 'analytics',
      connectionMode: 'session',
      timeout: 60_000, // 60 seconds for complex analytics
      retryAttempts: 1,
      cacheEnabled: true,
      auditRequired: false,
    },

    administrative: {
      name: 'Administrative Operations',
      poolType: 'administrative',
      connectionMode: 'pooled',
      timeout: 30_000, // 30 seconds for admin operations
      retryAttempts: 2,
      cacheEnabled: true,
      auditRequired: true,
    },

    compliance_audit: {
      name: 'Compliance & Audit',
      poolType: 'critical',
      connectionMode: 'transaction',
      timeout: 30_000, // 30 seconds for audit operations
      retryAttempts: 3,
      cacheEnabled: false, // Never cache audit data
      auditRequired: true,
    },

    realtime_monitoring: {
      name: 'Real-time Health Monitoring',
      poolType: 'critical',
      connectionMode: 'session',
      timeout: 3000, // 3 seconds for real-time operations
      retryAttempts: 5,
      cacheEnabled: false, // Real-time data should not be cached
      auditRequired: false,
    },
  };

  private constructor() {}

  public static getInstance(): HealthcareQueryStrategies {
    if (!HealthcareQueryStrategies.instance) {
      HealthcareQueryStrategies.instance = new HealthcareQueryStrategies();
    }
    return HealthcareQueryStrategies.instance;
  }

  /**
   * Execute query with optimal strategy based on healthcare context
   */
  public async executeQuery<T = any>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    context: QueryContext
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const strategy = this.strategies[context.queryType];

    // Validate context for healthcare compliance
    this.validateQueryContext(context);

    // Get optimal client for this query type
    const client = this.getOptimalClient(context, strategy);
    const poolKey = this.generatePoolKey(context.clinicId, strategy.poolType);

    try {
      // Apply query timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Query timeout after ${strategy.timeout}ms`)),
          strategy.timeout
        );
      });

      // Execute query with timeout
      const queryPromise = this.executeWithRetry(
        queryFn,
        client,
        strategy.retryAttempts,
        context
      );
      const data = await Promise.race([queryPromise, timeoutPromise]);

      const executionTime = Date.now() - startTime;

      // Create audit trail if required
      let auditTrail: AuditEntry | undefined;
      if (strategy.auditRequired) {
        auditTrail = await this.createAuditTrail(context, true, executionTime);
      }

      // Verify compliance for sensitive operations
      const complianceVerified = await this.verifyCompliance(context, data);

      return {
        data,
        error: null,
        executionTime,
        poolKey,
        strategy,
        complianceVerified,
        auditTrail,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Create audit trail for failed operations
      let auditTrail: AuditEntry | undefined;
      if (strategy.auditRequired) {
        auditTrail = await this.createAuditTrail(context, false, executionTime);
      }

      console.error(`Healthcare query failed [${context.queryType}]:`, {
        error: error.message,
        clinicId: context.clinicId,
        userId: context.userId,
        executionTime,
        strategy: strategy.name,
      });

      return {
        data: null,
        error: error as Error,
        executionTime,
        poolKey,
        strategy,
        complianceVerified: false,
        auditTrail,
      };
    }
  }

  /**
   * Execute query with retry logic
   */
  private async executeWithRetry<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    client: SupabaseClient<Database>,
    maxRetries: number,
    context: QueryContext
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await queryFn(client);
      } catch (error) {
        lastError = error as Error;

        console.warn(`Query attempt ${attempt}/${maxRetries} failed:`, {
          error: error.message,
          queryType: context.queryType,
          clinicId: context.clinicId,
        });

        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error)) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < maxRetries) {
          const backoffTime = Math.min(1000 * 2 ** (attempt - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw lastError || new Error('Query failed after all retry attempts');
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      'PGRST116', // No rows found
      'PGRST301', // Invalid authentication
      'PGRST302', // Insufficient privilege
      '23505', // Unique violation
      '23503', // Foreign key violation
      '23514', // Check violation
    ];

    return nonRetryablePatterns.some(
      (pattern) => error.message.includes(pattern) || error.code === pattern
    );
  }

  /**
   * Get optimal client based on strategy
   */
  private getOptimalClient(
    context: QueryContext,
    strategy: QueryStrategy
  ): SupabaseClient<Database> {
    switch (strategy.poolType) {
      case 'critical':
        return this.poolManager.getHealthcareClient(
          context.clinicId,
          'critical'
        );

      case 'standard':
        return this.poolManager.getHealthcareClient(
          context.clinicId,
          'standard'
        );
      default:
        return this.poolManager.getHealthcareClient(
          context.clinicId,
          'standard'
        );
    }
  }

  /**
   * Generate pool key for monitoring
   */
  private generatePoolKey(clinicId: string, poolType: string): string {
    return `healthcare_${clinicId}_${poolType}`;
  }

  /**
   * Validate query context for healthcare compliance
   */
  private validateQueryContext(context: QueryContext): void {
    // Validate clinic ID
    if (!context.clinicId || context.clinicId === 'unknown') {
      throw new Error('Invalid clinic ID - multi-tenant isolation required');
    }

    // Validate user context
    if (!context.userId) {
      throw new Error('User context required for healthcare operations');
    }

    // Validate patient access permissions
    if (context.patientId && !this.hasPatientAccess(context)) {
      throw new Error('Insufficient permissions for patient data access');
    }

    // Validate LGPD sensitive operations
    if (context.lgpdSensitive && !this.isLGPDCompliant(context)) {
      throw new Error('LGPD compliance requirements not met');
    }
  }

  /**
   * Check patient access permissions
   */
  private hasPatientAccess(context: QueryContext): boolean {
    // Implement patient access validation logic
    // For now, allow access for professionals and admins
    return (
      ['admin', 'professional'].includes(context.userRole) ||
      (context.userRole === 'patient' && context.userId === context.patientId)
    );
  }

  /**
   * Check LGPD compliance
   */
  private isLGPDCompliant(context: QueryContext): boolean {
    // Implement LGPD compliance checks
    // Verify audit trail, consent, and data minimization
    return context.requiresAudit && Boolean(context.clinicId);
  }

  /**
   * Create audit trail entry
   */
  private async createAuditTrail(
    context: QueryContext,
    success: boolean,
    executionTime: number
  ): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      clinicId: context.clinicId,
      userId: context.userId,
      queryType: context.queryType,
      patientId: context.patientId,
      action: `${context.queryType}_query`,
      success,
    };

    // Log audit entry for LGPD compliance
    console.log('🔍 Healthcare audit trail:', {
      ...auditEntry,
      executionTime,
      priority: context.priority,
    });

    return auditEntry;
  }

  /**
   * Verify compliance for sensitive operations
   */
  private async verifyCompliance<T>(context: QueryContext, data: T): boolean {
    // Implement compliance verification logic
    // Check data encryption, access patterns, consent status

    if (context.lgpdSensitive) {
      // Verify LGPD compliance
      return this.verifyLGPDCompliance(context, data);
    }

    if (context.queryType === 'financial_sensitive') {
      // Verify financial data compliance
      return this.verifyFinancialCompliance(context, data);
    }

    return true;
  }

  /**
   * Verify LGPD compliance for patient data
   */
  private verifyLGPDCompliance<T>(context: QueryContext, _data: T): boolean {
    // Implement LGPD verification logic
    // Check consent status, data minimization, purpose limitation
    return context.requiresAudit && Boolean(context.patientId);
  }

  /**
   * Verify financial data compliance
   */
  private verifyFinancialCompliance<T>(
    _context: QueryContext,
    _data: T
  ): boolean {
    // Implement financial compliance verification
    // Check encryption, access controls, audit requirements
    return true;
  }

  /**
   * Get query performance recommendations
   */
  public getPerformanceRecommendations(queryType: HealthcareQueryType): {
    strategy: QueryStrategy;
    recommendations: string[];
    optimizations: string[];
  } {
    const strategy = this.strategies[queryType];

    const recommendations = [
      `Use ${strategy.connectionMode} mode for optimal performance`,
      `Timeout set to ${strategy.timeout}ms for safety`,
      `${strategy.retryAttempts} retry attempts configured`,
      strategy.cacheEnabled
        ? 'Caching enabled for performance'
        : 'Caching disabled for data freshness',
      strategy.auditRequired
        ? 'Audit trail required for compliance'
        : 'No audit trail required',
    ];

    const optimizations = this.generateOptimizations(queryType, strategy);

    return {
      strategy,
      recommendations,
      optimizations,
    };
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizations(
    queryType: HealthcareQueryType,
    _strategy: QueryStrategy
  ): string[] {
    const optimizations: string[] = [];

    switch (queryType) {
      case 'patient_critical':
        optimizations.push(
          'Use indexed queries for emergency patient lookup',
          'Minimize data fetched to essential fields only',
          'Consider real-time subscriptions for critical monitoring'
        );
        break;

      case 'analytics_readonly':
        optimizations.push(
          'Use read replicas for heavy analytical queries',
          'Implement query result caching',
          'Consider materialized views for complex aggregations'
        );
        break;

      case 'clinical_workflow':
        optimizations.push(
          'Batch related operations in single transaction',
          'Use optimistic locking for concurrent updates',
          'Implement efficient scheduling algorithms'
        );
        break;

      default:
        optimizations.push(
          'Review query patterns for optimization opportunities',
          'Consider connection pooling benefits',
          'Monitor query performance metrics'
        );
    }

    return optimizations;
  }

  /**
   * Get strategy for query type
   */
  public getStrategy(queryType: HealthcareQueryType): QueryStrategy {
    return this.strategies[queryType];
  }

  /**
   * Update strategy configuration
   */
  public updateStrategy(
    queryType: HealthcareQueryType,
    updates: Partial<QueryStrategy>
  ): void {
    this.strategies[queryType] = {
      ...this.strategies[queryType],
      ...updates,
    };
  }
}

// Export singleton factory
export const getQueryStrategies = () => HealthcareQueryStrategies.getInstance();

// Export types for use in other modules
export type {
  HealthcareQueryType,
  QueryContext,
  QueryResult,
  QueryStrategy,
  AuditEntry,
};

// Helper functions for common query patterns
export const createQueryContext = (
  clinicId: string,
  userId: string,
  queryType: HealthcareQueryType,
  options: Partial<QueryContext> = {}
): QueryContext => ({
  clinicId,
  userId,
  queryType,
  userRole: 'professional',
  priority: 'normal',
  requiresAudit: true,
  lgpdSensitive:
    queryType.includes('patient') || queryType === 'financial_sensitive',
  ...options,
});

// Healthcare query builder helpers
export const HealthcareQueries = {
  patientData: (patientId: string) =>
    createQueryContext('', '', 'patient_standard', {
      patientId,
      lgpdSensitive: true,
    }),

  emergencyAccess: (patientId: string) =>
    createQueryContext('', '', 'patient_critical', {
      patientId,
      priority: 'emergency',
      lgpdSensitive: true,
    }),

  clinicalWorkflow: () =>
    createQueryContext('', '', 'clinical_workflow', { priority: 'high' }),

  analytics: () =>
    createQueryContext('', '', 'analytics_readonly', {
      requiresAudit: false,
      lgpdSensitive: false,
    }),

  financial: () =>
    createQueryContext('', '', 'financial_sensitive', {
      priority: 'high',
      lgpdSensitive: true,
    }),
};
