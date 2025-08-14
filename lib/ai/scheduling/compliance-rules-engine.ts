/**
 * Compliance and Rules Engine for AI Scheduling
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 * 
 * This module implements comprehensive compliance and business rules:
 * - Healthcare regulations compliance
 * - Business policy enforcement
 * - Treatment protocol validation
 * - Staff certification requirements
 * - Patient safety protocols
 * - Brazilian healthcare regulations (CFM, ANVISA)
 */

import { createClient } from '@/lib/supabase/client'
import { SchedulingCriteria, SchedulingRecommendation } from './ai-scheduling-core'

// Rule Types
type RuleType = 
  | 'healthcare_regulation'
  | 'business_policy'
  | 'treatment_protocol'
  | 'staff_certification'
  | 'patient_safety'
  | 'equipment_requirement'
  | 'time_constraint'
  | 'financial_policy'

// Rule Severity
type RuleSeverity = 'info' | 'warning' | 'error' | 'critical'

// Rule Status
type RuleStatus = 'active' | 'inactive' | 'pending' | 'deprecated'

// Compliance Rule Definition
interface ComplianceRule {
  id: string
  name: string
  type: RuleType
  severity: RuleSeverity
  status: RuleStatus
  description: string
  regulation: string // CFM, ANVISA, internal policy, etc.
  conditions: RuleCondition[]
  actions: RuleAction[]
  exceptions: RuleException[]
  priority: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Rule Condition
interface RuleCondition {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

// Rule Action
interface RuleAction {
  id: string
  type: 'block' | 'warn' | 'modify' | 'require_approval' | 'log' | 'notify'
  description: string
  parameters: Record<string, any>
}

// Rule Exception
interface RuleException {
  id: string
  condition: string
  description: string
  approvalRequired: boolean
  approverRoles: string[]
}

// Compliance Validation Result
interface ComplianceValidationResult {
  isCompliant: boolean
  violations: RuleViolation[]
  warnings: RuleWarning[]
  requiredApprovals: RequiredApproval[]
  suggestedModifications: SuggestedModification[]
  complianceScore: number
}

// Rule Violation
interface RuleViolation {
  ruleId: string
  ruleName: string
  severity: RuleSeverity
  description: string
  field: string
  currentValue: any
  expectedValue: any
  regulation: string
  canBeOverridden: boolean
  overrideRequirements: string[]
}

// Rule Warning
interface RuleWarning {
  ruleId: string
  ruleName: string
  description: string
  recommendation: string
  impact: 'low' | 'medium' | 'high'
}

// Required Approval
interface RequiredApproval {
  ruleId: string
  approvalType: string
  requiredRoles: string[]
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
}

// Suggested Modification
interface SuggestedModification {
  field: string
  currentValue: any
  suggestedValue: any
  reason: string
  impact: string
}

// Brazilian Healthcare Regulations
interface BrazilianHealthcareRegulation {
  cfmResolution: string
  anvisaRegulation: string
  description: string
  applicableScenarios: string[]
  complianceRequirements: string[]
}

class ComplianceRulesEngine {
  private supabase = createClient()
  private rules: Map<string, ComplianceRule> = new Map()
  private brazilianRegulations: BrazilianHealthcareRegulation[] = []
  private ruleCache: Map<string, ComplianceValidationResult> = new Map()

  constructor() {
    this.initializeBrazilianRegulations()
    this.loadComplianceRules()
  }

  /**
   * Validate scheduling recommendation against all compliance rules
   */
  async validateCompliance(
    recommendation: SchedulingRecommendation,
    criteria: SchedulingCriteria,
    context: any = {}
  ): Promise<ComplianceValidationResult> {
    try {
      const violations: RuleViolation[] = []
      const warnings: RuleWarning[] = []
      const requiredApprovals: RequiredApproval[] = []
      const suggestedModifications: SuggestedModification[] = []

      // Load patient and treatment data for validation
      const validationContext = await this.buildValidationContext(
        recommendation,
        criteria,
        context
      )

      // Validate against each active rule
      for (const rule of this.rules.values()) {
        if (rule.status !== 'active') continue

        const ruleResult = await this.validateRule(rule, validationContext)
        
        if (ruleResult.violations.length > 0) {
          violations.push(...ruleResult.violations)
        }
        
        if (ruleResult.warnings.length > 0) {
          warnings.push(...ruleResult.warnings)
        }
        
        if (ruleResult.requiredApprovals.length > 0) {
          requiredApprovals.push(...ruleResult.requiredApprovals)
        }
        
        if (ruleResult.suggestedModifications.length > 0) {
          suggestedModifications.push(...ruleResult.suggestedModifications)
        }
      }

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(
        violations,
        warnings,
        requiredApprovals
      )

      const result: ComplianceValidationResult = {
        isCompliant: violations.filter(v => v.severity === 'critical' || v.severity === 'error').length === 0,
        violations,
        warnings,
        requiredApprovals,
        suggestedModifications,
        complianceScore
      }

      // Cache result for performance
      const cacheKey = this.generateCacheKey(recommendation, criteria)
      this.ruleCache.set(cacheKey, result)

      // Log compliance validation
      await this.logComplianceValidation(recommendation, criteria, result)

      return result
    } catch (error) {
      console.error('Error validating compliance:', error)
      throw new Error('Failed to validate compliance')
    }
  }

  /**
   * Validate a specific rule against the context
   */
  private async validateRule(
    rule: ComplianceRule,
    context: any
  ): Promise<{
    violations: RuleViolation[]
    warnings: RuleWarning[]
    requiredApprovals: RequiredApproval[]
    suggestedModifications: SuggestedModification[]
  }> {
    const violations: RuleViolation[] = []
    const warnings: RuleWarning[] = []
    const requiredApprovals: RequiredApproval[] = []
    const suggestedModifications: SuggestedModification[] = []

    // Check if rule conditions are met
    const conditionsMet = await this.evaluateRuleConditions(rule.conditions, context)
    
    if (conditionsMet) {
      // Rule applies, execute actions
      for (const action of rule.actions) {
        switch (action.type) {
          case 'block':
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              description: action.description,
              field: action.parameters.field || 'general',
              currentValue: context[action.parameters.field],
              expectedValue: action.parameters.expectedValue,
              regulation: rule.regulation,
              canBeOverridden: rule.exceptions.length > 0,
              overrideRequirements: rule.exceptions.map(e => e.description)
            })
            break
            
          case 'warn':
            warnings.push({
              ruleId: rule.id,
              ruleName: rule.name,
              description: action.description,
              recommendation: action.parameters.recommendation || '',
              impact: action.parameters.impact || 'medium'
            })
            break
            
          case 'require_approval':
            requiredApprovals.push({
              ruleId: rule.id,
              approvalType: action.parameters.approvalType,
              requiredRoles: action.parameters.requiredRoles || [],
              reason: action.description,
              urgency: action.parameters.urgency || 'medium'
            })
            break
            
          case 'modify':
            suggestedModifications.push({
              field: action.parameters.field,
              currentValue: context[action.parameters.field],
              suggestedValue: action.parameters.suggestedValue,
              reason: action.description,
              impact: action.parameters.impact || 'Improves compliance'
            })
            break
        }
      }
    }

    return { violations, warnings, requiredApprovals, suggestedModifications }
  }

  /**
   * Evaluate rule conditions against context
   */
  private async evaluateRuleConditions(
    conditions: RuleCondition[],
    context: any
  ): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let currentLogicalOperator: 'AND' | 'OR' = 'AND'

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      const conditionResult = this.evaluateCondition(condition, context)

      if (i === 0) {
        result = conditionResult
      } else {
        if (currentLogicalOperator === 'AND') {
          result = result && conditionResult
        } else {
          result = result || conditionResult
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOperator = condition.logicalOperator
      }
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: RuleCondition, context: any): boolean {
    const fieldValue = this.getNestedValue(context, condition.field)
    const conditionValue = condition.value

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue
      case 'not_equals':
        return fieldValue !== conditionValue
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue)
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue)
      case 'contains':
        return String(fieldValue).includes(String(conditionValue))
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)
      default:
        return false
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Build validation context with all necessary data
   */
  private async buildValidationContext(
    recommendation: SchedulingRecommendation,
    criteria: SchedulingCriteria,
    additionalContext: any
  ): Promise<any> {
    try {
      // Load patient data
      const { data: patient } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', criteria.patientId)
        .single()

      // Load treatment data
      const { data: treatment } = await this.supabase
        .from('treatments')
        .select('*')
        .eq('id', criteria.treatmentId)
        .single()

      // Load staff data
      const { data: staff } = await this.supabase
        .from('staff')
        .select(`
          *,
          staff_certifications(*),
          staff_specializations(*)
        `)
        .eq('id', recommendation.staffId)
        .single()

      // Load equipment requirements
      const { data: equipmentRequirements } = await this.supabase
        .from('treatment_equipment_requirements')
        .select(`
          *,
          equipment(*)
        `)
        .eq('treatment_id', criteria.treatmentId)

      return {
        recommendation,
        criteria,
        patient,
        treatment,
        staff,
        equipmentRequirements,
        timeSlot: recommendation.timeSlot,
        dayOfWeek: recommendation.timeSlot.startTime.getDay(),
        hourOfDay: recommendation.timeSlot.startTime.getHours(),
        appointmentDuration: treatment?.duration_minutes || 60,
        patientAge: patient ? this.calculateAge(patient.birth_date) : 0,
        isMinor: patient ? this.calculateAge(patient.birth_date) < 18 : false,
        isEmergency: criteria.urgencyLevel === 'urgent',
        isFollowUp: criteria.isFollowUp,
        ...additionalContext
      }
    } catch (error) {
      console.error('Error building validation context:', error)
      return {
        recommendation,
        criteria,
        ...additionalContext
      }
    }
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    violations: RuleViolation[],
    warnings: RuleWarning[],
    requiredApprovals: RequiredApproval[]
  ): number {
    let score = 100

    // Deduct points for violations
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 25
          break
        case 'error':
          score -= 15
          break
        case 'warning':
          score -= 5
          break
        case 'info':
          score -= 1
          break
      }
    })

    // Deduct points for warnings
    warnings.forEach(warning => {
      switch (warning.impact) {
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    })

    // Deduct points for required approvals
    requiredApprovals.forEach(approval => {
      switch (approval.urgency) {
        case 'urgent':
          score -= 15
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    })

    return Math.max(0, score)
  }

  /**
   * Initialize Brazilian healthcare regulations
   */
  private initializeBrazilianRegulations(): void {
    this.brazilianRegulations = [
      {
        cfmResolution: 'CFM 2.314/2022',
        anvisaRegulation: 'RDC 63/2011',
        description: 'Telemedicine and digital health regulations',
        applicableScenarios: ['telemedicine', 'digital_consultation'],
        complianceRequirements: [
          'Patient consent for digital consultation',
          'Secure communication platform',
          'Digital signature validation'
        ]
      },
      {
        cfmResolution: 'CFM 1.821/2007',
        anvisaRegulation: 'RDC 50/2002',
        description: 'Medical record and patient privacy',
        applicableScenarios: ['all_appointments'],
        complianceRequirements: [
          'Patient data encryption',
          'Access control and audit logs',
          'Data retention policies'
        ]
      },
      {
        cfmResolution: 'CFM 2.217/2018',
        anvisaRegulation: 'RDC 36/2013',
        description: 'Medical ethics and professional conduct',
        applicableScenarios: ['all_appointments'],
        complianceRequirements: [
          'Professional licensing validation',
          'Continuing education requirements',
          'Ethical conduct monitoring'
        ]
      }
    ]
  }

  /**
   * Load compliance rules from database
   */
  private async loadComplianceRules(): Promise<void> {
    try {
      const { data: rules } = await this.supabase
        .from('compliance_rules')
        .select(`
          *,
          rule_conditions(*),
          rule_actions(*),
          rule_exceptions(*)
        `)
        .eq('status', 'active')

      if (rules) {
        rules.forEach(rule => {
          this.rules.set(rule.id, {
            id: rule.id,
            name: rule.name,
            type: rule.type,
            severity: rule.severity,
            status: rule.status,
            description: rule.description,
            regulation: rule.regulation,
            conditions: rule.rule_conditions || [],
            actions: rule.rule_actions || [],
            exceptions: rule.rule_exceptions || [],
            priority: rule.priority,
            createdAt: new Date(rule.created_at),
            updatedAt: new Date(rule.updated_at),
            createdBy: rule.created_by
          })
        })
      }

      // Load default rules if none exist
      if (this.rules.size === 0) {
        await this.createDefaultRules()
      }
    } catch (error) {
      console.error('Error loading compliance rules:', error)
      await this.createDefaultRules()
    }
  }

  /**
   * Create default compliance rules
   */
  private async createDefaultRules(): Promise<void> {
    const defaultRules: Partial<ComplianceRule>[] = [
      {
        id: 'minor-patient-guardian-consent',
        name: 'Minor Patient Guardian Consent',
        type: 'patient_safety',
        severity: 'critical',
        status: 'active',
        description: 'Patients under 18 require guardian consent',
        regulation: 'CFM 2.217/2018 - Medical Ethics',
        conditions: [
          {
            id: 'age-check',
            field: 'patientAge',
            operator: 'less_than',
            value: 18
          }
        ],
        actions: [
          {
            id: 'require-guardian-consent',
            type: 'require_approval',
            description: 'Guardian consent required for minor patient',
            parameters: {
              approvalType: 'guardian_consent',
              requiredRoles: ['guardian', 'legal_representative'],
              urgency: 'high'
            }
          }
        ],
        exceptions: [],
        priority: 1
      },
      {
        id: 'staff-certification-validation',
        name: 'Staff Certification Validation',
        type: 'staff_certification',
        severity: 'error',
        status: 'active',
        description: 'Staff must have valid certification for treatment',
        regulation: 'CFM 2.217/2018 - Professional Licensing',
        conditions: [
          {
            id: 'certification-check',
            field: 'staff.certifications',
            operator: 'contains',
            value: 'treatment.required_certification'
          }
        ],
        actions: [
          {
            id: 'block-uncertified-staff',
            type: 'block',
            description: 'Staff member lacks required certification',
            parameters: {
              field: 'staffId',
              expectedValue: 'certified_staff_member'
            }
          }
        ],
        exceptions: [
          {
            id: 'emergency-exception',
            condition: 'isEmergency === true',
            description: 'Emergency situations allow temporary assignment',
            approvalRequired: true,
            approverRoles: ['medical_director', 'chief_of_staff']
          }
        ],
        priority: 2
      },
      {
        id: 'equipment-availability-check',
        name: 'Equipment Availability Check',
        type: 'equipment_requirement',
        severity: 'error',
        status: 'active',
        description: 'Required equipment must be available and functional',
        regulation: 'ANVISA RDC 50/2002 - Equipment Standards',
        conditions: [
          {
            id: 'equipment-required',
            field: 'equipmentRequirements.length',
            operator: 'greater_than',
            value: 0
          }
        ],
        actions: [
          {
            id: 'validate-equipment',
            type: 'block',
            description: 'Required equipment not available or not functional',
            parameters: {
              field: 'equipment',
              expectedValue: 'available_and_functional'
            }
          }
        ],
        exceptions: [],
        priority: 3
      },
      {
        id: 'working-hours-compliance',
        name: 'Working Hours Compliance',
        type: 'time_constraint',
        severity: 'warning',
        status: 'active',
        description: 'Appointments should be scheduled during regular working hours',
        regulation: 'Internal Policy - Working Hours',
        conditions: [
          {
            id: 'hour-check',
            field: 'hourOfDay',
            operator: 'less_than',
            value: 8,
            logicalOperator: 'OR'
          },
          {
            id: 'hour-check-2',
            field: 'hourOfDay',
            operator: 'greater_than',
            value: 18
          }
        ],
        actions: [
          {
            id: 'warn-outside-hours',
            type: 'warn',
            description: 'Appointment scheduled outside regular working hours',
            parameters: {
              recommendation: 'Consider scheduling during regular hours (8 AM - 6 PM)',
              impact: 'medium'
            }
          }
        ],
        exceptions: [
          {
            id: 'emergency-hours',
            condition: 'isEmergency === true',
            description: 'Emergency appointments can be scheduled anytime',
            approvalRequired: false,
            approverRoles: []
          }
        ],
        priority: 4
      }
    ]

    // Add default rules to the rules map
    defaultRules.forEach(rule => {
      if (rule.id) {
        this.rules.set(rule.id, {
          ...rule,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        } as ComplianceRule)
      }
    })
  }

  /**
   * Generate cache key for validation result
   */
  private generateCacheKey(
    recommendation: SchedulingRecommendation,
    criteria: SchedulingCriteria
  ): string {
    return `${criteria.patientId}-${criteria.treatmentId}-${recommendation.staffId}-${recommendation.timeSlot.startTime.getTime()}`
  }

  /**
   * Log compliance validation for audit purposes
   */
  private async logComplianceValidation(
    recommendation: SchedulingRecommendation,
    criteria: SchedulingCriteria,
    result: ComplianceValidationResult
  ): Promise<void> {
    try {
      await this.supabase
        .from('compliance_validations')
        .insert({
          patient_id: criteria.patientId,
          treatment_id: criteria.treatmentId,
          staff_id: recommendation.staffId,
          time_slot: recommendation.timeSlot.startTime.toISOString(),
          is_compliant: result.isCompliant,
          compliance_score: result.complianceScore,
          violations_count: result.violations.length,
          warnings_count: result.warnings.length,
          approvals_required: result.requiredApprovals.length,
          validation_result: JSON.stringify(result),
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging compliance validation:', error)
    }
  }

  /**
   * Add new compliance rule
   */
  async addComplianceRule(rule: Omit<ComplianceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ruleId = `rule-${Date.now()}`
      const newRule: ComplianceRule = {
        ...rule,
        id: ruleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to database
      await this.supabase
        .from('compliance_rules')
        .insert({
          id: newRule.id,
          name: newRule.name,
          type: newRule.type,
          severity: newRule.severity,
          status: newRule.status,
          description: newRule.description,
          regulation: newRule.regulation,
          priority: newRule.priority,
          created_by: newRule.createdBy,
          created_at: newRule.createdAt.toISOString(),
          updated_at: newRule.updatedAt.toISOString()
        })

      // Add to memory
      this.rules.set(ruleId, newRule)

      return ruleId
    } catch (error) {
      console.error('Error adding compliance rule:', error)
      throw new Error('Failed to add compliance rule')
    }
  }

  /**
   * Update compliance rule
   */
  async updateComplianceRule(
    ruleId: string,
    updates: Partial<ComplianceRule>
  ): Promise<void> {
    try {
      const existingRule = this.rules.get(ruleId)
      if (!existingRule) {
        throw new Error('Rule not found')
      }

      const updatedRule: ComplianceRule = {
        ...existingRule,
        ...updates,
        updatedAt: new Date()
      }

      // Update in database
      await this.supabase
        .from('compliance_rules')
        .update({
          name: updatedRule.name,
          type: updatedRule.type,
          severity: updatedRule.severity,
          status: updatedRule.status,
          description: updatedRule.description,
          regulation: updatedRule.regulation,
          priority: updatedRule.priority,
          updated_at: updatedRule.updatedAt.toISOString()
        })
        .eq('id', ruleId)

      // Update in memory
      this.rules.set(ruleId, updatedRule)
    } catch (error) {
      console.error('Error updating compliance rule:', error)
      throw new Error('Failed to update compliance rule')
    }
  }

  /**
   * Get all compliance rules
   */
  getComplianceRules(): ComplianceRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Get Brazilian healthcare regulations
   */
  getBrazilianRegulations(): BrazilianHealthcareRegulation[] {
    return this.brazilianRegulations
  }
}

export {
  ComplianceRulesEngine,
  type ComplianceRule,
  type ComplianceValidationResult,
  type RuleViolation,
  type RuleWarning,
  type RequiredApproval,
  type SuggestedModification,
  type BrazilianHealthcareRegulation
}