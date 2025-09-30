// Edge Deployment Pattern Analysis Service - Atomic Subtask 10 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import type {
  EdgeDeploymentPatternAnalysisResult,
  EdgeDeploymentData,
  ServerlessFunctionData,
  EdgeComputeData,
  CDNIntegrationData,
  EdgeDeploymentRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class EdgeDeploymentPatternAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  async analyze(files: string[]): Promise<EdgeDeploymentPatternAnalysisResult> {
    const deployments: EdgeDeploymentData[] = [];
    const serverlessFunctions: ServerlessFunctionData[] = [];
    const edgeCompute: EdgeComputeData[] = [];
    const cdnIntegration: CDNIntegrationData[] = [];
    
    let totalDeployments = 0;
    let edgeDeployments = 0;
    let hybridDeployments = 0;
    let traditionalDeployments = 0;

    // Analyze deployment configurations
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Extract deployment data
        const fileDeployments = this.extractDeploymentsFromFile(file, content);
        deployments.push(...fileDeployments);
        totalDeployments += fileDeployments.length;
        
        // Categorize deployments
        edgeDeployments += fileDeployments.filter(d => d.type === 'edge').length;
        hybridDeployments += fileDeployments.filter(d => d.type === 'hybrid').length;
        traditionalDeployments += fileDeployments.filter(d => d.type === 'traditional').length;
        
        // Extract specific patterns
        serverlessFunctions.push(...this.extractServerlessFunctions(file, content));
        edgeCompute.push(...this.extractEdgeCompute(file, content));
        cdnIntegration.push(...this.extractCDNIntegration(file, content));
        
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    const healthcare = {
      patientDataEdgeProcessing: this.hasPatientDataEdgeProcessing(files),
      clinicalLogicEdgeProcessing: this.hasClinicalLogicEdgeProcessing(files),
      complianceEdgeValidation: this.hasComplianceEdgeValidation(files),
      emergencyResponseEdgeOptimization: this.hasEmergencyResponseEdgeOptimization(files),
    };

    const recommendations = this.generateEdgeDeploymentRecommendations(deployments, healthcare);

    return {
      summary: {
        totalDeployments,
        edgeDeployments,
        hybridDeployments,
        traditionalDeployments,
      },
      deployments,
      patterns: {
        serverlessFunctions,
        edgeCompute,
        cdnIntegration,
      },
      healthcare,
      recommendations,
    };
  }

  private extractDeploymentsFromFile(filePath: string, content: string): EdgeDeploymentData[] {
    const deployments: EdgeDeploymentData[] = [];
    
    // Check for deployment configuration files
    const isVercel = filePath.includes('vercel.json');
    const isNetlify = filePath.includes('netlify.toml');
    const isCloudflare = filePath.includes('wrangler.toml');
    
    if (isVercel || isNetlify || isCloudflare) {
      const deploymentName = this.extractDeploymentName(filePath, content);
      const type = this.determineDeploymentType(content);
      const provider = this.determineProvider(filePath);
      const region = this.extractRegion(content);
      const healthcareRelevant = this.isHealthcareRelevant(content);
      
      deployments.push({
        deploymentName,
        type,
        provider,
        region,
        healthcareRelevant,
      });
    }
    
    return deployments;
  }

  private extractDeploymentName(filePath: string, content: string): string {
    const fileName = filePath.split('/').pop() || 'unknown';
    return fileName.replace(/\.(json|toml|yaml|yml)$/, '');
  }

  private determineDeploymentType(content: string): EdgeDeploymentData['type'] {
    if (content.includes('edge') || content.includes('serverless')) {
      return 'edge';
    } else if (content.includes('hybrid') || content.includes('mixed')) {
      return 'hybrid';
    } else {
      return 'traditional';
    }
  }

  private determineProvider(filePath: string): EdgeDeploymentData['provider'] {
    if (filePath.includes('vercel')) return 'vercel';
    if (filePath.includes('netlify')) return 'netlify';
    if (filePath.includes('cloudflare')) return 'cloudflare';
    return 'other';
  }

  private extractRegion(content: string): string {
    const regionPatterns = [
      /region['"\\s]*[:=]\\s*['"`]([^'"`]+)['"`]/,
      /deploymentRegion['"\\s]*[:=]\\s*['"`]([^'"`]+)['"`]/,
    ];
    
    for (const pattern of regionPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return 'us-east-1'; // Default region
  }

  private isHealthcareRelevant(content: string): boolean {
    const healthcareKeywords = [
      'patient', 'paciente', 'clinical', 'clinico', 'medical', 'medico',
      'health', 'saude', 'treatment', 'tratamento', 'appointment', 'consulta',
      'lgpd', 'anvisa',
    ];
    
    const lowerContent = content.toLowerCase();
    return healthcareKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private extractServerlessFunctions(filePath: string, content: string): ServerlessFunctionData[] {
    const functions: ServerlessFunctionData[] = [];
    
    // Look for serverless function definitions
    const functionPatterns = [
      /functions['"\\s]*[:=]\\s*{([^}]*)}/,
      /serverlessFunctions['"\\s]*[:=]\\s*{([^}]*)}/,
    ];
    
    for (const pattern of functionPatterns) {
      const match = content.match(pattern);
      if (match) {
        const functionConfig = match[1];
        
        // Extract function names
        const functionNames = functionConfig.match(/['"`]([^'"`]+)['"`]/g) || [];
        
        functionNames.forEach(name => {
          functions.push({
            functionName: name.replace(/['"`]/g, ''),
            runtime: this.extractRuntime(functionConfig),
            memory: this.extractMemory(functionConfig),
            timeout: this.extractTimeout(functionConfig),
            healthcareRelevant: this.isHealthcareRelevant(content),
          });
        });
      }
    }
    
    return functions;
  }

  private extractRuntime(config: string): string {
    const runtimeMatch = config.match(/runtime['"\\s]*[:=]\\s*['"`]([^'"`]+)['"`]/);
    return runtimeMatch ? runtimeMatch[1] : 'nodejs18.x';
  }

  private extractMemory(config: string): number {
    const memoryMatch = config.match(/memory['"\\s]*[:=]\\s*(\d+)/);
    return memoryMatch ? parseInt(memoryMatch[1]) : 256;
  }

  private extractTimeout(config: string): number {
    const timeoutMatch = config.match(/timeout['"\\s]*[:=]\\s*(\d+)/);
    return timeoutMatch ? parseInt(timeoutMatch[1]) : 30;
  }

  private extractEdgeCompute(filePath: string, content: string): EdgeComputeData[] {
    const edgeFunctions: EdgeComputeData[] = [];
    
    // Look for edge function configurations
    const edgePatterns = [
      /edgeFunctions['"\\s]*[:=]\\s*{([^}]*)}/,
      /@edge[\\s]*{([^}]*)}/,
    ];
    
    for (const pattern of edgePatterns) {
      const match = content.match(pattern);
      if (match) {
        const edgeConfig = match[1];
        
        // Extract edge function names
        const functionNames = edgeConfig.match(/['"`]([^'"`]+)['"`]/g) || [];
        
        functionNames.forEach(name => {
          edgeFunctions.push({
            functionName: name.replace(/['"`]/g, ''),
            edgeRegion: this.extractRegion(edgeConfig),
            computeType: this.extractComputeType(edgeConfig),
            healthcareRelevant: this.isHealthcareRelevant(content),
          });
        });
      }
    }
    
    return edgeFunctions;
  }

  private extractComputeType(config: string): string {
    if (config.includes('compute')) return 'compute';
    if (config.includes('lambda')) return 'lambda';
    if (config.includes('function')) return 'function';
    return 'standard';
  }

  private extractCDNIntegration(filePath: string, content: string): CDNIntegrationData[] {
    const cdnConfigs: CDNIntegrationData[] = [];
    
    // Look for CDN configurations
    const cdnPatterns = [
      /cdn['"\\s]*[:=]\\s*{([^}]*)}/,
      /staticAssets['"\\s]*[:=]\\s*{([^}]*)}/,
    ];
    
    for (const pattern of cdnPatterns) {
      const match = content.match(pattern);
      if (match) {
        const cdnConfig = match[1];
        
        // Extract resource types
        const resourceTypes = cdnConfig.match(/['"`]([^'"`]+)['"`]/g) || [];
        
        resourceTypes.forEach(type => {
          cdnConfigs.push({
            resourceType: type.replace(/['"`]/g, ''),
            cdnProvider: this.determineProvider(filePath),
            cachingStrategy: this.extractCachingStrategy(cdnConfig),
            healthcareRelevant: this.isHealthcareRelevant(content),
          });
        });
      }
    }
    
    return cdnConfigs;
  }

  private extractCachingStrategy(config: string): string {
    if (config.includes('cache')) return 'cache';
    if (config.includes('static')) return 'static';
    if (config.includes('dynamic')) return 'dynamic';
    return 'default';
  }

  private hasPatientDataEdgeProcessing(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return (content.includes('patient') || content.includes('paciente')) &&
               (content.includes('edge') || content.includes('serverless'));
      } catch (error) {
        return false;
      }
    });
  }

  private hasClinicalLogicEdgeProcessing(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return (content.includes('clinical') || content.includes('clinico')) &&
               (content.includes('edge') || content.includes('serverless'));
      } catch (error) {
        return false;
      }
    });
  }

  private hasComplianceEdgeValidation(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return (content.includes('compliance') || content.includes('lgpd')) &&
               (content.includes('edge') || content.includes('validation'));
      } catch (error) {
        return false;
      }
    });
  }

  private hasEmergencyResponseEdgeOptimization(files: string[]): boolean {
    return files.some(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        return (content.includes('emergency') || content.includes('urgent')) &&
               (content.includes('edge') || content.includes('optimization'));
      } catch (error) {
        return false;
      }
    });
  }

  private generateEdgeDeploymentRecommendations(
    deployments: EdgeDeploymentData[],
    healthcare: EdgeDeploymentPatternAnalysisResult['healthcare']
  ): EdgeDeploymentRecommendation[] {
    const recommendations: EdgeDeploymentRecommendation[] = [];
    
    // Traditional deployments
    const traditionalDeployments = deployments.filter(d => d.type === 'traditional');
    if (traditionalDeployments.length > 0) {
      recommendations.push({
        deployment: `${traditionalDeployments.length} traditional deployments`,
        recommendation: 'Migrate traditional deployments to edge/serverless for better performance and scalability',
        priority: 'high',
        healthcareRequirement: false,
      });
    }

    // Healthcare edge processing
    if (!healthcare.patientDataEdgeProcessing) {
      recommendations.push({
        deployment: 'Patient data processing',
        recommendation: 'Implement edge processing for patient data operations to improve response times and reduce latency',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }

    if (!healthcare.clinicalLogicEdgeProcessing) {
      recommendations.push({
        deployment: 'Clinical logic processing',
        recommendation: 'Move clinical validation and business logic to edge functions for faster clinical workflows',
        priority: 'high',
        healthcareRequirement: true,
      });
    }

    // Compliance edge validation
    if (!healthcare.complianceEdgeValidation) {
      recommendations.push({
        deployment: 'Compliance validation',
        recommendation: 'Implement edge-based compliance validation for LGPD and healthcare regulations',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }

    // Emergency response optimization
    if (!healthcare.emergencyResponseEdgeOptimization) {
      recommendations.push({
        deployment: 'Emergency response systems',
        recommendation: 'Optimize emergency response systems with edge processing for faster critical care response',
        priority: 'high',
        healthcareRequirement: true,
      });
    }

    // Edge deployment recommendations
    const edgeDeployments = deployments.filter(d => d.type === 'edge');
    if (edgeDeployments.length > 0) {
      const brazilianRegions = edgeDeployments.filter(d => 
        d.region.includes('brazil') || d.region.includes('sao') || d.region.includes('gru')
      );
      
      if (brazilianRegions.length === 0) {
        recommendations.push({
          deployment: 'Edge deployment regions',
          recommendation: 'Add Brazilian edge regions (e.g., gru1) to improve performance for Brazilian healthcare providers',
          priority: 'medium',
          healthcareRequirement: true,
        });
      }
    }

    return recommendations;
  }
}