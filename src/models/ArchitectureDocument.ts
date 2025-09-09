/**
 * ArchitectureDocument Model
 * Represents source-tree.md and tech-stack.md files that define standards
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

import type { ArchitectureStandard, DocumentType, RuleException, ValidationRule, } from './types'
import { RuleSeverity, } from './types'

export class ArchitectureDocument {
  public readonly filePath: string
  public readonly type: DocumentType
  public standards: ArchitectureStandard[]
  public rules: ValidationRule[]
  public exceptions: RuleException[]
  public readonly lastUpdated: Date
  public readonly version: string

  constructor(
    filePath: string,
    type: DocumentType,
    lastUpdated: Date,
    version: string = '1.0.0',
  ) {
    this.filePath = filePath
    this.type = type
    this.lastUpdated = lastUpdated
    this.version = version
    this.standards = []
    this.rules = []
    this.exceptions = []
  }

  /**
   * Add an architecture standard
   */
  public addStandard(standard: ArchitectureStandard,): void {
    this.standards.push(standard,)
  }

  /**
   * Add a validation rule
   */
  public addRule(rule: ValidationRule,): void {
    this.rules.push(rule,)
  }

  /**
   * Add a rule exception
   */
  public addException(exception: RuleException,): void {
    this.exceptions.push(exception,)
  }

  /**
   * Get rules by category
   */
  public getRulesByCategory(category: string,): ValidationRule[] {
    return this.rules.filter(rule => rule.category === category)
  }

  /**
   * Get rules by severity
   */
  public getRulesBySeverity(severity: RuleSeverity,): ValidationRule[] {
    return this.rules.filter(rule => rule.severity === severity)
  }

  /**
   * Check if a file path has an exception for a specific rule
   */
  public hasException(ruleId: string, filePath: string,): boolean {
    return this.exceptions.some(exception =>
      exception.ruleId === ruleId
      && exception.appliesTo.some(pattern => new RegExp(pattern,).test(filePath,))
      && (!exception.expiresAt || exception.expiresAt > new Date())
    )
  } /**
   * Get standards that apply to a specific file path
   */

  public getApplicableStandards(filePath: string,): ArchitectureStandard[] {
    return this.standards.filter(standard =>
      standard.scope.some(pattern => new RegExp(pattern,).test(filePath,))
    )
  }

  /**
   * Get all required standards
   */
  public getRequiredStandards(): ArchitectureStandard[] {
    return this.standards.filter(standard => standard.required)
  }

  /**
   * Get validation rules that apply to a specific file path
   */
  public getApplicableRules(filePath: string,): ValidationRule[] {
    return this.rules.filter(rule => {
      // Check if rule pattern matches file path
      const matches = new RegExp(rule.pattern,).test(filePath,)
      // Check if there's no exception for this file
      const hasException = this.hasException(rule.id, filePath,)
      return matches && !hasException
    },)
  }

  /**
   * Parse architecture document content from markdown
   */
  public static parseFromMarkdown(
    filePath: string,
    content: string,
    type: DocumentType,
    lastUpdated: Date,
  ): ArchitectureDocument {
    const doc = new ArchitectureDocument(filePath, type, lastUpdated,)

    // Parse standards and rules from markdown content
    // This is a simplified parser - real implementation would be more robust
    const lines = content.split('\n',)

    let currentSection = ''
    let currentStandard: Partial<ArchitectureStandard> | null = null

    for (const line of lines) {
      const trimmed = line.trim()

      // Section headers
      if (trimmed.startsWith('## ',)) {
        currentSection = trimmed.slice(3,)
        continue
      }

      // Standards parsing
      if (currentSection === 'Rules' || currentSection === 'Standards') {
        if (trimmed.startsWith('- ',) && trimmed.includes('**',)) {
          // New standard
          if (currentStandard) {
            doc.addStandard(currentStandard as ArchitectureStandard,)
          }

          const name = trimmed.match(/\*\*(.*?)\*\*/,)?.[1] || ''
          currentStandard = {
            name,
            description: '',
            scope: ['**/*',],
            required: trimmed.includes('MUST',) || trimmed.includes('required',),
            examples: [],
          }
        } else if (trimmed.startsWith('  - ',) && currentStandard) {
          // Standard details
          const detail = trimmed.slice(4,)
          if (detail.startsWith('Scope:',)) {
            currentStandard.scope = [detail.slice(6,).trim(),]
          } else if (detail.startsWith('Example:',)) {
            currentStandard.examples = [detail.slice(8,).trim(),]
          } else {
            currentStandard.description += ' ' + detail
          }
        }
      }
    }

    // Add final standard
    if (currentStandard) {
      doc.addStandard(currentStandard as ArchitectureStandard,)
    }

    // Generate validation rules from standards
    doc.generateValidationRules()

    return doc
  }

  /**
   * Generate validation rules from architecture standards
   */
  private generateValidationRules(): void {
    this.standards.forEach((standard, index,) => {
      const rule: ValidationRule = {
        id: `${this.type}_${index}_${standard.name.replace(/\s+/g, '_',).toLowerCase()}`,
        pattern: standard.scope[0] || '**/*',
        requirement: standard.description,
        severity: standard.required ? RuleSeverity.ERROR : RuleSeverity.WARNING,
        category: this.type,
      }

      this.rules.push(rule,)
    },)
  }

  /**
   * Convert to JSON representation
   */
  public toJSON(): object {
    return {
      filePath: this.filePath,
      type: this.type,
      standards: this.standards,
      rules: this.rules,
      exceptions: this.exceptions,
      lastUpdated: this.lastUpdated,
      version: this.version,
    }
  }

  /**
   * Create ArchitectureDocument from JSON representation
   */
  public static fromJSON(data: any,): ArchitectureDocument {
    const doc = new ArchitectureDocument(
      data.filePath,
      data.type,
      new Date(data.lastUpdated,),
      data.version,
    )

    doc.standards = data.standards || []
    doc.rules = data.rules || []
    doc.exceptions = data.exceptions || []

    return doc
  }
}
