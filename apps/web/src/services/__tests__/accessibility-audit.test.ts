/**
 * Accessibility Audit Service Tests
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessibilityAuditService, WCAG_LEVELS } from "../accessibility-audit";

// Mock DOM methods
const mockGetComputedStyle = vi.fn();

beforeEach(() => {
  // Mock window.getComputedStyle
  Object.defineProperty(window, "getComputedStyle", {
    value: mockGetComputedStyle,
    writable: true,
  });

  // Mock document methods
  document.querySelector = vi.fn();
  document.querySelectorAll = vi.fn();

  // Mock document.documentElement
  Object.defineProperty(document, "documentElement", {
    value: {
      getAttribute: vi.fn().mockReturnValue("pt-BR"),
    },
    writable: true,
  });

  // Default mock for getComputedStyle
  mockGetComputedStyle.mockReturnValue({
    color: "rgb(0, 0, 0)",
    backgroundColor: "rgb(255, 255, 255)",
    fontSize: "16px",
    fontWeight: "normal",
    outline: "2px solid blue",
    boxShadow: "none",
    border: "none",
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AccessibilityAuditService", () => {
  let auditService: AccessibilityAuditService;
  let mockElement: HTMLElement;

  beforeEach(() => {
    auditService = new AccessibilityAuditService();

    // Create mock element
    mockElement = {
      querySelectorAll: vi.fn(),
      closest: vi.fn(),
      tagName: "DIV",
      id: "test-element",
      className: "test-class",
      hasAttribute: vi.fn(),
      getAttribute: vi.fn(),
    } as any;
  });

  describe("performAudit", () => {
    it("should perform comprehensive accessibility audit", async () => {
      // Mock empty element (no issues)
      mockElement.querySelectorAll = vi.fn().mockReturnValue([]);

      const result = await auditService.performAudit(mockElement);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.level).toBeOneOf([
        WCAG_LEVELS.A,
        WCAG_LEVELS.AA,
        WCAG_LEVELS.AAA,
      ]);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.healthcareCompliance).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.testResults).toBeDefined();
    });

    it("should use document.body when no element provided", async () => {
      const bodySpy = vi
        .spyOn(document.body, "querySelectorAll")
        .mockReturnValue([] as any);

      await auditService.performAudit();

      expect(bodySpy).toHaveBeenCalled();
    });
  });

  describe("Color Contrast Audit", () => {
    it("should detect color contrast issues", async () => {
      // Mock element with poor contrast
      const mockTextElement = {
        tagName: "P",
        id: "poor-contrast",
        className: "text-element",
        getAttribute: vi.fn().mockReturnValue(null),
        hasAttribute: vi.fn().mockReturnValue(false),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "*") return [mockTextElement];
        if (selector.includes("button") || selector.includes("input"))
          return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });

      // Mock poor contrast colors
      mockGetComputedStyle.mockReturnValue({
        color: "rgb(200, 200, 200)", // Light gray
        backgroundColor: "rgb(255, 255, 255)", // White
        fontSize: "14px",
        fontWeight: "normal",
        outline: "2px solid blue",
        boxShadow: "none",
        border: "none",
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.colorContrast).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.title.includes("Contraste de cor insuficiente"),
        ),
      ).toBe(true);
    });

    it("should pass with good contrast", async () => {
      // Mock element with good contrast
      const mockTextElement = {
        tagName: "P",
        id: "good-contrast",
        className: "text-element",
        getAttribute: vi.fn().mockReturnValue(null),
        hasAttribute: vi.fn().mockReturnValue(false),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "*") return [mockTextElement];
        if (selector.includes("button") || selector.includes("input"))
          return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });

      // Mock good contrast colors (black on white)
      mockGetComputedStyle.mockReturnValue({
        color: "rgb(0, 0, 0)", // Black
        backgroundColor: "rgb(255, 255, 255)", // White
        fontSize: "16px",
        fontWeight: "normal",
        outline: "2px solid blue",
        boxShadow: "none",
        border: "none",
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.colorContrast).toBe(true);
      expect(
        result.issues.filter((issue) =>
          issue.title.includes("Contraste de cor insuficiente"),
        ),
      ).toHaveLength(0);
    });
  });

  describe("Keyboard Navigation Audit", () => {
    it("should detect keyboard navigation issues", async () => {
      // Mock interactive element with tabindex="-1" but no aria-hidden
      const mockButton = {
        tagName: "BUTTON",
        id: "inaccessible-button",
        className: "btn",
        getAttribute: vi.fn().mockImplementation((attr) => {
          if (attr === "tabindex") return "-1";
          if (attr === "aria-hidden") return null;
          return null;
        }),
        hasAttribute: vi.fn().mockImplementation((attr) => {
          if (attr === "aria-hidden") return false;
          return attr === "tabindex";
        }),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("button")) return [mockButton];
        if (selector === "*") return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });

      mockElement.querySelector = vi.fn().mockReturnValue(null);

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.keyboardNavigation).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.title.includes("não acessível via teclado"),
        ),
      ).toBe(true);
    });

    it("should detect missing focus indicators", async () => {
      // Mock button without focus styles
      const mockButton = {
        tagName: "BUTTON",
        id: "no-focus-button",
        className: "btn",
        getAttribute: vi.fn().mockReturnValue(null),
        hasAttribute: vi.fn().mockReturnValue(false),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("button")) return [mockButton];
        if (selector === "*") return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });

      mockElement.querySelector = vi.fn().mockReturnValue(null);

      // Mock getComputedStyle for :focus pseudo-element
      mockGetComputedStyle.mockReturnValue({
        color: "rgb(0, 0, 0)",
        backgroundColor: "rgb(255, 255, 255)",
        fontSize: "16px",
        fontWeight: "normal",
        outline: "none", // No focus indicator
        boxShadow: "none",
        border: "none",
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.focusManagement).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.title.includes("Indicador de foco ausente"),
        ),
      ).toBe(true);
    });
  });

  describe("ARIA Labels Audit", () => {
    it("should detect missing ARIA labels", async () => {
      // Mock input without label
      const mockInput = {
        tagName: "INPUT",
        id: "unlabeled-input",
        className: "form-input",
        hasAttribute: vi.fn().mockReturnValue(false),
        getAttribute: vi.fn().mockReturnValue(null),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("input")) return [mockInput];
        return [];
      });

      // Mock no associated label
      mockElement.querySelector = vi.fn().mockReturnValue(null);

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.ariaLabels).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.title.includes("sem rótulo acessível"),
        ),
      ).toBe(true);
    });

    it("should pass with proper ARIA labels", async () => {
      // Mock input with aria-label
      const mockInput = {
        tagName: "INPUT",
        id: "labeled-input",
        className: "form-input",
        hasAttribute: vi
          .fn()
          .mockImplementation((attr) => attr === "aria-label"),
        getAttribute: vi.fn().mockReturnValue("Nome do paciente"),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("input")) return [mockInput];
        return [];
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.ariaLabels).toBe(true);
      expect(
        result.issues.filter((issue) =>
          issue.title.includes("sem rótulo acessível"),
        ),
      ).toHaveLength(0);
    });
  });

  describe("Screen Reader Support Audit", () => {
    it("should detect images without alt text", async () => {
      // Mock image without alt attribute
      const mockImage = {
        tagName: "IMG",
        id: "no-alt-image",
        className: "image",
        hasAttribute: vi.fn().mockReturnValue(false),
        getAttribute: vi.fn().mockReturnValue(null),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "img") return [mockImage];
        return [];
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.screenReaderSupport).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.title.includes("sem texto alternativo"),
        ),
      ).toBe(true);
    });

    it("should pass with proper alt text", async () => {
      // Mock image with alt attribute
      const mockImage = {
        tagName: "IMG",
        id: "alt-image",
        className: "image",
        hasAttribute: vi.fn().mockImplementation((attr) => attr === "alt"),
        getAttribute: vi.fn().mockReturnValue("Radiografia do paciente"),
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "img") return [mockImage];
        return [];
      });

      const result = await auditService.performAudit(mockElement);

      expect(result.testResults.screenReaderSupport).toBe(true);
      expect(
        result.issues.filter((issue) =>
          issue.title.includes("sem texto alternativo"),
        ),
      ).toHaveLength(0);
    });
  });

  describe("Healthcare Compliance Audit", () => {
    it("should detect missing LGPD consent indicators", async () => {
      // Mock element without LGPD indicators
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("lgpd") || selector.includes("consentimento"))
          return [];
        return [];
      });

      const result = await auditService.performAudit(mockElement);

      expect(
        result.issues.some((issue) =>
          issue.title.includes("consentimento LGPD ausentes"),
        ),
      ).toBe(true);
      expect(result.healthcareCompliance.lgpdCompliant).toBe(false);
    });

    it("should pass with LGPD consent indicators", async () => {
      // Mock element with LGPD indicators
      const mockConsentElement = {
        tagName: "DIV",
        id: "lgpd-consent",
        className: "consent-indicator",
      };

      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("lgpd") || selector.includes("consentimento")) {
          return [mockConsentElement];
        }
        return [];
      });

      const result = await auditService.performAudit(mockElement);

      expect(
        result.issues.filter((issue) =>
          issue.title.includes("consentimento LGPD ausentes"),
        ),
      ).toHaveLength(0);
      expect(result.healthcareCompliance.lgpdCompliant).toBe(true);
    });
  });

  describe("Brazilian Standards Audit", () => {
    it("should detect missing Portuguese language declaration", async () => {
      // Mock no Portuguese language
      mockElement.closest = vi.fn().mockReturnValue(null);
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "*") return [];
        if (selector.includes("button") || selector.includes("input"))
          return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });
      mockElement.querySelector = vi.fn().mockReturnValue(null);
      document.documentElement.getAttribute = vi.fn().mockReturnValue("en");

      const result = await auditService.performAudit(mockElement);

      expect(
        result.issues.some((issue) =>
          issue.title.includes("português não declarado"),
        ),
      ).toBe(true);
    });

    it("should pass with Portuguese language declaration", async () => {
      // Mock Portuguese language
      mockElement.closest = vi.fn().mockReturnValue({ lang: "pt-BR" });
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === "*") return [];
        if (selector.includes("button") || selector.includes("input"))
          return [];
        if (selector === "img") return [];
        if (selector.includes("h1, h2")) return [];
        if (selector.includes("lgpd")) return [];
        return [];
      });
      mockElement.querySelector = vi.fn().mockReturnValue(null);
      document.documentElement.getAttribute = vi.fn().mockReturnValue("pt-BR");

      const result = await auditService.performAudit(mockElement);

      expect(
        result.issues.filter((issue) =>
          issue.title.includes("português não declarado"),
        ),
      ).toHaveLength(0);
    });
  });

  describe("Audit Result Generation", () => {
    it("should calculate correct score and level", async () => {
      // Mock element with no issues
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("lgpd") || selector.includes("consentimento")) {
          return [{ tagName: "DIV" }]; // Mock LGPD consent
        }
        return [];
      });
      mockElement.querySelector = vi.fn().mockReturnValue(null);
      mockElement.closest = vi.fn().mockReturnValue({ lang: "pt-BR" });

      const result = await auditService.performAudit(mockElement);

      expect(result.score).toBe(100);
      expect(result.level).toBe(WCAG_LEVELS.AAA);
      expect(result.summary.total).toBe(0);
    });

    it("should provide healthcare compliance assessment", async () => {
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("lgpd") || selector.includes("consentimento")) {
          return [{ tagName: "DIV" }];
        }
        return [];
      });
      mockElement.querySelector = vi.fn().mockReturnValue(null);
      mockElement.closest = vi.fn().mockReturnValue({ lang: "pt-BR" });

      const result = await auditService.performAudit(mockElement);

      expect(result.healthcareCompliance).toBeDefined();
      expect(typeof result.healthcareCompliance.lgpdCompliant).toBe("boolean");
      expect(typeof result.healthcareCompliance.anvisaCompliant).toBe(
        "boolean",
      );
      expect(typeof result.healthcareCompliance.cfmCompliant).toBe("boolean");
      expect(Array.isArray(result.healthcareCompliance.issues)).toBe(true);
    });

    it("should provide actionable recommendations", async () => {
      mockElement.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector.includes("lgpd") || selector.includes("consentimento")) {
          return [{ tagName: "DIV" }];
        }
        return [];
      });
      mockElement.querySelector = vi.fn().mockReturnValue(null);
      mockElement.closest = vi.fn().mockReturnValue({ lang: "pt-BR" });

      const result = await auditService.performAudit(mockElement);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeLessThanOrEqual(10);
    });
  });
});
