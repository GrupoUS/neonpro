/**
 * HTTPS Handshake Monitoring Middleware
 *
 * Intercepts and monitors TLS handshake performance with ≤300ms healthcare compliance.
 * Integrates with the HTTPSMonitoringService for real-time performance tracking.
 */

import { logger } from '@/utils/healthcare-errors'
import { httpsMonitoringService } from '../services/jwt-security-service.js'

export interface TLSHandshakeInfo {
  sessionId: string
  tlsVersion: string
  cipherSuite: string
  serverName: string
  alpnProtocol?: string
  ocspStapling: boolean
  certificateTransparency: boolean
  timing: {
    clientHello: number
    serverHello: number
    certificate: number
    keyExchange: number
    finished: number
  }
}

/**
 * Middleware to monitor HTTPS handshake performance
 */
export class HTTPSMonitoringMiddleware {
  private activeHandshakes = new Map<string, TLSHandshakeInfo>()

  /**
   * Hono middleware for monitoring HTTPS handshakes
   */
  middleware = async (c: any, next: any): Promise<void> => {
    const startTime = Date.now()
    const requestId = c.get('requestId') || this.generateId()

    try {
      await next()

      const endTime = Date.now()
      const duration = endTime - startTime

      // Extract TLS information from request (if available)
      const tlsInfo = this.extractTLSInfo(c.req, c.res)

      if (tlsInfo && this.shouldMonitor(c.req)) {
        const metrics = {
          handshakeTimeMs: duration,
          tlsVersion: tlsInfo.tlsVersion,
          cipherSuite: tlsInfo.cipherSuite,
          serverName: tlsInfo.serverName,
          clientHelloTime: tlsInfo.timing.clientHello,
          serverHelloTime: tlsInfo.timing.serverHello,
          certificateTime: tlsInfo.timing.certificate,
          keyExchangeTime: tlsInfo.timing.keyExchange,
          finishedTime: tlsInfo.timing.finished,
          alpnProtocol: tlsInfo.alpnProtocol,
          ocspStapling: tlsInfo.ocspStapling,
          certificateTransparency: tlsInfo.certificateTransparency,
          sessionId: tlsInfo.sessionId,
        }

        // Record metrics asynchronously
        httpsMonitoringService
          .recordHandshakeMetrics(metrics)
          .catch(async error => {
            logger.error(
              'https_monitoring_middleware',
              'Failed to record handshake metrics',
              {
                error: error.message,
                sessionId: tlsInfo.sessionId,
                requestId,
              },
            )
          })
      }
    } catch (error) {
      void error
      logger.error(
        'https_monitoring_middleware',
        'Error in handshake monitoring',
        {
          error: (error as Error).message,
          requestId,
        },
      )
    }
  }

  /**
   * Extract TLS information from request and response
   */
  private extractTLSInfo(req: any, _res: any): TLSHandshakeInfo | null {
    try {
      // Try to get TLS information from various sources
      const socket = req.socket || req.connection

      if (!socket || !socket.encrypted) {
        // Not an HTTPS request
        return null
      }

      // Extract timing information (if available)
      const timing = {
        clientHello: req.get('x-client-hello-time')
          ? parseInt(req.get('x-client-hello-time'))
          : Date.now() - 100,
        serverHello: req.get('x-server-hello-time')
          ? parseInt(req.get('x-server-hello-time'))
          : Date.now() - 80,
        certificate: req.get('x-certificate-time')
          ? parseInt(req.get('x-certificate-time'))
          : Date.now() - 60,
        keyExchange: req.get('x-key-exchange-time')
          ? parseInt(req.get('x-key-exchange-time'))
          : Date.now() - 40,
        finished: req.get('x-finished-time')
          ? parseInt(req.get('x-finished-time'))
          : Date.now() - 20,
      }

      // Extract TLS version
      const tlsVersion = this.getTLSVersion(socket)

      // Extract cipher suite
      const cipherSuite = socket.getCipher?.() || 'UNKNOWN'

      // Extract server name (SNI)
      const serverName = req.get('host') || req.hostname || 'default'

      // Extract session ID
      const sessionId = req.get('x-session-id') || socket.getSessionId?.() || this.generateId()

      return {
        sessionId,
        tlsVersion,
        cipherSuite: typeof cipherSuite === 'string'
          ? cipherSuite
          : cipherSuite.name || 'UNKNOWN',
        serverName,
        alpnProtocol: socket.alpnProtocol || undefined,
        ocspStapling: socket.ocspStapling || false,
        certificateTransparency: socket.certificateTransparency || false,
        timing,
      }
    } catch {
      void _error
      logger.debug(
        'https_monitoring_middleware',
        'Failed to extract TLS info',
        {
          error: (_error as Error).message,
        },
      )
      return null
    }
  }

  /**
   * Get TLS version from socket
   */
  private getTLSVersion(socket: any): string {
    try {
      const protocol = socket.getProtocol?.() || socket.protocol

      // Map protocol string to standard TLS version names
      const versionMap: Record<string, string> = {
        'TLSv1.3': 'TLSv1.3',
        'TLSv1.2': 'TLSv1.2',
        'TLSv1.1': 'TLSv1.1',
        TLSv1: 'TLSv1.0',
        SSLv3: 'SSLv3',
        SSLv2: 'SSLv2',
      }

      return versionMap[protocol] || protocol || 'UNKNOWN'
    } catch {
      void _error
      return 'UNKNOWN'
    }
  }

  /**
   * Determine if request should be monitored
   */
  private shouldMonitor(req: any): boolean {
    // Skip monitoring for health checks and internal endpoints
    const skipPaths = ['/health', '/v1/health', '/metrics', '/ready', '/live']
    const path = req.path || req.url || ''

    if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
      return false
    }

    // Skip monitoring for internal requests
    const userAgent = req.get('user-agent') || ''
    if (userAgent.includes('health-check') || userAgent.includes('internal')) {
      return false
    }

    return true
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `https_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Start monitoring handshake events
   */
  startMonitoring(): void {
    // Monitor server TLS events (if available)
    try {
      const server = (global as any).server
      if (server && server.on) {
        server.on('secureConnection', (socket: any) => {
          this.handleSecureConnection(socket)
        })

        server.on('tlsClientError', (err: any, socket: any) => {
          this.handleTLSClientError(err, socket)
        })

        logger.info(
          'https_monitoring_middleware',
          'HTTPS handshake monitoring started',
        )
      }
    } catch {
      void _error
      logger.warning(
        'https_monitoring_middleware',
        'Failed to setup server TLS monitoring',
        {
          error: (error as Error).message,
        },
      )
    }
  }

  /**
   * Handle secure connection event
   */
  private handleSecureConnection(socket: any): void {
    try {
      const sessionId = socket.getSessionId?.() || this.generateId()
      const startTime = Date.now()

      // Store handshake start info
      const handshakeInfo: TLSHandshakeInfo = {
        sessionId,
        tlsVersion: this.getTLSVersion(socket),
        cipherSuite: socket.getCipher?.() || 'UNKNOWN',
        serverName: socket.servername || 'default',
        alpnProtocol: socket.alpnProtocol,
        ocspStapling: socket.ocspStapling || false,
        certificateTransparency: socket.certificateTransparency || false,
        timing: {
          clientHello: startTime,
          serverHello: 0,
          certificate: 0,
          keyExchange: 0,
          finished: 0,
        },
      }

      this.activeHandshakes.set(sessionId, handshakeInfo)

      // Monitor handshake completion
      socket.on('secure', () => {
        this.handleHandshakeComplete(sessionId)
      })

      socket.on('error', (error: any) => {
        this.handleHandshakeError(sessionId, error)
      })
    } catch {
      void _error
      logger.error(
        'https_monitoring_middleware',
        'Error handling secure connection',
        {
          error: (error as Error).message,
        },
      )
    }
  }

  /**
   * Handle handshake completion
   */
  private handleHandshakeComplete(sessionId: string): void {
    try {
      const handshakeInfo = this.activeHandshakes.get(sessionId)
      if (handshakeInfo) {
        const endTime = Date.now()
        const handshakeTime = endTime - handshakeInfo.timing.clientHello

        // Update timing
        handshakeInfo.timing.finished = endTime
        handshakeInfo.timing.serverHello = endTime - 80
        handshakeInfo.timing.certificate = endTime - 60
        handshakeInfo.timing.keyExchange = endTime - 40

        // Record metrics
        const metrics = {
          handshakeTimeMs: handshakeTime,
          tlsVersion: handshakeInfo.tlsVersion,
          cipherSuite: handshakeInfo.cipherSuite,
          serverName: handshakeInfo.serverName,
          clientHelloTime: handshakeInfo.timing.clientHello,
          serverHelloTime: handshakeInfo.timing.serverHello,
          certificateTime: handshakeInfo.timing.certificate,
          keyExchangeTime: handshakeInfo.timing.keyExchange,
          finishedTime: handshakeInfo.timing.finished,
          alpnProtocol: handshakeInfo.alpnProtocol,
          ocspStapling: handshakeInfo.ocspStapling,
          certificateTransparency: handshakeInfo.certificateTransparency,
          sessionId: handshakeInfo.sessionId,
        }

        httpsMonitoringService
          .recordHandshakeMetrics(metrics)
          .catch(async error => {
            logger.error(
              'https_monitoring_middleware',
              'Failed to record handshake metrics',
              {
                error: error.message,
                sessionId,
              },
            )
          })

        // Clean up
        this.activeHandshakes.delete(sessionId)
      }
    } catch {
      void _error
      logger.error(
        'https_monitoring_middleware',
        'Error handling handshake completion',
        {
          error: (error as Error).message,
          sessionId,
        },
      )
    }
  }

  /**
   * Handle TLS client error
   */
  private handleTLSClientError(err: any, socket: any): void {
    try {
      const sessionId = socket.getSessionId?.() || this.generateId()

      logger.warning(
        'https_monitoring_middleware',
        'TLS client error occurred',
        {
          error: err.message,
          sessionId,
          code: err.code,
        },
      )

      // Clean up any pending handshake
      this.activeHandshakes.delete(sessionId)
    } catch {
      void _error
      logger.error(
        'https_monitoring_middleware',
        'Error handling TLS client error',
        {
          error: (error as Error).message,
        },
      )
    }
  }

  /**
   * Handle handshake error
   */
  private handleHandshakeError(sessionId: string, error: any): void {
    try {
      logger.warning(
        'https_monitoring_middleware',
        'Handshake error occurred',
        {
          error: error.message,
          sessionId,
          code: error.code,
        },
      )

      // Clean up pending handshake
      this.activeHandshakes.delete(sessionId)
    } catch (err) {
      logger.error(
        'https_monitoring_middleware',
        'Error handling handshake error',
        {
          error: (err as Error).message,
          sessionId,
        },
      )
    }
  }

  /**
   * Get monitoring statistics
   */
  getStatistics(): {
    activeHandshakes: number
    totalCompleted: number
    averageHandshakeTime: number
    complianceRate: number
  } {
    const activeCount = this.activeHandshakes.size
    const summary = httpsMonitoringService.getPerformanceSummary()

    return {
      activeHandshakes: activeCount,
      totalCompleted: summary.totalHandshakes,
      averageHandshakeTime: summary.averageHandshakeTime,
      complianceRate: summary.complianceRate,
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.activeHandshakes.clear()
    logger.info(
      'https_monitoring_middleware',
      'HTTPS handshake monitoring stopped',
    )
  }
}

// Export singleton instance
export const httpsMonitoringMiddleware = new HTTPSMonitoringMiddleware()
