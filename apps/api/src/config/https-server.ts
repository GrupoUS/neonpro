import { Express, Response } from 'express';
import http from 'http';
import https from 'https';
import { HealthcareLogger } from '../logging/healthcare-logger';
import { CertificateConfig, TLSConfigManager } from './tls-config';
import { ERROR_CONSTANTS, HTTPS_CONSTANTS, LOGGING_CONSTANTS } from './tls-constants';

export interface HTTPSServerConfig {
  port: number;
  host: string;
  tlsConfig: CertificateConfig;
  redirectHTTP?: boolean;
  httpPort?: number;
  enableHSTS?: boolean;
  maxConnections?: number;
  timeout?: number;
  keepAliveTimeout?: number;
}

export interface ServerMetrics {
  totalConnections: number;
  activeConnections: number;
  httpsRequests: number;
  httpRedirects: number;
  averageResponseTime: number;
  uptime: number;
}

/**
 * HTTPS Server Manager
 *
 * A comprehensive HTTPS server management class that provides secure server
 * configuration, monitoring, and lifecycle management for healthcare applications.
 * Implements security best practices including HSTS, security headers, and proper
 * certificate management for HIPAA compliance.
 *
 * Features:
 * - Automatic HTTPS server creation with TLS configuration
 * - HTTP to HTTPS redirection
 * - HSTS (HTTP Strict Transport Security) support
 * - Security headers injection
 * - Comprehensive metrics and monitoring
 * - Graceful shutdown handling
 * - Connection and error management
 *
 * @example
 * ```typescript
 * const serverManager = new HTTPSServerManager({
 *   port: 443,
 *   host: '0.0.0.0',
 *   tlsConfig: {
 *     keyPath: '/path/to/key.pem',
 *     certPath: '/path/to/cert.pem'
 *   },
 *   enableHSTS: true,
 *   redirectHTTP: true,
 *   httpPort: 80
 * }, logger);
 *
 * const server = serverManager.createServer(app);
 * await serverManager.start();
 * ```
 */
export class HTTPSServerManager {
  private httpsServer: https.Server | null = null;
  private httpServer: http.Server | null = null;
  private config: HTTPSServerConfig;
  private logger: HealthcareLogger;
  private tlsManager: TLSConfigManager;
  private metrics: ServerMetrics;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: HTTPSServerConfig, logger: HealthcareLogger) {
    // Validate input configuration
    this.validateServerConfig(config);

    this.config = config;
    this.logger = logger;
    this.tlsManager = TLSConfigManager.getInstance();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      httpsRequests: 0,
      httpRedirects: 0,
      averageResponseTime: 0,
      uptime: 0,
    };

    this.initializeTLS();
    this.setupMetricsReset();
  }

  /**
   * Setup periodic metrics reset to prevent memory leaks
   */
  private setupMetricsReset(): void {
    setInterval(() => {
      this.resetMetrics();
    }, HTTPS_CONSTANTS.METRICS.METRICS_RESET_INTERVAL);
  }

  /**
   * Reset metrics to prevent accumulation and memory leaks
   */
  private resetMetrics(): void {
    this.metrics.httpsRequests = 0;
    this.metrics.httpRedirects = 0;
    this.metrics.averageResponseTime = 0;
  }

  /**
   * Validate HTTPS server configuration object
   * @throws Error if configuration is invalid
   */
  private validateServerConfig(config: HTTPSServerConfig): void {
    if (!config) {
      throw new Error(ERROR_CONSTANTS.MESSAGES.INVALID_CONFIGURATION);
    }

    if (!config.port || typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
      throw new Error('Port is required and must be a valid number between 1 and 65535');
    }

    if (!config.host || typeof config.host !== 'string') {
      throw new Error('Host is required and must be a string');
    }

    if (!config.tlsConfig) {
      throw new Error('TLS configuration is required');
    }

    if (config.redirectHTTP && !config.httpPort) {
      throw new Error('HTTP port is required when redirectHTTP is enabled');
    }

    if (
      config.httpPort
      && (typeof config.httpPort !== 'number' || config.httpPort < 1 || config.httpPort > 65535)
    ) {
      throw new Error('HTTP port must be a valid number between 1 and 65535');
    }
  }

  private initializeTLS(): void {
    try {
      this.tlsManager.initialize(this.config.tlsConfig);

      const validation = this.tlsManager.validateConfiguration();
      if (!validation.valid) {
        throw new Error(`TLS validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        this.logger.logWarning(LOGGING_CONSTANTS.EVENTS.TLS_VALIDATION_WARNING, {
          warnings: validation.warnings,
          timestamp: new Date().toISOString(),
        });
      }

      this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.TLS_INITIALIZED, {
        cipherCount: this.tlsManager.getHTTPSOptions().ciphers?.split(':').length || 0,
        minVersion: this.config.tlsConfig,
        validation: validation,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.logError('tls_initialization_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          hasKeyPath: !!this.config.tlsConfig.keyPath,
          hasCertPath: !!this.config.tlsConfig.certPath,
          hasCAPath: !!this.config.tlsConfig.caPath,
        },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  public createServer(app: Express): https.Server {
    try {
      const httpsOptions = this.tlsManager.getHTTPSOptions();

      this.httpsServer = https.createServer(httpsOptions, app);

      // Configure server settings
      this.configureServer(this.httpsServer);

      this.httpsServer.on('secureConnection', tlsSocket => {
        this.metrics.totalConnections++;
        this.metrics.activeConnections++;

        this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.TLS_CONNECTION, {
          protocol: tlsSocket.getProtocol(),
          cipher: tlsSocket.getCipher(),
          serverName: tlsSocket.servername,
          authorized: tlsSocket.authorized,
          timestamp: new Date().toISOString(),
        });
      });

      this.httpsServer.on('close', () => {
        this.metrics.activeConnections--;
      });

      this.httpsServer.on('request', (req, _res) => {
        this.metrics.httpsRequests++;
        const startTime = Date.now();

        // Add HSTS header if enabled
        if (this.config.enableHSTS) {
          this.addHSTSHeaders(res);
        }

        // Add security headers
        this.addSecurityHeaders(res);

        res.on('finish', () => {
          const responseTime = Date.now() - startTime;
          this.updateAverageResponseTime(responseTime);
        });
      });

      // Handle HTTP to HTTPS redirect if enabled
      if (this.config.redirectHTTP && this.config.httpPort) {
        this.createHTTPRedirectServer();
      }

      this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.HTTPS_SERVER_CREATED, {
        port: this.config.port,
        host: this.config.host,
        hasHTTPRedirect: this.config.redirectHTTP,
        httpPort: this.config.httpPort,
        timestamp: new Date().toISOString(),
      });

      return this.httpsServer;
    } catch (error) {
      this.logger.logError('https_server_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.port,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  private createHTTPRedirectServer(): void {
    if (!this.config.httpPort) {
      return;
    }

    this.httpServer = http.createServer((req, res) => {
      this.metrics.httpRedirects++;

      // Get the host header
      const host = req.headers.host || this.config.host;

      // Construct the HTTPS URL
      const httpsUrl = `https://${host}${req.url}`;

      // Permanent redirect to HTTPS
      res.writeHead(301, {
        Location: httpsUrl,
        Connection: 'close',
      });
      res.end();

      this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.HTTP_REDIRECT, {
        originalUrl: req.url,
        redirectUrl: httpsUrl,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      });
    });

    this.httpServer.listen(this.config.httpPort, this.config.host, () => {
      this.logger.logSystemEvent('http_redirect_server_started', {
        port: this.config.httpPort,
        redirectingTo: this.config.port,
        timestamp: new Date().toISOString(),
      });
    });

    this.httpServer.on('error', error => {
      this.logger.logError('http_redirect_server_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.httpPort,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private configureServer(server: https.Server): void {
    // Configure connection limits
    server.maxConnections = this.config.maxConnections || HTTPS_CONSTANTS.SERVER.MAX_CONNECTIONS;

    // Configure timeouts
    server.timeout = this.config.timeout || HTTPS_CONSTANTS.SERVER.TIMEOUT;
    server.keepAliveTimeout = this.config.keepAliveTimeout
      || HTTPS_CONSTANTS.SERVER.KEEP_ALIVE_TIMEOUT;
    server.headersTimeout = HTTPS_CONSTANTS.SERVER.HEADERS_TIMEOUT;

    // Handle server errors
    server.on('error', error => {
      this.logger.logError(LOGGING_CONSTANTS.EVENTS.SERVER_ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.port,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle client errors
    server.on('clientError', (error, _socket) => {
      this.logger.logError(LOGGING_CONSTANTS.EVENTS.CLIENT_ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        remoteAddress: socket.remoteAddress,
        timestamp: new Date().toISOString(),
      });

      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    // Handle TLS errors
    server.on('tlsClientError', error => {
      this.logger.logError('tls_client_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle connection timeout
    server.on('timeout', socket => {
      this.logger.logWarning(LOGGING_CONSTANTS.EVENTS.CONNECTION_TIMEOUT, {
        remoteAddress: socket.remoteAddress,
        timestamp: new Date().toISOString(),
      });
      socket.destroy();
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpsServer) {
        reject(new Error('HTTPS server not created. Call createServer() first.'));
        return;
      }

      this.httpsServer.listen(this.config.port, this.config.host, () => {
        this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.HTTPS_SERVER_STARTED, {
          port: this.config.port,
          host: this.config.host,
          certificateInfo: this.tlsManager.getCertificateInfo(),
          timestamp: new Date().toISOString(),
        });
        resolve();
      });

      this.httpsServer.on('error', error => {
        reject(error);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise(resolve => {
      const stopPromises: Promise<void>[] = [];

      if (this.httpsServer) {
        stopPromises.push(
          new Promise<void>(closeResolve => {
            this.httpsServer!.close(() => {
              this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.HTTPS_SERVER_STOPPED, {
                port: this.config.port,
                timestamp: new Date().toISOString(),
              });
              closeResolve();
            });
          }),
        );
      }

      if (this.httpServer) {
        stopPromises.push(
          new Promise<void>(closeResolve => {
            this.httpServer!.close(() => {
              this.logger.logSystemEvent('http_redirect_server_stopped', {
                port: this.config.httpPort,
                timestamp: new Date().toISOString(),
              });
              closeResolve();
            });
          }),
        );
      }

      Promise.all(stopPromises).then(() => {
        this.cleanupEventListeners();
        resolve();
      });
    });
  }

  /**
   * Clean up event listeners to prevent memory leaks
   */
  private cleanupEventListeners(): void {
    if (this.httpsServer) {
      this.httpsServer.removeAllListeners();
    }
    if (this.httpServer) {
      this.httpServer.removeAllListeners();
    }
    this.eventListeners.clear();
  }

  public getMetrics(): ServerMetrics {
    return { ...this.metrics };
  }

  private updateAverageResponseTime(responseTime: number): void {
    const alpha = HTTPS_CONSTANTS.METRICS.RESPONSE_TIME_SMOOTHING_FACTOR;
    this.metrics.averageResponseTime = (alpha * responseTime)
      + ((1 - alpha) * this.metrics.averageResponseTime);
  }

  public getCertificateInfo() {
    return this.tlsManager.getCertificateInfo();
  }

  public rotateSessionTickets(): void {
    this.tlsManager.rotateSessionTickets();
    this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.SESSION_TICKETS_ROTATED, {
      timestamp: new Date().toISOString(),
    });
  }

  public getTLSConfiguration() {
    return this.tlsManager.getHTTPSOptions();
  }

  /**
   * Add HTTP Strict Transport Security (HSTS) headers to response
   * HSTS enforces HTTPS connections and improves security
   */
  private addHSTSHeaders(res: Response): void {
    const hstsValue = `max-age=${HTTPS_CONSTANTS.HSTS.MAX_AGE}${
      HTTPS_CONSTANTS.HSTS.INCLUDE_SUBDOMAINS ? '; includeSubDomains' : ''
    }${HTTPS_CONSTANTS.HSTS.PRELOAD ? '; preload' : ''}`;

    res.setHeader('Strict-Transport-Security', hstsValue);
  }

  /**
   * Add security headers to response for enhanced security
   * These headers help prevent various types of attacks
   */
  private addSecurityHeaders(res: Response): void {
    const headers = HTTPS_CONSTANTS.SECURITY_HEADERS;

    res.setHeader('Content-Security-Policy', headers.CONTENT_SECURITY_POLICY);
    res.setHeader('X-Frame-Options', headers.X_FRAME_OPTIONS);
    res.setHeader('X-Content-Type-Options', headers.X_CONTENT_TYPE_OPTIONS);
    res.setHeader('X-XSS-Protection', headers.X_XSS_PROTECTION);
    res.setHeader('Referrer-Policy', headers.REFERRER_POLICY);

    // Remove server info header for security
    res.removeHeader('X-Powered-By');
  }

  // Graceful shutdown handler
  public setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.logSystemEvent(LOGGING_CONSTANTS.EVENTS.GRACEFUL_SHUTDOWN, {
        signal,
        timestamp: new Date().toISOString(),
      });

      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        this.logger.logError('graceful_shutdown_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          signal,
          timestamp: new Date().toISOString(),
        });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}
