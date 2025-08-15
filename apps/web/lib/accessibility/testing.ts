// Accessibility Testing Utilities for NeonPro
// Tools for automated and manual accessibility testing

import { ContrastChecker, FocusManager } from './wcag-compliance';

export interface AccessibilityTestResult {
  passed: boolean;
  level: 'A' | 'AA' | 'AAA';
  message: string;
  element?: HTMLElement;
  suggestion?: string;
}

export interface AccessibilityAuditReport {
  score: number; // 0-100
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: AccessibilityTestResult[];
  summary: {
    colorContrast: AccessibilityTestResult[];
    focusManagement: AccessibilityTestResult[];
    ariaLabels: AccessibilityTestResult[];
    keyboardNavigation: AccessibilityTestResult[];
    semanticStructure: AccessibilityTestResult[];
  };
}

export class AccessibilityTester {
  private static instance: AccessibilityTester;
  private results: AccessibilityTestResult[] = [];

  static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  // Test color contrast ratios
  testColorContrast(
    container: HTMLElement = document.body
  ): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];

    // Get all text elements
    const textElements = container.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, button, a, label, input, textarea'
    );

    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyles = window.getComputedStyle(htmlElement);
      const color = computedStyles.color;
      const backgroundColor = computedStyles.backgroundColor;

      // Convert colors to hex for contrast calculation
      const foregroundHex = this.rgbToHex(color);
      const backgroundHex = this.rgbToHex(backgroundColor);

      if (foregroundHex && backgroundHex) {
        const contrast = ContrastChecker.calculateContrastRatio(
          foregroundHex,
          backgroundHex
        );
        const fontSize = Number.parseInt(computedStyles.fontSize, 10);
        const fontWeight =
          Number.parseInt(computedStyles.fontWeight, 10) || 400;
        const isLargeText =
          fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

        const meetsAA = ContrastChecker.meetsWCAGAA(
          foregroundHex,
          backgroundHex,
          isLargeText
        );
        const meetsAAA = contrast >= (isLargeText ? 4.5 : 7);

        results.push({
          passed: meetsAA,
          level: meetsAAA ? 'AAA' : meetsAA ? 'AA' : 'A',
          message: `Contraste ${contrast.toFixed(2)}:1 ${meetsAA ? 'atende' : 'não atende'} WCAG AA`,
          element: htmlElement,
          suggestion: meetsAA
            ? undefined
            : `Aumentar contraste para pelo menos ${isLargeText ? '3:1' : '4.5:1'} (WCAG AA)`,
        });
      }
    });

    return results;
  }

  // Test focus management
  testFocusManagement(
    container: HTMLElement = document.body
  ): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];

    // Test focusable elements
    const focusableElements = FocusManager.getFocusableElements(container);

    results.push({
      passed: focusableElements.length > 0,
      level: 'A',
      message: `${focusableElements.length} elementos focusáveis encontrados`,
      suggestion:
        focusableElements.length === 0
          ? 'Adicione elementos focusáveis para navegação por teclado'
          : undefined,
    });

    // Test tab order
    let previousTabIndex = -1;
    let hasValidTabOrder = true;

    focusableElements.forEach((element, _index) => {
      const tabIndex = element.tabIndex;
      if (tabIndex >= 0 && tabIndex < previousTabIndex) {
        hasValidTabOrder = false;
      }
      previousTabIndex = tabIndex >= 0 ? tabIndex : previousTabIndex;
    });

    results.push({
      passed: hasValidTabOrder,
      level: 'A',
      message: hasValidTabOrder
        ? 'Ordem de tabulação está correta'
        : 'Ordem de tabulação possui problemas',
      suggestion: hasValidTabOrder
        ? undefined
        : 'Verificar e corrigir a ordem dos tabindex',
    });

    // Test focus indicators
    const elementsWithFocusStyle = Array.from(
      container.querySelectorAll('*:focus, *:focus-visible, .focus\\:ring-2')
    ).length;

    results.push({
      passed: elementsWithFocusStyle > 0 || focusableElements.length === 0,
      level: 'AA',
      message: `${elementsWithFocusStyle} elementos com indicador de foco`,
      suggestion:
        elementsWithFocusStyle === 0 && focusableElements.length > 0
          ? 'Adicionar estilos de foco visíveis para elementos focusáveis'
          : undefined,
    });

    return results;
  }

  // Test ARIA labels and roles
  testAriaLabels(
    container: HTMLElement = document.body
  ): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];

    // Test buttons without accessible names
    const buttons = container.querySelectorAll('button, [role="button"]');
    let buttonsWithoutNames = 0;

    buttons.forEach((button) => {
      const htmlButton = button as HTMLElement;
      const hasAccessibleName =
        htmlButton.textContent?.trim() ||
        htmlButton.getAttribute('aria-label') ||
        htmlButton.getAttribute('aria-labelledby') ||
        htmlButton.getAttribute('title');

      if (!hasAccessibleName) {
        buttonsWithoutNames++;
      }
    });

    results.push({
      passed: buttonsWithoutNames === 0,
      level: 'A',
      message:
        buttonsWithoutNames === 0
          ? 'Todos os botões possuem nomes acessíveis'
          : `${buttonsWithoutNames} botões sem nomes acessíveis`,
      suggestion:
        buttonsWithoutNames > 0
          ? 'Adicionar aria-label, texto visível ou aria-labelledby aos botões'
          : undefined,
    });

    // Test form labels
    const inputs = container.querySelectorAll('input, select, textarea');
    let inputsWithoutLabels = 0;

    inputs.forEach((input) => {
      const htmlInput = input as HTMLElement;
      const id = htmlInput.id;
      const hasLabel =
        (id && container.querySelector(`label[for="${id}"]`)) ||
        htmlInput.getAttribute('aria-label') ||
        htmlInput.getAttribute('aria-labelledby') ||
        htmlInput.closest('label');

      if (!hasLabel) {
        inputsWithoutLabels++;
      }
    });

    results.push({
      passed: inputsWithoutLabels === 0,
      level: 'A',
      message:
        inputsWithoutLabels === 0
          ? 'Todos os campos possuem rótulos'
          : `${inputsWithoutLabels} campos sem rótulos`,
      suggestion:
        inputsWithoutLabels > 0
          ? 'Adicionar labels ou aria-label aos campos de formulário'
          : undefined,
    });

    // Test images without alt text
    const images = container.querySelectorAll('img');
    let imagesWithoutAlt = 0;

    images.forEach((img) => {
      if (!(img.getAttribute('alt') || img.getAttribute('aria-hidden'))) {
        imagesWithoutAlt++;
      }
    });

    results.push({
      passed: imagesWithoutAlt === 0,
      level: 'A',
      message:
        imagesWithoutAlt === 0
          ? 'Todas as imagens possuem texto alternativo'
          : `${imagesWithoutAlt} imagens sem texto alternativo`,
      suggestion:
        imagesWithoutAlt > 0
          ? 'Adicionar atributo alt às imagens ou aria-hidden="true" para imagens decorativas'
          : undefined,
    });

    return results;
  }

  // Test keyboard navigation
  testKeyboardNavigation(
    container: HTMLElement = document.body
  ): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];

    // Check for keyboard event handlers
    const elementsWithKeyboardHandlers = container.querySelectorAll(
      '[onkeydown], [onkeyup], [onkeypress]'
    );

    // Check for elements that might need keyboard support
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [onclick], [tabindex]:not([tabindex="-1"])'
    );

    results.push({
      passed:
        elementsWithKeyboardHandlers.length > 0 ||
        interactiveElements.length === 0,
      level: 'A',
      message: `${elementsWithKeyboardHandlers.length} elementos com suporte a teclado encontrados`,
      suggestion:
        elementsWithKeyboardHandlers.length === 0 &&
        interactiveElements.length > 0
          ? 'Adicionar suporte a navegação por teclado para elementos interativos'
          : undefined,
    });

    // Test for custom interactive elements with proper roles
    const customInteractive = container.querySelectorAll(
      '[onclick]:not(button):not(a):not(input):not([role])'
    );

    results.push({
      passed: customInteractive.length === 0,
      level: 'A',
      message:
        customInteractive.length === 0
          ? 'Elementos interativos customizados possuem roles apropriados'
          : `${customInteractive.length} elementos interativos sem roles`,
      suggestion:
        customInteractive.length > 0
          ? 'Adicionar role="button" ou similar aos elementos interativos customizados'
          : undefined,
    });

    return results;
  }

  // Test semantic structure
  testSemanticStructure(
    container: HTMLElement = document.body
  ): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];

    // Test heading hierarchy
    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );
    let hasValidHeadingStructure = true;

    for (let i = 1; i < headings.length; i++) {
      const currentLevel = Number.parseInt(headings[i].tagName.charAt(1), 10);
      const previousLevel = Number.parseInt(
        headings[i - 1].tagName.charAt(1),
        10
      );

      if (currentLevel > previousLevel + 1) {
        hasValidHeadingStructure = false;
        break;
      }
    }

    results.push({
      passed: hasValidHeadingStructure || headings.length <= 1,
      level: 'AA',
      message: hasValidHeadingStructure
        ? 'Hierarquia de títulos está correta'
        : 'Hierarquia de títulos possui saltos',
      suggestion: hasValidHeadingStructure
        ? undefined
        : 'Corrigir hierarquia de títulos (h1, h2, h3...) sem pular níveis',
    });

    // Test landmarks
    const landmarks = container.querySelectorAll(
      'main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
    );

    results.push({
      passed: landmarks.length > 0,
      level: 'AA',
      message: `${landmarks.length} marcos (landmarks) encontrados`,
      suggestion:
        landmarks.length === 0
          ? 'Adicionar elementos semânticos (main, nav, header) ou roles ARIA'
          : undefined,
    });

    return results;
  }

  // Run complete accessibility audit
  auditAccessibility(
    container: HTMLElement = document.body
  ): AccessibilityAuditReport {
    const colorContrast = this.testColorContrast(container);
    const focusManagement = this.testFocusManagement(container);
    const ariaLabels = this.testAriaLabels(container);
    const keyboardNavigation = this.testKeyboardNavigation(container);
    const semanticStructure = this.testSemanticStructure(container);

    const results = [
      ...colorContrast,
      ...focusManagement,
      ...ariaLabels,
      ...keyboardNavigation,
      ...semanticStructure,
    ];

    const passedTests = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    const score =
      totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

    return {
      score,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      results,
      summary: {
        colorContrast,
        focusManagement,
        ariaLabels,
        keyboardNavigation,
        semanticStructure,
      },
    };
  }

  // Manual testing checklist
  getManualTestingChecklist(): string[] {
    return [
      '✓ Navegar toda a aplicação usando apenas o teclado (Tab, Shift+Tab, Enter, Setas)',
      '✓ Testar com leitor de tela (NVDA/JAWS no Windows, VoiceOver no Mac)',
      '✓ Verificar zoom até 200% sem perda de funcionalidade',
      '✓ Testar em modo de alto contraste',
      '✓ Verificar se animações respeitam prefers-reduced-motion',
      '✓ Testar formulários com validação de erros',
      '✓ Verificar se todos os links têm propósito claro',
      '✓ Testar em diferentes tamanhos de tela',
      '✓ Verificar se o conteúdo é linear e lógico',
      '✓ Testar com usuários reais que usam tecnologias assistivas',
    ];
  }

  // Screen reader testing simulation
  simulateScreenReader(element: HTMLElement): string {
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const label =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title') ||
      'sem rótulo';

    const description = element.getAttribute('aria-describedby');
    const expanded = element.getAttribute('aria-expanded');
    const selected = element.getAttribute('aria-selected');
    const checked =
      element.getAttribute('aria-checked') ||
      (element as HTMLInputElement).checked?.toString();

    let announcement = `${role}: ${label}`;

    if (expanded)
      announcement += `, ${expanded === 'true' ? 'expandido' : 'recolhido'}`;
    if (selected)
      announcement += `, ${selected === 'true' ? 'selecionado' : 'não selecionado'}`;
    if (checked)
      announcement += `, ${checked === 'true' ? 'marcado' : 'desmarcado'}`;
    if (description) announcement += `, ${description}`;

    return announcement;
  }

  // Helper method to convert RGB to Hex
  private rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = Number.parseInt(match[1], 10);
      const g = Number.parseInt(match[2], 10);
      const b = Number.parseInt(match[3], 10);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Handle hex colors directly
    if (rgb.startsWith('#')) {
      return rgb;
    }

    return null;
  }

  // Generate accessibility report
  generateReport(auditReport: AccessibilityAuditReport): string {
    let report = '# Relatório de Acessibilidade NeonPro\n\n';
    report += `**Pontuação:** ${auditReport.score}/100\n`;
    report += `**Testes:** ${auditReport.passedTests}/${auditReport.totalTests} aprovados\n\n`;

    if (auditReport.failedTests > 0) {
      report += `## ⚠️ Problemas Encontrados (${auditReport.failedTests})\n\n`;

      auditReport.results
        .filter((r) => !r.passed)
        .forEach((result) => {
          report += `- **${result.level}**: ${result.message}\n`;
          if (result.suggestion) {
            report += `  - *Sugestão*: ${result.suggestion}\n`;
          }
        });

      report += '\n';
    }

    report += `## ✅ Testes Bem-sucedidos (${auditReport.passedTests})\n\n`;

    auditReport.results
      .filter((r) => r.passed)
      .forEach((result) => {
        report += `- **${result.level}**: ${result.message}\n`;
      });

    report += '\n## 📋 Checklist de Testes Manuais\n\n';
    this.getManualTestingChecklist().forEach((item) => {
      report += `${item}\n`;
    });

    return report;
  }
}

// Export singleton instance
export const accessibilityTester = AccessibilityTester.getInstance();
