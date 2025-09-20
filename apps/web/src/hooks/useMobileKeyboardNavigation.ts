/**
 * Mobile Keyboard Navigation Hook
 * T083 - Mobile Accessibility Optimization
 *
 * Features:
 * - External keyboard support for mobile devices (Bluetooth keyboards)
 * - Focus management for mobile interfaces
 * - Skip links optimized for healthcare workflows
 * - Touch and keyboard interaction coexistence
 * - Healthcare-specific keyboard shortcuts
 * - Brazilian Portuguese keyboard navigation labels
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

// Mobile Keyboard Navigation Levels
export const MOBILE_KEYBOARD_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
  POOR: 'poor',
  CRITICAL: 'critical',
} as const;

export type MobileKeyboardLevel =
  (typeof MOBILE_KEYBOARD_LEVELS)[keyof typeof MOBILE_KEYBOARD_LEVELS];

// Healthcare Keyboard Shortcuts
export const HEALTHCARE_KEYBOARD_SHORTCUTS = {
  EMERGENCY_CONTACT: 'Alt+E',
  PATIENT_SEARCH: 'Alt+P',
  NEW_APPOINTMENT: 'Alt+A',
  MEDICATION_LIST: 'Alt+M',
  VITAL_SIGNS: 'Alt+V',
  MEDICAL_HISTORY: 'Alt+H',
  SAVE_PATIENT_DATA: 'Ctrl+S',
  CANCEL_OPERATION: 'Escape',
  NEXT_PATIENT: 'Alt+Right',
  PREVIOUS_PATIENT: 'Alt+Left',
  FOCUS_SEARCH: 'Ctrl+F',
  SKIP_TO_CONTENT: 'Alt+1',
  SKIP_TO_NAVIGATION: 'Alt+2',
  SKIP_TO_EMERGENCY: 'Alt+9',
} as const;

// Skip Link Types for Healthcare
export const HEALTHCARE_SKIP_LINKS = {
  MAIN_CONTENT: 'main_content',
  PATIENT_NAVIGATION: 'patient_navigation',
  APPOINTMENT_SECTION: 'appointment_section',
  MEDICAL_RECORDS: 'medical_records',
  EMERGENCY_SECTION: 'emergency_section',
  SEARCH_FUNCTION: 'search_function',
  MEDICATION_SECTION: 'medication_section',
  VITAL_SIGNS_SECTION: 'vital_signs_section',
} as const;

export type HealthcareSkipLink = (typeof HEALTHCARE_SKIP_LINKS)[keyof typeof HEALTHCARE_SKIP_LINKS];

// Focus Management Configuration
export const FocusConfigSchema = z.object({
  trapFocus: z.boolean().default(false),
  restoreFocus: z.boolean().default(true),
  skipLinks: z.array(z.nativeEnum(HEALTHCARE_SKIP_LINKS)).default([]),
  keyboardShortcuts: z.boolean().default(true),
  emergencyShortcuts: z.boolean().default(true),
  touchKeyboardCoexistence: z.boolean().default(true),
});

export type FocusConfig = z.infer<typeof FocusConfigSchema>;

// Keyboard Navigation State
export interface KeyboardNavigationState {
  isKeyboardUser: boolean;
  hasExternalKeyboard: boolean;
  currentFocusedElement: string | null;
  skipLinksVisible: boolean;
  shortcutsEnabled: boolean;
  focusTrapped: boolean;
  lastInteractionType: 'keyboard' | 'touch' | 'mouse' | null;
}

// Brazilian Portuguese Keyboard Navigation Labels
export const KEYBOARD_NAVIGATION_LABELS_PT_BR = {
  skipToMainContent: 'Pular para o conteúdo principal',
  skipToNavigation: 'Pular para a navegação',
  skipToPatientData: 'Pular para dados do paciente',
  skipToAppointments: 'Pular para consultas',
  skipToMedicalRecords: 'Pular para prontuários',
  skipToEmergency: 'Pular para emergência',
  skipToSearch: 'Pular para busca',
  skipToMedications: 'Pular para medicações',
  skipToVitalSigns: 'Pular para sinais vitais',
  keyboardShortcuts: 'Atalhos de teclado',
  emergencyShortcut: 'Atalho de emergência',
  patientSearch: 'Busca de pacientes',
  newAppointment: 'Nova consulta',
  medicationList: 'Lista de medicações',
  vitalSigns: 'Sinais vitais',
  medicalHistory: 'Histórico médico',
  savePatientData: 'Salvar dados do paciente',
  cancelOperation: 'Cancelar operação',
  nextPatient: 'Próximo paciente',
  previousPatient: 'Paciente anterior',
  focusSearch: 'Focar na busca',
} as const;

/**
 * Mobile Keyboard Navigation Hook
 */
export function useMobileKeyboardNavigation(config: Partial<FocusConfig> = {}) {
  const finalConfig = FocusConfigSchema.parse(config);
  const containerRef = useRef<HTMLElement>(null);
  const skipLinksRef = useRef<HTMLElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const [navigationState, setNavigationState] = useState<KeyboardNavigationState>({
    isKeyboardUser: false,
    hasExternalKeyboard: false,
    currentFocusedElement: null,
    skipLinksVisible: false,
    shortcutsEnabled: finalConfig.keyboardShortcuts,
    focusTrapped: finalConfig.trapFocus,
    lastInteractionType: null,
  });

  /**
   * Detect if user is using keyboard navigation
   */
  const detectKeyboardUser = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      setNavigationState(prev => ({
        ...prev,
        isKeyboardUser: true,
        lastInteractionType: 'keyboard',
        skipLinksVisible: true,
      }));
    }
  }, []);

  /**
   * Detect touch interactions
   */
  const detectTouchUser = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      lastInteractionType: 'touch',
      skipLinksVisible: false,
    }));
  }, []);

  /**
   * Detect external keyboard (Bluetooth keyboard on mobile)
   */
  const detectExternalKeyboard = useCallback((event: KeyboardEvent) => {
    // Heuristic: external keyboards typically have more key codes available
    const hasExternalKeyboard = event.code !== ''
      && (event.metaKey || event.ctrlKey || event.altKey)
      && window.innerWidth <= 768; // Mobile viewport

    setNavigationState(prev => ({
      ...prev,
      hasExternalKeyboard,
    }));
  }, []);

  /**
   * Get focusable elements within container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors),
    ) as HTMLElement[];

    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none'
        && style.visibility !== 'hidden'
        && !el.hasAttribute('aria-hidden')
      );
    });
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (!navigationState.shortcutsEnabled) return;

      const shortcut = `${event.ctrlKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.key}`;

      switch (shortcut) {
        case HEALTHCARE_KEYBOARD_SHORTCUTS.EMERGENCY_CONTACT:
          event.preventDefault();
          // Focus emergency contact section
          const emergencyElement = document.querySelector(
            '[data-emergency-contact]',
          ) as HTMLElement;
          emergencyElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.PATIENT_SEARCH:
          event.preventDefault();
          // Focus patient search
          const searchElement = document.querySelector(
            '[data-patient-search]',
          ) as HTMLElement;
          searchElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.NEW_APPOINTMENT:
          event.preventDefault();
          // Focus new appointment button
          const appointmentElement = document.querySelector(
            '[data-new-appointment]',
          ) as HTMLElement;
          appointmentElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.MEDICATION_LIST:
          event.preventDefault();
          // Focus medication list
          const medicationElement = document.querySelector(
            '[data-medication-list]',
          ) as HTMLElement;
          medicationElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.VITAL_SIGNS:
          event.preventDefault();
          // Focus vital signs section
          const vitalSignsElement = document.querySelector(
            '[data-vital-signs]',
          ) as HTMLElement;
          vitalSignsElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.SKIP_TO_CONTENT:
          event.preventDefault();
          // Focus main content
          const mainElement = document.querySelector(
            'main, [role="main"]',
          ) as HTMLElement;
          mainElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.SKIP_TO_NAVIGATION:
          event.preventDefault();
          // Focus navigation
          const navElement = document.querySelector(
            'nav, [role="navigation"]',
          ) as HTMLElement;
          navElement?.focus();
          break;

        case HEALTHCARE_KEYBOARD_SHORTCUTS.CANCEL_OPERATION:
          if (event.key === 'Escape') {
            event.preventDefault();
            // Handle escape key - close modals, cancel operations
            const activeModal = document.querySelector(
              '[role="dialog"][aria-hidden="false"]',
            ) as HTMLElement;
            if (activeModal) {
              const closeButton = activeModal.querySelector(
                '[data-close], [aria-label*="fechar"]',
              ) as HTMLElement;
              closeButton?.click();
            }
          }
          break;
      }
    },
    [navigationState.shortcutsEnabled],
  );

  /**
   * Handle focus trap
   */
  const handleFocusTrap = useCallback(
    (event: KeyboardEvent) => {
      if (!navigationState.focusTrapped || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [navigationState.focusTrapped, getFocusableElements],
  );

  /**
   * Create skip links
   */
  const createSkipLinks = useCallback(() => {
    if (finalConfig.skipLinks.length === 0) return null;

    const skipLinksData = finalConfig.skipLinks
      .map(skipLinkType => {
        switch (skipLinkType) {
          case HEALTHCARE_SKIP_LINKS.MAIN_CONTENT:
            return {
              href: '#main-content',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToMainContent,
              target: 'main, [role="main"]',
            };
          case HEALTHCARE_SKIP_LINKS.PATIENT_NAVIGATION:
            return {
              href: '#patient-navigation',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToNavigation,
              target: 'nav, [role="navigation"]',
            };
          case HEALTHCARE_SKIP_LINKS.APPOINTMENT_SECTION:
            return {
              href: '#appointments',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToAppointments,
              target: '[data-appointments]',
            };
          case HEALTHCARE_SKIP_LINKS.MEDICAL_RECORDS:
            return {
              href: '#medical-records',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToMedicalRecords,
              target: '[data-medical-records]',
            };
          case HEALTHCARE_SKIP_LINKS.EMERGENCY_SECTION:
            return {
              href: '#emergency',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToEmergency,
              target: '[data-emergency]',
            };
          case HEALTHCARE_SKIP_LINKS.SEARCH_FUNCTION:
            return {
              href: '#search',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToSearch,
              target: '[data-search], [role="search"]',
            };
          case HEALTHCARE_SKIP_LINKS.MEDICATION_SECTION:
            return {
              href: '#medications',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToMedications,
              target: '[data-medications]',
            };
          case HEALTHCARE_SKIP_LINKS.VITAL_SIGNS_SECTION:
            return {
              href: '#vital-signs',
              label: KEYBOARD_NAVIGATION_LABELS_PT_BR.skipToVitalSigns,
              target: '[data-vital-signs]',
            };
          default:
            return null;
        }
      })
      .filter(Boolean);

    return skipLinksData;
  }, [finalConfig.skipLinks]);

  /**
   * Handle skip link activation
   */
  const handleSkipLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const href = event.currentTarget.getAttribute('href');
      if (!href) return;

      const targetId = href.substring(1); // Remove #
      const targetElement = document.getElementById(targetId)
        || (document.querySelector(href) as HTMLElement);

      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  /**
   * Focus management
   */
  const focusElement = useCallback((element: HTMLElement | string) => {
    const targetElement = typeof element === 'string'
      ? (document.querySelector(element) as HTMLElement)
      : element;

    if (targetElement) {
      targetElement.focus();
      setNavigationState(prev => ({
        ...prev,
        currentFocusedElement: targetElement.id || targetElement.tagName,
      }));
    }
  }, []);

  /**
   * Restore focus to last focused element
   */
  const restoreFocus = useCallback(() => {
    if (finalConfig.restoreFocus && lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus();
    }
  }, [finalConfig.restoreFocus]);

  /**
   * Trap focus within container
   */
  const trapFocus = useCallback(() => {
    setNavigationState(prev => ({ ...prev, focusTrapped: true }));
  }, []);

  /**
   * Release focus trap
   */
  const releaseFocusTrap = useCallback(() => {
    setNavigationState(prev => ({ ...prev, focusTrapped: false }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      detectKeyboardUser(event);
      detectExternalKeyboard(event);
      handleKeyboardShortcuts(event);
      handleFocusTrap(event);
    };

    const handleTouchStart = () => {
      detectTouchUser();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) {
        lastFocusedElementRef.current = event.target;
        setNavigationState(prev => ({
          ...prev,
          currentFocusedElement: (event.target as HTMLElement | null)?.id
            || (event.target as HTMLElement | null)?.tagName
            || 'unknown',
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [
    detectKeyboardUser,
    detectExternalKeyboard,
    detectTouchUser,
    handleKeyboardShortcuts,
    handleFocusTrap,
  ]);

  // Update focusable elements when container changes
  useEffect(() => {
    if (containerRef.current) {
      focusableElementsRef.current = getFocusableElements();
    }
  }, [getFocusableElements]);

  return {
    // Refs
    containerRef,
    skipLinksRef,

    // State
    navigationState,

    // Skip links
    skipLinks: createSkipLinks(),
    handleSkipLinkClick,

    // Focus management
    focusElement,
    restoreFocus,
    trapFocus,
    releaseFocusTrap,
    getFocusableElements,

    // Utilities
    isKeyboardUser: navigationState.isKeyboardUser,
    hasExternalKeyboard: navigationState.hasExternalKeyboard,
    skipLinksVisible: navigationState.skipLinksVisible,
    shortcutsEnabled: navigationState.shortcutsEnabled,

    // Healthcare-specific
    healthcareShortcuts: HEALTHCARE_KEYBOARD_SHORTCUTS,
    keyboardLabels: KEYBOARD_NAVIGATION_LABELS_PT_BR,
  };
}

export default useMobileKeyboardNavigation;
