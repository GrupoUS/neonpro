/**
 * Vision Analysis System Utilities
 * Helper functions and utilities for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionUtils =
  exports.ErrorUtils =
  exports.DateUtils =
  exports.ExportUtils =
  exports.PerformanceUtils =
  exports.AnnotationUtils =
  exports.MeasurementUtils =
  exports.AnalysisUtils =
  exports.ImageUtils =
    void 0;
var config_1 = require("./config");
/**
 * Image Processing Utilities
 */
var ImageUtils = /** @class */ (() => {
  function ImageUtils() {}
  /**
   * Validate image file format and size
   */
  ImageUtils.validateImageFile = (file) => {
    var _a;
    var errors = [];
    var warnings = [];
    // Check file size
    var maxSizeMB = config_1.VISION_CONFIG.IMAGE_PROCESSING.MAX_IMAGE_SIZE_MB;
    var fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      errors.push({
        field: "file.size",
        code: "FILE_TOO_LARGE",
        message: "Arquivo muito grande: "
          .concat(fileSizeMB.toFixed(1), "MB. M\u00E1ximo permitido: ")
          .concat(maxSizeMB, "MB"),
        value: fileSizeMB,
      });
    }
    // Check file format
    var fileExtension =
      (_a = file.name.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    var supportedFormats = config_1.VISION_CONFIG.IMAGE_PROCESSING.SUPPORTED_FORMATS;
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      errors.push({
        field: "file.format",
        code: "INVALID_FORMAT",
        message: "Formato n\u00E3o suportado: "
          .concat(fileExtension, ". Formatos aceitos: ")
          .concat(supportedFormats.join(", ")),
        value: fileExtension,
      });
    }
    // Check file name
    if (file.name.length > 255) {
      warnings.push({
        field: "file.name",
        code: "LONG_FILENAME",
        message: "Nome do arquivo muito longo, será truncado",
        value: file.name.length,
      });
    }
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  };
  /**
   * Extract image metadata from file
   */
  ImageUtils.extractImageMetadata = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        new Promise((resolve) => {
          var img = new Image();
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              var metadata = {
                // Basic metadata that can be extracted in browser
                colorProfile: "sRGB", // Default assumption
                quality: this.estimateImageQuality(ctx, img.width, img.height),
              };
              resolve(metadata);
            } else {
              resolve({});
            }
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => {
            resolve({});
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(file);
        }),
      ]);
    });
  };
  /**
   * Estimate image quality based on various factors
   */
  ImageUtils.estimateImageQuality = (ctx, width, height) => {
    try {
      var imageData = ctx.getImageData(0, 0, Math.min(width, 100), Math.min(height, 100));
      var data = imageData.data;
      // Calculate basic quality metrics
      var totalVariance = 0;
      var pixelCount = 0;
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        // Calculate luminance
        var luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        // Simple variance calculation for sharpness estimation
        if (i > 0) {
          var prevLuminance = 0.299 * data[i - 4] + 0.587 * data[i - 3] + 0.114 * data[i - 2];
          totalVariance += Math.abs(luminance - prevLuminance);
        }
        pixelCount++;
      }
      var averageVariance = totalVariance / pixelCount;
      // Normalize to 0-1 scale (this is a simplified estimation)
      return Math.min(1, averageVariance / 50);
    } catch (error) {
      console.warn("Failed to estimate image quality:", error);
      return 0.5; // Default quality estimate
    }
  };
  /**
   * Generate thumbnail from image file
   */
  ImageUtils.generateThumbnail = function (_file_1) {
    return __awaiter(this, arguments, void 0, function (file, maxWidth, maxHeight) {
      if (maxWidth === void 0) {
        maxWidth = 200;
      }
      if (maxHeight === void 0) {
        maxHeight = 200;
      }
      return __generator(this, (_a) => [
        2 /*return*/,
        new Promise((resolve, reject) => {
          var img = new Image();
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          img.onload = () => {
            // Calculate thumbnail dimensions
            var _a = this.calculateThumbnailDimensions(img.width, img.height, maxWidth, maxHeight),
              width = _a.width,
              height = _a.height;
            canvas.width = width;
            canvas.height = height;
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error("Failed to generate thumbnail"));
                  }
                },
                "image/jpeg",
                0.8,
              );
            } else {
              reject(new Error("Failed to get canvas context"));
            }
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => {
            reject(new Error("Failed to load image"));
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(file);
        }),
      ]);
    });
  };
  /**
   * Calculate thumbnail dimensions maintaining aspect ratio
   */
  ImageUtils.calculateThumbnailDimensions = (
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight,
  ) => {
    var aspectRatio = originalWidth / originalHeight;
    var width = maxWidth;
    var height = maxHeight;
    if (aspectRatio > 1) {
      // Landscape
      height = width / aspectRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    } else {
      // Portrait or square
      width = height * aspectRatio;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
    }
    return { width: Math.round(width), height: Math.round(height) };
  };
  return ImageUtils;
})();
exports.ImageUtils = ImageUtils;
/**
 * Analysis Utilities
 */
var AnalysisUtils = /** @class */ (() => {
  function AnalysisUtils() {}
  /**
   * Calculate overall improvement score from change metrics
   */
  AnalysisUtils.calculateOverallImprovement = (changeMetrics) => {
    var values = Object.values(changeMetrics).filter(
      (v) => typeof v === "number" && !Number.isNaN(v),
    );
    if (values.length === 0) return 0;
    // Calculate weighted average (can be customized based on treatment type)
    var sum = values.reduce((acc, val) => acc + val, 0);
    return Math.max(0, Math.min(100, sum / values.length));
  };
  /**
   * Determine quality level based on score
   */
  AnalysisUtils.getQualityLevel = (score) => {
    if (score >= config_1.QUALITY_THRESHOLDS.EXCELLENT) return "Excelente";
    if (score >= config_1.QUALITY_THRESHOLDS.GOOD) return "Bom";
    if (score >= config_1.QUALITY_THRESHOLDS.FAIR) return "Regular";
    return "Insatisfatório";
  };
  /**
   * Format processing time for display
   */
  AnalysisUtils.formatProcessingTime = (timeMs) => {
    if (timeMs < 1000) {
      return "".concat(Math.round(timeMs), "ms");
    } else if (timeMs < 60000) {
      return "".concat((timeMs / 1000).toFixed(1), "s");
    } else {
      var minutes = Math.floor(timeMs / 60000);
      var seconds = Math.round((timeMs % 60000) / 1000);
      return "".concat(minutes, "m ").concat(seconds, "s");
    }
  };
  /**
   * Format percentage with appropriate precision
   */
  AnalysisUtils.formatPercentage = (value, precision) => {
    if (precision === void 0) {
      precision = 1;
    }
    return "".concat(value.toFixed(precision), "%");
  };
  /**
   * Format measurement value with unit
   */
  AnalysisUtils.formatMeasurement = (value, unit, precision) => {
    if (precision === void 0) {
      precision = 2;
    }
    return "".concat(value.toFixed(precision), " ").concat(unit);
  };
  /**
   * Calculate confidence color for UI display
   */
  AnalysisUtils.getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "#10B981"; // Green
    if (confidence >= 0.7) return "#F59E0B"; // Yellow
    if (confidence >= 0.5) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  };
  /**
   * Calculate accuracy color for UI display
   */
  AnalysisUtils.getAccuracyColor = (accuracy) => {
    if (accuracy >= config_1.VISION_CONFIG.PERFORMANCE.TARGET_ACCURACY) return "#10B981"; // Green
    if (accuracy >= config_1.VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };
  /**
   * Validate analysis result completeness
   */
  AnalysisUtils.validateAnalysisResult = function (result) {
    var errors = [];
    var warnings = [];
    // Required fields validation
    if (!result.id) {
      errors.push({
        field: "id",
        code: "MISSING_REQUIRED_FIELD",
        message: "ID da análise é obrigatório",
      });
    }
    if (!result.analysisData) {
      errors.push({
        field: "analysisData",
        code: "MISSING_REQUIRED_FIELD",
        message: "Dados da análise são obrigatórios",
      });
    } else {
      // Validate analysis data quality
      var analysisData = result.analysisData;
      if (analysisData.accuracyScore < config_1.VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD) {
        warnings.push({
          field: "analysisData.accuracyScore",
          code: "LOW_ACCURACY",
          message: "Precis\u00E3o baixa: ".concat(
            (analysisData.accuracyScore * 100).toFixed(1),
            "%",
          ),
          value: analysisData.accuracyScore,
        });
      }
      if (analysisData.confidence < config_1.VISION_CONFIG.PERFORMANCE.MIN_CONFIDENCE_THRESHOLD) {
        warnings.push({
          field: "analysisData.confidence",
          code: "LOW_CONFIDENCE",
          message: "Confian\u00E7a baixa: ".concat((analysisData.confidence * 100).toFixed(1), "%"),
          value: analysisData.confidence,
        });
      }
    }
    if (result.processingMetrics) {
      var processingTime = result.processingMetrics.processingTimeMs;
      if (processingTime > config_1.VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
        warnings.push({
          field: "processingMetrics.processingTimeMs",
          code: "SLOW_PROCESSING",
          message: "Processamento lento: ".concat(this.formatProcessingTime(processingTime)),
          value: processingTime,
        });
      }
    }
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  };
  return AnalysisUtils;
})();
exports.AnalysisUtils = AnalysisUtils;
/**
 * Measurement Utilities
 */
var MeasurementUtils = /** @class */ (() => {
  function MeasurementUtils() {}
  /**
   * Calculate distance between two points
   */
  MeasurementUtils.calculateDistance = (point1, point2) => {
    var dx = point2.x - point1.x;
    var dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  /**
   * Calculate area of a polygon
   */
  MeasurementUtils.calculatePolygonArea = (points) => {
    if (points.length < 3) return 0;
    var area = 0;
    for (var i = 0; i < points.length; i++) {
      var j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };
  /**
   * Calculate perimeter of a polygon
   */
  MeasurementUtils.calculatePolygonPerimeter = function (points) {
    if (points.length < 2) return 0;
    var perimeter = 0;
    for (var i = 0; i < points.length; i++) {
      var j = (i + 1) % points.length;
      perimeter += this.calculateDistance(points[i], points[j]);
    }
    return perimeter;
  };
  /**
   * Calculate angle between three points
   */
  MeasurementUtils.calculateAngle = (point1, vertex, point2) => {
    var vector1 = { x: point1.x - vertex.x, y: point1.y - vertex.y };
    var vector2 = { x: point2.x - vertex.x, y: point2.y - vertex.y };
    var dot = vector1.x * vector2.x + vector1.y * vector2.y;
    var mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    var mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    var cosAngle = dot / (mag1 * mag2);
    var angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    return (angleRad * 180) / Math.PI;
  };
  /**
   * Convert pixels to millimeters using calibration
   */
  MeasurementUtils.pixelsToMm = (pixels, pixelToMmRatio) => pixels * pixelToMmRatio;
  /**
   * Convert millimeters to pixels using calibration
   */
  MeasurementUtils.mmToPixels = (mm, pixelToMmRatio) => mm / pixelToMmRatio;
  /**
   * Calculate measurement change percentage
   */
  MeasurementUtils.calculateChangePercentage = (beforeValue, afterValue) => {
    if (beforeValue === 0) return afterValue > 0 ? 100 : 0;
    return ((afterValue - beforeValue) / beforeValue) * 100;
  };
  /**
   * Determine clinical significance of measurement change
   */
  MeasurementUtils.determineClinicalSignificance = (changePercentage, measurementType) => {
    var absChange = Math.abs(changePercentage);
    // Different thresholds for different measurement types
    var thresholds = {
      area: { minimal: 5, moderate: 15, significant: 30 },
      volume: { minimal: 10, moderate: 25, significant: 50 },
      distance: { minimal: 2, moderate: 10, significant: 20 },
      angle: { minimal: 5, moderate: 15, significant: 30 },
      intensity: { minimal: 10, moderate: 20, significant: 40 },
      texture: { minimal: 15, moderate: 30, significant: 60 },
      color: { minimal: 5, moderate: 15, significant: 30 },
      default: { minimal: 10, moderate: 20, significant: 40 },
    };
    var threshold = thresholds[measurementType] || thresholds.default;
    if (absChange >= threshold.significant) return "highly_significant";
    if (absChange >= threshold.moderate) return "significant";
    if (absChange >= threshold.minimal) return "moderate";
    return "minimal";
  };
  return MeasurementUtils;
})();
exports.MeasurementUtils = MeasurementUtils;
/**
 * Annotation Utilities
 */
var AnnotationUtils = /** @class */ (() => {
  function AnnotationUtils() {}
  /**
   * Generate unique annotation ID
   */
  AnnotationUtils.generateAnnotationId = () =>
    "annotation_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  /**
   * Validate annotation coordinates
   */
  AnnotationUtils.validateCoordinates = (coordinates, imageWidth, imageHeight) =>
    coordinates.x >= 0 &&
    coordinates.x <= imageWidth &&
    coordinates.y >= 0 &&
    coordinates.y <= imageHeight;
  /**
   * Calculate annotation bounding box
   */
  AnnotationUtils.calculateBoundingBox = (coordinates) => {
    if (coordinates.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    var minX = Math.min.apply(
      Math,
      coordinates.map((c) => c.x),
    );
    var maxX = Math.max.apply(
      Math,
      coordinates.map((c) => c.x),
    );
    var minY = Math.min.apply(
      Math,
      coordinates.map((c) => c.y),
    );
    var maxY = Math.max.apply(
      Math,
      coordinates.map((c) => c.y),
    );
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };
  /**
   * Check if point is inside annotation region
   */
  AnnotationUtils.isPointInRegion = function (point, region) {
    switch (region.type) {
      case "rectangle": {
        var rect = region.coordinates[0];
        return (
          point.x >= rect.x &&
          point.x <= rect.x + (rect.width || 0) &&
          point.y >= rect.y &&
          point.y <= rect.y + (rect.height || 0)
        );
      }
      case "circle": {
        var center = region.coordinates[0];
        var radius = center.radius || 0;
        var distance = MeasurementUtils.calculateDistance(point, center);
        return distance <= radius;
      }
      case "polygon":
        return this.isPointInPolygon(point, region.coordinates);
      default:
        return false;
    }
  };
  /**
   * Check if point is inside polygon using ray casting algorithm
   */
  AnnotationUtils.isPointInPolygon = (point, polygon) => {
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i].x;
      var yi = polygon[i].y;
      var xj = polygon[j].x;
      var yj = polygon[j].y;
      if (
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  };
  return AnnotationUtils;
})();
exports.AnnotationUtils = AnnotationUtils;
/**
 * Performance Utilities
 */
var PerformanceUtils = /** @class */ (() => {
  function PerformanceUtils() {}
  /**
   * Create performance timer
   */
  PerformanceUtils.createTimer = () => {
    var startTime = 0;
    var endTime = 0;
    return {
      start: () => {
        startTime = performance.now();
      },
      stop: () => {
        endTime = performance.now();
        return endTime - startTime;
      },
      elapsed: () => (endTime || performance.now()) - startTime,
    };
  };
  /**
   * Monitor memory usage (if available)
   */
  PerformanceUtils.getMemoryUsage = () => {
    if ("memory" in performance) {
      var memory = performance.memory;
      return {
        used: memory.usedJSHeapSize / (1024 * 1024), // MB
        total: memory.totalJSHeapSize / (1024 * 1024), // MB
      };
    }
    return null;
  };
  /**
   * Throttle function execution
   */
  PerformanceUtils.throttle = (func, delay) => {
    var timeoutId = null;
    var lastExecTime = 0;
    return () => {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func.apply(void 0, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func.apply(void 0, args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime),
        );
      }
    };
  };
  /**
   * Debounce function execution
   */
  PerformanceUtils.debounce = (func, delay) => {
    var timeoutId = null;
    return () => {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(void 0, args), delay);
    };
  };
  return PerformanceUtils;
})();
exports.PerformanceUtils = PerformanceUtils;
/**
 * Export Utilities
 */
var ExportUtils = /** @class */ (() => {
  function ExportUtils() {}
  /**
   * Generate export filename with timestamp
   */
  ExportUtils.generateExportFilename = (prefix, format) => {
    var timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return "".concat(prefix, "-").concat(timestamp, ".").concat(format);
  };
  /**
   * Format file size for display
   */
  ExportUtils.formatFileSize = (bytes) => {
    var units = ["B", "KB", "MB", "GB"];
    var size = bytes;
    var unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return "".concat(size.toFixed(1), " ").concat(units[unitIndex]);
  };
  /**
   * Validate export options
   */
  ExportUtils.validateExportOptions = (options) => {
    var errors = [];
    var warnings = [];
    if (!options.format) {
      errors.push({
        field: "format",
        code: "MISSING_REQUIRED_FIELD",
        message: "Formato de exportação é obrigatório",
      });
    }
    var supportedFormats = config_1.VISION_CONFIG.EXPORT.SUPPORTED_FORMATS;
    if (options.format && !supportedFormats.includes(options.format)) {
      errors.push({
        field: "format",
        code: "INVALID_FORMAT",
        message: "Formato n\u00E3o suportado: "
          .concat(options.format, ". Formatos aceitos: ")
          .concat(supportedFormats.join(", ")),
        value: options.format,
      });
    }
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  };
  return ExportUtils;
})();
exports.ExportUtils = ExportUtils;
/**
 * Date and Time Utilities
 */
var DateUtils = /** @class */ (() => {
  function DateUtils() {}
  /**
   * Format date for Brazilian locale
   */
  DateUtils.formatDate = (date) => {
    var d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR");
  };
  /**
   * Format date and time for Brazilian locale
   */
  DateUtils.formatDateTime = (date) => {
    var d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("pt-BR");
  };
  /**
   * Calculate time difference in human-readable format
   */
  DateUtils.getTimeAgo = function (date) {
    var d = typeof date === "string" ? new Date(date) : date;
    var now = new Date();
    var diffMs = now.getTime() - d.getTime();
    var diffMinutes = Math.floor(diffMs / (1000 * 60));
    var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) return "agora mesmo";
    if (diffMinutes < 60)
      return "".concat(diffMinutes, " minuto").concat(diffMinutes > 1 ? "s" : "", " atr\u00E1s");
    if (diffHours < 24)
      return "".concat(diffHours, " hora").concat(diffHours > 1 ? "s" : "", " atr\u00E1s");
    if (diffDays < 30)
      return "".concat(diffDays, " dia").concat(diffDays > 1 ? "s" : "", " atr\u00E1s");
    return this.formatDate(d);
  };
  /**
   * Check if date is within range
   */
  DateUtils.isDateInRange = (date, startDate, endDate) => {
    var d = typeof date === "string" ? new Date(date) : date;
    var start = typeof startDate === "string" ? new Date(startDate) : startDate;
    var end = typeof endDate === "string" ? new Date(endDate) : endDate;
    return d >= start && d <= end;
  };
  return DateUtils;
})();
exports.DateUtils = DateUtils;
/**
 * Error Handling Utilities
 */
var ErrorUtils = /** @class */ (() => {
  function ErrorUtils() {}
  /**
   * Create standardized error object
   */
  ErrorUtils.createError = (code, message, details) => {
    var error = new Error(message);
    error.code = code;
    error.details = details;
    error.timestamp = new Date().toISOString();
    return error;
  };
  /**
   * Check if error is recoverable
   */
  ErrorUtils.isRecoverableError = (error) => {
    var recoverableCodes = ["PROCESSING_TIMEOUT", "MODEL_LOAD_FAILED", "STORAGE_ERROR"];
    return recoverableCodes.includes(error.code);
  };
  /**
   * Get user-friendly error message
   */
  ErrorUtils.getUserFriendlyMessage = (error) => {
    var errorMessages = {
      INVALID_IMAGE_FORMAT: "Formato de imagem não suportado",
      IMAGE_TOO_LARGE: "Imagem muito grande",
      IMAGE_TOO_SMALL: "Imagem muito pequena",
      PROCESSING_TIMEOUT: "Tempo limite de processamento excedido",
      MODEL_LOAD_FAILED: "Falha ao carregar modelo de análise",
      INSUFFICIENT_QUALITY: "Qualidade da imagem insuficiente",
      ANALYSIS_FAILED: "Falha na análise da imagem",
      STORAGE_ERROR: "Erro de armazenamento",
      AUTHENTICATION_ERROR: "Erro de autenticação",
      RATE_LIMIT_EXCEEDED: "Limite de requisições excedido",
    };
    return errorMessages[error.code] || error.message || "Erro desconhecido";
  };
  return ErrorUtils;
})();
exports.ErrorUtils = ErrorUtils;
// Export all utilities as a single object for convenience
exports.VisionUtils = {
  Image: ImageUtils,
  Analysis: AnalysisUtils,
  Measurement: MeasurementUtils,
  Annotation: AnnotationUtils,
  Performance: PerformanceUtils,
  Export: ExportUtils,
  Date: DateUtils,
  Error: ErrorUtils,
};
exports.default = exports.VisionUtils;
