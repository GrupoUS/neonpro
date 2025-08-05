/**
 * Vision Analysis System - Main Export Index
 * Centralized exports for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */

// Configuration
export {
  VISION_CONFIG,
  TREATMENT_TYPES,
  ANALYSIS_STATUS,
  ERROR_CODES,
  QUALITY_THRESHOLDS,
  validateVoidBeastCompliance,
  getEnvironmentConfig,
} from "./config";

// Types
export type {
  // Base Types
  TreatmentType,
  AnalysisStatus,
  ErrorCode,
  // Image Types
  ImageData,
  ImageMetadata,
  ImageProcessingOptions,
  // Analysis Types
  AnalysisResult,
  VisionAnalysisData,
  ChangeMetrics,
  OverallAssessment,
  TreatmentSpecificMetrics,
  // Measurement Types
  MeasurementData,
  MeasurementType,
  ObjectiveMeasurement,
  CalibrationData,
  StandardizedMetrics,
  MetricSet,
  NormalizedScores,
  MeasurementQualityAssurance,
  // Annotation Types
  AnnotationData,
  AnnotationType,
  Coordinates,
  RegionOfInterest,
  // Performance Types
  ProcessingMetrics,
  QualityMetrics,
  ImageQualityMetrics,
  AnalysisQualityMetrics,
  MeasurementQualityMetrics,
  VoidBeastCompliance,
  // Model Types
  ModelConfiguration,
  ModelMetadata,
  ModelPrediction,
  BoundingBox,
  // Export Types
  ExportOptions,
  ExportResult,
  ExportMetadata,
  // API Types
  AnalysisRequest,
  AnalysisOptions,
  AnalysisResponse,
  AnalysisProgress,
  AnalysisError,
  // Database Types
  VisionAnalysisTable,
  VisionExportLogsTable,
  VisionPerformanceLogsTable,
  // Utility Types
  PaginationOptions,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  // Event Types
  AnalysisEvent,
  // Validation Types
  ValidationResult,
  ValidationError,
  ValidationWarning,
  // Configuration Types
  SystemConfiguration,
  PerformanceConfig,
  ImageProcessingConfig,
  ModelConfig,
  StorageConfig,
  SecurityConfig,
  MonitoringConfig,
} from "./types";

// Utilities
export {
  VisionUtils,
  ImageUtils,
  AnalysisUtils,
  MeasurementUtils,
  AnnotationUtils,
  PerformanceUtils,
  ExportUtils,
  DateUtils,
  ErrorUtils,
} from "./utils";

// Hooks
export {
  useVisionAnalysis,
  useImageUpload,
  useAnalysisExport,
  useAnnotations,
  useMeasurements,
  useAnalysisHistory,
  usePerformanceMonitoring,
  useLocalStorage,
  useDebounce,
  useIntersectionObserver,
} from "./hooks";

// Re-export default hooks object
export { default as VisionHooks } from "./hooks";

/**
 * Main Vision System Class
 * Provides a unified interface for all vision analysis operations
 */
export class VisionSystem {
  private static instance: VisionSystem;
  private config: typeof VISION_CONFIG;

  private constructor() {
    this.config = VISION_CONFIG;
  }

  public static getInstance(): VisionSystem {
    if (!VisionSystem.instance) {
      VisionSystem.instance = new VisionSystem();
    }
    return VisionSystem.instance;
  }

  /**
   * Initialize the vision system
   */
  public async initialize(): Promise<void> {
    try {
      // Validate environment
      const compliance = validateVoidBeastCompliance();
      if (!compliance.isCompliant) {
        console.warn("VoidBeast compliance issues:", compliance.issues);
      }

      // Log initialization
      console.log("NeonPro Vision System initialized successfully");
      console.log("Configuration:", this.config);
    } catch (error) {
      console.error("Failed to initialize Vision System:", error);
      throw error;
    }
  }

  /**
   * Get system configuration
   */
  public getConfig() {
    return this.config;
  }

  /**
   * Validate system health
   */
  public async validateHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    performance: any;
  }> {
    const issues: string[] = [];

    try {
      // Check API endpoints
      const endpoints = ["/api/vision/analyze", "/api/vision/upload", "/api/vision/export"];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, { method: "HEAD" });
          if (!response.ok && response.status !== 405) {
            issues.push(`Endpoint ${endpoint} not responding`);
          }
        } catch (error) {
          issues.push(`Endpoint ${endpoint} unreachable`);
        }
      }

      // Check browser capabilities
      if (!window.File || !window.FileReader || !window.FormData) {
        issues.push("Browser lacks required file handling capabilities");
      }

      if (!window.HTMLCanvasElement) {
        issues.push("Browser lacks canvas support");
      }

      // Check memory
      const memoryInfo = VisionUtils.Performance.getMemoryUsage();
      if (memoryInfo && memoryInfo.used > 100) {
        // 100MB threshold
        issues.push("High memory usage detected");
      }

      return {
        healthy: issues.length === 0,
        issues,
        performance: {
          memory: memoryInfo,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      issues.push(`Health check failed: ${error}`);
      return {
        healthy: false,
        issues,
        performance: null,
      };
    }
  }

  /**
   * Get system statistics
   */
  public getStatistics() {
    return {
      version: "1.0.0",
      buildDate: new Date().toISOString(),
      features: {
        imageUpload: true,
        visionAnalysis: true,
        beforeAfterComparison: true,
        measurements: true,
        annotations: true,
        export: true,
        performanceMonitoring: true,
      },
      supportedFormats: this.config.IMAGE_PROCESSING.SUPPORTED_FORMATS,
      maxImageSize: this.config.IMAGE_PROCESSING.MAX_IMAGE_SIZE_MB,
      processingTimeout: this.config.PERFORMANCE.MAX_PROCESSING_TIME_MS,
      qualityThresholds: {
        accuracy: this.config.PERFORMANCE.TARGET_ACCURACY,
        confidence: this.config.PERFORMANCE.MIN_CONFIDENCE_THRESHOLD,
      },
    };
  }
}

/**
 * Convenience function to get the vision system instance
 */
export const getVisionSystem = () => VisionSystem.getInstance();

/**
 * Initialize the vision system (call this in your app initialization)
 */
export const initializeVisionSystem = async () => {
  const system = getVisionSystem();
  await system.initialize();
  return system;
};

/**
 * Default export - Vision System instance
 */
export default VisionSystem;

/**
 * Version information
 */
export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: Date.now(),
  string: "1.0.0",
  codename: "VoidBeast V4.0 Apex Enhanced",
};

/**
 * Feature flags for conditional functionality
 */
export const FEATURE_FLAGS = {
  ADVANCED_MEASUREMENTS: true,
  REAL_TIME_ANALYSIS: true,
  BATCH_PROCESSING: false, // Future feature
  AI_SUGGESTIONS: false, // Future feature
  COLLABORATIVE_ANNOTATIONS: false, // Future feature
  CLOUD_STORAGE: true,
  OFFLINE_MODE: false, // Future feature
  MOBILE_OPTIMIZATION: true,
  ACCESSIBILITY_FEATURES: true,
  PERFORMANCE_PROFILING: true,
};

/**
 * System constants
 */
export const SYSTEM_CONSTANTS = {
  MAX_CONCURRENT_ANALYSES: 3,
  DEFAULT_CACHE_TTL: 300000, // 5 minutes
  MAX_HISTORY_ITEMS: 100,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10% sampling
  ERROR_RETRY_ATTEMPTS: 3,
  NETWORK_TIMEOUT: 30000, // 30 seconds
  IMAGE_PREVIEW_SIZE: 200, // pixels
  THUMBNAIL_QUALITY: 0.8,
  EXPORT_BATCH_SIZE: 10,
};

/**
 * Event types for system monitoring
 */
export const SYSTEM_EVENTS = {
  ANALYSIS_STARTED: "vision:analysis:started",
  ANALYSIS_COMPLETED: "vision:analysis:completed",
  ANALYSIS_FAILED: "vision:analysis:failed",
  IMAGE_UPLOADED: "vision:image:uploaded",
  EXPORT_GENERATED: "vision:export:generated",
  PERFORMANCE_WARNING: "vision:performance:warning",
  QUALITY_THRESHOLD_EXCEEDED: "vision:quality:threshold_exceeded",
  SYSTEM_ERROR: "vision:system:error",
} as const;

/**
 * Type for system events
 */
export type SystemEventType = (typeof SYSTEM_EVENTS)[keyof typeof SYSTEM_EVENTS];

/**
 * System event interface
 */
export interface SystemEvent {
  type: SystemEventType;
  timestamp: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

/**
 * Global error handler for vision system
 */
export const handleVisionSystemError = (error: any, context?: string) => {
  const errorMessage = VisionUtils.Error.getUserFriendlyMessage(error);
  const isRecoverable = VisionUtils.Error.isRecoverableError(error);

  console.error(`Vision System Error${context ? ` (${context})` : ""}:`, {
    message: errorMessage,
    recoverable: isRecoverable,
    error,
    timestamp: new Date().toISOString(),
  });

  // Emit system event
  if (typeof window !== "undefined" && window.dispatchEvent) {
    const event = new CustomEvent(SYSTEM_EVENTS.SYSTEM_ERROR, {
      detail: {
        type: SYSTEM_EVENTS.SYSTEM_ERROR,
        timestamp: new Date().toISOString(),
        data: {
          message: errorMessage,
          recoverable: isRecoverable,
          context,
          error: error.message || error,
        },
      },
    });
    window.dispatchEvent(event);
  }

  return {
    message: errorMessage,
    recoverable: isRecoverable,
    context,
  };
};

/**
 * Performance monitoring helper
 */
export const monitorVisionPerformance = (operation: string) => {
  const timer = VisionUtils.Performance.createTimer();
  timer.start();

  return {
    end: () => {
      const duration = timer.stop();
      const memoryUsage = VisionUtils.Performance.getMemoryUsage();

      const metrics = {
        operation,
        duration,
        memory: memoryUsage,
        timestamp: new Date().toISOString(),
      };

      // Log performance warning if needed
      if (duration > VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
        console.warn(`Performance warning: ${operation} took ${duration}ms`);

        // Emit performance warning event
        if (typeof window !== "undefined" && window.dispatchEvent) {
          const event = new CustomEvent(SYSTEM_EVENTS.PERFORMANCE_WARNING, {
            detail: {
              type: SYSTEM_EVENTS.PERFORMANCE_WARNING,
              timestamp: new Date().toISOString(),
              data: metrics,
            },
          });
          window.dispatchEvent(event);
        }
      }

      return metrics;
    },
  };
};
