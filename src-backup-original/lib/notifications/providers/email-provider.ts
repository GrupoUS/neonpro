/**
 * Email Provider Implementation for Notification Engine
 * 
 * Integração com múltiplos providers de email para alta disponibilidade
 * com suporte a AWS SES, SendGrid, e sistemas de email personalizados
 */

import { z } from 'zod'

export interface EmailProvider {
  id: string
  name: string
  type: 'aws-ses' | 'sendgrid' | 'smtp' | 'custom'
  enabled: boolean
  priority: number
  config: Record<string, any>
  rateLimitPerMinute: number
  maxRecipientsPerMessage: number
  supportedFeatures: string[]
}

export interface EmailMessage {
  to: string | string[]
  from: string
  replyTo?: string
  subject: string
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  metadata?: Record<string, any>
  templateId?: string
  templateData?: Record<string, any>
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType: string
  disposition?: 'attachment' | 'inline'
  cid?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
  deliveredAt?: Date
  recipients?: string[]
}

const EmailMessageSchema = z.object({
  to: z.union([
    z.string().email(),
    z.array(z.string().email()).min(1)
  ]),
  from: z.string().email(),
  replyTo: z.string().email().optional(),
  subject: z.string().min(1).max(998),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.union([z.string(), z.instanceof(Buffer)]),
    contentType: z.string(),
    disposition: z.enum(['attachment', 'inline']).optional(),
    cid: z.string().optional()
  })).optional(),
  headers: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  templateId: z.string().optional(),
  templateData: z.record(z.any()).optional()
})

// Base Email Provider Class
export abstract class BaseEmailProvider {
  protected config: Record<string, any>
  
  constructor(
    public id: string,
    public name: string,
    public type: string,
    config: Record<string, any>
  ) {
    this.config = config
  }

  abstract async send(message: EmailMessage): Promise<EmailResult>
  abstract async getDeliveryStatus(messageId: string): Promise<string>
  abstract validateConfig(): boolean
}

// AWS SES Email Provider
export class AWSSESProvider extends BaseEmailProvider {
  private sesClient: any

  constructor(config: Record<string, any>) {
    super('aws-ses', 'AWS SES', 'aws-ses', config)
    this.initializeAWSSES()
  }

  private initializeAWSSES(): void {
    if (!this.config.accessKeyId || !this.config.secretAccessKey || !this.config.region) {
      throw new Error('AWS SES configuration missing: accessKeyId, secretAccessKey, and region required')
    }

    // In a real implementation, you would initialize the AWS SES client here
    // const AWS = require('aws-sdk')
    // AWS.config.update({
    //   accessKeyId: this.config.accessKeyId,
    //   secretAccessKey: this.config.secretAccessKey,
    //   region: this.config.region
    // })
    // this.sesClient = new AWS.SESv2()
    
    // Mock client for this implementation
    this.sesClient = {
      sendEmail: async (params: any) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (Math.random() < 0.02) { // 2% failure rate for testing
          throw new Error('AWS SES error: Email address not verified')
        }

        return {
          MessageId: `aws-ses-${Math.random().toString(36).substr(2, 32)}`
        }
      },
      getMessageEvents: async (params: any) => {
        // Simulate status check
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const eventTypes = ['send', 'delivery', 'bounce', 'complaint', 'open', 'click']
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        
        return {
          Events: [{
            Timestamp: new Date(),
            MessageId: params.MessageId,
            EventType: randomEvent
          }]
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.accessKeyId && this.config.secretAccessKey && this.config.region)
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      // Validate message
      const validatedMessage = EmailMessageSchema.parse(message)
      
      // Prepare AWS SES params
      const params: any = {
        Source: validatedMessage.from,
        Destination: {
          ToAddresses: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to]
        },
        Message: {
          Subject: {
            Data: validatedMessage.subject,
            Charset: 'UTF-8'
          },
          Body: {}
        }
      }

      if (validatedMessage.html) {
        params.Message.Body.Html = {
          Data: validatedMessage.html,
          Charset: 'UTF-8'
        }
      }

      if (validatedMessage.text) {
        params.Message.Body.Text = {
          Data: validatedMessage.text,
          Charset: 'UTF-8'
        }
      }

      if (validatedMessage.replyTo) {
        params.ReplyToAddresses = [validatedMessage.replyTo]
      }

      // Add headers if provided
      if (validatedMessage.headers) {
        params.Tags = Object.entries(validatedMessage.headers).map(([key, value]) => ({
          Name: key,
          Value: value
        }))
      }

      // Send via AWS SES
      const result = await this.sesClient.sendEmail(params)

      return {
        success: true,
        messageId: result.MessageId,
        cost: this.calculateAWSSESCost(params.Destination.ToAddresses.length),
        recipients: params.Destination.ToAddresses
      }
    } catch (error) {
      console.error('AWS SES email send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AWS SES error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      const events = await this.sesClient.getMessageEvents({ MessageId: messageId })
      
      if (events.Events && events.Events.length > 0) {
        const latestEvent = events.Events[events.Events.length - 1]
        return this.mapSESEventType(latestEvent.EventType)
      }
      
      return 'sent'
    } catch (error) {
      console.error('Failed to get AWS SES delivery status:', error)
      return 'unknown'
    }
  }

  private mapSESEventType(eventType: string): string {
    const eventMap: Record<string, string> = {
      'send': 'sent',
      'delivery': 'delivered',
      'bounce': 'failed',
      'complaint': 'failed',
      'open': 'opened',
      'click': 'clicked'
    }
    return eventMap[eventType] || 'unknown'
  }

  private calculateAWSSESCost(recipientCount: number): number {
    // AWS SES pricing: $0.10 per 1,000 emails sent
    return (recipientCount / 1000) * 0.10
  }
}

// SendGrid Email Provider
export class SendGridProvider extends BaseEmailProvider {
  private sendgridClient: any

  constructor(config: Record<string, any>) {
    super('sendgrid', 'SendGrid', 'sendgrid', config)
    this.initializeSendGrid()
  }

  private initializeSendGrid(): void {
    if (!this.config.apiKey) {
      throw new Error('SendGrid configuration missing: apiKey required')
    }

    // In a real implementation, you would initialize the SendGrid client here
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(this.config.apiKey)
    // this.sendgridClient = sgMail
    
    // Mock client for this implementation
    this.sendgridClient = {
      send: async (msg: any) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 250))
        
        if (Math.random() < 0.03) { // 3% failure rate for testing
          throw new Error('SendGrid error: Invalid API key')
        }

        return [{
          statusCode: 202,
          body: '',
          headers: {
            'x-message-id': `sendgrid-${Math.random().toString(36).substr(2, 32)}`
          }
        }]
      },
      getMessageEvents: async (messageId: string) => {
        // Simulate status check
        await new Promise(resolve => setTimeout(resolve, 120))
        
        const events = ['processed', 'delivered', 'bounce', 'dropped', 'open', 'click']
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        
        return [{
          event: randomEvent,
          timestamp: Math.floor(Date.now() / 1000),
          sg_message_id: messageId
        }]
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey)
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      // Validate message
      const validatedMessage = EmailMessageSchema.parse(message)
      
      // Prepare SendGrid message
      const msg: any = {
        to: validatedMessage.to,
        from: validatedMessage.from,
        subject: validatedMessage.subject
      }

      if (validatedMessage.replyTo) {
        msg.replyTo = validatedMessage.replyTo
      }

      if (validatedMessage.html) {
        msg.html = validatedMessage.html
      }

      if (validatedMessage.text) {
        msg.text = validatedMessage.text
      }

      if (validatedMessage.attachments && validatedMessage.attachments.length > 0) {
        msg.attachments = validatedMessage.attachments.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
          type: att.contentType,
          disposition: att.disposition || 'attachment',
          contentId: att.cid
        }))
      }

      if (validatedMessage.templateId) {
        msg.templateId = validatedMessage.templateId
        if (validatedMessage.templateData) {
          msg.dynamicTemplateData = validatedMessage.templateData
        }
      }

      // Add headers if provided
      if (validatedMessage.headers) {
        msg.headers = validatedMessage.headers
      }

      // Send via SendGrid
      const response = await this.sendgridClient.send(msg)
      const messageId = response[0]?.headers?.['x-message-id']

      return {
        success: true,
        messageId,
        cost: this.calculateSendGridCost(Array.isArray(validatedMessage.to) ? validatedMessage.to.length : 1),
        recipients: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to]
      }
    } catch (error) {
      console.error('SendGrid email send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SendGrid error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      const events = await this.sendgridClient.getMessageEvents(messageId)
      
      if (events && events.length > 0) {
        const latestEvent = events[events.length - 1]
        return this.mapSendGridEvent(latestEvent.event)
      }
      
      return 'sent'
    } catch (error) {
      console.error('Failed to get SendGrid delivery status:', error)
      return 'unknown'
    }
  }

  private mapSendGridEvent(eventType: string): string {
    const eventMap: Record<string, string> = {
      'processed': 'sent',
      'delivered': 'delivered',
      'bounce': 'failed',
      'dropped': 'failed',
      'open': 'opened',
      'click': 'clicked'
    }
    return eventMap[eventType] || 'unknown'
  }

  private calculateSendGridCost(recipientCount: number): number {
    // SendGrid pricing varies by plan - this is a simplified calculation
    return recipientCount * 0.001 // Approximate cost per email
  }
}

// SMTP Email Provider
export class SMTPProvider extends BaseEmailProvider {
  private transporter: any

  constructor(config: Record<string, any>) {
    super('smtp', 'SMTP', 'smtp', config)
    this.initializeSMTP()
  }

  private initializeSMTP(): void {
    if (!this.config.host || !this.config.port) {
      throw new Error('SMTP configuration missing: host and port required')
    }

    // In a real implementation, you would initialize nodemailer here
    // const nodemailer = require('nodemailer')
    // this.transporter = nodemailer.createTransporter({
    //   host: this.config.host,
    //   port: this.config.port,
    //   secure: this.config.secure || false,
    //   auth: this.config.auth ? {
    //     user: this.config.auth.user,
    //     pass: this.config.auth.pass
    //   } : undefined
    // })
    
    // Mock transporter for this implementation
    this.transporter = {
      sendMail: async (mailOptions: any) => {
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 400))
        
        if (Math.random() < 0.04) { // 4% failure rate for testing
          throw new Error('SMTP error: Connection refused')
        }

        return {
          messageId: `smtp-${Math.random().toString(36).substr(2, 32)}`,
          response: '250 Message accepted for delivery',
          accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
          rejected: []
        }
      },
      verify: async () => {
        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 200))
        return true
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.host && this.config.port)
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      // Validate message
      const validatedMessage = EmailMessageSchema.parse(message)
      
      // Prepare mail options
      const mailOptions: any = {
        from: validatedMessage.from,
        to: validatedMessage.to,
        subject: validatedMessage.subject
      }

      if (validatedMessage.replyTo) {
        mailOptions.replyTo = validatedMessage.replyTo
      }

      if (validatedMessage.html) {
        mailOptions.html = validatedMessage.html
      }

      if (validatedMessage.text) {
        mailOptions.text = validatedMessage.text
      }

      if (validatedMessage.attachments && validatedMessage.attachments.length > 0) {
        mailOptions.attachments = validatedMessage.attachments
      }

      if (validatedMessage.headers) {
        mailOptions.headers = validatedMessage.headers
      }

      // Send via SMTP
      const result = await this.transporter.sendMail(mailOptions)

      return {
        success: true,
        messageId: result.messageId,
        cost: 0, // SMTP typically has no per-message cost
        recipients: result.accepted
      }
    } catch (error) {
      console.error('SMTP email send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMTP error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    // SMTP doesn't provide delivery status tracking by default
    // You would need to implement bounce handling or use additional services
    return 'sent'
  }
}

// Custom Email Provider
export class CustomEmailProvider extends BaseEmailProvider {
  constructor(config: Record<string, any>) {
    super('custom', 'Custom Provider', 'custom', config)
  }

  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.apiKey)
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      // Validate message
      const validatedMessage = EmailMessageSchema.parse(message)
      
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
          subject: validatedMessage.subject,
          html: validatedMessage.html,
          text: validatedMessage.text,
          attachments: validatedMessage.attachments,
          metadata: validatedMessage.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Custom email API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        messageId: result.messageId || result.id,
        cost: result.cost || 0,
        recipients: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to]
      }
    } catch (error) {
      console.error('Custom email send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown custom email error'
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
      console.error('Failed to get custom email delivery status:', error)
      return 'unknown'
    }
  }
}

// Email Provider Manager
export class EmailProviderManager {
  private providers: Map<string, BaseEmailProvider> = new Map()
  private providersByPriority: BaseEmailProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private async initializeProviders(): Promise<void> {
    // Load provider configurations from database or environment
    const providerConfigs = await this.loadProviderConfigs()

    providerConfigs.forEach(config => {
      try {
        let provider: BaseEmailProvider

        switch (config.type) {
          case 'aws-ses':
            provider = new AWSSESProvider(config.config)
            break
          case 'sendgrid':
            provider = new SendGridProvider(config.config)
            break
          case 'smtp':
            provider = new SMTPProvider(config.config)
            break
          case 'custom':
            provider = new CustomEmailProvider(config.config)
            break
          default:
            console.warn(`Unknown email provider type: ${config.type}`)
            return
        }

        if (provider.validateConfig()) {
          this.providers.set(config.id, provider)
          console.log(`Initialized email provider: ${config.name}`)
        } else {
          console.error(`Invalid configuration for email provider: ${config.name}`)
        }
      } catch (error) {
        console.error(`Failed to initialize email provider ${config.name}:`, error)
      }
    })

    // Sort providers by priority
    this.updateProviderPriority()
  }

  private async loadProviderConfigs(): Promise<any[]> {
    // Mock configuration - in real implementation, load from database
    return [
      {
        id: 'ses-primary',
        name: 'AWS SES Primary',
        type: 'aws-ses',
        enabled: true,
        priority: 1,
        config: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-access-key',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret-key',
          region: process.env.AWS_REGION || 'us-east-1'
        }
      },
      {
        id: 'sendgrid-fallback',
        name: 'SendGrid Fallback',
        type: 'sendgrid',
        enabled: true,
        priority: 2,
        config: {
          apiKey: process.env.SENDGRID_API_KEY || 'mock-api-key'
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

  public async sendEmail(message: EmailMessage, providerId?: string): Promise<EmailResult> {
    if (providerId) {
      // Use specific provider
      const provider = this.providers.get(providerId)
      if (!provider) {
        return {
          success: false,
          error: `Email provider ${providerId} not found`
        }
      }
      return await provider.send(message)
    }

    // Try providers in priority order with fallback
    let lastError = 'No email providers available'

    for (const provider of this.providersByPriority) {
      try {
        const result = await provider.send(message)
        if (result.success) {
          return result
        }
        lastError = result.error || 'Unknown error'
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`Email provider ${provider.name} failed:`, lastError)
      }
    }

    return {
      success: false,
      error: `All email providers failed. Last error: ${lastError}`
    }
  }

  public async getDeliveryStatus(messageId: string, providerId: string): Promise<string> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return 'unknown'
    }

    return await provider.getDeliveryStatus(messageId)
  }

  public getProviders(): BaseEmailProvider[] {
    return Array.from(this.providers.values())
  }

  public getProvider(id: string): BaseEmailProvider | undefined {
    return this.providers.get(id)
  }

  public async testProvider(id: string, testMessage?: EmailMessage): Promise<EmailResult> {
    const provider = this.providers.get(id)
    if (!provider) {
      return {
        success: false,
        error: `Provider ${id} not found`
      }
    }

    const message = testMessage || {
      to: 'test@example.com',
      from: 'noreply@neonpro.com',
      subject: 'Test email from NeonPro notification system',
      text: 'This is a test email to verify the email provider configuration.',
      html: '<p>This is a test email to verify the email provider configuration.</p>'
    }

    return await provider.send(message)
  }
}

// Singleton instance
let emailProviderManagerInstance: EmailProviderManager | null = null

export const getEmailProviderManager = (): EmailProviderManager => {
  if (!emailProviderManagerInstance) {
    emailProviderManagerInstance = new EmailProviderManager()
  }
  return emailProviderManagerInstance
}

export default EmailProviderManager