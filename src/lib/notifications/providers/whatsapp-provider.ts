/**
 * WhatsApp Provider Implementation for Notification Engine
 * 
 * Integração com WhatsApp Business API através de múltiplos providers
 * incluindo Meta WhatsApp Business, Twilio WhatsApp, e implementações customizadas
 */

import { z } from 'zod'

export interface WhatsAppProvider {
  id: string
  name: string
  type: 'meta-business' | 'twilio-whatsapp' | 'custom'
  enabled: boolean
  priority: number
  config: Record<string, any>
  rateLimitPerMinute: number
  supportedMessageTypes: string[]
  webhookUrl?: string
}

export interface WhatsAppMessage {
  to: string
  from?: string
  type: 'text' | 'template' | 'media' | 'interactive'
  content: WhatsAppMessageContent
  metadata?: Record<string, any>
}

export interface WhatsAppMessageContent {
  text?: string
  templateName?: string
  templateLanguage?: string
  templateParameters?: any[]
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  mediaCaption?: string
  interactive?: {
    type: 'button' | 'list'
    body: string
    buttons?: Array<{ id: string; title: string }>
    listItems?: Array<{ id: string; title: string; description?: string }>
  }
}

export interface WhatsAppResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
  deliveredAt?: Date
  conversationId?: string
}

const WhatsAppMessageSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid WhatsApp number format'),
  from: z.string().optional(),
  type: z.enum(['text', 'template', 'media', 'interactive']),
  content: z.object({
    text: z.string().optional(),
    templateName: z.string().optional(),
    templateLanguage: z.string().optional(),
    templateParameters: z.array(z.any()).optional(),
    mediaUrl: z.string().url().optional(),
    mediaType: z.enum(['image', 'video', 'audio', 'document']).optional(),
    mediaCaption: z.string().optional(),
    interactive: z.object({
      type: z.enum(['button', 'list']),
      body: z.string(),
      buttons: z.array(z.object({
        id: z.string(),
        title: z.string()
      })).optional(),
      listItems: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional()
      })).optional()
    }).optional()
  }),
  metadata: z.record(z.any()).optional()
})

// Base WhatsApp Provider Class
export abstract class BaseWhatsAppProvider {
  protected config: Record<string, any>
  
  constructor(
    public id: string,
    public name: string,
    public type: string,
    config: Record<string, any>
  ) {
    this.config = config
  }

  abstract async send(message: WhatsAppMessage): Promise<WhatsAppResult>
  abstract async getDeliveryStatus(messageId: string): Promise<string>
  abstract validateConfig(): boolean
  abstract async setupWebhook(webhookUrl: string): Promise<boolean>
}

// Meta WhatsApp Business Provider
export class MetaWhatsAppProvider extends BaseWhatsAppProvider {
  private accessToken: string
  private phoneNumberId: string
  private businessAccountId: string

  constructor(config: Record<string, any>) {
    super('meta-business', 'Meta WhatsApp Business', 'meta-business', config)
    this.accessToken = config.accessToken
    this.phoneNumberId = config.phoneNumberId
    this.businessAccountId = config.businessAccountId
  }

  validateConfig(): boolean {
    return !!(this.accessToken && this.phoneNumberId && this.businessAccountId)
  }

  async send(message: WhatsAppMessage): Promise<WhatsAppResult> {
    try {
      // Validate message
      const validatedMessage = WhatsAppMessageSchema.parse(message)
      
      // Prepare Meta WhatsApp API payload
      const payload = this.buildMetaPayload(validatedMessage)
      
      // Make API call to Meta WhatsApp Business API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Meta WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const result = await response.json()

      return {
        success: true,
        messageId: result.messages[0]?.id,
        conversationId: result.contacts[0]?.wa_id,
        cost: this.calculateMetaCost(validatedMessage.type)
      }
    } catch (error) {
      console.error('Meta WhatsApp send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Meta WhatsApp error'
      }
    }
  }

  private buildMetaPayload(message: WhatsAppMessage): any {
    const payload: any = {
      messaging_product: 'whatsapp',
      to: message.to
    }

    switch (message.type) {
      case 'text':
        payload.type = 'text'
        payload.text = { body: message.content.text }
        break

      case 'template':
        payload.type = 'template'
        payload.template = {
          name: message.content.templateName,
          language: { code: message.content.templateLanguage || 'pt_BR' },
          components: message.content.templateParameters ? [{
            type: 'body',
            parameters: message.content.templateParameters.map(param => ({
              type: 'text',
              text: param
            }))
          }] : []
        }
        break

      case 'media':
        payload.type = message.content.mediaType
        payload[message.content.mediaType!] = {
          link: message.content.mediaUrl,
          caption: message.content.mediaCaption
        }
        break

      case 'interactive':
        payload.type = 'interactive'
        payload.interactive = {
          type: message.content.interactive!.type,
          body: { text: message.content.interactive!.body }
        }

        if (message.content.interactive!.type === 'button' && message.content.interactive!.buttons) {
          payload.interactive.action = {
            buttons: message.content.interactive!.buttons.map(btn => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title }
            }))
          }
        } else if (message.content.interactive!.type === 'list' && message.content.interactive!.listItems) {
          payload.interactive.action = {
            button: 'Ver opções',
            sections: [{
              title: 'Opções',
              rows: message.content.interactive!.listItems.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description
              }))
            }]
          }
        }
        break
    }

    return payload
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      // Meta WhatsApp provides webhooks for status updates
      // This would typically be handled via webhook, not polling
      // For demonstration, we'll simulate a status check
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const statuses = ['sent', 'delivered', 'read', 'failed']
      return statuses[Math.floor(Math.random() * statuses.length)]
    } catch (error) {
      console.error('Failed to get Meta WhatsApp delivery status:', error)
      return 'unknown'
    }
  }

  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      // Configure webhook for receiving message status updates
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.businessAccountId}/subscribed_apps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscribed_fields: ['messages', 'message_deliveries', 'message_reads']
          })
        }
      )

      return response.ok
    } catch (error) {
      console.error('Failed to setup Meta WhatsApp webhook:', error)
      return false
    }
  }

  private calculateMetaCost(messageType: string): number {
    // Meta WhatsApp Business pricing (simplified)
    const costs: Record<string, number> = {
      'template': 0.05, // Business-initiated conversation
      'text': 0.01,     // User-initiated conversation
      'media': 0.02,
      'interactive': 0.02
    }
    return costs[messageType] || 0.01
  }
}

// Twilio WhatsApp Provider
export class TwilioWhatsAppProvider extends BaseWhatsAppProvider {
  private twilioClient: any

  constructor(config: Record<string, any>) {
    super('twilio-whatsapp', 'Twilio WhatsApp', 'twilio-whatsapp', config)
    this.initializeTwilio()
  }

  private initializeTwilio(): void {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio WhatsApp configuration missing: accountSid and authToken required')
    }

    // Mock Twilio client for this implementation
    this.twilioClient = {
      messages: {
        create: async (messageData: any) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300))
          
          if (Math.random() < 0.04) { // 4% failure rate for testing
            throw new Error('Twilio WhatsApp API error: Invalid phone number')
          }

          return {
            sid: `WM${Math.random().toString(36).substr(2, 32)}`,
            status: 'queued',
            to: messageData.to,
            from: messageData.from,
            price: null,
            dateSent: null
          }
        },
        get: async (sid: string) => {
          // Simulate status check
          await new Promise(resolve => setTimeout(resolve, 120))
          
          const statuses = ['queued', 'sending', 'sent', 'delivered', 'read', 'failed']
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          return {
            sid,
            status: randomStatus,
            dateSent: randomStatus !== 'queued' ? new Date() : null,
            errorCode: randomStatus === 'failed' ? '63016' : null,
            errorMessage: randomStatus === 'failed' ? 'The destination number is not a valid WhatsApp user' : null
          }
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.accountSid && this.config.authToken && this.config.fromNumber)
  }

  async send(message: WhatsAppMessage): Promise<WhatsAppResult> {
    try {
      // Validate message
      const validatedMessage = WhatsAppMessageSchema.parse(message)
      
      // Prepare Twilio WhatsApp message
      const messageData = this.buildTwilioPayload(validatedMessage)
      
      // Send via Twilio WhatsApp
      const twilioMessage = await this.twilioClient.messages.create(messageData)

      return {
        success: true,
        messageId: twilioMessage.sid,
        cost: this.calculateTwilioCost(validatedMessage.type),
        deliveredAt: twilioMessage.dateSent || undefined
      }
    } catch (error) {
      console.error('Twilio WhatsApp send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Twilio WhatsApp error'
      }
    }
  }

  private buildTwilioPayload(message: WhatsAppMessage): any {
    const messageData: any = {
      to: `whatsapp:${message.to}`,
      from: `whatsapp:${message.from || this.config.fromNumber}`
    }

    switch (message.type) {
      case 'text':
        messageData.body = message.content.text
        break

      case 'template':
        // Twilio uses ContentSid for approved templates
        messageData.contentSid = message.content.templateName
        if (message.content.templateParameters) {
          messageData.contentVariables = JSON.stringify(
            Object.fromEntries(
              message.content.templateParameters.map((param, index) => [`${index + 1}`, param])
            )
          )
        }
        break

      case 'media':
        messageData.mediaUrl = [message.content.mediaUrl]
        if (message.content.mediaCaption) {
          messageData.body = message.content.mediaCaption
        }
        break

      case 'interactive':
        // Twilio WhatsApp has limited interactive message support
        // This would need to be adapted based on Twilio's capabilities
        messageData.body = message.content.interactive!.body
        break
    }

    return messageData
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      const message = await this.twilioClient.messages.get(messageId)
      return this.mapTwilioStatus(message.status)
    } catch (error) {
      console.error('Failed to get Twilio WhatsApp delivery status:', error)
      return 'unknown'
    }
  }

  private mapTwilioStatus(twilioStatus: string): string {
    const statusMap: Record<string, string> = {
      'queued': 'pending',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
      'undelivered': 'failed'
    }
    return statusMap[twilioStatus] || 'unknown'
  }

  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      // Twilio webhook setup would be done through their console or API
      console.log(`Twilio WhatsApp webhook should be configured to: ${webhookUrl}`)
      return true
    } catch (error) {
      console.error('Failed to setup Twilio WhatsApp webhook:', error)
      return false
    }
  }

  private calculateTwilioCost(messageType: string): number {
    // Twilio WhatsApp pricing (simplified)
    const costs: Record<string, number> = {
      'template': 0.05,
      'text': 0.005,
      'media': 0.01,
      'interactive': 0.01
    }
    return costs[messageType] || 0.005
  }
}

// Custom WhatsApp Provider
export class CustomWhatsAppProvider extends BaseWhatsAppProvider {
  constructor(config: Record<string, any>) {
    super('custom', 'Custom WhatsApp Provider', 'custom', config)
  }

  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.apiKey)
  }

  async send(message: WhatsAppMessage): Promise<WhatsAppResult> {
    try {
      // Validate message
      const validatedMessage = WhatsAppMessageSchema.parse(message)
      
      // Make HTTP request to custom endpoint
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          to: validatedMessage.to,
          from: validatedMessage.from,
          type: validatedMessage.type,
          content: validatedMessage.content,
          metadata: validatedMessage.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Custom WhatsApp API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        messageId: result.messageId || result.id,
        cost: result.cost || 0,
        conversationId: result.conversationId
      }
    } catch (error) {
      console.error('Custom WhatsApp send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown custom WhatsApp error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.endpoint}/status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        return 'unknown'
      }

      const result = await response.json()
      return result.status || 'unknown'
    } catch (error) {
      console.error('Failed to get custom WhatsApp delivery status:', error)
      return 'unknown'
    }
  }

  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({ webhookUrl })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to setup custom WhatsApp webhook:', error)
      return false
    }
  }
}

// WhatsApp Provider Manager
export class WhatsAppProviderManager {
  private providers: Map<string, BaseWhatsAppProvider> = new Map()
  private providersByPriority: BaseWhatsAppProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private async initializeProviders(): Promise<void> {
    // Load provider configurations from database or environment
    const providerConfigs = await this.loadProviderConfigs()

    providerConfigs.forEach(config => {
      try {
        let provider: BaseWhatsAppProvider

        switch (config.type) {
          case 'meta-business':
            provider = new MetaWhatsAppProvider(config.config)
            break
          case 'twilio-whatsapp':
            provider = new TwilioWhatsAppProvider(config.config)
            break
          case 'custom':
            provider = new CustomWhatsAppProvider(config.config)
            break
          default:
            console.warn(`Unknown WhatsApp provider type: ${config.type}`)
            return
        }

        if (provider.validateConfig()) {
          this.providers.set(config.id, provider)
          console.log(`Initialized WhatsApp provider: ${config.name}`)
        } else {
          console.error(`Invalid configuration for WhatsApp provider: ${config.name}`)
        }
      } catch (error) {
        console.error(`Failed to initialize WhatsApp provider ${config.name}:`, error)
      }
    })

    // Sort providers by priority
    this.updateProviderPriority()
  }

  private async loadProviderConfigs(): Promise<any[]> {
    // Mock configuration - in real implementation, load from database
    return [
      {
        id: 'meta-primary',
        name: 'Meta WhatsApp Business Primary',
        type: 'meta-business',
        enabled: true,
        priority: 1,
        config: {
          accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || 'mock-access-token',
          phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || 'mock-phone-id',
          businessAccountId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || 'mock-business-id'
        }
      },
      {
        id: 'twilio-fallback',
        name: 'Twilio WhatsApp Fallback',
        type: 'twilio-whatsapp',
        enabled: true,
        priority: 2,
        config: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || 'mock-account-sid',
          authToken: process.env.TWILIO_AUTH_TOKEN || 'mock-auth-token',
          fromNumber: process.env.TWILIO_WHATSAPP_FROM || '+14155238886'
        }
      }
    ]
  }

  private updateProviderPriority(): void {
    this.providersByPriority = Array.from(this.providers.values())
      .sort((a, b) => {
        // Sort by priority (lower number = higher priority)
        const priorityA = (a as any).priority || 999
        const priorityB = (b as any).priority || 999
        return priorityA - priorityB
      })
  }

  public async sendWhatsApp(message: WhatsAppMessage, providerId?: string): Promise<WhatsAppResult> {
    if (providerId) {
      // Use specific provider
      const provider = this.providers.get(providerId)
      if (!provider) {
        return {
          success: false,
          error: `WhatsApp provider ${providerId} not found`
        }
      }
      return await provider.send(message)
    }

    // Try providers in priority order with fallback
    let lastError = 'No WhatsApp providers available'

    for (const provider of this.providersByPriority) {
      try {
        const result = await provider.send(message)
        if (result.success) {
          return result
        }
        lastError = result.error || 'Unknown error'
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`WhatsApp provider ${provider.name} failed:`, lastError)
      }
    }

    return {
      success: false,
      error: `All WhatsApp providers failed. Last error: ${lastError}`
    }
  }

  public async getDeliveryStatus(messageId: string, providerId: string): Promise<string> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return 'unknown'
    }

    return await provider.getDeliveryStatus(messageId)
  }

  public getProviders(): BaseWhatsAppProvider[] {
    return Array.from(this.providers.values())
  }

  public getProvider(id: string): BaseWhatsAppProvider | undefined {
    return this.providers.get(id)
  }

  public async testProvider(id: string, testMessage?: WhatsAppMessage): Promise<WhatsAppResult> {
    const provider = this.providers.get(id)
    if (!provider) {
      return {
        success: false,
        error: `Provider ${id} not found`
      }
    }

    const message = testMessage || {
      to: '+5511999999999', // Test number
      type: 'text' as const,
      content: {
        text: 'Teste do sistema de notificações NeonPro via WhatsApp'
      }
    }

    return await provider.send(message)
  }

  public async setupWebhooks(webhookBaseUrl: string): Promise<void> {
    for (const [id, provider] of this.providers) {
      try {
        const webhookUrl = `${webhookBaseUrl}/api/notifications/webhooks/whatsapp/${id}`
        await provider.setupWebhook(webhookUrl)
        console.log(`Webhook configured for WhatsApp provider: ${id}`)
      } catch (error) {
        console.error(`Failed to setup webhook for WhatsApp provider ${id}:`, error)
      }
    }
  }
}

// Singleton instance
let whatsappProviderManagerInstance: WhatsAppProviderManager | null = null

export const getWhatsAppProviderManager = (): WhatsAppProviderManager => {
  if (!whatsappProviderManagerInstance) {
    whatsappProviderManagerInstance = new WhatsAppProviderManager()
  }
  return whatsappProviderManagerInstance
}

export default WhatsAppProviderManager