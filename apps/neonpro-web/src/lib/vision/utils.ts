/**
 * Vision Analysis System Utilities
 * Helper functions and utilities for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */

import type {
  AnalysisResult,
  Coordinates,
  ErrorCode,
  ImageMetadata,
  MeasurementType,
  RegionOfInterest,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "./types";

/**
 * Image Processing Utilities
 */
export class ImageUtils {
  /**
   * Validate image file format and size
   */
  static validateImageFile(file: File): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check file size
    const maxSizeMB = VISION_CONFIG.IMAGE_PROCESSING.MAX_IMAGE_SIZE_MB;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      errors.push({
        field: "file.size",
        code: "FILE_TOO_LARGE",
        message: `Arquivo muito grande: ${fileSizeMB.toFixed(1)}MB. Máximo permitido: ${maxSizeMB}MB`,
        value: fileSizeMB,
      });
    }

    // Check file format
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const supportedFormats = VISION_CONFIG.IMAGE_PROCESSING.SUPPORTED_FORMATS;

    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      errors.push({
        field: "file.format",
        code: "INVALID_FORMAT",
        message: `Formato não suportado: ${fileExtension}. Formatos aceitos: ${supportedFormats.join(", ")}`,
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
      errors,
      warnings,
    };
  }

  /**
   * Extract image metadata from file
   */
  static async extractImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);

          const metadata: ImageMetadata = {
            // Basic metadata that can be extracted in browser
            colorProfile: "sRGB", // Default assumption
            quality: ImageUtils.estimateImageQuality(ctx, img.width, img.height),
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
    });
  }

  /**
   * Estimate image quality based on various factors
   */
  private static estimateImageQuality(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): number {
    try {
      const imageData = ctx.getImageData(0, 0, Math.min(width, 100), Math.min(height, 100));
      const data = imageData.data;

      // Calculate basic quality metrics
      let totalVariance = 0;
      let pixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // Simple variance calculation for sharpness estimation
        if (i > 0) {
          const prevLuminance = 0.299 * data[i - 4] + 0.587 * data[i - 3] + 0.114 * data[i - 2];
          totalVariance += Math.abs(luminance - prevLuminance);
        }

        pixelCount++;
      }

      const averageVariance = totalVariance / pixelCount;

      // Normalize to 0-1 scale (this is a simplified estimation)
      return Math.min(1, averageVariance / 50);
    } catch (error) {
      console.warn("Failed to estimate image quality:", error);
      return 0.5; // Default quality estimate
    }
  }

  /**
   * Generate thumbnail from image file
   */
  static async generateThumbnail(
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 200,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Calculate thumbnail dimensions
        const { width, height } = ImageUtils.calculateThumbnailDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
        );

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
    });
  }

  /**
   * Calculate thumbnail dimensions maintaining aspect ratio
   */
  private static calculateThumbnailDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = maxWidth;
    let height = maxHeight;

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
  }
}

/**
 * Analysis Utilities
 */
export class AnalysisUtils {
  /**
   * Calculate overall improvement score from change metrics
   */
  static calculateOverallImprovement(changeMetrics: Record<string, number>): number {
    const values = Object.values(changeMetrics).filter(
      (v) => typeof v === "number" && !Number.isNaN(v),
    );

    if (values.length === 0) return 0;

    // Calculate weighted average (can be customized based on treatment type)
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.max(0, Math.min(100, sum / values.length));
  }

  /**
   * Determine quality level based on score
   */
  static getQualityLevel(score: number): string {
    if (score >= QUALITY_THRESHOLDS.EXCELLENT) return "Excelente";
    if (score >= QUALITY_THRESHOLDS.GOOD) return "Bom";
    if (score >= QUALITY_THRESHOLDS.FAIR) return "Regular";
    return "Insatisfatório";
  }

  /**
   * Format processing time for display
   */
  static formatProcessingTime(timeMs: number): string {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else if (timeMs < 60000) {
      return `${(timeMs / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(timeMs / 60000);
      const seconds = Math.round((timeMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Format percentage with appropriate precision
   */
  static formatPercentage(value: number, precision: number = 1): string {
    return `${value.toFixed(precision)}%`;
  }

  /**
   * Format measurement value with unit
   */
  static formatMeasurement(value: number, unit: string, precision: number = 2): string {
    return `${value.toFixed(precision)} ${unit}`;
  }

  /**
   * Calculate confidence color for UI display
   */
  static getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return "#10B981"; // Green
    if (confidence >= 0.7) return "#F59E0B"; // Yellow
    if (confidence >= 0.5) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  }

  /**
   * Calculate accuracy color for UI display
   */
  static getAccuracyColor(accuracy: number): string {
    if (accuracy >= VISION_CONFIG.PERFORMANCE.TARGET_ACCURACY) return "#10B981"; // Green
    if (accuracy >= VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  }

  /**
   * Validate analysis result completeness
   */
  static validateAnalysisResult(result: Partial<AnalysisResult>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
      const analysisData = result.analysisData;

      if (analysisData.accuracyScore < VISION_CONFIG.PERFORMANCE.MIN_ACCURACY_THRESHOLD) {
        warnings.push({
          field: "analysisData.accuracyScore",
          code: "LOW_ACCURACY",
          message: `Precisão baixa: ${(analysisData.accuracyScore * 100).toFixed(1)}%`,
          value: analysisData.accuracyScore,
        });
      }

      if (analysisData.confidence < VISION_CONFIG.PERFORMANCE.MIN_CONFIDENCE_THRESHOLD) {
        warnings.push({
          field: "analysisData.confidence",
          code: "LOW_CONFIDENCE",
          message: `Confiança baixa: ${(analysisData.confidence * 100).toFixed(1)}%`,
          value: analysisData.confidence,
        });
      }
    }

    if (result.processingMetrics) {
      const processingTime = result.processingMetrics.processingTimeMs;
      if (processingTime > VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
        warnings.push({
          field: "processingMetrics.processingTimeMs",
          code: "SLOW_PROCESSING",
          message: `Processamento lento: ${AnalysisUtils.formatProcessingTime(processingTime)}`,
          value: processingTime,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Measurement Utilities
 */
export class MeasurementUtils {
  /**
   * Calculate distance between two points
   */
  static calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate area of a polygon
   */
  static calculatePolygonArea(points: Coordinates[]): number {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }

  /**
   * Calculate perimeter of a polygon
   */
  static calculatePolygonPerimeter(points: Coordinates[]): number {
    if (points.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      perimeter += MeasurementUtils.calculateDistance(points[i], points[j]);
    }
    return perimeter;
  }

  /**
   * Calculate angle between three points
   */
  static calculateAngle(point1: Coordinates, vertex: Coordinates, point2: Coordinates): number {
    const vector1 = { x: point1.x - vertex.x, y: point1.y - vertex.y };
    const vector2 = { x: point2.x - vertex.x, y: point2.y - vertex.y };

    const dot = vector1.x * vector2.x + vector1.y * vector2.y;
    const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    const cosAngle = dot / (mag1 * mag2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    return (angleRad * 180) / Math.PI;
  }

  /**
   * Convert pixels to millimeters using calibration
   */
  static pixelsToMm(pixels: number, pixelToMmRatio: number): number {
    return pixels * pixelToMmRatio;
  }

  /**
   * Convert millimeters to pixels using calibration
   */
  static mmToPixels(mm: number, pixelToMmRatio: number): number {
    return mm / pixelToMmRatio;
  }

  /**
   * Calculate measurement change percentage
   */
  static calculateChangePercentage(beforeValue: number, afterValue: number): number {
    if (beforeValue === 0) return afterValue > 0 ? 100 : 0;
    return ((afterValue - beforeValue) / beforeValue) * 100;
  }

  /**
   * Determine clinical significance of measurement change
   */
  static determineClinicalSignificance(
    changePercentage: number,
    measurementType: MeasurementType,
  ): string {
    const absChange = Math.abs(changePercentage);

    // Different thresholds for different measurement types
    const thresholds = {
      area: { minimal: 5, moderate: 15, significant: 30 },
      volume: { minimal: 10, moderate: 25, significant: 50 },
      distance: { minimal: 2, moderate: 10, significant: 20 },
      angle: { minimal: 5, moderate: 15, significant: 30 },
      intensity: { minimal: 10, moderate: 20, significant: 40 },
      texture: { minimal: 15, moderate: 30, significant: 60 },
      color: { minimal: 5, moderate: 15, significant: 30 },
      default: { minimal: 10, moderate: 20, significant: 40 },
    };

    const threshold = thresholds[measurementType] || thresholds.default;

    if (absChange >= threshold.significant) return "highly_significant";
    if (absChange >= threshold.moderate) return "significant";
    if (absChange >= threshold.minimal) return "moderate";
    return "minimal";
  }
}

/**
 * Annotation Utilities
 */
export class AnnotationUtils {
  /**
   * Generate unique annotation ID
   */
  static generateAnnotationId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate annotation coordinates
   */
  static validateCoordinates(
    coordinates: Coordinates,
    imageWidth: number,
    imageHeight: number,
  ): boolean {
    return (
      coordinates.x >= 0 &&
      coordinates.x <= imageWidth &&
      coordinates.y >= 0 &&
      coordinates.y <= imageHeight
    );
  }

  /**
   * Calculate annotation bounding box
   */
  static calculateBoundingBox(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...coordinates.map((c) => c.x));
    const maxX = Math.max(...coordinates.map((c) => c.x));
    const minY = Math.min(...coordinates.map((c) => c.y));
    const maxY = Math.max(...coordinates.map((c) => c.y));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Check if point is inside annotation region
   */
  static isPointInRegion(point: Coordinates, region: RegionOfInterest): boolean {
    switch (region.type) {
      case "rectangle": {
        const rect = region.coordinates[0];
        return (
          point.x >= rect.x &&
          point.x <= rect.x + (rect.width || 0) &&
          point.y >= rect.y &&
          point.y <= rect.y + (rect.height || 0)
        );
      }

      case "circle": {
        const center = region.coordinates[0];
        const radius = center.radius || 0;
        const distance = MeasurementUtils.calculateDistance(point, center);
        return distance <= radius;
      }

      case "polygon":
        return AnnotationUtils.isPointInPolygon(point, region.coordinates);

      default:
        return false;
    }
  }

  /**
   * Check if point is inside polygon using ray casting algorithm
   */
  private static isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      if (
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  }
}

/**
 * Performance Utilities
 */
export class PerformanceUtils {
  /**
   * Create performance timer
   */
  static createTimer(): { start: () => void; stop: () => number; elapsed: () => number } {
    let startTime = 0;
    let endTime = 0;

    return {
      start: () => {
        startTime = performance.now();
      },
      stop: () => {
        endTime = performance.now();
        return endTime - startTime;
      },
      elapsed: () => {
        return (endTime || performance.now()) - startTime;
      },
    };
  }

  /**
   * Monitor memory usage (if available)
   */
  static getMemoryUsage(): { used: number; total: number } | null {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize / (1024 * 1024), // MB
        total: memory.totalJSHeapSize / (1024 * 1024), // MB
      };
    }
    return null;
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func(...args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime),
        );
      }
    };
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
}

/**
 * Export Utilities
 */
export class ExportUtils {
  /**
   * Generate export filename with timestamp
   */
  static generateExportFilename(prefix: string, format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `${prefix}-${timestamp}.${format}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!options.format) {
      errors.push({
        field: "format",
        code: "MISSING_REQUIRED_FIELD",
        message: "Formato de exportação é obrigatório",
      });
    }

    const supportedFormats = VISION_CONFIG.EXPORT.SUPPORTED_FORMATS;
    if (options.format && !supportedFormats.includes(options.format)) {
      errors.push({
        field: "format",
        code: "INVALID_FORMAT",
        message: `Formato não suportado: ${options.format}. Formatos aceitos: ${supportedFormats.join(", ")}`,
        value: options.format,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Date and Time Utilities
 */
export class DateUtils {
  /**
   * Format date for Brazilian locale
   */
  static formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR");
  }

  /**
   * Format date and time for Brazilian locale
   */
  static formatDateTime(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("pt-BR");
  }

  /**
   * Calculate time difference in human-readable format
   */
  static getTimeAgo(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "agora mesmo";
    if (diffMinutes < 60) return `${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
    if (diffDays < 30) return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;

    return DateUtils.formatDate(d);
  }

  /**
   * Check if date is within range
   */
  static isDateInRange(
    date: string | Date,
    startDate: string | Date,
    endDate: string | Date,
  ): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    return d >= start && d <= end;
  }
}

/**
 * Error Handling Utilities
 */
export class ErrorUtils {
  /**
   * Create standardized error object
   */
  static createError(code: ErrorCode, message: string, details?: any): Error {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).details = details;
    (error as any).timestamp = new Date().toISOString();
    return error;
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverableError(error: any): boolean {
    const recoverableCodes = ["PROCESSING_TIMEOUT", "MODEL_LOAD_FAILED", "STORAGE_ERROR"];

    return recoverableCodes.includes(error.code);
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const errorMessages: Record<string, string> = {
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
  }
}

// Export all utilities as a single object for convenience
export const VisionUtils = {
  Image: ImageUtils,
  Analysis: AnalysisUtils,
  Measurement: MeasurementUtils,
  Annotation: AnnotationUtils,
  Performance: PerformanceUtils,
  Export: ExportUtils,
  Date: DateUtils,
  Error: ErrorUtils,
};

export default VisionUtils;
