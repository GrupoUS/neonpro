/**
 * Mobile Touch Accessibility Tests
 * T083 - Mobile Accessibility Optimization
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HEALTHCARE_TOUCH_PATTERNS,
  MOBILE_BREAKPOINTS,
  MobileTouchAccessibility,
  TOUCH_ACCESSIBILITY_LABELS_PT_BR,
  TOUCH_ACCESSIBILITY_LEVELS,
  type TouchAccessibilityReport,
  type TouchTarget,
  TouchTargetSchema,
  WCAG_TOUCH_TARGETS,
} from '../mobile-touch-accessibility';

describe(_'Mobile Touch Accessibility',_() => {
  let mobileTouchAccessibility: MobileTouchAccessibility;

  beforeEach(_() => {
    mobileTouchAccessibility = new MobileTouchAccessibility();
  });

  describe(_'Schema Validation',_() => {
    it(_'should validate touch target schema',_() => {
      const validTouchTarget = {
        id: 'button-1',
        element: 'button.primary',
        width: 48,
        height: 48,
        x: 10,
        y: 10,
        isInteractive: true,
        touchPattern: HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY,
        ariaLabel: 'Salvar dados do paciente',
        _role: 'button',
      };

      const result = TouchTargetSchema.safeParse(validTouchTarget);
      expect(result.success).toBe(true);
    });

    it(_'should reject invalid touch target',_() => {
      const invalidTouchTarget = {
        id: 'button-1',
        // Missing required fields
        width: 'invalid',
        height: 'invalid',
      };

      const result = TouchTargetSchema.safeParse(invalidTouchTarget);
      expect(result.success).toBe(false);
    });
  });

  describe(_'Touch Target Validation',_() => {
    it(_'should validate compliant touch targets',_() => {
      const compliantTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.primary',
          width: 48,
          height: 48,
          x: 10,
          y: 10,
          isInteractive: true,
        },
        {
          id: 'button-2',
          element: 'button.secondary',
          width: 44,
          height: 44,
          x: 70,
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(compliantTargets);

      expect(result.level).toBe(TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT);
      expect(result.totalTargets).toBe(2);
      expect(result.compliantTargets).toBe(2);
      expect(result.undersizedTargets).toBe(0);
      expect(result.overlappingTargets).toBe(0);
      expect(result.issues).toHaveLength(0);
    });

    it(_'should detect undersized touch targets',_() => {
      const undersizedTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.small',
          width: 32, // Below minimum 44px
          height: 32, // Below minimum 44px
          x: 10,
          y: 10,
          isInteractive: true,
        },
        {
          id: 'button-2',
          element: 'button.tiny',
          width: 24, // Below minimum 44px
          height: 24, // Below minimum 44px
          x: 60,
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(undersizedTargets);

      expect(result.level).toBe(TOUCH_ACCESSIBILITY_LEVELS.CRITICAL);
      expect(result.totalTargets).toBe(2);
      expect(result.compliantTargets).toBe(0);
      expect(result.undersizedTargets).toBe(2);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('size');
      expect(result.issues[0].severity).toBe('high');
      expect(result.issues[0].title).toBe('Áreas de toque muito pequenas');
    });

    it(_'should detect overlapping touch targets',_() => {
      const overlappingTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.first',
          width: 44,
          height: 44,
          x: 10,
          y: 10,
          isInteractive: true,
        },
        {
          id: 'button-2',
          element: 'button.second',
          width: 44,
          height: 44,
          x: 50, // Too close, should have 8px minimum spacing
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(overlappingTargets);

      expect(result.overlappingTargets).toBe(1);
      expect(result.issues.some(issue => issue.type === 'overlap')).toBe(
        true,
      );
      expect(
        result.issues.find(issue => issue.type === 'overlap')?.title,
      ).toBe('Áreas de toque sobrepostas');
    });

    it(_'should handle mixed compliance scenarios',_() => {
      const mixedTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.compliant',
          width: 48,
          height: 48,
          x: 10,
          y: 10,
          isInteractive: true,
        },
        {
          id: 'button-2',
          element: 'button.undersized',
          width: 32,
          height: 32,
          x: 80,
          y: 10,
          isInteractive: true,
        },
        {
          id: 'button-3',
          element: 'button.minimum',
          width: 44,
          height: 44,
          x: 130,
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(mixedTargets);

      expect(result.totalTargets).toBe(3);
      expect(result.compliantTargets).toBe(2);
      expect(result.undersizedTargets).toBe(1);
      expect(result.level).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.GOOD,
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        TOUCH_ACCESSIBILITY_LEVELS.POOR,
      ]);
    });
  });

  describe(_'Gesture Accessibility Validation',_() => {
    it(_'should validate gesture accessibility',_() => {
      const result = mobileTouchAccessibility.validateGestureAccessibility();

      expect(result.level).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT,
        TOUCH_ACCESSIBILITY_LEVELS.GOOD,
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
      ]);
      expect(typeof result.complexGestures).toBe('number');
      expect(typeof result.alternativesProvided).toBe('number');
      expect(Array.isArray(result.issues)).toBe(true);

      // Should detect missing gesture alternatives
      if (result.alternativesProvided < result.complexGestures) {
        expect(result.issues.some(issue => issue.type === 'gesture')).toBe(
          true,
        );
        expect(
          result.issues.find(issue => issue.type === 'gesture')?.title,
        ).toBe('Alternativas de gesto ausentes');
      }
    });

    it(_'should provide healthcare-specific gesture recommendations',_() => {
      const result = mobileTouchAccessibility.validateGestureAccessibility();

      result.issues.forEach(_issue => {
        if (issue.type === 'gesture') {
          expect(issue.healthcareImpact).toContain('funcionalidades médicas');
          expect(issue.wcagReference).toContain('WCAG 2.1 AA');
          expect(issue.remediation.steps.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe(_'Touch Feedback Validation',_() => {
    it(_'should validate touch feedback accessibility',_() => {
      const result = mobileTouchAccessibility.validateTouchFeedback();

      expect(result.level).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT,
        TOUCH_ACCESSIBILITY_LEVELS.GOOD,
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
      ]);
      expect(typeof result.feedbackEnabled).toBe('boolean');
      expect(typeof result.hapticSupport).toBe('boolean');
      expect(typeof result.visualFeedback).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it(_'should detect missing haptic feedback',_() => {
      const result = mobileTouchAccessibility.validateTouchFeedback();

      // The mock implementation sets hapticSupport to false
      expect(result.hapticSupport).toBe(false);
      expect(result.issues.some(issue => issue.type === 'feedback')).toBe(
        true,
      );
      expect(
        result.issues.find(issue => issue.type === 'feedback')?.title,
      ).toBe('Feedback háptico ausente');
    });

    it(_'should provide healthcare-specific feedback recommendations',_() => {
      const result = mobileTouchAccessibility.validateTouchFeedback();

      result.issues.forEach(_issue => {
        if (issue.type === 'feedback') {
          expect(issue.healthcareImpact).toContain(
            'usuários com deficiências visuais',
          );
          expect(issue.remediation.difficulty).toBeOneOf([
            'easy',
            'medium',
            'hard',
          ]);
        }
      });
    });
  });

  describe(_'Healthcare Touch Patterns Validation',_() => {
    it(_'should validate healthcare-specific touch patterns',_() => {
      const result = mobileTouchAccessibility.validateHealthcarePatterns();

      expect(result.level).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT,
        TOUCH_ACCESSIBILITY_LEVELS.GOOD,
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
      ]);
      expect(Array.isArray(result.implementedPatterns)).toBe(true);
      expect(Array.isArray(result.missingPatterns)).toBe(true);
      expect(Array.isArray(result.issues)).toBe(true);

      // Should include healthcare-specific patterns
      const allPatterns = [
        ...result.implementedPatterns,
        ...result.missingPatterns,
      ];
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.APPOINTMENT_BOOKING,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.MEDICATION_REMINDER,
      );
    });

    it(_'should detect missing healthcare patterns',_() => {
      const result = mobileTouchAccessibility.validateHealthcarePatterns();

      if (result.missingPatterns.length > 0) {
        expect(result.issues.some(issue => issue.type === 'gesture')).toBe(
          true,
        );
        expect(
          result.issues.find(issue => issue.type === 'gesture')?.title,
        ).toBe('Padrões de toque para saúde ausentes');
      }
    });

    it(_'should validate all healthcare touch pattern types',_() => {
      const result = mobileTouchAccessibility.validateHealthcarePatterns();

      const allPatterns = [
        ...result.implementedPatterns,
        ...result.missingPatterns,
      ];

      // Should include all healthcare patterns
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.APPOINTMENT_BOOKING,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.MEDICATION_REMINDER,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.EMERGENCY_CONTACT,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.VITAL_SIGNS_INPUT,
      );
      expect(allPatterns).toContain(
        HEALTHCARE_TOUCH_PATTERNS.MEDICAL_RECORD_VIEW,
      );
    });
  });

  describe(_'Comprehensive Report Generation',_() => {
    it(_'should generate comprehensive touch accessibility report',_() => {
      const mockTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.primary',
          width: 48,
          height: 48,
          x: 10,
          y: 10,
          isInteractive: true,
          touchPattern: HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY,
        },
        {
          id: 'button-2',
          element: 'button.secondary',
          width: 32, // Undersized
          height: 32,
          x: 80,
          y: 10,
          isInteractive: true,
        },
      ];

      const report = mobileTouchAccessibility.generateReport(mockTargets);

      expect(report.overallLevel).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT,
        TOUCH_ACCESSIBILITY_LEVELS.GOOD,
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        TOUCH_ACCESSIBILITY_LEVELS.POOR,
        TOUCH_ACCESSIBILITY_LEVELS.CRITICAL,
      ]);
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
      expect(report.lastAuditDate).toBeInstanceOf(Date);
      expect(Array.isArray(report.recommendations)).toBe(true);

      // Should include all validation areas
      expect(report.touchTargetCompliance).toBeDefined();
      expect(report.gestureAccessibility).toBeDefined();
      expect(report.touchFeedback).toBeDefined();
      expect(report.healthcarePatterns).toBeDefined();
    });

    it(_'should calculate overall score based on issues',_() => {
      const mockTargets: TouchTarget[] = [
        {
          id: 'button-critical',
          element: 'button.critical',
          width: 20, // Very undersized
          height: 20,
          x: 10,
          y: 10,
          isInteractive: true,
        },
      ];

      const report = mobileTouchAccessibility.generateReport(mockTargets);

      // Should have lower score due to critical issues
      expect(report.score).toBeLessThan(100);
      expect(report.overallLevel).toBeOneOf([
        TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        TOUCH_ACCESSIBILITY_LEVELS.POOR,
        TOUCH_ACCESSIBILITY_LEVELS.CRITICAL,
      ]);
    });

    it(_'should generate actionable recommendations',_() => {
      const mockTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.undersized',
          width: 30,
          height: 30,
          x: 10,
          y: 10,
          isInteractive: true,
        },
      ];

      const report = mobileTouchAccessibility.generateReport(mockTargets);

      expect(report.recommendations.length).toBeGreaterThan(0);

      report.recommendations.forEach(_recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });

      // Should prioritize critical and high severity issues
      const hasHighPriorityRecommendation = report.recommendations.some(
        rec => rec.includes('urgentemente') || rec.includes('alta prioridade'),
      );
      expect(hasHighPriorityRecommendation).toBe(true);
    });
  });

  describe(_'WCAG Compliance',_() => {
    it(_'should enforce WCAG 2.1 AA+ touch target requirements',_() => {
      expect(WCAG_TOUCH_TARGETS.MINIMUM_SIZE).toBe(44);
      expect(WCAG_TOUCH_TARGETS.RECOMMENDED_SIZE).toBe(48);
      expect(WCAG_TOUCH_TARGETS.MINIMUM_SPACING).toBe(8);
      expect(WCAG_TOUCH_TARGETS.RECOMMENDED_SPACING).toBe(16);
    });

    it(_'should reference WCAG guidelines in issues',_() => {
      const undersizedTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.small',
          width: 30,
          height: 30,
          x: 10,
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(undersizedTargets);

      result.issues.forEach(_issue => {
        expect(issue.wcagReference).toContain('WCAG 2.1 AA');
      });
    });
  });

  describe(_'Mobile Breakpoints',_() => {
    it(_'should define healthcare-appropriate mobile breakpoints',_() => {
      expect(MOBILE_BREAKPOINTS.SMALL_MOBILE).toBe(320);
      expect(MOBILE_BREAKPOINTS.MOBILE).toBe(375);
      expect(MOBILE_BREAKPOINTS.LARGE_MOBILE).toBe(414);
      expect(MOBILE_BREAKPOINTS.TABLET).toBe(768);
    });
  });

  describe(_'Brazilian Portuguese Localization',_() => {
    it(_'should provide Brazilian Portuguese accessibility labels',_() => {
      expect(TOUCH_ACCESSIBILITY_LABELS_PT_BR.touchTarget).toBe(
        'Área de toque',
      );
      expect(TOUCH_ACCESSIBILITY_LABELS_PT_BR.minimumSize).toBe(
        'Tamanho mínimo',
      );
      expect(TOUCH_ACCESSIBILITY_LABELS_PT_BR.emergencyAccess).toBe(
        'Acesso de emergência',
      );
      expect(TOUCH_ACCESSIBILITY_LABELS_PT_BR.patientDataEntry).toBe(
        'Entrada de dados do paciente',
      );
      expect(TOUCH_ACCESSIBILITY_LABELS_PT_BR.medicationReminder).toBe(
        'Lembrete de medicação',
      );
    });

    it(_'should use Portuguese in issue descriptions',_() => {
      const undersizedTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.small',
          width: 30,
          height: 30,
          x: 10,
          y: 10,
          isInteractive: true,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(undersizedTargets);

      result.issues.forEach(_issue => {
        expect(issue.title).toMatch(/[áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/); // Contains Portuguese characters
        expect(issue.description).toMatch(/[áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/);
        expect(issue.recommendation).toMatch(/[áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/);
      });
    });
  });

  describe(_'Healthcare-Specific Features',_() => {
    it(_'should include healthcare impact in issues',_() => {
      const mockTargets: TouchTarget[] = [
        {
          id: 'button-1',
          element: 'button.medical',
          width: 30,
          height: 30,
          x: 10,
          y: 10,
          isInteractive: true,
          touchPattern: HEALTHCARE_TOUCH_PATTERNS.EMERGENCY_CONTACT,
        },
      ];

      const result = mobileTouchAccessibility.validateTouchTargets(mockTargets);

      result.issues.forEach(_issue => {
        expect(issue.healthcareImpact).toBeDefined();
        expect(issue.healthcareImpact.length).toBeGreaterThan(0);
      });
    });

    it(_'should validate healthcare touch patterns',_() => {
      const patterns = Object.values(HEALTHCARE_TOUCH_PATTERNS);

      expect(patterns).toContain('patient_data_entry');
      expect(patterns).toContain('appointment_booking');
      expect(patterns).toContain('medication_reminder');
      expect(patterns).toContain('emergency_contact');
      expect(patterns).toContain('vital_signs_input');
      expect(patterns).toContain('medical_record_view');
    });
  });

  describe(_'Constants and Enums',_() => {
    it(_'should have correct touch accessibility levels',_() => {
      expect(TOUCH_ACCESSIBILITY_LEVELS.EXCELLENT).toBe('excellent');
      expect(TOUCH_ACCESSIBILITY_LEVELS.GOOD).toBe('good');
      expect(TOUCH_ACCESSIBILITY_LEVELS.ACCEPTABLE).toBe('acceptable');
      expect(TOUCH_ACCESSIBILITY_LEVELS.POOR).toBe('poor');
      expect(TOUCH_ACCESSIBILITY_LEVELS.CRITICAL).toBe('critical');
    });

    it(_'should have healthcare-specific touch patterns',_() => {
      expect(HEALTHCARE_TOUCH_PATTERNS.PATIENT_DATA_ENTRY).toBe(
        'patient_data_entry',
      );
      expect(HEALTHCARE_TOUCH_PATTERNS.APPOINTMENT_BOOKING).toBe(
        'appointment_booking',
      );
      expect(HEALTHCARE_TOUCH_PATTERNS.MEDICATION_REMINDER).toBe(
        'medication_reminder',
      );
      expect(HEALTHCARE_TOUCH_PATTERNS.EMERGENCY_CONTACT).toBe(
        'emergency_contact',
      );
      expect(HEALTHCARE_TOUCH_PATTERNS.VITAL_SIGNS_INPUT).toBe(
        'vital_signs_input',
      );
      expect(HEALTHCARE_TOUCH_PATTERNS.MEDICAL_RECORD_VIEW).toBe(
        'medical_record_view',
      );
    });
  });
});
