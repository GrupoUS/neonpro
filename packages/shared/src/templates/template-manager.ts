/**
 * Template Manager for AI Prompt Templates
 * Centralized system for storing, retrieving, and managing prompt templates
 */

import type { PromptTemplate } from "./ai-prompt-templates";
import {
  AESTHETIC_PROCEDURE_TEMPLATES,
  WHATSAPP_PROMPT_TEMPLATES,
  WHATSAPP_SYSTEM_PROMPTS,
} from "./ai-prompt-templates";
import type { LGPDTemplate } from "./lgpd-compliance-templates";
import { LGPD_COMPLIANCE_TEMPLATES, LGPD_SYSTEM_PROMPTS } from "./lgpd-compliance-templates";

export type TemplateCategory = "whatsapp" | "aesthetic" | "compliance" | "general";
export type TemplateContext =
  | "external"
  | "internal"
  | "both"
  | "whatsapp"
  | "web"
  | "clinic"
  | "all";

export interface TemplateSearchOptions {
  category?: TemplateCategory;
  context?: TemplateContext;
  language?: "pt-BR" | "en";
  tags?: string[];
}

export interface TemplateRenderOptions {
  variables?: Record<string, string>;
  fallbackValues?: Record<string, string>;
  escapeHtml?: boolean;
}

export class TemplateManager {
  private templates: Map<string, PromptTemplate | LGPDTemplate> = new Map();
  private systemPrompts: Map<string, string> = new Map();

  constructor() {
    this.loadTemplates();
    this.loadSystemPrompts();
  }

  /**
   * Load all templates into memory
   */
  private loadTemplates(): void {
    // Load WhatsApp templates
    WHATSAPP_PROMPT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Load aesthetic procedure templates
    AESTHETIC_PROCEDURE_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Load LGPD compliance templates
    LGPD_COMPLIANCE_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Load system prompts
   */
  private loadSystemPrompts(): void {
    // WhatsApp system prompts
    Object.entries(WHATSAPP_SYSTEM_PROMPTS).forEach(([key, prompt]) => {
      this.systemPrompts.set(`whatsapp-${key}`, prompt);
    });

    // LGPD system prompts
    Object.entries(LGPD_SYSTEM_PROMPTS).forEach(([key, prompt]) => {
      this.systemPrompts.set(`lgpd-${key}`, prompt);
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): PromptTemplate | LGPDTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get system prompt by key
   */
  getSystemPrompt(key: string): string | null {
    return this.systemPrompts.get(key) || null;
  }

  /**
   * Search templates by criteria
   */
  searchTemplates(options: TemplateSearchOptions = {}): (PromptTemplate | LGPDTemplate)[] {
    const results: (PromptTemplate | LGPDTemplate)[] = [];

    for (const template of this.templates.values()) {
      let matches = true;

      // Filter by category
      if (options.category && template.category !== options.category) {
        matches = false;
      }

      // Filter by context
      if (
        options.context && template.context !== options.context && template.context !== "both"
        && template.context !== "all"
      ) {
        matches = false;
      }

      // Filter by language
      if (options.language && template.language !== options.language) {
        matches = false;
      }

      if (matches) {
        results.push(template);
      }
    }

    return results;
  }

  /**
   * Render template with variables
   */
  renderTemplate(templateId: string, options: TemplateRenderOptions = {}): string | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      return null;
    }

    let rendered = template.template;
    const variables = options.variables || {};
    const fallbackValues = options.fallbackValues || {};

    // Replace variables in template
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = variables[variableName] || fallbackValues[variableName];
      if (value !== undefined) {
        return options.escapeHtml ? this.escapeHtml(value) : value;
      }
      return match; // Keep placeholder if no value provided
    });

    return rendered;
  }

  /**
   * Get templates for WhatsApp context
   */
  getWhatsAppTemplates(): PromptTemplate[] {
    return this.searchTemplates({
      category: "whatsapp",
      context: "external",
      language: "pt-BR",
    }) as PromptTemplate[];
  }

  /**
   * Get aesthetic procedure templates
   */
  getAestheticTemplates(): PromptTemplate[] {
    return this.searchTemplates({
      category: "aesthetic",
      language: "pt-BR",
    }) as PromptTemplate[];
  }

  /**
   * Get LGPD compliance templates
   */
  getLGPDTemplates(): LGPDTemplate[] {
    return this.searchTemplates({
      category: "compliance",
      language: "pt-BR",
    }) as LGPDTemplate[];
  }

  /**
   * Get template by procedure name
   */
  getTemplateByProcedure(procedureName: string): PromptTemplate | null {
    const normalizedName = procedureName.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[áàâã]/g, "a")
      .replace(/[éêë]/g, "e")
      .replace(/[íîï]/g, "i")
      .replace(/[óôõ]/g, "o")
      .replace(/[úûü]/g, "u")
      .replace(/ç/g, "c");

    return this.getTemplate(normalizedName) as PromptTemplate || null;
  }

  /**
   * Validate template variables
   */
  validateTemplate(templateId: string, variables: Record<string, string>): {
    valid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  } {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: false, missingVariables: [], extraVariables: [] };
    }

    const requiredVariables = template.variables || [];
    const providedVariables = Object.keys(variables);

    const missingVariables = requiredVariables.filter(
      variable => !providedVariables.includes(variable),
    );

    const extraVariables = providedVariables.filter(
      variable => !requiredVariables.includes(variable),
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
      extraVariables,
    };
  }

  /**
   * Get all available template IDs
   */
  getAvailableTemplateIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get template metadata
   */
  getTemplateMetadata(templateId: string): TemplateMetadata | null {
    const template = this.getTemplate(templateId);
    return (template?.metadata ?? null) as TemplateMetadata | null;
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
    };
    return text.replace(/[&<>"'`/]/g, (ch) => map[ch] || ch);
  }

  /**
   * Get system prompt for WhatsApp external context
   */
  getWhatsAppSystemPrompt(): string {
    return this.getSystemPrompt("whatsapp-external") || "";
  }

  /**
   * Get system prompt for WhatsApp internal context
   */
  getWhatsAppInternalSystemPrompt(): string {
    return this.getSystemPrompt("whatsapp-internal") || "";
  }

  /**
   * Get LGPD data protection system prompt
   */
  getLGPDDataProtectionPrompt(): string {
    return this.getSystemPrompt("lgpd-dataProtection") || "";
  }

  /**
   * Get LGPD patient rights system prompt
   */
  getLGPDPatientRightsPrompt(): string {
    return this.getSystemPrompt("lgpd-patientRights") || "";
  }
}

// Singleton instance
export const templateManager = new TemplateManager();

// Export types and utilities
export type { LGPDTemplate, PromptTemplate };
export { AESTHETIC_PROCEDURE_TEMPLATES, LGPD_COMPLIANCE_TEMPLATES, WHATSAPP_PROMPT_TEMPLATES };

// Define metadata type for stronger typing
export interface TemplateMetadata {
  id?: string;
  category?: string;
  language?: string;
  version?: string;
  tags?: string[];
  [key: string]: unknown;
}

export default templateManager;
