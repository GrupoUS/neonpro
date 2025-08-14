/**
 * Push Notification Provider Implementation for Notification Engine
 * 
 * Integração com múltiplos providers de push notifications para aplicativos móveis e web
 * incluindo Firebase FCM, Apple Push Notification service (APNs), e Web Push API
 */

import { z } from 'zod'

export interface PushProvider {
  id: string
  name: string
  type: 'firebase-fcm' | 'apple-apns' | 'web-push' | 'custom'
  enabled: boolean
  priority: number
  config: Record<string, any>
  rateLimitPerMinute: number
  supportedPlatforms: string[]
  batchSize: number
}

export interface PushMessage {
  tokens: string | string[]
  title: string
  body: string
  icon?: string
  image?: string
  badge?: number
  sound?: string
  clickAction?: string
  data?: Record<string, any>
  priority?: 'normal' | 'high'
  ttl?: number
  collapseKey?: string
  channelId?: string
  metadata?: Record<string, any>
}

export interface PushResult {
  success: boolean
  messageId?: string
  error?: string
  successCount?: number
  failureCount?: number
  results?: Array<{
    token: string
    success: boolean
    error?: string
    messageId?: string
  }>
  cost?: number
}

const PushMessageSchema = z.object({
  tokens: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1)
  ]),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  icon: z.string().url().optional(),
  image: z.string().url().optional(),
  badge: z.number().int().min(0).optional(),
  sound: z.string().optional(),
  clickAction: z.string().optional(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['normal', 'high']).optional(),
  ttl: z.number().int().min(0).optional(),
  collapseKey: z.string().optional(),
  channelId: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

// Base Push Provider Class
export abstract class BasePushProvider {
  protected config: Record<string, any>
  
  constructor(
    public id: string,
    public name: string,
    public type: string,
    config: Record<string, any>
  ) {
    this.config = config
  }

  abstract async send(message: PushMessage): Promise<PushResult>
  abstract async sendBatch(messages: PushMessage[]): Promise<PushResult[]>
  abstract validateConfig(): boolean
  abstract async validateToken(token: string): Promise<boolean>
}

// Firebase FCM Provider
export class FirebaseFCMProvider extends BasePushProvider {
  private admin: any

  constructor(config: Record<string, any>) {
    super('firebase-fcm', 'Firebase FCM', 'firebase-fcm', config)
    this.initializeFirebase()
  }

  private initializeFirebase(): void {
    if (!this.config.serviceAccountKey && !this.config.projectId) {
      throw new Error('Firebase FCM configuration missing: serviceAccountKey or projectId required')
    }

    // In a real implementation, you would initialize Firebase Admin SDK here
    // const admin = require('firebase-admin')
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(this.config.serviceAccountKey),
    //     projectId: this.config.projectId
    //   })
    // }
    // this.admin = admin
    
    // Mock Firebase admin for this implementation
    this.admin = {
      messaging: () => ({
        send: async (message: any) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200))
          
          if (Math.random() < 0.03) { // 3% failure rate for testing
            throw new Error('Firebase FCM error: Invalid registration token')
          }

          return `fcm-${Math.random().toString(36).substr(2, 32)}`
        },
        sendMulticast: async (message: any) => {
          // Simulate batch API call
          await new Promise(resolve => setTimeout(resolve, 400))
          
          const successCount = Math.floor(message.tokens.length * 0.97) // 97% success rate
          const failureCount = message.tokens.length - successCount
          
          return {
            successCount,
            failureCount,
            responses: message.tokens.map((token: string, index: number) => ({
              success: index < successCount,
              messageId: index < successCount ? `fcm-${Math.random().toString(36).substr(2, 32)}` : undefined,
              error: index >= successCount ? { code: 'messaging/invalid-registration-token' } : undefined
            }))
          }
        },
        subscribeToTopic: async (tokens: string[], topic: string) => {
          await new Promise(resolve => setTimeout(resolve, 150))
          return { successCount: tokens.length, failureCount: 0 }
        }
      })
    }
  }

  validateConfig(): boolean {
    return !!(this.config.serviceAccountKey || this.config.projectId)
  }

  async send(message: PushMessage): Promise<PushResult> {
    try {
      // Validate message
      const validatedMessage = PushMessageSchema.parse(message)
      
      // Handle single token
      if (typeof validatedMessage.tokens === 'string') {
        const fcmMessage = this.buildFCMMessage(validatedMessage, validatedMessage.tokens)
        const messageId = await this.admin.messaging().send(fcmMessage)

        return {
          success: true,
          messageId,
          successCount: 1,
          failureCount: 0,
          cost: this.calculateFCMCost(1)
        }
      }

      // Handle multiple tokens using multicast
      const fcmMessage = this.buildFCMMulticastMessage(validatedMessage)
      const result = await this.admin.messaging().sendMulticast(fcmMessage)

      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
        results: result.responses.map((response: any, index: number) => ({
          token: validatedMessage.tokens[index],
          success: response.success,
          messageId: response.messageId,
          error: response.error?.code
        })),
        cost: this.calculateFCMCost(validatedMessage.tokens.length)
      }
    } catch (error) {
      console.error('Firebase FCM send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Firebase FCM error',
        successCount: 0,
        failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
      }
    }
  }

  async sendBatch(messages: PushMessage[]): Promise<PushResult[]> {
    const results: PushResult[] = []

    // Process messages in batches of 500 (FCM limit)
    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500)
      const batchResults = await Promise.all(batch.map(msg => this.send(msg)))
      results.push(...batchResults)
    }

    return results
  }

  private buildFCMMessage(message: PushMessage, token: string): any {
    const fcmMessage: any = {
      token,
      notification: {
        title: message.title,
        body: message.body
      },
      data: message.data || {},
      android: {
        priority: message.priority || 'normal',
        notification: {
          sound: message.sound || 'default',
          clickAction: message.clickAction,
          channelId: message.channelId || 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: message.badge,
            sound: message.sound || 'default'
          }
        }
      },
      webpush: {
        notification: {
          icon: message.icon,
          image: message.image,
          requireInteraction: message.priority === 'high'
        }
      }
    }

    if (message.ttl) {
      fcmMessage.android.ttl = `${message.ttl}s`
      fcmMessage.apns.headers = { 'apns-expiration': String(Math.floor(Date.now() / 1000) + message.ttl) }
      fcmMessage.webpush.headers = { TTL: String(message.ttl) }
    }

    if (message.collapseKey) {
      fcmMessage.android.collapseKey = message.collapseKey
      fcmMessage.apns.headers = { ...fcmMessage.apns.headers, 'apns-collapse-id': message.collapseKey }
    }

    return fcmMessage
  }

  private buildFCMMulticastMessage(message: PushMessage): any {
    const tokens = Array.isArray(message.tokens) ? message.tokens : [message.tokens]
    
    return {
      tokens,
      notification: {
        title: message.title,
        body: message.body
      },
      data: message.data || {},
      android: {
        priority: message.priority || 'normal',
        notification: {
          sound: message.sound || 'default',
          clickAction: message.clickAction,
          channelId: message.channelId || 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: message.badge,
            sound: message.sound || 'default'
          }
        }
      },
      webpush: {
        notification: {
          icon: message.icon,
          image: message.image,
          requireInteraction: message.priority === 'high'
        }
      }
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // In a real implementation, you would use FCM's registration token validation
      // For now, we'll simulate a validation
      await new Promise(resolve => setTimeout(resolve, 100))
      return token.length > 100 // Simple validation based on token length
    } catch (error) {
      return false
    }
  }

  private calculateFCMCost(messageCount: number): number {
    // Firebase FCM is free for basic usage
    // This could include costs for advanced features or high volume
    return 0
  }
}

// Apple Push Notification Service (APNs) Provider
export class ApplePushProvider extends BasePushProvider {
  private apn: any

  constructor(config: Record<string, any>) {
    super('apple-apns', 'Apple Push Notification service', 'apple-apns', config)
    this.initializeAPNs()
  }

  private initializeAPNs(): void {
    if (!this.config.keyId || !this.config.teamId || !this.config.key) {
      throw new Error('Apple APNs configuration missing: keyId, teamId, and key required')
    }

    // In a real implementation, you would initialize the APNs provider here
    // const apn = require('apn')
    // this.apn = new apn.Provider({
    //   token: {
    //     key: this.config.key,
    //     keyId: this.config.keyId,
    //     teamId: this.config.teamId
    //   },
    //   production: this.config.production || false
    // })
    
    // Mock APNs provider for this implementation
    this.apn = {
      send: async (notification: any, deviceTokens: string[]) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const failed = deviceTokens.filter(() => Math.random() < 0.05) // 5% failure rate
        const sent = deviceTokens.filter(token => !failed.includes(token))
        
        return {
          sent: sent.map(token => ({ device: token })),
          failed: failed.map(token => ({ 
            device: token, 
            error: { reason: 'BadDeviceToken' }
          }))
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.keyId && this.config.teamId && this.config.key)
  }

  async send(message: PushMessage): Promise<PushResult> {
    try {
      // Validate message
      const validatedMessage = PushMessageSchema.parse(message)
      
      // Build APNs notification
      const notification = this.buildAPNsNotification(validatedMessage)
      const deviceTokens = Array.isArray(validatedMessage.tokens) ? validatedMessage.tokens : [validatedMessage.tokens]
      
      // Send via APNs
      const result = await this.apn.send(notification, deviceTokens)

      return {
        success: result.sent.length > 0,
        successCount: result.sent.length,
        failureCount: result.failed.length,
        results: [
          ...result.sent.map((sent: any) => ({
            token: sent.device,
            success: true,
            messageId: `apns-${Math.random().toString(36).substr(2, 32)}`
          })),
          ...result.failed.map((failed: any) => ({
            token: failed.device,
            success: false,
            error: failed.error.reason
          }))
        ],
        cost: this.calculateAPNsCost(deviceTokens.length)
      }
    } catch (error) {
      console.error('Apple APNs send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Apple APNs error',
        successCount: 0,
        failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
      }
    }
  }

  async sendBatch(messages: PushMessage[]): Promise<PushResult[]> {
    const results: PushResult[] = []

    // Process messages sequentially to avoid rate limiting
    for (const message of messages) {
      const result = await this.send(message)
      results.push(result)
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return results
  }

  private buildAPNsNotification(message: PushMessage): any {
    // In a real implementation, you would create an apn.Notification object
    // For now, we'll return a mock notification structure
    return {
      alert: {
        title: message.title,
        body: message.body
      },
      badge: message.badge,
      sound: message.sound || 'default',
      payload: message.data || {},
      topic: this.config.bundleId,
      priority: message.priority === 'high' ? 10 : 5,
      expiry: message.ttl ? Math.floor(Date.now() / 1000) + message.ttl : undefined,
      collapseId: message.collapseKey
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // APNs device tokens are 64 characters long (hex)
      return /^[a-fA-F0-9]{64}$/.test(token)
    } catch (error) {
      return false
    }
  }

  private calculateAPNsCost(messageCount: number): number {
    // Apple APNs is free for basic usage
    return 0
  }
}

// Web Push Provider
export class WebPushProvider extends BasePushProvider {
  private webpush: any

  constructor(config: Record<string, any>) {
    super('web-push', 'Web Push', 'web-push', config)
    this.initializeWebPush()
  }

  private initializeWebPush(): void {
    if (!this.config.publicKey || !this.config.privateKey) {
      throw new Error('Web Push configuration missing: publicKey and privateKey required')
    }

    // In a real implementation, you would initialize the web-push library here
    // const webpush = require('web-push')
    // webpush.setVapidDetails(
    //   this.config.subject || 'mailto:admin@neonpro.com',
    //   this.config.publicKey,
    //   this.config.privateKey
    // )
    // this.webpush = webpush
    
    // Mock web-push for this implementation
    this.webpush = {
      sendNotification: async (subscription: any, payload: string, options: any) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 250))
        
        if (Math.random() < 0.04) { // 4% failure rate for testing
          throw new Error('Web Push error: Invalid subscription')
        }

        return {
          statusCode: 201,
          body: 'Success',
          headers: {}
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.publicKey && this.config.privateKey)
  }

  async send(message: PushMessage): Promise<PushResult> {
    try {
      // Validate message
      const validatedMessage = PushMessageSchema.parse(message)
      
      // Web Push tokens are actually subscription objects
      const subscriptions = Array.isArray(validatedMessage.tokens) ? validatedMessage.tokens : [validatedMessage.tokens]
      
      // Build payload
      const payload = JSON.stringify({
        title: validatedMessage.title,
        body: validatedMessage.body,
        icon: validatedMessage.icon,
        image: validatedMessage.image,
        badge: validatedMessage.badge,
        data: validatedMessage.data || {},
        actions: validatedMessage.clickAction ? [{
          action: 'click',
          title: 'Ver mais'
        }] : undefined
      })

      // Send to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            // Parse subscription if it's a string
            const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription
            
            const options = {
              TTL: validatedMessage.ttl || 86400, // 24 hours default
              urgency: validatedMessage.priority === 'high' ? 'high' : 'normal',
              topic: validatedMessage.collapseKey
            }

            await this.webpush.sendNotification(sub, payload, options)
            
            return {
              token: typeof subscription === 'string' ? subscription : JSON.stringify(subscription),
              success: true,
              messageId: `webpush-${Math.random().toString(36).substr(2, 32)}`
            }
          } catch (error) {
            return {
              token: typeof subscription === 'string' ? subscription : JSON.stringify(subscription),
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
      const failureCount = results.length - successCount

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        results: results.map(r => r.status === 'fulfilled' ? r.value : {
          token: 'unknown',
          success: false,
          error: 'Promise rejected'
        }),
        cost: this.calculateWebPushCost(subscriptions.length)
      }
    } catch (error) {
      console.error('Web Push send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Web Push error',
        successCount: 0,
        failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
      }
    }
  }

  async sendBatch(messages: PushMessage[]): Promise<PushResult[]> {
    const results: PushResult[] = []

    // Process messages in parallel but with concurrency limit
    const concurrencyLimit = 10
    for (let i = 0; i < messages.length; i += concurrencyLimit) {
      const batch = messages.slice(i, i + concurrencyLimit)
      const batchResults = await Promise.all(batch.map(msg => this.send(msg)))
      results.push(...batchResults)
    }

    return results
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // Web Push token is a subscription object, validate JSON structure
      const subscription = JSON.parse(token)
      return !!(subscription.endpoint && subscription.keys && subscription.keys.p256dh && subscription.keys.auth)
    } catch (error) {
      return false
    }
  }

  private calculateWebPushCost(messageCount: number): number {
    // Web Push is typically free but may have service provider costs
    return 0
  }
}

// Custom Push Provider
export class CustomPushProvider extends BasePushProvider {
  constructor(config: Record<string, any>) {
    super('custom', 'Custom Push Provider', 'custom', config)
  }

  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.apiKey)
  }

  async send(message: PushMessage): Promise<PushResult> {
    try {
      // Validate message
      const validatedMessage = PushMessageSchema.parse(message)
      
      // Make HTTP request to custom endpoint
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          tokens: validatedMessage.tokens,
          title: validatedMessage.title,
          body: validatedMessage.body,
          icon: validatedMessage.icon,
          image: validatedMessage.image,
          badge: validatedMessage.badge,
          sound: validatedMessage.sound,
          data: validatedMessage.data,
          priority: validatedMessage.priority,
          ttl: validatedMessage.ttl,
          metadata: validatedMessage.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Custom Push API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: result.success || true,
        messageId: result.messageId || result.id,
        successCount: result.successCount || 1,
        failureCount: result.failureCount || 0,
        results: result.results,
        cost: result.cost || 0
      }
    } catch (error) {
      console.error('Custom Push send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown custom push error',
        successCount: 0,
        failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
      }
    }
  }

  async sendBatch(messages: PushMessage[]): Promise<PushResult[]> {
    const results: PushResult[] = []

    for (const message of messages) {
      const result = await this.send(message)
      results.push(result)
    }

    return results
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      return result.valid || false
    } catch (error) {
      return false
    }
  }
}

// Push Provider Manager
export class PushProviderManager {
  private providers: Map<string, BasePushProvider> = new Map()
  private providersByPriority: BasePushProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private async initializeProviders(): Promise<void> {
    // Load provider configurations from database or environment
    const providerConfigs = await this.loadProviderConfigs()

    providerConfigs.forEach(config => {
      try {
        let provider: BasePushProvider

        switch (config.type) {
          case 'firebase-fcm':
            provider = new FirebaseFCMProvider(config.config)
            break
          case 'apple-apns':
            provider = new ApplePushProvider(config.config)
            break
          case 'web-push':
            provider = new WebPushProvider(config.config)
            break
          case 'custom':
            provider = new CustomPushProvider(config.config)
            break
          default:
            console.warn(`Unknown push provider type: ${config.type}`)
            return
        }

        if (provider.validateConfig()) {
          this.providers.set(config.id, provider)
          console.log(`Initialized push provider: ${config.name}`)
        } else {
          console.error(`Invalid configuration for push provider: ${config.name}`)
        }
      } catch (error) {
        console.error(`Failed to initialize push provider ${config.name}:`, error)
      }
    })

    // Sort providers by priority
    this.updateProviderPriority()
  }

  private async loadProviderConfigs(): Promise<any[]> {
    // Mock configuration - in real implementation, load from database
    return [
      {
        id: 'fcm-primary',
        name: 'Firebase FCM Primary',
        type: 'firebase-fcm',
        enabled: true,
        priority: 1,
        config: {
          projectId: process.env.FIREBASE_PROJECT_ID || 'neonpro-app',
          serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : null
        }
      },
      {
        id: 'web-push-primary',
        name: 'Web Push Primary',
        type: 'web-push',
        enabled: true,
        priority: 2,
        config: {
          publicKey: process.env.WEB_PUSH_PUBLIC_KEY || 'mock-public-key',
          privateKey: process.env.WEB_PUSH_PRIVATE_KEY || 'mock-private-key',
          subject: process.env.WEB_PUSH_SUBJECT || 'mailto:admin@neonpro.com'
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

  public async sendPushNotification(message: PushMessage, providerId?: string): Promise<PushResult> {
    if (providerId) {
      // Use specific provider
      const provider = this.providers.get(providerId)
      if (!provider) {
        return {
          success: false,
          error: `Push provider ${providerId} not found`,
          successCount: 0,
          failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
        }
      }
      return await provider.send(message)
    }

    // Try providers in priority order with fallback
    let lastError = 'No push providers available'

    for (const provider of this.providersByPriority) {
      try {
        const result = await provider.send(message)
        if (result.success) {
          return result
        }
        lastError = result.error || 'Unknown error'
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`Push provider ${provider.name} failed:`, lastError)
      }
    }

    return {
      success: false,
      error: `All push providers failed. Last error: ${lastError}`,
      successCount: 0,
      failureCount: Array.isArray(message.tokens) ? message.tokens.length : 1
    }
  }

  public async sendBatch(messages: PushMessage[], providerId?: string): Promise<PushResult[]> {
    if (providerId) {
      const provider = this.providers.get(providerId)
      if (!provider) {
        return messages.map(msg => ({
          success: false,
          error: `Push provider ${providerId} not found`,
          successCount: 0,
          failureCount: Array.isArray(msg.tokens) ? msg.tokens.length : 1
        }))
      }
      return await provider.sendBatch(messages)
    }

    // Use highest priority provider for batch
    if (this.providersByPriority.length > 0) {
      return await this.providersByPriority[0].sendBatch(messages)
    }

    return messages.map(msg => ({
      success: false,
      error: 'No push providers available',
      successCount: 0,
      failureCount: Array.isArray(msg.tokens) ? msg.tokens.length : 1
    }))
  }

  public getProviders(): BasePushProvider[] {
    return Array.from(this.providers.values())
  }

  public getProvider(id: string): BasePushProvider | undefined {
    return this.providers.get(id)
  }

  public async validateToken(token: string, providerId?: string): Promise<boolean> {
    if (providerId) {
      const provider = this.providers.get(providerId)
      return provider ? await provider.validateToken(token) : false
    }

    // Try to validate with any provider
    for (const provider of this.providersByPriority) {
      try {
        const isValid = await provider.validateToken(token)
        if (isValid) return true
      } catch (error) {
        // Continue to next provider
      }
    }

    return false
  }

  public async testProvider(id: string, testMessage?: PushMessage): Promise<PushResult> {
    const provider = this.providers.get(id)
    if (!provider) {
      return {
        success: false,
        error: `Provider ${id} not found`,
        successCount: 0,
        failureCount: 1
      }
    }

    const message = testMessage || {
      tokens: 'test-token-123',
      title: 'Teste NeonPro',
      body: 'Teste do sistema de notificações push do NeonPro',
      icon: '/icon-192x192.png',
      data: { test: true }
    }

    return await provider.send(message)
  }
}

// Singleton instance
let pushProviderManagerInstance: PushProviderManager | null = null

export const getPushProviderManager = (): PushProviderManager => {
  if (!pushProviderManagerInstance) {
    pushProviderManagerInstance = new PushProviderManager()
  }
  return pushProviderManagerInstance
}

export default PushProviderManager