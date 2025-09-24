/**
 * WebSocket Server Middleware
 *
 * Integrates the AG-UI Protocol WebSocket server with the Express application.
 * Handles real-time agent communication with proper authentication and rate limiting.
 */

import { Server as HttpServer } from 'http'
import { Server as WebSocketServer } from 'ws'
import { AguiService, createAguiService } from '../services/agui-protocol'
import { logger } from '../utils/secure-logger'

export interface WebSocketServerConfig {
  port: number
  path: string
  ragAgentEndpoint: string
  jwtSecret: string
  enableMetrics?: boolean
  maxConnections?: number
}

export class WebSocketServerMiddleware {
  private wss: WebSocketServer
  private aguiService: AguiService
  private config: WebSocketServerConfig
  private isInitialized = false

  constructor(config: WebSocketServerConfig) {
    this.config = config
    this.aguiService = createAguiService({
      ragAgentEndpoint: config.ragAgentEndpoint,
      jwtSecret: config.jwtSecret,
      enableMetrics: config.enableMetrics,
    })

    // Create WebSocket server
    this.wss = new WebSocketServer({
      noServer: true,
      maxPayload: 1024 * 1024, // 1MB max payload
    })

    this.setupEventHandlers()
  }

  /**
   * Initialize the WebSocket server
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      await this.aguiService.initialize()

      this.isInitialized = true
      logger.info('WebSocket server middleware initialized', {
        port: this.config.port,
        path: this.config.path,
      })
    } catch {
      logger.error('Failed to initialize WebSocket server middleware', {
        error,
      })
      throw error
    }
  }

  /**
   * Attach to HTTP server for upgrade handling
   */
  attachToServer(server: HttpServer): void {
    server.on('upgrade', (request, socket, head) => {
      this.handleUpgrade(request, socket, head)
    })

    logger.info('WebSocket server attached to HTTP server', {
      path: this.config.path,
    })
  }

  /**
   * Handle WebSocket upgrade requests
   */
  private handleUpgrade(_request: any, socket: any, head: Buffer): void {
    const pathname = new URL(request.url, `http://${request.headers.host}`)
      .pathname

    // Check if the request matches our WebSocket path
    if (pathname === this.config.path) {
      // Check connection limit
      if (
        this.config.maxConnections
        && this.wss.clients.size >= this.config.maxConnections
      ) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n')
        socket.destroy()
        return
      }

      // Handle the upgrade
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, _request)
      })
    } else {
      // Path not found
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
      socket.destroy()
    }
  }

  /**
   * Setup WebSocket server event handlers
   */
  private setupEventHandlers(): void {
    // Handle new connections
    this.wss.on('connection', (ws, _request) => {
      this.aguiService.getProtocolInstance().handleConnection(ws, _request)
    })

    // Handle server errors
    this.wss.on('error', (error) => {
      logger.error('WebSocket server error', { error })
    })

    // Handle server close
    this.wss.on('close', () => {
      logger.info('WebSocket server closed')
    })

    // Setup AGUI service event handlers
    this.setupServiceEventHandlers()
  }

  /**
   * Setup AGUI service event handlers
   */
  private setupServiceEventHandlers(): void {
    // Service lifecycle events
    this.aguiService.on('initialized', () => {
      logger.info('AGUI service initialized')
    })

    this.aguiService.on('initializationError', (error) => {
      logger.error('AGUI service initialization error', { error })
    })

    this.aguiService.on('shuttingDown', () => {
      logger.info('AGUI service shutting down')
    })

    this.aguiService.on('shutdown', () => {
      logger.info('AGUI service shutdown completed')
    })

    // Query events
    this.aguiService.on('queryCompleted', (data) => {
      logger.debug('Query completed', data)
    })

    this.aguiService.on('queryError', (data) => {
      logger.warn('Query error', data)
    })

    this.aguiService.on('queryAborted', (data) => {
      logger.info('Query aborted', data)
    })

    // Session events
    this.aguiService.on('sessionCreated', (session) => {
      logger.debug('Session created', {
        sessionId: session.id,
        _userId: session.userId,
      })
    })

    this.aguiService.on('sessionUpdated', (data) => {
      logger.debug('Session updated', data)
    })

    this.aguiService.on('sessionError', (data) => {
      logger.warn('Session error', data)
    })

    // Feedback events
    this.aguiService.on('feedbackSubmitted', (feedback) => {
      logger.debug('Feedback submitted', feedback)
    })

    this.aguiService.on('feedbackError', (data) => {
      logger.warn('Feedback error', data)
    })

    // Metrics events
    if (this.config.enableMetrics) {
      this.aguiService.on('metrics', (metrics) => {
        logger.debug('Service metrics', metrics)
      })
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const aguiHealth = await this.aguiService.getHealthStatus()
      const serverStats = {
        connectedClients: this.wss.clients.size,
        isInitialized: this.isInitialized,
        uptime: process.uptime(),
      }

      return {
        websocketServer: serverStats,
        aguiService: aguiHealth,
        overall: aguiHealth.status === 'healthy' && this.isInitialized
          ? 'healthy'
          : 'degraded',
      }
    } catch {
      logger.error('Failed to get health status', { error })
      return {
        websocketServer: {
          connectedClients: this.wss.clients.size,
          isInitialized: this.isInitialized,
        },
        aguiService: { status: 'unhealthy', error: error.message },
        overall: 'unhealthy',
      }
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(): any {
    const serverMetrics = {
      connectedClients: this.wss.clients.size,
      maxConnections: this.config.maxConnections,
      connectionUtilization: this.config.maxConnections
        ? (this.wss.clients.size / this.config.maxConnections) * 100
        : 0,
    }

    const serviceMetrics = this.aguiService.getMetrics()

    return {
      server: serverMetrics,
      _service: serviceMetrics,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.wss.clients.size
  }

  /**
   * Close all connections and shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket server middleware')

    try {
      // Close all client connections
      this.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.close(1001, 'Server shutting down')
        }
      })

      // Shutdown WebSocket server
      this.wss.close()

      // Shutdown AGUI service
      await this.aguiService.shutdown()

      this.isInitialized = false

      logger.info('WebSocket server middleware shutdown completed')
    } catch {
      logger.error('Error during WebSocket server shutdown', { error })
      throw error
    }
  }
}

/**
 * Create and initialize WebSocket server middleware
 */
export async function createWebSocketServer(
  config: WebSocketServerConfig,
): Promise<WebSocketServerMiddleware> {
  const wsServer = new WebSocketServerMiddleware(config)
  await wsServer.initialize()
  return wsServer
}
