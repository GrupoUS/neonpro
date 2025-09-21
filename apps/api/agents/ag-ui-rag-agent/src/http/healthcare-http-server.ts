/**
 * HTTP Server for Healthcare Agent
 * Provides REST API endpoints for CopilotKit integration
 * Complements the WebSocket AG-UI server from T052
 */

import { createServer } from 'http'
import { URL } from 'url'
import { HealthcareAgent } from '../agent/healthcare-agent'
import { SecurityManager } from '../security/security-manager'
import { HealthcareLogger } from '../logging/healthcare-logger'
import type { 
  UserQuery,
  QueryPermissions,
  ConnectionContext 
} from '../types'

interface HttpResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

/**
 * Simple HTTP server for healthcare agent
 * Provides REST endpoints for CopilotKit bridge integration
 */
export class HealthcareHttpServer {
  private server: any = null
  private healthcareAgent: HealthcareAgent
  private securityManager: SecurityManager
  private logger: HealthcareLogger
  private port: number

  constructor(
    healthcareAgent: HealthcareAgent,
    securityManager: SecurityManager,
    logger: HealthcareLogger,
    port: number = 8080
  ) {
    this.healthcareAgent = healthcareAgent
    this.securityManager = securityManager
    this.logger = logger
    this.port = port
  }

  /**
   * Start HTTP server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        try {
          await this.handleRequest(req, res)
        } catch (error) {
          this.logger.error('HTTP request error', error as Error, {
            component: 'healthcare-http-server',
            url: req.url,
            method: req.method
          })

          this.sendResponse(res, {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: 'Internal server error',
              timestamp: new Date().toISOString()
            })
          })
        }
      })

      this.server.listen(this.port, (error: any) => {
        if (error) {
          this.logger.error('Failed to start HTTP server', error, {
            component: 'healthcare-http-server',
            port: this.port
          })
          reject(error)
        } else {
          this.logger.info('Healthcare HTTP server started', {
            component: 'healthcare-http-server',
            port: this.port,
            endpoints: ['/healthcare/query', '/health']
          })
          resolve()
        }
      })
    })
  }

  /**
   * Handle incoming HTTP request
   */
  private async handleRequest(req: any, res: any): Promise<void> {
    // Set CORS headers for CopilotKit integration
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, X-Clinic-ID, X-Request-ID, X-Healthcare-Platform')

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      this.sendResponse(res, {
        statusCode: 204,
        headers: {},
        body: ''
      })
      return
    }

    const url = new URL(req.url!, `http://localhost:${this.port}`)
    const pathname = url.pathname

    // Route requests
    switch (pathname) {
      case '/healthcare/query':
        if (req.method === 'POST') {
          await this.handleHealthcareQuery(req, res)
        } else {
          this.sendMethodNotAllowed(res)
        }
        break

      case '/health':
        if (req.method === 'GET') {
          await this.handleHealthCheck(req, res)
        } else {
          this.sendMethodNotAllowed(res)
        }
        break

      default:
        this.sendNotFound(res)
        break
    }
  }

  /**
   * Handle healthcare query endpoint
   */
  private async handleHealthcareQuery(req: any, res: any): Promise<void> {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID()
    const startTime = Date.now()

    try {
      // Parse request body
      const body = await this.parseRequestBody(req)
      const { query, parameters = {}, context } = JSON.parse(body)

      if (!query || typeof query !== 'string') {
        this.sendResponse(res, {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Query is required and must be a string',
            requestId,
            timestamp: new Date().toISOString()
          })
        })
        return
      }

      // Extract user context from headers
      const userId = req.headers['x-user-id'] || 'anonymous'
      const clinicId = req.headers['x-clinic-id'] || 'default'

      // Get user permissions
      const permissions = await this.securityManager.getUserPermissions(userId, clinicId)

      // Create user query
      const userQuery: UserQuery = {
        query,
        parameters,
        context: {
          userAgent: req.headers['user-agent'] || 'HTTP-Client',
          ipAddress: req.connection?.remoteAddress || '127.0.0.1',
          sessionId: context?.sessionId || requestId
        }
      }

      // Process query with healthcare agent
      const response = await this.healthcareAgent.processQuery(userQuery, permissions)

      // Log healthcare data access
      await this.logger.logDataAccess(userId, clinicId, {
        action: 'http_query',
        query: query.substring(0, 100),
        sessionId: userQuery.context.sessionId,
        timestamp: new Date()
      })

      const processingTime = Date.now() - startTime

      // Send response
      this.sendResponse(res, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...response,
          requestId,
          processing_time: processingTime,
          timestamp: new Date().toISOString()
        })
      })

    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('Healthcare query error', error as Error, {
        component: 'healthcare-http-server',
        requestId,
        processing_time: processingTime
      })

      this.sendResponse(res, {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Erro ao processar consulta de saúde',
          requestId,
          processing_time: processingTime,
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  /**
   * Handle health check endpoint
   */
  private async handleHealthCheck(req: any, res: any): Promise<void> {
    try {
      const healthData = {
        status: 'healthy',
        service: 'healthcare-agent-http',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        features: {
          healthcare_queries: true,
          lgpd_compliance: true,
          supabase_integration: true,
          audit_logging: true
        },
        timestamp: new Date().toISOString()
      }

      this.sendResponse(res, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
      })

    } catch (error) {
      this.logger.error('Health check error', error as Error, {
        component: 'healthcare-http-server'
      })

      this.sendResponse(res, {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'unhealthy',
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  /**
   * Parse request body
   */
  private async parseRequestBody(req: any): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = ''
      
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })

      req.on('end', () => {
        resolve(body)
      })

      req.on('error', (error: Error) => {
        reject(error)
      })
    })
  }

  /**
   * Send HTTP response
   */
  private sendResponse(res: any, response: HttpResponse): void {
    res.statusCode = response.statusCode

    // Set headers
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value)
    }

    res.end(response.body)
  }

  /**
   * Send 404 Not Found
   */
  private sendNotFound(res: any): void {
    this.sendResponse(res, {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * Send 405 Method Not Allowed
   */
  private sendMethodNotAllowed(res: any): void {
    this.sendResponse(res, {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Method not allowed',
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * Stop HTTP server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('Healthcare HTTP server stopped', {
            component: 'healthcare-http-server'
          })
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * Get server statistics
   */
  public getStats() {
    return {
      port: this.port,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      endpoints: [
        '/healthcare/query',
        '/health'
      ]
    }
  }
}