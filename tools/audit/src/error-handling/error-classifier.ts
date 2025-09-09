/**
 * Error Classification System for NeonPro Audit System
 *
 * Intelligently categorizes errors, determines severity levels, assesses recoverability,
 * and recommends recovery strategies based on error patterns and system context.
 */

import { EventEmitter, } from 'events'
import {
  AuditError,
  ConfigurationError,
  ConstitutionalViolationError,
  DependencyError,
  ErrorCategory,
  ErrorClassification,
  ErrorContext,
  ErrorSeverity,
  ErrorUtils,
  ExternalServiceError,
  FileSystemError,
  MemoryError,
  NetworkError,
  ParsingError,
  PerformanceError,
  RecoveryStrategy,
  SecurityError,
  ValidationError,
} from './error-types.js'

/**
 * Error pattern for machine learning-based classification
 */
interface ErrorPattern {
  pattern: string | RegExp
  category: ErrorCategory
  severity: ErrorSeverity
  recoveryStrategy: RecoveryStrategy
  confidence: number
  conditions?: (error: Error, context: ErrorContext,) => boolean
}

/**
 * Classification metrics for performance tracking
 */
interface ClassificationMetrics {
  totalClassifications: number
  accuracyScore: number
  averageConfidence: number
  categoryDistribution: Record<ErrorCategory, number>
  strategyDistribution: Record<RecoveryStrategy, number>
  classificationTime: number[]
}

/**
 * Configuration for error classifier
 */
export interface ErrorClassifierConfig {
  /** Enable machine learning-based classification */
  enableMLClassification: boolean
  /** Minimum confidence threshold for automatic classification */
  minConfidenceThreshold: number
  /** Enable pattern matching for known error types */
  enablePatternMatching: boolean
  /** Enable context-aware classification */
  enableContextAware: boolean
  /** Maximum classification time in milliseconds */
  maxClassificationTime: number
  /** Enable classification metrics collection */
  enableMetrics: boolean
}

/**
 * Comprehensive error classifier with machine learning capabilities
 */
export class ErrorClassifier extends EventEmitter {
  private config: ErrorClassifierConfig
  private patterns: ErrorPattern[]
  private metrics: ClassificationMetrics
  private classificationHistory: Map<string, ErrorClassification>

  constructor(config: Partial<ErrorClassifierConfig> = {},) {
    super()

    this.config = {
      enableMLClassification: true,
      minConfidenceThreshold: 0.7,
      enablePatternMatching: true,
      enableContextAware: true,
      maxClassificationTime: 1000,
      enableMetrics: true,
      ...config,
    }

    this.patterns = this.initializePatterns()
    this.metrics = this.initializeMetrics()
    this.classificationHistory = new Map()
  }

  /**
   * Classify error and determine recovery strategy
   */
  async classify(error: Error, context?: ErrorContext,): Promise<ErrorClassification> {
    const startTime = Date.now()

    try {
      // Create error context if not provided
      const errorContext = context || this.createDefaultContext(error,)

      // Use direct classification for known audit error types
      if (error instanceof AuditError) {
        return this.classifyAuditError(error, errorContext,)
      }

      // Multi-stage classification approach
      let classification = await this.performPatternBasedClassification(error, errorContext,)

      if (!classification || classification.confidence < this.config.minConfidenceThreshold) {
        classification = await this.performHeuristicClassification(error, errorContext,)
      }

      if (!classification || classification.confidence < this.config.minConfidenceThreshold) {
        classification = await this.performMLClassification(error, errorContext,)
      }

      // Fallback to default classification
      if (!classification) {
        classification = this.createDefaultClassification(error, errorContext,)
      }

      // Apply context-aware adjustments
      if (this.config.enableContextAware) {
        classification = this.applyContextAwareAdjustments(classification, errorContext,)
      }

      // Update metrics
      if (this.config.enableMetrics) {
        this.updateMetrics(classification, Date.now() - startTime,)
      }

      // Store classification history
      this.classificationHistory.set(error.message, classification,)

      // Emit classification event
      this.emit('error_classified', { error, classification, context: errorContext, },)

      return classification
    } catch (classificationError) {
      // Fallback classification if classifier fails
      return this.createDefaultClassification(error, context || this.createDefaultContext(error,),)
    }
  }

  /**
   * Classify known audit error types
   */
  private classifyAuditError(error: AuditError, context: ErrorContext,): ErrorClassification {
    const baseClassification: ErrorClassification = {
      category: error.category,
      severity: error.severity,
      recoverable: error.recoverable,
      recoveryStrategy: this.determineRecoveryStrategy(error, context,),
      impactScore: ErrorUtils.calculateImpactScore(error, context,),
      confidence: 0.95, // High confidence for known audit errors
    }

    // Apply specific adjustments based on error type
    if (error instanceof ConstitutionalViolationError) {
      baseClassification.recoveryStrategy = RecoveryStrategy.CIRCUIT_BREAK
      baseClassification.severity = ErrorSeverity.CRITICAL
    } else if (error instanceof MemoryError) {
      baseClassification.recoveryStrategy = RecoveryStrategy.RESOURCE_CLEANUP
      if (error.currentUsage > error.maxUsage * 0.95) {
        baseClassification.severity = ErrorSeverity.CRITICAL
      }
    } else if (error instanceof FileSystemError) {
      baseClassification.recoveryStrategy = this.determineFileSystemRecovery(error,)
    }

    return baseClassification
  }

  /**
   * Pattern-based classification for known error patterns
   */
  private async performPatternBasedClassification(
    error: Error,
    context: ErrorContext,
  ): Promise<ErrorClassification | null> {
    if (!this.config.enablePatternMatching) return null

    for (const pattern of this.patterns) {
      const matches = this.matchesPattern(error, pattern,)
      const conditionsMet = !pattern.conditions || pattern.conditions(error, context,)

      if (matches && conditionsMet) {
        return {
          category: pattern.category,
          severity: pattern.severity,
          recoverable: this.isRecoverableStrategy(pattern.recoveryStrategy,),
          recoveryStrategy: pattern.recoveryStrategy,
          impactScore: this.calculatePatternBasedImpact(pattern, context,),
          confidence: pattern.confidence,
        }
      }
    }

    return null
  }

  /**
   * Heuristic-based classification using error characteristics
   */
  private async performHeuristicClassification(
    error: Error,
    context: ErrorContext,
  ): Promise<ErrorClassification> {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Memory-related errors
    if (
      message.includes('out of memory',) || message.includes('heap',)
      || message.includes('maximum call stack',)
    ) {
      return {
        category: ErrorCategory.MEMORY,
        severity: ErrorSeverity.CRITICAL,
        recoverable: message.includes('call stack',) ? false : true,
        recoveryStrategy: RecoveryStrategy.RESOURCE_CLEANUP,
        impactScore: 0.9,
        confidence: 0.85,
      }
    }

    // File system errors
    if (
      message.includes('enoent',) || message.includes('eacces',)
      || message.includes('file not found',) || message.includes('permission denied',)
    ) {
      return {
        category: ErrorCategory.FILESYSTEM,
        severity: message.includes('permission',) ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        recoverable: true,
        recoveryStrategy: RecoveryStrategy.RETRY,
        impactScore: 0.6,
        confidence: 0.8,
      }
    }

    // Network-related errors
    if (
      message.includes('network',) || message.includes('connection',)
      || message.includes('timeout',) || message.includes('econnreset',)
    ) {
      return {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        recoveryStrategy: RecoveryStrategy.RETRY,
        impactScore: 0.5,
        confidence: 0.75,
      }
    }

    // Configuration errors
    if (
      message.includes('config',) || message.includes('configuration',)
      || message.includes('invalid',) || message.includes('missing required',)
    ) {
      return {
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.HIGH,
        recoverable: false,
        recoveryStrategy: RecoveryStrategy.NONE,
        impactScore: 0.8,
        confidence: 0.8,
      }
    }

    // Parsing errors
    if (
      message.includes('parse',) || message.includes('syntax',)
      || message.includes('unexpected token',) || stack.includes('parser',)
    ) {
      return {
        category: ErrorCategory.PARSING,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        impactScore: 0.4,
        confidence: 0.75,
      }
    }

    // Default heuristic classification
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      recoveryStrategy: RecoveryStrategy.RETRY,
      impactScore: 0.3,
      confidence: 0.6,
    }
  }

  /**
   * Machine learning-based classification (simplified implementation)
   */
  private async performMLClassification(
    error: Error,
    context: ErrorContext,
  ): Promise<ErrorClassification | null> {
    if (!this.config.enableMLClassification) return null

    // Simplified ML classification based on feature extraction
    const features = this.extractErrorFeatures(error, context,)
    const classification = this.predictClassification(features,)

    return classification.confidence >= this.config.minConfidenceThreshold ? classification : null
  }

  /**
   * Extract features from error for ML classification
   */
  private extractErrorFeatures(error: Error, context: ErrorContext,): Record<string, number> {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    return {
      // Message features
      messageLength: error.message.length,
      hasMemoryKeywords: this.countKeywords(message, ['memory', 'heap', 'allocation',],) / 10,
      hasFileKeywords: this.countKeywords(message, ['file', 'path', 'directory', 'enoent',],) / 10,
      hasNetworkKeywords: this.countKeywords(message, ['network', 'connection', 'timeout',],) / 10,
      hasConfigKeywords: this.countKeywords(message, ['config', 'setting', 'parameter',],) / 10,

      // Stack features
      stackDepth: (error.stack?.split('\n',).length || 0) / 50,
      hasSystemCalls: stack.includes('fs.',) || stack.includes('net.',) ? 1 : 0,
      hasParserCalls: stack.includes('parse',) || stack.includes('compile',) ? 1 : 0,

      // Context features
      isInteractiveOperation: context.operation.includes('interactive',) ? 1 : 0,
      isCriticalComponent: context.component.includes('critical',) ? 1 : 0,
      systemLoadScore: this.calculateSystemLoad() / 100,

      // Error type features
      isNativeError: error.constructor.name === 'Error' ? 1 : 0,
      isTypeError: error instanceof TypeError ? 1 : 0,
      isReferenceError: error instanceof ReferenceError ? 1 : 0,
      isRangeError: error instanceof RangeError ? 1 : 0,
    }
  }

  /**
   * Predict classification using simplified ML model
   */
  private predictClassification(features: Record<string, number>,): ErrorClassification {
    // Simplified classification logic based on feature weights
    let categoryScore = {
      [ErrorCategory.MEMORY]: features.hasMemoryKeywords * 3 + features.stackDepth * 2,
      [ErrorCategory.FILESYSTEM]: features.hasFileKeywords * 3 + features.hasSystemCalls * 2,
      [ErrorCategory.NETWORK]: features.hasNetworkKeywords * 3,
      [ErrorCategory.CONFIGURATION]: features.hasConfigKeywords * 3,
      [ErrorCategory.PARSING]: features.hasParserCalls * 2 + features.hasConfigKeywords,
      [ErrorCategory.VALIDATION]: features.isNativeError + features.isTypeError,
      [ErrorCategory.PERFORMANCE]: features.systemLoadScore * 2,
      [ErrorCategory.DEPENDENCY]: features.hasSystemCalls,
      [ErrorCategory.CONSTITUTIONAL]: 0,
      [ErrorCategory.EXTERNAL_SERVICE]: features.hasNetworkKeywords * 2,
      [ErrorCategory.SECURITY]: 0,
    }

    const bestCategory = Object.entries(categoryScore,).reduce((a, b,) =>
      categoryScore[a[0] as ErrorCategory] > categoryScore[b[0] as ErrorCategory] ? a : b
    )[0] as ErrorCategory

    const confidence = Math.min(categoryScore[bestCategory] / 5, 0.9,)

    return {
      category: bestCategory,
      severity: this.predictSeverity(features, bestCategory,),
      recoverable: this.predictRecoverability(features, bestCategory,),
      recoveryStrategy: this.predictRecoveryStrategy(features, bestCategory,),
      impactScore: this.predictImpactScore(features,),
      confidence,
    }
  }

  /**
   * Predict error severity based on features
   */
  private predictSeverity(
    features: Record<string, number>,
    category: ErrorCategory,
  ): ErrorSeverity {
    if (features.hasMemoryKeywords > 0.5 || features.systemLoadScore > 0.8) {
      return ErrorSeverity.CRITICAL
    }

    if (features.isCriticalComponent > 0 || category === ErrorCategory.CONFIGURATION) {
      return ErrorSeverity.HIGH
    }

    if (features.hasFileKeywords > 0.3 || features.hasNetworkKeywords > 0.3) {
      return ErrorSeverity.MEDIUM
    }

    return ErrorSeverity.LOW
  }

  /**
   * Predict error recoverability
   */
  private predictRecoverability(
    features: Record<string, number>,
    category: ErrorCategory,
  ): boolean {
    // Configuration and reference errors are typically not recoverable
    if (category === ErrorCategory.CONFIGURATION || features.isReferenceError > 0) {
      return false
    }

    // Memory errors depend on severity
    if (features.hasMemoryKeywords > 0.5) {
      return features.systemLoadScore < 0.9
    }

    return true
  }

  /**
   * Predict recovery strategy
   */
  private predictRecoveryStrategy(
    features: Record<string, number>,
    category: ErrorCategory,
  ): RecoveryStrategy {
    if (features.hasMemoryKeywords > 0.5) {
      return RecoveryStrategy.RESOURCE_CLEANUP
    }

    if (features.hasNetworkKeywords > 0.3) {
      return RecoveryStrategy.RETRY
    }

    if (category === ErrorCategory.PARSING) {
      return RecoveryStrategy.FALLBACK
    }

    if (features.isCriticalComponent > 0) {
      return RecoveryStrategy.GRACEFUL_DEGRADE
    }

    return RecoveryStrategy.RETRY
  }

  /**
   * Predict impact score
   */
  private predictImpactScore(features: Record<string, number>,): number {
    let score = 0

    score += features.isCriticalComponent * 0.4
    score += features.hasMemoryKeywords * 0.3
    score += features.systemLoadScore * 0.2
    score += features.isInteractiveOperation * 0.1

    return Math.min(score, 1.0,)
  }

  /**
   * Apply context-aware adjustments to classification
   */
  private applyContextAwareAdjustments(
    classification: ErrorClassification,
    context: ErrorContext,
  ): ErrorClassification {
    // Increase severity for critical operations
    if (context.systemState.criticalOperation) {
      classification.severity = this.escalateSeverity(classification.severity,)
      classification.impactScore = Math.min(classification.impactScore + 0.2, 1.0,)
    }

    // Adjust recovery strategy based on system state
    if (
      context.systemState.highLoad && classification.recoveryStrategy === RecoveryStrategy.RETRY
    ) {
      classification.recoveryStrategy = RecoveryStrategy.GRACEFUL_DEGRADE
    }

    // Consider historical patterns
    const similarError = this.findSimilarError(context,)
    if (similarError && similarError.confidence > classification.confidence) {
      classification.recoveryStrategy = similarError.recoveryStrategy
      classification.confidence = Math.max(
        classification.confidence,
        similarError.confidence - 0.1,
      )
    }

    return classification
  }

  /**
   * Determine recovery strategy for file system errors
   */
  private determineFileSystemRecovery(error: FileSystemError,): RecoveryStrategy {
    if (error.operation === 'read' || error.operation === 'stat') {
      return RecoveryStrategy.RETRY
    }

    if (error.operation === 'write' || error.operation === 'mkdir') {
      return RecoveryStrategy.FALLBACK
    }

    return RecoveryStrategy.RETRY
  }

  /**
   * Check if pattern matches error
   */
  private matchesPattern(error: Error, pattern: ErrorPattern,): boolean {
    if (typeof pattern.pattern === 'string') {
      return error.message.toLowerCase().includes(pattern.pattern.toLowerCase(),)
    }

    return pattern.pattern.test(error.message,)
  }

  /**
   * Calculate pattern-based impact score
   */
  private calculatePatternBasedImpact(pattern: ErrorPattern, context: ErrorContext,): number {
    let baseScore = 0.5

    switch (pattern.severity) {
      case ErrorSeverity.CRITICAL:
        baseScore = 0.9
        break
      case ErrorSeverity.HIGH:
        baseScore = 0.7
        break
      case ErrorSeverity.MEDIUM:
        baseScore = 0.5
        break
      case ErrorSeverity.LOW:
        baseScore = 0.3
        break
    }

    // Adjust based on context
    if (context.systemState.criticalOperation) {
      baseScore = Math.min(baseScore + 0.2, 1.0,)
    }

    return baseScore
  }

  /**
   * Determine if recovery strategy indicates recoverability
   */
  private isRecoverableStrategy(strategy: RecoveryStrategy,): boolean {
    return strategy !== RecoveryStrategy.NONE
  }

  /**
   * Count keyword occurrences in text
   */
  private countKeywords(text: string, keywords: string[],): number {
    return keywords.reduce((count, keyword,) => {
      const regex = new RegExp(keyword, 'gi',)
      const matches = text.match(regex,)
      return count + (matches ? matches.length : 0)
    }, 0,)
  }

  /**
   * Calculate current system load score
   */
  private calculateSystemLoad(): number {
    const usage = process.memoryUsage()
    const memoryScore = (usage.heapUsed / usage.heapTotal) * 50
    const uptimeScore = Math.min(process.uptime() / 3600, 24,) * 2 // Up to 48 hours

    return Math.min(memoryScore + uptimeScore, 100,)
  }

  /**
   * Escalate error severity by one level
   */
  private escalateSeverity(severity: ErrorSeverity,): ErrorSeverity {
    switch (severity) {
      case ErrorSeverity.LOW:
        return ErrorSeverity.MEDIUM
      case ErrorSeverity.MEDIUM:
        return ErrorSeverity.HIGH
      case ErrorSeverity.HIGH:
        return ErrorSeverity.CRITICAL
      case ErrorSeverity.CRITICAL:
        return ErrorSeverity.CRITICAL
    }
  }

  /**
   * Find similar error from history
   */
  private findSimilarError(context: ErrorContext,): ErrorClassification | null {
    // Simple similarity check based on component and operation
    const key = `${context.component}_${context.operation}`
    return this.classificationHistory.get(key,) || null
  }

  /**
   * Determine recovery strategy based on error and context
   */
  private determineRecoveryStrategy(error: AuditError, context: ErrorContext,): RecoveryStrategy {
    // Default strategy mapping
    const strategyMap: Record<ErrorCategory, RecoveryStrategy> = {
      [ErrorCategory.FILESYSTEM]: RecoveryStrategy.RETRY,
      [ErrorCategory.MEMORY]: RecoveryStrategy.RESOURCE_CLEANUP,
      [ErrorCategory.PERFORMANCE]: RecoveryStrategy.GRACEFUL_DEGRADE,
      [ErrorCategory.DEPENDENCY]: RecoveryStrategy.FALLBACK,
      [ErrorCategory.CONFIGURATION]: RecoveryStrategy.NONE,
      [ErrorCategory.NETWORK]: RecoveryStrategy.RETRY,
      [ErrorCategory.VALIDATION]: RecoveryStrategy.FALLBACK,
      [ErrorCategory.CONSTITUTIONAL]: RecoveryStrategy.CIRCUIT_BREAK,
      [ErrorCategory.EXTERNAL_SERVICE]: RecoveryStrategy.RETRY,
      [ErrorCategory.PARSING]: RecoveryStrategy.FALLBACK,
      [ErrorCategory.SECURITY]: RecoveryStrategy.NONE,
    }

    return strategyMap[error.category] || RecoveryStrategy.RETRY
  }

  /**
   * Create default error context
   */
  private createDefaultContext(error: Error,): ErrorContext {
    return {
      errorId: `default_${Date.now()}`,
      timestamp: new Date(),
      component: 'unknown',
      operation: 'unknown',
      systemState: {
        criticalOperation: false,
        highLoad: false,
      },
      stackTrace: error.stack || '',
      metadata: {},
    }
  }

  /**
   * Create default classification for unknown errors
   */
  private createDefaultClassification(error: Error, context: ErrorContext,): ErrorClassification {
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorUtils.getSeverity(error,),
      recoverable: ErrorUtils.isRecoverable(error,),
      recoveryStrategy: RecoveryStrategy.RETRY,
      impactScore: 0.5,
      confidence: 0.4,
    }
  }

  /**
   * Initialize error patterns for pattern matching
   */
  private initializePatterns(): ErrorPattern[] {
    return [
      {
        pattern: /out of memory|heap.*out|maximum.*heap/i,
        category: ErrorCategory.MEMORY,
        severity: ErrorSeverity.CRITICAL,
        recoveryStrategy: RecoveryStrategy.RESOURCE_CLEANUP,
        confidence: 0.95,
      },
      {
        pattern: /enoent|file not found|no such file/i,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.MEDIUM,
        recoveryStrategy: RecoveryStrategy.RETRY,
        confidence: 0.9,
      },
      {
        pattern: /eacces|permission denied|access.*denied/i,
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.HIGH,
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        confidence: 0.9,
      },
      {
        pattern: /circular dependency|dependency cycle/i,
        category: ErrorCategory.DEPENDENCY,
        severity: ErrorSeverity.HIGH,
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        confidence: 0.95,
      },
      {
        pattern: /timeout|timed out|operation.*timeout/i,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        recoveryStrategy: RecoveryStrategy.RETRY,
        confidence: 0.85,
      },
      {
        pattern: /connection.*refused|econnreset|network.*error/i,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoveryStrategy: RecoveryStrategy.RETRY,
        confidence: 0.9,
      },
      {
        pattern: /parse.*error|syntax.*error|unexpected.*token/i,
        category: ErrorCategory.PARSING,
        severity: ErrorSeverity.MEDIUM,
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        confidence: 0.9,
      },
      {
        pattern: /configuration|config.*invalid|missing.*config/i,
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.HIGH,
        recoveryStrategy: RecoveryStrategy.NONE,
        confidence: 0.85,
      },
    ]
  }

  /**
   * Initialize classification metrics
   */
  private initializeMetrics(): ClassificationMetrics {
    return {
      totalClassifications: 0,
      accuracyScore: 0,
      averageConfidence: 0,
      categoryDistribution: {} as Record<ErrorCategory, number>,
      strategyDistribution: {} as Record<RecoveryStrategy, number>,
      classificationTime: [],
    }
  }

  /**
   * Update classification metrics
   */
  private updateMetrics(classification: ErrorClassification, classificationTime: number,): void {
    this.metrics.totalClassifications++
    this.metrics.classificationTime.push(classificationTime,)

    // Update category distribution
    this.metrics.categoryDistribution[classification.category] =
      (this.metrics.categoryDistribution[classification.category] || 0) + 1

    // Update strategy distribution
    this.metrics.strategyDistribution[classification.recoveryStrategy] =
      (this.metrics.strategyDistribution[classification.recoveryStrategy] || 0) + 1

    // Update confidence average
    this.metrics.averageConfidence =
      (this.metrics.averageConfidence * (this.metrics.totalClassifications - 1)
        + classification.confidence)
      / this.metrics.totalClassifications
  }

  /**
   * Get classification metrics
   */
  public getMetrics(): ClassificationMetrics {
    return { ...this.metrics, }
  }

  /**
   * Reset classification metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics()
  }

  /**
   * Get classification confidence statistics
   */
  public getConfidenceStatistics(): { min: number; max: number; average: number; median: number } {
    const confidences = Array.from(this.classificationHistory.values(),).map(c => c.confidence)

    if (confidences.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0, }
    }

    confidences.sort((a, b,) => a - b)

    return {
      min: confidences[0],
      max: confidences[confidences.length - 1],
      average: confidences.reduce((sum, c,) => sum + c, 0,) / confidences.length,
      median: confidences[Math.floor(confidences.length / 2,)],
    }
  }

  /**
   * Train classifier with feedback (simplified implementation)
   */
  public provideFeedback(
    error: Error,
    actualClassification: ErrorClassification,
    correctClassification: ErrorClassification,
  ): void {
    // In a real implementation, this would update ML models
    // For now, we adjust pattern confidence based on feedback

    const pattern = this.patterns.find(p => this.matchesPattern(error, p,))
    if (pattern) {
      if (actualClassification.category === correctClassification.category) {
        pattern.confidence = Math.min(pattern.confidence + 0.05, 1.0,)
      } else {
        pattern.confidence = Math.max(pattern.confidence - 0.05, 0.5,)
      }
    }

    this.emit('feedback_received', { error, actualClassification, correctClassification, },)
  }
}
