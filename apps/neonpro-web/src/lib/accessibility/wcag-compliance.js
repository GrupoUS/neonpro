// WCAG 2.1 AA Compliance utilities for NeonPro
// Healthcare accessibility standards implementation
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibilityConfig =
  exports.HealthcareA11y =
  exports.AriaUtils =
  exports.KeyboardNavigation =
  exports.ContrastChecker =
  exports.FocusManager =
  exports.CONTRAST_RATIOS =
    void 0;
// Color contrast ratios for WCAG AA compliance
exports.CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
};
// Focus management utilities
var FocusManager = /** @class */ (() => {
  function FocusManager() {}
  FocusManager.trapFocus = function (element) {
    this.trapStack.push(element);
    var focusableElements = this.getFocusableElements(element);
    if (focusableElements.length === 0) return;
    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];
    element.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      if (e.key === "Escape") {
        this.releaseFocus();
      }
    });
    firstElement.focus();
  };
  FocusManager.releaseFocus = function () {
    if (this.trapStack.length > 0) {
      this.trapStack.pop();
    }
  };
  FocusManager.getFocusableElements = (container) => {
    var focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
    ].join(",");
    return Array.from(container.querySelectorAll(focusableSelectors));
  };
  FocusManager.announceToScreenReader = (message, priority) => {
    if (priority === void 0) {
      priority = "polite";
    }
    var announcer = document.createElement("div");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;
    document.body.appendChild(announcer);
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };
  FocusManager.trapStack = [];
  return FocusManager;
})();
exports.FocusManager = FocusManager;
// Color contrast utilities
var ContrastChecker = /** @class */ (() => {
  function ContrastChecker() {}
  ContrastChecker.calculateLuminance = (r, g, b) => {
    var _a = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }),
      rs = _a[0],
      gs = _a[1],
      bs = _a[2];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  ContrastChecker.calculateContrastRatio = function (color1, color2) {
    var rgb1 = this.hexToRgb(color1);
    var rgb2 = this.hexToRgb(color2);
    if (!rgb1 || !rgb2) return 0;
    var lum1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    var lum2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
    var lighter = Math.max(lum1, lum2);
    var darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  ContrastChecker.hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };
  ContrastChecker.meetsWCAGAA = function (foreground, background, isLargeText) {
    if (isLargeText === void 0) {
      isLargeText = false;
    }
    var ratio = this.calculateContrastRatio(foreground, background);
    var required = isLargeText
      ? exports.CONTRAST_RATIOS.AA_LARGE
      : exports.CONTRAST_RATIOS.AA_NORMAL;
    return ratio >= required;
  };
  return ContrastChecker;
})();
exports.ContrastChecker = ContrastChecker;
// Keyboard navigation utilities
var KeyboardNavigation = /** @class */ (() => {
  function KeyboardNavigation() {}
  KeyboardNavigation.handleArrowNavigation = (event, items, currentIndex) => {
    var newIndex = currentIndex;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }
    if (newIndex !== currentIndex) {
      items[newIndex].focus();
    }
    return newIndex;
  };
  KeyboardNavigation.createRovingTabIndex = function (container, selector) {
    var items = container.querySelectorAll(selector);
    var currentIndex = 0;
    // Set initial tab indexes
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });
    // Handle keyboard navigation
    container.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        currentIndex = this.handleArrowNavigation(event, items, currentIndex);
        // Update tab indexes
        items.forEach((item, index) => {
          item.tabIndex = index === currentIndex ? 0 : -1;
        });
      }
    });
    // Handle focus events
    items.forEach((item, index) => {
      item.addEventListener("focus", () => {
        currentIndex = index;
        items.forEach((otherItem, otherIndex) => {
          otherItem.tabIndex = otherIndex === index ? 0 : -1;
        });
      });
    });
  };
  return KeyboardNavigation;
})();
exports.KeyboardNavigation = KeyboardNavigation;
// ARIA utilities
var AriaUtils = /** @class */ (() => {
  function AriaUtils() {}
  AriaUtils.setExpanded = (element, expanded) => {
    element.setAttribute("aria-expanded", expanded.toString());
  };
  AriaUtils.setSelected = (element, selected) => {
    element.setAttribute("aria-selected", selected.toString());
  };
  AriaUtils.setPressed = (element, pressed) => {
    element.setAttribute("aria-pressed", pressed.toString());
  };
  AriaUtils.setHidden = (element, hidden) => {
    if (hidden) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");
    }
  };
  AriaUtils.describedBy = (element, descriptionId) => {
    element.setAttribute("aria-describedby", descriptionId);
  };
  AriaUtils.labelledBy = (element, labelId) => {
    element.setAttribute("aria-labelledby", labelId);
  };
  return AriaUtils;
})();
exports.AriaUtils = AriaUtils;
// Healthcare-specific accessibility patterns
var HealthcareA11y = /** @class */ (() => {
  function HealthcareA11y() {}
  HealthcareA11y.announceAppointmentStatus = (status, patientName) => {
    var message = patientName
      ? "Consulta para ".concat(patientName, ": ").concat(status)
      : "Status da consulta: ".concat(status);
    FocusManager.announceToScreenReader(message, "assertive");
  };
  HealthcareA11y.announceFormErrors = (errors) => {
    if (errors.length === 0) return;
    var message =
      errors.length === 1
        ? "Erro no formul\u00E1rio: ".concat(errors[0])
        : "".concat(errors.length, " erros no formul\u00E1rio: ").concat(errors.join(", "));
    FocusManager.announceToScreenReader(message, "assertive");
  };
  HealthcareA11y.announceLoadingState = (isLoading, context) => {
    if (context === void 0) {
      context = "";
    }
    var message = isLoading
      ? "Carregando".concat(context ? " ".concat(context) : "", "...")
      : "".concat(context, " carregado com sucesso");
    FocusManager.announceToScreenReader(message, "polite");
  };
  HealthcareA11y.createErrorSummary = (errors) => {
    var summary = document.createElement("div");
    summary.role = "alert";
    summary.className = "error-summary";
    summary.tabIndex = -1;
    var title = document.createElement("h2");
    title.textContent = "Corrija os seguintes erros:";
    summary.appendChild(title);
    var list = document.createElement("ul");
    Object.entries(errors).forEach((_a) => {
      var field = _a[0],
        error = _a[1];
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#".concat(field);
      link.textContent = error;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        var targetField = document.getElementById(field);
        if (targetField) {
          targetField.focus();
        }
      });
      item.appendChild(link);
      list.appendChild(item);
    });
    summary.appendChild(list);
    return summary;
  };
  return HealthcareA11y;
})();
exports.HealthcareA11y = HealthcareA11y;
exports.accessibilityConfig = {
  level: { A: true, AA: true, AAA: false },
  announcements: true,
  highContrast: false,
  reducedMotion: false,
  focusIndicators: true,
  keyboardNavigation: true,
};
