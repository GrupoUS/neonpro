/**
 * Enhanced Healthcare Middleware Exports
 *
 * T021-T023: Complete healthcare compliance middleware stack
 * for Brazilian healthcare platform with LGPD, CFM, and ANVISA compliance.
 */

export { cfmValidationMiddleware } from "./cfm-validation";
export { lgpdAuditMiddleware } from "./lgpd-audit";
export { prismaRLSMiddleware } from "./prisma-rls";

/**
 * Middleware Usage Guidelines:
 *
 * 1. lgpdAuditMiddleware
 *    - Use for all procedures that access patient data
 *    - Provides automatic audit logging and cryptographic proof
 *    - Enforces data minimization per LGPD requirements
 *    - Performance target: <100ms overhead
 *
 * 2. cfmValidationMiddleware
 *    - Use for medical procedures requiring professional validation
 *    - Validates CFM medical licenses in real-time
 *    - Verifies ICP-Brasil certificates for telemedicine
 *    - Performance target: <150ms overhead (with caching)
 *
 * 3. prismaRLSMiddleware
 *    - Use for all data operations requiring multi-tenant isolation
 *    - Enforces clinic-based data segregation automatically
 *    - Provides user context validation and access control
 *    - Performance target: <50ms overhead
 *
 * Recommended middleware chain order for optimal performance:
 * 1. prismaRLSMiddleware (data isolation first)
 * 2. authMiddleware (authentication validation)
 * 3. cfmValidationMiddleware (professional validation if needed)
 * 4. lgpdAuditMiddleware (compliance logging last)
 * 5. consentMiddleware (LGPD consent validation last)
 */
