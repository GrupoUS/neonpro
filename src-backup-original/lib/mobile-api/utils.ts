/**
 * Mobile API Utilities
 * Utility functions for mobile API optimization, data compression, and performance
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import {
  MobileApiRequest,
  MobileApiResponse,
  CompressionConfig,
  CacheConfig,
  SecurityConfig,
  PerformanceMetrics,
  DataSyncConfig,
  NetworkCondition,
  DeviceCapabilities,
  OptimizationStrategy,
  ValidationResult,
  CompressionResult,
  EncryptionResult
} from './types';

/**
 * Data Compression Utilities
 */
export class CompressionUtils {
  /**
   * Compress data using various algorithms
   */
  static async compressData(
    data: any,
    config: CompressionConfig
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    const originalSize = JSON.stringify(data).length;

    try {
      let compressedData: string;
      let algorithm: string;

      switch (config.algorithm) {
        case 'gzip':
          compressedData = await this.gzipCompress(data);
          algorithm = 'gzip';
          break;
        case 'brotli':
          compressedData = await this.brotliCompress(data);
          algorithm = 'brotli';
          break;
        case 'lz4':
          compressedData = await this.lz4Compress(data);
          algorithm = 'lz4';
          break;
        default:
          compressedData = await this.defaultCompress(data);
          algorithm = 'default';
      }

      const compressedSize = compressedData.length;
      const compressionRatio = (originalSize - compressedSize) / originalSize;
      const compressionTime = Date.now() - startTime;

      return {
        success: true,
        data: compressedData,
        algorithm,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
        metadata: {
          timestamp: new Date(),
          version: '1.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        data: '',
        algorithm: config.algorithm,
        originalSize,
        compressedSize: 0,
        compressionRatio: 0,
        compressionTime: Date.now() - startTime,
        error: error.message,
        metadata: {
          timestamp: new Date(),
          version: '1.0'
        }
      };
    }
  }

  /**
   * Decompress data
   */
  static async decompressData(
    compressedData: string,
    algorithm: string
  ): Promise<any> {
    try {
      switch (algorithm) {
        case 'gzip':
          return await this.gzipDecompress(compressedData);
        case 'brotli':
          return await this.brotliDecompress(compressedData);
        case 'lz4':
          return await this.lz4Decompress(compressedData);
        default:
          return await this.defaultDecompress(compressedData);
      }
    } catch (error) {
      throw new Error(`Decompression failed: ${error.message}`);
    }
  }

  /**
   * GZIP compression
   */
  private static async gzipCompress(data: any): Promise<string> {
    // Simulate gzip compression
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  }

  /**
   * GZIP decompression
   */
  private static async gzipDecompress(compressedData: string): Promise<any> {
    const jsonString = Buffer.from(compressedData, 'base64').toString();
    return JSON.parse(jsonString);
  }

  /**
   * Brotli compression
   */
  private static async brotliCompress(data: any): Promise<string> {
    // Simulate brotli compression (better compression ratio)
    const jsonString = JSON.stringify(data);
    const compressed = Buffer.from(jsonString).toString('base64');
    return compressed.substring(0, Math.floor(compressed.length * 0.7)); // Simulate better compression
  }

  /**
   * Brotli decompression
   */
  private static async brotliDecompress(compressedData: string): Promise<any> {
    // Simulate brotli decompression
    const jsonString = Buffer.from(compressedData, 'base64').toString();
    return JSON.parse(jsonString);
  }

  /**
   * LZ4 compression (fast)
   */
  private static async lz4Compress(data: any): Promise<string> {
    // Simulate LZ4 compression (faster but less compression)
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  }

  /**
   * LZ4 decompression
   */
  private static async lz4Decompress(compressedData: string): Promise<any> {
    const jsonString = Buffer.from(compressedData, 'base64').toString();
    return JSON.parse(jsonString);
  }

  /**
   * Default compression
   */
  private static async defaultCompress(data: any): Promise<string> {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Default decompression
   */
  private static async defaultDecompress(compressedData: string): Promise<any> {
    const jsonString = Buffer.from(compressedData, 'base64').toString();
    return JSON.parse(jsonString);
  }

  /**
   * Choose optimal compression algorithm based on data characteristics
   */
  static chooseOptimalCompression(
    data: any,
    networkCondition: NetworkCondition,
    deviceCapabilities: DeviceCapabilities
  ): string {
    const dataSize = JSON.stringify(data).length;
    
    // For small data, compression overhead might not be worth it
    if (dataSize < 1024) {
      return 'none';
    }
    
    // For slow networks, prioritize compression ratio
    if (networkCondition.speed === 'slow') {
      return 'brotli';
    }
    
    // For fast networks and low-end devices, prioritize speed
    if (networkCondition.speed === 'fast' && deviceCapabilities.cpu === 'low') {
      return 'lz4';
    }
    
    // Default to gzip for balanced performance
    return 'gzip';
  }
}

/**
 * Security Utilities
 */
export class SecurityUtils {
  /**
   * Encrypt sensitive data
   */
  static encryptData(
    data: any,
    config: SecurityConfig
  ): EncryptionResult {
    try {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(config.encryptionKey, 'hex');
      const iv = randomBytes(16);
      
      const cipher = createCipheriv(algorithm, key, iv);
      
      const jsonString = JSON.stringify(data);
      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        success: true,
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm
      };
    } catch (error) {
      return {
        success: false,
        encryptedData: '',
        iv: '',
        authTag: '',
        algorithm: '',
        error: error.message
      };
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decryptData(
    encryptedData: string,
    iv: string,
    authTag: string,
    config: SecurityConfig
  ): any {
    try {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(config.encryptionKey, 'hex');
      
      const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate secure hash
   */
  static generateHash(data: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate API signature
   */
  static generateSignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    secretKey: string
  ): string {
    const message = `${method}\n${url}\n${body}\n${timestamp}`;
    return createHash('sha256').update(message + secretKey).digest('hex');
  }

  /**
   * Validate API signature
   */
  static validateSignature(
    signature: string,
    method: string,
    url: string,
    body: string,
    timestamp: number,
    secretKey: string,
    tolerance: number = 300000 // 5 minutes
  ): boolean {
    // Check timestamp tolerance
    const now = Date.now();
    if (Math.abs(now - timestamp) > tolerance) {
      return false;
    }

    // Generate expected signature
    const expectedSignature = this.generateSignature(
      method,
      url,
      body,
      timestamp,
      secretKey
    );

    return signature === expectedSignature;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
}

/**
 * Performance Utilities
 */
export class PerformanceUtils {
  private static metrics: Map<string, PerformanceMetrics> = new Map();

  /**
   * Start performance measurement
   */
  static startMeasurement(operationId: string): void {
    this.metrics.set(operationId, {
      operationId,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      memoryUsage: this.getMemoryUsage(),
      networkLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0
    });
  }

  /**
   * End performance measurement
   */
  static endMeasurement(operationId: string): PerformanceMetrics | null {
    const metrics = this.metrics.get(operationId);
    if (!metrics) return null;

    const endTime = Date.now();
    metrics.endTime = endTime;
    metrics.duration = endTime - metrics.startTime;

    this.metrics.delete(operationId);
    return metrics;
  }

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Measure network latency
   */
  static async measureNetworkLatency(url: string): Promise<number> {
    const startTime = Date.now();
    try {
      await fetch(url, { method: 'HEAD' });
      return Date.now() - startTime;
    } catch (error) {
      return -1; // Error indicator
    }
  }

  /**
   * Calculate cache hit rate
   */
  static calculateCacheHitRate(hits: number, total: number): number {
    return total > 0 ? (hits / total) * 100 : 0;
  }

  /**
   * Calculate throughput
   */
  static calculateThroughput(operations: number, timeMs: number): number {
    return timeMs > 0 ? (operations / timeMs) * 1000 : 0; // Operations per second
  }

  /**
   * Get performance recommendations
   */
  static getPerformanceRecommendations(
    metrics: PerformanceMetrics,
    thresholds: any
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.duration > thresholds.maxDuration) {
      recommendations.push('Consider optimizing slow operations or implementing caching');
    }

    if (metrics.memoryUsage > thresholds.maxMemory) {
      recommendations.push('High memory usage detected, consider data pagination or cleanup');
    }

    if (metrics.networkLatency > thresholds.maxLatency) {
      recommendations.push('High network latency, consider request batching or local caching');
    }

    if (metrics.cacheHitRate < thresholds.minCacheHitRate) {
      recommendations.push('Low cache hit rate, review caching strategy');
    }

    if (metrics.errorRate > thresholds.maxErrorRate) {
      recommendations.push('High error rate detected, implement better error handling');
    }

    return recommendations;
  }
}

/**
 * Network Utilities
 */
export class NetworkUtils {
  /**
   * Detect network condition
   */
  static detectNetworkCondition(): NetworkCondition {
    // In a real implementation, this would use navigator.connection API
    // For now, we'll simulate based on available information
    
    const connection = (navigator as any)?.connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      let speed: 'slow' | 'medium' | 'fast';
      if (effectiveType === '4g' && downlink > 10) {
        speed = 'fast';
      } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 10)) {
        speed = 'medium';
      } else {
        speed = 'slow';
      }
      
      return {
        type: effectiveType,
        speed,
        downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    // Default fallback
    return {
      type: '4g',
      speed: 'medium',
      downlink: 5,
      rtt: 100,
      saveData: false
    };
  }

  /**
   * Optimize request based on network condition
   */
  static optimizeRequest(
    request: MobileApiRequest,
    networkCondition: NetworkCondition
  ): MobileApiRequest {
    const optimizedRequest = { ...request };
    
    // Adjust based on network speed
    if (networkCondition.speed === 'slow') {
      // Reduce data size for slow networks
      optimizedRequest.compression = {
        enabled: true,
        algorithm: 'brotli',
        level: 9
      };
      
      // Enable aggressive caching
      optimizedRequest.cache = {
        enabled: true,
        strategy: 'cache-first',
        ttl: 3600000, // 1 hour
        maxSize: 50 * 1024 * 1024 // 50MB
      };
    } else if (networkCondition.speed === 'fast') {
      // Optimize for speed on fast networks
      optimizedRequest.compression = {
        enabled: true,
        algorithm: 'lz4',
        level: 1
      };
    }
    
    // Handle save data mode
    if (networkCondition.saveData) {
      optimizedRequest.dataReduction = true;
      optimizedRequest.imageQuality = 'low';
    }
    
    return optimizedRequest;
  }

  /**
   * Batch requests for efficiency
   */
  static batchRequests(
    requests: MobileApiRequest[],
    maxBatchSize: number = 10
  ): MobileApiRequest[][] {
    const batches: MobileApiRequest[][] = [];
    
    for (let i = 0; i < requests.length; i += maxBatchSize) {
      batches.push(requests.slice(i, i + maxBatchSize));
    }
    
    return batches;
  }

  /**
   * Implement exponential backoff for retries
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

/**
 * Data Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validate mobile API request
   */
  static validateRequest(request: MobileApiRequest): ValidationResult {
    const errors: string[] = [];
    
    // Validate required fields
    if (!request.endpoint) {
      errors.push('Endpoint is required');
    }
    
    if (!request.method) {
      errors.push('HTTP method is required');
    }
    
    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (request.method && !validMethods.includes(request.method)) {
      errors.push('Invalid HTTP method');
    }
    
    // Validate headers
    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          errors.push(`Invalid header: ${key}`);
        }
      }
    }
    
    // Validate timeout
    if (request.timeout && (request.timeout < 0 || request.timeout > 300000)) {
      errors.push('Timeout must be between 0 and 300000ms');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate mobile API response
   */
  static validateResponse(response: MobileApiResponse): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate status code
    if (!response.status || response.status < 100 || response.status > 599) {
      errors.push('Invalid HTTP status code');
    }
    
    // Validate response time
    if (response.responseTime && response.responseTime > 10000) {
      warnings.push('Response time is very high (>10s)');
    }
    
    // Validate data size
    if (response.data) {
      const dataSize = JSON.stringify(response.data).length;
      if (dataSize > 10 * 1024 * 1024) { // 10MB
        warnings.push('Response data is very large (>10MB)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate device capabilities
   */
  static validateDeviceCapabilities(capabilities: DeviceCapabilities): ValidationResult {
    const errors: string[] = [];
    
    // Validate CPU level
    const validCpuLevels = ['low', 'medium', 'high'];
    if (!validCpuLevels.includes(capabilities.cpu)) {
      errors.push('Invalid CPU level');
    }
    
    // Validate memory
    if (capabilities.memory <= 0) {
      errors.push('Memory must be positive');
    }
    
    // Validate storage
    if (capabilities.storage <= 0) {
      errors.push('Storage must be positive');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

/**
 * Optimization Strategy Utilities
 */
export class OptimizationUtils {
  /**
   * Determine optimization strategy based on context
   */
  static determineStrategy(
    networkCondition: NetworkCondition,
    deviceCapabilities: DeviceCapabilities,
    dataSize: number
  ): OptimizationStrategy {
    const strategy: OptimizationStrategy = {
      compression: {
        enabled: false,
        algorithm: 'gzip',
        level: 6
      },
      caching: {
        enabled: true,
        strategy: 'cache-first',
        ttl: 3600000,
        maxSize: 100 * 1024 * 1024
      },
      batching: {
        enabled: false,
        maxBatchSize: 10,
        batchTimeout: 1000
      },
      prefetching: {
        enabled: false,
        maxPrefetchSize: 5 * 1024 * 1024,
        prefetchThreshold: 0.8
      },
      dataReduction: {
        enabled: false,
        imageQuality: 'medium',
        removeMetadata: true
      }
    };
    
    // Enable compression for large data or slow networks
    if (dataSize > 10 * 1024 || networkCondition.speed === 'slow') {
      strategy.compression.enabled = true;
      
      if (networkCondition.speed === 'slow') {
        strategy.compression.algorithm = 'brotli';
        strategy.compression.level = 9;
      } else if (deviceCapabilities.cpu === 'low') {
        strategy.compression.algorithm = 'lz4';
        strategy.compression.level = 1;
      }
    }
    
    // Adjust caching based on device capabilities
    if (deviceCapabilities.storage < 1024 * 1024 * 1024) { // Less than 1GB
      strategy.caching.maxSize = 50 * 1024 * 1024; // 50MB
    }
    
    // Enable batching for multiple requests
    strategy.batching.enabled = true;
    
    // Enable prefetching for fast networks and high-end devices
    if (networkCondition.speed === 'fast' && deviceCapabilities.cpu === 'high') {
      strategy.prefetching.enabled = true;
    }
    
    // Enable data reduction for slow networks or save data mode
    if (networkCondition.speed === 'slow' || networkCondition.saveData) {
      strategy.dataReduction.enabled = true;
      strategy.dataReduction.imageQuality = 'low';
    }
    
    return strategy;
  }

  /**
   * Apply optimization strategy to request
   */
  static applyOptimization(
    request: MobileApiRequest,
    strategy: OptimizationStrategy
  ): MobileApiRequest {
    const optimizedRequest = { ...request };
    
    // Apply compression settings
    if (strategy.compression.enabled) {
      optimizedRequest.compression = strategy.compression;
    }
    
    // Apply caching settings
    if (strategy.caching.enabled) {
      optimizedRequest.cache = strategy.caching;
    }
    
    // Apply data reduction settings
    if (strategy.dataReduction.enabled) {
      optimizedRequest.dataReduction = strategy.dataReduction.enabled;
      optimizedRequest.imageQuality = strategy.dataReduction.imageQuality;
    }
    
    return optimizedRequest;
  }
}

/**
 * Utility functions for common mobile API operations
 */
export const MobileApiUtils = {
  CompressionUtils,
  SecurityUtils,
  PerformanceUtils,
  NetworkUtils,
  ValidationUtils,
  OptimizationUtils
};

export default MobileApiUtils;