/**
 * AG-UI Protocol WebSocket Server for Healthcare Agent Communication
 * Handles real-time communication between CopilotKit frontend and healthcare agents
 * LGPD-compliant with healthcare data protection standards
 */

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'
import { HealthcareAgent } from '../agent/healthcare-agent'
import { SecurityManager } from '../security/security-manager'
import { HealthcareLogger } from '../logging/healthcare-logger'
import type { 
  AgentMessage, 
  ClientMessage, 
  SessionData, 
  ConnectionContext,
  QueryPermissions 
} from '../types'

interface ActiveSession {
  id: string
  userId: string
  clinicId: string
  permissions: QueryPermissions
  connectionTime: Date
  lastActivity: Date
  websocket: WebSocket
  context: ConnectionContext
}

/**
 * AG-UI WebSocket Server for healthcare agent communication
 * Implements CopilotKit protocol with healthcare compliance
 */
export class AguiServer {
  private wss: WebSocketServer | null = null
  private activeSessions = new Map<string, ActiveSession>()
  private healthcareAgent: HealthcareAgent
  private securityManager: SecurityManager
  private logger: HealthcareLogger
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(
    healthcareAgent: HealthcareAgent,
    securityManager: SecurityManager,
    logger: HealthcareLogger
  ) {
    this.healthcareAgent = healthcareAgent
    this.securityManager = securityManager
    this.logger = logger
  }

  /**
   * Initialize WebSocket server with healthcare security
   */
  public async initialize(port: number = 8081): Promise<void> {
    try {
      this.wss = new WebSocketServer({
        port,
        verifyClient: (info) => this.verifyClient(info),
        perMessageDeflate: true,
        maxPayload: 1024 * 1024, // 1MB limit for healthcare data
      })

      this.wss.on('connection', (ws, request) => {
        this.handleConnection(ws, request)
      })

      this.wss.on('error', (error) => {
        this.logger.error('AG-UI server error', error, {
          component: 'agui-server',
          serverPort: port
        })
      })

      // Start heartbeat monitoring
      this.startHeartbeatMonitoring()

      this.logger.info('AG-UI server initialized successfully', {
        component: 'agui-server',
        port,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.logger.error('Failed to initialize AG-UI server', error, {
        component: 'agui-server',
        port
      })
      throw error
    }
  }

  /**
   * Verify client connection with security validation
   */
  private async verifyClient(info: {
    origin: string
    secure: boolean
    req: IncomingMessage
  }): Promise<boolean> {
    try {
      // Extract authentication from headers
      const token = info.req.headers.authorization?.replace('Bearer ', '')
      const userId = info.req.headers['x-user-id'] as string
      const clinicId = info.req.headers['x-clinic-id'] as string

      if (!token || !userId || !clinicId) {
        this.logger.warn('AG-UI connection rejected - missing auth', {
          component: 'agui-server',
          origin: info.origin,
          hasToken: !!token,
          hasUserId: !!userId,
          hasClinicId: !!clinicId
        })
        return false
      }

      // Validate with security manager
      const isValid = await this.securityManager.validateConnection({
        token,
        userId,
        clinicId,
        origin: info.origin,
        userAgent: info.req.headers['user-agent'] || 'unknown'
      })

      if (!isValid) {
        this.logger.warn('AG-UI connection rejected - security validation failed', {
          component: 'agui-server',
          userId,
          clinicId,
          origin: info.origin
        })
        return false
      }

      return true

    } catch (error) {
      this.logger.error('Error verifying AG-UI client', error, {
        component: 'agui-server',
        origin: info.origin
      })
      return false
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: WebSocket, request: IncomingMessage): Promise<void> {
    const sessionId = uuidv4()
    const userId = request.headers['x-user-id'] as string
    const clinicId = request.headers['x-clinic-id'] as string

    try {
      // Get user permissions
      const permissions = await this.securityManager.getUserPermissions(userId, clinicId)

      // Create session
      const session: ActiveSession = {
        id: sessionId,
        userId,
        clinicId,
        permissions,
        connectionTime: new Date(),
        lastActivity: new Date(),
        websocket: ws,
        context: {
          userAgent: request.headers['user-agent'] || 'unknown',
          ipAddress: this.getClientIP(request),
          sessionId
        }
      }

      this.activeSessions.set(sessionId, session)

      // Setup WebSocket handlers
      ws.on('message', (data) => this.handleMessage(sessionId, data))
      ws.on('close', () => this.handleDisconnection(sessionId))
      ws.on('error', (error) => this.handleConnectionError(sessionId, error))
      ws.on('pong', () => this.handlePong(sessionId))

      // Send welcome message
      await this.sendMessage(sessionId, {
        type: 'connection_established',
        sessionId,
        timestamp: new Date().toISOString(),
        capabilities: ['healthcare_queries', 'patient_data', 'appointment_management'],
        security: {
          lgpdCompliant: true,
          encryptionEnabled: true,
          auditingEnabled: true
        }
      })

      this.logger.info('AG-UI client connected', {
        component: 'agui-server',
        sessionId,
        userId,
        clinicId,
        permissions: Object.keys(permissions)
      })

    } catch (error) {
      this.logger.error('Error handling AG-UI connection', error, {
        component: 'agui-server',
        sessionId,
        userId,
        clinicId
      })
      
      ws.close(1011, 'Internal server error')
    }
  }

  /**
   * Handle incoming message from client
   */
  private async handleMessage(sessionId: string, data: Buffer): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      this.logger.warn('Message from unknown session', {
        component: 'agui-server',
        sessionId
      })
      return
    }

    try {
      // Update activity timestamp
      session.lastActivity = new Date()

      // Parse message
      const message: ClientMessage = JSON.parse(data.toString())

      // Validate message with security manager
      const isValid = await this.securityManager.validateMessage(message, session.permissions)
      if (!isValid) {
        await this.sendError(sessionId, 'Invalid message or insufficient permissions')
        return
      }

      // Log healthcare data access
      await this.logger.logDataAccess(session.userId, session.clinicId, {
        action: 'agent_query',
        query: message.query || 'unknown',
        sessionId,
        timestamp: new Date()
      })

      // Process message based on type
      switch (message.type) {
        case 'healthcare_query':
          await this.handleHealthcareQuery(sessionId, message)
          break

        case 'ping':
          await this.sendMessage(sessionId, { type: 'pong', timestamp: new Date().toISOString() })
          break

        default:
          await this.sendError(sessionId, `Unknown message type: ${message.type}`)
      }

    } catch (error) {
      this.logger.error('Error processing AG-UI message', error, {
        component: 'agui-server',
        sessionId,
        userId: session.userId
      })

      await this.sendError(sessionId, 'Error processing message')
    }
  }

  /**
   * Handle healthcare query from client
   */
  private async handleHealthcareQuery(sessionId: string, message: ClientMessage): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) return

    try {
      // Send typing indicator
      await this.sendMessage(sessionId, {
        type: 'agent_typing',
        timestamp: new Date().toISOString()
      })

      // Process query with healthcare agent
      const response = await this.healthcareAgent.processQuery(
        {
          query: message.query || '',
          parameters: message.parameters || {},
          context: session.context
        },
        session.permissions
      )

      // Send response to client
      await this.sendMessage(sessionId, {
        type: 'agent_response',
        queryId: message.queryId,
        response,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.logger.error('Error processing healthcare query', error, {
        component: 'agui-server',
        sessionId,
        userId: session.userId,
        query: message.query
      })

      await this.sendError(sessionId, 'Error processing healthcare query')
    }
  }

  /**
   * Send message to client
   */
  private async sendMessage(sessionId: string, message: AgentMessage): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session || session.websocket.readyState !== WebSocket.OPEN) {
      return
    }

    try {
      const messageData = JSON.stringify(message)
      session.websocket.send(messageData)

    } catch (error) {
      this.logger.error('Error sending message to AG-UI client', error, {
        component: 'agui-server',
        sessionId,
        messageType: message.type
      })
    }
  }

  /**
   * Send error message to client
   */
  private async sendError(sessionId: string, errorMessage: string): Promise<void> {
    await this.sendMessage(sessionId, {
      type: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(sessionId: string): void {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      this.logger.info('AG-UI client disconnected', {
        component: 'agui-server',
        sessionId,
        userId: session.userId,
        clinicId: session.clinicId,
        duration: Date.now() - session.connectionTime.getTime()
      })

      this.activeSessions.delete(sessionId)
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(sessionId: string, error: Error): void {
    this.logger.error('AG-UI connection error', error, {
      component: 'agui-server',
      sessionId
    })
  }

  /**
   * Handle pong response
   */
  private handlePong(sessionId: string): void {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 30000 // 30 seconds

      for (const [sessionId, session] of this.activeSessions) {
        if (now - session.lastActivity.getTime() > timeout) {
          this.logger.warn('AG-UI session timeout', {
            component: 'agui-server',
            sessionId,
            userId: session.userId,
            lastActivity: session.lastActivity
          })

          session.websocket.terminate()
          this.activeSessions.delete(sessionId)
        } else {
          // Send ping
          if (session.websocket.readyState === WebSocket.OPEN) {
            session.websocket.ping()
          }
        }
      }
    }, 15000) // Check every 15 seconds
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: IncomingMessage): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.headers['x-real-ip'] as string ||
      request.socket.remoteAddress ||
      'unknown'
    )
  }

  /**
   * Get server statistics
   */
  public getStats() {
    return {
      activeConnections: this.activeSessions.size,
      connections: Array.from(this.activeSessions.values()).map(session => ({
        sessionId: session.id,
        userId: session.userId,
        clinicId: session.clinicId,
        connectionTime: session.connectionTime,
        lastActivity: session.lastActivity
      }))
    }
  }

  /**
   * Shutdown server gracefully
   */
  public async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    if (this.wss) {
      // Close all connections
      for (const session of this.activeSessions.values()) {
        session.websocket.close(1001, 'Server shutdown')
      }

      this.wss.close()
    }

    this.activeSessions.clear()

    this.logger.info('AG-UI server shutdown completed', {
      component: 'agui-server'
    })
  }
}