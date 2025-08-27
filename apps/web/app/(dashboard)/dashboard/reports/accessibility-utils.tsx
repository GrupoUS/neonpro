"use client";

// WCAG 2.1 AA Accessibility Utilities for Healthcare Reports Center
// Ensures compliance with medical accessibility standards

import { useEffect } from "react";

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
} as const;

// ARIA role definitions for healthcare contexts
export const HEALTHCARE_ARIA_ROLES = {
  REPORT_GRID: "grid",
  REPORT_CARD: "gridcell",
  METRIC_GROUP: "group",
  ALERT_REGION: "alert",
  STATUS_REGION: "status",
  NAVIGATION: "navigation",
  MAIN_CONTENT: "main",
  COMPLEMENTARY: "complementary",
} as const;

// Screen reader announcements for healthcare actions
export const HEALTHCARE_ANNOUNCEMENTS = {
  REPORT_GENERATING: "Relatório sendo gerado. Por favor aguarde.",
  REPORT_READY: "Relatório pronto para download.",
  EXPORT_STARTED: "Exportação iniciada.",
  EXPORT_COMPLETED: "Arquivo exportado com sucesso.",
  SCHEDULE_CREATED: "Agendamento criado com sucesso.",
  LGPD_COMPLIANCE_ACTIVE: "Modo de conformidade LGPD ativo.",
  ERROR_OCCURRED: "Erro ocorrido. Verifique os detalhes.",
  SEARCH_RESULTS_UPDATED: (count: number) =>
    `${count} relatórios encontrados para sua busca.`,
  CATEGORY_SELECTED: (category: string) => `Categoria ${category} selecionada.`,
} as const;

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static trapFocus(container: HTMLElement) {
    const focusableElements = FocusManager.getFocusableElements(container);
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_KEYS.TAB) {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }

  static saveFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      FocusManager.focusStack.push(activeElement);
    }
  }

  static restoreFocus() {
    const elementToFocus = FocusManager.focusStack.pop();
    if (elementToFocus) {
      elementToFocus.focus();
    }
  }

  private static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
    ].join(", ");

    return [...container.querySelectorAll(focusableSelectors)].filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
  }
}

// Screen reader announcement utility
export class ScreenReaderAnnouncer {
  private static announcer: HTMLElement | null = undefined;

  static initialize() {
    if (ScreenReaderAnnouncer.announcer) {
      return;
    }

    ScreenReaderAnnouncer.announcer = document.createElement("div");
    ScreenReaderAnnouncer.announcer.setAttribute("aria-live", "polite");
    ScreenReaderAnnouncer.announcer.setAttribute("aria-atomic", "true");
    ScreenReaderAnnouncer.announcer.setAttribute("id", "sr-announcer");
    ScreenReaderAnnouncer.announcer.style.position = "absolute";
    ScreenReaderAnnouncer.announcer.style.left = "-10000px";
    ScreenReaderAnnouncer.announcer.style.width = "1px";
    ScreenReaderAnnouncer.announcer.style.height = "1px";
    ScreenReaderAnnouncer.announcer.style.overflow = "hidden";

    document.body.append(ScreenReaderAnnouncer.announcer);
  }

  static announce(
    message: string,
    priority: "polite" | "assertive" = "polite",
  ) {
    ScreenReaderAnnouncer.initialize();

    if (ScreenReaderAnnouncer.announcer) {
      ScreenReaderAnnouncer.announcer.setAttribute("aria-live", priority);
      ScreenReaderAnnouncer.announcer.textContent = message;

      // Clear after announcement to allow repeat announcements
      setTimeout(() => {
        if (ScreenReaderAnnouncer.announcer) {
          ScreenReaderAnnouncer.announcer.textContent = "";
        }
      }, 1000);
    }
  }
}

// High contrast utilities for healthcare environments
export class HighContrastManager {
  static isHighContrastMode(): boolean {
    return (
      window.matchMedia("(prefers-contrast: high)").matches ||
      window.matchMedia("(forced-colors: active)").matches
    );
  }

  static applyHighContrastStyles() {
    if (HighContrastManager.isHighContrastMode()) {
      document.documentElement.setAttribute("data-high-contrast", "true");
    }
  }

  static getHighContrastColors() {
    return {
      background: "#000000",
      text: "#ffffff",
      border: "#ffffff",
      focus: "#ffff00",
      error: "#ff0000",
      success: "#00ff00",
      warning: "#ffff00",
    };
  }
}

// Reduced motion utilities
export class MotionManager {
  static respectsReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  static getMotionSettings() {
    return {
      enableAnimations: !MotionManager.respectsReducedMotion(),
      transitionDuration: MotionManager.respectsReducedMotion()
        ? "0ms"
        : "300ms",
      animationDuration: MotionManager.respectsReducedMotion()
        ? "0ms"
        : "500ms",
    };
  }
}

// Color contrast utilities
export class ContrastChecker {
  static calculateContrast(color1: string, color2: string): number {
    const luminance1 = ContrastChecker.getLuminance(color1);
    const luminance2 = ContrastChecker.getLuminance(color2);

    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  static meetsWCAGAA(color1: string, color2: string): boolean {
    const contrast = ContrastChecker.calculateContrast(color1, color2);
    return contrast >= 4.5; // WCAG AA standard
  }

  static meetsWCAGAAA(color1: string, color2: string): boolean {
    const contrast = ContrastChecker.calculateContrast(color1, color2);
    return contrast >= 7; // WCAG AAA standard
  }

  private static getLuminance(color: string): number {
    const rgb = ContrastChecker.hexToRgb(color);
    if (!rgb) {
      return 0;
    }

    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r =
      rsRGB <= 0.039_28 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
    const g =
      gsRGB <= 0.039_28 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
    const b =
      bsRGB <= 0.039_28 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static hexToRgb(
    hex: string,
  ): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : undefined;
  }
}

// Form accessibility utilities
export class FormAccessibility {
  static associateLabelWithField(labelId: string, fieldId: string) {
    const label = document.getElementById(labelId);
    const field = document.getElementById(fieldId);

    if (label && field) {
      label.setAttribute("for", fieldId);
      field.setAttribute("aria-labelledby", labelId);
    }
  }

  static addFieldDescription(fieldId: string, descriptionId: string) {
    const field = document.getElementById(fieldId);
    const description = document.getElementById(descriptionId);

    if (field && description) {
      const existingDescribedBy = field.getAttribute("aria-describedby") || "";
      const newDescribedBy = existingDescribedBy
        ? `${existingDescribedBy} ${descriptionId}`
        : descriptionId;

      field.setAttribute("aria-describedby", newDescribedBy);
    }
  }

  static markFieldAsRequired(fieldId: string, isRequired = true) {
    const field = document.getElementById(fieldId);

    if (field) {
      field.setAttribute("aria-required", isRequired.toString());
      if (isRequired) {
        field.setAttribute("required", "");
      } else {
        field.removeAttribute("required");
      }
    }
  }

  static setFieldError(fieldId: string, errorId: string, errorMessage: string) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);

    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", errorId);
    }

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.setAttribute("role", "alert");
      errorElement.setAttribute("aria-live", "assertive");
    }

    // Announce error to screen readers
    ScreenReaderAnnouncer.announce(`Erro: ${errorMessage}`, "assertive");
  }

  static clearFieldError(fieldId: string, errorId: string) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);

    if (field) {
      field.setAttribute("aria-invalid", "false");
      field.removeAttribute("aria-describedby");
    }

    if (errorElement) {
      errorElement.textContent = "";
      errorElement.removeAttribute("role");
      errorElement.removeAttribute("aria-live");
    }
  }
}

// Table accessibility utilities for report data
export class TableAccessibility {
  static addTableHeaders(tableId: string) {
    const table = document.getElementById(tableId);
    if (!table) {
      return;
    }

    // Add scope attributes to headers
    const headers = table.querySelectorAll("th");
    headers.forEach((header, index) => {
      if (index === 0) {
        header.setAttribute("scope", "row");
      } else {
        header.setAttribute("scope", "col");
      }
    });

    // Add caption if not present
    const caption = table.querySelector("caption");
    if (!caption) {
      const newCaption = document.createElement("caption");
      newCaption.textContent = "Dados do relatório de saúde";
      newCaption.className = "sr-only";
      table.insertBefore(newCaption, table.firstChild);
    }
  }

  static addSortableTableAria(
    tableId: string,
    columnIndex: number,
    sortDirection: "asc" | "desc",
  ) {
    const table = document.getElementById(tableId);
    if (!table) {
      return;
    }

    const headers = table.querySelectorAll("th");
    headers.forEach((header, index) => {
      if (index === columnIndex) {
        header.setAttribute(
          "aria-sort",
          sortDirection === "asc" ? "ascending" : "descending",
        );
      } else {
        header.setAttribute("aria-sort", "none");
      }
    });
  }
}

// React hooks for accessibility
export function useAnnouncements() {
  useEffect(() => {
    ScreenReaderAnnouncer.initialize();
  }, []);

  return {
    announce: ScreenReaderAnnouncer.announce,
  };
}

export function useFocusManagement() {
  return {
    trapFocus: FocusManager.trapFocus,
    saveFocus: FocusManager.saveFocus,
    restoreFocus: FocusManager.restoreFocus,
  };
}

export function useHighContrast() {
  useEffect(() => {
    HighContrastManager.applyHighContrastStyles();

    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    const handleChange = () => {
      HighContrastManager.applyHighContrastStyles();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return {
    isHighContrast: HighContrastManager.isHighContrastMode(),
    colors: HighContrastManager.getHighContrastColors(),
  };
}

export function useReducedMotion() {
  const motionSettings = MotionManager.getMotionSettings();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      // Update motion settings when preference changes
      const root = document.documentElement;
      if (MotionManager.respectsReducedMotion()) {
        root.style.setProperty("--animation-duration", "0ms");
        root.style.setProperty("--transition-duration", "0ms");
      } else {
        root.style.setProperty("--animation-duration", "500ms");
        root.style.setProperty("--transition-duration", "300ms");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    handleChange(); // Apply initial settings

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return motionSettings;
}

// Skip links component for complex interfaces
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:rounded focus:bg-blue-600 focus:p-2 focus:text-white">
      <a className="mr-4" href="#main-content">
        Pular para conteúdo principal
      </a>
      <a className="mr-4" href="#report-categories">
        Pular para categorias de relatórios
      </a>
      <a className="mr-4" href="#search-filters">
        Pular para filtros de busca
      </a>
      <a className="mr-4" href="#export-actions">
        Pular para ações de exportação
      </a>
    </div>
  );
}

// Healthcare-specific accessibility validation
export class HealthcareAccessibilityValidator {
  static validateReportCard(cardElement: HTMLElement): string[] {
    const issues: string[] = [];

    // Check for proper headings
    const heading = cardElement.querySelector("h3, h4, h5, h6");
    if (!heading) {
      issues.push("Cartão de relatório deve ter um cabeçalho");
    }

    // Check for actionable elements
    const buttons = cardElement.querySelectorAll('button, [role="button"]');
    buttons.forEach((button, index) => {
      const accessibleName =
        button.getAttribute("aria-label") ||
        button.getAttribute("aria-labelledby") ||
        button.textContent?.trim();

      if (!accessibleName) {
        issues.push(`Botão ${index + 1} precisa de nome acessível`);
      }
    });

    // Check for compliance indicators
    const complianceInfo = cardElement.querySelector("[data-compliance]");
    if (complianceInfo && !complianceInfo.getAttribute("aria-label")) {
      issues.push(
        "Informações de conformidade precisam de descrição acessível",
      );
    }

    return issues;
  }

  static validateExportModal(modalElement: HTMLElement): string[] {
    const issues: string[] = [];

    // Check modal structure
    if (!modalElement.getAttribute("role")) {
      modalElement.setAttribute("role", "dialog");
    }

    if (!modalElement.getAttribute("aria-modal")) {
      modalElement.setAttribute("aria-modal", "true");
    }

    // Check for close button
    const closeButton = modalElement.querySelector(
      '[aria-label*="fechar"], [aria-label*="close"]',
    );
    if (!closeButton) {
      issues.push("Modal precisa de botão de fechar com rótulo acessível");
    }

    // Check for initial focus
    const focusableElements = modalElement.querySelectorAll(
      "button:not([disabled]), input:not([disabled]), select:not([disabled])",
    );

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      if (document.activeElement !== firstElement) {
        issues.push("Modal deve definir foco inicial");
      }
    }

    return issues;
  }
}

// Initialize accessibility features
export function initializeAccessibility() {
  // Initialize screen reader announcer
  ScreenReaderAnnouncer.initialize();

  // Apply high contrast if needed
  HighContrastManager.applyHighContrastStyles();

  // Set up reduced motion preferences
  const motionSettings = MotionManager.getMotionSettings();
  const root = document.documentElement;
  root.style.setProperty(
    "--animation-duration",
    motionSettings.animationDuration,
  );
  root.style.setProperty(
    "--transition-duration",
    motionSettings.transitionDuration,
  );

  // Add global keyboard event listeners for accessibility shortcuts
  document.addEventListener("keydown", (e) => {
    // Alt + R: Focus on reports
    if (e.altKey && e.key === "r") {
      e.preventDefault();
      const reportsSection = document.querySelector(
        "#report-categories",
      ) as HTMLElement;
      if (reportsSection) {
        reportsSection.focus();
        ScreenReaderAnnouncer.announce("Seção de relatórios focada");
      }
    }

    // Alt + S: Focus on search
    if (e.altKey && e.key === "s") {
      e.preventDefault();
      const searchInput = document.querySelector(
        'input[placeholder*="Buscar"]',
      ) as HTMLElement;
      if (searchInput) {
        searchInput.focus();
        ScreenReaderAnnouncer.announce("Campo de busca focado");
      }
    }
  });
}
