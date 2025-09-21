/**
 * Mobile Accessibility Service
 * T083 - Mobile Accessibility Optimization
 *
 * Main orchestrator for mobile accessibility features:
 * - Mobile touch accessibility validation
 * - Mobile responsive accessibility validation
 * - Mobile screen reader optimization
 * - Mobile keyboard navigation support
 * - Healthcare-specific mobile accessibility patterns
 * - Brazilian Portuguese accessibility compliance
 */

import MobileResponsiveAccessibility, {
  type ResponsiveAccessibilityReport,
  type ResponsiveElement,
} from '../utils/mobile-responsive-accessibility';
import MobileTouchAccessibility, {
  type TouchAccessibilityReport,
  type TouchTarget,
} from '../utils/mobile-touch-accessibility';
import MobileScreenReaderService, {
  type ScreenReaderAccessibilityReport,
  type ScreenReaderElement,
} from './mobile-screen-reader';

// Mobile Accessibility Levels
export const MOBILE_ACCESSIBILITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
  POOR: 'poor',
  CRITICAL: 'critical',
} as const;

export type MobileAccessibilityLevel =
  (typeof MOBILE_ACCESSIBILITY_LEVELS)[keyof typeof MOBILE_ACCESSIBILITY_LEVELS];

// Mobile Accessibility Configuration
export const MobileAccessibilityConfigSchema = z.object({
  organizationName: z.string(),
  organizationType: z.enum([
    'clinic',
    'hospital',
    'telemedicine',
    'health_tech',
  ]),
  targetDevices: z
    .array(z.enum(['phone', 'tablet', 'foldable']))
    .default(['phone', 'tablet']),
  supportedLanguages: z.array(z.string()).default(['pt-BR']),
  wcagLevel: z.enum(['AA', 'AAA']).default('AA'),
  testingEnvironment: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  performanceThresholds: z
    .object({
      maxInteractionDelay: z.number().default(100), // milliseconds
      maxRenderTime: z.number().default(16), // milliseconds (60fps)
      maxMemoryUsage: z.number().default(50), // MB
    })
    .default({}),
  healthcareCompliance: z
    .object({
      lgpdCompliance: z.boolean().default(true),
      anvisaCompliance: z.boolean().default(true),
      cfmCompliance: z.boolean().default(true),
    })
    .default({}),
});

export type MobileAccessibilityConfig = z.infer<
  typeof MobileAccessibilityConfigSchema
>;

// Comprehensive Mobile Accessibility Report
export interface MobileAccessibilityReport {
  overallLevel: MobileAccessibilityLevel;
  overallScore: number; // 0-100
  lastAuditDate: Date;
  nextAuditDate: Date;

  // Individual accessibility reports
  touchAccessibility: TouchAccessibilityReport;
  responsiveAccessibility: ResponsiveAccessibilityReport;
  screenReaderAccessibility: ScreenReaderAccessibilityReport;

  // Mobile performance accessibility
  performanceAccessibility: {
    level: MobileAccessibilityLevel;
    interactionDelay: number; // milliseconds
    renderTime: number; // milliseconds
    memoryUsage: number; // MB
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
    issues: Array<{
      id: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      title: string;
      description: string;
      recommendation: string;
    }>;
  };

  // Healthcare-specific mobile compliance
  healthcareCompliance: {
    level: MobileAccessibilityLevel;
    lgpdMobileCompliance: boolean;
    anvisaMobileCompliance: boolean;
    cfmMobileCompliance: boolean;
    emergencyAccessCompliance: boolean;
    patientDataMobileCompliance: boolean;
    issues: Array<{
      id: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      title: string;
      description: string;
      recommendation: string;
    }>;
  };

  // Consolidated recommendations
  priorityRecommendations: string[];
  allRecommendations: string[];

  // Mobile accessibility summary
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
    compliancePercentage: number;
    estimatedRemediationTime: string;
    estimatedRemediationCost: 'low' | 'medium' | 'high' | 'very_high';
    deviceCompatibility: string[];
    wcagComplianceLevel: 'AA' | 'AAA' | 'partial' | 'non_compliant';
  };

  // Mobile testing recommendations
  testingRecommendations: {
    realDeviceTesting: string[];
    screenReaderTesting: string[];
    keyboardTesting: string[];
    performanceTesting: string[];
    healthcareWorkflowTesting: string[];
  };
}

/**
 * Mobile Accessibility Service
 */
export class MobileAccessibilityService {
  private touchAccessibilityService: MobileTouchAccessibility;
  private responsiveAccessibilityService: MobileResponsiveAccessibility;
  private screenReaderService: MobileScreenReaderService;

  constructor() {
    this.touchAccessibilityService = new MobileTouchAccessibility();
    this.responsiveAccessibilityService = new MobileResponsiveAccessibility();
    this.screenReaderService = new MobileScreenReaderService();
  }

  /**
   * Perform comprehensive mobile accessibility validation
   */
  async validateMobileAccessibility(
    config: MobileAccessibilityConfig,
    touchTargets: TouchTarget[],
    responsiveElements: ResponsiveElement[],
    screenReaderElements: ScreenReaderElement[],
  ): Promise<MobileAccessibilityReport> {
    // Run all accessibility validations in parallel
    const [
      touchAccessibility,
      responsiveAccessibility,
      screenReaderAccessibility,
    ] = await Promise.all([
      Promise.resolve(
        this.touchAccessibilityService.generateReport(touchTargets),
      ),
      Promise.resolve(
        this.responsiveAccessibilityService.generateReport(responsiveElements),
      ),
      Promise.resolve(
        this.screenReaderService.generateReport(screenReaderElements),
      ),
    ]);

    // Validate mobile performance accessibility
    const performanceAccessibility = await this.validatePerformanceAccessibility(config);

    // Validate healthcare-specific mobile compliance
    const healthcareCompliance = await this.validateHealthcareCompliance(config);

    // Calculate overall accessibility
    const overallLevel = this.calculateOverallLevel(
      touchAccessibility,
      responsiveAccessibility,
      screenReaderAccessibility,
      performanceAccessibility,
      healthcareCompliance,
    );

    const overallScore = this.calculateOverallScore(
      touchAccessibility,
      responsiveAccessibility,
      screenReaderAccessibility,
      performanceAccessibility,
      healthcareCompliance,
    );

    // Generate consolidated recommendations
    const { priorityRecommendations, allRecommendations } = this
      .generateConsolidatedRecommendations(
        touchAccessibility,
        responsiveAccessibility,
        screenReaderAccessibility,
        performanceAccessibility,
        healthcareCompliance,
      );

    // Generate mobile accessibility summary
    const summary = this.generateMobileAccessibilitySummary(
      touchAccessibility,
      responsiveAccessibility,
      screenReaderAccessibility,
      performanceAccessibility,
      healthcareCompliance,
      config,
    );

    // Generate testing recommendations
    const testingRecommendations = this.generateTestingRecommendations(config);

    return {
      overallLevel,
      overallScore,
      lastAuditDate: new Date(),
      nextAuditDate: this.calculateNextAuditDate(),
      touchAccessibility,
      responsiveAccessibility,
      screenReaderAccessibility,
      performanceAccessibility,
      healthcareCompliance,
      priorityRecommendations,
      allRecommendations,
      summary,
      testingRecommendations,
    };
  }

  /**
   * Validate mobile performance accessibility
   */
  private async validatePerformanceAccessibility(
    config: MobileAccessibilityConfig,
  ) {
    // Mock implementation - would perform actual performance validation
    const interactionDelay = 85; // milliseconds
    const renderTime = 14; // milliseconds
    const memoryUsage = 42; // MB

    const coreWebVitals = {
      lcp: 2.1, // seconds
      fid: 85, // milliseconds
      cls: 0.08, // score
    };

    const issues: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      recommendation: string;
    }> = [];

    // Check interaction delay
    if (interactionDelay > config.performanceThresholds.maxInteractionDelay) {
      issues.push({
        id: 'high-interaction-delay',
        severity: 'medium' as const,
        title: 'Atraso de interação elevado',
        description:
          `Atraso de interação de ${interactionDelay}ms excede o limite de ${config.performanceThresholds.maxInteractionDelay}ms`,
        recommendation: 'Otimizar manipuladores de eventos e reduzir processamento JavaScript',
      });
    }

    // Check Core Web Vitals
    if (coreWebVitals.fid > 100) {
      issues.push({
        id: 'poor-fid',
        severity: 'high' as const,
        title: 'First Input Delay elevado',
        description: `FID de ${coreWebVitals.fid}ms impacta acessibilidade móvel`,
        recommendation: 'Reduzir JavaScript de bloqueio e otimizar tempo de resposta',
      });
    }

    const level: MobileAccessibilityLevel = issues.some(
        (i: { severity: 'low' | 'medium' | 'high' | 'critical' }) => i.severity === 'critical',
      )
      ? MOBILE_ACCESSIBILITY_LEVELS.CRITICAL
      : issues.some(
          (i: { severity: 'low' | 'medium' | 'high' | 'critical' }) => i.severity === 'high',
        )
      ? MOBILE_ACCESSIBILITY_LEVELS.POOR
      : issues.length > 0
      ? MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE
      : MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT;

    return {
      level,
      interactionDelay,
      renderTime,
      memoryUsage,
      coreWebVitals,
      issues,
    };
  }

  /**
   * Validate healthcare-specific mobile compliance
   */
  private async validateHealthcareCompliance(
    config: MobileAccessibilityConfig,
  ) {
    // Mock implementation - would perform actual healthcare compliance validation
    const lgpdMobileCompliance = config.healthcareCompliance.lgpdCompliance;
    const anvisaMobileCompliance = config.healthcareCompliance.anvisaCompliance;
    const cfmMobileCompliance = config.healthcareCompliance.cfmCompliance;
    const emergencyAccessCompliance = true;
    const patientDataMobileCompliance = false; // Intentionally set to false for testing

    const issues: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      recommendation: string;
    }> = [] as any;

    if (!patientDataMobileCompliance) {
      issues.push({
        id: 'patient-data-mobile-non-compliant',
        severity: 'high' as const,
        title: 'Dados do paciente não otimizados para mobile',
        description:
          'Visualização de dados do paciente não está otimizada para dispositivos móveis',
        recommendation: 'Implementar padrões de design responsivo para dados médicos sensíveis',
      });
    }

    const complianceCount = [
      lgpdMobileCompliance,
      anvisaMobileCompliance,
      cfmMobileCompliance,
      emergencyAccessCompliance,
      patientDataMobileCompliance,
    ].filter(Boolean).length;

    const level = complianceCount >= 5
      ? MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT
      : complianceCount >= 4
      ? MOBILE_ACCESSIBILITY_LEVELS.GOOD
      : complianceCount >= 3
      ? MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE
      : MOBILE_ACCESSIBILITY_LEVELS.POOR;

    return {
      level,
      lgpdMobileCompliance,
      anvisaMobileCompliance,
      cfmMobileCompliance,
      emergencyAccessCompliance,
      patientDataMobileCompliance,
      issues,
    };
  }

  /**
   * Calculate overall accessibility level
   */
  private calculateOverallLevel(
    touch: TouchAccessibilityReport,
    responsive: ResponsiveAccessibilityReport,
    screenReader: ScreenReaderAccessibilityReport,
    performance: any,
    healthcare: any,
  ): MobileAccessibilityLevel {
    const levels = [
      touch.overallLevel,
      responsive.overallLevel,
      screenReader.overallLevel,
      performance.level,
      healthcare.level,
    ];

    const levelScores = {
      [MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT]: 5,
      [MOBILE_ACCESSIBILITY_LEVELS.GOOD]: 4,
      [MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE]: 3,
      [MOBILE_ACCESSIBILITY_LEVELS.POOR]: 2,
      [MOBILE_ACCESSIBILITY_LEVELS.CRITICAL]: 1,
    };

    const averageScore = levels.reduce(_(sum,_level) => sum + levelScores[level as keyof typeof levelScores],
      0,
    ) / levels.length;

    if (averageScore >= 4.5) return MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT;
    if (averageScore >= 3.5) return MOBILE_ACCESSIBILITY_LEVELS.GOOD;
    if (averageScore >= 2.5) return MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE;
    if (averageScore >= 1.5) return MOBILE_ACCESSIBILITY_LEVELS.POOR;
    return MOBILE_ACCESSIBILITY_LEVELS.CRITICAL;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    touch: TouchAccessibilityReport,
    responsive: ResponsiveAccessibilityReport,
    screenReader: ScreenReaderAccessibilityReport,
    performance: any,
    healthcare: any,
  ): number {
    // Weighted average: Touch (25%), Responsive (25%), Screen Reader (25%), Performance (15%), Healthcare (10%)
    return Math.round(
      touch.score * 0.25
        + responsive.score * 0.25
        + screenReader.score * 0.25
        + (performance.level === MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT
            ? 100
            : performance.level === MOBILE_ACCESSIBILITY_LEVELS.GOOD
            ? 85
            : performance.level === MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE
            ? 70
            : performance.level === MOBILE_ACCESSIBILITY_LEVELS.POOR
            ? 50
            : 25)
          * 0.15
        + (healthcare.level === MOBILE_ACCESSIBILITY_LEVELS.EXCELLENT
            ? 100
            : healthcare.level === MOBILE_ACCESSIBILITY_LEVELS.GOOD
            ? 85
            : healthcare.level === MOBILE_ACCESSIBILITY_LEVELS.ACCEPTABLE
            ? 70
            : healthcare.level === MOBILE_ACCESSIBILITY_LEVELS.POOR
            ? 50
            : 25)
          * 0.1,
    );
  }

  /**
   * Generate consolidated recommendations
   */
  private generateConsolidatedRecommendations(
    touch: TouchAccessibilityReport,
    responsive: ResponsiveAccessibilityReport,
    screenReader: ScreenReaderAccessibilityReport,
    performance: any,
    healthcare: any,
  ) {
    const allRecommendations = [
      ...touch.recommendations,
      ...responsive.recommendations,
      ...screenReader.recommendations,
    ];

    // Priority recommendations (critical and high severity issues)
    const priorityRecommendations = allRecommendations.filter(
      rec =>
        rec.includes('urgentemente')
        || rec.includes('crítico')
        || rec.includes('alta prioridade'),
    );

    return { priorityRecommendations, allRecommendations };
  }

  /**
   * Generate mobile accessibility summary
   */
  private generateMobileAccessibilitySummary(
    touch: TouchAccessibilityReport,
    responsive: ResponsiveAccessibilityReport,
    screenReader: ScreenReaderAccessibilityReport,
    performance: any,
    healthcare: any,
    config: MobileAccessibilityConfig,
  ) {
    const allIssues = [
      ...this.extractIssuesFromReport(touch),
      ...this.extractIssuesFromReport(responsive),
      ...this.extractIssuesFromReport(screenReader),
      ...performance.issues,
      ...healthcare.issues,
    ];

    const totalIssues = allIssues.length;
    const criticalIssues = allIssues.filter(
      i => i.severity === 'critical',
    ).length;
    const highPriorityIssues = allIssues.filter(
      i => i.severity === 'high',
    ).length;
    const mediumPriorityIssues = allIssues.filter(
      i => i.severity === 'medium',
    ).length;
    const lowPriorityIssues = allIssues.filter(
      i => i.severity === 'low',
    ).length;

    const compliancePercentage = Math.round(
      (touch.score + responsive.score + screenReader.score) / 3,
    );

    const estimatedRemediationTime = criticalIssues > 0
      ? '2-4 semanas'
      : highPriorityIssues > 0
      ? '3-6 semanas'
      : mediumPriorityIssues > 0
      ? '4-8 semanas'
      : '1-2 semanas';

    const estimatedRemediationCost = criticalIssues > 0
      ? 'very_high'
      : highPriorityIssues > 0
      ? 'high'
      : mediumPriorityIssues > 0
      ? 'medium'
      : 'low';

    const wcagComplianceLevel = compliancePercentage >= 95
      ? 'AAA'
      : compliancePercentage >= 85
      ? 'AA'
      : compliancePercentage >= 70
      ? 'partial'
      : 'non_compliant';

    return {
      totalIssues,
      criticalIssues,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues,
      compliancePercentage,
      estimatedRemediationTime,
      estimatedRemediationCost: estimatedRemediationCost as
        | 'low'
        | 'medium'
        | 'high'
        | 'very_high',
      deviceCompatibility: config.targetDevices,
      wcagComplianceLevel: wcagComplianceLevel as
        | 'AA'
        | 'AAA'
        | 'partial'
        | 'non_compliant',
    };
  }

  /**
   * Generate testing recommendations
   */
  private generateTestingRecommendations(config: MobileAccessibilityConfig) {
    return {
      realDeviceTesting: [
        'Testar em iPhone (iOS 15+) com VoiceOver',
        'Testar em Android (API 28+) com TalkBack',
        'Testar em tablets iPad e Android',
        'Testar com teclados Bluetooth externos',
      ],
      screenReaderTesting: [
        'VoiceOver no iOS (português brasileiro)',
        'TalkBack no Android (português brasileiro)',
        'Testar navegação por cabeçalhos',
        'Testar navegação por marcos',
      ],
      keyboardTesting: [
        'Navegação por Tab em teclados externos',
        'Atalhos de teclado para emergência',
        'Foco visível em todos os elementos',
        'Escape para cancelar operações',
      ],
      performanceTesting: [
        'Core Web Vitals em dispositivos móveis',
        'Tempo de resposta de interações',
        'Uso de memória durante navegação',
        'Performance com recursos de acessibilidade ativos',
      ],
      healthcareWorkflowTesting: [
        'Fluxo de agendamento de consultas',
        'Visualização de dados do paciente',
        'Acesso rápido a informações de emergência',
        'Entrada de dados médicos em dispositivos móveis',
      ],
    };
  }

  /**
   * Calculate next audit date
   */
  private calculateNextAuditDate(): Date {
    const _now = new Date();
    return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }

  /**
   * Extract issues from accessibility reports
   */
  private extractIssuesFromReport(
    report: any,
  ): Array<{ severity: 'low' | 'medium' | 'high' | 'critical' }> {
    const issues: Array<{ severity: 'low' | 'medium' | 'high' | 'critical' }> = [];

    // Extract issues from different accessibility areas
    Object.values(report).forEach((_value: any) => {
      if (value && typeof value === 'object' && Array.isArray(value.issues)) {
        issues.push(...value.issues);
      }
    });

    return issues;
  }
}

export default MobileAccessibilityService;
