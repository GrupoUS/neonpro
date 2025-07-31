// NeonPro Notification System - Template Engine
// Story 1.7: Sistema de Notificações Avançado
// File: src/lib/notifications/templates/template-engine.ts

import { createClient } from '@/app/utils/supabase/client';
import { NotificationTemplate, TemplateVariables, NotificationChannel } from '../types';

interface TemplateRenderResult {
  subject?: string;
  content: string;
  variables: Record<string, any>;
}

interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  missingVariables: string[];
  unusedVariables: string[];
}

export class TemplateEngine {
  private supabase;
  private templateCache: Map<string, NotificationTemplate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Render a template with provided variables
   */
  async renderTemplate(
    templateId: string,
    variables: Record<string, any>,
    channel?: NotificationChannel
  ): Promise<TemplateRenderResult | null> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Validate variables
      const validation = this.validateTemplateVariables(template, variables);
      if (!validation.isValid) {
        console.warn('Template validation warnings:', validation.errors);
      }

      // Render subject (for email/push)
      let renderedSubject: string | undefined;
      if (template.subjectTemplate) {
        renderedSubject = this.processTemplate(template.subjectTemplate, variables);
      }

      // Render content
      const renderedContent = this.processTemplate(template.contentTemplate, variables);

      return {
        subject: renderedSubject,
        content: renderedContent,
        variables
      };

    } catch (error) {
      console.error('Error rendering template:', error);
      return null;
    }
  }

  /**
   * Get template by ID with caching
   */
  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      // Check cache first
      const cached = this.templateCache.get(templateId);
      const cacheTime = this.cacheExpiry.get(templateId);
      
      if (cached && cacheTime && Date.now() < cacheTime) {
        return cached;
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return null;
      }

      if (data) {
        // Cache the template
        this.templateCache.set(templateId, data);
        this.cacheExpiry.set(templateId, Date.now() + this.CACHE_TTL);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Get templates by category and channel
   */
  async getTemplates(
    category?: string,
    channel?: NotificationChannel,
    clinicId?: string
  ): Promise<NotificationTemplate[]> {
    try {
      let query = this.supabase
        .from('notification_templates')
        .select('*')
        .eq('status', 'active');

      if (category) {
        query = query.eq('category', category);
      }
      if (channel) {
        query = query.eq('channel', channel);
      }
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    templateId?: string;
    error?: string;
  }> {
    try {
      // Validate template content
      const validation = this.validateTemplateContent(template.contentTemplate, template.variables);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Template validation failed: ${validation.errors.join(', ')}`
        };
      }

      const { data, error } = await this.supabase
        .from('notification_templates')
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create template: ${error.message}`);
      }

      return {
        success: true,
        templateId: data.id
      };

    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<NotificationTemplate>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate template content if being updated
      if (updates.contentTemplate || updates.variables) {
        const currentTemplate = await this.getTemplate(templateId);
        if (!currentTemplate) {
          return { success: false, error: 'Template not found' };
        }

        const contentToValidate = updates.contentTemplate || currentTemplate.contentTemplate;
        const variablesToValidate = updates.variables || currentTemplate.variables;

        const validation = this.validateTemplateContent(contentToValidate, variablesToValidate);
        if (!validation.isValid) {
          return {
            success: false,
            error: `Template validation failed: ${validation.errors.join(', ')}`
          };
        }
      }

      const { error } = await this.supabase
        .from('notification_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        throw new Error(`Failed to update template: ${error.message}`);
      }

      // Clear cache for this template
      this.templateCache.delete(templateId);
      this.cacheExpiry.delete(templateId);

      return { success: true };

    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Soft delete by updating status
      const { error } = await this.supabase
        .from('notification_templates')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        throw new Error(`Failed to delete template: ${error.message}`);
      }

      // Clear cache
      this.templateCache.delete(templateId);
      this.cacheExpiry.delete(templateId);

      return { success: true };

    } catch (error) {
      console.error('Error deleting template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process template content with variables
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    // Replace {variable} placeholders
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      const value = variables[key] !== undefined ? String(variables[key]) : '';
      processed = processed.replace(placeholder, value);
    });

    // Handle conditional blocks {if:variable}content{/if}
    processed = this.processConditionals(processed, variables);

    // Handle loops {each:array}content{/each}
    processed = this.processLoops(processed, variables);

    // Handle formatting {format:variable:type}
    processed = this.processFormatting(processed, variables);

    return processed;
  }

  /**
   * Process conditional blocks
   */
  private processConditionals(template: string, variables: Record<string, any>): string {
    const conditionalRegex = /\{if:(\w+)\}(.*?)\{\/if\}/gs;
    
    return template.replace(conditionalRegex, (match, variable, content) => {
      const value = variables[variable];
      return value && value !== '' && value !== null && value !== undefined ? content : '';
    });
  }

  /**
   * Process loops
   */
  private processLoops(template: string, variables: Record<string, any>): string {
    const loopRegex = /\{each:(\w+)\}(.*?)\{\/each\}/gs;
    
    return template.replace(loopRegex, (match, arrayVar, content) => {
      const array = variables[arrayVar];
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        let itemContent = content;
        
        // Replace {item} with the current item
        itemContent = itemContent.replace(/\{item\}/g, String(item));
        
        // Replace {index} with the current index
        itemContent = itemContent.replace(/\{index\}/g, String(index));
        
        // If item is an object, replace {item.property}
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            const itemPlaceholder = new RegExp(`\\{item\\.${key}\\}`, 'g');
            itemContent = itemContent.replace(itemPlaceholder, String(item[key] || ''));
          });
        }
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Process formatting directives
   */
  private processFormatting(template: string, variables: Record<string, any>): string {
    const formatRegex = /\{format:(\w+):(\w+)\}/g;
    
    return template.replace(formatRegex, (match, variable, type) => {
      const value = variables[variable];
      if (value === undefined || value === null) {
        return '';
      }

      switch (type) {
        case 'currency':
          return this.formatCurrency(value);
        case 'date':
          return this.formatDate(value);
        case 'datetime':
          return this.formatDateTime(value);
        case 'phone':
          return this.formatPhone(value);
        case 'uppercase':
          return String(value).toUpperCase();
        case 'lowercase':
          return String(value).toLowerCase();
        case 'capitalize':
          return this.capitalize(String(value));
        default:
          return String(value);
      }
    });
  }

  /**
   * Validate template variables
   */
  private validateTemplateVariables(
    template: NotificationTemplate,
    variables: Record<string, any>
  ): TemplateValidationResult {
    const errors: string[] = [];
    const missingVariables: string[] = [];
    const unusedVariables: string[] = [];

    // Check for missing required variables
    template.variables.forEach(variable => {
      if (!(variable in variables)) {
        missingVariables.push(variable);
        errors.push(`Missing required variable: ${variable}`);
      }
    });

    // Check for unused variables
    Object.keys(variables).forEach(variable => {
      if (!template.variables.includes(variable)) {
        unusedVariables.push(variable);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      missingVariables,
      unusedVariables
    };
  }

  /**
   * Validate template content
   */
  private validateTemplateContent(content: string, variables: string[]): TemplateValidationResult {
    const errors: string[] = [];
    const missingVariables: string[] = [];
    const unusedVariables: string[] = [];

    // Extract all variables used in template
    const usedVariables = new Set<string>();
    const variableRegex = /\{(\w+)(?:\.\w+)?\}/g;
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      usedVariables.add(match[1]);
    }

    // Check for variables used but not declared
    usedVariables.forEach(variable => {
      if (!variables.includes(variable)) {
        missingVariables.push(variable);
        errors.push(`Variable used but not declared: ${variable}`);
      }
    });

    // Check for declared variables not used
    variables.forEach(variable => {
      if (!usedVariables.has(variable)) {
        unusedVariables.push(variable);
      }
    });

    // Validate conditional and loop syntax
    const conditionalRegex = /\{if:\w+\}.*?\{\/if\}/gs;
    const loopRegex = /\{each:\w+\}.*?\{\/each\}/gs;
    
    const conditionals = content.match(conditionalRegex) || [];
    const loops = content.match(loopRegex) || [];

    // Check for unmatched conditionals
    const ifCount = (content.match(/\{if:\w+\}/g) || []).length;
    const endIfCount = (content.match(/\{\/if\}/g) || []).length;
    if (ifCount !== endIfCount) {
      errors.push('Unmatched conditional blocks');
    }

    // Check for unmatched loops
    const eachCount = (content.match(/\{each:\w+\}/g) || []).length;
    const endEachCount = (content.match(/\{\/each\}/g) || []).length;
    if (eachCount !== endEachCount) {
      errors.push('Unmatched loop blocks');
    }

    return {
      isValid: errors.length === 0,
      errors,
      missingVariables,
      unusedVariables
    };
  }

  /**
   * Formatting helpers
   */
  private formatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  }

  private formatDate(value: any): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  private formatDateTime(value: any): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  }

  private formatPhone(value: any): string {
    const phone = String(value).replace(/\D/g, '');
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    } else if (phone.length === 10) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    }
    return String(value);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.templateCache.size,
      hitRate: this.templateCache.size > 0 ? 0.8 : 0 // Placeholder calculation
    };
  }
}

// Singleton instance
export const templateEngine = new TemplateEngine();