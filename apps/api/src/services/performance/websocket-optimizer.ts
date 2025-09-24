/**
 * WebSocket Performance Optimizer for Aesthetic Clinic Features
 * Real-time communication optimization and connection pooling
 */

import { EventEmitter } from 'events'
import { Server as WebSocketServer } from 'ws'
import { AestheticClinicPerformanceOptimizer } from './aesthetic-clinic-performance-optimizer'
// import { ErrorMapper } from "@neonpro/shared/errors";

export interface WebSocketConnection {
  id: string
  userId: string
  clientId?: string
  socket: any
  connectedAt: Date
  lastActivity: Date
  isActive: boolean
  subscriptions: Set<string>
  messageCount: number
  bytesSent: number
  bytesReceived: number
}

export interface WebSocketMetrics {
  totalConnections: number
  activeConnections: number
  totalMessages: number
  averageLatency: number
  messageRate: number
  connectionDuration: {
    average: number
    min: number
    max: number
  }
  throughput: {
    messagesPerSecond: number
    bytesPerSecond: number
  }
  errors: {
    connectionErrors: number
    messageErrors: number
    disconnections: number
  }
}

export interface WebSocketConfig {
  maxConnections: number
  maxMessageSize: number
  heartbeatInterval: number
  connectionTimeout: number
  pingTimeout: number
  enableCompression: boolean
  enableMessageQueueing: boolean
  maxQueueSize: number
  enableConnectionPooling: boolean
  poolSize: number
}

/**
 * WebSocket Performance Optimizer for real-time aesthetic clinic features
 */
export class WebSocketOptimizer extends EventEmitter {
  private connections: Map<string, WebSocketConnection> = new Map()
  private connectionPool: WebSocketConnection[] = []
  private metrics: WebSocketMetrics
  private messageQueue: Map<string, any[]> = new Map()
  private config: WebSocketConfig
  private optimizer: AestheticClinicPerformanceOptimizer
  private heartbeatInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout

  constructor(
    optimizer: AestheticClinicPerformanceOptimizer,
    config: Partial<WebSocketConfig> = {},
  ) {
    super()

    this.optimizer = optimizer

    this.config = {
      maxConnections: 1000,
      maxMessageSize: 1024 * 1024, // 1MB
      heartbeatInterval: 30000, // 30 seconds
      connectionTimeout: 60000, // 1 minute
      pingTimeout: 5000, // 5 seconds
      enableCompression: true,
      enableMessageQueueing: true,
      maxQueueSize: 1000,
      enableConnectionPooling: true,
      poolSize: 10,
      ...config,
    }

    this.metrics = this.initializeMetrics()

    this.startMaintenanceTasks()
  }

  /**
   * Initialize WebSocket server with optimization
   */
  initializeServer(server: any): WebSocketServer {
    const wss = new WebSocketServer({
      server,
      maxPayload: this.config.maxMessageSize,
    })

    wss.on('connection', (socket, request) => {
      this.handleConnection(socket, request)
    })

    wss.on('error', (error) => {
      this.metrics.errors.connectionErrors++
      this.emit('error', error)
    })

    return wss
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(socket: any, request: any): void {
    const connectionId = this.generateConnectionId()
    const userId = this.extractUserId(request)
    const clientId = this.extractClientId(request)

    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      clientId,
      socket,
      connectedAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      subscriptions: new Set(),
      messageCount: 0,
      bytesSent: 0,
      bytesReceived: 0,
    }

    // Add to connections
    this.connections.set(connectionId, connection)

    // Add to connection pool if enabled
    if (this.config.enableConnectionPooling) {
      this.addToConnectionPool(connection)
    }

    this.metrics.totalConnections++
    this.metrics.activeConnections++

    // Set up socket event handlers
    this.setupSocketHandlers(connection)

    // Send welcome message
    this.sendToConnection(connection, {
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString(),
    })

    this.emit('connection', connection)

    console.log(`[WebSocket] Connection established: ${connectionId} for user ${userId}`)
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketHandlers(connection: WebSocketConnection): void {
    const { socket } = connection

    socket.on('message', async (data: any) => {
      try {
        await this.handleMessage(connection, data)
      } catch {
        this.metrics.errors.messageErrors++
        this.emit('messageError', { connection, error })
      }
    })

    socket.on('close', () => {
      this.handleDisconnection(connection)
    })

    socket.on('error', (error: Error) => {
      this.metrics.errors.messageErrors++
      this.emit('connectionError', { connection, error })
    })

    socket.on('pong', () => {
      connection.lastActivity = new Date()
    })
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(connection: WebSocketConnection, data: any): Promise<void> {
    const startTime = performance.now()

    connection.lastActivity = new Date()
    connection.messageCount++
    connection.bytesReceived += Buffer.byteLength(data, 'utf8')

    try {
      const message = JSON.parse(data.toString())

      // Validate message
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format')
      }

      // Process message based on type
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscription(connection, message)
          break

        case 'unsubscribe':
          await this.handleUnsubscription(connection, message)
          break

        case 'client_update':
          await this.handleClientUpdate(connection, message)
          break

        case 'treatment_update':
          await this.handleTreatmentUpdate(connection, message)
          break

        case 'photo_update':
          await this.handlePhotoUpdate(connection, message)
          break

        case 'analytics_request':
          await this.handleAnalyticsRequest(connection, message)
          break

        case 'ping':
          this.sendToConnection(connection, {
            type: 'pong',
            timestamp: new Date().toISOString(),
          })
          break

        default:
          console.warn(`[WebSocket] Unknown message type: ${message.type}`)
      }

      const duration = performance.now() - startTime
      this.updateLatencyMetrics(duration)
    } catch {
      this.metrics.errors.messageErrors++

      this.sendToConnection(connection, {
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString(),
      })

      throw error
    }
  }

  /**
   * Handle client subscription
   */
  private async handleSubscription(connection: WebSocketConnection, message: any): Promise<void> {
    const { channels } = message

    if (!Array.isArray(channels)) {
      throw new Error('Channels must be an array')
    }

    for (const channel of channels) {
      if (this.validateChannel(channel, connection)) {
        connection.subscriptions.add(channel)
        this.emit('subscribe', { connection, channel })
      }
    }

    this.sendToConnection(connection, {
      type: 'subscription_confirmed',
      channels,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle client unsubscription
   */
  private handleUnsubscription(connection: WebSocketConnection, message: any): void {
    const { channels } = message

    if (!Array.isArray(channels)) {
      throw new Error('Channels must be an array')
    }

    for (const channel of channels) {
      connection.subscriptions.delete(channel)
      this.emit('unsubscribe', { connection, channel })
    }

    this.sendToConnection(connection, {
      type: 'unsubscription_confirmed',
      channels,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle client update request
   */
  private async handleClientUpdate(connection: WebSocketConnection, message: any): Promise<void> {
    const { clientId } = message

    if (!clientId || !connection.clientId) {
      throw new Error('Invalid client ID')
    }

    // Check permission
    if (connection.clientId !== clientId) {
      throw new Error('Permission denied')
    }

    // Get optimized client data
    const clientData = await this.optimizer.getOptimizedClientProfile(clientId, {
      includeTreatments: true,
      includePhotos: true,
    })

    this.sendToConnection(connection, {
      type: 'client_data',
      data: clientData,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle treatment update request
   */
  private async handleTreatmentUpdate(
    connection: WebSocketConnection,
    message: any,
  ): Promise<void> {
    const { treatmentId, clientId } = message

    if (!treatmentId || !clientId) {
      throw new Error('Invalid treatment ID or client ID')
    }

    // Check permission
    if (connection.clientId !== clientId) {
      throw new Error('Permission denied')
    }

    // Get updated treatment data
    const treatmentData = await this.optimizer.getOptimizedClientProfile(clientId, {
      includeTreatments: true,
    })

    this.sendToConnection(connection, {
      type: 'treatment_data',
      data: treatmentData,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle photo update request
   */
  private async handlePhotoUpdate(connection: WebSocketConnection, message: any): Promise<void> {
    const { clientId, treatmentType } = message

    if (!clientId) {
      throw new Error('Invalid client ID')
    }

    // Check permission
    if (connection.clientId !== clientId) {
      throw new Error('Permission denied')
    }

    // Get optimized photo data
    const photos = await this.optimizer.getOptimizedBeforeAfterPhotos(clientId, {
      treatmentType,
      includeThumbnails: true,
    })

    this.sendToConnection(connection, {
      type: 'photo_data',
      data: photos,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle analytics request
   */
  private async handleAnalyticsRequest(
    connection: WebSocketConnection,
    message: any,
  ): Promise<void> {
    const { dateRange } = message

    // Get analytics data
    const analytics = await this.optimizer.getOptimizedClinicAnalytics({
      dateRange,
      includeRealtime: true,
    })

    this.sendToConnection(connection, {
      type: 'analytics_data',
      data: analytics,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(connection: WebSocketConnection): void {
    const duration = Date.now() - connection.connectedAt.getTime()

    connection.isActive = false
    this.connections.delete(connection.id)
    this.metrics.activeConnections--
    this.metrics.errors.disconnections++

    // Remove from connection pool
    this.removeFromConnectionPool(connection)

    // Process queued messages
    this.processQueuedMessages(connection.id)

    // Update connection duration metrics
    this.updateConnectionDurationMetrics(duration)

    this.emit('disconnection', connection)

    console.log(`[WebSocket] Connection closed: ${connection.id}`)
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connection: WebSocketConnection, message: any): boolean {
    if (!connection.isActive) {
      return false
    }

    try {
      const messageStr = JSON.stringify(message)
      const messageSize = Buffer.byteLength(messageStr, 'utf8')

      // Check message size
      if (messageSize > this.config.maxMessageSize) {
        throw new Error('Message too large')
      }

      // Apply compression if enabled
      const finalMessage = this.config.enableCompression
        ? this.compressMessage(messageStr)
        : messageStr

      connection.socket.send(finalMessage)
      connection.bytesSent += messageSize
      connection.messageCount++

      this.metrics.totalMessages++
      this.updateThroughputMetrics(messageSize)

      return true
    } catch {
      this.metrics.errors.messageErrors++
      console.error(`[WebSocket] Error sending message to ${connection.id}:`, error)
      return false
    }
  }

  /**
   * Broadcast message to multiple connections
   */
  broadcast(message: any, filter?: (connection: WebSocketConnection) => boolean): number {
    let sentCount = 0

    for (const connection of this.connections.values()) {
      if (!connection.isActive) continue

      if (!filter || filter(connection)) {
        if (this.sendToConnection(connection, message)) {
          sentCount++
        }
      }
    }

    return sentCount
  }

  /**
   * Send message to specific channel subscribers
   */
  sendToChannel(channel: string, message: any): number {
    return this.broadcast(message, (connection) => connection.subscriptions.has(channel))
  }

  /**
   * Queue message for offline connections
   */
  queueMessage(connectionId: string, message: any): void {
    if (!this.config.enableMessageQueueing) return

    const queue = this.messageQueue.get(connectionId) || []

    if (queue.length >= this.config.maxQueueSize) {
      // Remove oldest message
      queue.shift()
    }

    queue.push({
      message,
      timestamp: new Date().toISOString(),
    })

    this.messageQueue.set(connectionId, queue)
  }

  /**
   * Process queued messages for connection
   */
  private processQueuedMessages(connectionId: string): void {
    const queue = this.messageQueue.get(connectionId)
    if (!queue || queue.length === 0) return

    const connection = this.connections.get(connectionId)
    if (!connection || !connection.isActive) return

    // Send queued messages
    for (const { message } of queue) {
      this.sendToConnection(connection, message)
    }

    // Clear queue
    this.messageQueue.delete(connectionId)
  }

  /**
   * Connection pool management
   */
  private addToConnectionPool(connection: WebSocketConnection): void {
    if (this.connectionPool.length < this.config.poolSize) {
      this.connectionPool.push(connection)
    }
  }

  private removeFromConnectionPool(connection: WebSocketConnection): void {
    const index = this.connectionPool.indexOf(connection)
    if (index > -1) {
      this.connectionPool.splice(index, 1)
    }
  }

  /**
   * Maintenance tasks
   */
  private startMaintenanceTasks(): void {
    // Heartbeat/ping
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)

    // Cleanup inactive connections
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections()
    }, this.config.connectionTimeout)

    // Metrics aggregation
    setInterval(() => {
      this.aggregateMetrics()
    }, 60000) // Every minute
  }

  /**
   * Send heartbeat to all connections
   */
  private sendHeartbeat(): void {
    const _now = Date.now()

    for (const connection of this.connections.values()) {
      if (!connection.isActive) continue

      // Check if connection is stale
      if (now - connection.lastActivity.getTime() > this.config.pingTimeout) {
        connection.socket.terminate()
        continue
      }

      // Send ping
      connection.socket.ping()
    }
  }

  /**
   * Clean up inactive connections
   */
  private cleanupInactiveConnections(): void {
    const _now = Date.now()
    const timeout = this.config.connectionTimeout

    for (const connection of this.connections.values()) {
      if (!connection.isActive) continue

      if (now - connection.lastActivity.getTime() > timeout) {
        connection.socket.terminate()
      }
    }
  }

  /**
   * Utility methods
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private extractUserId(request: any): string {
    // Extract user ID from request (implementation depends on auth system)
    return request.user?.id || 'anonymous'
  }

  private extractClientId(request: any): string | undefined {
    // Extract client ID from request
    return request.query?.clientId || request.headers?.['x-client-id']
  }

  private validateMessage(message: any): boolean {
    return (
      message
      && typeof message === 'object'
      && message.type
      && typeof message.type === 'string'
    )
  }

  private validateChannel(channel: string, connection: WebSocketConnection): boolean {
    // Validate channel permissions based on user role and client ID
    const allowedChannels = [
      `client_${connection.clientId}`,
      `user_${connection.userId}`,
      'clinic_updates',
      'system_notifications',
    ]

    return allowedChannels.includes(channel)
  }

  private compressMessage(message: string): string {
    // Simple compression (in production, use a proper compression library)
    return message
  }

  /**
   * Metrics management
   */
  private initializeMetrics(): WebSocketMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      averageLatency: 0,
      messageRate: 0,
      connectionDuration: {
        average: 0,
        min: 0,
        max: 0,
      },
      throughput: {
        messagesPerSecond: 0,
        bytesPerSecond: 0,
      },
      errors: {
        connectionErrors: 0,
        messageErrors: 0,
        disconnections: 0,
      },
    }
  }

  private updateLatencyMetrics(latency: number): void {
    // Update rolling average latency
    const alpha = 0.1 // Smoothing factor
    this.metrics.averageLatency = (1 - alpha) * this.metrics.averageLatency + alpha * latency
  }

  private updateThroughputMetrics(bytesSent: number): void {
    // Update throughput metrics
    const _now = Date.now()
    this.metrics.throughput.messagesPerSecond++
    this.metrics.throughput.bytesPerSecond += bytesSent
  }

  private updateConnectionDurationMetrics(duration: number): void {
    const { connectionDuration } = this.metrics

    if (connectionDuration.min === 0 || duration < connectionDuration.min) {
      connectionDuration.min = duration
    }

    if (duration > connectionDuration.max) {
      connectionDuration.max = duration
    }

    // Update rolling average
    connectionDuration.average = (connectionDuration.average + duration) / 2
  }

  private aggregateMetrics(): void {
    // Reset per-second metrics
    this.metrics.throughput.messagesPerSecond = 0
    this.metrics.throughput.bytesPerSecond = 0

    // Calculate message rate
    const _now = Date.now()
    this.metrics.messageRate = this.metrics.totalMessages / (now / 1000)
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebSocketMetrics {
    return { ...this.metrics }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number
    activeConnections: number
    averageSubscriptions: number
    topChannels: Array<{ channel: string; subscribers: number }>
  } {
    const activeConnections = Array.from(this.connections.values()).filter((c) => c.isActive)

    const channelCounts = new Map<string, number>()
    let totalSubscriptions = 0

    for (const connection of activeConnections) {
      totalSubscriptions += connection.subscriptions.size

      for (const channel of connection.subscriptions) {
        channelCounts.set(channel, (channelCounts.get(channel) || 0) + 1)
      }
    }

    const topChannels = Array.from(channelCounts.entries())
      .map(([channel, subscribers]) => ({ channel, subscribers }))
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 10)

    return {
      totalConnections: this.connections.size,
      activeConnections: activeConnections.length,
      averageSubscriptions: activeConnections.length > 0
        ? totalSubscriptions / activeConnections.length
        : 0,
      topChannels,
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.socket.terminate()
    }

    this.connections.clear()
    this.connectionPool = []
    this.messageQueue.clear()
  }
}

// Factory function
export const createWebSocketOptimizer = (
  optimizer: AestheticClinicPerformanceOptimizer,
  config?: Partial<WebSocketConfig>,
) => {
  return new WebSocketOptimizer(optimizer, config)
}

export default WebSocketOptimizer
