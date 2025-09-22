// T041: AI Provider configuration and environment setup
import type { AIProvider, AIProviderConfig } from "@neonpro/types";

export interface AIConfig {
  defaultProvider: AIProvider;
  providers: Record<AIProvider, AIProviderConfig>;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    concurrentRequests: number;
  };
  features: {
    streaming: boolean;
    piiRedaction: boolean;
    auditLogging: boolean;
    multiModel: boolean;
  };
  security: {
    encryptApiKeys: boolean;
    requireAuth: boolean;
    allowedDomains: string[];
  };
}

export function createAIConfig(): AIConfig {
  const config: AIConfig = {
    defaultProvider:
      (process.env.AI_DEFAULT_PROVIDER as AIProvider) || "openai",

    providers: {
      openai: {
        enabled: Boolean(process.env.OPENAI_API_KEY),
        apiKey: process.env.OPENAI_API_KEY || "",
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        models: {
          default: process.env.OPENAI_DEFAULT_MODEL || "gpt-4",
          streaming: process.env.OPENAI_STREAMING_MODEL || "gpt-4",
          fast: process.env.OPENAI_FAST_MODEL || "gpt-3.5-turbo",
        },
        rateLimits: {
          requestsPerMinute: parseInt(process.env.OPENAI_RPM || "60"),
          tokensPerMinute: parseInt(process.env.OPENAI_TPM || "40000"),
        },
        timeout: parseInt(process.env.OPENAI_TIMEOUT || "30000"),
      },

      anthropic: {
        enabled: Boolean(process.env.ANTHROPIC_API_KEY),
        apiKey: process.env.ANTHROPIC_API_KEY || "",
        baseUrl: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
        models: {
          default:
            process.env.ANTHROPIC_DEFAULT_MODEL || "claude-3-sonnet-20240229",
          streaming:
            process.env.ANTHROPIC_STREAMING_MODEL || "claude-3-sonnet-20240229",
          fast: process.env.ANTHROPIC_FAST_MODEL || "claude-3-haiku-20240307",
        },
        rateLimits: {
          requestsPerMinute: parseInt(process.env.ANTHROPIC_RPM || "50"),
          tokensPerMinute: parseInt(process.env.ANTHROPIC_TPM || "25000"),
        },
        timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || "30000"),
      },

      google: {
        enabled: Boolean(process.env.GOOGLE_AI_API_KEY),
        apiKey: process.env.GOOGLE_AI_API_KEY || "",
        baseUrl:
          process.env.GOOGLE_AI_BASE_URL ||
          "https://generativelanguage.googleapis.com/v1",
        models: {
          default: process.env.GOOGLE_AI_DEFAULT_MODEL || "gemini-pro",
          streaming: process.env.GOOGLE_AI_STREAMING_MODEL || "gemini-pro",
          fast: process.env.GOOGLE_AI_FAST_MODEL || "gemini-pro",
        },
        rateLimits: {
          requestsPerMinute: parseInt(process.env.GOOGLE_AI_RPM || "60"),
          tokensPerMinute: parseInt(process.env.GOOGLE_AI_TPM || "32000"),
        },
        timeout: parseInt(process.env.GOOGLE_AI_TIMEOUT || "30000"),
      },

      mock: {
        enabled: true,
        apiKey: "mock",
        baseUrl: "mock://provider",
        models: {
          default: "mock-model",
        },
        timeout: 0,
      },
    },

    rateLimit: {
      requestsPerMinute: parseInt(process.env.AI_GLOBAL_RPM || "100"),
      tokensPerMinute: parseInt(process.env.AI_GLOBAL_TPM || "50000"),
      concurrentRequests: parseInt(process.env.AI_CONCURRENT_REQUESTS || "5"),
    },

    features: {
      streaming: process.env.AI_ENABLE_STREAMING !== "false",
      piiRedaction: process.env.AI_ENABLE_PII_REDACTION !== "false",
      auditLogging: process.env.AI_ENABLE_AUDIT_LOGGING !== "false",
      multiModel: process.env.AI_ENABLE_MULTI_MODEL !== "false",
    },

    security: {
      encryptApiKeys: process.env.AI_ENCRYPT_KEYS !== "false",
      requireAuth: process.env.AI_REQUIRE_AUTH !== "false",
      allowedDomains: (process.env.AI_ALLOWED_DOMAINS || "")
        .split(",")
        .filter(Boolean),
    },
  };

  return config;
}

export function validateAIConfig(config: AIConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if at least one provider is enabled
  const enabledProviders = Object.entries(config.providers).filter(([,providerConfig]) => providerConfig.enabled,
  );

  if (enabledProviders.length === 0) {
    errors.push("At least one AI provider must be enabled");
  }

  // Validate default provider is enabled
  if (!config.providers[config.defaultProvider]?.enabled) {
    errors.push(`Default provider '${config.defaultProvider}' is not enabled`);
  }

  // Validate API keys for enabled providers
  for (const [provider, providerConfig] of Object.entries(config.providers)) {
    if (providerConfig.enabled && !providerConfig.apiKey) {
      errors.push(`API key required for enabled provider: ${provider}`);
    }
  }

  // Validate rate limits
  if (config.rateLimit.requestsPerMinute <= 0) {
    errors.push("Rate limit requestsPerMinute must be positive");
  }

  if (config.rateLimit.tokensPerMinute <= 0) {
    errors.push("Rate limit tokensPerMinute must be positive");
  }

  if (config.rateLimit.concurrentRequests <= 0) {
    errors.push("Rate limit concurrentRequests must be positive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Global config instance
let aiConfigInstance: AIConfig | null = null;

export function getAIConfig(): AIConfig {
  if (!aiConfigInstance) {
    aiConfigInstance = createAIConfig();
    const validation = validateAIConfig(aiConfigInstance);

    if (!validation.valid) {
      throw new Error(
        `Invalid AI configuration: ${validation.errors.join(", ")}`,
      );
    }
  }

  return aiConfigInstance;
}

export function resetAIConfig(): void {
  aiConfigInstance = null;
}

// Helper functions for provider selection
export function getEnabledProviders(config: AIConfig): AIProvider[] {
  return Object.entries(config.providers)
    .filter(([,providerConfig]) => providerConfig.enabled)
    .map(([provider]) => provider as AIProvider);
}

export function getBestProvider(
  config: AIConfig,
  requirements?: {
    streaming?: boolean;
    speed?: "fast" | "balanced" | "quality";
  },
): AIProvider {
  const enabledProviders = getEnabledProviders(config);

  if (enabledProviders.length === 0) {
    throw new Error("No AI providers are enabled");
  }

  // If no specific requirements, return default
  if (!requirements) {
    return config.defaultProvider;
  }

  // Simple provider selection logic (can be enhanced)
  if (requirements.speed === "fast" && enabledProviders.includes("openai")) {
    return "openai";
  }

  if (
    requirements.speed === "quality" &&
    enabledProviders.includes("anthropic")
  ) {
    return "anthropic";
  }

  return config.defaultProvider;
}
