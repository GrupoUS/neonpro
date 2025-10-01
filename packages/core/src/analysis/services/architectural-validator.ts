// Architectural violation detection service (SOLID, DRY, separation of concerns)
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and healthcare pattern validation

import { OXLintArchitecturalValidator } from './oxlint-architectural-validator';
import { ArchitecturalValidationRequest } from '../types/architectural-validation';
import { ArchitecturalValidationResult } from '../types/architectural-validation';
import { Finding } from '../types/finding';
import { Location } from '../types/location';
import { ImpactAssessment } from '../types/impact-assessment';
import { Solution } from '../types/solution';
import { FindingType, SeverityLevel, ViolatedPrinciple } from '../types/finding-enums';
import { HealthcareComplianceLevel, BrazilianHealthcareDomain, ProfessionalCouncil } from '../types/finding-enums';

export class ArchitecturalValidator {
  private static readonly RULE_CONFIGS = {
    // SOLID principles with healthcare focus
    [ViolatedPrinciple.SINGLE_RESPONSIBILITY]: {
      description: 'Each class should have one reason to change',
      healthcareContext: 'Critical for clinical data separation',
      brazilianContext: 'Fundamental for patient safety'
    },
    [ViolatedPrinciple.OPEN_CLOSED]: {
      description: 'Classes should be open for extension but closed for modification',
      healthcareContext: 'Essential for medical device regulations',
      brazilianContext: 'Required for evolving clinical protocols'
    },
    [ViolatedPrinciple.LISKOV_SUBSTITUTION]: {
      description: 'Derived classes must be substitutable for their base classes',
      healthcareContext: 'Critical for patient treatment systems',
      brazilianContext: 'Essential for clinical decision support systems'
    },
    [ViolatedPrinciple.INTERFACE_SEGREGATION]: {
      description: 'Clients should not be forced to dependent on methods they don\'t use',
      healthcareContext: 'Important for modular clinical systems',
      brazilianContext: 'Supports Brazilian clinical workflows'
    },
    [ViolatedPrinciple.DEPENDENCY_INVERSION]: {
      description: 'High-level modules should not depend on low-level modules',
      healthcareContext: 'Essential for compliance layering',
      brazilianContext: 'Required for Brazilian healthcare regulations'
    },
    [ViolatedPrinciple.DRY_PRINCIPLE]: {
      description: 'Don\'t repeat yourself',
      healthcareContext: 'Critical for clinical data consistency',
      brazilianContext: 'Optimizes Brazilian healthcare terminology'
    },
    [ViolatedPrinciple.SEPARATION_OF_CONCERNS]: {
      description: 'Separate concerns into different layers',
      healthcareContext: 'Essential for patient data privacy',
      brazilianContext: 'Supports Brazilian healthcare workflows'
    }
  };

  private static readonly HEALTHCARE_RULE_CONFIGS = {
    // Patient data protection rules
    patientDataRules: {
      directDatabaseAccess: {
        severity: 'high',
        description: 'Direct database access in UI components',
        brazilianContext: 'Violates LGPD data isolation principles'
      },
      patientDataInState: {
        severity: 'critical',
        description: 'Patient data in React state',
        brazilianContext: 'Creates LGPD compliance risk'
      },
      missingDataEncryption: {
        severity: 'high',
        description: 'Patient data stored in plain text',
        brazilianContext: 'Violates ANVISA data security'
      }
    },
    
    // Clinical workflow rules
    clinicalWorkflowRules: {
      businessLogicInUI: {
        severity: 'medium',
        description: 'Business logic mixed with UI components',
        brazilianContext: 'Affects clinical decision support'
      },
      missingValidation: {
        severity: 'high',
        description: 'Clinical procedures without validation',
        brazilianContext: 'Violates CFM clinical protocols'
      },
      incompleteErrorHandling: {
        severity: 'medium',
        description: 'Clinical error handling inadequate',
        brazilianContext: 'Affects patient safety'
      }
    },
    
    // Business logic rules
    businessLogicRules: {
      duplicateValidation: {
        severity: 'low',
        description: 'Repeated validation logic',
        brazilianContext: 'Inefficiente para clínicas brasileiras'
      },
      inconsistentBusinessRules: {
        severity: 'medium',
        description: 'Inconsistent business logic across modules',
        brazilianContext: 'Cria confusão nos processos clínicos'
      },
      hardCodedValues: {
        severity: 'medium',
        description: 'Hardcoded business values in code',
        brazilianContext: 'Dificulta manutenção de regras comerciais'
      }
    }
  };

  /**
   * Validate architectural patterns and principles
   * @param scope Analysis scope configuration
   * @returns Promise<ArchitecturalValidationResult> Complete validation results
   */
  static async validateArchitecture(
    scope: ArchitecturalValidationRequest
  ): Promise<ArchitecturalValidationResult> {
    const startTime = Date.now();
    
    try {
      // Initialize results
      const violations: Finding[] = [];
      
      // Analyze SOLID principles
      await this.validateSOLIDPrinciples(scope, violations);
      
      // Analyze DRY principles
      await this.validateDRYPrinciple(scope, violations);
      
      // Analyze separation of concerns
      await this.validateSeparationOfConcerns(scope, violations);
      
      // Analyze healthcare-specific patterns
      await this.validateHealthcarePatterns(scope, violations);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(violations);
      
      const executionTime = Date.now() - startTime;
      
      return {
        violations,
        complianceScore,
        analyzedPatterns: this.getAnalyzedPatterns(scope),
        performanceMetrics: {
          executionTime,
          violationsFound: violations.length,
          performanceScore: Math.max(0, 100 - (violations.length * 5)),
        },
        recommendations: await this.generateRecommendations(violations, scope)
      };
      
    } catch (error) {
      throw new Error(`Architectural validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate SOLID principles
   */
  private static async validateSOLIDPrinciples(
    scope: ArchitecturalValidationRequest,
    violations: Finding[]
  ): Promise<void> {
    for (const [principle, config] of Object.entries(this.RULE_CONFIGS)) {
      const violationsForPrinciple = await this.validatePrinciple(
        principle as ViolatedPrinciple,
        scope,
        config
      );
      violations.push(...violationsForPrinciple);
    }
  }

  /**
   * Validate DRY principle
   */
  private static async validateDRYPrinciple(
    scope: ArchitecturalValidationRequest,
    config: typeof ArchitecturalValidator['RULE_CONFIGS'][typeof ViolatedPrinciple.DRY_PRINCIPLE],
    violations: Finding[]
  ): Promise<void> {
    // Check for code duplication (using jscpd service)
    const duplicationFinding = await this.detectCodeDuplication(scope);
    if (duplicationFinding.length > 0) {
      violations.push(...duplicationFinding);
    }
    
    // Check for pattern duplication
    const patternViolations = await this.detectPatternDuplication(scope);
    violations.push(...patternViolations);
    
    // Check for component duplication
    const componentViolations = await this.detectComponentDuplication(scope);
    violations.push(...componentViolations);
    
    // Check for utility duplication
    const utilityViolations = await this.detectUtilityDuplication(scope);
    violations.push(...utilityViolations);
  }

  /**
   * Validate separation of concerns
   */
  private static async validateSeparationOfConcerns(
    scope: ArchitecturalValidationRequest,
    config: typeof ArchitecturalValidator['RULE_CONFIGS'][typeof ViolatedPrinciple.SEPARATION_OF_CONCERNS],
    violations: Finding[]
  ): Promise<void> {
    // Check for mixed responsibilities in components
    const mixedResponsibilityViolations = await this.detectMixedResponsibilities(scope);
    violations.push(...mixedResponsibilityViolations);
    
    // Check for UI logic in business logic
    const uiLogicViolations = await this.detectUILogicInBusinessLogic(scope);
    violations.push(...uiLogicViolations);
    
    // Check for infrastructure code in business logic
    const infrastructureViolations = await this.detectInfrastructureInBusinessLogic(scope);
    violations.push(...infrastructureViolations);
    
    // Check for presentation logic in business logic
    const presentationViolations = await this.detectPresentationInBusinessLogic(scope);
    violations.push(...presentationViolations);
  }

  /**
   * Validate healthcare-specific patterns
   */
  private static async validateHealthcarePatterns(
    scope: ArchitecturalValidationRequest,
    violations: Finding[]
  ): Promise<void> {
    for (const [rule, config] of Object.entries(this.HEALTHCARE_RULE_CONFIGS)) {
      const violationsForRule = await this.validateHealthcareRule(
        rule as keyof typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'],
        scope,
        config
      );
      violations.push(...violationsForRule);
    }
  }

  /**
   * Validate specific healthcare rule
   */
  private static async validateHealthcareRule(
    rule: string,
    scope: ArchitecturalValidationRequest,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string],
    existingViolations: Finding[]
  ): Promise<Finding[]> {
    const violations: Finding[] = [];
    
    // Scan files for healthcare rule violations
    const files = await this.scanFiles(scope.patterns.include);
    
    for (const file of files) {
      const fileViolations = await this.checkFileForHealthcareRule(
        file,
        rule,
        config
      );
      violations.push(...fileViolations);
    }
    
    return violations;
  }

  /**
   * Check file for specific healthcare rule violations
   */
  private static async checkFileForHealthcareRule(
    filePath: string,
    rule: string,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): Promise<Finding[]> {
    const violations: Finding[] = [];
    
    try {
      const content = await this.readFileContent(filePath);
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (this.matchesHealthcareRule(line, rule, config)) {
          violations.push(this.createHealthcareFinding(
            filePath,
            i + 1,
            line.trim(),
            rule,
            config
          ));
        }
      }
    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}:`, error);
    }
    
    return violations;
  }

  /**
   * Check if line matches healthcare rule
   */
  private static matchesHealthcareRule(
    line: string,
    rule: string,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): boolean {
    const lowerLine = line.toLowerCase();
    
    // Check for direct pattern matches
    if (config.patterns?.some(pattern => lowerLine.includes(pattern))) {
      return true;
    }
    
    // Check for context indicators
    if (config.context?.some(context => lowerLine.includes(context))) {
      return true;
    }
    
    // Check for Brazilian healthcare terminology
    if (config.brazilianContext?.portugueseTerms?.some(term => lowerLine.includes(term))) {
      return true;
    }
    
    return false;
  }

  /**
   * Create healthcare finding
   */
  private static createHealthcareFinding(
    filePath: string,
    lineNumber: number,
    lineContent: string,
    rule: string,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): Finding {
    const severity = this.calculateHealthcareSeverity(rule, config);
    const impact = this.calculateHealthcareImpact(rule, config);
    const solution = this.generateHealthcareSolution(rule, config);
    
    return {
      id: `${rule}_${filePath}_${lineNumber}`,
      type: FindingType.HEALTHCARE_COMPLIANCE,
      severity,
      location: [{
        filePath,
        lineNumber,
        componentName: this.extractComponentName(line),
        functionName: this.extractFunctionName(line)
      }],
      description: `${rule} violation detected: ${lineContent}`,
      impact,
      proposedSolution: solution,
      evidence: [lineContent],
      
      // Healthcare-specific data
      healthcareData: {
        patientDataInvolved: config.category === 'patient-data',
        clinicalRelevance: this.assessClinicalRelevance(lineContent),
        validationLogicInvolved: config.category === 'validation-logic',
        businessLogicInvolved: config.category === 'business-logic',
        brazilianContext: config.brazilianContext?.portugueseTerms?.length > 0
      }
    };
  }

  /**
   * Calculate healthcare severity
   */
  private static calculateHealthcareSeverity(
    rule: string,
    config: typeof ArchitectValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): SeverityLevel {
    const severityMap = {
      'patient-data': SeverityLevel.CRITICAL,
      'clinical-logic': SeverityLevel.HIGH,
      'validation-logic': SeverityLevel.HIGH,
      'business-logic': SeverityLevel.MEDIUM
    };
    
    return severityMap[config.category] || SeverityLevel.LOW;
  }

  /**
   * Calculate healthcare impact
   */
  private static calculateHealthcareImpact(
    rule: string,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): ImpactAssessment {
    const impactMap = {
      'patient-data': {
        maintenanceCost: 40, // hours/week
        developerExperience: 'severe',
        performanceImpact: 'significant',
        scalabilityRisk: 'high',
        businessRisk: 'critical'
      },
      'clinical-logic': {
        maintenanceCost: 30,
        developerExperience: 'moderate',
        performanceImpact: 'significant',
        scalabilityRisk: 'medium',
        businessRisk: 'high'
      },
      'validation-logic': {
        maintenanceCost: 25,
        developerExperience: 'moderate',
        performanceImpact: 'minor',
        scalabilityRisk: 'low',
        businessRisk: 'medium'
      },
      'business-logic': {
        maintenanceCost: 15,
        developerExperience: 'minor',
        performanceImpact: 'minor',
        scalabilityRisk: 'low',
        businessRisk: 'low'
      }
    };
    
    return impactMap[config.category] || impactMap['business-logic'];
  }

  /**
   * Generate healthcare solution
   */
  private static generateHealthcareSolution(
    rule: string,
    config: typeof ArchitectValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): Solution {
    return {
      id: `solution_${rule}`,
      type: 'AUTOMATED_FIX',
      description: `Fix ${rule} violation to ensure healthcare compliance`,
      steps: [
        `Implement ${config.description} solution`,
        `Add appropriate ${config.brazilianContext?.portugueseTerms?.join(', ') || 'healthcare'} terminology`,
        `Validate with healthcare regulatory requirements`
      ],
      estimatedEffort: {
        hours: this.calculateEffortForHealthcareFix(rule, config),
        complexity: this.calculateComplexityForHealthcareFix(rule, config),
        requiredSkills: [
          'healthcare-compliance',
          'brazilian-regulations',
          'clinical-standards'
        ],
        dependencies: [
          'healthcare-legal-review',
          'clinical-expert-validation',
          'regulatory-approval'
        ]
      },
      risks: [
        'Requires healthcare expert review',
        'May require regulatory approval',
        'Clinical validation required'
      ]
    };
  }

  /**
   * Calculate effort for healthcare fix
   */
  private static calculateEffortForHealthcareFix(
    rule: string,
    config: typeof ArchitecturalValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): number {
    const complexityMap = {
      'patient-data': 20,
      'clinical-logic': 15,
      'validation-logic': 10,
      'business-logic': 5
    };
    
    return complexityMap[config.category] || 5;
  }

  /**
   * Calculate complexity for healthcare fix
   */
  private static calculateComplexityForHealthcareFix(
    rule: string,
    config: typeof ArchitectValidator['HEALTHCARE_RULE_CONFIGS'][string]
  ): 'simple' | 'moderate' | 'complex' {
    const complexityMap = {
      'patient-data': 'complex',
      'clinical-logic': 'complex',
      'validation-logic': 'moderate',
      'business-logic': 'simple'
    };
    
    return complexityMap[config.category] || 'simple';
  }

  /**
   * Extract component name from line
   */
  private extractComponentName(line: string): string | undefined {
    const componentMatch = line.match(/class\s+(\w+)/);
    return componentMatch ? componentMatch[1] : undefined;
  }

  /**
   * Extract function name from line
   */
  private extractFunctionName(line: string): string | undefined {
    const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)/);
    return functionMatch ? functionMatch[1] : undefined;
  }

  /**
   * Detect code duplication using jscpd service
   */
  private static async detectCodeDuplication(
    scope: ArchitecturalValidationRequest
  ): Promise<DuplicationFinding[]> {
    // This would integrate with the existing jscpd service
    // For now, return empty array
    return [];
  }

  /**
   * Detect pattern duplication
   */
  private static async detectPatternDuplication(
    scope: ArchitecturalValidationRequest
  ): Promise<DuplicationFinding[]> {
    // This would implement pattern analysis
    // For now, return empty array
    return [];
  }

  /**
   * Detect component duplication
   */
  private static async detectComponentDuplication(
    scope: ArchitecturalValidationRequest
  ): Promise<DuplicationFinding[]> {
    // This would analyze React components for duplication
    // For now, return empty array
    return [];
  }

  /**
   * Detect utility duplication
   */
  private static async detectUtilityDuplication(
    scope: ArchitecturalRequest
  ): Promise<DuplicationFinding[]> {
    // This would analyze utility functions for duplication
    // For now, return empty array
    return [];
  }

  /**
   * Detect mixed responsibilities in components
   */
  private static async detectMixedResponsibilities(
    scope: ArchitecturalValidationRequest
  ): Promise<Finding[]> {
    // This would analyze React components for mixed responsibilities
    // For now, return empty array
    return [];
  }

  /**
   * Detect UI logic in business logic
   */
  private static async detectUILogicInBusinessLogic(
    scope: ArchitecturalValidationRequest
  ): Promise<Finding[]> {
    // This would analyze for UI logic in non-ui files
    // For now, return empty array
    return [];
  }

  /**
   * Detect infrastructure code in business logic
   */
  private static async detectInfrastructureInBusinessLogic(
    scope: ArchitecturalValidationRequest
  ): Promise<Finding[]> {
    // This would analyze for infrastructure code in business logic files
    // For now, return empty array
    return [];
  }

  /**
   * Detect presentation logic in business logic
   */
  private static async detectPresentationInBusinessLogic(
    scope: ArchitecturalValidationRequest
  ): Promise<Finding[]> {
    // This would analyze for presentation logic in business logic
    // For now, return empty array
    return [];
  }

  /**
   * Scan files for architectural analysis
   */
  private static async scanFiles(patterns: string[]): Promise<string[]> {
    // This would scan files based on patterns
    // For now, return empty array
    return [];
  }

  /**
   * Read file content
   */
  private static async readFileContent(filePath: string): Promise<string> {
    // This would read file content
    // For now, return empty string
    return '';
  }

  /**
   * Generate recommendations for architectural violations
   */
  private static async generateRecommendations(
    violations: Finding[],
    scope: ArchitecturalValidationRequest
  ): Promise<Solution[]> {
    const recommendations: Solution[] = [];
    
    for (const violation of violations) {
      if (violation.proposedSolution) {
        recommendations.push(violation.proposedSolution);
      } else {
        // Generate default recommendation
        recommendations.push(this.generateDefaultRecommendation(violation));
      }
    }
    
    return recommendations;
  }

  /**
   * Generate default recommendation for violation
   */
  private static generateDefaultRecommendation(violation: Finding): Solution {
    return {
      id: `recommendation_${violation.id}`,
      type: 'MANUAL_FIX',
      description: `Fix ${violation.type} violation`,
      steps: [
        'Identify the root cause of the violation',
        'Implement proper architectural solution',
        'Add comprehensive testing',
        'Validate with healthcare compliance'
      ],
      estimatedEffort: {
        hours: 8,
        complexity: 'moderate',
        requiredSkills: ['architecture', 'healthcare-compliance'],
        dependencies: []
      },
      risks: [
        'May introduce breaking changes',
        'Requires testing and validation',
        'May affect clinical workflows'
      ]
    };
  }

  /**
   * Calculate overall compliance score
   */
  private static calculateComplianceScore(violations: Finding[]): number {
    if (violations.length === 0) return 100;
    
    let totalScore = 0;
    let weightSum = 0;
    
    for (const violation of violations) {
      let violationScore = 100; // Base score
      
      // Adjust for severity
      const severityWeights = {
        [SeverityLevel.CRITICAL]: 100,
        [SeverityLevel.HIGH]: 75,
        [SeverityLevel.MEDIUM]: 50,
        [SeverityLevel.LOW]: 25
      };
      
      violationScore = severityWeights[violation.severity] || 25;
      
      // Healthcare compliance adjustments
      if (violation.healthcareData) {
        if (violation.healthcareData.patientDataInvolved) {
          violationScore += 25;
        }
        if (violation.healthcareData.lgpdComplianceScore > 0) {
          violationScore += 20;
        }
        if (violation.healthcareData.clinicalRelevance === 'critical') {
          violationScore += 30;
        }
      }
      
      totalScore += violationScore;
      weightSum += 1;
    }
    
    return Math.round((totalScore / weightSum) * 100) / 100;
  }

  /**
   * Get analyzed patterns for scope
   */
  private getAnalyzedPatterns(
    scope: ArchitecturalValidationRequest
  ): string[] {
    const patterns = [
      'SOLID principles',
      'DRY principle',
      'Separation of concerns',
      'Healthcare compliance patterns',
      'Brazilian healthcare context patterns',
      'Architectural boundaries'
    ];
    
    return patterns;
  }

  /**
   * Generate executive summary for architectural validation
   */
  generateExecutiveSummary(
    violations: Finding[],
    scope: ArchitecturalValidationRequest
  ): string {
    const complianceScore = this.calculateComplianceScore(violations);
    const criticalCount = violations.filter(v => v.severity === SeverityLevel.CRITICAL).length;
    const highCount = violations.filter(v => v.severity === SeverityLevel.HIGH).length;
    
    return `
# Architectural Validation Executive Summary

## Overall Compliance Score: ${complianceScore}/100

### Critical Issues Found: ${criticalCount}
- **High Priority Issues**: ${highCount}
- **Total Violations**: ${violations.length}

### Top Violation Categories
${this.getTopViolationCategories(violations).map(([category, count]) => 
  `- **${category}**: ${count} violations`
).join('\n')}

### Healthcare Compliance Impact
${this.getHealthcareComplianceSummary(violations)}

### Recommended Actions
${violations
  .slice(0, 5)
  .map(v => `- ${v.title}: ${v.description}`)
  .join('\n')}

### Next Steps
1. Address all critical violations immediately
2. Implement healthcare compliance improvements
3. Refactor architectural patterns
4. Add comprehensive testing
5. Schedule architectural review with healthcare experts

**Analysis Date**: ${new Date().toLocaleDateString('pt-BR')}
**Analysis Version**: ${scope.version || '1.0.0'}
    `.trim();
  }
}