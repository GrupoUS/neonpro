/**
 * Healthcare Agent Main Entry Point
 * Initializes both WebSocket and HTTP servers for complete integration
 * T054: Connect frontend CopilotKit to backend agent
 */

import { HealthcareAgent } from './agent/healthcare-agent'
import { SecurityManager } from './security/security-manager'
import { HealthcareLogger } from './logging/healthcare-logger'
import { AguiServer } from './communication/agui-server'
import { HealthcareHttpServer } from './http/healthcare-http-server'
import { SupabaseConnector } from './database/supabase-connector'

/**
 * Main Healthcare Agent Server
 * Provides both WebSocket (AG-UI) and HTTP (CopilotKit) endpoints
 */
class HealthcareAgentServer {
  private logger: HealthcareLogger
  private securityManager: SecurityManager
  private supabaseConnector: SupabaseConnector
  private healthcareAgent: HealthcareAgent
  private aguiServer: AguiServer
  private httpServer: HealthcareHttpServer

  constructor() {
    // Initialize core components
    this.logger = new HealthcareLogger()
    this.securityManager = new SecurityManager(this.logger)
    this.supabaseConnector = new SupabaseConnector()
    
    // Initialize healthcare agent
    this.healthcareAgent = new HealthcareAgent(
      this.supabaseConnector,
      this.logger
    )

    // Initialize servers
    this.aguiServer = new AguiServer(
      this.healthcareAgent,
      this.securityManager,
      this.logger
    )

    this.httpServer = new HealthcareHttpServer(
      this.healthcareAgent,
      this.securityManager,
      this.logger,
      parseInt(process.env.HEALTHCARE_HTTP_PORT || '8080')
    )
  }

  /**
   * Start all servers
   */
  public async start(): Promise<void> {
    try {
      this.logger.info('Starting Healthcare Agent Server', {
        component: 'healthcare-agent-server',
        websocket_port: 8081,
        http_port: parseInt(process.env.HEALTHCARE_HTTP_PORT || '8080')
      })

      // Start HTTP server (for CopilotKit integration)
      await this.httpServer.start()
      this.logger.info('HTTP server started successfully')

      // Start WebSocket server (for AG-UI protocol)
      await this.aguiServer.initialize(8081)
      this.logger.info('WebSocket server started successfully')

      this.logger.info('Healthcare Agent Server fully operational', {
        component: 'healthcare-agent-server',
        features: [
          'copilotkit_integration',
          'agui_protocol',
          'lgpd_compliance',
          'healthcare_data_access',
          'audit_logging'
        ]
      })

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown())
      process.on('SIGTERM', () => this.shutdown())

    } catch (error) {
      this.logger.error('Failed to start Healthcare Agent Server', error as Error, {
        component: 'healthcare-agent-server'
      })
      process.exit(1)
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Healthcare Agent Server', {
      component: 'healthcare-agent-server'
    })

    try {
      // Stop servers
      await this.aguiServer.shutdown()
      await this.httpServer.stop()

      this.logger.info('Healthcare Agent Server shutdown completed', {
        component: 'healthcare-agent-server'
      })

      process.exit(0)
    } catch (error) {
      this.logger.error('Error during shutdown', error as Error, {
        component: 'healthcare-agent-server'
      })
      process.exit(1)
    }
  }

  /**
   * Get server status and statistics
   */
  public getStatus() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      servers: {
        agui: this.aguiServer.getStats(),
        http: this.httpServer.getStats()
      },
      security: this.securityManager.getSecurityStats(),
      logging: this.logger.getStats(),
      timestamp: new Date().toISOString()
    }
  }
}

// Export for use in other modules
export { HealthcareAgentServer }

// Start server if this file is run directly
if (require.main === module) {
  const server = new HealthcareAgentServer()
  server.start().catch((error) => {
    console.error('Failed to start Healthcare Agent Server:', error)
    process.exit(1)
  })
}