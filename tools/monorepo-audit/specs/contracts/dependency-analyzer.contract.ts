/**
 * Contract: DependencyAnalyzer Service
 * Purpose: Build dependency graphs and analyze import relationships
 * Generated: 2025-09-09
 */

// Core Types
export interface AnalyzerOptions {
  /** Whether to follow dynamic imports */
  followDynamicImports: boolean
  /** Whether to analyze type-only imports */
  includeTypeImports: boolean
  /** Maximum depth for transitive dependencies */
  maxTransitiveDepth: number
  /** Whether to detect circular dependencies */
  detectCircularDependencies: boolean
  /** File extensions to analyze */
  supportedExtensions: string[]
}

export interface DependencyGraph {
  /** Map of asset path to graph node */
  nodes: Map<string, GraphNode>
  /** All dependency relationships */
  edges: GraphEdge[]
  /** Detected circular dependencies */
  cycles: CircularDependency[]
  /** Assets with no incoming dependencies */
  orphanedNodes: string[]
  /** Entry point assets (no outgoing dependencies to app code) */
  rootNodes: string[]
  /** Architectural layers */
  layers: GraphLayer[]
  /** Graph analysis metrics */
  metrics: GraphMetrics
}

export interface GraphNode {
  /** Reference to code asset */
  assetPath: string
  /** Assets that depend on this node */
  incomingEdges: string[]
  /** Assets this node depends on */
  outgoingEdges: string[]
  /** Architectural layer classification */
  layer: string
  /** Calculated importance score (0-100) */
  importance: number
  /** Node type classification */
  nodeType: NodeType
  /** Package this node belongs to */
  packageName?: string
}

export interface GraphEdge {
  /** Source asset path */
  from: string
  /** Target asset path */
  to: string
  /** Type of dependency */
  type: DependencyType
  /** Whether import is static or dynamic */
  isStatic: boolean
  /** Line number where dependency occurs */
  line: number
  /** Column number where dependency occurs */
  column: number
  /** Import statement text */
  importStatement: string
}

export interface CircularDependency {
  /** Asset paths forming the cycle */
  cycle: string[]
  /** Severity based on cycle characteristics */
  severity: CircularSeverity
  /** Possible resolution strategies */
  resolutionStrategies: ResolutionStrategy[]
  /** Impact assessment of breaking cycle */
  breakingImpact: ImpactLevel
}

export interface GraphLayer {
  /** Layer name (e.g., 'apps', 'packages', 'shared') */
  name: string
  /** Assets in this layer */
  assets: string[]
  /** Dependencies on other layers */
  dependsOn: string[]
  /** Layers that depend on this one */
  dependents: string[]
  /** Whether layer follows architectural rules */
  compliant: boolean
}

export interface GraphMetrics {
  /** Total nodes in graph */
  totalNodes: number
  /** Total edges in graph */
  totalEdges: number
  /** Number of circular dependencies */
  circularDependencies: number
  /** Average dependencies per node */
  avgDependenciesPerNode: number
  /** Maximum dependency depth */
  maxDepth: number
  /** Analysis execution time in ms */
  analysisTimeMs: number
  /** Memory used during analysis */
  memoryUsedBytes: number
}

// Enumerations
export type NodeType =
  | 'entry_point'
  | 'component'
  | 'service'
  | 'utility'
  | 'config'
  | 'test'
  | 'route'
  | 'type_definition'
  | 'external'

export type DependencyType =
  | 'es6_import'
  | 'commonjs_require'
  | 'dynamic_import'
  | 'route_reference'
  | 'type_reference'
  | 'asset_reference'
  | 'config_reference'

export type CircularSeverity =
  | 'low' // 2-3 nodes, no critical dependencies
  | 'medium' // 4-6 nodes, some important dependencies
  | 'high' // 7+ nodes, critical dependencies
  | 'critical' // Prevents build or causes runtime issues

export type ResolutionStrategy =
  | 'extract_interface'
  | 'dependency_injection'
  | 'event_driven'
  | 'move_shared_code'
  | 'break_into_layers'
  | 'lazy_loading'

export type ImpactLevel = 'low' | 'medium' | 'high'

// Service Interface
export interface IDependencyAnalyzer {
  /**
   * Build dependency graph from code assets
   * @param assets Scanned code assets to analyze
   * @param options Analysis configuration
   * @returns Promise resolving to complete dependency graph
   */
  buildGraph(assets: CodeAsset[], options: AnalyzerOptions,): Promise<DependencyGraph>

  /**
   * Analyze specific asset's dependencies
   * @param assetPath Path to asset to analyze
   * @param options Analysis configuration
   * @returns Promise resolving to asset's dependency information
   */
  analyzeAsset(assetPath: string, options: AnalyzerOptions,): Promise<AssetDependencies>

  /**
   * Detect circular dependencies in graph
   * @param graph Dependency graph to analyze
   * @returns Array of circular dependencies found
   */
  detectCircularDependencies(graph: DependencyGraph,): CircularDependency[]

  /**
   * Calculate importance scores for all nodes
   * @param graph Dependency graph to analyze
   * @returns Updated graph with importance scores
   */
  calculateImportanceScores(graph: DependencyGraph,): DependencyGraph

  /**
   * Find unused assets in dependency graph
   * @param graph Dependency graph to analyze
   * @returns Array of unused asset paths
   */
  findUnusedAssets(graph: DependencyGraph,): string[]

  /**
   * Get transitive dependencies for an asset
   * @param assetPath Asset to analyze
   * @param graph Dependency graph
   * @param maxDepth Maximum depth to traverse
   * @returns Array of transitive dependency paths
   */
  getTransitiveDependencies(
    assetPath: string,
    graph: DependencyGraph,
    maxDepth: number,
  ): string[]

  /**
   * Validate graph integrity and detect issues
   * @param graph Dependency graph to validate
   * @returns Array of validation issues found
   */
  validateGraph(graph: DependencyGraph,): GraphValidationIssue[]
}

export interface AssetDependencies {
  /** Asset path being analyzed */
  assetPath: string
  /** Direct dependencies */
  directDependencies: string[]
  /** Assets that directly depend on this asset */
  directDependents: string[]
  /** All transitive dependencies */
  transitiveDependencies: string[]
  /** Import statements found in asset */
  importStatements: ImportStatement[]
  /** Export statements found in asset */
  exportStatements: ExportStatement[]
}

export interface ImportStatement {
  /** What is being imported */
  imported: string[]
  /** Where it's imported from */
  source: string
  /** Type of import (default, named, namespace) */
  importType: ImportType
  /** Line number in source file */
  line: number
  /** Original import statement text */
  statement: string
}

export interface ExportStatement {
  /** What is being exported */
  exported: string[]
  /** Where it's re-exported from (if applicable) */
  source?: string
  /** Type of export */
  exportType: ExportType
  /** Line number in source file */
  line: number
  /** Original export statement text */
  statement: string
}

export type ImportType = 'default' | 'named' | 'namespace' | 'side_effect'
export type ExportType = 'default' | 'named' | 'namespace' | 'assignment'

export interface GraphValidationIssue {
  /** Issue type */
  type: ValidationIssueType
  /** Severity level */
  severity: 'error' | 'warning' | 'info'
  /** Human-readable description */
  description: string
  /** Affected asset paths */
  affectedAssets: string[]
  /** Suggested resolution */
  suggestedFix?: string
}

export type ValidationIssueType =
  | 'missing_dependency'
  | 'orphaned_asset'
  | 'circular_dependency'
  | 'invalid_import_path'
  | 'unused_import'
  | 'duplicate_dependency'

// Contract Tests Requirements
export interface DependencyAnalyzerContractTests {
  /** Test basic dependency graph construction */
  testBasicGraphConstruction(): Promise<void>

  /** Test circular dependency detection accuracy */
  testCircularDependencyDetection(): Promise<void>

  /** Test dynamic import following */
  testDynamicImportAnalysis(): Promise<void>

  /** Test importance score calculation */
  testImportanceScoreCalculation(): Promise<void>

  /** Test unused asset identification */
  testUnusedAssetIdentification(): Promise<void>

  /** Test graph validation */
  testGraphValidation(): Promise<void>

  /** Test performance with large codebase */
  testLargeCodebasePerformance(): Promise<void>

  /** Test different import/export patterns */
  testImportExportPatterns(): Promise<void>
}

// Default Configuration
export const DEFAULT_ANALYZER_OPTIONS: AnalyzerOptions = {
  followDynamicImports: true,
  includeTypeImports: true,
  maxTransitiveDepth: 10,
  detectCircularDependencies: true,
  supportedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',],
}

// Performance Constraints
export const ANALYZER_PERFORMANCE_REQUIREMENTS = {
  /** Maximum analysis time for 10k files (ms) */
  MAX_ANALYSIS_TIME_10K_FILES: 45_000,
  /** Maximum memory usage during analysis (bytes) */
  MAX_MEMORY_USAGE: 750_000_000, // 750MB
  /** Maximum circular dependency detection time (ms) */
  MAX_CIRCULAR_DETECTION_TIME: 15_000,
} as const
