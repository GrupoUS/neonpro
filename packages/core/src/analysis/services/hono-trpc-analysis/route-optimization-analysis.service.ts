// Route Optimization Analysis Service - Atomic Subtask 6 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import type {
  RouteOptimizationAnalysisResult,
  RouteOptimizationData,
  RouteOptimizationRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class RouteOptimizationAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  async analyze(files: string[]): Promise<RouteOptimizationAnalysisResult> {
    const routes: RouteOptimizationData[] = [];
    
    let totalRoutes = 0;
    let optimizedRoutes = 0;
    let cacheableRoutes = 0;
    let staticRoutes = 0;
    let dynamicRoutes = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileRoutes = this.extractRoutesFromFile(file, content);
        
        routes.push(...fileRoutes);
        totalRoutes += fileRoutes.length;
        optimizedRoutes += fileRoutes.filter(r => r.optimized).length;
        cacheableRoutes += fileRoutes.filter(r => r.cachingEnabled).length;
        staticRoutes += fileRoutes.filter(r => this.isStaticRoute(r.path)).length;
        dynamicRoutes += fileRoutes.filter(r => !this.isStaticRoute(r.path)).length;
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    const performance = {
      averageResponseTime: this.calculateAverageResponseTime(routes),
      cacheHitRate: this.estimateCacheHitRate(cacheableRoutes, totalRoutes),
      compressionRatio: this.estimateCompressionRatio(files),
      bundleSizeOptimized: this.checkBundleSizeOptimization(files),
    };

    const healthcare = {
      patientDataRoutesOptimized: routes.filter(r => r.healthcareRelevant && r.optimized).length,
      clinicalRoutesOptimized: routes.filter(r => r.healthcareRelevant && r.optimized).length,
      emergencyRoutesPrioritized: this.checkEmergencyRoutePrioritization(files),
      complianceRoutesCached: routes.filter(r => r.healthcareRelevant && r.cachingEnabled).length,
    };

    const recommendations = this.generateRouteOptimizationRecommendations(routes, files);

    return {
      summary: {
        totalRoutes,
        optimizedRoutes,
        cacheableRoutes,
        staticRoutes,
        dynamicRoutes,
      },
      routes,
      performance,
      healthcare,
      recommendations,
    };
  }

  private extractRoutesFromFile(filePath: string, content: string): RouteOptimizationData[] {
    const routes: RouteOptimizationData[] = [];
    
    // Hono routes
    const honoPattern = /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = honoPattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const routePath = match[2];
      
      routes.push({
        path: routePath,
        method,
        optimized: this.isRouteOptimized(content, routePath),
        cachingEnabled: this.hasCachingEnabled(content, routePath),
        compressionEnabled: this.hasCompressionEnabled(content),
        healthcareRelevant: this.isHealthcareRelevant(content, routePath),
      });
    }

    // tRPC procedures
    const trpcPattern = /(\w+)\s*:\s*t\.procedure\s*\.\s*(query|mutation)/g;
    
    while ((match = trpcPattern.exec(content)) !== null) {
      const procedureName = match[1];
      const procedureType = match[2];
      
      routes.push({
        path: `/trpc/${procedureName}`,
        method: procedureType === 'query' ? 'GET' : 'POST',
        optimized: this.isRouteOptimized(content, procedureName),
        cachingEnabled: this.hasCachingEnabled(content, procedureName),
        compressionEnabled: this.hasCompressionEnabled(content),
        healthcareRelevant: this.isHealthcareRelevant(content, procedureName),
      });
    }

    return routes;
  }

  private isStaticRoute(path: string): boolean {
    return !path.includes(':') && !path.includes('*') && !path.includes('{');
  }

  private isRouteOptimized(content: string, routePath: string): boolean {
    return content.includes('edge') || 
           content.includes('cache') || 
           content.includes('optimize') ||
           content.includes('compress');
  }

  private hasCachingEnabled(content: string, routePath: string): boolean {
    return content.includes('cache') || 
           content.includes('Cache-Control') ||
           content.includes('ETag');
  }

  private hasCompressionEnabled(content: string): boolean {
    return content.includes('compress') || 
           content.includes('gzip') ||
           content.includes('br') ||
           content.includes('compression');
  }

  private isHealthcareRelevant(content: string, routePath: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa',
    ];
    
    const lowerContent = content.toLowerCase();
    const lowerPath = routePath.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerContent.includes(keyword) || lowerPath.includes(keyword)
    );
  }

  private calculateAverageResponseTime(routes: RouteOptimizationData[]): number {
    if (routes.length === 0) return 0;
    
    const totalTime = routes.reduce((sum, route) => {
      let time = 100; // Base time
      
      if (route.optimized) time *= 0.7;
      if (route.cachingEnabled) time *= 0.5;
      if (route.compressionEnabled) time *= 0.9;
      if (route.healthcareRelevant) time += 25;
      
      return sum + time;
    }, 0);
    
    return Math.round(totalTime / routes.length);
  }

  private estimateCacheHitRate(cacheableRoutes: number, totalRoutes: number): number {
    if (totalRoutes === 0) return 0;
    return Math.round((cacheableRoutes / totalRoutes) * 100);
  }

  private estimateCompressionRatio(files: string[]): number {
    // Simple estimation - in real implementation would analyze bundle
    return 70; // 70% compression ratio typical
  }

  private checkBundleSizeOptimization(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('treeshaking') || 
               content.includes('bundle') ||
               content.includes('optimize');
      } catch (error) {
        return false;
      }
    });
  }

  private checkEmergencyRoutePrioritization(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return content.includes('emergency') && 
               (content.includes('priority') || content.includes('urgent'));
      } catch (error) {
        return false;
      }
    });
  }

  private generateRouteOptimizationRecommendations(
    routes: RouteOptimizationData[],
    files: string[]
  ): RouteOptimizationRecommendation[] {
    const recommendations: RouteOptimizationRecommendation[] = [];
    
    const nonOptimizedRoutes = routes.filter(r => !r.optimized);
    if (nonOptimizedRoutes.length > 0) {
      recommendations.push({
        route: `${nonOptimizedRoutes.length} routes`,
        recommendation: 'Enable edge optimization and caching for better performance',
        priority: 'high',
        healthcareImpact: 'Faster access to critical patient and clinical data',
      });
    }

    const nonCachedRoutes = routes.filter(r => !r.cachingEnabled && this.isStaticRoute(r.path));
    if (nonCachedRoutes.length > 0) {
      recommendations.push({
        route: `${nonCachedRoutes.length} static routes`,
        recommendation: 'Implement caching for static routes to reduce server load',
        priority: 'medium',
        healthcareImpact: 'Improved performance for frequently accessed healthcare data',
      });
    }

    const healthcareRoutes = routes.filter(r => r.healthcareRelevant);
    const nonOptimizedHealthcareRoutes = healthcareRoutes.filter(r => !r.optimized);
    if (nonOptimizedHealthcareRoutes.length > 0) {
      recommendations.push({
        route: `${nonOptimizedHealthcareRoutes.length} healthcare routes`,
        recommendation: 'Prioritize optimization of healthcare-relevant routes for clinical efficiency',
        priority: 'critical',
        healthcareImpact: 'Direct impact on patient care and clinical workflows',
      });
    }

    return recommendations;
  }
}