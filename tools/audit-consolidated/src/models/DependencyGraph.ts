/**
 * DependencyGraph Model
 * Represents the relationship network between code assets
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

import {
  CircularDependency,
  CircularSeverity,
  DependencyType,
  GraphEdge,
  GraphLayer,
  GraphNode,
} from './types';

export class DependencyGraph {
  public nodes: Map<string, GraphNode>;
  public edges: GraphEdge[];
  public cycles: CircularDependency[];
  public orphanedNodes: string[];
  public rootNodes: string[];
  public layers: GraphLayer[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.cycles = [];
    this.orphanedNodes = [];
    this.rootNodes = [];
    this.layers = [];
  }

  /**
   * Add a node to the graph
   */
  public addNode(assetPath: string, layer: string = 'default'): GraphNode {
    const node: GraphNode = {
      assetPath,
      incomingEdges: [],
      outgoingEdges: [],
      layer,
      importance: 0,
    };

    this.nodes.set(assetPath, node);
    return node;
  }

  /**
   * Remove a node and all its edges
   */
  public removeNode(assetPath: string): boolean {
    if (!this.nodes.has(assetPath)) {
      return false;
    }

    // Remove all edges involving this node
    this.edges = this.edges.filter(edge => edge.from !== assetPath && edge.to !== assetPath);

    // Update other nodes' edge lists
    this.nodes.forEach(node => {
      node.incomingEdges = node.incomingEdges.filter(path => path !== assetPath);
      node.outgoingEdges = node.outgoingEdges.filter(path => path !== assetPath);
    });

    // Remove from specialized lists
    this.orphanedNodes = this.orphanedNodes.filter(path => path !== assetPath);
    this.rootNodes = this.rootNodes.filter(path => path !== assetPath);

    this.nodes.delete(assetPath);
    return true;
  }

  /**
   * Add an edge between two nodes
   */
  public addEdge(
    from: string,
    to: string,
    type: DependencyType,
    isStatic: boolean = true,
    line: number = 0,
  ): GraphEdge {
    const edge: GraphEdge = {
      from,
      to,
      type,
      isStatic,
      line,
    };

    this.edges.push(edge);

    // Update node edge lists
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (fromNode && !fromNode.outgoingEdges.includes(to)) {
      fromNode.outgoingEdges.push(to);
    }

    if (toNode && !toNode.incomingEdges.includes(from)) {
      toNode.incomingEdges.push(from);
    }

    return edge;
  }

  /**
   * Remove an edge between two nodes
   */
  public removeEdge(from: string, to: string): boolean {
    const edgeIndex = this.edges.findIndex(edge => edge.from === from && edge.to === to);

    if (edgeIndex === -1) {
      return false;
    }

    this.edges.splice(edgeIndex, 1);

    // Update node edge lists
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (fromNode) {
      fromNode.outgoingEdges = fromNode.outgoingEdges.filter(path => path !== to);
    }

    if (toNode) {
      toNode.incomingEdges = toNode.incomingEdges.filter(path => path !== from);
    }

    return true;
  } /**
   * Get all nodes that have no incoming edges (entry points)
   */

  public getRootNodes(): string[] {
    const roots: string[] = [];

    this.nodes.forEach((node, path) => {
      if (node.incomingEdges.length === 0) {
        roots.push(path);
      }
    });

    this.rootNodes = roots;
    return roots;
  }

  /**
   * Get all nodes that have no outgoing edges (leaf nodes)
   */
  public getLeafNodes(): string[] {
    const leaves: string[] = [];

    this.nodes.forEach((node, path) => {
      if (node.outgoingEdges.length === 0) {
        leaves.push(path);
      }
    });

    return leaves;
  }

  /**
   * Get all nodes that are not referenced by any other nodes
   */
  public getOrphanedNodes(): string[] {
    const orphaned: string[] = [];

    this.nodes.forEach((node, path) => {
      if (node.incomingEdges.length === 0 && !this.isEntryPoint(path)) {
        orphaned.push(path);
      }
    });

    this.orphanedNodes = orphaned;
    return orphaned;
  }

  /**
   * Detect circular dependencies using depth-first search
   */
  public detectCircularDependencies(): CircularDependency[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: CircularDependency[] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat(node);

        const circularDep: CircularDependency = {
          cycle,
          severity: this.calculateCircularSeverity(cycle),
          resolution: this.generateResolutionStrategies(cycle),
        };

        cycles.push(circularDep);
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const nodeData = this.nodes.get(node);
      if (nodeData) {
        for (const dependency of nodeData.outgoingEdges) {
          dfs(dependency, [...path]);
        }
      }

      recursionStack.delete(node);
      path.pop();
    };

    // Run DFS from all nodes
    this.nodes.forEach((_, node) => {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    });

    this.cycles = cycles;
    return cycles;
  }

  /**
   * Calculate importance score for each node based on incoming/outgoing connections
   */
  public calculateNodeImportance(): void {
    this.nodes.forEach((node, path) => {
      const incomingWeight = node.incomingEdges.length * 2; // Higher weight for dependents
      const outgoingWeight = node.outgoingEdges.length * 1;
      const totalConnections = incomingWeight + outgoingWeight;

      // Normalize to 0-100 scale
      const maxConnections = Math.max(
        ...Array.from(this.nodes.values()).map(
          n => n.incomingEdges.length * 2 + n.outgoingEdges.length,
        ),
      );

      node.importance = maxConnections > 0
        ? Math.round((totalConnections / maxConnections) * 100)
        : 0;
    });
  }

  /**
   * Organize nodes into architectural layers
   */
  public organizeLayers(): void {
    const appLayer: string[] = [];
    const packageLayer: string[] = [];
    const sharedLayer: string[] = [];
    const rootLayer: string[] = [];

    this.nodes.forEach((node, path) => {
      if (path.includes('/apps/')) {
        appLayer.push(path);
      } else if (path.includes('/packages/')) {
        packageLayer.push(path);
      } else if (path.includes('/shared/')) {
        sharedLayer.push(path);
      } else {
        rootLayer.push(path);
      }
    });

    this.layers = [
      { name: 'apps', assets: appLayer, dependencies: [] },
      { name: 'packages', assets: packageLayer, dependencies: ['shared'] },
      { name: 'shared', assets: sharedLayer, dependencies: [] },
      { name: 'root', assets: rootLayer, dependencies: [] },
    ];
  } /**
   * Check if a node is an entry point
   */

  private isEntryPoint(path: string): boolean {
    const entryPointPatterns = [
      /main\.(ts|tsx|js|jsx)$/,
      /index\.(ts|tsx|js|jsx)$/,
      /app\.(ts|tsx|js|jsx)$/,
      /_app\.(ts|tsx|js|jsx)$/,
    ];

    return entryPointPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Calculate severity of circular dependency
   */
  private calculateCircularSeverity(cycle: string[]): CircularSeverity {
    const cycleLength = cycle.length;

    if (cycleLength <= 2) {
      return CircularSeverity.LOW;
    } else if (cycleLength <= 4) {
      return CircularSeverity.MEDIUM;
    } else if (cycleLength <= 6) {
      return CircularSeverity.HIGH;
    } else {
      return CircularSeverity.CRITICAL;
    }
  }

  /**
   * Generate resolution strategies for circular dependency
   */
  private generateResolutionStrategies(cycle: string[]): any[] {
    // Simplified resolution strategies
    return [
      {
        type: 'extract_common',
        description: 'Extract common functionality to a shared module',
        effort: 'medium',
        risk: 'low',
      },
      {
        type: 'invert_dependency',
        description: 'Invert one of the dependencies using dependency injection',
        effort: 'high',
        risk: 'medium',
      },
    ];
  }

  /**
   * Get statistics about the dependency graph
   */
  public getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    cycleCount: number;
    orphanedCount: number;
    rootCount: number;
    avgDependencies: number;
    maxDepth: number;
  } {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;
    const cycleCount = this.cycles.length;
    const orphanedCount = this.orphanedNodes.length;
    const rootCount = this.rootNodes.length;

    const totalDependencies = Array.from(this.nodes.values()).reduce(
      (sum, node) => sum + node.outgoingEdges.length,
      0,
    );
    const avgDependencies = nodeCount > 0 ? totalDependencies / nodeCount : 0;

    // Calculate max depth (simplified)
    const maxDepth = this.calculateMaxDepth();

    return {
      nodeCount,
      edgeCount,
      cycleCount,
      orphanedCount,
      rootCount,
      avgDependencies: Math.round(avgDependencies * 100) / 100,
      maxDepth,
    };
  }

  /**
   * Calculate maximum dependency depth
   */
  private calculateMaxDepth(): number {
    const visited = new Set<string>();
    let maxDepth = 0;

    const dfs = (node: string, depth: number): void => {
      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      maxDepth = Math.max(maxDepth, depth);

      const nodeData = this.nodes.get(node);
      if (nodeData) {
        for (const dependency of nodeData.outgoingEdges) {
          dfs(dependency, depth + 1);
        }
      }
    };

    this.getRootNodes().forEach(root => {
      dfs(root, 1);
    });

    return maxDepth;
  }

  /**
   * Convert to JSON representation
   */
  public toJSON(): object {
    return {
      nodes: Object.fromEntries(this.nodes),
      edges: this.edges,
      cycles: this.cycles,
      orphanedNodes: this.orphanedNodes,
      rootNodes: this.rootNodes,
      layers: this.layers,
    };
  }

  /**
   * Create DependencyGraph from JSON representation
   */
  public static fromJSON(data: any): DependencyGraph {
    const graph = new DependencyGraph();

    // Restore nodes
    Object.entries(data.nodes).forEach(([path, nodeData]: [string, any]) => {
      graph.nodes.set(path, nodeData);
    });

    // Restore other properties
    graph.edges = data.edges || [];
    graph.cycles = data.cycles || [];
    graph.orphanedNodes = data.orphanedNodes || [];
    graph.rootNodes = data.rootNodes || [];
    graph.layers = data.layers || [];

    return graph;
  }
}
