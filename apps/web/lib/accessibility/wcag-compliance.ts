// WCAG 2.1 AA Compliance utilities for NeonPro
// Healthcare accessibility standards implementation

export interface WCAGLevel {
  A: boolean;
  AA: boolean;
  AAA: boolean;
}

export interface AccessibilityConfig {
  level: WCAGLevel;
  announcements: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
}

// Color contrast ratios for WCAG AA compliance
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

// Focus management utilities
export class FocusManager {
  private static trapStack: HTMLElement[] = [];

  static trapFocus(element: HTMLElement) {
    FocusManager.trapStack.push(element);
    const focusableElements = FocusManager.getFocusableElements(element);

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }

      if (e.key === 'Escape') {
        FocusManager.releaseFocus();
      }
    });

    firstElement.focus();
  }

  static releaseFocus() {
    if (FocusManager.trapStack.length > 0) {
      FocusManager.trapStack.pop();
    }
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
    ].join(',');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }
}

// Color contrast utilities
export class ContrastChecker {
  static calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  static calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = ContrastChecker.hexToRgb(color1);
    const rgb2 = ContrastChecker.hexToRgb(color2);

    if (!(rgb1 && rgb2)) {
      return 0;
    }

    const lum1 = ContrastChecker.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = ContrastChecker.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null;
  }

  static meetsWCAGAA(
    foreground: string,
    background: string,
    isLargeText = false
  ): boolean {
    const ratio = ContrastChecker.calculateContrastRatio(
      foreground,
      background
    );
    const required = isLargeText
      ? CONTRAST_RATIOS.AA_LARGE
      : CONTRAST_RATIOS.AA_NORMAL;
    return ratio >= required;
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  static handleArrowNavigation(
    event: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number
  ): number {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      items[newIndex].focus();
    }

    return newIndex;
  }

  static createRovingTabIndex(container: HTMLElement, selector: string) {
    const items = container.querySelectorAll<HTMLElement>(selector);
    let currentIndex = 0;

    // Set initial tab indexes
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });

    // Handle keyboard navigation
    container.addEventListener('keydown', (event) => {
      if (
        [
          'ArrowDown',
          'ArrowUp',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
        ].includes(event.key)
      ) {
        currentIndex = KeyboardNavigation.handleArrowNavigation(
          event,
          items,
          currentIndex
        );

        // Update tab indexes
        items.forEach((item, index) => {
          item.tabIndex = index === currentIndex ? 0 : -1;
        });
      }
    });

    // Handle focus events
    items.forEach((item, index) => {
      item.addEventListener('focus', () => {
        currentIndex = index;
        items.forEach((otherItem, otherIndex) => {
          otherItem.tabIndex = otherIndex === index ? 0 : -1;
        });
      });
    });
  }
}

// ARIA utilities
export class AriaUtils {
  static setExpanded(element: HTMLElement, expanded: boolean) {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  static setSelected(element: HTMLElement, selected: boolean) {
    element.setAttribute('aria-selected', selected.toString());
  }

  static setPressed(element: HTMLElement, pressed: boolean) {
    element.setAttribute('aria-pressed', pressed.toString());
  }

  static setHidden(element: HTMLElement, hidden: boolean) {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('aria-hidden');
    }
  }

  static describedBy(element: HTMLElement, descriptionId: string) {
    element.setAttribute('aria-describedby', descriptionId);
  }

  static labelledBy(element: HTMLElement, labelId: string) {
    element.setAttribute('aria-labelledby', labelId);
  }
}

// Healthcare-specific accessibility patterns
export class HealthcareA11y {
  static announceAppointmentStatus(status: string, patientName?: string) {
    const message = patientName
      ? `Consulta para ${patientName}: ${status}`
      : `Status da consulta: ${status}`;

    FocusManager.announceToScreenReader(message, 'assertive');
  }

  static announceFormErrors(errors: string[]) {
    if (errors.length === 0) {
      return;
    }

    const message =
      errors.length === 1
        ? `Erro no formulário: ${errors[0]}`
        : `${errors.length} erros no formulário: ${errors.join(', ')}`;

    FocusManager.announceToScreenReader(message, 'assertive');
  }

  static announceLoadingState(isLoading: boolean, context = '') {
    const message = isLoading
      ? `Carregando${context ? ` ${context}` : ''}...`
      : `${context} carregado com sucesso`;

    FocusManager.announceToScreenReader(message, 'polite');
  }

  static createErrorSummary(errors: Record<string, string>): HTMLElement {
    const summary = document.createElement('div');
    summary.role = 'alert';
    summary.className = 'error-summary';
    summary.tabIndex = -1;

    const title = document.createElement('h2');
    title.textContent = 'Corrija os seguintes erros:';
    summary.appendChild(title);

    const list = document.createElement('ul');
    Object.entries(errors).forEach(([field, error]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${field}`;
      link.textContent = error;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetField = document.getElementById(field);
        if (targetField) {
          targetField.focus();
        }
      });
      item.appendChild(link);
      list.appendChild(item);
    });

    summary.appendChild(list);
    return summary;
  }
}

export const accessibilityConfig: AccessibilityConfig = {
  level: { A: true, AA: true, AAA: false },
  announcements: true,
  highContrast: false,
  reducedMotion: false,
  focusIndicators: true,
  keyboardNavigation: true,
};
