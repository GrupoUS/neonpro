// Package boundary analysis service with dependency graph visualization
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and healthcare domain analysis

import { DependencyCruiserIntegration } from './dependency-cruiser-integration';
import { JscpdService } from './jscpd-service';
import { ArchitecturalValidator } from './architectural-validator';
import { ReportGenerator } from './report-generator';
import { PackageAnalysis } from '../types/package-analysis';
import { Finding, Location } from '../types/finding';
import { ImpactAssessment } from '../types/impact-assessment';
import { Solution } from '../types/solution';
import { SeverityLevel, FindingType } from '../types/finding-enums';
import { HealthcareComplianceLevel, BrazilianHealthcareDomain } from '../types/finding-enums';
import { QualityThresholds } from '../types/analysis-enums';

export interface PackageAnalysisRequest {
  scope: AnalysisScope;
  patterns: string[];
  options: {
    includeTests?: boolean;
    deepAnalysis?: boolean;
    healthcareContext?: HealthcareComplianceLevel;
    oXLintIntegration?: boolean;
  };
}

export interface PackageAnalysisResult {
  violations: Finding[];
  metrics: PackageAnalysisMetrics;
  recommendations: Solution[];
  complianceScore: number;
  performance: PackagePerformanceMetrics;
  
  // Dependency analysis
  dependencyGraph: DependencyGraph;
  circularDependencies: CircularDependency[];
  boundaryViolations: BoundaryViolation[];
  
  // Package health assessment
  healthScore: number;
  maintainabilityIndex: number;
  complexityScore: number;
  
  // Healthcare compliance assessment
  healthcareCompliance: {
    overallScore: number;
    lgpdScore: number;
    anvisaScore: number;
    councilScores: {
      [ProfessionalCouncil.CFM]: number;
      [ProfessionalCouncil.COREN]: number;
      [ProfessionalCouncil.CFO]: number;
      [ProfessionalCouncil.CNO]: number;
      [ProfessionalCouncil.CNEP]: number;
    };
  };
}

export interface PackageAnalysisMetrics {
  // Basic metrics
  totalDependencies: number;
  circularDependencies: number;
  outdatedDependencies: number;
  vulnerableDependencies: number;
  duplicateDependencies: number;
  
  // Package structure metrics
  structure: {
    totalFiles: number;
    totalLines: number;
    bundleSize: number;
    testCoverage: number;
  };
  
  // Quality metrics
  quality: {
    codeQualityScore: number;
    maintainabilityIndex: number;
    complexityScore: number;
    overallHealthScore: number;
  };
  
  // Performance metrics
  performance: {
    buildTime: number;
    loadTime: number;
    memoryUsage: number;
    throughput: number;
  };
  
  // Healthcare compliance metrics
  healthcareCompliance: {
    lgpdScore: number;
    anvisaScore: number;
    professionalCouncilScores: {
      [ProfessionalCouncil.CFM]: number;
      [ProfessionalCouncil.COREN]: number;
      [ProfessionalCouncil.CFO]: number;
      [ProfessionalCouncil.CNO]: number;
      [ProfessionalCouncil.CNEP]: number;
    };
    patientDataSafetyMetrics: number;
    clinicalLogicMetrics: number;
    validationMetrics: number;
  };
  
  // Risk assessment
  riskAssessment: {
    overallRisk: number;
    securityRisk: number;
    complianceRisk: number;
    operationalRisk: number;
    financialRisk: number;
  };
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  clusters: DependencyCluster[];
  
  // Graph metrics
  metrics: {
    totalNodes: number;
    totalEdges: number;
    stronglyConnectedComponents: number;
    averageDegree: number;
    clusteringCoefficient: number;
  };
  
  // Circular dependencies
  circularDependencies: CircularDependency[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'package' | 'file' | 'component' | 'service';
  location: string;
  outgoingEdges: number;
  incomingEdges: number;
  
  // Node metrics
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    healthScore: number;
  };
  
  // Healthcare context
  healthcareContext?: {
    patientDataInvolved: boolean;
    clinicalLogicInvolved: boolean;
    validationInvolved: boolean;
    businessLogicInvolved: boolean;
    complianceCritical: boolean;
  };
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'development' | 'production' | 'peer' | 'optional' | 'dev-peer' | 'test';
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  
  // Healthcare context
  healthcareContext?: {
    patientDataFlow: boolean;
    clinicalDataFlow: boolean;
    complianceFlow: boolean;
  };
}

export interface DependencyCluster {
  nodes: string[];
  centrality: string; // most central node in the cluster
  averageDistance: number;
  
  // Cluster metrics
  metrics: {
    clusterSize: number;
    clusterHealthScore: number;
    stability: 'stable' | 'evolving' | 'deprecated';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Healthcare cluster assessment
  healthcareImpact: {
    patientDataBoundaryRisk: boolean;
    clinicalWorkflowImpact: boolean;
    complianceViolations: string[];
    riskMitigation: string[];
  };
}

export interface BoundaryViolation {
  violationType: 'dependency' | 'import' | 'export' | 'circular' | 'package_boundary';
  fromPackage: string;
  toPackage: string;
  description: string;
  
  // Severity and impact
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Healthcare impact
  healthcareImpact: {
    patientDataBoundaryViolation: boolean;
    clinicalWorkflowDisruption: boolean;
    complianceRiskLevel: string[];
    regulatoryViolations: string[];
  };
  
  // Location
  location: Location[];
  
  // Resolution
  suggestedFix: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedEffort: number;
  
  // Validation
  validation: {
    testingRequired: boolean;
    expertReviewRequired: boolean;
    complianceReviewRequired: boolean;
  };
  
  // Status
  status: 'identified' | 'mitigating' | 'mitigated' | 'accepted';
}

export interface PackagePerformanceMetrics {
  // Build performance
  build: {
    buildTime: number;
    incrementalBuildTime: number;
    cleanBuildTime: number;
    rebuildTime: number;
  };
  
  // Bundle performance
  bundle: {
    size: number;
    gzippedSize: number;
    chunkCount: number;
    largestChunk: number;
    lazyLoadPerformance: number;
  };
  
  // Runtime performance
  runtime: {
    initializationTime: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
  };
  
  // Mobile performance
  mobile: {
    loadTime3G: number;
    loadTime4G: number;
    memoryUsageMobile: number;
    batteryImpact: 'low' | 'medium' | 'high';
  };
  
  // Performance metrics
  metrics: {
    performanceScore: number;
    buildScore: number;
    bundleScore: number;
    runtimeScore: number;
  };
  
  // Performance optimization opportunities
  optimization: {
    codeSplittingOpportunities: string[];
    lazyLoadingOpportunities: string[];
    compressionOpportunities: string[];
    cachingOpportunities: string[];
  };
}

export interface PackageRecommendation {
  id: string;
  type: 'refactor' | 'optimize' | 'decompose' | 'merge';
  title: string;
  description: string;
  
  // Priority assessment
  priority: 'immediate' | 'high' | 'medium' | 'low';
  
  // Implementation details
  implementation: {
    phases: RecommendationPhase[];
    estimatedEffort: number;
    requiredSkills: string[];
    dependencies: string[];
  };
  
  // Expected benefits
  benefits: {
    maintainabilityImprovement: number;
    performanceImprovement: number;
    securityImprovement: number;
    complianceImprovement: number;
    riskReduction: number;
  };
  
  // Testing requirements
  testing: {
    unitTestsRequired: boolean;
    integrationTestsRequired: boolean;
    endToEndTestsRequired: boolean;
    securityTestsRequired: boolean;
    healthcareTestsRequired: boolean;
  };
  
  // Healthcare compliance
  healthcareCompliance: {
    lgpdCompliance: boolean;
    anvisaCompliance: boolean;
    councilCompliance: boolean;
    patientDataSafety: boolean;
  };
  
  // Timeline and cost
  timeline: {
    estimatedDays: number;
    estimatedCost: number;
    paybackPeriod: number;
    annualROI: number;
  };
  
  // Validation
  validation: {
    peerReviewRequired: boolean;
    expertReviewRequired: boolean;
    stakeholderApprovalRequired: boolean;
  };
  
  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

interface RecommendationPhase {
  name: string;
  description: string;
  dependencies: string[];
  
  // Timeline
  duration: string;
  deliverables: string[];
  
  // Resources
  resources: {
    personnel: string[];
    tools: string[];
    budget: number;
  timeline: string;
  };
  
  // Success criteria
  successCriteria: string[];
}

interface RecommendationPhase {
  name: string;
  description: string;
  dependencies: string[];
  
  // Timeline
  duration: string;
  
  // Deliverables
  deliverables: string[];
  
  // Resources
  resources: {
    personnel: string[];
    tools: string[];
    budget: number;
    timeline: string;
  };
  
  // Success criteria
  successCriteria: string[];
}

// Type guards
export function isPackageAnalysis(obj: any): obj is PackageAnalysis {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.packageName === 'string' &&
    typeof obj.version === 'string' &&
    obj.analysisDate instanceof Date &&
    typeof obj.metadata === 'object' &&
    typeof obj.health === 'object' &&
    typeof obj.dependencies === 'object' &&
    typeof obj.metrics === 'object' &&
    Array.isArray(obj.findings) &&
    Array.isArray(obj.recommendations);
}

// Priority calculation for package analysis
export function calculatePackagePriority(analysis: PackageAnalysis): number {
  const healthScore = analysis.health.overallScore;
  const dependencyIssues = analysis.dependencies.metrics.circularDependencies + analysis.dependencies.metrics.vulnerableDependencies + analysis.dependencies.metrics.outdatedDependencies;
  const qualityIssues = analysis.metrics.quality.testCoverage < QualityThresholds.MIN_TEST_COVERAGE ? 1 : 0;
  
  let priority = Math.max(healthScore, 100 - (healthScore / 2)) * 2; // Higher score = higher priority
  
  // Adjust for healthcare compliance issues
  if (analysis.healthcareCompliance.overallScore < 70) {
    priority += 30;
  }
  
  // Adjust for dependency issues
  if (dependencyIssues > 0) {
    priority += 20;
  }
  
  // Adjust for quality issues
  if (qualityIssues > 0) {
    priority += 10;
  }
  
  return Math.min(100, Math.round(priority));
}

// Package analysis utilities
export function calculatePackageHealthScore(analysis: PackageAnalysis): number {
  const weights = {
    maintainabilityIndex: 0.3,
    complexityScore: 0.2,
    testCoverage: 0.2,
    dependencies: 0.2,
    healthcareCompliance: 0.1
  };
  
  const score =
    (
      (analysis.health.maintainabilityIndex * weights.maintainabilityIndex) +
      ((100 - analysis.health.complexityScore) * weights.complexityScore) +
      (analysis.healthcareCompliance.overallScore * weights.healthcareCompliance) +
      ((analysis.metrics.testCoverage / 100) * weights.testCoverage)
    ) / 100;
  
  return Math.min(100, Math.round(score * 100) / 100);
}

// Dependency graph generation utilities
export function generateDependencyGraph(analysis: PackageAnalysis): DependencyGraph {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  
  // Create nodes for each dependency
  for (const dep of analysis.dependencies.metrics.dependencies) {
    const node: DependencyNode = {
      id: dep.package || dep.file,
      name: dep.package || dep.file,
      type: dep.type,
      location: dep.filePath || dep.package,
      outgoingEdges: dep.outgoingEdges?.length || 0,
      incomingEdges: dep.incomingEdges?.length || 0
    };
    nodes.push(node);
  }
  
  // Create edges for dependencies
  for (const dep of analysis.dependencies.metrics.dependencies) {
    const sourceNode = nodes.find(n => n.id === dep.source);
    const targetNode = nodes.find(n => n.id === dep.target);
    
    if (sourceNode && targetNode) {
      const edge: DependencyEdge = {
        source: dep.source,
        target: dep.target,
        type: dep.type,
        strength: dep.strength,
        healthcareContext: dep.healthcareContext?.patientDataFlow || dep.healthcareContext?.clinicalDataFlow || dep.healthcareContext?.complianceFlow || dep.healthcareContext?.businessLogic
      };
      edges.push(edge);
    }
  }
  
  // Detect circular dependencies
  const circularDeps = analysis.dependencies.metrics.circularDependencies.map(dep => ({
    source: dep.source,
    target: dep.target,
    cycle: dep.cycle.map(item => item.target).concat([dep.source]).map(item => [item.source, item.target]),
    cycleLength: dep.cycle.length
  }));
  
  return {
    nodes,
    edges,
    clusters: this.dependencyClusterize(nodes, edges),
    metrics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      stronglyConnectedComponents: analysis.dependencies.metrics.stronglyConnectedComponents,
      clusteringCoefficient: this.calculateClusteringCoefficient(nodes, edges),
      averageDegree: analysis.dependencies.metrics.averageDegree
    }
  };
}

export function dependencyClusterize(
  nodes: DependencyNode[],
  edges: DependencyEdge[]
): DependencyCluster[] {
  const clusters: DependencyCluster[] = [];
  const visited = new Set<string>();
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visited.add(node.id);
      
      // Find all reachable nodes
      const reachable = this.findReachableNodes(node, nodes, edges);
      clusters.push({
        nodes: reachable,
        centrality: this.calculateCentrality(reachable),
        averageDistance: this.calculateAverageDistance(reachable)
      });
    }
  }
  
  return clusters;
}

function findReachableNodes(
  startNode: DependencyNode,
  allNodes: DependencyNode[],
  edges: DependencyEdge[]
): DependencyNode[] {
  const reachable: DependencyNode[] = [];
  const visited = new Set<string>();
  const queue: DependencyNode[] = [startNode];
  
  while (queue.length > 0 && visited.size < allNodes.length) {
    const current = queue.shift()!;
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    
    // Add all reachable nodes
    const reachableNodes = allNodes.filter(n => edges.some(e => e.source === current.id) && !visited.has(n.id));
    reachable.push(...reachableNodes);
    
    for (const reachable of reachableNodes) {
      if (!visited.has(reachable.id)) {
        visited.add(reachable.id);
        reachable.push(reachable);
      }
    }
  }
  
  return reachable;
}

function calculateCentrality(
  nodes: DependencyNode[]
): string {
  if (nodes.length === 0) return '';
  
  let centralityScores = nodes.map(n => ({
    node: n.id,
    score: this.calculateNodeCentralityScore(n, nodes)
  }));
  
  centralityScores.sort((a, b) => b.score - a.score);
  return centralityScores[0].node;
}

function calculateNodeCentralityScore(node: DependencyNode, allNodes: DependencyNode[]): number {
  if (nodes.length === 0) return 0;
  
  const nodeIndex = allNodes.findIndex(n => n.id === node.id);
  const distances = nodes.map((n, i) => ({
    node: n,
    distance: Math.sqrt(Math.pow(allNodes[nodeIndex].x - allNodes[i].x, 2) + Math.pow(allNodes[i].y - allNodes[i].y, 2))
  }));
  
  const totalDistance = distances.reduce((sum, distance) => sum + distance);
  const averageDistance = totalDistance / nodes.length;
  
  return averageDistance;
}



export function calculateAverageDistance(
  node: DependencyNode,
  allNodes: DependencyNode[]
): number {
  const nodeIndex = allNodes.findIndex(n => n.id === node.id);
  const distances = allNodes.map((n, i) => ({
    node: n,
    distance: Math.sqrt(Math.pow(allNodes[nodeIndex].x - allNodes[i].x, 2) + Math.pow(allNodes[i].y - allNodes[i].y, 2)),
    referenceNode: allNodes[nodeIndex]
  }));
  
  if (distances.length === 0) return 0;
  
  const totalDistance = distances.reduce((sum, distance) => sum + distance);
  return Math.round(totalDistance / distances.length);
}

function calculateClusterCoefficient(
  clusters: DependencyCluster[]
): number {
  if (clusters.length === 0) return 1;
  if (clusters.length === 1) return 1;
  
  let coefficient = 0;
  
  for (let i = 0; i < clusters.length; i++) {
    let overlap = 0;
    
    for (let j = 0; j < clusters.length; j++) {
      let overlap = this.calculateOverlap(clusters[i], clusters[j]);
      overlap = Math.max(overlap, clusters[i].lines / clusters[j].lines);
      overlap = Math.round(overlap * 100 / clusters[i].lines);
      coefficient += overlap;
    }
    
    coefficient /= clusters[i].lines; // Normalize by cluster size
  }
  
  return coefficient / clusters.length;
}

/**
 * Generate executive summary for package analysis
 */
export function generatePackageAnalysisSummary(analysis: PackageAnalysis): string {
  const healthScore = calculatePackageHealthScore(analysis);
  const criticalIssues = analysis.violations.filter(v => v.severity === 'critical' || v.severity === 'high').length;
  const highIssues = analysis.violations.filter(v => v.severity === 'high').length;
  
  const topRecommendations = analysis.recommendations
    .slice(0, 5)
    .map(r => `- **${r.title}**: ${r.description}`)
    .join('\n')

  return `
# Package Analysis Summary: ${analysis.metadata.name}

## Package Health Score: ${healthScore}/100

### Key Metrics
- **Dependencies**: ${analysis.metrics.dependencies.totalDependencies} total (${analysis.dependencies.metrics.outdatedDependencies} outdated)
- **Circular Dependencies**: ${analysis.dependencies.metrics.circularDependencies} violations
- **Code Quality**: ${analysis.metrics.quality.overallScore}/100
- **Test Coverage**: ${analysis.metrics.testCoverage}% (target: ${QualityThresholds.MIN_TEST_COVERAGE}%)
- **Performance**: ${analysis.metrics.performance.metrics.buildTime}ms (target: <${QualityThresholds.MAX_BUILD_TIME_MS}ms)
- **Bundle Size**: ${analysis.metrics.performance.bundle.size}KB (target: <${QualityThresholds.MAX_BUNDLE_SIZE_KB}KB)
  
### Dependencies Analysis
- **Total Dependencies**: ${analysis.metrics.dependencies.totalDependencies}
- **Circular Dependencies**: ${analysis.dependencies.metrics.circularDependencies} violations
- **Outdated Dependencies**: ${analysis.dependencies.metrics.outdatedDependencies}
- **Vulnerable Dependencies**: ${analysis.dependencies.metrics.vulnerableDependencies}
- **Duplicate Dependencies**: ${analysis.dependencies.metrics.duplicateDependencies}

### Healthcare Compliance
- **Overall Compliance**: ${analysis.healthcareCompliance.overallScore}/100
- **LGPD Compliance**: ${analysis.healthcareCompliance.lgpdScore}/100
- **ANVISA Compliance**: ${analysis.healthcareCompliance.anvisaScore}/100
- **Council Compliance**:
  - CFM Score: ${analysis.healthcareCompliance.professionalCouncilScores[ProfessionalCouncil.CFM]}%
  - COREN Score: ${analysis.healthcareCompliance.professionalCouncilScores[ProfessionalCouncil.COREN]}%
  - CFO Score: ${analysis.healthcareCompliance.professionalCouncilScores[ProfessionalCouncil.CFO]}%
  - CNO Score: ${analysis.healthcareCompliance.professionalCouncilScores[ProfessionalCouncil.CNO]}%
  - CNEP Score: ${analysis.healthcareCompliance.professionalCouncilScores[ProfessionalCouncil.CNEP]}%

### Risk Assessment
- **Security Risk**: ${analysis.riskAssessment.securityRisk}/100
- **Legal Risk**: ${analysis.riskAssessment.legalRisk}/100
- **Operational Risk**: ${analysis.riskAssessment.operationalRisk}/100
- **Financial Risk**: ${analysis.riskAssessment.financialRisk}/100
- **Regulatory Risk**: ${analysis.riskAssessment.regulatoryRisk}/100

### Top Recommendations
${topRecommendations}

### Next Steps
1. Address all critical and high priority violations
2. Implement healthcare compliance improvements
3. Fix circular dependencies
4. Improve test coverage to meet ${QualityThresholds.MIN_TEST_COVERAGE}% target
5. Optimize build performance to meet ${QualityThresholds.MAX_BUILD_TIME_MS} target

**Analysis Date**: ${analysis.analysisDate.toLocaleDateString('pt-BR')}
**Package Version**: ${analysis.version}
**Total Violations**: ${analysis.violations.length}
**Compliance Status**: ${analysis.healthcareCompliance.overallScore}% compliant
  `.trim();
}
