/**
 * ANVISA Compliance Testing Utilities
 *
 * Provides testing utilities for ANVISA (Agência Nacional de Vigilância Sanitária)
 * compliance validation for medical device software.
 */

import { describe, expect, it } from 'vitest'

export interface ANVISATestData {
  deviceClassification: 'I' | 'II' | 'III' | 'IV'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  clinicalWorkflows: string[]
  riskManagement: {
    riskAssessmentCompleted: boolean
    mitigationStrategies: string[]
    residualRisks: string[]
  }
  postMarketSurveillance: {
    enabled: boolean
    reportingMechanism: string
    adverseEventTracking: boolean
  }
}

/**
 * ANVISA Compliance Validator
 */
export class ANVISAValidator {
  /**
   * Validate medical device classification
   */
  static validateDeviceClassification(data: ANVISATestData): boolean {
    const validClassifications = ['I', 'II', 'III', 'IV']
    return validClassifications.includes(data.deviceClassification)
  }

  /**
   * Validate clinical workflow compliance
   */
  static validateClinicalWorkflows(data: ANVISATestData): boolean {
    return (
      Array.isArray(data.clinicalWorkflows)
      && data.clinicalWorkflows.length > 0
      && data.clinicalWorkflows.every(
        (workflow) => typeof workflow === 'string' && workflow.length > 0,
      )
    )
  }

  /**
   * Validate risk management implementation
   */
  static validateRiskManagement(data: ANVISATestData): boolean {
    const rm = data.riskManagement
    return (
      rm.riskAssessmentCompleted === true
      && Array.isArray(rm.mitigationStrategies)
      && rm.mitigationStrategies.length > 0
      && Array.isArray(rm.residualRisks)
    )
  }

  /**
   * Validate post-market surveillance
   */
  static validatePostMarketSurveillance(data: ANVISATestData): boolean {
    const pms = data.postMarketSurveillance
    return (
      pms.enabled === true
      && typeof pms.reportingMechanism === 'string'
      && pms.reportingMechanism.length > 0
      && pms.adverseEventTracking === true
    )
  }

  /**
   * Comprehensive ANVISA validation
   */
  static validateCompliance(data: ANVISATestData): {
    isCompliant: boolean
    violations: string[]
    recommendations: string[]
  } {
    const violations: string[] = []
    const recommendations: string[] = []

    if (!this.validateDeviceClassification(data)) {
      violations.push('Invalid medical device classification')
      recommendations.push(
        'Ensure device is properly classified according to ANVISA standards',
      )
    }

    if (!this.validateClinicalWorkflows(data)) {
      violations.push('Clinical workflows not properly defined')
      recommendations.push(
        'Define and validate all clinical workflows supported by the system',
      )
    }

    if (!this.validateRiskManagement(data)) {
      violations.push('Risk management requirements not met')
      recommendations.push(
        'Complete risk assessment and implement mitigation strategies',
      )
    }

    if (!this.validatePostMarketSurveillance(data)) {
      violations.push('Post-market surveillance not properly implemented')
      recommendations.push(
        'Implement adverse event tracking and reporting mechanisms',
      )
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations,
    }
  }
}

/**
 * Create ANVISA compliance test suite
 */
export function createANVISATestSuite(
  testName: string,
  testData: ANVISATestData,
) {
  describe(`ANVISA Compliance: ${testName}`, () => {
    it('should have valid device classification', () => {
      expect(ANVISAValidator.validateDeviceClassification(testData)).toBe(true)
    })

    it('should have defined clinical workflows', () => {
      expect(ANVISAValidator.validateClinicalWorkflows(testData)).toBe(true)
    })

    it('should have proper risk management', () => {
      expect(ANVISAValidator.validateRiskManagement(testData)).toBe(true)
    })

    it('should have post-market surveillance', () => {
      expect(ANVISAValidator.validatePostMarketSurveillance(testData)).toBe(
        true,
      )
    })

    it('should be fully ANVISA compliant', () => {
      const result = ANVISAValidator.validateCompliance(testData)
      expect(result.isCompliant).toBe(true)
      expect(result.violations).toHaveLength(0)
    })
  })
}

/**
 * Mock ANVISA compliant data for testing
 */
export function createMockANVISAData(
  overrides: Partial<ANVISATestData> = {},
): ANVISATestData {
  return {
    deviceClassification: 'II',
    riskLevel: 'medium',
    clinicalWorkflows: [
      'Patient registration',
      'Medical consultation',
      'Prescription management',
      'Medical record management',
    ],
    riskManagement: {
      riskAssessmentCompleted: true,
      mitigationStrategies: [
        'Data encryption at rest and in transit',
        'Access control and authentication',
        'Regular security audits',
        'Backup and disaster recovery',
      ],
      residualRisks: [
        'Network connectivity issues',
        'User error in data entry',
      ],
    },
    postMarketSurveillance: {
      enabled: true,
      reportingMechanism: 'Automated incident reporting system',
      adverseEventTracking: true,
    },
    ...overrides,
  }
}
