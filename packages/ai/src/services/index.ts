// AI Services Registry
export { EnhancedAIService } from './enhanced-service-base'
export { UniversalChatService } from './universal-chat-service'
export { NoShowPredictionService } from './no-show-prediction-service'

// Service Factory
import { UniversalChatService } from './universal-chat-service'
import { NoShowPredictionService } from './no-show-prediction-service'

export class AIServiceFactory {
  private static instances = new Map<string, any>()

  static getChatService(): UniversalChatService {
    if (!this.instances.has('chat')) {
      this.instances.set('chat', new UniversalChatService())
    }
    return this.instances.get('chat')
  }

  static getPredictionService(): NoShowPredictionService {
    if (!this.instances.has('prediction')) {
      this.instances.set('prediction', new NoShowPredictionService())
    }
    return this.instances.get('prediction')
  }

  static getAllServices() {
    return {
      chat: this.getChatService(),
      prediction: this.getPredictionService()
    }
  }

  static clearCache() {
    this.instances.clear()
  }
}

// Service Health Check
export class AIServiceHealthChecker {
  static async checkAllServices() {
    const services = AIServiceFactory.getAllServices()
    const results = []

    for (const [name, service] of Object.entries(services)) {
      try {
        const isHealthy = await this.checkServiceHealth(service)
        results.push({
          service: name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date()
        })
      } catch (error) {
        results.push({
          service: name,
          status: 'error',
          error: error.message,
          timestamp: new Date()
        })
      }
    }

    return results
  }

  private static async checkServiceHealth(service: any): Promise<boolean> {
    // Basic health check - verify service can be instantiated and has required methods
    return (
      typeof service.execute === 'function' &&
      typeof service.executeWithMetrics === 'function'
    )
  }
}

// Export types
export * from '../types'