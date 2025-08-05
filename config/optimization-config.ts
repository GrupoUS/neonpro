"use client";

// =====================================================================================
// OPTIMIZATION CONFIGURATION SYSTEM
// Centralized configuration for all performance optimizations
// =====================================================================================

export interface OptimizationConfig {
  // Performance Monitoring
  performance: {
    enabled: boolean;
    samplingInterval: number;
    alertThresholds: {
      fps: number;
      memory: number;
      domNodes: number;
      eventListeners: number;
    };
    autoOptimize: boolean;
  };

  // Memory Management
  memory: {
    enabled: boolean;
    samplingInterval: number;
    alertThreshold: number;
    leakDetectionWindow: number;
    maxSnapshots: number;
    enableAutoCleanup: boolean;
    enableDetailedTracking: boolean;
  };

  // Bundle Optimization
  bundle: {
    enabled: boolean;
    enableCodeSplitting: boolean;
    enableTreeShaking: boolean;
    enableCompression: boolean;
    enablePreloading: boolean;
    chunkSizeLimit: number;
    preloadThreshold: number;
    cacheStrategy: "aggressive" | "conservative" | "custom";
  };

  // Lazy Loading
  lazyLoading: {
    enabled: boolean;
    minLoadingTime: number;
    retryable: boolean;
    preloadOnHover: boolean;
    intersectionThreshold: number;
    rootMargin: string;
  };

  // Cache Management
  cache: {
    enabled: boolean;
    defaultTTL: number;
    maxSize: number;
    enablePersistence: boolean;
    strategies: {
      api: { ttl: number; maxSize: number };
      user: { ttl: number; maxSize: number };
      static: { ttl: number; maxSize: number };
    };
  };

  // Error Handling
  errorHandling: {
    enabled: boolean;
    enableBoundaries: boolean;
    enableRetry: boolean;
    maxRetries: number;
    enableLogging: boolean;
    enableReporting: boolean;
  };

  // Notifications
  notifications: {
    enabled: boolean;
    maxVisible: number;
    defaultDuration: number;
    enablePersistence: boolean;
    enableSound: boolean;
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  };

  // Development
  development: {
    enableDebugMode: boolean;
    enablePerformanceLogs: boolean;
    enableMemoryLogs: boolean;
    enableBundleLogs: boolean;
    showOptimizationHints: boolean;
  };
}

// =====================================================================================
// DEFAULT CONFIGURATION
// =====================================================================================

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  performance: {
    enabled: true,
    samplingInterval: 1000, // 1 second
    alertThresholds: {
      fps: 30,
      memory: 100 * 1024 * 1024, // 100MB
      domNodes: 5000,
      eventListeners: 1000,
    },
    autoOptimize: true,
  },

  memory: {
    enabled: true,
    samplingInterval: 5000, // 5 seconds
    alertThreshold: 80, // 80% memory usage
    leakDetectionWindow: 60000, // 1 minute
    maxSnapshots: 100,
    enableAutoCleanup: true,
    enableDetailedTracking: true,
  },

  bundle: {
    enabled: true,
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableCompression: true,
    enablePreloading: true,
    chunkSizeLimit: 250000, // 250KB
    preloadThreshold: 0.8,
    cacheStrategy: "aggressive",
  },

  lazyLoading: {
    enabled: true,
    minLoadingTime: 200,
    retryable: true,
    preloadOnHover: true,
    intersectionThreshold: 0.1,
    rootMargin: "50px",
  },

  cache: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxSize: 100,
    enablePersistence: true,
    strategies: {
      api: { ttl: 300000, maxSize: 50 }, // 5 minutes, 50 items
      user: { ttl: 3600000, maxSize: 20 }, // 1 hour, 20 items
      static: { ttl: 86400000, maxSize: 100 }, // 24 hours, 100 items
    },
  },

  errorHandling: {
    enabled: true,
    enableBoundaries: true,
    enableRetry: true,
    maxRetries: 3,
    enableLogging: true,
    enableReporting: true,
  },

  notifications: {
    enabled: true,
    maxVisible: 5,
    defaultDuration: 5000,
    enablePersistence: true,
    enableSound: false,
    position: "top-right",
  },

  development: {
    enableDebugMode: process.env.NODE_ENV === "development",
    enablePerformanceLogs: process.env.NODE_ENV === "development",
    enableMemoryLogs: process.env.NODE_ENV === "development",
    enableBundleLogs: process.env.NODE_ENV === "development",
    showOptimizationHints: process.env.NODE_ENV === "development",
  },
};

// =====================================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// =====================================================================================

export const PRODUCTION_CONFIG: Partial<OptimizationConfig> = {
  performance: {
    enabled: true,
    samplingInterval: 5000, // Less frequent in production
    alertThresholds: {
      fps: 30,
      memory: 150 * 1024 * 1024, // 150MB
      domNodes: 8000,
      eventListeners: 1500,
    },
    autoOptimize: true,
  },

  memory: {
    enabled: true,
    samplingInterval: 10000, // 10 seconds
    alertThreshold: 85,
    enableDetailedTracking: false, // Reduce overhead
  },

  development: {
    enableDebugMode: false,
    enablePerformanceLogs: false,
    enableMemoryLogs: false,
    enableBundleLogs: false,
    showOptimizationHints: false,
  },
};

export const DEVELOPMENT_CONFIG: Partial<OptimizationConfig> = {
  performance: {
    enabled: true,
    samplingInterval: 1000,
    autoOptimize: false, // Manual control in development
  },

  memory: {
    enabled: true,
    samplingInterval: 2000, // More frequent monitoring
    alertThreshold: 70, // Lower threshold for early detection
    enableDetailedTracking: true,
  },

  development: {
    enableDebugMode: true,
    enablePerformanceLogs: true,
    enableMemoryLogs: true,
    enableBundleLogs: true,
    showOptimizationHints: true,
  },
};

export const TESTING_CONFIG: Partial<OptimizationConfig> = {
  performance: {
    enabled: false, // Disable during tests
  },

  memory: {
    enabled: false,
  },

  bundle: {
    enabled: false,
  },

  lazyLoading: {
    enabled: false,
    minLoadingTime: 0, // No delays in tests
  },

  cache: {
    enabled: false, // Fresh state for each test
  },

  notifications: {
    enabled: false,
  },
};

// =====================================================================================
// CONFIGURATION MANAGER
// =====================================================================================

class OptimizationConfigManager {
  private config: OptimizationConfig;
  private observers: Set<(config: OptimizationConfig) => void> = new Set();

  constructor(initialConfig?: Partial<OptimizationConfig>) {
    this.config = this.mergeConfigs(DEFAULT_OPTIMIZATION_CONFIG, initialConfig);
    this.loadEnvironmentConfig();
  }

  private mergeConfigs(
    base: OptimizationConfig,
    override?: Partial<OptimizationConfig>,
  ): OptimizationConfig {
    if (!override) return { ...base };

    const merged = { ...base };

    Object.keys(override).forEach((key) => {
      const typedKey = key as keyof OptimizationConfig;
      if (typeof override[typedKey] === "object" && !Array.isArray(override[typedKey])) {
        merged[typedKey] = {
          ...merged[typedKey],
          ...override[typedKey],
        } as any;
      } else {
        (merged as any)[typedKey] = override[typedKey];
      }
    });

    return merged;
  }

  private loadEnvironmentConfig() {
    const env = process.env.NODE_ENV;

    switch (env) {
      case "production":
        this.config = this.mergeConfigs(this.config, PRODUCTION_CONFIG);
        break;
      case "development":
        this.config = this.mergeConfigs(this.config, DEVELOPMENT_CONFIG);
        break;
      case "test":
        this.config = this.mergeConfigs(this.config, TESTING_CONFIG);
        break;
    }

    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("neonpro-optimization-config");
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          this.config = this.mergeConfigs(this.config, parsed);
        } catch (error) {
          console.warn("Failed to load saved optimization config:", error);
        }
      }
    }
  }

  public getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfig();
    this.notifyObservers();
  }

  public resetConfig(): void {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG };
    this.loadEnvironmentConfig();
    this.saveConfig();
    this.notifyObservers();
  }

  public subscribe(observer: (config: OptimizationConfig) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private saveConfig(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("neonpro-optimization-config", JSON.stringify(this.config));
      } catch (error) {
        console.warn("Failed to save optimization config:", error);
      }
    }
  }

  private notifyObservers(): void {
    this.observers.forEach((observer) => observer(this.config));
  }

  // Specific getters for different modules
  public getPerformanceConfig() {
    return this.config.performance;
  }

  public getMemoryConfig() {
    return this.config.memory;
  }

  public getBundleConfig() {
    return this.config.bundle;
  }

  public getLazyLoadingConfig() {
    return this.config.lazyLoading;
  }

  public getCacheConfig() {
    return this.config.cache;
  }

  public getErrorHandlingConfig() {
    return this.config.errorHandling;
  }

  public getNotificationsConfig() {
    return this.config.notifications;
  }

  public getDevelopmentConfig() {
    return this.config.development;
  }

  // Feature flags
  public isFeatureEnabled(feature: keyof OptimizationConfig): boolean {
    return (this.config[feature] as any)?.enabled ?? false;
  }

  public enableFeature(feature: keyof OptimizationConfig): void {
    if (this.config[feature] && typeof this.config[feature] === "object") {
      (this.config[feature] as any).enabled = true;
      this.saveConfig();
      this.notifyObservers();
    }
  }

  public disableFeature(feature: keyof OptimizationConfig): void {
    if (this.config[feature] && typeof this.config[feature] === "object") {
      (this.config[feature] as any).enabled = false;
      this.saveConfig();
      this.notifyObservers();
    }
  }
}

// =====================================================================================
// REACT HOOKS
// =====================================================================================

import { useCallback, useEffect, useState } from "react";

export function useOptimizationConfig(initialConfig?: Partial<OptimizationConfig>) {
  const [manager] = useState(() => new OptimizationConfigManager(initialConfig));
  const [config, setConfig] = useState<OptimizationConfig>(manager.getConfig());

  useEffect(() => {
    const unsubscribe = manager.subscribe(setConfig);
    return unsubscribe;
  }, [manager]);

  const updateConfig = useCallback(
    (updates: Partial<OptimizationConfig>) => {
      manager.updateConfig(updates);
    },
    [manager],
  );

  const resetConfig = useCallback(() => {
    manager.resetConfig();
  }, [manager]);

  const isFeatureEnabled = useCallback(
    (feature: keyof OptimizationConfig) => {
      return manager.isFeatureEnabled(feature);
    },
    [manager],
  );

  const enableFeature = useCallback(
    (feature: keyof OptimizationConfig) => {
      manager.enableFeature(feature);
    },
    [manager],
  );

  const disableFeature = useCallback(
    (feature: keyof OptimizationConfig) => {
      manager.disableFeature(feature);
    },
    [manager],
  );

  return {
    config,
    updateConfig,
    resetConfig,
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    // Specific config getters
    performance: config.performance,
    memory: config.memory,
    bundle: config.bundle,
    lazyLoading: config.lazyLoading,
    cache: config.cache,
    errorHandling: config.errorHandling,
    notifications: config.notifications,
    development: config.development,
  };
}

export function useFeatureFlag(feature: keyof OptimizationConfig) {
  const { isFeatureEnabled, enableFeature, disableFeature } = useOptimizationConfig();

  return {
    enabled: isFeatureEnabled(feature),
    enable: () => enableFeature(feature),
    disable: () => disableFeature(feature),
    toggle: () => {
      if (isFeatureEnabled(feature)) {
        disableFeature(feature);
      } else {
        enableFeature(feature);
      }
    },
  };
}

// =====================================================================================
// GLOBAL INSTANCE
// =====================================================================================

export const globalOptimizationConfig = new OptimizationConfigManager();

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

export function createOptimizedConfig(overrides: Partial<OptimizationConfig>): OptimizationConfig {
  const manager = new OptimizationConfigManager(overrides);
  return manager.getConfig();
}

export function validateConfig(config: Partial<OptimizationConfig>): boolean {
  try {
    // Basic validation
    if (config.performance?.samplingInterval && config.performance.samplingInterval < 100) {
      console.warn("Performance sampling interval too low, minimum is 100ms");
      return false;
    }

    if (
      config.memory?.alertThreshold &&
      (config.memory.alertThreshold < 0 || config.memory.alertThreshold > 100)
    ) {
      console.warn("Memory alert threshold must be between 0 and 100");
      return false;
    }

    if (config.bundle?.chunkSizeLimit && config.bundle.chunkSizeLimit < 10000) {
      console.warn("Bundle chunk size limit too low, minimum is 10KB");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Config validation error:", error);
    return false;
  }
}

export function getOptimalConfigForDevice(): Partial<OptimizationConfig> {
  if (typeof window === "undefined") return {};

  const memory = (navigator as any).deviceMemory || 4; // Default to 4GB
  const _cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
  const connection = (navigator as any).connection;

  const config: Partial<OptimizationConfig> = {};

  // Adjust based on device memory
  if (memory <= 2) {
    // Low memory device
    config.memory = {
      enabled: true,
      alertThreshold: 70,
      enableDetailedTracking: false,
      maxSnapshots: 50,
    };
    config.performance = {
      enabled: true,
      samplingInterval: 2000,
      autoOptimize: true,
    };
  } else if (memory >= 8) {
    // High memory device
    config.memory = {
      enabled: true,
      alertThreshold: 90,
      enableDetailedTracking: true,
      maxSnapshots: 200,
    };
    config.performance = {
      enabled: true,
      samplingInterval: 500,
      autoOptimize: false,
    };
  }

  // Adjust based on connection
  if (connection) {
    if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
      config.bundle = {
        enabled: true,
        enablePreloading: false,
        chunkSizeLimit: 100000, // 100KB
      };
      config.lazyLoading = {
        enabled: true,
        preloadOnHover: false,
      };
    } else if (connection.effectiveType === "4g") {
      config.bundle = {
        enabled: true,
        enablePreloading: true,
        chunkSizeLimit: 500000, // 500KB
      };
      config.lazyLoading = {
        enabled: true,
        preloadOnHover: true,
      };
    }
  }

  return config;
}

export default OptimizationConfigManager;
