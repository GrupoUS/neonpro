// Type Propagation Analysis Service - Atomic Subtask 7 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import type {
  TypePropagationAnalysisResult,
  TypePropagationData,
  FrontendTypeData,
  BackendTypeData,
  SharedTypeData,
  TypePropagationRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class TypePropagationAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  async analyze(files: string[]): Promise<TypePropagationAnalysisResult> {
    const types: TypePropagationData[] = [];
    const frontendTypes: FrontendTypeData[] = [];
    const backendTypes: BackendTypeData[] = [];
    const sharedTypes: SharedTypeData[] = [];
    
    let totalTypes = 0;
    let propagatedTypes = 0;
    let clientServerSync = 0;
    let circularDependencies = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Extract type definitions
        const fileTypes = this.extractTypesFromFile(file, content);
        types.push(...fileTypes);
        totalTypes += fileTypes.length;
        
        // Categorize types
        if (this.isFrontendFile(file)) {
          frontendTypes.push(...this.extractFrontendTypes(file, content));
        } else if (this.isBackendFile(file)) {
          backendTypes.push(...this.extractBackendTypes(file, content));
        } else if (this.isSharedFile(file)) {
          sharedTypes.push(...this.extractSharedTypes(file, content));
        }
        
        // Count metrics
        propagatedTypes += fileTypes.filter(t => t.destinations.length > 1).length;
        clientServerSync += this.countClientServerSync(content);
        circularDependencies += this.countCircularDependencies(content);
        
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    const healthcare = {
      patientDataTypes: types.filter(t => t.healthcareData).length,
      clinicalTypes: types.filter(t => t.healthcareData).length,
      complianceTypes: types.filter(t => t.healthcareData).length,
      auditTypes: types.filter(t => t.healthcareData).length,
    };

    const recommendations = this.generateTypePropagationRecommendations(types, files);

    return {
      summary: {
        totalTypes,
        propagatedTypes,
        clientServerSync,
        circularDependencies,
        typeComplexity: this.calculateAverageComplexity(types),
      },
      types,
      propagation: {
        frontendTypes,
        backendTypes,
        sharedTypes,
      },
      healthcare,
      recommendations,
    };
  }

  private extractTypesFromFile(filePath: string, content: string): TypePropagationData[] {
    const types: TypePropagationData[] = [];
    
    // Extract type and interface definitions
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const source = this.determineTypeSource(filePath);
      const destinations = this.findTypeDestinations(typeName, content);
      const healthcareData = this.isTypeHealthcareRelated(typeName, content);
      const complexity = this.calculateTypeComplexity(typeName, content);
      
      types.push({
        typeName,
        source,
        destinations,
        healthcareData,
        complexity,
      });
    }

    return types;
  }

  private determineTypeSource(filePath: string): 'server' | 'client' | 'shared' {
    if (filePath.includes('apps/web') || filePath.includes('src/components')) {
      return 'client';
    } else if (filePath.includes('apps/api') || filePath.includes('server')) {
      return 'server';
    } else {
      return 'shared';
    }
  }

  private findTypeDestinations(typeName: string, content: string): string[] {
    const destinations: string[] = [];
    
    // Look for type usage patterns
    const usagePatterns = [
      `: ${typeName}`,
      `<${typeName}>`,
      `${typeName}[]`,
      `Partial<${typeName}>`,
      `Omit<${typeName}`,
      `Pick<${typeName}`,
    ];
    
    usagePatterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[<>[\]]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches && matches.length > 1) {
        destinations.push('multiple-usages');
      }
    });
    
    return destinations.length > 0 ? destinations : ['single-usage'];
  }

  private isTypeHealthcareRelated(typeName: string, content: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'diagnosis', 'diagnostico', 'prescription', 'receita', 'lgpd', 'anvisa',
    ];
    
    const lowerTypeName = typeName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    return healthcareKeywords.some(keyword => 
      lowerTypeName.includes(keyword) || lowerContent.includes(keyword)
    );
  }

  private calculateTypeComplexity(typeName: string, content: string): number {
    const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
    const typeMatch = content.match(typePattern);
    
    if (!typeMatch) return 1;
    
    let complexity = 1;
    const typeBody = typeMatch[1];
    
    // Count properties
    const properties = typeBody.match(/\w+\s*:/g);
    if (properties) complexity += properties.length;
    
    // Count nested objects
    const nestedObjects = typeBody.match(/{[^}]*}/g);
    if (nestedObjects) complexity += nestedObjects.length * 2;
    
    // Count arrays and unions
    if (typeBody.includes('[]') || typeBody.includes('|')) complexity += 2;
    
    return complexity;
  }

  private isFrontendFile(filePath: string): boolean {
    return filePath.includes('apps/web') || 
           filePath.includes('src/components') ||
           filePath.includes('src/pages');
  }

  private isBackendFile(filePath: string): boolean {
    return filePath.includes('apps/api') || 
           filePath.includes('server') ||
           filePath.includes('api/src');
  }

  private isSharedFile(filePath: string): boolean {
    return filePath.includes('packages') || 
           filePath.includes('shared') ||
           filePath.includes('types');
  }

  private extractFrontendTypes(filePath: string, content: string): FrontendTypeData[] {
    const types: FrontendTypeData[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const usage = this.extractTypeUsage(content, typeName);
      const healthcareRelevant = this.isTypeHealthcareRelated(typeName, content);
      
      types.push({
        typeName,
        usage,
        healthcareRelevant,
      });
    }
    
    return types;
  }

  private extractBackendTypes(filePath: string, content: string): BackendTypeData[] {
    const types: BackendTypeData[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const definition = this.extractTypeDefinition(content, typeName);
      const lastModified = new Date();
      const healthcareRelevant = this.isTypeHealthcareRelated(typeName, content);
      
      types.push({
        typeName,
        definition,
        lastModified,
        healthcareRelevant,
      });
    }
    
    return types;
  }

  private extractSharedTypes(filePath: string, content: string): SharedTypeData[] {
    const types: SharedTypeData[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const frontendUsage = this.extractTypeUsage(content, typeName);
      const backendUsage = this.extractTypeUsage(content, typeName);
      const healthcareRelevant = this.isTypeHealthcareRelated(typeName, content);
      
      types.push({
        typeName,
        frontendUsage,
        backendUsage,
        healthcareRelevant,
      });
    }
    
    return types;
  }

  private extractTypeUsage(content: string, typeName: string): string[] {
    const usage: string[] = [];
    const usagePattern = new RegExp(`\\b${typeName}\\b`, 'g');
    let match;
    
    while ((match = usagePattern.exec(content)) !== null) {
      const context = content.substring(
        Math.max(0, match.index - 50),
        Math.min(content.length, match.index + 50)
      );
      usage.push(context.trim());
    }
    
    return usage.slice(0, 5); // Limit to first 5 usages
  }

  private extractTypeDefinition(content: string, typeName: string): string {
    const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
    const match = content.match(typePattern);
    return match ? match[1].trim() : 'definition not found';
  }

  private countClientServerSync(content: string): number {
    const syncPatterns = [
      'import.*types',
      'export.*types',
      'sharedTypes',
      'commonTypes',
    ];
    
    return syncPatterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private countCircularDependencies(content: string): number {
    const types = this.extractTypeDefinitions(content);
    let circularCount = 0;
    
    for (const typeName of types) {
      const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
      const typeMatch = content.match(typePattern);
      
      if (typeMatch && typeMatch[1].includes(typeName)) {
        circularCount++;
      }
    }
    
    return circularCount;
  }

  private extractTypeDefinitions(content: string): string[] {
    const types: string[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      types.push(match[1]);
    }
    
    return types;
  }

  private calculateAverageComplexity(types: TypePropagationData[]): number {
    if (types.length === 0) return 0;
    const totalComplexity = types.reduce((sum, type) => sum + type.complexity, 0);
    return Math.round(totalComplexity / types.length);
  }

  private generateTypePropagationRecommendations(
    types: TypePropagationData[],
    files: string[]
  ): TypePropagationRecommendation[] {
    const recommendations: TypePropagationRecommendation[] = [];
    
    // Types with low propagation
    const lowPropagationTypes = types.filter(t => t.destinations.length <= 1);
    if (lowPropagationTypes.length > 0) {
      recommendations.push({
        typeName: `${lowPropagationTypes.length} types`,
        recommendation: 'Consider sharing types across frontend and backend for better consistency',
        priority: 'medium',
        healthcareImpact: 'Reduces type mismatches in patient data handling',
      });
    }

    // High complexity types
    const complexTypes = types.filter(t => t.complexity > 10);
    if (complexTypes.length > 0) {
      recommendations.push({
        typeName: `${complexTypes.length} complex types`,
        recommendation: 'Simplify complex types by breaking them into smaller, focused interfaces',
        priority: 'medium',
        healthcareImpact: 'Improves maintainability of clinical data structures',
      });
    }

    // Healthcare types not shared
    const healthcareTypes = types.filter(t => t.healthcareData && t.source !== 'shared');
    if (healthcareTypes.length > 0) {
      recommendations.push({
        typeName: `${healthcareTypes.length} healthcare types`,
        recommendation: 'Move healthcare-related types to shared packages for consistency',
        priority: 'high',
        healthcareImpact: 'Ensures consistent patient data structures across the application',
      });
    }

    return recommendations;
  }
}