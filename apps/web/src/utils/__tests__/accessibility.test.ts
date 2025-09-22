/**
 * Accessibility Utilities Tests
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESSIBILITY_LABELS_PT_BR,
  calculateContrastRatio,
  createAccessibleErrorMessage,
  createHealthcareFormAria,
  createLiveRegionAria,
  FocusManager,
  generateAccessibleId,
  HEALTHCARE_ARIA_ROLES,
  KeyboardNavigation,
  meetsContrastRequirement,
  prefersHighContrast,
  prefersReducedMotion,
  ScreenReaderUtils,
  WCAG_CONTRAST_RATIOS,
} from '../accessibility';

// Mock DOM methods
const mockFocus = vi.fn(
const mockScrollIntoView = vi.fn(

beforeEach(() => {
  // Mock DOM elements
  Object.defineProperty(document, 'activeElement', {
    value: { focus: mockFocus },
    writable: true,
  }

  Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: mockFocus,
    writable: true,
  }

  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
    writable: true,
  }

  // Mock querySelector
  document.querySelectorAll = vi
    .fn()
    .mockReturnValue([{ focus: mockFocus }, { focus: mockFocus }]

  document.getElementById = vi.fn().mockReturnValue({
    focus: mockFocus,
    scrollIntoView: mockScrollIntoView,
  }

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  }
}

afterEach(() => {
  vi.clearAllMocks(
}

describe(('WCAG Contrast Calculations', () => {
  it(('should calculate correct contrast ratios', () => {
    // Black on white should have high contrast
    const blackWhiteRatio = calculateContrastRatio('#000000', '#ffffff')
    expect(blackWhiteRatio).toBe(21

    // White on black should have same contrast
    const whiteBlackRatio = calculateContrastRatio('#ffffff', '#000000')
    expect(whiteBlackRatio).toBe(21

    // Same colors should have no contrast
    const sameColorRatio = calculateContrastRatio('#ff0000', '#ff0000')
    expect(sameColorRatio).toBe(1
  }

  it(('should correctly identify WCAG AA compliance', () => {
    // High contrast combinations
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', false)).toBe(
      true,
    
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', true)).toBe(
      true,
    

    // Low contrast combinations
    expect(meetsContrastRequirement('#cccccc', '#ffffff', 'AA', false)).toBe(
      false,
    
    expect(meetsContrastRequirement('#cccccc', '#ffffff', 'AA', true)).toBe(
      false,
    
  }

  it(('should correctly identify WCAG AAA compliance', () => {
    // High contrast should meet AAA
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA', false)).toBe(
      true,
    

    // Medium contrast might meet AA but not AAA
    const mediumContrast = calculateContrastRatio('#666666', '#ffffff')
    expect(mediumContrast).toBeGreaterThan(WCAG_CONTRAST_RATIOS.AA_NORMAL
    expect(mediumContrast).toBeLessThan(WCAG_CONTRAST_RATIOS.AAA_NORMAL
  }
}

describe(('Accessible ID Generation', () => {
  it(('should generate unique IDs', () => {
    const id1 = generateAccessibleId(
    const id2 = generateAccessibleId(

    expect(id1).not.toBe(id2
    expect(id1).toMatch(/^a11y-[a-z0-9]+$/
    expect(id2).toMatch(/^a11y-[a-z0-9]+$/
  }

  it(('should use custom prefix', () => {
    const id = generateAccessibleId('custom')
    expect(id).toMatch(/^custom-[a-z0-9]+$/
  }
}

describe(('Healthcare Form ARIA', () => {
  it(('should create proper ARIA attributes for required fields', () => {
    const aria = createHealthcareFormAria('patientName', true, false

    expect(aria['aria-required']).toBe(true);
    expect(aria['aria-invalid']).toBe(false);
    expect(aria.id).toMatch(/^patientName-[a-z0-9]+$/
  }

  it(('should create proper ARIA attributes for fields with errors', () => {
    const aria = createHealthcareFormAria(
      'email',
      false,
      true,
      'Invalid email',
    

    expect(aria['aria-required']).toBe(false);
    expect(aria['aria-invalid']).toBe(true);
    expect(aria['aria-describedby']).toMatch(/^email-[a-z0-9]+-error$/
  }

  it(('should include Brazilian Portuguese labels', () => {
    const aria = createHealthcareFormAria('patientData', false, false
    expect(aria['aria-label']).toBe(ACCESSIBILITY_LABELS_PT_BR.patientData
  }
}

describe(('Live Region ARIA', () => {
  it(('should create polite live region by default', () => {
    const aria = createLiveRegionAria(

    expect(aria['aria-live']).toBe('polite')
    expect(aria['aria-atomic']).toBe(false);
    expect(aria._role).toBe('status')
  }

  it(('should create assertive live region when specified', () => {
    const aria = createLiveRegionAria('assertive', true

    expect(aria['aria-live']).toBe('assertive')
    expect(aria['aria-atomic']).toBe(true);
    expect(aria._role).toBe('status')
  }
}

describe(('Focus Manager', () => {
  it(('should save and restore focus', () => {
    const restoreFocus = FocusManager.saveFocus(

    // Simulate focus change
    const newElement = { focus: vi.fn() };
    Object.defineProperty(document, 'activeElement', {
      value: newElement,
      writable: true,
    }

    restoreFocus(
    expect(mockFocus).toHaveBeenCalled(
  }

  it(('should move focus to element with announcement', () => {
    const element = { focus: mockFocus };
    const spy = vi.spyOn(FocusManager, 'announceToScreenReader')

    FocusManager.moveFocusTo(element as any, 'Test announcement')

    expect(mockFocus).toHaveBeenCalled(
    expect(spy).toHaveBeenCalledWith('Test announcement')
  }

  it(('should announce to screen readers', () => {
    vi.useFakeTimers(
    const spy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')

    FocusManager.announceToScreenReader('Test message')

    expect(spy).toHaveBeenCalled(

    // Check that element is removed after timeout
    vi.advanceTimersByTime(1000
    expect(removeSpy).toHaveBeenCalled(

    vi.useRealTimers(
  }
}

describe(('Keyboard Navigation', () => {
  it(('should handle grid navigation correctly', () => {
    const onNavigate = vi.fn(
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' }

    KeyboardNavigation.handleGridNavigation(event, 0, 9, 3, onNavigate

    expect(onNavigate).toHaveBeenCalledWith(1
  }

  it(('should handle list navigation correctly', () => {
    const onNavigate = vi.fn(
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }

    KeyboardNavigation.handleListNavigation(event, 0, 5, onNavigate

    expect(onNavigate).toHaveBeenCalledWith(1
  }

  it(('should handle Home and End keys', () => {
    const onNavigate = vi.fn(

    // Test Home key
    const homeEvent = new KeyboardEvent('keydown', { key: 'Home' }
    KeyboardNavigation.handleListNavigation(homeEvent, 3, 5, onNavigate
    expect(onNavigate).toHaveBeenCalledWith(0

    // Test End key
    const endEvent = new KeyboardEvent('keydown', { key: 'End' }
    KeyboardNavigation.handleListNavigation(endEvent, 1, 5, onNavigate
    expect(onNavigate).toHaveBeenCalledWith(4
  }

  it(('should handle wrapping in list navigation', () => {
    const onNavigate = vi.fn(

    // Test wrap from last to first
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }
    KeyboardNavigation.handleListNavigation(event, 4, 5, onNavigate, true
    expect(onNavigate).toHaveBeenCalledWith(0
  }
}

describe(('Screen Reader Utils', () => {
  it(('should format healthcare data correctly', () => {
    const formatted = ScreenReaderUtils.formatHealthcareData(
      'Pressão arterial',
      '120/80',
      'mmHg',
    
    expect(formatted).toBe('Pressão arterial: 120/80 mmHg')
  }

  it(('should format dates for Brazilian Portuguese', () => {
    const date = new Date('2024-01-15')
    const formatted = ScreenReaderUtils.formatDateForScreenReader(date

    expect(formatted).toContain('janeiro')
    expect(formatted).toContain('2024')
  }

  it(('should format time for Brazilian Portuguese', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = ScreenReaderUtils.formatTimeForScreenReader(date

    expect(formatted).toMatch(/14:30/
  }

  it(('should create accessible table captions', () => {
    const caption = ScreenReaderUtils.createTableCaption('Pacientes', 10, 5
    expect(caption).toBe('Pacientes. Tabela com 10 linhas e 5 colunas.')
  }
}

describe(('User Preferences', () => {
  it(('should detect reduced motion preference', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    expect(prefersReducedMotion()).toBe(true);
  }

  it(('should detect high contrast preference', () => {
    // Mock high contrast preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    expect(prefersHighContrast()).toBe(true);
  }
}

describe(('Error Messages', () => {
  it(('should create accessible error messages', () => {
    const error = createAccessibleErrorMessage('email', 'Email inválido')

    expect(error.id).toMatch(/^email-error-[a-z0-9]+$/
    expect(error.message).toBe('Email inválido')
    expect(error.ariaAttributes._role).toBe('alert')
    expect(error.ariaAttributes['aria-live']).toBe('assertive')
    expect(error.ariaAttributes['aria-atomic']).toBe('true')
  }
}

describe(('Constants and Labels', () => {
  it(('should have correct WCAG contrast ratios', () => {
    expect(WCAG_CONTRAST_RATIOS.AA_NORMAL).toBe(4.5
    expect(WCAG_CONTRAST_RATIOS.AA_LARGE).toBe(3.0
    expect(WCAG_CONTRAST_RATIOS.AAA_NORMAL).toBe(7.0
    expect(WCAG_CONTRAST_RATIOS.AAA_LARGE).toBe(4.5
  }

  it(('should have healthcare-specific ARIA roles', () => {
    expect(HEALTHCARE_ARIA_ROLES.patientInfo).toBe('region')
    expect(HEALTHCARE_ARIA_ROLES.emergencyAlert).toBe('alert')
    expect(HEALTHCARE_ARIA_ROLES.appointmentSchedule).toBe('grid')
  }

  it(('should have Brazilian Portuguese accessibility labels', () => {
    expect(ACCESSIBILITY_LABELS_PT_BR.mainNavigation).toBe(
      'Navegação principal',
    
    expect(ACCESSIBILITY_LABELS_PT_BR.patientData).toBe('Dados do paciente')
    expect(ACCESSIBILITY_LABELS_PT_BR.lgpdConsent).toBe('Consentimento LGPD')
    expect(ACCESSIBILITY_LABELS_PT_BR.required).toBe('Campo obrigatório')
  }
}
