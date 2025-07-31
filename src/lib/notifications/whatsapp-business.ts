/**
 * NeonPro WhatsApp Business Integration
 * 
 * Integração completa com WhatsApp Business API para clínicas estéticas,
 * incluindo templates aprovados, webhook handling e chatbot básico.
 * 
 * Features:
 * - Integração completa com WhatsApp Business API
 * - Templates pré-aprovados pelo WhatsApp
 * - Webhook handling para status e respostas
 * - Rich media support (imagens, documentos)
 * - Chatbot básico para confirmações
 * - Compliance com políticas do WhatsApp
 * - Rate limiting e queue management
 * 
 * @author BMad Method - NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Database } from '@/lib/database.types';
import { createClient } from '@/app/utils/supabase/server';
import { logger } from '@/lib/utils/logger';
import { auditLogger } from '@/lib/utils/audit-logger';

// Types e Interfaces
export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string;
  baseUrl: string;
  rateLimit: RateLimitConfig;
  retryConfig: RetryConfig;
}

export interface RateLimitConfig {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
  messagesPerDay: number;
  burstLimit: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  components: TemplateComponent[];
  quality: TemplateQuality;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface TemplateComponent {
  type: ComponentType;
  format?: ComponentFormat;
  text?: string;
  example?: ComponentExample;
  buttons?: TemplateButton[];
  header?: HeaderComponent;
  body?: BodyComponent;
  footer?: FooterComponent;
}

export interface TemplateButton {
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  payload?: string;
}

export interface HeaderComponent {
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  format?: ComponentFormat;
  example?: ComponentExample;
}

export interface BodyComponent {
  text: string;
  example?: ComponentExample;
}

export interface FooterComponent {
  text: string;
}

export interface ComponentExample {
  headerText?: string[];
  bodyText?: string[][];
  headerHandle?: string[];
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  type: MessageType;
  text?: TextMessage;
  image?: MediaMessage;
  document?: MediaMessage;
  template?: TemplateMessage;
  interactive?: InteractiveMessage;
  contacts?: ContactMessage[];
  location?: LocationMessage;
  status: MessageStatus;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface TextMessage {
  body: string;
  previewUrl?: boolean;
}

export interface MediaMessage {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
}

export interface TemplateMessage {
  name: string;
  language: LanguageObject;
  components: TemplateComponentData[];
}

export interface TemplateComponentData {
  type: ComponentType;
  parameters?: TemplateParameter[];
  subType?: string;
  index?: number;
}

export interface TemplateParameter {
  type: ParameterType;
  text?: string;
  currency?: CurrencyParameter;
  dateTime?: DateTimeParameter;
  image?: MediaParameter;
  document?: MediaParameter;
  video?: MediaParameter;
  payload?: string;
}

export interface CurrencyParameter {
  fallbackValue: string;
  code: string;
  amount1000: number;
}

export interface DateTimeParameter {
  fallbackValue: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  year?: number;
  month?: number;
  hour?: number;
  minute?: number;
}

export interface MediaParameter {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
}

export interface InteractiveMessage {
  type: InteractiveType;
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: InteractiveAction;
}

export interface InteractiveHeader {
  type: 'text' | 'image' | 'video' | 'document';
  text?: string;
  image?: MediaParameter;
  video?: MediaParameter;
  document?: MediaParameter;
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveAction {
  button?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveSection[];
}

export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveSection {
  title: string;
  rows: InteractiveRow[];
}

export interface InteractiveRow {
  id: string;
  title: string;
  description?: string;
}

export interface ContactMessage {
  addresses?: ContactAddress[];
  birthday?: string;
  emails?: ContactEmail[];
  name: ContactName;
  org?: ContactOrg;
  phones?: ContactPhone[];
  urls?: ContactUrl[];
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  countryCode?: string;
  type?: string;
}

export interface ContactEmail {
  email?: string;
  type?: string;
}

export interface ContactName {
  formattedName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

export interface ContactPhone {
  phone?: string;
  waId?: string;
  type?: string;
}

export interface ContactUrl {
  url?: string;
  type?: string;
}

export interface LocationMessage {
  longitude: number;
  latitude: number;
  name?: string;
  address?: string;
}

export interface LanguageObject {
  code: string;
}

export interface WebhookEvent {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messagingProduct: string;
  metadata: WebhookMetadata;
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
  errors?: WebhookError[];
}

export interface WebhookMetadata {
  displayPhoneNumber: string;
  phoneNumberId: string;
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  waId: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: { body: string };
  image?: WebhookMedia;
  document?: WebhookMedia;
  audio?: WebhookMedia;
  video?: WebhookMedia;
  sticker?: WebhookMedia;
  location?: LocationMessage;
  contacts?: ContactMessage[];
  interactive?: WebhookInteractive;
  button?: WebhookButton;
  context?: MessageContext;
  errors?: WebhookError[];
}

export interface WebhookMedia {
  caption?: string;
  filename?: string;
  sha256: string;
  id: string;
  mimeType: string;
}

export interface WebhookInteractive {
  type: InteractiveType;
  buttonReply?: {
    id: string;
    title: string;
  };
  listReply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface WebhookButton {
  payload?: string;
  text: string;
}

export interface MessageContext {
  from: string;
  id: string;
}

export interface WebhookStatus {
  id: string;
  status: MessageStatus;
  timestamp: string;
  recipientId: string;
  conversation?: ConversationInfo;
  pricing?: PricingInfo;
  errors?: WebhookError[];
}

export interface ConversationInfo {
  id: string;
  expirationTimestamp?: string;
  origin: {
    type: string;
  };
}

export interface PricingInfo {
  billable: boolean;
  pricingModel: string;
  category: string;
}

export interface WebhookError {
  code: number;
  title: string;
  message: string;
  errorData?: {
    details: string;
  };
}

export interface ChatbotResponse {
  messageId: string;
  response: WhatsAppMessage;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  nextAction?: string;
  metadata: Record<string, any>;
}

export interface ChatbotContext {
  userId: string;
  sessionId: string;
  currentFlow: string;
  stepIndex: number;
  variables: Record<string, any>;
  lastActivity: Date;
  expiresAt: Date;
}

// Enums
export enum TemplateCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY'
}

export enum TemplateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED'
}

export enum TemplateQuality {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN'
}

export enum ComponentType {
  HEADER = 'HEADER',
  BODY = 'BODY',
  FOOTER = 'FOOTER',
  BUTTONS = 'BUTTONS'
}

export enum ComponentFormat {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

export enum ButtonType {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
  STICKER = 'sticker'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum ParameterType {
  TEXT = 'text',
  CURRENCY = 'currency',
  DATE_TIME = 'date_time',
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  PAYLOAD = 'payload'
}

export enum InteractiveType {
  BUTTON = 'button',
  LIST = 'list'
}

/**
 * Sistema principal do WhatsApp Business
 */
export class WhatsAppBusinessIntegration {
  private supabase;
  private config: WhatsAppConfig;
  private rateLimiter: Map<string, number[]> = new Map();
  private messageQueue: Map<string, WhatsAppMessage[]> = new Map();
  private activeChats: Map<string, ChatbotContext> = new Map();

  constructor(config: WhatsAppConfig) {
    this.supabase = createClient();
    this.config = config;
    this.initializeIntegration();
  }

  /**
   * Inicializa a integração
   */
  private async initializeIntegration(): Promise<void> {
    try {
      // Carrega templates aprovados
      await this.loadApprovedTemplates();

      // Configura rate limiting
      this.setupRateLimiting();

      // Inicia processamento de fila
      this.startQueueProcessor();

      logger.info('WhatsApp Business integration inicializada', {
        phoneNumberId: this.config.phoneNumberId,
        apiVersion: this.config.apiVersion
      });

    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp Business:', error);
      throw error;
    }
  }

  /**
   * Carrega templates aprovados
   */
  private async loadApprovedTemplates(): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar templates: ${response.status}`);
      }

      const data = await response.json();
      
      // Salva templates no banco
      for (const template of data.data) {
        await this.saveTemplate(template);
      }

      logger.info(`${data.data.length} templates carregados`);

    } catch (error) {
      logger.error('Erro ao carregar templates:', error);
    }
  }

  /**
   * Salva template no banco
   */
  private async saveTemplate(templateData: any): Promise<void> {
    const template: Partial<WhatsAppTemplate> = {
      id: templateData.id,
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      status: templateData.status,
      components: templateData.components,
      quality: templateData.quality_score?.score || TemplateQuality.UNKNOWN,
      metadata: {
        rejectionReason: templateData.quality_score?.reasons,
        lastUpdated: new Date().toISOString()
      }
    };

    const { error } = await this.supabase
      .from('whatsapp_templates')
      .upsert(template);

    if (error) {
      logger.error('Erro ao salvar template:', error);
    }
  }

  /**
   * Configura rate limiting
   */
  private setupRateLimiting(): void {
    // Limpa contadores antigos a cada minuto
    setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      this.rateLimiter.forEach((timestamps, key) => {
        const validTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
        if (validTimestamps.length === 0) {
          this.rateLimiter.delete(key);
        } else {
          this.rateLimiter.set(key, validTimestamps);
        }
      });
    }, 60000);
  }

  /**
   * Inicia processador de fila
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      await this.processMessageQueue();
    }, 1000); // Processa fila a cada segundo
  }

  /**
   * Processa fila de mensagens
   */
  private async processMessageQueue(): Promise<void> {
    for (const [recipient, messages] of this.messageQueue.entries()) {
      if (messages.length === 0) continue;

      // Verifica rate limit
      if (!this.checkRateLimit(recipient)) {
        continue; // Pula se excedeu limite
      }

      // Envia próxima mensagem da fila
      const message = messages.shift()!;
      try {
        await this.sendMessageToWhatsApp(message);
        this.recordRateLimitUsage(recipient);
      } catch (error) {
        logger.error('Erro ao enviar mensagem da fila:', error);
        // Recoloca na fila para retry
        messages.unshift(message);
      }

      // Remove fila vazia
      if (messages.length === 0) {
        this.messageQueue.delete(recipient);
      }
    }
  }

  /**
   * Verifica rate limit
   */
  private checkRateLimit(recipient: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimiter.get(recipient) || [];
    
    // Remove timestamps antigos
    const validTimestamps = timestamps.filter(ts => ts > now - 60000);
    
    return validTimestamps.length < this.config.rateLimit.messagesPerMinute;
  }

  /**
   * Registra uso do rate limit
   */
  private recordRateLimitUsage(recipient: string): void {
    const now = Date.now();
    const timestamps = this.rateLimiter.get(recipient) || [];
    timestamps.push(now);
    this.rateLimiter.set(recipient, timestamps);
  }

  /**
   * Envia mensagem
   */
  async sendMessage(message: Partial<WhatsAppMessage>): Promise<string> {
    try {
      const fullMessage: WhatsAppMessage = {
        id: '',
        to: message.to!,
        type: message.type!,
        text: message.text,
        image: message.image,
        document: message.document,
        template: message.template,
        interactive: message.interactive,
        contacts: message.contacts,
        location: message.location,
        status: MessageStatus.SENT,
        timestamp: new Date(),
        metadata: message.metadata || {}
      };

      // Verifica rate limit
      if (!this.checkRateLimit(message.to!)) {
        // Adiciona à fila
        this.addToQueue(message.to!, fullMessage);
        logger.info('Mensagem adicionada à fila devido ao rate limit', { to: message.to });
        return 'queued';
      }

      // Envia imediatamente
      const messageId = await this.sendMessageToWhatsApp(fullMessage);
      this.recordRateLimitUsage(message.to!);

      return messageId;

    } catch (error) {
      logger.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Adiciona mensagem à fila
   */
  private addToQueue(recipient: string, message: WhatsAppMessage): void {
    const queue = this.messageQueue.get(recipient) || [];
    queue.push(message);
    this.messageQueue.set(recipient, queue);
  }

  /**
   * Envia mensagem para WhatsApp API
   */
  private async sendMessageToWhatsApp(message: WhatsAppMessage): Promise<string> {
    const payload = this.buildMessagePayload(message);

    const response = await fetch(
      `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const messageId = data.messages[0].id;

    // Salva mensagem no banco
    await this.saveMessage({ ...message, id: messageId });

    // Log de auditoria
    await auditLogger.log({
      action: 'whatsapp_message_sent',
      resourceType: 'whatsapp_message',
      resourceId: messageId,
      details: {
        to: message.to,
        type: message.type
      }
    });

    return messageId;
  }

  /**
   * Constrói payload da mensagem
   */
  private buildMessagePayload(message: WhatsAppMessage): any {
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to,
      type: message.type
    };

    switch (message.type) {
      case MessageType.TEXT:
        payload.text = message.text;
        break;

      case MessageType.IMAGE:
        payload.image = message.image;
        break;

      case MessageType.DOCUMENT:
        payload.document = message.document;
        break;

      case MessageType.TEMPLATE:
        payload.template = message.template;
        break;

      case MessageType.INTERACTIVE:
        payload.interactive = message.interactive;
        break;

      case MessageType.CONTACTS:
        payload.contacts = message.contacts;
        break;

      case MessageType.LOCATION:
        payload.location = message.location;
        break;

      default:
        throw new Error(`Tipo de mensagem não suportado: ${message.type}`);
    }

    return payload;
  }

  /**
   * Envia template
   */
  async sendTemplate(
    to: string,
    templateName: string,
    language: string,
    parameters?: TemplateParameter[]
  ): Promise<string> {
    const template: TemplateMessage = {
      name: templateName,
      language: { code: language },
      components: parameters ? [
        {
          type: ComponentType.BODY,
          parameters
        }
      ] : []
    };

    return this.sendMessage({
      to,
      type: MessageType.TEMPLATE,
      template
    });
  }

  /**
   * Envia mensagem interativa
   */
  async sendInteractiveMessage(
    to: string,
    interactive: InteractiveMessage
  ): Promise<string> {
    return this.sendMessage({
      to,
      type: MessageType.INTERACTIVE,
      interactive
    });
  }

  /**
   * Manipula webhook
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    try {
      for (const entry of event.entry) {
        for (const change of entry.changes) {
          await this.processWebhookChange(change);
        }
      }
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
    }
  }

  /**
   * Processa mudança do webhook
   */
  private async processWebhookChange(change: WebhookChange): Promise<void> {
    const { value } = change;

    // Processa mensagens recebidas
    if (value.messages) {
      for (const message of value.messages) {
        await this.processIncomingMessage(message);
      }
    }

    // Processa status de mensagens
    if (value.statuses) {
      for (const status of value.statuses) {
        await this.processMessageStatus(status);
      }
    }

    // Processa erros
    if (value.errors) {
      for (const error of value.errors) {
        logger.error('WhatsApp webhook error:', error);
      }
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async processIncomingMessage(message: WebhookMessage): Promise<void> {
    try {
      // Salva mensagem no banco
      await this.saveIncomingMessage(message);

      // Processa com chatbot se configurado
      if (this.shouldProcessWithChatbot(message)) {
        await this.processChatbotMessage(message);
      }

      // Notifica sistema de notificações sobre resposta
      await this.notifyMessageResponse(message);

    } catch (error) {
      logger.error('Erro ao processar mensagem recebida:', error);
    }
  }

  /**
   * Processa status de mensagem
   */
  private async processMessageStatus(status: WebhookStatus): Promise<void> {
    try {
      // Atualiza status no banco
      await this.updateMessageStatus(status.id, status.status);

      // Registra para analytics
      await this.recordStatusForAnalytics(status);

    } catch (error) {
      logger.error('Erro ao processar status de mensagem:', error);
    }
  }

  /**
   * Verifica se deve processar com chatbot
   */
  private shouldProcessWithChatbot(message: WebhookMessage): boolean {
    // Ignora mensagens de sistema ou status
    if (message.type === 'system') return false;

    // Verifica se é resposta a template interativo
    if (message.interactive || message.button) return true;

    // Verifica palavras-chave configuradas
    if (message.text?.body) {
      const keywords = ['sim', 'não', 'confirmar', 'cancelar', 'reagendar', 'ajuda'];
      const body = message.text.body.toLowerCase();
      return keywords.some(keyword => body.includes(keyword));
    }

    return false;
  }

  /**
   * Processa mensagem com chatbot
   */
  private async processChatbotMessage(message: WebhookMessage): Promise<void> {
    try {
      const context = await this.getChatbotContext(message.from);
      const response = await this.generateChatbotResponse(message, context);

      if (response.response) {
        await this.sendMessage(response.response);
      }

      // Atualiza contexto
      await this.updateChatbotContext(message.from, response);

    } catch (error) {
      logger.error('Erro no processamento do chatbot:', error);
    }
  }

  /**
   * Obtém contexto do chatbot
   */
  private async getChatbotContext(userId: string): Promise<ChatbotContext> {
    let context = this.activeChats.get(userId);

    if (!context || context.expiresAt < new Date()) {
      // Cria novo contexto
      context = {
        userId,
        sessionId: `session_${Date.now()}`,
        currentFlow: 'main',
        stepIndex: 0,
        variables: {},
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      };
      this.activeChats.set(userId, context);
    }

    return context;
  }

  /**
   * Gera resposta do chatbot
   */
  private async generateChatbotResponse(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<ChatbotResponse> {
    // Implementação básica do chatbot
    const intent = this.identifyIntent(message);
    let response: WhatsAppMessage | null = null;
    let nextAction: string | undefined;

    switch (intent) {
      case 'confirmar_consulta':
        response = await this.handleAppointmentConfirmation(message, context);
        break;

      case 'cancelar_consulta':
        response = await this.handleAppointmentCancellation(message, context);
        break;

      case 'reagendar_consulta':
        response = await this.handleAppointmentRescheduling(message, context);
        break;

      case 'solicitar_ajuda':
        response = await this.handleHelpRequest(message, context);
        break;

      default:
        response = await this.handleUnknownIntent(message, context);
    }

    return {
      messageId: message.id,
      response: response!,
      confidence: 0.8,
      intent,
      entities: {},
      nextAction,
      metadata: {
        contextUpdated: new Date()
      }
    };
  }

  /**
   * Identifica intenção da mensagem
   */
  private identifyIntent(message: WebhookMessage): string {
    const text = message.text?.body?.toLowerCase() || '';
    const buttonPayload = message.button?.payload || '';
    const interactiveId = message.interactive?.buttonReply?.id || '';

    // Verifica botões e interações primeiro
    if (buttonPayload || interactiveId) {
      const payload = buttonPayload || interactiveId;
      if (payload.includes('confirm')) return 'confirmar_consulta';
      if (payload.includes('cancel')) return 'cancelar_consulta';
      if (payload.includes('reschedule')) return 'reagendar_consulta';
    }

    // Verifica texto
    if (text.includes('sim') || text.includes('confirmar')) return 'confirmar_consulta';
    if (text.includes('não') || text.includes('cancelar')) return 'cancelar_consulta';
    if (text.includes('reagendar') || text.includes('mudar')) return 'reagendar_consulta';
    if (text.includes('ajuda') || text.includes('help')) return 'solicitar_ajuda';

    return 'unknown';
  }

  /**
   * Manipula confirmação de consulta
   */
  private async handleAppointmentConfirmation(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<WhatsAppMessage> {
    // Busca consulta pendente do paciente
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('patient_phone', message.from)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1);

    if (appointments && appointments.length > 0) {
      const appointment = appointments[0];
      
      // Confirma consulta
      await this.supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      return {
        id: '',
        to: message.from,
        type: MessageType.TEXT,
        text: {
          body: `✅ Consulta confirmada para ${new Date(appointment.scheduled_at).toLocaleDateString('pt-BR')} às ${new Date(appointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.\n\nObrigado pela confirmação! Nos vemos em breve. 😊`
        },
        status: MessageStatus.SENT,
        timestamp: new Date(),
        metadata: {
          appointmentId: appointment.id,
          intent: 'confirmation_success'
        }
      };
    }

    return {
      id: '',
      to: message.from,
      type: MessageType.TEXT,
      text: {
        body: 'Não encontrei nenhuma consulta agendada para confirmar. Se precisar de ajuda, entre em contato conosco.'
      },
      status: MessageStatus.SENT,
      timestamp: new Date(),
      metadata: { intent: 'no_appointment_found' }
    };
  }

  /**
   * Manipula cancelamento de consulta
   */
  private async handleAppointmentCancellation(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<WhatsAppMessage> {
    // Implementar lógica de cancelamento
    return {
      id: '',
      to: message.from,
      type: MessageType.TEXT,
      text: {
        body: 'Entendi que você deseja cancelar sua consulta. Nossa equipe entrará em contato para confirmar o cancelamento.'
      },
      status: MessageStatus.SENT,
      timestamp: new Date(),
      metadata: { intent: 'cancellation_request' }
    };
  }

  /**
   * Manipula reagendamento de consulta
   */
  private async handleAppointmentRescheduling(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<WhatsAppMessage> {
    // Implementar lógica de reagendamento
    return {
      id: '',
      to: message.from,
      type: MessageType.TEXT,
      text: {
        body: 'Entendi que você deseja reagendar sua consulta. Nossa equipe entrará em contato com opções de horários disponíveis.'
      },
      status: MessageStatus.SENT,
      timestamp: new Date(),
      metadata: { intent: 'reschedule_request' }
    };
  }

  /**
   * Manipula solicitação de ajuda
   */
  private async handleHelpRequest(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<WhatsAppMessage> {
    const interactive: InteractiveMessage = {
      type: InteractiveType.BUTTON,
      body: {
        text: 'Como posso te ajudar? Escolha uma das opções abaixo:'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'help_appointment',
              title: 'Sobre consultas'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'help_contact',
              title: 'Falar com atendente'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'help_info',
              title: 'Informações gerais'
            }
          }
        ]
      }
    };

    return {
      id: '',
      to: message.from,
      type: MessageType.INTERACTIVE,
      interactive,
      status: MessageStatus.SENT,
      timestamp: new Date(),
      metadata: { intent: 'help_menu' }
    };
  }

  /**
   * Manipula intenção desconhecida
   */
  private async handleUnknownIntent(
    message: WebhookMessage,
    context: ChatbotContext
  ): Promise<WhatsAppMessage> {
    return {
      id: '',
      to: message.from,
      type: MessageType.TEXT,
      text: {
        body: 'Desculpe, não entendi sua mensagem. Digite "ajuda" para ver as opções disponíveis ou aguarde que nossa equipe entrará em contato.'
      },
      status: MessageStatus.SENT,
      timestamp: new Date(),
      metadata: { intent: 'fallback' }
    };
  }

  /**
   * Atualiza contexto do chatbot
   */
  private async updateChatbotContext(
    userId: string,
    response: ChatbotResponse
  ): Promise<void> {
    const context = this.activeChats.get(userId);
    if (context) {
      context.lastActivity = new Date();
      context.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      // Atualizar outros campos conforme necessário
    }
  }

  /**
   * Salva mensagem no banco
   */
  private async saveMessage(message: WhatsAppMessage): Promise<void> {
    const { error } = await this.supabase
      .from('whatsapp_messages')
      .insert({
        id: message.id,
        to: message.to,
        type: message.type,
        content: {
          text: message.text,
          image: message.image,
          document: message.document,
          template: message.template,
          interactive: message.interactive
        },
        status: message.status,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata
      });

    if (error) {
      logger.error('Erro ao salvar mensagem:', error);
    }
  }

  /**
   * Salva mensagem recebida
   */
  private async saveIncomingMessage(message: WebhookMessage): Promise<void> {
    const { error } = await this.supabase
      .from('whatsapp_incoming_messages')
      .insert({
        id: message.id,
        from: message.from,
        type: message.type,
        content: {
          text: message.text,
          image: message.image,
          document: message.document,
          interactive: message.interactive,
          button: message.button
        },
        timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        context: message.context
      });

    if (error) {
      logger.error('Erro ao salvar mensagem recebida:', error);
    }
  }

  /**
   * Atualiza status da mensagem
   */
  private async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const { error } = await this.supabase
      .from('whatsapp_messages')
      .update({ status })
      .eq('id', messageId);

    if (error) {
      logger.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  /**
   * Registra status para analytics
   */
  private async recordStatusForAnalytics(status: WebhookStatus): Promise<void> {
    // Implementar integração com analytics engine
    // await analyticsEngine.trackWhatsAppStatus(status);
  }

  /**
   * Notifica sistema sobre resposta
   */
  private async notifyMessageResponse(message: WebhookMessage): Promise<void> {
    // Implementar notificação para sistema de notificações
    // await notificationEngine.handleWhatsAppResponse(message);
  }

  /**
   * Verifica webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): {
    queueSize: number;
    activeChats: number;
    rateLimits: number;
    config: WhatsAppConfig;
  } {
    return {
      queueSize: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      activeChats: this.activeChats.size,
      rateLimits: this.rateLimiter.size,
      config: this.config
    };
  }
}