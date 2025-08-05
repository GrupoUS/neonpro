/**
 * NeonPro - Accessibility Utilities
 * WCAG 2.1 AA compliant utility functions for healthcare accessibility
 *
 * Features:
 * - ARIA label management
 * - Keyboard navigation helpers
 * - Screen reader announcements
 * - Focus management utilities
 * - Color contrast validation
 * - Form accessibility patterns
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipLinks =
  exports.FormA11y =
  exports.HealthcareA11y =
  exports.ColorContrast =
  exports.KeyboardNavigation =
  exports.AriaAttributes =
  exports.FocusManager =
  exports.KEYBOARD_KEYS =
  exports.WCAG_CONTRAST_RATIOS =
    void 0;
exports.generateAriaId = generateAriaId;
exports.announceToScreenReader = announceToScreenReader;
// WCAG 2.1 AA Color Contrast Ratios
exports.WCAG_CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3.0,
  NON_TEXT: 3.0,
  ENHANCED_AA: 7.0, // AAA level for critical healthcare content
};
// Keyboard Navigation Constants
exports.KEYBOARD_KEYS = {
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
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
};
/**
 * Generate unique ARIA IDs with optional prefix
 * Ensures unique IDs across components for ARIA relationships
 */
var idCounter = 0;
function generateAriaId(prefix) {
  if (prefix === void 0) {
    prefix = "aria";
  }
  return "".concat(prefix, "-").concat(++idCounter, "-").concat(Date.now());
}
/**
 * Announce message to screen readers
 * Uses live regions for dynamic content updates
 */
function announceToScreenReader(message, priority) {
  if (priority === void 0) {
    priority = "polite";
  }
  // Create or get existing live region
  var liveRegion = document.getElementById("sr-live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "sr-live-region";
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    liveRegion.style.width = "1px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";
    document.body.appendChild(liveRegion);
  }
  // Update aria-live attribute if priority changed
  if (liveRegion.getAttribute("aria-live") !== priority) {
    liveRegion.setAttribute("aria-live", priority);
  }
  // Clear and set new message
  liveRegion.textContent = "";
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}
/**
 * Focus Management Utilities
 * Essential for healthcare forms and modal dialogs
 */
var FocusManager = /** @class */ (() => {
  function FocusManager() {}
  /**
   * Trap focus within a container element
   * Critical for modal dialogs and form wizards
   */
  FocusManager.trapFocus = (containerRef) => {
    if (!containerRef.current) return;
    var container = containerRef.current;
    var focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];
    var handleKeyDown = (e) => {
      if (e.key === exports.KEYBOARD_KEYS.TAB) {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement === null || lastElement === void 0 ? void 0 : lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus();
          }
        }
      }
    };
    container.addEventListener("keydown", handleKeyDown);
    // Focus first element
    firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus();
    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  };
  /**
   * Save current focus and return restore function
   */
  FocusManager.saveFocus = function () {
    var activeElement = document.activeElement;
    this.focusStack.push(activeElement);
    return () => {
      var elementToFocus = this.focusStack.pop();
      elementToFocus === null || elementToFocus === void 0 ? void 0 : elementToFocus.focus();
    };
  };
  /**
   * Set focus with announcement for screen readers
   */
  FocusManager.setFocusWithAnnouncement = (element, announcement) => {
    element.focus();
    if (announcement) {
      announceToScreenReader(announcement, "assertive");
    }
  };
  FocusManager.focusStack = [];
  return FocusManager;
})();
exports.FocusManager = FocusManager;
/**
 * ARIA Attribute Generators
 * Standardized ARIA patterns for healthcare forms
 */
exports.AriaAttributes = {
  /**
   * Generate form field ARIA attributes
   */
  formField: (fieldId, labelId, descriptionId, errorId, required) => {
    if (required === void 0) {
      required = false;
    }
    var attributes = {
      id: fieldId,
      "aria-required": required,
    };
    if (labelId) {
      attributes["aria-labelledby"] = labelId;
    }
    var describedBy = [];
    if (descriptionId) describedBy.push(descriptionId);
    if (errorId) describedBy.push(errorId);
    if (describedBy.length > 0) {
      attributes["aria-describedby"] = describedBy.join(" ");
    }
    return attributes;
  },
  /**
   * Generate button ARIA attributes
   */
  button: (expanded, controls, pressed, label) => {
    var attributes = {};
    if (expanded !== undefined) {
      attributes["aria-expanded"] = expanded;
    }
    if (controls) {
      attributes["aria-controls"] = controls;
    }
    if (pressed !== undefined) {
      attributes["aria-pressed"] = pressed;
    }
    if (label) {
      attributes["aria-label"] = label;
    }
    return attributes;
  },
  /**
   * Generate modal/dialog ARIA attributes
   */
  modal: (titleId, descriptionId) =>
    __assign(
      { role: "dialog", "aria-modal": true, "aria-labelledby": titleId },
      descriptionId && { "aria-describedby": descriptionId },
    ),
  /**
   * Generate status/live region attributes
   */
  status: (priority, atomic) => {
    if (priority === void 0) {
      priority = "polite";
    }
    if (atomic === void 0) {
      atomic = true;
    }
    return {
      role: "status",
      "aria-live": priority,
      "aria-atomic": atomic,
    };
  },
};
/**
 * Keyboard Navigation Helpers
 * Standardized keyboard interaction patterns
 */
exports.KeyboardNavigation = {
  /**
   * Handle arrow key navigation in lists/menus
   */
  handleArrowNavigation: (event, items, currentIndex, onIndexChange, circular) => {
    var _a;
    if (circular === void 0) {
      circular = true;
    }
    var newIndex = currentIndex;
    switch (event.key) {
      case exports.KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = circular
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
        break;
      case exports.KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = circular
          ? (currentIndex - 1 + items.length) % items.length
          : Math.max(currentIndex - 1, 0);
        break;
      case exports.KEYBOARD_KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case exports.KEYBOARD_KEYS.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
      (_a = items[newIndex]) === null || _a === void 0 ? void 0 : _a.focus();
    }
  },
  /**
   * Handle Enter/Space activation
   */
  handleActivation: (event, callback) => {
    if (event.key === exports.KEYBOARD_KEYS.ENTER || event.key === exports.KEYBOARD_KEYS.SPACE) {
      event.preventDefault();
      callback();
    }
  },
};
/**
 * Color Contrast Utilities
 * WCAG 2.1 AA compliant color validation
 */
exports.ColorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getRelativeLuminance: (hex) => {
    var rgb = parseInt(hex.slice(1), 16);
    var r = (rgb >> 16) & 0xff;
    var g = (rgb >> 8) & 0xff;
    var b = (rgb >> 0) & 0xff;
    var _a = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }),
      rs = _a[0],
      gs = _a[1],
      bs = _a[2];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1, color2) => {
    var lum1 = exports.ColorContrast.getRelativeLuminance(color1);
    var lum2 = exports.ColorContrast.getRelativeLuminance(color2);
    var lighter = Math.max(lum1, lum2);
    var darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },
  /**
   * Check if color combination meets WCAG standards
   */
  meetsWCAG: (foreground, background, level) => {
    if (level === void 0) {
      level = "NORMAL_TEXT";
    }
    var ratio = exports.ColorContrast.getContrastRatio(foreground, background);
    return ratio >= exports.WCAG_CONTRAST_RATIOS[level];
  },
};
/**
 * Healthcare-Specific Accessibility Patterns
 */
exports.HealthcareA11y = {
  /**
   * Announce appointment status changes
   */
  announceAppointmentStatus: (patientName, appointmentTime, status) => {
    var message = "Compromiso de "
      .concat(patientName, " \u00E0s ")
      .concat(appointmentTime, " atualizado para ")
      .concat(status);
    announceToScreenReader(message, "assertive");
  },
  /**
   * Announce form validation errors for healthcare forms
   */
  announceFormErrors: (errors) => {
    var errorCount = Object.keys(errors).length;
    var message =
      errorCount === 1
        ? "1 erro encontrado no formulário"
        : "".concat(errorCount, " erros encontrados no formul\u00E1rio");
    announceToScreenReader(message, "assertive");
  },
  /**
   * Generate ARIA label for medical appointment
   */
  appointmentAriaLabel: (patientName, service, date, time, status) =>
    "Consulta de "
      .concat(patientName, ", ")
      .concat(service, ", ")
      .concat(date, " \u00E0s ")
      .concat(time, ", status ")
      .concat(status),
  /**
   * Generate accessible date/time picker labels
   */
  dateTimePickerLabels: (selectedDate, selectedTime) => {
    var dateLabel = selectedDate
      ? "Data selecionada: ".concat(selectedDate.toLocaleDateString("pt-BR"))
      : "Selecione uma data";
    var timeLabel = selectedTime
      ? "Hor\u00E1rio selecionado: ".concat(selectedTime)
      : "Selecione um horário";
    return { dateLabel: dateLabel, timeLabel: timeLabel };
  },
};
/**
 * Form Accessibility Enhancer
 * Automatic accessibility improvements for form elements
 */
exports.FormA11y = {
  /**
   * Enhance form with accessibility attributes
   */
  enhanceForm: (formElement) => {
    // Add form role if not present
    if (!formElement.getAttribute("role")) {
      formElement.setAttribute("role", "form");
    }
    // Find and enhance form fields
    var fields = formElement.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      var _a;
      var htmlField = field;
      // Add required aria-required attribute
      if (htmlField.hasAttribute("required") && !htmlField.getAttribute("aria-required")) {
        htmlField.setAttribute("aria-required", "true");
      }
      // Link labels and error messages
      var fieldId = htmlField.id;
      if (fieldId) {
        var label = formElement.querySelector('label[for="'.concat(fieldId, '"]'));
        var errorElement = formElement.querySelector('[data-error-for="'.concat(fieldId, '"]'));
        var describedBy = [];
        if (
          errorElement &&
          ((_a = errorElement.textContent) === null || _a === void 0 ? void 0 : _a.trim())
        ) {
          errorElement.id = errorElement.id || "".concat(fieldId, "-error");
          describedBy.push(errorElement.id);
          htmlField.setAttribute("aria-invalid", "true");
        } else {
          htmlField.setAttribute("aria-invalid", "false");
        }
        if (describedBy.length > 0) {
          htmlField.setAttribute("aria-describedby", describedBy.join(" "));
        }
      }
    });
  },
  /**
   * Create accessible error summary
   */
  createErrorSummary: (errors) => {
    var summary = document.createElement("div");
    summary.className = "error-summary";
    summary.setAttribute("role", "alert");
    summary.setAttribute("aria-labelledby", "error-summary-title");
    summary.setAttribute("tabindex", "-1");
    var title = document.createElement("h2");
    title.id = "error-summary-title";
    title.textContent = "Erro no formulário";
    summary.appendChild(title);
    var list = document.createElement("ul");
    Object.entries(errors).forEach((_a) => {
      var field = _a[0],
        message = _a[1];
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#".concat(field);
      link.textContent = message;
      link.onclick = (e) => {
        e.preventDefault();
        var targetField = document.getElementById(field);
        targetField === null || targetField === void 0 ? void 0 : targetField.focus();
      };
      item.appendChild(link);
      list.appendChild(item);
    });
    summary.appendChild(list);
    return summary;
  },
};
/**
 * Skip Link Component Helper
 * Essential for keyboard navigation
 */
exports.SkipLinks = {
  /**
   * Create skip navigation links
   */
  createSkipLinks: (links) => {
    var container = document.createElement("div");
    container.className =
      "skip-links sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50";
    container.setAttribute("role", "navigation");
    container.setAttribute("aria-label", "Links de navegação rápida");
    links.forEach((_a) => {
      var href = _a.href,
        text = _a.text;
      var link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      link.className =
        "bg-primary text-primary-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2";
      container.appendChild(link);
    });
    return container;
  },
};
// Export all utilities as default
exports.default = {
  generateAriaId: generateAriaId,
  announceToScreenReader: announceToScreenReader,
  FocusManager: FocusManager,
  AriaAttributes: exports.AriaAttributes,
  KeyboardNavigation: exports.KeyboardNavigation,
  ColorContrast: exports.ColorContrast,
  HealthcareA11y: exports.HealthcareA11y,
  FormA11y: exports.FormA11y,
  SkipLinks: exports.SkipLinks,
  WCAG_CONTRAST_RATIOS: exports.WCAG_CONTRAST_RATIOS,
  KEYBOARD_KEYS: exports.KEYBOARD_KEYS,
};
