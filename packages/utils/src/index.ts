/**
 * @fileoverview NeonPro Healthcare Utilities Package
 * Consolidated utilities for healthcare compliance and operations
 *
 * @version 1.0.0
 * @author NeonPro Healthcare
 * @compliance LGPD + ANVISA + CFM
 */

// Category Exports (for importing entire categories)
export * as AuthUtils from './auth';
// Healthcare Auth Utilities
export * from './auth/rbac';
export * from './auth/supabase';
export * as ComplianceUtils from './compliance';
// Brazilian Healthcare Compliance Utilities (LGPD + ANVISA + CFM)
export * from './compliance/anvisa';
export * from './compliance/cfm';
export * from './compliance/consent-manager';
export * from './compliance/data-subject-rights';
export * from './compliance/integration';
export * as DatabaseUtils from './database';

// Database Utilities (Healthcare + LGPD Compliance)
export * from './database/anonymization';
export * from './database/audit';
export * from './database/rls';
// Core Utility Functions
export * from './date';
export * from './format';
export * from './lib';
export * as SecurityUtils from './security';
// Security Utilities
export * from './security/api';
export * from './security/middleware';
export * from './validation';
