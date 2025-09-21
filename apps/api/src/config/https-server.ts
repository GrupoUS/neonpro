import https from 'https'
import http from 'http'
import { Express } from 'express'
import { TLSConfigManager, CertificateConfig } from './tls-config'
import { HealthcareLogger } from '../logging/healthcare-logger'

export interface HTTPSServerConfig {
  port: number
  host: string
  tlsConfig: CertificateConfig
  redirectHTTP?: boolean
  httpPort?: number
  enableHSTS?: boolean
  maxConnections?: number
  timeout?: number
  keepAliveTimeout?: number
}

export interface ServerMetrics {
  totalConnections: number
  activeConnections: number
  httpsRequests: number
  httpRedirects: number
  averageResponseTime: number
  uptime: number
}

export class HTTPSServerManager {
  private httpsServer: https.Server | null = null
  private httpServer: http.Server | null = null
  private config: HTTPSServerConfig
  private logger: HealthcareLogger
  private tlsManager: TLSConfigManager
  private metrics: ServerMetrics

  constructor(config: HTTPSServerConfig, logger: HealthcareLogger) {
    this.config = config
    this.logger = logger
    this.tlsManager = TLSConfigManager.getInstance()
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      httpsRequests: 0,
      httpRedirects: 0,
      averageResponseTime: 0,
      uptime: 0
    }

    this.initializeTLS()
  }

  private initializeTLS(): void {
    try {
      this.tlsManager.initialize(this.config.tlsConfig)
      
      const validation = this.tlsManager.validateConfiguration()
      if (!validation.valid) {
        throw new Error(`TLS validation failed: ${validation.errors.join(', ')}`)
      }

      if (validation.warnings.length > 0) {
        this.logger.logWarning('tls_configuration_warnings', {
          warnings: validation.warnings,
          timestamp: new Date().toISOString()
        })
      }

      this.logger.logSystemEvent('tls_configuration_initialized', {
        cipherCount: this.tlsManager.getHTTPSOptions().ciphers?.split(':').length || 0,
        minVersion: this.config.tlsConfig,
        validation: validation,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      this.logger.logError('tls_initialization_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          hasKeyPath: !!this.config.tlsConfig.keyPath,
          hasCertPath: !!this.config.tlsConfig.certPath,
          hasCAPath: !!this.config.tlsConfig.caPath
        },
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  public createServer(app: Express): https.Server {
    try {
      const httpsOptions = this.tlsManager.getHTTPSOptions()
      
      this.httpsServer = https.createServer(httpsOptions, app)

      // Configure server settings
      this.configureServer(this.httpsServer)

      this.httpsServer.on('secureConnection', (tlsSocket) => {
        this.metrics.totalConnections++
        this.metrics.activeConnections++
        
        this.logger.logSystemEvent('tls_connection_established', {
          protocol: tlsSocket.getProtocol(),
          cipher: tlsSocket.getCipher(),
          serverName: tlsSocket.servername,
          authorized: tlsSocket.authorized,
          timestamp: new Date().toISOString()
        })
      })

      this.httpsServer.on('close', () => {
        this.metrics.activeConnections--
      })

      this.httpsServer.on('request', (req, res) => {
        this.metrics.httpsRequests++
        const startTime = Date.now()
        
        res.on('finish', () => {
          const responseTime = Date.now() - startTime
          this.updateAverageResponseTime(responseTime)
        })
      })

      // Handle HTTP to HTTPS redirect if enabled
      if (this.config.redirectHTTP && this.config.httpPort) {
        this.createHTTPRedirectServer()
      }

      this.logger.logSystemEvent('https_server_created', {
        port: this.config.port,
        host: this.config.host,
        hasHTTPRedirect: this.config.redirectHTTP,
        httpPort: this.config.httpPort,
        timestamp: new Date().toISOString()
      })

      return this.httpsServer
    } catch (error) {
      this.logger.logError('https_server_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.port,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  private createHTTPRedirectServer(): void {
    if (!this.config.httpPort) {
      return
    }

    this.httpServer = http.createServer((req, res) => {
      this.metrics.httpRedirects++

      // Get the host header
      const host = req.headers.host || this.config.host
      
      // Construct the HTTPS URL
      const httpsUrl = `https://${host}${req.url}`
      
      // Permanent redirect to HTTPS
      res.writeHead(301, {
        'Location': httpsUrl,
        'Connection': 'close'
      })
      res.end()

      this.logger.logSystemEvent('http_to_https_redirect', {
        originalUrl: req.url,
        redirectUrl: httpsUrl,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      })
    })

    this.httpServer.listen(this.config.httpPort, this.config.host, () => {
      this.logger.logSystemEvent('http_redirect_server_started', {
        port: this.config.httpPort,
        redirectingTo: this.config.port,
        timestamp: new Date().toISOString()
      })
    })

    this.httpServer.on('error', (error) => {
      this.logger.logError('http_redirect_server_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.httpPort,
        timestamp: new Date().toISOString()
      })
    })
  }

  private configureServer(server: https.Server): void {
    // Configure connection limits
    server.maxConnections = this.config.maxConnections || 1000
    
    // Configure timeouts
    server.timeout = this.config.timeout || 120000 // 2 minutes
    server.keepAliveTimeout = this.config.keepAliveTimeout || 65000 // 65 seconds
    server.headersTimeout = 60000 // 1 minute

    // Handle server errors
    server.on('error', (error) => {
      this.logger.logError('https_server_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.port,
        timestamp: new Date().toISOString()
      })
    })

    // Handle client errors
    server.on('clientError', (error, socket) => {
      this.logger.logError('https_client_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        remoteAddress: socket.remoteAddress,
        timestamp: new Date().toISOString()
      })
      
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    })

    // Handle TLS errors
    server.on('tlsClientError', (error) => {
      this.logger.logError('tls_client_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    })

    // Handle connection timeout
    server.on('timeout', (socket) => {
      this.logger.logWarning('connection_timeout', {
        remoteAddress: socket.remoteAddress,
        timestamp: new Date().toISOString()
      })
      socket.destroy()
    })
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpsServer) {
        reject(new Error('HTTPS server not created. Call createServer() first.'))
        return
      }

      this.httpsServer.listen(this.config.port, this.config.host, () => {
        this.logger.logSystemEvent('https_server_started', {
          port: this.config.port,
          host: this.config.host,
          certificateInfo: this.tlsManager.getCertificateInfo(),
          timestamp: new Date().toISOString()
        })
        resolve()
      })

      this.httpsServer.on('error', (error) => {
        reject(error)
      })
    })
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      const stopPromises: Promise<void>[] = []

      if (this.httpsServer) {
        stopPromises.push(new Promise<void>((closeResolve) => {
          this.httpsServer!.close(() => {
            this.logger.logSystemEvent('https_server_stopped', {
              port: this.config.port,
              timestamp: new Date().toISOString()
            })
            closeResolve()
          })
        }))
      }

      if (this.httpServer) {
        stopPromises.push(new Promise<void>((closeResolve) => {
          this.httpServer!.close(() => {
            this.logger.logSystemEvent('http_redirect_server_stopped', {
              port: this.config.httpPort,
              timestamp: new Date().toISOString()
            })
            closeResolve()
          })
        }))
      }

      Promise.all(stopPromises).then(() => resolve())
    })
  }

  public getMetrics(): ServerMetrics {
    return { ...this.metrics }
  }

  private updateAverageResponseTime(responseTime: number): void {
    const alpha = 0.1 // Smoothing factor
    this.metrics.averageResponseTime = 
      (alpha * responseTime) + ((1 - alpha) * this.metrics.averageResponseTime)
  }

  public getCertificateInfo() {
    return this.tlsManager.getCertificateInfo()
  }

  public rotateSessionTickets(): void {
    this.tlsManager.rotateSessionTickets()
    this.logger.logSystemEvent('session_tickets_rotated', {
      timestamp: new Date().toISOString()
    })
  }

  public getTLSConfiguration() {
    return this.tlsManager.getHTTPSOptions()
  }

  // Graceful shutdown handler
  public setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.logSystemEvent('server_shutdown_initiated', {
        signal,
        timestamp: new Date().toISOString()
      })

      try {
        await this.stop()
        process.exit(0)
      } catch (error) {
        this.logger.logError('graceful_shutdown_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          signal,
          timestamp: new Date().toISOString()
        })
        process.exit(1)
      }
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  }
}