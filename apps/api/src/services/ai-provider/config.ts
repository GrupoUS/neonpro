/**
 * AI Provider Configuration Management
 * Extracted from ai-provider-router.ts for better modularity
 */

import { AIModelCategory, AIProviderOpt } from '@neonpro/shared';
import { ProviderConfig, ProviderHealthCheck, ProviderStatus } from './types';

/**
 * Configuration utilities for AI providers
 */
export class ProviderConfigManager {
  private providers: Map<AIProviderOpt, ProviderConfig> = new Map();

  /**
   * Initialize providers from configuration array
   */
  initializeProviders(providerConfigs: ProviderConfig[]): void {
    providerConfigs.forEach(config => {
      this.providers.set(config.provider, config);
    });
  }

  /**
   * Add or update provider configuration
   */
  addProviderConfig(config: ProviderConfig): void {
    this.providers.set(config.provider, config);
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: AIProviderOpt): ProviderConfig | undefined {
    return this.providers.get(provider);
  }

  /**
   * Get all provider configurations
   */
  getAllProviderConfigs(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if provider exists
   */
  hasProvider(provider: AIProviderOpt): boolean {
    return this.providers.has(provider);
  }

  /**
   * Remove provider configuration
   */
  removeProvider(provider: AIProviderOpt): boolean {
    return this.providers.delete(provider);
  }

  /**
   * Enable/disable provider
   */
  setProviderEnabled(provider: AIProviderOpt, enabled: boolean): boolean {
    const config = this.providers.get(provider);
    if (!config) return false;

    config.enabled = enabled;
    return true;
  }

  /**
   * Initialize default healthcare-certified AI providers
   */
  initializeDefaultProviders(): void {
    // OpenAI - Healthcare compliant configuration
    this.addProviderConfig({
      provider: AIProviderOpt.OPENAI,
      enabled: true,
      api_key: process.env.OPENAI_API_KEY || '',
      models: [
        {
          provider: AIProviderOpt.OPENAI,
          model_name: 'gpt-4-turbo',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.01,
            output_cost_per_1k_tokens: 0.03,
            max_tokens: 4096,
            max_monthly_budget: 1000,
          },
          performance_config: {
            max_latency_ms: 5000,
            timeout_ms: 30000,
            retry_attempts: 3,
            rate_limit_rpm: 3500,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 100,
      rate_limit_rpm: 3500,
      cost_config: {
        monthly_budget_limit: 1000,
        current_spend: 0,
        cost_alert_threshold: 80,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // Anthropic - Claude models
    this.addProviderConfig({
      provider: AIProviderOpt.ANTHROPIC,
      enabled: true,
      api_key: process.env.ANTHROPIC_API_KEY || '',
      models: [
        {
          provider: AIProviderOpt.ANTHROPIC,
          model_name: 'claude-3-haiku',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.00025,
            output_cost_per_1k_tokens: 0.00125,
            max_tokens: 4096,
            max_monthly_budget: 300,
          },
          performance_config: {
            max_latency_ms: 2000,
            timeout_ms: 15000,
            retry_attempts: 3,
            rate_limit_rpm: 1000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 50,
      rate_limit_rpm: 1000,
      cost_config: {
        monthly_budget_limit: 300,
        current_spend: 0,
        cost_alert_threshold: 75,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // Azure OpenAI - Enterprise healthcare compliance
    this.addProviderConfig({
      provider: AIProviderOpt.AZURE,
      enabled: true,
      api_key: process.env.AZURE_OPENAI_API_KEY || '',
      base_url: process.env.AZURE_OPENAI_ENDPOINT,
      models: [
        {
          provider: AIProviderOpt.AZURE,
          model_name: 'gpt-4-turbo-azure',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.01,
            output_cost_per_1k_tokens: 0.03,
            max_tokens: 4096,
            max_monthly_budget: 2000,
          },
          performance_config: {
            max_latency_ms: 4000,
            timeout_ms: 30000,
            retry_attempts: 3,
            rate_limit_rpm: 2000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 50,
      rate_limit_rpm: 2000,
      cost_config: {
        monthly_budget_limit: 2000,
        current_spend: 0,
        cost_alert_threshold: 85,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // AWS Bedrock - Healthcare certified models
    this.addProviderConfig({
      provider: AIProviderOpt.AWS_BEDROCK,
      enabled: true,
      api_key: process.env.AWS_ACCESS_KEY_ID || '',
      base_url: process.env.AWS_BEDROCK_ENDPOINT,
      models: [
        {
          provider: AIProviderOpt.AWS_BEDROCK,
          model_name: 'anthropic.claude-3-haiku-20240307-v1:0',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.00025,
            output_cost_per_1k_tokens: 0.00125,
            max_tokens: 4096,
            max_monthly_budget: 800,
          },
          performance_config: {
            max_latency_ms: 3000,
            timeout_ms: 25000,
            retry_attempts: 3,
            rate_limit_rpm: 1000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 30,
      rate_limit_rpm: 1000,
      cost_config: {
        monthly_budget_limit: 800,
        current_spend: 0,
        cost_alert_threshold: 80,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });
  }

  /**
   * Get provider health status initialization
   */
  initializeProviderHealth(provider: AIProviderOpt): ProviderHealthCheck {
    return {
      provider,
      status: ProviderStatus.AVAILABLE,
      latency: 2000,
      success_rate: 100,
      rate_limit_remaining: this.providers.get(provider)?.rate_limit_rpm || 0,
      cost_efficiency: 0.8,
      last_check: new Date(),
    };
  }

  /**
   * Get enabled providers only
   */
  getEnabledProviders(): ProviderConfig[] {
    return this.getAllProviderConfigs().filter(config => config.enabled);
  }

  /**
   * Get provider by name for easier access
   */
  getProviderByName(providerName: string): ProviderConfig | undefined {
    const provider = Object.values(AIProviderOpt).find(p => p === providerName);
    return provider ? this.getProviderConfig(provider) : undefined;
  }
}
