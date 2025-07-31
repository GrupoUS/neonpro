/**
 * SMS Provider Implementation for Notification Engine
 * 
 * Integração com múltiplos providers de SMS para alta disponibilidade
 * com suporte a Twilio, AWS SNS, e fallback automático
 */

import { z } from 'zod'

export interface SMSProvider {
  id: string
  name: string
  type: 'twilio' | 'aws-sns' | 'custom'
  enabled: boolean
  priority: number
  config: Record<string, any>
  rateLimitPerMinute: number
  maxMessageLength: number
  supportedCountries: string[]
}

export interface SMSMessage {
  to: string
  from: string
  body: string
  mediaUrls?: string[]
  metadata?: Record<string, any>
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
  deliveredAt?: Date
  segments?: number
}

const SMSMessageSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  from: z.string().min(1),
  body: z.string().min(1).max(1600),
  mediaUrls: z.array(z.string().url()).optional(),
  metadata: z.record(z.any()).optional()
})

// Base SMS Provider Class
export abstract class BaseSMSProvider {
  protected config: Record<string, any>
  
  constructor(
    public id: string,
    public name: string,
    public type: string,
    config: Record<string, any>
  ) {
    this.config = config
  }

  abstract async send(message: SMSMessage): Promise<SMSResult>
  abstract async getDeliveryStatus(messageId: string): Promise<string>
  abstract validateConfig(): boolean
}

// Twilio SMS Provider
export class TwilioSMSProvider extends BaseSMSProvider {
  private twilioClient: any

  constructor(config: Record<string, any>) {
    super('twilio', 'Twilio', 'twilio', config)
    this.initializeTwilio()
  }

  private initializeTwilio(): void {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio configuration missing: accountSid and authToken required')
    }

    // In a real implementation, you would initialize the Twilio client here
    // const twilio = require('twilio')
    // this.twilioClient = twilio(this.config.accountSid, this.config.authToken)
    
    // Mock client for this implementation
    this.twilioClient = {
      messages: {
        create: async (messageData: any) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200))
          
          if (Math.random() < 0.05) { // 5% failure rate for testing
            throw new Error('Twilio API error: Invalid phone number')
          }

          return {
            sid: `SM${Math.random().toString(36).substr(2, 32)}`,
            status: 'queued',
            numSegments: Math.ceil(messageData.body.length / 160),
            price: (Math.ceil(messageData.body.length / 160) * 0.05).toFixed(4),
            dateSent: null
          }
        },
        get: async (sid: string) => {
          // Simulate status check
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const statuses = ['queued', 'sending', 'sent', 'delivered', 'failed']
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          return {
            sid,
            status: randomStatus,
            dateSent: randomStatus !== 'queued' ? new Date() : null,
            errorCode: randomStatus === 'failed' ? '30008' : null,
            errorMessage: randomStatus === 'failed' ? 'Unknown destination handset' : null
          }
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.accountSid && this.config.authToken && this.config.fromNumber)
  }

  async send(message: SMSMessage): Promise<SMSResult> {
    try {
      // Validate message
      const validatedMessage = SMSMessageSchema.parse(message)
      
      // Prepare Twilio message data
      const messageData: any = {
        to: validatedMessage.to,
        from: validatedMessage.from || this.config.fromNumber,
        body: validatedMessage.body
      }

      if (validatedMessage.mediaUrls && validatedMessage.mediaUrls.length > 0) {
        messageData.mediaUrl = validatedMessage.mediaUrls
      }

      // Send via Twilio
      const twilioMessage = await this.twilioClient.messages.create(messageData)

      return {
        success: true,
        messageId: twilioMessage.sid,
        cost: parseFloat(twilioMessage.price || '0'),
        segments: twilioMessage.numSegments || 1,
        deliveredAt: twilioMessage.dateSent || undefined
      }
    } catch (error) {
      console.error('Twilio SMS send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Twilio error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      const message = await this.twilioClient.messages.get(messageId)
      return this.mapTwilioStatus(message.status)
    } catch (error) {
      console.error('Failed to get Twilio delivery status:', error)
      return 'unknown'
    }
  }

  private mapTwilioStatus(twilioStatus: string): string {
    const statusMap: Record<string, string> = {
      'queued': 'pending',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'failed': 'failed',
      'undelivered': 'failed'
    }
    return statusMap[twilioStatus] || 'unknown'
  }
}

// AWS SNS SMS Provider
export class AWSSNSProvider extends BaseSMSProvider {
  private snsClient: any

  constructor(config: Record<string, any>) {
    super('aws-sns', 'AWS SNS', 'aws-sns', config)
    this.initializeAWSSNS()
  }

  private initializeAWSSNS(): void {
    if (!this.config.accessKeyId || !this.config.secretAccessKey || !this.config.region) {
      throw new Error('AWS SNS configuration missing: accessKeyId, secretAccessKey, and region required')
    }

    // In a real implementation, you would initialize the AWS SNS client here
    // const AWS = require('aws-sdk')
    // AWS.config.update({
    //   accessKeyId: this.config.accessKeyId,
    //   secretAccessKey: this.config.secretAccessKey,
    //   region: this.config.region
    // })
    // this.snsClient = new AWS.SNS()
    
    // Mock client for this implementation
    this.snsClient = {
      publish: async (params: any) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 150))
        
        if (Math.random() < 0.03) { // 3% failure rate for testing
          throw new Error('AWS SNS error: Invalid phone number')
        }

        return {
          MessageId: `aws-sns-${Math.random().toString(36).substr(2, 32)}`
        }
      },
      getSMSAttributes: async (params: any) => {
        // Simulate status check
        await new Promise(resolve => setTimeout(resolve, 80))
        
        return {
          attributes: {
            'SMSType': 'Transactional',
            'DefaultSMSType': 'Transactional'
          }
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.accessKeyId && this.config.secretAccessKey && this.config.region)
  }

  async send(message: SMSMessage): Promise<SMSResult> {
    try {
      // Validate message
      const validatedMessage = SMSMessageSchema.parse(message)
      
      // Prepare AWS SNS params
      const params = {
        PhoneNumber: validatedMessage.to,
        Message: validatedMessage.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      }

      // Send via AWS SNS
      const result = await this.snsClient.publish(params)

      return {
        success: true,
        messageId: result.MessageId,
        cost: this.calculateAWSSMSCost(validatedMessage.body),
        segments: Math.ceil(validatedMessage.body.length / 160)
      }
    } catch (error) {
      console.error('AWS SNS SMS send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AWS SNS error'
      }
    }
  }

  async getDeliveryStatus(messageId: string): Promise<string> {
    // AWS SNS doesn't provide delivery status for SMS by default
    // You would need to set up CloudWatch or SNS delivery status to track this
    return 'sent'
  }

  private calculateAWSSMSCost(message: string): number {
    // AWS SNS pricing varies by region and message length
    // This is a simplified calculation
    const segments = Math.ceil(message.length / 160)
    return segments * 0.006 // Approximate cost per segment in USD
  }
}

// Custom SMS Provider (for local/custom implementations)
export class CustomSMSProvider extends BaseSMSProvider {
  constructor(config: Record<string, any>) {
    super('custom', 'Custom Provider', 'custom', config)
  }

  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.apiKey)
  }

  async send(message: SMSMessage): Promise<SMSResult> {
    try {
      // Validate message
      const validatedMessage = SMSMessageSchema.parse(message)
      
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
          message: validatedMessage.body,
          metadata: validatedMessage.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Custom SMS API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        messageId: result.messageId || result.id,
        cost: result.cost || 0
      }
    } catch (error) {
      console.error('Custom SMS send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown custom SMS error'
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
      console.error('Failed to get custom SMS delivery status:', error)
      return 'unknown'
    }
  }
}

// SMS Provider Manager
export class SMSProviderManager {
  private providers: Map<string, BaseSMSProvider> = new Map()
  private providersByPriority: BaseSMSProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private async initializeProviders(): Promise<void> {
    // Load provider configurations from database or environment
    const providerConfigs = await this.loadProviderConfigs()

    providerConfigs.forEach(config => {
      try {
        let provider: BaseSMSProvider

        switch (config.type) {
          case 'twilio':
            provider = new TwilioSMSProvider(config.config)
            break
          case 'aws-sns':
            provider = new AWSSNSProvider(config.config)
            break
          case 'custom':
            provider = new CustomSMSProvider(config.config)
            break
          default:
            console.warn(`Unknown SMS provider type: ${config.type}`)
            return
        }

        if (provider.validateConfig()) {
          this.providers.set(config.id, provider)
          console.log(`Initialized SMS provider: ${config.name}`)
        } else {
          console.error(`Invalid configuration for SMS provider: ${config.name}`)
        }
      } catch (error) {
        console.error(`Failed to initialize SMS provider ${config.name}:`, error)
      }
    })

    // Sort providers by priority
    this.updateProviderPriority()
  }

  private async loadProviderConfigs(): Promise<any[]> {
    // Mock configuration - in real implementation, load from database
    return [
      {
        id: 'twilio-primary',
        name: 'Twilio Primary',
        type: 'twilio',
        enabled: true,
        priority: 1,
        config: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || 'mock-account-sid',
          authToken: process.env.TWILIO_AUTH_TOKEN || 'mock-auth-token',
          fromNumber: process.env.TWILIO_FROM_NUMBER || '+15551234567'
        }
      },
      {
        id: 'aws-sns-fallback',
        name: 'AWS SNS Fallback',
        type: 'aws-sns',
        enabled: true,
        priority: 2,
        config: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-access-key',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret-key',
          region: process.env.AWS_REGION || 'us-east-1'
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

  public async sendSMS(message: SMSMessage, providerId?: string): Promise<SMSResult> {
    if (providerId) {
      // Use specific provider
      const provider = this.providers.get(providerId)
      if (!provider) {
        return {
          success: false,
          error: `SMS provider ${providerId} not found`
        }
      }
      return await provider.send(message)
    }

    // Try providers in priority order with fallback
    let lastError = 'No SMS providers available'

    for (const provider of this.providersByPriority) {
      try {
        const result = await provider.send(message)
        if (result.success) {
          return result
        }
        lastError = result.error || 'Unknown error'
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`SMS provider ${provider.name} failed:`, lastError)
      }
    }

    return {
      success: false,
      error: `All SMS providers failed. Last error: ${lastError}`
    }
  }

  public async getDeliveryStatus(messageId: string, providerId: string): Promise<string> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return 'unknown'
    }

    return await provider.getDeliveryStatus(messageId)
  }

  public getProviders(): BaseSMSProvider[] {
    return Array.from(this.providers.values())
  }

  public getProvider(id: string): BaseSMSProvider | undefined {
    return this.providers.get(id)
  }

  public async addProvider(config: any): Promise<void> {
    // Add new provider configuration to database and initialize
    // Implementation would depend on your database structure
    console.log('Adding new SMS provider:', config.name)
  }

  public async removeProvider(id: string): Promise<void> {
    this.providers.delete(id)
    this.updateProviderPriority()
    console.log(`Removed SMS provider: ${id}`)
  }

  public async testProvider(id: string, testMessage?: SMSMessage): Promise<SMSResult> {
    const provider = this.providers.get(id)
    if (!provider) {
      return {
        success: false,
        error: `Provider ${id} not found`
      }
    }

    const message = testMessage || {
      to: '+15551234567', // Test number
      from: '+15557654321',
      body: 'Test message from NeonPro notification system'
    }

    return await provider.send(message)
  }
}

// Singleton instance
let smsProviderManagerInstance: SMSProviderManager | null = null

export const getSMSProviderManager = (): SMSProviderManager => {
  if (!smsProviderManagerInstance) {
    smsProviderManagerInstance = new SMSProviderManager()
  }
  return smsProviderManagerInstance
}

export default SMSProviderManager