/**
 * Accessibility Utilities for Healthcare Applications
 *
 * Provides comprehensive accessibility support for healthcare interfaces
 * with WCAG 2.1 AA compliance and medical-specific considerations.
 *
 * @fileoverview Accessibility utilities and helpers for healthcare UI
 */

import { useEffect, useRef } from "react";

// ARIA live region types for healthcare announcements
export type AriaLiveType = "off" | "polite" | "assertive";

// Healthcare-specific accessibility context
export interface HealthcareA11yContext {
  isEmergencyMode: boolean;
  patientDataVisible: boolean;
  highContrastMode: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
}

// WCAG 2.1 compliance levels
export enum WCAGLevel {
  A = "A",
  AA = "AA",
  AAA = "AAA",
}

// Healthcare UI priority levels for announcements
export enum HealthcarePriority {
  EMERGENCY = "emergency", // Critical alerts (patient safety)
  HIGH = "high", // Important medical information
  MEDIUM = "medium", // General healthcare updates
  LOW = "low", // Non-critical information
}

/**
 * Announces messages to screen readers with healthcare priority consideration
 */
export function announceToScreenReader(
  message: string,
  priority: HealthcarePriority = HealthcarePriority.MEDIUM,
  delay: number = 100,
): void {
  // Use assertive for emergency/high priority, polite for others
  const liveType: AriaLiveType =
    priority === HealthcarePriority.EMERGENCY ||
    priority === HealthcarePriority.HIGH
      ? "assertive"
      : "polite";

  setTimeout(() => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", liveType);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className =
      "sr-only absolute -top-full left-0 w-1 h-1 overflow-hidden";

    // Add priority context for medical announcements
    const priorityPrefix =
      priority === HealthcarePriority.EMERGENCY
        ? "ALERTA MÉDICO: "
        : priority === HealthcarePriority.HIGH
          ? "IMPORTANTE: "
          : "";

    announcement.textContent = priorityPrefix + message;
    document.body.appendChild(announcement);

    // Clean up after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }, delay);
}

/**
 * Custom hook for managing focus in healthcare forms
 */
export function useHealthcareFocus(shouldFocus: boolean = false) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      // Small delay to ensure element is rendered
      const timeoutId = setTimeout(() => {
        elementRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
    return undefined; // Explicit return for non-active case
  }, [shouldFocus]);

  return elementRef;
}

/**
 * Focus trap for modal dialogs and emergency alerts
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) {return;}

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") {return;}

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // For emergency mode, require confirmation before closing
        const isEmergencyModal =
          container.getAttribute("data-emergency") === "true";
        if (isEmergencyModal) {
          const confirmed = window.confirm(
            "Tem certeza que deseja fechar este alerta de emergência?",
          );
          if (!confirmed) {
            event.preventDefault();
            return;
          }
        }

        // Focus the element that triggered the modal
        const triggerElement = document.querySelector(
          "[data-modal-trigger]",
        ) as HTMLElement;
        triggerElement?.focus();
      }
    }

    container.addEventListener("keydown", handleTabKey);
    container.addEventListener("keydown", handleEscapeKey);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
      container.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Keyboard navigation support for healthcare data tables
 */
export function useTableNavigation() {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) {return;}

    function handleKeyDown(event: KeyboardEvent) {
      const currentTable = tableRef.current;
      if (!currentTable || !currentTable.contains(event.target as Node)) {return;}

      const currentCell = event.target as HTMLElement;
      const row = currentCell.closest("tr");
      const allRows = Array.from(currentTable.querySelectorAll("tbody tr"));
      const allCellsInRow = Array.from(row?.querySelectorAll("td, th") || []);

      const currentRowIndex = allRows.indexOf(row as HTMLTableRowElement);
      const currentCellIndex = allCellsInRow.indexOf(currentCell);

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (currentRowIndex > 0) {
            const prevRow = allRows[currentRowIndex - 1];
            if (prevRow) {
              const targetCell = prevRow.querySelectorAll("td, th")[
                currentCellIndex
              ] as HTMLElement;
              targetCell?.focus();
            }
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          if (currentRowIndex < allRows.length - 1) {
            const nextRow = allRows[currentRowIndex + 1];
            if (nextRow) {
              const targetCell = nextRow.querySelectorAll("td, th")[
                currentCellIndex
              ] as HTMLElement;
              targetCell?.focus();
            }
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          if (currentCellIndex > 0) {
            const targetCell = allCellsInRow[
              currentCellIndex - 1
            ] as HTMLElement;
            targetCell?.focus();
          }
          break;

        case "ArrowRight":
          event.preventDefault();
          if (currentCellIndex < allCellsInRow.length - 1) {
            const targetCell = allCellsInRow[
              currentCellIndex + 1
            ] as HTMLElement;
            targetCell?.focus();
          }
          break;

        case "Home":
          event.preventDefault();
          {
            const firstCellInRow = allCellsInRow[0] as HTMLElement;
            firstCellInRow?.focus();
          }
          break;

        case "End":
          event.preventDefault();
          {
            const lastCellInRow = allCellsInRow[
              allCellsInRow.length - 1
            ] as HTMLElement;
            lastCellInRow?.focus();
          }
          break;
      }
    }

    table.addEventListener("keydown", handleKeyDown);

    return () => {
      table.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return tableRef;
}

/**
 * Generates accessible IDs for form elements
 */
export function generateAccessibleId(prefix: string = "healthcare"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates color contrast for healthcare interfaces
 */
export function validateColorContrast(
  foregroundColor: string,
  backgroundColor: string,
  targetLevel: WCAGLevel = WCAGLevel.AA,
): { isValid: boolean; ratio: number; minimumRatio: number } {
  // Convert colors to RGB values (simplified implementation)
  // In a real implementation, you'd use a proper color library
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1] ?? "0", 16),
          g: parseInt(result[2] ?? "0", 16),
          b: parseInt(result[3] ?? "0", 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  function getLuminance(r: number, g: number, b: number) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
  }

  const fg = hexToRgb(foregroundColor);
  const bg = hexToRgb(backgroundColor);

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  const minimumRatios = {
    [WCAGLevel.A]: 3,
    [WCAGLevel.AA]: 4.5,
    [WCAGLevel.AAA]: 7,
  };

  const minimumRatio = minimumRatios[targetLevel];

  return {
    isValid: ratio >= minimumRatio,
    ratio: Math.round(ratio * 100) / 100,
    minimumRatio,
  };
}

/**
 * Creates accessible error messages for form fields
 */
export function createAccessibleErrorMessage(
  fieldId: string,
  errors: string[],
  priority: HealthcarePriority = HealthcarePriority.MEDIUM,
): HTMLElement {
  const errorContainer = document.createElement("div");
  errorContainer.id = `${fieldId}-error`;
  errorContainer.className =
    "healthcare-error-message text-sm text-destructive mt-1";
  errorContainer.setAttribute(
    "aria-live",
    priority === HealthcarePriority.HIGH ||
      priority === HealthcarePriority.EMERGENCY
      ? "assertive"
      : "polite",
  );
  errorContainer.setAttribute("role", "alert");

  if (errors.length > 0) {
    errorContainer.textContent = errors.join(". ");
  }

  return errorContainer;
}

/**
 * Healthcare-specific keyboard shortcuts
 */
export const healthcareKeyboardShortcuts = {
  // Emergency shortcuts
  emergency: {
    "Alt+E": "Ativar modo de emergência",
    "Alt+H": "Chamar ajuda médica",
    "Ctrl+Shift+S": "Salvar e notificar equipe médica",
  },

  // Navigation shortcuts
  navigation: {
    "Alt+P": "Ir para dados do paciente",
    "Alt+M": "Ir para histórico médico",
    "Alt+A": "Ir para agendamentos",
    "Alt+R": "Ir para resultados de exames",
  },

  // Form shortcuts
  forms: {
    "Ctrl+Enter": "Salvar formulário",
    Escape: "Cancelar edição",
    F2: "Editar campo selecionado",
    F5: "Atualizar dados",
  },
};

/**
 * Keyboard shortcut handler for healthcare applications
 */
export function useHealthcareKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  isEnabled: boolean = true,
) {
  useEffect(() => {
    if (!isEnabled) {return;}

    function handleKeyDown(event: KeyboardEvent) {
      const key = [
        event.ctrlKey && "Ctrl",
        event.altKey && "Alt",
        event.shiftKey && "Shift",
        event.key,
      ]
        .filter(Boolean)
        .join("+");

      const handler = shortcuts[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, isEnabled]);
}

/**
 * Screen reader utility for complex healthcare data
 */
export function createScreenReaderDescription(
  data: Record<string, unknown>,
  type: "patient" | "appointment" | "medication" | "result",
): string {
  const descriptions = {
    patient: (data: Record<string, unknown>) =>
      `Paciente: ${data.name || "Nome não informado"}. ` +
      `Idade: ${data.age || "Não informada"}. ` +
      `Prontuário: ${data.medicalRecord || "Não informado"}.`,

    appointment: (data: Record<string, unknown>) =>
      `Consulta: ${data.date || "Data não informada"} às ${data.time || "Horário não informado"}. ` +
      `Especialidade: ${data.specialty || "Não informada"}. ` +
      `Status: ${data.status || "Não informado"}.`,

    medication: (data: Record<string, unknown>) =>
      `Medicamento: ${data.name || "Nome não informado"}. ` +
      `Dosagem: ${data.dosage || "Não informada"}. ` +
      `Frequência: ${data.frequency || "Não informada"}.`,

    result: (data: Record<string, unknown>) =>
      `Exame: ${data.type || "Tipo não informado"}. ` +
      `Data: ${data.date || "Data não informada"}. ` +
      `Status: ${data.status || "Status não informado"}.`,
  };

  return descriptions[type](data);
}

/**
 * High contrast mode utilities for healthcare interfaces
 */
export function useHighContrastMode() {
  const getHighContrastPreference = () => {
    if (typeof window === "undefined") {return false;}
    return (
      window.matchMedia("(prefers-contrast: high)").matches ||
      localStorage.getItem("healthcare-high-contrast") === "true"
    );
  };

  const setHighContrastMode = (enabled: boolean) => {
    if (typeof window === "undefined") {return;}

    localStorage.setItem("healthcare-high-contrast", enabled.toString());
    document.documentElement.classList.toggle("high-contrast", enabled);

    // Announce change to screen readers
    announceToScreenReader(
      enabled
        ? "Modo de alto contraste ativado"
        : "Modo de alto contraste desativado",
      HealthcarePriority.MEDIUM,
    );
  };

  return {
    isHighContrast: getHighContrastPreference(),
    setHighContrastMode,
  };
}

/**
 * Motion reduction utilities for healthcare interfaces
 */
export function useReducedMotion() {
  const prefersReducedMotion = () => {
    if (typeof window === "undefined") {return false;}
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  return {
    prefersReducedMotion: prefersReducedMotion(),
  };
}
