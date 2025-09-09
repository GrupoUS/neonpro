import { promises as fs, } from 'fs'
import path from 'path'
import {
  ExportDeclaration,
  ImportDeclaration,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
} from 'ts-morph'
import {
  AnalyzerOptions,
  AssetDependencies,
  CircularDependency,
  CircularSeverity,
  ExportStatement,
  GraphValidationIssue,
  IDependencyAnalyzer,
  ImpactLevel,
  ImportStatement,
  ResolutionStrategy,
  ValidationIssueType,
} from '../../specs/contracts/dependency-analyzer.contract.js'
import { CodeAsset, DependencyGraph, GraphEdge, GraphNode, } from '../models/types.js'

/**
 * Analyzes code dependencies and builds dependency graphs
 * Implements comprehensive dependency analysis with circular detection,
 * importance scoring, and graph validation capabilities
 */
export class DependencyAnalyzer implements IDependencyAnalyzer {
  private project: Project
  private sourceFileCache: Map<string, SourceFile> = new Map()

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        allowJs: true,
        strict: false,
        skipLibCheck: true,
      },
    },)
  }

  /**
   * Build dependency graph from code assets
   */
  public async buildGraph(
    assets: CodeAsset[],
    options: AnalyzerOptions,
  ): Promise<DependencyGraph> {
    const nodes = new Map<string, GraphNode>()
    const edges: GraphEdge[] = []
    const metadata = {
      totalAssets: assets.length,
      analyzedAt: new Date(),
      options,
      circularDependencies: [],
      unusedAssets: [],
    }

    // Initialize nodes for all assets
    for (const asset of assets) {
      nodes.set(asset.path, {
        id: asset.path,
        path: asset.path,
        type: asset.type,
        name: path.basename(asset.path, path.extname(asset.path,),),
        dependencies: [],
        dependents: [],
        importanceScore: 0,
        metadata: {
          size: asset.size,
          lastModified: asset.lastModified,
          exports: [],
          imports: [],
        },
      },)
    }

    // Analyze dependencies for each asset
    for (const asset of assets) {
      if (!this.shouldAnalyzeFile(asset.path, options.supportedExtensions,)) {
        continue
      }

      try {
        const dependencies = await this.analyzeAsset(asset.path, options,)
        const sourceNode = nodes.get(asset.path,)

        if (sourceNode) {
          sourceNode.dependencies = dependencies.directDependencies
          sourceNode.metadata.imports = dependencies.importStatements
          sourceNode.metadata.exports = dependencies.exportStatements

          // Create edges for direct dependencies
          for (const depPath of dependencies.directDependencies) {
            const targetNode = nodes.get(depPath,)
            if (targetNode) {
              // Add edge
              edges.push({
                source: asset.path,
                target: depPath,
                type: 'import',
                weight: 1,
                metadata: {},
              },)

              // Update dependents
              if (!targetNode.dependents.includes(asset.path,)) {
                targetNode.dependents.push(asset.path,)
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze ${asset.path}:`, error,)
      }
    }

    const graph: DependencyGraph = { nodes, edges, metadata, }

    // Detect circular dependencies if enabled
    if (options.detectCircularDependencies) {
      graph.metadata.circularDependencies = this.detectCircularDependencies(graph,)
    }

    // Calculate importance scores
    const scoredGraph = this.calculateImportanceScores(graph,)

    // Find unused assets
    scoredGraph.metadata.unusedAssets = this.findUnusedAssets(scoredGraph,)

    return scoredGraph
  }

  /**
   * Analyze specific asset's dependencies
   */
  public async analyzeAsset(
    assetPath: string,
    options: AnalyzerOptions,
  ): Promise<AssetDependencies> {
    const sourceFile = await this.getSourceFile(assetPath,)
    if (!sourceFile) {
      throw new Error(`Could not parse file: ${assetPath}`,)
    }

    const directDependencies: string[] = []
    const importStatements: ImportStatement[] = []
    const exportStatements: ExportStatement[] = []

    // Process import declarations
    const imports = sourceFile.getImportDeclarations()
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      const resolvedPath = this.resolveImportPath(assetPath, moduleSpecifier,)

      if (resolvedPath) {
        directDependencies.push(resolvedPath,)
      }

      const importStatement: ImportStatement = {
        specifier: moduleSpecifier,
        resolvedPath,
        isTypeOnly: importDecl.isTypeOnly(),
        namedImports: this.extractNamedImports(importDecl,),
        defaultImport: importDecl.getDefaultImport()?.getText(),
        namespaceImport: importDecl.getNamespaceImport()?.getText(),
      }
      importStatements.push(importStatement,)
    }

    // Process dynamic imports if enabled
    if (options.followDynamicImports) {
      const dynamicImports = this.findDynamicImports(sourceFile,)
      for (const dynamicImport of dynamicImports) {
        const resolvedPath = this.resolveImportPath(assetPath, dynamicImport.specifier,)
        if (resolvedPath && !directDependencies.includes(resolvedPath,)) {
          directDependencies.push(resolvedPath,)
        }
        importStatements.push(dynamicImport,)
      }
    }

    // Process export declarations
    const exports = sourceFile.getExportDeclarations()
    for (const exportDecl of exports) {
      const moduleSpecifier = exportDecl.getModuleSpecifierValue()
      const exportStatement: ExportStatement = {
        specifier: moduleSpecifier,
        isReexport: !!moduleSpecifier,
        namedExports: this.extractNamedExports(exportDecl,),
        isDefaultExport: exportDecl.hasDefaultExport(),
        isNamespaceExport: exportDecl.hasNamespaceExport(),
      }
      exportStatements.push(exportStatement,)
    }

    return {
      assetPath,
      directDependencies: [...new Set(directDependencies,),],
      directDependents: [],
      transitiveDependencies: [],
      importStatements,
      exportStatements,
    }
  }

  /**
   * Detect circular dependencies using DFS
   */
  public detectCircularDependencies(graph: DependencyGraph,): CircularDependency[] {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: CircularDependency[] = []

    const dfs = (nodeId: string, path: string[],): void => {
      if (recursionStack.has(nodeId,)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId,)
        const cycle = path.slice(cycleStart,).concat(nodeId,)

        cycles.push({
          cycle,
          severity: this.assessCircularSeverity(cycle, graph,),
          resolutionStrategies: this.generateResolutionStrategies(cycle, graph,),
          breakingImpact: this.assessBreakingImpact(cycle, graph,),
        },)
        return
      }

      if (visited.has(nodeId,)) {
        return
      }

      visited.add(nodeId,)
      recursionStack.add(nodeId,)
      path.push(nodeId,)

      const node = graph.nodes.get(nodeId,)
      if (node) {
        for (const depId of node.dependencies) {
          dfs(depId, [...path,],)
        }
      }

      recursionStack.delete(nodeId,)
      path.pop()
    }

    // Start DFS from all nodes
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId,)) {
        dfs(nodeId, [],)
      }
    }

    return cycles
  }

  /**
   * Calculate importance scores using PageRank-like algorithm
   */
  public calculateImportanceScores(graph: DependencyGraph,): DependencyGraph {
    const dampingFactor = 0.85
    const epsilon = 0.0001
    const maxIterations = 100

    // Initialize scores
    const nodeCount = graph.nodes.size
    const initialScore = 1.0 / nodeCount

    for (const node of graph.nodes.values()) {
      node.importanceScore = initialScore
    }

    // Iterative computation
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const newScores = new Map<string, number>()
      let converged = true

      for (const [nodeId, node,] of graph.nodes) {
        let score = (1 - dampingFactor) / nodeCount

        // Add contributions from nodes that depend on this node
        for (const dependentId of node.dependents) {
          const dependent = graph.nodes.get(dependentId,)
          if (dependent && dependent.dependencies.length > 0) {
            score += dampingFactor * (dependent.importanceScore / dependent.dependencies.length)
          }
        }

        newScores.set(nodeId, score,)

        // Check convergence
        if (Math.abs(score - node.importanceScore,) > epsilon) {
          converged = false
        }
      }

      // Update scores
      for (const [nodeId, score,] of newScores) {
        const node = graph.nodes.get(nodeId,)
        if (node) {
          node.importanceScore = score
        }
      }

      if (converged) {
        break
      }
    }

    return graph
  } /**
   * Find unused assets (no incoming dependencies)
   */

  public findUnusedAssets(graph: DependencyGraph,): string[] {
    const unusedAssets: string[] = []

    for (const [nodeId, node,] of graph.nodes) {
      // Consider asset unused if it has no dependents
      // Exception: entry points (routes, main files) are never unused
      if (node.dependents.length === 0 && !this.isEntryPoint(node,)) {
        unusedAssets.push(nodeId,)
      }
    }

    return unusedAssets
  }

  /**
   * Get transitive dependencies for an asset
   */
  public getTransitiveDependencies(
    assetPath: string,
    graph: DependencyGraph,
    maxDepth: number,
  ): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const traverse = (nodeId: string, depth: number,): void => {
      if (depth >= maxDepth || visited.has(nodeId,)) {
        return
      }

      visited.add(nodeId,)
      const node = graph.nodes.get(nodeId,)

      if (node) {
        for (const depId of node.dependencies) {
          if (!visited.has(depId,)) {
            result.push(depId,)
            traverse(depId, depth + 1,)
          }
        }
      }
    }

    traverse(assetPath, 0,)
    return [...new Set(result,),]
  }

  /**
   * Validate graph integrity and detect issues
   */
  public validateGraph(graph: DependencyGraph,): GraphValidationIssue[] {
    const issues: GraphValidationIssue[] = []

    // Check for missing dependencies
    for (const edge of graph.edges) {
      if (!graph.nodes.has(edge.target,)) {
        issues.push({
          type: 'missing_dependency' as ValidationIssueType,
          severity: 'error',
          description: `Missing dependency: ${edge.target}`,
          affectedAssets: [edge.source,],
          suggestedFix: `Check if ${edge.target} exists and is included in the analysis`,
        },)
      }
    }

    // Check for orphaned nodes
    for (const [nodeId, node,] of graph.nodes) {
      if (node.dependencies.length === 0 && node.dependents.length === 0) {
        if (!this.isEntryPoint(node,)) {
          issues.push({
            type: 'orphaned_asset' as ValidationIssueType,
            severity: 'warning',
            description: `Orphaned asset: ${nodeId}`,
            affectedAssets: [nodeId,],
            suggestedFix: 'Consider removing this unused asset',
          },)
        }
      }
    }

    // Check for inconsistent edge relationships
    for (const edge of graph.edges) {
      const sourceNode = graph.nodes.get(edge.source,)
      const targetNode = graph.nodes.get(edge.target,)

      if (sourceNode && targetNode) {
        // Check if dependency is recorded in source node
        if (!sourceNode.dependencies.includes(edge.target,)) {
          issues.push({
            type: 'inconsistent_graph' as ValidationIssueType,
            severity: 'error',
            description:
              `Edge exists but dependency not recorded in source node: ${edge.source} -> ${edge.target}`,
            affectedAssets: [edge.source, edge.target,],
          },)
        }

        // Check if dependent is recorded in target node
        if (!targetNode.dependents.includes(edge.source,)) {
          issues.push({
            type: 'inconsistent_graph' as ValidationIssueType,
            severity: 'error',
            description:
              `Edge exists but dependent not recorded in target node: ${edge.source} -> ${edge.target}`,
            affectedAssets: [edge.source, edge.target,],
          },)
        }
      }
    }

    return issues
  }

  // Private helper methods

  private async getSourceFile(filePath: string,): Promise<SourceFile | null> {
    try {
      if (this.sourceFileCache.has(filePath,)) {
        return this.sourceFileCache.get(filePath,)!
      }

      const content = await fs.readFile(filePath, 'utf-8',)
      const sourceFile = this.project.createSourceFile(filePath, content, { overwrite: true, },)
      this.sourceFileCache.set(filePath, sourceFile,)
      return sourceFile
    } catch (error) {
      return null
    }
  }

  private shouldAnalyzeFile(filePath: string, supportedExtensions: string[],): boolean {
    const ext = path.extname(filePath,)
    return supportedExtensions.includes(ext,)
  }

  private resolveImportPath(fromPath: string, specifier: string,): string | null {
    try {
      // Handle relative imports
      if (specifier.startsWith('.',)) {
        const resolvedPath = path.resolve(path.dirname(fromPath,), specifier,)

        // Try different extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts',]
        for (const ext of extensions) {
          const withExt = resolvedPath + ext
          try {
            require.resolve(withExt,)
            return withExt
          } catch {
            // Try with index file
            const indexPath = path.join(resolvedPath, 'index' + ext,)
            try {
              require.resolve(indexPath,)
              return indexPath
            } catch {
              continue
            }
          }
        }
      }

      // For now, skip node_modules resolution
      // In a full implementation, you'd use enhanced-resolve or similar
      return null
    } catch {
      return null
    }
  }

  private extractNamedImports(importDecl: ImportDeclaration,): string[] {
    const namedImports = importDecl.getNamedImports()
    return namedImports.map(ni => ni.getName())
  }

  private extractNamedExports(exportDecl: ExportDeclaration,): string[] {
    const namedExports = exportDecl.getNamedExports()
    return namedExports.map(ne => ne.getName())
  }

  private findDynamicImports(sourceFile: SourceFile,): ImportStatement[] {
    const dynamicImports: ImportStatement[] = []

    sourceFile.forEachDescendant(node => {
      if (Node.isCallExpression(node,)) {
        const expression = node.getExpression()
        if (Node.isIdentifier(expression,) && expression.getText() === 'import') {
          const args = node.getArguments()
          if (args.length > 0 && Node.isStringLiteral(args[0],)) {
            const specifier = args[0].getLiteralValue()
            dynamicImports.push({
              specifier,
              resolvedPath: null,
              isTypeOnly: false,
              namedImports: [],
              defaultImport: undefined,
              namespaceImport: undefined,
            },)
          }
        }
      }
    },)

    return dynamicImports
  }
  private assessCircularSeverity(cycle: string[], graph: DependencyGraph,): CircularSeverity {
    // Assess severity based on cycle characteristics
    const cycleLength = cycle.length - 1 // Exclude duplicate at end

    if (cycleLength <= 2) {
      return 'high' as CircularSeverity
    } else if (cycleLength <= 4) {
      return 'medium' as CircularSeverity
    } else {
      return 'low' as CircularSeverity
    }
  }

  private generateResolutionStrategies(
    cycle: string[],
    graph: DependencyGraph,
  ): ResolutionStrategy[] {
    const strategies: ResolutionStrategy[] = []

    // Extract to common dependency
    strategies.push('extract_common_dependency' as ResolutionStrategy,)

    // Dependency injection
    strategies.push('dependency_injection' as ResolutionStrategy,)

    // Interface segregation
    strategies.push('interface_segregation' as ResolutionStrategy,)

    return strategies
  }

  private assessBreakingImpact(cycle: string[], graph: DependencyGraph,): ImpactLevel {
    // Assess impact based on importance scores and dependent count
    let maxScore = 0
    let totalDependents = 0

    for (const nodePath of cycle) {
      const node = graph.nodes.get(nodePath,)
      if (node) {
        maxScore = Math.max(maxScore, node.importanceScore,)
        totalDependents += node.dependents.length
      }
    }

    if (maxScore > 0.1 || totalDependents > 10) {
      return 'high' as ImpactLevel
    } else if (maxScore > 0.05 || totalDependents > 3) {
      return 'medium' as ImpactLevel
    } else {
      return 'low' as ImpactLevel
    }
  }

  private isEntryPoint(node: GraphNode,): boolean {
    // Determine if a node is an entry point (should never be considered unused)
    const basename = path.basename(node.path, path.extname(node.path,),)

    // Common entry point patterns
    const entryPatterns = [
      'main',
      'index',
      'app',
      'entry',
      'root',
      '_app',
      '_document',
      'layout',
    ]

    // Route patterns (common in Next.js, React Router, etc.)
    const routePatterns = [
      /^page\./,
      /^route\./,
      /^layout\./,
      /^\[[^\]]+\]/, // Dynamic routes like [id].tsx
      /^_[^_]/, // Special files like _app, _document
    ]

    // Check if it's in a routes directory
    const isInRoutesDir = node.path.includes('/routes/',)
      || node.path.includes('/pages/',)
      || node.path.includes('/app/',)

    // Check patterns
    const matchesEntryPattern = entryPatterns.some(pattern =>
      basename.toLowerCase().includes(pattern,)
    )

    const matchesRoutePattern = routePatterns.some(pattern => pattern.test(basename,))

    return matchesEntryPattern || matchesRoutePattern || isInRoutesDir
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.sourceFileCache.clear()
    // Project cleanup is handled by ts-morph internally
  }
}
