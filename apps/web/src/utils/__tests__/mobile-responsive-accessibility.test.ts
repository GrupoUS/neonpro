/**
 * Mobile Responsive Accessibility Tests
 * T083 - Mobile Accessibility Optimization
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTRAST_REQUIREMENTS,
  HEALTHCARE_RESPONSIVE_PATTERNS,
  MobileResponsiveAccessibility,
  RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR,
  RESPONSIVE_ACCESSIBILITY_LEVELS,
  RESPONSIVE_BREAKPOINTS,
  type ResponsiveAccessibilityReport,
  type ResponsiveElement,
  ResponsiveElementSchema,
  TEXT_SCALING_REQUIREMENTS,
} from '../mobile-responsive-accessibility';

describe(('Mobile Responsive Accessibility', () => {
  let mobileResponsiveAccessibility: MobileResponsiveAccessibility;

  beforeEach(() => {
    mobileResponsiveAccessibility = new MobileResponsiveAccessibility(
  }

  describe(('Schema Validation', () => {
    it(('should validate responsive element schema', () => {
      const validElement = {
        id: 'patient-card-1',
        selector: '.patient-card',
        breakpoint: 375,
        width: 350,
        height: 200,
        fontSize: 16,
        lineHeight: 1.5,
        contrast: 4.8,
        isVisible: true,
        isAccessible: true,
        pattern: HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD,
        textContent: 'Dados do paciente João Silva',
        _role: 'article',
      };

      const result = ResponsiveElementSchema.safeParse(validElement
      expect(result.success).toBe(true);
    }

    it(('should reject invalid responsive element', () => {
      const invalidElement = {
        id: 'invalid',
        // Missing required fields
        width: 'invalid',
        height: 'invalid',
        fontSize: 'invalid',
      };

      const result = ResponsiveElementSchema.safeParse(invalidElement
      expect(result.success).toBe(false);
    }
  }

  describe(('Breakpoint Compliance Validation', () => {
    it(('should validate compliant breakpoints', () => {
      const compliantElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.compliant-element',
          breakpoint: RESPONSIVE_BREAKPOINTS.SMALL_MOBILE,
          width: 300,
          height: 100,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 4.8,
          isVisible: true,
          isAccessible: true,
        },
        {
          id: 'element-2',
          selector: '.another-compliant',
          breakpoint: RESPONSIVE_BREAKPOINTS.MOBILE,
          width: 350,
          height: 120,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 5.2,
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateBreakpointCompliance(
        compliantElements,
      

      expect(result.level).toBe(RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT
      expect(result.testedBreakpoints).toHaveLength(4); // Excludes desktop
      expect(result.compliantBreakpoints.length).toBeGreaterThan(0
      expect(result.issues).toHaveLength(0
    }

    it(('should detect non-compliant breakpoints', () => {
      const nonCompliantElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.non-compliant',
          breakpoint: RESPONSIVE_BREAKPOINTS.SMALL_MOBILE,
          width: 300,
          height: 100,
          fontSize: 12, // Below minimum
          lineHeight: 1.2, // Below minimum
          contrast: 3.0, // Below AA standard
          isVisible: true,
          isAccessible: false, // Not accessible
        },
        {
          id: 'element-2',
          selector: '.another-non-compliant',
          breakpoint: RESPONSIVE_BREAKPOINTS.SMALL_MOBILE,
          width: 280,
          height: 80,
          fontSize: 14,
          lineHeight: 1.3,
          contrast: 2.8, // Below AA standard
          isVisible: true,
          isAccessible: false, // Not accessible
        },
      ];

      const result = mobileResponsiveAccessibility.validateBreakpointCompliance(
        nonCompliantElements,
      

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        RESPONSIVE_ACCESSIBILITY_LEVELS.POOR,
        RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL,
      ]
      expect(result.issues.length).toBeGreaterThan(0
      expect(result.issues[0].type).toBe('breakpoint')
      expect(result.issues[0].title).toContain(
        'Não conformidade no breakpoint',
      
    }

    it(('should test all mobile breakpoints', () => {
      const elements: ResponsiveElement[] = [];

      const result = mobileResponsiveAccessibility.validateBreakpointCompliance(elements

      expect(result.testedBreakpoints).toContain(
        RESPONSIVE_BREAKPOINTS.SMALL_MOBILE,
      
      expect(result.testedBreakpoints).toContain(RESPONSIVE_BREAKPOINTS.MOBILE
      expect(result.testedBreakpoints).toContain(
        RESPONSIVE_BREAKPOINTS.LARGE_MOBILE,
      
      expect(result.testedBreakpoints).toContain(RESPONSIVE_BREAKPOINTS.TABLET
      expect(result.testedBreakpoints).not.toContain(
        RESPONSIVE_BREAKPOINTS.DESKTOP,
      
    }
  }

  describe(('Text Scaling Compliance Validation', () => {
    it(('should validate text scaling compliance', () => {
      const scalableElements: ResponsiveElement[] = [
        {
          id: 'text-1',
          selector: '.scalable-text',
          breakpoint: 375,
          width: 300,
          height: 50,
          fontSize: 16, // Good base size
          lineHeight: 1.6, // Good line height
          contrast: 4.8,
          isVisible: true,
          isAccessible: true,
        },
        {
          id: 'text-2',
          selector: '.another-scalable',
          breakpoint: 375,
          width: 280,
          height: 40,
          fontSize: 18, // Larger base size
          lineHeight: 1.5, // Minimum line height
          contrast: 5.0,
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateTextScalingCompliance(
        scalableElements,
      

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT,
        RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD,
      ]
      expect(result.maxZoomTested).toBe(TEXT_SCALING_REQUIREMENTS.MAXIMUM_ZOOM
      expect(result.zoomLevelsCompliant).toContain(100
      expect(result.zoomLevelsCompliant.length).toBeGreaterThan(0
    }

    it(('should detect text scaling issues at 200% zoom', () => {
      const nonScalableElements: ResponsiveElement[] = [
        {
          id: 'text-1',
          selector: '.non-scalable-text',
          breakpoint: 375,
          width: 300,
          height: 50,
          fontSize: 12, // Too small for scaling
          lineHeight: 1.2, // Too small line height
          contrast: 4.8,
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateTextScalingCompliance(
        nonScalableElements,
      

      // Should detect issues at 200% zoom
      const hasScalingIssue = result.issues.some(
        issue => issue.type === 'text_scaling' && issue.title.includes('200%'),
      

      if (!result.zoomLevelsCompliant.includes(200)) {
        expect(hasScalingIssue).toBe(true);
      }
    }

    it(('should test required zoom levels', () => {
      const elements: ResponsiveElement[] = [
        {
          id: 'text-1',
          selector: '.test-text',
          breakpoint: 375,
          width: 300,
          height: 50,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 4.8,
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateTextScalingCompliance(elements

      // Should test 100%, 150%, and 200% zoom levels
      expect(result.maxZoomTested).toBe(200
      expect(
        result.zoomLevelsCompliant.every(level => [100, 150, 200].includes(level)),
      ).toBe(true);
    }
  }

  describe(('Contrast Compliance Validation', () => {
    it(('should validate contrast compliance', () => {
      const highContrastElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.high-contrast',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 7.2, // AAA level
          isVisible: true,
          isAccessible: true,
        },
        {
          id: 'element-2',
          selector: '.good-contrast',
          breakpoint: 375,
          width: 280,
          height: 80,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 4.8, // AA level
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateContrastCompliance(
        highContrastElements,
      

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT,
        RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD,
      ]
      expect(result.elementsChecked).toBe(2
      expect(result.compliantElements).toBe(2
      expect(result.averageContrast).toBeGreaterThan(
        CONTRAST_REQUIREMENTS.NORMAL_TEXT_AA,
      
      expect(result.issues).toHaveLength(0
    }

    it(('should detect low contrast elements', () => {
      const lowContrastElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.low-contrast',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 2.8, // Below AA standard
          isVisible: true,
          isAccessible: true,
        },
        {
          id: 'element-2',
          selector: '.very-low-contrast',
          breakpoint: 375,
          width: 280,
          height: 80,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 1.9, // Very low contrast
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateContrastCompliance(
        lowContrastElements,
      

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.POOR,
        RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL,
      ]
      expect(result.compliantElements).toBe(0
      expect(result.issues.length).toBeGreaterThan(0
      expect(result.issues[0].type).toBe('contrast')
      expect(result.issues[0].title).toBe(
        'Elementos com contraste insuficiente',
      
    }

    it(('should calculate average contrast correctly', () => {
      const mixedContrastElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.element-1',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 6.0,
          isVisible: true,
          isAccessible: true,
        },
        {
          id: 'element-2',
          selector: '.element-2',
          breakpoint: 375,
          width: 280,
          height: 80,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 4.0,
          isVisible: true,
          isAccessible: true,
        },
      ];

      const result = mobileResponsiveAccessibility.validateContrastCompliance(
        mixedContrastElements,
      

      const expectedAverage = (6.0 + 4.0) / 2;
      expect(result.averageContrast).toBe(expectedAverage
    }
  }

  describe(('Layout Adaptability Validation', () => {
    it(('should validate layout adaptability', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability(
=======
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability();
>>>>>>> origin/main

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT,
        RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD,
        RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE,
      ]
      expect(typeof result.adaptiveElements).toBe('number')
      expect(typeof result.rigidElements).toBe('number')
      expect(typeof result.overflowIssues).toBe('number')
      expect(Array.isArray(result.issues)).toBe(true);
    }

    it(('should detect rigid layout elements', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability(
=======
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability();
>>>>>>> origin/main

      // Mock implementation sets rigidElements to 2
      expect(result.rigidElements).toBe(2
      expect(result.issues.some(issue => issue.type === 'layout')).toBe(true);
      expect(
        result.issues.find(issue => issue.type === 'layout')?.title,
      ).toBe('Elementos de layout rígido')
    }

    it(('should detect content overflow issues', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability(
=======
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability();
>>>>>>> origin/main

      // Mock implementation sets overflowIssues to 1
      expect(result.overflowIssues).toBe(1
      expect(
        result.issues.some(
          issue => issue.type === 'layout' && issue.title.includes('transbordamento'),
        ),
      ).toBe(true);
    }

    it(('should provide healthcare-specific layout recommendations', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability(
=======
      const result = mobileResponsiveAccessibility.validateLayoutAdaptability();
>>>>>>> origin/main

      result.issues.forEach(issue => {
        if (issue.type === 'layout') {
          expect(issue.healthcareImpact).toMatch(/médic[ao]s/); // Matches both "médicos" and "médicas"
          expect(issue.wcagReference).toContain('WCAG 2.1 AA')
          expect(issue.remediation.steps.length).toBeGreaterThan(0
        }
      }
    }
  }

  describe(('Healthcare Patterns Validation', () => {
    it(('should validate healthcare-specific responsive patterns', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns(
=======
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns();
>>>>>>> origin/main

      expect(result.level).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT,
        RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD,
        RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        RESPONSIVE_ACCESSIBILITY_LEVELS.POOR,
      ]
      expect(Array.isArray(result.implementedPatterns)).toBe(true);
      expect(Array.isArray(result.missingPatterns)).toBe(true);
      expect(Array.isArray(result.issues)).toBe(true);

      // Should include healthcare-specific patterns
      const allPatterns = [
        ...result.implementedPatterns,
        ...result.missingPatterns,
      ];
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.APPOINTMENT_LIST,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.MEDICAL_FORM,
      
    }

    it(('should detect missing healthcare patterns', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns(
=======
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns();
>>>>>>> origin/main

      if (result.missingPatterns.length > 0) {
        expect(result.issues.some(issue => issue.type === 'content')).toBe(
          true,
        
        expect(
          result.issues.find(issue => issue.type === 'content')?.title,
        ).toBe('Padrões responsivos para saúde ausentes')
      }
    }

    it(('should validate all healthcare responsive pattern types', () => {
<<<<<<< HEAD
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns(
=======
      const result = mobileResponsiveAccessibility.validateHealthcarePatterns();
>>>>>>> origin/main

      const allPatterns = [
        ...result.implementedPatterns,
        ...result.missingPatterns,
      ];

      // Should include all healthcare patterns
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.APPOINTMENT_LIST,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.MEDICAL_FORM,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.VITAL_SIGNS_DISPLAY,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.MEDICATION_LIST,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.EMERGENCY_BANNER,
      
      expect(allPatterns).toContain(
        HEALTHCARE_RESPONSIVE_PATTERNS.NAVIGATION_MENU,
      
      expect(allPatterns).toContain(HEALTHCARE_RESPONSIVE_PATTERNS.DATA_TABLE
    }
  }

  describe(('Comprehensive Report Generation', () => {
    it(('should generate comprehensive responsive accessibility report', () => {
      const mockElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.test-element',
          breakpoint: RESPONSIVE_BREAKPOINTS.MOBILE,
          width: 350,
          height: 100,
          fontSize: 16,
          lineHeight: 1.5,
          contrast: 4.8,
          isVisible: true,
          isAccessible: true,
          pattern: HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD,
        },
        {
          id: 'element-2',
          selector: '.problematic-element',
          breakpoint: RESPONSIVE_BREAKPOINTS.SMALL_MOBILE,
          width: 300,
          height: 80,
          fontSize: 12, // Below minimum
          lineHeight: 1.2, // Below minimum
          contrast: 3.0, // Below AA standard
          isVisible: true,
          isAccessible: false,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(mockElements

      expect(report.overallLevel).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT,
        RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD,
        RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE,
        RESPONSIVE_ACCESSIBILITY_LEVELS.POOR,
        RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL,
      ]
      expect(report.score).toBeGreaterThanOrEqual(0
      expect(report.score).toBeLessThanOrEqual(100
      expect(report.lastAuditDate).toBeInstanceOf(Date
      expect(Array.isArray(report.recommendations)).toBe(true);

      // Should include all validation areas
      expect(report.breakpointCompliance).toBeDefined(
      expect(report.textScalingCompliance).toBeDefined(
      expect(report.contrastCompliance).toBeDefined(
      expect(report.layoutAdaptability).toBeDefined(
      expect(report.healthcarePatterns).toBeDefined(
    }

    it(('should calculate overall score based on issues', () => {
      const problematicElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.problematic',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 10, // Very small
          lineHeight: 1.0, // Very small
          contrast: 1.5, // Very low contrast
          isVisible: true,
          isAccessible: false,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(problematicElements

      // Should have lower score due to multiple issues
      expect(report.score).toBeLessThan(100
      expect(report.overallLevel).toBeOneOf([
        RESPONSIVE_ACCESSIBILITY_LEVELS.POOR,
        RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL,
      ]
    }

    it(('should generate actionable recommendations', () => {
      const mockElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.test-element',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 12, // Below minimum
          lineHeight: 1.2, // Below minimum
          contrast: 3.0, // Below AA standard
          isVisible: true,
          isAccessible: false,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(mockElements

      expect(report.recommendations.length).toBeGreaterThan(0

      report.recommendations.forEach(recommendation => {
<<<<<<< HEAD
        expect(typeof recommendation).toBe('string')
        expect(recommendation.length).toBeGreaterThan(0
      }
=======
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
>>>>>>> origin/main

      // Should prioritize critical and high severity issues
      const hasHighPriorityRecommendation = report.recommendations.some(
        rec => rec.includes('urgentemente') || rec.includes('alta prioridade'),
      
      expect(hasHighPriorityRecommendation).toBe(true);
    }
  }

  describe(('WCAG Compliance', () => {
    it(('should enforce WCAG 2.1 AA+ requirements', () => {
<<<<<<< HEAD
      expect(TEXT_SCALING_REQUIREMENTS.MAXIMUM_ZOOM).toBe(200
      expect(TEXT_SCALING_REQUIREMENTS.FONT_SIZE_MINIMUM).toBe(16
      expect(TEXT_SCALING_REQUIREMENTS.LINE_HEIGHT_MINIMUM).toBe(1.5
=======
      expect(TEXT_SCALING_REQUIREMENTS.MAXIMUM_ZOOM).toBe(200);
      expect(TEXT_SCALING_REQUIREMENTS.FONT_SIZE_MINIMUM).toBe(16);
      expect(TEXT_SCALING_REQUIREMENTS.LINE_HEIGHT_MINIMUM).toBe(1.5);
>>>>>>> origin/main

      expect(CONTRAST_REQUIREMENTS.NORMAL_TEXT_AA).toBe(4.5
      expect(CONTRAST_REQUIREMENTS.LARGE_TEXT_AA).toBe(3
      expect(CONTRAST_REQUIREMENTS.NON_TEXT_AA).toBe(3
      expect(CONTRAST_REQUIREMENTS.ENHANCED_AAA).toBe(7
    }

    it(('should reference WCAG guidelines in issues', () => {
      const problematicElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.problematic',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 12,
          lineHeight: 1.2,
          contrast: 2.0,
          isVisible: true,
          isAccessible: false,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(problematicElements

      report.breakpointCompliance.issues.forEach(issue => {
<<<<<<< HEAD
        expect(issue.wcagReference).toContain('WCAG 2.1 AA')
      }
    }
  }

  describe(('Mobile Breakpoints', () => {
    it(('should define appropriate responsive breakpoints', () => {
      expect(RESPONSIVE_BREAKPOINTS.SMALL_MOBILE).toBe(320
      expect(RESPONSIVE_BREAKPOINTS.MOBILE).toBe(375
      expect(RESPONSIVE_BREAKPOINTS.LARGE_MOBILE).toBe(414
      expect(RESPONSIVE_BREAKPOINTS.TABLET).toBe(768
      expect(RESPONSIVE_BREAKPOINTS.DESKTOP).toBe(1024
    }
  }
=======
        expect(issue.wcagReference).toContain('WCAG 2.1 AA');
      });
    });
  });

  describe(('Mobile Breakpoints', () => {
    it(('should define appropriate responsive breakpoints', () => {
      expect(RESPONSIVE_BREAKPOINTS.SMALL_MOBILE).toBe(320);
      expect(RESPONSIVE_BREAKPOINTS.MOBILE).toBe(375);
      expect(RESPONSIVE_BREAKPOINTS.LARGE_MOBILE).toBe(414);
      expect(RESPONSIVE_BREAKPOINTS.TABLET).toBe(768);
      expect(RESPONSIVE_BREAKPOINTS.DESKTOP).toBe(1024);
    });
  });
>>>>>>> origin/main

  describe(('Brazilian Portuguese Localization', () => {
    it(('should provide Brazilian Portuguese accessibility labels', () => {
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.breakpointCompliance).toBe(
        'Conformidade de breakpoints',
      
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.textScaling).toBe(
        'Escalonamento de texto',
      
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.contrastRatio).toBe(
        'Taxa de contraste',
      
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.layoutAdaptability).toBe(
        'Adaptabilidade de layout',
      
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.medicalInformation).toBe(
        'Informações médicas',
      
      expect(RESPONSIVE_ACCESSIBILITY_LABELS_PT_BR.emergencyAccess).toBe(
        'Acesso de emergência',
      
    }

    it(('should use Portuguese in issue descriptions', () => {
      const problematicElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.problematic',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 12,
          lineHeight: 1.2,
          contrast: 2.0,
          isVisible: true,
          isAccessible: false,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(problematicElements

      const allIssues = [
        ...report.breakpointCompliance.issues,
        ...report.textScalingCompliance.issues,
        ...report.contrastCompliance.issues,
        ...report.layoutAdaptability.issues,
        ...report.healthcarePatterns.issues,
      ];

      allIssues.forEach(issue => {
        // Check if any of the text contains Portuguese characters
        const hasPortugueseChars = (text: string) => /[áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(text

        expect(
          hasPortugueseChars(issue.title)
            || hasPortugueseChars(issue.description)
            || hasPortugueseChars(issue.recommendation),
        ).toBe(true);
      }
    }
  }

  describe(('Healthcare-Specific Features', () => {
    it(('should include healthcare impact in issues', () => {
      const mockElements: ResponsiveElement[] = [
        {
          id: 'element-1',
          selector: '.medical-element',
          breakpoint: 375,
          width: 300,
          height: 100,
          fontSize: 12,
          lineHeight: 1.2,
          contrast: 2.0,
          isVisible: true,
          isAccessible: false,
          pattern: HEALTHCARE_RESPONSIVE_PATTERNS.VITAL_SIGNS_DISPLAY,
        },
      ];

      const report = mobileResponsiveAccessibility.generateReport(mockElements

      const allIssues = [
        ...report.breakpointCompliance.issues,
        ...report.textScalingCompliance.issues,
        ...report.contrastCompliance.issues,
        ...report.layoutAdaptability.issues,
        ...report.healthcarePatterns.issues,
      ];

      allIssues.forEach(issue => {
<<<<<<< HEAD
        expect(issue.healthcareImpact).toBeDefined(
        expect(issue.healthcareImpact.length).toBeGreaterThan(0
      }
    }

    it(('should validate healthcare responsive patterns', () => {
      const patterns = Object.values(HEALTHCARE_RESPONSIVE_PATTERNS
=======
        expect(issue.healthcareImpact).toBeDefined();
        expect(issue.healthcareImpact.length).toBeGreaterThan(0);
      });
    });

    it(('should validate healthcare responsive patterns', () => {
      const patterns = Object.values(HEALTHCARE_RESPONSIVE_PATTERNS);
>>>>>>> origin/main

      expect(patterns).toContain('patient_card')
      expect(patterns).toContain('appointment_list')
      expect(patterns).toContain('medical_form')
      expect(patterns).toContain('vital_signs_display')
      expect(patterns).toContain('medication_list')
      expect(patterns).toContain('emergency_banner')
      expect(patterns).toContain('navigation_menu')
      expect(patterns).toContain('data_table')
    }
  }

  describe(('Constants and Enums', () => {
    it(('should have correct responsive accessibility levels', () => {
<<<<<<< HEAD
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT).toBe('excellent')
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD).toBe('good')
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE).toBe('acceptable')
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.POOR).toBe('poor')
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL).toBe('critical')
    }

    it(('should have healthcare-specific responsive patterns', () => {
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD).toBe('patient_card')
=======
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.EXCELLENT).toBe('excellent');
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.GOOD).toBe('good');
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.ACCEPTABLE).toBe('acceptable');
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.POOR).toBe('poor');
      expect(RESPONSIVE_ACCESSIBILITY_LEVELS.CRITICAL).toBe('critical');
    });

    it(('should have healthcare-specific responsive patterns', () => {
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.PATIENT_CARD).toBe('patient_card');
>>>>>>> origin/main
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.APPOINTMENT_LIST).toBe(
        'appointment_list',
      
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.MEDICAL_FORM).toBe('medical_form')
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.VITAL_SIGNS_DISPLAY).toBe(
        'vital_signs_display',
      
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.MEDICATION_LIST).toBe(
        'medication_list',
      
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.EMERGENCY_BANNER).toBe(
        'emergency_banner',
      
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.NAVIGATION_MENU).toBe(
        'navigation_menu',
      
      expect(HEALTHCARE_RESPONSIVE_PATTERNS.DATA_TABLE).toBe('data_table')
    }
  }
}
