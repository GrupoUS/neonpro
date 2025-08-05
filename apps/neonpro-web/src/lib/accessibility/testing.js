"use strict";
// Accessibility Testing Utilities for NeonPro
// Tools for automated and manual accessibility testing
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibilityTester = exports.AccessibilityTester = void 0;
var wcag_compliance_1 = require("./wcag-compliance");
var AccessibilityTester = /** @class */ (function () {
  function AccessibilityTester() {
    this.results = [];
  }
  AccessibilityTester.getInstance = function () {
    if (!this.instance) {
      this.instance = new AccessibilityTester();
    }
    return this.instance;
  };
  // Test color contrast ratios
  AccessibilityTester.prototype.testColorContrast = function (container) {
    var _this = this;
    if (container === void 0) {
      container = document.body;
    }
    var results = [];
    // Get all text elements
    var textElements = container.querySelectorAll(
      "p, span, div, h1, h2, h3, h4, h5, h6, button, a, label, input, textarea",
    );
    textElements.forEach(function (element) {
      var htmlElement = element;
      var computedStyles = window.getComputedStyle(htmlElement);
      var color = computedStyles.color;
      var backgroundColor = computedStyles.backgroundColor;
      // Convert colors to hex for contrast calculation
      var foregroundHex = _this.rgbToHex(color);
      var backgroundHex = _this.rgbToHex(backgroundColor);
      if (foregroundHex && backgroundHex) {
        var contrast = wcag_compliance_1.ContrastChecker.calculateContrastRatio(
          foregroundHex,
          backgroundHex,
        );
        var fontSize = parseInt(computedStyles.fontSize);
        var fontWeight = parseInt(computedStyles.fontWeight) || 400;
        var isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        var meetsAA = wcag_compliance_1.ContrastChecker.meetsWCAGAA(
          foregroundHex,
          backgroundHex,
          isLargeText,
        );
        var meetsAAA = contrast >= (isLargeText ? 4.5 : 7);
        results.push({
          passed: meetsAA,
          level: meetsAAA ? "AAA" : meetsAA ? "AA" : "A",
          message: "Contraste "
            .concat(contrast.toFixed(2), ":1 ")
            .concat(meetsAA ? "atende" : "não atende", " WCAG AA"),
          element: htmlElement,
          suggestion: !meetsAA
            ? "Aumentar contraste para pelo menos ".concat(
                isLargeText ? "3:1" : "4.5:1",
                " (WCAG AA)",
              )
            : undefined,
        });
      }
    });
    return results;
  };
  // Test focus management
  AccessibilityTester.prototype.testFocusManagement = function (container) {
    if (container === void 0) {
      container = document.body;
    }
    var results = [];
    // Test focusable elements
    var focusableElements = wcag_compliance_1.FocusManager.getFocusableElements(container);
    results.push({
      passed: focusableElements.length > 0,
      level: "A",
      message: "".concat(focusableElements.length, " elementos focus\u00E1veis encontrados"),
      suggestion:
        focusableElements.length === 0
          ? "Adicione elementos focusáveis para navegação por teclado"
          : undefined,
    });
    // Test tab order
    var previousTabIndex = -1;
    var hasValidTabOrder = true;
    focusableElements.forEach(function (element, index) {
      var tabIndex = element.tabIndex;
      if (tabIndex >= 0 && tabIndex < previousTabIndex) {
        hasValidTabOrder = false;
      }
      previousTabIndex = tabIndex >= 0 ? tabIndex : previousTabIndex;
    });
    results.push({
      passed: hasValidTabOrder,
      level: "A",
      message: hasValidTabOrder
        ? "Ordem de tabulação está correta"
        : "Ordem de tabulação possui problemas",
      suggestion: !hasValidTabOrder ? "Verificar e corrigir a ordem dos tabindex" : undefined,
    });
    // Test focus indicators
    var elementsWithFocusStyle = Array.from(
      container.querySelectorAll("*:focus, *:focus-visible, .focus\\:ring-2"),
    ).length;
    results.push({
      passed: elementsWithFocusStyle > 0 || focusableElements.length === 0,
      level: "AA",
      message: "".concat(elementsWithFocusStyle, " elementos com indicador de foco"),
      suggestion:
        elementsWithFocusStyle === 0 && focusableElements.length > 0
          ? "Adicionar estilos de foco visíveis para elementos focusáveis"
          : undefined,
    });
    return results;
  };
  // Test ARIA labels and roles
  AccessibilityTester.prototype.testAriaLabels = function (container) {
    if (container === void 0) {
      container = document.body;
    }
    var results = [];
    // Test buttons without accessible names
    var buttons = container.querySelectorAll('button, [role="button"]');
    var buttonsWithoutNames = 0;
    buttons.forEach(function (button) {
      var _a;
      var htmlButton = button;
      var hasAccessibleName =
        ((_a = htmlButton.textContent) === null || _a === void 0 ? void 0 : _a.trim()) ||
        htmlButton.getAttribute("aria-label") ||
        htmlButton.getAttribute("aria-labelledby") ||
        htmlButton.getAttribute("title");
      if (!hasAccessibleName) {
        buttonsWithoutNames++;
      }
    });
    results.push({
      passed: buttonsWithoutNames === 0,
      level: "A",
      message:
        buttonsWithoutNames === 0
          ? "Todos os botões possuem nomes acessíveis"
          : "".concat(buttonsWithoutNames, " bot\u00F5es sem nomes acess\u00EDveis"),
      suggestion:
        buttonsWithoutNames > 0
          ? "Adicionar aria-label, texto visível ou aria-labelledby aos botões"
          : undefined,
    });
    // Test form labels
    var inputs = container.querySelectorAll("input, select, textarea");
    var inputsWithoutLabels = 0;
    inputs.forEach(function (input) {
      var htmlInput = input;
      var id = htmlInput.id;
      var hasLabel =
        (id && container.querySelector('label[for="'.concat(id, '"]'))) ||
        htmlInput.getAttribute("aria-label") ||
        htmlInput.getAttribute("aria-labelledby") ||
        htmlInput.closest("label");
      if (!hasLabel) {
        inputsWithoutLabels++;
      }
    });
    results.push({
      passed: inputsWithoutLabels === 0,
      level: "A",
      message:
        inputsWithoutLabels === 0
          ? "Todos os campos possuem rótulos"
          : "".concat(inputsWithoutLabels, " campos sem r\u00F3tulos"),
      suggestion:
        inputsWithoutLabels > 0
          ? "Adicionar labels ou aria-label aos campos de formulário"
          : undefined,
    });
    // Test images without alt text
    var images = container.querySelectorAll("img");
    var imagesWithoutAlt = 0;
    images.forEach(function (img) {
      if (!img.getAttribute("alt") && !img.getAttribute("aria-hidden")) {
        imagesWithoutAlt++;
      }
    });
    results.push({
      passed: imagesWithoutAlt === 0,
      level: "A",
      message:
        imagesWithoutAlt === 0
          ? "Todas as imagens possuem texto alternativo"
          : "".concat(imagesWithoutAlt, " imagens sem texto alternativo"),
      suggestion:
        imagesWithoutAlt > 0
          ? 'Adicionar atributo alt às imagens ou aria-hidden="true" para imagens decorativas'
          : undefined,
    });
    return results;
  };
  // Test keyboard navigation
  AccessibilityTester.prototype.testKeyboardNavigation = function (container) {
    if (container === void 0) {
      container = document.body;
    }
    var results = [];
    // Check for keyboard event handlers
    var elementsWithKeyboardHandlers = container.querySelectorAll(
      "[onkeydown], [onkeyup], [onkeypress]",
    );
    // Check for elements that might need keyboard support
    var interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [onclick], [tabindex]:not([tabindex="-1"])',
    );
    results.push({
      passed: elementsWithKeyboardHandlers.length > 0 || interactiveElements.length === 0,
      level: "A",
      message: "".concat(
        elementsWithKeyboardHandlers.length,
        " elementos com suporte a teclado encontrados",
      ),
      suggestion:
        elementsWithKeyboardHandlers.length === 0 && interactiveElements.length > 0
          ? "Adicionar suporte a navegação por teclado para elementos interativos"
          : undefined,
    });
    // Test for custom interactive elements with proper roles
    var customInteractive = container.querySelectorAll(
      "[onclick]:not(button):not(a):not(input):not([role])",
    );
    results.push({
      passed: customInteractive.length === 0,
      level: "A",
      message:
        customInteractive.length === 0
          ? "Elementos interativos customizados possuem roles apropriados"
          : "".concat(customInteractive.length, " elementos interativos sem roles"),
      suggestion:
        customInteractive.length > 0
          ? 'Adicionar role="button" ou similar aos elementos interativos customizados'
          : undefined,
    });
    return results;
  };
  // Test semantic structure
  AccessibilityTester.prototype.testSemanticStructure = function (container) {
    if (container === void 0) {
      container = document.body;
    }
    var results = [];
    // Test heading hierarchy
    var headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    var hasValidHeadingStructure = true;
    for (var i = 1; i < headings.length; i++) {
      var currentLevel = parseInt(headings[i].tagName.charAt(1));
      var previousLevel = parseInt(headings[i - 1].tagName.charAt(1));
      if (currentLevel > previousLevel + 1) {
        hasValidHeadingStructure = false;
        break;
      }
    }
    results.push({
      passed: hasValidHeadingStructure || headings.length <= 1,
      level: "AA",
      message: hasValidHeadingStructure
        ? "Hierarquia de títulos está correta"
        : "Hierarquia de títulos possui saltos",
      suggestion: !hasValidHeadingStructure
        ? "Corrigir hierarquia de títulos (h1, h2, h3...) sem pular níveis"
        : undefined,
    });
    // Test landmarks
    var landmarks = container.querySelectorAll(
      'main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
    );
    results.push({
      passed: landmarks.length > 0,
      level: "AA",
      message: "".concat(landmarks.length, " marcos (landmarks) encontrados"),
      suggestion:
        landmarks.length === 0
          ? "Adicionar elementos semânticos (main, nav, header) ou roles ARIA"
          : undefined,
    });
    return results;
  };
  // Run complete accessibility audit
  AccessibilityTester.prototype.auditAccessibility = function (container) {
    if (container === void 0) {
      container = document.body;
    }
    var colorContrast = this.testColorContrast(container);
    var focusManagement = this.testFocusManagement(container);
    var ariaLabels = this.testAriaLabels(container);
    var keyboardNavigation = this.testKeyboardNavigation(container);
    var semanticStructure = this.testSemanticStructure(container);
    var results = __spreadArray(
      __spreadArray(
        __spreadArray(
          __spreadArray(__spreadArray([], colorContrast, true), focusManagement, true),
          ariaLabels,
          true,
        ),
        keyboardNavigation,
        true,
      ),
      semanticStructure,
      true,
    );
    var passedTests = results.filter(function (r) {
      return r.passed;
    }).length;
    var totalTests = results.length;
    var score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;
    return {
      score: score,
      totalTests: totalTests,
      passedTests: passedTests,
      failedTests: totalTests - passedTests,
      results: results,
      summary: {
        colorContrast: colorContrast,
        focusManagement: focusManagement,
        ariaLabels: ariaLabels,
        keyboardNavigation: keyboardNavigation,
        semanticStructure: semanticStructure,
      },
    };
  };
  // Manual testing checklist
  AccessibilityTester.prototype.getManualTestingChecklist = function () {
    return [
      "✓ Navegar toda a aplicação usando apenas o teclado (Tab, Shift+Tab, Enter, Setas)",
      "✓ Testar com leitor de tela (NVDA/JAWS no Windows, VoiceOver no Mac)",
      "✓ Verificar zoom até 200% sem perda de funcionalidade",
      "✓ Testar em modo de alto contraste",
      "✓ Verificar se animações respeitam prefers-reduced-motion",
      "✓ Testar formulários com validação de erros",
      "✓ Verificar se todos os links têm propósito claro",
      "✓ Testar em diferentes tamanhos de tela",
      "✓ Verificar se o conteúdo é linear e lógico",
      "✓ Testar com usuários reais que usam tecnologias assistivas",
    ];
  };
  // Screen reader testing simulation
  AccessibilityTester.prototype.simulateScreenReader = function (element) {
    var _a, _b;
    var role = element.getAttribute("role") || element.tagName.toLowerCase();
    var label =
      element.getAttribute("aria-label") ||
      element.getAttribute("aria-labelledby") ||
      ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) ||
      element.getAttribute("title") ||
      "sem rótulo";
    var description = element.getAttribute("aria-describedby");
    var expanded = element.getAttribute("aria-expanded");
    var selected = element.getAttribute("aria-selected");
    var checked =
      element.getAttribute("aria-checked") ||
      ((_b = element.checked) === null || _b === void 0 ? void 0 : _b.toString());
    var announcement = "".concat(role, ": ").concat(label);
    if (expanded) announcement += ", ".concat(expanded === "true" ? "expandido" : "recolhido");
    if (selected)
      announcement += ", ".concat(selected === "true" ? "selecionado" : "não selecionado");
    if (checked) announcement += ", ".concat(checked === "true" ? "marcado" : "desmarcado");
    if (description) announcement += ", ".concat(description);
    return announcement;
  };
  // Helper method to convert RGB to Hex
  AccessibilityTester.prototype.rgbToHex = function (rgb) {
    var match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      var r = parseInt(match[1]);
      var g = parseInt(match[2]);
      var b = parseInt(match[3]);
      return "#"
        .concat(r.toString(16).padStart(2, "0"))
        .concat(g.toString(16).padStart(2, "0"))
        .concat(b.toString(16).padStart(2, "0"));
    }
    // Handle hex colors directly
    if (rgb.startsWith("#")) {
      return rgb;
    }
    return null;
  };
  // Generate accessibility report
  AccessibilityTester.prototype.generateReport = function (auditReport) {
    var report = "# Relat\u00F3rio de Acessibilidade NeonPro\n\n";
    report += "**Pontua\u00E7\u00E3o:** ".concat(auditReport.score, "/100\n");
    report += "**Testes:** "
      .concat(auditReport.passedTests, "/")
      .concat(auditReport.totalTests, " aprovados\n\n");
    if (auditReport.failedTests > 0) {
      report += "## \u26A0\uFE0F Problemas Encontrados (".concat(auditReport.failedTests, ")\n\n");
      auditReport.results
        .filter(function (r) {
          return !r.passed;
        })
        .forEach(function (result) {
          report += "- **".concat(result.level, "**: ").concat(result.message, "\n");
          if (result.suggestion) {
            report += "  - *Sugest\u00E3o*: ".concat(result.suggestion, "\n");
          }
        });
      report += "\n";
    }
    report += "## \u2705 Testes Bem-sucedidos (".concat(auditReport.passedTests, ")\n\n");
    auditReport.results
      .filter(function (r) {
        return r.passed;
      })
      .forEach(function (result) {
        report += "- **".concat(result.level, "**: ").concat(result.message, "\n");
      });
    report += "\n## \uD83D\uDCCB Checklist de Testes Manuais\n\n";
    this.getManualTestingChecklist().forEach(function (item) {
      report += "".concat(item, "\n");
    });
    return report;
  };
  return AccessibilityTester;
})();
exports.AccessibilityTester = AccessibilityTester;
// Export singleton instance
exports.accessibilityTester = AccessibilityTester.getInstance();
