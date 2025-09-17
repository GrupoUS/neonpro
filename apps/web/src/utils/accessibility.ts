/**
 * Accessibility Utilities for WCAG 2.1 AA+ Compliance
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - WCAG 2.1 AA+ compliance utilities
 * - Healthcare-specific accessibility patterns
 * - Screen reader optimization
 * - Keyboard navigation support
 * - Brazilian Portuguese accessibility
 * - Focus management utilities
 */

// WCAG 2.1 AA+ Color Contrast Requirements
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const;

// Healthcare-specific ARIA roles and properties
export const HEALTHCARE_ARIA_ROLES = {
  patientInfo: 'region',
  medicalData: 'group',
  appointmentSchedule: 'grid',
  emergencyAlert: 'alert',
  statusUpdate: 'status',
  progressIndicator: 'progressbar',
  navigationMenu: 'navigation',
  searchResults: 'search',
  formSection: 'form',
  dataTable: 'table',
} as const;

// Brazilian Portuguese accessibility labels
export const ACCESSIBILITY_LABELS_PT_BR = {
  // Navigation
  mainNavigation: 'Navegação principal',
  breadcrumb: 'Caminho de navegação',
  skipToContent: 'Pular para o conteúdo principal',
  skipToNavigation: 'Pular para a navegação',

  // Forms
  required: 'Campo obrigatório',
  optional: 'Campo opcional',
  invalid: 'Campo inválido',
  validationError: 'Erro de validação',

  // Actions
  loading: 'Carregando',
  saving: 'Salvando',
  submitting: 'Enviando',
  processing: 'Processando',

  // Healthcare specific
  patientData: 'Dados do paciente',
  medicalHistory: 'Histórico médico',
  appointmentDetails: 'Detalhes do agendamento',
  emergencyContact: 'Contato de emergência',
  lgpdConsent: 'Consentimento LGPD',

  // Status messages
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Aviso',
  info: 'Informação',

  // Time and dates
  today: 'Hoje',
  tomorrow: 'Amanhã',
  yesterday: 'Ontem',
  thisWeek: 'Esta semana',
  nextWeek: 'Próxima semana',
} as const;

/**
 * Calculate color contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false,
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const requirement = level === 'AA'
    ? (isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL)
    : (isLargeText ? WCAG_CONTRAST_RATIOS.AAA_LARGE : WCAG_CONTRAST_RATIOS.AAA_NORMAL);

  return ratio >= requirement;
}

/**
 * Generate accessible ID for form elements
 */
export function generateAccessibleId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create ARIA attributes for healthcare forms
 */
export function createHealthcareFormAria(
  fieldName: string,
  isRequired: boolean = false,
  hasError: boolean = false,
  errorMessage?: string,
) {
  const baseId = generateAccessibleId(fieldName);

  return {
    id: baseId,
    'aria-required': isRequired,
    'aria-invalid': hasError,
    'aria-describedby': hasError && errorMessage ? `${baseId}-error` : undefined,
    'aria-label': ACCESSIBILITY_LABELS_PT_BR[fieldName as keyof typeof ACCESSIBILITY_LABELS_PT_BR]
      || fieldName,
  };
}

/**
 * Create ARIA live region attributes
 */
export function createLiveRegionAria(
  politeness: 'polite' | 'assertive' = 'polite',
  atomic: boolean = false,
) {
  return {
    'aria-live': politeness,
    'aria-atomic': atomic,
    role: 'status',
  };
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Trap focus within an element
   */
  static trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Save current focus and restore later
   */
  static saveFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    this.focusStack.push(activeElement);

    return () => {
      const elementToFocus = this.focusStack.pop();
      elementToFocus?.focus();
    };
  }

  /**
   * Move focus to element with announcement
   */
  static moveFocusTo(element: HTMLElement, announcement?: string): void {
    element.focus();

    if (announcement) {
      this.announceToScreenReader(announcement);
    }
  }

  /**
   * Announce message to screen readers
   */
  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
  ): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation in a grid
   */
  static handleGridNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    columns: number,
    onNavigate: (newIndex: number) => void,
  ): void {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, totalItems - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + columns, totalItems - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - columns, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }

  /**
   * Handle list navigation with arrow keys
   */
  static handleListNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (newIndex: number) => void,
    wrap: boolean = false,
  ): void {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        newIndex = wrap
          ? (currentIndex + 1) % totalItems
          : Math.min(currentIndex + 1, totalItems - 1);
        break;
      case 'ArrowUp':
        newIndex = wrap
          ? (currentIndex - 1 + totalItems) % totalItems
          : Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Format healthcare data for screen readers
   */
  static formatHealthcareData(
    label: string,
    value: string | number,
    unit?: string,
  ): string {
    const formattedValue = unit ? `${value} ${unit}` : String(value);
    return `${label}: ${formattedValue}`;
  }

  /**
   * Format date for Brazilian Portuguese screen readers
   */
  static formatDateForScreenReader(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Format time for Brazilian Portuguese screen readers
   */
  static formatTimeForScreenReader(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Create accessible table caption
   */
  static createTableCaption(
    title: string,
    rowCount: number,
    columnCount: number,
  ): string {
    return `${title}. Tabela com ${rowCount} linhas e ${columnCount} colunas.`;
  }
}

/**
 * Reduced motion utilities
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Create accessible error message
 */
export function createAccessibleErrorMessage(
  fieldName: string,
  errorMessage: string,
): { id: string; message: string; ariaAttributes: Record<string, string> } {
  const id = generateAccessibleId(`${fieldName}-error`);

  return {
    id,
    message: errorMessage,
    ariaAttributes: {
      id,
      role: 'alert',
      'aria-live': 'assertive',
      'aria-atomic': 'true',
    },
  };
}

export default {
  WCAG_CONTRAST_RATIOS,
  HEALTHCARE_ARIA_ROLES,
  ACCESSIBILITY_LABELS_PT_BR,
  calculateContrastRatio,
  meetsContrastRequirement,
  generateAccessibleId,
  createHealthcareFormAria,
  createLiveRegionAria,
  FocusManager,
  KeyboardNavigation,
  ScreenReaderUtils,
  prefersReducedMotion,
  prefersHighContrast,
  createAccessibleErrorMessage,
};
