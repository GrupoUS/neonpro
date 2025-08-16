/**
 * NeonPro Notification System - Template Engine
 * Story 1.7: Sistema de Notificações
 *
 * Engine para renderização de templates de notificação
 * Suporte a variáveis, condicionais e formatação
 */

import {
  NotificationChannel,
  type NotificationContext,
  type NotificationTemplate,
  NotificationType,
} from './types';

// ============================================================================
// INTERFACES
// ============================================================================

type RenderedContent = {
  subject?: string;
  title: string;
  body: string;
  variables: Record<string, any>;
};

type TemplateFunction = (context: NotificationContext) => string;

// ============================================================================
// TEMPLATE ENGINE CLASS
// ============================================================================

/**
 * Engine de templates para notificações
 */
export class TemplateEngine {
  private readonly templates: Map<string, NotificationTemplate> = new Map();
  private readonly functions: Map<string, TemplateFunction> = new Map();

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  /**
   * Inicializa o template engine
   */
  async initialize(): Promise<void> {
    this.registerDefaultFunctions();
    await this.loadDefaultTemplates();
    this.isInitialized = true;
  }

  /**
   * Registra funções padrão do template
   */
  private registerDefaultFunctions(): void {
    // Formatação de data
    this.functions.set('formatDate', (_context) => {
      return (date: Date | string, format = 'dd/MM/yyyy') => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return this.formatDate(d, format);
      };
    });

    // Formatação de moeda
    this.functions.set('formatCurrency', (_context) => {
      return (value: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency,
        }).format(value);
      };
    });

    // Formatação de telefone
    this.functions.set('formatPhone', (_context) => {
      return (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
          return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
      };
    });

    // Saudação baseada no horário
    this.functions.set('greeting', (_context) => {
      return () => {
        const hour = new Date().getHours();
        if (hour < 12) {
          return 'Bom dia';
        }
        if (hour < 18) {
          return 'Boa tarde';
        }
        return 'Boa noite';
      };
    });

    // Nome do primeiro nome
    this.functions.set('firstName', (_context) => {
      return (fullName: string) => {
        return fullName.split(' ')[0];
      };
    });
  }

  // ============================================================================
  // GERENCIAMENTO DE TEMPLATES
  // ============================================================================

  /**
   * Adiciona um template
   */
  async addTemplate(template: NotificationTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }

  /**
   * Obtém template por ID
   */
  async getTemplate(
    templateId: string,
  ): Promise<NotificationTemplate | undefined> {
    return this.templates.get(templateId);
  }

  /**
   * Obtém template por tipo e canal
   */
  async getTemplateByType(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | undefined> {
    for (const template of this.templates.values()) {
      if (
        template.type === type &&
        template.channel === channel &&
        template.isActive
      ) {
        return template;
      }
    }

    // Fallback para template padrão
    return this.getDefaultTemplate(type, channel);
  }

  /**
   * Lista todos os templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Remove template
   */
  async removeTemplate(templateId: string): Promise<void> {
    this.templates.delete(templateId);
  }

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  /**
   * Renderiza template com contexto
   */
  async render(
    template: NotificationTemplate | undefined,
    context: NotificationContext,
  ): Promise<RenderedContent> {
    if (!template) {
      return {
        title: context.data.title || 'Notificação',
        body: context.data.message || 'Você tem uma nova notificação.',
        variables: {},
      };
    }

    const variables = this.extractVariables(context);

    return {
      subject: template.subject
        ? this.renderString(template.subject, variables, context)
        : undefined,
      title: this.renderString(template.title, variables, context),
      body: this.renderString(template.body, variables, context),
      variables,
    };
  }

  /**
   * Renderiza string com variáveis
   */
  private renderString(
    template: string,
    variables: Record<string, any>,
    context: NotificationContext,
  ): string {
    let result = template;

    // Substituir variáveis simples {{variable}}
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, varName) => {
      const value = this.getVariableValue(varName.trim(), variables, context);
      return value !== undefined ? String(value) : match;
    });

    // Processar funções {%function(args)%}
    result = result.replace(/\{%\s*([^}]+)\s*%\}/g, (match, funcCall) => {
      try {
        const value = this.evaluateFunction(funcCall.trim(), context);
        return value !== undefined ? String(value) : match;
      } catch (_error) {
        return match;
      }
    });

    // Processar condicionais {?condition}content{/condition}
    result = result.replace(
      /\{\?\s*([^}]+)\s*\}([\s\S]*?)\{\/\1\}/g,
      (_match, condition, content) => {
        try {
          const shouldShow = this.evaluateCondition(
            condition.trim(),
            variables,
            context,
          );
          return shouldShow ? content : '';
        } catch (_error) {
          return '';
        }
      },
    );

    return result;
  }

  /**
   * Extrai variáveis do contexto
   */
  private extractVariables(context: NotificationContext): Record<string, any> {
    return {
      // Dados do destinatário
      recipient: {
        id: context.recipient.id,
        email: context.recipient.email,
        phone: context.recipient.phone,
        timezone: context.recipient.timezone,
        language: context.recipient.language,
      },

      // Dados da clínica
      clinic: context.clinic,

      // Dados específicos da notificação
      ...context.data,

      // Dados de sistema
      timestamp: context.timestamp,
      locale: context.locale,

      // Dados de data/hora
      now: new Date(),
      today: new Date().toISOString().split('T')[0],

      // URLs úteis
      urls: {
        app: process.env.NEXT_PUBLIC_APP_URL || 'https://app.neonpro.com',
        unsubscribe: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${context.recipient.id}`,
        preferences: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?token=${context.recipient.id}`,
      },
    };
  }

  /**
   * Obtém valor de variável com suporte a notação de ponto
   */
  private getVariableValue(
    path: string,
    variables: Record<string, any>,
    _context: NotificationContext,
  ): any {
    const keys = path.split('.');
    let value = variables;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return;
      }
    }

    return value;
  }

  /**
   * Avalia função do template
   */
  private evaluateFunction(
    funcCall: string,
    context: NotificationContext,
  ): any {
    // Parse simples de função: functionName(arg1, arg2)
    const match = funcCall.match(/^(\w+)\((.*)\)$/);
    if (!match) {
      throw new Error(`Formato de função inválido: ${funcCall}`);
    }

    const [, funcName, argsStr] = match;
    const func = this.functions.get(funcName);

    if (!func) {
      throw new Error(`Função não encontrada: ${funcName}`);
    }

    // Parse simples de argumentos (sem suporte a objetos complexos)
    const args = argsStr
      ? argsStr.split(',').map((arg) => {
          const trimmed = arg.trim();
          // String literal
          if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.slice(1, -1);
          }
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
          }
          // Número
          if (/^\d+(\.\d+)?$/.test(trimmed)) {
            return Number.parseFloat(trimmed);
          }
          // Boolean
          if (trimmed === 'true') {
            return true;
          }
          if (trimmed === 'false') {
            return false;
          }
          // Variável
          return this.getVariableValue(
            trimmed,
            this.extractVariables(context),
            context,
          );
        })
      : [];

    const templateFunc = func(context);
    return templateFunc(...args);
  }

  /**
   * Avalia condição do template
   */
  private evaluateCondition(
    condition: string,
    variables: Record<string, any>,
    context: NotificationContext,
  ): boolean {
    // Condições simples: variable, !variable, variable == value
    condition = condition.trim();

    // Negação
    if (condition.startsWith('!')) {
      const varName = condition.slice(1).trim();
      const value = this.getVariableValue(varName, variables, context);
      return !value;
    }

    // Comparação
    const operators = ['==', '!=', '>', '<', '>=', '<='];
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map((s) => s.trim());
        const leftValue = this.getVariableValue(left, variables, context);
        const rightValue = this.parseValue(right, variables, context);

        switch (op) {
          case '==':
            return leftValue === rightValue;
          case '!=':
            return leftValue !== rightValue;
          case '>':
            return leftValue > rightValue;
          case '<':
            return leftValue < rightValue;
          case '>=':
            return leftValue >= rightValue;
          case '<=':
            return leftValue <= rightValue;
        }
      }
    }

    // Existência da variável
    const value = this.getVariableValue(condition, variables, context);
    return Boolean(value);
  }

  /**
   * Parse de valor (string, número, variável)
   */
  private parseValue(
    value: string,
    variables: Record<string, any>,
    context: NotificationContext,
  ): any {
    value = value.trim();

    // String literal
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      return value.slice(1, -1);
    }

    // Número
    if (/^\d+(\.\d+)?$/.test(value)) {
      return Number.parseFloat(value);
    }

    // Boolean
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }

    // Variável
    return this.getVariableValue(value, variables, context);
  }

  // ============================================================================
  // TEMPLATES PADRÃO
  // ============================================================================

  /**
   * Carrega templates padrão
   */
  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates = this.getDefaultTemplates();

    for (const template of defaultTemplates) {
      await this.addTemplate(template);
    }
  }

  /**
   * Obtém template padrão para tipo e canal
   */
  private getDefaultTemplate(
    type: NotificationType,
    channel: NotificationChannel,
  ): NotificationTemplate {
    const templates = this.getDefaultTemplates();

    const template = templates.find(
      (t) => t.type === type && t.channel === channel,
    );
    if (template) {
      return template;
    }

    // Template genérico
    return {
      id: `default_${type}_${channel}`,
      name: `Default ${type} ${channel}`,
      type,
      channel,
      title: '{{data.title}}',
      body: '{{data.message}}',
      variables: ['data.title', 'data.message'],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Define templates padrão do sistema
   */
  private getDefaultTemplates(): NotificationTemplate[] {
    return [
      // Templates de Agendamento - Email
      {
        id: 'appointment_created_email',
        name: 'Agendamento Criado - Email',
        type: NotificationType.APPOINTMENT_CREATED,
        channel: NotificationChannel.EMAIL,
        subject: 'Agendamento Confirmado - {{clinic.name}}',
        title: 'Seu agendamento foi confirmado!',
        body: `
          <h2>{%greeting()%}, {{firstName(recipient.name)}}!</h2>
          
          <p>Seu agendamento foi confirmado com sucesso:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes do Agendamento</h3>
            <p><strong>Procedimento:</strong> {{appointment.procedure}}</p>
            <p><strong>Data:</strong> {{formatDate(appointment.date, 'dd/MM/yyyy')}}</p>
            <p><strong>Horário:</strong> {{appointment.time}}</p>
            <p><strong>Profissional:</strong> {{appointment.professional}}</p>
            {?appointment.location}<p><strong>Local:</strong> {{appointment.location}}</p>{/appointment.location}
          </div>
          
          <p>Chegue com 15 minutos de antecedência.</p>
          
          <p>Em caso de dúvidas, entre em contato:</p>
          <p>📞 {{formatPhone(clinic.contact.phone)}}</p>
          <p>✉️ {{clinic.contact.email}}</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            {{clinic.name}}<br>
            {{clinic.contact.address}}
          </p>
        `,
        variables: [
          'recipient.name',
          'appointment.procedure',
          'appointment.date',
          'appointment.time',
          'appointment.professional',
          'appointment.location',
          'clinic.name',
          'clinic.contact.phone',
          'clinic.contact.email',
          'clinic.contact.address',
        ],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Templates de Agendamento - SMS
      {
        id: 'appointment_reminder_sms',
        name: 'Lembrete de Agendamento - SMS',
        type: NotificationType.APPOINTMENT_REMINDER,
        channel: NotificationChannel.SMS,
        title: 'Lembrete de Consulta',
        body: `
          🏥 {{clinic.name}}
          
          Olá {{firstName(recipient.name)}}! Lembrete da sua consulta:
          
          📅 {{formatDate(appointment.date, 'dd/MM')}}
          🕐 {{appointment.time}}
          👨‍⚕️ {{appointment.professional}}
          
          Chegue 15min antes.
          
          Para cancelar: {{urls.app}}/cancel/{{appointment.id}}
        `,
        variables: [
          'recipient.name',
          'appointment.date',
          'appointment.time',
          'appointment.professional',
          'appointment.id',
          'clinic.name',
        ],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Templates de Sistema - In-App
      {
        id: 'system_alert_in_app',
        name: 'Alerta do Sistema - In-App',
        type: NotificationType.SYSTEM_ALERT,
        channel: NotificationChannel.IN_APP,
        title: '{{alert.title}}',
        body: `
          <div class="alert alert-{{alert.severity}}">
            <h4>{{alert.title}}</h4>
            <p>{{alert.message}}</p>
            
            {?alert.action}
            <button onclick="{{alert.action.handler}}">
              {{alert.action.label}}
            </button>
            {/alert.action}
            
            <small>{{formatDate(timestamp, 'dd/MM/yyyy HH:mm')}}</small>
          </div>
        `,
        variables: [
          'alert.title',
          'alert.message',
          'alert.severity',
          'alert.action.label',
          'alert.action.handler',
          'timestamp',
        ],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Templates de Pagamento - Email
      {
        id: 'payment_received_email',
        name: 'Pagamento Recebido - Email',
        type: NotificationType.PAYMENT_RECEIVED,
        channel: NotificationChannel.EMAIL,
        subject: 'Pagamento Confirmado - {{clinic.name}}',
        title: 'Pagamento confirmado!',
        body: `
          <h2>Pagamento Confirmado</h2>
          
          <p>Olá {{firstName(recipient.name)}},</p>
          
          <p>Confirmamos o recebimento do seu pagamento:</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes do Pagamento</h3>
            <p><strong>Valor:</strong> {{formatCurrency(payment.amount)}}</p>
            <p><strong>Método:</strong> {{payment.method}}</p>
            <p><strong>Data:</strong> {{formatDate(payment.date, 'dd/MM/yyyy HH:mm')}}</p>
            <p><strong>Referência:</strong> {{payment.reference}}</p>
          </div>
          
          <p>Obrigado pela preferência!</p>
          
          <p>Atenciosamente,<br>{{clinic.name}}</p>
        `,
        variables: [
          'recipient.name',
          'payment.amount',
          'payment.method',
          'payment.date',
          'payment.reference',
          'clinic.name',
        ],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Formata data
   */
  private formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString())
      .replace('HH', hours)
      .replace('mm', minutes);
  }

  /**
   * Valida template
   */
  validateTemplate(template: NotificationTemplate): string[] {
    const errors: string[] = [];

    if (!template.title.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!template.body.trim()) {
      errors.push('Corpo é obrigatório');
    }

    // Validar sintaxe de variáveis
    const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    const functionRegex = /\{%\s*([^}]+)\s*%\}/g;
    const _conditionalRegex = /\{\?\s*([^}]+)\s*\}/g;

    let match;

    // Verificar variáveis
    while ((match = variableRegex.exec(template.body)) !== null) {
      const varName = match[1].trim();
      if (!varName) {
        errors.push(`Variável vazia encontrada: ${match[0]}`);
      }
    }

    // Verificar funções
    while ((match = functionRegex.exec(template.body)) !== null) {
      const funcCall = match[1].trim();
      if (!(funcCall.includes('(') && funcCall.includes(')'))) {
        errors.push(`Sintaxe de função inválida: ${match[0]}`);
      }
    }

    return errors;
  }
}

export default TemplateEngine;
