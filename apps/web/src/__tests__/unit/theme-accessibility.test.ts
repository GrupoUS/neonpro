/**
 * WCAG 2.1 AA Compliance Tests for NEONPRO Theme
 * 
 * Validates accessibility requirements for Brazilian aesthetic clinics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validateColorContrast, 
  validateThemeAccessibility, 
  generateAccessibilityReport,
  validateConstitutionalCompliance
} from '../../lib/theme/accessibility';
import { ColorPalette } from '../../types/theme';

describe('WCAG 2.1 AA Compliance', () => {
  let neonproColorScheme: ColorPalette;

  beforeEach(() => {
    neonproColorScheme = {
      background: '#FFFFFF',
      foreground: '#000000',
      primary: '#AC9469', // NEONPRO Golden Primary
      neonproPrimary: '#AC9469',
      neonproDeepBlue: '#112031',
      neonproAccent: '#E8D5B7'
    };
  });

  describe('Color Contrast Validation', () => {
    it('should pass AA compliance for NEONPRO primary on white background', () => {
      const result = validateColorContrast('#AC9469', '#FFFFFF');
      
      expect(result.meetsMinimum).toBe(true);
      expect(result.level).toMatch(/AA|AAA/);
      expect(result.value).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass AA compliance for white text on NEONPRO deep blue', () => {
      const result = validateColorContrast('#FFFFFF', '#112031');
      
      expect(result.meetsMinimum).toBe(true);
      expect(result.level).toMatch(/AA|AAA/);
      expect(result.value).toBeGreaterThanOrEqual(4.5);
    });

    it('should validate black text on white background (perfect contrast)', () => {
      const result = validateColorContrast('#000000', '#FFFFFF');
      
      expect(result.meetsMinimum).toBe(true);
      expect(result.level).toBe('AAA');
      expect(result.value).toBe(21); // Perfect contrast ratio
    });

    it('should fail compliance for insufficient contrast', () => {
      const result = validateColorContrast('#CCCCCC', '#FFFFFF');
      
      expect(result.meetsMinimum).toBe(false);
      expect(result.level).toBe('fail');
      expect(result.value).toBeLessThan(4.5);
    });
  });

  describe('Theme Accessibility Validation', () => {
    it('should validate complete NEONPRO theme accessibility', () => {
      const result = validateThemeAccessibility(neonproColorScheme);
      
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.violations.filter(v => v.level === 'error')).toHaveLength(0);
    });

    it('should detect accessibility violations in poor color scheme', () => {
      const poorColorScheme: ColorPalette = {
        background: '#FFFFFF',
        foreground: '#CCCCCC', // Poor contrast
        primary: '#DDDDDD',    // Poor contrast
      };

      const result = validateThemeAccessibility(poorColorScheme);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.level === 'error')).toBe(true);
    });

    it('should provide recommendations for good contrast', () => {
      const result = validateThemeAccessibility(neonproColorScheme);
      
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('contrast'))).toBe(true);
    });
  });

  describe('Accessibility Report Generation', () => {
    it('should generate comprehensive accessibility report', () => {
      const report = generateAccessibilityReport(neonproColorScheme);
      
      expect(report).toContain('NEONPRO Theme Accessibility Report');
      expect(report).toContain('Overall Score:');
      expect(report).toContain('WCAG 2.1 AA Compliant:');
      expect(report).toContain('Brazilian Aesthetic Clinic Compliance');
    });

    it('should include LGPD compliance in report', () => {
      const report = generateAccessibilityReport(neonproColorScheme);
      
      expect(report).toContain('LGPD data protection');
      expect(report).toContain('ANVISA medical device');
      expect(report).toContain('CFM professional standards');
    });
  });

  describe('Constitutional Compliance', () => {
    it('should validate Brazilian healthcare constitutional compliance', () => {
      const result = validateConstitutionalCompliance(neonproColorScheme);
      
      expect(result.lgpdCompliant).toBe(true);
      expect(result.anvisaCompliant).toBe(true);
      expect(result.cfmCompliant).toBe(true);
      expect(result.wcagCompliant).toBe(true);
      expect(result.overallCompliant).toBe(true);
    });

    it('should handle non-compliant schemes for constitutional requirements', () => {
      const nonCompliantScheme: ColorPalette = {
        background: '#FFFFFF',
        foreground: '#CCCCCC', // Poor contrast fails WCAG
        primary: '#DDDDDD',
      };

      const result = validateConstitutionalCompliance(nonCompliantScheme);
      
      expect(result.wcagCompliant).toBe(false);
      expect(result.overallCompliant).toBe(false);
      // Other compliance aspects should still pass
      expect(result.lgpdCompliant).toBe(true);
      expect(result.anvisaCompliant).toBe(true);
      expect(result.cfmCompliant).toBe(true);
    });
  });

  describe('Brazilian Aesthetic Clinic Specific Tests', () => {
    it('should validate NEONPRO brand color combinations', () => {
      const result = validateThemeAccessibility(neonproColorScheme);
      const brandRelatedViolations = result.violations.filter(v => 
        v.description.includes('NEONPRO') || v.criterion.includes('Brazilian')
      );
      
      // Should not have critical brand color violations
      expect(brandRelatedViolations.filter(v => v.level === 'error')).toHaveLength(0);
    });

    it('should ensure mobile-first accessibility for 95% mobile usage', () => {
      // Test that color contrasts work well on mobile devices
      const result = validateThemeAccessibility(neonproColorScheme);
      
      expect(result.score).toBeGreaterThanOrEqual(85); // High standard for mobile
      expect(result.isCompliant).toBe(true);
    });

    it('should validate focus states for accessibility', () => {
      const result = validateThemeAccessibility(neonproColorScheme);
      const focusViolations = result.violations.filter(v => 
        v.description.includes('focus') || v.criterion.includes('2.4.7')
      );
      
      // Should have minimal focus-related violations
      expect(focusViolations.filter(v => v.level === 'error')).toHaveLength(0);
    });
  });
});