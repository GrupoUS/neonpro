// AI Services Registry
export { EnhancedAIService } from "./enhanced-service-base";
export { NoShowPredictionService } from "./no-show-prediction-service";
export { UniversalChatService } from "./universal-chat-service";

import { NoShowPredictionService } from "./no-show-prediction-service";
// Service Factory
import { UniversalChatService } from "./universal-chat-service";

export class AIServiceFactory {
  private static instances = new Map<string, unknown>();

  static getChatService(): UniversalChatService {
    if (!AIServiceFactory.instances.has("chat")) {
      AIServiceFactory.instances.set("chat", new UniversalChatService());
    }
    return AIServiceFactory.instances.get("chat");
  }

  static getPredictionService(): NoShowPredictionService {
    if (!AIServiceFactory.instances.has("prediction")) {
      AIServiceFactory.instances.set(
        "prediction",
        new NoShowPredictionService(),
      );
    }
    return AIServiceFactory.instances.get("prediction");
  }

  static getAllServices() {
    return {
      chat: AIServiceFactory.getChatService(),
      prediction: AIServiceFactory.getPredictionService(),
    };
  }

  static clearCache() {
    AIServiceFactory.instances.clear();
  }
}

// Service Health Check
// TODO: Convert to standalone functions
export class AIServiceHealthChecker {
  static async checkAllServices() {
    const services = AIServiceFactory.getAllServices();
    const results = [];

    for (const [name, service] of Object.entries(services)) {
      try {
        const isHealthy = await AIServiceHealthChecker.checkServiceHealth(service);
        results.push({
          service: name,
          status: isHealthy ? "healthy" : "unhealthy",
          timestamp: new Date(),
        });
      } catch (error) {
        results.push({
          service: name,
          status: "error",
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  private static async checkServiceHealth(service: unknown): Promise<boolean> {
    // Basic health check - verify service can be instantiated and has required methods
    return (
      typeof service.execute === "function"
      && typeof service.executeWithMetrics === "function"
    );
  }
}

// Export types
export * from "../types";
