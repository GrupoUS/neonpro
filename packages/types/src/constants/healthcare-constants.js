/**
 * @fileoverview NeonPro Healthcare Constants
 * Centralized constants for healthcare compliance, data retention, and system limits
 *
 * @version 1.0.0
 * @author NeonPro Healthcare
 * @compliance LGPD + ANVISA + CFM
 */
// =============================================================================
// 📋 DATA RETENTION & COMPLIANCE
// =============================================================================
/**
 * Healthcare data retention period (7 years)
 * As required by LGPD Article 16 and CFM Resolution 1.821/2007
 */
export const HEALTHCARE_DATA_RETENTION_DAYS = 2555; // 7 years * 365 days
/**
 * Maximum file size for medical documents and images (50MB)
 * Supports DICOM images, PDFs, and other medical files
 */
export const MAX_MEDICAL_FILE_SIZE_BYTES = 50000000; // 50MB
/**
 * Minimum retention period for audit logs (30 days)
 * Minimum required by LGPD for audit trail
 */
export const MIN_AUDIT_RETENTION_DAYS = 30;
// =============================================================================
// 🔐 SECURITY & ENCRYPTION
// =============================================================================
/**
 * Minimum encryption key length (bytes)
 * AES-256 requires 32-byte keys
 */
export const MIN_ENCRYPTION_KEY_BYTES = 32;
/**
 * Session timeout in minutes for healthcare users
 * Balances security with usability for medical workflows
 */
export const HEALTHCARE_SESSION_TIMEOUT_MINUTES = 30;
/**
 * Maximum failed login attempts before account lock
 * Security measure against brute force attacks
 */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
// =============================================================================
// 📊 SYSTEM LIMITS & PERFORMANCE
// =============================================================================
/**
 * Maximum number of patients per doctor (system limit)
 */
export const MAX_PATIENTS_PER_DOCTOR = 1000;
/**
 * Maximum concurrent appointments per time slot
 */
export const MAX_CONCURRENT_APPOINTMENTS = 50;
/**
 * Database query timeout (milliseconds)
 */
export const DB_QUERY_TIMEOUT_MS = 5000;
/**
 * API rate limit per minute per user
 */
export const API_RATE_LIMIT_PER_MINUTE = 100; // =============================================================================
// 🏥 MEDICAL WORKFLOW CONSTANTS
// =============================================================================
/**
 * Standard consultation duration (minutes)
 */
export const STANDARD_CONSULTATION_DURATION_MINUTES = 30;
/**
 * Buffer time between appointments (minutes)
 */
export const APPOINTMENT_BUFFER_MINUTES = 15;
/**
 * Maximum procedure duration (minutes)
 */
export const MAX_PROCEDURE_DURATION_MINUTES = 480; // 8 hours
/**
 * Medical record auto-save interval (seconds)
 */
export const AUTO_SAVE_INTERVAL_SECONDS = 30;
// =============================================================================
// 💰 BILLING & FINANCIAL
// =============================================================================
/**
 * Maximum payment amount (BRL cents)
 * R$ 100,000.00 limit for single transactions
 */
export const MAX_PAYMENT_AMOUNT_CENTS = 10000000;
/**
 * Minimum payment amount (BRL cents)
 * R$ 1.00 minimum payment
 */
export const MIN_PAYMENT_AMOUNT_CENTS = 100;
