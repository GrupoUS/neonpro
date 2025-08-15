/**
 * Intelligent Scheduling Communication Templates
 * Story 5.3: Automated Communication for Scheduling
 */

export interface SchedulingTemplate {
  id: string;
  name: string;
  type:
    | 'reminder'
    | 'confirmation'
    | 'cancellation'
    | 'reschedule'
    | 'waitlist'
    | 'no_show_prevention';
  channels: Array<'sms' | 'email' | 'whatsapp'>;
  timing: string; // e.g., '24h', '2h', '30m', 'immediate'
  conditions: TemplateCondition[];
  content: TemplateContent;
  variables: string[];
  personalization: PersonalizationRules;
  analytics: TemplateAnalytics;
  active: boolean;
  clinicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateCondition {
  field: string; // e.g., 'service_type', 'patient_age', 'no_show_history', 'time_of_day'
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'in_range';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface TemplateContent {
  sms?: {
    text: string;
    maxLength: number;
  };
  email?: {
    subject: string;
    html: string;
    text: string;
  };
  whatsapp?: {
    text: string;
    buttons?: Array<{
      type: 'quick_reply' | 'url' | 'phone';
      title: string;
      payload?: string;
      url?: string;
      phone?: string;
    }>;
    media?: {
      type: 'image' | 'document';
      url: string;
      caption?: string;
    };
  };
}

export interface PersonalizationRules {
  usePatientName: boolean;
  useProfessionalName: boolean;
  useServiceName: boolean;
  useTimeOfDay: boolean; // "Bom dia", "Boa tarde", "Boa noite"
  useWeatherContext: boolean;
  usePreviousHistory: boolean;
  useNoShowRisk: boolean;
  customPersonalization?: Array<{
    condition: string;
    replacement: string;
  }>;
}

export interface TemplateAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  responseRate: number;
  confirmationRate: number;
  cancellationRate: number;
  noShowReduction: number;
  costPerMessage: number;
  roi: number;
  lastUpdated: Date;
}

export class SchedulingTemplateEngine {
  private readonly templates: Map<string, SchedulingTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default intelligent templates for scheduling
   */
  private initializeDefaultTemplates() {
    // 24h Reminder Template - High Priority Services
    this.templates.set('reminder_24h_high_priority', {
      id: 'reminder_24h_high_priority',
      name: 'Lembrete 24h - Serviços Prioritários',
      type: 'reminder',
      channels: ['whatsapp', 'sms'],
      timing: '24h',
      conditions: [
        {
          field: 'service_category',
          operator: 'in_range',
          value: ['cirurgia', 'botox', 'preenchimento', 'laser'],
        },
        {
          field: 'appointment_value',
          operator: 'greater_than',
          value: 500,
          logic: 'OR',
        },
      ],
      content: {
        whatsapp: {
          text: `🩺 Olá {{patientName}}! 

{{timeGreeting}}! Lembramos que você tem seu procedimento de {{serviceName}} agendado para amanhã ({{appointmentDate}}) às {{appointmentTime}} com {{professionalName}}.

📋 *Orientações importantes:*
{{#if isHighRiskService}}
• Jejum de 8h antes do procedimento
• Não use maquiagem na região
• Traga acompanhante
{{/if}}

{{#if hasNoShowHistory}}
⚠️ Sua presença é muito importante. Caso não possa comparecer, avise com antecedência.
{{/if}}

✅ Digite *CONFIRMO* para confirmar
❌ Digite *CANCELO* se não puder comparecer
📅 Digite *REAGENDO* para remarcar

{{clinicName}} - {{clinicPhone}}`,
          buttons: [
            { type: 'quick_reply', title: 'Confirmar', payload: 'CONFIRM' },
            { type: 'quick_reply', title: 'Cancelar', payload: 'CANCEL' },
            { type: 'quick_reply', title: 'Reagendar', payload: 'RESCHEDULE' },
          ],
        },
        sms: {
          text: '🩺 {{patientName}}, lembrete: {{serviceName}} amanhã {{appointmentDate}} às {{appointmentTime}} com {{professionalName}}. {{#if hasNoShowHistory}}Sua presença é importante!{{/if}} Responda: CONFIRMO/CANCELO/REAGENDO. {{clinicName}}',
          maxLength: 160,
        },
      },
      variables: [
        'patientName',
        'serviceName',
        'appointmentDate',
        'appointmentTime',
        'professionalName',
        'clinicName',
        'clinicPhone',
        'timeGreeting',
        'isHighRiskService',
        'hasNoShowHistory',
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: true,
        useWeatherContext: false,
        usePreviousHistory: true,
        useNoShowRisk: true,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2h Reminder Template - All Services
    this.templates.set('reminder_2h_all_services', {
      id: 'reminder_2h_all_services',
      name: 'Lembrete 2h - Todos os Serviços',
      type: 'reminder',
      channels: ['sms', 'whatsapp'],
      timing: '2h',
      conditions: [],
      content: {
        sms: {
          text: '⏰ {{patientName}}, em 2h você tem {{serviceName}} às {{appointmentTime}} com {{professionalName}}. {{weatherAlert}} Confirme: SIM/NAO. {{clinicName}}',
          maxLength: 160,
        },
        whatsapp: {
          text: `⏰ Oi {{patientName}}!

Seu {{serviceName}} é daqui a 2 horas ({{appointmentTime}}) com {{professionalName}}.

{{#if weatherAlert}}
🌧️ {{weatherAlert}}
{{/if}}

{{#if trafficAlert}}
🚗 {{trafficAlert}}
{{/if}}

Nos vemos em breve! 💚

{{clinicName}}`,
          buttons: [
            { type: 'quick_reply', title: 'A caminho!', payload: 'CONFIRMED' },
            { type: 'quick_reply', title: 'Atraso', payload: 'DELAY' },
          ],
        },
      },
      variables: [
        'patientName',
        'serviceName',
        'appointmentTime',
        'professionalName',
        'clinicName',
        'weatherAlert',
        'trafficAlert',
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: true,
        usePreviousHistory: false,
        useNoShowRisk: false,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // No-Show Prevention Template - High Risk Patients
    this.templates.set('no_show_prevention_high_risk', {
      id: 'no_show_prevention_high_risk',
      name: 'Prevenção No-Show - Alto Risco',
      type: 'no_show_prevention',
      channels: ['whatsapp', 'sms', 'email'],
      timing: '4h',
      conditions: [
        {
          field: 'no_show_probability',
          operator: 'greater_than',
          value: 0.7,
        },
      ],
      content: {
        whatsapp: {
          text: `🚨 {{patientName}}, confirmação URGENTE necessária!

Seu {{serviceName}} é hoje às {{appointmentTime}} com {{professionalName}}.

⚠️ Notamos que você pode ter dificuldades para comparecer. Queremos ajudar!

🎯 Opções disponíveis:
✅ Manter agendamento
📅 Reagendar sem taxa
💬 Falar com atendimento

Sua agenda está reservada e outras pessoas aguardam. Por favor, confirme sua situação.

{{clinicName}} - Fone: {{clinicPhone}}`,
          buttons: [
            {
              type: 'quick_reply',
              title: 'Confirmo presença',
              payload: 'CONFIRM_PRESENCE',
            },
            {
              type: 'quick_reply',
              title: 'Preciso reagendar',
              payload: 'NEED_RESCHEDULE',
            },
            { type: 'phone', title: 'Ligar agora', phone: '{{clinicPhone}}' },
          ],
        },
        email: {
          subject: 'URGENTE: Confirmação necessária - {{serviceName}} hoje',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e74c3c;">🚨 Confirmação Urgente Necessária</h2>
              
              <p>Olá <strong>{{patientName}}</strong>,</p>
              
              <p>Seu procedimento de <strong>{{serviceName}}</strong> está agendado para hoje às <strong>{{appointmentTime}}</strong> com {{professionalName}}.</p>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>⚠️ Detectamos que você pode ter dificuldades para comparecer.</strong><br>
                Queremos ajudar você a resolver essa situação!
              </div>
              
              <h3>🎯 Suas opções:</h3>
              <ul>
                <li>✅ <strong>Manter o agendamento</strong> - Confirme sua presença</li>
                <li>📅 <strong>Reagendar sem taxa</strong> - Escolha nova data</li>
                <li>💬 <strong>Falar conosco</strong> - Tire suas dúvidas</li>
              </ul>
              
              <p><strong>Sua agenda está reservada e outras pessoas aguardam na lista de espera.</strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{confirmationUrl}}" style="background: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 5px;">Confirmar Presença</a>
                <a href="{{rescheduleUrl}}" style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 5px;">Reagendar</a>
              </div>
              
              <p>Atenciosamente,<br><strong>{{clinicName}}</strong><br>📞 {{clinicPhone}}</p>
            </div>
          `,
          text: 'URGENTE: {{patientName}}, seu {{serviceName}} é hoje às {{appointmentTime}}. Detectamos possível dificuldade de comparecimento. Confirme presença ou reagende sem taxa. {{clinicName}} - {{clinicPhone}}',
        },
      },
      variables: [
        'patientName',
        'serviceName',
        'appointmentTime',
        'professionalName',
        'clinicName',
        'clinicPhone',
        'confirmationUrl',
        'rescheduleUrl',
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: false,
        usePreviousHistory: true,
        useNoShowRisk: true,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Waitlist Notification Template
    this.templates.set('waitlist_slot_available', {
      id: 'waitlist_slot_available',
      name: 'Vaga Disponível - Lista de Espera',
      type: 'waitlist',
      channels: ['whatsapp', 'sms'],
      timing: 'immediate',
      conditions: [],
      content: {
        whatsapp: {
          text: `🎉 Ótima notícia, {{patientName}}!

Uma vaga para {{serviceName}} com {{professionalName}} ficou disponível:

📅 Data: {{appointmentDate}}
⏰ Horário: {{appointmentTime}}
🏥 Local: {{clinicName}}

⏰ Você tem 30 minutos para confirmar antes da vaga ser oferecida para o próximo da lista.

✅ Digite *ACEITO* para confirmar
❌ Digite *RECUSO* se não puder

Não perca essa oportunidade! 💚`,
          buttons: [
            { type: 'quick_reply', title: 'ACEITO', payload: 'ACCEPT_SLOT' },
            { type: 'quick_reply', title: 'RECUSO', payload: 'DECLINE_SLOT' },
          ],
        },
        sms: {
          text: '🎉 {{patientName}}, vaga disponível! {{serviceName}} - {{appointmentDate}} {{appointmentTime}} com {{professionalName}}. 30min para confirmar. ACEITO/RECUSO. {{clinicName}}',
          maxLength: 160,
        },
      },
      variables: [
        'patientName',
        'serviceName',
        'professionalName',
        'appointmentDate',
        'appointmentTime',
        'clinicName',
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: false,
        usePreviousHistory: false,
        useNoShowRisk: false,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): SchedulingTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get templates by type and conditions
   */
  getTemplatesByType(
    type: SchedulingTemplate['type'],
    conditions?: any
  ): SchedulingTemplate[] {
    return Array.from(this.templates.values())
      .filter((template) => template.type === type && template.active)
      .filter((template) => this.matchesConditions(template, conditions));
  }

  /**
   * Select best template based on appointment and patient data
   */
  selectBestTemplate(
    type: SchedulingTemplate['type'],
    appointmentData: any,
    patientData: any,
    noShowPrediction?: any
  ): SchedulingTemplate | null {
    const availableTemplates = this.getTemplatesByType(type);

    if (availableTemplates.length === 0) {
      return null;
    }

    // Combine all data for condition matching
    const contextData = {
      ...(appointmentData || {}),
      ...(patientData || {}),
      ...(noShowPrediction || {}),
    };

    // Find templates that match conditions
    const matchingTemplates = availableTemplates.filter((template) =>
      this.matchesConditions(template, contextData)
    );

    if (matchingTemplates.length === 0) {
      // Return first available template as fallback
      return availableTemplates[0];
    }

    // Select template with best performance (highest response rate)
    return matchingTemplates.reduce((best, current) =>
      current.analytics.responseRate > best.analytics.responseRate
        ? current
        : best
    );
  }

  /**
   * Check if template conditions match the provided data
   */
  private matchesConditions(template: SchedulingTemplate, data: any): boolean {
    if (template.conditions.length === 0) {
      return true;
    }

    if (!data) {
      return false;
    }

    return template.conditions.every((condition) => {
      const fieldValue = data[condition.field];

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'contains':
          return Array.isArray(fieldValue)
            ? fieldValue.includes(condition.value)
            : String(fieldValue).includes(String(condition.value));
        case 'in_range':
          return Array.isArray(condition.value)
            ? condition.value.includes(fieldValue)
            : fieldValue >= condition.value.min &&
                fieldValue <= condition.value.max;
        default:
          return false;
      }
    });
  }

  /**
   * Render template with personalized content
   */
  async renderTemplate(
    template: SchedulingTemplate,
    channel: 'sms' | 'email' | 'whatsapp',
    variables: Record<string, any>
  ): Promise<string | object> {
    const content = template.content[channel];
    if (!content) {
      throw new Error(`Template does not support channel: ${channel}`);
    }

    // Apply personalization rules
    const personalizedVariables = await this.applyPersonalization(
      template.personalization,
      variables
    );

    // Render template based on channel
    switch (channel) {
      case 'sms':
        return this.renderText(content.text, personalizedVariables);
      case 'email':
        return {
          subject: this.renderText(content.subject, personalizedVariables),
          html: this.renderText(content.html, personalizedVariables),
          text: this.renderText(content.text, personalizedVariables),
        };
      case 'whatsapp':
        return {
          text: this.renderText(content.text, personalizedVariables),
          buttons: content.buttons,
          media: content.media,
        };
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  /**
   * Apply personalization rules to variables
   */
  private async applyPersonalization(
    rules: PersonalizationRules,
    variables: Record<string, any>
  ): Promise<Record<string, any>> {
    const personalized = { ...variables };

    // Add time-based greeting
    if (rules.useTimeOfDay) {
      const hour = new Date().getHours();
      if (hour < 12) {
        personalized.timeGreeting = 'Bom dia';
      } else if (hour < 18) {
        personalized.timeGreeting = 'Boa tarde';
      } else {
        personalized.timeGreeting = 'Boa noite';
      }
    }

    // Add weather context (simplified example)
    if (rules.useWeatherContext) {
      // In a real implementation, this would fetch weather data
      personalized.weatherAlert =
        'Previsão de chuva - saia um pouco mais cedo!';
    }

    // Add no-show risk context
    if (rules.useNoShowRisk && variables.no_show_probability) {
      personalized.hasNoShowHistory = variables.no_show_probability > 0.5;
      personalized.isHighRiskService =
        variables.service_category === 'cirurgia';
    }

    return personalized;
  }

  /**
   * Simple template rendering with variable substitution
   */
  private renderText(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Replace simple variables {{variable}}
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(variables[key] || ''));
    });

    // Handle simple conditionals {{#if condition}}...{{/if}}
    rendered = rendered.replace(
      /{{#if (\w+)}}(.*?){{\/if}}/gs,
      (_match, condition, content) => {
        return variables[condition] ? content : '';
      }
    );

    return rendered;
  }

  /**
   * Update template analytics
   */
  updateAnalytics(templateId: string, metrics: Partial<TemplateAnalytics>) {
    const template = this.templates.get(templateId);
    if (template) {
      template.analytics = {
        ...template.analytics,
        ...metrics,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get all active templates
   */
  getAllActiveTemplates(): SchedulingTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.active);
  }

  /**
   * Add custom template
   */
  addTemplate(template: SchedulingTemplate) {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(templateId: string) {
    this.templates.delete(templateId);
  }
}

export const schedulingTemplateEngine = new SchedulingTemplateEngine();
