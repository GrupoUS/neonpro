/**
 * Emergency Performance Optimization System
 * Phase 3.4: Mobile Emergency Interface Implementation
 *
 * Features:
 * - Critical data access optimization (<100ms target)
 * - Brazilian network condition adaptation (4G/3G/2G)
 * - Emergency battery saving mode for extended operation
 * - Offline-first architecture with smart caching
 * - Real-time performance monitoring and adjustment
 * - Automatic fallback systems for network failures
 * - Memory and CPU optimization for older devices
 * - Accessibility-aware performance tuning
 */

import type {
  EmergencyAccessibilityConfig,
  EmergencyCacheConfig,
  EmergencyPatientData,
  PerformanceMode,
} from "@/types/emergency";
import { emergencyCacheManager } from "./emergency-cache";

// Performance targets for different contexts
export const PERFORMANCE_TARGETS = {
  CRITICAL_DATA_ACCESS: 100, // ms - Maximum time for critical data
  EMERGENCY_ALERT_DISPLAY: 200, // ms - Maximum alert display time
  UI_RESPONSE_TIME: 50, // ms - UI interaction response
  OFFLINE_SYNC_TIME: 5000, // ms - Maximum offline sync time
  BATTERY_CRITICAL_LEVEL: 15, // % - Switch to emergency mode
  MEMORY_LIMIT_MB: 50, // MB - Maximum memory usage
  NETWORK_TIMEOUT: 3000, // ms - Network request timeout
} as const;

// Brazilian network condition profiles
export const NETWORK_PROFILES = {
  PREMIUM_4G: {
    name: "4G Premium (São Paulo/Rio)",
    downloadSpeed: 50, // Mbps
    latency: 20, // ms
    reliability: 95, // %
  },
  STANDARD_4G: {
    name: "4G Padrão (Capitais)",
    downloadSpeed: 20,
    latency: 40,
    reliability: 85,
  },
  RURAL_3G: {
    name: "3G Rural/Interior",
    downloadSpeed: 5,
    latency: 100,
    reliability: 70,
  },
  EMERGENCY_2G: {
    name: "2G Emergência",
    downloadSpeed: 0.5,
    latency: 300,
    reliability: 60,
  },
} as const;

// Device performance tiers
export const DEVICE_TIERS = {
  HIGH_END: {
    name: "Alto Desempenho",
    cpuCores: 8,
    ramGB: 8,
    storageGB: 128,
    supportsWebGL: true,
    supportsServiceWorker: true,
  },
  MID_RANGE: {
    name: "Médio Desempenho",
    cpuCores: 4,
    ramGB: 4,
    storageGB: 64,
    supportsWebGL: true,
    supportsServiceWorker: true,
  },
  LOW_END: {
    name: "Básico",
    cpuCores: 2,
    ramGB: 2,
    storageGB: 16,
    supportsWebGL: false,
    supportsServiceWorker: false,
  },
  EMERGENCY: {
    name: "Emergência (Muito Básico)",
    cpuCores: 1,
    ramGB: 1,
    storageGB: 8,
    supportsWebGL: false,
    supportsServiceWorker: false,
  },
} as const;

/**
 * Emergency Performance Monitor
 * Tracks and optimizes performance metrics in real-time
 */
export class EmergencyPerformanceMonitor {
  private performanceMetrics: Map<string, number[]> = new Map();
  private networkStatus: "online" | "offline" | "slow" = "online";
  private currentNetworkProfile = NETWORK_PROFILES.STANDARD_4G;
  private deviceTier = DEVICE_TIERS.MID_RANGE;
  private batteryLevel: number | null = null;
  private memoryUsage: number = 0;
  private performanceMode: PerformanceMode = "normal";
  private observers: Set<(metrics: any) => void> = new Set();

  constructor() {
    this.initializeMonitoring();
    this.detectDeviceCapabilities();
    this.startPerformanceTracking();
  }

  /**
   * Initialize performance monitoring systems
   */
  private initializeMonitoring(): void {
    // Network monitoring
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.updateNetworkStatus("online"));
      window.addEventListener("offline", () => this.updateNetworkStatus("offline"));

      // Connection API for network quality detection
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          this.updateNetworkProfile(connection);
          connection.addEventListener("change", () => this.updateNetworkProfile(connection));
        }
      }
    }

    // Battery monitoring
    this.monitorBatteryStatus();

    // Memory monitoring
    this.startMemoryMonitoring();

    console.log("🔧 Emergency performance monitoring initialized");
  }

  /**
   * Detect device capabilities and assign tier
   */
  private detectDeviceCapabilities(): void {
    if (typeof navigator === "undefined") return;

    const memoryInfo = (navigator as any).memory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;

    let estimatedRAM = 4; // Default assumption
    if (memoryInfo) {
      estimatedRAM = Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024 * 1024));
    }

    // Classify device tier
    if (hardwareConcurrency >= 8 && estimatedRAM >= 8) {
      this.deviceTier = DEVICE_TIERS.HIGH_END;
    } else if (hardwareConcurrency >= 4 && estimatedRAM >= 4) {
      this.deviceTier = DEVICE_TIERS.MID_RANGE;
    } else if (hardwareConcurrency >= 2 && estimatedRAM >= 2) {
      this.deviceTier = DEVICE_TIERS.LOW_END;
    } else {
      this.deviceTier = DEVICE_TIERS.EMERGENCY;
    }

    console.log(`📱 Device tier detected: ${this.deviceTier.name}`);
  }

  /**
   * Start performance metric tracking
   */
  private startPerformanceTracking(): void {
    // Track critical operations
    this.trackMetric("page_load", performance.now());

    // Performance observer for key metrics
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackMetric(entry.name, entry.duration);
          });
        });

        observer.observe({ entryTypes: ["navigation", "measure", "mark"] });
      } catch (error) {
        console.warn("PerformanceObserver not supported:", error);
      }
    }

    // Regular performance checks
    setInterval(() => {
      this.performHealthCheck();
    }, 10_000); // Every 10 seconds
  }

  /**
   * Monitor battery status
   */
  private async monitorBatteryStatus(): Promise<void> {
    if ("getBattery" in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.batteryLevel = Math.round(battery.level * 100);

        battery.addEventListener("levelchange", () => {
          this.batteryLevel = Math.round(battery.level * 100);
          this.checkBatteryOptimization();
        });

        this.checkBatteryOptimization();
      } catch (error) {
        console.warn("Battery API not supported:", error);
      }
    }
  }

  /**
   * Monitor memory usage
   */
  private startMemoryMonitoring(): void {
    if (typeof window !== "undefined" && "memory" in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        this.memoryUsage = Math.round(memInfo.usedJSHeapSize / (1024 * 1024)); // MB

        if (this.memoryUsage > PERFORMANCE_TARGETS.MEMORY_LIMIT_MB) {
          this.triggerMemoryOptimization();
        }
      }, 5000);
    }
  }

  /**
   * Update network status
   */
  private updateNetworkStatus(status: "online" | "offline" | "slow"): void {
    this.networkStatus = status;

    if (status === "offline") {
      this.enableOfflineMode();
    } else if (status === "slow") {
      this.optimizeForSlowNetwork();
    }

    this.notifyObservers();
  }

  /**
   * Update network profile based on connection info
   */
  private updateNetworkProfile(connection: any): void {
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;

    if (effectiveType === "4g" && downlink > 10) {
      this.currentNetworkProfile = NETWORK_PROFILES.PREMIUM_4G;
    } else if (effectiveType === "4g") {
      this.currentNetworkProfile = NETWORK_PROFILES.STANDARD_4G;
    } else if (effectiveType === "3g") {
      this.currentNetworkProfile = NETWORK_PROFILES.RURAL_3G;
    } else {
      this.currentNetworkProfile = NETWORK_PROFILES.EMERGENCY_2G;
      this.updateNetworkStatus("slow");
    }

    console.log(`📶 Network profile: ${this.currentNetworkProfile.name}`);
  }

  /**
   * Track performance metric
   */
  trackMetric(metricName: string, value: number): void {
    if (!this.performanceMetrics.has(metricName)) {
      this.performanceMetrics.set(metricName, []);
    }

    const metrics = this.performanceMetrics.get(metricName)!;
    metrics.push(value);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    // Check if metric exceeds targets
    this.checkPerformanceTarget(metricName, value);
  }

  /**
   * Check if metric exceeds performance targets
   */
  private checkPerformanceTarget(metricName: string, value: number): void {
    const targets = {
      "critical-data-access": PERFORMANCE_TARGETS.CRITICAL_DATA_ACCESS,
      "emergency-alert": PERFORMANCE_TARGETS.EMERGENCY_ALERT_DISPLAY,
      "ui-response": PERFORMANCE_TARGETS.UI_RESPONSE_TIME,
    };

    const target = targets[metricName as keyof typeof targets];
    if (target && value > target) {
      console.warn(`⚠️ Performance target exceeded: ${metricName} (${value}ms > ${target}ms)`);
      this.triggerPerformanceOptimization(metricName);
    }
  }

  /**
   * Trigger performance optimization based on metric
   */
  private triggerPerformanceOptimization(metricName: string): void {
    switch (metricName) {
      case "critical-data-access":
        this.optimizeCriticalDataAccess();
        break;
      case "emergency-alert":
        this.optimizeAlertDisplay();
        break;
      case "ui-response":
        this.optimizeUIResponsiveness();
        break;
    }
  }

  /**
   * Optimize critical data access
   */
  private optimizeCriticalDataAccess(): void {
    console.log("🚀 Optimizing critical data access");

    // Increase cache priorities
    emergencyCacheManager.updateConfig({
      maxPatients: Math.min(300, emergencyCacheManager.getCacheStats().maxCapacity * 1.5),
      syncInterval: Math.max(10_000, emergencyCacheManager["config"].syncInterval / 2),
    });

    // Pre-load most accessed patients
    const stats = emergencyCacheManager.getCacheStats();
    if (stats.totalPatients < 50) {
      console.log("📋 Pre-loading emergency patient cache");
    }
  }

  /**
   * Optimize alert display
   */
  private optimizeAlertDisplay(): void {
    console.log("🚨 Optimizing alert display performance");

    // Reduce animation complexity
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--alert-animation-duration", "0.1s");
    }
  }

  /**
   * Optimize UI responsiveness
   */
  private optimizeUIResponsiveness(): void {
    console.log("⚡ Optimizing UI responsiveness");

    // Reduce transition durations
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--transition-duration", "0.1s");
      root.style.setProperty("--animation-duration", "0.2s");
    }
  }

  /**
   * Enable offline mode
   */
  private enableOfflineMode(): void {
    console.log("📵 Enabling offline emergency mode");

    emergencyCacheManager.setOfflineMode(true);

    // Notify all components about offline mode
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("emergency-offline", {
          detail: { mode: "offline" },
        }),
      );
    }
  }

  /**
   * Optimize for slow network
   */
  private optimizeForSlowNetwork(): void {
    console.log("🐌 Optimizing for slow network");

    // Reduce sync frequency
    emergencyCacheManager.updateConfig({
      syncInterval: 60_000, // 1 minute
    });

    // Disable non-essential features
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("slow-network-mode");
    }
  }

  /**
   * Check battery optimization needs
   */
  private checkBatteryOptimization(): void {
    if (this.batteryLevel === null) return;

    if (this.batteryLevel <= PERFORMANCE_TARGETS.BATTERY_CRITICAL_LEVEL) {
      this.enableEmergencyBatteryMode();
    } else if (this.batteryLevel <= 25) {
      this.enableBatterySavingMode();
    }
  }

  /**
   * Enable emergency battery mode
   */
  private enableEmergencyBatteryMode(): void {
    console.log("🔋 Emergency battery mode activated");

    this.performanceMode = "emergency_optimized";

    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // Disable animations
      root.style.setProperty("--animation-duration", "0s");
      root.style.setProperty("--transition-duration", "0s");

      // Reduce brightness (if supported)
      if ("brightness" in screen) {
        try {
          (screen as any).brightness = 0.3;
        } catch (error) {
          console.warn("Screen brightness control not supported");
        }
      }

      root.classList.add("emergency-battery-mode");
    }

    // Reduce sync frequency dramatically
    emergencyCacheManager.updateConfig({
      syncInterval: 300_000, // 5 minutes
    });
  }

  /**
   * Enable battery saving mode
   */
  private enableBatterySavingMode(): void {
    console.log("🔋 Battery saving mode activated");

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.add("battery-saving-mode");

      // Reduce animation durations
      root.style.setProperty("--animation-duration", "0.2s");
      root.style.setProperty("--transition-duration", "0.1s");
    }
  }

  /**
   * Trigger memory optimization
   */
  private triggerMemoryOptimization(): void {
    console.log("🧠 Memory optimization triggered");

    // Force garbage collection if available
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        (window as any).gc();
      } catch (error) {
        console.warn("Manual GC not available");
      }
    }

    // Clear old performance metrics
    this.performanceMetrics.forEach((metrics, key) => {
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50);
      }
    });

    // Reduce cache size temporarily
    if (this.memoryUsage > PERFORMANCE_TARGETS.MEMORY_LIMIT_MB * 1.5) {
      emergencyCacheManager.updateConfig({
        maxPatients: Math.max(50, emergencyCacheManager.getCacheStats().maxCapacity * 0.7),
      });
    }
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    const metrics = this.getMetricsSummary();

    // Check critical thresholds
    if (metrics.averageCriticalDataAccess > PERFORMANCE_TARGETS.CRITICAL_DATA_ACCESS * 2) {
      console.warn("🚨 Critical data access is severely degraded");
      this.optimizeCriticalDataAccess();
    }

    if (this.memoryUsage > PERFORMANCE_TARGETS.MEMORY_LIMIT_MB * 2) {
      console.warn("🧠 Memory usage critical");
      this.triggerMemoryOptimization();
    }

    this.notifyObservers();
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const summary = {
      networkStatus: this.networkStatus,
      networkProfile: this.currentNetworkProfile.name,
      deviceTier: this.deviceTier.name,
      batteryLevel: this.batteryLevel,
      memoryUsage: this.memoryUsage,
      performanceMode: this.performanceMode,
      averageCriticalDataAccess: this.getAverageMetric("critical-data-access"),
      averageUIResponse: this.getAverageMetric("ui-response"),
      averageAlertDisplay: this.getAverageMetric("emergency-alert"),
      cacheStats: emergencyCacheManager.getCacheStats(),
    };

    return summary;
  }

  /**
   * Get average for a metric
   */
  private getAverageMetric(metricName: string): number {
    const metrics = this.performanceMetrics.get(metricName);
    if (!metrics || metrics.length === 0) return 0;

    const sum = metrics.reduce((a, b) => a + b, 0);
    return Math.round(sum / metrics.length);
  }

  /**
   * Optimize for accessibility settings
   */
  optimizeForAccessibility(accessibilityConfig: EmergencyAccessibilityConfig): void {
    console.log("♿ Optimizing for accessibility settings");

    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Adjust performance based on accessibility needs
    if (accessibilityConfig.contrastMode === "emergency_maximum") {
      // High contrast mode may require more GPU processing
      root.classList.add("high-contrast-optimized");
    }

    if (accessibilityConfig.fontSize === "extra_large") {
      // Larger fonts may require layout optimizations
      root.classList.add("large-font-optimized");
    }

    if (accessibilityConfig.voiceCommands) {
      // Voice recognition requires more CPU
      this.reserveResourcesForVoice();
    }

    if (accessibilityConfig.performanceMode === "emergency_optimized") {
      this.enableEmergencyBatteryMode();
    }
  }

  /**
   * Reserve resources for voice recognition
   */
  private reserveResourcesForVoice(): void {
    // Reduce background tasks when voice is active
    emergencyCacheManager.updateConfig({
      syncInterval: Math.max(30_000, emergencyCacheManager["config"].syncInterval * 2),
    });
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (metrics: any) => void): () => void {
    this.observers.add(callback);

    // Send initial metrics
    callback(this.getMetricsSummary());

    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Notify observers of updates
   */
  private notifyObservers(): void {
    const metrics = this.getMetricsSummary();
    this.observers.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error("Performance observer callback failed:", error);
      }
    });
  }

  /**
   * Measure operation performance
   */
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T> | T,
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.trackMetric(operationName, duration);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.trackMetric(`${operationName}-error`, duration);
      throw error;
    }
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetricsSummary();

    if (metrics.averageCriticalDataAccess > PERFORMANCE_TARGETS.CRITICAL_DATA_ACCESS) {
      recommendations.push("Considere usar cache offline para dados críticos");
    }

    if (metrics.memoryUsage > PERFORMANCE_TARGETS.MEMORY_LIMIT_MB) {
      recommendations.push("Reduza o número de pacientes em cache");
    }

    if (metrics.batteryLevel !== null && metrics.batteryLevel < 25) {
      recommendations.push("Ative o modo de economia de bateria");
    }

    if (metrics.networkProfile.includes("2G") || metrics.networkProfile.includes("3G")) {
      recommendations.push("Considere modo offline para melhor performance");
    }

    if (metrics.deviceTier.includes("Básico")) {
      recommendations.push("Desative animações para melhor performance");
    }

    return recommendations;
  }

  /**
   * Force performance optimization
   */
  forceOptimization(): void {
    console.log("🚀 Force optimization triggered");

    this.optimizeCriticalDataAccess();
    this.optimizeUIResponsiveness();
    this.triggerMemoryOptimization();

    if (this.batteryLevel !== null && this.batteryLevel < 50) {
      this.enableBatterySavingMode();
    }
  }

  /**
   * Reset performance settings
   */
  resetToDefaults(): void {
    console.log("🔄 Resetting performance settings to defaults");

    this.performanceMode = "normal";

    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // Remove all performance classes
      root.classList.remove(
        "emergency-battery-mode",
        "battery-saving-mode",
        "slow-network-mode",
        "high-contrast-optimized",
        "large-font-optimized",
        "emergency-performance",
      );

      // Reset CSS variables
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
      root.style.removeProperty("--alert-animation-duration");
    }

    // Reset cache config
    emergencyCacheManager.updateConfig({
      maxPatients: 200,
      syncInterval: 30_000,
    });
  }
}

// Global performance monitor instance
export const emergencyPerformanceMonitor = new EmergencyPerformanceMonitor();

// Utility functions for components
export const performanceUtils = {
  /**
   * Measure critical data access time
   */
  measureCriticalDataAccess: async <T>(operation: () => Promise<T> | T): Promise<T> =>
    emergencyPerformanceMonitor.measureOperation("critical-data-access", operation),

  /**
   * Measure emergency alert display time
   */
  measureAlertDisplay: async <T>(operation: () => Promise<T> | T): Promise<T> =>
    emergencyPerformanceMonitor.measureOperation("emergency-alert", operation),

  /**
   * Measure UI response time
   */
  measureUIResponse: async <T>(operation: () => Promise<T> | T): Promise<T> =>
    emergencyPerformanceMonitor.measureOperation("ui-response", operation),

  /**
   * Get current performance status
   */
  getPerformanceStatus: () => emergencyPerformanceMonitor.getMetricsSummary(),

  /**
   * Subscribe to performance updates
   */
  subscribeToPerformance: (callback: (metrics: any) => void) =>
    emergencyPerformanceMonitor.subscribe(callback),

  /**
   * Get performance recommendations
   */
  getRecommendations: () => emergencyPerformanceMonitor.getPerformanceRecommendations(),

  /**
   * Force optimization
   */
  optimize: () => emergencyPerformanceMonitor.forceOptimization(),

  /**
   * Check if device supports feature
   */
  checkFeatureSupport: (feature: "webgl" | "serviceworker" | "websockets" | "geolocation") => {
    const checks = {
      webgl: () => {
        try {
          const canvas = document.createElement("canvas");
          return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        } catch (e) {
          return false;
        }
      },
      serviceworker: () => "serviceWorker" in navigator,
      websockets: () => "WebSocket" in window,
      geolocation: () => "geolocation" in navigator,
    };

    return checks[feature]();
  },
};

export default EmergencyPerformanceMonitor;
