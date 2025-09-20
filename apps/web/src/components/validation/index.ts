/**
 * @fileoverview Healthcare UI/UX Validation Components Export
 * @author APEX UI/UX Designer Agent
 * @description Centralized exports for all healthcare validation components
 */

// Main validation dashboard
export { default as HealthcareUIValidationDashboard } from './HealthcareUIValidationDashboard';

// Specialized validation tools
export { default as MobileResponsiveValidator } from './MobileResponsiveValidator';
export { default as PerformanceTester } from './PerformanceTester';

// Re-export for convenience
export { 
  HealthcareUIValidationDashboard as ValidationDashboard,
  MobileResponsiveValidator as ResponsiveValidator,
  PerformanceTester as PerformanceValidator
};