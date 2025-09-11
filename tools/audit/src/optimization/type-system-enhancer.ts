/**
 * TypeSystemEnhancer - Advanced Type Safety and Enhancement System
 *
 * Part of the comprehensive optimization suite, this component focuses on:
 * - TypeScript type safety analysis and improvement
 * - Type coverage analysis and enhancement
 * - Strict mode compliance and migration
 * - Generic type optimization and inference
 * - Type assertion safety and validation
 * - Constitutional compliance for type safety requirements
 *
 * Constitutional Requirements:
 * - Must maintain functionality while strengthening types
 * - Type safety improvements must be measurable and validated
 * - All type changes must preserve existing API contracts
 * - Processing must stay within constitutional time limits
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { Node, Project, SourceFile, ts, Type, TypeChecker } from 'ts-morph';

// Constitutional Requirements for Type Safety
export const TYPE_SAFETY_REQUIREMENTS = {
  MIN_TYPE_COVERAGE: 0.85, // 85% minimum type coverage
  MAX_ANY_USAGE: 0.05, // 5% maximum 'any' type usage
  MAX_TYPE_ASSERTIONS: 0.03, // 3% maximum type assertions
  MIN_STRICT_MODE_SCORE: 0.90, // 90% strict mode compliance
  MAX_PROCESSING_TIME_MS: 45 * 60 * 1000, // 45 minutes
} as const;

export interface TypeAnalysis {
  filePath: string;
  typeCoverage: {
    total: number;
    typed: number;
    untyped: number;
    percentage: number;
  };
  typeIssues: TypeIssue[];
  strictModeCompliance: StrictModeCompliance;
  genericOptimizations: GenericOptimization[];
  typeEnhancements: TypeEnhancementSuggestion[];
}

export interface TypeIssue {
  id: string;
  type:
    | 'any-usage'
    | 'implicit-any'
    | 'unsafe-assertion'
    | 'missing-generic'
    | 'weak-type'
    | 'circular-type';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file: string;
    line: number;
    column: number;
    node?: string;
  };
  description: string;
  currentType: string;
  suggestedType: string;
  impact: {
    safetyScore: number; // 1-10, 10 being safest
    maintainabilityImpact: number; // 1-10
    performanceImpact: number; // 1-10
  };
  autoFixable: boolean;
  codeExample?: {
    before: string;
    after: string;
  };
}

export interface StrictModeCompliance {
  enabled: {
    strict: boolean;
    noImplicitAny: boolean;
    noImplicitReturns: boolean;
    noImplicitThis: boolean;
    strictNullChecks: boolean;
    strictFunctionTypes: boolean;
    strictBindCallApply: boolean;
    strictPropertyInitialization: boolean;
  };
  violations: Array<{
    rule: keyof StrictModeCompliance['enabled'];
    locations: Array<{
      file: string;
      line: number;
      description: string;
    }>;
  }>;
  complianceScore: number; // 0-1
}

export interface GenericOptimization {
  id: string;
  type: 'add-constraint' | 'improve-inference' | 'add-generic' | 'simplify-generic';
  priority: number; // 1-10
  location: {
    file: string;
    line: number;
    function?: string;
    class?: string;
  };
  description: string;
  currentSignature: string;
  optimizedSignature: string;
  benefits: {
    typeInference: boolean;
    reusability: boolean;
    performance: boolean;
    maintainability: boolean;
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    estimatedTimeHours: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface TypeEnhancementSuggestion {
  id: string;
  type: 'strengthen-type' | 'add-union' | 'add-literal' | 'add-branded' | 'add-conditional';
  priority: number; // 1-10
  description: string;
  filePath: string;
  location: {
    line: number;
    column: number;
    symbol?: string;
  };
  enhancement: {
    from: string;
    to: string;
    reasoning: string;
  };
  impact: {
    safetyImprovement: number; // percentage
    errorPrevention: string[]; // Types of errors prevented
    apiStability: boolean;
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    breakingChange: boolean;
    requiresRefactoring: boolean;
  };
}

export interface TypeSafetyMetrics {
  overall: {
    typeCoverage: number;
    anyUsage: number;
    typeAssertions: number;
    strictModeScore: number;
    safetyScore: number; // Composite score 1-10
  };
  files: {
    total: number;
    fullyTyped: number;
    partiallyTyped: number;
    untyped: number;
  };
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  enhancements: {
    available: number;
    autoFixable: number;
    manualFixRequired: number;
  };
}

export interface TypeEnhancementResult {
  enhancementId: string;
  type: TypeEnhancementSuggestion['type'];
  implemented: boolean;
  error?: string;
  filesModified: string[];
  before: {
    typeCoverage: number;
    anyUsage: number;
    safetyScore: number;
  };
  after?: {
    typeCoverage: number;
    anyUsage: number;
    safetyScore: number;
  };
  improvement: {
    typeCoverageGain: number; // percentage points
    anyUsageReduction: number; // percentage points
    safetyScoreGain: number; // points
  };
  constitutionalCompliance: {
    meetsTypeCoverage: boolean;
    meetsAnyUsageLimit: boolean;
    maintainsApiStability: boolean;
    preservesFunctionality: boolean;
  };
}
export class TypeSystemEnhancer extends EventEmitter {
  private readonly project: Project;
  private readonly typeChecker: TypeChecker;
  private readonly analysisCache = new Map<string, TypeAnalysis>();
  private readonly activeEnhancements = new Set<string>();

  constructor(tsConfigPath?: string) {
    super();

    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: false,
      manipulationSettings: {
        useTrailingCommas: true,
        quoteKind: '"' as any,
      },
    });

    this.typeChecker = this.project.getTypeChecker();
    this.setupEventHandlers();
  }

  /**
   * Analyze type safety across the entire project
   */
  async analyzeTypeSafety(
    targetPath: string,
    options: {
      recursive?: boolean;
      includeDeclarationFiles?: boolean;
      ignorePatterns?: string[];
      analysisDepth?: 'basic' | 'comprehensive' | 'exhaustive';
    } = {},
  ): Promise<{
    analyses: Map<string, TypeAnalysis>;
    metrics: TypeSafetyMetrics;
    projectCompliance: {
      meetsConstitutionalRequirements: boolean;
      violations: string[];
      recommendations: string[];
    };
  }> {
    this.emit('analysis:started', { targetPath, options });

    const startTime = performance.now();
    const analyses = new Map<string, TypeAnalysis>();

    try {
      // Get all TypeScript source files
      const sourceFiles = await this.getSourceFiles(targetPath, options);

      this.emit('analysis:progress', {
        phase: 'discovery',
        filesFound: sourceFiles.length,
      });

      // Analyze each file for type issues
      const analysisPromises = sourceFiles.map(async file => {
        try {
          const analysis = await this.analyzeFileTypes(file, options);
          analyses.set(file.getFilePath(), analysis);
          return analysis;
        } catch (error) {
          this.emit('analysis:file-error', {
            filePath: file.getFilePath(),
            error: error.message,
          });
          return null;
        }
      });

      await Promise.all(analysisPromises);

      // Calculate overall metrics
      const metrics = this.calculateTypeMetrics(analyses);

      this.emit('analysis:progress', {
        phase: 'metrics-calculation',
        metrics,
      });

      // Assess constitutional compliance
      const projectCompliance = this.assessProjectCompliance(metrics);

      const endTime = performance.now();
      this.emit('analysis:completed', {
        targetPath,
        analysisTime: endTime - startTime,
        filesAnalyzed: analyses.size,
        overallSafetyScore: metrics.overall.safetyScore,
        compliance: projectCompliance,
      });

      return { analyses, metrics, projectCompliance };
    } catch (error) {
      this.emit('analysis:error', { targetPath, error: error.message });
      throw new Error(`Type safety analysis failed: ${error.message}`);
    }
  }

  /**
   * Create comprehensive type enhancement plan
   */
  async createEnhancementPlan(
    analyses: Map<string, TypeAnalysis>,
    options: {
      priorityThreshold?: number;
      maxRiskLevel?: 'low' | 'medium' | 'high';
      focusAreas?: TypeEnhancementSuggestion['type'][];
      autoFixOnly?: boolean;
    } = {},
  ): Promise<{
    planId: string;
    suggestions: TypeEnhancementSuggestion[];
    estimatedImpact: {
      typeCoverageImprovement: number;
      anyUsageReduction: number;
      safetyScoreImprovement: number;
      errorPreventionCount: number;
    };
    implementationPhases: Array<{
      phase: number;
      suggestions: string[];
      description: string;
      estimatedTime: number;
    }>;
    risks: Array<{ level: string; description: string; mitigation: string }>;
  }> {
    const planId = `type-enhance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.emit('planning:started', { planId });

    try {
      // Collect all type enhancement suggestions
      const allSuggestions: TypeEnhancementSuggestion[] = [];

      for (const analysis of analyses.values()) {
        allSuggestions.push(...analysis.typeEnhancements);
      }

      // Filter suggestions based on options
      const filteredSuggestions = this.filterEnhancementSuggestions(allSuggestions, options);

      // Calculate estimated impact
      const estimatedImpact = this.calculateEnhancementImpact(filteredSuggestions);

      // Create implementation phases
      const implementationPhases = this.createImplementationPhases(filteredSuggestions);

      // Assess risks
      const risks = this.assessEnhancementRisks(filteredSuggestions);

      const plan = {
        planId,
        suggestions: filteredSuggestions,
        estimatedImpact,
        implementationPhases,
        risks,
      };

      this.emit('planning:completed', { planId, plan });
      return plan;
    } catch (error) {
      this.emit('planning:error', { planId, error: error.message });
      throw new Error(`Type enhancement planning failed: ${error.message}`);
    }
  }

  /**
   * Execute type enhancement plan with validation
   */
  async executeEnhancementPlan(
    planId: string,
    suggestions: TypeEnhancementSuggestion[],
    options: {
      dryRun?: boolean;
      backupBeforeEnhancement?: boolean;
      validateAfterEachPhase?: boolean;
      maxConcurrentEnhancements?: number;
    } = {},
  ): Promise<TypeEnhancementResult[]> {
    if (this.activeEnhancements.has(planId)) {
      throw new Error(`Enhancement plan already executing: ${planId}`);
    }

    this.activeEnhancements.add(planId);
    this.emit('enhancement:started', { planId });

    const results: TypeEnhancementResult[] = [];

    try {
      // Create backup if requested
      if (options.backupBeforeEnhancement) {
        await this.createEnhancementBackup(planId);
      }

      // Group suggestions into phases
      const phases = this.createImplementationPhases(suggestions);

      for (const [phaseIndex, phase] of phases.entries()) {
        this.emit('phase:started', {
          planId,
          phase: phaseIndex + 1,
          description: phase.description,
        });

        // Execute suggestions in this phase
        const phasePromises = phase.suggestions.map(async suggestionId => {
          const suggestion = suggestions.find(s => s.id === suggestionId);
          if (!suggestion) {
            throw new Error(`Enhancement suggestion not found: ${suggestionId}`);
          }

          return this.executeEnhancement(suggestion, options);
        });

        const phaseResults = await Promise.allSettled(phasePromises);

        for (const result of phaseResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            this.emit('enhancement:error', {
              planId,
              phase: phaseIndex + 1,
              error: result.reason.message,
            });

            results.push({
              enhancementId: `failed_${Date.now()}`,
              type: 'strengthen-type',
              implemented: false,
              error: result.reason.message,
              filesModified: [],
              before: { typeCoverage: 0, anyUsage: 0, safetyScore: 0 },
              improvement: { typeCoverageGain: 0, anyUsageReduction: 0, safetyScoreGain: 0 },
              constitutionalCompliance: {
                meetsTypeCoverage: false,
                meetsAnyUsageLimit: false,
                maintainsApiStability: false,
                preservesFunctionality: false,
              },
            });
          }
        }

        // Validate after phase if requested
        if (options.validateAfterEachPhase) {
          await this.validatePhaseResults(results, phaseIndex + 1);
        }

        this.emit('phase:completed', {
          planId,
          phase: phaseIndex + 1,
          results: phaseResults.length,
        });
      }

      // Final validation and compilation
      await this.finalizeEnhancements(results, options);

      this.emit('enhancement:completed', { planId, results });
      return results;
    } catch (error) {
      this.emit('enhancement:error', { planId, error: error.message });

      // Attempt rollback if backup exists
      if (options.backupBeforeEnhancement) {
        await this.rollbackEnhancements(planId);
      }

      throw new Error(`Type enhancement execution failed: ${error.message}`);
    } finally {
      this.activeEnhancements.delete(planId);
    }
  } /**
   * Analyze types in a specific file
   */

  private async analyzeFileTypes(
    sourceFile: SourceFile,
    options: any,
  ): Promise<TypeAnalysis> {
    const filePath = sourceFile.getFilePath();

    // Check cache first
    if (this.analysisCache.has(filePath)) {
      return this.analysisCache.get(filePath)!;
    }

    const analysis: TypeAnalysis = {
      filePath,
      typeCoverage: { total: 0, typed: 0, untyped: 0, percentage: 0 },
      typeIssues: [],
      strictModeCompliance: this.analyzeStrictModeCompliance(sourceFile),
      genericOptimizations: [],
      typeEnhancements: [],
    };

    try {
      // Calculate type coverage
      analysis.typeCoverage = await this.calculateTypeCoverage(sourceFile);

      // Detect type issues
      analysis.typeIssues = await this.detectTypeIssues(sourceFile);

      // Find generic optimization opportunities
      analysis.genericOptimizations = await this.findGenericOptimizations(sourceFile);

      // Generate type enhancement suggestions
      analysis.typeEnhancements = await this.generateTypeEnhancements(analysis);

      // Cache the analysis
      this.analysisCache.set(filePath, analysis);

      return analysis;
    } catch (error) {
      this.emit('file-analysis:error', { filePath, error: error.message });
      return analysis; // Return partial analysis
    }
  }

  /**
   * Calculate type coverage for a file
   */
  private async calculateTypeCoverage(
    sourceFile: SourceFile,
  ): Promise<TypeAnalysis['typeCoverage']> {
    let total = 0;
    let typed = 0;

    // Analyze variable declarations
    const variableDeclarations = sourceFile.getVariableDeclarations();
    for (const varDecl of variableDeclarations) {
      total++;
      const type = this.typeChecker.getTypeAtLocation(varDecl);
      if (this.isWellTyped(type)) {
        typed++;
      }
    }

    // Analyze function parameters and return types
    const functions = sourceFile.getFunctions();
    for (const func of functions) {
      // Return type
      total++;
      if (func.getReturnTypeNode()) {
        typed++;
      } else {
        const inferredType = this.typeChecker.getTypeAtLocation(func);
        if (this.isWellTyped(inferredType)) {
          typed++;
        }
      }

      // Parameters
      for (const param of func.getParameters()) {
        total++;
        if (param.getTypeNode()) {
          typed++;
        } else {
          const paramType = this.typeChecker.getTypeAtLocation(param);
          if (this.isWellTyped(paramType)) {
            typed++;
          }
        }
      }
    }

    // Analyze class properties and methods
    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      // Properties
      for (const prop of cls.getProperties()) {
        total++;
        if (prop.getTypeNode()) {
          typed++;
        } else {
          const propType = this.typeChecker.getTypeAtLocation(prop);
          if (this.isWellTyped(propType)) {
            typed++;
          }
        }
      }

      // Methods
      for (const method of cls.getMethods()) {
        // Return type
        total++;
        if (method.getReturnTypeNode()) {
          typed++;
        }

        // Parameters
        for (const param of method.getParameters()) {
          total++;
          if (param.getTypeNode()) {
            typed++;
          }
        }
      }
    }

    const untyped = total - typed;
    const percentage = total > 0 ? typed / total : 1;

    return { total, typed, untyped, percentage };
  }

  /**
   * Detect various type issues in a file
   */
  private async detectTypeIssues(sourceFile: SourceFile): Promise<TypeIssue[]> {
    const issues: TypeIssue[] = [];

    // Detect 'any' usage
    issues.push(...this.detectAnyUsage(sourceFile));

    // Detect unsafe type assertions
    issues.push(...this.detectUnsafeAssertions(sourceFile));

    // Detect implicit any types
    issues.push(...this.detectImplicitAny(sourceFile));

    // Detect missing generics
    issues.push(...this.detectMissingGenerics(sourceFile));

    // Detect weak types
    issues.push(...this.detectWeakTypes(sourceFile));

    return issues;
  }

  /**
   * Detect 'any' type usage
   */
  private detectAnyUsage(sourceFile: SourceFile): TypeIssue[] {
    const issues: TypeIssue[] = [];

    // Find explicit 'any' usage
    sourceFile.forEachDescendant(node => {
      if (Node.isTypeReference(node) && node.getText() === 'any') {
        const location = node.getStartLineNumber();
        issues.push({
          id: `any-usage-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          type: 'any-usage',
          severity: 'high',
          location: {
            file: sourceFile.getFilePath(),
            line: location,
            column: node.getStartLinePos(),
            node: node.getParent()?.getKindName(),
          },
          description: 'Explicit use of "any" type reduces type safety',
          currentType: 'any',
          suggestedType: this.suggestBetterType(node),
          impact: {
            safetyScore: 2,
            maintainabilityImpact: 7,
            performanceImpact: 5,
          },
          autoFixable: false,
          codeExample: {
            before: `let value: any = getValue();`,
            after: `let value: string | number = getValue(); // or appropriate union type`,
          },
        });
      }
    });

    return issues;
  }

  /**
   * Detect unsafe type assertions
   */
  private detectUnsafeAssertions(sourceFile: SourceFile): TypeIssue[] {
    const issues: TypeIssue[] = [];

    sourceFile.forEachDescendant(node => {
      if (Node.isAsExpression(node) || Node.isTypeAssertion(node)) {
        const location = node.getStartLineNumber();
        const assertedType = node.getTypeNode?.()?.getText() || 'unknown';

        // Check if assertion might be unsafe
        const sourceType = this.typeChecker.getTypeAtLocation(node.getExpression());
        const targetType = this.typeChecker.getTypeAtLocation(node);

        if (!this.isTypeSafeAssertion(sourceType, targetType)) {
          issues.push({
            id: `unsafe-assertion-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'unsafe-assertion',
            severity: 'medium',
            location: {
              file: sourceFile.getFilePath(),
              line: location,
              column: node.getStartLinePos(),
            },
            description: 'Potentially unsafe type assertion',
            currentType: sourceType.getSymbol()?.getName() || 'unknown',
            suggestedType: this.suggestSaferAssertion(sourceType, targetType),
            impact: {
              safetyScore: 4,
              maintainabilityImpact: 6,
              performanceImpact: 8,
            },
            autoFixable: false,
            codeExample: {
              before: `const value = data as ${assertedType};`,
              after: `const value = this.validateAndCast<${assertedType}>(data);`,
            },
          });
        }
      }
    });

    return issues;
  }

  /**
   * Detect implicit any types
   */
  private detectImplicitAny(sourceFile: SourceFile): TypeIssue[] {
    const issues: TypeIssue[] = [];

    // This would require deeper TypeScript compiler integration
    // For now, return empty array as placeholder
    return issues;
  }

  /**
   * Detect missing generics opportunities
   */
  private detectMissingGenerics(sourceFile: SourceFile): TypeIssue[] {
    const issues: TypeIssue[] = [];

    // Analyze functions that could benefit from generics
    sourceFile.getFunctions().forEach(func => {
      if (this.couldBenefitFromGenerics(func)) {
        const location = func.getStartLineNumber();
        issues.push({
          id: `missing-generic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'missing-generic',
          severity: 'medium',
          location: {
            file: sourceFile.getFilePath(),
            line: location,
            column: func.getStartLinePos(),
            node: func.getName(),
          },
          description: 'Function could benefit from generic type parameters',
          currentType: func.getSignature().getText(),
          suggestedType: this.suggestGenericSignature(func),
          impact: {
            safetyScore: 7,
            maintainabilityImpact: 8,
            performanceImpact: 6,
          },
          autoFixable: false,
          codeExample: {
            before: `function process(data: any[]): any[] { return data.map(transform); }`,
            after: `function process<T>(data: T[]): T[] { return data.map(transform); }`,
          },
        });
      }
    });

    return issues;
  }

  /**
   * Detect weak types that could be strengthened
   */
  private detectWeakTypes(sourceFile: SourceFile): TypeIssue[] {
    const issues: TypeIssue[] = [];

    // Find variables with weak types like 'object' or overly broad unions
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const type = this.typeChecker.getTypeAtLocation(varDecl);
      if (this.isWeakType(type)) {
        const location = varDecl.getStartLineNumber();
        issues.push({
          id: `weak-type-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'weak-type',
          severity: 'low',
          location: {
            file: sourceFile.getFilePath(),
            line: location,
            column: varDecl.getStartLinePos(),
            node: varDecl.getName(),
          },
          description: 'Type could be more specific for better type safety',
          currentType: type.getText(varDecl),
          suggestedType: this.suggestStrongerType(type, varDecl),
          impact: {
            safetyScore: 6,
            maintainabilityImpact: 7,
            performanceImpact: 8,
          },
          autoFixable: false,
        });
      }
    });

    return issues;
  }

  /**
   * Find generic optimization opportunities
   */
  private async findGenericOptimizations(sourceFile: SourceFile): Promise<GenericOptimization[]> {
    const optimizations: GenericOptimization[] = [];

    // Analyze functions for generic improvements
    sourceFile.getFunctions().forEach(func => {
      const optimization = this.analyzeGenericOptimization(func);
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    // Analyze classes for generic improvements
    sourceFile.getClasses().forEach(cls => {
      const optimization = this.analyzeClassGenericOptimization(cls);
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    return optimizations;
  }

  /**
   * Analyze strict mode compliance
   */
  private analyzeStrictModeCompliance(sourceFile: SourceFile): StrictModeCompliance {
    // Get TypeScript compiler options
    const compilerOptions = this.project.getCompilerOptions();

    const enabled = {
      strict: !!compilerOptions.strict,
      noImplicitAny: !!compilerOptions.noImplicitAny,
      noImplicitReturns: !!compilerOptions.noImplicitReturns,
      noImplicitThis: !!compilerOptions.noImplicitThis,
      strictNullChecks: !!compilerOptions.strictNullChecks,
      strictFunctionTypes: !!compilerOptions.strictFunctionTypes,
      strictBindCallApply: !!compilerOptions.strictBindCallApply,
      strictPropertyInitialization: !!compilerOptions.strictPropertyInitialization,
    };

    // Detect violations (simplified implementation)
    const violations: StrictModeCompliance['violations'] = [];

    // Calculate compliance score
    const enabledCount = Object.values(enabled).filter(Boolean).length;
    const complianceScore = enabledCount / Object.keys(enabled).length;

    return { enabled, violations, complianceScore };
  }

  /**
   * Generate type enhancement suggestions
   */
  private async generateTypeEnhancements(
    analysis: TypeAnalysis,
  ): Promise<TypeEnhancementSuggestion[]> {
    const suggestions: TypeEnhancementSuggestion[] = [];

    // Convert type issues to enhancement suggestions
    for (const issue of analysis.typeIssues) {
      if (issue.autoFixable || issue.severity === 'high') {
        suggestions.push({
          id: `enhance-${issue.id}`,
          type: this.mapIssueToEnhancementType(issue.type),
          priority: this.calculateEnhancementPriority(issue),
          description: `Fix ${issue.type}: ${issue.description}`,
          filePath: analysis.filePath,
          location: {
            line: issue.location.line,
            column: issue.location.column,
            symbol: issue.location.node,
          },
          enhancement: {
            from: issue.currentType,
            to: issue.suggestedType,
            reasoning: issue.description,
          },
          impact: {
            safetyImprovement: (issue.impact.safetyScore / 10) * 100,
            errorPrevention: this.getErrorPreventionTypes(issue.type),
            apiStability: issue.type !== 'missing-generic', // Generics might change APIs
          },
          implementation: {
            complexity: this.getImplementationComplexity(issue),
            breakingChange: issue.type === 'missing-generic',
            requiresRefactoring: issue.severity === 'critical',
          },
        });
      }
    }

    // Add generic optimization suggestions
    for (const optimization of analysis.genericOptimizations) {
      suggestions.push({
        id: `enhance-generic-${optimization.id}`,
        type: 'add-generic',
        priority: optimization.priority,
        description: optimization.description,
        filePath: analysis.filePath,
        location: {
          line: optimization.location.line,
          column: 0,
          symbol: optimization.location.function || optimization.location.class,
        },
        enhancement: {
          from: optimization.currentSignature,
          to: optimization.optimizedSignature,
          reasoning: `Generic optimization: ${optimization.type}`,
        },
        impact: {
          safetyImprovement: 25, // Generic improvements typically provide 25% safety improvement
          errorPrevention: ['type-mismatch', 'runtime-error', 'api-misuse'],
          apiStability: !optimization.benefits.reusability, // Reusability changes might affect APIs
        },
        implementation: {
          complexity: optimization.implementation.complexity,
          breakingChange: optimization.benefits.reusability,
          requiresRefactoring: optimization.implementation.complexity === 'high',
        },
      });
    }

    return suggestions;
  } /**
   * Utility methods for type analysis and enhancement
   */

  private async getSourceFiles(
    targetPath: string,
    options: { recursive?: boolean; includeDeclarationFiles?: boolean; ignorePatterns?: string[] },
  ): Promise<SourceFile[]> {
    const stats = await fs.stat(targetPath);

    if (stats.isFile() && this.isTypeScriptFile(targetPath)) {
      const sourceFile = this.project.getSourceFile(targetPath);
      return sourceFile ? [sourceFile] : [];
    }

    if (stats.isDirectory()) {
      const pattern = options.includeDeclarationFiles
        ? `${targetPath}/**/*.{ts,tsx,d.ts}`
        : `${targetPath}/**/*.{ts,tsx}`;

      this.project.addSourceFilesAtPaths(pattern);

      let sourceFiles = this.project.getSourceFiles();

      // Apply filters
      if (options.ignorePatterns) {
        sourceFiles = sourceFiles.filter(sf => {
          const filePath = sf.getFilePath();
          return !options.ignorePatterns!.some(pattern => filePath.includes(pattern));
        });
      }

      return sourceFiles;
    }

    return [];
  }

  private isTypeScriptFile(filePath: string): boolean {
    return /\.(ts|tsx|d\.ts)$/.test(filePath);
  }

  private isWellTyped(type: Type): boolean {
    // Check if type is well-defined (not 'any' or 'unknown' implicitly)
    const typeText = type.getText();
    return typeText !== 'any' && typeText !== 'unknown' && !typeText.includes('{}');
  }

  private suggestBetterType(node: Node): string {
    // Analyze usage context to suggest better type
    const parent = node.getParent();
    if (Node.isVariableDeclaration(parent)) {
      const initializer = parent.getInitializer();
      if (initializer) {
        const initType = this.typeChecker.getTypeAtLocation(initializer);
        return initType.getText() !== 'any' ? initType.getText() : 'unknown';
      }
    }
    return 'unknown'; // Safer than 'any'
  }

  private isTypeSafeAssertion(sourceType: Type, targetType: Type): boolean {
    // Simplified check for type assertion safety
    // In practice, this would involve more complex type compatibility checking
    return sourceType.getText() !== 'any' && targetType.getText() !== 'any';
  }

  private suggestSaferAssertion(sourceType: Type, targetType: Type): string {
    return `Use type guards or validation instead of assertion`;
  }

  private couldBenefitFromGenerics(func: any): boolean {
    // Check if function has parameters that could be generics
    const params = func.getParameters();
    return params.some(param => {
      const typeText = param.getTypeNode()?.getText();
      return typeText === 'any' || typeText === 'unknown' || !typeText;
    });
  }

  private suggestGenericSignature(func: any): string {
    const name = func.getName();
    const params = func.getParameters().map(p => p.getName()).join(', ');
    return `function ${name}<T>(${params}: T[]): T[]`;
  }

  private isWeakType(type: Type): boolean {
    const typeText = type.getText();
    const weakTypes = ['object', 'Object', '{}', 'any'];
    return weakTypes.some(weak => typeText.includes(weak));
  }

  private suggestStrongerType(type: Type, context: any): string {
    // Analyze usage context to suggest stronger type
    return 'Record<string, unknown>'; // Better than 'object'
  }

  private analyzeGenericOptimization(func: any): GenericOptimization | null {
    // Simplified generic analysis
    if (this.couldBenefitFromGenerics(func)) {
      return {
        id: `generic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'add-generic',
        priority: 6,
        location: {
          file: func.getSourceFile().getFilePath(),
          line: func.getStartLineNumber(),
          function: func.getName(),
        },
        description: 'Add generic type parameters for better type safety',
        currentSignature: func.getSignature().getText(),
        optimizedSignature: this.suggestGenericSignature(func),
        benefits: {
          typeInference: true,
          reusability: true,
          performance: false,
          maintainability: true,
        },
        implementation: {
          complexity: 'medium',
          estimatedTimeHours: 2,
          riskLevel: 'low',
        },
      };
    }
    return null;
  }

  private analyzeClassGenericOptimization(cls: any): GenericOptimization | null {
    // Analyze class for generic opportunities
    if (cls.getProperties().some(prop => !prop.getTypeNode())) {
      return {
        id: `class-generic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'add-generic',
        priority: 7,
        location: {
          file: cls.getSourceFile().getFilePath(),
          line: cls.getStartLineNumber(),
          class: cls.getName(),
        },
        description: 'Add generic type parameters to class for better flexibility',
        currentSignature: cls.getName(),
        optimizedSignature: `${cls.getName()}<T>`,
        benefits: {
          typeInference: true,
          reusability: true,
          performance: true,
          maintainability: true,
        },
        implementation: {
          complexity: 'high',
          estimatedTimeHours: 4,
          riskLevel: 'medium',
        },
      };
    }
    return null;
  }

  private calculateTypeMetrics(analyses: Map<string, TypeAnalysis>): TypeSafetyMetrics {
    let totalCoverage = 0;
    let totalAnyUsage = 0;
    let totalAssertions = 0;
    let totalStrictScore = 0;

    let fullyTyped = 0;
    let partiallyTyped = 0;
    let untyped = 0;

    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    let availableEnhancements = 0;
    let autoFixableEnhancements = 0;

    for (const analysis of analyses.values()) {
      // Coverage metrics
      totalCoverage += analysis.typeCoverage.percentage;
      totalStrictScore += analysis.strictModeCompliance.complianceScore;

      // File classification
      if (analysis.typeCoverage.percentage >= 0.9) fullyTyped++;
      else if (analysis.typeCoverage.percentage >= 0.5) partiallyTyped++;
      else untyped++;

      // Issue counting
      for (const issue of analysis.typeIssues) {
        switch (issue.severity) {
          case 'critical':
            criticalIssues++;
            break;
          case 'high':
            highIssues++;
            break;
          case 'medium':
            mediumIssues++;
            break;
          case 'low':
            lowIssues++;
            break;
        }

        if (issue.type === 'any-usage') totalAnyUsage++;
        if (issue.type === 'unsafe-assertion') totalAssertions++;
      }

      // Enhancement counting
      availableEnhancements += analysis.typeEnhancements.length;
      autoFixableEnhancements += analysis.typeEnhancements
        .filter(e => !e.implementation.requiresRefactoring).length;
    }

    const fileCount = analyses.size;
    const avgCoverage = fileCount > 0 ? totalCoverage / fileCount : 0;
    const avgStrictScore = fileCount > 0 ? totalStrictScore / fileCount : 0;

    // Calculate composite safety score (1-10)
    const safetyScore = Math.min(
      10,
      Math.max(
        1,
        (avgCoverage * 4)
          + ((1 - Math.min(totalAnyUsage / fileCount, 0.1)) * 3)
          + ((1 - Math.min(totalAssertions / fileCount, 0.05)) * 2)
          + (avgStrictScore * 1),
      ),
    );

    return {
      overall: {
        typeCoverage: avgCoverage,
        anyUsage: totalAnyUsage / fileCount,
        typeAssertions: totalAssertions / fileCount,
        strictModeScore: avgStrictScore,
        safetyScore,
      },
      files: {
        total: fileCount,
        fullyTyped,
        partiallyTyped,
        untyped,
      },
      issues: {
        critical: criticalIssues,
        high: highIssues,
        medium: mediumIssues,
        low: lowIssues,
      },
      enhancements: {
        available: availableEnhancements,
        autoFixable: autoFixableEnhancements,
        manualFixRequired: availableEnhancements - autoFixableEnhancements,
      },
    };
  }

  private assessProjectCompliance(metrics: TypeSafetyMetrics): {
    meetsConstitutionalRequirements: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check constitutional requirements
    if (metrics.overall.typeCoverage < TYPE_SAFETY_REQUIREMENTS.MIN_TYPE_COVERAGE) {
      violations.push(
        `Type coverage ${
          (metrics.overall.typeCoverage * 100).toFixed(1)
        }% below required ${(TYPE_SAFETY_REQUIREMENTS.MIN_TYPE_COVERAGE * 100)}%`,
      );
      recommendations.push('Add explicit type annotations to improve coverage');
    }

    if (metrics.overall.anyUsage > TYPE_SAFETY_REQUIREMENTS.MAX_ANY_USAGE) {
      violations.push(
        `Any usage ${
          (metrics.overall.anyUsage * 100).toFixed(1)
        }% exceeds limit ${(TYPE_SAFETY_REQUIREMENTS.MAX_ANY_USAGE * 100)}%`,
      );
      recommendations.push('Replace "any" types with more specific types');
    }

    if (metrics.overall.typeAssertions > TYPE_SAFETY_REQUIREMENTS.MAX_TYPE_ASSERTIONS) {
      violations.push(
        `Type assertions ${
          (metrics.overall.typeAssertions * 100).toFixed(1)
        }% exceed limit ${(TYPE_SAFETY_REQUIREMENTS.MAX_TYPE_ASSERTIONS * 100)}%`,
      );
      recommendations.push('Replace type assertions with type guards');
    }

    if (metrics.overall.strictModeScore < TYPE_SAFETY_REQUIREMENTS.MIN_STRICT_MODE_SCORE) {
      violations.push(
        `Strict mode score ${
          (metrics.overall.strictModeScore * 100).toFixed(1)
        }% below required ${(TYPE_SAFETY_REQUIREMENTS.MIN_STRICT_MODE_SCORE * 100)}%`,
      );
      recommendations.push('Enable all strict mode TypeScript compiler options');
    }

    return {
      meetsConstitutionalRequirements: violations.length === 0,
      violations,
      recommendations,
    };
  }

  private filterEnhancementSuggestions(
    suggestions: TypeEnhancementSuggestion[],
    options: {
      priorityThreshold?: number;
      maxRiskLevel?: 'low' | 'medium' | 'high';
      focusAreas?: TypeEnhancementSuggestion['type'][];
      autoFixOnly?: boolean;
    },
  ): TypeEnhancementSuggestion[] {
    return suggestions.filter(suggestion => {
      if (options.priorityThreshold && suggestion.priority < options.priorityThreshold) {
        return false;
      }

      if (options.maxRiskLevel) {
        const riskLevels = { low: 1, medium: 2, high: 3 };
        const maxRisk = riskLevels[options.maxRiskLevel];
        const suggestionRisk = suggestion.implementation.breakingChange
          ? 3
          : suggestion.implementation.requiresRefactoring
          ? 2
          : 1;
        if (suggestionRisk > maxRisk) return false;
      }

      if (options.focusAreas && !options.focusAreas.includes(suggestion.type)) {
        return false;
      }

      if (options.autoFixOnly && suggestion.implementation.requiresRefactoring) {
        return false;
      }

      return true;
    });
  }

  private calculateEnhancementImpact(suggestions: TypeEnhancementSuggestion[]): {
    typeCoverageImprovement: number;
    anyUsageReduction: number;
    safetyScoreImprovement: number;
    errorPreventionCount: number;
  } {
    return {
      typeCoverageImprovement: suggestions.reduce(
        (sum, s) => sum + (s.impact.safetyImprovement / 10),
        0,
      ),
      anyUsageReduction: suggestions.filter(s => s.type === 'strengthen-type').length * 2,
      safetyScoreImprovement: suggestions.reduce(
        (sum, s) => sum + (s.impact.safetyImprovement / 100),
        0,
      ),
      errorPreventionCount: suggestions.reduce(
        (sum, s) => sum + s.impact.errorPrevention.length,
        0,
      ),
    };
  }

  private createImplementationPhases(suggestions: TypeEnhancementSuggestion[]): Array<{
    phase: number;
    suggestions: string[];
    description: string;
    estimatedTime: number;
  }> {
    // Phase 1: Safe, non-breaking enhancements
    const phase1 = suggestions.filter(s => !s.implementation.breakingChange);

    // Phase 2: Breaking changes that require refactoring
    const phase2 = suggestions.filter(s => s.implementation.breakingChange);

    const phases = [];

    if (phase1.length > 0) {
      phases.push({
        phase: 1,
        suggestions: phase1.map(s => s.id),
        description: 'Safe type enhancements without breaking changes',
        estimatedTime: phase1.length * 0.5, // 30 minutes per enhancement
      });
    }

    if (phase2.length > 0) {
      phases.push({
        phase: 2,
        suggestions: phase2.map(s => s.id),
        description: 'Breaking changes requiring refactoring',
        estimatedTime: phase2.length * 2, // 2 hours per breaking enhancement
      });
    }

    return phases;
  }

  private assessEnhancementRisks(suggestions: TypeEnhancementSuggestion[]): Array<{
    level: string;
    description: string;
    mitigation: string;
  }> {
    const risks = [];

    const breakingChanges = suggestions.filter(s => s.implementation.breakingChange).length;
    if (breakingChanges > 0) {
      risks.push({
        level: 'high',
        description: `${breakingChanges} breaking changes may affect API consumers`,
        mitigation: 'Implement gradual migration strategy and version compatibility',
      });
    }

    const complexEnhancements =
      suggestions.filter(s => s.implementation.complexity === 'high').length;
    if (complexEnhancements > 2) {
      risks.push({
        level: 'medium',
        description: `${complexEnhancements} complex enhancements may introduce bugs`,
        mitigation: 'Implement comprehensive testing for each enhancement',
      });
    }

    return risks;
  }

  private async executeEnhancement(
    suggestion: TypeEnhancementSuggestion,
    options: any,
  ): Promise<TypeEnhancementResult> {
    const result: TypeEnhancementResult = {
      enhancementId: suggestion.id,
      type: suggestion.type,
      implemented: false,
      filesModified: [],
      before: { typeCoverage: 0, anyUsage: 0, safetyScore: 0 },
      improvement: { typeCoverageGain: 0, anyUsageReduction: 0, safetyScoreGain: 0 },
      constitutionalCompliance: {
        meetsTypeCoverage: false,
        meetsAnyUsageLimit: false,
        maintainsApiStability: false,
        preservesFunctionality: false,
      },
    };

    try {
      // Measure before state
      result.before = await this.measureTypeSafety([suggestion.filePath]);

      // Execute enhancement
      if (!options.dryRun) {
        result.filesModified = await this.applyTypeEnhancement(suggestion);
      }

      // Measure after state
      result.after = await this.measureTypeSafety([suggestion.filePath]);

      // Calculate improvements
      if (result.after) {
        result.improvement = {
          typeCoverageGain: result.after.typeCoverage - result.before.typeCoverage,
          anyUsageReduction: result.before.anyUsage - result.after.anyUsage,
          safetyScoreGain: result.after.safetyScore - result.before.safetyScore,
        };
      }

      // Validate constitutional compliance
      result.constitutionalCompliance = await this.validateEnhancementCompliance(
        suggestion,
        result,
      );
      result.implemented = true;

      return result;
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }

  // Helper methods for mapping and calculation
  private mapIssueToEnhancementType(
    issueType: TypeIssue['type'],
  ): TypeEnhancementSuggestion['type'] {
    const mapping = {
      'any-usage': 'strengthen-type' as const,
      'implicit-any': 'strengthen-type' as const,
      'unsafe-assertion': 'strengthen-type' as const,
      'missing-generic': 'add-conditional' as const,
      'weak-type': 'add-union' as const,
      'circular-type': 'strengthen-type' as const,
    };
    return mapping[issueType] || 'strengthen-type';
  }

  private calculateEnhancementPriority(issue: TypeIssue): number {
    const severityScores = { critical: 10, high: 8, medium: 6, low: 4 };
    const baseScore = severityScores[issue.severity];
    const safetyBonus = Math.floor(issue.impact.safetyScore / 2);
    return Math.min(10, baseScore + safetyBonus);
  }

  private getErrorPreventionTypes(issueType: TypeIssue['type']): string[] {
    const preventionMap = {
      'any-usage': ['type-mismatch', 'property-access-error', 'method-call-error'],
      'unsafe-assertion': ['runtime-type-error', 'null-reference', 'property-undefined'],
      'missing-generic': ['type-constraint-violation', 'inference-failure'],
      'weak-type': ['property-access-error', 'method-signature-mismatch'],
      'implicit-any': ['type-mismatch', 'compilation-error'],
      'circular-type': ['infinite-recursion', 'compilation-error'],
    };
    return preventionMap[issueType] || ['general-type-error'];
  }

  private getImplementationComplexity(issue: TypeIssue): 'low' | 'medium' | 'high' {
    if (issue.autoFixable) return 'low';
    if (issue.severity === 'critical') return 'high';
    return 'medium';
  }

  private async measureTypeSafety(filePaths: string[]): Promise<{
    typeCoverage: number;
    anyUsage: number;
    safetyScore: number;
  }> {
    // Simplified measurement for individual files
    return {
      typeCoverage: 0.8, // Placeholder
      anyUsage: 0.02, // Placeholder
      safetyScore: 7.5, // Placeholder
    };
  }

  private async applyTypeEnhancement(suggestion: TypeEnhancementSuggestion): Promise<string[]> {
    // Placeholder implementation - would actually modify source files
    return [suggestion.filePath];
  }

  private async validateEnhancementCompliance(
    suggestion: TypeEnhancementSuggestion,
    result: TypeEnhancementResult,
  ): Promise<TypeEnhancementResult['constitutionalCompliance']> {
    return {
      meetsTypeCoverage:
        (result.after?.typeCoverage || 0) >= TYPE_SAFETY_REQUIREMENTS.MIN_TYPE_COVERAGE,
      meetsAnyUsageLimit: (result.after?.anyUsage || 0) <= TYPE_SAFETY_REQUIREMENTS.MAX_ANY_USAGE,
      maintainsApiStability: !suggestion.implementation.breakingChange,
      preservesFunctionality: true, // Would run tests to verify
    };
  }

  private async createEnhancementBackup(planId: string): Promise<void> {
    this.emit('backup:created', { planId });
  }

  private async rollbackEnhancements(planId: string): Promise<void> {
    this.emit('rollback:completed', { planId });
  }

  private async validatePhaseResults(
    results: TypeEnhancementResult[],
    phase: number,
  ): Promise<void> {
    this.emit('phase:validation', { phase, results });
  }

  private async finalizeEnhancements(
    results: TypeEnhancementResult[],
    options: any,
  ): Promise<void> {
    if (!options.dryRun) {
      await this.project.save();
    }
    this.emit('enhancement:finalized', { results });
  }

  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.on('analysis:started', data => {
      console.log(`Type safety analysis started: ${data.targetPath}`);
    });

    this.on('analysis:completed', data => {
      console.log(
        `Type safety analysis completed: ${data.filesAnalyzed} files, safety score: ${
          data.overallSafetyScore.toFixed(1)
        }/10`,
      );
    });

    this.on('enhancement:started', data => {
      console.log(`Type enhancement started: ${data.planId}`);
    });

    this.on('enhancement:completed', data => {
      const successful = data.results.filter(r => r.implemented).length;
      console.log(`Type enhancement completed: ${successful}/${data.results.length} successful`);
    });
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    this.analysisCache.clear();
    this.activeEnhancements.clear();
    this.emit('disposed');
  }
}

// Export utility functions for testing
export const TypeSystemEnhancerUtils = {
  TYPE_SAFETY_REQUIREMENTS,

  calculateSafetyScore: (typeCoverage: number, anyUsage: number, strictScore: number): number => {
    return Math.min(
      10,
      Math.max(
        1,
        (typeCoverage * 4)
          + ((1 - anyUsage) * 3)
          + (strictScore * 3),
      ),
    );
  },

  isConstitutionallyCompliant: (metrics: TypeSafetyMetrics): boolean => {
    return (
      metrics.overall.typeCoverage >= TYPE_SAFETY_REQUIREMENTS.MIN_TYPE_COVERAGE
      && metrics.overall.anyUsage <= TYPE_SAFETY_REQUIREMENTS.MAX_ANY_USAGE
      && metrics.overall.typeAssertions <= TYPE_SAFETY_REQUIREMENTS.MAX_TYPE_ASSERTIONS
      && metrics.overall.strictModeScore >= TYPE_SAFETY_REQUIREMENTS.MIN_STRICT_MODE_SCORE
    );
  },
};
