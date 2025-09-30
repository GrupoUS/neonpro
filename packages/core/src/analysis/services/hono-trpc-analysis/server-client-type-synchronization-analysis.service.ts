// Server-Client Type Synchronization Analysis Service - Atomic Subtask 8 of 10
// Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

import * as fs from 'fs/promises';
import type {
  ServerClientTypeSynchronizationAnalysisResult,
  ServerTypeData,
  ClientTypeData,
  SyncStatusData,
  TypeSyncIssue,
  TypeSyncRecommendation,
} from './types/hono-trpc-analysis.types.js';
import type { HonoTrpcAnalysisConfig } from './hono-trpc-analysis.service.js';

export class ServerClientTypeSynchronizationAnalysisService {
  private config: HonoTrpcAnalysisConfig;

  constructor(config: HonoTrpcAnalysisConfig) {
    this.config = config;
  }

  async analyze(files: string[]): Promise<ServerClientTypeSynchronizationAnalysisResult> {
    const serverTypes: ServerTypeData[] = [];
    const clientTypes: ClientTypeData[] = [];
    const syncStatus: SyncStatusData[] = [];
    const issues: TypeSyncIssue[] = [];
    
    let totalTypes = 0;
    let synchronizedTypes = 0;
    let mismatchedTypes = 0;
    let outdatedTypes = 0;

    // Separate server and client files
    const serverFiles = files.filter(f => this.isServerFile(f));
    const clientFiles = files.filter(f => this.isClientFile(f));

    // Extract server types
    for (const file of serverFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileTypes = this.extractServerTypes(file, content);
        serverTypes.push(...fileTypes);
        totalTypes += fileTypes.length;
      } catch (error) {
        console.warn(`Failed to analyze server file ${file}:`, error);
      }
    }

    // Extract client types
    for (const file of clientFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileTypes = this.extractClientTypes(file, content);
        clientTypes.push(...fileTypes);
      } catch (error) {
        console.warn(`Failed to analyze client file ${file}:`, error);
      }
    }

    // Analyze synchronization status
    for (const serverType of serverTypes) {
      const clientType = clientTypes.find(t => t.typeName === serverType.typeName);
      
      if (clientType) {
        const status = this.compareTypes(serverType, clientType);
        syncStatus.push(status);
        
        synchronizedTypes++;
        
        if (status.status === 'mismatched') mismatchedTypes++;
        if (status.status === 'outdated') outdatedTypes++;
      } else {
        syncStatus.push({
          typeName: serverType.typeName,
          status: 'missing',
          discrepancy: 'Client type not found',
          healthcareRelevant: serverType.healthcareRelevant,
        });
      }
    }

    // Check for client-only types
    for (const clientType of clientTypes) {
      const serverType = serverTypes.find(t => t.typeName === clientType.typeName);
      if (!serverType) {
        syncStatus.push({
          typeName: clientType.typeName,
          status: 'missing',
          discrepancy: 'Server type not found',
          healthcareRelevant: clientType.healthcareRelevant,
        });
      }
    }

    // Detect issues
    const typeIssues = this.detectTypeSynchronizationIssues(serverTypes, clientTypes, syncStatus);
    issues.push(...typeIssues);

    const healthcare = {
      patientDataSync: syncStatus.filter(s => 
        s.healthcareRelevant && s.status === 'synchronized'
      ).length,
      clinicalDataSync: syncStatus.filter(s => 
        s.healthcareRelevant && s.status === 'synchronized'
      ).length,
      complianceDataSync: syncStatus.filter(s => 
        s.healthcareRelevant && s.status === 'synchronized'
      ).length,
      auditDataSync: syncStatus.filter(s => 
        s.healthcareRelevant && s.status === 'synchronized'
      ).length,
    };

    const recommendations = this.generateTypeSyncRecommendations(issues, syncStatus);

    return {
      summary: {
        totalTypes,
        synchronizedTypes,
        mismatchedTypes,
        outdatedTypes,
      },
      synchronization: {
        serverTypes,
        clientTypes,
        syncStatus,
      },
      healthcare,
      issues,
      recommendations,
    };
  }

  private isServerFile(filePath: string): boolean {
    return filePath.includes('apps/api') || 
           filePath.includes('server') ||
           filePath.includes('backend') ||
           filePath.includes('packages/core');
  }

  private isClientFile(filePath: string): boolean {
    return filePath.includes('apps/web') || 
           filePath.includes('src/components') ||
           filePath.includes('frontend') ||
           filePath.includes('client');
  }

  private extractServerTypes(filePath: string, content: string): ServerTypeData[] {
    const types: ServerTypeData[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const definition = this.extractTypeDefinition(content, typeName);
      const lastModified = this.getFileModificationTime(filePath);
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

  private extractClientTypes(filePath: string, content: string): ClientTypeData[] {
    const types: ClientTypeData[] = [];
    const typePattern = /(?:type|interface)\s+(\w+)/g;
    let match;
    
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const definition = this.extractTypeDefinition(content, typeName);
      const lastModified = this.getFileModificationTime(filePath);
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

  private extractTypeDefinition(content: string, typeName: string): string {
    const typePattern = new RegExp(`(?:type|interface)\\s+${typeName}\\s*{([^}]*)}`, 's');
    const match = content.match(typePattern);
    return match ? match[1].trim() : 'definition not found';
  }

  private getFileModificationTime(filePath: string): Date {
    try {
      const stats = fs.statSync(filePath);
      return stats.mtime;
    } catch (error) {
      return new Date();
    }
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

  private compareTypes(serverType: ServerTypeData, clientType: ClientTypeData): SyncStatusData {
    const serverDefinition = serverType.definition.replace(/\s+/g, ' ').trim();
    const clientDefinition = clientType.definition.replace(/\s+/g, ' ').trim();
    
    if (serverDefinition === clientDefinition) {
      return {
        typeName: serverType.typeName,
        status: 'synchronized',
        discrepancy: '',
        healthcareRelevant: serverType.healthcareRelevant,
      };
    } else if (serverType.lastModified > clientType.lastModified) {
      return {
        typeName: serverType.typeName,
        status: 'outdated',
        discrepancy: 'Client type is older than server type',
        healthcareRelevant: serverType.healthcareRelevant,
      };
    } else {
      return {
        typeName: serverType.typeName,
        status: 'mismatched',
        discrepancy: 'Type definitions differ between server and client',
        healthcareRelevant: serverType.healthcareRelevant,
      };
    }
  }

  private detectTypeSynchronizationIssues(
    serverTypes: ServerTypeData[],
    clientTypes: ClientTypeData[],
    syncStatus: SyncStatusData[]
  ): TypeSyncIssue[] {
    const issues: TypeSyncIssue[] = [];
    
    // Missing client types
    const missingClientTypes = syncStatus.filter(s => 
      s.status === 'missing' && s.discrepancy === 'Client type not found'
    );
    
    issues.push(...missingClientTypes.map(status => ({
      typeName: status.typeName,
      issueType: 'missing' as const,
      severity: 'high' as const,
      description: `Type ${status.typeName} exists on server but not on client`,
      healthcareImpact: status.healthcareRelevant ? 
        'Patient data types may be inconsistent across frontend and backend' : 
        'Type inconsistency may cause runtime errors',
    })));

    // Missing server types
    const missingServerTypes = syncStatus.filter(s => 
      s.status === 'missing' && s.discrepancy === 'Server type not found'
    );
    
    issues.push(...missingServerTypes.map(status => ({
      typeName: status.typeName,
      issueType: 'missing' as const,
      severity: 'medium' as const,
      description: `Type ${status.typeName} exists on client but not on server`,
      healthcareImpact: status.healthcareRelevant ? 
        'Orphaned client types may indicate incomplete API integration' : 
        'Client-only types should be documented',
    })));

    // Mismatched types
    const mismatchedTypes = syncStatus.filter(s => s.status === 'mismatched');
    
    issues.push(...mismatchedTypes.map(status => ({
      typeName: status.typeName,
      issueType: 'mismatch' as const,
      severity: 'high' as const,
      description: `Type ${status.typeName} differs between server and client: ${status.discrepancy}`,
      healthcareImpact: status.healthcareRelevant ? 
        'Critical: Patient data structure inconsistencies can cause data corruption' : 
        'Type mismatches can cause runtime errors and data loss',
    })));

    // Outdated types
    const outdatedTypes = syncStatus.filter(s => s.status === 'outdated');
    
    issues.push(...outdatedTypes.map(status => ({
      typeName: status.typeName,
      issueType: 'outdated' as const,
      severity: 'medium' as const,
      description: `Type ${status.typeName} is outdated on client: ${status.discrepancy}`,
      healthcareImpact: status.healthcareRelevant ? 
        'Outdated patient data types may cause data validation failures' : 
        'Outdated types may cause feature inconsistencies',
    })));

    return issues;
  }

  private generateTypeSyncRecommendations(
    issues: TypeSyncIssue[],
    syncStatus: SyncStatusData[]
  ): TypeSyncRecommendation[] {
    const recommendations: TypeSyncRecommendation[] = [];
    
    // Missing types
    const missingTypes = issues.filter(i => i.issueType === 'missing');
    if (missingTypes.length > 0) {
      recommendations.push({
        typeName: `${missingTypes.length} missing types`,
        recommendation: 'Generate client types from server schema using tRPC type inference',
        priority: 'critical',
        healthcareRequirement: missingTypes.some(i => i.healthcareImpact.includes('Patient')),
      });
    }

    // Mismatched types
    const mismatchedTypes = issues.filter(i => i.issueType === 'mismatch');
    if (mismatchedTypes.length > 0) {
      recommendations.push({
        typeName: `${mismatchedTypes.length} mismatched types`,
        recommendation: 'Align type definitions between server and client to prevent runtime errors',
        priority: 'critical',
        healthcareRequirement: mismatchedTypes.some(i => i.healthcareImpact.includes('Patient')),
      });
    }

    // Outdated types
    const outdatedTypes = issues.filter(i => i.issueType === 'outdated');
    if (outdatedTypes.length > 0) {
      recommendations.push({
        typeName: `${outdatedTypes.length} outdated types`,
        recommendation: 'Update client types to match latest server definitions',
        priority: 'high',
        healthcareRequirement: outdatedTypes.some(i => i.healthcareImpact.includes('patient')),
      });
    }

    // Healthcare-specific recommendation
    const healthcareIssues = issues.filter(i => i.healthcareImpact.includes('Patient'));
    if (healthcareIssues.length > 0) {
      recommendations.push({
        typeName: `${healthcareIssues.length} healthcare types`,
        recommendation: 'Implement automated type synchronization for all patient data types to ensure LGPD compliance',
        priority: 'critical',
        healthcareRequirement: true,
      });
    }

    return recommendations;
  }
}