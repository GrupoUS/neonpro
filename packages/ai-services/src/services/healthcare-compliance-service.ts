import { EventEmitter } from 'events';
import { logger } from '@neonpro/shared';
import { HealthcareComplianceConfig } from '../providers/base-ai-provider';

/**
 * Brazilian healthcare regulatory frameworks
 */
export enum BrazilianRegulatoryFramework {
  LGPD = 'lgpd',              // Lei Geral de Proteção de Dados
  ANVISA = 'anvisa',          // Agência Nacional de Vigilância Sanitária
  CFM = 'cfm',                // Conselho Federal de Medicina
  COREN = 'coren',            // Conselho Regional de Enfermagem
  CFF = 'cff',                // Conselho Federal de Farmácia
  CNEP = 'cnep',              // Cadastro Nacional de Estabelecimentos de Saúde
}

/**
 * PII data types for healthcare
 */
export enum PIIType {
  CPF = 'cpf',                             // Brazilian tax ID
  CNPJ = 'cnpj',                           // Brazilian company tax ID
  RG = 'rg',                               // Brazilian ID
  PHONE = 'phone',                         // Phone number
  EMAIL = 'email',                         // Email address
  MEDICAL_RECORD = 'medical_record',       // Medical record number
  HEALTH_INSURANCE = 'health_insurance',   // Health insurance number
  PROFESSIONAL_LICENSE = 'professional_license', // Professional license
  ADDRESS = 'address',                     // Full address
  BIRTH_DATE = 'birth_date',               // Date of birth
  SUS_CARD = 'sus_card',                   // Brazilian health system card
  PROCEDURE_CODE = 'procedure_code',       // Medical procedure code
}

/**
 * Compliance violation severity
 */
export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Compliance check result
 */
export interface ComplianceCheckResult {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  score: number; // 0-100
  framework: BrazilianRegulatoryFramework;
  timestamp: Date;
}

/**
 * Compliance violation
 */
export interface ComplianceViolation {
  id: string;
  type: string;
  severity: ViolationSeverity;
  description: string;
  location: 'prompt' | 'response' | 'metadata';
  extractedText: string;
  recommendation: string;
  regulatoryReference: string;
}

/**
 * Healthcare context types
 */
export interface HealthcareContext {
  type: 'clinical' | 'administrative' | 'research' | 'educational';
  specialty?: 'dermatology' | 'aesthetics' | 'general' | 'surgery';
  patientInteraction: boolean;
  sensitiveData: boolean;
  emergency: boolean;
}

/**
 * Compliance audit log
 */
export interface ComplianceAuditLog {
  id: string;
  timestamp: Date;
  provider: string;
  action: string;
  context: HealthcareContext;
  input: {
    prompt: string;
    options?: any;
  };
  output: {
    response: string;
    sanitized: boolean;
    violations?: ComplianceViolation[];
  };
  compliance: {
    frameworks: BrazilianRegulatoryFramework[];
    score: number;
    passed: boolean;
  };
  metadata: {
    processingTime: number;
    tokensUsed: number;
    cost?: number;
  };
}

/**
 * PII redaction strategy
 */
export interface PIIRedactionStrategy {
  type: PIIType;
  pattern: RegExp;
  replacement: string;
  context: string[];
  confidence: number;
}

/**
 * Healthcare compliance service configuration
 */
export interface HealthcareComplianceServiceConfig {
  enabled: boolean;
  frameworks: BrazilianRegulatoryFramework[];
  piiRedaction: {
    enabled: boolean;
    strictMode: boolean;
    customPatterns?: PIIRedactionStrategy[];
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    includeContent: boolean;
  };
  validation: {
    enabled: boolean;
    threshold: number; // Minimum compliance score (0-100)
    blockNonCompliant: boolean;
  };
  brazilianContext: {
    enabled: boolean;
    languageDetection: boolean;
    culturalAdaptation: boolean;
  };
}

/**
 * Comprehensive healthcare compliance service
 * Handles PII redaction, regulatory compliance, and audit logging
 */
export class HealthcareComplianceService extends EventEmitter {
  private static instance: HealthcareComplianceService;
  private config: HealthcareComplianceServiceConfig;
  private auditLogs: ComplianceAuditLog[] = [];
  private piiPatterns: Map<PIIType, PIIRedactionStrategy[]> = new Map();

  private constructor(config: Partial<HealthcareComplianceServiceConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.initializePIIPatterns();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<HealthcareComplianceServiceConfig>): HealthcareComplianceService {
    if (!HealthcareComplianceService.instance) {
      HealthcareComplianceService.instance = new HealthcareComplianceService(config);
    }
    return HealthcareComplianceService.instance;
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config: Partial<HealthcareComplianceServiceConfig>): HealthcareComplianceServiceConfig {
    return {
      enabled: config.enabled ?? true,
      frameworks: config.frameworks ?? [
        BrazilianRegulatoryFramework.LGPD,
        BrazilianRegulatoryFramework.ANVISA,
        BrazilianRegulatoryFramework.CFM,
      ],
      piiRedaction: {
        enabled: config.piiRedaction?.enabled ?? true,
        strictMode: config.piiRedaction?.strictMode ?? false,
        customPatterns: config.piiRedaction?.customPatterns ?? [],
      },
      audit: {
        enabled: config.audit?.enabled ?? true,
        retentionDays: config.audit?.retentionDays ?? 365,
        logLevel: config.audit?.logLevel ?? 'info',
        includeContent: config.audit?.includeContent ?? false,
      },
      validation: {
        enabled: config.validation?.enabled ?? true,
        threshold: config.validation?.threshold ?? 85,
        blockNonCompliant: config.validation?.blockNonCompliant ?? true,
      },
      brazilianContext: {
        enabled: config.brazilianContext?.enabled ?? true,
        languageDetection: config.brazilianContext?.languageDetection ?? true,
        culturalAdaptation: config.brazilianContext?.culturalAdaptation ?? true,
      },
    };
  }

  /**
   * Initialize PII patterns for Brazilian healthcare
   */
  private initializePIIPatterns(): void {
    // CPF (Brazilian tax ID)
    this.addPIIPattern({
      type: PIIType.CPF,
      pattern: /\b\d{3}\.\d{3}\.\d{3}-\d{1}\b/g,
      replacement: '[CPF]',
      context: ['all'],
      confidence: 0.95,
    });

    // CNPJ (Brazilian company tax ID)
    this.addPIIPattern({
      type: PIIType.CNPJ,
      pattern: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
      replacement: '[CNPJ]',
      context: ['all'],
      confidence: 0.95,
    });

    // Brazilian phone numbers
    this.addPIIPattern({
      type: PIIType.PHONE,
      pattern: /\b(?:\+?55\s?)?(?:\(?0?([1-9]{2})\)?\s?)?(?:9?\d{4}[-.\s]?\d{4})\b/g,
      replacement: '[PHONE]',
      context: ['all'],
      confidence: 0.9,
    });

    // Email addresses
    this.addPIIPattern({
      type: PIIType.EMAIL,
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: '[EMAIL]',
      context: ['all'],
      confidence: 0.95,
    });

    // Medical record numbers
    this.addPIIPattern({
      type: PIIType.MEDICAL_RECORD,
      pattern: /\b(?:prontuário|medical record|MRN|registro)\s*[:\-]?\s*\d{4,10}\b/gi,
      replacement: '[MEDICAL_RECORD]',
      context: ['clinical', 'administrative'],
      confidence: 0.85,
    });

    // Professional licenses (CRM, COREN, etc.)
    this.addPIIPattern({
      type: PIIType.PROFESSIONAL_LICENSE,
      pattern: /\b(?:CRM|COREN|CFF|CREFITO|CRF)\s*[:\-]?\s*[A-Z]{0,2}\/\d{4,10}\b/gi,
      replacement: '[LICENSE]',
      context: ['clinical', 'professional'],
      confidence: 0.9,
    });

    // SUS card (Brazilian health system)
    this.addPIIPattern({
      type: PIIType.SUS_CARD,
      pattern: /\b(?:cartão SUS|SUS card)\s*[:\-]?\s*\d{15}\b/gi,
      replacement: '[SUS_CARD]',
      context: ['clinical', 'administrative'],
      confidence: 0.95,
    });

    // Dates (birth dates, appointment dates)
    this.addPIIPattern({
      type: PIIType.BIRTH_DATE,
      pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
      replacement: '[DATE]',
      context: ['clinical', 'administrative'],
      confidence: 0.7,
    });

    // Procedure codes (TUSS, CBHPM)
    this.addPIIPattern({
      type: PIIType.PROCEDURE_CODE,
      pattern: /\b(?:TUSS|CBHPM)\s*[:\-]?\s*\d{6,8}\b/gi,
      replacement: '[PROCEDURE_CODE]',
      context: ['clinical', 'administrative'],
      confidence: 0.9,
    });

    // Address patterns
    this.addPIIPattern({
      type: PIIType.ADDRESS,
      pattern: /\b(?:rua|avenida|alameda|travessa|estrada)\s+[A-Za-z\s]+,\s*\d{1,5}(?:\s*[A-Za-z0-9]+)?\b/gi,
      replacement: '[ADDRESS]',
      context: ['all'],
      confidence: 0.8,
    });

    // Health insurance numbers
    this.addPIIPattern({
      type: PIIType.HEALTH_INSURANCE,
      pattern: /\b(?:plano de saúde|health insurance|operadora)\s*[:\-]?\s*\d{6,12}\b/gi,
      replacement: '[HEALTH_INSURANCE]',
      context: ['administrative'],
      confidence: 0.85,
    });

    // Add custom patterns if provided
    if (this.config.piiRedaction.customPatterns) {
      this.config.piiRedaction.customPatterns.forEach(pattern => {
        this.addPIIPattern(pattern);
      });
    }
  }

  /**
   * Add PII pattern
   */
  private addPIIPattern(strategy: PIIRedactionStrategy): void {
    if (!this.piiPatterns.has(strategy.type)) {
      this.piiPatterns.set(strategy.type, []);
    }
    this.piiPatterns.get(strategy.type)!.push(strategy);
  }

  /**
   * Process content for healthcare compliance
   */
  async processContent(
    content: string,
    context: HealthcareContext,
    provider: string,
    metadata?: any
  ): Promise<{
    sanitizedContent: string;
    complianceResults: ComplianceCheckResult[];
    auditLog?: ComplianceAuditLog;
  }> {
    if (!this.config.enabled) {
      return {
        sanitizedContent: content,
        complianceResults: [],
      };
    }

    const startTime = Date.now();
    
    // Step 1: PII Redaction
    const piiRedactedContent = this.redactPII(content, context);
    
    // Step 2: Compliance checking
    const complianceResults = await this.checkCompliance(piiRedactedContent, context);
    
    // Step 3: Calculate overall compliance score
    const overallScore = this.calculateOverallScore(complianceResults);
    
    // Step 4: Create audit log
    let auditLog: ComplianceAuditLog | undefined;
    if (this.config.audit.enabled) {
      auditLog = this.createAuditLog({
        originalContent: content,
        sanitizedContent: piiRedactedContent,
        complianceResults,
        context,
        provider,
        metadata,
        processingTime: Date.now() - startTime,
      });
    }

    // Step 5: Check if content should be blocked
    if (this.config.validation.enabled && 
        this.config.validation.blockNonCompliant && 
        overallScore < this.config.validation.threshold) {
      throw new Error(`Content blocked due to compliance violations. Score: ${overallScore}/${this.config.validation.threshold}`);
    }

    // Emit compliance event
    this.emit('complianceCheck', {
      provider,
      content: piiRedactedContent,
      score: overallScore,
      violations: complianceResults.flatMap(r => r.violations),
      auditLog,
    });

    return {
      sanitizedContent: piiRedactedContent,
      complianceResults,
      auditLog,
    };
  }

  /**
   * Redact PII from content
   */
  private redactPII(content: string, context: HealthcareContext): string {
    if (!this.config.piiRedaction.enabled) {
      return content;
    }

    let sanitizedContent = content;
    const redactionStats = new Map<PIIType, number>();

    // Apply all PII patterns
    for (const [type, patterns] of this.piiPatterns) {
      // Check if pattern is applicable for this context
      const applicablePatterns = patterns.filter(pattern => 
        pattern.context.includes('all') || pattern.context.includes(context.type)
      );

      for (const pattern of applicablePatterns) {
        const matches = sanitizedContent.match(pattern.pattern);
        if (matches) {
          redactionStats.set(type, (redactionStats.get(type) || 0) + matches.length);
          sanitizedContent = sanitizedContent.replace(pattern.pattern, pattern.replacement);
        }
      }
    }

    // Log redaction statistics
    if (redactionStats.size > 0) {
      logger.info('PII redaction completed', {
        redactions: Object.fromEntries(redactionStats),
        context: context.type,
      });
    }

    return sanitizedContent;
  }

  /**
   * Check compliance with Brazilian healthcare regulations
   */
  private async checkCompliance(
    content: string,
    context: HealthcareContext
  ): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    for (const framework of this.config.frameworks) {
      const violations = await this.checkFrameworkCompliance(content, context, framework);
      const score = this.calculateFrameworkScore(violations);

      results.push({
        isCompliant: violations.length === 0,
        violations,
        score,
        framework,
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Check compliance for specific framework
   */
  private async checkFrameworkCompliance(
    content: string,
    context: HealthcareContext,
    framework: BrazilianRegulatoryFramework
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    switch (framework) {
      case BrazilianRegulatoryFramework.LGPD:
        violations.push(...this.checkLGPDCompliance(content, context));
        break;
      case BrazilianRegulatoryFramework.ANVISA:
        violations.push(...this.checkANVISACompliance(content, context));
        break;
      case BrazilianRegulatoryFramework.CFM:
        violations.push(...this.checkCFMCompliance(content, context));
        break;
      default:
        // Other frameworks can be added as needed
        break;
    }

    return violations;
  }

  /**
   * Check LGPD compliance
   */
  private checkLGPDCompliance(content: string, context: HealthcareContext): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for unauthorized data processing
    const unauthorizedTerms = [
      'processar dados sem consentimento',
      'compartilhar dados pessoais',
      'vender informações de pacientes',
      'dados não autorizados',
    ];

    for (const term of unauthorizedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        violations.push({
          id: this.generateViolationId(),
          type: 'lgpd_unauthorized_processing',
          severity: ViolationSeverity.HIGH,
          description: `Potential unauthorized data processing detected`,
          location: 'response',
          extractedText: matches.join(', '),
          recommendation: 'Review data processing activities and ensure proper consent',
          regulatoryReference: 'LGPD Art. 7°',
        });
      }
    }

    return violations;
  }

  /**
   * Check ANVISA compliance
   */
  private checkANVISACompliance(content: string, context: HealthcareContext): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for prohibited medical claims
    const prohibitedClaims = [
      'cura garantida',
      'tratamento 100% eficaz',
      'resultado imediato',
      'sem efeitos colaterais',
      'procedimento seguro',
      'aprovado pela ANVISA', // Only ANVISA can make this claim
      'dispositivo médico registrado',
    ];

    for (const claim of prohibitedClaims) {
      const regex = new RegExp(`\\b${claim}\\b`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        violations.push({
          id: this.generateViolationId(),
          type: 'anvisa_prohibited_claim',
          severity: ViolationSeverity.CRITICAL,
          description: `Prohibited medical or therapeutic claim detected`,
          location: 'response',
          extractedText: matches.join(', '),
          recommendation: 'Remove absolute claims about treatment efficacy and safety',
          regulatoryReference: 'RDC ANVISA nº 96/2008',
        });
      }
    }

    return violations;
  }

  /**
   * Check CFM (Federal Medical Council) compliance
   */
  private checkCFMCompliance(content: string, context: HealthcareContext): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for medical advice without proper qualification
    if (context.patientInteraction) {
      const medicalAdviceTerms = [
        'você deve',
        'recomendo que',
        'faça',
        'tome',
        'use este medicamento',
        'procure este tratamento',
      ];

      for (const term of medicalAdviceTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          violations.push({
            id: this.generateViolationId(),
            type: 'cfm_medical_advice',
            severity: ViolationSeverity.HIGH,
            description: `Medical advice without proper qualification detected`,
            location: 'response',
            extractedText: matches.join(', '),
            recommendation: 'Avoid giving direct medical advice; recommend consultation with qualified professionals',
            regulatoryReference: 'CFM Resolution 1974/2011',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Calculate compliance score for a framework
   */
  private calculateFrameworkScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) {
      return 100;
    }

    // Deduct points based on violation severity
    let deductions = 0;
    for (const violation of violations) {
      switch (violation.severity) {
        case ViolationSeverity.LOW:
          deductions += 5;
          break;
        case ViolationSeverity.MEDIUM:
          deductions += 15;
          break;
        case ViolationSeverity.HIGH:
          deductions += 30;
          break;
        case ViolationSeverity.CRITICAL:
          deductions += 50;
          break;
      }
    }

    return Math.max(0, 100 - deductions);
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(results: ComplianceCheckResult[]): number {
    if (results.length === 0) {
      return 100;
    }

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  /**
   * Create audit log
   */
  private createAuditLog(data: {
    originalContent: string;
    sanitizedContent: string;
    complianceResults: ComplianceCheckResult[];
    context: HealthcareContext;
    provider: string;
    metadata?: any;
    processingTime: number;
  }): ComplianceAuditLog {
    const auditLog: ComplianceAuditLog = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      provider: data.provider,
      action: 'ai_interaction',
      context: data.context,
      input: {
        prompt: this.truncateForLogging(data.originalContent),
        options: data.metadata,
      },
      output: {
        response: this.truncateForLogging(data.sanitizedContent),
        sanitized: data.originalContent !== data.sanitizedContent,
        violations: data.complianceResults.flatMap(r => r.violations),
      },
      compliance: {
        frameworks: data.complianceResults.map(r => r.framework),
        score: this.calculateOverallScore(data.complianceResults),
        passed: data.complianceResults.every(r => r.isCompliant),
      },
      metadata: {
        processingTime: data.processingTime,
        tokensUsed: data.metadata?.tokensUsed || 0,
        cost: data.metadata?.cost,
      },
    };

    // Store audit log
    this.auditLogs.push(auditLog);
    
    // Cleanup old logs
    this.cleanupAuditLogs();

    // Emit audit event
    this.emit('auditLog', auditLog);

    return auditLog;
  }

  /**
   * Truncate content for logging
   */
  private truncateForLogging(content: string): string {
    const maxLength = this.config.audit.includeContent ? 500 : 100;
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }

  /**
   * Cleanup old audit logs
   */
  private cleanupAuditLogs(): void {
    const cutoffDate = new Date(Date.now() - this.config.audit.retentionDays * 24 * 60 * 60 * 1000);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
  }

  /**
   * Generate violation ID
   */
  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats(): {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    averageScore: number;
    violationsByType: Record<string, number>;
    violationsByFramework: Record<string, number>;
  } {
    const recentLogs = this.auditLogs.filter(log => 
      Date.now() - log.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const totalChecks = recentLogs.length;
    const passedChecks = recentLogs.filter(log => log.compliance.passed).length;
    const failedChecks = totalChecks - passedChecks;
    
    const averageScore = totalChecks > 0 
      ? recentLogs.reduce((sum, log) => sum + log.compliance.score, 0) / totalChecks 
      : 0;

    const violationsByType: Record<string, number> = {};
    const violationsByFramework: Record<string, number> = {};

    recentLogs.forEach(log => {
      log.output.violations?.forEach(violation => {
        violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
      });
    });

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      averageScore: Math.round(averageScore),
      violationsByType,
      violationsByFramework,
    };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(options?: {
    startDate?: Date;
    endDate?: Date;
    provider?: string;
    framework?: BrazilianRegulatoryFramework;
  }): ComplianceAuditLog[] {
    let filteredLogs = [...this.auditLogs];

    if (options?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endDate!);
    }

    if (options?.provider) {
      filteredLogs = filteredLogs.filter(log => log.provider === options.provider);
    }

    if (options?.framework) {
      filteredLogs = filteredLogs.filter(log => 
        log.compliance.frameworks.includes(options.framework!)
      );
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HealthcareComplianceServiceConfig>): void {
    this.config = this.mergeConfig(config);
    
    // Reinitialize PII patterns if they changed
    if (config.piiRedaction?.customPatterns) {
      this.initializePIIPatterns();
    }
    
    logger.info('Healthcare compliance service configuration updated', { config: this.config });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.auditLogs = [];
    this.piiPatterns.clear();
    this.removeAllListeners();
    HealthcareComplianceService.instance = null as any;
  }
}