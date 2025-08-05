/**
 * Vision Analysis System Configuration
 * Centralized configuration for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUALITY_THRESHOLDS =
  exports.ERROR_CODES =
  exports.ANALYSIS_STATUS =
  exports.TREATMENT_TYPES =
  exports.VISION_CONFIG =
    void 0;
exports.validateVoidBeastCompliance = validateVoidBeastCompliance;
exports.getEnvironmentConfig = getEnvironmentConfig;
// Performance and Quality Thresholds
exports.VISION_CONFIG = {
  // Performance Requirements (VOIDBEAST V4.0 Standards)
  PERFORMANCE: {
    MAX_PROCESSING_TIME_MS: 30000, // 30 seconds max
    TARGET_PROCESSING_TIME_MS: 15000, // 15 seconds target
    MIN_ACCURACY_THRESHOLD: 0.95, // 95% minimum accuracy
    TARGET_ACCURACY: 0.98, // 98% target accuracy
    MIN_CONFIDENCE_THRESHOLD: 0.85, // 85% minimum confidence
    QUALITY_THRESHOLD: 9.5, // VOIDBEAST quality standard
    MAX_MEMORY_USAGE_MB: 2048, // 2GB max memory
    GPU_ACCELERATION_ENABLED: true,
    PARALLEL_PROCESSING_ENABLED: true,
    CACHE_ENABLED: true,
    CACHE_TTL_MS: 3600000, // 1 hour cache TTL
  },
  // Image Processing Settings
  IMAGE_PROCESSING: {
    MAX_IMAGE_SIZE_MB: 50, // 50MB max file size
    SUPPORTED_FORMATS: ["jpg", "jpeg", "png", "webp", "tiff"],
    TARGET_RESOLUTION: {
      width: 1024,
      height: 1024,
    },
    MIN_RESOLUTION: {
      width: 256,
      height: 256,
    },
    MAX_RESOLUTION: {
      width: 4096,
      height: 4096,
    },
    COMPRESSION_QUALITY: 0.9,
    NORMALIZATION: {
      mean: [0.485, 0.456, 0.406], // ImageNet standards
      std: [0.229, 0.224, 0.225],
    },
    ENHANCEMENT: {
      contrast_adjustment: true,
      noise_reduction: true,
      color_normalization: true,
      histogram_equalization: false,
    },
  },
  // Analysis Models Configuration
  MODELS: {
    PRIMARY_MODEL: {
      name: "medical-vision-v2",
      url: "/models/medical-vision-v2.json",
      weights_url: "/models/medical-vision-v2-weights.bin",
      input_shape: [224, 224, 3],
      output_classes: 10,
      confidence_threshold: 0.85,
    },
    FALLBACK_MODEL: {
      name: "general-vision-v1",
      url: "/models/general-vision-v1.json",
      weights_url: "/models/general-vision-v1-weights.bin",
      input_shape: [224, 224, 3],
      output_classes: 5,
      confidence_threshold: 0.75,
    },
    PRELOAD_MODELS: true,
    MODEL_CACHE_SIZE: 3, // Number of models to keep in memory
    AUTO_MODEL_SELECTION: true,
  },
  // Treatment-Specific Analysis Parameters
  TREATMENT_ANALYSIS: {
    SKIN_TEXTURE: {
      enabled: true,
      weight: 0.25,
      metrics: ["roughness", "smoothness", "pore_size", "uniformity"],
      sensitivity: 0.1,
      roi_detection: true,
    },
    WRINKLE_REDUCTION: {
      enabled: true,
      weight: 0.3,
      metrics: ["depth", "length", "count", "severity"],
      edge_detection_threshold: 0.3,
      morphological_operations: true,
    },
    PIGMENTATION: {
      enabled: true,
      weight: 0.2,
      metrics: ["uniformity", "contrast", "spot_count", "intensity"],
      color_space: "LAB",
      histogram_analysis: true,
    },
    LESION_HEALING: {
      enabled: true,
      weight: 0.35,
      metrics: ["area", "perimeter", "color_change", "texture_change"],
      segmentation_threshold: 0.5,
      border_analysis: true,
    },
    SCAR_REDUCTION: {
      enabled: true,
      weight: 0.25,
      metrics: ["visibility", "texture", "color_match", "elevation"],
      texture_analysis: true,
      color_matching: true,
    },
    VOLUME_CHANGE: {
      enabled: true,
      weight: 0.3,
      metrics: ["volume_difference", "contour_change", "symmetry"],
      depth_estimation: true,
      stereo_analysis: false,
    },
    SYMMETRY_IMPROVEMENT: {
      enabled: true,
      weight: 0.2,
      metrics: ["bilateral_symmetry", "proportional_balance"],
      landmark_detection: true,
      geometric_analysis: true,
    },
  },
  // Measurement System Configuration
  MEASUREMENT: {
    CALIBRATION: {
      auto_calibration: true,
      reference_objects: ["coin", "ruler", "grid"],
      pixel_to_mm_ratio: 1.0, // Default, auto-calibrated
      calibration_accuracy_threshold: 0.95,
    },
    OBJECTIVE_METRICS: {
      area_measurement: true,
      perimeter_measurement: true,
      volume_estimation: true,
      distance_measurement: true,
      angle_measurement: true,
      intensity_analysis: true,
      texture_analysis: true,
      color_analysis: true,
      symmetry_analysis: true,
      roughness_analysis: true,
    },
    UNITS: {
      length: "mm",
      area: "mm²",
      volume: "mm³",
      angle: "degrees",
      intensity: "normalized",
      texture: "glcm_contrast",
      color: "lab_delta_e",
    },
    PRECISION: {
      length: 2, // decimal places
      area: 2,
      volume: 3,
      angle: 1,
      percentage: 1,
    },
  },
  // Annotation System
  ANNOTATIONS: {
    AUTO_ANNOTATION: true,
    ANNOTATION_TYPES: ["measurement", "highlight", "comparison", "improvement", "concern", "note"],
    CONFIDENCE_DISPLAY: true,
    COORDINATE_PRECISION: 1,
    MAX_ANNOTATIONS_PER_IMAGE: 50,
    ANNOTATION_PERSISTENCE: true,
  },
  // Database and Storage
  STORAGE: {
    IMAGE_BUCKET: "vision-images",
    RESULTS_BUCKET: "vision-results",
    TEMP_BUCKET: "vision-temp",
    MAX_STORAGE_PER_USER_GB: 10,
    AUTO_CLEANUP_TEMP_FILES: true,
    TEMP_FILE_TTL_HOURS: 24,
    BACKUP_ENABLED: true,
    COMPRESSION_ENABLED: true,
  },
  // Security and Privacy
  SECURITY: {
    ENCRYPTION_ENABLED: true,
    ANONYMIZATION_ENABLED: true,
    AUDIT_LOGGING: true,
    ACCESS_CONTROL: "RLS", // Row Level Security
    DATA_RETENTION_DAYS: 2555, // 7 years for medical data
    GDPR_COMPLIANCE: true,
    HIPAA_COMPLIANCE: true,
  },
  // Export Configuration
  EXPORT: {
    SUPPORTED_FORMATS: ["pdf", "excel", "json", "csv", "png", "jpeg"],
    MAX_EXPORT_SIZE_MB: 100,
    INCLUDE_IMAGES_BY_DEFAULT: true,
    INCLUDE_ANNOTATIONS_BY_DEFAULT: true,
    INCLUDE_MEASUREMENTS_BY_DEFAULT: true,
    WATERMARK_ENABLED: false,
    COMPRESSION_LEVELS: ["none", "low", "medium", "high"],
    DEFAULT_COMPRESSION: "medium",
    BATCH_EXPORT_LIMIT: 100,
  },
  // Monitoring and Analytics
  MONITORING: {
    PERFORMANCE_TRACKING: true,
    ERROR_TRACKING: true,
    USAGE_ANALYTICS: true,
    QUALITY_METRICS: true,
    REAL_TIME_MONITORING: true,
    ALERT_THRESHOLDS: {
      processing_time_ms: 25000, // Alert if > 25s
      accuracy_drop: 0.05, // Alert if accuracy drops > 5%
      error_rate: 0.01, // Alert if error rate > 1%
      memory_usage_mb: 1800, // Alert if memory > 1.8GB
    },
  },
  // API Configuration
  API: {
    RATE_LIMITING: {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      burst_limit: 10,
    },
    TIMEOUT_MS: 45000, // 45 seconds API timeout
    MAX_CONCURRENT_ANALYSES: 5,
    QUEUE_ENABLED: true,
    QUEUE_MAX_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },
  // Development and Testing
  DEVELOPMENT: {
    DEBUG_MODE: process.env.NODE_ENV === "development",
    VERBOSE_LOGGING: process.env.NODE_ENV === "development",
    MOCK_MODELS: process.env.NODE_ENV === "test",
    PERFORMANCE_PROFILING: process.env.NODE_ENV === "development",
    TEST_DATA_ENABLED: process.env.NODE_ENV !== "production",
  },
};
// Treatment Type Mappings
exports.TREATMENT_TYPES = {
  ACNE_TREATMENT: "acne_treatment",
  ANTI_AGING: "anti_aging",
  PIGMENTATION_TREATMENT: "pigmentation_treatment",
  SCAR_TREATMENT: "scar_treatment",
  SKIN_REJUVENATION: "skin_rejuvenation",
  LASER_THERAPY: "laser_therapy",
  CHEMICAL_PEEL: "chemical_peel",
  MICRONEEDLING: "microneedling",
  BOTOX: "botox",
  FILLER: "filler",
  GENERAL: "general",
};
// Analysis Status Types
exports.ANALYSIS_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};
// Error Codes
exports.ERROR_CODES = {
  INVALID_IMAGE_FORMAT: "INVALID_IMAGE_FORMAT",
  IMAGE_TOO_LARGE: "IMAGE_TOO_LARGE",
  IMAGE_TOO_SMALL: "IMAGE_TOO_SMALL",
  PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
  MODEL_LOAD_FAILED: "MODEL_LOAD_FAILED",
  INSUFFICIENT_QUALITY: "INSUFFICIENT_QUALITY",
  ANALYSIS_FAILED: "ANALYSIS_FAILED",
  STORAGE_ERROR: "STORAGE_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};
// Quality Metrics Thresholds
exports.QUALITY_THRESHOLDS = {
  EXCELLENT: 0.95, // ≥95% = Excellent
  GOOD: 0.85, // 85-94% = Good
  FAIR: 0.75, // 75-84% = Fair
  POOR: 0.65, // <75% = Poor
};
// VOIDBEAST V4.0 Compliance Validation
function validateVoidBeastCompliance(metrics) {
  var violations = [];
  if (metrics.accuracy < exports.VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD) {
    violations.push(
      "Accuracy "
        .concat((metrics.accuracy * 100).toFixed(1), "% below minimum ")
        .concat(exports.VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD * 100, "%"),
    );
  }
  if (metrics.processingTime > exports.VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
    violations.push(
      "Processing time "
        .concat(metrics.processingTime, "ms exceeds maximum ")
        .concat(exports.VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS, "ms"),
    );
  }
  if (metrics.confidence < exports.VISION_CONFIG.PERFORMANCE.MIN_CONFIDENCE_THRESHOLD) {
    violations.push(
      "Confidence "
        .concat((metrics.confidence * 100).toFixed(1), "% below minimum ")
        .concat(exports.VISION_CONFIG.PERFORMANCE.MIN_CONFIDENCE_THRESHOLD * 100, "%"),
    );
  }
  if (metrics.quality < exports.VISION_CONFIG.PERFORMANCE.QUALITY_THRESHOLD) {
    violations.push(
      "Quality "
        .concat(metrics.quality.toFixed(1), " below VOIDBEAST standard ")
        .concat(exports.VISION_CONFIG.PERFORMANCE.QUALITY_THRESHOLD),
    );
  }
  var score =
    (metrics.accuracy * 0.3 +
      Math.min(
        1,
        exports.VISION_CONFIG.PERFORMANCE.TARGET_PROCESSING_TIME_MS / metrics.processingTime,
      ) *
        0.2 +
      metrics.confidence * 0.2 +
      (metrics.quality / 10) * 0.3) *
    10;
  return {
    compliant:
      violations.length === 0 && score >= exports.VISION_CONFIG.PERFORMANCE.QUALITY_THRESHOLD,
    violations: violations,
    score: Math.min(10, Math.max(0, score)),
  };
}
// Environment-specific configuration override
function getEnvironmentConfig() {
  var baseConfig = __assign({}, exports.VISION_CONFIG);
  if (process.env.NODE_ENV === "development") {
    baseConfig.PERFORMANCE.MAX_PROCESSING_TIME_MS = 60000; // More lenient in dev
    baseConfig.MODELS.PRELOAD_MODELS = false; // Don't preload in dev
    baseConfig.API.RATE_LIMITING.requests_per_minute = 1000; // Higher limits in dev
  }
  if (process.env.NODE_ENV === "test") {
    baseConfig.DEVELOPMENT.MOCK_MODELS = true;
    baseConfig.STORAGE.AUTO_CLEANUP_TEMP_FILES = false;
    baseConfig.MONITORING.REAL_TIME_MONITORING = false;
  }
  return baseConfig;
}
