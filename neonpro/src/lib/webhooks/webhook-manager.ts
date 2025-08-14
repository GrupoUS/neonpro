/**
 * Webhook Manager
 * Story 7.3: Webhook & Event System Implementation
 * 
 * This module provides webhook management functionality:
 * - Webhook endpoint registration and management
 * - Event delivery to webhooks
 * - Retry mechanisms and failure handling
 * - Webhook validation and security
 * - Delivery tracking and analytics
 * - Rate limiting and throttling
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import type {
  BaseEvent,
  WebhookEndpoint,
  EventDelivery,
  WebhookStatus,
  RetryStrategy,
  WebhookValidationResult,
  WebhookSystemConfig
} from './types'

interface WebhookManagerConfig {
  supabaseUrl: string
  supabaseKey: string
  defaultTimeout: number
  maxRetries: number
  retryDelayMs: number
  maxConcurrentDeliveries: number
  enableSignatureValidation: boolean
  signatureSecret: string
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    burstLimit: number
  }
}

export class WebhookManager {
  private supabase
  private config: WebhookManagerConfig
  private webhookEndpoints: Map<string, WebhookEndpoint> = new Map()
  private deliveryQueue: EventDelivery[] = []
  private activeDeliveries: Set<string> = new Set()
  private rateLimiters: Map<string, { requests: number; resetTime: number }> = new Map()
  private processingInterval?: NodeJS.Timeout

  constructor(config: WebhookManagerConfig) {
    this.config = config
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }

  /**
   * Initialize the webhook manager
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Webhook Manager...')
      
      // Load existing webhook endpoints
      await this.loadWebhookEndpoints()
      
      // Start delivery processing
      this.startDeliveryProcessing()
      
      console.log('✅ Webhook Manager initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize webhook manager:', error)
      throw new Error('Webhook manager initialization failed')
    }
  }

  /**
   * Register a new webhook endpoint
   */
  async registerWebhook(webhookData: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const webhook: WebhookEndpoint = {
        id: this.generateWebhookId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...webhookData
      }

      console.log(`Registering webhook: ${webhook.name} (${webhook.url})`)
      
      // Validate webhook configuration
      const validation = await this.validateWebhook(webhook)
      if (!validation.isValid) {
        throw new Error(`Webhook validation failed: ${validation.errors.join(', ')}`)
      }
      
      // Test webhook endpoint
      if (webhook.testOnRegistration) {
        const testResult = await this.testWebhookEndpoint(webhook)
        if (!testResult.success) {
          throw new Error(`Webhook test failed: ${testResult.error}`)
        }
      }
      
      // Store webhook in database
      const { error } = await this.supabase
        .from('webhook_endpoints')
        .insert({
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          clinic_id: webhook.clinicId,
          event_types: webhook.eventTypes,
          is_active: webhook.isActive,
          secret: webhook.secret,
          headers: webhook.headers,
          timeout_ms: webhook.timeoutMs,
          retry_strategy: webhook.retryStrategy,
          rate_limit: webhook.rateLimit,
          filters: webhook.filters,
          test_on_registration: webhook.testOnRegistration,
          created_at: webhook.createdAt.toISOString(),
          updated_at: webhook.updatedAt.toISOString()
        })
      
      if (error) {
        throw error
      }
      
      // Add to local cache
      this.webhookEndpoints.set(webhook.id, webhook)
      
      console.log(`✅ Webhook ${webhook.id} registered successfully`)
      return webhook.id
      
    } catch (error) {
      console.error('❌ Failed to register webhook:', error)
      throw new Error(`Webhook registration failed: ${error.message}`)
    }
  }

  /**
   * Update an existing webhook endpoint
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookEndpoint>): Promise<void> {
    try {
      const existingWebhook = this.webhookEndpoints.get(webhookId)
      if (!existingWebhook) {
        throw new Error(`Webhook ${webhookId} not found`)
      }

      const updatedWebhook: WebhookEndpoint = {
        ...existingWebhook,
        ...updates,
        id: webhookId, // Ensure ID doesn't change
        updatedAt: new Date()
      }

      console.log(`Updating webhook: ${webhookId}`)
      
      // Validate updated webhook
      const validation = await this.validateWebhook(updatedWebhook)
      if (!validation.isValid) {
        throw new Error(`Webhook validation failed: ${validation.errors.join(', ')}`)
      }
      
      // Update in database
      const { error } = await this.supabase
        .from('webhook_endpoints')
        .update({
          name: updatedWebhook.name,
          url: updatedWebhook.url,
          event_types: updatedWebhook.eventTypes,
          is_active: updatedWebhook.isActive,
          secret: updatedWebhook.secret,
          headers: updatedWebhook.headers,
          timeout_ms: updatedWebhook.timeoutMs,
          retry_strategy: updatedWebhook.retryStrategy,
          rate_limit: updatedWebhook.rateLimit,
          filters: updatedWebhook.filters,
          test_on_registration: updatedWebhook.testOnRegistration,
          updated_at: updatedWebhook.updatedAt.toISOString()
        })
        .eq('id', webhookId)
      
      if (error) {
        throw error
      }
      
      // Update local cache
      this.webhookEndpoints.set(webhookId, updatedWebhook)
      
      console.log(`✅ Webhook ${webhookId} updated successfully`)
      
    } catch (error) {
      console.error('❌ Failed to update webhook:', error)
      throw new Error(`Webhook update failed: ${error.message}`)
    }
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      console.log(`Deleting webhook: ${webhookId}`)
      
      // Delete from database
      const { error } = await this.supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', webhookId)
      
      if (error) {
        throw error
      }
      
      // Remove from local cache
      this.webhookEndpoints.delete(webhookId)
      
      console.log(`✅ Webhook ${webhookId} deleted successfully`)
      
    } catch (error) {
      console.error('❌ Failed to delete webhook:', error)
      throw new Error(`Webhook deletion failed: ${error.message}`)
    }
  }

  /**
   * Get webhook endpoint by ID
   */
  getWebhook(webhookId: string): WebhookEndpoint | null {
    return this.webhookEndpoints.get(webhookId) || null
  }

  /**
   * Get all webhook endpoints for a clinic
   */
  getWebhooksByClinic(clinicId: string): WebhookEndpoint[] {
    return Array.from(this.webhookEndpoints.values())
      .filter(webhook => webhook.clinicId === clinicId)
  }

  /**
   * Get active webhooks for specific event types
   */
  getActiveWebhooksForEvent(eventType: string, clinicId: string): WebhookEndpoint[] {
    return Array.from(this.webhookEndpoints.values())
      .filter(webhook => 
        webhook.isActive &&
        webhook.clinicId === clinicId &&
        webhook.eventTypes.includes(eventType)
      )
  }

  /**
   * Deliver event to webhooks
   */
  async deliverEvent(event: BaseEvent): Promise<string[]> {
    try {
      console.log(`Delivering event ${event.id} (${event.type})`)
      
      const clinicId = event.metadata?.clinicId
      if (!clinicId) {
        throw new Error('Event must have clinicId in metadata')
      }
      
      // Find matching webhooks
      const matchingWebhooks = this.getActiveWebhooksForEvent(event.type, clinicId)
      
      if (matchingWebhooks.length === 0) {
        console.log(`No active webhooks found for event ${event.type} in clinic ${clinicId}`)
        return []
      }
      
      // Create delivery records
      const deliveryIds: string[] = []
      
      for (const webhook of matchingWebhooks) {
        // Apply webhook filters
        if (!this.eventMatchesWebhookFilters(event, webhook)) {
          console.log(`Event ${event.id} filtered out for webhook ${webhook.id}`)
          continue
        }
        
        // Check rate limiting
        if (!this.checkRateLimit(webhook)) {
          console.log(`Rate limit exceeded for webhook ${webhook.id}`)
          continue
        }
        
        const delivery: EventDelivery = {
          id: this.generateDeliveryId(),
          eventId: event.id,
          webhookId: webhook.id,
          url: webhook.url,
          payload: this.preparePayload(event, webhook),
          headers: this.prepareHeaders(event, webhook),
          status: 'pending',
          attempts: 0,
          maxAttempts: webhook.retryStrategy?.maxAttempts || this.config.maxRetries,
          scheduledAt: new Date(),
          createdAt: new Date()
        }
        
        // Add to delivery queue
        this.deliveryQueue.push(delivery)
        deliveryIds.push(delivery.id)
        
        // Store delivery record
        await this.storeDeliveryRecord(delivery)
      }
      
      console.log(`✅ Created ${deliveryIds.length} delivery records for event ${event.id}`)
      return deliveryIds
      
    } catch (error) {
      console.error('❌ Failed to deliver event:', error)
      throw new Error(`Event delivery failed: ${error.message}`)
    }
  }

  /**
   * Test a webhook endpoint
   */
  async testWebhookEndpoint(webhook: WebhookEndpoint): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    try {
      const startTime = Date.now()
      
      const testPayload = {
        type: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          webhookId: webhook.id,
          clinicId: webhook.clinicId
        }
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'NeonPro-Webhook/1.0',
        ...webhook.headers
      }
      
      if (this.config.enableSignatureValidation && webhook.secret) {
        headers['X-Webhook-Signature'] = this.generateSignature(JSON.stringify(testPayload), webhook.secret)
      }
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(webhook.timeoutMs || this.config.defaultTimeout)
      })
      
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        }
      }
      
      return {
        success: true,
        responseTime
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get delivery history for a webhook
   */
  async getDeliveryHistory(webhookId: string, limit: number = 50): Promise<EventDelivery[]> {
    try {
      const { data: deliveries } = await this.supabase
        .from('event_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return deliveries?.map(this.convertDbRecordToDelivery) || []
      
    } catch (error) {
      console.error('❌ Failed to get delivery history:', error)
      return []
    }
  }

  /**
   * Get delivery statistics for a webhook
   */
  async getDeliveryStats(webhookId: string, days: number = 30): Promise<{
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    averageResponseTime: number
    successRate: number
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      const { data: deliveries } = await this.supabase
        .from('event_deliveries')
        .select('status, response_time_ms')
        .eq('webhook_id', webhookId)
        .gte('created_at', startDate.toISOString())
      
      if (!deliveries || deliveries.length === 0) {
        return {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          averageResponseTime: 0,
          successRate: 0
        }
      }
      
      const totalDeliveries = deliveries.length
      const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length
      const failedDeliveries = deliveries.filter(d => d.status === 'failed').length
      
      const responseTimes = deliveries
        .filter(d => d.response_time_ms)
        .map(d => d.response_time_ms)
      
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0
      
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0
      
      return {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        averageResponseTime,
        successRate
      }
      
    } catch (error) {
      console.error('❌ Failed to get delivery stats:', error)
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageResponseTime: 0,
        successRate: 0
      }
    }
  }

  /**
   * Stop the webhook manager
   */
  async stop(): Promise<void> {
    try {
      console.log('Stopping Webhook Manager...')
      
      // Stop delivery processing
      if (this.processingInterval) {
        clearInterval(this.processingInterval)
        this.processingInterval = undefined
      }
      
      // Wait for active deliveries to complete
      while (this.activeDeliveries.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log('✅ Webhook Manager stopped successfully')
      
    } catch (error) {
      console.error('❌ Failed to stop webhook manager:', error)
    }
  }

  // Private Methods

  private generateWebhookId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDeliveryId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async validateWebhook(webhook: WebhookEndpoint): Promise<WebhookValidationResult> {
    const errors: string[] = []
    
    // Validate URL
    try {
      new URL(webhook.url)
    } catch {
      errors.push('Invalid webhook URL')
    }
    
    // Validate event types
    if (!webhook.eventTypes || webhook.eventTypes.length === 0) {
      errors.push('At least one event type must be specified')
    }
    
    // Validate clinic ID
    if (!webhook.clinicId) {
      errors.push('Clinic ID is required')
    }
    
    // Validate timeout
    if (webhook.timeoutMs && (webhook.timeoutMs < 1000 || webhook.timeoutMs > 30000)) {
      errors.push('Timeout must be between 1000ms and 30000ms')
    }
    
    // Validate retry strategy
    if (webhook.retryStrategy) {
      if (webhook.retryStrategy.maxAttempts < 1 || webhook.retryStrategy.maxAttempts > 10) {
        errors.push('Max retry attempts must be between 1 and 10')
      }
      
      if (webhook.retryStrategy.delayMs < 1000 || webhook.retryStrategy.delayMs > 300000) {
        errors.push('Retry delay must be between 1000ms and 300000ms')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async loadWebhookEndpoints(): Promise<void> {
    try {
      const { data: webhooks } = await this.supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('is_active', true)
      
      if (webhooks) {
        webhooks.forEach(webhook => {
          this.webhookEndpoints.set(webhook.id, this.convertDbRecordToWebhook(webhook))
        })
        
        console.log(`✅ Loaded ${webhooks.length} webhook endpoints`)
      }
      
    } catch (error) {
      console.error('❌ Failed to load webhook endpoints:', error)
    }
  }

  private eventMatchesWebhookFilters(event: BaseEvent, webhook: WebhookEndpoint): boolean {
    if (!webhook.filters || webhook.filters.length === 0) {
      return true
    }
    
    // Apply webhook-specific filters
    // This is a simplified implementation - could be expanded
    return webhook.filters.every(filter => {
      const fieldValue = this.getEventFieldValue(event, filter.field)
      return this.evaluateFilterCondition(fieldValue, filter.operator, filter.value)
    })
  }

  private getEventFieldValue(event: BaseEvent, field: string): any {
    const parts = field.split('.')
    let value: any = event
    
    for (const part of parts) {
      value = value?.[part]
      if (value === undefined) break
    }
    
    return value
  }

  private evaluateFilterCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue
      case 'not_equals':
        return fieldValue !== expectedValue
      case 'contains':
        return String(fieldValue).includes(String(expectedValue))
      case 'not_contains':
        return !String(fieldValue).includes(String(expectedValue))
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue)
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue)
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue)
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue)
      default:
        return true
    }
  }

  private checkRateLimit(webhook: WebhookEndpoint): boolean {
    if (!this.config.rateLimiting.enabled || !webhook.rateLimit) {
      return true
    }
    
    const now = Date.now()
    const rateLimiter = this.rateLimiters.get(webhook.id)
    
    if (!rateLimiter || now > rateLimiter.resetTime) {
      // Reset rate limiter
      this.rateLimiters.set(webhook.id, {
        requests: 1,
        resetTime: now + 60000 // 1 minute
      })
      return true
    }
    
    if (rateLimiter.requests >= webhook.rateLimit.requestsPerMinute) {
      return false
    }
    
    rateLimiter.requests++
    return true
  }

  private preparePayload(event: BaseEvent, webhook: WebhookEndpoint): any {
    return {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      data: event.data,
      metadata: event.metadata,
      webhook: {
        id: webhook.id,
        name: webhook.name
      }
    }
  }

  private prepareHeaders(event: BaseEvent, webhook: WebhookEndpoint): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'NeonPro-Webhook/1.0',
      'X-Event-Type': event.type,
      'X-Event-ID': event.id,
      'X-Webhook-ID': webhook.id,
      ...webhook.headers
    }
    
    if (this.config.enableSignatureValidation && webhook.secret) {
      const payload = this.preparePayload(event, webhook)
      headers['X-Webhook-Signature'] = this.generateSignature(JSON.stringify(payload), webhook.secret)
    }
    
    return headers
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  private async storeDeliveryRecord(delivery: EventDelivery): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('event_deliveries')
        .insert({
          id: delivery.id,
          event_id: delivery.eventId,
          webhook_id: delivery.webhookId,
          url: delivery.url,
          payload: delivery.payload,
          headers: delivery.headers,
          status: delivery.status,
          attempts: delivery.attempts,
          max_attempts: delivery.maxAttempts,
          scheduled_at: delivery.scheduledAt.toISOString(),
          created_at: delivery.createdAt.toISOString()
        })
      
      if (error) {
        throw error
      }
      
    } catch (error) {
      console.error('❌ Failed to store delivery record:', error)
    }
  }

  private startDeliveryProcessing(): void {
    this.processingInterval = setInterval(
      () => this.processDeliveryQueue(),
      1000 // Process every second
    )
  }

  private async processDeliveryQueue(): Promise<void> {
    if (this.deliveryQueue.length === 0) {
      return
    }
    
    // Limit concurrent deliveries
    const availableSlots = this.config.maxConcurrentDeliveries - this.activeDeliveries.size
    if (availableSlots <= 0) {
      return
    }
    
    // Get deliveries ready for processing
    const readyDeliveries = this.deliveryQueue
      .filter(delivery => 
        delivery.status === 'pending' &&
        delivery.scheduledAt <= new Date() &&
        !this.activeDeliveries.has(delivery.id)
      )
      .slice(0, availableSlots)
    
    // Process deliveries
    await Promise.all(
      readyDeliveries.map(delivery => this.processDelivery(delivery))
    )
  }

  private async processDelivery(delivery: EventDelivery): Promise<void> {
    this.activeDeliveries.add(delivery.id)
    
    try {
      delivery.status = 'delivering'
      delivery.attempts++
      delivery.lastAttemptAt = new Date()
      
      const startTime = Date.now()
      
      const response = await fetch(delivery.url, {
        method: 'POST',
        headers: delivery.headers,
        body: JSON.stringify(delivery.payload),
        signal: AbortSignal.timeout(this.config.defaultTimeout)
      })
      
      const responseTime = Date.now() - startTime
      delivery.responseTimeMs = responseTime
      
      if (response.ok) {
        delivery.status = 'delivered'
        delivery.deliveredAt = new Date()
        delivery.httpStatus = response.status
        
        // Remove from queue
        this.removeFromQueue(delivery.id)
        
        console.log(`✅ Delivery ${delivery.id} successful (${responseTime}ms)`)
        
      } else {
        delivery.httpStatus = response.status
        delivery.error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: await response.text().catch(() => 'No response body')
        }
        
        await this.handleDeliveryFailure(delivery)
      }
      
    } catch (error) {
      delivery.error = {
        message: error.message,
        details: error
      }
      
      await this.handleDeliveryFailure(delivery)
      
    } finally {
      // Update delivery record
      await this.updateDeliveryRecord(delivery)
      
      this.activeDeliveries.delete(delivery.id)
    }
  }

  private async handleDeliveryFailure(delivery: EventDelivery): Promise<void> {
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'failed'
      delivery.failedAt = new Date()
      
      // Remove from queue
      this.removeFromQueue(delivery.id)
      
      console.error(`❌ Delivery ${delivery.id} failed permanently after ${delivery.attempts} attempts`)
      
    } else {
      delivery.status = 'pending'
      
      // Calculate next retry time
      const webhook = this.webhookEndpoints.get(delivery.webhookId)
      const retryStrategy = webhook?.retryStrategy
      
      let delayMs = this.config.retryDelayMs
      
      if (retryStrategy) {
        switch (retryStrategy.strategy) {
          case 'exponential':
            delayMs = retryStrategy.delayMs * Math.pow(2, delivery.attempts - 1)
            break
          case 'linear':
            delayMs = retryStrategy.delayMs * delivery.attempts
            break
          case 'fixed':
          default:
            delayMs = retryStrategy.delayMs
            break
        }
      }
      
      delivery.scheduledAt = new Date(Date.now() + delayMs)
      
      console.log(`⏳ Delivery ${delivery.id} scheduled for retry in ${delayMs}ms (attempt ${delivery.attempts}/${delivery.maxAttempts})`)
    }
  }

  private removeFromQueue(deliveryId: string): void {
    const index = this.deliveryQueue.findIndex(d => d.id === deliveryId)
    if (index !== -1) {
      this.deliveryQueue.splice(index, 1)
    }
  }

  private async updateDeliveryRecord(delivery: EventDelivery): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('event_deliveries')
        .update({
          status: delivery.status,
          attempts: delivery.attempts,
          last_attempt_at: delivery.lastAttemptAt?.toISOString(),
          delivered_at: delivery.deliveredAt?.toISOString(),
          failed_at: delivery.failedAt?.toISOString(),
          http_status: delivery.httpStatus,
          response_time_ms: delivery.responseTimeMs,
          error: delivery.error,
          scheduled_at: delivery.scheduledAt.toISOString()
        })
        .eq('id', delivery.id)
      
      if (error) {
        throw error
      }
      
    } catch (error) {
      console.error('❌ Failed to update delivery record:', error)
    }
  }

  private convertDbRecordToWebhook(record: any): WebhookEndpoint {
    return {
      id: record.id,
      name: record.name,
      url: record.url,
      clinicId: record.clinic_id,
      eventTypes: record.event_types,
      isActive: record.is_active,
      secret: record.secret,
      headers: record.headers || {},
      timeoutMs: record.timeout_ms,
      retryStrategy: record.retry_strategy,
      rateLimit: record.rate_limit,
      filters: record.filters || [],
      testOnRegistration: record.test_on_registration,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    }
  }

  private convertDbRecordToDelivery(record: any): EventDelivery {
    return {
      id: record.id,
      eventId: record.event_id,
      webhookId: record.webhook_id,
      url: record.url,
      payload: record.payload,
      headers: record.headers,
      status: record.status,
      attempts: record.attempts,
      maxAttempts: record.max_attempts,
      scheduledAt: new Date(record.scheduled_at),
      lastAttemptAt: record.last_attempt_at ? new Date(record.last_attempt_at) : undefined,
      deliveredAt: record.delivered_at ? new Date(record.delivered_at) : undefined,
      failedAt: record.failed_at ? new Date(record.failed_at) : undefined,
      httpStatus: record.http_status,
      responseTimeMs: record.response_time_ms,
      error: record.error,
      createdAt: new Date(record.created_at)
    }
  }
}

export default WebhookManager
