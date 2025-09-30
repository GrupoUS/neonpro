// Edge Performance Analysis Service - Atomic Subtask 1 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  EdgePerformanceAnalysisResult,
  RoutePerformanceData,
  PerformanceRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class EdgePerformanceAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze edge performance for Hono routes and tRPC procedures
   */
  async analyze(files: string[]): Promise<EdgePerformanceAnalysisResult> {
    const routes: RoutePerformanceData[] = [];
    let edgeOptimizedRoutes = 0;
    let patientDataRoutes = 0;
    let clinicalLogicRoutes = 0;
    let lgpdCompliantRoutes = 0;

    // Analyze each file for route definitions and performance patterns
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileRoutes = this.extractRoutesFromFile(file, content);
        
        routes.push(...fileRoutes);
        
        // Count edge-optimized routes
        edgeOptimizedRoutes += fileRoutes.filter(route => route.edgeOptimized).length;
        patientDataRoutes += fileRoutes.filter(route => route.healthcareRelevant).length;
        
        // Analyze healthcare-specific routes
        if (this.containsPatientData(content)) {
          clinicalLogicRoutes++;
        }
        if (this.containsLgpdCompliance(content)) {
          lgpdCompliantRoutes++;
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Calculate performance metrics
    const averageResponseTime = this.calculateAverageResponseTime(routes);
    const totalMemoryUsage = routes.reduce((sum, route) => sum + route.memoryUsage, 0);
    const bundleSize = await this.estimateBundleSize(files);

    // Generate performance recommendations
    const recommendations = this.generatePerformanceRecommendations(routes, files);

    return {
      summary: {
        totalRoutes: routes.length,
        edgeOptimizedRoutes,
        averageResponseTime,
        coldStartOccurrences: this.estimateColdStarts(routes),
        memoryUsage: totalMemoryUsage,
        bundleSize,
      },
      routes,
      edgeOptimization: {
        enabled: edgeOptimizedRoutes > 0,
        provider: this.detectEdgeProvider(files),
        regions: this.detectEdgeRegions(files),
        runtime: this.detectEdgeRuntime(files),
      },
      healthcare: {
        patientDataRoutes,
        clinicalLogicRoutes,
        lgpdCompliantRoutes,
        dataEncryptionEnabled: this.checkDataEncryption(files),
      },
      recommendations,
    };
  }

  /**
   * Extract route definitions from file content
   */
  private extractRoutesFromFile(filePath: string, content: string): RoutePerformanceData[] {
    const routes: RoutePerformanceData[] = [];
    const lines = content.split('\n');
    
    // Find Hono route definitions
    const honoRoutePattern = /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = honoRoutePattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const routePath = match[2];
      
      routes.push({
        path: routePath,
        method,
        responseTime: this.estimateResponseTime(content, method, routePath),
        memoryUsage: this.estimateMemoryUsage(content, routePath),
        edgeOptimized: this.isEdgeOptimized(content, routePath),
        healthcareRelevant: this.isHealthcareRelevant(content, routePath),
      });
    }

    // Find tRPC procedure definitions
    const trpcProcedurePattern = /\.(query|mutation)\s*\(\s*(?:async\s*)?\([^)]*\)\s*=>/g;
    
    while ((match = trpcProcedurePattern.exec(content)) !== null) {
      const procedureType = match[1];
      const procedureName = this.extractProcedureName(content, match.index);
      
      if (procedureName) {
        routes.push({
          path: `/trpc/${procedureName}`,
          method: procedureType === 'query' ? 'GET' : 'POST',
          responseTime: this.estimateResponseTime(content, procedureType, procedureName),
          memoryUsage: this.estimateMemoryUsage(content, procedureName),
          edgeOptimized: this.isEdgeOptimized(content, procedureName),
          healthcareRelevant: this.isHealthcareRelevant(content, procedureName),
        });
      }
    }

    return routes;
  }

  /**
   * Extract procedure name from tRPC definition
   */
  private extractProcedureName(content: string, startIndex: number): string | null {
    const linesBefore = content.substring(0, startIndex).split('\n');
    const currentLine = linesBefore[linesBefore.length - 1].trim();
    
    const procedureNamePattern = /(\w+)\s*:\s*t\s*\.procedure/;
    const match = currentLine.match(procedureNamePattern);
    
    return match ? match[1] : null;
  }

  /**
   * Estimate response time based on content analysis
   */
  private estimateResponseTime(content: string, method: string, path: string): number {
    let baseTime = 50; // Base response time in ms
    
    // Add time for database operations
    if (content.includes('supabase') || content.includes('prisma') || content.includes('database')) {
      baseTime += 100;
    }
    
    // Add time for complex operations
    if (content.includes('map') || content.includes('reduce') || content.includes('filter')) {
      baseTime += 50;
    }
    
    // Add time for file operations
    if (content.includes('fs.') || content.includes('readFile') || content.includes('writeFile')) {
      baseTime += 200;
    }
    
    // Add time for network operations
    if (content.includes('fetch') || content.includes('axios') || content.includes('http')) {
      baseTime += 150;
    }
    
    // Optimize for edge operations
    if (this.isEdgeOptimized(content, path)) {
      baseTime *= 0.7; // 30% faster on edge
    }
    
    // Healthcare operations may require additional validation
    if (this.isHealthcareRelevant(content, path)) {
      baseTime += 25;
    }
    
    return Math.round(baseTime);
  }

  /**
   * Estimate memory usage for a route
   */
  private estimateMemoryUsage(content: string, path: string): number {
    let baseMemory = 10; // Base memory usage in MB
    
    // Add memory for data processing
    if (content.includes('JSON.parse') || content.includes('JSON.stringify')) {
      baseMemory += 5;
    }
    
    // Add memory for large data structures
    if (content.includes('array') || content.includes('object') || content.includes('map')) {
      baseMemory += 10;
    }
    
    // Add memory for database connections
    if (content.includes('database') || content.includes('connection')) {
      baseMemory += 15;
    }
    
    // Healthcare data processing may require more memory
    if (this.isHealthcareRelevant(content, path)) {
      baseMemory += 8;
    }
    
    return baseMemory;
  }

  /**
   * Check if route is edge-optimized
   */
  private isEdgeOptimized(content: string, path: string): boolean {
    return content.includes('edge') ||
           content.includes('edge') ||
           content.includes('vercel') ||
           content.includes('cloudflare') ||
           content.includes('@edge') ||
           path.includes('/trpc/'); // tRPC procedures are typically edge-optimized
  }

  /**
   * Check if route is healthcare-relevant
   */
  private isHealthcareRelevant(content: string, path: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa', 'cfm',
    ];
    
    const lowerContent = content.toLowerCase();
    const lowerPath = path.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerContent.includes(keyword) || lowerPath.includes(keyword)
    );
  }

  /**
   * Check if content contains patient data patterns
   */
  private containsPatientData(content: string): boolean {
    const patientDataPatterns = [
      'patientData', 'dadosPaciente', 'patient', 'paciente',
      'clinical', 'clinico', 'medical', 'medico',
    ];
    
    const lowerContent = content.toLowerCase();
    return patientDataPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Check if content contains LGPD compliance
   */
  private containsLgpdCompliance(content: string): boolean {
    const lgpdPatterns = [
      'lgpd', 'consent', 'consentimento', 'dados', 'privacidade',
      'anonymization', 'retention', 'portability',
    ];
    
    const lowerContent = content.toLowerCase();
    return lgpdPatterns.some(pattern => lowerContent.includes(pattern));
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(routes: RoutePerformanceData[]): number {
    if (routes.length === 0) return 0;
    
    const totalTime = routes.reduce((sum, route) => sum + route.responseTime, 0);
    return Math.round(totalTime / routes.length);
  }

  /**
   * Estimate cold start occurrences
   */
  private estimateColdStarts(routes: RoutePerformanceData[]): number {
    // Cold starts are more likely for routes with complex initialization
    return routes.filter(route => 
      route.responseTime > 200 || route.memoryUsage > 50
    ).length;
  }

  /**
   * Estimate bundle size
   */
  private async estimateBundleSize(files: string[]): Promise<number> {
    let totalSize = 0;
    
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        totalSize += stats.size;
      } catch (error) {
        console.warn(`Failed to get size for file ${file}:`, error);
      }
    }
    
    // Convert to kilobytes and estimate minified size
    return Math.round((totalSize / 1024) * 0.6);
  }

  /**
   * Detect edge provider from configuration
   */
  private detectEdgeProvider(files: string[]): 'vercel' | 'cloudflare' | 'netlify' {
    // Check for provider-specific configuration files
    const vercelFiles = files.some(file => 
      file.includes('vercel.json') || file.includes('next.config')
    );
    
    const cloudflareFiles = files.some(file => 
      file.includes('wrangler.toml') || file.includes('_worker.js')
    );
    
    const netlifyFiles = files.some(file => 
      file.includes('netlify.toml') || file.includes('netlify')
    );
    
    if (vercelFiles) return 'vercel';
    if (cloudflareFiles) return 'cloudflare';
    if (netlifyFiles) return 'netlify';
    
    return 'vercel'; // Default assumption
  }

  /**
   * Detect edge regions from configuration
   */
  private detectEdgeRegions(files: string[]): string[] {
    const regions: string[] = [];
    
    // Common edge regions for Brazilian healthcare
    const defaultRegions = ['iad1', 'sfo1', 'gru1']; // US East, US West, Brazil
    
    // Try to detect from configuration files
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Look for region configuration
        const regionPattern = /region['"]?\s*[:=]\s*['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = regionPattern.exec(content)) !== null) {
          if (!regions.includes(match[1])) {
            regions.push(match[1]);
          }
        }
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return regions.length > 0 ? regions : defaultRegions;
  }

  /**
   * Detect edge runtime
   */
  private detectEdgeRuntime(files: string[]): 'nodejs' | 'deno' | 'bun' {
    // Check for runtime-specific configurations
    const hasBun = files.some(file => file.includes('bun.lockb') || file.includes('bunfig.toml'));
    const hasDeno = files.some(file => file.includes('deno.json') || file.includes('deno.lock'));
    
    if (hasBun) return 'bun';
    if (hasDeno) return 'deno';
    
    return 'nodejs'; // Default
  }

  /**
   * Check if data encryption is enabled
   */
  private checkDataEncryption(files: string[]): boolean {
    // Look for encryption-related code
    const encryptionPatterns = [
      'encrypt', 'decrypt', 'crypto', 'cipher', 'hash',
      'aes', 'rsa', 'jwt', 'signature',
    ];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        
        if (encryptionPatterns.some(pattern => content.includes(pattern))) {
          return true;
        }
      } catch (error) {
        // Ignore file read errors
      }
    }
    
    return false;
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(routes: RoutePerformanceData[], files: string[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Analyze response times
    const slowRoutes = routes.filter(route => route.responseTime > 200);
    if (slowRoutes.length > 0) {
      recommendations.push({
        category: 'response_time',
        priority: 'high',
        description: `Found ${slowRoutes.length} routes with response times >200ms. Consider optimizing database queries and implementing caching.`,
        impact: 'Improved user experience and reduced server costs',
        healthcareRelevant: slowRoutes.some(route => route.healthcareRelevant),
      });
    }
    
    // Analyze memory usage
    const memoryHeavyRoutes = routes.filter(route => route.memoryUsage > 50);
    if (memoryHeavyRoutes.length > 0) {
      recommendations.push({
        category: 'memory',
        priority: 'medium',
        description: `Found ${memoryHeavyRoutes.length} routes with high memory usage. Consider optimizing data structures and implementing streaming.`,
        impact: 'Reduced memory costs and improved scalability',
        healthcareRelevant: memoryHeavyRoutes.some(route => route.healthcareRelevant),
      });
    }
    
    // Analyze edge optimization
    const nonEdgeRoutes = routes.filter(route => !route.edgeOptimized);
    if (nonEdgeRoutes.length > 0) {
      recommendations.push({
        category: 'edge_optimization',
        priority: 'high',
        description: `Found ${nonEdgeRoutes.length} routes that are not edge-optimized. Consider migrating to edge functions for better performance.`,
        impact: 'Reduced latency and improved global performance',
        healthcareRelevant: nonEdgeRoutes.some(route => route.healthcareRelevant),
      });
    }
    
    // Analyze bundle size
    const bundleSize = routes.reduce((sum, route) => sum + route.memoryUsage, 0);
    if (bundleSize > 1000) {
      recommendations.push({
        category: 'bundle_size',
        priority: 'medium',
        description: 'Large bundle size detected. Consider code splitting and tree shaking to reduce bundle size.',
        impact: 'Faster initial load times and reduced bandwidth usage',
        healthcareRelevant: false,
      });
    }
    
    // Healthcare-specific recommendations
    const healthcareRoutes = routes.filter(route => route.healthcareRelevant);
    if (healthcareRoutes.length > 0) {
      recommendations.push({
        category: 'caching',
        priority: 'critical',
        description: `Found ${healthcareRoutes.length} healthcare-relevant routes. Implement appropriate caching strategies while ensuring patient data privacy.`,
        impact: 'Improved performance while maintaining compliance',
        healthcareRelevant: true,
      });
    }
    
    return recommendations;
  }
}