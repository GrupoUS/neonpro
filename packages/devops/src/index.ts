/**
 * @fileoverview NeonPro Healthcare DevOps Excellence
 * @description Constitutional Healthcare Testing, CI/CD, Monitoring & Infrastructure
 * @version 1.0.0
 * @author NeonPro Healthcare Team
 * @compliance LGPD + ANVISA + CFM Constitutional Healthcare
 * @quality ≥9.9/10 Healthcare Excellence Standard
 */

// Testing utilities and healthcare-specific test frameworks
export * from './testing';

// CI/CD configurations with constitutional validation
export * from './ci-cd';

// Monitoring and observability for healthcare systems
export * from './monitoring';

// Infrastructure as code for healthcare compliance
export * from './infrastructure';

// Security automation and compliance tools
export * from './security';

// Performance monitoring and optimization
export * from './performance';

// Production deployment with healthcare standards
export * from './deployment';

/**
 * DevOps Configuration for Constitutional Healthcare
 */
export const NEONPRO_DEVOPS_CONFIG = {
  name: '@neonpro/devops',
  version: '1.0.0',
  description: 'NeonPro Healthcare DevOps Excellence - Constitutional Healthcare Infrastructure',
  
  // Healthcare Quality Standards (PROJECT OVERRIDE)
  qualityStandards: {
    healthcareOperations: '≥9.9/10',
    testCoverage: '≥95%',
    apiResponseTime: '≤200ms',
    securityCompliance: '100%',
    accessibilityCompliance: 'WCAG 2.1 AA+',
    regulatoryCompliance: 'LGPD + ANVISA + CFM'
  },
  
  // Constitutional Healthcare Principles
  constitutionalPrinciples: {
    patientPrivacyFirst: true,
    medicalAccuracy: '≥95%',
    explainableAI: true,
    transparencyMandate: true,
    regulatoryCompliance: true,
    holisticWellness: true
  },
  
  // DevOps Excellence Standards
  devopsStandards: {
    zeroDowntimeDeployment: true,
    automaticRollback: true,
    healthcareMonitoring: true,
    complianceAutomation: true,
    securityFirst: true,
    performanceOptimized: true
  }
} as const;

export type NeonProDevOpsConfig = typeof NEONPRO_DEVOPS_CONFIG;