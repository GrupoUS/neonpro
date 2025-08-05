import { createClient } from '@supabase/supabase-js';
import { AuditLogger } from '../../auth/audit/audit-logger';
import { NotificationTemplate, NotificationTypeEnum, NotificationChannelEnum } from '../core/notification-manager';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  default_value?: any;
  description?: string;
  validation_regex?: string;
}

export interface TemplateRenderContext {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    preferences?: Record<string, any>;
  };
  appointment?: {
    id: string;
    date: Date;
    time: string;
    service: string;
    professional: string;
    location?: string;
  };
  payment?: {
    id: string;
    amount: number;
    currency: string;
    due_date?: Date;
    method?: string;
  };
  clinic?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  custom?: Record<string, any>;
}

export interface RenderedTemplate {
  subject?: string;
  content: string;
  variables_used: string[];
  render_time_ms: number;
  template_version: number;
}

export class TemplateEngine {
  private supabase;
  private auditLogger: AuditLogger;
  private templateCache: Map<string, NotificationTemplate>;
  private variableCache: Map<string, TemplateVariable[]>;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.auditLogger = new AuditLogger();
    this.templateCache = new Map();
    this.variableCache = new Map();
  }

  /**
   * Renderiza um template com os dados fornecidos
   */
  async render(
    templateId: string,
    context: TemplateRenderContext
  ): Promise<RenderedTemplate> {
    const startTime = Date.now();
    
    try {
      // Obter template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} não encontrado`);
      }

      if (!template.is_active) {
        throw new Error(`Template ${templateId} está inativo`);
      }

      // Obter variáveis do template
      const variables = await this.getTemplateVariables(templateId);
      
      // Validar contexto
      await this.validateContext(context, variables);

      // Renderizar conteúdo
      const renderedContent = await this.renderContent(template.content, context);
      
      // Renderizar subject se existir
      let renderedSubject: string | undefined;
      if (template.subject) {
        renderedSubject = await this.renderContent(template.subject, context);
      }

      // Extrair variáveis utilizadas
      const variablesUsed = this.extractUsedVariables(template.content, template.subject);

      const result: RenderedTemplate = {
        subject: renderedSubject,
        content: renderedContent,
        variables_used: variablesUsed,
        render_time_ms: Date.now() - startTime,
        template_version: template.version
      };

      // Log de auditoria
      await this.auditLogger.log({
        action: 'template_rendered',
        resource_type: 'notification_template',
        resource_id: templateId,
        details: {
          render_time_ms: result.render_time_ms,
          variables_used: variablesUsed,
          template_version: template.version
        }
      });

      return result;
    } catch (error) {
      await this.auditLogger.log({
        action: 'template_render_error',
        resource_type: 'notification_template',
        resource_id: templateId,
        details: {
          error: (error as Error).message,
          render_time_ms: Date.now() - startTime
        }
      });
      
      throw error;
    }
  }

  /**
   * Obtém um template por ID
   */
  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    // Verificar cache primeiro
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)!;
    }

    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Adicionar ao cache
        this.templateCache.set(templateId, data);
        return data;
      }

      return null;
    } catch (error) {
      throw new Error(`Erro ao buscar template: ${error}`);
    }
  }

  /**
   * Cria um novo template
   */
  async createTemplate(
    template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<NotificationTemplate> {
    try {
      // Validar template
      await this.validateTemplate(template);

      const { data, error } = await this.supabase
        .from('notification_templates')
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar ao cache
      this.templateCache.set(data.id, data);

      await this.auditLogger.log({
        action: 'template_created',
        resource_type: 'notification_template',
        resource_id: data.id,
        user_id: template.created_by,
        details: {
          name: template.name,
          type: template.type,
          channel: template.channel
        }
      });

      return data;
    } catch (error) {
      throw new Error(`Erro ao criar template: ${error}`);
    }
  }

  /**
   * Atualiza um template existente
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<Omit<NotificationTemplate, 'id' | 'created_at' | 'created_by'>>
  ): Promise<NotificationTemplate> {
    try {
      // Incrementar versão
      const currentTemplate = await this.getTemplate(templateId);
      if (!currentTemplate) {
        throw new Error('Template não encontrado');
      }

      const { data, error } = await this.supabase
        .from('notification_templates')
        .update({
          ...updates,
          version: currentTemplate.version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache
      this.templateCache.set(templateId, data);
      
      // Limpar cache de variáveis
      this.variableCache.delete(templateId);

      await this.auditLogger.log({
        action: 'template_updated',
        resource_type: 'notification_template',
        resource_id: templateId,
        details: {
          updates,
          new_version: data.version
        }
      });

      return data;
    } catch (error) {
      throw new Error(`Erro ao atualizar template: ${error}`);
    }
  }

  /**
   * Lista templates com filtros
   */
  async listTemplates(filters?: {
    type?: NotificationTypeEnum;
    channel?: NotificationChannelEnum;
    is_active?: boolean;
    created_by?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = this.supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(`Erro ao listar templates: ${error}`);
    }
  }

  /**
   * Deleta um template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      // Remover do cache
      this.templateCache.delete(templateId);
      this.variableCache.delete(templateId);

      await this.auditLogger.log({
        action: 'template_deleted',
        resource_type: 'notification_template',
        resource_id: templateId
      });
    } catch (error) {
      throw new Error(`Erro ao deletar template: ${error}`);
    }
  }

  /**
   * Valida um template antes de salvar
   */
  async validateTemplate(
    template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    // Validar campos obrigatórios
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Nome do template é obrigatório');
    }

    if (!template.content || template.content.trim().length === 0) {
      throw new Error('Conteúdo do template é obrigatório');
    }

    // Validar sintaxe do template
    await this.validateTemplateSyntax(template.content);
    
    if (template.subject) {
      await this.validateTemplateSyntax(template.subject);
    }

    // Extrair e validar variáveis
    const variables = this.extractVariables(template.content, template.subject);
    
    // Verificar se todas as variáveis estão na lista permitida
    const allowedVariables = this.getAllowedVariables();
    const invalidVariables = variables.filter(v => !allowedVariables.includes(v));
    
    if (invalidVariables.length > 0) {
      throw new Error(`Variáveis inválidas encontradas: ${invalidVariables.join(', ')}`);
    }
  }

  /**
   * Preview de um template com dados de exemplo
   */
  async previewTemplate(
    templateContent: string,
    templateSubject?: string
  ): Promise<RenderedTemplate> {
    const sampleContext: TemplateRenderContext = {
      user: {
        id: 'sample-user-id',
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '+5511999999999'
      },
      appointment: {
        id: 'sample-appointment-id',
        date: new Date('2025-02-15'),
        time: '14:30',
        service: 'Limpeza de Pele',
        professional: 'Dr. João Santos',
        location: 'Sala 1'
      },
      payment: {
        id: 'sample-payment-id',
        amount: 150.00,
        currency: 'BRL',
        due_date: new Date('2025-02-10')
      },
      clinic: {
        name: 'Clínica Estética NeonPro',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        phone: '+5511888888888',
        email: 'contato@neonpro.com.br',
        website: 'https://neonpro.com.br'
      }
    };

    const startTime = Date.now();
    
    try {
      const renderedContent = await this.renderContent(templateContent, sampleContext);
      let renderedSubject: string | undefined;
      
      if (templateSubject) {
        renderedSubject = await this.renderContent(templateSubject, sampleContext);
      }

      const variablesUsed = this.extractUsedVariables(templateContent, templateSubject);

      return {
        subject: renderedSubject,
        content: renderedContent,
        variables_used: variablesUsed,
        render_time_ms: Date.now() - startTime,
        template_version: 1
      };
    } catch (error) {
      throw new Error(`Erro no preview do template: ${error}`);
    }
  }

  // Métodos privados
  private async renderContent(
    content: string,
    context: TemplateRenderContext
  ): Promise<string> {
    let rendered = content;

    // Substituir variáveis do usuário
    if (context.user) {
      rendered = rendered.replace(/{{\s*user\.name\s*}}/g, context.user.name || '');
      rendered = rendered.replace(/{{\s*user\.email\s*}}/g, context.user.email || '');
      rendered = rendered.replace(/{{\s*user\.phone\s*}}/g, context.user.phone || '');
    }

    // Substituir variáveis do agendamento
    if (context.appointment) {
      rendered = rendered.replace(/{{\s*appointment\.date\s*}}/g, 
        context.appointment.date.toLocaleDateString('pt-BR'));
      rendered = rendered.replace(/{{\s*appointment\.time\s*}}/g, context.appointment.time);
      rendered = rendered.replace(/{{\s*appointment\.service\s*}}/g, context.appointment.service);
      rendered = rendered.replace(/{{\s*appointment\.professional\s*}}/g, context.appointment.professional);
      rendered = rendered.replace(/{{\s*appointment\.location\s*}}/g, context.appointment.location || '');
    }

    // Substituir variáveis de pagamento
    if (context.payment) {
      rendered = rendered.replace(/{{\s*payment\.amount\s*}}/g, 
        context.payment.amount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: context.payment.currency || 'BRL'
        }));
      
      if (context.payment.due_date) {
        rendered = rendered.replace(/{{\s*payment\.due_date\s*}}/g, 
          context.payment.due_date.toLocaleDateString('pt-BR'));
      }
    }

    // Substituir variáveis da clínica
    if (context.clinic) {
      rendered = rendered.replace(/{{\s*clinic\.name\s*}}/g, context.clinic.name);
      rendered = rendered.replace(/{{\s*clinic\.address\s*}}/g, context.clinic.address);
      rendered = rendered.replace(/{{\s*clinic\.phone\s*}}/g, context.clinic.phone);
      rendered = rendered.replace(/{{\s*clinic\.email\s*}}/g, context.clinic.email);
      rendered = rendered.replace(/{{\s*clinic\.website\s*}}/g, context.clinic.website || '');
    }

    // Substituir variáveis customizadas
    if (context.custom) {
      for (const [key, value] of Object.entries(context.custom)) {
        const regex = new RegExp(`{{\\s*custom\\.${key}\\s*}}`, 'g');
        rendered = rendered.replace(regex, String(value));
      }
    }

    // Substituir variáveis de data/hora atuais
    const now = new Date();
    rendered = rendered.replace(/{{\s*current\.date\s*}}/g, now.toLocaleDateString('pt-BR'));
    rendered = rendered.replace(/{{\s*current\.time\s*}}/g, now.toLocaleTimeString('pt-BR'));
    rendered = rendered.replace(/{{\s*current\.year\s*}}/g, now.getFullYear().toString());

    return rendered;
  }

  private async validateTemplateSyntax(content: string): Promise<void> {
    // Verificar se todas as variáveis estão bem formadas
    const variableRegex = /{{\s*([^}]+)\s*}}/g;
    const matches = content.match(variableRegex);
    
    if (matches) {
      for (const match of matches) {
        const variable = match.replace(/[{}\s]/g, '');
        
        // Verificar se a variável tem formato válido
        if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(variable)) {
          throw new Error(`Sintaxe de variável inválida: ${match}`);
        }
      }
    }
  }

  private extractVariables(content: string, subject?: string): string[] {
    const variables = new Set<string>();
    const variableRegex = /{{\s*([^}]+)\s*}}/g;
    
    // Extrair do conteúdo
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    
    // Extrair do subject se existir
    if (subject) {
      variableRegex.lastIndex = 0;
      while ((match = variableRegex.exec(subject)) !== null) {
        variables.add(match[1].trim());
      }
    }
    
    return Array.from(variables);
  }

  private extractUsedVariables(content: string, subject?: string): string[] {
    return this.extractVariables(content, subject);
  }

  private getAllowedVariables(): string[] {
    return [
      'user.name', 'user.email', 'user.phone',
      'appointment.date', 'appointment.time', 'appointment.service', 
      'appointment.professional', 'appointment.location',
      'payment.amount', 'payment.due_date',
      'clinic.name', 'clinic.address', 'clinic.phone', 'clinic.email', 'clinic.website',
      'current.date', 'current.time', 'current.year'
    ];
  }

  private async getTemplateVariables(templateId: string): Promise<TemplateVariable[]> {
    // Verificar cache
    if (this.variableCache.has(templateId)) {
      return this.variableCache.get(templateId)!;
    }

    // Por enquanto, retornar variáveis padrão
    // Em uma implementação completa, você buscaria do banco de dados
    const defaultVariables: TemplateVariable[] = [
      {
        name: 'user.name',
        type: 'string',
        required: true,
        description: 'Nome do usuário'
      },
      {
        name: 'user.email',
        type: 'string',
        required: false,
        description: 'Email do usuário'
      },
      {
        name: 'appointment.date',
        type: 'date',
        required: false,
        description: 'Data do agendamento'
      },
      {
        name: 'clinic.name',
        type: 'string',
        required: false,
        description: 'Nome da clínica'
      }
    ];

    this.variableCache.set(templateId, defaultVariables);
    return defaultVariables;
  }

  private async validateContext(
    context: TemplateRenderContext,
    variables: TemplateVariable[]
  ): Promise<void> {
    // Verificar se todas as variáveis obrigatórias estão presentes
    const requiredVariables = variables.filter(v => v.required);
    
    for (const variable of requiredVariables) {
      const value = this.getVariableValue(context, variable.name);
      
      if (value === undefined || value === null || value === '') {
        throw new Error(`Variável obrigatória ausente: ${variable.name}`);
      }
    }
  }

  private getVariableValue(context: TemplateRenderContext, variableName: string): any {
    const parts = variableName.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
}

export default TemplateEngine;

