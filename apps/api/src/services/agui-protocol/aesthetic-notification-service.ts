/**
 * Notification Service for Aesthetic Clinics
 *
 * Handles multi-channel notifications including email, SMS, WhatsApp,
 * and in-app notifications for aesthetic clinic operations.
 */

export interface AestheticNotificationConfig {
  emailProvider: string;
  smsProvider: string;
  whatsappProvider: string;
  defaultLanguage: 'pt-BR' | 'en-US';
  enableScheduling: boolean;
  enableTemplates: boolean;
  enableTracking: boolean;
  rateLimits: {
    email: number;
    sms: number;
    whatsapp: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  category: 'appointment' | 'treatment' | 'financial' | 'compliance' | 'marketing' | 'emergency';
  language: string;
  subject?: string;
  content: string;
  variables: string[];
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMessage {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  category: 'appointment' | 'treatment' | 'financial' | 'compliance' | 'marketing' | 'emergency';
  recipient: {
    clientId: string;
    contactInfo: {
      email?: string;
      phone?: string;
      whatsapp?: string;
    };
    preferredLanguage: string;
  };
  templateId?: string;
  content: {
    subject?: string;
    message: string;
    variables?: Record<string, any>;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  expiresAt?: string;
  requireConfirmation: boolean;
  metadata: {
    appointmentId?: string;
    treatmentId?: string;
    invoiceId?: string;
    complianceId?: string;
    [key: string]: any;
  };
}

export interface NotificationResult {
  id: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  channel: string;
  recipient: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
  cost?: number;
  trackingId?: string;
  providerResponse?: any;
}

export interface AppointmentNotificationData {
  appointmentId: string;
  clientId: string;
  professionalName: string;
  treatmentName: string;
  scheduledDate: string;
  duration: number;
  location: string;
  specialInstructions?: string;
  requiresPreparation: boolean;
  preparationInstructions?: string;
  rescheduleLink?: string;
  cancelLink?: string;
}

export interface TreatmentNotificationData {
  treatmentId: string;
  clientId: string;
  treatmentName: string;
  category: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: string;
  professionalName: string;
  progress?: number;
  nextSession?: string;
  aftercareInstructions?: string;
  results?: any[];
}

export interface FinancialNotificationData {
  invoiceId: string;
  clientId: string;
  amount: number;
  currency: string;
  dueDate: string;
  paymentMethod?: string;
  installments?: number;
  installmentNumber?: number;
  paymentLink?: string;
  lateFee?: number;
  description: string;
}

export interface ComplianceNotificationData {
  complianceId: string;
  clientId?: string;
  type: 'consent_required' | 'consent_expiring' | 'documentation_needed' | 'regulatory_update';
  title: string;
  description: string;
  actionRequired: boolean;
  actionLink?: string;
  deadline?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmergencyNotificationData {
  emergencyId: string;
  clientId?: string;
  type: 'adverse_reaction' | 'medical_emergency' | 'facility_incident' | 'security_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  immediateActions: string[];
  contactPersons: Array<{
    name: string;
    role: string;
    contact: string;
  }>;
  location?: string;
  timestamp: string;
}

export interface MarketingNotificationData {
  campaignId: string;
  clientId: string;
  campaignName: string;
  offer: {
    title: string;
    description: string;
    discount?: number;
    validUntil: string;
    treatmentTypes?: string[];
    termsAndConditions?: string;
  };
  personalization: {
    clientName: string;
    preferredTreatments?: string[];
    lastVisit?: string;
  };
}

export class AestheticNotificationService {
  private config: AestheticNotificationConfig;
  private templates: Map<string, NotificationTemplate> = new Map();
  private notifications: Map<string, NotificationResult> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();
  private providers: Map<string, any> = new Map();

  constructor(config: AestheticNotificationConfig) {
    this.config = config;
    this.initializeTemplates();
    this.initializeProviders();
  }

  private initializeTemplates(): void {
    // Appointment Templates
    this.templates.set('appointment_confirmation_pt-BR', {
      id: 'appointment_confirmation_pt-BR',
      name: 'Confirmação de Agendamento',
      type: 'whatsapp',
      category: 'appointment',
      language: 'pt-BR',
      content: `Olá {{clientName}}!

Seu agendamento foi confirmado:

📅 Data: {{formattedDate}}
⏰ Horário: {{formattedTime}}
⚕️ Profissional: {{professionalName}}
💉 Tratamento: {{treatmentName}}
📍 Local: {{location}}

{{#if preparationInstructions}}
📋 Preparação:
{{preparationInstructions}}
{{/if}}

{{#if specialInstructions}}
ℹ️ Instruções especiais:
{{specialInstructions}}
{{/if}}

🔔 Confirme sua presença: {{confirmationLink}}
📅 Remarcar: {{rescheduleLink}}
❌ Cancelar: {{cancelLink}}

Chegue com 15 minutos de antecedência.

Atenciosamente,
{{clinicName}}`,
      variables: ['clientName', 'formattedDate', 'formattedTime', 'professionalName', 'treatmentName', 'location', 'preparationInstructions', 'specialInstructions', 'confirmationLink', 'rescheduleLink', 'cancelLink', 'clinicName'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.templates.set('appointment_reminder_pt-BR', {
      id: 'appointment_reminder_pt-BR',
      name: 'Lembrete de Agendamento',
      type: 'sms',
      category: 'appointment',
      language: 'pt-BR',
      content: `Lembrete: Seu agendamento na {{clinicName}} é amanhã às {{formattedTime}}. Tratamento: {{treatmentName}} com {{professionalName}}. Local: {{location}}. Confirme: {{confirmationLink}}`,
      variables: ['clinicName', 'formattedTime', 'treatmentName', 'professionalName', 'location', 'confirmationLink'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Treatment Templates
    this.templates.set('treatment_completed_pt-BR', {
      id: 'treatment_completed_pt-BR',
      name: 'Tratamento Concluído',
      type: 'whatsapp',
      category: 'treatment',
      language: 'pt-BR',
      content: `Olá {{clientName}}!

Seu tratamento de {{treatmentName}} foi concluído com sucesso!

📊 Resultados: {{resultsSummary}}
📋 Próxima sessão: {{nextSession}}
💡 Cuidados pós-tratamento:
{{aftercareInstructions}}

{{#if followUpAppointment}}
📅 Sua consulta de acompanhamento está agendada para {{followUpDate}}.
{{/if}}

Em caso de dúvidas ou reações adversas, entre em contato imediatamente: {{emergencyContact}}

Atenciosamente,
{{clinicName}}`,
      variables: ['clientName', 'treatmentName', 'resultsSummary', 'nextSession', 'aftercareInstructions', 'followUpDate', 'emergencyContact', 'clinicName'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Financial Templates
    this.templates.set('payment_due_pt-BR', {
      id: 'payment_due_pt-BR',
      name: 'Pagamento Due',
      type: 'email',
      category: 'financial',
      language: 'pt-BR',
      subject: 'Seu pagamento está devido - {{clinicName}}',
      content: `Prezado(a) {{clientName}},

Informamos que seu pagamento está devido:

💰 Valor: {{amount}}
📅 Data de vencimento: {{dueDate}}
📄 Descrição: {{description}}
{{#if installments}}
📊 Parcela {{installmentNumber}} de {{totalInstallments}}
{{/if}}

{{#if lateFee}}
⚠️ Taxa de atraso: {{lateFee}} aplicada após o vencimento
{{/if}}

🔗 Pagar agora: {{paymentLink}}

Em caso de dúvidas, entre em contato com nosso departamento financeiro.

Atenciosamente,
Equipe Financeira
{{clinicName}}`,
      variables: ['clientName', 'amount', 'dueDate', 'description', 'installments', 'installmentNumber', 'totalInstallments', 'lateFee', 'paymentLink', 'clinicName'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Compliance Templates
    this.templates.set('consent_required_pt-BR', {
      id: 'consent_required_pt-BR',
      name: 'Consentimento Required',
      type: 'email',
      category: 'compliance',
      language: 'pt-BR',
      subject: 'Ação necessária: Consentimento requerido - {{clinicName}}',
      content: `Prezado(a) {{clientName}},

De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos de seu consentimento para:

{{consentPurpose}}

📋 O que será feito com seus dados:
{{dataUsage}}

🔒 Suas informações estarão protegidas conforme as normas de segurança.

📅 Prazo para consentimento: {{deadline}}

🔗 Fornecer consentimento: {{consentLink}}

Em caso de dúvidas, entre em contato com nosso departamento de compliance.

Atenciosamente,
Equipe de Compliance
{{clinicName}}`,
      variables: ['clientName', 'consentPurpose', 'dataUsage', 'deadline', 'consentLink', 'clinicName'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Emergency Templates
    this.templates.set('emergency_alert_pt-BR', {
      id: 'emergency_alert_pt-BR',
      name: 'Emergency Alert',
      type: 'sms',
      category: 'emergency',
      language: 'pt-BR',
      content: `ALERTA DE EMERGÊNCIA: {{emergencyType}}. Severidade: {{severity}}. Local: {{location}}. Ações imediatas: {{immediateActions}}. Contato: {{emergencyContact}}.`,
      variables: ['emergencyType', 'severity', 'location', 'immediateActions', 'emergencyContact'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Marketing Templates
    this.templates.set('promotional_offer_pt-BR', {
      id: 'promotional_offer_pt-BR',
      name: 'Oferta Promocional',
      type: 'email',
      category: 'marketing',
      language: 'pt-BR',
      subject: 'Oferta especial para você - {{clinicName}}',
      content: `Olá {{clientName}},

Temos uma oferta especial pensando em você!

🎁 {{offerTitle}}
{{offerDescription}}

{{#if discount}}
💰 Desconto: {{discount}}% OFF!
{{/if}}

⏰ Oferta válida até: {{validUntil}}

🔗 Agendar agora: {{bookingLink}}

{{#if termsAndConditions}}
*Termos e condições: {{termsAndConditions}}
{{/if}}

Esperamos por você!

Atenciosamente,
Equipe {{clinicName}}`,
      variables: ['clientName', 'offerTitle', 'offerDescription', 'discount', 'validUntil', 'bookingLink', 'termsAndConditions', 'clinicName'],
      isSystemTemplate: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  private initializeProviders(): void {
    // Mock provider initialization
    this.providers.set('email', {
      send: this.sendEmail.bind(this),
      track: this.trackEmail.bind(this)
    });

    this.providers.set('sms', {
      send: this.sendSMS.bind(this),
      track: this.trackSMS.bind(this)
    });

    this.providers.set('whatsapp', {
      send: this.sendWhatsApp.bind(this),
      track: this.trackWhatsApp.bind(this)
    });
  }

  // Appointment Notifications
  async sendAppointmentConfirmation(data: AppointmentNotificationData): Promise<NotificationResult> {
    const templateId = `appointment_confirmation_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareAppointmentVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        subject: template.subject,
        message: content,
        variables
      },
      priority: 'high',
      requireConfirmation: true,
      metadata: {
        appointmentId: data.appointmentId,
        treatmentId: data.treatmentId
      }
    };

    return await this.sendNotification(message);
  }

  async sendAppointmentReminder(data: AppointmentNotificationData): Promise<NotificationResult> {
    const templateId = `appointment_reminder_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareAppointmentVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        message: content,
        variables
      },
      priority: 'medium',
      requireConfirmation: true,
      metadata: {
        appointmentId: data.appointmentId,
        treatmentId: data.treatmentId
      }
    };

    return await this.sendNotification(message);
  }

  // Treatment Notifications
  async sendTreatmentCompletion(data: TreatmentNotificationData): Promise<NotificationResult> {
    const templateId = `treatment_completed_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareTreatmentVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        message: content,
        variables
      },
      priority: 'medium',
      requireConfirmation: false,
      metadata: {
        treatmentId: data.treatmentId,
        appointmentId: data.appointmentId
      }
    };

    return await this.sendNotification(message);
  }

  // Financial Notifications
  async sendPaymentDue(data: FinancialNotificationData): Promise<NotificationResult> {
    const templateId = `payment_due_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareFinancialVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        subject: template.subject,
        message: content,
        variables
      },
      priority: 'high',
      requireConfirmation: false,
      metadata: {
        invoiceId: data.invoiceId,
        clientId: data.clientId
      }
    };

    return await this.sendNotification(message);
  }

  // Compliance Notifications
  async sendConsentRequired(data: ComplianceNotificationData): Promise<NotificationResult> {
    const templateId = `consent_required_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareComplianceVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        subject: template.subject,
        message: content,
        variables
      },
      priority: data.severity === 'critical' ? 'urgent' : 'high',
      requireConfirmation: data.actionRequired,
      scheduledFor: data.deadline,
      metadata: {
        complianceId: data.complianceId,
        clientId: data.clientId
      }
    };

    return await this.sendNotification(message);
  }

  // Emergency Notifications
  async sendEmergencyAlert(data: EmergencyNotificationData): Promise<NotificationResult> {
    const templateId = `emergency_alert_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareEmergencyVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        message: content,
        variables
      },
      priority: 'urgent',
      requireConfirmation: true,
      metadata: {
        emergencyId: data.emergencyId,
        clientId: data.clientId
      }
    };

    return await this.sendNotification(message);
  }

  // Marketing Notifications
  async sendPromotionalOffer(data: MarketingNotificationData): Promise<NotificationResult> {
    const templateId = `promotional_offer_${data.recipient.preferredLanguage || this.config.defaultLanguage}`;
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = this.prepareMarketingVariables(data);
    const content = this.renderTemplate(template, variables);

    const message: NotificationMessage = {
      id: this.generateMessageId(),
      type: template.type,
      category: template.category,
      recipient: data.recipient,
      templateId: template.id,
      content: {
        subject: template.subject,
        message: content,
        variables
      },
      priority: 'low',
      requireConfirmation: false,
      metadata: {
        campaignId: data.campaignId,
        clientId: data.clientId
      }
    };

    return await this.sendNotification(message);
  }

  // Generic Notification Method
  async sendNotification(message: NotificationMessage): Promise<NotificationResult> {
    // Check rate limits
    if (!await this.checkRateLimit(message.type, message.recipient.clientId)) {
      throw new Error(`Rate limit exceeded for ${message.type} notifications`);
    }

    const provider = this.providers.get(message.type);
    if (!provider) {
      throw new Error(`Provider not found for type: ${message.type}`);
    }

    const result: NotificationResult = {
      id: message.id,
      status: 'pending',
      channel: message.type,
      recipient: this.getRecipientContact(message),
      sentAt: new Date().toISOString()
    };

    try {
      // Send notification
      const providerResponse = await provider.send(message);
      
      // Update result
      result.status = 'sent';
      result.trackingId = providerResponse.trackingId;
      result.cost = providerResponse.cost;
      result.providerResponse = providerResponse;

      // Store result
      this.notifications.set(message.id, result);

      // Start tracking if enabled
      if (this.config.enableTracking) {
        this.startTracking(result);
      }

      return result;

    } catch {
      result.status = 'failed';
      result.failedAt = new Date().toISOString();
      result.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.notifications.set(message.id, result);
      throw error;
    }
  }

  // Provider Implementations
  private async sendEmail(message: NotificationMessage): Promise<any> {
    // Mock email sending
    return {
      trackingId: this.generateTrackingId(),
      cost: 0.05,
      provider: 'mock-email-provider'
    };
  }

  private async sendSMS(message: NotificationMessage): Promise<any> {
    // Mock SMS sending
    return {
      trackingId: this.generateTrackingId(),
      cost: 0.15,
      provider: 'mock-sms-provider'
    };
  }

  private async sendWhatsApp(message: NotificationMessage): Promise<any> {
    // Mock WhatsApp sending
    return {
      trackingId: this.generateTrackingId(),
      cost: 0.25,
      provider: 'mock-whatsapp-provider'
    };
  }

  // Tracking Methods
  private async trackEmail(result: NotificationResult): Promise<void> {
    // Mock email tracking
    result.status = 'delivered';
    result.deliveredAt = new Date().toISOString();
  }

  private async trackSMS(result: NotificationResult): Promise<void> {
    // Mock SMS tracking
    result.status = 'delivered';
    result.deliveredAt = new Date().toISOString();
  }

  private async trackWhatsApp(result: NotificationResult): Promise<void> {
    // Mock WhatsApp tracking
    result.status = 'delivered';
    result.deliveredAt = new Date().toISOString();
  }

  // Helper Methods
  private async checkRateLimit(type: string, clientId: string): Promise<boolean> {
    const rateLimitKey = `${type}_${clientId}`;
    const now = Date.now();
    const _windowStart = now - 60000; // 1 minute window

    let limit = this.rateLimiters.get(rateLimitKey);
    
    if (!limit || limit.resetTime < now) {
      limit = { count: 0, resetTime: now + 60000 };
      this.rateLimiters.set(rateLimitKey, limit);
    }

    const maxRequests = this.config.rateLimits[type as keyof typeof this.config.rateLimits] || 10;
    
    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  private getRecipientContact(message: NotificationMessage): string {
    const contact = message.recipient.contactInfo;
    
    switch (message.type) {
      case 'email':
        return contact.email || '';
      case 'sms':
        return contact.phone || '';
      case 'whatsapp':
        return contact.whatsapp || contact.phone || '';
      default:
        return '';
    }
  }

  private prepareAppointmentVariables(data: AppointmentNotificationData): Record<string, any> {
    const scheduledDate = new Date(data.scheduledDate);
    
    return {
      clientName: 'Cliente', // Would come from client data
      formattedDate: scheduledDate.toLocaleDateString('pt-BR'),
      formattedTime: scheduledDate.toLocaleTimeString('pt-BR'),
      professionalName: data.professionalName,
      treatmentName: data.treatmentName,
      location: data.location,
      preparationInstructions: data.preparationInstructions,
      specialInstructions: data.specialInstructions,
      confirmationLink: 'https://clinic.com/confirm',
      rescheduleLink: 'https://clinic.com/reschedule',
      cancelLink: 'https://clinic.com/cancel',
      clinicName: 'Clinica Estetica'
    };
  }

  private prepareTreatmentVariables(data: TreatmentNotificationData): Record<string, any> {
    return {
      clientName: 'Cliente',
      treatmentName: data.treatmentName,
      resultsSummary: 'Treatment completed successfully',
      nextSession: data.nextSession || 'To be scheduled',
      aftercareInstructions: data.aftercareInstructions || 'Follow provided care instructions',
      followUpDate: data.nextSession,
      emergencyContact: '+55 11 9999-9999',
      clinicName: 'Clinica Estetica'
    };
  }

  private prepareFinancialVariables(data: FinancialNotificationData): Record<string, any> {
    return {
      clientName: 'Cliente',
      amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount),
      dueDate: new Date(data.dueDate).toLocaleDateString('pt-BR'),
      description: data.description,
      installments: data.installments,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.installments,
      lateFee: data.lateFee ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.lateFee) : null,
      paymentLink: data.paymentLink || 'https://clinic.com/pay',
      clinicName: 'Clinica Estetica'
    };
  }

  private prepareComplianceVariables(data: ComplianceNotificationData): Record<string, any> {
    return {
      clientName: 'Cliente',
      consentPurpose: data.description,
      dataUsage: 'Treatment planning and progress tracking',
      deadline: data.deadline,
      consentLink: data.actionLink || 'https://clinic.com/consent',
      clinicName: 'Clinica Estetica'
    };
  }

  private prepareEmergencyVariables(data: EmergencyNotificationData): Record<string, any> {
    return {
      emergencyType: data.type,
      severity: data.severity,
      location: data.location || 'Facility',
      immediateActions: data.immediateActions.join(', '),
      emergencyContact: data.contactPersons[0]?.contact || 'Emergency Services'
    };
  }

  private prepareMarketingVariables(data: MarketingNotificationData): Record<string, any> {
    return {
      clientName: data.personalization.clientName,
      offerTitle: data.offer.title,
      offerDescription: data.offer.description,
      discount: data.offer.discount,
      validUntil: new Date(data.offer.validUntil).toLocaleDateString('pt-BR'),
      bookingLink: 'https://clinic.com/book',
      termsAndConditions: data.offer.termsAndConditions,
      clinicName: 'Clinica Estetica'
    };
  }

  private renderTemplate(template: NotificationTemplate, variables: Record<string, any>): string {
    let content = template.content;

    // Simple template rendering
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value || ''));
    }

    // Handle conditionals (simple implementation)
    content = content.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, body) => {
      return variables[condition] ? body : '';
    });

    return content.trim();
  }

  private startTracking(result: NotificationResult): void {
    // Mock tracking implementation
    setTimeout(async () => {
      const provider = this.providers.get(result.channel);
      if (provider && provider.track) {
        await provider.track(result);
      }
    }, 2000); // Simulate delivery time
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public Methods
  async getNotificationStatus(messageId: string): Promise<NotificationResult | null> {
    return this.notifications.get(messageId) || null;
  }

  async getNotificationsByClient(clientId: string): Promise<NotificationResult[]> {
    return Array.from(this.notifications.values()).filter(n => 
      n.metadata?.clientId === clientId
    );
  }

  async getNotificationsByCategory(category: string): Promise<NotificationResult[]> {
    return Array.from(this.notifications.values()).filter(n => 
      n.metadata?.category === category
    );
  }

  async createCustomTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: this.generateMessageId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate.id;
  }

  async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) {
      return false;
    }

    Object.assign(template, updates, { updatedAt: new Date().toISOString() });
    this.templates.set(templateId, template);
    return true;
  }

  async getTemplates(category?: string, language?: string): Promise<NotificationTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    return templates.filter(template => {
      if (category && template.category !== category) return false;
      if (language && template.language !== language) return false;
      return template.isActive;
    });
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      return this.templates.size > 0 && this.providers.size > 0;
    } catch {
      return false;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.templates.clear();
    this.notifications.clear();
    this.rateLimiters.clear();
    this.providers.clear();
  }
}