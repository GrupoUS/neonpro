/**
 * Template Manager Tests
 * Tests for AI prompt template system
 */

import { beforeEach, describe, expect, it } from "vitest";
import { TemplateManager, templateManager } from "../template-manager";

describe("TemplateManager", () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  describe("Template Retrieval", () => {
    it("should retrieve WhatsApp greeting template", () => {
      const template = manager.getTemplate("whatsapp-greeting");

      expect(template).toBeDefined();
      expect(template?.category).toBe("whatsapp");
      expect(template?.context).toBe("external");
      expect(template?.language).toBe("pt-BR");
      expect(template?.template).toContain("Olá! 😊");
    });

    it("should retrieve aesthetic procedure template", () => {
      const template = manager.getTemplate("harmonizacao-facial");

      expect(template).toBeDefined();
      expect(template?.category).toBe("aesthetic");
      expect(template?.template).toContain("HARMONIZAÇÃO FACIAL");
    });

    it("should retrieve LGPD compliance template", () => {
      const template = manager.getTemplate("lgpd-initial-consent");

      expect(template).toBeDefined();
      expect(template?.category).toBe("consent");
      expect(template?.template).toContain("PROTEÇÃO DOS SEUS DADOS");
    });

    it("should return null for non-existent template", () => {
      const template = manager.getTemplate("non-existent-template");
      expect(template).toBeNull();
    });
  });

  describe("Template Search", () => {
    it("should search templates by category", () => {
      const whatsappTemplates = manager.searchTemplates({ category: "whatsapp" });

      expect(whatsappTemplates.length).toBeGreaterThan(0);
      whatsappTemplates.forEach(template => {
        expect(template.category).toBe("whatsapp");
      });
    });

    it("should search templates by context", () => {
      const externalTemplates = manager.searchTemplates({ context: "external" });

      expect(externalTemplates.length).toBeGreaterThan(0);
      externalTemplates.forEach(template => {
        expect(["external", "both", "all"]).toContain(template.context);
      });
    });

    it("should search templates by language", () => {
      const portugueseTemplates = manager.searchTemplates({ language: "pt-BR" });

      expect(portugueseTemplates.length).toBeGreaterThan(0);
      portugueseTemplates.forEach(template => {
        expect(template.language).toBe("pt-BR");
      });
    });
  });

  describe("Template Rendering", () => {
    it("should render template with variables", () => {
      const rendered = manager.renderTemplate("whatsapp-procedure-inquiry", {
        variables: {
          procedure_name: "Harmonização Facial",
          duration: "1h30",
          expected_results: "Resultados naturais e harmoniosos",
          post_care: "Evitar exercícios por 24h",
        },
      });

      expect(rendered).toBeDefined();
      expect(rendered).toContain("Harmonização Facial");
      expect(rendered).toContain("1h30");
      expect(rendered).toContain("Resultados naturais e harmoniosos");
    });

    it("should keep placeholders for missing variables", () => {
      const rendered = manager.renderTemplate("whatsapp-procedure-inquiry", {
        variables: {
          procedure_name: "Botox",
          // Missing other variables
        },
      });

      expect(rendered).toBeDefined();
      expect(rendered).toContain("Botox");
      expect(rendered).toContain("{{duration}}"); // Should keep placeholder
    });

    it("should use fallback values", () => {
      const rendered = manager.renderTemplate("whatsapp-procedure-inquiry", {
        variables: {
          procedure_name: "Preenchimento Labial",
        },
        fallbackValues: {
          duration: "45 minutos",
          expected_results: "Lábios mais definidos",
          post_care: "Evitar beijos por 24h",
        },
      });

      expect(rendered).toBeDefined();
      expect(rendered).toContain("Preenchimento Labial");
      expect(rendered).toContain("45 minutos");
      expect(rendered).toContain("Lábios mais definidos");
    });
  });

  describe("System Prompts", () => {
    it("should retrieve WhatsApp external system prompt", () => {
      const prompt = manager.getWhatsAppSystemPrompt();

      expect(prompt).toBeDefined();
      expect(prompt).toContain("assistente virtual da NeonPro");
      expect(prompt).toContain("LGPD/CFM/ANVISA");
    });

    it("should retrieve WhatsApp internal system prompt", () => {
      const prompt = manager.getWhatsAppInternalSystemPrompt();

      expect(prompt).toBeDefined();
      expect(prompt).toContain("assistente interno");
      expect(prompt).toContain("profissionais de saúde");
    });

    it("should retrieve LGPD data protection prompt", () => {
      const prompt = manager.getLGPDDataProtectionPrompt();

      expect(prompt).toBeDefined();
      expect(prompt).toContain("conformidade LGPD");
      expect(prompt).toContain("Transparência");
    });
  });

  describe("Template Validation", () => {
    it("should validate template variables correctly", () => {
      const validation = manager.validateTemplate("whatsapp-procedure-inquiry", {
        procedure_name: "Botox",
        duration: "30 minutos",
        expected_results: "Redução de rugas",
        post_care: "Não deitar por 4h",
      });

      expect(validation.valid).toBe(true);
      expect(validation.missingVariables).toHaveLength(0);
    });

    it("should detect missing variables", () => {
      const validation = manager.validateTemplate("whatsapp-procedure-inquiry", {
        procedure_name: "Botox",
        // Missing other required variables
      });

      expect(validation.valid).toBe(false);
      expect(validation.missingVariables.length).toBeGreaterThan(0);
    });

    it("should detect extra variables", () => {
      const validation = manager.validateTemplate("whatsapp-greeting", {
        unnecessary_variable: "value",
      });

      expect(validation.extraVariables).toContain("unnecessary_variable");
    });
  });

  describe("Convenience Methods", () => {
    it("should get WhatsApp templates", () => {
      const templates = manager.getWhatsAppTemplates();

      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.category).toBe("whatsapp");
        expect(template.context).toBe("external");
      });
    });

    it("should get aesthetic templates", () => {
      const templates = manager.getAestheticTemplates();

      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.category).toBe("aesthetic");
      });
    });

    it("should get LGPD templates", () => {
      const templates = manager.getLGPDTemplates();

      expect(templates.length).toBeGreaterThan(0);
      const allowed = ["consent", "rights", "privacy", "data-usage"];
      templates.forEach(template => {
        expect(allowed).toContain(template.category);
      });
    });

    it("should get available template IDs", () => {
      const ids = manager.getAvailableTemplateIds();

      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain("whatsapp-greeting");
      expect(ids).toContain("harmonizacao-facial");
      expect(ids).toContain("lgpd-initial-consent");
    });
  });

  describe("Singleton Instance", () => {
    it("should provide working singleton instance", () => {
      const template = templateManager.getTemplate("whatsapp-greeting");
      expect(template).toBeDefined();

      const systemPrompt = templateManager.getWhatsAppSystemPrompt();
      expect(systemPrompt).toBeDefined();
    });
  });
});
