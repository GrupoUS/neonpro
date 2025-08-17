/**
 * @fileoverview Integration Ecosystem for Healthcare Systems
 * @description HL7 FHIR compliant integrations with constitutional compliance
 * @author NeonPro Healthcare Team
 *
 * Supported Integrations:
 * - EHR (Electronic Health Records) - HL7 FHIR R4
 * - Laboratory Systems - LOINC compliant
 * - Insurance Systems - TISS/ANS standards
 * - Pharmacy Systems - RDC 44/2009 ANVISA
 * - Government Systems - ANVISA, CFM, ANS compliance
 *
 * LGPD Compliance:
 * - Data minimization for all integrations
 * - Consent validation for data sharing
 * - Audit trails for all external communications
 * - Patient data sovereignty (Brazilian servers)
 */

// Integration Configuration
export const IntegrationConfig = {
  version: '1.0.0',
  protocols: ['HL7-FHIR-R4', 'LOINC', 'TISS', 'ANVISA-RDC44'],
  compliance: ['LGPD', 'ANVISA', 'CFM', 'ANS'],
  features: [
    'ehr-integration',
    'lab-integration',
    'insurance-integration',
    'pharmacy-integration',
  ],
  status: 'development',
} as const;

// Integration Types
export type IntegrationStatus = {
  ehr: boolean;
  laboratory: boolean;
  insurance: boolean;
  pharmacy: boolean;
  government: boolean;
};

export type IntegrationHealth = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  endpoints: number;
  errors: number;
};

export const DefaultIntegrationStatus: IntegrationStatus = {
  ehr: false,
  laboratory: false,
  insurance: false,
  pharmacy: false,
  government: false,
} as const;
