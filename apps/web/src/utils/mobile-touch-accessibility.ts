/**
 * Mobile Touch Accessibility Utilities
 * T083 - Mobile Accessibility Optimization
 *
 * Features:
 * - Touch target size validation (WCAG 2.1 AA+ compliance)
 * - Touch target spacing and overlap detection
 * - Gesture alternatives for complex interactions
 * - Touch feedback optimization for motor disabilities
 * - Healthcare-specific touch patterns
 * - Brazilian Portuguese accessibility labels
 */

import { z } from 'zod';

// WCAG 2.1 AA+ Touch Target Requirements
export const WCAG_TOUCH_TARGETS = {
  MINIMUM_SIZE: 44, // 44x44px minimum
  RECOMMENDED_SIZE: 48, // 48x48px recommended
  MINIMUM_SPACING: 8, // 8px minimum spacing between targets
  RECOMMENDED_SPACING: 16, // 16px recommended spacing
} as const;

// Mobile Breakpoints for Healthcare Applications
export const MOBILE_BREAKPOINTS = {
  SMALL_MOBILE: 320, // iPhone SE, small Android phones
  MOBILE: 375, // iPhone 12/13/14 standard
  LARGE_MOBILE: 414, // iPhone 12/13/14 Plus
  TABLET: 768, // iPad mini, small tablets
} as const;

// Touch Accessibility Levels
export const TOUCH_ACCESSIBILITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
  POOR: 'poor',
  CRITICAL: 'critical',
} as const;

export type TouchAccessibilityLevel =
  (typeof TOUCH_ACCESSIBILITY_LEVELS)[keyof typeof TOUCH_ACCESSIBILITY_LEVELS];

// Healthcare Touch Patterns
export const HEALTHCARE_TOUCH_PATTERNS = {
  PATIENT_DATA_ENTRY: 'patient_data_entry',
  APPOINTMENT_BOOKING: 'appointment_booking',
  MEDICATION_REMINDER: 'medication_reminder',
  EMERGENCY_CONTACT: 'emergency_contact',
  VITAL_SIGNS_INPUT: 'vital_signs_input',
  MEDICAL_RECORD_VIEW: 'medical_record_view',
} as const;

export type HealthcareTouchPattern =
  (typeof HEALTHCARE_TOUCH_PATTERNS)[keyof typeof HEALTHCARE_TOUCH_PATTERNS];

// Touch Target Schema
export const TouchTargetSchema = z.object({
  id: z.string(),
  element: z.string(), // CSS selector or element type
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  isInteractive: z.boolean(),
  touchPattern: z.nativeEnum(HEALTHCARE_TOUCH_PATTERNS).optional(),
  ariaLabel: z.string().optional(),
  role: z.string().optional(),
});

export type TouchTarget = z.infer<typeof TouchTargetSchema>;

// Touch Accessibility Issue
export interface TouchAccessibilityIssue {
  id: string;
  type: 'size' | 'spacing' | 'overlap' | 'gesture' | 'feedback';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  affectedElements: string[];
  wcagReference: string;
  healthcareImpact: string;
  remediation: {
    steps: string[];
    timeframe: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  detectedAt: Date;
}

// Touch Accessibility Report
export interface TouchAccessibilityReport {
  overallLevel: TouchAccessibilityLevel;
  score: number; // 0-100
  lastAuditDate: Date;
  touchTargetCompliance: {
    level: TouchAccessibilityLevel;
    totalTargets: number;
    compliantTargets: number;
    undersizedTargets: number;
    overlappingTargets: number;
    issues: TouchAccessibilityIssue[];
  };
  gestureAccessibility: {
    level: TouchAccessibilityLevel;
    complexGestures: number;
    alternativesProvided: number;
    issues: TouchAccessibilityIssue[];
  };
  touchFeedback: {
    level: TouchAccessibilityLevel;
    feedbackEnabled: boolean;
    hapticSupport: boolean;
    visualFeedback: boolean;
    issues: TouchAccessibilityIssue[];
  };
  healthcarePatterns: {
    level: TouchAccessibilityLevel;
    implementedPatterns: HealthcareTouchPattern[];
    missingPatterns: HealthcareTouchPattern[];
    issues: TouchAccessibilityIssue[];
  };
  recommendations: string[];
}

// Brazilian Portuguese Touch Accessibility Labels
export const TOUCH_ACCESSIBILITY_LABELS_PT_BR = {
  touchTarget: 'Área de toque',
  minimumSize: 'Tamanho mínimo',
  recommendedSize: 'Tamanho recomendado',
  touchSpacing: 'Espaçamento de toque',
  gestureAlternative: 'Alternativa de gesto',
  touchFeedback: 'Feedback de toque',
  hapticFeedback: 'Feedback háptico',
  visualFeedback: 'Feedback visual',
  emergencyAccess: 'Acesso de emergência',
  patientDataEntry: 'Entrada de dados do paciente',
  appointmentBooking: 'Agendamento de consulta',
  medicationReminder: 'Lembrete de medicação',
  vitalSignsInput: 'Entrada de sinais vitais',
  medicalRecordView: 'Visualização de prontuário',
} as const;

/**
 * Mobile Touch Accessibility Utilities
 */
export class MobileTouchAccessibility {
  private issues: TouchAccessibilityIssue[] = [];

  /**
   * Validate touch target accessibility
   */
  validateTouchTargets(
    targets: TouchTarget[],
  ): TouchAccessibilityReport['touchTargetCompliance'] {
    this.issues = [];

    const totalTargets = targets.length;
    let compliantTargets = 0;
    let undersizedTargets = 0;
    let overlappingTargets = 0;
    const issues: TouchAccessibilityIssue[] = [];

    // Validate each touch target
    targets.forEach(target => {
      const isCompliant = this.validateSingleTouchTarget(target);
      if (isCompliant) {
        compliantTargets++;
      } else {
        undersizedTargets++;
      }
    });

    // Check for overlapping targets
    const overlaps = this.detectOverlappingTargets(targets);
    overlappingTargets = overlaps.length;

    // Generate issues for undersized targets
    if (undersizedTargets > 0) {
      issues.push({
        id: 'undersized-touch-targets',
        type: 'size',
        severity: 'high',
        title: 'Áreas de toque muito pequenas',
        description: `${undersizedTargets} áreas de toque não atendem ao tamanho mínimo de 44x44px`,
        recommendation: 'Aumentar o tamanho das áreas de toque para pelo menos 44x44px',
        affectedElements: targets
          .filter(t => !this.validateSingleTouchTarget(t))
          .map(t => t.element),
        wcagReference: 'WCAG 2.1 AA - Critério 2.5.5 (Tamanho do Alvo)',
        healthcareImpact:
          'Dificulta o acesso a funcionalidades médicas críticas para pacientes com deficiências motoras',
        remediation: {
          steps: [
            'Identificar elementos com área de toque menor que 44x44px',
            'Aumentar padding ou dimensões dos elementos',
            'Testar com usuários com deficiências motoras',
            'Validar em dispositivos móveis reais',
          ],
          timeframe: '1-2 semanas',
          difficulty: 'easy',
        },
        detectedAt: new Date(),
      });
    }

    // Generate issues for overlapping targets
    if (overlappingTargets > 0) {
      issues.push({
        id: 'overlapping-touch-targets',
        type: 'overlap',
        severity: 'medium',
        title: 'Áreas de toque sobrepostas',
        description: `${overlappingTargets} pares de áreas de toque estão sobrepostas`,
        recommendation: 'Adicionar espaçamento mínimo de 8px entre áreas de toque',
        affectedElements: overlaps.map(
          o => `${o.target1.element} + ${o.target2.element}`,
        ),
        wcagReference: 'WCAG 2.1 AA - Critério 2.5.5 (Tamanho do Alvo)',
        healthcareImpact: 'Pode causar ativação acidental de funcionalidades médicas',
        remediation: {
          steps: [
            'Identificar elementos sobrepostos',
            'Adicionar espaçamento entre elementos',
            'Reorganizar layout se necessário',
            'Testar interações de toque',
          ],
          timeframe: '1 semana',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const level = this.calculateTouchTargetLevel(
      compliantTargets,
      totalTargets,
      overlappingTargets,
    );

    return {
      level,
      totalTargets,
      compliantTargets,
      undersizedTargets,
      overlappingTargets,
      issues,
    };
  }

  /**
   * Validate gesture accessibility
   */
  validateGestureAccessibility(): TouchAccessibilityReport['gestureAccessibility'] {
    // Mock implementation - would analyze actual gestures in real app
    const complexGestures = 3; // Swipe, pinch, long press
    const alternativesProvided = 2; // Only 2 out of 3 have alternatives
    const issues: TouchAccessibilityIssue[] = [];

    if (alternativesProvided < complexGestures) {
      issues.push({
        id: 'missing-gesture-alternatives',
        type: 'gesture',
        severity: 'high',
        title: 'Alternativas de gesto ausentes',
        description: 'Nem todos os gestos complexos possuem alternativas acessíveis',
        recommendation: 'Fornecer alternativas de botão para todos os gestos complexos',
        affectedElements: ['swipe-navigation', 'pinch-zoom'],
        wcagReference: 'WCAG 2.1 AA - Critério 2.5.1 (Gestos de Ponteiro)',
        healthcareImpact:
          'Impede acesso a funcionalidades médicas para usuários com limitações motoras',
        remediation: {
          steps: [
            'Identificar gestos complexos sem alternativas',
            'Implementar botões alternativos',
            'Adicionar instruções de uso',
            'Testar com tecnologias assistivas',
          ],
          timeframe: '2-3 semanas',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const level: TouchAccessibilityLevel = alternativesProvided >= complexGestures
      ? TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT
      : alternativesProvided >= Math.floor(complexGestures * 0.8)
      ? TOUCH_ACCESSIBILITY_LEVELS.GOOD
      : TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE;

    return {
      level,
      complexGestures,
      alternativesProvided,
      issues,
    };
  }

  /**
   * Validate touch feedback accessibility
   */
  validateTouchFeedback(): TouchAccessibilityReport['touchFeedback'] {
    // Mock implementation - would check actual feedback implementation
    const feedbackEnabled = true;
    const hapticSupport = false; // Intentionally set to false for testing
    const visualFeedback = true;
    const issues: TouchAccessibilityIssue[] = [];

    if (!hapticSupport) {
      issues.push({
        id: 'missing-haptic-feedback',
        type: 'feedback',
        severity: 'medium',
        title: 'Feedback háptico ausente',
        description: 'Sistema não fornece feedback háptico para interações de toque',
        recommendation: 'Implementar feedback háptico para ações importantes',
        affectedElements: ['buttons', 'form-inputs', 'navigation'],
        wcagReference: 'WCAG 2.1 AA - Critério 3.3.1 (Identificação de Erro)',
        healthcareImpact: 'Reduz confirmação de ações para usuários com deficiências visuais',
        remediation: {
          steps: [
            'Implementar API de vibração do navegador',
            'Adicionar feedback háptico para ações críticas',
            'Permitir configuração pelo usuário',
            'Testar em dispositivos móveis',
          ],
          timeframe: '1 semana',
          difficulty: 'easy',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const level = feedbackEnabled && hapticSupport && visualFeedback
      ? TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT
      : feedbackEnabled && visualFeedback
      ? TOUCH_ACCESSIBILITY_LEVELS.GOOD
      : TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE;

    return {
      level,
      feedbackEnabled,
      hapticSupport,
      visualFeedback,
      issues,
    };
  }

  /**
   * Validate healthcare-specific touch patterns
   */
  validateHealthcarePatterns(): TouchAccessibilityReport['healthcarePatterns'] {
    // Mock implementation - would check actual healthcare patterns
    const implementedPatterns: HealthcareTouchPattern[] = [
      HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY,
      HEALTHCARE_TOUCH_PATTERNS.APPOINTMENT_BOOKING,
      HEALTHCARE_TOUCH_PATTERNS.MEDICAL_RECORD_VIEW,
    ];

    const missingPatterns: HealthcareTouchPattern[] = [
      HEALTHCARE_TOUCH_PATTERNS.MEDICATION_REMINDER,
      HEALTHCARE_TOUCH_PATTERNS.EMERGENCY_CONTACT,
      HEALTHCARE_TOUCH_PATTERNS.VITAL_SIGNS_INPUT,
    ];

    const issues: TouchAccessibilityIssue[] = [];

    if (missingPatterns.length > 0) {
      issues.push({
        id: 'missing-healthcare-patterns',
        type: 'gesture',
        severity: 'medium',
        title: 'Padrões de toque para saúde ausentes',
        description:
          `${missingPatterns.length} padrões de toque específicos para saúde não implementados`,
        recommendation: 'Implementar padrões de toque otimizados para aplicações de saúde',
        affectedElements: missingPatterns,
        wcagReference: 'WCAG 2.1 AA - Critério 2.5.5 (Tamanho do Alvo)',
        healthcareImpact: 'Reduz eficiência e acessibilidade para profissionais e pacientes',
        remediation: {
          steps: [
            'Implementar padrões de toque para medicação',
            'Adicionar acesso rápido para emergências',
            'Otimizar entrada de sinais vitais',
            'Testar com profissionais de saúde',
          ],
          timeframe: '3-4 semanas',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const level = missingPatterns.length === 0
      ? TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT
      : missingPatterns.length <= 2
      ? TOUCH_ACCESSIBILITY_LEVELS.GOOD
      : TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE;

    return {
      level,
      implementedPatterns,
      missingPatterns,
      issues,
    };
  }

  /**
   * Generate comprehensive touch accessibility report
   */
  generateReport(targets: TouchTarget[]): TouchAccessibilityReport {
    this.issues = [];

    const touchTargetCompliance = this.validateTouchTargets(targets);
    const gestureAccessibility = this.validateGestureAccessibility();
    const touchFeedback = this.validateTouchFeedback();
    const healthcarePatterns = this.validateHealthcarePatterns();

    const overallLevel = this.calculateOverallLevel([
      touchTargetCompliance.level,
      gestureAccessibility.level,
      touchFeedback.level,
      healthcarePatterns.level,
    ]);

    const score = this.calculateOverallScore();
    const recommendations = this.generateRecommendations();

    return {
      overallLevel,
      score,
      lastAuditDate: new Date(),
      touchTargetCompliance,
      gestureAccessibility,
      touchFeedback,
      healthcarePatterns,
      recommendations,
    };
  }

  /**
   * Validate single touch target
   */
  private validateSingleTouchTarget(target: TouchTarget): boolean {
    return (
      target.width >= WCAG_TOUCH_TARGETS.MINIMUM_SIZE
      && target.height >= WCAG_TOUCH_TARGETS.MINIMUM_SIZE
    );
  }

  /**
   * Detect overlapping touch targets
   */
  private detectOverlappingTargets(
    targets: TouchTarget[],
  ): Array<{ target1: TouchTarget; target2: TouchTarget }> {
    const overlaps = [];

    for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        const target1 = targets[i];
        const target2 = targets[j];

        if (this.targetsOverlap(target1, target2)) {
          overlaps.push({ target1, target2 });
        }
      }
    }

    return overlaps;
  }

  /**
   * Check if two targets overlap
   */
  private targetsOverlap(target1: TouchTarget, target2: TouchTarget): boolean {
    const spacing = WCAG_TOUCH_TARGETS.MINIMUM_SPACING;

    return !(
      target1.x + target1.width + spacing <= target2.x
      || target2.x + target2.width + spacing <= target1.x
      || target1.y + target1.height + spacing <= target2.y
      || target2.y + target2.height + spacing <= target1.y
    );
  }

  /**
   * Calculate touch target compliance level
   */
  private calculateTouchTargetLevel(
    compliant: number,
    total: number,
    overlapping: number,
  ): TouchAccessibilityLevel {
    const complianceRate = total > 0 ? compliant / total : 1;
    const hasOverlaps = overlapping > 0;

    if (complianceRate >= 0.95 && !hasOverlaps) {
      return TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT;
    } else if (complianceRate >= 0.9 && overlapping <= 2) {
      return TOUCH_ACCESSIBILITY_LEVELS.GOOD;
    } else if (complianceRate >= 0.8) {
      return TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE;
    } else if (complianceRate >= 0.6) {
      return TOUCH_ACCESSIBILITY_LEVELS.POOR;
    } else {
      return TOUCH_ACCESSIBILITY_LEVELS.CRITICAL;
    }
  }

  /**
   * Calculate overall accessibility level
   */
  private calculateOverallLevel(
    levels: TouchAccessibilityLevel[],
  ): TouchAccessibilityLevel {
    const levelScores = {
      [TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT]: 5,
      [TOUCH_ACCESSIBILITY_LEVELS.GOOD]: 4,
      [TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE]: 3,
      [TOUCH_ACCESSIBILITY_LEVELS.POOR]: 2,
      [TOUCH_ACCESSIBILITY_LEVELS.CRITICAL]: 1,
    };

    const averageScore = levels.reduce((sum, level) => sum + levelScores[level], 0)
      / levels.length;

    if (averageScore >= 4.5) return TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT;
    if (averageScore >= 3.5) return TOUCH_ACCESSIBILITY_LEVELS.GOOD;
    if (averageScore >= 2.5) return TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE;
    if (averageScore >= 1.5) return TOUCH_ACCESSIBILITY_LEVELS.POOR;
    return TOUCH_ACCESSIBILITY_LEVELS.CRITICAL;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(): number {
    const criticalIssues = this.issues.filter(
      i => i.severity === 'critical',
    ).length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(
      i => i.severity === 'medium',
    ).length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;

    const penalty = criticalIssues * 25 + highIssues * 15 + mediumIssues * 8 + lowIssues * 3;

    return Math.max(0, 100 - penalty);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const issuesByType = this.issues.reduce(
      (acc, issue) => {
        if (!acc[issue.type]) acc[issue.type] = [];
        acc[issue.type].push(issue);
        return acc;
      },
      {} as Record<string, TouchAccessibilityIssue[]>,
    );

    Object.entries(issuesByType).forEach(([type, issues]) => {
      const criticalCount = issues.filter(
        i => i.severity === 'critical',
      ).length;
      const highCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;

      if (criticalCount > 0) {
        recommendations.push(
          `Resolver urgentemente ${criticalCount} problema(s) crítico(s) de ${type}`,
        );
      }
      if (highCount > 0) {
        recommendations.push(
          `Abordar ${highCount} problema(s) de alta prioridade em ${type}`,
        );
      }
      if (mediumCount > 0) {
        recommendations.push(
          `Resolver ${mediumCount} problema(s) de prioridade média em ${type}`,
        );
      }
    });

    if (this.issues.length === 0) {
      recommendations.push(
        'Manter conformidade com padrões de acessibilidade de toque',
      );
      recommendations.push('Realizar testes regulares com usuários reais');
      recommendations.push('Monitorar feedback de acessibilidade');
    }

    return recommendations;
  }
}

export default MobileTouchAccessibility;
