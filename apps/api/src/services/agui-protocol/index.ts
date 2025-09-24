/**
 * AG-UI Protocol Package Entry Point
 *
 * WebSocket-based communication protocol for real-time agent interaction.
 * Provides types, protocol implementation, and service integration.
 */

export * from './protocol'
export * from './service'
export * from './types'

// Re-export commonly used types and classes
export {
  AguiHealthStatus,
  AguiMessage,
  AguiProtocol,
  AguiQueryMessage,
  AguiResponseMessage,
  AguiService,
  AguiSession,
  QueryContext,
  QueryResult,
  ServiceMetrics,
} from './types'

// Default configuration
export const DEFAULT_AGUI_CONFIG = {
  version: '1.0.0',
  supportedVersions: ['1.0.0'],
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
  maxMessageAge: 300000, // 5 minutes
  connectionTimeout: 300000, // 5 minutes
  cleanupInterval: 60000, // 1 minute
  ragAgentEndpoint: process.env.RAG_AGENT_ENDPOINT || 'http://localhost:8080',
  enableMetrics: true,
  metricsInterval: 30000, // 30 seconds
}

// Service factory function
export function createAguiService(
  config?: Partial<typeof DEFAULT_AGUI_CONFIG>,
) {
  const finalConfig = { ...DEFAULT_AGUI_CONFIG, ...config }
  return new AguiService(finalConfig)
}
