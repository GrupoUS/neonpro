/**
 * AI Provider Health Monitoring
 * Extracted from ai-provider-router.ts for better modularity
 */

import { AIProviderOpt } from '@neonpro/shared';
import { CircuitBreaker } from '../circuit-breaker';
import { ProviderConfig, ProviderHealthCheck, ProviderStatus } from './types';

/**
 * Health monitoring utilities for AI providers
 */
export class ProviderHealthMonitor {
  private provider_health: Map<AIProviderOpt, ProviderHealthCheck> = new Map();
  private circuit_breakers: Map<AIProviderOpt, CircuitBreaker> = new Map();

  /**
   * Initialize health monitoring for a provider
   */
  initializeProviderHealth(provider: AIProviderOpt, config: ProviderConfig): void {
    // Initialize health status
    this.provider_health.set(provider, {
      provider,
      status: ProviderStatus.AVAILABLE,
      latency: 2000,
      success_rate: 100,
      rate_limit_remaining: config.rate_limit_rpm,
      cost_efficiency: 0.8,
      last_check: new Date(),
    });

    // Initialize circuit breaker
    this.circuit_breakers.set(provider, new CircuitBreaker(provider));
  }

  /**
   * Get provider health status
   */
  getProviderHealth(
    provider?: AIProviderOpt,
  ): ProviderHealthCheck | ProviderHealthCheck[] {
    if (provider) {
      return (
        this.provider_health.get(provider) || {
          provider,
          status: ProviderStatus.UNAVAILABLE,
          latency: Infinity,
          success_rate: 0,
          rate_limit_remaining: 0,
          cost_efficiency: 0,
          last_check: new Date(),
          error_message: 'Provider not found',
        }
      );
    }

    return Array.from(this.provider_health.values());
  }

  /**
   * Update provider health metrics
   */
  updateProviderHealth(
    provider: AIProviderOpt,
    success: boolean,
    latency: number,
  ): void {
    const health = this.provider_health.get(provider);
    if (!health) return;

    // Update latency (moving average)
    health.latency = health.latency * 0.8 + latency * 0.2;

    // Update success rate
    if (success) {
      health.success_rate = Math.min(100, health.success_rate + 0.5);
      health.status = ProviderStatus.AVAILABLE;
    } else {
      health.success_rate = Math.max(0, health.success_rate - 2);

      if (health.success_rate < 70) {
        health.status = ProviderStatus.DEGRADED;
      }
      if (health.success_rate < 50) {
        health.status = ProviderStatus.UNAVAILABLE;
      }
    }

    health.last_check = new Date();
  }

  /**
   * Perform health check on a specific provider
   */
  async performProviderHealthCheck(
    provider: AIProviderOpt,
    config: ProviderConfig,
  ): Promise<void> {
    try {
      const start_time = Date.now();

      // Mock health check - in production, call actual health endpoints
      await this.mockHealthCheck();

      const latency = Date.now() - start_time;

      // Update health status
      const current_health = this.provider_health.get(provider);
      if (current_health) {
        current_health.status = ProviderStatus.AVAILABLE;
        current_health.latency = latency;
        current_health.success_rate = Math.min(
          100,
          current_health.success_rate + 1,
        );
        current_health.last_check = new Date();
      }
    } catch (error) {
      // Update health status on failure
      const current_health = this.provider_health.get(provider);
      if (current_health) {
        current_health.status = ProviderStatus.DEGRADED;
        current_health.success_rate = Math.max(
          0,
          current_health.success_rate - 5,
        );
        current_health.last_check = new Date();
        current_health.error_message = (error as Error).message;

        if (current_health.success_rate < 50) {
          current_health.status = ProviderStatus.UNAVAILABLE;
        }
      }
    }
  }

  /**
   * Mock health check for provider
   */
  private async mockHealthCheck(): Promise<void> {
    // Simulate health check call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Randomly fail some checks for testing
    if (Math.random() < 0.05) {
      // 5% failure rate
      throw new Error('Health check failed');
    }
  }

  /**
   * Get circuit breaker for provider
   */
  getCircuitBreaker(provider: AIProviderOpt): CircuitBreaker | undefined {
    return this.circuit_breakers.get(provider);
  }

  /**
   * Check if provider is available for routing
   */
  isProviderAvailable(provider: AIProviderOpt): boolean {
    const health = this.provider_health.get(provider);
    const circuit_breaker = this.circuit_breakers.get(provider);

    return Boolean(
      health
        && health.status !== ProviderStatus.UNAVAILABLE
        && (!circuit_breaker || !circuit_breaker.isOpen()),
    );
  }

  /**
   * Get providers that can handle emergency requests
   */
  getEmergencyCapableProviders(configs: ProviderConfig[]): ProviderConfig[] {
    return configs.filter(provider => {
      // Must be enabled and have healthcare compliance
      if (!provider.enabled || !provider.healthcare_compliance.lgpd_approved) {
        return false;
      }

      // Must have emergency-capable models
      const has_emergency_model = provider.models.some(
        model =>
          model.healthcare_config.patient_data_processing
          && model.performance_config.max_latency_ms <= 5000,
      );

      if (!has_emergency_model) return false;

      // Check provider health
      const health = this.provider_health.get(provider.provider);
      if (!health || health.status !== ProviderStatus.AVAILABLE) {
        return false;
      }

      // Check circuit breaker
      const circuit_breaker = this.circuit_breakers.get(provider.provider);
      if (circuit_breaker && circuit_breaker.isOpen()) {
        return false;
      }

      return true;
    });
  }

  /**
   * Record success on circuit breaker
   */
  recordSuccess(provider: AIProviderOpt): void {
    const circuit_breaker = this.circuit_breakers.get(provider);
    circuit_breaker?.recordSuccess();
  }

  /**
   * Record failure on circuit breaker
   */
  recordFailure(provider: AIProviderOpt): void {
    const circuit_breaker = this.circuit_breakers.get(provider);
    circuit_breaker?.recordFailure();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.provider_health.clear();
    this.circuit_breakers.clear();
  }
}
