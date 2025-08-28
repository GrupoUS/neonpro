/**
 * Phase 4: Anti-No-Show Activation Components
 * 
 * This module exports all components for the Anti-No-Show Activation system,
 * transforming ML predictions into operational staff workflows with real-time
 * risk scoring, alerts, and intervention management.
 * 
 * Key Features:
 * - Color-coded risk indicators integrated into appointment interfaces
 * - Real-time staff alert system with escalation workflows
 * - Interactive risk factor analysis and intervention triggers
 * - Brazilian Portuguese localization with healthcare compliance
 * 
 * Performance Targets:
 * - <100ms risk indicator rendering
 * - <200ms staff alert delivery
 * - Mobile-optimized for Brazilian clinic workflows
 */

// Core Risk Scoring Components
export { default as RiskScoreIndicator, type RiskScoreData, type RiskFactor } from './RiskScoreIndicator';
export { default as AppointmentRiskList, type AppointmentData } from './AppointmentRiskList';

// Staff Alert & Workflow Components  
export { default as StaffAlertSystem, type StaffAlert, type StaffMember, type AlertAction } from './StaffAlertSystem';

// Re-export common types for external use
export type { RiskScoreIndicatorProps } from './RiskScoreIndicator';
export type { AppointmentRiskListProps } from './AppointmentRiskList';
export type { StaffAlertSystemProps } from './StaffAlertSystem';

// Component collection for easy imports
export const NoShowActivationComponents = {
  RiskScoreIndicator: require('./RiskScoreIndicator').default,
  AppointmentRiskList: require('./AppointmentRiskList').default,
  StaffAlertSystem: require('./StaffAlertSystem').default,
} as const;

// Utility constants
export const PHASE_4_CONFIG = {
  version: '1.0.0',
  components: [
    'RiskScoreIndicator',
    'AppointmentRiskList', 
    'StaffAlertSystem'
  ],
  features: [
    'risk-scoring-ui',
    'staff-alert-workflows',
    'intervention-triggers'
  ],
  compliance: ['LGPD', 'CFM', 'ANVISA'],
  localization: 'pt-BR'
} as const;