/**
 * Code Optimizer for NeonPro Audit System
 *
 * Systematic code analysis and optimization system that identifies performance bottlenecks,
 * code quality issues, and applies safe optimizations while maintaining constitutional compliance.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  AuditError,
  ErrorCategory,
  ErrorClassifier,
  ErrorSeverity,
  RecoveryOrchestrator,
} from '../error-handling/error-types.js';

/**
 * Code optimization categories
 */
export enum OptimizationCategory {
  PERFORMANCE = 'performance',
  MEMORY = 'memory',
  CODE_QUALITY = 'code_quality',
  TYPE_SAFETY = 'type_safety',
  IMPORTS = 'imports',
  CONFIGURATION = 'configuration',
  ARCHITECTURE = 'architecture',
  SECURITY = 'security',
}

/**
 * Optimization priority levels
 */
export enum OptimizationPriority {
  CRITICAL = 'critical', // Must fix - blocks constitutional compliance
  HIGH = 'high', // Should fix - significant impact
  MEDIUM = 'medium', // Could fix - moderate improvement
  LOW = 'low', // Optional - minor improvement
}

/**
 * Optimization strategy types
 */
export enum OptimizationStrategy {
  AUTOMATIC = 'automatic', // Safe automatic application
  ASSISTED = 'assisted', // Requires user confirmation
  MANUAL = 'manual', // Requires manual implementation
  ADVISORY = 'advisory', // Recommendation only
}

/**
 * Code analysis result
 */
export interface CodeAnalysisResult {
  filePath: string;
  fileSize: number;
  lineCount: number;
  complexityScore: number;
  maintainabilityIndex: number;
  issues: CodeIssue[];
  metrics: CodeMetrics;
  dependencies: string[];
  exports: string[];
}

/**
 * Code issue identification
 */
export interface CodeIssue {
  id: string;
  category: OptimizationCategory;
  priority: OptimizationPriority;
  strategy: OptimizationStrategy;
  title: string;
  description: string;
  location: {
    filePath: string;
    startLine: number;
    endLine: number;
    startColumn?: number;
    endColumn?: number;
  };
  recommendation: string;
  estimatedImpact: {
    performance: number; // 0-1 scale
    memory: number; // 0-1 scale
    maintainability: number; // 0-1 scale
  };
  fix?: {
    automatic: boolean;
    before: string;
    after: string;
    confidence: number;
  };
}

/**
 * Code metrics
 */
export interface CodeMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  commentRatio: number;
  duplicateLineRatio: number;
  testCoverage?: number;
  typeAnnotationRatio: number;
  importCount: number;
  exportCount: number;
  functionCount: number;
  classCount: number;
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  optimizationId: string;
  category: OptimizationCategory;
  priority: OptimizationPriority;
  strategy: OptimizationStrategy;
  applied: boolean;
  impact: {
    filesModified: number;
    linesChanged: number;
    performanceImprovement: number;
    memoryReduction: number;
  };
  before: CodeMetrics;
  after: CodeMetrics;
  executionTime: number;
  warnings: string[];
  errors: AuditError[];
}

/**
 * Optimization configuration
 */
export interface OptimizerConfig {
  /** Enable automatic optimizations */
  enableAutomatic: boolean;
  /** Maximum file size to analyze (bytes) */
  maxFileSize: number;
  /** Maximum complexity threshold */
  maxComplexity: number;
  /** Enable constitutional compliance validation */
  enableConstitutionalValidation: boolean;
  /** Memory limit for optimization operations */
  memoryLimit: number;
  /** Time limit for optimization operations */
  timeLimit: number;
  /** Enable backup creation before modifications */
  createBackups: boolean;
  /** Enable optimization metrics collection */
  enableMetrics: boolean;
  /** Minimum confidence for automatic fixes */
  minAutoFixConfidence: number;
}

/**
 * Optimization plan
 */
export interface OptimizationPlan {
  planId: string;
  targetDirectory: string;
  issues: CodeIssue[];
  estimatedTime: number;
  estimatedImpact: {
    performance: number;
    memory: number;
    maintainability: number;
  };
  phases: OptimizationPhase[];
  dependencies: string[];
  risks: string[];
}

/**
 * Optimization phase
 */
export interface OptimizationPhase {
  phaseId: string;
  name: string;
  description: string;
  category: OptimizationCategory;
  issues: CodeIssue[];
  estimatedTime: number;
  prerequisites: string[];
  order: number;
}

/**
 * Comprehensive code optimizer with constitutional compliance validation
 */
export class CodeOptimizer extends EventEmitter {
  private config: OptimizerConfig;
  private errorClassifier: ErrorClassifier;
  private recoveryOrchestrator: RecoveryOrchestrator;
  private analysisResults: Map<string, CodeAnalysisResult>;
  private optimizationHistory: Map<string, OptimizationResult>;
  private activeOptimizations: Map<string, OptimizationPlan>;

  constructor(config: Partial<OptimizerConfig> = {}) {
    super();

    this.config = {
      enableAutomatic: false, // Conservative default for safety
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxComplexity: 15,
      enableConstitutionalValidation: true,
      memoryLimit: 512 * 1024 * 1024, // 512MB for optimization operations
      timeLimit: 30 * 60 * 1000, // 30 minutes
      createBackups: true,
      enableMetrics: true,
      minAutoFixConfidence: 0.9,
      ...config,
    };

    this.errorClassifier = new ErrorClassifier();
    this.recoveryOrchestrator = new RecoveryOrchestrator();
    this.analysisResults = new Map();
    this.optimizationHistory = new Map();
    this.activeOptimizations = new Map();
  }

  /**
   * Perform comprehensive code analysis
   */
  async analyzeDirectory(directoryPath: string): Promise<CodeAnalysisResult[]> {
    this.emit('analysis_started', { directoryPath });

    try {
      const files = await this.discoverCodeFiles(directoryPath);
      const results: CodeAnalysisResult[] = [];

      for (const filePath of files) {
        try {
          const result = await this.analyzeFile(filePath);
          results.push(result);
          this.analysisResults.set(filePath, result);

          this.emit('file_analyzed', { filePath, result });
        } catch (error) {
          const analysisError = new AuditError(
            `Failed to analyze file: ${error.message}`,
            ErrorCategory.PARSING,
            ErrorSeverity.MEDIUM,
            true,
            { component: 'CodeOptimizer', operation: 'file_analysis', filePath },
          );

          this.emit('analysis_error', { filePath, error: analysisError });
        }
      }

      this.emit('analysis_completed', { directoryPath, filesAnalyzed: results.length });
      return results;
    } catch (error) {
      const directoryError = new AuditError(
        `Failed to analyze directory: ${error.message}`,
        ErrorCategory.FILESYSTEM,
        ErrorSeverity.HIGH,
        true,
        { component: 'CodeOptimizer', operation: 'directory_analysis', directoryPath },
      );

      throw directoryError;
    }
  }

  /**
   * Analyze single file for optimization opportunities
   */
  async analyzeFile(filePath: string): Promise<CodeAnalysisResult> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const fileStats = await fs.stat(filePath);

    if (fileStats.size > this.config.maxFileSize) {
      throw new AuditError(
        `File size exceeds maximum: ${fileStats.size} > ${this.config.maxFileSize}`,
        ErrorCategory.PERFORMANCE,
        ErrorSeverity.MEDIUM,
        true,
        { filePath },
      );
    }

    const metrics = await this.calculateCodeMetrics(filePath, fileContent);
    const issues = await this.identifyCodeIssues(filePath, fileContent, metrics);
    const dependencies = this.extractDependencies(fileContent);
    const exports = this.extractExports(fileContent);

    return {
      filePath,
      fileSize: fileStats.size,
      lineCount: fileContent.split('\n').length,
      complexityScore: metrics.cyclomaticComplexity,
      maintainabilityIndex: this.calculateMaintainabilityIndex(metrics),
      issues,
      metrics,
      dependencies,
      exports,
    };
  }

  /**
   * Create optimization plan based on analysis results
   */
  async createOptimizationPlan(
    analysisResults: CodeAnalysisResult[],
    targetDirectory: string,
  ): Promise<OptimizationPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Collect all issues and prioritize
    const allIssues = analysisResults.flatMap(result => result.issues);
    const prioritizedIssues = this.prioritizeIssues(allIssues);

    // Group issues into phases
    const phases = this.createOptimizationPhases(prioritizedIssues);

    // Calculate estimated impact and time
    const estimatedImpact = this.calculatePlanImpact(prioritizedIssues);
    const estimatedTime = this.estimatePlanTime(phases);

    // Identify dependencies and risks
    const dependencies = this.identifyPlanDependencies(analysisResults);
    const risks = this.identifyPlanRisks(prioritizedIssues);

    const plan: OptimizationPlan = {
      planId,
      targetDirectory,
      issues: prioritizedIssues,
      estimatedTime,
      estimatedImpact,
      phases,
      dependencies,
      risks,
    };

    this.activeOptimizations.set(planId, plan);
    this.emit('plan_created', { plan });

    return plan;
  }

  /**
   * Execute optimization plan
   */
  async executeOptimizationPlan(planId: string): Promise<OptimizationResult[]> {
    const plan = this.activeOptimizations.get(planId);
    if (!plan) {
      throw new AuditError(
        `Optimization plan not found: ${planId}`,
        ErrorCategory.CONFIGURATION,
        ErrorSeverity.HIGH,
        false,
      );
    }

    this.emit('execution_started', { planId, plan });
    const results: OptimizationResult[] = [];

    try {
      // Execute phases in order
      for (const phase of plan.phases.sort((a, b) => a.order - b.order)) {
        this.emit('phase_started', { planId, phase });

        const phaseResults = await this.executeOptimizationPhase(phase, plan);
        results.push(...phaseResults);

        this.emit('phase_completed', { planId, phase, results: phaseResults });

        // Validate constitutional compliance after each phase
        if (this.config.enableConstitutionalValidation) {
          await this.validateConstitutionalCompliance();
        }
      }

      this.emit('execution_completed', { planId, results });
      return results;
    } catch (error) {
      this.emit('execution_failed', { planId, error });
      throw error;
    }
  }

  /**
   * Calculate code metrics
   */
  private async calculateCodeMetrics(filePath: string, content: string): Promise<CodeMetrics> {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const commentLines = lines.filter(line =>
      line.trim().startsWith('//') || line.trim().startsWith('*')
    );

    const functionMatches = content.match(/function\s+\w+|=>\s*{|:\s*\([^)]*\)\s*=>/g) || [];
    const classMatches = content.match(/class\s+\w+/g) || [];
    const importMatches = content.match(/^import\s+.+from\s+['"]/gm) || [];
    const exportMatches = content.match(/^export\s+/gm) || [];

    // Calculate cyclomatic complexity (simplified)
    const complexityKeywords =
      /\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\b\?\s*:/g;
    const complexityMatches = content.match(complexityKeywords) || [];
    const cyclomaticComplexity = complexityMatches.length + 1; // +1 for base complexity

    // Type annotation ratio (TypeScript specific)
    const typeAnnotations = content.match(/:\s*\w+(\[\]|\<[^>]+\>)?/g) || [];
    const identifiers = content.match(/\b[a-zA-Z_]\w*\b/g) || [];
    const typeAnnotationRatio = identifiers.length > 0
      ? typeAnnotations.length / identifiers.length
      : 0;

    // Duplicate line detection (simplified)
    const lineMap = new Map<string, number>();
    for (const line of nonEmptyLines) {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // Only consider substantial lines
        lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
      }
    }
    const duplicateLines = Array.from(lineMap.values()).reduce(
      (sum, count) => sum + (count > 1 ? count - 1 : 0),
      0,
    );
    const duplicateLineRatio = nonEmptyLines.length > 0 ? duplicateLines / nonEmptyLines.length : 0;

    return {
      cyclomaticComplexity,
      cognitiveComplexity: this.calculateCognitiveComplexity(content),
      linesOfCode: nonEmptyLines.length,
      commentRatio: nonEmptyLines.length > 0 ? commentLines.length / nonEmptyLines.length : 0,
      duplicateLineRatio,
      typeAnnotationRatio,
      importCount: importMatches.length,
      exportCount: exportMatches.length,
      functionCount: functionMatches.length,
      classCount: classMatches.length,
    };
  }

  /**
   * Calculate cognitive complexity (simplified implementation)
   */
  private calculateCognitiveComplexity(content: string): number {
    let complexity = 0;
    let nestingLevel = 0;

    // Patterns that increase cognitive complexity
    const patterns = [
      { regex: /\bif\b|\belse\s+if\b/g, weight: 1 },
      { regex: /\belse\b/g, weight: 1 },
      { regex: /\bswitch\b/g, weight: 1 },
      { regex: /\bfor\b|\bwhile\b|\bdo\b/g, weight: 1 },
      { regex: /\bcatch\b/g, weight: 1 },
      { regex: /\?\s*:|&&|\|\|/g, weight: 1 },
      { regex: /\{/g, weight: 0, nesting: 1 },
      { regex: /\}/g, weight: 0, nesting: -1 },
    ];

    for (const pattern of patterns) {
      const matches = Array.from(content.matchAll(pattern.regex));
      for (const match of matches) {
        if (pattern.nesting) {
          nestingLevel += pattern.nesting;
        } else {
          complexity += pattern.weight * (1 + nestingLevel);
        }
      }
    }

    return complexity;
  }

  /**
   * Identify code issues and optimization opportunities
   */
  private async identifyCodeIssues(
    filePath: string,
    content: string,
    metrics: CodeMetrics,
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    // High complexity function detection
    if (metrics.cyclomaticComplexity > this.config.maxComplexity) {
      issues.push({
        id: `complexity_${Date.now()}`,
        category: OptimizationCategory.CODE_QUALITY,
        priority: OptimizationPriority.HIGH,
        strategy: OptimizationStrategy.MANUAL,
        title: 'High Cyclomatic Complexity',
        description:
          `Function has cyclomatic complexity of ${metrics.cyclomaticComplexity}, exceeding threshold of ${this.config.maxComplexity}`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation:
          'Consider breaking down complex functions into smaller, more focused functions',
        estimatedImpact: { performance: 0.2, memory: 0.1, maintainability: 0.8 },
      });
    }

    // Large file detection
    if (lines.length > 500) {
      issues.push({
        id: `large_file_${Date.now()}`,
        category: OptimizationCategory.ARCHITECTURE,
        priority: OptimizationPriority.MEDIUM,
        strategy: OptimizationStrategy.MANUAL,
        title: 'Large File',
        description: `File has ${lines.length} lines, consider breaking it down`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Split large files into smaller, more focused modules',
        estimatedImpact: { performance: 0.1, memory: 0.2, maintainability: 0.6 },
      });
    }

    // Duplicate code detection
    if (metrics.duplicateLineRatio > 0.1) {
      issues.push({
        id: `duplicate_code_${Date.now()}`,
        category: OptimizationCategory.CODE_QUALITY,
        priority: OptimizationPriority.MEDIUM,
        strategy: OptimizationStrategy.ASSISTED,
        title: 'Duplicate Code Detected',
        description: `${(metrics.duplicateLineRatio * 100).toFixed(1)}% of lines are duplicated`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Extract common code into reusable functions or modules',
        estimatedImpact: { performance: 0.3, memory: 0.2, maintainability: 0.7 },
      });
    }

    // Missing type annotations (TypeScript)
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      if (metrics.typeAnnotationRatio < 0.5) {
        issues.push({
          id: `missing_types_${Date.now()}`,
          category: OptimizationCategory.TYPE_SAFETY,
          priority: OptimizationPriority.MEDIUM,
          strategy: OptimizationStrategy.ASSISTED,
          title: 'Missing Type Annotations',
          description: `Only ${
            (metrics.typeAnnotationRatio * 100).toFixed(1)
          }% of identifiers have type annotations`,
          location: { filePath, startLine: 1, endLine: lines.length },
          recommendation: 'Add explicit type annotations to improve type safety',
          estimatedImpact: { performance: 0.0, memory: 0.0, maintainability: 0.5 },
        });
      }
    }

    // Performance-related issues
    const performanceIssues = this.detectPerformanceIssues(filePath, content, lines);
    issues.push(...performanceIssues);

    // Memory-related issues
    const memoryIssues = this.detectMemoryIssues(filePath, content, lines);
    issues.push(...memoryIssues);

    // Import optimization opportunities
    const importIssues = this.detectImportIssues(filePath, content, metrics);
    issues.push(...importIssues);

    return issues;
  }

  /**
   * Detect performance-related issues
   */
  private detectPerformanceIssues(
    filePath: string,
    content: string,
    lines: string[],
  ): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Inefficient loops
    const nestedLoopPattern = /for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/gs;
    const nestedLoops = content.match(nestedLoopPattern);
    if (nestedLoops && nestedLoops.length > 0) {
      issues.push({
        id: `nested_loops_${Date.now()}`,
        category: OptimizationCategory.PERFORMANCE,
        priority: OptimizationPriority.HIGH,
        strategy: OptimizationStrategy.MANUAL,
        title: 'Nested Loops Detected',
        description: `Found ${nestedLoops.length} nested loop(s) that may impact performance`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Consider optimizing nested loops with better algorithms or caching',
        estimatedImpact: { performance: 0.7, memory: 0.3, maintainability: 0.2 },
      });
    }

    // Synchronous file operations
    const syncOps = content.match(/fs\.readFileSync|fs\.writeFileSync|fs\.statSync/g);
    if (syncOps && syncOps.length > 0) {
      issues.push({
        id: `sync_operations_${Date.now()}`,
        category: OptimizationCategory.PERFORMANCE,
        priority: OptimizationPriority.MEDIUM,
        strategy: OptimizationStrategy.ASSISTED,
        title: 'Synchronous File Operations',
        description: `Found ${syncOps.length} synchronous file operation(s)`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Replace synchronous file operations with asynchronous alternatives',
        estimatedImpact: { performance: 0.6, memory: 0.1, maintainability: 0.3 },
      });
    }

    // Inefficient string operations
    const stringConcats = content.match(/\+\s*['"`]/g);
    if (stringConcats && stringConcats.length > 5) {
      issues.push({
        id: `string_concatenation_${Date.now()}`,
        category: OptimizationCategory.PERFORMANCE,
        priority: OptimizationPriority.LOW,
        strategy: OptimizationStrategy.AUTOMATIC,
        title: 'Inefficient String Concatenation',
        description: `Found ${stringConcats.length} string concatenation operations`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Use template literals or array join for multiple string concatenations',
        estimatedImpact: { performance: 0.3, memory: 0.4, maintainability: 0.2 },
      });
    }

    return issues;
  }

  /**
   * Detect memory-related issues
   */
  private detectMemoryIssues(filePath: string, content: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Large object/array literals
    const largeArrays = content.match(/\[[^\]]{200,}\]/gs);
    if (largeArrays && largeArrays.length > 0) {
      issues.push({
        id: `large_literals_${Date.now()}`,
        category: OptimizationCategory.MEMORY,
        priority: OptimizationPriority.MEDIUM,
        strategy: OptimizationStrategy.MANUAL,
        title: 'Large Object/Array Literals',
        description:
          `Found ${largeArrays.length} large literal(s) that may consume excessive memory`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Consider lazy loading or streaming for large data structures',
        estimatedImpact: { performance: 0.2, memory: 0.8, maintainability: 0.1 },
      });
    }

    // Potential memory leaks
    const eventListeners = content.match(/addEventListener|on\w+\s*=/g);
    const removeListeners = content.match(/removeEventListener/g);
    if (eventListeners && (!removeListeners || removeListeners.length < eventListeners.length)) {
      issues.push({
        id: `memory_leaks_${Date.now()}`,
        category: OptimizationCategory.MEMORY,
        priority: OptimizationPriority.HIGH,
        strategy: OptimizationStrategy.MANUAL,
        title: 'Potential Memory Leaks',
        description: `Found ${eventListeners.length} event listeners but only ${
          removeListeners?.length || 0
        } cleanup calls`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Ensure all event listeners are properly removed to prevent memory leaks',
        estimatedImpact: { performance: 0.3, memory: 0.9, maintainability: 0.2 },
      });
    }

    // Global variable usage
    const globalVars = content.match(/var\s+\w+|(?:^|\n)\s*\w+\s*=/gm);
    if (globalVars && globalVars.length > 3) {
      issues.push({
        id: `global_variables_${Date.now()}`,
        category: OptimizationCategory.MEMORY,
        priority: OptimizationPriority.LOW,
        strategy: OptimizationStrategy.ASSISTED,
        title: 'Excessive Global Variables',
        description: `Found ${globalVars.length} potential global variable declarations`,
        location: { filePath, startLine: 1, endLine: lines.length },
        recommendation: 'Minimize global variables and use proper scoping',
        estimatedImpact: { performance: 0.1, memory: 0.6, maintainability: 0.4 },
      });
    }

    return issues;
  }

  /**
   * Detect import-related issues
   */
  private detectImportIssues(
    filePath: string,
    content: string,
    metrics: CodeMetrics,
  ): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Unused imports detection (simplified)
    const importMatches = content.matchAll(/import\s+({[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const imported = match[1];
      const modulePath = match[2];

      if (imported.includes('{')) {
        // Named imports
        const namedImports = imported.replace(/[{}]/g, '').split(',').map(s => s.trim());
        for (const namedImport of namedImports) {
          const usage = new RegExp(`\\b${namedImport.replace(/\s+as\s+\w+/, '')}\\b`, 'g');
          if (!content.match(usage) || content.match(usage)?.length === 1) { // Only import statement
            issues.push({
              id: `unused_import_${Date.now()}_${namedImport}`,
              category: OptimizationCategory.IMPORTS,
              priority: OptimizationPriority.LOW,
              strategy: OptimizationStrategy.AUTOMATIC,
              title: 'Unused Import',
              description: `Import '${namedImport}' from '${modulePath}' appears to be unused`,
              location: { filePath, startLine: 1, endLine: 1 },
              recommendation: 'Remove unused imports to reduce bundle size',
              estimatedImpact: { performance: 0.1, memory: 0.2, maintainability: 0.3 },
              fix: {
                automatic: true,
                before: match[0],
                after: match[0].replace(namedImport, '').replace(/,\s*,/, ','),
                confidence: 0.8,
              },
            });
          }
        }
      }
    }

    // Excessive imports
    if (metrics.importCount > 20) {
      issues.push({
        id: `excessive_imports_${Date.now()}`,
        category: OptimizationCategory.IMPORTS,
        priority: OptimizationPriority.MEDIUM,
        strategy: OptimizationStrategy.MANUAL,
        title: 'Excessive Imports',
        description: `File has ${metrics.importCount} imports, consider refactoring`,
        location: { filePath, startLine: 1, endLine: 10 },
        recommendation: 'Break down large files or group related functionality',
        estimatedImpact: { performance: 0.2, memory: 0.3, maintainability: 0.6 },
      });
    }

    return issues;
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(metrics: CodeMetrics): number {
    // Simplified maintainability index calculation
    const volume = metrics.linesOfCode * Math.log2(metrics.functionCount + metrics.classCount + 1);
    const complexity = metrics.cyclomaticComplexity;
    const commentRatio = metrics.commentRatio;

    // Formula inspired by Microsoft's maintainability index
    let index = Math.max(
      0,
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(metrics.linesOfCode),
    );

    // Adjust for comment ratio
    index += commentRatio * 10;

    // Normalize to 0-100 scale
    return Math.min(100, Math.max(0, index));
  }

  /**
   * Discover code files in directory
   */
  private async discoverCodeFiles(directoryPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

    const walkDirectory = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip common directories that don't contain source code
          if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
            await walkDirectory(fullPath);
          }
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walkDirectory(directoryPath);
    return files;
  }

  /**
   * Extract dependencies from file content
   */
  private extractDependencies(content: string): string[] {
    const importMatches = content.matchAll(/import\s+.+\s+from\s+['"]([^'"]+)['"]/g);
    const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);

    const dependencies = new Set<string>();

    for (const match of importMatches) {
      dependencies.add(match[1]);
    }

    for (const match of requireMatches) {
      dependencies.add(match[1]);
    }

    return Array.from(dependencies);
  }

  /**
   * Extract exports from file content
   */
  private extractExports(content: string): string[] {
    const exportMatches = content.matchAll(
      /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s+{\s*([^}]+)\s*}/g,
    );

    const exports = new Set<string>();

    for (const match of exportMatches) {
      if (match[1]) {
        exports.add(match[1]);
      } else if (match[2]) {
        const namedExports = match[2].split(',').map(s => s.trim().split(' ')[0]);
        namedExports.forEach(exp => exports.add(exp));
      }
    }

    return Array.from(exports);
  }

  /**
   * Prioritize issues by impact and urgency
   */
  private prioritizeIssues(issues: CodeIssue[]): CodeIssue[] {
    return issues.sort((a, b) => {
      // Priority order: CRITICAL > HIGH > MEDIUM > LOW
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by estimated impact (performance weighted highest)
      const impactA = a.estimatedImpact.performance * 0.5 + a.estimatedImpact.memory * 0.3
        + a.estimatedImpact.maintainability * 0.2;
      const impactB = b.estimatedImpact.performance * 0.5 + b.estimatedImpact.memory * 0.3
        + b.estimatedImpact.maintainability * 0.2;

      return impactB - impactA;
    });
  }

  /**
   * Create optimization phases
   */
  private createOptimizationPhases(issues: CodeIssue[]): OptimizationPhase[] {
    const phases: OptimizationPhase[] = [];

    // Group issues by category
    const issuesByCategory = new Map<OptimizationCategory, CodeIssue[]>();
    for (const issue of issues) {
      const categoryIssues = issuesByCategory.get(issue.category) || [];
      categoryIssues.push(issue);
      issuesByCategory.set(issue.category, categoryIssues);
    }

    // Create phases with logical ordering
    const phaseOrder: OptimizationCategory[] = [
      OptimizationCategory.IMPORTS, // Clean up imports first
      OptimizationCategory.TYPE_SAFETY, // Improve type safety
      OptimizationCategory.CODE_QUALITY, // Address code quality issues
      OptimizationCategory.PERFORMANCE, // Optimize performance
      OptimizationCategory.MEMORY, // Address memory issues
      OptimizationCategory.CONFIGURATION, // Configuration improvements
      OptimizationCategory.ARCHITECTURE, // Architectural changes last
      OptimizationCategory.SECURITY, // Security improvements
    ];

    let order = 1;
    for (const category of phaseOrder) {
      const categoryIssues = issuesByCategory.get(category);
      if (categoryIssues && categoryIssues.length > 0) {
        phases.push({
          phaseId: `phase_${category}_${Date.now()}`,
          name: `${category.replace('_', ' ').toUpperCase()} Optimization`,
          description: `Address ${category.replace('_', ' ')} related issues`,
          category,
          issues: categoryIssues,
          estimatedTime: this.estimatePhaseTime(categoryIssues),
          prerequisites: order === 1 ? [] : [`phase_${phaseOrder[order - 2]}`],
          order,
        });
        order++;
      }
    }

    return phases;
  }

  /**
   * Calculate plan impact
   */
  private calculatePlanImpact(issues: CodeIssue[]) {
    const totalImpact = issues.reduce((acc, issue) => ({
      performance: acc.performance + issue.estimatedImpact.performance,
      memory: acc.memory + issue.estimatedImpact.memory,
      maintainability: acc.maintainability + issue.estimatedImpact.maintainability,
    }), { performance: 0, memory: 0, maintainability: 0 });

    // Normalize by number of issues (average impact)
    const count = issues.length || 1;
    return {
      performance: totalImpact.performance / count,
      memory: totalImpact.memory / count,
      maintainability: totalImpact.maintainability / count,
    };
  }

  /**
   * Estimate plan execution time
   */
  private estimatePlanTime(phases: OptimizationPhase[]): number {
    return phases.reduce((total, phase) => total + phase.estimatedTime, 0);
  }

  /**
   * Estimate phase execution time
   */
  private estimatePhaseTime(issues: CodeIssue[]): number {
    const timeEstimates = {
      [OptimizationStrategy.AUTOMATIC]: 5 * 60 * 1000, // 5 minutes
      [OptimizationStrategy.ASSISTED]: 15 * 60 * 1000, // 15 minutes
      [OptimizationStrategy.MANUAL]: 30 * 60 * 1000, // 30 minutes
      [OptimizationStrategy.ADVISORY]: 2 * 60 * 1000, // 2 minutes
    };

    return issues.reduce((total, issue) => {
      return total + (timeEstimates[issue.strategy] || timeEstimates[OptimizationStrategy.MANUAL]);
    }, 0);
  }

  /**
   * Identify plan dependencies
   */
  private identifyPlanDependencies(analysisResults: CodeAnalysisResult[]): string[] {
    const allDependencies = new Set<string>();

    for (const result of analysisResults) {
      result.dependencies.forEach(dep => allDependencies.add(dep));
    }

    return Array.from(allDependencies);
  }

  /**
   * Identify plan risks
   */
  private identifyPlanRisks(issues: CodeIssue[]): string[] {
    const risks: string[] = [];

    const criticalIssues = issues.filter(i => i.priority === OptimizationPriority.CRITICAL);
    if (criticalIssues.length > 0) {
      risks.push(`${criticalIssues.length} critical issues may require immediate attention`);
    }

    const manualIssues = issues.filter(i => i.strategy === OptimizationStrategy.MANUAL);
    if (manualIssues.length > issues.length * 0.5) {
      risks.push('High percentage of manual optimizations may require significant developer time');
    }

    const architecturalIssues = issues.filter(i =>
      i.category === OptimizationCategory.ARCHITECTURE
    );
    if (architecturalIssues.length > 0) {
      risks.push('Architectural changes may require extensive testing and coordination');
    }

    return risks;
  }

  /**
   * Execute optimization phase
   */
  private async executeOptimizationPhase(
    phase: OptimizationPhase,
    plan: OptimizationPlan,
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const issue of phase.issues) {
      try {
        const result = await this.executeOptimization(issue, plan);
        results.push(result);

        this.optimizationHistory.set(result.optimizationId, result);
        this.emit('optimization_completed', { issue, result });
      } catch (error) {
        const optimizationError = new AuditError(
          `Failed to execute optimization: ${error.message}`,
          ErrorCategory.PERFORMANCE,
          ErrorSeverity.MEDIUM,
          true,
          { component: 'CodeOptimizer', operation: 'optimization_execution', issueId: issue.id },
        );

        this.emit('optimization_failed', { issue, error: optimizationError });
      }
    }

    return results;
  }

  /**
   * Execute individual optimization
   */
  private async executeOptimization(
    issue: CodeIssue,
    plan: OptimizationPlan,
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get current metrics
    const beforeMetrics = this.analysisResults.get(issue.location.filePath)?.metrics;

    let applied = false;
    const warnings: string[] = [];
    const errors: AuditError[] = [];

    try {
      switch (issue.strategy) {
        case OptimizationStrategy.AUTOMATIC:
          applied = await this.applyAutomaticOptimization(issue);
          break;

        case OptimizationStrategy.ASSISTED:
          // For now, just log the recommendation
          warnings.push(`Assisted optimization required: ${issue.recommendation}`);
          break;

        case OptimizationStrategy.MANUAL:
          warnings.push(`Manual optimization required: ${issue.recommendation}`);
          break;

        case OptimizationStrategy.ADVISORY:
          warnings.push(`Advisory: ${issue.recommendation}`);
          break;
      }
    } catch (error) {
      const executionError = new AuditError(
        `Optimization execution failed: ${error.message}`,
        ErrorCategory.PERFORMANCE,
        ErrorSeverity.MEDIUM,
        true,
        { optimizationId, issueId: issue.id },
      );
      errors.push(executionError);
    }

    // Re-analyze file if optimization was applied
    let afterMetrics = beforeMetrics;
    if (applied) {
      try {
        const newAnalysis = await this.analyzeFile(issue.location.filePath);
        afterMetrics = newAnalysis.metrics;
        this.analysisResults.set(issue.location.filePath, newAnalysis);
      } catch (reanalysisError) {
        warnings.push(`Could not re-analyze file after optimization: ${reanalysisError.message}`);
      }
    }

    return {
      optimizationId,
      category: issue.category,
      priority: issue.priority,
      strategy: issue.strategy,
      applied,
      impact: {
        filesModified: applied ? 1 : 0,
        linesChanged: 0, // Would need to calculate actual changes
        performanceImprovement: this.calculatePerformanceImprovement(beforeMetrics, afterMetrics),
        memoryReduction: this.calculateMemoryReduction(beforeMetrics, afterMetrics),
      },
      before: beforeMetrics || this.getDefaultMetrics(),
      after: afterMetrics || this.getDefaultMetrics(),
      executionTime: Date.now() - startTime,
      warnings,
      errors,
    };
  }

  /**
   * Apply automatic optimization
   */
  private async applyAutomaticOptimization(issue: CodeIssue): Promise<boolean> {
    if (
      !issue.fix || !issue.fix.automatic || issue.fix.confidence < this.config.minAutoFixConfidence
    ) {
      return false;
    }

    try {
      // Create backup if enabled
      if (this.config.createBackups) {
        await this.createBackup(issue.location.filePath);
      }

      // Read file content
      const content = await fs.readFile(issue.location.filePath, 'utf-8');

      // Apply fix
      const fixedContent = content.replace(issue.fix.before, issue.fix.after);

      // Verify the change was applied
      if (fixedContent === content) {
        return false; // No change was made
      }

      // Write fixed content back
      await fs.writeFile(issue.location.filePath, fixedContent, 'utf-8');

      return true;
    } catch (error) {
      throw new AuditError(
        `Failed to apply automatic optimization: ${error.message}`,
        ErrorCategory.FILESYSTEM,
        ErrorSeverity.MEDIUM,
        true,
        { filePath: issue.location.filePath },
      );
    }
  }

  /**
   * Create backup of file before modification
   */
  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
  }

  /**
   * Calculate performance improvement
   */
  private calculatePerformanceImprovement(before?: CodeMetrics, after?: CodeMetrics): number {
    if (!before || !after) return 0;

    // Simplified calculation based on complexity reduction
    const complexityImprovement = (before.cyclomaticComplexity - after.cyclomaticComplexity)
      / before.cyclomaticComplexity;
    return Math.max(0, complexityImprovement);
  }

  /**
   * Calculate memory reduction
   */
  private calculateMemoryReduction(before?: CodeMetrics, after?: CodeMetrics): number {
    if (!before || !after) return 0;

    // Simplified calculation based on lines of code reduction
    const locReduction = (before.linesOfCode - after.linesOfCode) / before.linesOfCode;
    return Math.max(0, locReduction);
  }

  /**
   * Get default metrics structure
   */
  private getDefaultMetrics(): CodeMetrics {
    return {
      cyclomaticComplexity: 0,
      cognitiveComplexity: 0,
      linesOfCode: 0,
      commentRatio: 0,
      duplicateLineRatio: 0,
      typeAnnotationRatio: 0,
      importCount: 0,
      exportCount: 0,
      functionCount: 0,
      classCount: 0,
    };
  }

  /**
   * Validate constitutional compliance during optimization
   */
  private async validateConstitutionalCompliance(): Promise<void> {
    const currentMemory = process.memoryUsage().heapUsed;

    if (currentMemory > this.config.memoryLimit) {
      throw new AuditError(
        `Optimization process exceeded memory limit: ${currentMemory} > ${this.config.memoryLimit}`,
        ErrorCategory.MEMORY,
        ErrorSeverity.CRITICAL,
        true,
        { component: 'CodeOptimizer', operation: 'constitutional_validation' },
      );
    }
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): Map<string, OptimizationResult> {
    return new Map(this.optimizationHistory);
  }

  /**
   * Get analysis results
   */
  public getAnalysisResults(): Map<string, CodeAnalysisResult> {
    return new Map(this.analysisResults);
  }

  /**
   * Get active optimizations
   */
  public getActiveOptimizations(): Map<string, OptimizationPlan> {
    return new Map(this.activeOptimizations);
  }
}
